

let listeners: { callback: ((info: ManialinkClickInfo) => void), actionId: number, range?: number }[] = []

function addManialinkListener(actionId: number, callback: (info: ManialinkClickInfo) => void): void
function addManialinkListener(actionId: number, range: number, callback: (info: ManialinkClickInfo) => void): void
function addManialinkListener(actionId: number, rangeOrCallback: ((info: ManialinkClickInfo) => void) | number,
  callback?: (info: ManialinkClickInfo) => void): void {
  if (typeof rangeOrCallback === 'number') {
    if (rangeOrCallback < 1) { throw new Error('Manialink listener range must be > 0') }
    listeners.push({ actionId, range: rangeOrCallback, callback: callback as any })
  } else {
    listeners.push({ actionId, callback: rangeOrCallback, })
  }
}

const removeManialinkListener = (callback: (info: ManialinkClickInfo) => void) => {
  listeners = listeners.filter(a => callback !== a.callback)
}

tm.addListener('ManialinkClick', (info: ManialinkClickInfo) => {
  for (const e of listeners) {
    const range = e.range ?? 1
    if (info.actionId >= e.actionId && info.actionId < e.actionId + range) {
      e.callback(info)
    }
  }
})

export { addManialinkListener, removeManialinkListener }