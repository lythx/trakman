import { TRAKMAN as TM } from '../../src/Trakman.js'
import 'dotenv/config'

if (process.env.USE_DEDIMANIA === 'YES') {
  const commands: TMCommand[] = [
    {
      aliases: ['dedirecs'],
      help: 'rrwewwqer',
      callback: (info: MessageInfo) => {
        const dediRecs: TMDedi[] = TM.dediRecords
        let str = `${TM.palette.server}» ${TM.palette.dedimessage}Dedimania records on `
          + `${TM.palette.highlight + TM.strip(TM.challenge.name, true)}${TM.palette.highlight}: `
        for (const dr of dediRecs) {
          str += `${TM.strip(dr.nickName, false)}$z$s ${TM.palette.highlight + '- ' + TM.Utils.getTimeString(dr.score)}, `
        }
        TM.sendMessage(str.slice(0, -2), info.login)
      },
      privilege: 0
    }
  ]
  for (const command of commands) { TM.addCommand(command) }
}
