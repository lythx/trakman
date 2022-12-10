import config from '../config/RecordsCommands.config.js'

const commands: tm.Command[] = [{
  aliases: config.delrec.aliases,
  help: config.delrec.help,
  params: [{ name: 'indexOrValue' }],
  callback: (info: tm.MessageInfo, indexOrValue: string): void => {
    let playerRecord: tm.LocalRecord | undefined
    const list: Readonly<tm.LocalRecord>[] = tm.records.local
    const index: number = Number(indexOrValue) - 1
    if (!isNaN(index) && index < list.length && index >= 0) {
      playerRecord = list[index]
    } else {
      playerRecord = tm.records.getLocal(indexOrValue)
      if (playerRecord === undefined) {
        if (index <= tm.records.maxLocalsAmount) {
          tm.sendMessage(tm.utils.strVar(config.delrec.outOfRange, { index: indexOrValue }), info.login)
        } else {
          tm.sendMessage(tm.utils.strVar(config.delrec.noPlayerRecord, { login: indexOrValue }), info.login)
        }
        return
      }
    }
    tm.sendMessage(tm.utils.strVar(config.delrec.text, { title: info.title, adminName: tm.utils.strip(info.nickname), nickname: tm.utils.strip(playerRecord.nickname) }), config.delrec.public ? undefined : info.login)
    tm.records.remove(playerRecord, tm.maps.current.id, info)
  },
  privilege: config.delrec.privilege
},
{
  aliases: config.prunerecs.aliases,
  help: config.prunerecs.help,
  callback: (info: tm.MessageInfo): void => {
    tm.sendMessage(tm.utils.strVar(config.prunerecs.text, { title: info.title, adminName: tm.utils.strip(info.nickname) }), config.prunerecs.public ? undefined : info.login)
    tm.records.removeAll(tm.maps.current.id, info)
  },
  privilege: config.prunerecs.privilege
}]

tm.commands.add(...commands)