import { palette as p } from "../../config/Prefixes.js"

export default {
  isEnabled: true,
  // Using DB client makes the plugin a bit faster due to high amount of database queries
  // If too many plugins are using DB clients the process might hang
  useDBClient: true, 
  noSectorRecords: `${p.error}You have no sector records on the ongoing map.`,
  allPlayerSectorsRemoved: `${p.servermsg}Your sectors on the ongoing map were removed.`,
  outOfRange: `${p.error}Sector index needs to be > 0 and <= to the ongoing map's sector count.`,
  playerSectorRemoved: `${p.servermsg}Your ${p.highlight}#{index}${p.servermsg} sector was removed.`,
  allBestSectorsRemoved: `${p.admin}#{title} ${p.highlight}#{nickname}${p.admin} has removed `
    + `${p.highlight}all sector records${p.admin} on the ongoing map.`,
  bestSectorRemoved: `${p.admin}#{title} ${p.highlight}#{nickname}${p.admin} has removed the `
  + `${p.highlight}#{index}${p.admin} sector record on the ongoing map.`
}