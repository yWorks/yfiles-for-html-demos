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
import { CustomEdgeStyle } from './CustomEdgeStyle'
import type { IGraph } from 'yfiles'
import { Point, ShapeNodeStyle } from 'yfiles'

/**
 * Creates the sample edges for this tutorial step
 */
export function createEdges(graph: IGraph): void {
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'round-rectangle',
    fill: '#0b7189',
    stroke: '#042d37'
  })
  const node1 = graph.createNode({
    layout: [50, 0, 30, 30]
  })
  const node2 = graph.createNode({
    layout: [100, 100, 30, 30]
  })
  const node3 = graph.createNode({
    layout: [0, 200, 30, 30]
  })

  // the distance can be specified in the constructor
  const style1 = new CustomEdgeStyle(5)

  // the distance can also be changed later using the property on the style class
  const style2 = new CustomEdgeStyle(1)
  style2.distance = 3

  // not specifying the distance will use the default value
  const style3 = new CustomEdgeStyle()

  graph.createEdge({
    source: node1,
    target: node2,
    style: style1,
    bends: [new Point(115, 60)]
  })
  graph.createEdge({
    source: node2,
    target: node3,
    style: style2
  })
  graph.createEdge({
    source: node3,
    target: node1,
    style: style3,
    bends: [new Point(15, 120)]
  })
}
