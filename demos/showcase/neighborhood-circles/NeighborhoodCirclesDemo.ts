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
  Font,
  FontStyle,
  FontWeight,
  GraphBuilder,
  GraphComponent,
  GraphFocusIndicatorManager,
  type GraphInputMode,
  GraphItemTypes,
  GraphSelectionIndicatorManager,
  GraphViewerInputMode,
  ICanvasObjectDescriptor,
  type IGraph,
  ImageNodeStyle,
  IndicatorNodeStyleDecorator,
  type INode,
  type INodeStyle,
  Insets,
  InteriorLabelModel,
  License,
  OrganicLayout,
  Rect,
  ShapeNodeStyle,
  Size,
  StringTemplateNodeStyle,
  StyleDecorationZoomPolicy,
  SvgVisual,
  VoidNodeStyle
} from 'yfiles'
import type { CircleInfo } from './apply-layout-callback'
import { getApplyLayoutCallback } from './apply-layout-callback'
import { getBuildGraphCallback } from './build-graph-callback'
import { NeighborhoodType } from './NeighborhoodType'
import { NeighborhoodView } from '../neighborhood/NeighborhoodView'
import { fetchLicense } from 'demo-resources/fetch-license'
import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { addNavigationButtons, finishLoading } from 'demo-resources/demo-page'
import type { JSONGraph } from 'demo-utils/json-model'
import graphData from './resources/graph-data.json'

// We need to load the 'styles-other' module explicitly to prevent tree-shaking
// tools from removing it, because it contains styles referenced in the sample GraphML file.
Class.ensure(StringTemplateNodeStyle)

async function run(): Promise<void> {
  License.value = await fetchLicense()

  // initialize a GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  graphComponent.inputMode = createInputMode()

  // configure a vivid selection indicator and some default styling for graph items
  initializeSelectionIndicator(graphComponent)
  initDemoStyles(graphComponent.graph)

  graphComponent.focusIndicatorManager.enabled = false

  // create and configure the NeighborhoodView component
  const neighborhoodView = createNeighborhoodView(graphComponent)
  applyDemoTheme(neighborhoodView.neighborhoodComponent)

  // then build the graph with the given data set
  buildGraph(graphComponent.graph, graphData as unknown as JSONGraph)

  graphComponent.graph.applyLayout(
    new OrganicLayout({
      minimumNodeDistance: 60,
      nodeEdgeOverlapAvoided: true
    })
  )
  graphComponent.fitGraphBounds()

  //pre-select a node to show its neighborhood
  graphComponent.selection.clear()
  const node = graphComponent.graph.nodes.at(0)
  if (node) {
    graphComponent.selection.setSelected(node, true)
  }

  // wire up the UI elements of this demo
  initializeUI(neighborhoodView)
}

/**
 * Iterates through the given data set and creates nodes and edges according to the given data.
 */
function buildGraph(graph: IGraph, graphData: JSONGraph): void {
  const graphBuilder = new GraphBuilder(graph)

  const nodesSource = graphBuilder.createNodesSource({
    data: graphData.nodeList,
    id: (item) => item.id,
    parentId: (item) => item.parentId
  })

  nodesSource.nodeCreator.styleProvider = (item): INodeStyle =>
    new ImageNodeStyle({ image: `./resources/${item.tag}.svg` })

  nodesSource.nodeCreator.createLabelBinding((item) => item.label)

  nodesSource.nodeCreator.defaults.size = new Size(48, 48)
  nodesSource.nodeCreator.defaults.labels.style = new DefaultLabelStyle({
    textFill: '#ff000000',
    backgroundFill: '#b0ffffff',
    clipText: false,
    font: new Font({
      fontFamily: 'Arial',
      fontSize: 10,
      fontStyle: FontStyle.NORMAL,
      fontWeight: FontWeight.NORMAL
    }),
    insets: 2
  })
  nodesSource.nodeCreator.defaults.labels.layoutParameter = InteriorLabelModel.SOUTH

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
function createNeighborhoodView(graphComponent: GraphComponent): NeighborhoodView {
  let layoutCircleInfo: CircleInfo[] = []

  const neighborhoodView = new NeighborhoodView('#neighborhood-graph-component')
  neighborhoodView.applyNeighborhoodLayout = getApplyLayoutCallback((view, circles) => {
    layoutCircleInfo = circles
  })
  neighborhoodView.buildNeighborhoodGraph = getBuildGraphCallback(NeighborhoodType.NEIGHBORHOOD, 1)
  neighborhoodView.graphComponent = graphComponent
  // mirror navigation in the neighborhood view to the demo's main GraphComponent
  neighborhoodView.clickCallback = (node: INode): void => {
    graphComponent.selection.clear()
    graphComponent.selection.setSelected(node, true)
  }
  neighborhoodView.onNeighborhoodUpdated = (view: NeighborhoodView): void => {
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
function fitGraphAndBackground(graphComponent: GraphComponent, circles: CircleInfo[]): void {
  const margin = 5
  if (circles.length > 0) {
    graphComponent.updateContentRect(new Insets(margin))

    const strokeRadius = 5
    let bounds = graphComponent.contentRect
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
    graphComponent.fitGraphBounds(new Insets(margin))
  }
}

/**
 * Adds circle visualizations to the background of the given neighborhood view.
 */
function updateNeighborhoodBackground(view: NeighborhoodView, circles: CircleInfo[]): void {
  const group = view.neighborhoodComponent.backgroundGroup

  // remove old circle visuals
  for (let child = group.lastChild; child; child = child.previousSibling) {
    child.remove()
  }

  // add new circle visuals
  if (circles.length > 0) {
    group.addChild(createCircleVisual(circles), ICanvasObjectDescriptor.ALWAYS_DIRTY_VISUAL)
  }
}

/**
 * Creates circle visualizations for the background of the demo's neighborhood view.
 */
function createCircleVisual(circles: CircleInfo[]): SvgVisual {
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
function initializeSelectionIndicator(graphComponent: GraphComponent): void {
  // decorate the nodes with custom highlight styles
  graphComponent.selectionIndicatorManager = new GraphSelectionIndicatorManager({
    nodeStyle: new IndicatorNodeStyleDecorator({
      // the indicator should be slightly bigger than the node
      padding: 5,
      // but have a fixed size in the view coordinates
      zoomPolicy: StyleDecorationZoomPolicy.VIEW_COORDINATES,
      // create a vivid selection style
      wrapped: new ShapeNodeStyle({
        shape: 'round-rectangle',
        stroke: '3px solid #ff4500',
        fill: 'transparent'
      })
    })
  })
  graphComponent.focusIndicatorManager = new GraphFocusIndicatorManager({
    nodeStyle: VoidNodeStyle.INSTANCE
  })
}

/**
 * Creates a read-only input mode for the graph component that limits item selection to nodes.
 */
function createInputMode(): GraphInputMode {
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
function initializeUI(neighborhoodView: NeighborhoodView): void {
  // initialize the mode dropdown for the NeighborhoodView
  const neighborhoodTypeSelect = document.querySelector<HTMLSelectElement>(
    '#neighborhood-type-select'
  )!
  neighborhoodTypeSelect.addEventListener('change', () =>
    changeNeighborhoodType(neighborhoodView, neighborhoodTypeSelect.selectedIndex)
  )
  addNavigationButtons(neighborhoodTypeSelect)
  populateSelectElement(neighborhoodTypeSelect, ['Neighbors', 'Predecessors', 'Successors', 'Both'])

  // initialize the depth slider for the NeighborhoodView
  const neighborhoodDistanceSlider = document.querySelector<HTMLInputElement>(
    '#neighborhood-distance-slider'
  )!
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
function populateSelectElement(element: HTMLSelectElement, items: string[]): void {
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
function changeNeighborhoodType(
  neighborhoodView: NeighborhoodView,
  neighborhoodMode: NeighborhoodType
): void {
  neighborhoodView.buildNeighborhoodGraph = getBuildGraphCallback(
    neighborhoodMode,
    parseInt(document.querySelector<HTMLInputElement>('#neighborhood-distance-slider')!.value)
  )

  neighborhoodView.update()
}

/**
 * Updates the given neighborhood view's buildNeighborhoodGraph callback to include neighbors
 * up to the given maximum distance in the created neighborhood graphs.
 */
function changeNeighborhoodDistance(neighborhoodView: NeighborhoodView, distance: number): void {
  document.getElementById('neighborhood-distance-label')!.textContent = `${distance}`

  const neighborhoodTypeSelect = document.querySelector<HTMLSelectElement>(
    '#neighborhood-type-select'
  )!
  neighborhoodView.buildNeighborhoodGraph = getBuildGraphCallback(
    neighborhoodTypeSelect.selectedIndex,
    distance
  )

  neighborhoodView.update()
}

void run().then(finishLoading)
