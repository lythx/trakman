import { loadConfig } from "../../src/ConfigLoader.js"
const p = tm.utils.palette

const defaultConfig = {
  isEnabled: false,
  colours: [{
    amount: 0,
    colour: '$fff'
  }, {
    amount: 10,
    colour: '$' + p.green
  }, {
    amount: 30,
    colour: '$' + p.purple
  }, {
    amount: 100,
    colour: '$' + p.yellow
  }, {
    amount: 200,
    colour: ['$03A', '$319', '$519', '$709', '$81A']
  } // Gradient
  ]
}

export default await loadConfig(defaultConfig, import.meta.url)
