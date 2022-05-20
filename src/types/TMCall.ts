'use strict'

interface TMCall {
  readonly method: string
  readonly params?: any[]
  readonly expectsResponse?: boolean
}
