import { Client } from './client/Client.js'
import { Database } from './database/DB.js'
import { Logger } from './Logger.js'
import { MapService } from './services/MapService.js'
import { Listeners } from './Listeners.js'
import { PlayerService } from './services/PlayerService.js'
import { ChatService } from './services/ChatService.js'
import { GameService } from './services/GameService.js'
import { RecordService } from './services/RecordService.js'
import { Events } from './Events.js'
import { ServerConfig } from './ServerConfig.js'
import { AdministrationService } from './services/AdministrationService.js'
import { VoteService } from './services/VoteService.js'
import { RoundsService } from './services/RoundsService.js'
import { fixRankCoherence } from './FixRankCoherence.js'
import 'dotenv/config'
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import config from '../config/Config.js'
import './Trakman.js'

await Logger.initialize()
Logger.info('Starting the controller...')
Logger.trace('Establishing connection with the dedicated server...')
if (process.env.SERVER_IP === undefined) { await Logger.fatal('SERVER_IP is undefined. Check your .env file') }
if (process.env.SERVER_PORT === undefined) { await Logger.fatal('SERVER_PORT is undefined. Check your .env file') }
await Client.connect(process.env.SERVER_IP, Number(process.env.SERVER_PORT))
Logger.trace('Connection with the dedicated server established')
Logger.trace('Authenticating...')
if (process.env.SUPER_ADMIN_NAME === undefined) { await Logger.fatal('SUPER_ADMIN_NAME is undefined. Check your .env file') }
if (process.env.SUPER_ADMIN_PASSWORD === undefined) { await Logger.fatal('SUPER_ADMIN_PASSWORD is undefined. Check your .env file') }
const authenticationStatus: any | Error = await Client.call('Authenticate', [
  { string: process.env.SUPER_ADMIN_NAME },
  { string: process.env.SUPER_ADMIN_PASSWORD }
])
if (authenticationStatus instanceof Error) { await Logger.fatal('Authentication failed. Server responded with an error:', authenticationStatus.message) }
Logger.trace('Authentication success')
Logger.trace('Initializing database...')
Database.initialize()
Logger.trace('Database initialized...')
await fixRankCoherence()
Logger.trace('Retrieving game info...')
await GameService.initialize()
Logger.trace('Game info fetched')
// import plugins after initializing database to avoid process exiting with no error in case of query on inexistent table
await import('../Plugins.js')
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
Logger.trace('Fetching rounds mode settings...')
await RoundsService.initialize()
Logger.trace('Round settings fetched')
Logger.trace('Enabling callbacks...')
const cb: true | Error = await Listeners.initialize()
if (cb instanceof Error) {
  await Logger.fatal('Failed to enable callbacks', cb.message)
}
Logger.trace('Callbacks enabled')
await Events.initialize()
Logger.trace('Controller events enabled')
Logger.info('Controller started successfully')

let running = true
process.on('SIGINT', () => {
  running = false
  Logger.warn('Controller terminated, exiting...')
  process.exit(0)
})

let failedHealthChecks = 0

setInterval(async () => {
  Logger.debug('Checking if the dedicated server is alive...')
  let status = await Client.call('GetStatus')
  if (status instanceof Error) {
    failedHealthChecks++
    Logger.warn('Server did not respond to healthcheck')
  } else {
    Logger.debug('Connection to the dedicated server exists')
    failedHealthChecks = 0
    return
  }
  // Surely checking two times is enough
  if (failedHealthChecks > 1) {
    // We don't need to wait to restart here since the timeout is 10s anyway - plenty of time for serv to start
    await Logger.fatal(`Healthcheck failed - no connection to the server. Game state was: ${GameService.state}`)
  }
}, config.healthcheckInterval)

Logger.info('Press Enter to execute a command as the server (include slashes)')
const rl = readline.createInterface({ input, output })
while (running) {
  await rl.question("")
  Logger.disableConsole()
  const command = await rl.question("Run command as server: ")
  Logger.enableConsole()
  ChatService.serverCommand(command)
}
