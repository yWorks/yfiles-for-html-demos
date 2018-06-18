import { Injector, ComponentFactoryResolver, NgModule } from '@angular/core'
import { NodeComponent } from './node.component'
import { NodeData } from './node-data'

export class NodeComponentStyle extends yfiles.styles.NodeStyleBase {
  injector: Injector
  factoryResolver: ComponentFactoryResolver

  constructor(injector: Injector, resolver: ComponentFactoryResolver) {
    super()
    this.injector = injector
    this.factoryResolver = resolver
  }

  createVisual(renderContext: yfiles.view.IRenderContext, node: yfiles.graph.INode) {
    let g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('transform', 'translate(' + node.layout.x + ' ' + node.layout.y + ')')

    // Retrieve the factory for NodeComponents
    let componentFactory = this.factoryResolver.resolveComponentFactory(NodeComponent)
    // Have the factory create a new NodeComponent as a child of the new SVG g element.
    let compRef = componentFactory.create(this.injector, null, g)
    // Assign the NodeComponent's nodeData input property
    compRef.instance.nodeData = node.tag as NodeData

    return new yfiles.view.SvgVisual(g)
  }

  updateVisual(
    renderContext: yfiles.view.IRenderContext,
    oldVisual: yfiles.view.SvgVisual,
    node: yfiles.graph.INode
  ) {
    if (oldVisual && oldVisual.svgElement) {
      let g = oldVisual.svgElement
      g.setAttribute('transform', 'translate(' + node.layout.x + ' ' + node.layout.y + ')')
      return oldVisual
    }
    return this.createVisual(renderContext, node)
  }
}
