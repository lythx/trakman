/**
 * Constructs an invisible manialink covering the entire screen with given actionId and zIndex.
 * @param actionId Manialink Action ID
 * @param zIndex Manialink Z position 
 * @returns Manialink XML string
 */
export const fullScreenListener = (actionId: number, zIndex: number = -100): string => {
  return `<quad posn="-70 50 ${zIndex}" sizen="140 100" action="${actionId}"/>`
}
