/**
 * @author lythx
 * @since 1.3
 */

import { PopupWindow, componentIds, closeButton } from '../UI.js'
import config from './WarnWindow.config.js'

interface DisplayParams { message?: string, callerNickname: string, mode: 'wall' | 'warn' }

export default class WarnWindow extends PopupWindow<DisplayParams> {

  constructor() {
    super(componentIds.warnWindow, config.warn.icon, config.warn.title, [], config.width, config.height)
    tm.commands.add({
      aliases: config.warn.aliases,
      help: config.warn.help,
      params: [{ name: 'login', type: 'player' }, { name: 'message', optional: true, type: 'multiword' }],
      callback: (info, player: tm.Player, message?: string) => {
        this.displayToPlayer(player.login, { message, callerNickname: info.nickname, mode: 'warn' })
        if (config.warn.public) {
          tm.sendMessage(tm.utils.strVar(config.warn.chatMessage, {
            title: info.title,
            adminName: tm.utils.strip(info.nickname),
            name: tm.utils.strip(player.nickname)
          }))
        }
      },
      privilege: config.warn.privilege
    })
    tm.commands.add({
      aliases: config.wall.aliases,
      help: config.wall.help,
      params: [{ name: 'message', type: 'multiword' }],
      callback: (info, message: string) => {
        for (const e of tm.players.list) {
          this.displayToPlayer(e.login, { message, callerNickname: info.nickname, mode: 'wall' },
            undefined, undefined, config.wall.title, config.wall.icon)
        }
      },
      privilege: config.wall.privilege
    })
  }

  protected constructContent(login: string, params: DisplayParams): string {
    const p = config.padding
    const w = this.contentWidth - p * 4
    const h = this.contentHeight - p * 4
    const text = params.mode === 'warn' ? tm.utils.strVar(config.warn.message, {
      name: tm.utils.strip(params.callerNickname, false),
      message: params.message ?? config.warn.defaultMessage
    })
      : tm.utils.strVar(config.wall.message, {
        name: tm.utils.strip(params.callerNickname, false),
        message: params.message ?? ''
      })
    return `<format textsize="${config.textSize}"/>
    <quad posn="${p} ${-p} 2" sizen="${w + p * 2} ${h + p * 2}" bgcolor="${config.textBackground}"/>
    <frame posn="${p * 2} ${-p * 2} 1">
      <label posn="0 0 3" sizen="${w} ${h}"
      text="${text}" autonewline="1"/>
    </frame>`
  }

  protected constructFooter(): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight)
  }

} 
