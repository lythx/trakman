'use strict'
import {Client} from './Client.js'
import {Logger} from './Logger.js'
import {ChallengeService} from './services/ChallengeService.js'
import 'dotenv/config'
import {Listeners} from './Listeners.js'
import {DefaultCommands} from './plugins/DefaultCommands.js'
import {PlayerService} from './services/PlayerService.js'
import {ErrorHandler} from './ErrorHandler.js'

async function main () {
  Logger.warn('Establishing connection with the server...')
  const connectionStatus = await Client.connect(process.env.SERVER_IP, Number(process.env.SERVER_PORT))
    .catch(err => { ErrorHandler.fatal('Connection failed', err) })
  if(connectionStatus)
    Logger.info(connectionStatus)
  Logger.trace('Authenticating...')
  await Client.call('Authenticate', [
    { string: process.env.SUPERADMIN_NAME },
    { string: process.env.SUPERADMIN_PASSWORD }
  ]).catch(err => {
    ErrorHandler.fatal('Authentication failed', err)
  })

  Logger.info('Authentication success')
  await Listeners.initialize()
  const defaultCommands = new DefaultCommands()
  defaultCommands.initialize()
  Logger.trace('Enabling callbacks...')
  await Client.call('EnableCallbacks', [
    { boolean: true }
  ]).catch(err => { ErrorHandler.fatal('Failed to enable callbacks', err) })
  Logger.info('Callbacks enabled')
  Logger.trace('Fetching challenges...')
  await ChallengeService.initialize()
  Logger.info('Challenge service instantiated')
  await ChallengeService.push()
  Logger.info('Challenges are in the database')
  await PlayerService.initialize()
  await PlayerService.addAllFromList()
    .catch(err => ErrorHandler.error(err, '', 0))
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
