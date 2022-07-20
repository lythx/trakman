import { TRAKMAN as TM } from '../../src/Trakman.js'

import CustomUi from './CustomUi.js'
//import DayTime from './static_components/DayTime.component.js'
import RankWidget from './static_components/RankWidget.component.js'
import DediRanking from './static_components/DediRanking.component.js'
import MapWidget from './static_components/MapWidget.component.js'
import PreviousAndBest from './static_components/PreviousAndBest.component.js'
import KarmaWidget from './static_components/KarmaWidget.component.js'
import TimerWidget from './static_components/TimerWidget.component.js'
import LocalRanking from './static_components/LocalRanking.component.js'
import LiveRanking from './static_components/LiveRanking.component.js'
import StaticComponent from './StaticComponent.js'
import ButtonsWidget from './static_components/ButtonsWidget.component.js'
import TMXRanking from './static_components/TMXRanking.component.js'
import AdminPanel from './static_components/AdminPanel.component.js'
import LiveCheckpoint from './static_components/LiveCheckpoint.component.js'
import BestCps from './static_components/BestCps.component.js'
import BestFinishes from './static_components/BestFinishes.component.js'

import DynamicComponent from './DynamicComponent.js'
import CommandList from './dynamic_components/CommandList.component.js'
//import TMXWindow from './dynamic_components/TMXWindow.component.js'
import LocalCps from './dynamic_components/LocalCps.component.js'
import DediCps from './dynamic_components/DediCps.component.js'
import LiveCps from './dynamic_components/LiveSectors.component.js'
import DediSectors from './dynamic_components/DediSectors.component.js'
import LocalSectors from './dynamic_components/LocalSectors.component.js'
import LiveSectors from './dynamic_components/LiveCps.component.js'
import CurrentCps from './dynamic_components/CurrentCps.component.js'
import MapList from './dynamic_components/MapList.component.js'
import DonationPanel from './static_components/DonationPanel.component.js'
import PlayerList from './dynamic_components/PlayerList.component.js'
import BanList from './dynamic_components/BanList.component.js'
import BlackListList from './dynamic_components/BlacklistList.component.js'
import TestWindow from './test_widgets/TestWindow.js'
import PopupWindow from './PopupWindow.js'
import GuestListList from './dynamic_components/GuestlistList.component.js'

let customUi: CustomUi
const loadMod = (): void => {
  TM.callNoRes('SetForcedMods',
    [{
      boolean: true
    },
    {
      array: [{
        struct: {
          Env: { string: 'Stadium' },
          Url: { string: 'https://cdn.discordapp.com/attachments/599381118633902080/979148807998697512/TrakmanDefault.zip' }
        }
      }]
    }])
}

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
  readonly banList: BanList
  readonly blacklistList: BlackListList
  readonly guestlistList: GuestListList
} 

const events: TMListener[] = [
  {
    event: 'Controller.Ready',
    callback: async (): Promise<void> => {
      await TM.call('SendHideManialinkPage')
      loadMod()
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
        bestFinishes: new BestFinishes()
      }
      for (const c of Object.values(staticComponents)) { await c.display() }
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
        banList: new BanList(),
        blacklistList: new BlackListList(),
        guestlistList: new GuestListList()
      }
      // const testWindow = new TestWindow()
      // setInterval(() => {
      //   testWindow.displayToPlayer('ciekma_czakwal')
      //   testWindow.displayToPlayer('creamsoda')
      //   testWindow.displayToPlayer('wiksonek10')
      // }, 1000)
    }
  },
  {
    event: 'Controller.PlayerJoin',
    callback: async (info: JoinInfo) => {
      customUi.displayToPlayer(info.login)
      // TODO: Fetch the connecting player info //its all in the passed object

      // TODO: Fetch player records on the current challenge
      // TODO: Display all the widgets for the new player
      // Preferably with an indicator if they have a record
    }
  },
  {
    event: 'Controller.PlayerLeave',
    callback: async (playerInfo: LeaveInfo) => {
      // TODO: Update the widgets to no more indicate the disconnectee's presence
      // That is, if they had any records

      // TODO: Update miscellaneous widgets:
      // Ranking, players/specs...
    }
  },
  {
    event: 'Controller.PlayerFinish',
    callback: async (info: FinishInfo) => {
      // TODO: Update cpcounter to indicate finish
    }
  },
  {
    event: 'Controller.PlayerInfoChanged',
    callback: async (info: InfoChangedInfo) => {
      // TODO: Remove cpcounter if player switched to specmode
      // PlayerInfo['SpectatorStatus'] % 10 !== 0

      // TODO: Update miscellaneous widgets:
      // Ranking, players/specs...
    }
  },
  {
    event: 'Controller.ManialinkClick',
    callback: async (info: ManialinkClickInfo) => {
      // This will basically handle every widget click
      // If I were to write every TODO I'd kill myself, so..
      // TODO: Everything about players <-> widgets interaction
    }
  },
  {
    event: 'Controller.DedimaniaRecords',
    callback: async (info: MapDedisInfo) => {
      // TODO: Fill in the Dedimania record widget
    }
  },
  {
    event: 'Controller.PlayerDediRecord', // Not a thing yet
    callback: async (params: any[]) => { // Should return TMRecord (TMDedi?)
      // TODO: Update the Dedimania widget
    }
  },
  {
    event: 'Controller.PlayerRecord',
    callback: async (info: RecordInfo) => {
      // for (const player of TM.players) {
      //     TM.callNoRes('SendDisplayManialinkPageToLogin', [{ string: player.login }, { string: UIRace.buildLocalRecordsWidget(player) }, { int: 0 }, { boolean: false }])
      // }
    }
  },
  {
    event: 'TrackMania.ChallengeListModified', // Need a Controller event for better handling 
    callback: async (params: any[]) => {
      // TODO: Re-fetch the next challenge info 
      // calling next challenge info should probably be done in challenge service tho
      // maybe we should always fetch next 5 maps and keep last 5 or somethign idk
      // TODO: Update miscellaneous widgets:
      // Trackcount...
    }
  },
  {
    event: 'Controller.PlayerCheckpoint',
    callback: async (info: CheckpointInfo) => {
      // TODO: Update cpcounter to indicate current cp
    }
  },
  {
    event: 'TrackMania.EndChallenge', // Need a Controller event for better handling
    callback: async (params: any[]) => {
      // Using a function instead of SendCloseManialinkPage because we only want to close stuff that belongs to this plugin

      // This can be improved after queue/jukebox, as we can get next challenge from there also
      // const info = await TM.call('GetNextChallengeInfo')
      // TM.callNoRes('SendDisplayManialinkPage', [{ string: UIScore.buildChallengeWidget(info) }, { int: 0 }, { boolean: false }])

      // TODO: Display all the podium/score widgets
    }
  },
  {
    event: 'Controller.BeginMap',
    callback: async (info: BeginMapInfo) => {
      customUi.display()
      loadMod()
      // Using a function instead of SendCloseManialinkPage because we only want to close stuff that belongs to this plugin
      // TM.callNoRes('SendDisplayManialinkPage', [{ string: UIGeneral.closeManialinks(false) }, { int: 0 }, { boolean: false }])
      // console.log(TM.challengeQueue)
      // console.log(TM.previousChallenges)
      // TODO: Fetch the next challenge info
      // Temporarily moved to EndChallenge
      // We'd need to store the nextchallenge in a variable
      // This is easier achievable with queue/jukebox

      // TODO: Display current challenge widget
      //TM.callNoRes('SendDisplayManialinkPage', [{ string: UIRace.buildChallengeWidget(info) }, { int: 0 }, { boolean: false }])

      // TODO: Display current challenge record widgets
      // for (const player of TM.players) {
      //     TM.callNoRes('SendDisplayManialinkPageToLogin', [{ string: player.login }, { string: UIRace.buildLocalRecordsWidget(player) }, { int: 0 }, { boolean: false }])
      // }

      // // testing only
      // TM.callNoRes('SendDisplayManialinkPage', [{ string: UIGeneral.buildTempWindows() }, { int: 0 }, { boolean: false }])

      // TODO: Display the miscellaneous widgets:
      // Clock, addfav, cpcounter, gamemode, visitors,
      // TMX info, trackcount, ranking, players/specs..
    }
  },
]

for (const event of events) { TM.addListener(event.event, event.callback) }

export const UI = {

  get staticComponents() {
    return staticComponents
  },

  get dynamicComponents() {
    return dynamicComponents
  }

}
