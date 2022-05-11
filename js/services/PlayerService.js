'use strict'
import countries from '../data/Countries.js'
import PlayerRepository from '../database/PlayerRepository.js'
import Chat from '../plugins/Chat.js'

class PlayerService {
  #players = []
  #repo

  constructor () {
    this.#repo = new PlayerRepository()
  }

  async add (login, nickName, path) {
    const nation = path.split('|')[1]
    const nationCode = countries.find(a => a.name === path.split('|')[1]).code
    const playerData = await this.#repo.get(login)
    const player = new Player(login, nickName, nation, nationCode)
    if (playerData.length === 0) {
      await this.#repo.add(player)
    } else {
      player.wins = playerData[0].wins
      player.timePlayed = playerData[0].timeplayed
      await this.#repo.update(player)
    }
    this.#players.push(player)
    Chat.sendJoinMessage(nickName)
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

  constructor (login, nickName, nation, nationCode) {
    this.#login = login
    this.#nickName = nickName
    this.#nation = nation
    this.#nationCode = nationCode
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
}

export default PlayerService
