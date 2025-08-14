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
  EventRecognizers,
  FilteredGraphWrapper,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphOverviewComponent,
  IEdge,
  INode,
  LabelStyle,
  License,
  TreeAnalysis
} from '@yfiles/yfiles'

import { initializeNodePopups } from './node-popup-toolbar'
import { MindMapEdgeStyle } from './styles/MindMapEdgeStyle'
import { layoutTree } from './mind-map-layout'
import { initializeCommands } from './interaction/commands'

import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'

import { hobbies } from './resources/hobbies'
import { getNodeData, isCollapsed, isCrossReference } from './data-types'
import { initializeStyles, updateStyles } from './styles/styles-support'
import { adjustNodeBounds, getInEdge, getRoot, initializeSubtrees } from './subtrees'
import { initializeCrossReferences } from './cross-references'
import { useSingleSelection } from './interaction/single-selection'
import { EditOneLabelHelper } from './interaction/EditOneLabelHelper'
import { MindMapFocusIndicatorManager } from './MindMapFocusIndicatorManager'
import { MindMapOverviewRenderer } from './styles/MindMapOverviewRenderer'

// This demo shows how to implement a mind map viewer and editor.
//
// The demo provides the following features:
// - Create and delete nodes using a popup menu or keyboard shortcuts
// - Relocate or delete subtrees
// - Save and load the mind map
// - Collapse and expand nodes
// - Decorate nodes with state icons
// - Edit the color of nodes
// - Add cross-reference edges between nodes

/**
 * The GraphComponent
 */
let graphComponent

/**
 * A filtered graph hiding the collapsed nodes.
 */
let filteredGraph

async function run() {
  License.value = await fetchLicense()

  // initialize the GraphComponent and GraphOverviewComponent
  graphComponent = new GraphComponent('graphComponent')
  const overviewComponent = new GraphOverviewComponent('overviewComponent', graphComponent)
  overviewComponent.graphOverviewRenderer = new MindMapOverviewRenderer()

  initializeGraphComponent()
  initializeStyles()
  initializeGraphFiltering()
  initializeInputModes()
  initializeSubtrees(graphComponent)
  initializeCrossReferences(graphComponent)
  initializeNodePopups(graphComponent)

  await buildGraph(graphComponent.graph)

  // add custom commands to interact with the mind map
  initializeCommands(graphComponent)

  // limit the viewport so that the graph cannot be panned too far out of view
  graphComponent.viewportLimiter.policy = 'within-margins'
}

/**
 * Initializes the graphComponent.
 * Adds a view port limiter to limit panning, when the graph fits in the graphComponent, adds
 * a custom focusIndicatorManager and configures the label editing.
 */
function initializeGraphComponent() {
  // enables undo
  graphComponent.graph.undoEngineEnabled = true

  // set the maximum zoom factor of viewport to 2.0
  graphComponent.maximumZoom = 2.0

  // render the focus for the root in front of the node and for the other nodes behind
  graphComponent.focusIndicatorManager = new MindMapFocusIndicatorManager()

  const nodeDecorator = graphComponent.graph.decorator.nodes

  // prevent adding more than one label to a cross-reference edge or a node
  graphComponent.graph.decorator.edges.editLabelHelper.addConstant(new EditOneLabelHelper())
  nodeDecorator.editLabelHelper.addConstant(new EditOneLabelHelper())

  // hide selection
  nodeDecorator.selectionRenderer.hide()
}

/**
 * Initializes and customizes the input mode.
 * The mind map demo uses a customized version of the {@link GraphEditorInputMode} to implement
 * interactions. Various options must be set to custom values to ensure desired behaviour.
 */
function initializeInputModes() {
  const graphEditorInputMode = new GraphEditorInputMode({
    allowCreateNode: false,
    selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    clickableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.EDGE_LABEL,
    clickSelectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    showHandleItems: GraphItemTypes.EDGE,
    labelEditableItems:
      GraphItemTypes.LABEL_OWNER | GraphItemTypes.NODE_LABEL | GraphItemTypes.EDGE_LABEL,
    deletableItems: GraphItemTypes.NONE,
    allowClipboardOperations: false,
    contextMenuItems: GraphItemTypes.NODE,
    focusableItems: GraphItemTypes.NODE,
    editLabelInputMode: { autoRemoveEmptyLabels: false },
    // enable panning without ctrl-key pressed
    moveViewportInputMode: { beginRecognizer: EventRecognizers.MOUSE_DOWN },
    movableSelectedItemsPredicate: (item) =>
      item instanceof INode && item !== getRoot(graphComponent.graph),
    // disable the moveUnselectedItemsInputMode so that only selected nodes can be moved
    moveUnselectedItemsInputMode: { enabled: false },
    // make only the nodes and the cross-reference edges selectable
    selectablePredicate: (item) => {
      if (item instanceof IEdge) {
        return isCrossReference(item)
      }
      return item instanceof INode
    }
  })
  // when the label text is updated, the node bounds have to be recalculated so that the label fits in
  // the corresponding 'branch', also a new layout is needed
  graphEditorInputMode.editLabelInputMode.addEventListener('label-edited', async (evt) => {
    const label = evt.item
    if (label.owner instanceof INode) {
      adjustNodeBounds(label.owner, filteredGraph.wrappedGraph)
      await layoutTree(graphComponent)
    }
  })

  graphEditorInputMode.moveSelectedItemsInputMode.priority =
    graphEditorInputMode.moveViewportInputMode.priority - 1

  graphComponent.inputMode = graphEditorInputMode

  // disable selection of multiple elements simultaneously
  useSingleSelection(graphComponent)
}

/**
 * Initializes filtering for hiding nodes.
 */
function initializeGraphFiltering() {
  const graph = graphComponent.graph

  /**
   * Determines whether a node's parent is collapsed, so it should not be visible.
   */
  function nodePredicate(node) {
    const edge = getInEdge(node, filteredGraph.wrappedGraph)
    if (edge) {
      const parent = edge.sourceNode
      return !isCollapsed(parent) && nodePredicate(parent)
    }
    return true
  }

  filteredGraph = new FilteredGraphWrapper(graph, nodePredicate)
  graphComponent.graph = filteredGraph
}

/**
 * Creates the graph from the given dataset.
 * After building the graph, for each node we have to calculate its data needed for visualization
 * and interaction. Also, node and edge styles have to be applied, and finally, the complete graph
 * has to be arranged.
 */
async function buildGraph(graph) {
  // use the graphBuilder to create the graph
  const graphBuilder = new GraphBuilder(graph)
  const nodesSource = graphBuilder.createNodesSource(hobbies.concepts, 'id')
  const labelCreator = nodesSource.nodeCreator.createLabelBinding('text')
  labelCreator.defaults.style = new LabelStyle()
  const edgesSource = graphBuilder.createEdgesSource(hobbies.connections, 'from', 'to')
  edgesSource.edgeCreator.defaults.style = new MindMapEdgeStyle(1, 1)
  graphBuilder.buildGraph()

  // create the data information for each node needed for visualization and interaction
  initializeNodeData(graph)

  // create the styles for the nodes and edges based on the elements' data
  updateStyles(
    graph.nodes.find((node) => graph.inDegree(node) === 0),
    graph
  )
  // calculate the bounds for each node based on its label's size
  graph.nodes.forEach((node) => adjustNodeBounds(node, graph))

  // arrange the graph using a tree layout
  await layoutTree(graphComponent)

  await graphComponent.fitGraphBounds()

  graphComponent.graph.undoEngine.clear()
}

/**
 * Initializes the data needed for the node visualization and interaction.
 */
function initializeNodeData(graph) {
  /**
   * Returns a lighter color than the given one based on the given depth.
   */
  function lighten(color, depth) {
    const amount = depth * 30
    return (
      '#' +
      color
        .substring(1)
        .replace(/../g, (colorValue) =>
          Math.min(255, Math.max(0, parseInt(colorValue, 16) + amount)).toString(16)
        )
    )
  }

  try {
    // Run a tree analysis algorithm to calculate the depth of each node,
    // i.e., the distance of a node from the root node.
    // Ignore the cross-reference edges, because they do not belong to the tree structure
    const treeAnalysis = new TreeAnalysis({ subgraphEdges: (e) => !isCrossReference(e) })

    const analysisResult = treeAnalysis.run(graph)

    // set the node data for the root node
    const root = analysisResult.root
    const rootData = getNodeData(root)
    rootData.depth = analysisResult.getDepth(root)
    rootData.collapsed = false
    rootData.stateIcon = 0

    // calculate the node data for all other nodes
    const colors = ['#56926e', '#ff6c00', '#4281a4', '#AA5F82', '#db3a34']
    // get the direct neighbors of the root
    graph.neighbors(root).forEach((node, index) => {
      const nodeData = getNodeData(node)
      nodeData.depth = analysisResult.getDepth(node)
      nodeData.left = index % 2 === 0
      nodeData.color = colors[index % colors.length]
      nodeData.collapsed = false
      nodeData.stateIcon = 0
      // get the subtree of the node
      const subtreeNodes = analysisResult.getSubtree(node)
      subtreeNodes.nodes.forEach((subtreeNode) => {
        if (subtreeNode !== node) {
          const subtreeNodeData = getNodeData(subtreeNode)
          const depth = analysisResult.getDepth(subtreeNode)
          subtreeNodeData.depth = depth
          subtreeNodeData.left = nodeData.left
          subtreeNodeData.color = lighten(colors[index % colors.length], depth)
          subtreeNodeData.collapsed = false
          subtreeNodeData.stateIcon = 0
        }
      })
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (e.name === 'InvalidOperationError') {
      alert(
        'This mind map graph is not a tree. Please mark the non-tree edges with type "cross-edge" in your dataset.'
      )
    }
  }
}

void run().then(finishLoading)
