/*
-----------------
STATIC COMPONENTS
-----------------
*/

import CustomUi from './CustomUi.js'
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

import icons from './config/Icons.js'
import { initialize as initalizeKeyListeners } from './utils/KeyListener.js'
import modConfig from './config/Mod.js'
import TestWindow from './test_widgets/TestWindow.js'
import StaticComponent from './StaticComponent.js'
import DynamicComponent from './DynamicComponent.js'

let customUi: CustomUi
const loadMod = (): void => {
  const mods: {
    struct: {
      Env: { string: string },
      Url: { string: string }
    }
  }[] = modConfig.map(a => ({
    struct: {
      Env: { string: a.environment },
      Url: { string: a.modUrl }
    }
  }))
  tm.client.callNoRes('SetForcedMods',
    [{
      boolean: true
    },
    {
      array: mods
    }])
}

const iconArr = Object.values(icons).map(a =>
  `<quad posn="500 500 0" sizen="10 10" image="${a}"/>`)

const preloadIcons = (login?: string): void => {
  tm.sendManialink(`
  <manialink id="preloadIcons">
    ${iconArr}
  </manialink>`, login)
}

const registeredStaticComponents: StaticComponent[] = []
const registeredDynamicComponents: DynamicComponent[] = []

let staticComponents: {
  readonly rankWidget: RankWidget
  readonly dediRanking: DediRanking
  readonly mapWidget: MapWidget
  readonly previousAndBest: PreviousAndBest
  readonly karmaWidget: KarmaWidget
  readonly timerWidget: TimerWidget
  readonly localRanking: LocalRanking
  readonly liveRanking: LiveRanking
  readonly buttonsWidget: ButtonsWidget
  readonly tmxRanking: TMXRanking
  readonly adminPanel: AdminPanel
  readonly donationPanel: DonationPanel
  readonly bestCps: BestCps
  readonly bestFinishes: BestFinishes
  readonly cpCounter: CpCounter
  readonly nextMapRecords: NextMapRecords
  readonly mapWidgetResult: MapWidgetResult
  readonly timerWidgetResult: TimerWidgetResult
  readonly karmaRanking: KarmaRanking
  readonly votersRanking: VotersRanking
  readonly visitorsRanking: VisitorsRanking
  readonly playtimeRanking: PlaytimeRanking
  readonly donatorsRanking: DonatorsRanking
  readonly averagesRanking: AveragesRanking
  readonly rankWidgetResult: RankWidgetResult
  readonly karmaWidgetResult: KarmaWidgetResult
  readonly localRankingResult: LocalRankingResult
  readonly dediRankingResult: DediRankingResult
  readonly roundAveragesRanking: RoundAveragesRanking
  readonly adminPanelResult: AdminPanelResult
  readonly winnersRanking: WinnersRanking
  readonly mostRecordsRanking: MostRecordsRanking
}

let dynamicComponents: {
  readonly mapList: MapList
  readonly commandList: CommandList
  readonly dediCps: DediCps
  readonly liveCps: LiveCps
  readonly localCps: LocalCps
  readonly dediSectors: DediSectors
  readonly localSectors: LocalSectors
  readonly liveSectors: LiveSectors
  readonly currentCps: CurrentCps
  readonly playerList: PlayerList
  readonly banlist: Banlist
  readonly blacklist: Blacklist
  readonly mutelist: Mutelist
  readonly guestlist: Guestlist
  readonly sectorRecords: SectorRecords
  readonly checkpointRecords: CheckpointRecords
  readonly welcomeWindow: WelcomeWindow
  readonly changelog: Changelog
  readonly TMXWindow: TMXWindow
  readonly topRanks: TopRanks
  readonly topDonations: TopDonations
  readonly topPlaytimes: TopPlaytimes
  readonly topRecords: TopRecords
  readonly topVisits: TopVisits
  readonly topVotes: TopVotes
  readonly topWins: TopWins
  readonly topSums: TopSums
}

const events: tm.Listener[] = [
  {
    event: 'Startup',
    callback: async (status: 'race' | 'result'): Promise<void> => {
      await tm.client.call('SendHideManialinkPage')
      preloadIcons()
      loadMod()
      initalizeKeyListeners()
      customUi = new CustomUi()
      customUi.display()
      staticComponents = {
        rankWidget: new RankWidget(),
        dediRanking: new DediRanking(),
        mapWidget: new MapWidget(),
        previousAndBest: new PreviousAndBest(),
        karmaWidget: new KarmaWidget(),
        timerWidget: new TimerWidget(),
        localRanking: new LocalRanking(),
        liveRanking: new LiveRanking(),
        buttonsWidget: new ButtonsWidget(),
        tmxRanking: new TMXRanking(),
        adminPanel: new AdminPanel(),
        donationPanel: new DonationPanel(),
        bestCps: new BestCps(),
        bestFinishes: new BestFinishes(),
        cpCounter: new CpCounter(),
        nextMapRecords: new NextMapRecords(),
        mapWidgetResult: new MapWidgetResult(),
        timerWidgetResult: new TimerWidgetResult(),
        karmaRanking: new KarmaRanking(),
        votersRanking: new VotersRanking(),
        visitorsRanking: new VisitorsRanking(),
        playtimeRanking: new PlaytimeRanking(),
        donatorsRanking: new DonatorsRanking(),
        averagesRanking: new AveragesRanking(),
        rankWidgetResult: new RankWidgetResult(),
        karmaWidgetResult: new KarmaWidgetResult(),
        localRankingResult: new LocalRankingResult(),
        dediRankingResult: new DediRankingResult(),
        roundAveragesRanking: new RoundAveragesRanking(),
        adminPanelResult: new AdminPanelResult(),
        winnersRanking: new WinnersRanking(),
        mostRecordsRanking: new MostRecordsRanking()
      }
      for (const c of Object.values(staticComponents)) {
        if (c.displayMode === status || c.displayMode === 'always') { c.display() }
      }
      dynamicComponents = {
        mapList: new MapList(),
        commandList: new CommandList(),
        dediCps: new DediCps(),
        liveCps: new LiveCps(),
        localCps: new LocalCps(),
        dediSectors: new DediSectors(),
        localSectors: new LocalSectors(),
        liveSectors: new LiveSectors(),
        currentCps: new CurrentCps(),
        playerList: new PlayerList(),
        banlist: new Banlist(),
        blacklist: new Blacklist(),
        guestlist: new Guestlist(),
        mutelist: new Mutelist(),
        sectorRecords: new SectorRecords(),
        checkpointRecords: new CheckpointRecords(),
        welcomeWindow: new WelcomeWindow(),
        changelog: new Changelog(),
        TMXWindow: new TMXWindow(),
        topRanks: new TopRanks(),
        topDonations: new TopDonations(),
        topPlaytimes: new TopPlaytimes(),
        topRecords: new TopRecords(),
        topVisits: new TopVisits(),
        topVotes: new TopVotes(),
        topWins: new TopWins(),
        topSums: new TopSums()
      }
      new TestWindow()
    }
  },
  {
    event: 'BeginMap',
    callback: async () => {
      loadMod()
    }
  },
  {
    event: 'PlayerJoin',
    callback: (info: tm.JoinInfo) => {
      preloadIcons(info.login)
    }
  }
]

for (const event of events) { tm.addListener(event.event, event.callback) }

const isStaticComponent = (component: any): component is StaticComponent =>
  component.display instanceof Function && component.hide instanceof Function

/**
 * Renders manialink UI.
 * @author lythx & Snake
 * @since 0.1
 */
export const ui = {

  /**
   * Registers the UI component.
   * @param component Static or dynamic UI component
   */
  registerComponent(component: StaticComponent | DynamicComponent): void {
    if (isStaticComponent(component)) {
      registeredStaticComponents.push(component)
    } else {
      registeredDynamicComponents.push(component)
    }
  },

  /** 
   * Finds a component based on given class name 
   * @param className Component class name
   */
  findComponent(className: string): StaticComponent | DynamicComponent | undefined {
    return this.componentList.find(a => a.constructor.name === className)
  },

  /** 
   * Finds a static component based on given class name 
   * @param className Component class name
   */
  findStaticComponent(className: string): StaticComponent | undefined {
    return this.staticComponentList.find(a => a.constructor.name === className)
  },

  /** 
   * Finds a daynamic component based on given class name 
   * @param className Component class name
   */
  findDynamicComponent(className: string): DynamicComponent | undefined {
    return this.dynamicComponentList.find(a => a.constructor.name === className)
  },

  /**
   * All currently registered componenets
   */
  get componentList(): (StaticComponent | DynamicComponent)[] {
    return [...Object.values(staticComponents), ...Object.values(dynamicComponents),
    ...registeredStaticComponents, ...registeredDynamicComponents]
  },

  /**
   * All currently registered static componenets
   */
  get staticComponentList(): StaticComponent[] {
    return [...Object.values(staticComponents), ...registeredStaticComponents]
  },

  /**
   * All currently registered dynamic componenets
   */
  get dynamicComponentList(): DynamicComponent[] {
    return [...Object.values(dynamicComponents), ...registeredDynamicComponents]
  }

}
