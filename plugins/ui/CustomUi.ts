import { CONFIG as CFG } from './UiUtils.js'
import { TRAKMAN as TM } from '../../src/Trakman.js'

export default class CustomUi {

  display(): void {
    TM.sendManialink(
      `<custom_ui>
          <notice visible="${CFG.customUi.notice}"/>
          <challenge_info visible="${CFG.customUi.challengeInfo}"/>
          <net_infos visible="${CFG.customUi.netInfo}"/>
          <chat visible="${CFG.customUi.chat}"/>
          <checkpoint_list visible="${CFG.customUi.checkpointList}"/>
          <round_scores visible="${CFG.customUi.roundScores}"/>
          <scoretable visible="${CFG.customUi.scoreTable}"/>
          <global visible="${CFG.customUi.global}"/>
        </custom_ui>`
    )
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(
      `<custom_ui>
          <notice visible="${CFG.customUi.notice}"/>
          <challenge_info visible="${CFG.customUi.challengeInfo}"/>
          <net_infos visible="${CFG.customUi.netInfo}"/>
          <chat visible="${CFG.customUi.chat}"/>
          <checkpoint_list visible="${CFG.customUi.checkpointList}"/>
          <round_scores visible="${CFG.customUi.roundScores}"/>
          <scoretable visible="${CFG.customUi.scoreTable}"/>
          <global visible="${CFG.customUi.global}"/>
        </custom_ui>`,
      login
    )
  }

}