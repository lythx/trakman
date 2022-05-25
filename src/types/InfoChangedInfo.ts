'use strict'

interface InfoChangedInfo {
  readonly login: string
  readonly nickName: string
  readonly id: number
  readonly teamId: number
  readonly ladderRanking: number
  readonly forceSpectator: number
  readonly isReferee: boolean
  readonly isPodiumReady: boolean
  readonly isUsingStereoscopy: boolean
  readonly isManagedByOtherServer: boolean
  readonly isServer: boolean
  readonly hasPlayerSlot: boolean
  readonly isSpectator: boolean
  readonly isTemporarySpectator: boolean
  readonly isPureSpectator: boolean
  readonly autoTarget: boolean
  readonly currentTargetId: number
}
