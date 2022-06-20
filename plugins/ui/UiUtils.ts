import Paginator from './utils/Paginator.js'
import Grid from './utils/Grid.js'
import Navbar from './utils/Navbar.js'
import DropdownMenu from './utils/DropdownMenu.js'
import CONFIG from './config/UIConfig.json' assert { type: 'json' }
import ICONS from './config/Icons.json' assert { type: 'json' }
import BACKGROUNDS from './config/Backgrounds.json' assert { type: 'json' }
import IDS from './config/ComponentIds.json' assert { type: 'json' }

import { TRAKMAN as TM } from '../../src/Trakman.js'

const gridCell = (width: number, height: number, margin: number, color: string = '5556'): string => {
  return `<quad posn="${margin} -${margin} 1" sizen="${width - margin} ${height - margin}" bgcolor="${color}"/>`
}

const centeredText = (text: string, parentWidth: number, parentHeight: number, textScale: number = 0.7, margin: number = 1) => {
  return `<label posn="${parentWidth / 2} -${parentHeight / 2} 3" sizen="${(parentWidth * (1 / textScale)) - (margin * 2)} ${parentHeight}" scale="${textScale}" text="${TM.safeString(text)}" valign="center" halign="center"/>`
}

const footerCloseButton = (width: number, closeId: number): string => {
  return `<quad posn="${width / 2} -2 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${closeId}" 
    imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425551008976956/closek8.png"
    image="https://cdn.discordapp.com/attachments/599381118633902080/986427880932278322/closek8w.png"/>`
}

const headerIconTitleText = (title: string, width: number, height: number, iconUrl: string, iconWidth: number, iconHeight: number, rightText: string, optionalParams?: { titleScale?: number, rightTextScale?: number }): string => {
  const titleScale = optionalParams?.titleScale ?? 1
  const rightTextScale = optionalParams?.rightTextScale ?? 0.8
  return `<quad posn="2 -${height / 2} 1" sizen="${iconWidth} ${iconHeight}" halign="center" valign="center" image="${iconUrl}"/>
        <label posn="${width / 2} -${height / 2} 1" sizen="${width * (1 / titleScale)} ${height}" halign="center" valign="center" scale="${titleScale}" text="${title}"/>
        <label posn="${width - 3} -${height / 2} 1" sizen="${width * (1 / rightTextScale)} ${height}" halign="center" valign="center" scale="${rightTextScale}" text="${rightText}"/>`
}

export { Paginator, Grid, Navbar, DropdownMenu, CONFIG, ICONS, BACKGROUNDS, IDS, gridCell, centeredText, footerCloseButton, headerIconTitleText }