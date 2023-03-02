import { UiNode } from "./UiNode.js";

export type FormatProps = Partial<{
  textSize: number
  textColor: number
}>

export const FormatNode = (props: FormatProps = {}): UiNode =>
  new UiNode('format', false, props)
