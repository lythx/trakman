import config from './Config.js'

const topList: {
  readonly login: string,
  nickname: string,
  sums: [number, number, number, number]
}[] = []
const updateListeners: ((changes: readonly Readonly<{
  login: string,
  nickname: string,
  sums: [number, number, number, number]
}>[]) => void)[] = []
const nicknameChangeListeners: ((changes: readonly Readonly<{
  login: string,
  nickname: string
}>[]) => void)[] = []
let initialLocals: tm.LocalRecord[] = []
let refreshNeeded = false

const initialize = async () => {
  refreshNeeded = false
  topList.length = 0

  const res: {
    login: string,
    nickname: string,
    firsts: number,
    seconds: number,
    thirds: number,
    others: number
  }[] | Error = await tm.db.query(`
    WITH ranked AS (SELECT p.login,
                           p.nickname,
                           RANK() OVER (
          PARTITION BY m.id
          ORDER BY CAST(r.time AS NUMERIC) ASC, r.date ASC, r.player_id ASC
        ) AS rk
                    FROM maps m
                           JOIN records r ON r.map_id = m.id
                           JOIN players p ON p.id = r.player_id)
    SELECT login,
           MAX(nickname)                           AS nickname,
           SUM(CASE WHEN rk = 1 THEN 1 ELSE 0 END) AS firsts,
           SUM(CASE WHEN rk = 2 THEN 1 ELSE 0 END) AS seconds,
           SUM(CASE WHEN rk = 3 THEN 1 ELSE 0 END) AS thirds,
           SUM(CASE WHEN rk > 3 THEN 1 ELSE 0 END) AS others
    FROM ranked
    GROUP BY login
    ORDER BY firsts DESC, seconds DESC, thirds DESC, others DESC;
  `)

  if (res instanceof Error) {
    await tm.log.fatal(`Failed to fetch topsums`, res.message)
    return
  }
  if (res.length === 0) { return }

  for (const row of res) {
    topList.push({
      login: row.login,
      nickname: row.nickname,
      sums: [row.firsts, row.seconds, row.thirds, row.others]
    })
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
  const changedObjects: {
    login: string,
    nickname: string
  }[] = []
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
  } // [1,2,3,4] 7000
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
  initialLocals = tm.records.local
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
    login: string,
    nickname: string,
    sums: Readonly<[number, number, number, number]>
  }>[] {
    return topList
  },

  /**
   * Add a callback function to execute on top sums list update
   * @param callback Function to execute on event. It takes an array of updated objects as a parameter
   */
  onUpdate(callback: (changes: readonly Readonly<{
    login: string,
    nickname: string,
    sums: Readonly<[number, number, number, number]>
  }>[]) => void) {
    updateListeners.push(callback)
  },

  /**
   * Add a callback function to execute on player nickname change
   * @param callback Function to execute on event. It takes an array of objects containing login and nickname as a parameter
   */
  onNicknameChange(callback: (changes: readonly Readonly<{
    login: string,
    nickname: string
  }>[]) => void): void {
    nicknameChangeListeners.push(callback)
  }

}

function sortToplist() {
  topList.sort((a, b) => {
    if (a.sums[0] !== b.sums[0]) return b.sums[0] - a.sums[0]
    if (a.sums[1] !== b.sums[1]) return b.sums[1] - a.sums[1]
    if (a.sums[2] !== b.sums[2]) return b.sums[2] - a.sums[2]
    if (a.sums[3] !== b.sums[3]) return b.sums[3] - a.sums[3]
    return 0
  })
}
