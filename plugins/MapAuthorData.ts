import { TRAKMAN as TM } from '../src/Trakman.js'

const regex: RegExp = /[A-Z\'^£$%&*()}{@#~?><>,|=+¬ ]/

const fetchPlayerData = async (login: string): Promise<{ nickname: string, nation: string } | Error | false> => {
  if (regex.test(login) === true) { return false }
  const json: any = await TM.fetchWebServices(login)
  if (json instanceof Error) { // UNKOWN PLAYER MOMENT
    return json
  } else {
    return { nickname: json?.nickname, nation: TM.countries.find(a => a.name === json?.path?.split('|')[1])?.code as any }
  }
}

const currentAuthorListeners: ((data?: { nickname: string, nation: string }) => void)[] = []
const nextAuthorListeners: ((data?: { nickname: string, nation: string }) => void)[] = []

let currentAuthorData: { nickname: string, nation: string } | undefined
let nextAuthorData: { nickname: string, nation: string } | undefined

TM.addListener('Controller.Ready', async () => {
  const res = await fetchPlayerData(TM.map.author)
  if (res instanceof Error || res === false) {
    currentAuthorData = undefined
  } else {
    currentAuthorData = res
  }
  for (const e of currentAuthorListeners) {
    e(currentAuthorData)
  }
})

TM.addListener('Controller.EndMap', async () => {
  const res = await fetchPlayerData(TM.mapQueue[0].author)
  if (res instanceof Error || res === false) {
    nextAuthorData = undefined
  } else {
    nextAuthorData = res
  }
  for (const e of nextAuthorListeners) {
    e(nextAuthorData)
  }
})

TM.addListener('Controller.JukeboxChanged', async () => {
  if (TM.serverState === 'result') {
    const res = await fetchPlayerData(TM.mapQueue[0].author)
    if (res instanceof Error || res === false) {
      nextAuthorData = undefined
    } else {
      nextAuthorData = res
    }
    for (const e of nextAuthorListeners) {
      e(nextAuthorData)
    }
  }
})

TM.addListener('Controller.BeginMap', () => {
  currentAuthorData = nextAuthorData
  nextAuthorData = undefined
  for (const e of currentAuthorListeners) {
    e(currentAuthorData)
  }
  for (const e of nextAuthorListeners) {
    e(nextAuthorData)
  }
})

export const MapAuthorData = {

  get currentAuthor() {
    return currentAuthorData
  },

  get nextAuthorData() {
    return nextAuthorData
  },

  onCurrentAuthorChange: (callback: ((data?: { nickname: string, nation: string }) => void)): void => {
    currentAuthorListeners.push(callback)
  },

  onNextAuthorChange: (callback: ((data?: { nickname: string, nation: string }) => void)): void => {
    nextAuthorListeners.push(callback)
  }

}

