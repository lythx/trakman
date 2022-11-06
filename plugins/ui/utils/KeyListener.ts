import utilIds from '../config/UtilIds.js'

let keyListeners: { callback: ((info: tm.ManialinkClickInfo) => void), key: 'F5' | 'F6' | 'F7', importance: number }[] = []

/**
 * Registers a callback function to execute on given key press.
 * @param key Key to register listener on
 * @param callback Function to execute on key press, it takes ManialinkClickInfo as a parameter
 * @param importance Importance index - only the function with highest importance index will get executed
 */
export const addKeyListener = (key: 'F5' | 'F6' | 'F7', callback: (info: tm.ManialinkClickInfo) => void, importance: number) => {
  keyListeners.unshift({ callback, key, importance })
}

/**
 * Removes a key listener.
 * @param callback Reference to function to remove
 */
export const removeKeyListener = (callback: (info: tm.ManialinkClickInfo) => void) => {
  keyListeners = keyListeners.filter(a => callback !== a.callback)
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

tm.addListener('PlayerJoin', (info) => {
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

tm.addListener('ManialinkClick', (info: tm.ManialinkClickInfo) => {
  switch (info.actionId) {
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