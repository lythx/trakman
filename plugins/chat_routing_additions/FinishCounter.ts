/**
 * Adds custom prefixes and postfixes to chat messages.
 * @author lythx
 * @since 1.3
 */

import config from './FinishCounter.config.js'
import { stats } from '../stats/Stats.js'

if (config.isEnabled) {
  tm.messages.addCustomPrefix(async (info): Promise<string> => {
    const amount = stats.records.onlineList.find(a => a.login === info.login)?.amount ?? 0
    const arr = ['[', ...amount.toString(), ']']
    for (let i = 0; i <= config.colours.length; i++) {
      if (config.colours[i] === undefined || config.colours[i].amount > amount) {
        const c = config.colours[i - 1]
        if (Array.isArray(c.colour)) {
          for (let j = 0; j < c.colour.length && j < arr.length; j += 2) {
            arr.splice(j, 0, c.colour[j])
          }
        } else {
          arr.splice(0, 0, c.colour)
        }
        break
      }
    }
    return arr.join('')
  }, -1)

}


