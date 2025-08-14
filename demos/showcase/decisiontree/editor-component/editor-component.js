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
  Arrow,
  GraphEditorInputMode,
  GraphMLIOHandler,
  HierarchicalLayout,
  HierarchicalLayoutData,
  LabelStyle,
  LayoutExecutor,
  NodeStyleIndicatorRenderer,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  Size,
  StretchNodeLabelModel
} from '@yfiles/yfiles'
import { colorSets, initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { configureContextMenu } from './context-menu'
import { GroupNodePortCandidateProvider } from './GroupNodePortCandidateProvider'
import { updateButtonState } from '../switch-components-button/switch-components-button'
import { openGraphML, saveGraphML } from '@yfiles/demo-utils/graphml-support'

let rootNode

const graphMLIOHandler = new GraphMLIOHandler()

/**
 * Indicates whether a layout calculation is currently running
 */
let runningLayout = false

/**
 * Configures the editor component.
 * Event listeners are registered, highlights are added, and node and edge styling is specified.
 * Also, a context menu is added.
 */
export function initializeEditorComponent(graphComponent) {
  // initialize the input mode
  initializeInputModes(graphComponent)

  // configures a green outline as custom highlight for the root node of the decision tree
  // see also setAsRootNode action
  graphComponent.graph.decorator.nodes.highlightRenderer.addConstant(
    (node) => node === rootNode,
    new NodeStyleIndicatorRenderer({
      nodeStyle: new ShapeNodeStyle({ fill: null, stroke: '5px rgb(0, 153, 51)' }),
      zoomPolicy: 'world-coordinates',
      margins: 1.5
    })
  )

  // initialize the context menu
  configureContextMenu(graphComponent, setAsRootNode)

  // initialize the graph
  initializeGraph(graphComponent.graph)

  // update the toggle button in case an empty graphml was imported
  graphMLIOHandler.addEventListener('parsed', () => updateButtonState(graphComponent))

  // wire-up layout buttons
  document.querySelector('#layout').addEventListener('click', () => runLayout(graphComponent, true))
  document.querySelector('#open-file-button').addEventListener('click', async () => {
    await openGraphML(graphComponent, graphMLIOHandler)
  })
  document.querySelector('#save-button').addEventListener('click', async () => {
    await saveGraphML(graphComponent, 'decisionTree.graphml', graphMLIOHandler)
  })
}

/**
 * Initializes default styles and behavior for the given graph.
 */
function initializeGraph(graph) {
  // set up the default demo styles
  initDemoStyles(graph)

  // set a default size for nodes
  graph.nodeDefaults.size = new Size(146, 35)
  graph.nodeDefaults.shareStyleInstance = false

  // and a style for the labels
  graph.nodeDefaults.labels.style = new LabelStyle({
    wrapping: 'wrap-character-ellipsis',
    verticalTextAlignment: 'center',
    horizontalTextAlignment: 'center'
  })
  graph.nodeDefaults.labels.layoutParameter = StretchNodeLabelModel.CENTER

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    smoothingLength: 30,
    targetArrow: new Arrow({
      type: 'triangle',
      stroke: colorSets['demo-palette-44'].stroke,
      fill: colorSets['demo-palette-44'].stroke,
      cropLength: 1
    }),
    stroke: colorSets['demo-palette-44'].stroke
  })

  // provide a single port at the top of the node for group nodes
  graph.decorator.nodes.portCandidateProvider.addFactory(
    (node) => graph.isGroupNode(node),
    (node) => new GroupNodePortCandidateProvider(node)
  )
}

/**
 * Creates an editor mode and registers it as the GraphComponent's input mode.
 */
function initializeInputModes(graphComponent) {
  // Create an editor input mode
  const graphEditorInputMode = new GraphEditorInputMode()

  // refresh the graph layout after an edge has been created
  graphEditorInputMode.createEdgeInputMode.addEventListener('edge-created', async (evt) => {
    await runLayout(graphComponent, true, [evt.item.sourceNode, evt.item.targetNode])
  })

  // add listeners for the insertion/deletion of nodes to enable the button for returning to the decision tree
  graphEditorInputMode.addEventListener('deleted-selection', (args) => {
    if (rootNode && args.items.indexOf(rootNode) > -1) {
      setAsRootNode(graphComponent)
    }
    updateButtonState(graphComponent)
  })
  graphEditorInputMode.addEventListener('node-created', () => updateButtonState(graphComponent))

  graphComponent.inputMode = graphEditorInputMode
}

/**
 * Sets the given node as root node for the decision tree.
 */
export function setAsRootNode(graphComponent, node) {
  rootNode = node

  // highlight the new root node
  const highlights = graphComponent.highlights
  highlights.clear()
  if (node) {
    highlights.add(node)
  }
}

export function getRootNode() {
  return rootNode
}

/**
 * Calculate a new layout for the demo's model graph.
 */
async function runLayout(graphComponent, animated, incrementalNodes) {
  if (runningLayout) {
    return
  }

  setLayoutRunning(true, graphComponent)

  const layout = new HierarchicalLayout({ fromSketchMode: !!incrementalNodes })

  const layoutData = new HierarchicalLayoutData()
  if (incrementalNodes) {
    // configure the incremental hints
    layoutData.incrementalNodes = incrementalNodes
  }

  const layoutExecutor = new LayoutExecutor({
    graphComponent,
    layout,
    layoutData,
    animationDuration: animated ? '0.3s' : '0s',
    animateViewport: true
  })
  try {
    await layoutExecutor.start()
  } finally {
    setLayoutRunning(false, graphComponent)
  }
}

/**
 * Reads the sample graph corresponding to the currently selected name from the demo's sample combobox.
 * @returns the graph when it is imported completely.
 */
export async function readSampleGraph(graphComponent) {
  // first derive the file name
  const selectedItem = document.querySelector('#samples').selectedOptions.item(0)
  const fileName = `resources/samples/${selectedItem.value}.graphml`
  // then load the graph
  const graph = await graphMLIOHandler.readFromURL(graphComponent.graph, fileName)
  // when done - fit the bounds
  await graphComponent.fitGraphBounds()
  return graph
}

/**
 * Updates the demo's UI depending on whether a layout is currently calculated.
 * @param running true indicates that a layout is currently calculated
 * @param graphComponent the editor graph component
 */
function setLayoutRunning(running, graphComponent) {
  runningLayout = running
  graphComponent.inputMode.waitInputMode.waiting = running
  document.querySelectorAll('#editor-toolbar Button').forEach((button) => {
    button.disabled = running
  })
}
