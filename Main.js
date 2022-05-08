'use strict'
const Client = require("./js/Client.js")
const logger = require('tracer').colorConsole();

async function main() {
    let client = new Client();
    const connectionStatus = await client.connect("130.61.125.120", 5000);
    logger.info(connectionStatus)
    const a = await client.call('system.listMethods')
    const b = await client.call('Authenticate', [
        { value: 'SuperAdmin', type: 'string' },
        { value: 'oRxfBWw4vj', type: 'string' }
    ])
    const c = await client.call('GetNetworkStats')
    logger.info(a)
    logger.warn(b)
    logger.fatal(c)
}

main();