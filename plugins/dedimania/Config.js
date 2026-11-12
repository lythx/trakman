const p = tm.utils.palette

export default {
  isEnabled: true,
  // Maximum amount of fetched records
  // (Dedimania normally stores 30, there are exceptions such as Nadeo maps with 50-80 records)
  dediCount: 30,
  syncName: true, // If true, sets player nicknames in the database to those fetched from Dedimania
  port: 8002, // Dedimania port (8002 for TMF)
  host: 'dedimania.net',
  // Timeouts for Dedimania reconnection attempts, in seconds
  // The first reconnection attempt will take the first specified number of seconds, then the second
  // until reaching the end of the list where it repeats the last value
  reconnectTimeout: [15, 30, 60, 120, 240],
  updateInterval: 240, // Interval for Dedimania server update, in seconds (recommended to be kept between 2-5 minutes)
  modifiedLapsMessage:
    `${p.dedimessage}Dedimania records will be sent in ${p.highlight}Time Attack` +
    ` ${p.dedimessage}instead of ${p.highlight}Rounds ${p.dedimessage}mode due to modified lap amount.`,
  // Whether local records not currently present on dedimania should be sent to them either way
  // Useful for servers that are active during the dedimania resets
  sendLocals: false,
}
