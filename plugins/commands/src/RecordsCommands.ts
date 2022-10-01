import config from '../config/RecordsCommands.config.js'

const commands: tm.Command[] = [{
  aliases: ['dr', 'delrec', 'deleterecord'],
  help: 'Remove a player\'s record on the ongoing map.',
  params: [{ name: 'login' }],
  callback: (info: tm.MessageInfo, login: string): void => {
    // Can also be done with tm.getPlayerRecord, however we need the player nickname
    const playerRecord: tm.LocalRecord | undefined = tm.records.getLocal(login)
    if (playerRecord === undefined) {
      tm.sendMessage(tm.utils.strVar(config.delrec.error, { login: login }), info.login)
      return
    }
    tm.sendMessage(tm.utils.strVar(config.delrec.text, { title: info.title, adminName: tm.utils.strip(info.nickname), nickname: tm.utils.strip(playerRecord.nickname) }), config.delrec.public ? undefined : info.login)
    tm.records.remove(playerRecord, tm.maps.current.id, info)
  },
  privilege: config.delrec.privilege
},
{
  aliases: ['pr', 'prunerecs', 'prunerecords'],
  help: 'Remove all records on the ongoing map.',
  callback: (info: tm.MessageInfo): void => {
    tm.sendMessage(tm.utils.strVar(config.prunerecs.text, { title: info.title, adminName: tm.utils.strip(info.nickname) }), config.prunerecs.public ? undefined : info.login)
    tm.records.removeAll(tm.maps.current.id, info)
  },
  privilege: config.prunerecs.privilege
}]

tm.commands.add(...commands)