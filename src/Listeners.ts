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

let isRestart: boolean = false

export class Listeners {
  private static readonly listeners: TMListener[] = [
    {
      event: 'TrackMania.PlayerConnect',
      callback: async ([login, isSpectator]: TMEvents['TrackMania.PlayerConnect']): Promise<void> => {
        // [0] = Login, [1] = IsSpectator
        if (login === undefined) {
          // Me on my way to kick that pesky undefined
          Client.callNoRes('Kick', [{ string: login }])
          return
        }
        const playerInfo: any[] | Error = await Client.call('GetDetailedPlayerInfo', [{ string: login }])
        if (playerInfo instanceof Error) {
          Logger.error(`Failed to get player info for login ${login}`, playerInfo.message)
          Client.callNoRes('Kick', [{ string: login }])
          return
        }
        const ip: string = playerInfo[0].IPAddress.split(':')[0]
        const canJoin = await AdministrationService.handleJoin(login, ip)
        if (canJoin === false) { return }
        const joinInfo: JoinInfo = await PlayerService.join(playerInfo[0].Login, playerInfo[0].NickName,
          playerInfo[0].Path, isSpectator, playerInfo[0].PlayerId, ip, playerInfo[0].OnlineRights === 3,
          playerInfo[0]?.LadderStats.PlayerRankings[0]?.Score, playerInfo[0]?.LadderStats.PlayerRankings[0]?.Ranking)
        Events.emit('PlayerJoin', joinInfo)
        // Update rank for the arriving player, this can take time hence no await
        void RecordService.fetchAndStoreRanks(playerInfo[0].Login)
      }
    },
    {
      event: 'TrackMania.PlayerDisconnect',
      callback: ([login]: TMEvents['TrackMania.PlayerDisconnect']): void => {
        // [0] = Login
        if (AdministrationService.banlist.some(a => a.login === login)) {
          return
        }
        const leaveInfo: LeaveInfo | Error = PlayerService.leave(login)
        if (!(leaveInfo instanceof Error)) {
          Events.emit('PlayerLeave', leaveInfo)
        }
      }
    },
    {
      event: 'TrackMania.PlayerChat',
      callback: ([playerId, login, text]: TMEvents['TrackMania.PlayerChat']): void => {
        // [0] = PlayerUid, [1] = Login, [2] = Text, [3] = IsRegisteredCommand
        // Ignore server messages (PID 0 = Server)
        if (playerId === 0) {
          return
        }
        const messageInfo: TMMessageInfo | Error = ChatService.add(login, text)
        if (!(messageInfo instanceof Error)) {
          Events.emit('PlayerChat', messageInfo)
        }
      }
    },
    {
      event: 'TrackMania.PlayerCheckpoint',
      callback: async ([playerId, login, timeOrScore, currentLap, checkpointIndex]:
        TMEvents['TrackMania.PlayerCheckpoint']): Promise<void> => {
        // [0] = PlayerUid, [1] = Login, [2] = TimeOrScore, [3] = CurLap, [4] = CheckpointIndex
        // Ignore inexistent people // Please elaborate // PID 0 = Server // HOW CAN SERVER GET A CHECKPOINT
        if (playerId === 0) {
          return
        }
        const player: TMPlayer | undefined = PlayerService.get(login)
        if (player === undefined) {
          Logger.error(`Can't find player ${login} in memory on checkpoint event`)
          return
        }
        const checkpoint: TMCheckpoint = { index: checkpointIndex, time: timeOrScore, lap: currentLap }
        const cpStatus: boolean | Error = PlayerService.addCP(player, checkpoint)
        // Last CP = Finish
        if (cpStatus === true) {
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
          }
          return
          // Real CP
        } else if (cpStatus === false) {
          const info: CheckpointInfo = {
            time: timeOrScore,
            lap: currentLap,
            index: checkpointIndex,
            player
          }
          // Register player checkpoint
          Events.emit('PlayerCheckpoint', info)
        }
      }
    },
    {
      event: 'TrackMania.PlayerFinish',
      callback: async (params: TMEvents['TrackMania.PlayerFinish']): Promise<void> => {
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
      callback: (params: TMEvents['TrackMania.BeginRace']): void => {
        // [0] = Challenge
      }
    },
    {
      event: 'TrackMania.EndRace',
      callback: (params: TMEvents['TrackMania.EndRace']): void => {
        // [0] = Rankings[arr], [1] = Challenge
      }
    },
    {
      event: 'TrackMania.BeginRound',
      callback: (): void => {
        // No params, rounds mode only
      }
    },
    {
      event: 'TrackMania.EndRound',
      callback: (): void => {
        // No params, rounds mode only
      }
    },
    {
      event: 'TrackMania.BeginChallenge',
      callback: async ([map]: TMEvents['TrackMania.BeginChallenge']): Promise<void> => {
        // [0] = Challenge, [1] = WarmUp, [2] = MatchContinuation
        // Set game state to 'race'
        GameService.state = 'race'
        // Update server parameters
        await GameService.update()
        // Get records for current map
        await RecordService.fetchAndStoreRecords(map.UId)
        const info: BeginMapInfo = {
          id: map.UId,
          name: map.Name,
          fileName: map.FileName,
          author: map.Author,
          environment: map.Environnement,
          mood: map.Mood,
          bronzeTime: map.BronzeTime,
          silverTime: map.SilverTime,
          goldTime: map.GoldTime,
          authorTime: map.AuthorTime,
          copperPrice: map.CopperPrice,
          lapRace: map.LapRace,
          lapsAmount: map.NbLaps,
          checkpointsAmount: map.NbCheckpoints,
          records: RecordService.localRecords,
          isRestart
        }
        // Check whether the map was restarted
        if (isRestart == false) {
          // In case it wasn't, update the ongoing map
          await MapService.update()
          await VoteService.nextMap()
        }
        // Update server config
        ServerConfig.update()
        // Register map update
        Events.emit('BeginMap', info)
      }
    },
    {
      event: 'TrackMania.EndChallenge',
      callback: async ([winner, map, wasWarmUp, continuesOnNextMap, isRestart]:
        TMEvents['TrackMania.EndChallenge']): Promise<void> => {
        // [0] = Rankings[struct], [1] = Challenge, [2] = WasWarmUp, [3] = MatchContinuesOnNextChallenge, [4] = RestartChallenge
        // If rankings are non-existent, index 0 becomes the current map, unsure whose fault is that, but I blame Nadeo usually
        // Set game state to 'result'
        GameService.state = 'result'
        // Get winner login from the callback
        const login: string | undefined = winner.Login
        // Only update wins if the player is not alone on the server and exists
        const wins: number | undefined = (login === undefined || PlayerService.players.length === 1
          || winner.BestTime === -1) ? undefined : await PlayerService.addWin(login)
        const endMapInfo: EndMapInfo = {
          ...MapService.current,
          isRestarted: isRestart,
          wasWarmUp: wasWarmUp,
          continuesOnNextMap: continuesOnNextMap,
          localRecords: RecordService.localRecords,
          liveRecords: RecordService.liveRecords,
          winnerLogin: login,
          winnerWins: wins,
          isRestart
        }
        // Update the player record averages, this can take a long time
        void PlayerService.calculateAveragesAndRanks()
        // Register map ending
        Events.emit('EndMap', endMapInfo)
      }
    },
    {
      event: 'TrackMania.StatusChanged',
      callback: (params: TMEvents['TrackMania.StatusChanged']): void => {
        // [0] = StatusCode, [1] = StatusName
        // [1] = Waiting, [2] = Launching, [3] = Running - Synchronization, [4] = Running - Play, [5] = Running - Finish
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
      callback: ([playerId, login, answer]: TMEvents['TrackMania.PlayerManialinkPageAnswer']): void => {
        // [0] = PlayerUid, [1] = Login, [2] = Answer
        if (PlayerService.get(login)?.privilege === -1) { return }
        const temp: any = PlayerService.get(login)
        temp.answer = answer
        const info: ManialinkClickInfo = temp
        Events.emit('ManialinkClick', info)
      }
    },
    {
      event: 'TrackMania.BillUpdated',
      callback: ([id, state, stateName, transactionId]: TMEvents['TrackMania.BillUpdated']): void => {
        // [0] = BillId, [1] = State, [2] = StateName, [3] = TransactionId
        const bill: BillUpdatedInfo = { id, state, stateName, transactionId }
        Events.emit('BillUpdated', bill)
      }
    },
    {
      event: 'TrackMania.ChallengeListModified',
      callback: (): void => {
        // [0] = CurChallengeIndex, [1] = NextChallengeIndex, [2] = IsListModified
        Client.callNoRes('SaveMatchSettings', [{ string: config.matchSettingsFile }])
      }
    },
    {
      event: 'TrackMania.PlayerInfoChanged',
      callback: ([playerInfo]: TMEvents['TrackMania.PlayerInfoChanged']): void => {
        // [0] = PlayerInfo
        const spec: any = playerInfo.SpectatorStatus.toString()
        const flags: any = playerInfo.Flags.toString()
        const info: InfoChangedInfo = {
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
        // TODO: Need to check which of these are actually "spectator"
        if (info.isSpectator /*|| info.isTemporarySpectator*/ || info.isPureSpectator) {
          PlayerService.setPlayerSpectatorStatus(info.login, true)
        } else {
          PlayerService.setPlayerSpectatorStatus(info.login, false)
        }
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
    const cb: any[] | Error = await Client.call('EnableCallbacks', [
      { boolean: true }
    ])
    return cb instanceof Error ? cb : true
  }

}