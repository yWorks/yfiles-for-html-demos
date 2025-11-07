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
import { FreeNodePortLocationModel, type IGraph, Point, Rect } from '@yfiles/yfiles'

/**
 * Creates a sample graph and introduces all important graph elements present in
 * yFiles for HTML.
 */
export function graphElementCreation(graph: IGraph): void {
  // Create two nodes with the default node size
  // The location specifies the node center
  const node1 = graph.createNode()
  const node2 = graph.createNodeAt(new Point(150, 15))

  // Create a third node with a different size of 60x30
  // In this case, the x and y values define the upper left
  // corner of the node bounds
  const node3 = graph.createNode(new Rect(230, 200, 60, 30))

  // Create edges between the nodes
  graph.createEdge(node1, node2)
  const edgeWithBend = graph.createEdge(node2, node3)

  // Create a bend
  graph.addBend(edgeWithBend, new Point(260, 15))

  // Actually, edges connect "ports", not nodes directly.
  // If necessary, you can manually create ports at nodes
  // and let the edges connect to these.
  // Create a port in the center of the node layout
  const port1AtNode1 = graph.addPort(node1, FreeNodePortLocationModel.CENTER)

  // Create a port at the middle of the left border
  // The location is interpreted as absolute coordinates
  const port1AtNode3 = graph.addPortAt(
    node3,
    new Point(node3.layout.x, node3.layout.center.y)
  )

  // Create an edge that connects the two ports
  const edgeAtPorts = graph.createEdge(port1AtNode1, port1AtNode3)

  // Add labels to several graph elements
  graph.addLabel(node1, 'n1')
  graph.addLabel(node2, 'n2')
  graph.addLabel(node3, 'n3')
  graph.addLabel(edgeAtPorts, 'Edge at Ports')
}
