import { palette as p } from '../../../src/Trakman.js'

export default {
  delrec: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has removed the record of ${p.highlight}#{nickname} ${p.admin}on the ongoing map.`,
    error: `${p.error}Player #{login} does not have a record on this map.`,
    public: true,
    privilege: 2
  },
  prunerecs: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has removed all the records on the ongoing map.`,
    public: true,
    privilege: 3
  },
}