'use strict'

type Command = {
  aliases: string[],
  help: string,
  callback: Function,
  level: number
}
