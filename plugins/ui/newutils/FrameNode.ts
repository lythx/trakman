import { UiNode } from "./UiNode.js";

export type FrameProps = Partial<{
  x: number
  y: number
  z: number
}>

export const FrameNode = (props: FrameProps= {}, ...children: UiNode[]) => {
  return new UiNode('frame',true, props, children)
}