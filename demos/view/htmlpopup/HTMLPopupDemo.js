/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
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
  Class,
  EdgePathLabelModel,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  GraphComponent,
  GraphItemTypes,
  GraphMLSupport,
  GraphViewerInputMode,
  ICommand,
  IEdge,
  ImageNodeStyle,
  INode,
  Key,
  License,
  Point,
  StorageLocation
} from 'yfiles'

import DemoStyles, { DemoSerializationListener } from '../../resources/demo-styles.js'
import HTMLPopupSupport from './HTMLPopupSupport.js'
import { bindCommand, readGraph, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

// This demo presents how to add a zoom-invariant HTML pop-up component on top of the graph component to display
// additional information for graph items.

/**
 * The demo's graphComponent.
 * @type {GraphComponent}
 */
let graphComponent = null

/**
 * Runs the demo.
 */
function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')
  initializeInputMode()

  initializePopups()

  readSampleGraph()
  registerCommands()

  // Initializes the demo
  showApp(graphComponent)
}

/**
 * Creates the pop-ups for nodes and edges and adds the event listeners that show and hide these pop-ups.
 *
 * Since we want to show only one pop-up at any time, we bind it to the current item of the graph component.
 */
function initializePopups() {
  // Creates a label model parameter that is used to position the node pop-up
  const nodeLabelModel = new ExteriorLabelModel({ insets: 10 })

  // Creates the pop-up for the node pop-up template
  const nodePopup = new HTMLPopupSupport(
    graphComponent,
    window.document.getElementById('nodePopupContent'),
    nodeLabelModel.createParameter(ExteriorLabelModelPosition.NORTH)
  )

  // Creates the edge pop-up for the edge pop-up template with a suitable label model parameter
  // We use the EdgePathLabelModel for the edge pop-up
  const edgeLabelModel = new EdgePathLabelModel({ autoRotation: false })

  // Creates the pop-up for the edge pop-up template
  const edgePopup = new HTMLPopupSupport(
    graphComponent,
    window.document.getElementById('edgePopupContent'),
    edgeLabelModel.createDefaultParameter()
  )

  // The following works with both GraphEditorInputMode and GraphViewerInputMode
  const inputMode = graphComponent.inputMode

  // The pop-up is shown for the currentItem thus nodes and edges should be focusable
  inputMode.focusableItems = GraphItemTypes.NODE | GraphItemTypes.EDGE

  // Register a listener that shows the pop-up for the currentItem
  graphComponent.addCurrentItemChangedListener((sender, args) => {
    const item = graphComponent.currentItem
    if (INode.isInstance(item)) {
      // update data in node pop-up
      updateNodePopupContent(nodePopup, item)
      // open node pop-up and hide edge pop-up
      nodePopup.currentItem = item
      edgePopup.currentItem = null
    } else if (IEdge.isInstance(item)) {
      // update data in edge pop-up
      updateEdgePopupContent(edgePopup, item)
      // open edge pop-up and node edge pop-up
      edgePopup.currentItem = item
      nodePopup.currentItem = null
    } else {
      nodePopup.currentItem = null
      edgePopup.currentItem = null
    }
  })

  // On clicks on empty space, set currentItem to <code>null</code> to hide the pop-ups
  inputMode.addCanvasClickedListener((sender, args) => {
    graphComponent.currentItem = null
  })

  // On press of the ESCAPE key, set currentItem to <code>null</code> to hide the pop-ups
  inputMode.keyboardInputMode.addKeyBinding({
    key: Key.ESCAPE,
    execute: (command, parameter, source) => {
      source.currentItem = null
    }
  })
}

/**
 * Updates the node pop-up content with the elements from the node's tag.
 * @param {HTMLPopupSupport} nodePopup
 * @param {INode} node
 */
function updateNodePopupContent(nodePopup, node) {
  // get business data from node tag
  const data = node.tag

  // get all divs in the pop-up
  const divs = nodePopup.div.getElementsByTagName('div')
  for (let i = 0; i < divs.length; i++) {
    const div = divs.item(i)
    if (div.hasAttribute('data-id')) {
      // if div has a 'data-id' attribute, get content from the business data
      const id = div.getAttribute('data-id')
      div.textContent = data[id]
    }
  }
  // set image url
  const img = nodePopup.div.getElementsByTagName('img').item(0)
  img.setAttribute('src', `resources/${data.icon}.svg`)
}

/**
 * Updates the edge pop-up content with the elements from the edge's tag.
 * @param {HTMLPopupSupport} edgePopup
 * @param {IEdge} edge
 */
function updateEdgePopupContent(edgePopup, edge) {
  // get business data from node tags
  const sourceData = edge.sourcePort.owner.tag
  const targetData = edge.targetPort.owner.tag

  // get all divs in the pop-up
  const divs = edgePopup.div.getElementsByTagName('div')
  for (let i = 0; i < divs.length; i++) {
    const div = divs.item(i)
    if (div.hasAttribute('data-id')) {
      // if div has a 'data-id' attribute, get content from the business data
      const id = div.getAttribute('data-id')
      if (id === 'sourceName') {
        div.textContent = sourceData.name
      } else if (id === 'targetName') {
        div.textContent = targetData.name
      }
    }
  }
}

// We load the 'styles-other' module explicitly to prevent tree-shaking tools from removing this
// dependency which is needed for loading all library styles.
Class.ensure(ImageNodeStyle)

/**
 * Reads the source graph from a graphml file.
 */
async function readSampleGraph() {
  // Enables the graphml support
  const gs = new GraphMLSupport({
    graphComponent,
    // configure to load and save to the file system
    storageLocation: StorageLocation.FILE_SYSTEM
  })
  // enable serialization of the demo styles - without a namespace mapping, serialization will fail
  gs.graphMLIOHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
    DemoStyles
  )
  gs.graphMLIOHandler.addHandleSerializationListener(DemoSerializationListener)

  await readGraph(gs.graphMLIOHandler, graphComponent.graph, 'resources/sample.graphml')
  graphComponent.fitGraphBounds()
}

/**
 * Creates a viewer input mode for the graphComponent of this demo.
 */
function initializeInputMode() {
  const mode = new GraphViewerInputMode({
    toolTipItems: GraphItemTypes.NODE,
    selectableItems: GraphItemTypes.NONE,
    marqueeSelectableItems: GraphItemTypes.NONE
  })

  mode.mouseHoverInputMode.toolTipLocationOffset = new Point(10, 10)
  mode.addQueryItemToolTipListener((sender, args) => {
    if (INode.isInstance(args.item) && !args.handled) {
      const nodeName = args.item.tag.name
      if (nodeName != null) {
        args.toolTip = nodeName
        args.handled = true
      }
    }
  })

  graphComponent.inputMode = mode
}

/**
 * Wires-up the UI.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}

// Starts the demo
loadJson().then(run)
