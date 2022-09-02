import { palette as p } from '../../src/Trakman.js'

export default {
    // operatorcommands.ts bar //add
    skip: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has skipped the ongoing map.`,
        public: true,
        privilege: 1
    },
    res: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has restarted the ongoing map.`,
        public: true,
        privilege: 1
    },
    prev: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has requeued the previous map.`,
        error: `${p.error}Could not queue the previous map since the map history is empty.`,
        public: true,
        privilege: 1
    },
    replay: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has requeued the ongoing map.`,
        public: true,
        privilege: 1
    },
    kick: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has kicked ${p.highlight}#{name}${p.admin}.`,
        error: `${p.error}Player is not on the server.`,
        reason: `${p.admin}Reason${p.highlight}: #{reason}${p.admin}.`,
        public: true,
        privilege: 1
    },
    mute: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has muted ${p.highlight}#{name}${p.admin}#{duration}.`,
        error: `${p.error}Could not mute #{login}.`,
        reason: `${p.admin}Reason${p.highlight}: #{reason}${p.admin}.`,
        public: true,
        privilege: 1
    },
    unmute: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has unmuted ${p.highlight}#{name}${p.admin}.`,
        error: `${p.error}Could not unmute #{login}.`,
        notMuted: `${p.error}#{login} is not muted.`,
        public: true,
        privilege: 1
    },
    forcespec: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has forced ${p.highlight}#{name} ${p.admin}into spectator mode.`,
        error: `${p.error}Player is not on the server.`,
        public: true,
        privilege: 1
    },
    forceplay: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has forced ${p.highlight}#{name} ${p.admin}into player mode.`,
        error: `${p.error}Player is not on the server.`,
        public: true,
        privilege: 1
    },
    kickghost: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has kicked ${p.highlight}#{name}${p.admin}.`,
        public: true,
        privilege: 1
    },
    dropjukebox: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has removed ${p.highlight}#{name} ${p.admin}from the queue.`,
        error: `${p.error}No such index in the queue.`,
        public: true,
        privilege: 1
    },
    clearjukebox: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has removed ${p.highlight}#{name} ${p.admin}all mapos from the queue.`,
        error: `${p.error}No maps in the queue.`,
        public: true,
        privilege: 1
    },
    endround: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has forced the ongoing round to end.`,
        error: `${p.error}Server is not in rounds/teams/laps/cup mode.`,
        public: true,
        privilege: 1
    },
    // admincommands.ts
    setgamemode: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the gamemode to ${p.highlight}#{mode}${p.admin}.`,
        error: `${p.error}Invalid gamemode.`,
        public: true,
        privilege: 2
    },
    ban: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has banned ${p.highlight}#{name}${p.admin}#{duration}.`,
        error: `${p.error}Could not ban #{login}.`,
        reason: `${p.admin}Reason${p.highlight}: #{reason}${p.admin}.`,
        public: true,
        privilege: 2
    },
    unban: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has unbanned ${p.highlight}#{name}${p.admin}.`,
        error: `${p.error}Could not unban #{login}.`,
        notBanned: `${p.error}#{login} is not banned.`,
        public: true,
        privilege: 2
    },
    blacklist: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has muted ${p.highlight}#{name}${p.admin}#{duration}.`,
        error: `${p.error}Could not blacklist #{login}.`,
        reason: `${p.admin}Reason${p.highlight}: #{reason}${p.admin}.`,
        public: true,
        privilege: 2
    },
    unblacklist: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has removed ${p.highlight}#{name} ${p.admin}from the blacklist.`,
        error: `${p.error}Could not remove #{login} from the blacklist.`,
        notBlacklisted: `${p.error}#{login} is not blacklisted.`,
        public: true,
        privilege: 2
    },
    addguest: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has added ${p.highlight}#{name} ${p.admin}to the guestlist.`,
        error: `${p.error}Could not add #{login} to the guestlist.`,
        alreadyGuest: `${p.error}#{login} is already in the guestlist.`,
        public: true,
        privilege: 2
    },
    rmguest: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has removed ${p.highlight}#{name} ${p.admin}from the guestlist.`,
        error: `${p.error}Could not remove #{login} from the guestlist.`,
        notGuest: `${p.error}#{login} is not in the guestlist.`,
        public: true,
        privilege: 2
    },
    setrefpwd: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the referee password to ${p.highlight}#{password}${p.admin}.`,
        error: `${p.error}Invalid password.`,
        public: false,
        privilege: 2
    },
    setrefmode: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the referee mode to ${p.highlight}#{mode}${p.admin}.`,
        public: true,
        privilege: 2
    },
    forceteam: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has forced ${p.highlight}#{name} ${p.admin}into the #{team} ${p.admin}team.`,
        error: `${p.error}Invalid team.`,
        notRounds: `${p.error}Server is not in teams mode.`,
        playerOffline: `${p.error}Player is not on the server`,
        public: true,
        privilege: 2
    },
    setwarmup: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}#{state} ${p.admin}warmup mode.`,
        error: `${p.error}Server is not in rounds/teams/laps/cup mode.`,
        public: true,
        privilege: 2
    },
    setlapsamount: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the laps amount to ${p.highlight}#{amount}${p.admin}.`,
        error: `${p.error}Server is not in laps mode.`,
        insufficientLaps: `${p.error}Laps amount cannot be less or equal to zero`,
        public: true,
        privilege: 2
    },
    setroundslapsamount: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the laps amount to ${p.highlight}#{amount}${p.admin}.`,
        error: `${p.error}Server is not in rounds mode.`,
        insufficientLaps: `${p.error}Laps amount cannot be less or equal to zero`,
        public: true,
        privilege: 2
    },
    setroundspointlimit: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the points limit to ${p.highlight}#{amount}${p.admin}.`,
        error: `${p.error}Server is not in rounds mode.`,
        insufficientPoints: `${p.error}Points amount cannot be less or equal to zero`,
        public: true,
        privilege: 2
    },
    setteamspointlimit: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the points limit to ${p.highlight}#{amount}${p.admin}.`,
        error: `${p.error}Server is not in teams mode.`,
        insufficientPoints: `${p.error}Points amount cannot be less or equal to zero`,
        public: true,
        privilege: 2
    },
    setteamsmaxpoints: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the max points per team to ${p.highlight}#{amount}${p.admin}.`,
        error: `${p.error}Server is not in teams mode.`,
        insufficientPoints: `${p.error}Points amount cannot be less or equal to zero`,
        public: true,
        privilege: 2
    },
    setcuppointlimit: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the points limit to ${p.highlight}#{amount}${p.admin}.`,
        error: `${p.error}Server is not in cup mode.`,
        insufficientPoints: `${p.error}Points amount cannot be less or equal to zero`,
        public: true,
        privilege: 2
    },
    setcuproundspermap: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the amount of rounds per map to ${p.highlight}#{amount}${p.admin}.`,
        error: `${p.error}Server is not in cup mode.`,
        insufficientRounds: `${p.error}Rounds amount cannot be less or equal to zero`,
        public: true,
        privilege: 2
    },
    setcupwarmuptime: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the amount of rounds in warm-up to ${p.highlight}#{amount}${p.admin}.`,
        error: `${p.error}Server is not in cup mode.`,
        insufficientRounds: `${p.error}Rounds amount cannot be less than zero`,
        public: true,
        privilege: 2
    },
    setcupwinnersamount: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the amount of cup winners to ${p.highlight}#{amount}${p.admin}.`,
        error: `${p.error}Server is not in cup mode.`,
        insufficientWinners: `${p.error}Winners amount cannot be less or equal to zero`,
        public: true,
        privilege: 2
    },
    delrec: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has removed the record of ${p.highlight}#{nickname} ${p.admin}on the ongoing map.`,
        error: `${p.error}Player #{login} does not have a record on this map.`,
        public: true,
        privilege: 2
    },
    shuffle: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has shuffled the queue.`,
        public: true,
        privilege: 2
    },
    // masteradmincommands.ts
    setservername: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the server name to ${p.highlight}#{value}$z$s${p.admin}.`,
        public: true,
        privilege: 3
    },
    setcomment: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the server comment to ${p.highlight}#{value}$z$s${p.admin}.`,
        public: true,
        privilege: 3
    },
    setpassword: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the player password to ${p.highlight}#{value}$z$s${p.admin}.`,
        error: `${p.error}Invalid password.`,
        public: false,
        privilege: 3
    },
    setspecpassword: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the spectator password to ${p.highlight}#{value}$z$s${p.admin}.`,
        error: `${p.error}Invalid password.`,
        public: false,
        privilege: 3
    },
    setmaxplayers: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the max players amount to ${p.highlight}#{value}${p.admin}.`,
        public: true,
        privilege: 3
    },
    setmaxspecs: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the max spectators amount to ${p.highlight}#{value}${p.admin}.`,
        public: true,
        privilege: 3
    },
    setchattime: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the podium time to ${p.highlight}#{value} ${p.admin}seconds.`,
        public: true,
        privilege: 3
    },
    settimelimit: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the time limit to ${p.highlight}#{value} ${p.admin}seconds.`,
        public: true,
        privilege: 3
    },
    sendnotice: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has set the notice to ${p.highlight}#{value}${p.admin}.`,
        public: false,
        privilege: 3
    },
    allowmapdownload: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}#{value} ${p.admin}the map download.`,
        public: true,
        privilege: 3
    },
    disablerespawn: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}#{value} ${p.admin}the checkpoint respawning.`,
        public: true,
        privilege: 3
    },
    forceshowopp: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}#{value} ${p.admin}the forced opponent display.`,
        public: true,
        privilege: 3
    },
    coppers: {
        text: `${p.admin}Current server coppers amount is ${p.highlight}#{value}C${p.admin}.`,
        error: `${p.error}Could not retrieve the coppers amount.`,
        public: false,
        privilege: 3
    },
    sethideserver: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has updated server visibility to ${p.highlight}#{status}${p.admin}.`,
        error: `${p.error}Invalid input. Possible values are 0, 1 & 2.`,
        public: true,
        privilege: 3
    },
    autosavereplays: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}#{value} ${p.admin}the server replay autosaving.`,
        public: true,
        privilege: 3
    },
    autosavevalreplays: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}#{value} ${p.admin}the server validation replay autosaving.`,
        public: true,
        privilege: 3
    },
    prunerecs: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has removed all the records on the ongoing map.`,
        public: true,
        privilege: 3
    },
    killcontroller: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}murdered ${p.admin}the server controller.`,
        public: true,
        privilege: 3
    },
    shutdown: {
        text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}annihilated ${p.admin}the dedicated server.`,
        public: true,
        privilege: 3
    },
    // ownercommands.ts todo bcs commands are todo fix
}