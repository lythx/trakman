import { TRAKMAN as TM } from '../../../src/Trakman.js'
import PopupWindow from '../PopupWindow.js'
import { CONFIG, Grid, ICONS, IDS, GridCellFunction, stringToObjectProperty, centeredText, closeButton } from '../UiUtils.js'

export default class WelcomeWindow extends PopupWindow {

  readonly grid: Grid
  readonly welcomedPlayers: string[] = []

  constructor() {
    super(IDS.welcomeWindow, stringToObjectProperty(CONFIG.welcomeWindow.icon, ICONS), CONFIG.welcomeWindow.title, ['commandList'])
    this.grid = new Grid(this.contentWidth, this.contentHeight, [1, 1], [1], { background: CONFIG.grid.bg, margin: 1 })
    TM.addListener('Controller.PlayerJoin', (info) => {
      if (this.welcomedPlayers.includes(info.login) === false) {
        this.welcomedPlayers.push(info.login)
        TM.openManialink(this.openId, info.login)
        void TM.queryDB('INSERT INTO welcomed_players(login) VALUES($1)', info.login)
      }
    })
    void this.initializeDb()
  }

  async initializeDb() {
    await TM.queryDB(`CREATE TABLE IF NOT EXISTS welcomed_players(
    login VARCHAR(25) NOT NULL PRIMARY KEY)`)
    const res = await TM.queryDB('SELECT login FROM welcomed_players')
    if (!(res instanceof Error)) {
      this.welcomedPlayers.push(...res.map(a => a.login))
    }
  }

  protected constructContent(): string {
    const left: GridCellFunction = (i, j, w, h) => {
      return `<format textsize="1"/>
      ${centeredText("About the controller", w, 3, { textScale: 2, yOffset: 0.8 })}
      <label posn="1 -6 5" sizen="150 3.5" scale="1.2" text="TRAKMAN is a new TypeScript based controller. 
It was made in just about 3 months, by 4 main developers:
- Ciekma
- Wiseraven
- Snake
- Borec"/>
      <label posn="1 -21 5" sizen="150 3.5" scale="1.2" text="The controller features a variety of new things such as:
- faster loading times
- easier usability
- responsable interface
- better language
And much more!"/>
      <label posn="1 -36 5" sizen="150 3.5" scale="1.2" text="Keep in mind, the controller is still in its early stages,
and bugs will occur.
If you do happen to notice any bugs,
you can report them using the /bug [report] command."/>`
    }
    const right: GridCellFunction = (i, j, w, h) => {
      return `<format textsize="1"/>
      ${centeredText("A bit of history", w, 3, { textScale: 2, yOffset: 0.8 })}
      <label posn="1 -6 5" sizen="150 3.5" scale="1.2" text="The project initally started as somewhat of a joke,
but as we went on, we realised how much we can actually do.
So we decided to make it a real thing,
and dedicate our time to it."/>
      <label posn="1 -17 5" sizen="150 3.5" scale="1.2" text="We initally thought that we were going to rewrite XASECO
in its entirety, but that turned out not to be the case,
since XASECO uses a lot of old and deprecated methods,
and its overall look and code is unmaintanable."/>
      <label posn="1 -28 5" sizen="150 3.5" scale="1.2" text="That necessarily doesn't mean its a bad controller,
just that its not 'up to date'.
We tried to make everything as best as possible,
which was a painstakingly long process, but it sure paid off."/>`
    }
    return this.grid.constructXml([left, right])
  }

  protected constructFooter(): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight)
  }

}