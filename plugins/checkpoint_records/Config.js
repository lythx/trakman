import { palette as p } from "../../config/Prefixes.js"

export default {
  noCpRecords: `${p.error}You have no checkpoint records on the ongoing map.`,
  allPlayerCpsRemoved: `${p.servermsg}Your checkpoints on the ongoing map were removed.`,
  outOfRange: `${p.error}Checkpoint index needs to be > 0 and <= to the ongoing map's checkpoint count.`,
  playerCpRemoved: `${p.servermsg}Your ${p.highlight}#{index}${p.servermsg} checkpoint was removed.`,
  allBestCpsRemoved: `${p.admin}#{title} ${p.highlight}#{nickname}${p.admin} has removed `
    + `${p.highlight}all checkpoint records${p.admin} on the ongoing map.`,
  bestCpRemoved: `${p.admin}#{title} ${p.highlight}#{nickname}${p.admin} has removed the `
  + `${p.highlight}#{index}${p.admin} checkpoint record on the ongoing map.`
}