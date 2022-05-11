'use strict'

class Command {
  #aliases
  #help
  #callback
  #level

  constructor (aliases, help, callback, level = 0) {
    this.#aliases = aliases
    this.#help = help
    this.#callback = callback
    this.#level = level
  }

  get aliases () {
    return this.#aliases
  }

  get help () {
    return this.#help
  }

  get callback () {
    return this.#callback
  }

  get level () {
    return this.#level
  }
}

export default Command
