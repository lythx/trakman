const p = tm.utils.palette

export default {
  enabled: true,
  // Only supported with manual maploading
  useNextMapModOverride: false,
  // Can be used to provide a endpoint that serves a zip injecting UI mods into the zip (if you don't understand what this means, leave the default)
  modUrlPrefix: '',
  command: {
    aliases: ['mod'],
    help: 'Display the current map mod URL.',
    privilege: 0
  },
  messages: {
    current: `${p.highlight}Current map mod: $l$ff0#{url}`,
    missing: `${p.error}This map has no external mod URL.`
  },
  overrides: [
    // Environments are Stadium, Desert, Snow, Bay, Coast, Island, Rally
    // If random order is disabled, mods array will be applied in order
    {
      environment: 'Stadium',
      modLinks: ['https://trakman.ptrk.eu/TrakmanMod.zip'],
      randomOrder: true
    }, {
      environment: 'Desert',
      modLinks: ['https://trakman.ptrk.eu/TrakmanMod.zip'],
      randomOrder: true
    }, {
      environment: 'Snow',
      modLinks: ['https://trakman.ptrk.eu/TrakmanMod.zip'],
      randomOrder: true
    }, {
      environment: 'Bay',
      modLinks: ['https://trakman.ptrk.eu/TrakmanMod.zip'],
      randomOrder: true
    }, {
      environment: 'Coast',
      modLinks: ['https://trakman.ptrk.eu/TrakmanMod.zip'],
      randomOrder: true
    }, {
      environment: 'Island',
      modLinks: ['https://trakman.ptrk.eu/TrakmanMod.zip'],
      randomOrder: true
    }, {
      environment: 'Rally',
      modLinks: ['https://trakman.ptrk.eu/TrakmanMod.zip'],
      randomOrder: true
    }
  ]
}
