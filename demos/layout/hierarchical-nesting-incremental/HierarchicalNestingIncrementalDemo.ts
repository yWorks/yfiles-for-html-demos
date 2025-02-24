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
import {
  FolderNodeConverter,
  FoldingManager,
  GraphBuilder,
  GraphComponent,
  GraphOverviewComponent,
  GraphViewerInputMode,
  HierarchicalLayout,
  type INode,
  License,
  NodeAlignmentPolicy,
  NodesSource,
  Size
} from '@yfiles/yfiles'
import { graphData, type GroupData, type NodeData } from './sample-graph'
import { initializeInteractiveHierarchicalNestingLayout } from './InteractiveHierarchicalNestingLayout'
import { DemoStyleOverviewRenderer, initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'

let graphComponent: GraphComponent
let builder: GraphBuilder
let nodesSource: NodesSource<NodeData>
let groupNodesSource: NodesSource<GroupData>

/**
 * This demo shows how to nicely expand and collapse sub-graphs organized in groups.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  // initialize the GraphComponent
  graphComponent = new GraphComponent('graphComponent')
  graphComponent.inputMode = new GraphViewerInputMode({
    focusableItems: 'none',
    selectableItems: 'none'
  })

  // initialize Overview
  initializeOverviewComponent(graphComponent)

  // set up folding for this graph component
  initializeFolding(graphComponent)

  // load the sample graph from the JSON data
  await loadSampleGraph()

  // set up the layout which is automatically applied when a group node is collapsed/expanded
  initializeInteractiveHierarchicalNestingLayout(
    graphComponent,
    NodeAlignmentPolicy.TOP_RIGHT,
    addGroupDescendantsToGraph
  )
}

/**
 * Initializes folding for the graph in the given graph component and configures the corresponding
 * folder node converter.
 * @param graphComponent the current graph component
 */
function initializeFolding(graphComponent: GraphComponent): void {
  const foldingManager = new FoldingManager()
  // collapse all folders in the beginning
  const foldingView = foldingManager.createFoldingView({ isExpanded: () => false })
  graphComponent.graph = foldingView.graph

  // managing the appearance of folder nodes
  foldingManager.folderNodeConverter = new FolderNodeConverter({
    folderNodeDefaults: {
      copyLabels: true,
      size: new Size(110, 60)
    }
  })
}

/**
 * Creates an overview component that is configured to show group nodes more prominently than usual.
 * @param graphComponent the current graph component
 */
function initializeOverviewComponent(graphComponent: GraphComponent): void {
  const overviewComponent = new GraphOverviewComponent('overviewComponent', graphComponent)
  // style the overviewComponent to make the group nodes stand out
  overviewComponent.graphOverviewRenderer = new DemoStyleOverviewRenderer()
}

/**
 * Loads the sample graph from JSON data with all nodes that are not inside of groups
 * and applies an initial layout.
 */
async function loadSampleGraph(): Promise<void> {
  // use the default demo styles for the sample graph items
  initDemoStyles(graphComponent.graph, { foldingEnabled: true })

  // use the main graph to build the unfolded graph from the data
  const foldingView = graphComponent.graph.foldingView!
  const mainGraph = foldingView.manager.masterGraph

  // only load the nodes that are not inside any group
  builder = new GraphBuilder(mainGraph)
  nodesSource = builder.createNodesSource({
    data: graphData.nodesSource.filter((node) => !node.group),
    id: 'id',
    parentId: 'group'
  })
  groupNodesSource = builder.createGroupNodesSource({
    data: graphData.groupsSource.filter((group) => !group.parentGroup),
    id: 'id',
    labels: ['label'],
    parentId: 'parentGroup'
  })
  builder.createEdgesSource({
    data: graphData.edgesSource,
    sourceId: 'from',
    targetId: 'to'
  })
  builder.buildGraph()

  // no layout information available, yet
  // so we come up with an initial layout for the complete, expanded graph.
  graphComponent.graph.applyLayout(new HierarchicalLayout())

  // center the arranged graph in the visible area
  await graphComponent.fitGraphBounds()
}

/**
 * Retrieves data of all child nodes from a group node and add them to the graph
 * using graph builder.
 */
function addGroupDescendantsToGraph(groupNode: INode) {
  // append all child nodes of the given group node to the current nodes in graph
  builder.setData(
    nodesSource,
    graphData.nodesSource
      .filter((node) => node.group === groupNode.tag.id)
      .concat(...graphComponent.graph.nodes.map((node) => node.tag).filter((node) => !node.label))
  )
  // append all child group nodes of the given group node to the current group nodes in graph
  builder.setData(
    groupNodesSource,
    graphData.groupsSource
      .filter((group) => group.parentGroup === groupNode.tag.id)
      .concat(...graphComponent.graph.nodes.map((node) => node.tag).filter((node) => node.label))
  )
  // update the graph
  builder.updateGraph()
}

void run().then(finishLoading)
