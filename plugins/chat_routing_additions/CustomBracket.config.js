const p = tm.utils.palette

export default {
  isEnabled: true,
  brackets: [
    { logins: ["login1"], left: `$${p.purple}[$g`, right: `$z$s$${p.purple}]$g ` },
    { logins: ["login1", "login2", "login3"], left: `$${p.red}[$g`, right: `$z$s$${p.red}]$g ` }
  ],
  // If there is another function modifying chat nickname with higher importance it will overwrite this one
  importance: 1
}
