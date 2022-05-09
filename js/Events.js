'use strict'
const logger = require('tracer').colorConsole();

class Events {

    static handleEvent(name, json) {
        logger.warn(name)
        logger.debug(json)
        //TODO
    }
}

module.exports = Events