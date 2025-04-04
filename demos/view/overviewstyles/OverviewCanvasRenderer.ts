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
import { GraphOverviewRenderer, type IEdge, type INode, type IRenderContext } from '@yfiles/yfiles'
import type { Employee } from './orgchart-data'

/**
 * Custom HTML Canvas rendering for the overview.
 */
export class OverviewCanvasRenderer extends GraphOverviewRenderer {
  paintNode(renderContext: IRenderContext, ctx: CanvasRenderingContext2D, node: INode): void {
    const tag = node.tag as Employee
    switch (tag.status) {
      case 'busy':
        ctx.fillStyle = '#AB2346'
        break
      case 'present':
        ctx.fillStyle = '#76B041'
        break
      case 'travel':
        ctx.fillStyle = '#A367DC'
        break
      case 'unavailable':
        ctx.fillStyle = '#C1C1C1'
        break
      default:
        ctx.fillStyle = '#C1C1C1'
    }
    const layout = node.layout

    ctx.fillRect(layout.x, layout.y, layout.width, layout.height)
    const fullName = tag.name!
    const shortName = fullName.replace(/^(.).*\s(.)\S*$/, '$1. $2.')
    ctx.fillStyle = '#ffffff'
    ctx.font = '50px Verdana'
    ctx.fillText(
      shortName,
      node.layout.center.x - node.layout.width / 6,
      node.layout.center.y + node.layout.height / 6
    )
  }

  paintGroupNode(renderContext: IRenderContext, ctx: CanvasRenderingContext2D, node: INode): void {
    ctx.fillStyle = 'rgb(211, 211, 211)'
    ctx.strokeStyle = 'rgb(211, 211, 211)'
    ctx.lineWidth = 4
    const { x, y, width, height } = node.layout
    ctx.strokeRect(x, y, width, height)
    ctx.fillRect(x, y, width, 22)
    ctx.lineWidth = 1
  }

  paintEdge(renderContext: IRenderContext, ctx: CanvasRenderingContext2D, edge: IEdge): void {
    ctx.beginPath()
    ctx.moveTo(edge.sourcePort.location.x, edge.sourcePort.location.y)
    edge.bends.forEach((bend) => {
      ctx.lineTo(bend.location.x, bend.location.y)
    })
    ctx.lineTo(edge.targetPort.location.x, edge.targetPort.location.y)
    ctx.strokeStyle = '#8D8F91'
    ctx.lineWidth = 5
    ctx.stroke()
  }
}
