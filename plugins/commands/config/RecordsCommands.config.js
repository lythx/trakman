const p = tm.utils.palette

export default {
  delrec: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has removed the record of ${p.highlight}#{nickname} ${p.admin}on the ongoing map.`,
    noPlayerRecord: `${p.error}Player #{login} does not have a record on this map.`,
    outOfRange: `${p.error}No record with index ##{index} on this map.`,
    public: true,
    privilege: 2,
    aliases: ['dr', 'delrec', 'deleterecord'],
    help: `Remove a player\'s record on the ongoing map.`
  },
  prunerecs: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has removed all the records on the ongoing map.`,
    public: true,
    privilege: 3,
    aliases: ['pr', 'prunerecs', 'prunerecords'],
    help: `Remove all records on the ongoing map.`
  },
}