export default {
  isEnabled: true,
  // Maximum amount of fetched records 
  // (dedimania usually stores 30, there are exceptions such as nadeo maps with 50 records)
  syncName: true, // If true changes player nicknames in controller to nicknames fetched from dedimania
  dediCount: 30,
  port: 8002, // Dedimnia port (8002 for tmnf)
  host: 'dedimania.net',
  reconnectTimeout: 120, // seconds
}