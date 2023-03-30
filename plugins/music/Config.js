export default {
  isEnabled: true,
  songListPath: './plugins/music/SongList.js', // Needed for updates on song add/remove
  autoplay: true,
  overrideMapMusic: true,
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
  }
}