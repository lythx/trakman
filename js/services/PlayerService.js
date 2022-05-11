'use strict'
import Client from '../Client.js'
import countries from '../data/Countries.js'
import PlayerRepository from '../database/PlayerRepository.js'
import Events from '../Events.js'
import Logger from '../Logger.js'

class PlayerService {
  #players = []
  #repo

  async initialize () {
    this.#repo = new PlayerRepository()
    await this.#repo.initialize()
  }

  async addAllFromList () {
    const playerList = await Client.call('GetPlayerList', [{ int: 250 }, { int: 0 }])
    for (const player of playerList) {
      const detailedPlayerInfo = await Client.call('GetDetailedPlayerInfo', [{ string: player.Login }])
      await this.join(player.Login, player.NickName, detailedPlayerInfo[0].Path)
    }
  }

  async join (login, nickName, path) {
    const nation = path.split('|')[1]
    const nationCode = countries.find(a => a.name === path.split('|')[1]).code
    const playerData = await this.#repo.get(login)
    const player = new Player(login, nickName, nation, nationCode)
    if (playerData.length === 0) {
      await this.#repo.add(player)
    } else {
      player.wins = Number(playerData[0].wins)
      player.timePlayed = Number(playerData[0].timeplayed)
      await this.#repo.update(player)
    }
    this.#players.push(player)
  }

  async leave (login) {
    const player = this.#players.find(p => p.login === login)
    const sessionTime = Date.now() - player.joinTimestamp
    const totalTimePlayed = sessionTime + player.timePlayed
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
    await this.#repo.setTimePlayed(player.login, totalTimePlayed)
    this.#players = this.#players.filter(p => p.login !== player.login)
  }

  get players () {
    return this.#players
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

export default PlayerService
