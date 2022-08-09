import { topAverages } from './TopAverages.js'
import { topVisits } from './TopVisits.js'
import { topVotes } from './TopVotes.js'
import { topWins } from './TopWins.js'

export const stats = {
    votes: topVotes,
    wins: topWins,
    visits: topVisits,
    averages: topAverages
}