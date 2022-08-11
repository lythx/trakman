import { trakman as TM } from '../src/Trakman.js'

const regex: RegExp = /[A-Z\'^£$%&*()}{@#~?><>,|=+¬ ]/

const fetchPlayerData = async (login: string): Promise<{ nickname: string, country: string } | Error | false> => {
  if (regex.test(login) === true) { return false }
  const json: any = await TM.players.fetchWebservices(login)
  if (json instanceof Error) { // UNKOWN PLAYER MOMENT
    return json
  } else {
    // No error check, nation cannot be undefined
    return { nickname: json?.nickname, country: (TM.utils.countryToCode(json?.path?.split('|')[1]) as any) }
  }
}

const currentAuthorListeners: ((data?: { nickname: string, country: string }) => void)[] = []
const nextAuthorListeners: ((data?: { nickname: string, country: string }) => void)[] = []

let currentAuthorData: { nickname: string, country: string } | undefined
let nextAuthorData: { nickname: string, country: string } | undefined

TM.addListener('Controller.Ready', async (): Promise<void> => {
  const res = await fetchPlayerData(TM.maps.current.author)
  if (res instanceof Error || res === false) {
    currentAuthorData = undefined
  } else {
    currentAuthorData = res
  }
  for (const e of currentAuthorListeners) {
    e(currentAuthorData)
  }
})

TM.addListener('Controller.EndMap', async (info): Promise<void> => {
  if (info.isRestart === true) {
    nextAuthorData === currentAuthorData
    for (const e of nextAuthorListeners) {
      e(nextAuthorData)
    }
    return
  }
  const res = await fetchPlayerData(TM.jukebox.queue[0].author)
  if (res instanceof Error || res === false) {
    nextAuthorData = undefined
  } else {
    nextAuthorData = res
  }
  for (const e of nextAuthorListeners) {
    e(nextAuthorData)
  }
})

TM.addListener('Controller.JukeboxChanged', async (): Promise<void> => {
  if (TM.state.current === 'result') {
    const res = await fetchPlayerData(TM.jukebox.queue[0].author)
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

TM.addListener('Controller.BeginMap', (): void => {
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

  get nextAuthor() {
    return nextAuthorData
  },

  onCurrentAuthorChange: (callback: ((data?: { nickname: string, country: string }) => void)) => {
    currentAuthorListeners.push(callback)
  },

  onNextAuthorChange: (callback: ((data?: { nickname: string, country: string }) => void)) => {
    nextAuthorListeners.push(callback)
  }

}

