import { topAverages } from './TopAverages.js'
import { topVisits } from './TopVisits.js'
import { topVotes } from './TopVotes.js'
import { topWins } from './TopWins.js'
import { topDonations } from './TopDonations.js'
import { topRecords } from './TopRecords.js'
import { topPlaytimes } from './TopPlaytimes.js'
import { topSums } from './TopSums.js'

export const stats = {
    votes: topVotes,
    wins: topWins,
    visits: topVisits,
    averages: topAverages,
    donations: topDonations,
    records: topRecords,
    playtimes: topPlaytimes,
    sums: topSums
}