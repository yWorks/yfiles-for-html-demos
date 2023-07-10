/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import type { GraphComponent, INode, IRenderContext, Visual } from 'yfiles'
import { NodeStyleBase, SvgVisual } from 'yfiles'
import type { SvelteComponent } from 'svelte'
import type { Person } from './types'

declare type Props = {
  item: Person
  width: number
  height: number
  selected: boolean
  highlighted: boolean
  zoom: number
}

declare type Cache = { component: SvelteComponent }

/**
 * A node style implementation that can use a Svelte component for its
 * visualization.
 *
 * This style is fairly specific to the component in that the props passed to
 * it are defined and collected here.
 */
export default class SvelteComponentNodeStyle extends NodeStyleBase {
  constructor(private component: typeof SvelteComponent) {
    super()
  }

  protected createVisual(context: IRenderContext, node: INode): Visual {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const props = createProps(context, node)

    const svelteComponent = new this.component({
      target: g,
      props
    })

    const svgVisual = new SvgVisual(g) as SvgVisual & Cache
    svgVisual.component = svelteComponent

    // Remove the component when the corresponding visual is removed from the view.
    context.setDisposeCallback(
      svgVisual,
      (removeContext: IRenderContext, removedVisual: Visual, dispose: boolean) => {
        ;(removedVisual as SvgVisual & Cache).component.$destroy()
        return null
      }
    )

    // Place the visual where the node is
    const { x, y } = node.layout
    SvgVisual.setTranslate(g, x, y)
    return svgVisual
  }

  protected updateVisual(
    context: IRenderContext,
    oldVisual: SvgVisual & Cache,
    node: INode
  ): Visual {
    const newProps = createProps(context, node)

    // Update the component with the new props
    oldVisual.component.$set(newProps)

    // Update node location if necessary
    const { x, y } = node.layout
    SvgVisual.setTranslate(oldVisual.svgElement, x, y)
    return oldVisual
  }
}

function createProps(context: IRenderContext, node: INode): Props {
  const selected = (context.canvasComponent as GraphComponent).selection.selectedNodes.isSelected(
    node
  )
  const highlighted = (
    context.canvasComponent as GraphComponent
  ).highlightIndicatorManager.selectionModel!.isSelected(node)
  const layout = node.layout
  return {
    item: node.tag as Person,
    width: layout.width,
    height: layout.height,
    selected,
    highlighted,
    zoom: context.zoom
  }
}
