'use strict'
import Client from './js/Client.js'
import Logger from './js/Logger.js'
import Error from './js/Error.js'
import ChallengeService from './js/services/ChallengeService.js'
import 'dotenv/config'
import Listeners from './js/Listeners.js'

async function main() {
  Logger.warn('Establishing connection with the server...')
  const connectionStatus = await Client.connect(process.env.SERVER_IP, process.env.SERVER_PORT)
    .catch(err => { Error.fatal(err) })
  Logger.info(connectionStatus)
  Logger.trace('Authenticating...')
  const authenticationStatus = await Client.call('Authenticate', [
    { string: process.env.SUPERADMIN_NAME },
    { string: process.env.SUPERADMIN_PASSWORD }
  ])
  if (authenticationStatus[0].faultCode) { Error.fatal('Authentication failed', authenticationStatus[0].faultString, authenticationStatus[0].faultCode) }
  Logger.info('Authentication success')
  Listeners.initialize()
  Logger.trace('Enabling callbacks...')
  const enableCallbacks = await Client.call('EnableCallbacks', [
    { boolean: true }
  ])
  if (enableCallbacks[0].faultCode) { Error.fatal('Failed to enable callbacks', enableCallbacks[0].faultString, enableCallbacks[0].faultCode) }
  Logger.info('Callbacks enabled')
  Logger.trace('Fetching challenges...')
  const challengeService = await new ChallengeService()
  await challengeService.push()
  Logger.info('Challenges fetched and added to database')
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
