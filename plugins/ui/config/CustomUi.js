import { loadConfig } from "../../../src/ConfigLoader.js"
const defaultConfig = {
  notice: false,
  challengeInfo: false,
  netInfo: true,
  chat: true,
  checkpointList: false,
  roundScores: false,
  scoreTable: true,
  global: true
}

export default await loadConfig(defaultConfig, import.meta.url)
