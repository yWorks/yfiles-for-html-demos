/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { GraphOverviewCanvasVisualCreator, IEdge, INode, IRenderContext } from 'yfiles'

/**
 * Custom HTML Canvas rendering for the overview.
 */
export default class OrgchartOverviewCanvasVisualCreator extends GraphOverviewCanvasVisualCreator {
  /**
   * Paints the given node.
   * @param {IRenderContext} renderContext The render context.
   * @param {CanvasRenderingContext2D} ctx The HTML canvas rendering context.
   * @param {INode} node The node to paint.
   */
  paintNode(renderContext, ctx, node) {
    switch (node.tag.status) {
      case 'busy':
        ctx.fillStyle = '#E7527C'
        break
      case 'present':
        ctx.fillStyle = '#55B757'
        break
      case 'travel':
        ctx.fillStyle = '#9945E9'
        break
      case 'unavailable':
        ctx.fillStyle = '#8D8F91'
        break
      default:
        ctx.fillStyle = '#8D8F91'
    }
    const layout = node.layout

    ctx.fillRect(layout.x, layout.y, layout.width, layout.height)
    const fullName = node.tag.name.split(' ')
    const shortName =
      fullName[0].replace(/^(.)(\S*)(.*)/, '$1$3') +
      ' ' +
      fullName[1].replace(/^(.)(\S*)(.*)/, '$1$3')
    ctx.strokeStyle = '#ffffff'
    ctx.font = '50px Verdana'
    ctx.strokeText(
      shortName,
      node.layout.center.x - node.layout.width / 6,
      node.layout.center.y + node.layout.height / 6
    )
  }

  /**
   * Paints the given edge.
   * @param {IRenderContext} renderContext The render context.
   * @param {CanvasRenderingContext2D} ctx The HTML canvas rendering context.
   * @param {IEdge} edge The edge to paint.
   */
  paintEdge(renderContext, ctx, edge) {
    ctx.beginPath()
    ctx.moveTo(edge.sourcePort.location.x, edge.sourcePort.location.y)
    edge.bends.forEach(bend => {
      ctx.lineTo(bend.location.x, bend.location.y)
    })
    ctx.lineTo(edge.targetPort.location.x, edge.targetPort.location.y)
    ctx.strokeStyle = '#8D8F91'
    ctx.lineWidth = 5
    ctx.stroke()
  }
}
