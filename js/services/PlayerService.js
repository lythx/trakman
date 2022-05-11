'use strict'
import Client from '../Client.js'
import PlayerRepository from '../database/PlayerRepository.js'
import Logger from '../Logger.js'
import Players from '../Players.js'

class PlayerService {
  #repo

  async initialize () {
    this.#repo = new PlayerRepository()
    await this.#repo.initialize()
  }

  async addAllFromList () {
    const playerList = await Client.call('GetPlayerList', [{ int: 250 }, { int: 0 }])
    for (const player of playerList) {
      const detailedPlayerInfo = await Client.call('GetDetailedPlayerInfo', [{ string: player.Login }])
      await Players.join(player.Login, player.NickName, detailedPlayerInfo[0].Path)
    }
  }

  async get (login) {
    Logger.warn(JSON.stringify(this.#repo))
    return await this.#repo.get(login)
  }

  async add (player) {
    return await this.#repo.add(player)
  }

  async update (player) {
    return await this.#repo.update(player)
  }

  async setTimePlayed (login, timePlayed) {
    return await this.#repo.setTimePlayed(login, timePlayed)
  }
}

export default PlayerService
