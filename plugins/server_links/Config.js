export default {
  isEnabled: true,
  useHttpServer: true,
  httpAddress: '',
  httpPort: 7309,
  refreshTimeout: 10, // In seconds
  // In seconds. (If more time passes since other servers last update it will be considered down)
  updateLimit: 30,
  dataFilePath: './plugins/server_links/temp/data.txt',
  servers: [
    {
      login: '',
      name: '',
      path: 'D://folder/plugins/server_links/temp/data.txt'
    },
    {
      login: '',
      name: '',
      url: ''
    }
  ],
  noDataText: '--'
}
