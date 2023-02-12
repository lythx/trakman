export default {
  isEnabled: true,
  // Maximum amount of fetched records 
  // (Dedimania normally stores 30, there are exceptions such as Nadeo maps with 50-80 records)
  syncName: true, // If true, sets player nicknames in the database to those fetched from Dedimania
  dediCount: 30,
  port: 8002, // Dedimania port (8002 for TMF)
  host: 'dedimania.net',
  reconnectTimeout: 120, // Timeout for Dedimania reconnection attempts, in seconds
  updateInterval: 240, // Interval for Dedimania server update, in seconds (recommended to be kept between 2-5 minutes)
}