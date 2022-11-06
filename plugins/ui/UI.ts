/**
 * Renders default server UI and provides utilities for creating manialinks.
 * @author lythx & Snake & wiseraven
 * @since 0.1
 */

import icons from './config/Icons.js'
import { initialize as initalizeKeyListeners } from './utils/KeyListener.js'
import modConfig from './config/Mod.js'
import TestWindow from './test_widgets/TestWindow.js'
import StaticComponent from './utils/StaticComponent.js'
import DynamicComponent from './utils/DynamicComponent.js'
import './Imports.js'
import CustomUi from './CustomUi.js'
import Paginator from './utils/Paginator.js'
import { Grid, GridCellFunction, GridCellObject } from './utils/Grid.js'
import Navbar from './utils/Navbar.js'
import RecordList from './utils/RecordList.js'
import VoteWindow from './utils/VoteWindow.js'
import componentIds from './config/ComponentIds.js'
import { centeredText, horizontallyCenteredText, leftAlignedText, rightAlignedText } from './utils/TextUtils.js'
import { getCpTypes } from './utils/GetCpTypes.js'
import { closeButton } from './utils/CloseButton.js'
import { addKeyListener, removeKeyListener } from './utils/KeyListener.js'
import { List } from './utils/List.js'
import StaticHeader from './utils/StaticHeader.js'
import staticButton from './utils/StaticButton.js'
import { addManialinkListener, removeManialinkListener } from './utils/ManialinkListener.js'
import PopupWindow from './utils/PopupWindow.js'
import raceConfig from './config/RaceUi.js'
import resultConfig from './config/ResultUi.js'
import { fullScreenListener } from './utils/FullScreenListener.js'
import flagIcons from './config/FlagIcons.js'
import utilIds from './config/UtilIds.js'

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

const loadListeners: Function[] = []
const staticComponents: StaticComponent[] = []
const dynamicComponents: DynamicComponent[] = []
StaticComponent.onComponentCreated((component) => staticComponents.push(component))
DynamicComponent.onComponentCreated((component) => dynamicComponents.push(component))

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
      for (const c of Object.values(staticComponents)) {
        if (c.displayMode === status || c.displayMode === 'always') { c.display() }
      }
      new TestWindow()
      for (const e of loadListeners) { e() }
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
  PopupWindow, StaticComponent, DynamicComponent, 
  components, componentIds, icons, raceConfig, resultConfig, flagIcons, utilIds,
  addKeyListener, removeKeyListener, rightAlignedText, getCpTypes, closeButton, horizontallyCenteredText,
  staticButton, fullScreenListener, centeredText, addLoadListener,
  leftAlignedText, addManialinkListener, removeManialinkListener
}

