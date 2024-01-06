const p = tm.utils.palette

export default {
  dropjukebox: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has removed ${p.highlight}#{name} ${p.admin}from the queue.`,
    error: `${p.error}No such index in the queue.`,
    public: true,
    privilege: 1,
    aliases: ['dq', 'djb', 'dropqueue', 'dropjukebox'],
    help: `Drop the specified track from the map queue.`
  },
  clearjukebox: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has removed ${p.highlight}all maps ${p.admin}from the queue.`,
    error: `${p.error}No maps in the queue.`,
    public: true,
    privilege: 1,
    aliases: ['cq', 'cjb', 'clearqueue', 'clearjukebox'],
    help: `Clear the entirety of the current map queue.`
  },
  shuffle: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has shuffled the queue.`,
    public: true,
    privilege: 2,
    aliases: ['shuf', 'shuffle'],
    help: `Shuffle the map list.`
  },
  clearhistory: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has cleared the map history.`,
    public: true,
    privilege: 2,
    aliases: ['ch', 'clearhistory'],
    help: `Clear the map history.`
  }
}