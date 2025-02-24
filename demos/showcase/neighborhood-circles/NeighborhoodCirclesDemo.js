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
  Font,
  GraphBuilder,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  ImageNodeStyle,
  InteriorNodeLabelModel,
  LabelStyle,
  License,
  NodeStyleIndicatorRenderer,
  OrganicLayout,
  Rect,
  ShapeNodeStyle,
  Size,
  StyleIndicatorZoomPolicy,
  SvgVisual
} from '@yfiles/yfiles'
import { getApplyLayoutCallback } from './apply-layout-callback'
import { getBuildGraphCallback } from './build-graph-callback'
import { NeighborhoodType } from './NeighborhoodType'
import { NeighborhoodView } from '../neighborhood/NeighborhoodView'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { addNavigationButtons, finishLoading } from '@yfiles/demo-resources/demo-page'
import graphData from './resources/graph-data.json'
async function run() {
  License.value = await fetchLicense()
  // initialize a GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  graphComponent.inputMode = createInputMode()
  // configure a vivid selection indicator and some default styling for graph items
  initializeSelectionIndicator(graphComponent)
  initDemoStyles(graphComponent.graph)
  graphComponent.focusIndicatorManager.enabled = false
  // create and configure the NeighborhoodView component
  const neighborhoodView = createNeighborhoodView(graphComponent)
  // then build the graph with the given data set
  buildGraph(graphComponent.graph, graphData)
  graphComponent.graph.applyLayout(
    new OrganicLayout({
      defaultMinimumNodeDistance: 60,
      avoidNodeEdgeOverlap: true
    })
  )
  await graphComponent.fitGraphBounds()
  //pre-select a node to show its neighborhood
  graphComponent.selection.clear()
  const node = graphComponent.graph.nodes.at(0)
  if (node) {
    graphComponent.selection.add(node)
  }
  // wire up the UI elements of this demo
  initializeUI(neighborhoodView)
}
/**
 * Iterates through the given data set and creates nodes and edges according to the given data.
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)
  const nodesSource = graphBuilder.createNodesSource({
    data: graphData.nodeList,
    id: (item) => item.id,
    parentId: (item) => item.parentId
  })
  nodesSource.nodeCreator.styleProvider = (item) =>
    new ImageNodeStyle(`./resources/${item.tag}.svg`)
  nodesSource.nodeCreator.createLabelBinding((item) => item.label)
  nodesSource.nodeCreator.defaults.size = new Size(48, 48)
  nodesSource.nodeCreator.defaults.labels.style = new LabelStyle({
    textFill: '#000000',
    backgroundFill: '#ffffffb0',
    font: new Font({
      fontFamily: 'Arial',
      fontSize: 10
    }),
    padding: 2
  })
  nodesSource.nodeCreator.defaults.labels.layoutParameter = InteriorNodeLabelModel.BOTTOM
  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })
  graphBuilder.buildGraph()
}
/**
 * Creates a neighborhood view component associated to the graph of the given graph component.
 */
function createNeighborhoodView(graphComponent) {
  let layoutCircleInfo = []
  const neighborhoodView = new NeighborhoodView('#neighborhood-graph-component')
  neighborhoodView.applyNeighborhoodLayout = getApplyLayoutCallback((_, circles) => {
    layoutCircleInfo = circles
  })
  neighborhoodView.buildNeighborhoodGraph = getBuildGraphCallback(NeighborhoodType.NEIGHBORHOOD, 1)
  neighborhoodView.graphComponent = graphComponent
  // mirror navigation in the neighborhood view to the demo's main GraphComponent
  neighborhoodView.clickCallback = (node) => {
    graphComponent.selection.clear()
    graphComponent.selection.add(node)
  }
  neighborhoodView.onNeighborhoodUpdated = (view) => {
    // show the circles on which the neighborhood nodes have been arranged (unless the neighborhood
    // graph is empty)
    const isEmpty = view.neighborhoodGraph.nodes.size < 1
    updateNeighborhoodBackground(view, isEmpty ? [] : layoutCircleInfo)
    // ensure the neighborhood graph and the circle visualizations in the neighborhood view's
    // background fit inside the neighborhood graph component
    fitGraphAndBackground(view.neighborhoodComponent, layoutCircleInfo)
  }
  return neighborhoodView
}
/**
 * Updates the view port of the given graph component to show its graph as well as the circle
 * visualizations corresponding to the given circle information.
 */
function fitGraphAndBackground(graphComponent, circles) {
  const margin = 5
  if (circles.length > 0) {
    graphComponent.updateContentBounds(margin)
    const strokeRadius = 5
    let bounds = graphComponent.contentBounds
    for (const info of circles) {
      if (info.radius > 0) {
        const c = info.center
        const r = info.radius + margin + strokeRadius
        bounds = Rect.add(bounds, new Rect(c.x - r, c.y - r, 2 * r, 2 * r))
      }
    }
    if (bounds.width > 0 && bounds.height > 0) {
      const size = graphComponent.innerSize
      const margins = graphComponent.contentMargins
      const width = Math.max(1.0, size.width - margins.left - margins.right)
      const height = Math.max(1.0, size.height - margins.top - margins.bottom)
      const zoom = Math.min(width / bounds.width, height / bounds.height)
      graphComponent.zoom = Math.min(1.0, zoom)
      graphComponent.center = bounds.center
    }
  } else {
    void graphComponent.fitGraphBounds(margin)
  }
}
/**
 * Adds circle visualizations to the background of the given neighborhood view.
 */
function updateNeighborhoodBackground(view, circles) {
  const renderTree = view.neighborhoodComponent.renderTree
  const group = renderTree.backgroundGroup
  // remove old circle visuals
  for (let child = group.lastChild; child; child = child.previousSibling) {
    renderTree.remove(child)
  }
  // add new circle visuals
  if (circles.length > 0) {
    renderTree.createElement(group, createCircleVisual(circles))
  }
}
/**
 * Creates circle visualizations for the background of the demo's neighborhood view.
 */
function createCircleVisual(circles) {
  const svgNs = 'http://www.w3.org/2000/svg'
  const group = document.createElementNS(svgNs, 'g')
  for (const info of circles) {
    if (info.radius > 0) {
      const circle = document.createElementNS(svgNs, 'circle')
      circle.setAttribute('cx', `${info.center.x}`)
      circle.setAttribute('cy', `${info.center.y}`)
      circle.setAttribute('r', `${info.radius}px`)
      circle.setAttribute('fill', 'none')
      circle.setAttribute('stroke', 'lightgray')
      circle.setAttribute('stroke-width', '10px')
      group.appendChild(circle)
    }
  }
  return new SvgVisual(group)
}
/**
 * Configure a vivid, rectangular selection indicator.
 */
function initializeSelectionIndicator(graphComponent) {
  // decorate the nodes with custom highlight styles
  graphComponent.graph.decorator.nodes.selectionRenderer.addConstant(
    new NodeStyleIndicatorRenderer({
      // the indicator should be slightly bigger than the node
      margins: 5,
      // but have a fixed size in the view coordinates
      zoomPolicy: StyleIndicatorZoomPolicy.VIEW_COORDINATES,
      // create a vivid selection style
      nodeStyle: new ShapeNodeStyle({
        shape: 'round-rectangle',
        stroke: '3px solid #ff4500',
        fill: 'transparent'
      })
    })
  )
  graphComponent.graph.decorator.nodes.focusRenderer.hide()
}
/**
 * Creates a read-only input mode for the graph component that limits item selection to nodes.
 */
function createInputMode() {
  return new GraphViewerInputMode({
    clickableItems: GraphItemTypes.NODE,
    focusableItems: GraphItemTypes.NODE,
    selectableItems: GraphItemTypes.NODE,
    marqueeSelectableItems: GraphItemTypes.NODE
  })
}
/**
 * Binds actions to the demo's UI controls.
 */
function initializeUI(neighborhoodView) {
  // initialize the mode dropdown for the NeighborhoodView
  const neighborhoodTypeSelect = document.querySelector('#neighborhood-type-select')
  neighborhoodTypeSelect.addEventListener('change', () =>
    changeNeighborhoodType(neighborhoodView, neighborhoodTypeSelect.selectedIndex)
  )
  addNavigationButtons(neighborhoodTypeSelect)
  populateSelectElement(neighborhoodTypeSelect, ['Neighbors', 'Predecessors', 'Successors', 'Both'])
  // initialize the depth slider for the NeighborhoodView
  const neighborhoodDistanceSlider = document.querySelector('#neighborhood-distance-slider')
  neighborhoodDistanceSlider.min = '1'
  neighborhoodDistanceSlider.max = '5'
  neighborhoodDistanceSlider.value = '1'
  neighborhoodDistanceSlider.addEventListener('change', () => {
    changeNeighborhoodDistance(neighborhoodView, parseInt(neighborhoodDistanceSlider.value))
  })
}
/**
 * Adds the given items to the given HTML select element.
 */
function populateSelectElement(element, items) {
  for (const item of items) {
    const option = document.createElement('option')
    option.text = item
    option.value = item
    element.add(option)
  }
}
/**
 * Updates the given neighborhood view's neighbor buildNeighborhoodGraph callback to create
 * neighborhood graphs of the given type.
 */
function changeNeighborhoodType(neighborhoodView, neighborhoodMode) {
  neighborhoodView.buildNeighborhoodGraph = getBuildGraphCallback(
    neighborhoodMode,
    parseInt(document.querySelector('#neighborhood-distance-slider').value)
  )
  neighborhoodView.update()
}
/**
 * Updates the given neighborhood view's buildNeighborhoodGraph callback to include neighbors
 * up to the given maximum distance in the created neighborhood graphs.
 */
function changeNeighborhoodDistance(neighborhoodView, distance) {
  document.getElementById('neighborhood-distance-label').textContent = `${distance}`
  const neighborhoodTypeSelect = document.querySelector('#neighborhood-type-select')
  neighborhoodView.buildNeighborhoodGraph = getBuildGraphCallback(
    neighborhoodTypeSelect.selectedIndex,
    distance
  )
  neighborhoodView.update()
}
void run().then(finishLoading)
