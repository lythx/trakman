# Popup Window tutorial
The goal of this tutorial is to make a simple plugin which displays window with live checkpoint times of every player in the server like this:
![](image)

Window should be displayed after clicking the Live Checkpoint widget which is covered in `this tutorial` or after typing /livecp command. If you didn't do that tutorial you can continue anyway using only the chat command.

First we add an id in ComponentIds.json file and config entry in UiConfig.json file. Entries is the maximum number of players that can be displayed on one page.
```json
{
  //...
  "currentCps": 80000
}
```
```json
{
  //...
  "currentCps": {
    "entries": 15,
    "icon": "clock",
    "title": "Current Checkpoints",
    "navbar": [
      "liveCps",
      "localCps",
      "dediCps"
    ],
    "columnProportions": [
      3,
      3,
      3,
      2,
      2
    ]
  }
}
```
Next lets add listeners for the window to be displayed. (skip this step if you didn't do previous tutorial) Open LiveCheckpoint file from static component tutorial and add a quad inside of first frame with full width and height, positions X and Y set to 0, position Z set to 6 and action set to our new window id. It will create an overlaying invisible manialink which will be on top on the window due to high Z position. Now whenever we click the window it will execute the actionID
```ts
// Add the quad
TM.sendManialink(`
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <quad posn="0 0 6" sizen="${this.width} ${this.height}" action="${IDS.currentCps}"/>
        ...
```
Now we add a chat command to display window in plugins/commands/UserCommands.ts. To get window ID we use TM.UIIDS object
```ts
const commands: TMCommand[] = [
  //other commands
  {
    aliases: ['ccp', 'currentcps'],
    help: 'Display each online players current cp.',
    callback: (info: MessageInfo): void => {
      TM.openManialink(TM.UIIDS.currentCps, info.login)
    },
    privilege: 0
  },
]
```
Next we create a CurrentCps.component.ts file in dynamic_components, import PopupWindow class from ui/PopupWindow.ts and extend our class with it. The popup window class has methods useful for windows and displays them automatically.
```ts
import PopupWindow from '../PopupWindow.js'

class CurrentCps extends PopupWindow {

}
```
We should see an error because we didn't implement abstract methods yet. Before we do that let's write a constructor. We take all params for super() method from config. We need to translate icon name to url using stringToObjectProperty function. Popup window will automatically construct the header from iconUrl and title, and navbar from the navbar array. What can be misleading though is id - all popup windows have the same id specified in UtilIds.json file (default is 0).
Because of that when we open a new window the previous one gets closed automatically. If we want to access the id used to open the component we need to use this.openId instead of this.id. Windows also have id dedicated to close them which can be accessed using this.closeId. It's declared in UtilIds tile and by default it's set to openId + 1.
```ts
import PopupWindow from '../PopupWindow.js'
import  { CONFIG, ICONS, IDS, stringToObjectProperty } from '../UiUtils.js'

export default class CurrentCps extends PopupWindow {

  constructor() {
    // Translate icon name to url
    const iconUrl = stringToObjectProperty(CONFIG.currentCps.icon, ICONS)
    super(IDS.currentCps, iconUrl, CONFIG.currentCps.title, CONFIG.currentCps.navbar)
  }

}
```
Next we implement the abstract methods constructContent() and constructFooter(). These methods should return xml which is going to be displayed in the middle and bottom part of window. After calling displayToPlayer() PopupWindow will call these methods passing the login and send entire window to dedicated server. For now let's return an empty string.
```ts
import PopupWindow from '../PopupWindow.js'
import { CONFIG, ICONS, IDS, stringToObjectProperty } from '../UiUtils.js'

export default class CurrentCps extends PopupWindow {

  constructor() {
    // Translate icon name to url
    const iconUrl = stringToObjectProperty(CONFIG.currentCps.icon, ICONS)
    super(IDS.currentCps, iconUrl, CONFIG.currentCps.title, CONFIG.currentCps.navbar)
  }

  protected constructContent(login: string, params: any): string {
    return ''
  }

  protected constructFooter(login: string, params: any): string {
    return ''
  }

}
```
After that we import our class into Ui.ts file and create its object in ControllerReady event listener in dyncamicComponents array
```ts
import CurrentCps from './dynamic_components/CurrentCps.component.js'
//...
const events: TMEvent[] = [
  {
    event: 'Controller.Ready',
    callback: async (): Promise<void> => {
      dynamicComponents.push(
        //... other components
        new CurrentCps()
      )
```
Now we build and restart our server. After clicking the Live Checkpoint manialink or typing /ccp in chat we should see this window:
![](https://cdn.discordapp.com/attachments/522878388269088782/992062797649301594/unknown.png)

The navbar buttons should open other windows.

We will need a table to display the data. To make it we will use Grid util which we import from UiUtils file. Then we create a class property for grid and create Grid object in constructor. To create it we need content width and height, which are in {opupWindow class, column proportions from config and row proportions. Because all rows have the same height we can just get number of entries, create array with length of entries + 1 and fill it with 1's. We add 1 to entries because we want to display a header in first row. Let's also specify the background, header background and margin optional properties, which we can get from CONFIG.grid object.
```ts
import PopupWindow from '../PopupWindow.js'
import  { CONFIG, ICONS, IDS, stringToObjectProperty, Grid } from '../UiUtils.js'

export default class CurrentCps extends PopupWindow {

  readonly entries = CONFIG.currentCps.entries
  readonly grid: Grid

  constructor() {
    // Translate icon name to url
    const iconUrl = stringToObjectProperty(CONFIG.currentCps.icon, ICONS)
    super(IDS.currentCps, iconUrl, CONFIG.currentCps.title, CONFIG.currentCps.navbar)
    // Create grid object to display the table
    this.grid = new Grid(this.contentWidth, this.contentHeight, CONFIG.currentCps.columnProportions, new Array(this.entries).fill(1),
      { background: CONFIG.grid.bg, margin: CONFIG.grid.margin, headerBg: CONFIG.grid.headerBg })
  }

  protected constructContent(login: string, params: any): string {
    return ''
  }

  protected constructFooter(login: string, params: any): string {
    return ''
  }

}
```
Now let's make headers and close button. Each header has to be a centered text, so we will create an array of functions which return a centered text. For centered text parentWidth and parentHeight params we can use w and h arguments passed to the callback function. Next we need to pass the array to grid.constructXml() function and return it. For close button we will call closeButton() function from UiUtils passing closeId, window width and footerHeight to it and return it in constructFooter()
```ts
import PopupWindow from '../PopupWindow.js'
import { CONFIG, ICONS, IDS, stringToObjectProperty, Grid, centeredText, closeButton } from '../UiUtils.js'

export default class CurrentCps extends PopupWindow {

  readonly entries = CONFIG.currentCps.entries
  readonly grid: Grid
  readonly gridMargin = CONFIG.grid.margin

  constructor() {
    // Translate icon name to url
    const iconUrl = stringToObjectProperty(CONFIG.currentCps.icon, ICONS)
    super(IDS.currentCps, iconUrl, CONFIG.currentCps.title, CONFIG.currentCps.navbar)
    // Create grid object to display the table
    this.grid = new Grid(this.contentWidth, this.contentHeight, CONFIG.currentCps.columnProportions, new Array(this.entries).fill(1),
      { background: CONFIG.grid.bg, margin: this.gridMargin, headerBg: CONFIG.grid.headerBg })
  }

  protected constructContent(login: string, params: any): string {
    const headers = [
      (i: number, j: number, w: number, h: number) => centeredText('Nickname ', w, h), // Space to prevent translation
      (i: number, j: number, w: number, h: number) => centeredText('Login', w, h),
      (i: number, j: number, w: number, h: number) => centeredText('Checkpoint', w, h),
      (i: number, j: number, w: number, h: number) => centeredText('PB Checkpoint', w, h),
      (i: number, j: number, w: number, h: number) => centeredText('PB Time', w, h),
    ]
    return this.grid.constructXml(headers)
  }

  protected constructFooter(login: string, params: any): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight)
  }

}
```
Now the window has headers
![](https://media.discordapp.net/attachments/793464821030322196/992074903304020008/unknown.png)

To create the rest of the table we need to save player checkpoints. First we create an interface CurrentCheckpoint and an array to store data in it. Afterwards we add a listener for Controller.PlayerCheckpoint event. In that event callback we add and update objects in the array.
```ts
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import PopupWindow from '../PopupWindow.js'
import { CONFIG, ICONS, IDS, stringToObjectProperty, Grid, centeredText, closeButton } from '../UiUtils.js'

interface CurrentCheckpoint {
  nickname: string
  readonly login: string
  checkpoint: number
  pbCheckpoint: number | undefined
  pbTime: number | undefined
}

export default class CurrentCps extends PopupWindow {

  readonly entries = CONFIG.currentCps.entries
  readonly grid: Grid
  readonly gridMargin = CONFIG.grid.margin
  readonly currentCheckpoints: CurrentCheckpoint[] = []

  constructor() {
    // Translate icon name to url
    const iconUrl = stringToObjectProperty(CONFIG.currentCps.icon, ICONS)
    super(IDS.currentCps, iconUrl, CONFIG.currentCps.title, CONFIG.currentCps.navbar)
    // Create grid object to display the table
    this.grid = new Grid(this.contentWidth, this.contentHeight, CONFIG.currentCps.columnProportions, new Array(this.entries).fill(1),
      { background: CONFIG.grid.bg, margin: this.gridMargin, headerBg: CONFIG.grid.headerBg })
    TM.addListener('Controller.PlayerCheckpoint', (info: CheckpointInfo) => {
      const currentCp = this.currentCheckpoints.find(a => a.login === info.player.login)
      const pb = TM.getPlayerRecord(info.player.login)
      if (currentCp === undefined) { // Add a player to array if he wasn't there
        this.currentCheckpoints.push({
          nickname: info.player.nickName,
          login: info.player.login,
          checkpoint: info.time,
          pbCheckpoint: pb?.checkpoints?.[info.index] ?? undefined,
          pbTime: pb?.time ?? undefined
        })
      } else { // Update object in array if player was in it
        currentCp.nickname = info.player.nickName
        currentCp.checkpoint = info.time
        currentCp.pbCheckpoint = pb?.checkpoints?.[info.index] ?? undefined
        currentCp.pbTime = pb?.time ?? undefined
      }
    })
  }

  protected constructContent(login: string, params: any): string {
    const headers = [
      (i: number, j: number, w: number, h: number) => centeredText('Nickname ', w, h), // Space to prevent translation
      (i: number, j: number, w: number, h: number) => centeredText('Login', w, h),
      (i: number, j: number, w: number, h: number) => centeredText('Checkpoint', w, h),
      (i: number, j: number, w: number, h: number) => centeredText('PB Checkpoint', w, h),
      (i: number, j: number, w: number, h: number) => centeredText('PB Time', w, h),
    ]
    return this.grid.constructXml(headers)
  }

  protected constructFooter(login: string, params: any): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight)
  }

}
```

To render the data we need to create table callback functions which will display it. In our case its simple - we just return centered text, do some formatting for time display using TM.Utils.getTimeString function, and handle some exceptions like player not having a pb on the map. Lastly we add the cell functions to array along with headers and then pass them to grid.constructXml function
```ts
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import PopupWindow from '../PopupWindow.js'
import { CONFIG, ICONS, IDS, stringToObjectProperty, Grid, centeredText, closeButton } from '../UiUtils.js'

interface CurrentCheckpoint {
  nickname: string
  readonly login: string
  checkpoint: number
  pbCheckpoint: number | undefined
  pbTime: number | undefined
}

export default class CurrentCps extends PopupWindow {

  readonly entries = CONFIG.currentCps.entries
  readonly grid: Grid
  readonly gridMargin = CONFIG.grid.margin
  readonly currentCheckpoints: CurrentCheckpoint[] = []
  private readonly colours = {
    worse: "$F00",
    better: "$00F",
    equal: "$FF0"
  }

  constructor() {
    // Translate icon name to url
    const iconUrl = stringToObjectProperty(CONFIG.currentCps.icon, ICONS)
    super(IDS.currentCps, iconUrl, CONFIG.currentCps.title, CONFIG.currentCps.navbar)
    // Create grid object to display the table
    this.grid = new Grid(this.contentWidth, this.contentHeight, CONFIG.currentCps.columnProportions, new Array(this.entries).fill(1),
      { background: CONFIG.grid.bg, margin: this.gridMargin, headerBg: CONFIG.grid.headerBg })
    TM.addListener('Controller.PlayerCheckpoint', (info: CheckpointInfo) => {
      const currentCp = this.currentCheckpoints.find(a => a.login === info.player.login)
      const pb = TM.getPlayerRecord(info.player.login)
      if (currentCp === undefined) { // Add a player to array if he wasn't there
        this.currentCheckpoints.push({
          nickname: info.player.nickName,
          login: info.player.login,
          checkpoint: info.time,
          pbCheckpoint: pb?.checkpoints?.[info.index] ?? undefined,
          pbTime: pb?.time ?? undefined
        })
      } else { // Update object in array if player was in it
        currentCp.nickname = info.player.nickName
        currentCp.checkpoint = info.time
        currentCp.pbCheckpoint = pb?.checkpoints?.[info.index] ?? undefined
        currentCp.pbTime = pb?.time ?? undefined
      }
    })
  }

  protected constructContent(login: string, params: any): string {
    const headers = [
      (i: number, j: number, w: number, h: number) => centeredText('Nickname ', w, h), // Space to prevent translation
      (i: number, j: number, w: number, h: number) => centeredText('Login', w, h),
      (i: number, j: number, w: number, h: number) => centeredText('Checkpoint', w, h),
      (i: number, j: number, w: number, h: number) => centeredText('PB Checkpoint', w, h),
      (i: number, j: number, w: number, h: number) => centeredText('PB Time', w, h),
    ]
    const nickNameCell = (i: number, j: number, w: number, h: number): string => {
      return centeredText(this.currentCheckpoints[i - 1].nickname, w, h)
    }
    const loginCell = (i: number, j: number, w: number, h: number): string => {
      return centeredText(this.currentCheckpoints[i - 1].login, w, h)
    }
    const checkpointCell = (i: number, j: number, w: number, h: number): string => {
      const entry = this.currentCheckpoints[i - 1]
      if (entry?.pbCheckpoint === undefined) { // If player has no pb then just displays the formatted time
        return centeredText(TM.Utils.getTimeString(entry.checkpoint), w, h)
      }
      else { // Else calculates the difference and displays formatted difference and time
        const difference = entry.pbCheckpoint - entry.checkpoint
        let differenceString: string = ''
        if (difference !== undefined) {
          if (difference > 0) {
            differenceString = `(${this.colours.better}-${TM.Utils.getTimeString(difference)}$FFF)`
          } else if (difference === 0) {
            differenceString = `(${this.colours.equal}${TM.Utils.getTimeString(difference)}$FFF)`
          } else {
            differenceString = `(${this.colours.worse}+${TM.Utils.getTimeString(Math.abs(difference))}$FFF)`
          }
        }
        const str = TM.Utils.getTimeString(entry.checkpoint) + differenceString
        return centeredText(str, w, h)
      }
    }
    const pbCheckpointCell = (i: number, j: number, w: number, h: number): string => {
      const pbCheckpoint = this.currentCheckpoints[i - 1]?.pbCheckpoint
      if (pbCheckpoint === undefined) { // If player has no pb display -:--.--
        return centeredText('-:--.--', w, h)
      } else { // Else display the formatted pb checkpoint
        return centeredText(TM.Utils.getTimeString(pbCheckpoint), w, h)
      }
    }
    const pbTimeCell = (i: number, j: number, w: number, h: number): string => {
      const pbTime = this.currentCheckpoints[i - 1]?.pbTime
      if (pbTime === undefined) { // If player has no pb display -:--.--
        return centeredText('-:--.--', w, h)
      } else { // Else display the formatted pb time
        return centeredText(TM.Utils.getTimeString(pbTime), w, h)
      }
    }
    const arr = headers
    // Add the cells to array
    for (const e of this.currentCheckpoints) {
      arr.push(nickNameCell, loginCell, checkpointCell, pbCheckpointCell, pbTimeCell)
    }
    return this.grid.constructXml(arr)
  }
  
  protected constructFooter(login: string, params: any): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight)
  }

}
```
Now if we open the window after finishing and crossing a checkpoint we should see something like this: 
![](https://cdn.discordapp.com/attachments/522878388269088782/992095337529495644/unknown.png)

Next thing we need to add is paginator. In case theres more entries to display than entries per page we need a way to change pages. We start by importing Paginator from UiUtils and creating its object in constructor. For pageCount we set 1 because there is no entries at server start anyway. Then we need to add callback to paginator.onPageChange() method to update page count and display the window in it. Notice that in 2nd param of display we pass the object with page - we will need that to display entries relative to page. In 3rd param of display we page string to display in top right corner of the window. After that we need to override onOpen method (that gets called when people open the window) because we need to calculate and display number of pages now. In constructContent() method we create a variable which will store index of the first entry we should display. Next we add that varible to index of entry in every cell function. We also need to calculate how many entries will be displayed on a given page and change for loop which adds functions to array to use that variable. Lastly we add paginator to construct footer method.
```ts
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import PopupWindow from '../PopupWindow.js'
import { CONFIG, ICONS, IDS, stringToObjectProperty, Grid, centeredText, closeButton, Paginator } from '../UiUtils.js'

interface CurrentCheckpoint {
  nickname: string
  readonly login: string
  checkpoint: number
  pbCheckpoint: number | undefined
  pbTime: number | undefined
}

export default class CurrentCps extends PopupWindow {

  readonly entries = CONFIG.currentCps.entries
  readonly grid: Grid
  readonly gridMargin = CONFIG.grid.margin
  readonly currentCheckpoints: CurrentCheckpoint[] = []
  private readonly colours = {
    worse: "$F00",
    better: "$00F",
    equal: "$FF0"
  }
  readonly paginator: Paginator

  constructor() {
    // Translate icon name to url
    const iconUrl = stringToObjectProperty(CONFIG.currentCps.icon, ICONS)
    super(IDS.currentCps, iconUrl, CONFIG.currentCps.title, CONFIG.currentCps.navbar)
    // Create grid object to display the table
    this.grid = new Grid(this.contentWidth, this.contentHeight, CONFIG.currentCps.columnProportions, new Array(this.entries).fill(1),
      { background: CONFIG.grid.bg, margin: this.gridMargin, headerBg: CONFIG.grid.headerBg })
    TM.addListener('Controller.PlayerCheckpoint', (info: CheckpointInfo) => {
      const currentCp = this.currentCheckpoints.find(a => a.login === info.player.login)
      const pb = TM.getPlayerRecord(info.player.login)
      if (currentCp === undefined) { // Add a player to array if he wasn't there
        this.currentCheckpoints.push({
          nickname: info.player.nickName,
          login: info.player.login,
          checkpoint: info.time,
          pbCheckpoint: pb?.checkpoints?.[info.index] ?? undefined,
          pbTime: pb?.time ?? undefined
        })
      } else { // Update object in array if player was in it
        currentCp.nickname = info.player.nickName
        currentCp.checkpoint = info.time
        currentCp.pbCheckpoint = pb?.checkpoints?.[info.index] ?? undefined
        currentCp.pbTime = pb?.time ?? undefined
      }
    })
    this.paginator = new Paginator(this.openId, this.windowWidth, this.footerHeight, 1)
    this.paginator.onPageChange((login: string, page: number) => {
      // Calculate and update page count
      let pageCount = Math.ceil(this.currentCheckpoints.length / this.entries)
      if (pageCount === 0) { // Fix 0 pages display if theres no entries
        pageCount = 1
      }
      this.paginator.updatePageCount(pageCount)
      // Display using page received in params
      this.displayToPlayer(login, { page }, `${page}/${pageCount}`)
    })
  }

  // Override onOpen method to add page count to params and display it
  protected onOpen(info: ManialinkClickInfo): void {
    // Calculate and update page count
    let pageCount = Math.ceil(this.currentCheckpoints.length / this.entries)
    if (pageCount === 0) { // Fix 0 pages display if theres no entries
      pageCount = 1
    }
    this.paginator.updatePageCount(pageCount)
    this.displayToPlayer(info.login, { page: 1 }, `1/${pageCount}`)
  }

  protected constructContent(login: string, params: { page: number }): string {
    const headers = [
      (i: number, j: number, w: number, h: number) => centeredText('Nickname ', w, h), // Space to prevent translation
      (i: number, j: number, w: number, h: number) => centeredText('Login', w, h),
      (i: number, j: number, w: number, h: number) => centeredText('Checkpoint', w, h),
      (i: number, j: number, w: number, h: number) => centeredText('PB Checkpoint', w, h),
      (i: number, j: number, w: number, h: number) => centeredText('PB Time', w, h),
    ]
    // Make entries relative to pages (subtract 1 from page because its 1-based)
    const index = (params.page - 1) * this.entries
    // Calculate how many entries will be displayed
    const entriesToDisplay = this.currentCheckpoints.length - index
    // Add n to index everywhere to make display relative to page
    const nickNameCell = (i: number, j: number, w: number, h: number): string => {
      return centeredText(this.currentCheckpoints[i - 1 + index].nickname, w, h)
    }
    const loginCell = (i: number, j: number, w: number, h: number): string => {
      return centeredText(this.currentCheckpoints[i - 1 + index].login, w, h)
    }
    const checkpointCell = (i: number, j: number, w: number, h: number): string => {
      const entry = this.currentCheckpoints[i - 1 + index]
      if (entry?.pbCheckpoint === undefined) { // If player has no pb then just displays the formatted time
        return centeredText(TM.Utils.getTimeString(entry.checkpoint), w, h)
      }
      else { // Else calculates the difference and displays formatted difference and time
        const difference = entry.pbCheckpoint - entry.checkpoint
        let differenceString: string = ''
        if (difference !== undefined) {
          if (difference > 0) {
            differenceString = `(${this.colours.better}-${TM.Utils.getTimeString(difference)}$FFF)`
          } else if (difference === 0) {
            differenceString = `(${this.colours.equal}${TM.Utils.getTimeString(difference)}$FFF)`
          } else {
            differenceString = `(${this.colours.worse}+${TM.Utils.getTimeString(Math.abs(difference))}$FFF)`
          }
        }
        const str = TM.Utils.getTimeString(entry.checkpoint) + differenceString
        return centeredText(str, w, h)
      }
    }
    const pbCheckpointCell = (i: number, j: number, w: number, h: number): string => {
      const pbCheckpoint = this.currentCheckpoints[i - 1 + index]?.pbCheckpoint
      if (pbCheckpoint === undefined) { // If player has no pb display -:--.--
        return centeredText('-:--.--', w, h)
      } else { // Else display the formatted pb checkpoint
        return centeredText(TM.Utils.getTimeString(pbCheckpoint), w, h)
      }
    }
    const pbTimeCell = (i: number, j: number, w: number, h: number): string => {
      const pbTime = this.currentCheckpoints[i - 1 + index]?.pbTime
      if (pbTime === undefined) { // If player has no pb display -:--.--
        return centeredText('-:--.--', w, h)
      } else { // Else display the formatted pb time
        return centeredText(TM.Utils.getTimeString(pbTime), w, h)
      }
    }
    const arr = headers
    // Add the cells to array depending on how many entries should be displayed
    for (let i = 0; i < entriesToDisplay; i++) {
      arr.push(nickNameCell, loginCell, checkpointCell, pbCheckpointCell, pbTimeCell)
    }
    return this.grid.constructXml(arr)
  }

  protected constructFooter(login: string, params: { page: number }): string {
    // Return close button and paginator
    return closeButton(this.closeId, this.windowWidth, this.footerHeight) + this.paginator.constructXml(params.page)
  }

}
```
This is how widget should look like right now (I used sample data to display multiple pages):
![](https://cdn.discordapp.com/attachments/793464821030322196/992107624055185458/unknown.png)

Thanks for watching guys asdsaas