import yfiles = require('yfiles/view-component')

export class MyNodeStyle extends yfiles.styles.NodeStyleBase {
  constructor() {
    super()
  }

  createVisual(context: yfiles.view.IRenderContext, node: yfiles.graph.INode): yfiles.view.Visual {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    const { x, y, width, height } = node.layout
    rect.setAttribute('width', width.toString())
    rect.setAttribute('height', height.toString())
    rect.setAttribute('fill', '#336699')
    g.appendChild(rect)
    g.setAttribute('transform', `translate(${node.layout.x} ${node.layout.y})`)
    let svgVisual = new yfiles.view.SvgVisual(g)
    // remember layout on the visual
    ;(<any>svgVisual).layout = { x, y, width, height }
    return svgVisual
  }

  updateVisual(
    context: yfiles.view.IRenderContext,
    oldVisual: yfiles.view.Visual,
    node: yfiles.graph.INode
  ): yfiles.view.Visual {
    const { x, y, width, height } = node.layout

    let oldLayout = (<any>oldVisual).layout
    if (oldLayout.x !== x || oldLayout.y !== y) {
      // make sure that the location is up to date
      ;(<any>(<yfiles.view.SvgVisual>oldVisual).svgElement).transform.baseVal
        .getItem(0)
        .setTranslate(node.layout.x, node.layout.y)
      oldLayout.x = x
      oldLayout.y = y
    }
    if (oldLayout.width !== width || oldLayout.height !== height) {
      const rect = (<any>(<yfiles.view.SvgVisual>oldVisual).svgElement).firstChild
      rect.setAttribute('width', node.layout.width.toString())
      rect.setAttribute('height', node.layout.height.toString())
    }

    return oldVisual
  }
}
