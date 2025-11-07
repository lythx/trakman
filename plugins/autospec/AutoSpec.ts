// omg it took a LOT of time to just write 23 lines of code
// plugin by soupcreamacy
// im the best tm player

import config from "./Config.js"

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

if (config.enabled == true) {
tm.addListener("PlayerFinish", async (info: tm.FinishInfo) => {
        await tm.client.call('system.multicall',
                [{
                  method: 'ForceSpectator',
                  params: [{ string: info.login }, { int: 1 }]
                }])
        await wait(config.interval * 1000)
        await tm.client.call('system.multicall',
                [{
                  method: 'ForceSpectator',
                  params: [{ string: info.login }, { int: 2 }]
                }])
})
}
