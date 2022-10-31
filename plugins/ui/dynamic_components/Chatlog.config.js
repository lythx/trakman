import icons from '../config/Icons.js'
import ids from '../config/ComponentIds.js'
const p = tm.utils.palette

export default {
    title: " Chat Log ",
    kickPrivilege: 1,
    forceSpecPrivilege: 1,
    privilege: 0, // Privilege required to open the window
    icon: icons.playerList,
    iconWidth: 2,
    iconHeight: 2,
    public: true,
    entries: 15,
    columnProportions: [
        3,
        3,
        3,
        7,
    ],
    navbar: [
        // TODO
    ],
    selfColour: `${p.green}`,
    grid: {
        background: "9996",
        margin: 0.15,
        headerBackground: "333C"
    },
}
