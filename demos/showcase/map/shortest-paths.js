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
  ArcEdgeStyle,
  DefaultLabelStyle,
  EdgeStyleDecorationInstaller,
  GraphHighlightIndicatorManager,
  ImageNodeStyle,
  IndicatorNodeStyleDecorator,
  ShortestPath
} from 'yfiles'
import { getArcHeight } from './map-styles.js'
import { LatLng } from 'leaflet'
import { getAirportData } from './data-types.js'

/** @type {INode} */
let lastClickedNode

/**
 * Registers listeners to graph changes and clicks to update the highlighted of the shortest paths.
 * @param {!GraphComponent} graphComponent
 * @param {!LeafletMap} map
 */
export function initializeShortestPaths(graphComponent, map) {
  const inputMode = graphComponent.inputMode
  inputMode.addItemClickedListener((_, evt) => {
    updateShortestPathHighlight(evt.item, graphComponent, map)
  })

  graphComponent.graph.addNodeRemovedListener(() => {
    clearHighlights(graphComponent)
  })
  graphComponent.graph.addEdgeRemovedListener(() => {
    clearHighlights(graphComponent)
  })

  initializeHighlights(graphComponent)
}

/**
 * Configures the highlight style for the nodes that belong to the shortest path and their
 * associated labels along with the shortest path itself.
 * @param {!GraphComponent} graphComponent
 */
function initializeHighlights(graphComponent) {
  graphComponent.highlightIndicatorManager = new GraphHighlightIndicatorManager({
    nodeStyle: new IndicatorNodeStyleDecorator({
      wrapped: new ImageNodeStyle('resources/airport-drop-highlight.svg'),
      padding: 1.5
    }),
    labelStyle: new DefaultLabelStyle({
      shape: 'pill',
      backgroundFill: '#f1b0ae',
      backgroundStroke: 'none',
      textFill: '#581715',
      insets: [3, 5]
    })
  })

  // use highlightDecorator for edges as we want to use different arc heights for individual edges
  graphComponent.graph.decorator.edgeDecorator.highlightDecorator.setFactory(
    (edge) =>
      new EdgeStyleDecorationInstaller({
        edgeStyle: new ArcEdgeStyle({
          stroke: '5px dashed #db3a34',
          height: getArcHeight(edge)
        })
      })
  )
}

/**
 * Highlights the shortest path between the current clickNode and the last clicked node.
 * @param {!INode} clickedNode
 * @param {!GraphComponent} graphComponent
 * @param {!LeafletMap} map
 */
function updateShortestPathHighlight(clickedNode, graphComponent, map) {
  const highlightManager = graphComponent.highlightIndicatorManager
  const graph = graphComponent.graph

  if (lastClickedNode && graph.contains(lastClickedNode)) {
    const start = lastClickedNode
    // determine the shortest path using the distances between airports to weigh the edges
    const algorithm = new ShortestPath({
      source: start,
      sink: clickedNode,
      costs: (edge) => {
        // use the actual distance between the two airports as costs
        const { lat: sourceLat, lng: sourceLng } = getAirportData(edge.sourceNode)
        const { lat: targetLat, lng: targetLng } = getAirportData(edge.targetNode)
        return map.distance(new LatLng(sourceLat, sourceLng), new LatLng(targetLat, targetLng))
      },
      directed: false
    })

    // highlight the shortest path
    highlightManager.clearHighlights()

    const result = algorithm.run(graph)
    result.edges.forEach((edge) => {
      // highlight the edge, its source/target nodes and their associated labels
      highlightManager.addHighlight(edge)
      const sourceNode = edge.sourceNode
      const targetNode = edge.targetNode
      highlightManager.addHighlight(sourceNode)
      highlightManager.addHighlight(targetNode)
      highlightManager.addHighlight(sourceNode.labels.at(0))
      highlightManager.addHighlight(targetNode.labels.at(0))
    })
    lastClickedNode = undefined
  } else {
    highlightManager.clearHighlights()
    // highlight the node and its associated label
    highlightManager.addHighlight(clickedNode)
    highlightManager.addHighlight(clickedNode.labels.at(0))
    lastClickedNode = clickedNode
  }
  graphComponent.invalidate()
}

/**
 * Updates the path highlights.
 * This needs to be called when the viewport changes.
 * @param {!GraphComponent} graphComponent
 */
export function updateHighlights(graphComponent) {
  const highlightManager = graphComponent.highlightIndicatorManager
  const highlightedItems = highlightManager.selectionModel.toArray()
  highlightManager.clearHighlights()
  highlightedItems.forEach((item) => {
    graphComponent.highlightIndicatorManager.addHighlight(item)
  })
}

/**
 * Removes all highlights from the {@link graphComponent}.
 * @param {!GraphComponent} graphComponent
 */
function clearHighlights(graphComponent) {
  graphComponent.highlightIndicatorManager.clearHighlights()
}
