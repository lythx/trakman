import ids from '../../config/ComponentIds.js'
import icons from '../../config/Icons.js'
const p = tm.utils.palette

export default {
	title: " Server Operators ",
	icon: icons.playerList,
	width: 65,
	iconWidth: 2,
	iconHeight: 2,
	promoteIcon: icons.promotePlayer,
	promoteIconHover: icons.promotePlayerHover,
	demoteIcon: icons.demotePlayer,
	demoteIconHover: icons.demotePlayerHover,
	entries: 15,
	selfColour: `${p.green}`,
	disabledColour: '333C',
	defaultNickname: 'N/A',
	columnProportions: [
		0.35,
		1.5,
		1.5,
		0.5,
		0.5
	],
	navbar: [
		{ name: 'Playerlist', actionId: ids.playerList, privilege: Math.min(...Object.values(tm.config.controller.privileges)) },
		{ name: 'Adminlist', actionId: ids.adminlist },
		{ name: 'Masteradminlist', actionId: ids.masteradminlist },
	],
	grid: {
		background: "9996",
		margin: 0.15,
		headerBackground: "333C"
	},
	command: {
		aliases: ['opl', 'oplist', 'operators', 'listops'],
		help: `Display the list of current server operators.`,
		privilege: 0
	}
}