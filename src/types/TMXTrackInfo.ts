'use strict'

interface TMXTrackInfo {
    readonly id: number
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
    readonly difficulty: string
    readonly leaderboardRating: number
    readonly game: string
    readonly awards: number
    readonly comments: TMXComment[]
    readonly screenshot: string
    readonly pageUrl: string
    readonly replays: TMXReplay[]
    readonly screenshotUrl: string,
    readonly thumbnailUrl: string
}