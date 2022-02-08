/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GraphComponent,
  GraphEditorInputMode,
  GraphMLSupport,
  ICommand,
  IGraph,
  INode,
  License,
  ModifierKeys,
  MouseEventArgs,
  MouseEventTypes,
  Point,
  Rect,
  Size,
  StorageLocation
} from 'yfiles'

import { bindCommand, checkLicense, showApp } from '../../resources/demo-app'
import loadJson from '../../resources/load-json'
import { DraggableGraphComponent, NodeDragInputMode } from './NodeDragInputMode'
import {
  createDemoNodeLabelStyle,
  DemoNodeStyle,
  initDemoStyles
} from '../../resources/demo-styles'

let graphComponent: GraphComponent = null!

/**
 * Bootstraps the demo.
 */
function run(licenseData: object): void {
  License.value = licenseData
  // initialize graph component
  graphComponent = new DraggableGraphComponent('#graphComponent')

  // initialize the input modes and the Drag and Drop
  configureInputModes(graphComponent)

  // configure default styles and create a sample graph
  initDefaultStyles(graphComponent.graph)
  createGraph(graphComponent.graph)
  graphComponent.fitGraphBounds()

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Configures drag and drop for this tutorial.
 */
function configureInputModes(graphComponent: GraphComponent): void {
  const mode = new GraphEditorInputMode()

  // edge creation: start with drag + shift down
  // since drag without shift will start dragging a node from the component
  mode.createEdgeInputMode.prepareRecognizer = (eventSource, evt) =>
    evt instanceof MouseEventArgs &&
    evt.eventType == MouseEventTypes.DOWN &&
    evt.modifiers == ModifierKeys.SHIFT

  // move nodes: start with drag + shift down
  // so dragging a selected node without shift will start dragging a node from the component
  mode.moveInputMode.pressedRecognizer = (eventSource, evt) =>
    evt instanceof MouseEventArgs &&
    evt.eventType == MouseEventTypes.DOWN &&
    evt.modifiers == ModifierKeys.SHIFT

  // configure dragging from the component
  const dragMode = new NodeDragInputMode()
  // lower priority than moveInputMode, so
  // dragging a selected node moves it
  // dragging an unselected node starts drag and drop
  dragMode.priority = mode.moveInputMode.priority + 1
  mode.add(dragMode)

  // configure the drop targets to handle the item drop

  // target #1: the list
  const list = document.getElementById('drop-list') as HTMLDivElement
  dragMode.addDropTarget(list, (evt, node) => {
    if (node) {
      addDroppedItemToList(node, list)
    }
  })

  // target #2: the trashcan
  const trashcan = document.getElementById('drop-trashcan')!
  dragMode.addDropTarget(trashcan, (evt, node) => {
    if (node) {
      graphComponent.graph.remove(node)
    }
  })

  // install the input mode
  graphComponent.inputMode = mode
  // enable undo and redo commands
  graphComponent.graph.undoEngineEnabled = true
}

/**
 * Adds the given node to the list.
 */
function addDroppedItemToList(node: INode, list: HTMLDivElement): void {
  const dropHere = document.getElementById('drop-here')!
  dropHere.setAttribute('hidden', 'true')
  const item = document.createElement('div')
  item.setAttribute('class', 'drop-item')
  item.setAttribute('draggable', 'false')
  // add an image which represents the node
  item.appendChild(NodeDragInputMode.createNodeImage(node))
  list.appendChild(item)
}

/**
 * Initializes the defaults for the styles in this demo.
 */
function initDefaultStyles(graph: IGraph): void {
  initDemoStyles(graph, {
    node: 'demo-orange',
    edge: 'demo-orange'
  })

  graph.nodeDefaults.size = new Size(70, 50)
}

/**
 * Creates a simple sample graph.
 */
function createGraph(graph: IGraph): void {
  const orange = new DemoNodeStyle('demo-orange')
  const orangeLabel = createDemoNodeLabelStyle('demo-orange')
  const red = new DemoNodeStyle('demo-red')
  const redLabel = createDemoNodeLabelStyle('demo-red')
  const blue = new DemoNodeStyle('demo-blue')
  const blueLabel = createDemoNodeLabelStyle('demo-blue')

  const n1 = graph.createNodeAt({
    location: new Point(50, 50),
    style: red,
    labels: [{ text: 'Red 1', style: redLabel }]
  })
  const n2 = graph.createNodeAt({
    location: new Point(150, 50),
    style: red,
    labels: [{ text: 'Red 2', style: redLabel }]
  })
  const n3 = graph.createNode({
    layout: new Rect(260, 180, 80, 40),
    style: orange,
    labels: [{ text: 'Orange 1', style: orangeLabel }]
  })

  const n4 = graph.createNodeAt({
    location: new Point(50, -50),
    style: orange,
    labels: [{ text: 'Orange 2', style: orangeLabel }]
  })
  const n5 = graph.createNodeAt({
    location: new Point(50, -150),
    style: orange,
    labels: [{ text: 'Orange 3', style: orangeLabel }]
  })
  const n6 = graph.createNodeAt({
    location: new Point(-50, -50),
    style: blue,
    labels: [{ text: 'Blue 1', style: blueLabel }]
  })
  const n7 = graph.createNodeAt({
    location: new Point(-50, -150),
    style: blue,
    labels: [{ text: 'Blue 2', style: blueLabel }]
  })
  graph.createNodeAt({
    location: new Point(150, -50),
    style: orange,
    labels: [{ text: 'Orange 4', style: orangeLabel }]
  })

  graph.createEdge(n1, n2)
  const edge2 = graph.createEdge(n2, n3)
  graph.addBend(edge2, new Point(300, 50))
  graph.createEdge(n1, n3)
  graph.createEdge(n4, n1)
  graph.createEdge(n5, n4)
  graph.createEdge(n7, n6)
  const edge7 = graph.createEdge(n6, n1)
  graph.addBend(edge7, new Point(-50, 50), 0)

  graph.undoEngine!.clear()
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function registerCommands(): void {
  const support = new GraphMLSupport(graphComponent)
  support.storageLocation = StorageLocation.FILE_SYSTEM
  bindCommand("button[data-command='Open']", ICommand.OPEN, graphComponent)

  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
}

// start tutorial
loadJson().then(checkLicense).then(run)
