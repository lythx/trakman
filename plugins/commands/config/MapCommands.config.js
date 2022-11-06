const p = tm.utils.palette

export default {
  addallfromdb: {
    error: `${p.error}Failed to get maps from the database.`,
    privilege: 4
  },
  add: {
    fetchError: `${p.error} Failed to fetch the map file from TMX.`,
    addError: `${p.error} Failed to add the map.`,
    alreadyAdded: `${p.admin}Map ${p.highlight}#{map}${p.admin} added by #{nickname}${p.admin} is already on the server, ` +
      `it will be ${p.highlight}queued ${p.admin}instead.`,
    added: `${p.admin}#{title} ${p.highlight}#{nickname}${p.admin} has added and queued ${p.highlight}#{map}${p.admin} from TMX.`,
    public: true,
    privilege: 1
  },
  remove: {
    text: `${p.admin}#{title} ${p.highlight}#{nickname}${p.admin} has removed the current map.`,
    error: `${p.error} The map is already getting removed.`,
    public: true,
    privilege: 1
  },
  addlocal: {
    addError: `${p.error} Failed to add the map.`,
    added: `${p.admin}#{title} ${p.highlight}#{nickname}${p.admin} has added and queued ${p.highlight}#{map}${p.admin} from local files.`,
    public: true,
    privilege: 3
  },
  addfromurl: {
    fetchError: `${p.error} Failed to fetch the map file.`,
    addError: `${p.error} Failed to add the map.`,
    alreadyAdded: `${p.admin}Map ${p.highlight}#{map}${p.admin} added by #{nickname}${p.admin} is already on the server, ` +
      `it will be ${p.highlight}queued ${p.admin}instead.`,
    added: `${p.admin}#{title} ${p.highlight}#{nickname}${p.admin} has added and queued ${p.highlight}#{map}${p.admin} from url.`,
    public: true,
    privilege: 1
  }
}