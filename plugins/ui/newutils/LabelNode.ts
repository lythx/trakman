import { UiNode } from "./UiNode";

export type LabelProps = {
  size: number[]
  pos: number[]
  text: string
}

export class LabelNode extends UiNode {

  constructor(props: LabelProps, childNodes: UiNode[]) {
    super('label', props, childNodes)
  }

}