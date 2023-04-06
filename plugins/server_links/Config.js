export default {
  isEnabled: true,
  // http server can be used to connect servers running on different computers
  useHttpServer: true,
  httpAddress: '127.0.0.1',
  httpPort: 7309,
  refreshTimeout: 10, // In seconds
  // In seconds. (If more time passes since other servers last update it will be considered down)
  updateLimit: 30,
  dataFilePath: './plugins/server_links/temp/data.txt',
  // to connect a remote server set "url" instead of "path"
  servers: [
    {
      name: 'name1',
      path: 'D://<controller_directory>/plugins/server_links/temp/data.txt'
    },
    {
      name: 'name2',
      url: 'http://url:port'
    }
  ],
  noDataText: '--'
}
