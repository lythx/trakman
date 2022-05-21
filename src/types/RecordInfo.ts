'use strict'

interface RecordInfo {
  readonly challenge: string
  readonly login: string
  readonly score: number
  readonly date: Date
  readonly checkpoints: number[]
  readonly status: string
  readonly nickName: string
  readonly nation: string
  readonly nationCode: string
  readonly timePlayed: number
  readonly joinTimestamp: number
  readonly wins: number
  readonly privilege: number
  readonly visits: number
  readonly position: number
}
