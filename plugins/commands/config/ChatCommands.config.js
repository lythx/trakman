const p = tm.utils.palette
const prefix = `$i` // Prefix all "fake" player messages with this (eg. $i, $t, etc)

export default {
  defaultValue: `everyone`, // This value will be used for the name if you don't specify anything in e.g. /hi
  hi: {
    text: `$g[#{nickname}$z$s$g] ${prefix}Hello, #{name}!`,
    public: true,
    privilege: 0,
    aliases: ['hi', 'hey', 'hello'],
    help: `Greet a certain someone.`
  },
  bye: {
    text: `$g[#{nickname}$z$s$g] ${prefix}Goodbye, #{name}!`,
    public: true,
    privilege: 0,
    aliases: ['bb', 'bye'],
    help: `Bid your farewell.`
  },
  thx: {
    text: `$g[#{nickname}$z$s$g] ${prefix}Thanks, #{name}!`,
    public: true,
    privilege: 0,
    aliases: ['ty', 'tx', 'thx', 'thanks'],
    help: `Express your gratitude.`
  },
  gg: {
    text: `$g[#{nickname}$z$s$g] ${prefix}Good game, #{name}!`,
    public: true,
    privilege: 0,
    aliases: ['gg', 'goodgame'],
    help: `Inform others that you\'ve enjoyed the race.`
  },
  bg: {
    text: `$g[#{nickname}$z$s$g] ${prefix}Bad game, #{name}!`,
    public: true,
    privilege: 0,
    aliases: ['bg', 'badgame'],
    help: `Allow others to find out about your disenjoyment of the round.`
  },
  n1: {
    text: `$g[#{nickname}$z$s$g] ${prefix}Nice one, #{name}!`,
    public: true,
    privilege: 0,
    aliases: ['n1', 'nice1', 'niceone'],
    help: `Rain your blessings upon the few selected by thy divine ritual.`
  },
  gr: {
    text: `$g[#{nickname}$z$s$g] ${prefix}Good race, #{name}!`,
    public: true,
    privilege: 0,
    aliases: ['gr', 'goodrace'],
    help: `Mention that you\'ve had a great time racing just now.`
  },
  bgm: {
    text: `$g[#{nickname}$z$s$g] ${prefix}Bad game for me! :,(`,
    public: true,
    privilege: 0,
    aliases: ['bgm'],
    help: `Let others know you didn\'t do your best.`
  },
  brb: {
    text: `$g[#{nickname}$z$s$g] ${prefix}Be right back!`,
    public: true,
    privilege: 0,
    aliases: ['brb'],
    help: `Notify people of your potential absence.`
  },
  afk: {
    text: `$g[#{nickname}$z$s$g] ${prefix}Away from keyboard!`,
    tooManySpecs: `${p.error}Could not switch to spectator mode because there are too many spectators.`,
    public: true,
    privilege: 0,
    aliases: ['afk', 'imstupid'],
    help: `Update the server players on your position relative to the keyboard.`
  },
  me: {
    text: `${prefix}#{nickname}$z$s${prefix + p.message} #{message}`,
    public: true,
    privilege: 0,
    aliases: ['me', 'mfw'],
    help: `Express the deep emotions hidden within your sinful soul.`
  },
  lol: {
    text: `$g[#{nickname}$z$s$g] ${prefix}LoL!`,
    public: true,
    privilege: 0,
    aliases: ['lol'],
    help: `Indicate your amusement.`
  },
  lool: {
    text: `$g[#{nickname}$z$s$g] ${prefix}LoOoOoOoL!`,
    public: true,
    privilege: 0,
    aliases: ['lool'],
    help: `Indicate your excess amusement.`
  },
  loool: {
    text: `$g[#{nickname}$z$s$g] ${prefix}LoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoL!`,
    public: true,
    privilege: 0,
    aliases: ['loool'],
    help: `I understand, saying the same thing for the 53726th time must be hilarious enough.`
  },
  time: {
    text: `${p.servermsg}Current server time is${p.highlight}: #{time}${p.servermsg}.`,
    privilege: 0,
    aliases: ['time'],
    help: `Find out what the current server time is.`
  },
  bootme: {
    text: `${p.highlight}#{nickname}${p.servermsg} has passed away for good. May their soul ${p.highlight}rest in peace${p.servermsg}.`,
    leaveText: `${p.highlight}Not everyone is resilient enough for life's myriad of challenges.`,
    public: true,
    privilege: 0,
    aliases: ['bm', 'bootme', 'dienow'],
    help: `Part your ways with life.`
  },
  rq: {
    text: `${p.highlight}#{nickname}${p.error} has ragequit.`,
    leaveText: `${p.error}Don't let the anger devour your mind.`,
    public: true,
    privilege: 0,
    aliases: ['rq', 'ragequit'],
    help: `Signal your dissatisfaction with whatever is happening right now.`
  },
  pm: {
    text: `${p.error}- PM - $g[#{sender}$z$s$g => #{recipient}$z$s$g] #{message}`,
    error: `${p.error}Player is not on the server.`,
    privilege: 0,
    aliases: ['pm', 'dm'],
    help: `Message a player.`
  },
  playtime: {
    text: `${p.servermsg}Current map was played for${p.highlight}: #{time}${p.servermsg}.`,
    privilege: 0,
    aliases: ['pt', 'playtime'],
    help: `Find out about the current map playtime.`
  },
  laston: {
    text: `${p.servermsg}Player ${p.highlight}#{name} ${p.servermsg}was last` +
      ` active on${p.highlight} #{time}${p.servermsg}.`,
    error: `${p.error}Unknown player ${p.highlight}#{name}${p.error}.`,
    privilege: 0,
    aliases: ['lo', 'laston'],
    help: `Enlighten yourself with the last visit date of the specifed specimen.`
  },
  sessiontime: {
    text: `${p.servermsg}Current session time of ${p.highlight}#{name}${p.servermsg}` +
      ` is${p.highlight} #{time}${p.servermsg}.`,
    selfText: `${p.servermsg}Your current session time is ${p.highlight}#{time}${p.servermsg}.`,
    error: `${p.error}Player ${p.highlight}#{name}${p.error} is not online.`,
    privilege: 0,
    aliases: ['st', 'session', 'sessiontime'],
    help: `Find out about the current session time of specified player.`
  },
  man: {
    text: `${p.highlight}#{name}: ${p.dedirecord}#{params}${p.admin}#{help}`,
    error: `${p.error}Command ${p.highlight}#{name} ${p.error}doesn't exist or has no help message associated with it.`,
    public: false,
    privilege: 0,
    aliases: ['man'],
    help: `Display help and params for a given command.`
  },
  admin: {
    text: `${p.error}Use //[command] for admin commands.`,
    privilege: 0,
    aliases: ['admin', 'a'],
    // help: `` // not needed here
  },
  coppers: {
    text: `${p.admin}Current server coppers amount is ${p.highlight}#{value}C${p.admin}.`,
    notUnited: `${p.error}Server account is not united.`,
    error: `${p.error}Could not retrieve the coppers amount.`,
    public: false,
    privilege: 3,
    aliases: ['ccs', 'coppers', 'checkcoppers'],
    help: `Check the amount of coppers the server account currently has.`
  }
}