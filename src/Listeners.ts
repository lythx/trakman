import { Client } from './Client.js'
import { Events } from './Events.js'
import { PlayerService } from './services/PlayerService.js'
import { RecordService } from './services/RecordService.js'
import { ChatService } from './services/ChatService.js'
import { DedimaniaService } from './services/DedimaniaService.js'
import 'dotenv/config'
import { GameService } from './services/GameService.js'
import { MapService } from './services/MapService.js'
import { ErrorHandler } from './ErrorHandler.js'
import { JukeboxService } from './services/JukeboxService.js'
import { ServerConfig } from './ServerConfig.js'
import { TMXService } from './services/TMXService.js'
import { AdministrationService } from './services/AdministrationService.js'
import { VoteService } from './services/VoteService.js'

export class Listeners {
  private static readonly listeners: TMEvent[] = [
    {
      event: 'TrackMania.PlayerConnect',
      callback: async (params: any[]): Promise<void> => {
        // [0] = Login, [1] = IsSpectator
        if (params[0] === undefined) {
          Client.callNoRes('Kick', [{ string: params[0] }])
          return
        }
        const playerInfo: any[] | Error = await Client.call('GetDetailedPlayerInfo', [{ string: params[0] }])
        if (playerInfo instanceof Error) {
          ErrorHandler.error(`Failed to get player ${params[0]} info`, playerInfo.message)
          Client.callNoRes('Kick', [{ string: params[0] }])
          return
        }
        const ip: string = playerInfo[0].IPAddress.split(':')[0]
        const canJoin = AdministrationService.checkIfCanJoin(params[0], ip)
        if (canJoin !== true) {
          const reason: string = typeof canJoin.reason === 'string' ? `\nReason: ${canJoin.reason}` : ''
          Client.callNoRes('Kick', [{ string: params[0] },
          { string: `You have been ${canJoin.banMethod === 'ban' ? 'banned' : 'blacklisted'} on this server.${reason}` }])
          return
        }
        await PlayerService.join(playerInfo[0].Login, playerInfo[0].NickName, playerInfo[0].Path, playerInfo[1],
          playerInfo[0].PlayerId, ip, playerInfo[0].OnlineRights === 3)
        await RecordService.fetchRecord(params[0].UId, params[0].Login)
      }
    },
    {
      event: 'TrackMania.PlayerDisconnect',
      callback: async (params: any[]): Promise<void> => {
        // [0] = Login
        await PlayerService.leave(params[0])
      }
    },
    {
      event: 'TrackMania.PlayerChat',
      callback: async (params: any[]): Promise<void> => {
        // [0] = PlayerUid, [1] = Login, [2] = Text, [3] = IsRegisteredCmd
        if (params[0] === 0) { // Ignore server messages
          return
        }
        await ChatService.add(params[1], params[2])
      }
    },
    {
      event: 'TrackMania.PlayerCheckpoint',
      callback: async (params: any[]): Promise<void> => {
        // [0] = PlayerUid, [1] = Login, [2] = TimeOrScore, [3] = CurLap, [4] = CheckpointIndex
        if (params[0] === 0) { // Ignore inexistent people
          return
        }
        const checkpoint: TMCheckpoint = { index: params[4], time: params[2], lap: params[3] }
        PlayerService.addCP(params[1], checkpoint) // FIX CP EVENT BEING EMITTED ON FINISH // or not? idk
        const player= PlayerService.getPlayer(params[1])
        if(player === undefined) { return }
        const info: CheckpointInfo = {
          time: params[2],
          lap: params[3],
          index: params[4],
          player
        }
        Events.emitEvent('Controller.PlayerCheckpoint', info)
      }
    },
    {
      event: 'TrackMania.PlayerFinish',
      callback: async (params: any[]): Promise<void> => {
        // [0] = PlayerUid, [1] = Login, [2] = TimeOrScore
        if (params[0] === 0) { // IGNORE THIS IS A FAKE FINISH
          return
        }
        if (params[2] === 0) { // IGNORE THIS IS JUST A FUNNY BACKSPACE PRESS
          // reset cps
          // PlayerService.getPlayer(params[1]).checkpoints.length = 0
          return
        }
        const status: any[] | Error = await Client.call('GetStatus') // seems kinda useless innit
        if (status instanceof Error) {
          ErrorHandler.error('Failed to get game status', status.message)
          return
        }
        if (status[0].Code !== 4) { // CHECK FOR GAME STATUS TO BE RUNNING - PLAY (code 4)
          // fun fact this is probably impossible to even get :D
          // return
        }
      }
    },
    {
      event: 'TrackMania.BeginRace',
      callback: async (params: any[]): Promise<void> => {
        // [0] = Challenge
      }
    },
    {
      event: 'TrackMania.EndRace',
      callback: async (params: any[]): Promise<void> => {
        // [0] = Rankings[arr], [1] = Challenge
      }
    },
    {
      event: 'TrackMania.BeginRound',
      callback: async (): Promise<void> => {
        // No params, rounds mode only
      }
    },
    {
      event: 'TrackMania.EndRound',
      callback: async (): Promise<void> => {
        // No params, rounds mode only
      }
    },
    {
      event: 'TrackMania.BeginChallenge',
      callback: async (params: any[]): Promise<void> => {
        // [0] = Challenge, [1] = WarmUp, [2] = MatchContinuation
        await ServerConfig.update()
        await GameService.initialize()
        await RecordService.fetchRecords(params[0].UId)
        await MapService.setCurrent()
        const c: any = params[0]
        const info: BeginMapInfo = {
          id: c.UId,
          name: c.Name,
          fileName: c.FileName,
          author: c.Author,
          environment: c.Environnement,
          mood: c.Mood,
          bronzeTime: c.BronzeTime,
          silverTime: c.SilverTime,
          goldTime: c.GoldTime,
          authorTime: c.AuthorTime,
          copperPrice: c.CopperPrice,
          lapRace: c.LapRace,
          lapsAmount: c.NbLaps,
          checkpointsAmount: c.NbCheckpoints,
          records: RecordService.records
        }
        const lastId: string = JukeboxService.current.id
        JukeboxService.nextMap()
        if (lastId === JukeboxService.current.id) { TMXService.restartMap() }
        else {
          await TMXService.nextMap()
          await VoteService.nextMap()
        }
        ServerConfig.update()
        Events.emitEvent('Controller.BeginMap', info)
        if (process.env.USE_DEDIMANIA === 'YES') { await DedimaniaService.getRecords(params[0].UId, params[0].Name, params[0].Environnement, params[0].Author) }
      }
    },
    {
      event: 'TrackMania.EndChallenge',
      callback: async (params: any[]): Promise<void> => {
        // [0] = Rankings[arr], [1] = Challenge, [2] = WasWarmUp, [3] = MatchContinuesOnNextChallenge, [4] = RestartChallenge
        const temp: any = MapService.current
        temp.records = RecordService.records
        temp.isRestarted = params[4]
        temp.wasWarmUp = params[2]
        temp.continuesOnNextMap = params[3]
        const endMapInfo: EndMapInfo = temp
        Events.emitEvent('Controller.EndMap', endMapInfo)
      }
    },
    {
      event: 'TrackMania.StatusChanged',
      callback: async (params: any[]): Promise<void> => {
        // [0] = StatusCode, [1] = StatusName
        // [1] = Waiting, [2] = Launching, [3] = Running - Synchronization, [4] = Running - Play, [5] = Running - Finish
        // Handle server changing status, e.g. from Sync to Play
        // IIRC it's important that we don't start the controller before server switches to Play
        // if (params[1][0] == 4)
      }
    },
    {
      event: 'TrackMania.PlayerManialinkPageAnswer',
      callback: async (params: any[]): Promise<void> => {
        // [0] = PlayerUid, [1] = Login, [2] = Answer
        const temp: any = PlayerService.getPlayer(params[1])
        temp.answer = params[2]
        const info: ManialinkClickInfo = temp
        Events.emitEvent('Controller.ManialinkClick', info)
      }
    },
    {
      event: 'TrackMania.BillUpdated',
      callback: async (params: any[]): Promise<void> => {
        // [0] = BillId, [1] = State, [2] = StateName, [3] = TransactionId
        // Related to payments: donations, payouts, etc
      }
    },
    {
      event: 'TrackMania.ChallengeListModified',
      callback: async (params: any[]): Promise<void> => {
        // [0] = CurChallengeIndex, [1] = NextChallengeIndex, [2] = IsListModified
        Client.callNoRes('SaveMatchSettings', [{ string: 'MatchSettings/MatchSettings.txt' }])
      }
    },
    {
      event: 'TrackMania.PlayerInfoChanged',
      callback: async (params: any[]): Promise<void> => {
        // [0] = PlayerInfo
        const spec: any = params[0].SpectatorStatus.toString()
        const flags: any = params[0].Flags.toString()
        const info: InfoChangedInfo = {
          login: params[0].Login,
          nickName: params[0].NickName,
          id: params[0].PlayerId,
          teamId: params[0].TeamId,
          ladderRanking: params[0].LadderRanking,
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
        if (info.isSpectator || info.isTemporarySpectator || info.isPureSpectator) { PlayerService.setPlayerSpectatorStatus(info.login, true) }
        else { PlayerService.setPlayerSpectatorStatus(info.login, false) }
        Events.emitEvent('Controller.PlayerInfoChanged', info)
      }
    },
    {
      event: 'TrackMania.PlayerIncoherence',
      callback: async (params: any[]): Promise<void> => {
        // [0] = PlayerUid, [1] = Login
        // No real use case. Game will tell you about redtime anyway
      }
    },
    {
      event: 'TrackMania.Echo',
      callback: async (params: any[]): Promise<void> => {
        // [0] = Internal, [1] = Public
        // Have to understand what this thing actually does first
        // 8 results on Google, either xaseco source or callbacks list lol
      }
    },
    {
      event: 'TrackMania.VoteUpdated',
      callback: async (params: any[]): Promise<void> => {
        // [0] = StateName, [1] = Login, [2] = CmdName, [3] = CmdParam
        // Tied to CallVotes. Very unlikely we'll use those at all
      }
    }
  ]

  static initialize(): void {
    for (const listener of this.listeners) {
      Events.addListener(listener.event, listener.callback)
    }
  }
}
