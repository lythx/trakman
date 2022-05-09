'use strict'
const Client = require('./js/Client.js')
const logger = require('tracer').colorConsole()
require('dotenv').config()

async function main () {
  const client = new Client()
  const connectionStatus = await client.connect(process.env.SERVER_IP, process.env.SERVER_PORT)
    .catch(err => {
      logger.fatal(err)
      process.exit(1)
    })
  logger.info(connectionStatus)
  const a = await client.call('system.listMethods')
  const b = await client.call('Authenticate', [
    { value: process.env.SUPERADMIN_NAME, type: 'string' },
    { value: process.env.SUPERADMIN_PASSWORD, type: 'string' }
  ])
  const c = await client.call('GetNetworkStats')
  logger.info(a)
  logger.warn(b)
  logger.fatal(JSON.stringify(c))
  process.exit(0)
}

main()
