'use strict'
import client from './js/Client.js'
import Logger from './js/Logger.js'
import Error from './js/Error.js'
import 'dotenv/config'

async function main() {
  Logger.warn('Establishing connection with the server...')
  const connectionStatus = await client.connect(process.env.SERVER_IP, process.env.SERVER_PORT)
    .catch(err => { Error.fatal(err) })
  Logger.info(connectionStatus)
  Logger.trace('Authenticating...')
  const authenticationStatus = await client.call('Authenticate', [
    { string: process.env.SUPERADMIN_NAME },
    { string: process.env.SUPERADMIN_PASSWORD }
  ])
  if (authenticationStatus[0].faultCode) { Error.fatal('Authentication failed', authenticationStatus[0].faultString, authenticationStatus[0].faultCode) }
  Logger.info('Authentication success')
  Logger.trace('Enabling callbacks...')
  const enableCallbacks = await client.call('EnableCallbacks', [
    { boolean: true }
  ])
  if (enableCallbacks[0].faultCode) { Error.fatal('Failed to enable callbacks', enableCallbacks[0].faultString, enableCallbacks[0].faultCode) }
  Logger.info('Callbacks enabled')
  Logger.trace('Fetching challenges...')
  const challengeList = await client.call('GetChallengeList', [
    { int: 5000 }, { int: 0 }
  ])
  if (challengeList[0].faultCode) { Error.fatal('Unable to fetch challenge list', challengeList[0].faultString, challengeList[0].faultCode) }
  Logger.info('Challenges fetched')
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
