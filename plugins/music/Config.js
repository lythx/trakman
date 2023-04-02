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
    cantAddMoreThanOne: `${p.error}You can't add more than one song to the queue.`,
    addToQueueError: `${p.error}Error while adding the song to the queue.`,
    removeFromQueue: `${p.highlight}#{nickname} ${p.vote}has removed ${p.highlight}#{song}${p.vote} from the song queue.`,
    removeFromQueueError: `${p.error}Error while removing the song from the queue.`,
    add: `${p.highlight}#{nickname} ${p.vote}has added and queued song ${p.highlight}#{song}${p.vote}` +
      ` by ${p.highlight}#{author}${p.vote}.`,
    addNameError: `${p.error}Song named ${p.highlight}#{name} ${p.error}already exists.`,
    addFileExtensionError: `${p.error}Song url file extension needs to be ` +
      `${p.highlight}.ogg ${p.error}or ${p.highlight}.mux${p.error}, ${p.highlight}#{url} ${p.error}is invalid.`,
    remove: `${p.highlight}#{nickname} ${p.vote}has deleted song ${p.highlight}#{song}${p.vote}.`,
    removeError: `${p.error}Song named ${p.highlight}#{name} ${p.error}doesn't exist.`,
    shuffle: `${p.highlight}#{nickname} ${p.vote}has shuffled the song queue.`
  },
  // Whether add and remove from queue messages are public
  publicQueue: true,
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