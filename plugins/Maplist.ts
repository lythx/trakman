import { trakman as TM } from "../src/Trakman.js"

const authorSort: TMMap[] = []
const nameSort: TMMap[] = []
const karmaSort: TMMap[] = []
const atSort: TMMap[] = []
const positionSorts: { login: string, list: TMMap[] }[] = []
const cachedSearches: { query: string, list: TMMap[] }[] = []

const initializeLists = () => {

}

TM.addListener('Controller.Ready', (): void => {
  const arr1: TMMap[] = TM.maps.list.sort((a, b): number => a.name.localeCompare(b.name))
  authorSort.push(...arr1.sort((a, b): number => a.author.localeCompare(b.author)))
  nameSort.push(...[...authorSort].sort((a, b): number => a.name.localeCompare(b.name)))
  const maps = TM.maps.list
  karmaSort.push(...[...authorSort].sort((a, b): number => {
    const aKarma: number = maps.find(c => c.id === a.id)?.voteRatio ?? 0
    const bKarma: number = maps.find(c => c.id === b.id)?.voteRatio ?? 0
    return bKarma - aKarma
  }))
  atSort.push(...[...authorSort].sort((a, b): number => a.authorTime - b.authorTime))
})

TM.addListener('Controller.MapAdded', (map) => {
  authorSort.splice(authorSort.findIndex(a => map.author.localeCompare(a.author) && map.name.localeCompare(a.name)), 0, map)
  nameSort.splice(nameSort.findIndex(a => map.author.localeCompare(a.author) && map.name.localeCompare(a.name)), 0, map)
  const ratio = map.voteRatio
  karmaSort.splice(karmaSort.findIndex(a => map.author.localeCompare(a.author)
    && map.name.localeCompare(a.name)
    && ratio > map.voteRatio), 0, map)
  atSort.splice(atSort.findIndex(a => map.author.localeCompare(a.author) && map.name.localeCompare(a.name) && map.authorTime < a.authorTime), 0, map)
})

TM.addListener('Controller.MapRemoved', (map) => {
  authorSort.splice(authorSort.findIndex(a => a.id === map.id), 1)
  nameSort.splice(nameSort.findIndex(a => a.id === map.id), 1)
  karmaSort.splice(karmaSort.findIndex(a => a.id === map.id), 1)
  atSort.splice(atSort.findIndex(a => a.id === map.id), 1)
})

export const MAPLIST = {

  get: (sort?: 'name' | 'karma' | 'long' | 'short' | 'worstkarma' | 'bestkarma'): TMMap[] => {
    switch (sort) {
      case 'name':
        return nameSort
      case 'karma': case 'bestkarma':
        return karmaSort
      case 'worstkarma':
        return [...karmaSort].reverse()
      case 'short':
        return atSort
      case 'long':
        return [...atSort].reverse()
      default:
        return authorSort
    }
  },

  getByPosition: async (login: string, sort: 'best' | 'worst'): Promise<TMMap[]> => {
    if (sort === 'best') {
      const ranks: { mapId: string; rank: number; }[] = (await TM.fetchMapRank(login, TM.maps.list.map(a => a.id))).sort((a, b): number => a.rank - b.rank)
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
    else {
      const ranks: { mapId: string; rank: number; }[] = (await TM.fetchMapRank(login, TM.maps.list.map(a => a.id))).sort((a, b): number => b.rank - a.rank)
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

  searchByName: (query: string): TMMap[] => {
    return (TM.utils.matchString(query, authorSort, 'name', true)).filter(a => a.value > 0.1).map(a => a.obj)
  },

  searchByAuthor: (query: string): TMMap[] => {
    return (TM.utils.matchString(query, nameSort, 'author', true)).filter(a => a.value > 0.1).map(a => a.obj)
  },

  filterNoFinish: (login: string): TMMap[] => {
    return []
  },

  filterNoRank: (login: string): TMMap[] => {
    return []
  },

  filterNoAuthor: (login: string): TMMap[] => {
    return []
  }

}