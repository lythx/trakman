const p = tm.utils.palette

export default {
  // If false plugin cant be activated
  isEnabled: true,
  // This can be changed using an ingame command
  isActive: false,
  // Time calculation mode. For now it has only one option: "author"
  defaultMode: 'author',
  // Time multiplier eg. if mode = "author" and multilpier = 10, then the time will be
  // set to `authorTime * 10`
  defaultMultiplier: 10,
  // Message gets sent at round start
  sendTimeLimitMessage: true,
  // Each mode can have its own message
  messages: {
    author: `${p.admin}The current map's ${p.highlight}AT ${p.admin}is ${p.highlight}#{authorTime}${p.admin}, time limit set to ${p.highlight}#{limit}${p.admin}.`,
  },
  enableCommand: {
    privilege: 3,
    aliases: ['edtl', 'enabledynamictimelimit'],
    help: `Enable dynamic time limit for the next map.`,
    public: true,
    success: `${p.admin}#{title} ${p.highlight}#{name} ${p.admin}has ${p.highlight}enabled ${p.admin}the dynamic time limit for the next map.`,
    alreadyActive: `${p.error}Dynamic time limit is already enabled for the next map.`
  },
  disableCommand: {
    privilege: 3,
    aliases: ['ddtl', 'disabledynamictimelimit'],
    help: `Disable dynamic time limit for the next map.`,
    public: true,
    success: `${p.admin}#{title} ${p.highlight}#{name} ${p.admin}has ${p.highlight}disabled ${p.admin}the dynamic time limit for the next map.`,
    alreadyDisabled: `${p.error}Dynamic time limit is already disabled for the next map.`
  },
}