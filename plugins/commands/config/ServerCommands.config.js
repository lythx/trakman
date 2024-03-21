const p = tm.utils.palette

export default {
  timelimit: {
    set: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the remaining time to ${p.highlight}#{time}${p.admin}.`,
    notDynamic: `${p.error}Dynamic timer is disabled.`,
    notRaceMode: `${p.error}Time can be modified only during race.`,
    invalidParam: `${p.error}Invalid action. Actions: [time] (set), +[time] (add), -[time] (subtract), pause|stop (pause), resume|start|unpause (resume).`,
    tooLow: `${p.error}Timelimit too low to subtract time.`,
    public: true,
    privilege: 1,
    aliases: ['tl', 'timelimit'],
    help: 'Set, add, subtract, pause, or resume the remaining time of the current round.'
  },
  pauseTimer: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}paused ${p.admin}the timer.`,
    public: true,
    privilege: 1,
    aliases: ['pause', 'stop'],
    help: 'Pause the game time'
  },
  resumeTimer: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}resumed ${p.admin}the timer.`,
    public: true,
    privilege: 1,
    aliases: ['resume', 'start', 'unpause'],
    help: 'Resume the game time'
  },
  enabledynamictimer: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}enabled ${p.admin}the dynamic timer. It will be enabled after map change.`,
    alreadyEnabled: `${p.error}The dynamic timer is already enabled.`,
    public: true,
    privilege: 2,
    aliases: ['edt', 'enabledynamictimer'],
    help: 'Enable dynamic time limits.'
  },
  disabledynamictimer: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}disabled ${p.admin}the dynamic timer. It will be disabled after map change.`,
    alreadyDisabled: `${p.error}The dynamic timer is already disabled.`,
    public: true,
    privilege: 2,
    aliases: ['ddt', 'disabledynamictimer'],
    help: 'Disable dynamic time limits.'
  },
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
  setbuddynotif: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}{#status} ${p.admin}the friend list notifications.`,
    public: true,
    privilege: 3,
    aliases: [`sbn`, `sfln`, `setbuddynotif`, `setbuddynotification`],
    help: `Set whether friend list notifications are displayed for all players.`
  },
  shutdown: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}annihilated ${p.admin}the dedicated server.`,
    public: true,
    privilege: 3,
    aliases: ['sd', 'shutdown'],
    help: `Stop the dedicated server.`
  },
  call: {
    privilege: 4,
    aliases: ['call'],
    help: `Execute a dedicated server method. Params need to be specified in a valid json format or in "" for strings.`
  }
}