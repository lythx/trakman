'use strict'

interface TMPlayer {
  readonly login: string
  readonly nickName: string
  readonly nation: string
  readonly nationCode: string
  readonly timePlayed: number
  readonly joinTimestamp: number
  readonly checkpoints: TMCheckpoint[]
  readonly visits: number
  wins: number
  privilege: number
}
