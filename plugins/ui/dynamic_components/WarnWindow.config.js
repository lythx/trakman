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
    defaultMessage: "This is an administrative warning. Your behavior is not in line with the server rules. Please adjust your actions accordingly or you may face consequences, such as being kicked or banned from the server.",
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