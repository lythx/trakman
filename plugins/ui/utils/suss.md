# UI Utils
## Grid
Util to display tabular data in manialinks. It's used in almost every popup window and some static manialinks too.  
***Methods:***  
- **constructor(width: number, height: number, columnProportions: number[], rowProportions: number[], options?: { background?: string, margin?: number, headerBackground?: string })**  
  - `width` Grid width
  - `height` Grid height
  - `columnProportions` Grid column proportions (proportions are relative to eachother like in CSS flexbox)
  - `rowProportions` Grid row proportions
  - `options` Optional properties
    - `background` Grid cell background
    - `headerBackground` Grid header cell background (1st row)
    - `margin` Margin around grid cells

- **constructXml(objectsOrFunctions: (GridCellFunction | GridCellObject)[]): string**  
Creates grid XML string from passed callback functions. Use GridCellObjects if you want to change some property for specific grid cell eg. rowspan.
  - `objectsOrFunctions` Array of GridCellFunctions functions or GridCellObjects
  - `Returns` Grid XML string

***Properties:***  
- `width` Grid width  
- `height` Grid height  
- `columnWidths` Width of each grid column  
- `rowHeights` Height of each grid row  
- `columns` Column count
- `rows` Row count
- `background` Background colour
- `margin` Margin between cells and around grid
- `headerBg` Header background colour

## List
Util to display list data in manialinks. Displays 3 columns of data from which one is index. It's used in result screen static manialinks eg. Top Donations.  
***Methods:***  
- **constructor(entries: number, width: number, height: number, columnProportions: number[], options?: { background?: string, headerBg?: string })**
  - `entries` Number of entries to display
  - `width` List width
  - `height` List height
  - `columnProportions` List column proportions (proportions are relative to eachother like in CSS flexbox)
  - `options` Optional properties
    - `background` List cell background
    - `headerBackground` List header background
- **constructXml(col1: string[], col2: string[]): string**
Constructs list XML from passed string arrays
  - `col1` Array of strings to display in column 1
  - `col2` Array of strings to display in column 2
  - `Returns` List XML string

***Properties***:  
- `entries` Displayed entries count  
- `height` List height
- `width` List width
- `columnProportions` List column proportions (proportions are relative to eachother like in CSS flexbox)
- `background` Background colour
- `headerBg` Header background colour

## RecordList
Util to display record data in manialinks. It has index, name and time columns, but it also can display more data on click eg. checkpoints. Records and time colours are displayed relative to players personal record. It's used in static record lists eg. Local Records.  
***Methods***:  
- **constructor(preset: 'result' | 'race', parentId: number, width: number, height: number, rows: number, side: boolean, topCount: number, maxCount: number, noRecordEntry: boolean, options?: { getColoursFromPb?: true })**
  - `preset` Default preset options to use
  - `parentId` Parent element manialink ID
  - `width` List width
  - `height` List height
  - `rows` List row count
  - `side` Side on which list is positioned needed for click info display (true is right)
  - `topCount` Number of records which are always displayed regardless of player personal record
  - `maxCount` Max record count needed for click actionIds
  - `noRecordEntry` If true, a placeholder entry gets displayed at the end of the list if the player has no personal record
  - `options` Optional parameters
    - `getColoursFromPb` If true list time colours are relative to player personal records
- **onClick(callback: (info: tm.ManialinkClickInfo) => void): void**  
Registers a callback function to execute on record click
  - `callback` Callback function, it takes ManialinkClickInfo as a parameter
- **constructXml(login: string, allRecords: UiRecord[]): string**  
Constructs record list XML for given player from passed array of record objects
  - `login` Player login
  - `allRecords` Array of record objects
  - `Returns` Record list XML string

***Properties***:
  - `infoColumns` Info grid column count
  - `infoColumnWidth` Info grid column width
  - `infoIconWidth` Info icon width
  - `infoIcon` Info icon url
  - `infoBackground` Info background colour
  - `background` Background colour
  - `headerBackground` Header background colour
  - `markerWidth` Marker width
  - `parentId` Parent element manialink ID
  - `config` Present config used
  - `columnWidths` List column widths
  - `rows` List row count
  - `rowHeight` List row height
  - `width` List width
  - `side` List side (true is right)
  - `topCount` Number of records which are always displayed regardless of player personal record
  - `markers` Marker icons
  - `downloadIcon` Download icon url
  - `timeColours`:  Time string colours

## Navbar
Util to display horizontal navbar, used by popup windows.  
***Methods:***
- **constructor(buttons: { name: string, actionId: number,
privilege?: number }[], width: number, height: number | null = config.height, background: string = config.background, hoverImgUrl: string = config.hoverImage)**
  - `buttons` Array of button objects
  - `width` Navbar width
  - `height` Navbar height
  - `background` Navbar background
  - `hoverImgUrl` Background image to display on button hover
- **getButtonCount(privilege: number = 0): number**  
Gets button count for given privilege
  - `privilege` Privilege (0 by default)
  - `Returns` Button count
- **constructXml(privilege: number = 0): string**  
Creates navbar XML string for given privilege
  - `privilege` Privilege (0 by default)
  - `Returns` Navbar XML string  

***Properties:***
  - `width` Navbar width
  - `height` Navbar height
  - `hoverImage` Background image displayed on button hover
  - `background` Background colour

## StaticHeader
Util to display manialink headers in static UI.
***Methods:***
- **constructor(preset: 'race' | 'result' = 'race', options: Partial<StaticHeaderOptions> = {})**  
  - `preset` Default preset options to use
  - `options` Optional parameters. Parameters in this object override preset parameters. TODO Interface
- **constructXml(text: string, icon: string, side: boolean, options: Partial<StaticHeaderOptions> = {}): string**   Constructs header manialink used in static UI
  - `text` Header text
  - `icon` Header icon
  - `side` Header side. Text and icon are displayed in different order depending on side (true is right)
  - `options` Optional parameters. Parameters in this object override parameters in preset and constructor. TODO Interface
  - `Returns` Header XML string

***Properties:***
  - `options` Header options TODO Interface
  - `raceHeight` Default height in race preset
  - `resultHeight` Defualt height in result preset

## Paginator
Util to manage pagination and render page change buttons. It's used in almost every popup window. Use the onPageChange property to listen for page changes. Remember to use destroy() before deleting the object to avoid memory leaks.  
***Methods:***
- **constructor(parentId: number, parentWidth: number, parentHeight: number, pageCount: number, defaultPage: number = 1, noMidGap?: true)**  
  - `parentId` Parent element manialink id
  - `parentWidth` Parent element width
  - `parentHeight` Parent element height
  - `pageCount` Initial page count
  - `defaultPage` Default page (will be displayed if no page is specified)
  - `noMidGap` If true there will be no bonus gap between previous and next buttons
- **constructXml(page: number): string**  
Constructs page change buttons XML for given player login
  - `login` Player login
  - `Returns` Page change buttons XML string
- **constructXml(login: string): string**  
Constructs page change buttons XML for given page number
  - `page` Page number
  - `Returns` Page change buttons XML string
- **getPageByLogin(login: string): number**  
Gets current page of a given player.
  - `login` Player login
  - `Reset` Page number
- **setPageForLogin(login: string, page: number): number**   
Sets page for a given player  
  - `login` Player login
  - `page` Page number
  - `Returns` Page number
- **setPageCount(pageCount: number): void**  
Sets page count
  - `pageCount` Page count
- **resetPlayerPages(): void**  
Resets current player page positions.
- **destroy(): void**  
Removes click listener. Use this before deleting the object to avoid memory leaks.  
***Properties:***  
  - `onPageChange` Sets function to execute on page change
  - `pageCount` Amount of pages
  - `buttonCount` Amount of currently displayed buttons. It's relative to the page count
  - `parentId` Parent element ID
  - `defaultPage` Default page (will be displayed if no page is specified)
  - `buttonW` Button width
  - `buttonH` Button height
  - `padding` Icon padding
  - `margin` Margin between buttons
  - `iconW` Icon width 
  - `iconH` Icon height
  - `ids` Ids used by paginator buttons
  - `width` Paginator width
  - `height` Paginator height
  - `yPos` Y axis position of paginator buttons
  - `xPos` X axis positions of paginator buttons
  - `noMidGap` If true there is no bonus gap between previous and next buttons
## VoteWindow
Util to manage votes and render vote manialink window.  
***Methods:***
- **constructor(callerLogin: string, goal: number, headerMessage: string, chatMessage: string, seconds: number, iconUrl: string)**
  - `callerLogin` Login of the player who called the vote
  - `goal` Ratio of votes needed to pass the vote (must be between 0 and 1)
  - `headerMessage` Message displayed in vote window header
  - `chatMessage` Chat message sent to chat on vote start
  - `seconds` Amount of time to vote
  - `iconUrl` Icon image url
- **startAndGetResult(eligibleLogins: string[]): Promise<boolean | { result: boolean, caller?: tm.Player }> | undefined**  
Starts the vote and awaits result.
  - `eligibleLogins` List of logins of players that can vote
  - `Returns` Vote result as boolean if time ran out or all the players voted, object containing result and optional caller player object if vote got passed or cancelled, undefined if there is another vote running
- **pass(caller?: tm.Player): void**  
Passes the vote
  - `caller` Caller player object
- **cancel(caller?: tm.Player): void**  
Cancels the vote
  - `caller` Caller player object
