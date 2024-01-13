const p = tm.utils.palette

export default {
  add: {
    privilege: tm.config.controller.privileges.addMap,
    aliases: ['add', 'am', 'addmap'],
    help: `Add a map from TMX.`
  },
  addlocal: {
    addError: `${p.error}Failed to add the map.`,
    added: `${p.admin}#{title} ${p.highlight}#{nickname}${p.admin} has added and queued ${p.highlight}#{map}${p.admin} from local files.`,
    public: true,
    privilege: 3,
    aliases: ['addlocal', 'al'],
    help: `Add a map from local files.`
  },
  addrandom: {
    fetchError: `${p.error}Failed to fetch random map from TMX.`,
    addError: `${p.error}Failed to add the map.`,
    added: `${p.admin}#{title} ${p.highlight}#{nickname}${p.admin} has added and queued` +
      ` ${p.highlight}#{map}${p.admin} from TMX random.`,
    public: true,
    privilege: tm.config.controller.privileges.addMap,
    aliases: ['ar', 'addr', 'addrandom'],
    help: `Add a random map from TMX.`
  },
  remove: {
    privilege: tm.config.controller.privileges.removeMap,
    aliases: ['et', 'rt', 'erase', 'erasethis'],
    help: `Remove a current map from maplist.`
  },
  addfromurl: {
    fetchError: `${p.error}Failed to fetch the map file.`,
    addError: `${p.error}Failed to add the map.`,
    alreadyAdded: `${p.admin}Map ${p.highlight}#{map}${p.admin} added by ${p.highlight}#{nickname}${p.admin} is already on the server, ` +
      `it will be ${p.highlight}queued ${p.admin}instead.`,
    added: `${p.admin}#{title} ${p.highlight}#{nickname}${p.admin} has added and queued ${p.highlight}#{map}${p.admin} from url.`,
    public: true,
    privilege: tm.config.controller.privileges.addMap,
    aliases: ['afu', 'addfromurl'],
    help: `Add a map from url.`
  },
  addallfromdb: {
    error: `${p.error}Failed to get maps from the database.`,
    privilege: 4,
    aliases: ['aadb', 'addallfromdb'],
    help: `Add all the maps present in the database, if they are already in the server files.`
  },
  publicadd: {
    notAvailable: `${p.error}Public ${p.highlight}/add ${p.error} is not available on this server.`,
    fetchError: `${p.error}Failed to fetch the map file from TMX.`,
    addError: `${p.error}Failed to add the map.`,
    alreadyAdded: `${p.admin}Map ${p.highlight}#{map}${p.admin} added by ${p.highlight}#{nickname}${p.admin} is already on the server, ` +
      `it will be ${p.highlight}queued ${p.admin}instead.`,
    added: `${p.admin}#{title} ${p.highlight}#{nickname}${p.admin} has added and queued ${p.highlight}#{map}${p.admin} from TMX.`,
    public: true,
    privilege: 0,
    aliases: ['add', 'am', 'addmap'],
    help: `Add a map from TMX.`
  }
}