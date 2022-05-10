import Chat from './Chat.js'
import client from './Client.js'
import Events from './Events.js'
import Logger from './Logger.js'

class Listeners {
  #listeners = [
    {
      event: 'TrackMania.PlayerConnect',
      callback: (params) => {
        //Handle player connection, update databases, display shit, etc
        playerInfo = client.call('GetDetailedPlayerInfo', [{ string: params[0] }])
        if (playerInfo['Login'] === undefined)
          //TODO:: FUCKING KILL THE PLAYER BECAUSE THEIR INTERNET SUCKS
          Chat.sendMessage(`SUSSY PETYA ${params[0]}`)
      }
    },
    {
      event: 'TrackMania.PlayerDisconnect',
      callback: (params) => {
        //Handle player disconnection, put playtime in db, etc
      }
    },
    {
      event: 'TrackMania.PlayerChat',
      callback: (params) => {
        //Handle player to chat interaction, identify chat commands and execute them
        //  if (Chat.checkIfCommand(params[2]) && params[0]!==0)
        //     Chat.handleCommand(params[1], params[2])
      }
    },
    {
      event: 'TrackMania.PlayerCheckpoint',
      callback: (params) => {
        //Store current checkpoints, check for incoherences, ensure index isn't fucked up
      }
    },
    {
      event: 'TrackMania.PlayerFinish',
      callback: (params) => {
        //Store/update finish time in db
        if (params[0] === 0)
          return //IGNORE THIS IS A FAKE FINISH
        //TODO:::: CHECK FOR GAME STATUS TO BE RUNNING - PLAY
        if (params[2] === -1)
          return //IGNORE THIS IS JUST A FUNNY BACKSPACE PRESS
      }
    },
    {
      event: 'TrackMania.BeginRace',
      callback: (params) => {
        //Mostly ui updates
      }
    },
    {
      event: 'TrackMania.EndRace',
      callback: (params) => {
        //Mostly ui updates
      }
    },
    {
      event: 'TrackMania.BeginRound',
      callback: (params) => {
        //I'm assuming this is ROUNDS only, will figure out later
      }
    },
    {
      event: 'TrackMania.EndRound',
      callback: (params) => {
        //I'm assuming this is ROUNDS only, will figure out later
      }
    },
    {
      event: 'TrackMania.BeginChallenge',
      callback: (params) => {
        //Similar to BeginRace, albeit gives more information to process

      }
    },
    {
      event: 'TrackMania.EndChallenge',
      callback: (params) => {
        //Similar to EndRace, albeit gives more information to process
      }
    },
    {
      event: 'TrackMania.StatusChanged',
      callback: (params) => {
        //Handle server changing status, e.g. from Sync to Play
        //IIRC it's important that we don't start the controller before server switches to Play
        //if (params[1][0] == 4)
      }
    },
    {
      event: 'TrackMania.PlayerManialinkPageAnswer',
      callback: (params) => {
        //Handle player interaction with manialinks
      }
    },
    {
      event: 'TrackMania.BillUpdated',
      callback: (params) => {
        //Related to payments: donations, payouts, etc
      }
    },
    {
      event: 'TrackMania.ChallengeListModified',
      callback: (params) => {
        //Update maps in db, lists
      }
    },
    {
      event: 'TrackMania.PlayerInfoChanged',
      callback: (params) => {
        //Handle changes in the player object
      }
    },
    {
      event: 'TrackMania.PlayerIncoherence',
      callback: (params) => {
        //No real use case. Game will tell you about redtime anyway
      }
    },
    {
      event: 'TrackMania.Echo',
      callback: (params) => {
        //Have to understand what this thing actually does first
        //8 results on Google, either xaseco source or callbacks list lol
      }
    },
    {
      event: 'TrackMania.VoteUpdated',
      callback: (params) => {
        //Tied to CallVotes. Very unlikely we'll use those at all
      }
    },
  ]

  initialize () {
    for (const listener of this.#listeners) { Events.addListener(listener.event, listener.callback) }
  }
}

export default new Listeners()
