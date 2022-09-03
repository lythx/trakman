import { palette as p } from '../../../src/Trakman.js'

const prefix = `$i` // Prefix all "fake" player messages with this (eg. $i, $t, etc)

export default {
  hi: {
    text: `$g[#{nickname}$z$s$g] ${prefix}Hello, #{name}!`,
    public: true,
    privilege: 0
  },
  bye: {
    text: `$g[#{nickname}$z$s$g] ${prefix}Goodbye, #{name}!`,
    public: true,
    privilege: 0
  },
  thx: {
    text: `$g[#{nickname}$z$s$g] ${prefix}Thanks, #{name}!`,
    public: true,
    privilege: 0
  },
  gg: {
    text: `$g[#{nickname}$z$s$g] ${prefix}Good game, #{name}!`,
    public: true,
    privilege: 0
  },
  bg: {
    text: `$g[#{nickname}$z$s$g] ${prefix}Bad game, #{name}!`,
    public: true,
    privilege: 0
  },
  n1: {
    text: `$g[#{nickname}$z$s$g] ${prefix}Nice one, #{name}!`,
    public: true,
    privilege: 0
  },
  gr: {
    text: `$g[#{nickname}$z$s$g] ${prefix}Good race, #{name}!`,
    public: true,
    privilege: 0
  },
  bgm: {
    text: `$g[#{nickname}$z$s$g] ${prefix}Bad game for me! :,(`,
    public: true,
    privilege: 0
  },
  brb: {
    text: `$g[#{nickname}$z$s$g] ${prefix}Be right back!`,
    public: true,
    privilege: 0
  },
  afk: {
    text: `$g[#{nickname}$z$s$g] ${prefix}Away from keyboard!`,
    public: true,
    privilege: 0
  },
  me: {
    text: `${prefix}#{nickname}$z$s${prefix + p.message} #{message}`,
    public: true,
    privilege: 0
  },
  lol: {
    text: `$g[#{nickname}$z$s$g] ${prefix}LoL!`,
    public: true,
    privilege: 0
  },
  lool: {
    text: `$g[#{nickname}$z$s$g] ${prefix}LoOoOoOoL!`,
    public: true,
    privilege: 0
  },
  loool: {
    text: `$g[#{nickname}$z$s$g] ${prefix}LoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoL!`,
    public: true,
    privilege: 0
  },
  time: {
    text: `${p.servermsg}Current server time is${p.highlight}: #{time}${p.servermsg}.`,
    privilege: 0
  },
  bootme: {
    text: `${p.highlight}#{nickname}${p.servermsg} has passed away for good. May their soul ${p.highlight}rest in peace${p.servermsg}.`,
    leaveText: `${p.highlight}Not everyone is resilient enough for life's myriad of challenges.`,
    public: true,
    privilege: 0
  },
  rq: {
    text: `${p.highlight}#{nickname}${p.error} has ragequit.`,
    leaveText: `${p.error}Don't let the anger devour your mind.`,
    public: true,
    privilege: 0
  },
  pm: {
    text: `${p.error}- PM - $g[#{sender}$z$s$g => #{recipient}$z$s$g] #{message}`,
    error: `${p.error}Player is not on the server.`,
    privilege: 0
  },
  admin: {
    text: `${p.error} Use //[command] for admin commands.`,
    privilege: 0
  },
  coppers: {
    text: `${p.admin}Current server coppers amount is ${p.highlight}#{value}C${p.admin}.`,
    notUnited: `${p.error}Server account is not united.`,
    error: `${p.error}Could not retrieve the coppers amount.`,
    public: false,
    privilege: 3
  }
}