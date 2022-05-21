```typescript
import { TRAKMAN as TM } from '../src/Trakman.ts'
TM.gameInfo() -> `Returns an object containing various information about game state`
TM.players -> `Returns an array of objects containing information about current server players`
TM.getPlayer() -> `Returns an object containing information about specified player or undefined if player is not on the server`
TM.fetchPlayer() -> `Searches the database for player information, returns object containing player info or undefined if player isnt in the database`
TM.localRecords -> `Returns an array of objects containing information about local records on current challenge`
TM.getPlayerRecord() -> `Returns an object containing information about specified player's record on current map or undefined if the player doesn't have a record`
TM.dediRecords  -> `TODO`
TM.getPlayerDedi() -> `TODO`
TM.challenge -> `Returns an object containing various information about current challenge`
TM.messages -> `Returns an array of objects containing information about recent messages`
TM.getPlayerMessages() -> `Returns an array of objects containing information about recent messages from a specified player`
TM.call() -> `Calls a dedicated server method. Throws error if the server responds with error, so you probably should catch it to avoid unnecessary crashes`
TM.multiCall() -> `Calls multiple dedicated server method using system.multicall. Throws error if the server responds with error, so you probably should catch it to avoid unnecessary crashes` 
Example: 
const c1: TMCall = { method: 'ForceSpectator', params: [{ string: info.login }, { int: 1 }] } 
const c2: TMCall = { method: 'ForceSpectator', params: [{ string: info.login }, { int: 0 }] }
const c3: TMCall = { method: 'ChatSendServerMessage', params: [{ string: `$g[${info.nickName}$z$s$g] Away from keyboard!` }] }
const res: CallResponse[] = await TM.multiCall(true, c1, c2, c3)

TM.sendMessage() -> `Sends a server message. If login is specified the message is sent only to login, otherwise it's sent to everyone`
TM.colours -> `Returns an object containing various colours as keys, and their 3-digit hexes as values. Useful for text colouring in plugins`
TM.addCommand() -> `Adds a chat command`
TM.addListener() -> `Adds callback function to execute on given event`
