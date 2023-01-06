const fractionSize = 0

const propNameMap = {
  background: 'bgcolor',
  textSize: 'textsize',
  textScale: 'textscale',
  textColor: 'textcolor'
}

const knownProps = ['textsize', 'textscale', 'text', 'background', 'halign', 'valign']

export class UiNode {

  private static readonly propNameMap = Object.entries(propNameMap)

  constructor(protected nodeName: string, protected isContainer: boolean,
    protected props: { [name: string]: any } = {}, protected childNodes: UiNode[] = []) {
    this.props.width = this.props.width ?? 10
    this.props.height = this.props.height ?? 10
    this.props.x = this.props.x ?? 0
    this.props.y = this.props.y ?? 0
    this.props.z = this.props.z ?? 0
    this.props.paddingTop = this.props.paddingTop ?? this.props.padding ?? 0
    this.props.paddingRight = this.props.paddingRight ?? this.props.padding ?? 0
    this.props.paddingBottom = this.props.paddingBottom ?? this.props.padding ?? 0
    this.props.paddingLeft = this.props.paddingLeft ?? this.props.padding ?? 0
    this.props.padding = undefined
    this.props.marginTop = this.props.marginTop ?? this.props.margin ?? 0
    this.props.marginRight = this.props.marginRight ?? this.props.margin ?? 0
    this.props.marginBottom = this.props.marginBottom ?? this.props.margin ?? 0
    this.props.marginLeft = this.props.marginLeft ?? this.props.margin ?? 0
    this.props.margin = undefined
    this.props.direction = this.props.direction ?? 'vertical'
  }

  render(): string {
    return `<frame posn="${this.props.x.toFixed(fractionSize)} ${-this.props.y.toFixed(fractionSize)} ${this.props.z}">${this._render()}</frame>`
  }

  private _render(): string {
    const sizeXml = this.getSizeXml()
    const posXml = this.getPosXml()
    const propsXml = this.getPropsXml()
    const childrenXml = this.getChildrenXml()
    if (!this.isContainer) {
      return `<frame ${posXml}><${this.nodeName} posn="0 0 0" ${sizeXml}` +
        propsXml + `/>${childrenXml}</frame>`
    }
    return `<${this.nodeName} ${posXml} ${sizeXml}` +
      propsXml + `>${childrenXml}</${this.nodeName}>`
  }

  private getSizeXml(): string {
    const width = this.props.width - (this.props.marginLeft + this.props.marginRight)
    const height = this.props.height - (this.props.marginTop + this.props.marginBottom)
    return `sizen="${width.toFixed(fractionSize)} ${height.toFixed(fractionSize)}"`
  }

  private getPosXml(): string {
    return `posn="${this.props.paddingLeft.toFixed(fractionSize)}` +
      ` ${-this.props.paddingTop.toFixed(fractionSize)} ${this.props.z}"`
  }

  private getPropsXml(): string {
    let propsXml = ''
    for (let i = 0; i < UiNode.propNameMap.length; i++) {
      this.props[UiNode.propNameMap[i][1]] = this.props[UiNode.propNameMap[i][0]]
    }
    for (let i = 0; i < knownProps.length; i++) {
      const entry = this.props[knownProps[i]]
      if (entry !== undefined) {
        propsXml += ' ' + knownProps[i] + '="' + (isNaN(entry) ? entry : entry.toFixed(fractionSize)) + '"'
      }
    }
    return propsXml
  }

  private getChildrenXml(): string {
    let childrenXml = ''
    let x = 0
    let y = 0
    for (let i = 0; i < this.childNodes.length; i++) {
      const node = this.childNodes[i]
      if (node.props.position === 'relative') {
        childrenXml += `<frame posn="${x} ${-y} ${this.props.z + 0.01}">${node._render()}</frame>`
        if (this.props.direction === 'vertical') {
          y += node.props.height
        } else {
          x += node.props.width
        }
      } else {
        let [posX, posY] = this.getNodePosition(node, x, y)
        childrenXml += `<frame posn="${posX} ${-posY} ${this.props.z + 0.01}">${node._render()}</frame>`
      }
    }
    return childrenXml
  }

  private getNodePosition(node: UiNode, x: number, y: number): [number, number] {
    console.log(node.props.align)
    let posX = x
    let posY = y
    if (node.props.align === 'center') {
      posX = this.props.width / 2 - node.props.width / 2
    } else if (node.props.align === 'right') {
      posX = this.props.width - node.props.width
    }
    if (node.props.alignVertical === 'center') {
      posY = this.props.height / 2 - node.props.height / 2
    } else if (node.props.alignVertical === 'right') {
      posY = this.props.height - node.props.height
    }
    return [posX, posY]
  }

}