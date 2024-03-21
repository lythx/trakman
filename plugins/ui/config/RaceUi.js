export default {
  reduxModeEnablePlayerAmount: 20,
  reduxModeDisablePlayerAmount: 18,
  margin: 0.15,
  marginBig: 0.27,
  format: "$s",
  textScale: 0.7,
  padding: 0.2,
  yOffset: -0.1,
  background: "0006",
  width: 14.65,
  topBorder: 47.85,
  rightPosition: 49.13,
  leftPosition: -63.75,
  // Put component class names here, if you want a margin between
  // components then put a number
  rightSideOrder: [
    "MapWidget",
    "PreviousAndBest",
    // 3.5, <- example margin
    "TMXRanking",
    "TimerWidget",
    "LocalRanking",
    "LiveRanking",
    "DonationPanel"
  ],
  leftSideOrder: [
    "ButtonsWidget",
    "RankWidget",
    "KarmaWidget",
    "DediRanking",
    "AdminPanel"
  ],
  otherComponents: ['BestCps', 'BestFinishes', 'CpCounter'],
  roundsRightSideOrder: [
    "MapWidget",
    "PreviousAndBest",
    "TMXRanking",
    "TimerWidget",
    "RoundScore",
    "RoundsPointsRanking",
    "DonationPanel"
  ],
  roundsLeftSideOrder: [
    "ButtonsWidget",
    "RankWidget",
    "KarmaWidget",
    "DediRanking",
    "LocalRanking",
    "AdminPanel"
  ],
  roundsOtherComponents: ['BestCps', 'BestFinishes', 'CpCounter'],
  cupRightSideOrder: [
    "MapWidget",
    "PreviousAndBest",
    "TMXRanking",
    "TimerWidget",
    "RoundScore",
    "RoundsPointsRanking",
    "DonationPanel"
  ],
  cupLeftSideOrder: [
    "ButtonsWidget",
    "RankWidget",
    "KarmaWidget",
    "DediRanking",
    "LocalRanking",
    "AdminPanel"
  ],
  cupOtherComponents: ['BestCps', 'BestFinishes', 'CpCounter'],
  teamsRightSideOrder: [
    "MapWidget",
    "PreviousAndBest",
    "TMXRanking",
    "TimerWidget",
    "RoundScore",
    "LocalRanking",
    "TeamScore",
    "DonationPanel"
  ],
  teamsLeftSideOrder: [
    "ButtonsWidget",
    "RankWidget",
    "KarmaWidget",
    "DediRanking",
    "AdminPanel"
  ],
  teamsOtherComponents: ['BestCps', 'BestFinishes', 'CpCounter'],
  lapsRightSideOrder: [
    "MapWidget",
    "PreviousAndBest",
    "TMXRanking",
    "TimerWidget",
    "LiveRanking",
    "LocalRanking",
    "DonationPanel"
  ],
  lapsLeftSideOrder: [
    "ButtonsWidget",
    "RankWidget",
    "KarmaWidget",
    "DediRanking",
    "LapRanking",
    "AdminPanel"
  ],
  lapsOtherComponents: ['BestCps', 'BestFinishes', 'CpCounter'],
  stuntsRightSideOrder: [
    "MapWidget",
    "PreviousAndBest",
    "DonationPanel",
    "TimerWidget",
    "LocalRanking",
    "LiveRanking",
  ],
  stuntsLeftSideOrder: [
    "ButtonsWidget",
    "RankWidget",
    "KarmaWidget",
    "TMXRanking",
    "UltiRanking",
    "AdminPanel"
  ],
  stuntsOtherComponents: ['BestCps', 'BestFinishes', 'CpCounter']
}