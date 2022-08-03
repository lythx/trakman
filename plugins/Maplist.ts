import { TRAKMAN as TM } from "../src/Trakman.js"

const authorSort: TMMap[] = []
const nameSort: TMMap[] = []
const karmaSort: TMMap[] = []
const atSort: TMMap[] = []
const positionSorts: { login: string, list: TMMap[] }[] = []
const cachedSearches: { query: string, list: TMMap[] }[] = []

TM.addListener('Controller.Ready', () => {
  const arr1 = TM.maps.sort((a, b) => a.name.localeCompare(b.name))
  authorSort.push(...arr1.sort((a, b) => a.author.localeCompare(b.author)))
  nameSort.push(...[...authorSort].sort((a, b) => a.name.localeCompare(b.name)))
  karmaSort.push(...[...authorSort].sort((a, b) => {
    const aKarma = TM.voteRatios.find(c => c.mapId === a.id)?.ratio ?? 0
    const bKarma = TM.voteRatios.find(c => c.mapId === b.id)?.ratio ?? 0
    return bKarma - aKarma
  }))
  atSort.push(...[...authorSort].sort((a, b) => a.authorTime - b.authorTime))
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
      const ranks: { mapId: string; rank: number; }[] = (await TM.fetchMapRank(login, TM.maps.map(a => a.id))).sort((a, b) => a.rank - b.rank)
      const list = [...authorSort]
      const ranked: TMMap[] = []
      for (let i = 0; i < list.length; i++) {
        const index = ranks.findIndex(a => a.mapId === list[i].id)
        if (index !== -1) {
          ranked[index] = list[i]
        }
      }
      return ranked
    }
    else {
      const ranks: { mapId: string; rank: number; }[] = (await TM.fetchMapRank(login, TM.maps.map(a => a.id))).sort((a, b) => b.rank - a.rank)
      const list = [...authorSort]
      const ranked: TMMap[] = []
      for (let i = 0; i < list.length; i++) {
        const index = ranks.findIndex(a => a.mapId === list[i].id)
        if (index !== -1) {
          ranked[index] = list[i]
        }
      }
      return ranked
    }
  },

  searchByName: (query: string): TMMap[] => {
    return (TM.matchString(query, authorSort, 'name', true)).filter(a => a.value > 0.1).map(a => a.obj)
  },

  searchByAuthor: (query: string): TMMap[] => {
    return (TM.matchString(query, nameSort, 'author', true)).filter(a => a.value > 0.1).map(a => a.obj)
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