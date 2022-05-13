'use strict'
import Chat from './plugins/Chat.js'
import Client from './Client.js'
import Events from './Events.js'
import {PlayerService} from './services/PlayerService.js'
import Logger from './Logger.js'
import {RecordService} from './services/RecordService.js'

class Listeners {
  static #listeners = [
    {
      event: 'TrackMania.PlayerConnect',
      callback: async (params: any[]) => {
        if (params[0] === undefined) { await Client.call('Kick', [{ string: params[0] }]) }
        const playerInfo = await Client.call('GetDetailedPlayerInfo', [{ string: params[0] }])
        await PlayerService.join(playerInfo[0].Login, playerInfo[0].NickName, playerInfo[0].Path)
        Chat.sendJoinMessage(playerInfo[0].NickName)
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
        if (params[0] === 0) // check if server message
        { }
        // Log the chat and write to log table
      }
    },
    {
      event: 'TrackMania.PlayerCheckpoint',
      callback: async (params: any[]) => {
        // Store current checkpoints, check for incoherences, ensure index isn't fucked up
      }
    },
    {
      event: 'TrackMania.PlayerFinish',
      callback: async (params: any[]) => { // params are PlayerUid, Login, Score
        if (params[0] === 0 || params[2] === 0) { // IGNORE THIS IS A FAKE FINISH | IGNORE THIS IS JUST A FUNNY BACKSPACE PRESS
          return
        }
        const status = await Client.call('GetStatus')
        if (status[0].Code !== 4) { // CHECK FOR GAME STATUS TO BE RUNNING - PLAY (code 4)
          return
        }
        const challengeInfo = await Client.call('GetCurrentChallengeInfo')
        await this.recordService.add(challengeInfo[0].UId, params[1], params[2], [])
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

  private static recordService = new RecordService()

  static async initialize () {
    for (const listener of this.#listeners) { Events.addListener(listener.event, listener.callback) }
    await this.recordService.initialize()
  }
}

export default Listeners