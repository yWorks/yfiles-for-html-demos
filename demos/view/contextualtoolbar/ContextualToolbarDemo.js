/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ArcEdgeStyle,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  GraphComponent,
  GraphEditorInputMode,
  ICommand,
  IEdge,
  IGraph,
  ILabel,
  INode,
  License,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  Size,
  SmartEdgeLabelModel
} from 'yfiles'

import { bindCommand, showApp } from '../../resources/demo-app.js'
import ContextualToolbar from './ContextualToolbar.js'
import loadJson from '../../resources/load-json.js'

/** @type {GraphComponent} */
let graphComponent
/** @type {ContextualToolbar} */
let contextualToolbar

/**
 * @param {!object} licenseData
 */
function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')
  graphComponent.graph.undoEngineEnabled = true

  // initialize the contextual toolbar
  contextualToolbar = new ContextualToolbar(
    graphComponent,
    document.getElementById('contextualToolbar')
  )

  initializeInputMode()
  initializeDefaultStyles(graphComponent.graph)
  createSampleGraph(graphComponent.graph)
  // clear undo queue to prevent the possibility of undoing the sample graph creation
  graphComponent.graph.undoEngine.clear()

  graphComponent.fitGraphBounds()

  registerCommands()

  showApp(graphComponent)
}

/**
 * Initializes the default styles.
 * @param {!IGraph} graph
 */
function initializeDefaultStyles(graph) {
  graph.nodeDefaults.style = new ShapeNodeStyle({
    fill: '#228B22',
    stroke: '#228B22'
  })
  graph.nodeDefaults.size = new Size(45, 45)
  graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 5
  }).createParameter(ExteriorLabelModelPosition.NORTH)

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: 'thick #333',
    targetArrow: '#333 large triangle'
  })
  graph.edgeDefaults.labels.layoutParameter = new SmartEdgeLabelModel().createParameterFromSource(
    0,
    5
  )
}

/**
 * Creates and configures an editor input mode for the GraphComponent of this demo.
 */
function initializeInputMode() {
  const mode = new GraphEditorInputMode()

  // update the contextual toolbar when the selection changes ...
  mode.addMultiSelectionFinishedListener((src, args) => {
    // this implementation of the contextual toolbar only supports nodes, edges and labels
    contextualToolbar.selectedItems = args.selection
      .filter(item => item instanceof INode || item instanceof ILabel || item instanceof IEdge)
      .toArray()
  })
  // ... or when an item is right clicked
  mode.addItemRightClickedListener((src, args) => {
    // this implementation of the contextual toolbar only supports nodes, edges and labels
    graphComponent.selection.clear()
    graphComponent.selection.setSelected(args.item, true)
    contextualToolbar.selectedItems = [args.item]
  })

  graphComponent.inputMode = mode

  // if an item is deselected or deleted, we remove that element from the selectedItems
  graphComponent.selection.addItemSelectionChangedListener((src, args) => {
    if (!args.itemSelected) {
      // remove the element from the selectedItems of the contextual toolbar
      const idx = contextualToolbar.selectedItems.findIndex(item => item === args.item)
      const newSelection = contextualToolbar.selectedItems.slice()
      newSelection.splice(idx, 1)
      contextualToolbar.selectedItems = newSelection
    }
  })
}

/**
 * Wires up the UI toolbar buttons with the graph component.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
}

/**
 * Creates the initial graph.
 * @param {!IGraph} graph
 */
function createSampleGraph(graph) {
  graph.clear()

  const n1 = graph.createNodeAt({
    location: [-130, -150],
    labels: ['Node'],
    style: new ShapeNodeStyle({
      fill: '#DC143C',
      stroke: '#DC143C',
      shape: 'ellipse'
    })
  })
  const n2 = graph.createNodeAt([-70, -80])
  const n3 = graph.createNodeAt({
    location: [0, 0],
    style: new ShapeNodeStyle({
      fill: '#336699',
      stroke: '#336699',
      shape: 'ellipse'
    })
  })
  const n4 = graph.createNodeAt([70, -80])
  const n5 = graph.createNodeAt({
    location: [130, -150],
    labels: ['Node'],
    style: new ShapeNodeStyle({
      fill: '#DC143C',
      stroke: '#DC143C',
      shape: 'ellipse'
    })
  })
  const n6 = graph.createNodeAt([-60, 70])
  const n7 = graph.createNodeAt([-120, 140])
  const n8 = graph.createNodeAt({
    location: [-200, 120],
    labels: ['Node'],
    style: new ShapeNodeStyle({
      fill: '#336699',
      stroke: '#336699',
      shape: 'ellipse'
    })
  })

  graph.createEdge({
    source: n1,
    target: n2,
    labels: ['Edge']
  })
  graph.createEdge(n2, n3)
  graph.createEdge(n3, n4)
  graph.createEdge({
    source: n4,
    target: n5,
    labels: ['Edge']
  })
  graph.createEdge(n3, n6)
  graph.createEdge(n6, n7)
  graph.createEdge({
    source: n7,
    target: n8,
    style: new ArcEdgeStyle({
      height: 50,
      stroke: 'thick #333',
      targetArrow: '#333 large triangle'
    })
  })
}

// Start the demo
loadJson().then(run)
