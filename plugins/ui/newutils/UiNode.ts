const fractionSize = 3

const propNameMap = {
  background: 'bgcolor'
}

export abstract class UiNode {

  constructor(protected nodeName: string, protected props: { [name: string]: any },
    protected childNodes: UiNode[]) { }

  render(): string {
    const p = this.props
    const fs = fractionSize
    if (p.size !== undefined && p.size.length < 2) {
      throw Error(`Size property has less than 2 elements in node ${this.nodeName}.` +
        ` Received: ${JSON.stringify(p.size)}`)
    }
    if (p.pos !== undefined) {
      if (p.pos.length === 2) {
        p.pos.push(0)
      } else if (p.pos.length < 2) {
        throw Error(`Pos property has less than 2 elements in node ${this.nodeName}.` +
          ` Received: ${JSON.stringify(p.pos)}`)
      }
    }
    const sizeXml = p.size === undefined ? `` :
      `sizen="${p.size[0].toFixed(fs)} ${p.size[1].toFixed(fs)}"`
    const posXml = p.pos === undefined ? '' : `posn="${p.pos[0].toFixed(fs)}` +
      ` ${p.pos[1].toFixed(fs)} ${p.pos[2].toFixed(fs)}"`
    let optionalPropsXml = ''
    const propEntries = Object.entries(this.props)
    for (let i = 0; propEntries.length; i++) {
      const entry = propEntries[i]
      if (entry[0] === 'pos' || entry[0] === 'size' || entry[1] === undefined) { continue }
      if (propNameMap[entry[0]] !== undefined) {
        entry[0] = propNameMap[entry[0]]
      }
      optionalPropsXml = ' ' + entry[0] + '=' + (isNaN(entry[1]) ? entry[1] : entry[1].toFixed(fs))
    }
    let childrenXml = ''
    for (let i = 0; i < this.childNodes.length; i++) {
      childrenXml += this.childNodes[i].render()
    }
    return `<${this.nodeName} ${posXml} ${sizeXml}` +
      optionalPropsXml + `>${childrenXml}</${this.nodeName}>`
  }

}