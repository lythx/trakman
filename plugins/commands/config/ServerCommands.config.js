const p = tm.utils.palette

export default {
  setrefpwd: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the referee password to ${p.highlight}#{password}${p.admin}.`,
    error: `${p.error}Invalid password.`,
    public: false,
    privilege: 2,
    aliases: ['srp', 'setrefpwd', 'setrefereepassword'],
    help: `Set the referee password.`
  },
  setrefmode: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the referee mode to ${p.highlight}#{mode}${p.admin}.`,
    public: true,
    privilege: 2,
    aliases: ['srm', 'setrefmode', 'setrefereemode'],
    help: `Set the referee mode.`
  },
  pay: {
    selfText: `${p.admin}You withdrew ${p.highlight}#{coppers}` +
      ` ${p.admin}coppers from the server.`,
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}paid ${p.highlight}#{coppers}` +
      ` ${p.admin}coppers to ${p.highlight}#{target}${p.admin}.`,
    defaultMessage: `You received #{coppers} coppers from #{server}$z$s.`,
    error: `${p.error}Failed to pay coppers to ${p.highlight}#{login}${p.error}.`,
    public: false,
    privilege: 3,
    aliases: ['pay'],
    help: `Pay coppers from server account.`
  },
  setservername: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the server name to ${p.highlight}#{value}$z$s${p.admin}.`,
    public: true,
    privilege: 3,
    aliases: ['ssn', 'setservername'],
    help: `Set the server name.`
  },
  setcomment: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the server comment to ${p.highlight}#{value}$z$s${p.admin}.`,
    public: true,
    privilege: 3,
    aliases: ['sc', 'setcomment'],
    help: `Set the server comment.`
  },
  setpassword: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the player password to ${p.highlight}#{value}$z$s${p.admin}.`,
    error: `${p.error}Invalid password.`,
    public: false,
    privilege: 3,
    aliases: ['sp', 'setpwd', 'setpassword'],
    help: `Set the player password.`
  },
  setspecpassword: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the spectator password to ${p.highlight}#{value}$z$s${p.admin}.`,
    error: `${p.error}Invalid password.`,
    public: false,
    privilege: 3,
    aliases: ['ssp', 'setspecpwd', 'setspecpassword'],
    help: `Set the spectator password.`
  },
  setmaxplayers: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the max players amount to ${p.highlight}#{value}${p.admin}.`,
    public: true,
    privilege: 3,
    aliases: ['smp', 'setmaxplayers'],
    help: `Set the max players amount.`
  },
  setmaxspecs: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the max spectators amount to ${p.highlight}#{value}${p.admin}.`,
    public: true,
    privilege: 3,
    aliases: ['sms', 'setmaxspecs'],
    help: `Set the max spectators amount.`
  },
  settimelimit: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the time limit to ${p.highlight}#{value} ${p.admin}seconds.`,
    public: true,
    privilege: 3,
    aliases: ['stl', 'settimelimit'],
    help: `Set the time you spend gaming.`
  },
  sendnotice: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the notice to ${p.highlight}#{value}${p.admin}.`,
    public: false,
    privilege: 3,
    aliases: ['sn', 'sendnotice'],
    help: `Send a notice. If the last word in notice is a login, that player\'s avatar will be displayed.`
  },
  allowmapdownload: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}#{value} ${p.admin}the map download.`,
    public: true,
    privilege: 3,
    aliases: ['amdl', 'allowmapdownload'],
    help: `Set whether map download is enabled.`
  },
  sethideserver: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has updated server visibility to ${p.highlight}#{status}${p.admin}.`,
    status: {
      visible: 'visible',
      hidden: 'hidden',
      noTmnf: 'hidden for TMNF players'
    },
    public: true,
    privilege: 3,
    aliases: ['shs', 'sethideserver'],
    help: `Set whether the server is hidden.`
  },
  autosavereplays: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}#{value} ${p.admin}the server replay autosaving.`,
    public: true,
    privilege: 3,
    aliases: ['asr', 'autosavereplays'],
    help: `Set whether replays should be autosaved by the server.`
  },
  autosavevalreplays: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}#{value} ${p.admin}the server validation replay autosaving.`,
    public: true,
    privilege: 3,
    aliases: ['asvr', 'autosavevalreplays'],
    help: `Set whether validation replays should be autosaved by the server.`
  },
  killcontroller: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}murdered ${p.admin}the server controller.`,
    public: true,
    privilege: 3,
    aliases: ['kc', 'killcontroller'],
    help: `Kill the server controller.`
  },
  shutdown: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}annihilated ${p.admin}the dedicated server.`,
    public: true,
    privilege: 3,
    aliases: ['sd', 'shutdown'],
    help: `Stop the dedicated server.`
  }
}