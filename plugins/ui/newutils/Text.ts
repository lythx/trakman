import { LabelNode } from "./LabelNode.js";
import { QuadNode } from "./QuadNode.js";
import { Styles } from './StyleSheet.js'

export const Text = (text: string, styles: Styles = {}) => {
  (styles as any).text = text
  return QuadNode({
    background: styles.background,
    width: styles.width,
    height: styles.height,
    align: styles.align
  }, LabelNode(styles))
}