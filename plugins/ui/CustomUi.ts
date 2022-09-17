import config from './config/CustomUi.js'
import { trakman as tm } from '../../src/Trakman.js'

export default class CustomUi {

  constructor() {
    tm.addListener('PlayerJoin', (info) => this.displayToPlayer(info.login))
  }

  display(): void {
    tm.sendManialink(
      `<custom_ui>
          <notice visible="${config.notice}"/>
          <challenge_info visible="${config.challengeInfo}"/>
          <net_infos visible="${config.netInfo}"/>
          <chat visible="${config.chat}"/>
          <checkpoint_list visible="${config.checkpointList}"/>
          <round_scores visible="${config.roundScores}"/>
          <scoretable visible="${config.scoreTable}"/>
          <global visible="${config.global}"/>
        </custom_ui>`
    )
  }

  displayToPlayer(login: string): void {
    tm.sendManialink(
      `<custom_ui>
          <notice visible="${config.notice}"/>
          <challenge_info visible="${config.challengeInfo}"/>
          <net_infos visible="${config.netInfo}"/>
          <chat visible="${config.chat}"/>
          <checkpoint_list visible="${config.checkpointList}"/>
          <round_scores visible="${config.roundScores}"/>
          <scoretable visible="${config.scoreTable}"/>
          <global visible="${config.global}"/>
        </custom_ui>`,
      login
    )
  }

}