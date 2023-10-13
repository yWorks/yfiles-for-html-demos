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
  Class,
  DefaultLabelStyle,
  DragDropEffects,
  EdgePathLabelModel,
  EdgeSides,
  ExteriorLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GroupNodeLabelModel,
  GroupNodeStyle,
  HierarchicLayout,
  IGraph,
  INode,
  INodeStyle,
  Insets,
  LayoutExecutor,
  License,
  NodeDropInputMode,
  Rect,
  ShapeNodeShape,
  SimpleNode,
  Size,
  SvgExport
} from 'yfiles'

import {
  applyDemoTheme,
  createDemoShapeNodeStyle,
  initDemoStyles
} from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import graphData from './graph-data.json'

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

  // configures default styles for newly created graph elements
  initializeGraph(graphComponent.graph)

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  Class.ensure(LayoutExecutor)
  graphComponent.graph.applyLayout(
    new HierarchicLayout({ orthogonalRouting: true, minimumLayerDistance: 35 })
  )
  graphComponent.fitGraphBounds()

  // enable now the undo engine to prevent undoing of the graph creation
  graphComponent.graph.undoEngineEnabled = true

  // configure drag and drop
  configureDragAndDrop()
}

/**
 * Creates nodes and edges according to the given data.
 * @param {!IGraph} graph
 * @param {!JSONGraph} graphData
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder.createNodesSource({
    data: graphData.nodeList.filter(item => !item.isGroup),
    id: item => item.id,
    parentId: item => item.parentId
  })

  graphBuilder
    .createGroupNodesSource({
      data: graphData.nodeList.filter(item => item.isGroup),
      id: item => item.id
    })
    .nodeCreator.createLabelBinding(item => item.label)

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: item => item.source,
    targetId: item => item.target
  })

  graphBuilder.buildGraph()
}

/**
 * Configures drag and drop for this demo.
 */
function configureDragAndDrop() {
  // Obtain the input mode for handling dropped nodes from the GraphEditorInputMode.
  const nodeDropInputMode = graphComponent.inputMode.nodeDropInputMode
  // By default the mode available in GraphEditorInputMode is disabled, so first enable it.
  nodeDropInputMode.enabled = true
  // Certain nodes should be created as group nodes. In this case, we distinguish them by their style.
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
  const panel = document.querySelector('#drag-and-drop-panel')

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
      div, // The source of the drag gesture, i.e., the element in the drag and drop panel.
      simpleNode, // The node that is dragged. This is used to provide a preview within the GC during the drag.
      DragDropEffects.ALL, // The allowed actions for this drag.
      true, // Whether to the cursor during the drag.
      dragPreview // The optional preview element that is shown outside the GC during the drag.
    )

    // Within the GraphComponent, it draws its own preview node. Therefore, we need to hide the additional
    // preview element that is used outside the GraphComponent.
    // The GraphComponent uses its own preview node to support features like snap lines or snapping of the dragged node.
    dragSource.addQueryContinueDragListener((_, evt) => {
      if (evt.dropTarget === null) {
        dragPreview.classList.remove('hidden')
      } else {
        dragPreview.classList.add('hidden')
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
    { passive: false }
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
 * Initializes the defaults for the styling in this demo.
 *
 * @param {!IGraph} graph The graph.
 */
function initializeGraph(graph) {
  // set styles for this demo
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

  // set sizes and locations specific for this demo
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 5
  }).createParameter('south')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}

run().then(finishLoading)
