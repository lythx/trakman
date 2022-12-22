import BetPlaceWindow from './BetPlaceWindow.component.js'
import BetInfoWidget from './BetInfoWidget.component.js'
import config from './Config.js'

const betLogins: string[] = []
let prize: number | undefined
let betPlaceInterval: NodeJS.Timer

const betPlaceWindow = new BetPlaceWindow()
const betInfoWidget = new BetInfoWidget()

const returnCoppers = (login: string) => {
  if (prize === undefined) {
    throw new Error(`Prize undefined while returning coppers in betting plugin`)
  }
  void tm.utils.payCoppers(login, prize * 0.75, tm.utils.strVar(config.copperReturnMessage,
    {
      amount: prize,
      serverName: tm.utils.strip(tm.config.server.name, false)
    })) // todo check * 0,75
}

const onTimeRunOut = (wasInterrupted: boolean = false) => {
  clearInterval(betPlaceInterval)
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

tm.addListener('ServerStateChanged', (state) => {
  if (state !== 'race') { return }
  const unitedLogins = tm.players.list.filter(a => a.isUnited).map(a => a.login)
  tm.sendMessage(config.messages.begin, unitedLogins)
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
  let lastRemainingSeconds = -1
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
  tm.utils.payCoppers(bestRecord.login, prize * betLogins.length * 0.75,
    tm.utils.strVar(config.winMessage,
      {
        amount: prize,
        serverName: tm.utils.strip(tm.config.server.name, false)
      }))
  tm.sendMessage(tm.utils.strVar(config.messages.win, {
    name: tm.utils.strip(bestRecord.nickname),
    prize: prize * betLogins.length
  }))
})

betPlaceWindow.onBetStart = async (player, amount) => {
  const status = await tm.utils.sendCoppers(player.login, amount,
    tm.utils.strVar(config.betStartPromptMessage, { amount: prize })) // TODO check
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
} // TODO FIX TIMER NOPRIVILEGE

betPlaceWindow.onBetAccept = async (player) => {
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
