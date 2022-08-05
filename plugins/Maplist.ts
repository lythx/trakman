import { TRAKMAN as TM } from "../src/Trakman.js"

const authorSort: TMMap[] = []
const nameSort: TMMap[] = []
const karmaSort: TMMap[] = []
const atSort: TMMap[] = []
const positionSorts: { login: string, list: TMMap[] }[] = []
const cachedSearches: { query: string, list: TMMap[] }[] = []

TM.addListener('Controller.Ready', (): void => {
  const arr1: TMMap[] = TM.maps.sort((a, b): number => a.name.localeCompare(b.name))
  authorSort.push(...arr1.sort((a, b): number => a.author.localeCompare(b.author)))
  nameSort.push(...[...authorSort].sort((a, b): number => a.name.localeCompare(b.name)))
  karmaSort.push(...[...authorSort].sort((a, b): number => {
    const aKarma: number = TM.voteRatios.find(c => c.mapId === a.id)?.ratio ?? 0
    const bKarma: number = TM.voteRatios.find(c => c.mapId === b.id)?.ratio ?? 0
    return bKarma - aKarma
  }))
  atSort.push(...[...authorSort].sort((a, b): number => a.authorTime - b.authorTime))
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
      const ranks: { mapId: string; rank: number; }[] = (await TM.fetchMapRank(login, TM.maps.map(a => a.id))).sort((a, b): number => a.rank - b.rank)
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
      const ranks: { mapId: string; rank: number; }[] = (await TM.fetchMapRank(login, TM.maps.map(a => a.id))).sort((a, b): number => b.rank - a.rank)
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