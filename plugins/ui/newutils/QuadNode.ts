import { UiNode } from "./UiNode";

export type QuadProps = {
  size: number[]
  pos: number[]
  background: string
}

export class QuadNode extends UiNode {

  constructor(props: QuadProps, childNodes: UiNode[]) {
    super('quad', props, childNodes)
  }

}