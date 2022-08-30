import config from './CloseButton.config.js'

export const closeButton = (actionId: number, parentWidth: number, parentHeight: number, options?: { width?: number, height?: number, padding?: number }): string => {
  const width: number = options?.width ?? config.buttonWidth
  const height: number = options?.height ?? config.buttonHeight
  const padding: number = options?.padding ?? config.padding
  return `<quad posn="${parentWidth / 2} ${-parentHeight / 2} 1" sizen="${width} ${height}" halign="center" 
     valign="center" bgcolor="${config.background}"/>
    <quad posn="${parentWidth / 2} ${-parentHeight / 2} 3" sizen="${width - padding * 2} ${height - padding * 2}"
     halign="center" valign="center" action="${actionId}" 
    imagefocus="${config.iconHover}"
    image="${config.icon}"/>`
}