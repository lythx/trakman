'use strict'

interface Command {
  aliases: string[]
  help: string
  callback: Function
  level: number
}
