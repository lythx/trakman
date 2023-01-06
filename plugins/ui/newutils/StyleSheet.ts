export type Styles = Partial<{
  width: number
  height: number
  x: number
  y: number
  z: number
  align: 'center' | 'left' | 'right'
  alignVertical: 'center' | 'top' | 'bottom'
  background: string
  textSize: number
  textScale: number
}>

export const StyleSheet = <T extends { [name: string]: Styles }>(styles: T): { [name in keyof T]: Styles } => {
  return styles
}