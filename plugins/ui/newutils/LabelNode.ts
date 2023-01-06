import { UiNode } from "./UiNode.js";

export type LabelProps = Partial<{
  width: number
  height: number
  x: number
  y: number
  z: number
  text: number
  align: 'center' | 'left' | 'right'
}>

export const LabelNode = (props: LabelProps = {}) =>
  new UiNode('label', false, props)