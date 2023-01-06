import { QuadNode } from "./QuadNode.js";
import { Styles } from "./StyleSheet.js";
import { UiNode } from "./UiNode.js";

export const View = (styles: Styles = {}, ...children: UiNode[]) => {
  return QuadNode(styles, ...children)
}