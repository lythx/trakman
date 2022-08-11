import UTILIDS from '../config/UtilIds.json' assert { type: 'json' }
import { trakman as tm } from '../../../src/Trakman.js'

let keyListeners: { callback: ((info: ManialinkClickInfo) => void), key: 'F5' | 'F6' | 'F7', importance: number, id: string }[] = []

export const addKeyListener = (key: 'F5' | 'F6' | 'F7', callback: (info: ManialinkClickInfo) => void, importance: number, id: string) => {
  keyListeners.unshift({ callback, key, importance, id })
}

export const removeKeyListener = (id: string) => {
  keyListeners = keyListeners.filter(a => a.id === id)
}

export const initialize = () => {
  tm.sendManialink(`<manialinks>
<manialink id="${UTILIDS.F5}">
  <quad posn="0 0 0" sizen="0 0" actionkey="1" action="${UTILIDS.F5}"/>
</manialink>
<manialink id="${UTILIDS.F6}">
  <quad posn="0 0 0" sizen="0 0" actionkey="2" action="${UTILIDS.F6}"/>
</manialink>
<manialink id="${UTILIDS.F7}">
  <quad posn="0 0 0" sizen="0 0" actionkey="3" action="${UTILIDS.F7}"/>
</manialink>
</manialinks>`)
}

tm.addListener('Controller.PlayerJoin', (info) => {
  tm.sendManialink(`<manialinks>
  <manialink id="${UTILIDS.F5}">
    <quad posn="0 0 0" sizen="0 0" actionkey="1" action="${UTILIDS.F5}"/>
  </manialink>
  <manialink id="${UTILIDS.F6}">
    <quad posn="0 0 0" sizen="0 0" actionkey="2" action="${UTILIDS.F6}"/>
  </manialink>
  <manialink id="${UTILIDS.F7}">
    <quad posn="0 0 0" sizen="0 0" actionkey="3" action="${UTILIDS.F7}"/>
  </manialink>
  </manialinks>`, info.login)
})



tm.addListener('Controller.ManialinkClick', (info: ManialinkClickInfo) => {
  switch (info.answer) {
    case UTILIDS.F5:
      keyListeners.find(a => a.key === 'F5')?.callback(info)
      break
    case UTILIDS.F6:
      keyListeners.find(a => a.key === 'F6')?.callback(info)
      break
    case UTILIDS.F7:
      keyListeners.find(a => a.key === 'F7')?.callback(info)
  }
})