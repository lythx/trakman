import { TRAKMAN as TM } from '../src/Trakman.js'

const commands: TMCommand[] = [
  {
    aliases: ['addallfromdb'],
    help: 'Adds all the maps present in database if they are on TMX based on id',
    callback: async (info: MessageInfo) => {
      const res = await TM.queryDB('SELECT * FROM challenges;')
      if (res instanceof Error) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to get challenges from the database.`, info.login)
        return
      }
      for (const challenge of res) {
        if (TM.challenges.some(a => a.id === challenge.id))
          continue
        const file = await TM.fetchTrackFileByUid(challenge.id).catch(err => {
          TM.error(err)
        })
        if (!file) {
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Track ${TM.palette.highlight + TM.strip(challenge.name, false)}$z$s ${TM.palette.error}is not on TMX.`, info.login)
          continue
        }
        const write = await TM.call('WriteFile', [{ string: file.name }, { base64: file.content }])
        if (write instanceof Error) {
          TM.error('Failed to write file', write.message)
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to write the track ${TM.palette.highlight + TM.strip(challenge.name, false)}$z$s ${TM.palette.error}file to the server.`, info.login)
          continue
        }
        const insert = await TM.call('InsertChallenge', [{ string: file.name }])
        if (insert instanceof Error) {
          TM.error('Failed to insert challenge to jukebox', insert.message)
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to insert the track ${TM.palette.highlight + TM.strip(challenge.name, false)}$z$s ${TM.palette.error}into queue.`, info.login)
          continue
        }
        TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
          + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has added and queued `
          + `${TM.palette.highlight + TM.strip(challenge.name, true)}${TM.palette.admin} from TMX.`)
      }
    },
    privilege: 4
  }
]

for (const command of commands) { TM.addCommand(command) }