import { TMPlayer } from './TMPlayer.js'
import { TMCallParams } from './TMCallParams.js'
import { TMServerInfo } from './TMServerInfo.js'
import { TMBanlistEntry } from './TMBanlistEntry.js'
import { TMBlacklistEntry } from './TMBlacklistEntry.js'
import { TMCall } from './TMCall.js'
import { TMCheckpoint } from './TMCheckpoint.js'
import { TMCommand } from './TMCommand.js'
import { TMCurrentMap } from './TMCurrentMap.js'
import { TMGame } from './TMGame.js'
import { TMGuestlistEntry } from './TMGuestlistEntry.js'
import { TMLocalRecord } from './TMLocalRecord.js'
import { TMMap } from './TMMap.js'
import { TMMessage } from './TMMessage.js'
import { TMMutelistEntry } from './TMMutelistEntry.js'
import { TMOfflinePlayer } from './TMOfflinePlayer.js'
import { TMRecord } from './TMRecord.js'
import { TMVote } from './TMVote.js'
import { TMXMapInfo } from './TMXMapInfo.js'
import { TMXReplay as TMTMXReplay } from './TMXReplay.js'
import { TMEvents } from './TMEvents.js'
import { MessageInfo as TMMessageInfo } from './TMMessageInfo.js'
declare global {
  namespace TM {
    export type Player = TMPlayer
    export type CallParams = TMCallParams
    export type ServerInfo = TMServerInfo
    export type BanlistEntry = TMBanlistEntry
    export type BlacklistEntry = TMBlacklistEntry
    export type Call = TMCall
    export type Checkpoint = TMCheckpoint
    export type Command = TMCommand
    export type CurrentMap = TMCurrentMap
    export type Game = TMGame
    export type GuestlistEntry = TMGuestlistEntry
    export type LocalRecord = TMLocalRecord
    export type Map = TMMap
    export type Message = TMMessage
    export type MutelistEntry = TMMutelistEntry
    export type OfflinePlayer = TMOfflinePlayer
    export type Record = TMRecord
    export type Vote = TMVote
    export type TMXMap = TMXMapInfo
    export type TMXReplay = TMTMXReplay
    export type Events = TMEvents
    export type MessageInfo = TMMessageInfo
  }
}
