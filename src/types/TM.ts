import { TMServerInfo } from './TMServerInfo.js'
import { TMEvents } from './TMEvents.js'
import { TMGame } from './TMGame.js'
import { MessageInfo as TMMessageInfo } from './TMMessageInfo.js'
declare global {
  namespace tm {
    export interface Map {
      readonly id: string
      readonly name: string
      readonly fileName: string
      readonly author: string
      readonly environment: 'Stadium' | 'Island' | 'Desert' | 'Rally' | 'Bay' | 'Coast' | 'Snow'
      readonly mood: 'Sunrise' | 'Day' | 'Sunset' | 'Night'
      readonly bronzeTime: number
      readonly silverTime: number
      readonly goldTime: number
      readonly authorTime: number
      readonly copperPrice: number
      readonly isLapRace: boolean
      readonly addDate: Date
      isNadeo: boolean
      isClassic: boolean
      voteCount: number
      voteRatio: number
      lapsAmount?: number
      checkpointsAmount?: number
      leaderboardRating?: number
      awards?: number
    }
    export interface Player {
      readonly id: number
      readonly login: string
      readonly nickname: string
      readonly country: string
      readonly countryCode: string
      readonly region: string
      readonly timePlayed: number
      readonly joinTimestamp: number
      readonly currentCheckpoints: Checkpoint[]
      readonly visits: number
      readonly ip: string
      readonly isUnited: boolean
      readonly ladderPoints: number
      readonly ladderRank: number
      readonly lastOnline?: Date
      title: string
      wins: number
      privilege: number
      isSpectator: boolean
      rank?: number
      average: number
    }
    export interface OfflinePlayer {
      readonly login: string
      readonly nickname: string
      readonly country: string
      readonly countryCode: string
      readonly region: string
      readonly timePlayed: number
      readonly visits: number
      readonly isUnited: boolean
      readonly wins: number
      readonly privilege: number
      readonly lastOnline?: Date
      readonly rank?: number
      readonly average: number
    }
    export interface CallParams {
      string?: string
      int?: number,
      double?: number,
      boolean?: boolean,
      struct?: {
        [key: string]: CallParams
      },
      base64?: string,
      array?: CallParams[]
    }
    export interface Call {
      readonly method: string
      readonly params?: CallParams[]
      readonly expectsResponse?: boolean
    }
    export interface Command {
      readonly aliases: string[]
      readonly help?: string
      readonly params?: {
        readonly name: string,
        readonly type?: 'int' | 'double' | 'boolean' | 'time' | 'player' | 'offlinePlayer' | 'multiword',
        readonly validValues?: (string | number)[]
        readonly optional?: true
      }[]
      readonly callback: (info: MessageInfo & { aliasUsed: string }, ...params: any[]) => void
      readonly privilege: number
    }
    export interface BanlistEntry {
      readonly ip: string
      readonly login: string
      nickname: string | undefined
      date: Date
      callerLogin: string
      callerNickname: string
      reason: string | undefined
      expireDate: Date | undefined
    }
    export interface BlacklistEntry {
      readonly login: string
      nickname: string | undefined
      date: Date
      callerLogin: string
      callerNickname: string
      reason: string | undefined
      expireDate: Date | undefined
    }
    export interface MutelistEntry {
      readonly login: string
      nickname: string | undefined
      date: Date
      callerLogin: string
      callerNickname: string
      reason: string | undefined
      expireDate: Date | undefined
    }
    export interface GuestlistEntry {
      readonly login: string
      nickname: string | undefined
      date: Date
      callerLogin: string
      callerNickname: string
    }
    export interface Checkpoint {
      readonly index: number
      readonly time: number
      readonly lap: number
    }
    export interface Message {
      readonly login: string
      readonly nickname: string
      readonly text: string
      readonly date: Date
    }
    export interface Record {
      readonly map: string
      readonly login: string
      readonly time: number
      readonly date: Date
      readonly checkpoints: number[]
      nickname: string
    }
    export interface Vote {
      readonly mapId: string
      readonly login: string
      vote: -3 | -2 | -1 | 1 | 2 | 3
      date: Date
    }
    export interface TMXMap {
      readonly id: string
      readonly TMXId: number
      readonly name: string
      readonly authorId: number
      readonly author: string
      readonly uploadDate: Date
      readonly lastUpdateDate: Date
      readonly type: string
      readonly environment: string
      readonly mood: string
      readonly style: string
      readonly routes: string
      readonly length: string
      readonly difficulty: 'Beginner' | 'Intermediate' | 'Expert' | 'Lunatic'
      readonly leaderboardRating: number
      readonly game: string
      readonly comment: string
      readonly commentsAmount: number
      readonly awards: number
      readonly pageUrl: string
      readonly screenshotUrl: string
      readonly thumbnailUrl: string
      readonly downloadUrl: string
      readonly isClassic: boolean
      readonly isNadeo: boolean
      readonly replays: TMXReplay[]
    }
    export interface TMXReplay {
      readonly id: number
      readonly userId: number
      readonly name: string
      readonly time: number
      readonly recordDate: Date
      readonly mapDate: Date
      readonly approved: any
      readonly leaderboardScore: number
      readonly expires: any
      readonly lockspan: any
      readonly url: string
      login?: string
    }
    export type CurrentMap = Map & {
      readonly lapsAmount: number
      readonly checkpointsAmount: number
    }
    export type LocalRecord = Record & OfflinePlayer


    export type MessageInfo = TMMessageInfo
    export type Events = TMEvents
    export type ServerInfo = TMServerInfo
    export type Game = TMGame
  }
}