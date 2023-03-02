import { UiNode } from "./UiNode.js";

export type QuadProps = Partial<{
  width: number
  height: number
  x: number
  y: number
  z: number
  background: string
  position: 'relative'
  align: 'center' | 'left' | 'right'
}>

export const QuadNode = (props: QuadProps = {}, ...childNodes: UiNode[]): UiNode => {
  return new UiNode('quad', false, props, childNodes) // Check if can have childnodes
}