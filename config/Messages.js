import prefixes from './PrefixesAndPalette.js'

const p = prefixes.palette

export default {
  /** Message sent to the player attempting to use a command they do not have the permission for */
  noPermission: `${p.error} You have no permission to use this command.`,
  /** Message sent to the muted player attempting to use a command that is disabled for muted players */
  playerMuted: `${p.error} You are muted and cannot use this command.`,
  /** Message sent to the player attempting to use a command without an obligatory parameter */
  noParam: `${p.error}Required param ${p.highlight}#{name}${p.error} not specified.`,
  /** Message sent to the player attempting to use a command while supplying the wrong value for a parameter */
  invalidValue: `${p.error}Provided invalid value for parameter ${p.highlight}#{name}${p.error}. Valid values are${p.highlight}: #{values}${p.error}.`,
  /** Message sent to the player attempting to use a command while supplying the wrong type for the int parameter */
  notInt: `${p.error}Provided wrong argument type for parameter ${p.highlight}<#{name}>: int${p.error}.`,
  /** Message sent to the player attempting to use a command while supplying the wrong type for the double parameter */
  notDouble: `${p.error}Provided wrong argument type for parameter ${p.highlight}<#{name}>: double${p.error}.`,
  /** Message sent to the player attempting to use a command while supplying the wrong type for the boolean parameter */
  notBoolean: `${p.error}Provided wrong argument type for parameter ${p.highlight}<#{name}>: boolean${p.error}.`,
  /** Message sent to the player attempting to use a command while supplying the wrong type for the time parameter */
  notTime: `${p.error}Provided wrong argument type for time parameter ${p.highlight}<#{name}>: time${p.error}.`,
  /** Message sent to the player attempting to use a command while supplying an out-of-range value for the time parameter */
  timeTooBig: `${p.error}Value provided for parameter ${p.highlight}<#{name}>: time${p.error} is too big.`,
  /** Message sent to the player if the specified login is not found in the runtime */
  noPlayer: `${p.error}Player ${p.highlight}#{name}${p.error} is not on the server.`,
  /** Message sent to the player if the specified login is not found in the database */
  unknownPlayer: `${p.error}Unknown player ${p.highlight}#{name}${p.error}.`
}