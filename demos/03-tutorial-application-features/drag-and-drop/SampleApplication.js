/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  DragDropEffects,
  EdgePathLabelModel,
  EdgeSides,
  ExteriorLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GroupNodeLabelModel,
  GroupNodeStyle,
  ICommand,
  IGraph,
  INode,
  INodeStyle,
  Insets,
  License,
  NodeDropInputMode,
  Point,
  QueryContinueDragEventArgs,
  Rect,
  ShapeNodeShape,
  SimpleNode,
  Size,
  SvgExport
} from 'yfiles'

import {
  addClass,
  bindAction,
  bindCommand,
  removeClass,
  showApp
} from '../../resources/demo-app.js'
import { BrowserDetection } from '../../utils/BrowserDetection.js'
import {
  applyDemoTheme,
  createDemoShapeNodeStyle,
  initDemoStyles
} from '../../resources/demo-styles.js'
import { fetchLicense } from '../../resources/fetch-license.js'

/** @type {GraphComponent} */
let graphComponent

/**
 * Bootstraps the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  // initialize graph component
  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })
  graphComponent.graph.undoEngineEnabled = true

  // configures default styles for newly created graph elements
  initTutorialDefaults(graphComponent.graph)

  // add a sample graph
  createGraph()

  // configure drag and drop
  configureDragAndDrop()

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Configures drag and drop for this tutorial.
 */
function configureDragAndDrop() {
  // Obtain the input mode for handling dropped nodes from the GraphEditorInputMode.
  const nodeDropInputMode = graphComponent.inputMode.nodeDropInputMode
  // By default the mode available in GraphEditorInputMode is disabled, so first enable it.
  nodeDropInputMode.enabled = true
  // Certain nodes should be created as group nodes. In this case we distinguish them by their style.
  nodeDropInputMode.isGroupNodePredicate = draggedNode =>
    draggedNode.style instanceof GroupNodeStyle
  // When dragging the node within the GraphComponent, we want to show a preview of that node.
  nodeDropInputMode.showPreview = true

  initializeDragAndDropPanel()
}

/**
 * Initializes the palette of nodes that can be dragged to the graph component.
 */
function initializeDragAndDropPanel() {
  // retrieve the panel element
  const panel = document.getElementById('drag-and-drop-panel')

  // prepare node styles for the palette
  const defaultNodeStyle = graphComponent.graph.nodeDefaults.style
  const otherNodeStyle = createDemoShapeNodeStyle(ShapeNodeShape.ELLIPSE)

  const defaultGroupNodeStyle = graphComponent.graph.groupNodeDefaults.style
  const nodeStyles = [defaultNodeStyle, otherNodeStyle, defaultGroupNodeStyle]

  // add a visual for each node style to the palette
  nodeStyles.forEach(style => {
    addNodeVisual(style, panel)
  })
}

/**
 * Creates and adds a visual for the given style in the drag and drop panel.
 * @param {!INodeStyle} style
 * @param {!Element} panel
 */
function addNodeVisual(style, panel) {
  // Create the HTML element for the visual.
  const div = document.createElement('div')
  div.setAttribute('style', 'width: 40px; height: 40px; margin: 10px auto; cursor: grab;')
  const img = document.createElement('img')
  img.setAttribute('style', 'width: auto; height: auto;')
  // Create a visual for the style.
  img.setAttribute('src', createNodeVisual(style))

  const startDrag = () => {
    // Create preview node with which the GraphComponent can render a preview during the drag gesture.
    const simpleNode = new SimpleNode()
    simpleNode.layout = new Rect(0, 0, 40, 40)
    simpleNode.style = style.clone()

    // We also want to show a preview of dragged node, while the dragging is not within the GraphComponent.
    // For this, we can provide an element that will be placed at the mouse position during the drag gesture.
    // Of course, this should resemble the node that is currently dragged.
    const dragPreview = document.createElement('div')
    dragPreview.appendChild(img.cloneNode(true))

    // The core method that initiates a drag which is recognized by the GraphComponent.
    const dragSource = NodeDropInputMode.startDrag(
      div, // The source of the drag gesture, i.e. the element in the drag and drop panel.
      simpleNode, // The node that is dragged. This is used to provide a preview within the GC during the drag.
      DragDropEffects.ALL, // The allowed actions for this drag.
      true, // Whether to the cursor during the drag.
      BrowserDetection.pointerEvents ? dragPreview : null // The optional preview element that is shown outside of the GC during the drag.
    )

    // Within the GraphComponent, it draws its own preview node. Therefore, we need to hide the additional
    // preview element that is used outside of the GraphComponent.
    // The GraphComponent uses its own preview node to support features like snap lines or snapping of the dragged node.
    dragSource.addQueryContinueDragListener((src, args) => {
      if (args.dropTarget === null) {
        removeClass(dragPreview, 'hidden')
      } else {
        addClass(dragPreview, 'hidden')
      }
    })
  }

  img.addEventListener(
    'mousedown',
    event => {
      startDrag()
      event.preventDefault()
    },
    false
  )
  img.addEventListener(
    'touchstart',
    event => {
      startDrag()
      event.preventDefault()
    },
    BrowserDetection.passiveEventListeners ? { passive: false } : false
  )
  div.appendChild(img)
  panel.appendChild(div)
}

/**
 * Creates an SVG data string for a node with the given style.
 * @param {!INodeStyle} style
 * @returns {!string}
 */
function createNodeVisual(style) {
  // another GraphComponent is utilized to export a visual of the given style
  const exportComponent = new GraphComponent()
  const exportGraph = exportComponent.graph

  // we create a node in this GraphComponent that should be exported as SVG
  exportGraph.createNode(new Rect(0, 0, 40, 40), style)
  exportComponent.updateContentRect(new Insets(5))

  // the SvgExport can export the content of any GraphComponent
  const svgExport = new SvgExport(exportComponent.contentRect)
  const svg = svgExport.exportSvg(exportComponent)
  const svgString = SvgExport.exportSvgString(svg)
  return SvgExport.encodeSvgDataUrl(svgString)
}

/**
 * Initializes the defaults for the styling in this tutorial.
 *
 * @param {!IGraph} graph The graph.
 */
function initTutorialDefaults(graph) {
  // set styles that are the same for all tutorials
  initDemoStyles(graph)

  // set the style, label and label parameter for group nodes
  graph.groupNodeDefaults.style = new GroupNodeStyle({
    tabFill: '#46a8d5',
    tabPosition: 'top-leading',
    contentAreaFill: '#b5dcee'
  })
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'left',
    textFill: '#eee'
  })
  graph.groupNodeDefaults.labels.layoutParameter =
    new GroupNodeLabelModel().createDefaultParameter()

  // set sizes and locations specific for this tutorial
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 5
  }).createParameter('south')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}

/**
 * Creates a simple sample graph.
 */
function createGraph() {
  const graph = graphComponent.graph

  const node1 = graph.createNodeAt([110, 20])
  const node2 = graph.createNodeAt([145, 95])
  const node3 = graph.createNodeAt([75, 95])
  const node4 = graph.createNodeAt([30, 175])
  const node5 = graph.createNodeAt([100, 175])

  graph.groupNodes({ children: [node1, node2, node3], labels: ['Group 1'] })

  const edge1 = graph.createEdge(node1, node2)
  const edge2 = graph.createEdge(node1, node3)
  const edge3 = graph.createEdge(node3, node4)
  const edge4 = graph.createEdge(node3, node5)
  const edge5 = graph.createEdge(node1, node5)
  graph.setPortLocation(edge1.sourcePort, new Point(123.33, 40))
  graph.setPortLocation(edge1.targetPort, new Point(145, 75))
  graph.setPortLocation(edge2.sourcePort, new Point(96.67, 40))
  graph.setPortLocation(edge2.targetPort, new Point(75, 75))
  graph.setPortLocation(edge3.sourcePort, new Point(65, 115))
  graph.setPortLocation(edge3.targetPort, new Point(30, 155))
  graph.setPortLocation(edge4.sourcePort, new Point(85, 115))
  graph.setPortLocation(edge4.targetPort, new Point(90, 155))
  graph.setPortLocation(edge5.sourcePort, new Point(110, 40))
  graph.setPortLocation(edge5.targetPort, new Point(110, 155))
  graph.addBends(edge1, [new Point(123.33, 55), new Point(145, 55)])
  graph.addBends(edge2, [new Point(96.67, 55), new Point(75, 55)])
  graph.addBends(edge3, [new Point(65, 130), new Point(30, 130)])
  graph.addBends(edge4, [new Point(85, 130), new Point(90, 130)])

  graphComponent.fitGraphBounds()
  graph.undoEngine.clear()
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function registerCommands() {
  bindAction("button[data-command='New']", () => {
    graphComponent.graph.clear()
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  })
  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
  bindCommand("button[data-command='GroupSelection']", ICommand.GROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='UngroupSelection']", ICommand.UNGROUP_SELECTION, graphComponent)
}

// noinspection JSIgnoredPromiseFromCall
run()
