'use strict'

interface Command {
  readonly aliases: string[]
  readonly help?: string
  readonly callback: Function
  readonly privilege: number
}
