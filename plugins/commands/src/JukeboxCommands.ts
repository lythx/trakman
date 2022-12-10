import config from '../config/JukeboxCommands.config.js'

const commands: tm.Command[] = [{
  aliases: config.dropjukebox.aliases,
  help: config.dropjukebox.help,
  params: [{ name: 'index', type: 'int' }],
  callback: (info: tm.MessageInfo, index: number): void => {
    const map: tm.Map | undefined = tm.jukebox.juked[index - 1]?.map
    if (map === undefined) {
      tm.sendMessage(config.dropjukebox.error, info.login)
      return
    }
    tm.sendMessage(tm.utils.strVar(config.dropjukebox.text, { title: info.title, adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(map.name) }), config.dropjukebox.public ? undefined : info.login)
    tm.jukebox.remove(map.id, info)
  },
  privilege: config.dropjukebox.privilege
},
{
  aliases: config.clearjukebox.aliases,
  help: config.clearjukebox.help,
  callback: (info: tm.MessageInfo): void => {
    if (tm.jukebox.juked.length === 0) {
      tm.sendMessage(config.clearjukebox.error, info.login)
      return
    }
    tm.sendMessage(tm.utils.strVar(config.clearjukebox.text, { title: info.title, adminName: tm.utils.strip(info.nickname) }), config.clearjukebox.public ? undefined : info.login)
    for (const map of tm.jukebox.juked) {
      tm.jukebox.remove(map.map.id, info)
    }
  },
  privilege: config.clearjukebox.privilege
},
{
  aliases: config.shuffle.aliases,
  help: config.shuffle.help,
  callback: async (info: tm.MessageInfo): Promise<void> => {
    tm.sendMessage(tm.utils.strVar(config.shuffle.text, { title: info.title, adminName: tm.utils.strip(info.nickname) }), config.shuffle.public ? undefined : info.login)
    tm.jukebox.shuffle(info)
  },
  privilege: config.shuffle.privilege
}]
tm.commands.add(...commands)