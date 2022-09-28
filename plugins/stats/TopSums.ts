
import config from './Config.js' // TODO FIX

let topList: { login: string, nickname: string, sums: [number, number, number, number] }[] = []
const updateListeners: ((updatedLogin: string, list: { login: string, nickname: string, sums: [number, number, number, number] }[]) => void)[] = []
const nicknameChangeListeners: ((changedList: { login: string, nickname: string }[]) => void)[] = []

const initialize = async () => {
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
  topList.sort((a, b) => b.sums[0] - a.sums[0])
  for (const e of updateListeners) {
    e('', [...topList])
  }
}

tm.addListener('Startup', async (): Promise<void> => {
  void initialize()
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

tm.addListener('PlayerJoin', (info) => {
  // const login = info.login
  // const visits = info.visits
  // if (visits <= topList[topList.length - 1].visits) { return }
  // const entry = topList.find(a => a.login === login)
  // if (entry !== undefined) {
  //   entry.visits = visits
  //   topList.sort((a, b) => b.visits - a.visits)
  // } else {
  //   topList.splice(topList.findIndex(a => a.visits < visits), 0, { login, visits, nickname: info.nickname })
  //   topList.length = config.visitsCount
  // }
  // for (const e of updateListeners) {
  //   e(login, [...topList])
  // }
})

export const topSums = {

  get list() {
    return [...topList]
  },

  onUpdate(callback: (updatedLogin: string, list: { login: string, nickname: string, sums: [number, number, number, number] }[]) => void) {
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