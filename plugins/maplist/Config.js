const p = tm.utils.palette

export default {
  cacheSize: 10, // Max number of map arrays stored in cache
  added: `${p.highlight}#{nickname} ${p.vote}has added ${p.highlight}#{map}${p.vote} to the queue.`,
  noPermission: `${p.error}You can't add more than one map to the queue.`,
  noFinishError: `${p.error}No unfinished maps available.`,
  noAuthorError: `${p.error}No maps with no author time available.`,
  noRankError: `${p.error}No maps with no rank available.`,
  defaultError: `${p.error}No maps available.`,
  autojuke: {
    aliases: ['aj', 'autojuke'],
    help: `Juke a random map. Options: nofinish(nofin), norank, noauthor`,
    privilege: 0
  },
  searchMinSimilarityValue: 0.1
}