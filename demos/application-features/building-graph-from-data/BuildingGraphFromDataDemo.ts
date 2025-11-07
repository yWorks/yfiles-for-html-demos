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
import { graphComponent } from '@yfiles/demo-app/init'
import {
  GraphEditorInputMode,
  GroupNodeLabelModel,
  GroupNodeStyle,
  type IEdge,
  type IGraph,
  type INode,
  LabelStyle,
  Point,
  RectangleNodeStyle
} from '@yfiles/yfiles'
import graphData from './graph-data.json'

const graph = graphComponent.graph

initializeDefaultStyles(graph)

// Store groups and nodes in order to assign them as parents or connect them with edges afterward
const groups: { [id: string]: INode } = {}
const nodes: { [id: string]: INode } = {}

// Iterate the group data and create the corresponding group nodes
graphData.groupsSource.forEach((groupData: any): void => {
  groups[groupData.id] = graph.createGroupNode({
    labels: groupData.label != null ? [groupData.label] : [],
    layout: groupData.layout,
    tag: groupData
  })
})

// Iterate the node data and create the corresponding nodes
graphData.nodesSource.forEach((nodeData: any): void => {
  const node = graph.createNode({
    labels: nodeData.label != null ? [nodeData.label] : [],
    layout: nodeData.layout,
    tag: nodeData
  })
  if (nodeData.fill) {
    // If the node data specifies an individual fill color, adjust the style
    const nodeStyle = graph.nodeDefaults.style.clone() as RectangleNodeStyle
    nodeStyle.fill = nodeData.fill
    graph.setStyle(node, nodeStyle)
  }
  nodes[nodeData.id] = node
})

// Set the parent groups after all nodes/groups are created
graph.nodes.forEach((node: INode): void => {
  if (node.tag && node.tag.group) {
    graph.setParent(node, groups[node.tag.group])
  }
})

// Iterate the edge data and create the according edges
graphData.edgesSource.forEach((edgeData: any): void => {
  // Note that nodes and groups need to have disjoint sets of ids, otherwise it is impossible to determine
  // which node is the correct source/target.
  graph.createEdge({
    source: nodes[edgeData.from] || groups[edgeData.from],
    target: nodes[edgeData.to] || groups[edgeData.to],
    labels: edgeData.label != null ? [edgeData.label] : [],
    tag: edgeData
  })
})

// If given, apply the edge layout information
graph.edges.forEach((edge: IEdge): void => {
  const edgeData = edge.tag
  if (edgeData.sourcePort) {
    graph.setPortLocation(edge.sourcePort, Point.from(edgeData.sourcePort))
  }
  if (edgeData.targetPort) {
    graph.setPortLocation(edge.targetPort, Point.from(edgeData.targetPort))
  }
  if (edgeData.bends) {
    edgeData.bends.forEach((bendLocation: Point): void => {
      graph.addBend(edge, bendLocation)
    })
  }
})

// Fit the graph bounds
graphComponent.fitGraphBounds()

// Enable graph editing
graphComponent.inputMode = new GraphEditorInputMode()

// Only enable the undo engine after graph creation to prevent undoing of the graph creation
graph.undoEngineEnabled = true

/**
 * Initializes the defaults for the styling in this demo.
 *
 * @param graph The graph.
 */
function initializeDefaultStyles(graph: IGraph): void {
  // Set the style, label and label parameter for group nodes
  graph.groupNodeDefaults.style = new GroupNodeStyle({
    tabFill: '#61a044',
    tabPosition: 'left-trailing',
    drawShadow: true,
    tabWidth: 70
  })
  graph.groupNodeDefaults.labels.style = new LabelStyle({
    horizontalTextAlignment: 'left',
    textFill: '#eee'
  })
  graph.groupNodeDefaults.labels.layoutParameter = new GroupNodeLabelModel().createTabParameter()

  graph.nodeDefaults.style = new RectangleNodeStyle({
    fill: '#64a8be',
    stroke: '1.5px #bddae3',
    cornerStyle: 'round',
    cornerSize: 3.5
  })
}
