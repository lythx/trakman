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
        if (params[0] === undefined) { await Client.call('Kick', [{ string: params[0] }]) }
        const playerInfo = await Client.call('GetDetailedPlayerInfo', [{ string: params[0] }])
        await PlayerService.join(playerInfo[0].Login, playerInfo[0].NickName, playerInfo[0].Path)
        await RecordService.fetchRecord(params[0].UId, params[0].Login)
      }
    },
    {
      event: 'TrackMania.PlayerDisconnect',
      callback: async (params: any[]) => {
        await PlayerService.leave(params[0])
      }
    },
    {
      event: 'TrackMania.PlayerChat',
      callback: async (params: any[]) => {
        if (params[0] === 0) { // check if server message
          return
        }
        await ChatService.add(params[1], params[2])
      }
    },
    {
      event: 'TrackMania.PlayerCheckpoint',
      callback: async (params: any[]) => {
        // Store current checkpoints, check for incoherences, ensure index isn't fucked up
        if (params[0] === 0) { // check if null player
          return
        }
        const checkpoint: TMCheckpoint = { index: params[4], time: params[2], lap: params[3] }
        await PlayerService.addCP(params[1], checkpoint)
      }
    },
    {
      event: 'TrackMania.PlayerFinish',
      callback: async (params: any[]) => { // params are PlayerUid, Login, Score
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
        await RecordService.add(ChallengeService.current.id, params[1], params[2])
        // Store/update finish time in db
      }
    },
    {
      event: 'TrackMania.BeginRace',
      callback: async (params: any[]) => {
        // Mostly ui updates
      }
    },
    {
      event: 'TrackMania.EndRace',
      callback: async (params: any[]) => {
        // Mostly ui updates
      }
    },
    {
      event: 'TrackMania.BeginRound',
      callback: async () => {
        // I'm assuming this is ROUNDS only, will figure out later
      }
    },
    {
      event: 'TrackMania.EndRound',
      callback: async () => {
        // I'm assuming this is ROUNDS only, will figure out later
      }
    },
    {
      event: 'TrackMania.BeginChallenge',
      callback: async (params: any[]) => {
        // Similar to BeginRace, albeit gives more information to process
        await GameService.initialize()
        await RecordService.fetchRecords(params[0].UId)
        await ChallengeService.setCurrent()
        if (process.env.USE_DEDIMANIA === 'YES') {
          const records = await DedimaniaService.getRecords(params[0].UId, params[0].Name, params[0].Environnement, params[0].Author)
          records[0].Name = params[0].Name
          records[0].Author = params[0].Author
          records[0].Environnement = params[0].Environnement
          Events.emitEvent('Controller.DedimaniaRecords', [...records])
        }
      }
    },
    {
      event: 'TrackMania.EndChallenge',
      callback: async (params: any[]) => {
        // Similar to EndRace, albeit gives more information to process
      }
    },
    {
      event: 'TrackMania.StatusChanged',
      callback: async (params: any[]) => {
        // Handle server changing status, e.g. from Sync to Play
        // IIRC it's important that we don't start the controller before server switches to Play
        // if (params[1][0] == 4)
      }
    },
    {
      event: 'TrackMania.PlayerManialinkPageAnswer',
      callback: async (params: any[]) => {
        // Handle player interaction with manialinks
      }
    },
    {
      event: 'TrackMania.BillUpdated',
      callback: async (params: any[]) => {
        // Related to payments: donations, payouts, etc
      }
    },
    {
      event: 'TrackMania.ChallengeListModified',
      callback: async (params: any[]) => {
        Client.call('SaveMatchSettings', [{ string: 'MatchSettings/MatchSettings.txt' }])
        // Update maps in db, lists
      }
    },
    {
      event: 'TrackMania.PlayerInfoChanged',
      callback: async (params: any[]) => {
        // Handle changes in the player object
      }
    },
    {
      event: 'TrackMania.PlayerIncoherence',
      callback: async (params: any[]) => {
        // No real use case. Game will tell you about redtime anyway
      }
    },
    {
      event: 'TrackMania.Echo',
      callback: async (params: any[]) => {
        // Have to understand what this thing actually does first
        // 8 results on Google, either xaseco source or callbacks list lol
      }
    },
    {
      event: 'TrackMania.VoteUpdated',
      callback: async (params: any[]) => {
        // Tied to CallVotes. Very unlikely we'll use those at all
      }
    }
  ]

  static async initialize (): Promise<void> {
    for (const listener of this.listeners) {
      Events.addListener(listener.event, listener.callback)
    }
  }
}
