import config from './Config.js'

/**
 * Skips the lengthy endscreen by forcing everyone into specmode
 * @author wiseraven
 * @since 1.3.3
 */

const specs: tm.Player[] = []

if (config.isEnabled) {
  tm.addListener(`BeginMap`, (): void => {
    for (const p of tm.players.list) {
      if (specs.find(a => a.login === p.login)) {
        continue
      }
      tm.client.callNoRes('system.multicall',
        [{
          method: 'ForceSpectator',
          params: [{ string: p.login }, { int: 2 }]
        },
        {
          method: 'ForceSpectator',
          params: [{ string: p.login }, { int: 0 }]
        }]
      )
    }
    specs.length = 0
  })
  tm.addListener(`EndMap`, async (): Promise<void> => {
    setTimeout(async (): Promise<void> => {
      if (tm.getState() !== 'result') {
        // Server not on the endscreen
        // Can happen if timeout value is too high
        // Or server endscreen time is too low
        return
      }
      for (const p of tm.players.list) {
        if (p.isSpectator || p.isPureSpectator) {
          specs.push(p)
          continue
        }
        tm.client.callNoRes('system.multicall',
          [{
            method: 'ForceSpectator',
            params: [{ string: p.login }, { int: 1 }]
          },
          {
            method: 'ForceSpectator',
            params: [{ string: p.login }, { int: 0 }]
          }]
        )
      }
    }, config.waitTime * 1000)
  })
}