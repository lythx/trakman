const p = tm.utils.palette
import icons from '../ui/config/Icons.js'

export default {
  noPermission: `${p.error}You have no permission to perform this action.`,
  addVote: {
    voteTexts: {
      '3': 'fantastic',
      '2': 'beautiful',
      '1': 'good',
      '-1': 'bad',
      '-2': 'poor',
      '-3': 'waste'
    },
    public: true,
    message: `${p.highlight}#{nickname}${p.vote} thinks this map is ${p.highlight}#{voteText}${p.vote}.`
  },
  kick: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has kicked ${p.highlight}#{name}${p.admin}.`,
    error: `${p.error}Player is not on the server.`,
    reason: `${p.admin}Reason${p.highlight}: #{reason}${p.admin}.`,
    public: true,
    noReason: 'No reason specified',
    privilege: tm.config.controller.privileges.kick
  },
  mute: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has muted ${p.highlight}#{name}${p.admin}#{duration}.`,
    reason: `${p.admin}Reason${p.highlight}: #{reason}${p.admin}.`,
    public: true,
    privilege: tm.config.controller.privileges.mute,
  },
  unmute: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has unmuted ${p.highlight}#{name}${p.admin}.`,
    error: `${p.error}Could not unmute ${p.highlight}#{login}.`,
    notMuted: `${p.error}#{login} is not muted.`,
    public: true,
    privilege: tm.config.controller.privileges.mute,
  },
  forcespec: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has forced ${p.highlight}#{name} ${p.admin}into spectator mode.`,
    error: `${p.error}Player is not on the server.`,
    tooManySpecs: `${p.error}Could not forcespec ${p.highlight}#{name}${p.error} because there are too many spectators.`,
    public: true,
    privilege: tm.config.controller.privileges.forceSpectator,
  },
  forceplay: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has forced ${p.highlight}#{name} ${p.admin}into player mode.`,
    error: `${p.error}Player is not on the server.`,
    tooManyPlayers: `${p.error}Could not forceplay ${p.highlight}#{name}${p.error} because there are too many players.`,
    public: true,
    privilege: tm.config.controller.privileges.forceSpectator,
  },
  kickghost: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has kicked ${p.highlight}#{name}${p.admin}.`,
    public: true,
    privilege: tm.config.controller.privileges.kick,
  },
  ban: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has banned ${p.highlight}#{name}${p.admin}#{duration}.`,
    error: `${p.error}Could not ban ${p.highlight}#{login}${p.error}.`,
    reason: `${p.admin}Reason${p.highlight}: #{reason}${p.admin}.`,
    public: true,
    privilege: tm.config.controller.privileges.ban,
  },
  unban: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has unbanned ${p.highlight}#{name}${p.admin}.`,
    error: `${p.error}Could not unban ${p.highlight}#{login}${p.error}.`,
    notBanned: `${p.error}#{login} is not banned.`,
    public: true,
    privilege: tm.config.controller.privileges.ban,
  },
  blacklist: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has blacklisted ${p.highlight}#{name}${p.admin}#{duration}.`,
    error: `${p.error}Could not blacklist ${p.highlight}#{login}${p.error}.`,
    reason: `${p.admin}Reason${p.highlight}: #{reason}${p.admin}.`,
    public: true,
    privilege: tm.config.controller.privileges.blacklist,
  },
  unblacklist: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has removed ${p.highlight}#{name} ${p.admin}from the blacklist.`,
    error: `${p.error}Could not remove ${p.highlight}#{login} ${p.error}from the blacklist.`,
    notBlacklisted: `${p.highlight}#{login} ${p.error}is not blacklisted.`,
    public: true,
    privilege: tm.config.controller.privileges.blacklist,
  },
  addguest: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has added ${p.highlight}#{name} ${p.admin}to the guestlist.`,
    error: `${p.error}Could not add ${p.highlight}#{login} ${p.error}to the guestlist.`,
    alreadyGuest: `${p.highlight}#{login} ${p.error}is already in the guestlist.`,
    public: true,
    privilege: tm.config.controller.privileges.addGuest,
  },
  rmguest: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has removed ${p.highlight}#{name} ${p.admin}from the guestlist.`,
    error: `${p.error}Could not remove ${p.highlight}#{login} ${p.error}from the guestlist.`,
    notGuest: `${p.highlight}#{login} ${p.error}is not in the guestlist.`,
    public: true,
    privilege: tm.config.controller.privileges.addGuest,
  },
  publicAdd: {
    voteGoal: 0.51,
    voteText: `${p.highlight}Vote to $${p.green}ADD #{mapName}${p.highlight} from TMX.`,
    voteStart: `${p.highlight}#{nickname} ${p.vote}started a vote to ${p.highlight}add #{mapName}${p.vote} from TMX.`,
    voteTime: 30,
    voteIcon: icons.tagGreen,
    alreadyRunning: `${p.error}A vote is already running.`,
    didntPass: `${p.vote}Vote to add ${p.highlight}#{mapName} ${p.vote}from TMX ${p.highlight}did not pass${p.vote}.`,
    success: `${p.vote}Vote to add ${p.highlight}#{mapName} ${p.vote}from TMX ${p.highlight}has passed${p.vote}.`,
    forcePass: `${p.vote}#{title} ${p.highlight}#{nickname}${p.vote} has passed the vote to add ${p.highlight}#{mapName} ${p.vote}from TMX.`,
    cancelled: `${p.vote} Vote to add ${p.highlight}#{mapName} ${p.vote}from TMX the was cancelled.`,
    cancelledBy: `${p.vote}#{title} ${p.highlight}#{nickname}${p.vote} has cancelled the vote to add ${p.highlight}#{mapName} ${p.vote}from TMX.`
  },
  setPlayerPrivilege: {
    unknownPlayer: `${p.error}Unknown player.`,
    noPrivilege: `${p.error}You cannot control privileges of a person who has equal or higher privilege than you.`,
    promote: `${p.admin}#{title} ${p.highlight}#{adminNickname}${p.admin} has promoted ` +
      `${p.highlight}#{nickname}${p.admin} to #{rank}.`,
    demote: `${p.admin}#{title} ${p.highlight}#{adminNickname}${p.admin} has demoted ` +
      `${p.highlight}#{nickname}${p.admin} to #{rank}.`,
    rightsRemoved: `${p.admin}#{title} ${p.highlight}#{adminNickname}${p.admin} has removed privileges of ${p.highlight}#{nickname}${p.admin}.`,
    alreadyIs: `${p.highlight}#{nickname}${p.error} is already #{rank}.`,
  },
  addMap: {
    fetchError: `${p.error}Failed to fetch the map file from TMX.`,
    addError: `${p.error}Failed to add the map.`,
    alreadyAdded: `${p.admin}Map ${p.highlight}#{map}${p.admin} added by ${p.highlight}#{nickname}${p.admin} is already on the server, ` +
      `it will be ${p.highlight}queued ${p.admin}instead.`,
    added: `${p.admin}#{title} ${p.highlight}#{nickname}${p.admin} has added and queued ${p.highlight}#{map}${p.admin} from TMX.`,
    public: true,
  },
  removeMap: {
    text: `${p.admin}#{title} ${p.highlight}#{nickname}${p.admin} has removed map ${p.highlight}#{map} ${p.admin}from the server.`,
    removeThis:`${p.admin}#{title} ${p.highlight}#{nickname}${p    .admin} has removed the ongoing map ${p.highlight}#{map} ${p.admin}from the server.`,
    alreadyRemoved: `${p.error}This map is already getting removed.`,
    error: `${p.error}Error while removing the map.`,
    onlyMap: `${p.error}There are no more maps in the server playlist.`,
    public: true,
  }
}
