import TopDonations from "./TopDonations.component.js";
import TopPlaytimes from './TopPlaytimes.component.js'
import TopRanks from './TopRanks.component.js'
import TopRecords from './TopRecords.component.js'
import TopSums from './TopSums.component.js'
import TopVisits from './TopVisits.component.js'
import TopVotes from './TopVotes.component.js'
import TopWins from './TopWins.component.js'

tm.addListener('Startup', ()=> {
  new TopDonations()
  new TopPlaytimes()
  new TopRanks()
  new TopRecords()
  new TopSums()
  new TopVisits()
  new TopVotes()
  new TopWins()
})