# Static Components
Manialinks which are displayed automatically at all times.
## Static component tutorial
The goal of this tutorial is to make a simple plugin which displays current checkpoint time and it's difference relative to pb checkpoint time like this:![](image.png)

Let's start by adding an id for our widget in plugins/ui/config/ComponentIds.json. Id should be a number followed by zeros and it should be different from all other id's declared in the file.
```json
{
  //other ids
  "LiveCheckpoint": 70000
}
```
After that we go to ui config file plugins/ui/config/UiConfig.json. Here all component attributes are stored. We add an entry for our widget, set height to 10 (will adjust it later), set side to true (true is right side), set title to Live Checkpoint and set icon to clock
```json
{
  //other components
  "liveCheckpoint": {
    "height": 10,
    "title": "Live Checkpoint",
    "side": true,
    "icon": "clock"
  }
}
```
In the same file go to "static" property and add "liveCheckpoint" to rightSideOrder array after "timer" (because we want it to display under timer widget)
```json
{
  //other components
  "static": {
    //other properties
    "rightSideOrder": [
      "map",
      "previousAndBest",
      "tmx",
      "timer",
      "liveCheckpoint", // our component
      "locals",
      "live"
    ]
  }
}
```
Next let's create a LiveCheckpoint.component.ts file in plugins/ui/static_components directory. In that file create and export a class called LiveCheckpoint.
```ts
export default class LiveCheckpoint {

}
```
After that we go back to our class file, import StaticComponent class from plugins/ui/StaticComponent.ts file and extend our class with it. That class has methods which are useful for static manialinks, and it displays them automatically. Notice that import declaration uses .js extension because the files get transpiled to javascript after build.
```ts
import StaticComponent from '../StaticComponent.js'

export default class LiveCheckpoint extends StaticComponent {

}
```
After extending the class we should see an error. That's because we need to implement abstract methods derived from it. Before we do that though, let's write a constructor. 
In constructor we first call super() method because of class extension. This method requires 2 parameters: id and displayMode. To get our id (which we specified before in ComponentIds.json file) we import IDS object from plugins/ui/UiUitls.js and use LiveCheckpoint key. For displayMode we set 'race' because we want the plugin to be displayed only during race and not during result screen.
```ts
import StaticComponent from '../StaticComponent.js'
import { IDS } from '../UiUtils.js'

export default class LiveCheckpoint extends StaticComponent {

  constructor() {
    super(IDS.LiveCheckpoint, 'race')
  }

}
```
Next we import CONFIG from UiUtils.js and we set basic object properties: width, height, positionX and positionY. Notice how some of these properties are taken from CONFIG.static because they are common for every static manialink. For positionY we import calculateStaticPositionY() function from UiUtils.js and call it with "liveCheckpoint". That function returns our widget's Y position relative to other widgets.
```ts
import StaticComponent from '../StaticComponent.js'
import { IDS, CONFIG, calculateStaticPositionY } from '../UiUtils.js'

export default class LiveCheckpoint extends StaticComponent {

  private readonly bg = CONFIG.static.bgColor
  private readonly width = CONFIG.static.width
  private readonly height = CONFIG.liveCheckpoint.height
  private readonly positionX = CONFIG.static.leftPosition
  private readonly positionY: number

  constructor() {
    super(IDS.LiveCheckpoint, 'race')
    // Gets manialink position relative to other manialinks
    this.positionY = calculateStaticPositionY('liveCheckpoint') 
  }

}
```
Afterwards we implement abstract methods display() and displayToPlayer(). Display method is used on server start and map start, displayToPlayer is used when a player joins the server. These methods are responsible for sending the manialink to dedicated server. To do that we need to import TRAKMAN from src/Trakman.js and use it's sendManialink method. For now we are going to send an empty rectangle to see if positioning works well.
```ts
import StaticComponent from '../StaticComponent.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import { IDS, CONFIG, calculateStaticPositionY } from '../UiUtils.js'

export default class LiveCheckpoint extends StaticComponent {

  private readonly bg = CONFIG.static.bgColor
  private readonly width = CONFIG.static.width
  private readonly height = CONFIG.liveCheckpoint.height
  private readonly positionX = CONFIG.static.rightPosition
  private readonly positionY: number

  constructor() {
    super(IDS.LiveCheckpoint, 'race')
    // Gets manialink position relative to other manialinks
    this.positionY = calculateStaticPositionY('liveCheckpoint')
  }

  display(): void {
    // Sets isDisplayed to true so new players are able to see the manialink after joining
    this._isDisplayed = true
    // Sends empty rectangle
    TM.sendManialink(`
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <quad posn="0 0 0" sizen="${this.width} ${this.height}" bgcolor="${this.bg}"/>
      </frame>
    </manialink>`)
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(`
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <quad posn="0 0 0" sizen="${this.width} ${this.height}" bgcolor="${this.bg}"/>
      </frame>
    </manialink>`, login)
  }

}
```
Next we go to plugins/ui/Ui.ts file and we import the class there.
```ts
import CheckpointWidget from './static_components/CheckpointWidget.component.js'
```
After importing the class we search for Controller.Ready listener in the file and we add its object to static components array
```ts
const events: TMEvent[] = [
  {
    event: 'Controller.Ready',
    callback: async () => {
      //...
      staticComponents.push(
        new CheckpointWidget(), // our class object
        //other objects...
```
Now it's time to build and restart our server and see the widget. It should look like this: 
![](https://media.discordapp.net/attachments/971865322858623097/991456807753101433/fsdfdsfds.png?width=1641&height=910)
Let's make a header now. For that we need side, title, icon, headerHeight and marginSmall from CONFIG. To get icon url we need to import stringToObjectProperty and ICONS from UiUtils, and then pass icon from CONFIG with ICONS to the function. In display method we call staticHeader() function with title, iconUrl and side in params.
```ts
import StaticComponent from '../StaticComponent.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import { IDS, CONFIG, calculateStaticPositionY, staticHeader, stringToObjectProperty, ICONS } from '../UiUtils.js'

export default class LiveCheckpoint extends StaticComponent {

  private readonly bg = CONFIG.static.bgColor
  private readonly width = CONFIG.static.width
  private readonly height = CONFIG.liveCheckpoint.height
  private readonly positionX = CONFIG.static.rightPosition
  private readonly positionY: number
  private readonly side = CONFIG.liveCheckpoint.side
  private readonly title = CONFIG.liveCheckpoint.title
  private readonly icon = CONFIG.liveCheckpoint.icon
  private readonly headerHeight = CONFIG.staticHeader.height
  private readonly margin = CONFIG.static.marginSmall

  constructor() {
    super(IDS.LiveCheckpoint, 'race')
    // Gets manialink position relative to other manialinks
    this.positionY = calculateStaticPositionY('liveCheckpoint')
  }

  display(): void {
    // Sets isDisplayed to true so new players are able to see the manialink after joining
    this._isDisplayed = true
    const iconUrl = stringToObjectProperty(this.icon, ICONS) // Converts icon name to icon url
    TM.sendManialink(`
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        ${staticHeader(this.title, iconUrl, this.side)}
        <quad posn="0 0 0" sizen="${this.width} ${this.height}" bgcolor="${this.bg}"/>
      </frame>
    </manialink>`)
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(`
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <quad posn="0 0 0" sizen="${this.width} ${this.height}" bgcolor="${this.bg}"/>
      </frame>
    </manialink>`, login)
  }

}
```
![](https://cdn.discordapp.com/attachments/522878388269088782/991462007628894318/unknown.png)

Now after restarting the server we can see our header, but the text is too big and the title is overlapping with the background. To fix that we need to add format with textsize 1, make our background height smaller and position it a bit lower. For easier positioning let's just make another frame and put the background inside of it.
```ts
import StaticComponent from '../StaticComponent.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import { IDS, CONFIG, calculateStaticPositionY, staticHeader, stringToObjectProperty, ICONS } from '../UiUtils.js'

export default class LiveCheckpoint extends StaticComponent {

  private readonly bg = CONFIG.static.bgColor
  private readonly width = CONFIG.static.width
  private readonly height = CONFIG.liveCheckpoint.height
  private readonly positionX = CONFIG.static.rightPosition
  private readonly positionY: number
  private readonly side = CONFIG.liveCheckpoint.side
  private readonly title = CONFIG.liveCheckpoint.title
  private readonly icon = CONFIG.liveCheckpoint.icon
  private readonly headerHeight = CONFIG.staticHeader.height
  private readonly margin = CONFIG.static.marginSmall

   constructor() {
    super(IDS.LiveCheckpoint, 'race')
    // Gets manialink position relative to other manialinks
    this.positionY = calculateStaticPositionY('liveCheckpoint')
  }

  display(): void {
    // Sets isDisplayed to true so new players are able to see the manialink after joining
    this._isDisplayed = true
    const iconUrl = stringToObjectProperty(this.icon, ICONS) // Converts icon name to icon url
    TM.sendManialink(`
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1"/>
        ${staticHeader(this.title, iconUrl, this.side)}
        <frame posn="0 ${-(this.headerHeight + this.margin)} 1">
          <quad posn="0 0 0" sizen="${this.width} ${this.height - (this.headerHeight + this.margin)}" bgcolor="${this.bg}"/>
        </frame>
      </frame>
    </manialink>`)
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(`
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <quad posn="0 0 0" sizen="${this.width} ${this.height}" bgcolor="${this.bg}"/>
      </frame>
    </manialink>`, login)
  }

}
```
The widget should look like this

![](https://cdn.discordapp.com/attachments/522878388269088782/991745867008716810/unknown.png)

Let's display the cp time now. Cp time will be different for every player and has to be updated after player crosses a checkpoint so we will need to add listener for Controller.PlayerCheckpoint event in constructor and call displayToPlayer in it. From the listener we pass the cpTime to display method. In display method we add second optional param for checkpoint time and parse the miliseconds to time string using TM.Utils.getTimeString() function. Notice that we need to check if time is null because displayToPlayer() is also called when a player joins the server and then the cpTime doesn't get passed to the function. Finally we call centeredText function from UiUtils to center the text relative to background.
```ts
import StaticComponent from '../StaticComponent.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import { IDS, CONFIG, calculateStaticPositionY, staticHeader, stringToObjectProperty, ICONS, centeredText } from '../UiUtils.js'

export default class LiveCheckpoint extends StaticComponent {

  private readonly bg = CONFIG.static.bgColor
  private readonly width = CONFIG.static.width
  private readonly height = CONFIG.liveCheckpoint.height
  private readonly positionX = CONFIG.static.rightPosition
  private readonly positionY: number
  private readonly side = CONFIG.liveCheckpoint.side
  private readonly title = CONFIG.liveCheckpoint.title
  private readonly icon = CONFIG.liveCheckpoint.icon
  private readonly headerHeight = CONFIG.staticHeader.height
  private readonly margin = CONFIG.static.marginSmall

  constructor() {
    super(IDS.LiveCheckpoint, 'race')
    // Gets manialink position relative to other manialinks
    this.positionY = calculateStaticPositionY('liveCheckpoint')
    TM.addListener('Controller.PlayerCheckpoint', (info: CheckpointInfo) => {
      // Passes players login and checkpoint time to displayToPlayer function
      this.displayToPlayer(info.player.login, info.time)
    })
  }

  display(): void {
    // Sets isDisplayed to true so new players are able to see the manialink after joining
    this._isDisplayed = true
    const iconUrl = stringToObjectProperty(this.icon, ICONS) // Converts icon name to icon url
    TM.sendManialink(`
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1"/>
        ${staticHeader(this.title, iconUrl, this.side)}
        <frame posn="0 ${-(this.headerHeight + this.margin)} 1">
          <quad posn="0 0 0" sizen="${this.width} ${this.height - (this.headerHeight + this.margin)}" bgcolor="${this.bg}"/>
        </frame>
      </frame>
    </manialink>`)
  }

  displayToPlayer(login: string, checkpointTime?: number): void {
    const iconUrl = stringToObjectProperty(this.icon, ICONS)
    // Initializes timeString as empty string so nothing gets displayed if checkpointTime isn't defined
    let timeString = ''
    // If checkpoint time is defined formats the miliseconds to time and assigns them to variable
    if (checkpointTime !== undefined) { 
      timeString = TM.Utils.getTimeString(checkpointTime)
    }
    TM.sendManialink(`
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1"/>
        ${staticHeader(this.title, iconUrl, this.side)}
        <frame posn="0 ${-(this.headerHeight + this.margin)} 1">
          <quad posn="0 0 0" sizen="${this.width} ${this.height - (this.headerHeight + this.margin)}" bgcolor="${this.bg}"/>
          ${centeredText(timeString, this.width, this.height - (this.headerHeight + this.margin))}
        </frame>
      </frame>
    </manialink>`, login)
  }

}
```
After passing a checkpoint we should see something like this:

![](https://cdn.discordapp.com/attachments/793464821030322196/991789916352692224/unknown.png)

The display is working, but text is way too small and widget height is too big. To fix that we set textSize property in centeredText options, and we decrease the width in UiConfig.json file

```ts
import StaticComponent from '../StaticComponent.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import { IDS, CONFIG, calculateStaticPositionY, staticHeader, stringToObjectProperty, ICONS, centeredText } from '../UiUtils.js'

export default class LiveCheckpoint extends StaticComponent {

  private readonly bg = CONFIG.static.bgColor
  private readonly width = CONFIG.static.width
  private readonly height = CONFIG.liveCheckpoint.height
  private readonly positionX = CONFIG.static.rightPosition
  private readonly positionY: number
  private readonly side = CONFIG.liveCheckpoint.side
  private readonly title = CONFIG.liveCheckpoint.title
  private readonly icon = CONFIG.liveCheckpoint.icon
  private readonly headerHeight = CONFIG.staticHeader.height
  private readonly margin = CONFIG.static.marginSmall

  constructor() {
    super(IDS.LiveCheckpoint, 'race')
    // Gets manialink position relative to other manialinks
    this.positionY = calculateStaticPositionY('liveCheckpoint')
    TM.addListener('Controller.PlayerCheckpoint', (info: CheckpointInfo) => {
      // Passes players login and checkpoint time to displayToPlayer function
      this.displayToPlayer(info.player.login, info.time)
    })
  }

  display(): void {
    // Sets isDisplayed to true so new players are able to see the manialink after joining
    this._isDisplayed = true
    const iconUrl = stringToObjectProperty(this.icon, ICONS) // Converts icon name to icon url
    TM.sendManialink(`
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1"/>
        ${staticHeader(this.title, iconUrl, this.side)}
        <frame posn="0 ${-(this.headerHeight + this.margin)} 1">
          <quad posn="0 0 0" sizen="${this.width} ${this.height - (this.headerHeight + this.margin)}" bgcolor="${this.bg}"/>
        </frame>
      </frame>
    </manialink>`)
  }

  displayToPlayer(login: string, checkpointTime?: number): void {
    const iconUrl = stringToObjectProperty(this.icon, ICONS)
    // Initializes timeString as empty string so nothing gets displayed if checkpointTime isn't defined
    let timeString = ''
    // If checkpoint time is defined formats the miliseconds to time and assigns them to variable
    if (checkpointTime !== undefined) {
      timeString = TM.Utils.getTimeString(checkpointTime)
    } 
    TM.sendManialink(`
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1"/>
        ${staticHeader(this.title, iconUrl, this.side)}
        <frame posn="0 ${-(this.headerHeight + this.margin)} 1">
          <quad posn="0 0 0" sizen="${this.width} ${this.height - (this.headerHeight + this.margin)}" bgcolor="${this.bg}"/>
          ${centeredText(timeString, this.width, this.height - (this.headerHeight + this.margin), { textScale: 1.5})}
        </frame>
      </frame>
    </manialink>`, login)
  }

}
```
```json
{
  //...
  "liveCheckpoint": {
        "height": 6, //change height to 6
        "title": "Live Checkpoint",
        "side": true,
        "icon": "clock"
    }
}
```

Now the widget should look like this: 

![](https://cdn.discordapp.com/attachments/580816468468301830/991798348908597368/unknown.png)

The last thing we need to do is display the difference to personal best checkpoint. We will do calculations inside of listener callback and pass them to displayToPlayer in 3rd param. We also need to format the time difference with "+", "-" and colours.

```ts
import StaticComponent from '../StaticComponent.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import { IDS, CONFIG, calculateStaticPositionY, staticHeader, stringToObjectProperty, ICONS, centeredText } from '../UiUtils.js'

export default class LiveCheckpoint extends StaticComponent {

  private readonly bg = CONFIG.static.bgColor
  private readonly width = CONFIG.static.width
  private readonly height = CONFIG.liveCheckpoint.height
  private readonly positionX = CONFIG.static.rightPosition
  private readonly positionY: number
  private readonly side = CONFIG.liveCheckpoint.side
  private readonly title = CONFIG.liveCheckpoint.title
  private readonly icon = CONFIG.liveCheckpoint.icon
  private readonly headerHeight = CONFIG.staticHeader.height
  private readonly margin = CONFIG.static.marginSmall
  // Colours property for text formatting
  private readonly colours = { 
    worse: "$F00",
    better: "$00F",
    equal: "$FF0"
  }

  constructor() {
    super(IDS.LiveCheckpoint, 'race')
    // Gets manialink position relative to other manialinks
    this.positionY = calculateStaticPositionY('liveCheckpoint')
    TM.addListener('Controller.PlayerCheckpoint', (info: CheckpointInfo) => {
      // Gets the player record on the current map
      const pb = TM.getPlayerRecord(info.player.login)
      // If player has a record calculates difference and passes it to displayToPlayer function
      if (pb !== undefined) {
        const cpIndex = info.index
        const diff = pb.checkpoints[cpIndex] - info.time
        this.displayToPlayer(info.player.login, info.time, diff)
      } else { // If player doesn't have a record passes just the checkpoint time
        this.displayToPlayer(info.player.login, info.time)
      }
    })
  }

  display(): void {
    // Sets isDisplayed to true so new players are able to see the manialink after joining
    this._isDisplayed = true
    const iconUrl = stringToObjectProperty(this.icon, ICONS) // Converts icon name to icon url
    TM.sendManialink(`
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1"/>
        ${staticHeader(this.title, iconUrl, this.side)}
        <frame posn="0 ${-(this.headerHeight + this.margin)} 1">
          <quad posn="0 0 0" sizen="${this.width} ${this.height - (this.headerHeight + this.margin)}" bgcolor="${this.bg}"/>
        </frame>
      </frame>
    </manialink>`)
  }

  displayToPlayer(login: string, checkpointTime?: number, difference?: number): void {
    const iconUrl = stringToObjectProperty(this.icon, ICONS)
    // Initializes timeString as empty string so nothing gets displayed if checkpointTime isn't defined
    let timeString = ''
    // If checkpoint time is defined formats the miliseconds to time and assigns them to variable
    if (checkpointTime !== undefined) {
      timeString = TM.Utils.getTimeString(checkpointTime)
    } 
    let differenceString = ''
    // If difference was passed to the function formats the text depending if checkpoint is better, worse or equal relative to personal best checkpoint (if it's better difference is bigger than 0) and assigns it to variable
    if (difference !== undefined) {
      if (difference > 0) {
        differenceString = `(${this.colours.better}-${TM.Utils.getTimeString(difference)}$FFF)`
      } else if (difference === 0) {
        differenceString = `(${this.colours.equal}${TM.Utils.getTimeString(difference)}$FFF)`
      } else {
        differenceString = `(${this.colours.worse}+${TM.Utils.getTimeString(Math.abs(difference))}$FFF)`
      }
    }
    // Put both time and difference into variable to display them later
    const txt = timeString + differenceString
    TM.sendManialink(`
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1"/>
        ${staticHeader(this.title, iconUrl, this.side)}
        <frame posn="0 ${-(this.headerHeight + this.margin)} 1">
          <quad posn="0 0 0" sizen="${this.width} ${this.height - (this.headerHeight + this.margin)}" bgcolor="${this.bg}"/>
          ${centeredText(txt, this.width, this.height - (this.headerHeight + this.margin), { textScale: 1.5 })}
        </frame>
      </frame>
    </manialink>`, login)
  }

}
```

The widget is finished now. It should display time and difference with proper formatting like this: 

![](https://cdn.discordapp.com/attachments/522878388269088782/991816352241287249/unknown.png)

Thanks for watching guys, scrubscibe


## Paginator
Pagintor is a tool which creates the buttons to switch pages, and adds functionality to them
#### Methods
`constructor(parentId: number, parentWidth: number, parentHeight: number, pageCount: number, defaultPage: number = 1, noMidGap?: true)` 
- `parentId`: actionId used to open the parent manialink
- `parentWidth`: width of parent element
- `parentHeight`: height of parent element
- `pageCount`: number of pages
- `defaultPage`: page which is displayed after opening the window for the first time
- `noMidGap`: if specified there will be no bonus gap separating left and right buttons

`onPageChange(callback: (login: string, page: number) => void)` - Executes the passed callback function on page change, passing login and target page to it

`getPageByLogin(login: string): number | undefined` - Returns page at which player with specified login is looking, returns undefined if player never changed pages

`updatePageCount(pageCount: number)` - Updates the number of pages, renders buttons depending on page amount.

`constructXml(page: number)` - Returns the manialink xml for buttons
## Grid
Grid is a tool used for positioning elements in a grid layout
#### Methods
`constructor(width: number, height: number, columnProportions: number[], rowProportions: number[], options?: { background?: string, margin?: number, headerBg?: string })`
- `width`: Width of the grid
- `height`: Height of the grid
- `columnProportions`: Proportions of the columns, number of columns depends on length of this array. Array is filled with numbers representing the proportion, for example [6,2,1] will create a 3-column grid in which 1st column is 3 times wider than the second, and second is 2 times wider than the third
- `rowProportions`: Proportions of the rows, number of rows depends on length of this array. Array is filled with numbers representing the proportion, for example [6,2,1] will create a 3-row grid in which 1st row is 3 times wider than the second, and second is 2 times wider than the third
- `options` - Optional parameters 
  - `background` - Colour of the background. If not specified background won't be rendered.
  - `margin` - Gap between background tiles
  - `headerBg` - Background of the 1st row

`constructXml(cellConstructFunctions: ((i: number, j: number, w: number, h: number) => string)[]) {` - constructs manialink XML based on passed array of functions. Each function should return a manialink XML which is going to be positioned accordingly to grid parameters. Functions can use the following params
- `i` - row number
- `j` - column number
- `w` - width of the grid cell
- `h` - height of the grid cell