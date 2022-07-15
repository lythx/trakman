import { Client } from './client/Client.js'
import { Logger } from './Logger.js'
import { MapService } from './services/MapService.js'
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
import { ManiakarmaService } from './services/ManiakarmaService.js'

async function main(): Promise<void> {
  await Logger.initialize()
  Logger.info('Starting the controller...')
  Logger.trace('Establishing connection with the dedicated server...')
  await Client.connect(process.env.SERVER_IP, Number(process.env.SERVER_PORT))
  Logger.trace('Connection with the dedicated server established')
  Logger.trace('Authenticating...')
  if (process.env.SUPERADMIN_NAME === undefined) { await Logger.fatal('SUPERADMIN_NAME is undefined. Check your .env file') }
  if (process.env.SUPERADMIN_PASSWORD === undefined) { await Logger.fatal('SUPERADMIN_PASSWORD is undefined. Check your .env file') }
  const authenticationStatus: any[] | Error = await Client.call('Authenticate', [
    { string: process.env.SUPERADMIN_NAME },
    { string: process.env.SUPERADMIN_PASSWORD }
  ])
  if (authenticationStatus instanceof Error) { await Logger.fatal('Authentication failed. Server responded with an error:', authenticationStatus.message) }
  Logger.trace('Authentication success')
  Logger.trace('Retrieving game info...')
  await GameService.initialize()
  Logger.trace('Game info fetched')
  Logger.trace('Fetching player info...')
  await PlayerService.initialize()
  Logger.trace('Player service instantiated')
  Logger.trace('Fetching administration lists...')
  await AdministrationService.initialize()
  Logger.trace('Administration service instantiated')
  Logger.trace('Fetching maps...')
  await MapService.initialize()
  Logger.trace('Map service instantiated')
  JukeboxService.initialize()
  Logger.trace('Jukebox service instantiated')
  Logger.trace('Fetching records...')
  await RecordService.initialize()
  Logger.trace('Records fetched')
  Logger.trace('Fetching votes...')
  await VoteService.initialize()
  Logger.trace('Vote service instantiated')
  Logger.trace('Fetching chat history...')
  await ChatService.initialize()
  Logger.trace('Chat service instantiated')
  Logger.trace('Loading server config...')
  await ServerConfig.initialize()
  Logger.trace('Server config loaded')
  if (process.env.USE_TMX === 'YES') {
    Logger.trace('Initializing TMX service...')
    await TMXService.initialize()
    Logger.trace('TMX service instantiated')
  }
  if (process.env.USE_DEDIMANIA === 'YES') {
    Logger.trace('Connecting to Dedimania...')
    const status: void | Error = await DedimaniaService.initialize()
    if (status instanceof Error) { ErrorHandler.error('Failed to initialize Dedimania service') }
    else { Logger.trace('Connected to Dedimania') }
  }
  if (process.env.USE_MANIAKARMA === 'YES') {
    Logger.trace('Connecting to Maniakarma...')
    const status: void | Error = await ManiakarmaService.initialize()
    if (status instanceof Error) { ErrorHandler.error('Failed to initialize Maniakarma service') }
    else { Logger.trace('Connected to Maniakarma') }
  }
  Logger.trace('Enabling callbacks...')
  const cb = await Listeners.initialize()
  if (cb instanceof Error) {
    Logger.fatal('Failed to enable callbacks', cb.message)
  }
  Logger.trace('Callbacks enabled')
  Events.initialize()
  Logger.trace('Controller events enabled')
  Logger.info('Controller started successfully')
}

void main()
