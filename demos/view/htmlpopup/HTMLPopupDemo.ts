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
  ModifierKeys,
  Point,
  StorageLocation
} from 'yfiles'

import HTMLPopupSupport from './HTMLPopupSupport'
import { bindCommand, readGraph, showApp } from '../../resources/demo-app'
import { fetchLicense } from '../../resources/fetch-license'

/**
 * Runs the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('graphComponent')

  initializeInputMode(graphComponent)

  initializePopups(graphComponent)

  readSampleGraph(graphComponent)

  registerCommands(graphComponent)

  showApp(graphComponent)
}

/**
 * Creates the pop-ups for nodes and edges and adds the event listeners that show and hide these pop-ups.
 *
 * Since we want to show only one pop-up at any time, we bind it to the current item of the graph component.
 */
function initializePopups(graphComponent: GraphComponent): void {
  // Creates a label model parameter that is used to position the node pop-up
  const nodeLabelModel = new ExteriorLabelModel({ insets: 10 })

  // Creates the pop-up for the node pop-up template
  const nodePopup = new HTMLPopupSupport(
    graphComponent,
    getDiv('nodePopupContent'),
    nodeLabelModel.createParameter(ExteriorLabelModelPosition.NORTH)
  )

  // Creates the edge pop-up for the edge pop-up template with a suitable label model parameter
  // We use the EdgePathLabelModel for the edge pop-up
  const edgeLabelModel = new EdgePathLabelModel({ autoRotation: false })

  // Creates the pop-up for the edge pop-up template
  const edgePopup = new HTMLPopupSupport(
    graphComponent,
    getDiv('edgePopupContent'),
    edgeLabelModel.createDefaultParameter()
  )

  // The following works with both GraphEditorInputMode and GraphViewerInputMode
  const inputMode = graphComponent.inputMode as GraphViewerInputMode

  // The pop-up is shown for the currentItem thus nodes and edges should be focusable
  inputMode.focusableItems = GraphItemTypes.NODE | GraphItemTypes.EDGE

  // Register a listener that shows the pop-up for the currentItem
  graphComponent.addCurrentItemChangedListener((sender, args) => {
    const item = graphComponent.currentItem
    if (item instanceof INode) {
      // update data in node pop-up
      updateNodePopupContent(nodePopup, item)
      // open node pop-up and hide edge pop-up
      nodePopup.currentItem = item
      edgePopup.currentItem = null
    } else if (item instanceof IEdge) {
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

  // On clicks on empty space, set currentItem to `null` to hide the pop-ups
  inputMode.addCanvasClickedListener((sender, args) => {
    graphComponent.currentItem = null
  })

  // On press of the ESCAPE key, set currentItem to `null` to hide the pop-ups
  inputMode.keyboardInputMode.addKeyBinding(
    Key.ESCAPE,
    ModifierKeys.NONE,
    (command: ICommand, parameter: object, source: object) => {
      ;(source as GraphComponent).currentItem = null
      return true
    }
  )
}

/**
 * Returns the HTMLDivElement with the given ID.
 */
function getDiv(id: string): HTMLDivElement {
  return document.getElementById(id) as HTMLDivElement
}

/**
 * Updates the node pop-up content with the elements from the node's tag.
 */
function updateNodePopupContent(nodePopup: HTMLPopupSupport, node: INode): void {
  // get business data from node tag
  const data = node.tag

  // get all divs in the pop-up
  const divs = nodePopup.div.getElementsByTagName('div')
  for (let i = 0; i < divs.length; i++) {
    const div = divs.item(i)!
    if (div.hasAttribute('data-id')) {
      // if div has a 'data-id' attribute, get content from the business data
      const id = div.getAttribute('data-id') || ''
      div.textContent = data[id]
    }
  }
  // set image url
  const img = nodePopup.div.getElementsByTagName('img').item(0)!
  img.setAttribute('src', `resources/${data.icon}.svg`)
}

/**
 * Updates the edge pop-up content with the elements from the edge's tag.
 */
function updateEdgePopupContent(edgePopup: HTMLPopupSupport, edge: IEdge): void {
  // get business data from node tags
  const sourceData = edge.sourcePort!.owner!.tag
  const targetData = edge.targetPort!.owner!.tag

  // get all divs in the pop-up
  const divs = edgePopup.div.getElementsByTagName('div')
  for (let i = 0; i < divs.length; i++) {
    const div = divs.item(i)!
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
async function readSampleGraph(graphComponent: GraphComponent): Promise<void> {
  // Enables the graphml support
  const gs = new GraphMLSupport({
    graphComponent,
    // configure to load and save to the file system
    storageLocation: StorageLocation.FILE_SYSTEM
  })
  await readGraph(gs.graphMLIOHandler, graphComponent.graph, 'resources/sample.graphml')
  graphComponent.fitGraphBounds()
}

/**
 * Creates a viewer input mode for the graphComponent of this demo.
 */
function initializeInputMode(graphComponent: GraphComponent): void {
  const mode = new GraphViewerInputMode({
    toolTipItems: GraphItemTypes.NODE,
    selectableItems: GraphItemTypes.NONE,
    marqueeSelectableItems: GraphItemTypes.NONE
  })

  mode.mouseHoverInputMode.toolTipLocationOffset = new Point(10, 10)
  mode.addQueryItemToolTipListener((sender, args) => {
    if (args.item instanceof INode && !args.handled) {
      const nodeName = args.item.tag.name
      if (nodeName) {
        args.toolTip = nodeName
        args.handled = true
      }
    }
  })

  graphComponent.inputMode = mode
}

/**
 * Binds commands to the demo's UI controls.
 */
function registerCommands(graphComponent: GraphComponent): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}

// noinspection JSIgnoredPromiseFromCall
run()
