const p = tm.utils.palette

export default {
  // Special message on every win multiple of this
  specialWin: 50,
  startup: `${p.highlight}$L[${tm.config.controller.repo}]Trakman`
    + ` v#{version}$L${p.servermsg} startup sequence successful.`,
  changelog: `${p.error}You can see the recent changes with` +
    ` the ${p.highlight}/changes ${p.error}command.`,
  noPb: `${p.error}You don't have a personal best on this map.`,
  pb: `${p.record}Personal best${p.highlight}: #{time}${p.record}, the `
    + `${p.rank}#{rank} ${p.record}record.`,
  noRank: `${p.error}You don't have a rank on the server yet.`,
  rank: `${p.record}You are currently ranked ${p.rank}#{rank} ${p.record}out `
    + `of ${p.highlight}#{total}${p.record} people total.`,
  welcome: `${p.error}Welcome to ${p.highlight}#{name}${p.error}. `
    + `This server is running ${p.highlight}$L[${tm.config.controller.repo}]Trakman v#{version}$L${p.error}.`,
  join: `${p.servermsg}#{title}${p.highlight}: `
    + `#{nickname}${p.servermsg} Country${p.highlight}: `
    + `#{country} ${p.servermsg}Visits${p.highlight}: #{visits}${p.servermsg}.`,
  win: `${p.record}You have won your `
    + `${p.rank}#{wins}${p.record} race.`,
  winPublic: `${p.record}Congratulations to ${p.highlight}#{nickname} `
    + `${p.record}for winning their ${p.rank}#{wins} ${p.record}race.`,
  leave: `${p.highlight}#{nickname}${p.servermsg} `
    + `has quit after ${p.highlight}#{time}${p.servermsg}.`,
  record: `${p.highlight}#{nickname}${p.record} has `
    + `#{status} the ${p.rank}#{position}${p.record} `
    + `local record. Time${p.highlight}: #{time}#{difference}`,
  lapRecord: `${p.highlight}#{nickname}${p.message} has `
    + `#{status} the ${p.rank}#{position}${p.message} `
    + `lap record. Time${p.highlight}: #{time}#{difference}`,
  recordDifference: ` $n${p.record}(${p.rank}#{position} ${p.highlight}-#{time}${p.record})`,
  dediDifference: ` $n${p.dedirecord}(${p.rank}#{position} ${p.highlight}-#{time}${p.dedirecord})`,
  dediRecord: `${p.highlight}#{nickname}${p.dedirecord} has `
    + `#{status} the ${p.rank}#{position}${p.dedirecord} `
    + `dedimania record. Time${p.highlight}: #{time}#{difference}`,
  nextJuke: `${p.vote}The next map will be ${p.highlight}#{map}${p.vote}, as requested `
    + `by ${p.highlight}#{nickname}${p.vote}.`,
  jukeSkipped: `${p.vote}Map ${p.highlight}#{map} ${p.vote}will be dropped from the queue, as `
    + `${p.highlight}#{nickname} ${p.vote}has left the server.`
}