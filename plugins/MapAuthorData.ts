import { trakman as tm } from '../src/Trakman.js'

// TODO fix after moving entire webservice thing here (?)

const regex: RegExp = /[A-Z\'^£$%&*()}{@#~?><>,|=+¬ ]/

const fetchPlayerData = async (login: string): Promise<{ nickname: string, country: string } | Error | false> => {
  if (regex.test(login) === true) { return false }
  const json: any = await tm.players.fetchWebservices(login)
  if (json instanceof Error) { // UNKOWN PLAYER MOMENT
    return json
  } else {
    // No error check, nation cannot be undefined
    return { nickname: json?.nickname, country: (tm.utils.countryToCode(json?.path?.split('|')[1]) as any) }
  }
}

const currentAuthorListeners: ((data?: { nickname: string, country: string }) => void)[] = []
const nextAuthorListeners: ((data?: { nickname: string, country: string }) => void)[] = []

let currentAuthorData: { nickname: string, country: string } | undefined
let nextAuthorData: { nickname: string, country: string } | undefined

tm.addListener('Controller.Ready', async (): Promise<void> => {
  const res = await fetchPlayerData(tm.maps.current.author)
  if (res instanceof Error || res === false) {
    currentAuthorData = undefined
  } else {
    currentAuthorData = res
  }
  for (const e of currentAuthorListeners) {
    e(currentAuthorData)
  }
})

tm.addListener('Controller.EndMap', async (info): Promise<void> => {
  if (info.isRestart === true) {
    nextAuthorData === currentAuthorData
    for (const e of nextAuthorListeners) {
      e(nextAuthorData)
    }
    return
  }
  const res = await fetchPlayerData(tm.jukebox.queue[0].author)
  if (res instanceof Error || res === false) {
    nextAuthorData = undefined
  } else {
    nextAuthorData = res
  }
  for (const e of nextAuthorListeners) {
    e(nextAuthorData)
  }
})

tm.addListener('Controller.JukeboxChanged', async (): Promise<void> => {
  if (tm.state.current === 'result') {
    const res = await fetchPlayerData(tm.jukebox.queue[0].author)
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

tm.addListener('Controller.BeginMap', (): void => {
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

