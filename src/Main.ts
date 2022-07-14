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
  Logger.warn('Establishing connection with the server...')
  const connectionStatus: void | string = await Client.connect(process.env.SERVER_IP, Number(process.env.SERVER_PORT))
    .catch(err => { ErrorHandler.fatal('Connection failed', err) })
  if (connectionStatus != null) { Logger.info(connectionStatus) }
  Logger.trace('Authenticating...')
  const auth: any[] | Error = await Client.call('Authenticate', [
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
  const cb: any[] | Error = await Client.call('EnableCallbacks', [
    { boolean: true }
  ])
  if (cb instanceof Error) {
    ErrorHandler.fatal('Failed to enable callbacks', cb.message)
  }
  await RecordService.initialize()
  Logger.info('Callbacks enabled')
  Logger.trace('Fetching maps...')
  await MapService.initialize()
  Logger.info('Map service instantiated')
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
  await RecordService.fetchRecords(MapService.current.id)
  await ServerConfig.update()
  if (process.env.USE_TMX === 'YES') {
    Logger.trace('Initializing TMX service...')
    await TMXService.initialize()
    Logger.info('TMX service instantiated')
  }
  if (process.env.USE_DEDIMANIA === 'YES') {
    Logger.trace('Connecting to Dedimania...')
    const status: void | Error = await DedimaniaService.initialize()
    if (status instanceof Error) { ErrorHandler.error('Failed to initialize Dedimania service') }
    else { Logger.info('Connected to Dedimania') }
  }
  if (process.env.USE_MANIAKARMA === 'YES') {
    Logger.trace('Connecting to Maniakarma...')
    const status: void | Error = await ManiakarmaService.initialize()
    if (status instanceof Error) { ErrorHandler.error('Failed to initialize Maniakarma service') }
    else { Logger.info('Connected to Maniakarma') }
  }
  Events.initialize()
}

await main()
