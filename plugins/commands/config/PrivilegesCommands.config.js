import { palette as p } from '../../../src/Trakman.js'

export default {
  noPrivilege: `${p.error}You cannot control privileges of a person who has equal or higher privilege than you.`,
  masteradmin: {
    promote: `${p.admin}#{title} ${p.highlight}#{adminNickname}${p.admin} has promoted ` +
    `${p.highlight}#{nickname}${p.admin} to Masteradmin.`,
    alreadyIs: `${p.highlight}#{nickname}${p.error} is already Masteradmin.`,
    public: true,
    privilege: 4
  },
  admin: {
    promote: `${p.admin}#{title} ${p.highlight}#{adminNickname}${p.admin} has promoted ` +
    `${p.highlight}#{nickname}${p.admin} to Admin.`,
    demote: `${p.admin}#{title} ${p.highlight}#{adminNickname}${p.admin} has demoted ` +
    `${p.highlight}#{nickname}${p.admin} to Admin.`,
    alreadyIs: `${p.highlight}#{nickname}${p.error} is already Admin.`,
    public: true,
    privilege: 3
  },
  operator: {
    promote: `${p.admin}#{title} ${p.highlight}#{adminNickname}${p.admin} has promoted ` +
    `${p.highlight}#{nickname}${p.admin} to Operator.`,
    demote: `${p.admin}#{title} ${p.highlight}#{adminNickname}${p.admin} has demoted ` +
    `${p.highlight}#{nickname}${p.admin} to Operator.`,
    alreadyIs: `${p.highlight}#{nickname}${p.error} is already Operator.`,
    public: true,
    privilege: 2
  },
  user: {
    demote: `${p.admin}#{title} ${p.highlight}#{adminNickname}${p.admin} has removed permissions of ` +
    `${p.highlight}#{nickname}${p.admin}.`,
    alreadyIs: `${p.highlight}#{nickname}${p.error} has no priveleges.`,
    public: true,
    privilege: 2
  }
}