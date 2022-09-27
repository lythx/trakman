const p = tm.utils.palette

export default {
  dropjukebox: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has removed ${p.highlight}#{name} ${p.admin}from the queue.`,
    error: `${p.error}No such index in the queue.`,
    public: true,
    privilege: 1
  },
  clearjukebox: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has removed ${p.highlight}#{name} ${p.admin}all mapos from the queue.`,
    error: `${p.error}No maps in the queue.`,
    public: true,
    privilege: 1
  },
  shuffle: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has shuffled the queue.`,
    public: true,
    privilege: 2
  }
}