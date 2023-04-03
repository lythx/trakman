const p = tm.utils.palette

export default {
    isEnabled: true,
    // All the info messages will be prefixed with this text
    messagePrefix: `${p.record}[${p.highlight}INFO${p.record}]`,
    // Default formatting for the info messages
    defaultFormatting: `${p.highlight}`,
    // Controls whether the default chat prefix is shown
    chatPrefixEnabled: true,
    // Messages will be chosen randomly from this array
    messages: [
        `This server is running $L[${tm.config.controller.repo}]Trakman v${tm.config.controller.version}$L.`,
        `Bugs and suggestions are welcome on the $L[${tm.config.controller.repo}/issues]Trakman bugtracker$L.`,
        `Use /help to get you started with the chat commands.`,
        // Copied and adapted from you-know-where
        `Use /list & click any map to add it to the queue.`,
        `Use /server to find the server information & setup.`,
        `Use the /best & /worst commands to find your best & worst times.`,
        `Use /chatlog to access the past 500 chat messages.`
    ],
    // List of events to send a random message on, independently of the interval
    // For the list of events, peek the wiki
    // Alternatively, see the Events interface in /src/Namespace.ts/
    events: [
        `EndMap`,
    ],
    // Message sending interval
    messageInterval: 120, // Seconds
}