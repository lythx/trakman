'use strict'
const Client = require("./js/Client.js")
const logger = require('tracer').colorConsole();
require('dotenv').config();

async function main() {
    let client = new Client();
    const connectionStatus = await client.connect(process.env.SERVER_IP, process.env.SERVER_PORT);
    logger.info(connectionStatus)
    const a = await client.call('system.listMethods')
    const b = await client.call('Authenticate', [
        { value: process.env.SUPERADMIN_NAME, type: 'string' },
        { value: process.env.SUPERADMIN_PASSWORD, type: 'string' }
    ])
    const c = await client.call('GetNetworkStats')
    logger.info(a)
    logger.warn(b)
    logger.fatal(c)
}

main();