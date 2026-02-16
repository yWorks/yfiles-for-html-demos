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
import {
  Arrow,
  ArrowType,
  BaseClass,
  Command,
  Cursor,
  ExteriorNodeLabelModel,
  FilteredGraphWrapper,
  GraphBuilder,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  HierarchicalLayout,
  HierarchicalLayoutData,
  IconLabelStyle,
  ILabelOwner,
  IMementoSupport,
  INode,
  InteriorNodeLabelModel,
  IUndoUnit,
  LabelStyle,
  LabelStyleIndicatorRenderer,
  LayoutExecutor,
  License,
  NodeStyleIndicatorRenderer,
  PlaceNodesAtBarycenterStage,
  PlaceNodesAtBarycenterStageData,
  PolylineEdgeStyle,
  PortAdjustmentPolicy,
  Rect,
  RoutingStyleDescriptor,
  Size,
  StyleIndicatorZoomPolicy,
  TransitiveClosure,
  TransitiveReduction,
  VerticalTextAlignment
} from '@yfiles/yfiles'

import GraphData from './resources/yfiles-modules-data'
import { createDemoNodeStyle } from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { addNavigationButtons, finishLoading } from '@yfiles/demo-app/demo-page'

import packageIconUrl from './resources/package.svg?url'

/**
 * The {@link GraphComponent} which contains the {@link IGraph}.
 */
let graphComponent

/**
 * The parameter for all node labels.
 * It keeps the labels on the right side of the node.
 */
let nodeLabelParameter

/**
 * The edge style that is applied to all original, non-transitive edges in the graph.
 * Normal edges are visualized with a solid black line and arrow.
 */
let normalEdgeStyle

/**
 * The edge style that is applied to all edges that were added when calculating the transitive
 * closure. Those edges are visualized with a solid blue line and arrow.
 */
let addedEdgeStyle

/**
 * The edge style that is applied to all edges that were removed when calculating the transitive
 * reduction. Those edges are visualized with a dashed grey line and an arrow.
 */
let removedEdgeStyle

/**
 * The layout algorithm that is used for every layout calculation in this demo.
 * It is configured in {@link initializeLayout()}.
 */
let layout

/**
 * Marks whether the demo is currently applying a layout to the graph.
 * During layout, the toolbar is disabled.
 */
let layoutInProgress = false

/**
 * Changes the toolbar state according to if a layout is running or not.
 */
function setLayoutInProgress(inProgress) {
  setUIDisabled(inProgress)
  layoutInProgress = inProgress
}

/**
 * Combo box to select one of the different algorithms.
 * It provides access to transitive reduction, transitive closure and returning to the original
 * graph.
 */
let algorithmComboBox

/**
 * Holds all edges that are added when calculating the transitive closure.
 * These edges are removed when the original graph is restored.
 */
let addedEdges = []

/**
 * Stores all edges that where removed when calculation the transitive reduction in case they
 * should be invisible.
 */
let removedEdgesSet = null

/**
 * Stores all nodes that are currently visible in the graph.
 */
let filteredNodes = null

/**
 * Stores all edges that are currently visible in the graph.
 */
let filteredEdges = null

/**
 * A filtered graph that only shows the sub-graph that currently of interest.
 * Nodes and edges that should be visible are described by
 * {@link edgePredicate(IEdge)} and
 * {@link edgePredicate(INode)}.
 */
let filteredGraph

/**
 * Holds all nodes that should be inserted into the layout incrementally at then next layout run.
 */
let incrementalNodes = []

/**
 * Holds all edges that should be inserted into the layout incrementally at then next layout run.
 */
let incrementalEdges = []

/**
 * Marks whether edges that were removed during transitive reduction are visible.
 */
let showTransitiveEdges = true

/**
 * The node whose dependencies are currently shown.
 */
let startNode = null

/**
 * The number of dependents in the current graph.
 */
let dependentsNo = 0

/**
 * The number of dependencies in the current graph.
 */
let dependenciesNo = 0

/**
 * Starts a demo that shows how to use the yFiles transitivity algorithms.
 */
async function run() {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')
  algorithmComboBox = document.querySelector('#algorithms')
  addNavigationButtons(algorithmComboBox)

  // use a filtered graph to have control over which nodes and edges are visible at any time
  filteredGraph = new FilteredGraphWrapper(graphComponent.graph, nodePredicate, edgePredicate)
  graphComponent.graph = filteredGraph

  // load input module and initialize input
  initializeInputModes()
  initializeUI()

  initializeStyles()
  initializeLayout()
  initializeGraph()

  await loadGraph()
}

/**
 * Gets the undo engine from the graph associated to the given graph component.
 * @param graphComponent the demo's graph component
 * @returns the undo engine that is associated to graph of the given graph component.
 */
function getUndoEngine(graphComponent) {
  return graphComponent.graph.undoEngine
}

/**
 * Registers JavaScript commands for various GUI elements.
 */
function initializeUI() {
  document.querySelector('#algorithms').addEventListener('change', onAlgorithmChanged)

  document.querySelector('#layout').addEventListener('click', async () => {
    await applyLayout(false)
  })

  const showTransitiveEdgesButton = document.querySelector('#show-transitive-edges')
  showTransitiveEdgesButton.addEventListener('click', async () => {
    showTransitiveEdges = !!showTransitiveEdgesButton && showTransitiveEdgesButton.checked
    if (algorithmComboBox.selectedIndex === 2) {
      const undoEdit = beginUndoEdit('undoShowTransitiveEdges', 'redoShowTransitiveEdges')
      resetGraph()
      applyAlgorithm()
      await applyLayout(true)
      commitUndoEdit(undoEdit)
    }
  })
}

/**
 * Initializes {@link GraphViewerInputMode} as input mode for this demo.
 */
function initializeInputModes() {
  const mode = new GraphViewerInputMode({ selectableItems: GraphItemTypes.NONE })

  // show enlarged nodes on hover
  mode.itemHoverInputMode.addEventListener('hovered-item-changed', (evt) => {
    const item = evt.item
    const oldItem = evt.oldItem

    const highlights = graphComponent.highlights
    if (item) {
      // add enlarged version of the node with its first label as highlight
      highlights.add(item)
      item.tag.highlight = true
      if (item instanceof ILabelOwner && item.labels.size > 0) {
        highlights.add(item.labels.get(0))
      }
    }
    if (oldItem) {
      // remove previous highlight
      highlights.remove(oldItem)
      oldItem.tag.highlight = false
      if (oldItem instanceof ILabelOwner && oldItem.labels.size > 0) {
        highlights.remove(oldItem.labels.get(0))
      }
    }
  })
  mode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE
  mode.itemHoverInputMode.hoverCursor = Cursor.POINTER

  mode.keyboardInputMode.addCommandBinding(
    Command.UNDO,
    (args) => {
      const engine = getUndoEngine(graphComponent)
      if (engine.canUndo()) {
        engine.undo()
        args.handled = true
      }
    },
    (args) => {
      args.canExecute = getUndoEngine(graphComponent).canUndo()
      args.handled = true
    }
  )

  mode.keyboardInputMode.addCommandBinding(
    Command.REDO,
    (args) => {
      const engine = getUndoEngine(graphComponent)
      if (engine.canRedo()) {
        engine.redo()
        args.handled = true
      }
    },
    (args) => {
      args.canExecute = getUndoEngine(graphComponent).canRedo()
      args.handled = true
    }
  )

  mode.addEventListener('item-clicked', async (evt) => {
    if (evt.item instanceof INode) {
      evt.handled = true

      const item = evt.item

      // check if dependencies' circle was hit
      if (item !== startNode) {
        const undoEdit = beginUndoEdit('undoChangeStartNode', 'redoChangeStartNode')
        getUndoEngine(graphComponent).addUnit(createChangedSetUndoUnit())
        graphComponent.currentItem = item
        await filterGraph(item)
        commitUndoEdit(undoEdit)
      }
    }
  })

  graphComponent.inputMode = mode

  // install custom highlight
  graphComponent.graph.decorator.nodes.highlightRenderer.addConstant(
    new NodeStyleIndicatorRenderer({
      margins: 5,
      zoomPolicy: StyleIndicatorZoomPolicy.NO_DOWNSCALING
    })
  )
  graphComponent.graph.decorator.labels.highlightRenderer.addConstant(
    new LabelStyleIndicatorRenderer({
      margins: 5,
      zoomPolicy: StyleIndicatorZoomPolicy.NO_DOWNSCALING
    })
  )

  // disable default focus indicator
  graphComponent.focusIndicatorManager.enabled = false

  let currentNode = null
  // set a css class to the currently focused node that changes its background color to orange
  graphComponent.addEventListener('current-item-changed', () => {
    if (currentNode != null && currentNode != graphComponent.currentItem) {
      currentNode.style.cssClass = ''
      currentNode = null
    }
    if (graphComponent.currentItem instanceof INode) {
      currentNode = graphComponent.currentItem
      currentNode.style.cssClass = 'node-focus'
    }
  })
}

/**
 * Initializes the styles to use for the graph.
 */
function initializeStyles() {
  normalEdgeStyle = new PolylineEdgeStyle({
    stroke: '1.5px #203744',
    targetArrow: new Arrow(ArrowType.TRIANGLE),
    smoothingLength: 10
  })

  addedEdgeStyle = new PolylineEdgeStyle({
    stroke: '1.5px #DB3A34',
    targetArrow: new Arrow({ fill: '#DB3A34', stroke: '#DB3A34', type: ArrowType.TRIANGLE }),
    smoothingLength: 10
  })

  removedEdgeStyle = new PolylineEdgeStyle({
    stroke: '1.5px dashed #c1c1c1',
    targetArrow: new Arrow({ fill: '#c1c1c1', stroke: '#c1c1c1', type: ArrowType.TRIANGLE }),
    smoothingLength: 10
  })

  nodeLabelParameter = new InteriorNodeLabelModel({ padding: 9 }).createParameter('center')
}

/**
 * Initializes the graph defaults.
 */
function initializeGraph() {
  const graph = filteredGraph
  graph.nodeDefaults.style = createDemoNodeStyle('demo-palette-56')
  graph.nodeDefaults.shareStyleInstance = false
  graph.nodeDefaults.size = new Size(80, 30)

  graph.nodeDefaults.labels.style = new IconLabelStyle({
    wrappedStyle: new LabelStyle({
      textFill: 'white',
      verticalTextAlignment: VerticalTextAlignment.CENTER
    }),
    href: packageIconUrl,
    iconPlacement: new ExteriorNodeLabelModel({ margins: [0, 0, 0, -5] }).createParameter('left'),
    wrappedStylePadding: 10,
    iconSize: new Size(24, 24)
  })
  graph.edgeDefaults.style = normalEdgeStyle

  graph.undoEngineEnabled = true
}

/**
 * Initializes the layout algorithms.
 */
function initializeLayout() {
  layout = new HierarchicalLayout({
    layoutOrientation: 'left-to-right',
    minimumLayerDistance: 0,
    nodeDistance: 20,
    automaticEdgeGrouping: true
  })
  layout.coordinateAssigner.symmetryOptimizationStrategy = 'weak'
  layout.defaultEdgeDescriptor.routingStyleDescriptor = new RoutingStyleDescriptor('octilinear')
  layout.defaultEdgeDescriptor.backLoopRouting = true
}

/**
 * Loads a new dependency graph according to which sample is selected.
 * This function is also called if a new start package is chosen.
 */
async function loadGraph() {
  filteredGraph.wrappedGraph.clear()
  filteredNodes = null
  filteredEdges = null

  addedEdges = []

  resetGraph()

  const builder = new GraphBuilder(graphComponent.graph)
  builder.createNodesSource({ data: GraphData.nodes, id: 'id', labels: ['label'] })
  builder.createEdgesSource(GraphData.edges, 'from', 'to')

  const graph = builder.buildGraph()

  graph.nodes.forEach((node) => {
    const label = node.labels.first()
    const nodeLayout = new Rect(
      node.layout.x,
      node.layout.y,
      label.layout.width + 50,
      node.layout.height
    )
    graph.setNodeLayout(node, nodeLayout)
    graph.setLabelLayoutParameter(label, nodeLabelParameter)
    node.tag = { highlight: false }
  })

  startNode = getInitialPackage('yfiles')
  graphComponent.currentItem = startNode

  // initialize the values for yfiles/modules, so that we do not count them again
  dependentsNo = 0
  dependenciesNo = filteredGraph.nodes.size - 1

  applyAlgorithm()
  await applyLayout(false)
  graph.undoEngine.clear()
}

/**
 * Returns the node that represents the given package.
 * @param packageName the name of the package and the label of the node
 */
function getInitialPackage(packageName) {
  let initialPackageNode = null
  filteredGraph.wrappedGraph.nodes.forEach((node) => {
    if (packageName === node.labels.get(0).text) {
      initialPackageNode = node
    }
  })
  return initialPackageNode
}

/**
 * Invokes the selected algorithms when another algorithm is chosen in the combo box.
 */
async function onAlgorithmChanged() {
  const transitiveEdgesLabel = document.querySelector('#show-transitive-edges-label')
  if (algorithmComboBox == null || transitiveEdgesLabel == null) {
    return
  }

  // only show button to toggle transitive edges when 'Transitive Reduction' is selected
  transitiveEdgesLabel.style.display =
    algorithmComboBox.selectedIndex === 2 ? 'inline-block' : 'none'

  if (incrementalNodes != null) {
    incrementalNodes = []
  }

  resetGraph()
  applyAlgorithm()
  await applyLayout(true)
  getUndoEngine(graphComponent).clear()
}

/**
 * Applies the selected algorithm to the graph.
 * Algorithms are chosen using {@link algorithmComboBox}.
 */
function applyAlgorithm() {
  const graph = filteredGraph
  if (graph.nodes.size > 0) {
    switch (algorithmComboBox.value) {
      default:
      case 'original-graph':
        break
      case 'transitive-closure': {
        const transitivityClosure = new TransitiveClosure()
        const transitivityClosureResult = transitivityClosure.run(graph)

        const newEdges = transitivityClosureResult.edgesToAdd
        newEdges.forEach((edge) => {
          const newEdge = graph.createEdge(edge.source, edge.target)
          graph.setStyle(newEdge, addedEdgeStyle)

          addedEdges.push(newEdge)
          if (filteredEdges) {
            filteredEdges.add(newEdge)
            filteredGraph.edgePredicateChanged(newEdge)
          }
          incrementalEdges.push(newEdge)
        })
        break
      }
      case 'transitive-reduction': {
        const transitivityReduction = new TransitiveReduction()
        const transitivityReductionResult = transitivityReduction.run(graph)

        if (!removedEdgesSet) {
          removedEdgesSet = new Set()
        }

        const transitiveEdges = transitivityReductionResult.edgesToRemove
        transitiveEdges.forEach((edge) => {
          if (showTransitiveEdges) {
            graph.setStyle(edge, removedEdgeStyle)
            incrementalEdges.push(edge)
          } else {
            removedEdgesSet.add(edge)
            filteredGraph.edgePredicateChanged()
          }
        })
        break
      }
    }
  }
}

/**
 * Returns whether the given edge should be visible.
 * An edge is visible if it is not removed during transitive reduction and is contained in
 * {@link filteredEdges}.
 */
function edgePredicate(edge) {
  return (
    (!removedEdgesSet || !removedEdgesSet.has(edge)) && (!filteredEdges || filteredEdges.has(edge))
  )
}

/**
 * Returns whether the given node should be visible.
 * A node is visible if it is contained in {@link filteredNodes}.
 */
function nodePredicate(node) {
  return !filteredNodes || filteredNodes.has(node)
}

/**
 * Filters the graph after selecting a different start node interactively.
 * @param clickedNode The new start node.
 */
async function filterGraph(clickedNode) {
  resetGraph()
  incrementalNodes = []

  // initialize dependents and dependencies number
  dependentsNo = 0
  dependenciesNo = 0

  // marks the nodes of the current instance of the graph, so that the new nodes if any are marked as incremental
  const existingNodes = new Set(filteredGraph.nodes.toArray())
  const fullGraph = filteredGraph.wrappedGraph

  // map that holds which nodes remain in the filtered graph and which not
  if (filteredNodes) {
    filteredNodes.clear()
  } else {
    filteredNodes = new Set()
  }

  // map that holds which edge remain in the filtered graph and which not
  if (filteredEdges) {
    filteredEdges.clear()
  } else {
    filteredEdges = new Set()
  }

  startNode = clickedNode

  // take all in-edges and mark the other endpoint as a neighbor of clickedNode
  fullGraph.inEdgesAt(clickedNode).forEach((edge) => {
    const oppositeNode = edge.opposite(clickedNode)
    // we have to check if the node is already taken into consideration in the calculation of dependents
    if (!filteredNodes.has(oppositeNode)) {
      filteredNodes.add(oppositeNode)
      dependentsNo++
    }
  })

  filteredNodes.add(clickedNode)
  collectConnectedNodes(clickedNode, fullGraph, true)
  collectConnectedNodes(clickedNode, fullGraph, false)

  filteredGraph.nodePredicateChanged()
  filteredGraph.edgePredicateChanged()

  // check if new nodes are inserted in the graph
  if (existingNodes) {
    fullGraph.nodes.forEach((node) => {
      if (!existingNodes.has(node)) {
        incrementalNodes.push(node)
      }
    })
  }

  if (algorithmComboBox.value !== 'original-graph') {
    applyAlgorithm()
  }
  return applyLayout(true)
}

/**
 * Collects and changes the visible state of the nodes/edges connected to the given node,
 * recursively. Depending on the out-parameter dependents or dependencies are collected.
 * @param initialNode The node to start collecting of nodes.
 * @param graph The graph.
 * @param out whether or not to collect dependents or dependencies.
 */
function collectConnectedNodes(initialNode, graph, out) {
  // recursively collect all children of the successors of the clicked node
  const stack = []
  stack.push(initialNode)
  while (stack.length > 0) {
    const node = stack.pop()
    const edges = out ? graph.outEdgesAt(node) : graph.inEdgesAt(node)
    edges.forEach((edge) => {
      filteredEdges.add(edge)
      const oppositeNode = edge.opposite(node)
      stack.push(oppositeNode)
      // we have to check if the node is already taken into consideration in the calculation of dependencies
      if (!filteredNodes.has(oppositeNode)) {
        filteredNodes.add(oppositeNode)
        if (out) {
          dependenciesNo++
        } else {
          dependentsNo++
        }
      }
    })
  }
}

/**
 * Resets the graph before applying a different algorithm.
 * Previously added edges are deleted and removed edges are reinserted.
 */
function resetGraph() {
  if (addedEdges.length !== 0) {
    addedEdges.forEach((edge) => filteredGraph.remove(edge))

    addedEdges = []
  }

  removedEdgesSet = null
  filteredGraph.edgePredicateChanged()

  filteredGraph.edges.forEach((edge) => filteredGraph.setStyle(edge, normalEdgeStyle))

  filteredGraph.nodes.forEach((node) => (node.tag.highlight = false))
}

/**
 * Applies the layout to the current graph.
 * @param fromSketchMode `true` if an incremental layout is desired,
 *   `false` otherwise
 */
async function applyLayout(fromSketchMode) {
  // if is in layout or the graph has no nodes then return.
  // it is important to check if nodes === 0, since else Exceptions can occur due to asynchronous
  // calls of this function
  if (filteredGraph.nodes.size === 0 || layoutInProgress) {
    return
  }
  setLayoutInProgress(true)

  // sort nodes by label text
  const nodes = filteredGraph.nodes.toList()
  nodes.sort((node1, node2) => {
    const label1 = node1.labels.get(0).text.toLowerCase()
    const label2 = node2.labels.get(0).text.toLowerCase()

    if (label1 < label2) {
      return -1
    } else if (label1 > label2) {
      return 1
    }
    return 0
  })

  const layoutData = new HierarchicalLayoutData()
  layout.fromSketchMode = fromSketchMode

  if (fromSketchMode) {
    layoutData.incrementalNodes = incrementalNodes.filter((node) => filteredGraph.contains(node))
    layoutData.incrementalEdges = incrementalEdges.filter((edge) => filteredGraph.contains(edge))

    prepareSmoothLayoutAnimation()

    incrementalNodes = []
    incrementalEdges = []
  }

  try {
    await new LayoutExecutor({
      graphComponent,
      layout,
      layoutData,
      animationDuration: '0.5s',
      animateViewport: true,
      portAdjustmentPolicies: PortAdjustmentPolicy.ALWAYS
    }).start()

    // update the graph information with (intermediate) results
    updateGraphInformation(startNode)
    graphComponent.inputMode.itemHoverInputMode.updateHover()
  } finally {
    setLayoutInProgress(false)
  }
}

/**
 * Places newly inserted nodes at the barycenter of their neighbors to avoid that the nodes fly in
 * from the sides.
 */
function prepareSmoothLayoutAnimation() {
  const graph = graphComponent.graph

  // mark the new nodes and place them between their neighbors
  const layout = new PlaceNodesAtBarycenterStage()
  layout.removeBends = true

  const layoutData = new PlaceNodesAtBarycenterStageData({
    affectedNodes: (node) => incrementalNodes.includes(node) && filteredGraph.contains(node)
  })

  graph.applyLayout(layout, layoutData)
}

/**
 * Changes the disabled-state of all UI elements in the toolbar.
 */
function setUIDisabled(disabled) {
  graphComponent.inputMode.waitInputMode.waiting = disabled
  algorithmComboBox.disabled = disabled
  document.querySelector('#show-transitive-edges').disabled = disabled
  document.querySelector('#layout').disabled = disabled
}

/**
 * Updates the table when dependencies are loaded.
 * @param packageNode the start node
 */
function updateGraphInformation(packageNode) {
  const table = document.querySelector('#graph-information')
  table.rows[0].cells[1].innerHTML = packageNode?.labels.at(0)?.text || ''

  // remove the dependents row if the graph is not module
  table.rows[1].classList.remove('row-invisible')
  table.rows[1].cells[1].innerHTML = dependentsNo.toString()
  table.rows[2].cells[1].innerHTML = dependenciesNo.toString()

  // update number of graph nodes and edges
  table.rows[3].cells[1].innerHTML = filteredGraph.nodes.size.toString()
  table.rows[4].cells[1].innerHTML = filteredGraph.edges.size.toString()
}

/**
 * Begins an undo edit to encapsulate several changes in one undo/redo steps.
 * @param undoName The undo name.
 * @param redoName The redo name.
 * @see {@link commitUndoEdit}
 */
function beginUndoEdit(undoName, redoName) {
  const compoundEdit = graphComponent.graph.beginEdit(undoName, redoName)
  const tagEdit = graphComponent.graph.beginEdit(
    'undoTags',
    'redoTags',
    filteredGraph.wrappedGraph.nodes,
    () => new TagMementoSupport()
  )

  return { compoundEdit, tagEdit }
}

/**
 * Commits all undo edits contained in the given edit.
 */
function commitUndoEdit(edit) {
  edit.tagEdit.commit()
  edit.compoundEdit.commit()
}

/**
 * An undo unit that handles the undo/redo of the currentItem and all sets that determine whether
 * a node or edge is currently visible (part of the filtered graph).
 */
function createChangedSetUndoUnit() {
  const oldFilteredNodes = filteredNodes ? new Set(filteredNodes) : null
  const oldFilteredEdges = filteredEdges ? new Set(filteredEdges) : null
  const oldRemovedEdges = removedEdgesSet ? new Set(removedEdgesSet) : null
  const oldCurrentItem = graphComponent.currentItem
  const oldStartNode = startNode
  let newFilteredNodes = new Set()
  let newFilteredEdges = new Set()
  let newRemovedEdges = new Set()
  let newCurrentItem = null
  let newStartNode = null

  return IUndoUnit.fromHandler(
    'changedSet',
    () => {
      newFilteredNodes = filteredNodes ? new Set(filteredNodes) : null
      newFilteredEdges = filteredEdges ? new Set(filteredEdges) : null
      newRemovedEdges = removedEdgesSet ? new Set(removedEdgesSet) : null
      newCurrentItem = graphComponent.currentItem
      newStartNode = startNode
      filteredNodes = oldFilteredNodes
      filteredEdges = oldFilteredEdges
      removedEdgesSet = oldRemovedEdges
      startNode = oldStartNode
      graphComponent.currentItem = oldCurrentItem
      filteredGraph.nodePredicateChanged()
      filteredGraph.edgePredicateChanged()
    },
    () => {
      filteredNodes = newFilteredNodes
      filteredEdges = newFilteredEdges
      removedEdgesSet = newRemovedEdges
      startNode = newStartNode
      graphComponent.currentItem = newCurrentItem
      filteredGraph.nodePredicateChanged()
      filteredGraph.edgePredicateChanged()
    }
  )
}

/**
 * A MementoSupport that will handle the state of the node tags (especially pending dependencies)
 * during undo/redo.
 */
class TagMementoSupport extends BaseClass(IMementoSupport) {
  getState(item) {
    if (item instanceof INode) {
      const tag = item.tag
      return { highlight: tag.highlight }
    } else {
      return {}
    }
  }

  applyState(item, state) {
    if (item instanceof INode) {
      item.tag = state
    }
  }

  stateEquals(state1, state2) {
    return state1.highlight === state2.highlight
  }
}

run().then(finishLoading)
