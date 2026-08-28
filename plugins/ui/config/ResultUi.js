import { loadConfig } from "../../../src/ConfigLoader.js"
const defaultConfig = {
  margin: 0.15,
  marginBig: 0.27,
  format: '$s',
  textScale: 0.7,
  padding: 0.2,
  yOffset: -0.1,
  background: 'CCC6',
  width: 14.65,
  topBorder: 47.85,
  rightPosition: 49.13,
  leftPosition: -63.75,
  rightSideOrder: ['MapWidgetResult', 'NextMapRecords', 'TimerWidgetResult', 'KarmaRanking', 'VotersRanking',
    'VisitorsRanking', 'DonationPanelResult'],
  leftSideOrder: ['AveragesRanking', 'RankWidgetResult', 'KarmaWidgetResult', 'LocalRankingResult', 'DediRankingResult',
    'RoundAveragesRanking', 'AdminPanelResult'],
  otherComponents: ['DonatorsRanking', 'MostRecordsRanking', 'PlaytimeRanking', 'WinnersRanking', 'BannerWidget']
}

export default await loadConfig(defaultConfig, import.meta.url)
