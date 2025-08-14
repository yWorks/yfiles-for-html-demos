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
import { PolylineEdgeStyle, ShapeNodeStyle, Size } from '@yfiles/yfiles'

export function initializeStyles(graph) {
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'ellipse',
    fill: '#ff6c00',
    stroke: '#662b00'
  })
  graph.nodeDefaults.size = new Size(5, 5)
}

/**
 * Style for the edges that connect the waypoints with the associated label nodes.
 */
export const leaderEdgeStyle = new PolylineEdgeStyle({ stroke: '1px dashed #662b00' })

/**
 * The size of the label nodes
 */
export const labelNodeSize = new Size(130, 50)

/**
 * Returns the icon that will be used in the template string instead of text associated
 * with the given waypoint.
 */
export function getIcon(value) {
  switch (value.category) {
    case 'yWorks':
    case 'start':
    case 'finish':
    case 'picnic':
    case 'camping':
    case 'golf':
    case 'observation-point':
    case 'grill':
    case 'parking':
    case 'swimming-pool':
      return `resources/icons/${value.category}.svg`
    default:
      return null
  }
}
