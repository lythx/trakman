'use strict'
import Client from './js/Client.js'
import Logger from './js/Logger.js'
import ChallengeService from './js/services/ChallengeService.js'
import 'dotenv/config'
import Listeners from './js/Listeners.js'
import DefaultCommands from './js/plugins/DefaultCommands.js'
import PlayerService from './js/services/PlayerService.js'
import ErrorHandler from './js/ErrorHandler.js'

async function main () {
  Logger.warn('Establishing connection with the server...')
  const connectionStatus = await Client.connect(process.env.SERVER_IP, process.env.SERVER_PORT)
    .catch(err => { ErrorHandler.fatal('Connection failed', err) })
  Logger.info(connectionStatus)
  Logger.trace('Authenticating...')
  await Client.call('Authenticate', [
    { string: process.env.SUPERADMIN_NAME },
    { string: process.env.SUPERADMIN_PASSWORD }
  ]).catch(err => {
    ErrorHandler.fatal('Authentication failed', err)
  })

  Logger.info('Authentication success')
  Listeners.initialize()
  const defaultCommands = new DefaultCommands()
  defaultCommands.initialize()
  Logger.trace('Enabling callbacks...')
  await Client.call('EnableCallbacks', [
    { boolean: true }
  ]).catch(err => { ErrorHandler.fatal('Failed to enable callbacks', err) })
  Logger.info('Callbacks enabled')
  Logger.trace('Fetching challenges...')
  const challengeService = new ChallengeService()
  await challengeService.initialize()
  Logger.info('Challenge service instantiated')
  await challengeService.push()
  Logger.info('Challenges are in the database')
  await PlayerService.addAllFromList()
    .catch(err => ErrorHandler.error(err))
  Logger.info('Player service instantiated')
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
