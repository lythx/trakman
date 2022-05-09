'use strict'
const Client = require('./js/Client.js')
const logger = require('tracer').colorConsole()
const Error = require('./js/Error')
require('dotenv').config()

async function main () {
  const client = new Client()
  logger.trace('Establishing connection with the server...')
  const connectionStatus = await client.connect(process.env.SERVER_IP, process.env.SERVER_PORT)
    .catch(err => { Error.fatal(err) })
  logger.info(connectionStatus)
  logger.trace('Authenticating...')
  const authenticationStatus = await client.call('Authenticate', [
    { string: process.env.SUPERADMIN_NAME },
    { string: process.env.SUPERADMIN_PASSWORD }
  ])
  if (authenticationStatus[0].faultCode) { Error.fatal('Authentication failed', authenticationStatus[0].faultString, authenticationStatus[0].faultCode) }
  logger.info('Authentication success')
  logger.trace('Enabling callbacks...')
  const enableCallbacks = await client.call('EnableCallbacks', [
    { boolean: true }
  ])
  if (enableCallbacks[0].faultCode) { Error.fatal('Failed to enable callbacks', enableCallbacks[0].faultString, enableCallbacks[0].faultCode) }
  logger.info('Callbacks enabled')
  logger.trace('Fetching challenges...')
  const challengeList = await client.call('GetChallengeList', [
    { int: 5000 }, { int: 0 }
  ])
  if (challengeList[0].faultCode) { Error.fatal('Unable to fetch challenge list', challengeList[0].faultString, challengeList[0].faultCode) }
  logger.info('Challenges fetched')
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
