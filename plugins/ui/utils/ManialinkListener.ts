let listeners: { callback: ((info: tm.ManialinkClickInfo, actionIdOffset: number) => void), actionId: number, range?: number }[] = []

/**
 * Adds a callback function to execute on given Action ID.
 * @param actionId Manialink Action ID
 * @param callback Callback function, it takes ManialinkClickInfo as a parameter
 */
function addManialinkListener(actionId: number, callback: (info: tm.ManialinkClickInfo) => void): void
/**
 * Adds a callback function to execute on given Action ID range.
 * @param actionId Starting manialink Action ID
 * @param range Range of Action IDs (inludes starting Action ID)
 * @param callback Callback function, it takes ManialinkClickInfo and id offset as a parameter
 */
function addManialinkListener(actionId: number, range: number, callback: (info: tm.ManialinkClickInfo, actionIdOffset: number) => void): void
function addManialinkListener(actionId: number, rangeOrCallback: ((info: tm.ManialinkClickInfo) => void) | number,
  callback?: (info: tm.ManialinkClickInfo, actionIdOffset: number) => void): void {
  if (typeof rangeOrCallback === 'number') {
    if (rangeOrCallback < 1) { throw new Error('Manialink listener range must be > 0') }
    listeners.push({ actionId, range: rangeOrCallback, callback: callback as any })
  } else {
    listeners.push({ actionId, callback: rangeOrCallback })
  }
}

/**
 * Removes a manialink listener.
 * @param callback Reference to function to remove
 */
const removeManialinkListener = (callback: (info: tm.ManialinkClickInfo) => void) => {
  listeners = listeners.filter(a => callback !== a.callback)
}

tm.addListener('ManialinkClick', (info: tm.ManialinkClickInfo): void => {
  for (const e of listeners) {
    const range: number = e.range ?? 1
    if (info.actionId >= e.actionId && info.actionId < e.actionId + range) {
      e.callback(info, info.actionId - e.actionId)
    }
  }
})

export { addManialinkListener, removeManialinkListener }
