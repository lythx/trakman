import BetPlaceWindow from './ui/BetPlaceWindow.component.js'
import BetInfoWidget from './ui/BetInfoWidget.component.js'
import config from './Config.js'

const betLogins: string[] = []
let prize: number | undefined
let betPlaceInterval: NodeJS.Timeout
let isActive = config.isActive && config.isEnabled
let isOpen = false

const betPlaceWindow = new BetPlaceWindow()
const betInfoWidget = new BetInfoWidget()

const returnCoppers = (login: string) => {
  if (prize === undefined) {
    throw new Error(`Prize undefined while returning coppers in betting plugin`)
  }
  void tm.utils.payCoppers(login, tm.utils.getCoppersAfterTax(prize), tm.utils.strVar(config.copperReturnMessage,
    {
      amount: prize,
      serverName: tm.utils.strip(tm.config.server.name, false)
    }))
}

const onTimeRunOut = (wasInterrupted = false) => {
  clearInterval(betPlaceInterval)
  isOpen = false
  const unitedPlayers = tm.players.list.filter(a => a.isUnited)
  for (const e of unitedPlayers) {
    betPlaceWindow.hideToPlayer(e.login)
  }
  if (wasInterrupted) { return }
  if (prize === undefined) {
    prize = undefined
  } else if (betLogins.length === 1) {
    returnCoppers(betLogins[0])
    prize = undefined
    tm.sendMessage(config.messages.noPlayers)
  } else {
    betInfoWidget.totalPrize = prize * betLogins.length
    for (const e of unitedPlayers) {
      betInfoWidget.displayToPlayer(e.login)
    }
  }
}

const startBet = async (player: tm.Player, amount: number) => {
  const status = await tm.utils.sendCoppers(player.login, amount,
    tm.utils.strVar(config.betStartPromptMessage, { amount }))
  if (status === true) {
    betLogins.push(player.login)
    prize = amount
    tm.sendMessage(tm.utils.strVar(config.messages.start, {
      name: tm.utils.strip(player.nickname),
      prize: prize * betLogins.length
    }))
    betPlaceWindow.prize = prize
    betPlaceWindow.betLogins = betLogins
  }
}

const acceptBet = async (player: tm.Player) => {
  if (prize === undefined) { return }
  const paymentStatus = await tm.utils.sendCoppers(player.login, prize, config.betAcceptPropmtMessage)
  if (paymentStatus === true) {
    betLogins.push(player.login)
    tm.sendMessage(tm.utils.strVar(config.messages.accept, {
      name: tm.utils.strip(player.nickname),
    }))
    betPlaceWindow.hideToPlayer(player.login)
  }
}

betPlaceWindow.onBetStart = startBet

betPlaceWindow.onBetAccept = acceptBet

if (config.isEnabled) {
  tm.addListener('Startup', () => {
    const msg = isActive ? config.messages.startupEnabled : config.messages.startupDisabled
    for (const e of tm.players.list.filter(a => a.privilege >= config.activatePrivilege))
      tm.sendMessage(msg, e.login)
  })

  tm.addListener('ServerStateChanged', (state) => {
    if (!isActive || state !== 'race') { return }
    betPlaceWindow.onBeginMap()
    betInfoWidget.onBeginMap()
    const unitedLogins = tm.players.list.filter(a => a.isUnited).map(a => a.login)
    tm.sendMessage(config.messages.begin, unitedLogins)
    isOpen = true
    betLogins.length = 0
    prize = undefined
    betPlaceWindow.prize = undefined
    for (const e of unitedLogins) {
      betPlaceWindow.displayToPlayer(e, {
        seconds: config.betTimeSeconds,
        placedBet: false
      })
    }
    const betStartTimestamp = Date.now()
    const lastRemainingSeconds = -1
    betPlaceInterval = setInterval(() => {
      const remainingSeconds = config.betTimeSeconds - ~~((Date.now() - betStartTimestamp) / 1000)
      if (remainingSeconds < 0) {
        onTimeRunOut()
        return
      }
      if (remainingSeconds !== lastRemainingSeconds) {
        for (const e of tm.players.list.filter(a => a.isUnited)) {
          betPlaceWindow.displayToPlayer(e.login, {
            seconds: remainingSeconds,
            placedBet: betLogins.includes(e.login)
          })
        }
      }
    }, 400)
  })

  tm.addListener('EndMap', () => {
    if (!isActive) { return }
    onTimeRunOut(true)
    if (prize === undefined) { return }
    const bestRecord = tm.records.live.find(a => betLogins.includes(a.login))
    if (bestRecord === undefined) {
      for (const login of betLogins) {
        returnCoppers(login)
      }
      tm.sendMessage(config.messages.noWinner)
      return
    }
    tm.utils.payCoppers(bestRecord.login, tm.utils.getCoppersAfterTax(prize * betLogins.length),
      tm.utils.strVar(config.winMessage,
        {
          amount: prize * betLogins.length,
          serverName: tm.utils.strip(tm.config.server.name, false)
        }))
    tm.sendMessage(tm.utils.strVar(config.messages.win, {
      name: tm.utils.strip(bestRecord.nickname),
      prize: prize * betLogins.length
    }))
  })

  tm.commands.add({
    aliases: config.activate.aliases,
    help: config.activate.help,
    callback: (info) => {
      if (isActive) {
        tm.sendMessage(config.activate.alreadyActive, info.login)
        return
      }
      betting.activate()
      tm.sendMessage(tm.utils.strVar(config.activate.success, {
        name: tm.utils.strip(info.nickname),
        title: info.title
      }), config.activate.public ? undefined : info.login)
    },
    privilege: config.activatePrivilege
  })

  tm.commands.add({
    aliases: config.deactivate.aliases,
    help: config.deactivate.help,
    callback: (info) => {
      if (!isActive) {
        tm.sendMessage(config.deactivate.alreadyNotActive, info.login)
        return
      }
      betting.deactivate()
      tm.sendMessage(tm.utils.strVar(config.deactivate.success, {
        name: tm.utils.strip(info.nickname),
        title: info.title
      }), config.deactivate.public ? undefined : info.login)
    },
    privilege: config.activatePrivilege
  })

  tm.commands.add({
    aliases: config.bet.aliases,
    help: config.bet.help,
    params: [{ name: 'prize', type: 'int', optional: true }],
    callback(info, newPrize?: number) {
      if (!isOpen) {
        tm.sendMessage(config.messages.closed, info.login)
        return
      }
      if (prize !== undefined && newPrize !== undefined) {
        tm.sendMessage(tm.utils.strVar(config.bet.noPrizeNeeded, { prize }), info.login)
        acceptBet(info)
      } else if (newPrize !== undefined) {
        if (newPrize < config.minimumAmount) {
          tm.sendMessage(tm.utils.strVar(config.messages.amountTooLow,
            { minimum: config.minimumAmount }), info.login)
          return
        }
        startBet(info, newPrize)
      } else if (prize !== undefined) {
        acceptBet(info)
      } else {
        tm.sendMessage(config.bet.prizeNeeded, info.login)
      }
    },
    privilege: config.bet.privilege
  })
}

/**
 * Handles race bets and renders bet related UI components.
 * @author lythx & Snake
 * @since 1.1
 */
export const betting = {
  /**
   * Activates the plugin on next map.
   * @returns Boolean indicating whether the plugin is enabled.
   */
  activate(): boolean {
    if (!config.isEnabled) { return false }
    isActive = true
    return true
  },
  /**
   * Deactivates the plugin on next map.
   * @returns Boolean indicating whether the plugin is enabled.
   */
  deactivate(): boolean {
    if (!config.isEnabled) { return false }
    isActive = false
    return true
  },

  /**
   * Boolean indicating whether the plugin is currently active.
   */
  get isActive(): boolean {
    return isActive
  },

  /**
   * Plugin status
   */
  isEnabled: config.isEnabled

}
