import { Client } from './client/Client.js'
import { Logger } from './Logger.js'
import { MapService } from './services/MapService.js'
import 'dotenv/config'
import { Listeners } from './Listeners.js'
import { PlayerService } from './services/PlayerService.js'
import { ChatService } from './services/ChatService.js'
import '../Plugins.js'
import { GameService } from './services/GameService.js'
import { RecordService } from './services/RecordService.js'
import { Events } from './Events.js'
import { ServerConfig } from './ServerConfig.js'
import { AdministrationService } from './services/AdministrationService.js'
import { VoteService } from './services/VoteService.js'
import { fixCoherence } from './FixRankCoherence.js'

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
  if (process.env.FIX_RANK_COHERENCE === "YES") {
    await fixCoherence()
  }
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
  Logger.trace('Enabling callbacks...')
  const cb: true | Error = await Listeners.initialize()
  if (cb instanceof Error) {
    Logger.fatal('Failed to enable callbacks', cb.message)
  }
  Logger.trace('Callbacks enabled')
  await Events.initialize()
  Logger.trace('Controller events enabled')
  Logger.info('Controller started successfully')
}

void main()
