const p = tm.utils.palette
const priv = tm.admin.privileges

export default {
  kick: {
    privilege: priv.kick,
    aliases: ['k', 'kick'],
    help: `Kick a specific player.`
  },
  mute: {
    privilege: priv.mute,
    aliases: ['m', 'mute'],
    help: `Mute a specific player.`
  },
  unmute: {
    privilege: priv.mute,
    aliases: ['um', 'unmute'],
    help: `Unmute a specific player.`
  },
  forcespec: {
    privilege: priv.forceSpectator,
    aliases: ['fs', 'forcespec'],
    help: `Force a player into spectator mode.`
  },
  forceplay: {
    privilege: priv.forceSpectator,
    aliases: ['fp', 'forceplay'],
    help: `Force a player into player mode.`
  },
  kickghost: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has kicked ${p.highlight}#{name}${p.admin}.`,
    public: true,
    privilege: priv.kick,
    aliases: ['kg', 'gk', 'kickghost', 'ghostkick'],
    help: `Manipulate every soul on the server that you kicked someone.`
  },
  ban: {
    privilege: priv.ban,
    aliases: ['b', 'ban'],
    help: `Ban a specific player.`
  },
  unban: {
    privilege: priv.ban,
    aliases: ['ub', 'unban'],
    help: `Unban a specific player.`
  },
  blacklist: {
    privilege: priv.blacklist,
    aliases: ['bl', 'blacklist'],
    help: `Blacklist a specific player.`
  },
  unblacklist: {
    privilege: priv.blacklist,
    aliases: ['ubl', 'unblacklist'],
    help: `Remove a specific player from the blacklist.`
  },
  addguest: {
    privilege: priv.addGuest,
    aliases: ['ag', 'addguest'],
    help: `Add a player to the guestlist.`
  },
  rmguest: {
    privilege: priv.addGuest,
    aliases: ['rg', 'rmguest', 'removeguest'],
    help: `Remove a player from the guestlist.`
  },
  loadmatchsettings: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has loaded the MatchSettings file ${p.highlight}{#file}${p.admin}.`,
    error: `${p.error}Could not load the specified MatchSettings file.`,
    public: true,
    privilege: 3,
    aliases: [`lms`, `loadmatchsettings`],
    help: `Load the MatchSettings file.`
  }
}