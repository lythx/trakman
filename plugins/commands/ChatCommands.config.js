import { palette as p } from '../../src/Trakman.js'

const prefix = `$i` // Prefix all "fake" player messages with this (eg. $i, $t, etc)

export default {
    hi: {
        text: `$g[#{nickname}$z$s$g] ${prefix}Hello, #{name}!`,
        privilege: 0
    },
    bye: {
        text: `$g[#{nickname}$z$s$g] ${prefix}Goodbye, #{name}!`,
        privilege: 0
    },
    thx: {
        text: `$g[#{nickname}$z$s$g] ${prefix}Thanks, #{name}!`,
        privilege: 0
    },
    gg: {
        text: `$g[#{nickname}$z$s$g] ${prefix}Good game, #{name}!`,
        privilege: 0
    },
    bg: {
        text: `$g[#{nickname}$z$s$g] ${prefix}Bad game, #{name}!`,
        privilege: 0
    },
    n1: {
        text: `$g[#{nickname}$z$s$g] ${prefix}Nice one, #{name}!`,
        privilege: 0
    },
    gr: {
        text: `$g[#{nickname}$z$s$g] ${prefix}Good race, #{name}!`,
        privilege: 0
    },
    bgm: {
        text: `$g[#{nickname}$z$s$g] ${prefix}Bad game for me! :,(`,
        privilege: 0
    },
    brb: {
        text: `$g[#{nickname}$z$s$g] ${prefix}Be right back!`,
        privilege: 0
    },
    afk: {
        text: `$g[#{nickname}$z$s$g] ${prefix}Away from keyboard!`,
        privilege: 0
    },
    me: {
        text: `${prefix}#{nickname}$z$s${prefix + p.message} #{message}`,
        privilege: 0
    },
    lol: {
        text: `$g[#{nickname}$z$s$g] ${prefix}LoL!`,
        privilege: 0
    },
    lool: {
        text: `$g[#{nickname}$z$s$g] ${prefix}LoOoOoOoL!`,
        privilege: 0
    },
    loool: {
        text: `$g[#{nickname}$z$s$g] ${prefix}LoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoL!`,
        privilege: 0
    },
    time: {
        text: `${p.servermsg}Current server time is${p.highlight}: #{time}${p.servermsg}.`,
        privilege: 0
    },
    bootme: {
        text: `${p.highlight}#{nickname}${p.servermsg} has passed away for good. May their soul ${p.highlight}rest in peace${p.servermsg}.`,
        leaveText: `${p.highlight}Not everyone is resilient enough for life's myriad of challenges.`,
        privilege: 0
    },
    rq: {
        text: `${p.highlight}#{nickname}${p.error} has ragequit.`,
        leaveText: `${p.error}Don't let the anger devour your mind.`,
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
}