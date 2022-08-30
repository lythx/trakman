import utilIds from '../config/UtilIds.js'
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
<manialink id="${utilIds.F5}">
  <quad posn="0 0 0" sizen="0 0" actionkey="1" action="${utilIds.F5}"/>
</manialink>
<manialink id="${utilIds.F6}">
  <quad posn="0 0 0" sizen="0 0" actionkey="2" action="${utilIds.F6}"/>
</manialink>
<manialink id="${utilIds.F7}">
  <quad posn="0 0 0" sizen="0 0" actionkey="3" action="${utilIds.F7}"/>
</manialink>
</manialinks>`)
}

tm.addListener('Controller.PlayerJoin', (info) => {
  tm.sendManialink(`<manialinks>
  <manialink id="${utilIds.F5}">
    <quad posn="0 0 0" sizen="0 0" actionkey="1" action="${utilIds.F5}"/>
  </manialink>
  <manialink id="${utilIds.F6}">
    <quad posn="0 0 0" sizen="0 0" actionkey="2" action="${utilIds.F6}"/>
  </manialink>
  <manialink id="${utilIds.F7}">
    <quad posn="0 0 0" sizen="0 0" actionkey="3" action="${utilIds.F7}"/>
  </manialink>
  </manialinks>`, info.login)
})



tm.addListener('Controller.ManialinkClick', (info: ManialinkClickInfo) => {
  switch (info.answer) {
    case utilIds.F5:
      keyListeners.find(a => a.key === 'F5')?.callback(info)
      break
    case utilIds.F6:
      keyListeners.find(a => a.key === 'F6')?.callback(info)
      break
    case utilIds.F7:
      keyListeners.find(a => a.key === 'F7')?.callback(info)
  }
})