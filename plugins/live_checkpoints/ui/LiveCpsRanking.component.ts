import { RecordList, componentIds, StaticHeader, StaticComponent } from '../../ui/UI.js'
import config from './LiveCpsRanking.config.js'

interface PlayerCheckpointData {
  login: string
  nickname: string
  currentCp: number
  finished?: boolean
  time: number
  finishTime?: number
}

export default class LiveCpsRanking extends StaticComponent {

  private readonly header: StaticHeader
  private recordList!: RecordList
  private title!: string
  private playerData: Map<string, PlayerCheckpointData> = new Map()

  constructor() {
    super(componentIds.liveCpsRanking)
    this.header = new StaticHeader('race')
    this.getRecordList()
    for (const player of tm.players.list) {
      if (player.isSpectator) { continue }
      this.initPlayer(player)
    }
    tm.addListener('BeginMap', () => {
      for (const player of tm.players.list) {
        if (player.isSpectator) { continue }
        this.initPlayer(player)
      }
    })
    tm.addListener('EndMap', () => {
      this.playerData.clear()
    })
    this.renderOnEvent('PlayerInfoChanged', (info: tm.InfoChangedInfo) => {
      const player = tm.players.get(info.login)
      if (player?.isSpectator) {
        if (this.playerData.get(player.login) !== undefined) {
          this.playerData.delete(player.login)
        }
      } else {
        this.initPlayer(info)
      }
      return this.display()
    })
    this.renderOnEvent('PlayerJoin', (info: tm.JoinInfo) => {
      const player = tm.players.get(info.login)
      if (player?.isSpectator) { return }
      this.initPlayer(info)
      return this.display()
    })
    this.renderOnEvent('PlayerLeave', (info: tm.LeaveInfo) => {
      this.playerData.delete(info.login)
      return this.display()
    })
    this.renderOnEvent('TrackMania.PlayerFinish', ([, login, time]) => {
      const data = this.playerData.get(login)
      if (data) {
        data.finished = time !== 0 ? true : false
        data.finishTime = time
        data.time = time
        data.currentCp = -1
      }
      return this.display()
    })
    this.renderOnEvent('PlayerCheckpoint', (info: tm.CheckpointInfo) => {
      const data = this.playerData.get(info.player.login)
      if (data) {
        data.currentCp = info.index
        data.time = info.time
        data.finished = info.index === tm.maps.current.checkpointsAmount - 1 ? true : false
      }
      return this.display()
    })
    this.onPanelHide((player) => {
      this.sendMultipleManialinks(this.displayToPlayer(player.login))
    })
  }

  getEntries(): number {
    return config.entries
  }

  getHeight(): number {
    return config.entryHeight * this.getEntries() + StaticHeader.raceHeight + config.margin
  }

  getTopCount(): number {
    return config.topCount
  }

  display() {
    if (!this.isDisplayed) { return }
    if (this.reduxModeEnabled) { return this.displayToPlayer('')?.xml }
    const arr = []
    for (const player of tm.players.list) {
      arr.push(this.displayToPlayer(player.login))
    }
    return arr
  }

  displayToPlayer(login: string) {
    if (!this.isDisplayed) { return }
    if (config.hidePanel && this.hasPanelsHidden(login)) {
      return this.hideToPlayer(login)
    }
    const sorted = Array.from(this.playerData.values())
      .sort((a, b) => {
        if (a.finished !== b.finished) { // finishers always first
          return a.finished ? -1 : 1
        }
        if (a.finished && b.finished) { // 2 finishers sorted by time
          return (a.finishTime ?? 0) - (b.finishTime ?? 0)
        }
        if (a.currentCp !== b.currentCp) { // others sorted by cp index
          return b.currentCp - a.currentCp
        }
        return a.time - b.time // otherwise just use the time
      })
      .slice(0, this.getEntries())
    // infinity is used for finished runs, recordlist will display "F" as the index in this case
    // otherwise, the actual cp index is used instead of the default 1, 2, 3..
    const indices = sorted.map(a => a.finished ? Infinity : a.currentCp >= 0 ? a.currentCp : -1)
    const records = sorted.map(a => ({
      nickname: a.nickname,
      time: a.finished ? a.finishTime ?? 0 : (a.currentCp < 0 ? -1 : a.time),
      login: a.login,
      currentCp: a.currentCp,
      finished: a.finished
    }))
    let content: string
    this.title = config.title
    // actual cp times could be added but i dont think recordlist can handle the refresh in that case
    content = this.recordList.constructXml(this.reduxModeEnabled ? undefined : login, records
      .map(a => ({ name: a.nickname, time: a.time, login: a.login })), undefined, indices)
    return {
      xml: `<manialink id="${this.id}">
    <frame posn="${this.positionX} ${this.positionY} 1">
      <format textsize="1" textcolor="FFFF"/> 
        ${this.header.constructXml(this.title, config.icon, this.side)}
        <frame posn="0 -${this.header.options.height + config.margin} 1">
          ${content}
        </frame>
      </frame>
    </manialink>`,
      login
    }
  }

  private initPlayer({ login, nickname }: { login: string, nickname: string }): void {
    // using login instead of playerId as that can be overwritten with >=250 players
    this.playerData.set(login, {
      login: login,
      nickname: nickname,
      currentCp: -1,
      finished: false,
      time: 0
    })
  }

  private getRecordList(): void {
    const entries = this.getEntries()
    const height = this.getHeight()
    let dontParseTime = false
    let noRecordEntryText: string | undefined
    this.recordList?.destroy?.()
    this.recordList = new RecordList('race', this.id, config.width, height - (this.header.options.height + config.margin),
      entries, this.side, this.getTopCount(), tm.records.maxLocalsAmount, config.displayNoRecordEntry,
      { dontParseTime, noRecordEntryText })
    this.recordList.onClick((info: tm.ManialinkClickInfo): void => {
      if (this.reduxModeEnabled) { return }
      const obj = this.displayToPlayer(info.login)
      if (obj !== undefined) {
        tm.sendManialink(obj.xml, obj.login)
      }
    })
  }

  protected onPositionChange(): void {
    this.getRecordList()
    this.sendMultipleManialinks(this.display())
  }

}
