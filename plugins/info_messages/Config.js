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
        `${p.highlight}Make sure to ${p.rank}star our repo ${p.highlight}$L[${tm.config.controller.repo}]on GitHub$L if you like the controller.`,
        // Copied and adapted from you-know-where
        `${p.highlight}Use ${p.rank}/list ${p.highlight}& ${p.rank}click any map ${p.highlight}to add it to the queue. See ${p.rank}/man list ${p.highlight}for options.`,
        `${p.highlight}Use ${p.rank}/server ${p.highlight}to find the server information & setup.`,
        `${p.highlight}Use the ${p.rank}/best ${p.highlight}& ${p.rank}/worst ${p.highlight}commands to find your best & worst times.`,
        `${p.highlight}Use ${p.rank}/chatlog ${p.highlight}to access the past ${tm.config.controller.chatMessagesInRuntime} chat messages.`,
        `${p.highlight}Use ${p.rank}/laston ${p.highlight}to see when the specified player was last online.`,
        `${p.highlight}Use ${p.rank}/sessiontime ${p.highlight}to see for how long you've been playing.`,
        `${p.highlight}Use ${p.rank}/donate ${p.highlight}to donate coppers to the server.`,
        `${p.highlight}Use ${p.rank}/pm ${p.highlight}to send private messages to other players.`,
        `${p.highlight}Use ${p.rank}/playtime ${p.highlight}to see for how long the current map has been played.`,
        `${p.highlight}Use ${p.rank}/autojuke ${p.highlight}to automatically queue a map. See ${p.rank}/man aj ${p.highlight}for options.`,
        `${p.highlight}Use ${p.rank}/man ${p.highlight}with any command to see how to utilise it.`,
    ],
    // List of events to send a random message on, independently of the interval
    // For the list of events, peek the wiki
    // Alternatively, see the Events interface in /src/Namespace.ts/
    events: [
        `EndMap`,
        `adfadsfsdf`,
    ],
    // Whether to send a random message on a specific interval
    sendOnInterval: false,
    // Message sending interval
    messageInterval: 120, // Seconds
}