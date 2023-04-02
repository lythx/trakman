const p = tm.utils.palette

export default {
  isEnabled: true,
  songListPath: './plugins/music/SongList.js', // Needed for updates on song add/remove
  overrideMapMusic: true,
  // If song is in history it can't be requeued without force queue privileges
  historySize: 3,
  // Privilege required to queue recently queued songs, queue more than one song and shuffle songs
  forceQueuePrivilege: 1,
  messages: {
    addToQueue: `${p.highlight}#{nickname} ${p.vote}has added ${p.highlight}#{song}${p.vote}` +
      ` by ${p.highlight}#{author}${p.vote} to the song queue.`,
    removeFromQueue: `${p.highlight}#{nickname} ${p.vote}has removed ${p.highlight}#{song}${p.vote} from the song queue.`,
  },
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
  shuffleCommand: {
    aliases: ['shufflesongs'],
    help: 'Shuffle the songlist.',
    privilege: 1,
    public: true
  },
  openListCommand: {
    aliases: ['songs', 'songlist'],
    help: 'Open song list.'
  }
}