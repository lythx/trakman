
import countries from './data/Countries.js'
import Events from './Events.js'
import Logger from './Logger.js'
import PlayerService from './services/PlayerService.js'

class Players {
  static #playerService = new PlayerService()
  static #players = []

  static async initialize () {
    await this.#playerService.initialize()
    await this.#playerService.addAllFromList()
  }

  static async join (login, nickName, path) {
    const nation = path.split('|')[1]
    const nationCode = countries.find(a => a.name === path.split('|')[1]).code
    const playerData = await this.#playerService.get(login)
    const player = new Player(login, nickName, nation, nationCode)
    if (playerData.length === 0) {
      await this.#playerService.add(player)
    } else {
      player.wins = Number(playerData[0].wins)
      player.timePlayed = Number(playerData[0].timeplayed)
      await this.#playerService.update(player)
    }
    this.#players.push(player)
  }

  static async leave (login) {
    const player = this.#players.find(p => p.login === login)
    const sessionTime = Date.now() - player.joinTimestamp
    const totalTimePlayed = sessionTime + player.timePlayed
    Logger.warn(totalTimePlayed)
    Logger.warn(sessionTime)
    Events.emitEvent('Controller.PlayerLeave',
      [{
        login: player.login,
        nickName: player.nickName,
        nation: player.nation,
        nationCode: player.nationCode,
        wins: player.wins,
        sessionTime,
        totalTimePlayed,
        joinTimestamp: player.joinTimestamp
      }]
    )
    await this.#playerService.setTimePlayed(player.login, totalTimePlayed)
    this.#players = this.#players.filter(p => p.login !== player.login)
  }
}

class Player {
  #login
  #nickName
  #nation
  #nationCode
  #wins = 0
  #timePlayed = 0
  #joinTimestamp

  constructor (login, nickName, nation, nationCode) {
    this.#login = login
    this.#nickName = nickName
    this.#nation = nation
    this.#nationCode = nationCode
    this.#joinTimestamp = Date.now()
  }

  set wins (wins) {
    this.#wins = wins
  }

  set timePlayed (timePlayed) {
    this.#timePlayed = timePlayed
  }

  get login () {
    return this.#login
  }

  get nickName () {
    return this.#nickName
  }

  get nation () {
    return this.#nation
  }

  get nationCode () {
    return this.#nationCode
  }

  get wins () {
    return this.#wins
  }

  get timePlayed () {
    return this.#timePlayed
  }

  get joinTimestamp () {
    return this.#joinTimestamp
  }
}

export default Players