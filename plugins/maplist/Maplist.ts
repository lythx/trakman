import config from './Config.js'
import './ui/Maplist.component.js'

const authorSort: tm.Map[] = []
const nameSort: tm.Map[] = []
const karmaSort: tm.Map[] = []
const worstKarmaSort: tm.Map[] = []
const atSort: tm.Map[] = []
const worstAtSort: tm.Map[] = []
const newestSort: tm.Map[] = []
const oldestSort: tm.Map[] = []
const jukebox: tm.Map[] = []
let cache: {
  type: 'best' | 'worst' | 'name' | 'author' | 'nofin' | 'norank' | 'noauthor' | 'newest' | 'oldest',
  query: string, list: tm.Map[]
}[] = []
const updateListeners: ((action: 'add' | 'remove', addedOrRemovedMap: Readonly<tm.Map>) => void)[] = []
const jukeboxUpdateListeners: ((jukebox: readonly Readonly<tm.Map>[]) => void)[] = []

tm.addListener('Startup', (): void => {
  const arr: tm.Map[] = tm.maps.list.sort((a, b): number => a.name.localeCompare(b.name))
  authorSort.push(...arr.sort((a, b): number => a.author.localeCompare(b.author)))
  nameSort.push(...[...authorSort].sort((a, b): number => a.name.localeCompare(b.name)))
  const maps: Readonly<tm.Map>[] = tm.maps.list
  karmaSort.push(...[...authorSort].sort((a, b): number => {
    const aKarma: number = maps.find(c => c.id === a.id)?.voteRatio ?? 0
    const bKarma: number = maps.find(c => c.id === b.id)?.voteRatio ?? 0
    return bKarma - aKarma
  }))
  worstKarmaSort.push(...[...karmaSort].reverse())
  atSort.push(...[...authorSort].sort((a, b): number => a.authorTime - b.authorTime))
  worstAtSort.push(...[...atSort].reverse())
  oldestSort.push(...[...authorSort].sort((a, b): number => a.addDate.getTime() - b.addDate.getTime()))
  newestSort.push(...[...oldestSort].reverse())
})

tm.addListener('JukeboxChanged', (list): void => {
  jukebox.length = 0
  jukebox.push(...list)
  for (const e of jukeboxUpdateListeners) { e(list) }
})

tm.addListener('MapAdded', (map): void => {
  authorSort.splice(authorSort.findIndex(a => map.author.localeCompare(a.author)
    && map.name.localeCompare(a.name)), 0, map)
  nameSort.splice(nameSort.findIndex(a => map.author.localeCompare(a.author)
    && map.name.localeCompare(a.name)), 0, map)
  const ratio: number = map.voteRatio
  karmaSort.splice(karmaSort.findIndex(a => map.author.localeCompare(a.author)
    && map.name.localeCompare(a.name)
    && ratio > map.voteRatio), 0, map)
  worstKarmaSort.splice(worstKarmaSort.findIndex(a => !map.author.localeCompare(a.author)
    && !map.name.localeCompare(a.name)
    && ratio <= map.voteRatio), 0, map)
  atSort.splice(atSort.findIndex(a => map.author.localeCompare(a.author)
    && map.name.localeCompare(a.name)
    && map.authorTime < a.authorTime), 0, map)
  worstAtSort.splice(worstAtSort.findIndex(a => !map.author.localeCompare(a.author)
    && !map.name.localeCompare(a.name)
    && map.authorTime >= a.authorTime), 0, map)
  newestSort.splice(newestSort.findIndex(a => !map.author.localeCompare(a.author)
    && map.name.localeCompare(a.name)
    && map.addDate.getTime() < a.addDate.getTime()), 0, map)
  oldestSort.splice(oldestSort.findIndex(a => !map.author.localeCompare(a.author)
    && !map.name.localeCompare(a.name)
    && map.addDate.getTime() >= a.addDate.getTime()), 0, map)
  cache.length = 0
  for (const e of updateListeners) { e('add', map) }
})

tm.addListener('MapRemoved', (map): void => {
  authorSort.splice(authorSort.findIndex(a => a.id === map.id), 1)
  nameSort.splice(nameSort.findIndex(a => a.id === map.id), 1)
  karmaSort.splice(karmaSort.findIndex(a => a.id === map.id), 1)
  worstKarmaSort.splice(worstKarmaSort.findIndex(a => a.id === map.id), 1)
  atSort.splice(atSort.findIndex(a => a.id === map.id), 1)
  worstAtSort.splice(worstAtSort.findIndex(a => a.id === map.id), 1)
  newestSort.splice(newestSort.findIndex(a => a.id === map.id), 1)
  oldestSort.splice(oldestSort.findIndex(a => a.id === map.id), 1)
  cache.length = 0
  for (const e of updateListeners) { e('remove', map) }
})

tm.addListener('LiveRecord', (info: tm.FinishInfo): void => {
  const time: number | undefined = tm.records.getLocal(info.login)?.time
  if (time !== undefined && info.time === time) {
    cache.length = 0
  }
})

tm.addListener('BeginMap', (): void => {
  // DESTRUCTION 200000000
  cache.length = 0
})

/**
 * Provides utilities for filtering and sorting maplist.
 * @author lythx
 * @since 0.1
 */
export const maplist = {

  /**
   * Add a callback function to execute on list update
   * @param callback Functon to execute on event, it takes action type and added od removed map as parameters
   */
  onListUpdate(callback: (action: 'add' | 'remove', addedOrRemovedMap: Readonly<tm.Map>) => void) {
    updateListeners.push(callback)
  },

  /**
   * Add a callback function to execute on jukebox update
   * @param callback Functon to execute on event, it takes updated jukebox as parameter
   */
  onJukeboxUpdate(callback: (jukebox: readonly Readonly<tm.Map>[]) => void) {
    jukeboxUpdateListeners.push(callback)
  },

  /**
   * Get maps sorted by given criteria
   * @param sort Sorting criteria, author by default
   * @returns Array of map objects
   */
  get: (sort?: 'jukebox' | 'name' | 'karma' | 'long' | 'short' | 'worstkarma' | 'author' | 'oldest' | 'newest'): readonly Readonly<tm.Map>[] => {
    switch (sort) {
      case 'jukebox':
        return jukebox
      case 'name':
        return nameSort
      case 'karma':
        return karmaSort
      case 'worstkarma':
        return worstKarmaSort
      case 'short':
        return atSort
      case 'long':
        return worstAtSort
      case 'oldest':
        return oldestSort
      case 'newest':
        return newestSort
      case 'author': default:
        return authorSort
    }
  },

  /**
   * Get maps sorted by player position
   * @param login Player login
   * @param sort Sorting criteria
   * @returns Array of map objects
   */
  getByPosition: (login: string, sort: 'best' | 'worst'): Readonly<tm.Map>[] => {
    if (sort === 'best') {
      let list: tm.Map[] | undefined = cache.find(a => a.query === login && a.type === 'best')?.list
      if (list === undefined) {
        list = []
        const ranks: { mapId: string, rank: number }[] =
          tm.records.getRank(login, tm.maps.list.map(a => a.id))
            .sort((a, b): number => a.rank - b.rank)
        for (let i: number = 0; i < ranks.length; i++) {
          const entry: tm.Map | undefined = authorSort.find(a => a.id === ranks[i].mapId)
          if (entry !== undefined) { list.push(entry) }
        }
        cache.unshift({ query: login, list, type: 'best' })
        cache.length = Math.min(config.cacheSize, cache.length)
      }
      return list
    }
    else {
      let list: tm.Map[] | undefined = cache.find(a => a.query === login && a.type === 'worst')?.list
      if (list === undefined) {
        list = []
        const ranks: { mapId: string, rank: number }[] =
          tm.records.getRank(login, tm.maps.list.map(a => a.id))
            .sort((a, b): number => b.rank - a.rank)
        for (let i: number = 0; i < ranks.length; i++) {
          const entry: tm.Map | undefined = authorSort.find(a => a.id === ranks[i].mapId)
          if (entry !== undefined) { list.push(entry) }
        }
        cache.unshift({ query: login, list, type: 'worst' })
        cache.length = Math.min(config.cacheSize, cache.length)
      }
      return list
    }
  },

  /**
   * Get maps with names matching the query
   * @param query Search query
   * @returns Array of map objects
   */
  searchByName: (query: string): Readonly<tm.Map>[] => {
    let list: tm.Map[] | undefined = cache.find(a => a.query === query && a.type === 'name')?.list
    if (list === undefined) {
      list = (tm.utils.matchString(query, authorSort, 'name', true))
        .filter(a => a.value > config.searchMinSimilarityValue).map(a => a.obj)
      cache.unshift({ query, list, type: 'name' })
      cache.length = Math.min(config.cacheSize, cache.length)
    }
    return list
  },

  /**
   * Get maps with author names matching the query
   * @param query Search query
   * @returns Array of map objects
   */
  searchByAuthor: (query: string): Readonly<tm.Map>[] => {
    let list: tm.Map[] | undefined = cache.find(a => a.query === query && a.type === 'author')?.list
    if (list === undefined) {
      list = (tm.utils.matchString(query, nameSort, 'author', true))
        .filter(a => a.value > config.searchMinSimilarityValue).map(a => a.obj)
      cache.unshift({ query, list, type: 'author' })
      cache.length = Math.min(config.cacheSize, cache.length)
    }
    return list
  },

  /**
   * Get maplist filtered by given criteria
   * @param login Player login
   * @param filterCriteria Criteria to filter the maplist by
   * @returns Array of map objects
   */
  getFiltered(login: string, filterCriteria: 'nofinish' | 'norank' | 'noauthor'): Promise<Readonly<tm.Map>[]> {
    if (filterCriteria === 'nofinish') {
      return this.filterNoFinish(login)
    } else if (filterCriteria === 'norank') {
      return this.filterNoRank(login)
    } else {
      return this.filterNoAuthor(login)
    }
  },

  /**
   * Get all maps that a given player didn't finish
   * @param login Player login
   * @returns Array of map objects
   */
  filterNoFinish: async (login: string): Promise<Readonly<tm.Map>[]> => {
    let list: tm.Map[] | undefined = cache.find(a => a.query === login && a.type === 'nofin')?.list
    if (list === undefined) {
      const mapsWithRec: string[] = (await tm.records.fetchByLogin(login)).map(a => a.map)
      list = authorSort.filter(a => !mapsWithRec.includes(a.id))
      cache.unshift({ query: login, list, type: 'nofin' })
      cache.length = Math.min(config.cacheSize, cache.length)
    }
    return list
  },

  /**
   * Get all maps that a given player doesn't have a rank on
   * @param login Player login
   * @returns Array of map objects
   */
  filterNoRank: async (login: string): Promise<Readonly<tm.Map>[]> => {
    let list: tm.Map[] | undefined = cache.find(a => a.query === login && a.type === 'norank')?.list
    if (list === undefined) {
      const mapsWithAuthor: string[] = (await tm.records.fetchByLogin(login))
        .filter(a => authorSort.find(b => b.id === a.map)?.authorTime ?? Infinity < a.time)
        .map(a => a.map)
      list = authorSort.filter(a => !mapsWithAuthor.includes(a.id))
      cache.unshift({ query: login, list, type: 'norank' })
      cache.length = Math.min(config.cacheSize, cache.length)
    }
    return list
  },

  /**
   * Get all maps that a given player doesn't have the author medal on
   * @param login Player login
   * @returns Array of map objects
   */
  filterNoAuthor: async (login: string): Promise<Readonly<tm.Map>[]> => {
    let list: tm.Map[] | undefined = cache.find(a => a.query === login && a.type === 'noauthor')?.list
    if (list === undefined) {
      const ranks = (tm.records.getRank(login, authorSort.map(a => a.id)))
        .filter(a => a.rank <= tm.records.maxLocalsAmount)
      list = authorSort.filter(a => !ranks.some(b => a.id === b.mapId))
      cache.unshift({ query: login, list, type: 'noauthor' })
      cache.length = Math.min(config.cacheSize, cache.length)
    }
    return list
  }

}