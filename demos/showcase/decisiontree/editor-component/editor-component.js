/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  DefaultLabelStyle,
  GraphEditorInputMode,
  GraphMLSupport,
  HierarchicLayout,
  HierarchicLayoutData,
  InteriorStretchLabelModel,
  LayoutExecutor,
  MinimumNodeSizeStage,
  NodeStyleDecorationInstaller,
  ShapeNodeStyle,
  Size
} from 'yfiles'
import { initDemoStyles } from 'demo-resources/demo-styles'
import { configureContextMenu } from './context-menu.js'
import { GroupNodePortCandidateProvider } from './GroupNodePortCandidateProvider.js'
import { updateButtonState } from '../switch-components-button/switch-components-button.js'

/** @type {INode} */
let rootNode

/** @type {GraphMLSupport} */
let graphMLSupport

/**
 * Indicates whether a layout calculation is currently running
 * @type {boolean}
 */
let runningLayout = false

/**
 * Configures the editor component.
 * Event listeners are registered, highlights are added, and node and edge styling is specified.
 * Also, a context menu is added.
 * @param {!GraphComponent} graphComponent
 */
export function initializeEditorComponent(graphComponent) {
  // initialize the input mode
  initializeInputModes(graphComponent)

  // configures a green outline as custom highlight for the root node of the decision tree
  // see also setAsRootNode action
  graphComponent.graph.decorator.nodeDecorator.highlightDecorator.setImplementation(
    (node) => node === rootNode,
    new NodeStyleDecorationInstaller({
      nodeStyle: new ShapeNodeStyle({
        fill: null,
        stroke: '5px rgb(0, 153, 51)'
      }),
      zoomPolicy: 'world-coordinates',
      margins: 1.5
    })
  )

  // initialize the context menu
  configureContextMenu(graphComponent, setAsRootNode)

  // initialize the graph
  initializeGraph(graphComponent.graph)

  // enable GraphML support
  enableGraphML(graphComponent)

  // wire-up layout button
  document.querySelector('#layout').addEventListener('click', () => runLayout(graphComponent, true))
}

/**
 * Initializes default styles and behavior for the given graph.
 * @param {!IGraph} graph
 */
function initializeGraph(graph) {
  // set up the default demo styles
  initDemoStyles(graph)

  // set a default size for nodes
  graph.nodeDefaults.size = new Size(146, 35)
  graph.nodeDefaults.shareStyleInstance = false

  // and a style for the labels
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    wrapping: 'character-ellipsis',
    verticalTextAlignment: 'center',
    horizontalTextAlignment: 'center'
  })
  graph.nodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.CENTER

  // provide a single port at the top of the node for group nodes
  graph.decorator.nodeDecorator.portCandidateProviderDecorator.setFactory(
    (node) => graph.isGroupNode(node),
    (node) => new GroupNodePortCandidateProvider(node)
  )
}

/**
 * Creates an editor mode and registers it as the GraphComponent's input mode.
 * @param {!GraphComponent} graphComponent
 */
function initializeInputModes(graphComponent) {
  // Create an editor input mode
  const graphEditorInputMode = new GraphEditorInputMode()
  graphEditorInputMode.allowGroupingOperations = true

  // refresh the graph layout after an edge has been created
  graphEditorInputMode.createEdgeInputMode.addEdgeCreatedListener(async (_, evt) => {
    await runLayout(graphComponent, true, [evt.item.sourceNode, evt.item.targetNode])
  })

  // add listeners for the insertion/deletion of nodes to enable the button for returning to the decision tree
  graphEditorInputMode.addDeletedSelectionListener(() => updateButtonState(graphComponent))
  graphEditorInputMode.addNodeCreatedListener(() => updateButtonState(graphComponent))

  graphComponent.inputMode = graphEditorInputMode
}

/**
 * Sets the given node as root node for the decision tree.
 * @param {!GraphComponent} graphComponent
 * @param {!INode} [node]
 */
export function setAsRootNode(graphComponent, node) {
  rootNode = node

  // highlight the new root node
  const highlightManager = graphComponent.highlightIndicatorManager
  highlightManager.clearHighlights()
  if (node) {
    highlightManager.addHighlight(node)
  }
}

/**
 * @returns {!INode}
 */
export function getRootNode() {
  return rootNode
}

/**
 * Calculate a new layout for the demo's model graph.
 * @param {!GraphComponent} graphComponent
 * @param {boolean} animated
 * @param {!Array.<INode>} [incrementalNodes]
 * @returns {!Promise}
 */
async function runLayout(graphComponent, animated, incrementalNodes) {
  if (runningLayout) {
    return
  }

  setLayoutRunning(true, graphComponent)

  const layout = new HierarchicLayout({
    layoutMode: incrementalNodes ? 'incremental' : 'from-scratch',
    backLoopRouting: true
  })
  layout.nodePlacer.barycenterMode = false

  const layoutData = new HierarchicLayoutData()
  if (incrementalNodes) {
    // configure the incremental hints
    layoutData.incrementalHints.incrementalLayeringNodes = incrementalNodes
  }

  const layoutExecutor = new LayoutExecutor({
    graphComponent,
    layout: new MinimumNodeSizeStage(layout),
    layoutData,
    duration: animated ? '0.3s' : '0s',
    animateViewport: true
  })
  try {
    await layoutExecutor.start()
  } finally {
    setLayoutRunning(false, graphComponent)
  }
}

/**
 * Enables loading and saving the demo's model graph from and to GraphML.
 * @param {!GraphComponent} graphComponent
 */
function enableGraphML(graphComponent) {
  graphMLSupport = new GraphMLSupport({
    graphComponent,
    storageLocation: 'file-system'
  })

  // update the toggle button in case an empty graphml was imported
  graphMLSupport.graphMLIOHandler.addParsedListener(() => updateButtonState(graphComponent))
}

/**
 * Reads the sample graph corresponding to the currently selected name from the demo's sample combobox.
 * @returns {!Promise.<IGraph>} the graph when it is imported completely.
 * @param {!GraphComponent} graphComponent
 */
export async function readSampleGraph(graphComponent) {
  // first derive the file name
  const selectedItem = document.querySelector('#samples').selectedOptions.item(0)
  const fileName = `resources/samples/${selectedItem.value}.graphml`
  // then load the graph
  const graph = await graphMLSupport.graphMLIOHandler.readFromURL(graphComponent.graph, fileName)
  // when done - fit the bounds
  graphComponent.fitGraphBounds()
  return graph
}

/**
 * Updates the demo's UI depending on whether a layout is currently calculated.
 * @param {boolean} running true indicates that a layout is currently calculated
 * @param {!GraphComponent} graphComponent the editor graph component
 */
function setLayoutRunning(running, graphComponent) {
  runningLayout = running
  graphComponent.inputMode.waitInputMode.waiting = running
  document.querySelectorAll('#editor-toolbar Button').forEach((button) => {
    button.disabled = running
  })
}
