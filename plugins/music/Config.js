export default {
  isEnabled: true,
  songListPath: './plugins/music/SongList.js', // Needed for updates on song add/remove
  autoplay: true,
  overrideMapMusic: true,
  // If song is in history it can't be requeued without force queue privileges
  historySize: 3,
  forceQueuePrivilege: 1,
  addCommand: {
    aliases: ['addsong'],
    help: 'Add and queue a song.',
    privilege: 1,
    public: true
  },
  removeCommand: {
    aliases: ['removesong'],
    help: 'Remove a song.',
    privilege: 1,
    public: true
  },
  openListCommand: {
    aliases: ['songs', 'songlist'],
    help: 'Open song list.'
  }
}