/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  CanvasComponent,
  DefaultGraph,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphModelManager,
  GroupingNodePositionHandler,
  ICommand,
  INode,
  INodeSizeConstraintProvider,
  IPositionHandler,
  IReshapeHandler,
  ItemCopiedEventArgs,
  ItemEventArgs,
  License,
  NodeSizeConstraintProvider,
  OrthogonalEdgeEditingContext,
  Point,
  Rect,
  Size
} from 'yfiles'

import { bindAction, bindChangeListener, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'
import { initDemoStyles } from '../../resources/demo-styles.js'
import SampleData from './resources/SampleData.js'
import { NonOverlapPositionHandler } from './NonOverlapPositionHandler.js'
import { NonOverlapReshapeHandler } from './NonOverlapReshapeHandler.js'
import { LayoutHelper } from './LayoutHelper.js'
import { HidingEdgeDescriptor } from './HidingEdgeDescriptor.js'
import { SingleSelectionSupport } from './SingleSelectionSupport.js'

/** @type {GraphComponent} */
let graphComponent = null

/**
 * @param {!object} licenseData
 * @returns {!Promise}
 */
async function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('#graphComponent')

  configureModelManager(graphComponent.graphModelManager)
  initializeInputModes()
  await initializeGraph()

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Modifies the {@link GraphModelManager} so that certain edges are hidden.
 * @param {!GraphModelManager} manager
 */
function configureModelManager(manager) {
  manager.edgeDescriptor = new HidingEdgeDescriptor(manager.edgeDescriptor)
}

/**
 * Registers the {@link GraphEditorInputMode} as the {@link CanvasComponent.inputMode}
 * and initializes the marquee input mode that clears the area of the marquee rectangle.
 */
function initializeInputModes() {
  const graph = graphComponent.graph

  // create a GraphEditorInputMode instance
  const editMode = new GraphEditorInputMode()
  graphComponent.inputMode = editMode

  // enable interactive re-parenting
  editMode.allowGroupingOperations = true

  // enable single selection
  new SingleSelectionSupport().enable(graphComponent)

  // enable orthogonal edge editing
  const orthogonalEdgeEditingContext = new OrthogonalEdgeEditingContext()
  editMode.orthogonalEdgeEditingContext = orthogonalEdgeEditingContext

  // disable orthogonal edge editing during node move or resize gestures
  const disableOrthogonalEdgeEditing = () => {
    if (graphComponent.selection.selectedNodes.size > 0) {
      orthogonalEdgeEditingContext.enabled = false
    }
  }
  const enableOrthogonalEdgeEditing = () => {
    orthogonalEdgeEditingContext.enabled = true
  }
  editMode.handleInputMode.addDragStartingListener(disableOrthogonalEdgeEditing)
  editMode.handleInputMode.addDragFinishedListener(enableOrthogonalEdgeEditing)
  editMode.handleInputMode.addDragCanceledListener(enableOrthogonalEdgeEditing)
  editMode.moveInputMode.addDragStartingListener(disableOrthogonalEdgeEditing)
  editMode.moveInputMode.addDragFinishedListener(enableOrthogonalEdgeEditing)
  editMode.moveInputMode.addDragCanceledListener(enableOrthogonalEdgeEditing)

  // use a position handler that avoids overlapping,
  // but only apply it to the selected node and not to the children of groups
  graph.decorator.nodeDecorator.positionHandlerDecorator.setFactory(
    node => {
      return node === graphComponent.selection.selectedNodes.firstOrDefault()
    },
    node => {
      // Lookup the node position handler that only handles the location of the node itself
      const defaultPositionHandler = DefaultGraph.DEFAULT_NODE_LOOKUP.contextLookup(
        node,
        IPositionHandler.$class
      )
      // wrap it in a GroupingNodePositionHandler that moves all child nodes but doesn't update the
      // parent group node bounds
      const handler = new GroupingNodePositionHandler(node, defaultPositionHandler)
      handler.adjustParentNodeLayout = false
      // wrap it in a NonOverlapPositionHandler that removes overlaps during and after the move gesture
      return new NonOverlapPositionHandler(node, handler)
    }
  )

  // use a reshape handler that avoids overlapping
  graph.decorator.nodeDecorator.reshapeHandlerDecorator.setFactory(node => {
    // Lookup the node reshape handler that only reshapes the node itself (and not its parent group node)
    const defaultReshapeHandler = DefaultGraph.DEFAULT_NODE_LOOKUP.contextLookup(
      node,
      IReshapeHandler.$class
    )
    // wrap it in a NonOverlapReshapeHandler that removes overlaps during and after the resize gesture
    return new NonOverlapReshapeHandler(node, defaultReshapeHandler)
  })

  // set a size constraint provider for a minimum node size for all nodes not already providing their own one
  const minimumSize = new Size(5, 5)
  const sizeConstraintProviderDecorator =
    graph.decorator.nodeDecorator.sizeConstraintProviderDecorator
  sizeConstraintProviderDecorator.decorateNulls = true
  sizeConstraintProviderDecorator.setImplementationWrapper((node, provider) => {
    return provider || new NodeSizeConstraintProvider(minimumSize, Size.INFINITE, null)
  })

  // avoid overlapping when creating, pasting or duplicating nodes
  editMode.addNodeCreatedListener((sender, args) => {
    makeSpace(args.item)
  })
  graphComponent.clipboard.fromClipboardCopier.addNodeCopiedListener((sender, args) => {
    // clear the current selection before the layout starts because GraphEditorInputMode cannot
    // do this while the layout is running (the selection is usually cleared after this event)
    graphComponent.selection.clear()
    makeSpace(args.copy)
  })
  graphComponent.clipboard.duplicateCopier.addNodeCopiedListener((sender, args) => {
    // clear the current selection before the layout starts because GraphEditorInputMode cannot
    // do this while the layout is running (the selection is usually cleared after this event)
    graphComponent.selection.clear()
    makeSpace(args.copy)
  })
}

/**
 * Makes space for a new node.
 * @param {INode} node
 * @param {!INode} node
 */
function makeSpace(node) {
  new LayoutHelper(graphComponent, node).layoutImmediately()
}

/**
 * Initializes styles and loads a sample graph.
 */
function initializeGraph() {
  initDemoStyles(graphComponent.graph)
  loadGraph('hierarchic')
}

/**
 * Loads the sample graph associated with the given name
 * @param {!string} sampleName
 */
function loadGraph(sampleName) {
  const data = SampleData[sampleName]

  const graph = graphComponent.graph
  graph.clear()

  const defaultNodeSize = graph.nodeDefaults.size
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: data.nodes,
    id: 'id',
    parentId: 'parentId',
    layout: data => new Rect(data.x, data.y, defaultNodeSize.width, defaultNodeSize.height),
    labels: ['label']
  })
  if (data.groups) {
    builder.createGroupNodesSource({
      data: data.groups,
      id: 'id',
      parentId: 'parentId',
      layout: data => data // the data object itself has x, y, width, height properties
    })
  }
  builder.createEdgesSource(data.edges, 'source', 'target', 'id')

  builder.buildGraph()

  graph.edges.forEach(edge => {
    if (edge.tag.sourcePort) {
      graph.setPortLocation(edge.sourcePort, Point.from(edge.tag.sourcePort))
    }
    if (edge.tag.targetPort) {
      graph.setPortLocation(edge.targetPort, Point.from(edge.tag.targetPort))
    }
    edge.tag.bends.forEach(bend => {
      graph.addBend(edge, Point.from(bend))
    })
  })

  graphComponent.fitGraphBounds()
}

/**
 * Registers commands and actions for the items in the toolbar.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindAction("button[data-command='PreviousSample']", () => {
    const selectedIndex = sampleGraphs.selectedIndex
    if (selectedIndex > 0) {
      sampleGraphs.selectedIndex = selectedIndex - 1
      loadGraph(sampleGraphs.options[sampleGraphs.selectedIndex].value)
      updateButtons(sampleGraphs)
    }
  })
  bindAction("button[data-command='NextSample']", () => {
    const selectedIndex = sampleGraphs.selectedIndex
    if (selectedIndex < sampleGraphs.options.length - 1) {
      sampleGraphs.selectedIndex = selectedIndex + 1
      loadGraph(sampleGraphs.options[sampleGraphs.selectedIndex].value)
      updateButtons(sampleGraphs)
    }
  })

  const sampleGraphs = document.getElementById('sample-graphs')
  bindChangeListener("select[data-command='SelectSampleGraph']", () => {
    const selectedIndex = sampleGraphs.selectedIndex
    const selectedOption = sampleGraphs.options[selectedIndex]
    loadGraph(selectedOption.value)
    updateButtons(sampleGraphs)
  })
}

/**
 * Updates the enabled state of the next- and previous-sample-button according to which sample is currently used.
 * @param {!HTMLSelectElement} sampleGraphs
 */
function updateButtons(sampleGraphs) {
  const selectedIndex = sampleGraphs.selectedIndex
  const previousSample = document.getElementById('previous-sample-button')
  const nextSample = document.getElementById('next-sample-button')
  const maxReached = selectedIndex === sampleGraphs.options.length - 1
  const minReached = selectedIndex === 0
  nextSample.disabled = maxReached
  previousSample.disabled = minReached
}

// start demo
loadJson().then(run)
