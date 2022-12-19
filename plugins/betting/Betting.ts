import BetPlaceWindow from './BetPlaceWindow.component.js'
import BetInfoWidget from './BetInfoWidget.component.js'
import config from './Config.js'

const betLogins: string[] = []
let prize: number | undefined
let betPlaceInterval: NodeJS.Timer

const betPlaceWindow = new BetPlaceWindow()
const betInfoWidget = new BetInfoWidget()

const onTimeRunOut = (wasInterrupted: boolean = false) => {
  clearInterval(betPlaceInterval)
  const unitedPlayers = tm.players.list.filter(a => a.isUnited)
  for (const e of unitedPlayers) {
    betPlaceWindow.hideToPlayer(e.login)
  }
  if (wasInterrupted) { return }
  if (prize === undefined || tm.players.count < 2) {
    prize = undefined
    tm.sendMessage(config.messages.noBets)
  } else {
    tm.sendMessage(config.messages.timeRunOut)
    betInfoWidget.totalPrize = prize * betLogins.length
    for (const e of unitedPlayers) {
      betInfoWidget.displayToPlayer(e.login)
    }
  }
}

tm.addListener('ServerStateChanged', (state) => {
  if (state !== 'race') { return }
  tm.sendMessage(config.messages.begin)
  betLogins.length = 0
  prize = undefined
  for (const e of tm.players.list.filter(a => a.isUnited)) {
    betPlaceWindow.displayToPlayer(e.login, {
      seconds: config.betTimeSeconds,
      placedBet: betLogins.includes(e.login)
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
      tm.utils.payCoppers(login, prize * 0.75, config.copperReturnMessage) // todo check * 0,75
    }
    tm.sendMessage(config.messages.noWinner)
    return
  }
  tm.utils.payCoppers(bestRecord.login, prize * betLogins.length * 0.75, config.winMessage)
  tm.sendMessage(tm.utils.strVar(config.messages.win, {
    name: tm.utils.strip(bestRecord.nickname),
    prize: prize * betLogins.length
  }))
})

betPlaceWindow.onBetStart = async (player, amount) => {
  const status = await tm.utils.sendCoppers(player.login, amount, config.betStartPromptMessage) // TODO check
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

betPlaceWindow.onBetAccept = async (player) => {
  if (prize === undefined) { return }
  const paymentStatus = await tm.utils.sendCoppers(player.login, prize, config.betAcceptPropmtMessage)
  if (paymentStatus === true) {
    betLogins.push(player.login)
    tm.sendMessage(tm.utils.strVar(config.messages.start, {
      name: tm.utils.strip(player.nickname),
    }))
    betPlaceWindow.hideToPlayer(player.login)
  }
}
