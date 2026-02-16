/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  HtmlCanvasVisual,
  IBoundsProvider,
  IHitTestable,
  IObjectRenderer,
  IVisibilityTestable,
  IVisualCreator
} from '@yfiles/yfiles'
import { getColor } from './getColor'

/**
 * A customized overview renderer with adjusted styles for nodes and edges.
 */
export class GraphOverviewRenderer extends BaseClass(IObjectRenderer) {
  getBoundsProvider(renderTag) {
    return IBoundsProvider.UNBOUNDED
  }

  getHitTestable(renderTag) {
    return IHitTestable.NEVER
  }

  getVisibilityTestable(renderTag) {
    return IVisibilityTestable.ALWAYS
  }

  getVisualCreator(renderTag) {
    return IVisualCreator.create({
      createVisual(context) {
        return new CanvasVisual()
      },
      updateVisual(context, oldVisual) {
        return oldVisual instanceof CanvasVisual ? oldVisual : this.createVisual(context)
      }
    })
  }
}

class CanvasVisual extends HtmlCanvasVisual {
  render(renderContext, ctx) {
    const graph = renderContext.canvasComponent.graph
    graph.edges.forEach((edge) => {
      this.renderEdge(renderContext, ctx, edge)
    })
    graph.nodes.forEach((node) => {
      if (graph.isGroupNode(node)) {
        this.renderGroupNode(renderContext, ctx, node)
      } else {
        this.renderNode(renderContext, ctx, node)
      }
    })
  }

  /**
   * Draws the path of the edge in a very light gray.
   */
  renderEdge(_renderContext, ctx, edge) {
    ctx.strokeStyle = getColor('--neutral-gray')
    ctx.beginPath()
    ctx.moveTo(edge.sourcePort.location.x, edge.sourcePort.location.y)
    edge.bends.forEach((bend) => ctx.lineTo(bend.location.x, bend.location.y))
    ctx.lineTo(edge.targetPort.location.x, edge.targetPort.location.y)
    ctx.stroke()
  }

  /**
   * Draws the outline of the group node in a very light gray.
   */
  renderGroupNode(_renderContext, ctx, node) {
    ctx.strokeStyle = getColor('--neutral-gray')
    ctx.strokeRect(node.layout.x, node.layout.y, node.layout.width, node.layout.height)
  }

  /**
   * Paints the rectangle of the node in a very light gray
   */
  renderNode(_renderContext, ctx, node) {
    ctx.fillStyle = getColor('--neutral-gray')
    ctx.fillRect(node.layout.x, node.layout.y, node.layout.width, node.layout.height)
  }
}
