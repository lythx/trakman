const p = tm.utils.palette

export default {
    isEnabled: true,
    // All the info messages will be prefixed with this text
    messagePrefix: `${p.record}[${p.highlight}INFO${p.record}]`,
    // Default formatting for the info messages
    // That is put inbetween the prefix and the message
    defaultFormatting: `$z$s `,
    // Controls whether the default chat prefix is shown
    chatPrefixEnabled: true,
    // Messages will be chosen randomly from this array
    messages: [
        `${p.highlight}This server is running ${p.rank}$L[${tm.config.controller.repo}]Trakman v${tm.config.controller.version}$L${p.highlight}.`,
        `${p.highlight}Bugreports and suggestions are welcome on the ${p.rank}$L[${tm.config.controller.repo}/issues]Trakman bugtracker$L${p.highlight}.`,
        `${p.highlight}Use ${p.rank}/help ${p.highlight}to get you started with the chat commands.`,
        // Copied and adapted from you-know-where
        `${p.highlight}Use ${p.rank}/list ${p.highlight}& click any map to add it to the queue.`,
        `${p.highlight}Use ${p.rank}/server ${p.highlight}to find the server information & setup.`,
        `${p.highlight}Use the ${p.rank}/best ${p.highlight}& ${p.rank}/worst ${p.highlight}commands to find your best & worst times.`,
        `${p.highlight}Use ${p.rank}/chatlog ${p.highlight}to access the past 500 chat messages.`
    ],
    // List of events to send a random message on, independently of the interval
    // For the list of events, peek the wiki
    // Alternatively, see the Events interface in /src/Namespace.ts/
    events: [
        `EndMap`,
        `adfadsfsdf`,
    ],
    // Whether to send a random message on a specific interval
    sendOnInterval: true,
    // Message sending interval
    messageInterval: 120, // Seconds
}