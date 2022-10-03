import config from './Config.js'

let topList: { login: string, nickname: string, sums: [number, number, number, number] }[] = []
const updateListeners: ((list: { login: string, nickname: string, sums: [number, number, number, number] }[], updatedLogin?: string) => void)[] = []
const nicknameChangeListeners: ((changedList: { login: string, nickname: string }[]) => void)[] = []
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
    if (mapPresent === false) { continue }
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
  topList.sort((a, b) => b.sums[3] - a.sums[3])
  topList.sort((a, b) => b.sums[2] - a.sums[2])
  topList.sort((a, b) => b.sums[1] - a.sums[1])
  topList.sort((a, b) => b.sums[0] - a.sums[0])
  topList.length = Math.min(config.sumsCount, topList.length)
  for (const e of updateListeners) {
    e([...topList])
  }
}

tm.addListener('Startup', async (): Promise<void> => {
  void initialize()
  initialLocals = tm.records.local
})

tm.addListener('BeginMap', () => {
  if (refreshNeeded === true) {
    void initialize()
  }
  initialLocals = tm.records.local
})

tm.addListener('PlayerInfoUpdated', (info) => {
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
  let oldArrPos = prevRecordIndex
  if (info.position > 3) {
    oldArrPos = 4
  }
  let newArrPos = info.position - 1
  if (info.position > 3) {
    newArrPos = 4
  }
  if (oldArrPos === newArrPos) { return }
  const obj = topList.find(a => a.login === info.login)
  if (obj === undefined) {
    refreshNeeded = true
    return
  }
  obj.sums[newArrPos]++
  obj.sums[oldArrPos]--
  for (let i = newArrPos; i < Math.min(oldArrPos, 3); i++) {
    const obj = topList.find(a => a.login === initialLocals[i]?.login)
    if (obj !== undefined) {
      obj.sums[i]--
      obj.sums[i + 1]++
    }
  }
  for (const e of updateListeners) {
    e([...topList], info.login)
  }
})

export const topSums = {

  get list() {
    return [...topList]
  },

  onUpdate(callback: (list: {
    login: string, nickname: string,
    sums: Readonly<[number, number, number, number]>
  }[], updatedLogin?: string) => void) {
    updateListeners.push(callback)
  },

  /**
   * Add a callback function to execute on donator nickname change
   * @param callback Function to execute on event. It takes donation object as a parameter
   */
  onNicknameChange(callback: (changes: { login: string, nickname: string }[]) => void) {
    nicknameChangeListeners.push(callback)
  }

}