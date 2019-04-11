import { Injector, ComponentFactoryResolver, NgModule, ApplicationRef, EmbeddedViewRef } from '@angular/core'
import { NodeComponent } from './node.component'
import { Person } from './person'
import { SvgVisual, INode, IRenderContext, NodeStyleBase, Visual, GraphComponent } from 'yfiles'

export class NodeComponentStyle extends NodeStyleBase {
  constructor(private readonly injector: Injector, private resolver: ComponentFactoryResolver, private appRef: ApplicationRef) {
    super()
  }

  createVisual(renderContext: IRenderContext, node: INode) {
    let g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('transform', 'translate(' + node.layout.x + ' ' + node.layout.y + ')')

    // Retrieve the factory for NodeComponents
    let componentFactory = this.resolver.resolveComponentFactory(NodeComponent)
    // Have the factory create a new NodeComponent as a child of the new SVG g element.
    let compRef = componentFactory.create(this.injector, undefined, g)
    // Attach the component to the Angular component tree so that change detection will work
    this.appRef.attachView(compRef.hostView)
    // Assign the NodeComponent's item input property
    compRef.instance.item = node.tag as Person
    compRef.instance.zoom = renderContext.zoom

    g['data-compRef'] = compRef

    const svgVisual = new SvgVisual(g)
    renderContext.setDisposeCallback(svgVisual, (context: IRenderContext, visual: Visual, dispose: boolean) => {
      // need to clean up after the visual is actually removed
      const listener = () => {
        this.appRef.detachView(compRef.hostView)
        compRef.destroy()
        context.canvasComponent.removeUpdatedVisualListener(listener)
      }
      context.canvasComponent.addUpdatedVisualListener(listener)
      return null
    })

    return svgVisual
  }

  updateVisual(
    renderContext: IRenderContext,
    oldVisual: SvgVisual,
    node: INode
  ) {
    if (oldVisual && oldVisual.svgElement) {
      let g = oldVisual.svgElement
      g.setAttribute('transform', 'translate(' + node.layout.x + ' ' + node.layout.y + ')')
      g['data-compRef'].instance.zoom = renderContext.zoom
      return oldVisual
    }
    return this.createVisual(renderContext, node)
  }
}
