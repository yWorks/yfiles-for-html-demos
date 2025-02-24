/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
import {
  BaseClass,
  type GraphComponent,
  HtmlCanvasVisual,
  IBoundsProvider,
  type IEdge,
  type IGraph,
  IHitTestable,
  type INode,
  IObjectRenderer,
  type IRenderContext,
  IVisibilityTestable,
  IVisualCreator,
  type Visual
} from '@yfiles/yfiles'

/**
 * Custom HTML Canvas rendering for the overview.
 */
export class MindMapOverviewRenderer extends BaseClass(IObjectRenderer) {
  getBoundsProvider(renderTag: IGraph): IBoundsProvider {
    return IBoundsProvider.UNBOUNDED
  }
  getHitTestable(renderTag: IGraph): IHitTestable {
    return IHitTestable.NEVER
  }
  getVisibilityTestable(renderTag: IGraph): IVisibilityTestable {
    return IVisibilityTestable.ALWAYS
  }
  getVisualCreator(renderTag: IGraph): IVisualCreator {
    return IVisualCreator.create({
      createVisual(context: IRenderContext): Visual | null {
        return new MindMapOverviewVisual()
      },
      updateVisual(context: IRenderContext, oldVisual: Visual | null): Visual | null {
        return oldVisual instanceof MindMapOverviewVisual ? oldVisual : this.createVisual(context)
      }
    })
  }
}

/**
 * A {@link Visual} that renders the overview component with customized node and edge styles.
 */
class MindMapOverviewVisual extends HtmlCanvasVisual {
  /**
   * Draws the graph.
   */
  render(renderContext: IRenderContext, ctx: CanvasRenderingContext2D): void {
    const graph = (renderContext.canvasComponent as GraphComponent).graph
    graph.edges.forEach((edge) => {
      this.renderEdge(renderContext, ctx, edge)
    })
    graph.nodes.forEach((node) => {
      this.renderNode(renderContext, ctx, node)
    })
  }

  /**
   * Draws each node with a round rectangle.
   */
  renderNode(renderContext: IRenderContext, ctx: CanvasRenderingContext2D, node: INode): void {
    ctx.fillStyle = 'rgb(200, 200, 200)'
    ctx.strokeStyle = 'rgb(0,0,0)'
    const { x, y, width, height } = node.layout
    ctx.save()
    ctx.beginPath()
    if ('roundRect' in ctx) {
      ctx.roundRect(x, y, width, height, [30])
    } else {
      // @ts-ignore Older browsers don't support roundRect
      ctx.rect(x, y, width, height)
    }

    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }

  /**
   * Draws each edge as a straight-line segment.
   */
  renderEdge(renderContext: IRenderContext, ctx: CanvasRenderingContext2D, edge: IEdge): void {
    ctx.beginPath()
    ctx.moveTo(edge.sourceNode.layout.center.x, edge.sourceNode.layout.center.y)
    ctx.lineTo(edge.targetNode.layout.center.x, edge.targetNode.layout.center.y)
    ctx.stroke()
  }
}
