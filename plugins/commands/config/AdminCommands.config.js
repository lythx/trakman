const p = tm.utils.palette

export default {
  kick: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has kicked ${p.highlight}#{name}${p.admin}.`,
    error: `${p.error}Player is not on the server.`,
    reason: `${p.admin}Reason${p.highlight}: #{reason}${p.admin}.`,
    public: true,
    privilege: 1,
    aliases: ['k', 'kick'],
    help: `Kick a specific player.`
  },
  mute: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has muted ${p.highlight}#{name}${p.admin}#{duration}.`,
    reason: `${p.admin}Reason${p.highlight}: #{reason}${p.admin}.`,
    public: true,
    privilege: 1,
    aliases: ['m', 'mute'],
    help: `Mute a specific player.`
  },
  unmute: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has unmuted ${p.highlight}#{name}${p.admin}.`,
    error: `${p.error}Could not unmute ${p.highlight}#{login}.`,
    notMuted: `${p.error}#{login} is not muted.`,
    public: true,
    privilege: 1,
    aliases: ['um', 'unmute'],
    help: `Unmute a specific player.`
  },
  forcespec: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has forced ${p.highlight}#{name} ${p.admin}into spectator mode.`,
    error: `${p.error}Player is not on the server.`,
    public: true,
    privilege: 1,
    aliases: ['fs', 'forcespec'],
    help: `Force a player into spectator mode.`
  },
  forceplay: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has forced ${p.highlight}#{name} ${p.admin}into player mode.`,
    error: `${p.error}Player is not on the server.`,
    public: true,
    privilege: 1,
    aliases: ['fp', 'forceplay'],
    help: `Force a player into player mode.`
  },
  kickghost: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has kicked ${p.highlight}#{name}${p.admin}.`,
    public: true,
    privilege: 1,
    aliases: ['kg', 'gk', 'kickghost', 'ghostkick'],
    help: `Manipulate every soul on the server that you kicked someone.`
  },
  ban: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has banned ${p.highlight}#{name}${p.admin}#{duration}.`,
    error: `${p.error}Could not ban ${p.highlight}#{login}${p.error}.`,
    reason: `${p.admin}Reason${p.highlight}: #{reason}${p.admin}.`,
    public: true,
    privilege: 2,
    aliases: ['b', 'ban'],
    help: `Ban a specific player.`
  },
  unban: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has unbanned ${p.highlight}#{name}${p.admin}.`,
    error: `${p.error}Could not unban ${p.highlight}#{login}${p.error}.`,
    notBanned: `${p.error}#{login} is not banned.`,
    public: true,
    privilege: 2,
    aliases: ['ub', 'unban'],
    help: `Unban a specific player.`
  },
  blacklist: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has blacklisted ${p.highlight}#{name}${p.admin}#{duration}.`,
    error: `${p.error}Could not blacklist ${p.highlight}#{login}${p.error}.`,
    reason: `${p.admin}Reason${p.highlight}: #{reason}${p.admin}.`,
    public: true,
    privilege: 2,
    aliases: ['bl', 'blacklist'],
    help: `Blacklist a specific player.`
  },
  unblacklist: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has removed ${p.highlight}#{name} ${p.admin}from the blacklist.`,
    error: `${p.error}Could not remove ${p.highlight}#{login} ${p.error}from the blacklist.`,
    notBlacklisted: `${p.highlight}#{login} ${p.error}is not blacklisted.`,
    public: true,
    privilege: 2,
    aliases: ['ubl', 'unblacklist'],
    help: `Remove a specific player from the blacklist.`
  },
  addguest: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has added ${p.highlight}#{name} ${p.admin}to the guestlist.`,
    error: `${p.error}Could not add ${p.highlight}#{login} ${p.error}to the guestlist.`,
    alreadyGuest: `${p.highlight}#{login} ${p.error}is already in the guestlist.`,
    public: true,
    privilege: 2,
    aliases: ['ag', 'addguest'],
    help: `Add a player to the guestlist.`
  },
  rmguest: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has removed ${p.highlight}#{name} ${p.admin}from the guestlist.`,
    error: `${p.error}Could not remove ${p.highlight}#{login} ${p.error}from the guestlist.`,
    notGuest: `${p.highlight}#{login} ${p.error}is not in the guestlist.`,
    public: true,
    privilege: 2,
    aliases: ['rg', 'rmguest', 'removeguest',],
    help: `Remove a player from the guestlist.`
  }
}