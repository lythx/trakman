/**
 * Renders server UI and provides utilities for creating manialinks.
 * @author lythx & Snake & wiseraven
 * @since 0.1
 */

import icons from './config/Icons.js'
import { initialize as initalizeKeyListeners } from './utils/KeyListener.js'
import modConfig from './config/Mod.js'
import TestWindow from './test_widgets/TestWindow.js'
import StaticComponent from './utils/StaticComponent.js'
import DynamicComponent from './utils/DynamicComponent.js'
import CustomUi from './CustomUi.js'
import Paginator from './utils/Paginator.js'
import { Grid, GridCellFunction, GridCellObject } from './utils/Grid.js'
import Navbar from './utils/Navbar.js'
import RecordList, { RLImage, RLRecord } from './utils/RecordList.js'
import VoteWindow from './utils/VoteWindow.js'
import componentIds from './config/ComponentIds.js'
import { centeredText, horizontallyCenteredText, leftAlignedText, rightAlignedText } from './utils/TextUtils.js'
import { getCpTypes } from './utils/GetCpTypes.js'
import { closeButton } from './utils/CloseButton.js'
import { addKeyListener, removeKeyListener } from './utils/KeyListener.js'
import { List } from './utils/List.js'
import StaticHeader, { StaticHeaderOptions } from './utils/StaticHeader.js'
import staticButton from './utils/StaticButton.js'
import { addManialinkListener, removeManialinkListener } from './utils/ManialinkListener.js'
import PopupWindow from './utils/PopupWindow.js'
import raceConfig from './config/RaceUi.js'
import resultConfig from './config/ResultUi.js'
import { fullScreenListener } from './utils/FullScreenListener.js'
import flagIcons from './config/FlagIcons.js'
import utilIds from './config/UtilIds.js'
import Buttons from './Buttons.js'

let customUi: CustomUi

let currentModIndex = { 'Stadium': 0, 'Desert': 0, 'Snow': 0, 'Bay': 0, 'Coast': 0, 'Island': 0, 'Rally': 0 }

const loadMod = (): void => {
  let mods: { struct: { Env: { string: string }, Url: { string: string } } }[] = []
  for (const obj of modConfig) {
    if (obj.modLinks.length === 0) { continue }
    mods.push({
      struct: {
        Env: { string: (tm.utils.environmentToNadeoEnvironment(obj.environment as tm.Environment) as string) },
        Url: {
          string: obj.randomOrder
            ? tm.utils.fixProtocol(obj.modLinks[~~(Math.random() * obj.modLinks.length)])
            : tm.utils.fixProtocol(obj.modLinks[currentModIndex[obj.environment as keyof typeof currentModIndex] % obj.modLinks.length])
        }
      }
    })
  }
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

const loadListeners: Function[] = []
const staticComponents: StaticComponent[] = []
const dynamicComponents: DynamicComponent[] = []
StaticComponent.onComponentCreated((component) => staticComponents.push(component))
DynamicComponent.onComponentCreated((component) => dynamicComponents.push(component))
// Static UI needs to update on the next map if the gamemode changes
let staticUpdateNeeded = false
tm.client.addProxy(['SetGameMode'], () => {
  staticUpdateNeeded = true
})
const events: tm.Listener[] = [
  {
    event: 'Startup',
    callback: async (): Promise<void> => {
      await tm.client.call('SendHideManialinkPage')
      preloadIcons()
      loadMod()
      initalizeKeyListeners()
      customUi = new CustomUi()
      customUi.display()
      StaticComponent.refreshStaticLayouts()
      for (const c of Object.values(staticComponents)) {
        c.updateIsDisplayed()
        c.updatePosition()
        const ret = c.display()
        StaticComponent.sendMultipleManialinks(ret)
      }
      StaticComponent.refreshStaticLayouts()
      new Buttons()
      new TestWindow()
      for (const e of loadListeners) { e() }
      StaticComponent.onComponentCreated(() => {
        StaticComponent.refreshStaticLayouts()
      })
    }
  },
  {
    event: 'BeginMap',
    callback: async (): Promise<void> => {
      if (staticUpdateNeeded) {
        staticUpdateNeeded = false
        for (const e of staticComponents) { e.updatePosition() }
      }
    }
  },
  {
    event: 'EndMap',
    callback: async (): Promise<void> => {
      currentModIndex[tm.maps.current.environment]++
      loadMod()
    }
  },
  {
    event: 'PlayerJoin',
    callback: (info: tm.JoinInfo): void => {
      preloadIcons(info.login)
    }
  }
]

for (const event of events) { tm.addListener(event.event, event.callback, true) }

/**
 * Manialink UI components.
 * @author lythx & Snake & wiseraven
 * @since 0.1
 */
const components = {

  /** 
   * Finds a static component based on given class name 
   * @param className Component class name
   */
  findStatic(className: string): StaticComponent | undefined {
    return staticComponents.find(a => a.constructor.name === className)
  },

  /** 
   * Finds a dynamic component based on given class name 
   * @param className Component class name
   */
  findDynamic(className: string): DynamicComponent | undefined {
    return dynamicComponents.find(a => a.constructor.name === className)
  },

  /**
   * All currently registered static componenets
   */
  get staticList(): StaticComponent[] {
    return [...staticComponents]
  },

  /**
   * All currently registered dynamic componenets
   */
  get dynamicList(): DynamicComponent[] {
    return [...dynamicComponents]
  },

  /**
   * Heights of static components used for static UI positioning
   */
  get staticHeights(): typeof StaticComponent['components'] {
    return StaticComponent.components
  }

}

/**
* Register a callback function to execute on UI load
* @param callback Function to execute on event
*/
const addLoadListener = (callback: Function): void => {
  loadListeners.push(callback)
}

export {
  Paginator, Grid, Navbar, VoteWindow, RecordList, GridCellFunction, GridCellObject, List, StaticHeader,
  PopupWindow, StaticComponent, DynamicComponent, StaticHeaderOptions, RLImage, RLRecord,
  components, componentIds, icons, raceConfig, resultConfig, flagIcons, utilIds,
  addKeyListener, removeKeyListener, rightAlignedText, getCpTypes, closeButton, horizontallyCenteredText,
  staticButton, fullScreenListener, centeredText, addLoadListener,
  leftAlignedText, addManialinkListener, removeManialinkListener,
}

// Has to be like that due to circular dependencies
import './Imports.js'
