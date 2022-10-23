import prefixes from './PrefixesAndPalette.js'

const p = prefixes.palette

export default {
  noPermission: `${p.error} You have no permission to use this command.`,
  noParam: `${p.error}Required param ${p.highlight}#{name}${p.error} not specified.`,
  invalidValue: `${p.error}Provided invalid value for parameter ${p.highlight}#{name}${p.error}. Valid values are${p.highlight}: #{values}${p.error}.`,
  notInt: `${p.error}Provided wrong argument type for parameter ${p.highlight}<#{name}>: int${p.error}.`,
  notDouble: `${p.error}Provided wrong argument type for parameter ${p.highlight}<#{name}>: double${p.error}.`,
  notBoolean: `${p.error}Provided wrong argument type for parameter ${p.highlight}<#{name}>: boolean${p.error}.`,
  notTime: `${p.error}Provided wrong argument type for time parameter ${p.highlight}<#{name}>: time${p.error}.`,
  timeTooBig: `${p.error}Value provided for parameter ${p.highlight}<#{name}>: time${p.error} is too big.`,
  noPlayer: `${p.error}Player ${p.highlight}#{name}${p.error} is not on the server.`,
  unknownPlayer: `${p.error}Unknown player ${p.highlight}#{name}${p.error}.`
}