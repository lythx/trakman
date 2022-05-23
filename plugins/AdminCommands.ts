'use strict'
import { TRAKMAN as TM } from '../src/Trakman.js'

const commands: TMCommand[] = [
  {
    aliases: ['sgm', 'setgamemode'],
    help: 'Change the gamemode.',
    callback: (info: MessageInfo) => {
      let mode: number
      switch (info.text.toLowerCase()) {
        case 'rounds':
        case 'round':
          mode = 0
          break
        case 'timeattack':
        case 'ta':
          mode = 1
          break
        case 'teams':
        case 'team':
          mode = 2
          break
        case 'laps':
        case 'lap':
          mode = 3
          break
        case 'stunts':
        case 'stunt':
          mode = 4
          break
        case 'cup':
          mode = 5
          break
        default:
          return
      }
      TM.multiCallNoRes({
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has set `
              + `the gamemode to ${TM.colours.white + info.text.toUpperCase()}${TM.colours.folly}.`
          }]
        },
        {
          method: 'SetGameMode',
          params: [{ int: mode }]
        })
    },
    privilege: 2
  },
  {
    aliases: ['b', 'ban'],
    help: 'Ban a specific player.',
    callback: (info: MessageInfo) => {
      const targetInfo = TM.getPlayer(info.text)
      if (targetInfo === undefined) { return }
      TM.multiCallNoRes( {
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has banned `
              + `${TM.colours.white + TM.stripModifiers(targetInfo.nickName)}${TM.colours.folly}.`
          }]
        },
        {
          method: 'Ban',
          params: [{ string: targetInfo.login }, { string: 'asdsasdasd' }]
        })
    },
    privilege: 2
  },
  {
    aliases: ['ub', 'unban'],
    help: 'Unban a specific player.',
    callback: (info: MessageInfo) => {
      // TODO: implement an internal ban list or something
      // So that this returns if you attempt to unban somebody who's not banned
      TM.fetchPlayer(info.text).then(async (i) => {
        const targetInfo = i
        if (targetInfo == null) { return }
        TM.multiCallNoRes({
            method: 'ChatSendServerMessage',
            params: [{
              string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
                + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has unbanned `
                + `${TM.colours.white + TM.stripModifiers(targetInfo.nickName)}${TM.colours.folly}.`
            }]
          },
          {
            method: 'UnBan',
            params: [{ string: targetInfo.login }]
          })
      })
    },
    privilege: 2
  },
  {
    aliases: ['bl', 'blacklist'],
    help: 'Blacklist a specific player.',
    callback: async (info: MessageInfo) => {
      const targetInfo = TM.getPlayer(info.text)
      if (targetInfo === undefined) { return }
      await TM.multiCall({
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has blacklisted `
              + `${TM.colours.white + TM.stripModifiers(targetInfo.nickName)}${TM.colours.folly}.`
          }]
        },
        {
          method: 'Kick', // Kick the player first, so that we don't have to execute BanAndBlackList method
          params: [{ string: targetInfo.login }, { string: 'asdsasdasd' }]
        })
      await new Promise((r) => setTimeout(r, 5)) // Timeout to ensure BlackList gets called after Kick
      TM.callNoRes('BlackList', [{ string: targetInfo.login }])
    },
    privilege: 2
  },
  {
    aliases: ['ubl', 'unblacklist'],
    help: 'Unblacklist a specific player.',
    callback: async (info: MessageInfo) => {
      // TODO: implement an internal blacklisted people list or something
      // So that this returns if you attempt to unblacklist somebody who's not blacklisted
      TM.fetchPlayer(info.text).then(async (i) => {
        const targetInfo = i
        if (targetInfo == null) { return }
        TM.multiCallNoRes({
            method: 'ChatSendServerMessage',
            params: [{
              string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
                + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has unblacklisted `
                + `${TM.colours.white + TM.stripModifiers(targetInfo.nickName)}${TM.colours.folly}.`
            }]
          },
          {
            method: 'UnBlackList',
            params: [{ string: targetInfo.login }]
          })
      })
    },
    privilege: 2
  },
]

for (const command of commands) { TM.addCommand(command) }
