'use strict'
import { Client } from './Client.js'
import { Logger } from './Logger.js'
import { ChallengeService } from './services/ChallengeService.js'
import 'dotenv/config'
import { Listeners } from './Listeners.js'
import { PlayerService } from './services/PlayerService.js'
import { ErrorHandler } from './ErrorHandler.js'
import { ChatService } from './services/ChatService.js'
import '../Plugins.js'
import { GameService } from './services/GameService.js'

async function main (): Promise<void> {
  Logger.warn('Establishing connection with the server...')
  const connectionStatus = await Client.connect(process.env.SERVER_IP, Number(process.env.SERVER_PORT))
    .catch(err => { ErrorHandler.fatal('Connection failed', err) })
  if (connectionStatus != null) { Logger.info(connectionStatus) }
  Logger.trace('Authenticating...')
  await Client.call('Authenticate', [
    { string: process.env.SUPERADMIN_NAME },
    { string: process.env.SUPERADMIN_PASSWORD }
  ]).catch(err => {
    ErrorHandler.fatal('Authentication failed', err)
  })

  Logger.info('Authentication success')
  Logger.trace('Retrieving game info')
  await GameService.initialize()
  Logger.info('Game info initialised')
  await Listeners.initialize()
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
    .catch(err => ErrorHandler.error(err, ''))
  Logger.info('Player service instantiated')
  Logger.trace('Fetching message history...')
  await ChatService.initialize()
  try {
    await ChatService.loadLastSessionMessages()
  } catch (e: any) {
    ErrorHandler.fatal('Failed to fetch messages', e.message.toString())
  }
  Logger.info('Chat service instantiated')

  //await Client.call('NextChallenge')
}

await main()

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
