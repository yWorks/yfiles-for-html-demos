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
import { graph, graphComponent } from '@yfiles/demo-app/init'
import {
  GraphBuilder,
  GraphViewerInputMode,
  HierarchicalLayout,
  InteriorNodeLabelModel,
  LayoutExecutor,
  Size
} from '@yfiles/yfiles'
import graphData from './graph-data.json'

// use the viewer input mode since this demo should not allow interactive graph editing
graphComponent.inputMode = new GraphViewerInputMode()

graph.nodeDefaults.size = new Size(260, 60)

// create the graph builder
const graphBuilder = new GraphBuilder(graph)

// in this sample, the top-level objects are the groups that have
// a list of children (employees) as well as an additional location
// attribute which specifies the group's parent node
const nodesSource = graphBuilder.createNodesSource({
  data: graphData.nodesSource,
  // specify the id property of a node object
  id: 'id'
})

// the children of each group are defined directly in the data
const childSource = nodesSource.createChildNodesSource(
  // specify how to retrieve the children of each group
  (group) => group.members,
  // specify how the child nodes are identified globally
  (item) => item.id
)
// the groups are additionally grouped again by location
const parentSource = nodesSource.createParentNodesSource((group) => group.location)

// configure the labels for the groups
nodesSource.nodeCreator.createLabelBinding((group) => group.id)
// configure the labels for the child nodes
childSource.nodeCreator.createLabelBinding((node) => `${node.name}\n${node.position}`)
// configure the labels for the location nodes
parentSource.nodeCreator.createLabelBinding((location) => location)

// set up reasonable defaults for the styles.
// since the entities in the nodesSource and the parentsSource are both group nodes,
// both use a group node style
nodesSource.nodeCreator.defaults.style = parentSource.nodeCreator.defaults.style =
  graph.groupNodeDefaults.style
// use the group node label defaults for the group nodes
nodesSource.nodeCreator.defaults.labels = parentSource.nodeCreator.defaults.labels =
  graph.groupNodeDefaults.labels
// the nodes in the childSource are styled with the node default
childSource.nodeCreator.defaults.style = graph.nodeDefaults.style
childSource.nodeCreator.defaults.labels = graph.nodeDefaults.labels

// create a source for the edges of the graph
graphBuilder.createEdgesSource({
  data: graphData.edgesSource,
  // specify the property of an edge object that contains the source node's id
  sourceId: 'fromNode',
  // specify the property of an edge object that contains the target node's id
  targetId: 'toNode'
})

// build the graph from the data
graphBuilder.buildGraph()

// make sure the graph is centered in the view before arranging it
await graphComponent.fitGraphBounds()

// configure a layout algorithm
const algorithm = new HierarchicalLayout({ layoutOrientation: 'left-to-right' })

// ensure that the LayoutExecutor class is not removed by build optimizers
LayoutExecutor.ensure()

// arrange the graph with the chosen layout algorithm
await graphComponent.applyLayoutAnimated(algorithm, '1s')
