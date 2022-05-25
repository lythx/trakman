'use strict'
import { Client } from './Client.js'
import { Logger } from './Logger.js'
import { ChallengeService } from './services/ChallengeService.js'
import 'dotenv/config'
import { Listeners } from './Listeners.js'
import { PlayerService } from './services/PlayerService.js'
import { ErrorHandler } from './ErrorHandler.js'
import { ChatService } from './services/ChatService.js'
import './commands/InternalCommands.js'
import { DedimaniaService } from './services/DedimaniaService.js'
import '../Plugins.js'
import { GameService } from './services/GameService.js'
import { RecordService } from './services/RecordService.js'
import { Events } from './Events.js'

async function main (): Promise<void> {
  Logger.warn('Establishing connection with the server...')
  const connectionStatus = await Client.connect(process.env.SERVER_IP, Number(process.env.SERVER_PORT))
    .catch(err => { ErrorHandler.fatal('Connection failed', err) })
  if (connectionStatus != null) { Logger.info(connectionStatus) }
  Logger.trace('Authenticating...')
  const auth = await Client.call('Authenticate', [
    { string: process.env.SUPERADMIN_NAME },
    { string: process.env.SUPERADMIN_PASSWORD }
  ])
  if (auth instanceof Error) {
    ErrorHandler.fatal('Authentication failed', auth.message)
  }
  Logger.info('Authentication success')
  Logger.trace('Retrieving game info')
  await GameService.initialize()
  Logger.info('Game info fetched')
  Logger.trace('Enabling callbacks...')
  const cb = await Client.call('EnableCallbacks', [
    { boolean: true }
  ])
  if (cb instanceof Error) {
    ErrorHandler.fatal('Failed to enable callbacks', cb.message)
  }
  await RecordService.initialize()
  Logger.info('Callbacks enabled')
  Logger.trace('Fetching challenges...')
  await ChallengeService.initialize()
  await ChallengeService.push()
  Logger.info('Challenge service instantiated')
  Logger.trace('Fetching player info...')
  await PlayerService.initialize()
  await PlayerService.addAllFromList()
  Logger.info('Player service instantiated')
  Logger.trace('Fetching message history...')
  await ChatService.initialize()
  await ChatService.loadLastSessionMessages()
  Logger.info('Chat service instantiated')
  await Listeners.initialize()
  await RecordService.fetchRecords(ChallengeService.current.id)
  Events.initialize()
  if (process.env.USE_DEDIMANIA === 'YES') {
    Logger.trace('Connecting to dedimania...')
    await DedimaniaService.initialize()
    Logger.info('Connected to dedimania')
  }
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
