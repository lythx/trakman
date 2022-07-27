import { getIcon } from './GetIcon.js'
import CONFIG from '../config/UIConfig.json' assert { type: 'json' }

export const closeButton = (actionId: number, parentWidth: number, parentHeight: number, options?: { width?: number, height?: number, padding?: number }): string => {
  const width: number = options?.width ?? CONFIG.closeButton.buttonWidth
  const height: number = options?.height ?? CONFIG.closeButton.buttonHeight
  const padding: number = options?.padding ?? CONFIG.closeButton.padding
  return `<quad posn="${parentWidth / 2} ${-parentHeight / 2} 1" sizen="${width} ${height}" halign="center" valign="center" bgcolor="${CONFIG.closeButton.background}"/>
    <quad posn="${parentWidth / 2} ${-parentHeight / 2} 3" sizen="${width - padding * 2} ${height - padding * 2}" halign="center" valign="center" action="${actionId}" 
    imagefocus="${getIcon(CONFIG.closeButton.icon + 'Hover')}"
    image="${getIcon(CONFIG.closeButton.icon)}"/>`
}