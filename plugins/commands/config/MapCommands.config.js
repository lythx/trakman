const p = tm.utils.palette

export default {
  addallfromdb: {
    error: `${p.error}Failed to get maps from the database.`,
    privilege: 4
  },
  add: {
    fetchError: `${p.error} Failed to fetch map file from TMX.`,
    writeError: `${p.error} Failed to write map file.`,
    queueError: `${p.error} Failed to queue the map.`,
    alreadyAdded: `${p.admin}Map ${p.highlight}#{map}${p.admin} added by #{nickname}${p.admin} is already on the server, ` +
      `it will be ${p.highlight}queued ${p.admin}instead.`,
    added: `${p.admin}#{title} ${p.highlight}#{nickname}${p.admin} has added and queued ${p.highlight}#{map}${p.admin} from TMX.`,
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
    fetchError: `${p.error} Failed to fetch map file.`,
    writeError: `${p.error} Failed to write map file.`,
    queueError: `${p.error} Failed to queue the map.`,
    alreadyAdded: `${p.admin}Map ${p.highlight}#{map}${p.admin} added by #{nickname}${p.admin} is already on the server, ` +
      `it will be ${p.highlight}queued ${p.admin}instead.`,
    added: `${p.admin}#{title} ${p.highlight}#{nickname}${p.admin} has added and queued ${p.highlight}#{map}${p.admin} from url.`,
    public: true,
    privilege: 1
  }
}