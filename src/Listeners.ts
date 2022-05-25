'use strict'
import { Client } from './Client.js'
import { Events } from './Events.js'
import { PlayerService } from './services/PlayerService.js'
import { RecordService } from './services/RecordService.js'
import { ChatService } from './services/ChatService.js'
import { DedimaniaService } from './services/DedimaniaService.js'
import 'dotenv/config'
import { GameService } from './services/GameService.js'
import { ChallengeService } from './services/ChallengeService.js'

export class Listeners {
  private static readonly listeners: TMEvent[] = [
    {
      event: 'TrackMania.PlayerConnect',
      callback: async (params: any[]) => {
        // [0] = Login, [1] = IsSpectator
        if (params[0] === undefined) { await Client.call('Kick', [{ string: params[0] }]) }
        const playerInfo = await Client.call('GetDetailedPlayerInfo', [{ string: params[0] }])
        await PlayerService.join(playerInfo[0].Login, playerInfo[0].NickName, playerInfo[0].Path)
        await RecordService.fetchRecord(params[0].UId, params[0].Login)
      }
    },
    {
      event: 'TrackMania.PlayerDisconnect',
      callback: async (params: any[]) => {
        // [0] = Login
        await PlayerService.leave(params[0])
      }
    },
    {
      event: 'TrackMania.PlayerChat',
      callback: async (params: any[]) => {
        // [0] = PlayerUid, [1] = Login, [2] = Text, [3] = IsRegisteredCmd
        if (params[0] === 0) { // Ignore server messages
          return
        }
        await ChatService.add(params[1], params[2])
      }
    },
    {
      event: 'TrackMania.PlayerCheckpoint',
      callback: async (params: any[]) => {
        // [0] = PlayerUid, [1] = Login, [2] = TimeOrScore, [3] = CurLap, [4] = CheckpointIndex
        if (params[0] === 0) { // Ignore inexistent people
          return
        }
        const checkpoint: TMCheckpoint = { index: params[4], time: params[2], lap: params[3] }
        PlayerService.addCP(params[1], checkpoint)
        const temp:any = PlayerService.getPlayer(params[1])
        temp.time = params[2]
        temp.lap = params[3]
        temp.index = params[4]
        const info: CheckpointInfo = temp
        Events.emitEvent('Controller.PlayerCheckpoint', info)
      }
    },
    {
      event: 'TrackMania.PlayerFinish',
      callback: async (params: any[]) => {
        // [0] = PlayerUid, [1] = Login, [2] = TimeOrScore
        if (params[0] === 0) { // IGNORE THIS IS A FAKE FINISH
          return
        }
        if (params[2] === 0) { // IGNORE THIS IS JUST A FUNNY BACKSPACE PRESS
          // reset cps
          // PlayerService.getPlayer(params[1]).checkpoints.length = 0
          return
        }
        const status = await Client.call('GetStatus')
        if (status[0].Code !== 4) { // CHECK FOR GAME STATUS TO BE RUNNING - PLAY (code 4)
          return
        }
      }
    },
    {
      event: 'TrackMania.BeginRace',
      callback: async (params: any[]) => {
        // [0] = Challenge
      }
    },
    {
      event: 'TrackMania.EndRace',
      callback: async (params: any[]) => {
        // [0] = Rankings[arr], [1] = Challenge
      }
    },
    {
      event: 'TrackMania.BeginRound',
      callback: async () => {
        // No params, rounds mode only
      }
    },
    {
      event: 'TrackMania.EndRound',
      callback: async () => {
        // No params, rounds mode only
      }
    },
    {
      event: 'TrackMania.BeginChallenge',
      callback: async (params: any[]) => {
        // [0] = Challenge, [1] = WarmUp, [2] = MatchContinuation
        await GameService.initialize()
        await RecordService.fetchRecords(params[0].UId)
        await ChallengeService.setCurrent()
        const c = params[0]
        const info: BeginChallengeInfo = {
          id: c.UId, name: c.Name, author: c.Author, environment: c.Environnement, mood: c.Mood,
          bronzeTime: c.BronzeTime, silverTime: c.SilverTime, goldTime: c.GoldTime,
          authorTime: c.AuthorTime, copperPrice: c.CopperPrice, lapRace: c.LapRace,
          lapsAmount: c.NbLaps, checkpointsAmount: c.NbCheckpoints, records: RecordService.records
        }
        Events.emitEvent('Controller.BeginChallenge', info)
        if (process.env.USE_DEDIMANIA === 'YES') {
          const records = await DedimaniaService.getRecords(params[0].UId, params[0].Name, params[0].Environnement, params[0].Author)
          Events.emitEvent('Controller.DedimaniaRecords', records)
        }
      }
    },
    {
      event: 'TrackMania.EndChallenge',
      callback: async (params: any[]) => {
        // [0] = Rankings[arr], [1] = Challenge, [2] = WasWarmUp, [3] = MatchContinuesOnNextChallenge, [4] = RestartChallenge
      }
    },
    {
      event: 'TrackMania.StatusChanged',
      callback: async (params: any[]) => {
        // [0] = StatusCode, [1] = StatusName
        // [1] = Waiting, [2] = Launching, [3] = Running - Synchronization, [4] = Running - Play, [5] = Running - Finish
        // Handle server changing status, e.g. from Sync to Play
        // IIRC it's important that we don't start the controller before server switches to Play
        // if (params[1][0] == 4)
      }
    },
    {
      event: 'TrackMania.PlayerManialinkPageAnswer',
      callback: async (params: any[]) => {
        // [0] = PlayerUid, [1] = Login, [2] = Answer
        const temp: any = PlayerService.getPlayer(params[1])
        temp.answer = params[2]
        const info: ManialinkClickInfo = temp
        Events.emitEvent('Controller.ManialinkClick', info)
      }
    },
    {
      event: 'TrackMania.BillUpdated',
      callback: async (params: any[]) => {
        // [0] = BillId, [1] = State, [2] = StateName, [3] = TransactionId
        // Related to payments: donations, payouts, etc
      }
    },
    {
      event: 'TrackMania.ChallengeListModified',
      callback: async (params: any[]) => {
        // [0] = CurChallengeIndex, [1] = NextChallengeIndex, [2] = IsListModified
        Client.call('SaveMatchSettings', [{ string: 'MatchSettings/MatchSettings.txt' }]).then()
      }
    },
    {
      event: 'TrackMania.PlayerInfoChanged',
      callback: async (params: any[]) => {
        // [0] = PlayerInfo
        const spec = params[0].SpectatorStatus.toString()
        const flags = params[0].Flags.toString()
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
        Events.emitEvent('Controller.PlayerInfoChanged', info)
      }
    },
    {
      event: 'TrackMania.PlayerIncoherence',
      callback: async (params: any[]) => {
        // [0] = PlayerUid, [1] = Login
        // No real use case. Game will tell you about redtime anyway
      }
    },
    {
      event: 'TrackMania.Echo',
      callback: async (params: any[]) => {
        // [0] = Internal, [1] = Public
        // Have to understand what this thing actually does first
        // 8 results on Google, either xaseco source or callbacks list lol
      }
    },
    {
      event: 'TrackMania.VoteUpdated',
      callback: async (params: any[]) => {
        // [0] = StateName, [1] = Login, [2] = CmdName, [3] = CmdParam
        // Tied to CallVotes. Very unlikely we'll use those at all
      }
    }
  ]

  static async initialize(): Promise<void> {
    for (const listener of this.listeners) {
      Events.addListener(listener.event, listener.callback)
    }
  }
}
