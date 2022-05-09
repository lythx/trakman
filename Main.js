'use strict'
require('dotenv').config()
const Client = require('./js/Client.js')
const logger = require('tracer').colorConsole()

async function main () {
  const client = new Client()
  logger.trace('Establishing connection with the server...')
  const connectionStatus = await client.connect(process.env.SERVER_IP, process.env.SERVER_PORT)
    .catch(err => {
      logger.fatal(err)
      logger.fatal('Aborting...')
      process.exit(1)
    })
  logger.info(connectionStatus)
  logger.trace('Authenticating...')
  const authenticationStatus = await client.call('Authenticate', [
    { string: process.env.SUPERADMIN_NAME },
    { string: process.env.SUPERADMIN_PASSWORD }
  ])
  if (authenticationStatus[0].faultCode) {
    logger.fatal('Authentication failed')
    logger.fatal(`error code: ${authenticationStatus[0].faultCode}, error: ${authenticationStatus[0].faultString}`)
    logger.fatal('Aborting...')
    process.exit(1)
  }
  logger.info('Authentication success')
  const enableCallbacks = await client.call('EnableCallbacks', [
    { boolean: true }
  ])
  if (enableCallbacks[0].faultCode || !enableCallbacks[0]) { logger.warn('Failed to enable callbacks') } else { logger.trace('Listening for callbacks...') }
  // process.exit(0);
}

main()

/* call with array of structs in params example
    const val = await client.call('SetCallVoteRatios', [
    {
      array:
        [{
            struct:
              { Command: { string: 'command1' }, Ratio: { double: 0.4 } }
          },
          {
            struct:
                { Command: { string: 'command2' }, Ratio: { double: 0.7 } }
        }]
    }
]) */
