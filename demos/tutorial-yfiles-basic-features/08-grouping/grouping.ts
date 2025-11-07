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
import { GroupNodeLabelModel, GroupNodeStyle, type IGraph, LabelStyle, Point } from '@yfiles/yfiles'

/**
 * Configures the default style for group nodes.
 */
export function configureGroupNodeStyles(graph: IGraph): void {
  graph.groupNodeDefaults.style = new GroupNodeStyle({ tabFill: '#0b7189' })

  // Set a label style with right-aligned text
  graph.groupNodeDefaults.labels.style = new LabelStyle({
    horizontalTextAlignment: 'right',
    textFill: 'white'
  })

  // Place the label inside the tab area of the group node
  // GroupNodeLabelModel is usually the most appropriate label model for GroupNodeStyle
  graph.groupNodeDefaults.labels.layoutParameter =
    new GroupNodeLabelModel().createTabParameter()
}

/**
 * Shows how to create group nodes programmatically.
 * Creates a couple of nodes and puts them into a group node.
 */
export function createGroupNodes(graph: IGraph): void {
  const n1 = graph.createNodeAt([30, -200])
  const n2 = graph.createNodeAt([170, -200])
  const n3 = graph.createNodeAt([30, -100])
  graph.createEdge(n1, n3)
  // Create an edge that crosses the group node boundary
  graph.createEdge(n3, graph.nodes.first()!)

  // Create a group node that encloses n1, n2 and n3
  const groupNode = graph.groupNodes([n1, n2, n3])

  graph.addLabel(groupNode, 'Group Node')
  // Edges starting from the group node itself are also allowed
  const edgeFromGroup = graph.createEdge(groupNode, graph.nodes.at(1)!)
  graph.addBend(edgeFromGroup, new Point(100, -35), 0)
  graph.addBend(edgeFromGroup, new Point(170, -35), 1)
}

export function adjustGroupNodeSize(graph: IGraph): void {
  // Get a group node
  const groupNode = graph.nodes.find((node) => graph.isGroupNode(node))!
  // Create a child node that's outside the group bounds
  graph.createNode({ parent: groupNode, layout: [100, -60, 30, 30] })
  // Adjust the group node layout to contain the new child
  graph.adjustGroupNodeLayout(groupNode)
}
