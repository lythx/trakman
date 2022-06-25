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
import { ServerConfig } from './ServerConfig.js'
import { TMXService } from './services/TMXService.js'
import { JukeboxService } from './services/JukeboxService.js'
import { AdministrationService } from './services/AdministrationService.js'
import { VoteService } from './services/VoteService.js'

async function main(): Promise<void> {
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
  Logger.trace('Fetching administration lists...')
  await AdministrationService.initialize()
  Logger.info('Administration service instantiated')
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
  Logger.info('Challenge service instantiated')
  JukeboxService.initialize()
  Logger.trace('Fetching votes...')
  await VoteService.initialize()
  Logger.info('Vote service instantiated')
  Logger.trace('Fetching player info...')
  await PlayerService.initialize()
  await PlayerService.addAllFromList()
  Logger.info('Player service instantiated')
  Logger.trace('Fetching message history...')
  await ChatService.initialize()
  await ChatService.loadLastSessionMessages()
  Logger.info('Chat service instantiated')
  Listeners.initialize()
  await RecordService.fetchRecords(ChallengeService.current.id)
  await ServerConfig.update()
  if (process.env.USE_TMX === 'YES') {
    Logger.trace('Initializing TMX service...')
    await TMXService.initialize()
    Logger.info('TMX service instantiated')
  }
  if (process.env.USE_DEDIMANIA === 'YES') {
    Logger.trace('Connecting to dedimania...')
    const status = await DedimaniaService.initialize()
    if (status instanceof Error) { ErrorHandler.error('Failed to initialize dedimania service') }
    else { Logger.info('Connected to dedimania') }
  }
  Events.initialize()
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
