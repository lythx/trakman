export default {
  masteradmin: {
    public: true,
    privilege: 4,
    aliases: ['mad', 'masteradmin', 'addmasteradmin'],
    help: `Set player privilege to Masteradmin (3).`
  },
  admin: {
    public: true,
    privilege: 3,
    aliases: ['ad', 'admin', 'addadmin'],
    help: `Set player privilege to Admin (2).`
  },
  operator: {
    public: true,
    privilege: 2,
    aliases: ['op', 'operator', 'addop'],
    help: `Set player privilege to Operator (1).`
  },
  user: {
    public: true,
    privilege: 2,
    aliases: ['rp', 'user', 'removeprivilege'],
    help: `Set player privilege to None (0).`
  }
}
