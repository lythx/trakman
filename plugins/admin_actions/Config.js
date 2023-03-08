const p = tm.utils.palette

export default {
  noPermission: `${p.error} You have no permission to perform this action.`,
  kick: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has kicked ${p.highlight}#{name}${p.admin}.`,
    error: `${p.error}Player is not on the server.`,
    reason: `${p.admin}Reason${p.highlight}: #{reason}${p.admin}.`,
    public: true,
    noReason: 'No reason specified',
    privilege: tm.admin.privileges.kick
  },
  mute: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has muted ${p.highlight}#{name}${p.admin}#{duration}.`,
    reason: `${p.admin}Reason${p.highlight}: #{reason}${p.admin}.`,
    public: true,
    privilege: 1
  },
  unmute: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has unmuted ${p.highlight}#{name}${p.admin}.`,
    error: `${p.error}Could not unmute ${p.highlight}#{login}.`,
    notMuted: `${p.error}#{login} is not muted.`,
    public: true,
    privilege: 1,
  },
  forcespec: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has forced ${p.highlight}#{name} ${p.admin}into spectator mode.`,
    error: `${p.error}Player is not on the server.`,
    public: true,
    privilege: 1,
  },
  forceplay: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has forced ${p.highlight}#{name} ${p.admin}into player mode.`,
    error: `${p.error}Player is not on the server.`,
    public: true,
    privilege: 1,
  },
  kickghost: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has kicked ${p.highlight}#{name}${p.admin}.`,
    public: true,
    privilege: 1,
  },
  ban: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has banned ${p.highlight}#{name}${p.admin}#{duration}.`,
    error: `${p.error}Could not ban ${p.highlight}#{login}${p.error}.`,
    reason: `${p.admin}Reason${p.highlight}: #{reason}${p.admin}.`,
    public: true,
    privilege: 2,
  },
  unban: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has unbanned ${p.highlight}#{name}${p.admin}.`,
    error: `${p.error}Could not unban ${p.highlight}#{login}${p.error}.`,
    notBanned: `${p.error}#{login} is not banned.`,
    public: true,
    privilege: 2,
  },
  blacklist: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has blacklisted ${p.highlight}#{name}${p.admin}#{duration}.`,
    error: `${p.error}Could not blacklist ${p.highlight}#{login}${p.error}.`,
    reason: `${p.admin}Reason${p.highlight}: #{reason}${p.admin}.`,
    public: true,
    privilege: 2,
  },
  unblacklist: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has removed ${p.highlight}#{name} ${p.admin}from the blacklist.`,
    error: `${p.error}Could not remove ${p.highlight}#{login} ${p.error}from the blacklist.`,
    notBlacklisted: `${p.highlight}#{login} ${p.error}is not blacklisted.`,
    public: true,
    privilege: 2,
  },
  addguest: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has added ${p.highlight}#{name} ${p.admin}to the guestlist.`,
    error: `${p.error}Could not add ${p.highlight}#{login} ${p.error}to the guestlist.`,
    alreadyGuest: `${p.highlight}#{login} ${p.error}is already in the guestlist.`,
    public: true,
    privilege: 2,
  },
  rmguest: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has removed ${p.highlight}#{name} ${p.admin}from the guestlist.`,
    error: `${p.error}Could not remove ${p.highlight}#{login} ${p.error}from the guestlist.`,
    notGuest: `${p.highlight}#{login} ${p.error}is not in the guestlist.`,
    public: true,
    privilege: 2,
  }
}