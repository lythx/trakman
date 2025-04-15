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
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has loaded the MatchSettings file ${p.highlight}#{file}${p.admin}.`,
    error: `${p.error}Could not load the MatchSettings file.`,
    public: false,
    privilege: 3,
    aliases: [`lms`, `loadmatchsettings`],
    help: `Load the MatchSettings file from the specified location.`
  },
  savematchsettings: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has saved the MatchSettings file ${p.highlight}#{file}${p.admin}.`,
    error: `${p.error}Could not save the MatchSettings file.`,
    public: false,
    privilege: 3,
    aliases: [`svms`, `savematchsettings`],
    help: `Save the MatchSettings file to the specified location.`
  },
  updatemaps: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has updated the map list.`,
    public: true,
    privilege: 3,
    aliases: ['udm', 'updatemaps'],
    help: `Update the map list (parses maps, might take a very long time and lag the server for a while)`
  },
  recalculateranks: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}force re-calculated server ranks.`,
    public: true,
    privilege: 3,
    aliases: ['recalculateranks', 'updateranks', 'recrank'],
    help: `Force re-calculate every rank on the server.`
  },
  servermessage: {
    aliases: ['sm', 'servermessage', 'servermsg'],
    message: `$g[#{server}$z$s$g] #{message}`,
    help: `Send a message from the server.`,
    privilege: 2,
    public: true
  }
}