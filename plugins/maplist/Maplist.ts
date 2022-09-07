import { trakman as tm } from "../../src/Trakman.js"

const authorSort: TMMap[] = []
const nameSort: TMMap[] = []
const karmaSort: TMMap[] = []
const worstKarmaSort: TMMap[] = []
const atSort: TMMap[] = []
const worstAtSort: TMMap[] = []
const positionSorts: { login: string, list: TMMap[] }[] = [] // TODO cache or delete
const cachedSearches: { query: string, list: TMMap[] }[] = []

tm.addListener('Controller.Ready', (): void => {
  const arr1: TMMap[] = tm.maps.list.sort((a, b): number => a.name.localeCompare(b.name))
  authorSort.push(...arr1.sort((a, b): number => a.author.localeCompare(b.author)))
  nameSort.push(...[...authorSort].sort((a, b): number => a.name.localeCompare(b.name)))
  const maps = tm.maps.list
  karmaSort.push(...[...authorSort].sort((a, b): number => {
    const aKarma: number = maps.find(c => c.id === a.id)?.voteRatio ?? 0
    const bKarma: number = maps.find(c => c.id === b.id)?.voteRatio ?? 0
    return bKarma - aKarma
  }))
  worstKarmaSort.push(...[...karmaSort].reverse())
  atSort.push(...[...authorSort].sort((a, b): number => a.authorTime - b.authorTime))
  worstAtSort.push(...[...atSort].reverse())
})

tm.addListener('Controller.MapAdded', (map) => {
  authorSort.splice(authorSort.findIndex(a => map.author.localeCompare(a.author) && map.name.localeCompare(a.name)), 0, map)
  nameSort.splice(nameSort.findIndex(a => map.author.localeCompare(a.author) && map.name.localeCompare(a.name)), 0, map)
  const ratio = map.voteRatio
  karmaSort.splice(karmaSort.findIndex(a => map.author.localeCompare(a.author)
    && map.name.localeCompare(a.name)
    && ratio > map.voteRatio), 0, map)
  atSort.splice(atSort.findIndex(a => map.author.localeCompare(a.author) && map.name.localeCompare(a.name) && map.authorTime < a.authorTime), 0, map)
})

tm.addListener('Controller.MapRemoved', (map) => {
  authorSort.splice(authorSort.findIndex(a => a.id === map.id), 1)
  nameSort.splice(nameSort.findIndex(a => a.id === map.id), 1)
  karmaSort.splice(karmaSort.findIndex(a => a.id === map.id), 1)
  atSort.splice(atSort.findIndex(a => a.id === map.id), 1)
})

export const maplist = {

  get: (sort?: 'name' | 'karma' | 'long' | 'short' | 'worstkarma' | 'bestkarma'): readonly Readonly<TMMap>[] => {
    switch (sort) {
      case 'name':
        return nameSort
      case 'karma': case 'bestkarma':
        return karmaSort
      case 'worstkarma':
        return worstKarmaSort
      case 'short':
        return atSort
      case 'long':
        return worstAtSort
      default:
        return authorSort
    }
  },

  getByPosition: async (login: string, sort: 'best' | 'worst'): Promise<Readonly<TMMap>[]> => {
    if (sort === 'best') {
      const ranks: { mapId: string, rank: number }[] = (await tm.records.getRank(login, tm.maps.list.map(a => a.id))).sort((a, b): number => a.rank - b.rank)
      const list: TMMap[] = [...authorSort]
      const ranked: TMMap[] = []
      for (let i: number = 0; i < ranks.length; i++) {
        const entry = list.find(a => a.id === ranks[i].mapId)
        if (entry !== undefined) { ranked.push(entry) }
      }
      return ranked
    }
    else {
      const ranks: { mapId: string, rank: number }[] = (await tm.records.getRank(login, tm.maps.list.map(a => a.id))).sort((a, b): number => b.rank - a.rank)
      const list: TMMap[] = [...authorSort]
      const ranked: TMMap[] = []
      for (let i: number = 0; i < list.length; i++) {
        const index: number = ranks.findIndex(a => a.mapId === list[i].id)
        if (index !== -1) {
          ranked[index] = list[i]
        }
      }
      return ranked
    }
  },

  searchByName: (query: string): Readonly<TMMap>[] => {
    return (tm.utils.matchString(query, authorSort, 'name', true)).filter(a => a.value > 0.1).map(a => a.obj)
  },

  searchByAuthor: (query: string): Readonly<TMMap>[] => {
    return (tm.utils.matchString(query, nameSort, 'author', true)).filter(a => a.value > 0.1).map(a => a.obj)
  },

  filterNoFinish: async (login: string): Promise<Readonly<TMMap>[]> => {
    const mapsWithRec: string[] = (await tm.records.fetchByLogin(login)).map(a => a.map)
    return authorSort.filter(a => !mapsWithRec.includes(a.id))
  },

  filterNoRank: async (login: string): Promise<Readonly<TMMap>[]> => {
    const mapsWithAuthor: string[] = (await tm.records.fetchByLogin(login))
      .filter(a => authorSort.find(b => b.id === a.map)?.authorTime ?? Infinity < a.time)
      .map(a => a.map)
    return authorSort.filter(a => !mapsWithAuthor.includes(a.id))
  },

  filterNoAuthor: async (login: string): Promise<Readonly<TMMap>[]> => {
    const ranks: { mapId: string; rank: number; }[] = []
    let i: number = -1
    const fetchSize: number = 300
    do {
      i++
      if (i * fetchSize > authorSort.length) { break }
      ranks.push(...(await tm.records.getRank(login, authorSort
        .slice(i * fetchSize, (i + 1) * fetchSize).map(a => a.id)))
        .filter(a => a.rank <= tm.records.maxLocalsAmount))
    } while (((i + 1) * fetchSize) - ranks.length < fetchSize)
    const list: TMMap[] = authorSort.slice(0, (i + 1) * fetchSize)
    return list.filter(a => !ranks.some(b => a.id === b.mapId))
  }

}