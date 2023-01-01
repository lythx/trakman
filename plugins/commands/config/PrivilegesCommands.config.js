const p = tm.utils.palette

export default {
  noPrivilege: `${p.error}You cannot control privileges of a person who has equal or higher privilege than you.`,
  masteradmin: {
    promote: `${p.admin}#{title} ${p.highlight}#{adminNickname}${p.admin} has promoted ` +
      `${p.highlight}#{nickname}${p.admin} to Masteradmin.`,
    alreadyIs: `${p.highlight}#{nickname}${p.error} is already Masteradmin.`,
    public: true,
    privilege: 4,
    aliases: ['mad', 'masteradmin', 'addmasteradmin'],
    help: `Set player privilege to Masteradmin (3).`
  },
  admin: {
    promote: `${p.admin}#{title} ${p.highlight}#{adminNickname}${p.admin} has promoted ` +
      `${p.highlight}#{nickname}${p.admin} to Admin.`,
    demote: `${p.admin}#{title} ${p.highlight}#{adminNickname}${p.admin} has demoted ` +
      `${p.highlight}#{nickname}${p.admin} to Admin.`,
    alreadyIs: `${p.highlight}#{nickname}${p.error} is already Admin.`,
    public: true,
    privilege: 3,
    aliases: ['ad', 'admin', 'addadmin'],
    help: `Set player privilege to Admin (2).`
  },
  operator: {
    promote: `${p.admin}#{title} ${p.highlight}#{adminNickname}${p.admin} has promoted ` +
      `${p.highlight}#{nickname}${p.admin} to Operator.`,
    demote: `${p.admin}#{title} ${p.highlight}#{adminNickname}${p.admin} has demoted ` +
      `${p.highlight}#{nickname}${p.admin} to Operator.`,
    alreadyIs: `${p.highlight}#{nickname}${p.error} is already Operator.`,
    public: true,
    privilege: 2,
    aliases: ['op', 'operator', 'addop'],
    help: `Set player privilege to Operator (1).`
  },
  user: {
    demote: `${p.admin}#{title} ${p.highlight}#{adminNickname}${p.admin} has removed permissions of ` +
      `${p.highlight}#{nickname}${p.admin}.`,
    alreadyIs: `${p.highlight}#{nickname}${p.error} has no priveleges.`,
    public: true,
    privilege: 2,
    aliases: ['rp', 'user', 'removeprivilege'],
    help: `Set player privilege to None (0).`
  }
}