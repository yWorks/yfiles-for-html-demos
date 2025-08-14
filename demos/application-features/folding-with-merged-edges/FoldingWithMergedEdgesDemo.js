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
  EdgePathLabelModel,
  EdgeSides,
  ExteriorNodeLabelModel,
  FoldingEdgeState,
  FoldingManager,
  Graph,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GroupNodeLabelModel,
  GroupNodeStyle,
  HierarchicalLayout,
  IFoldingView,
  IGraph,
  LabelStyle,
  LayoutExecutor,
  License,
  MergingFoldingEdgeConverter,
  NinePositionsEdgeLabelModel,
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

  // enable folding for the graph
  const foldingView = enableFolding()

  // assign the folded graph to the graph component
  graphComponent.graph = foldingView.graph

  // configures default styles for newly created graph elements
  initializeGraph(foldingView.manager.masterGraph)

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(new HierarchicalLayout({ minimumLayerDistance: 35 }))
  await graphComponent.fitGraphBounds()

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  foldingView.manager.masterGraph.undoEngineEnabled = true
}

/**
 * Iterates through the given data set and creates nodes and edges according to the given data.
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder.createNodesSource({
    data: graphData.nodeList.filter((item) => !item.isGroup),
    id: (item) => item.id,
    parentId: (item) => item.parentId
  })

  graphBuilder
    .createGroupNodesSource({
      data: graphData.nodeList.filter((item) => item.isGroup),
      id: (item) => item.id
    })
    .nodeCreator.createLabelBinding((item) => item.label)

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })

  graphBuilder.buildGraph()
}

/**
 * Enables merging of folding edges. Adds labels with the number of merged edges.
 */
class LabeledMergingFoldingEdgeConverter extends MergingFoldingEdgeConverter {
  initializeFoldingEdgeState(state, foldingView, foldingEdge, masterEdges) {
    this.updateEdgeCountLabel(state, masterEdges)
    super.initializeFoldingEdgeState(state, foldingView, foldingEdge, masterEdges)
  }

  updateFoldingEdgeState(state, foldingView, foldingEdge, masterEdges) {
    this.updateEdgeCountLabel(state, masterEdges)
    super.updateFoldingEdgeState(state, foldingView, foldingEdge, masterEdges)
  }

  /**
   * Adds or updates the label showing the number of merged edges.
   */
  updateEdgeCountLabel(state, masterEdges) {
    const labelText = `E: ${masterEdges.size}`

    const label = state.labels.first()
    if (label) {
      label.text = labelText
    } else {
      state.addLabel(labelText, NinePositionsEdgeLabelModel.CENTER_CENTERED)
    }
  }
}

/**
 * Enables folding.
 *
 * @returns The folding view that manages the folded graph.
 */
function enableFolding() {
  const masterGraph = new Graph()

  // set default styles for newly created graph elements
  initializeGraph(masterGraph)

  // Creates the folding manager
  const manager = new FoldingManager(masterGraph)
  manager.foldingEdgeConverter = new LabeledMergingFoldingEdgeConverter()
  // Creates a folding view that manages the folded graph
  return manager.createFoldingView()
}

/**
 * Initializes the defaults for the styling in this demo.
 *
 * @param graph The graph.
 */
function initializeGraph(graph) {
  // set styles for this demo
  initDemoStyles(graph, { foldingEnabled: true })

  graph.groupNodeDefaults.style = new GroupNodeStyle({
    groupIcon: 'chevron-down',
    folderIcon: 'chevron-up',
    iconSize: 14,
    iconBackgroundShape: 'circle',
    iconForegroundFill: '#fff',
    tabFill: '#242265',
    tabPosition: 'top-trailing',
    stroke: '2px solid #242265',
    cornerRadius: 8,
    tabWidth: 70,
    contentAreaPadding: 8,
    hitTransparentContentArea: true
  })
  graph.groupNodeDefaults.labels.style = new LabelStyle({
    horizontalTextAlignment: 'right',
    textFill: '#fff'
  })
  graph.groupNodeDefaults.labels.layoutParameter = new GroupNodeLabelModel().createTabParameter()

  // set sizes and locations specific for this demo
  graph.nodeDefaults.size = new Size(40, 40)

  graph.nodeDefaults.labels.layoutParameter = new ExteriorNodeLabelModel({
    margins: 5
  }).createParameter('bottom')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}

run().then(finishLoading)
