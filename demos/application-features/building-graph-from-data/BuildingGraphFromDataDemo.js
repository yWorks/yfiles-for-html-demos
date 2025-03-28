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
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  EdgePathLabelModel,
  EdgeSides,
  GraphComponent,
  GraphEditorInputMode,
  GroupNodeLabelModel,
  GroupNodeStyle,
  IEdge,
  IGraph,
  INode,
  LabelStyle,
  License,
  Point,
  RectangleNodeStyle,
  Size
} from '@yfiles/yfiles'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import graphData from './graph-data.json'
let graphComponent
/**
 * Bootstraps the demo.
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')
  graphComponent.inputMode = new GraphEditorInputMode()
  // configures default styles for newly created graph elements
  initializeGraph(graphComponent.graph)
  // then build the graph with the given data set
  buildGraph(graphComponent.graph, graphData)
  graphComponent.fitGraphBounds()
  // Often, the input data has no layout information at all. In this case, you can apply any of the automatic layout
  // algorithms to automatically lay out your input data, e.g., with HierarchicalLayout.
  // Finally, enable the undo engine. This prevents undoing of the graph creation
  graphComponent.graph.undoEngineEnabled = true
}
/**
 * Iterates through the given data set and creates nodes and edges according to the given data.
 * How to iterate through the data set and which information are applied to the graph, depends on the structure of
 * the input data. However, the general approach is always the same, i.e. iterating through the data set and
 * calling the graph item factory methods like
 * {@link IGraph.createNode()},
 * {@link IGraph.createGroupNode()},
 * {@link IGraph.createEdge()},
 * {@link IGraph.addLabel()}
 * and other {@link IGraph} functions to apply the given information to the graph model.
 *
 * @param graph The graph.
 * @param graphData The graph data that was loaded from the JSON file.
 * @yjs:keep = groupsSource,nodesSource,edgesSource
 */
function buildGraph(graph, graphData) {
  // Store groups and nodes to be accessible by their IDs.
  // It will be easier to assign them as parents or connect them with edges afterwards.
  const groups = {}
  const nodes = {}
  // Iterate the group data and create the according group nodes.
  graphData.groupsSource.forEach((groupData) => {
    groups[groupData.id] = graph.createGroupNode({
      labels: groupData.label != null ? [groupData.label] : [],
      layout: groupData.layout,
      tag: groupData
    })
  })
  // Iterate the node data and create the according nodes.
  graphData.nodesSource.forEach((nodeData) => {
    const node = graph.createNode({
      labels: nodeData.label != null ? [nodeData.label] : [],
      layout: nodeData.layout,
      tag: nodeData
    })
    if (nodeData.fill) {
      // If the node data specifies an individual fill color, adjust the style.
      const nodeStyle = graph.nodeDefaults.style.clone()
      nodeStyle.fill = nodeData.fill
      graph.setStyle(node, nodeStyle)
    }
    nodes[nodeData.id] = node
  })
  // Set the parent groups after all nodes/groups are created.
  graph.nodes.forEach((node) => {
    if (node.tag.group) {
      graph.setParent(node, groups[node.tag.group])
    }
  })
  // Iterate the edge data and create the according edges.
  graphData.edgesSource.forEach((edgeData) => {
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
  graph.edges.forEach((edge) => {
    const edgeData = edge.tag
    if (edgeData.sourcePort) {
      graph.setPortLocation(edge.sourcePort, Point.from(edgeData.sourcePort))
    }
    if (edgeData.targetPort) {
      graph.setPortLocation(edge.targetPort, Point.from(edgeData.targetPort))
    }
    if (edgeData.bends) {
      edgeData.bends.forEach((bendLocation) => {
        graph.addBend(edge, bendLocation)
      })
    }
  })
}
/**
 * Initializes the defaults for the styling in this demo.
 *
 * @param graph The graph.
 */
function initializeGraph(graph) {
  // set styles for this demo
  initDemoStyles(graph)
  // set the style, label and label parameter for group nodes
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
  // set sizes and locations specific for this demo
  graph.nodeDefaults.size = new Size(40, 40)
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}
run().then(finishLoading)
