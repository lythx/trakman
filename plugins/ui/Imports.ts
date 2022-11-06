/*
-----------------
STATIC COMPONENTS
-----------------
*/

import RankWidget from './static_components/race/RankWidget.component.js'
import DediRanking from './static_components/race/DediRanking.component.js'
import MapWidget from './static_components/race/MapWidget.component.js'
import PreviousAndBest from './static_components/race/PreviousAndBest.component.js'
import KarmaWidget from './static_components/race/KarmaWidget.component.js'
import TimerWidget from './static_components/race/TimerWidget.component.js'
import LocalRanking from './static_components/race/LocalRanking.component.js'
import LiveRanking from './static_components/race/LiveRanking.component.js'
import ButtonsWidget from './static_components/race/buttons/ButtonsWidget.component.js'
import TMXRanking from './static_components/race/TMXRanking.component.js'
import AdminPanel from './static_components/race/AdminPanel.component.js'
import BestCps from './static_components/race/BestCps.component.js'
import BestFinishes from './static_components/race/BestFinishes.component.js'
import CpCounter from './static_components/race/CpCounter.component.js'
import MapWidgetResult from './static_components/result/MapWidgetResult.component.js'
import NextMapRecords from './static_components/result/NextMapRecords.component.js'
import TimerWidgetResult from './static_components/result/TimerWidgetResult.component.js'
import KarmaRanking from './static_components/result/KarmaRanking.component.js'
import VotersRanking from './static_components/result/VotersRanking.component.js'
import VisitorsRanking from './static_components/result/VisitorsRanking.component.js'
import PlaytimeRanking from './static_components/result/PlaytimeRanking.component.js'
import DonatorsRanking from './static_components/result/DonatorsRanking.component.js'
import AveragesRanking from './static_components/result/AveragesRanking.component.js'
import RankWidgetResult from './static_components/result/RankWidgetResult.component.js'
import KarmaWidgetResult from './static_components/result/KarmaWidgetResult.component.js'
import LocalRankingResult from './static_components/result/LocalRankingResult.component.js'
import DediRankingResult from './static_components/result/DediRankingResult.component.js'
import RoundAveragesRanking from './static_components/result/RoundAveragesRanking.component.js'
import AdminPanelResult from './static_components/result/AdminPanelResult.component.js'
import WinnersRanking from './static_components/result/WinnersRanking.component.js'
import MostRecordsRanking from './static_components/result/MostRecordsRanking.component.js'

/*
------------------
DYNAMIC COMPONENTS
------------------
*/

import CommandList from './dynamic_components/Commandlist.component.js'
import TMXWindow from './dynamic_components/MapInfoWindow.component.js'
import LocalCps from './dynamic_components/LocalCps.component.js'
import DediCps from './dynamic_components/DediCps.component.js'
import LiveCps from './dynamic_components/LiveSectors.component.js'
import DediSectors from './dynamic_components/DediSectors.component.js'
import LocalSectors from './dynamic_components/LocalSectors.component.js'
import LiveSectors from './dynamic_components/LiveCps.component.js'
import CurrentCps from './dynamic_components/CurrentCps.component.js'
import MapList from './dynamic_components/Maplist.component.js'
import DonationPanel from './static_components/race/DonationPanel.component.js'
import PlayerList from './dynamic_components/Playerlist.component.js'
import Banlist from './dynamic_components/Banlist.component.js'
import Blacklist from './dynamic_components/Blacklist.component.js'
import Guestlist from './dynamic_components/Guestlist.component.js'
import Mutelist from './dynamic_components/Mutelist.component.js'
import SectorRecords from './dynamic_components/SectorRecords.component.js'
import CheckpointRecords from './dynamic_components/CheckpointRecords.component.js'
import WelcomeWindow from './dynamic_components/WelcomeWindow.component.js'
import Changelog from './dynamic_components/Changelog.component.js'
import TopRanks from './dynamic_components/TopRanks.component.js'
import TopDonations from './dynamic_components/TopDonations.component.js'
import TopPlaytimes from './dynamic_components/TopPlaytimes.component.js'
import TopRecords from './dynamic_components/TopRecords.component.js'
import TopVisits from './dynamic_components/TopVisits.component.js'
import TopVotes from './dynamic_components/TopVotes.component.js'
import TopWins from './dynamic_components/TopWins.component.js'
import TopSums from './dynamic_components/TopSums.component.js'
import ChatLog from './dynamic_components/Chatlog.component.js'
import TMXSearchWindow from './dynamic_components/TMXSearchWindow.component.js'

tm.addListener(`Startup`, () => {
  new RankWidget()
  new DediRanking()
  new MapWidget()
  new PreviousAndBest()
  new KarmaWidget()
  new TimerWidget()
  new LocalRanking()
  new LiveRanking()
  new ButtonsWidget()
  new TMXRanking()
  new AdminPanel()
  new DonationPanel()
  new BestCps()
  new BestFinishes()
  new CpCounter()
  new NextMapRecords()
  new MapWidgetResult()
  new TimerWidgetResult()
  new KarmaRanking()
  new VotersRanking()
  new VisitorsRanking()
  new PlaytimeRanking()
  new DonatorsRanking()
  new AveragesRanking()
  new RankWidgetResult()
  new KarmaWidgetResult()
  new LocalRankingResult()
  new DediRankingResult()
  new RoundAveragesRanking()
  new AdminPanelResult()
  new WinnersRanking()
  new MostRecordsRanking()
  new MapList()
  new CommandList()
  new DediCps()
  new LiveCps()
  new LocalCps()
  new DediSectors()
  new LocalSectors()
  new LiveSectors()
  new CurrentCps()
  new PlayerList()
  new Banlist()
  new Blacklist()
  new Guestlist()
  new Mutelist()
  new SectorRecords()
  new CheckpointRecords()
  new WelcomeWindow()
  new Changelog()
  new TMXWindow()
  new TopRanks()
  new TopDonations()
  new TopPlaytimes()
  new TopRecords()
  new TopVisits()
  new TopVotes()
  new TopWins()
  new TopSums()
  new ChatLog()
  new TMXSearchWindow()
}, true)