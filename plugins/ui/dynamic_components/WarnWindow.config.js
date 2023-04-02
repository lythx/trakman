import icons from '../config/Icons.js'

const p = tm.utils.palette

export default {
  width: 60,
  height: 40,
  padding: 2.5,
  textSize: 2.7,
  textBackground: '666C',
  warn: {
    title: ' Warning ',
    icon: icons.warn,
    chatMessage: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has warned ${p.highlight}#{name}${p.admin}.`,
    message: `$sWarning issued by: #{name}$z$s\n#{message}`,
    // TODO
    defaultMessage: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore',
    aliases: ['warn'],
    help: 'Display a warning message to player.',
    privilege: 1,
    public: true
  },
  wall: {
    title: ' Admin Message ',
    icon: icons.exclamation,
    message: `$sMessage from: #{name}$z$s\n#{message}`,
    aliases: ['wall', 'adminmsg', 'mta'],
    help: 'Display a message to all players.',
    privilege: 2
  },
}