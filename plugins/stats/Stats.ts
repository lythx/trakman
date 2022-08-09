import { topAverages } from './TopAverages.js'
import { topVisits } from './TopVisits.js'
import { topVotes } from './TopVotes.js'
import { topWins } from './TopWins.js'
import { topDonations } from './TopDonations.js'

export const stats = {
    votes: topVotes,
    wins: topWins,
    visits: topVisits,
    averages: topAverages,
    donations: topDonations
}