import { palette as p } from "../../src/Trakman.js"

export default { // CHeck if colours good
  added: `${p.highlight}#{nickname} ${p.vote}added ${p.highlight}#{map}${p.vote} to the queue.`,
  noPermission: `${p.error}You can't add more than one map to the queue.`,
  noFinishError: `${p.error}No unfinished maps available`,
  noAuthorError: `${p.error}No maps with no author time available`,
  noRankError: `${p.error}No maps with no rank available`,
  defaultError: `${p.error}No maps available`
}