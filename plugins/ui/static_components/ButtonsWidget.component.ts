import { getStaticPosition, CONFIG, IDS, Grid, constuctButton, ICONS, stringToObjectProperty, VoteWindow } from '../UiUtils.js'
import { trakman as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'
import Config from '../../../config.json' assert { type: 'json' }

export default class ButtonsWidget extends StaticComponent {

  private readonly config = CONFIG.buttons
  private readonly width: number = CONFIG.static.width
  private readonly height: number = this.config.height
  private readonly positionX: number
  private readonly positionY: number
  private readonly iconData: { icon: string, text1: string, text2: string, iconWidth: number, iconHeight: number, padding: number, equalTexts?: true, actionId?: number, link?: string }[] = []
  private xml: string = ''
  private readonly grid: Grid
  private readonly skipCost: number = this.config.paySkip.cost
  private readonly resCosts: number[] = this.config.payRes.costs
  private resCostIndex: number = 0
  private resVoteCount: number = 0
  private skipVoteCount: number = 0
  private isRes: boolean = false
  private lastMapRes: boolean = false

  constructor() {
    super(IDS.buttons, 'race')
    const pos = getStaticPosition('buttons')
    this.positionX = pos.x
    this.positionY = pos.y
    this.grid = new Grid(this.width + CONFIG.marginSmall, this.height + CONFIG.marginSmall, new Array(4).fill(1), new Array(3).fill(1))
    TM.commands.add({
      aliases: ['s', 'skip'],
      help: 'Start a vote to skip the ongoing map',
      callback: info => {
        this.onSkipVoteButtonClick(info.login, info.nickname)
      },
      privilege: 0
    })
    TM.commands.add({
      aliases: ['r', 'res', 'replay'],
      help: 'Start a vote to replay the ongoing map',
      callback: info => {
        this.onResVoteButtonClick(info.login, info.nickname)
      },
      privilege: 0
    })
  }

  async display(): Promise<void> {
    if (this.isDisplayed === false) { return }
    if (this.xml === '') { await this.initialize() }
    this.constructXml()
    TM.sendManialink(this.xml)
  }


  displayToPlayer(login: string): void {
    if (this.isDisplayed === false) { return }
    TM.sendManialink(this.xml, login)
  }

  private constructXml(): void {
    const arr: ((i: number, j: number, w: number, h: number) => string)[] = []
    const marginSmall: number = CONFIG.marginSmall
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

  private pollTimeUpdate(timeString: string): void {
    setInterval((): void => {
      const newTimeString: string = `${new Date().getUTCHours().toString().padStart(2, '0')}:${new Date().getUTCMinutes().toString().padStart(2, '0')}`
      if (timeString !== newTimeString) {
        timeString = newTimeString
        const cfg = this.config.time
        this.iconData[cfg.index].text1 = timeString
        void this.display()
      }
    }, 1000)
  }

  private updatePlayerCount(): void {
    const players: TMPlayer[] = TM.players.list
    this.iconData[this.config.players.index].text1 = `${players.filter(a => a.isSpectator === true).length} SPECS`
    this.iconData[this.config.players.index].text2 = `${players.filter(a => a.isSpectator === false).length} PLAYERS`
  }

  private setupListeners(): void {
    TM.addListener('Controller.PlayerJoin', (info: JoinInfo): void => {
      this.updatePlayerCount()
      if (info.visits === 0) {
        const prevAmount: number = Number(this.iconData[this.config.visitors.index].text1)
        this.iconData[this.config.visitors.index].text1 = (prevAmount + 1).toString()
      }
      void this.display()
    })
    TM.addListener('Controller.PlayerLeave', (): void => {
      this.updatePlayerCount()
      void this.display()
    })
    TM.addListener('Controller.PlayerInfoChanged', (): void => {
      this.updatePlayerCount()
      void this.display()
    })
    TM.addListener('Controller.BeginMap', (): void => {
      this.resVoteCount = 0
      this.skipVoteCount = 0
      this.lastMapRes = false
      if (this.isRes === true) {
        this.isRes = false
        this.lastMapRes = true
      }
      this.updateVoteAndPayButtons()
      void this.display()
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
    TM.addListener('Controller.MapAdded', (): void => {
      this.iconData[this.config.maps.index].text1 = (TM.maps.list.length).toString()
    })
    TM.addListener('Controller.MapRemoved', (): void => {
      this.iconData[this.config.maps.index].text1 = (TM.maps.list.length).toString()
    })
  }

  private async onSkipVoteButtonClick(login: string, nickname: string): Promise<void> {
    if (this.lastMapRes) { return }
    if (this.skipVoteCount === 2) {
      TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Too many votes failed.`, login)
      return
    }
    const startMsg: string = `${TM.utils.palette.server}»» ${TM.utils.palette.highlight + TM.utils.strip(nickname)} `
      + `${TM.utils.palette.vote}started a vote to ${TM.utils.palette.highlight}skip ${TM.utils.palette.vote}the ongoing map.`
    if (TM.state.remainingMapTime <= 30) { return }
    const voteWindow: VoteWindow = new VoteWindow(login, 0.5, `${TM.utils.palette.highlight}Vote to ${TM.utils.palette.tmRed}SKIP${TM.utils.palette.highlight} the ongoing map`, startMsg, 30, 'voteRed')
    const result = await voteWindow.startAndGetResult(TM.players.list.map(a => a.login))
    if (result === undefined) {
      TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}A vote is already running.`, login)
      return
    }
    this.skipVoteCount++
    if (result === false) {
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.vote}Vote to ${TM.utils.palette.highlight}skip `
        + `${TM.utils.palette.vote}the ongoing map ${TM.utils.palette.highlight}did not pass${TM.utils.palette.vote}.`)
    } else if (result === true) {
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.vote}Vote to ${TM.utils.palette.highlight}skip `
        + `${TM.utils.palette.vote}the ongoing map ${TM.utils.palette.highlight}has passed${TM.utils.palette.vote}.`)
      TM.client.callNoRes('NextChallenge')
    } else if (result.result === true) {
      if (result.callerLogin === undefined) {
        TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin} Vote to skip the ongoing map passed`)
      } else {
        const player: TMPlayer | undefined = TM.players.get(result.callerLogin)
        if (player === undefined) { return }
        TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(player)} `
          + `${TM.utils.palette.highlight + TM.utils.strip(player?.nickname ?? result.callerLogin, true)}${TM.utils.palette.admin} has passed the vote to skip the ongoing map`)
      }
      TM.client.callNoRes('NextChallenge')
    } else {
      if (result.callerLogin === undefined) {
        TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin} Vote to skip the ongoing was cancelled`)
      } else {
        const player: TMPlayer | undefined = TM.players.get(result.callerLogin)
        if (player === undefined) { return }
        TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(player)} `
          + `${TM.utils.palette.highlight + TM.utils.strip(player?.nickname ?? result.callerLogin, true)}${TM.utils.palette.admin} has cancelled the vote to skip the ongoing map`)
      }
    }
  }

  private async onResVoteButtonClick(login: string, nickname: string): Promise<void> {
    if (this.resVoteCount === 2) {
      TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Too many votes failed.`, login)
      return
    }
    const startMsg: string = `${TM.utils.palette.server}»» ${TM.utils.palette.highlight + TM.utils.strip(nickname)} `
      + `${TM.utils.palette.vote}started a vote to ${TM.utils.palette.highlight}replay ${TM.utils.palette.vote}the ongoing map.`
    if (TM.state.remainingMapTime <= 30) { return }
    const voteWindow: VoteWindow = new VoteWindow(login, 0.5, `${TM.utils.palette.highlight}Vote to ${TM.utils.palette.tmGreen}REPLAY${TM.utils.palette.highlight} the ongoing map`, startMsg, 30, 'voteGreen')
    const result = await voteWindow.startAndGetResult(TM.players.list.map(a => a.login))
    if (result === undefined) {
      TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}A vote is already running.`, login)
      return
    }
    this.resVoteCount++
    if (result === false) {
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.vote}Vote to ${TM.utils.palette.highlight}replay `
        + `${TM.utils.palette.vote}the ongoing map ${TM.utils.palette.highlight}did not pass${TM.utils.palette.vote}.`)
    } else if (result === true) {
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.vote}Vote to ${TM.utils.palette.highlight}replay `
        + `${TM.utils.palette.vote}the ongoing map ${TM.utils.palette.highlight}has passed${TM.utils.palette.vote}.`)
      TM.jukebox.add(TM.maps.current.id, undefined, true)
      this.resVoteCount++
      this.isRes = true
      this.onMapReplay()
      this.constructXml()
      this.display()
    } else if (result.result === true) {
      if (result.callerLogin === undefined) {
        TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin} Vote to replay the ongoing map passed`)
      } else {
        const player: TMPlayer | undefined = TM.players.get(result.callerLogin)
        if (player === undefined) { return }
        TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(player)} `
          + `${TM.utils.palette.highlight + TM.utils.strip(player.nickname, true)}${TM.utils.palette.admin} has passed the vote to replay the ongoing map`)
        TM.jukebox.add(TM.maps.current.id, undefined, true)
      }
      this.resVoteCount++
      this.isRes = true
      this.onMapReplay()
      this.constructXml()
      this.display()
    } else {
      if (result.callerLogin === undefined) {
        TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin} Vote to replay the ongoing map was cancelled`)
      } else {
        const player: TMPlayer | undefined = TM.players.get(result.callerLogin)
        if (player === undefined) { return }
        TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(player)} `
          + `${TM.utils.palette.highlight + TM.utils.strip(player.nickname, true)}${TM.utils.palette.admin} has cancelled the vote to replay the ongoing map`)
      }
    }
  }

  private onSkipButtonClick = async (login: string, nickname: string): Promise<void> => {
    if (this.lastMapRes) { return }
    const res: boolean | Error = await TM.utils.sendCoppers(login, this.skipCost, 'Pay to skip the ongoing map')
    if (res instanceof Error) {
      TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Failed to process payment.`)
    } else if (res === true) {
      const cfg = this.config.paySkip
      let countDown: number = cfg.timeout
      const startTime: number = Date.now()
      TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.highlight + TM.utils.strip(nickname)}${TM.utils.palette.donation} has paid ${TM.utils.palette.highlight}`
        + `${this.skipCost}C ${TM.utils.palette.donation}to skip the ongoing map. Skipping in ${TM.utils.palette.highlight}${countDown}s${TM.utils.palette.donation}.`)
      this.iconData[cfg.index].text1 = cfg.title3
      this.iconData[cfg.index].text2 = cfg.title4.replace(/\$SECONDS\$/, countDown.toString())
      await this.display()
      const interval = setInterval(async (): Promise<void> => {
        if (Date.now() > startTime + 1000 * (cfg.timeout - countDown)) { // TODO HANDLE CHALLENGE ENDING BEFORE COUNTDOWN
          countDown--
          this.iconData[cfg.index].text1 = cfg.title3
          this.iconData[cfg.index].text2 = cfg.title4.replace(/\$SECONDS\$/, countDown.toString())
          await this.display()
          if (countDown === 0) {
            TM.client.callNoRes('NextChallenge')
            clearInterval(interval)
          }
        }
      }, 100)
    }
  }

  private onResButtonClick = async (login: string, nickname: string): Promise<void> => {
    const cost: number = this.resCosts[this.resCostIndex]
    if (cost === undefined) { return }
    const res: boolean | Error = await TM.utils.sendCoppers(login, cost, 'Pay to restart the ongoing map')
    if (res instanceof Error) {
      TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Failed to process payment.`)
    } else if (res === true) {
      TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.highlight + TM.utils.strip(nickname)}${TM.utils.palette.donation} has paid ${TM.utils.palette.highlight}`
        + `${cost}C ${TM.utils.palette.donation}to replay the ongoing map.`)
      TM.jukebox.add(TM.maps.current.id, login)
      this.resCostIndex++
      this.isRes = true
      this.onMapReplay()
      void this.display()
    }
  }

  private onMapReplay(): void {
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

  private updateVoteAndPayButtons(): void {
    const cfg = this.config
    if (this.resCosts[this.resCostIndex] !== undefined) {
      // If map wasn't resd
      if (this.isRes === false && this.lastMapRes === false) {
        // Vote to skip
        this.resCostIndex = 0
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
    const res: any[] | Error = await TM.db.query('SELECT count(*) FROM players;')
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
    const all: TMPlayer[] = TM.players.list
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
      text1: Config.version,
      text2: cfg.version.title,
      iconWidth: cfg.version.width,
      iconHeight: cfg.version.height,
      padding: cfg.version.padding,
      actionId: IDS.changelog
    }
    // Time
    const timeString: string = `${new Date().getUTCHours().toString().padStart(2, '0')}:${new Date().getUTCMinutes().toString().padStart(2, '0')}`
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
      text1: TM.maps.list.length.toString(),
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
      //actionId: IDS.localCps,
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
      actionId: IDS.sectorRecords,
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
      actionId: IDS.commandList,
      equalTexts: true
    }
    this.updateVoteAndPayButtons()
    this.pollTimeUpdate(timeString)
    this.setupListeners()
  }

}
