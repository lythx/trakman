import { trakman as tm } from '../../src/Trakman.js'
import config from './ChatCommands.config.js'

const commands: TMCommand[] = [
    {
        aliases: ['hi', 'hey', 'hello'],
        help: 'Greet a certain someone.',
        params: [{ name: 'name', type: 'multiword', optional: true }],
        callback: (info: MessageInfo, name?: string): void => {
            tm.sendMessage(tm.utils.strVar(config.hi.text, { nickname: info.nickname, name: name ?? 'everyone' }), undefined, false)
        },
        privilege: config.hi.privilege
    },
    {
        aliases: ['bb', 'bye'],
        params: [{ name: 'name', type: 'multiword', optional: true }],
        callback: (info: MessageInfo, name?: string): void => {
            tm.sendMessage(tm.utils.strVar(config.bye.text, { nickname: info.nickname, name: name ?? 'everyone' }), undefined, false)
        },
        privilege: config.bye.privilege
    },
    {
        aliases: ['ty', 'tx', 'thx', 'thanks'],
        help: 'Express your gratitude.',
        params: [{ name: 'name', type: 'multiword', optional: true }],
        callback: (info: MessageInfo, name?: string): void => {
            tm.sendMessage(tm.utils.strVar(config.thx.text, { nickname: info.nickname, name: name ?? 'everyone' }), undefined, false)
        },
        privilege: config.thx.privilege
    },
    {
        aliases: ['gg', 'goodgame'],
        help: 'Inform others that you\'ve enjoyed the race.',
        params: [{ name: 'name', type: 'multiword', optional: true }],
        callback: (info: MessageInfo, name?: string): void => {
            tm.sendMessage(tm.utils.strVar(config.gg.text, { nickname: info.nickname, name: name ?? 'everyone' }), undefined, false)
        },
        privilege: config.gg.privilege
    },
    {
        aliases: ['bg', 'badgame'],
        help: 'Allow others to find out about your disenjoyment of the round.',
        params: [{ name: 'name', type: 'multiword', optional: true }],
        callback: (info: MessageInfo, name?: string): void => {
            tm.sendMessage(tm.utils.strVar(config.bg.text, { nickname: info.nickname, name: name ?? 'everyone' }), undefined, false)
        },
        privilege: config.bg.privilege
    },
    {
        aliases: ['n1', 'nice1', 'niceone'],
        help: 'Rain your blessings upon the few selected by thy divine ritual.',
        params: [{ name: 'name', type: 'multiword' }],
        callback: (info: MessageInfo, name: string): void => {
            tm.sendMessage(tm.utils.strVar(config.n1.text, { nickname: info.nickname, name: name }), undefined, false)
        },
        privilege: config.n1.privilege
    },
    {
        aliases: ['gr', 'goodrace'],
        help: 'Mention that you\'ve had a great time racing just now.',
        params: [{ name: 'name', type: 'multiword', optional: true }],
        callback: (info: MessageInfo, name?: string): void => {
            tm.sendMessage(tm.utils.strVar(config.gr.text, { nickname: info.nickname, name: name ?? 'everyone' }), undefined, false)
        },
        privilege: config.gr.privilege
    },
    {
        aliases: ['bgm'],
        help: 'Let others know you didn\'t do your best.',
        callback: (info: MessageInfo): void => {
            tm.sendMessage(tm.utils.strVar(config.bgm.text, { nickname: info.nickname }), undefined, false)
        },
        privilege: config.bgm.privilege
    },
    {
        aliases: ['brb'],
        help: 'Notify people of your potential absence.',
        callback: (info: MessageInfo): void => {
            tm.sendMessage(tm.utils.strVar(config.brb.text, { nickname: info.nickname }), undefined, false)
        },
        privilege: config.brb.privilege
    },
    {
        aliases: ['afk', 'imstupid'],
        help: 'Update the server players on your position relative to the keyboard.',
        callback: async (info: MessageInfo): Promise<void> => {
            await tm.multiCall(
                {
                    method: 'ForceSpectator',
                    params: [{ string: info.login }, { int: 1 }]
                },
                {
                    method: 'ForceSpectator',
                    params: [{ string: info.login }, { int: 0 }]
                },
                {
                    method: 'ChatSendServerMessage',
                    params: [{
                        string: tm.utils.strVar(config.afk.text, { nickname: info.nickname })
                    }]
                })
            await new Promise((r) => setTimeout(r, 5)) // Need a timeout for server to register that player is a spectator
            tm.client.callNoRes('SpectatorReleasePlayerSlot', [{ string: info.login }])
        },
        privilege: config.afk.privilege
    },
    {
        aliases: ['me', 'mfw'],
        help: 'Express the deep emotions hidden within your sinful soul.',
        params: [{ name: 'thoughts', type: 'multiword', optional: true }],
        callback: (info: MessageInfo, thoughts?: string): void => {
            tm.sendMessage(tm.utils.strVar(config.me.text, { nickname: info.nickname, message: thoughts ?? '' }), undefined, false)
        },
        privilege: config.me.privilege
    },
    {
        aliases: ['lol'],
        help: 'Indicate your amusement.',
        callback: (info: MessageInfo): void => {
            tm.sendMessage(tm.utils.strVar(config.lol.text, { nickname: info.nickname }), undefined, false)
        },
        privilege: config.lol.privilege
    },
    {
        aliases: ['lool'],
        help: 'Indicate your excess amusement.',
        callback: (info: MessageInfo): void => {
            tm.sendMessage(tm.utils.strVar(config.lool.text, { nickname: info.nickname }), undefined, false)
        },
        privilege: config.lool.privilege
    },
    {
        aliases: ['loool'],
        help: 'I understand, saying "sussy petya" for the 53726th time must be hilarious enough.',
        callback: (info: MessageInfo): void => {
            tm.sendMessage(tm.utils.strVar(config.loool.text, { nickname: info.nickname }), undefined, false)
        },
        privilege: config.loool.privilege
    },
    {
        aliases: ['time'],
        help: 'Find out about the current server time.',
        callback: (info: MessageInfo): void => {
            tm.sendMessage(tm.utils.strVar(config.time.text, { time: new Date().toString() }), info.login)
        },
        privilege: config.time.privilege
    },
    {
        aliases: ['bm', 'bootme', 'dienow'],
        help: 'Part your ways with life.',
        callback: (info: MessageInfo): void => {
            tm.sendMessage(tm.utils.strVar(config.bootme.text, { nickname: tm.utils.strip(info.nickname, false) }), undefined)
            tm.client.callNoRes('Kick', [{ string: info.login }, { string: config.bootme.leaveText }])
        },
        privilege: config.bootme.privilege
    },
    {
        aliases: ['rq', 'ragequit'],
        help: 'Signal your dissatisfaction with whatever is happening right now.',
        callback: (info: MessageInfo): void => {
            tm.sendMessage(tm.utils.strVar(config.bootme.text, { nickname: tm.utils.strip(info.nickname, false) }), undefined)
            tm.client.callNoRes('Kick', [{ string: info.login }, { string: config.rq.leaveText }])
        },
        privilege: config.rq.privilege
    },
    {
        aliases: ['pm', 'dm'],
        params: [{ name: 'login' }, { name: 'text', type: 'multiword', optional: true }],
        help: 'Message a player.',
        callback: (info: MessageInfo, login: string, text: string = ''): void => {
            const playerInfo: TMPlayer | undefined = tm.players.get(login)
            if (playerInfo === undefined) {
                tm.sendMessage(config.pm.error, info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.pm.text, { sender: tm.utils.strip(info.nickname, false), recipient: tm.utils.strip(playerInfo.nickname, false), message: text }), [info.login, playerInfo.login].join())
        },
        privilege: config.pm.privilege
    },
    {
        aliases: ['admin', 'a'],
        callback: (info: MessageInfo): void => {
            if (info.privilege > 0) {
                tm.sendMessage(config.admin.text, info.login)
            }
        },
        privilege: config.admin.privilege
    },
    // TODO MOVE THIS FROM HERE
    {
        aliases: ['h', 'help', 'helpall'],
        help: 'Display the commands list.',
        callback: (info: MessageInfo): void => {
            tm.openManialink(tm.UIIDS.commandList, info.login)
        },
        privilege: 0
    },
    {
        aliases: ['tmxinfo'],
        help: 'Display TMX info.',
        callback: (info: MessageInfo): void => {
            tm.openManialink(tm.UIIDS.TMXWindow, info.login)
        },
        privilege: 0
    },
    {
        aliases: ['cp', 'cptms', 'recs'],
        help: 'Display current map local checkpoints.',
        callback: (info: MessageInfo): void => {
            tm.openManialink(tm.UIIDS.localCps, info.login)
        },
        privilege: 0
    },
    {
        aliases: ['dcp', 'dedicptms', 'dedirecs'],
        help: 'Display current map dedimania checkpoints.',
        callback: (info: MessageInfo): void => {
            tm.openManialink(tm.UIIDS.dediCps, info.login)
        },
        privilege: 0
    },
    {
        aliases: ['lcp', 'livecptms', 'liverecs'],
        help: 'Display current map live checkpoints.',
        callback: (info: MessageInfo): void => {
            tm.openManialink(tm.UIIDS.liveCps, info.login)
        },
        privilege: 0
    },
    {
        aliases: ['sc', 'sectms'],
        help: 'Display current map local sectors.',
        callback: (info: MessageInfo): void => {
            tm.openManialink(tm.UIIDS.localSectors, info.login)
        },
        privilege: 0
    },
    {
        aliases: ['dsc', 'dedisectms'],
        help: 'Display current map dedimania sectors.',
        callback: (info: MessageInfo): void => {
            tm.openManialink(tm.UIIDS.dediSectors, info.login)
        },
        privilege: 0
    },
    {
        aliases: ['lsc', 'livesectms'],
        help: 'Display current map live sectors.',
        callback: (info: MessageInfo): void => {
            tm.openManialink(tm.UIIDS.liveSectors, info.login)
        },
        privilege: 0
    },
    {
        aliases: ['ccp', 'currentcps'],
        help: 'Display each online players current cp.',
        callback: (info: MessageInfo): void => {
            tm.openManialink(tm.UIIDS.currentCps, info.login)
        },
        privilege: 0
    },
    {
        aliases: ['info'],
        help: 'Display info about the controller.',
        callback: (info: MessageInfo): void => {
            tm.openManialink(tm.UIIDS.welcomeWindow, info.login)
        },
        privilege: 0
    },
    // TODO REMOVE THIS
    {
        aliases: ['test'],
        params: [{ name: 'nickname', type: 'multiword' }],
        callback: (info: MessageInfo, nickname: string): void => {
            tm.sendMessage(tm.utils.nicknameToLogin(nickname) ?? 'didnt work lol')
        },
        privilege: 0
    },
    /*{
        aliases: ['bug'],
        help: 'bug',
        params: [{ name: 'text', type: 'multiword' }],
        callback: (info: MessageInfo, text: string): void => {
            const embed = new EmbedBuilder()
                .setTitle('Bug report')
                .setDescription(`Sent by ${tm.utils.strip(tm.utils.strip(info.nickname))}`)
                .setColor(0x0099ff)
                .setTimestamp(Date.now())
                .setThumbnail(('https://media.sketchfab.com/models/c842e2bec3c2463b977de99762014d4a/thumbnails/513ca7ac0d1349a3820d6a927a23cb5c/60be795961244327984a71b1ec8b8dcd.jpeg'))
                .addFields([
                    {
                        name: 'Bug info',
                        value: `${text}`
                    }
                ])

            webhooker.send({
                embeds: [embed]
            })

            tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.admin}Bug successfully submitted.`, info.login)
        },
        privilege: 0
    },*/
]

for (const c of commands) { tm.commands.add(c) }