import prefixes from './Prefixes.js'

const p = prefixes.palette

export default {
  noPermission: `${p.error} You have no permission to use this command.`,
  noParam: `${p.error}Required param #{name} not specified.`,
  invalidValue: `${p.error}Provided invalid value for parameter #{name}. Valid values are${p.highlight}: #{values}${p.error}.`,
  notInt: `${p.error}Provided wrong argument type for parameter <#{name}>: int.`,
  notDouble: `${p.error}Provided wrong argument type for parameter <#{name}>: double.`,
  notBoolean: `${p.error}Provided wrong argument type for parameter <#{name}>: boolean.`,
  notTime: `${p.error}Provided wrong argument type for time parameter <#{name}>: time.`,
  noPlayer: `${p.error}Player #{name} is not on the server.`,
  unknownPlayer: `${p.error}Unknown player #{name}.`
}