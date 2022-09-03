import { palette as p } from '../../../src/Trakman.js'

export default {
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
  killcontroller: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}murdered ${p.admin}the server controller.`,
    public: true,
    privilege: 3
  },
  shutdown: {
    text: `${p.admin}#{title} ${p.highlight}#{adminName} ${p.admin}has ${p.highlight}annihilated ${p.admin}the dedicated server.`,
    public: true,
    privilege: 3
  }
}