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
  EdgePathLabelModel,
  ExteriorNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  IEdge,
  ImageNodeStyle,
  INode,
  License,
  ModifierKeys,
  Point,
  PolylineEdgeStyle
} from '@yfiles/yfiles'

import { HTMLPopupSupport } from './HTMLPopupSupport'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'
import graphData from './resources/graph-data.json'

/**
 * A type that describes an Employee.
 */
type Employee = {
  position?: string
  name?: string
  email?: string
  phone?: string
  businessUnit?: string
  icon?: string
}

/**
 * Runs the demo.
 */
async function run(): Promise<void> {
  License.value = licenseData

  const graphComponent = new GraphComponent('graphComponent')
  initializeInputMode(graphComponent)

  initializePopups(graphComponent)

  buildGraph(graphComponent)
}

/**
 * Creates the pop-ups for nodes and edges and adds the event listeners that show and hide these pop-ups.
 *
 * Since we want to show only one pop-up at any time, we bind it to the current item of the graph component.
 */
function initializePopups(graphComponent: GraphComponent): void {
  // Creates a label model parameter that is used to position the node pop-up
  const nodeLabelModel = new ExteriorNodeLabelModel({ margins: 10 })

  // Creates the pop-up for the node pop-up template
  const nodePopup = new HTMLPopupSupport<INode>(
    graphComponent,
    getDiv('#nodePopupContent'),
    nodeLabelModel.createParameter('top')
  )

  // Creates the edge pop-up for the edge pop-up template with a suitable label model parameter
  // We use the EdgePathLabelModel for the edge pop-up
  const edgeLabelModel = new EdgePathLabelModel({ autoRotation: false })

  // Creates the pop-up for the edge pop-up template
  const edgePopup = new HTMLPopupSupport<IEdge>(
    graphComponent,
    getDiv('#edgePopupContent'),
    edgeLabelModel.createRatioParameter()
  )

  // The following works with both GraphEditorInputMode and GraphViewerInputMode
  const inputMode = graphComponent.inputMode as GraphViewerInputMode

  // The pop-up is shown for the currentItem thus nodes and edges should be focusable
  inputMode.focusableItems = GraphItemTypes.NODE | GraphItemTypes.EDGE

  // Register a listener that shows the pop-up for the currentItem
  graphComponent.addEventListener('current-item-changed', () => {
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
  inputMode.addEventListener('canvas-clicked', () => {
    graphComponent.currentItem = null
  })

  // On press of the ESCAPE key, set currentItem to `null` to hide the pop-ups
  inputMode.keyboardInputMode.addKeyBinding('Escape', ModifierKeys.NONE, () => {
    graphComponent.currentItem = null
  })
}

/**
 * Returns the HTMLDivElement with the given ID.
 */
function getDiv(id: string): HTMLDivElement {
  return document.querySelector<HTMLDivElement>(id)!
}

/**
 * Updates the node pop-up content with the elements from the node's tag.
 */
function updateNodePopupContent(nodePopup: HTMLPopupSupport<INode>, node: INode): void {
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
function updateEdgePopupContent(edgePopup: HTMLPopupSupport<IEdge>, edge: IEdge): void {
  // get business data from node tags
  const sourceData = edge.sourcePort.owner.tag
  const targetData = edge.targetPort.owner.tag

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

/**
 * Iterates through the given data set and creates nodes and edges according to the given data.
 */
function buildGraph(graphComponent: GraphComponent): void {
  const graphBuilder = new GraphBuilder(graphComponent.graph)

  const nodesSource = graphBuilder.createNodesSource({
    data: graphData.nodeList,
    id: (item) => item.id,
    layout: (item) => item.layout,
    tag: (item) => item.tag
  })
  nodesSource.nodeCreator.styleProvider = (item) =>
    new ImageNodeStyle(`./resources/${(item.tag as Employee).icon}.svg`)

  const edgeSource = graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })
  edgeSource.edgeCreator.defaults.style = new PolylineEdgeStyle({ targetArrow: 'none' })

  graphBuilder.buildGraph()

  void graphComponent.fitGraphBounds()
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

  // As the selection is deactivated, the focused item is highlighted instead
  graphComponent.focusIndicatorManager.showFocusPolicy = 'when-focused'

  mode.toolTipInputMode.toolTipLocationOffset = new Point(10, 10)
  mode.addEventListener('query-item-tool-tip', (evt) => {
    if (evt.item instanceof INode && !evt.handled) {
      const nodeName = evt.item.tag.name
      if (nodeName) {
        evt.toolTip = nodeName
        evt.handled = true
      }
    }
  })

  graphComponent.inputMode = mode
}

run().then(finishLoading)
