/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { IGraph, Point, PolylineEdgeStyle, ShapeNodeStyle } from 'yfiles'

/**
 * Creates a small sample graph.
 */
export function createSampleGraph(graph: IGraph, center: Point): void {
  // set some default styles
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'round-rectangle',
    fill: '#242265',
    stroke: '1.5px #29283D'
  })
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: `1.5px #29283D`
  })

  // create the nodes and edges
  const nodes = []
  for (let j = 0; j < 27; j++) {
    nodes[j] = graph.createNodeAt(center)
  }
  graph.createEdge(nodes[3], nodes[7])
  graph.createEdge(nodes[0], nodes[1])
  graph.createEdge(nodes[0], nodes[4])
  graph.createEdge(nodes[1], nodes[2])
  graph.createEdge(nodes[0], nodes[9])
  graph.createEdge(nodes[6], nodes[10])
  graph.createEdge(nodes[11], nodes[12])
  graph.createEdge(nodes[11], nodes[13])
  graph.createEdge(nodes[8], nodes[11])
  graph.createEdge(nodes[15], nodes[16])
  graph.createEdge(nodes[16], nodes[17])
  graph.createEdge(nodes[18], nodes[19])
  graph.createEdge(nodes[20], nodes[21])
  graph.createEdge(nodes[7], nodes[17])
  graph.createEdge(nodes[9], nodes[22])
  graph.createEdge(nodes[22], nodes[3])
  graph.createEdge(nodes[19], nodes[0])
  graph.createEdge(nodes[8], nodes[4])
  graph.createEdge(nodes[18], nodes[25])
  graph.createEdge(nodes[24], nodes[8])
  graph.createEdge(nodes[26], nodes[25])
  graph.createEdge(nodes[10], nodes[20])
  graph.createEdge(nodes[5], nodes[23])
  graph.createEdge(nodes[25], nodes[15])
  graph.createEdge(nodes[10], nodes[15])
  graph.createEdge(nodes[21], nodes[17])
  graph.createEdge(nodes[26], nodes[6])
  graph.createEdge(nodes[13], nodes[12])
  graph.createEdge(nodes[12], nodes[14])
  graph.createEdge(nodes[14], nodes[11])
  graph.createEdge(nodes[21], nodes[5])
  graph.createEdge(nodes[5], nodes[6])
  graph.createEdge(nodes[9], nodes[7])
  graph.createEdge(nodes[19], nodes[24])
}
