/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
import { ApplicationRef, ComponentFactoryResolver, Injector, NgZone } from '@angular/core'
import { NodeComponent } from './node.component'
import { Person } from './person'
import { INode, IRenderContext, NodeStyleBase, SvgVisual, Visual } from 'yfiles'

export class NodeComponentStyle extends NodeStyleBase {
  constructor(
    private readonly injector: Injector,
    private resolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private zone: NgZone
  ) {
    super()
  }

  createVisual(renderContext: IRenderContext, node: INode) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('transform', 'translate(' + node.layout.x + ' ' + node.layout.y + ')')

    // Retrieve the factory for NodeComponents
    const componentFactory = this.resolver.resolveComponentFactory(NodeComponent)
    // Have the factory create a new NodeComponent as a child of the new SVG g element.
    const compRef = componentFactory.create(this.injector, undefined, g)
    // Attach the component to the Angular component tree so that change detection will work
    this.appRef.attachView(compRef.hostView)
    // Assign the NodeComponent's item input property
    this.zone.run(() => {
      // run inside the zone so Angular will update the NodeComponent
      compRef.instance.item = node.tag as Person
      compRef.instance.zoom = renderContext.zoom
    })
    ;(g as any)['data-compRef'] = compRef

    const svgVisual = new SvgVisual(g)
    renderContext.setDisposeCallback(
      svgVisual,
      (context: IRenderContext, visual: Visual, dispose: boolean) => {
        // need to clean up after the visual is actually removed
        const listener = () => {
          this.appRef.detachView(compRef.hostView)
          compRef.destroy()
          context.canvasComponent!.removeUpdatedVisualListener(listener)
        }
        context.canvasComponent!.addUpdatedVisualListener(listener)
        return null
      }
    )
    return svgVisual
  }

  updateVisual(renderContext: IRenderContext, oldVisual: SvgVisual, node: INode) {
    if (oldVisual && oldVisual.svgElement) {
      const g = oldVisual.svgElement
      g.setAttribute('transform', 'translate(' + node.layout.x + ' ' + node.layout.y + ')')
      ;(g as any)['data-compRef'].instance.zoom = renderContext.zoom
      return oldVisual
    }
    return this.createVisual(renderContext, node)
  }
}
