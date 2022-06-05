'use strict'

import { TRAKMAN as TM } from '../src/Trakman.js'

const commands: TMCommand[] = [
  {
    aliases: ['addallfromdb'],
    help: 'Adds all the maps present in database if they are on TMX based on id',
    callback: async (info: MessageInfo) => {
      const res = await TM.queryDB('SELECT * FROM challenges;')
      if (res instanceof Error) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}Failed to get challenges from database`, info.login)
        return
      }
      for (const challenge of res) {
        if (TM.challenges.some(a => a.id === challenge.id))
          continue
        const file = await TM.fetchTrackFileByUid(challenge.id).catch(err => {
          TM.error(err)
        })
        if (!file) {
          TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}Track ${TM.strip(challenge.name, false)}$z$s${TM.colours.red} is not on TMX.`, info.login)
          continue
        }
        const write = await TM.call('WriteFile', [{ string: file.name }, { base64: file.content }])
        if (write instanceof Error) {
          TM.error('Failed to write file', write.message)
          TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}Failed to write the track ${TM.strip(challenge.name, false)}$z$s${TM.colours.red} file to the server.`, info.login)
          continue
        }
        const insert = await TM.call('InsertChallenge', [{ string: file.name }])
        if (insert instanceof Error) {
          TM.error('Failed to insert challenge to jukebox', insert.message)
          TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}Failed to insert the track ${TM.strip(challenge.name, false)}$z$s${TM.colours.red} into queue.`, info.login)
          continue
        }
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.white}Added map ${TM.strip(challenge.name, false)}$z$s${TM.colours.white} from TMX.`)
      }
    },
    privilege: 4
  }
]

for (const command of commands) { TM.addCommand(command) }