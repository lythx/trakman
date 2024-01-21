import { Client } from './client/Client.js'
import { Events } from './Events.js'
import { PlayerService } from './services/PlayerService.js'
import { RecordService } from './services/RecordService.js'
import { ChatService } from './services/ChatService.js'
import { GameService } from './services/GameService.js'
import { MapService } from './services/MapService.js'
import { ServerConfig } from './ServerConfig.js'
import { VoteService } from './services/VoteService.js'
import { Logger } from './Logger.js'
import { AdministrationService } from './services/AdministrationService.js'
import config from '../config/Config.js'
import { Utils } from './Utils.js'
import { RoundsService } from './services/RoundsService.js'

let isRestart: boolean = false

export class Listeners {
  private static readonly listeners: tm.Listener[] = [
    {
      event: 'TrackMania.PlayerConnect',
      callback: async ([login, isSpectator]: tm.Events['TrackMania.PlayerConnect']): Promise<void> => {
        // [0] = Login, [1] = IsSpectator
        if (login === undefined) {
          // Me on my way to kick that pesky undefined
          Client.callNoRes('Kick', [{ string: login }])
          return
        }
        const playerInfo: any | Error = await Client.call('GetDetailedPlayerInfo', [{ string: login }])
        if (playerInfo instanceof Error) {
          Logger.error(`Failed to get player info for login ${login}`, playerInfo.message)
          Client.callNoRes('Kick', [{ string: login }])
          return
        }
        const ip: string = playerInfo.IPAddress.split(':')[0]
        const canJoin: boolean = await AdministrationService.handleJoin(login, ip)
        if (!canJoin) {
          Logger.info(`Banned player ${playerInfo.Login} (${Utils.strip(playerInfo.NickName)}) attempted to join.`)
          return
        }
        const player: tm.Player = await PlayerService.join(playerInfo.Login, playerInfo.NickName,
          playerInfo.Path, isSpectator, playerInfo.PlayerId, ip, playerInfo.OnlineRights === 3,
          playerInfo?.LadderStats.PlayerRankings[0]?.Score, playerInfo?.LadderStats.PlayerRankings[0]?.Ranking)
        AdministrationService.updateNickname({ login, nickname: player.nickname })
        RecordService.updateInfo({ login, nickname: player.nickname, region: player.region, title: player.title })
        RoundsService.registerPlayer(player)
        Events.emit('PlayerDataUpdated', [{
          login, nickname: player.nickname, country: {
            name: player.country,
            code: player.countryCode,
            region: player.region
          }, title: player.title
        }])
        Events.emit('PlayerJoin', player)
        // Update rank for the arriving player, this can take time hence no await
        void RecordService.fetchAndStoreRanks(playerInfo.Login)
      }
    },
    {
      event: 'TrackMania.PlayerDisconnect',
      callback: (login: tm.Events['TrackMania.PlayerDisconnect']): void => {
        // [0] = Login
        if (AdministrationService.banlist.some(a => a.login === login)) {
          return
        }
        const leaveInfo: tm.LeaveInfo | Error = PlayerService.leave(login)
        if (!(leaveInfo instanceof Error)) {
          Events.emit('PlayerLeave', leaveInfo)
        }
      }
    },
    {
      event: 'TrackMania.PlayerChat',
      callback: async ([playerId, login, text]: tm.Events['TrackMania.PlayerChat']): Promise<void> => {
        // [0] = PlayerUid, [1] = Login, [2] = Text, [3] = IsRegisteredCommand
        // Ignore server messages (PID 0 = Server)
        if (playerId === 0) {
          return
        }
        const messageInfo: tm.MessageInfo | Error = await ChatService.add(login, text)
        if (!(messageInfo instanceof Error)) {
          Events.emit('PlayerChat', messageInfo)
        }
      }
    },
    {
      event: 'TrackMania.PlayerCheckpoint',
      callback: async ([playerId, login, timeOrScore, currentLap, checkpointIndex]:
        tm.Events['TrackMania.PlayerCheckpoint']): Promise<void> => {
        // [0] = PlayerUid, [1] = Login, [2] = TimeOrScore, [3] = CurLap, [4] = CheckpointIndex
        // Ignore inexistent people // Please elaborate // PID 0 = Server // HOW CAN SERVER GET A CHECKPOINT
        if (playerId === 0) { return }
        const player: tm.Player | undefined = PlayerService.get(login)
        if (player === undefined) {
          Logger.error(`Can't find player ${login} in memory on checkpoint event`)
          return
        }
        const cpsPerLap = MapService.current.checkpointsPerLap
        let div = player.currentCheckpoints.length / cpsPerLap
        const startIndex = cpsPerLap * Math.floor(div)
        const lapCheckpointIndex = checkpointIndex - startIndex
        const lapCheckpointTime = timeOrScore - (player.currentCheckpoints[startIndex - 1]?.time ?? 0)
        const isLapFinish = (lapCheckpointIndex + 1) % MapService.current.checkpointsPerLap === 0
        const checkpoint: tm.Checkpoint = {
          index: checkpointIndex, time: timeOrScore, lap: currentLap,
          lapCheckpointIndex, lapCheckpointTime,
          isLapFinish
        }
        const cpStatus = PlayerService.addCP(player, checkpoint)
        const info: tm.CheckpointInfo = {
          time: timeOrScore,
          lap: currentLap,
          index: checkpointIndex,
          player, lapCheckpointIndex, lapCheckpointTime, isLapFinish
        }
        if ((cpStatus as any).isFinish !== undefined) {
          const lapObj = await RecordService.addLap(MapService.current.id, player, (cpStatus as any).lapTime,
            (cpStatus as any).lapCheckpoints, (cpStatus as any).isFinish)
          if (lapObj !== false) {
            Events.emit(`PlayerLap`, lapObj.lapInfo)
            if (lapObj.lapRecord !== undefined) {
              Events.emit(`LapRecord`, lapObj.lapRecord)
            }
          }
        }
        // Last CP = Finish
        if (cpStatus === true || (cpStatus as any).isFinish === true) {
          const obj = await RecordService.add(MapService.current.id, player, checkpoint.time)
          if (obj !== false) {
            if (obj.localRecord !== undefined) {
              // Register player local record
              Events.emit('LocalRecord', obj.localRecord)
            }
            if (obj.liveRecord !== undefined) {
              // Register player live record
              Events.emit('LiveRecord', obj.liveRecord)
            }
            // Register player finish
            Events.emit('PlayerFinish', obj.finishInfo)
            PlayerService.resetCheckpoints(player.login)
          }
          return
          // Real CP
        } else if (cpStatus === false || (cpStatus as any).isFinish === false) {
          // Register player checkpoint
          Events.emit('PlayerCheckpoint', info)
        }
      }
    },
    {
      event: 'TrackMania.PlayerFinish',
      callback: async ([id, login, time]: tm.Events['TrackMania.PlayerFinish']): Promise<void> => {
        // [0] = PlayerUid, [1] = Login, [2] = TimeOrScore
        // if (params[0] === 0) { // IGNORE THIS IS A FAKE FINISH
        //   return
        // }
        // if (params[2] === 0) { // IGNORE THIS IS JUST A FUNNY BACKSPACE PRESS
        //   // reset cps
        //   // PlayerService.getPlayer(params[1]).checkpoints.length = 0
        //   return
        // }
        // const status: any[] | Error = await Client.call('GetStatus') // seems kinda useless innit
        // if (status instanceof Error) {
        //   Logger.error('Failed to get game status', status.message)
        //   return
        // }
        // if (status[0].Code !== 4) { // CHECK FOR GAME STATUS TO BE RUNNING - PLAY (code 4)
        //   // fun fact this is probably impossible to even get :D
        //   // return
        // }
      }
    },
    {
      event: 'TrackMania.BeginRace',
      callback: (params: tm.Events['TrackMania.BeginRace']): void => {
        // [0] = Challenge
      }
    },
    {
      event: 'TrackMania.EndRace',
      callback: (params: tm.Events['TrackMania.EndRace']): void => {
        // [0] = Rankings[arr], [1] = Challenge
      }
    },
    {
      event: 'TrackMania.BeginRound',
      callback: (): void => {
        // No params, rounds mode only
        const roundRecords = RoundsService.roundRecords
        RoundsService.handleBeginRound()
        Events.emit('BeginRound', roundRecords)
      }
    },
    {
      event: 'TrackMania.EndRound',
      callback: async (): Promise<void> => {
        // No params, rounds mode only

        await RoundsService.handleEndRound()
        Events.emit('EndRound', RoundsService.roundRecords)
      }
    },
    {
      event: 'TrackMania.BeginChallenge',
      callback: async ([map]: tm.Events['TrackMania.BeginChallenge']): Promise<void> => {
        // [0] = Challenge, [1] = WarmUp, [2] = MatchContinuation
        // Set game state to 'transition'
        GameService.state = 'transition'
        // Update server parameters
        await GameService.update()
        // Check whether the map was restarted
        if (!isRestart) {
          // In case it wasn't, update the votes and records
          await MapService.update()
          await RecordService.nextMap()
          await VoteService.nextMap()
        } else {
          MapService.restartMap()
          await RecordService.restartMap()
        }
        await RoundsService.handleBeginMap()
        // Update server config
        await ServerConfig.update()
        // Register map update
        Events.emit('BeginMap', { ...MapService.current, isRestart })
      }
    },
    {
      event: 'TrackMania.EndChallenge',
      callback: async ([rankings, map, wasWarmUp, continuesOnNextMap, restart]:
        tm.Events['TrackMania.EndChallenge']): Promise<void> => {
        // [0] = Rankings[struct], [1] = Challenge, [2] = WasWarmUp, [3] = MatchContinuesOnNextChallenge, [4] = RestartChallenge
        // If rankings are non-existent, index 0 becomes the current map, unsure whose fault is that, but I blame Nadeo usually
        PlayerService.resetCheckpoints()
        let droppedMap: undefined | tm.EndMapInfo['droppedMap']
        const nextJb = MapService.jukebox[0]
        if (!config.keepQueueAfterLeave && nextJb.callerLogin !== undefined
          && PlayerService.get(nextJb.callerLogin) === undefined) {
          droppedMap = nextJb as tm.EndMapInfo['droppedMap']
          MapService.removeFromQueue(nextJb.map.id)
        }
        const winner = rankings[0]
        // Set game state to 'result'
        isRestart = restart
        GameService.state = 'result'
        // Get winner login from the callback
        let login: string | undefined
        let wins: number | undefined
        // Only update wins if the player is not alone on the server and exists
        if (winner?.Login !== undefined && PlayerService.players.length !== 1 && winner?.BestTime !== -1) {
          login = winner?.Login
          wins = await PlayerService.addWin(login)
        }
        const endMapInfo: tm.EndMapInfo = {
          ...MapService.current,
          wasWarmUp: wasWarmUp,
          continuesOnNextMap: continuesOnNextMap,
          localRecords: RecordService.localRecords,
          liveRecords: RecordService.liveRecords,
          winnerLogin: login,
          winnerWins: wins,
          serverSideRankings: rankings,
          isRestart,
          droppedMap
        }
        // Update the player record averages, this can take a long time
        void PlayerService.calculateAveragesAndRanks()
        // Register map ending
        Events.emit('EndMap', endMapInfo)
      }
    },
    {
      event: 'TrackMania.StatusChanged',
      callback: (params: tm.Events['TrackMania.StatusChanged']): void => {
        // [0] = StatusCode, [1] = StatusName
        // [1] = Waiting, [2] = Launching, [3] = Running - Synchronization, [4] = Running - Play, [5] = Running - Finish
        if (params[0] === 4) {
          GameService.state = 'race'
        }
        if (params[0] === 4 || params[0] === 5) {
          GameService.startTimer()
        }
        // Handle server changing status, e.g. from Sync to Play
        // IIRC it's important that we don't start the controller before server switches to Play

        // Doesn't seem to matter actually
      }
    },
    {
      event: 'TrackMania.PlayerManialinkPageAnswer',
      callback: ([playerId, login, answer]: tm.Events['TrackMania.PlayerManialinkPageAnswer']): void => {
        // [0] = PlayerUid, [1] = Login, [2] = Answer
        if (PlayerService.get(login)?.privilege === -1) { return }
        const temp: any = PlayerService.get(login)
        if (temp === undefined) {
          Logger.error(`Player ${login} not online in TrackMania.PlayerManialinkPageAnswer event`)
          return
        }
        temp.actionId = answer
        const info: tm.ManialinkClickInfo = temp
        Events.emit('ManialinkClick', info)
      }
    },
    {
      event: 'TrackMania.BillUpdated',
      callback: ([id, state, stateName, transactionId]: tm.Events['TrackMania.BillUpdated']): void => {
        // [0] = BillId, [1] = State, [2] = StateName, [3] = TransactionId
        const bill: tm.BillUpdatedInfo = { id, state, stateName, transactionId }
        Events.emit('BillUpdated', bill)
      }
    },
    {
      event: 'TrackMania.ChallengeListModified',
      callback: async ([currentIndex, nextIndex, isListModified]: [number, number, boolean]): Promise<void> => {
        // [0] = CurChallengeIndex, [1] = NextChallengeIndex, [2] = IsListModified
        Client.callNoRes('SaveMatchSettings', [{ string: config.matchSettingsFile }])
        if(config.updateMatchSettingsOnChange && isListModified) {
          void MapService.updateList()
        }
      }
    },
    {
      event: 'TrackMania.PlayerInfoChanged',
      callback: (playerInfo: tm.Events['TrackMania.PlayerInfoChanged']): void => {
        // [0] = PlayerInfo
        const spec: any = playerInfo.SpectatorStatus.toString()
        const flags: any = playerInfo.Flags.toString()
        const info: tm.InfoChangedInfo = {
          login: playerInfo.Login,
          nickname: playerInfo.NickName,
          id: playerInfo.PlayerId,
          teamId: playerInfo.TeamId,
          ladderRanking: playerInfo.LadderRanking,
          isSpectator: spec?.[spec.length - 1] === '1',
          isTemporarySpectator: spec?.[spec.length - 2] === '1',
          isPureSpectator: spec?.[spec.length - 3] === '1',
          autoTarget: spec?.[spec.length - 4] === '1',
          currentTargetId: Number(spec?.substring(0, spec.length - 4)) || 0,
          forceSpectator: Number(flags?.[flags.length - 1]) || 0,
          isReferee: flags?.[flags.length - 2] === '1',
          isPodiumReady: flags?.[flags.length - 3] === '1',
          isUsingStereoscopy: flags?.[flags.length - 4] === '1',
          isManagedByOtherServer: flags?.[flags.length - 5] === '1',
          isServer: flags?.[flags.length - 6] === '1',
          hasPlayerSlot: flags?.[flags.length - 7] === '1'
        }
        PlayerService.setPlayerInfo(info)
        Events.emit('PlayerInfoChanged', info)
      }
    },
    {
      event: 'TrackMania.PlayerIncoherence',
      callback: async (): Promise<void> => {
        // [0] = PlayerUid, [1] = Login
        // No real use case. Game will tell you about redtime anyway
      }
    },
    {
      event: 'TrackMania.Echo',
      callback: async (): Promise<void> => {
        // [0] = Internal, [1] = Public
        // Have to understand what this thing actually does first
        // 8 results on Google, either xaseco source or callbacks list lol
      }
    },
    {
      event: 'TrackMania.VoteUpdated',
      callback: async (): Promise<void> => {
        // [0] = StateName, [1] = Login, [2] = CmdName, [3] = CmdParam
        // Tied to CallVotes. Very unlikely we'll use those at all
      }
    }
  ]

  static async initialize(): Promise<true | Error> {
    for (const listener of this.listeners) {
      Events.addListener(listener.event, listener.callback)
    }
    const cb: any | Error = await Client.call('EnableCallbacks', [
      { boolean: true }
    ])
    return cb instanceof Error ? cb : true
  }

}