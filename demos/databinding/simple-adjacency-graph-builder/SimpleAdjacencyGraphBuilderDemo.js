/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  AdjacencyGraphBuilder,
  EdgeCreator,
  GraphViewerInputMode,
  HierarchicalLayout,
  LayoutExecutor,
  Size
} from '@yfiles/yfiles'
import graphData from './graph-data.json'

// use the viewer input mode since this demo should not allow interactive graph editing
graphComponent.inputMode = new GraphViewerInputMode()

graph.nodeDefaults.size = new Size(260, 60)

// create the graph builder
const adjacencyGraphBuilder = new AdjacencyGraphBuilder(graph)
// create a source for the nodes of the graph
const adjacencyNodesSource = adjacencyGraphBuilder.createNodesSource(graphData.nodesSource, null)
// configure the label binding for the nodes
adjacencyNodesSource.nodeCreator.createLabelBinding((node) => `${node.name}\n${node.position}`)

// configure the successor nodes
adjacencyNodesSource.addSuccessorsSource(
  (data) => data.children,
  adjacencyNodesSource,
  new EdgeCreator({ defaults: graph.edgeDefaults })
)

// build the graph from the data
adjacencyGraphBuilder.buildGraph()

// make sure the graph is centered in the view before arranging it
await graphComponent.fitGraphBounds()

// configure a layout algorithm
const algorithm = new HierarchicalLayout({ layoutOrientation: 'left-to-right' })

// ensure that the LayoutExecutor class is not removed by build optimizers
LayoutExecutor.ensure()

// arrange the graph with the chosen layout algorithm
await graphComponent.applyLayoutAnimated(algorithm, '1s')
