const p = tm.utils.palette

export default {
  isEnabled: false,
  colours: [
    { amount: 0, colour: '$fff' },
    { amount: 10, colour: '$' + p.green },
    { amount: 30, colour: '$' + p.purple },
    { amount: 100, colour: '$' + p.yellow },
    { amount: 200, colour: ['$03A', '$319', '$519', '$709', '$81A'] } // Gradient
  ]
}