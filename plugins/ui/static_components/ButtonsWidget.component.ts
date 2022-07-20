import { calculateStaticPositionY, CONFIG, IDS, Grid, constuctButton, ICONS, stringToObjectProperty, VoteWindow } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

export default class VisitorAmount extends StaticComponent {

  private readonly width: number
  private readonly height: number
  private readonly positionX: number
  private readonly positionY: number
  private readonly iconData: { icon: string, text1: string, text2: string, iconWidth: number, iconHeight: number, padding: number, equalTexts?: true, actionId?: number, link?: string }[] = []
  private xml: string = ''
  private readonly grid: Grid
  private readonly config = CONFIG.buttons
  private readonly skipCost = this.config.paySkip.cost
  private readonly resCosts = this.config.payRes.costs
  private resCostIndex = 0
  private resVoteCount = 0
  private isRes = false
  private lastMapRes = false

  constructor() {
    super(IDS.buttons, { displayOnRace: true, hideOnResult: true })
    this.width = CONFIG.static.width
    this.height = this.config.height
    this.positionX = CONFIG.static.leftPosition
    this.positionY = calculateStaticPositionY('buttons')
    this.grid = new Grid(this.width + CONFIG.static.marginSmall, this.height + CONFIG.static.marginSmall, new Array(4).fill(1), new Array(3).fill(1))
  }

  async display(): Promise<void> {
    if (this.xml === '') { await this.initialize() }
    this.constructXml()
    this._isDisplayed = true
    TM.sendManialink(this.xml)
  }


  displayToPlayer(login: string): void {
    TM.sendManialink(this.xml, login)
  }

  private constructXml(): void {
    const arr: ((i: number, j: number, w: number, h: number) => string)[] = []
    const marginSmall: number = CONFIG.static.marginSmall
    for (const e of this.iconData) {
      arr.push((i: number, j: number, w: number, h: number): string =>
        constuctButton(e.icon, CONFIG.static.format + e.text1, CONFIG.static.format + e.text2, w - marginSmall,
          h - marginSmall, e.iconWidth, e.iconHeight, e.padding, { equalTexts: e.equalTexts, actionId: e.actionId, link: e.link }))
    }
    this.xml = `<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        ${this.grid.constructXml(arr)}
      </frame>
    </manialink>`
  }

  private pollTimeUpdate(timeString: string) {
    setInterval(() => {
      const newTimeString = `${new Date().getUTCHours().toString().padStart(2, '0')}:${new Date().getUTCMinutes().toString().padStart(2, '0')}`
      if (timeString !== newTimeString) {
        timeString = newTimeString
        if (this._isDisplayed === true) {
          const cfg = this.config.time
          this.iconData[cfg.index].text1 = timeString
          void this.display()
        }
      }
    }, 1000)
  }

  private updatePlayerCount() {
    const players = TM.players
    this.iconData[this.config.players.index].text1 = `${players.filter(a => a.isSpectator === true).length} SPECS`
    this.iconData[this.config.players.index].text2 = `${players.filter(a => a.isSpectator === false).length} PLAYERS`
  }

  private setupListeners() {
    TM.addListener('Controller.PlayerJoin', (info: JoinInfo) => {
      this.updatePlayerCount()
      if (info.visits === 0) {
        const prevAmount = Number(this.iconData[this.config.visitors.index].text1)
        this.iconData[this.config.visitors.index].text1 = (prevAmount + 1).toString()
      }
      if (this._isDisplayed === true) { void this.display() }
    })
    TM.addListener('Controller.PlayerLeave', () => {
      this.updatePlayerCount()
      if (this._isDisplayed === true) { void this.display() }
    })
    TM.addListener('Controller.PlayerInfoChanged', () => {
      this.updatePlayerCount()
      if (this._isDisplayed === true) { void this.display() }
    })
    TM.addListener('Controller.BeginMap', () => {
      this.lastMapRes = false
      if (this.isRes === true) {
        this.isRes = false
        this.lastMapRes = true
      }
      this.updateVoteAndPayButtons()
      if (this._isDisplayed === true) { void this.display() }
    })
    TM.addListener('Controller.ManialinkClick', async (info: ManialinkClickInfo): Promise<void> => {
      switch (info.answer - this.id) {
        case 1: this.onSkipVoteButtonClick(info.login, info.nickname)
          break
        case 2: this.onResVoteButtonClick(info.login, info.nickname)
          break
        case 3: this.onSkipButtonClick(info.login, info.nickname)
          break
        case 4: this.onResButtonClick(info.login, info.nickname)
      }
    })
    TM.addListener('Controller.MapAdded', () => {
      this.iconData[this.config.maps.index].text1 = (TM.maps.length).toString()
    })
    TM.addListener('Controller.MapRemoved', () => {
      this.iconData[this.config.maps.index].text1 = (TM.maps.length).toString()
    })
  }

  private async onSkipVoteButtonClick(login: string, nickname: string) {
    const voteWindow = new VoteWindow(login, 0.5, 'Vote to $F00SKIP$FFF the ongoing map', 7, 'voteRed')
    const result = await voteWindow.startAndGetResult(TM.players.map(a => a.login))
    if (result === undefined) {
      TM.sendMessage('Vote is already running', login)
      return
    }
    TM.sendMessage(`${nickname}$z$s started a vote to skip the ongoing map`)
    if (result === false) {
      TM.sendMessage('Vote to skip the ongoing map did not pass')
    } else if (result === true) {
      TM.sendMessage('Vote to skip the ongoing map passed')
      TM.callNoRes('NextChallenge')
    } else if (result.result === true) {
      const player = TM.getPlayer(result.callerLogin)
      TM.sendMessage(`${TM.strip(player?.nickname ?? result.callerLogin, false)}$z$s has passed the vote to skip the ongoing map`, login)
      TM.callNoRes('NextChallenge')
    } else {
      const player = TM.getPlayer(result.callerLogin)
      TM.sendMessage(`${TM.strip(player?.nickname ?? result.callerLogin, false)}$z$s has cancelled the vote to skip the ongoing map`, login)
    }
  }

  private async onResVoteButtonClick(login: string, nickname: string) {
    const voteWindow = new VoteWindow(login, 0.5, 'Vote to $0F0REPLAY$FFF the ongoing map', 7, 'voteGreen')
    const result = await voteWindow.startAndGetResult(TM.players.map(a => a.login))
    if (result === undefined) {
      TM.sendMessage('Vote is already running', login)
      return
    }
    TM.sendMessage(`${nickname}$z$s started a vote to replay the ongoing map`)
    if (result === false) {
      TM.sendMessage('Vote to replay the ongoing map did not pass')
    } else if (result === true) {
      TM.sendMessage('Vote to replay the ongoing map passed')
      TM.addToJukebox(TM.map.id, undefined, true)
      this.resVoteCount++
      this.isRes = true
      this.onMapReplay()
      this.constructXml()
      this.display()
    } else if (result.result === true) {
      const player = TM.getPlayer(result.callerLogin)
      TM.sendMessage(`${TM.strip(player?.nickname ?? result.callerLogin, false)}$z$s has passed the vote to replay the ongoing map`, login)
      TM.addToJukebox(TM.map.id, undefined, true)
      this.resVoteCount++
      this.isRes = true
      this.onMapReplay()
      this.constructXml()
      this.display()
    } else {
      const player = TM.getPlayer(result.callerLogin)
      TM.sendMessage(`${TM.strip(player?.nickname ?? result.callerLogin, false)}$z$s has cancelled the vote to replay the ongoing map`, login)
    }
  }

  private onSkipButtonClick = async (login: string, nickname: string): Promise<void> => {
    const res = await TM.sendCoppers(login, this.skipCost, 'Pay to skip the ongoing map')
    if (res instanceof Error) {
      TM.sendMessage(`${TM.palette.error}Failed to pay for map skip.`)
    } else if (res === true) {
      const cfg = this.config.paySkip
      let countDown = cfg.timeout
      const startTime = Date.now()
      TM.sendMessage(`${nickname}$z$s${TM.palette.donation} paid ${this.skipCost} to skip the ongoing map. Skipping in ${countDown}`)
      TM.addToJukebox(TM.map.id, login)
      this.iconData[cfg.index].text1 = cfg.title3
      this.iconData[cfg.index].text2 = cfg.title4.replace(/\$SECONDS\$/, countDown.toString())
      if (this._isDisplayed === true) { await this.display() }
      const interval = setInterval(async () => {
        if (Date.now() > startTime + 1000 * (cfg.timeout - countDown)) { // TODO HANDLE CHALLENGE ENDING BEFORE COUNTDOWN
          countDown--
          this.iconData[cfg.index].text1 = cfg.title3
          this.iconData[cfg.index].text2 = cfg.title4.replace(/\$SECONDS\$/, countDown.toString())
          if (this._isDisplayed === true) { await this.display() }
          if (countDown === 0) {
            TM.callNoRes('NextChallenge')
            clearInterval(interval)
          }
        }
      }, 100)
    }
  }

  private onResButtonClick = async (login: string, nickname: string): Promise<void> => {
    const cost = this.resCosts[this.resCostIndex]
    if (cost === undefined) { return }
    const res = await TM.sendCoppers(login, cost, 'Pay to restart the ongoing map')
    if (res instanceof Error) {
      TM.sendMessage(`${TM.palette.error}Failed to pay for map restart.`)
    } else if (res === true) {
      TM.sendMessage(`${nickname}$s$z${TM.palette.donation} paid ${cost} to restart the ongoing map.`)
      TM.addToJukebox(TM.map.id, login)
      this.resCostIndex++
      this.isRes = true
      this.onMapReplay()
      if (this._isDisplayed === true) { void this.display() }
    }
  }

  private onMapReplay() {
    this.iconData[this.config.payRes.index].text1 = this.config.payRes.title5
    this.iconData[this.config.payRes.index].text2 = this.config.payRes.title6
    this.iconData[this.config.payRes.index].equalTexts = true
    this.iconData[this.config.payRes.index].actionId = undefined

    this.iconData[this.config.paySkip.index].text1 = this.config.paySkip.title5
    this.iconData[this.config.paySkip.index].text2 = this.config.paySkip.title6
    this.iconData[this.config.paySkip.index].equalTexts = true
    this.iconData[this.config.paySkip.index].actionId = undefined

    this.iconData[this.config.voteRes.index].text1 = this.config.voteRes.title3
    this.iconData[this.config.voteRes.index].text2 = this.config.voteRes.title4
    this.iconData[this.config.voteRes.index].equalTexts = true
    this.iconData[this.config.voteRes.index].actionId = undefined

    this.iconData[this.config.voteSkip.index].text1 = this.config.voteSkip.title3
    this.iconData[this.config.voteSkip.index].text2 = this.config.voteSkip.title4
    this.iconData[this.config.voteSkip.index].equalTexts = true
    this.iconData[this.config.voteSkip.index].actionId = undefined
  }

  private updateVoteAndPayButtons() {
    const cfg = this.config
    if (this.resCosts[this.resCostIndex] !== undefined) {
      // If map wasn't resd
      if (this.isRes === false && this.lastMapRes === false) {
        // Vote to skip
        this.iconData[cfg.voteSkip.index] = {
          icon: stringToObjectProperty(cfg.voteSkip.icon, ICONS),
          text1: cfg.voteSkip.title1,
          text2: cfg.voteSkip.title2,
          iconWidth: cfg.voteSkip.width,
          iconHeight: cfg.voteSkip.height,
          padding: cfg.voteSkip.padding,
          actionId: this.id + 1
        }
        // Pay to skip
        this.iconData[cfg.paySkip.index] = {
          icon: stringToObjectProperty(cfg.paySkip.icon, ICONS),
          text1: cfg.paySkip.title1.replace(/\$COST\$/, this.skipCost.toString()),
          text2: cfg.paySkip.title2,
          iconWidth: cfg.paySkip.width,
          iconHeight: cfg.paySkip.height,
          padding: cfg.paySkip.padding,
          actionId: this.id + 3
        }
      } else { // If map was res'd
        // Vote to skip
        this.iconData[cfg.voteSkip.index] = {
          icon: stringToObjectProperty(cfg.voteSkip.icon, ICONS),
          text1: cfg.voteSkip.title3,
          text2: cfg.voteSkip.title4,
          iconWidth: cfg.voteSkip.width,
          iconHeight: cfg.voteSkip.height,
          padding: cfg.voteSkip.padding,
          equalTexts: true
        }
        // Pay to skip
        this.iconData[cfg.paySkip.index] = {
          icon: stringToObjectProperty(cfg.paySkip.icon, ICONS),
          text1: cfg.paySkip.title5,
          text2: cfg.paySkip.title6,
          iconWidth: cfg.paySkip.width,
          iconHeight: cfg.paySkip.height,
          padding: cfg.paySkip.padding,
          equalTexts: true
        }
      }
      // Vote to replay
      this.iconData[cfg.voteRes.index] = {
        icon: stringToObjectProperty(cfg.voteRes.icon, ICONS),
        text1: cfg.voteRes.title1,
        text2: cfg.voteRes.title2,
        iconWidth: cfg.voteRes.width,
        iconHeight: cfg.voteRes.height,
        padding: cfg.voteRes.padding,
        actionId: this.id + 2
      }
      // Pay to replay
      this.iconData[cfg.payRes.index] = {
        icon: stringToObjectProperty(cfg.payRes.icon, ICONS),
        text1: cfg.payRes.title1.replace(/\$COST\$/, this.resCosts[this.resCostIndex].toString()),
        text2: cfg.payRes.title2,
        iconWidth: cfg.payRes.width,
        iconHeight: cfg.payRes.height,
        padding: cfg.payRes.padding,
        actionId: this.id + 4
      }
    } else {
      this.iconData[cfg.voteRes.index] = {
        icon: stringToObjectProperty(cfg.voteRes.icon, ICONS),
        text1: cfg.voteRes.title3,
        text2: cfg.voteRes.title4,
        iconWidth: cfg.voteRes.width,
        iconHeight: cfg.voteRes.height,
        padding: cfg.voteRes.padding,
        equalTexts: true
      }
      this.iconData[cfg.paySkip.index] = {
        icon: stringToObjectProperty(cfg.voteRes.icon, ICONS),
        text1: cfg.voteRes.title3,
        text2: cfg.voteRes.title4,
        iconWidth: cfg.voteRes.width,
        iconHeight: cfg.voteRes.height,
        padding: cfg.voteRes.padding,
        equalTexts: true
      }
      // Vote to skip
      this.iconData[cfg.voteSkip.index] = {
        icon: stringToObjectProperty(cfg.voteSkip.icon, ICONS),
        text1: cfg.voteSkip.title3,
        text2: cfg.voteSkip.title4,
        iconWidth: cfg.voteSkip.width,
        iconHeight: cfg.voteSkip.height,
        padding: cfg.voteSkip.padding,
        equalTexts: true
      }
      // Pay to skip
      this.iconData[cfg.paySkip.index] = {
        icon: stringToObjectProperty(cfg.paySkip.icon, ICONS),
        text1: cfg.paySkip.title3,
        text2: cfg.paySkip.title4,
        iconWidth: cfg.paySkip.width,
        iconHeight: cfg.paySkip.height,
        padding: cfg.paySkip.padding,
        equalTexts: true
      }
    }
  }

  private initialize = async (): Promise<void> => {
    // Visit counter
    const res: any[] | Error = await TM.queryDB('SELECT count(*) FROM players;')
    if (res instanceof Error) {
      throw new Error('Failed to fetch players from database.')
    }
    const cfg = this.config
    this.iconData[cfg.visitors.index] = {
      icon: stringToObjectProperty(cfg.visitors.icon, ICONS),
      text1: res[0].count,
      text2: cfg.visitors.title,
      iconWidth: cfg.visitors.width,
      iconHeight: cfg.visitors.height,
      padding: cfg.visitors.padding
    }
    // Player and spectator counter
    const all: TMPlayer[] = TM.players
    const players: number = all.filter(a => !a.isSpectator).length
    this.iconData[cfg.players.index] = {
      icon: stringToObjectProperty(cfg.players.icon, ICONS),
      text1: `${all.length - players} ${cfg.players.title1}`,
      text2: `${players} ${cfg.players.title2}`,
      iconWidth: cfg.players.width,
      iconHeight: cfg.players.height,
      padding: cfg.players.padding,
      equalTexts: true
    }
    // Version
    this.iconData[cfg.version.index] = {
      icon: stringToObjectProperty(cfg.version.icon, ICONS),
      text1: '0.0.1',
      text2: cfg.version.title,
      iconWidth: cfg.version.width,
      iconHeight: cfg.version.height,
      padding: cfg.version.padding,
    }
    // Time
    const timeString = `${new Date().getUTCHours().toString().padStart(2, '0')}:${new Date().getUTCMinutes().toString().padStart(2, '0')}`
    this.iconData[cfg.time.index] = {
      icon: stringToObjectProperty(cfg.time.icon, ICONS),
      text1: timeString,
      text2: cfg.time.title,
      iconWidth: cfg.time.width,
      iconHeight: cfg.time.height,
      padding: cfg.time.padding,
    }
    // Map list
    this.iconData[cfg.maps.index] = {
      icon: stringToObjectProperty(cfg.maps.icon, ICONS),
      text1: TM.maps.length.toString(),
      text2: cfg.maps.title,
      iconWidth: cfg.maps.width,
      iconHeight: cfg.maps.height,
      padding: cfg.maps.padding,
      actionId: IDS.mapList
    }
    // Stats
    this.iconData[cfg.stats.index] = {
      icon: stringToObjectProperty(cfg.stats.icon, ICONS),
      text1: cfg.stats.title1,
      text2: cfg.stats.title2,
      iconWidth: cfg.stats.width,
      iconHeight: cfg.stats.height,
      padding: cfg.stats.padding,
      actionId: IDS.localCps,
      equalTexts: true
    }
    // Sector records
    this.iconData[cfg.sectorRecords.index] = {
      icon: stringToObjectProperty(cfg.sectorRecords.icon, ICONS),
      text1: cfg.sectorRecords.title1,
      text2: cfg.sectorRecords.title2,
      iconWidth: cfg.sectorRecords.width,
      iconHeight: cfg.sectorRecords.height,
      padding: cfg.sectorRecords.padding,
      actionId: IDS.dediCps,
      equalTexts: true
    }
    // Github repo
    this.iconData[cfg.github.index] = {
      icon: stringToObjectProperty(cfg.github.icon, ICONS),
      text1: cfg.github.title1,
      text2: cfg.github.title2,
      iconWidth: cfg.github.width,
      iconHeight: cfg.github.height,
      padding: cfg.github.padding,
      link: `github.com/felacek/trakman/`,
      equalTexts: true
    }
    this.updateVoteAndPayButtons()
    this.pollTimeUpdate(timeString)
    this.setupListeners()
  }

}
