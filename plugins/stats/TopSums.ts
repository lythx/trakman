import config from './Config.js'

let topList: { readonly login: string, nickname: string, sums: [number, number, number, number] }[] = []
const updateListeners: ((changes: readonly Readonly<{
  login: string, nickname: string,
  sums: [number, number, number, number]
}>[]) => void)[] = []
const nicknameChangeListeners: ((changes: readonly Readonly<{ login: string, nickname: string }>[]) => void)[] = []
let initialLocals: tm.LocalRecord[] = []
let refreshNeeded = false

const initialize = async () => {
  refreshNeeded = false
  const res: { uid: string, login: string, nickname: string }[] | Error =
    await tm.db.query(`SELECT uid, login, nickname FROM records
  JOIN map_ids ON map_ids.id=records.map_id
  JOIN players ON players.id=records.player_id
  ORDER BY uid ASC,
  time ASC,
  date ASC;`)
  if (res instanceof Error) {
    await tm.log.fatal(`Failed to fetch topsums`, res.message)
    return
  }
  const presentMaps = tm.maps.list.map(a => a.id)
  if (res.length === 0) { return }
  let rank = 1
  let prevMap = res[0].uid
  let curMap = res[0].uid
  let mapPresent = true
  for (let i = 0; i < res.length; i++) {
    if (curMap !== prevMap) {
      rank = 1
      mapPresent = true
      if (!presentMaps.includes(res[i].uid)) {
        mapPresent = false
        continue
      }
    }
    if (!mapPresent) { continue }
    const find = topList.find(a => a.login === res[i].login)
    if (find !== undefined) {
      if (rank <= 3) {
        find.sums[rank - 1]++
      } else {
        find.sums[3]++
      }
    } else {
      const arr: [number, number, number, number] = [0, 0, 0, 0]
      if (rank <= 3) {
        arr[rank - 1]++
      } else {
        arr[3]++
      }
      topList.push({
        login: res[i].login,
        nickname: res[i].nickname,
        sums: arr
      })
    }
    rank++
    prevMap = res[i].uid
    curMap = res[i + 1]?.uid
  }
  sortToplist()
  topList.length = Math.min(config.sumsCount, topList.length)
  for (const e of updateListeners) { e(topList) }
  for (const e of nicknameChangeListeners) { e(topList) }
}

tm.addListener('Startup', (): void => {
  initialLocals = tm.records.local
  void initialize()
})

tm.addListener('BeginMap', (): void => {
  initialLocals = tm.records.local
  if (refreshNeeded) { void initialize() }
})

tm.addListener('PlayerDataUpdated', (info) => {
  const changedObjects: { login: string, nickname: string }[] = []
  for (const e of topList) {
    const newNickname = info.find(a => a.login === e.login)?.nickname
    if (newNickname !== undefined) {
      e.nickname = newNickname
      changedObjects.push(e)
    }
  }
  if (changedObjects.length !== 0) {
    for (const e of nicknameChangeListeners) {
      e(changedObjects)
    }
  }
})

tm.addListener('LocalRecord', (info) => {
  const prevRecordIndex = initialLocals.findIndex(a => a.login === info.login)
  let oldArrPos = prevRecordIndex === -1 ? undefined : prevRecordIndex
  if (oldArrPos !== undefined && oldArrPos > 2) {
    oldArrPos = 3
  }
  let newArrPos = info.position - 1
  if (info.position > 2) {
    newArrPos = 3
  }
  if (oldArrPos === newArrPos) { return }
  const obj = topList.find(a => a.login === info.login)
  if (obj === undefined) {
    refreshNeeded = true
    return
  }
  obj.sums[newArrPos]++
  if (oldArrPos !== undefined) {
    obj.sums[oldArrPos]--
  }
  const updated: typeof topList = []
  for (let i = newArrPos; i < Math.min(oldArrPos ?? 3, 3); i++) {
    const obj = topList.find(a => a.login === initialLocals[i]?.login)
    if (obj !== undefined) {
      obj.sums[i]--
      obj.sums[i + 1]++
      updated.push(obj)
    }
  }
  sortToplist()
  topList.length = Math.min(config.sumsCount, topList.length)
  for (const e of updateListeners) { e(updated) }
})

tm.addListener(['MapAdded', 'MapRemoved'], () => {
  refreshNeeded = true
})

/**
 * Creates and provides utilities for accessing players podium sums ranking
 * @author lythx
 * @since 0.3
 */
export const topSums = {

  /**
   * List of players sorted by their records amount
   */
  get list(): readonly Readonly<{
    login: string, nickname: string,
    sums: Readonly<[number, number, number, number]>
  }>[] {
    return topList
  },

  /**
   * Add a callback function to execute on top sums list update
   * @param callback Function to execute on event. It takes an array of updated objects as a parameter
   */
  onUpdate(callback: (changes: readonly Readonly<{
    login: string, nickname: string,
    sums: Readonly<[number, number, number, number]>
  }>[]) => void) {
    updateListeners.push(callback)
  },

  /**
   * Add a callback function to execute on player nickname change
   * @param callback Function to execute on event. It takes an array of objects containing login and nickname as a parameter
   */
  onNicknameChange(callback: (changes: readonly Readonly<{ login: string, nickname: string }>[]) => void): void {
    nicknameChangeListeners.push(callback)
  }

}

function sortToplist() {
  topList.sort((a, b) => {
    if (a.sums[0] < b.sums[0]) return 1
    if (a.sums[0] > b.sums[0]) return -1
    if (a.sums[1] < b.sums[1]) return 1
    if (a.sums[1] > b.sums[1]) return -1
    if (a.sums[2] < b.sums[2]) return 1
    if (a.sums[2] > b.sums[2]) return -1
    if (a.sums[3] < b.sums[3]) return 1
    if (a.sums[3] > b.sums[3]) return -1
    return 0
  })
}