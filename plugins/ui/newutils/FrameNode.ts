import { UiNode } from "./UiNode";

export type FrameProps = {
  pos: number[]
}

export class LabelNode extends UiNode {

  constructor(props: FrameProps, childNodes: UiNode[]) {
    super('frame', props, childNodes)
  }

}