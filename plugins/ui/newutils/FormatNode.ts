import { UiNode } from "./UiNode";

export type FormatProps = {
  pos: number[]
}

export class FormatNode extends UiNode {

  constructor(props: FormatProps) {
    super('format', props, [])
  }

}