/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EdgeStyleIndicatorRenderer,
  type GraphComponent,
  type GraphViewerInputMode,
  type IEdge,
  ImageNodeStyle,
  type INode,
  LabelStyle,
  LabelStyleIndicatorRenderer,
  NodeStyleIndicatorRenderer,
  ShortestPath
} from '@yfiles/yfiles'
import { getArcHeight } from './map-styles'
import type { Map as LeafletMap } from 'leaflet'
import { LatLng } from 'leaflet'
import { getAirportData } from './data-types'

let lastClickedNode: INode | undefined

/**
 * Registers listeners to graph changes and clicks to update the highlighted of the shortest paths.
 */
export function initializeShortestPaths(graphComponent: GraphComponent, map: LeafletMap): void {
  const inputMode = graphComponent.inputMode as GraphViewerInputMode
  inputMode.addEventListener('item-clicked', (evt) => {
    updateShortestPathHighlight(evt.item as INode, graphComponent, map)
  })

  graphComponent.graph.addEventListener('node-removed', (evt) => {
    const removed = graphComponent.highlights.remove(evt.item)
    if (removed) {
      // If the node was highlighted before, it was possibly part of a shortest path, in which
      // case the path cannot be visualized completely anymore. We therefore clear the whole path.
      graphComponent.highlights.clear()
    }
  })
  graphComponent.graph.addEventListener('edge-removed', (evt) => {
    graphComponent.highlights.remove(evt.item)
  })
  graphComponent.graph.addEventListener('label-removed', (evt) => {
    graphComponent.highlights.remove(evt.item)
  })

  initializeHighlights(graphComponent)
}

/**
 * Configures the highlight style for the nodes that belong to the shortest path and their
 * associated labels along with the shortest path itself.
 */
function initializeHighlights(graphComponent: GraphComponent): void {
  graphComponent.graph.decorator.nodes.highlightRenderer.addConstant(
    new NodeStyleIndicatorRenderer({
      nodeStyle: new ImageNodeStyle('resources/airport-drop-highlight.svg'),
      margins: 1.5
    })
  )
  graphComponent.graph.decorator.labels.highlightRenderer.addConstant(
    new LabelStyleIndicatorRenderer({
      labelStyle: new LabelStyle({
        shape: 'pill',
        backgroundFill: '#f1b0ae',
        backgroundStroke: 'none',
        textFill: '#581715',
        padding: [3, 5]
      }),
      margins: 0
    })
  )

  // use highlightDecorator for edges as we want to use different arc heights for individual edges
  graphComponent.graph.decorator.edges.highlightRenderer.addFactory(
    (edge) =>
      new EdgeStyleIndicatorRenderer({
        edgeStyle: new ArcEdgeStyle({ stroke: '5px dashed #db3a34', height: getArcHeight(edge) })
      })
  )
}

/**
 * Highlights the shortest path between the current clickNode and the last clicked node.
 */
function updateShortestPathHighlight(
  clickedNode: INode,
  graphComponent: GraphComponent,
  map: LeafletMap
): void {
  const graph = graphComponent.graph

  const highlights = graphComponent.highlights
  if (lastClickedNode && graph.contains(lastClickedNode)) {
    const start = lastClickedNode
    // determine the shortest path using the distances between airports to weigh the edges
    const algorithm = new ShortestPath({
      source: start,
      sink: clickedNode,
      costs: (edge: IEdge): number => {
        // use the actual distance between the two airports as costs
        const { lat: sourceLat, lng: sourceLng } = getAirportData(edge.sourceNode)
        const { lat: targetLat, lng: targetLng } = getAirportData(edge.targetNode)
        return map.distance(new LatLng(sourceLat, sourceLng), new LatLng(targetLat, targetLng))
      },
      directed: false
    })

    // highlight the shortest path
    highlights.clear()

    const result = algorithm.run(graph)
    result.edges.forEach((edge) => {
      // highlight the edge, its source/target nodes and their associated labels
      highlights.add(edge)
      const sourceNode = edge.sourceNode
      const targetNode = edge.targetNode
      highlights.add(sourceNode)
      highlights.add(targetNode)
      highlights.add(sourceNode.labels.at(0)!)
      highlights.add(targetNode.labels.at(0)!)
    })
    lastClickedNode = undefined
  } else {
    highlights.clear()
    // highlight the node and its associated label
    highlights.add(clickedNode)
    highlights.add(clickedNode.labels.at(0)!)
    lastClickedNode = clickedNode
  }
  graphComponent.invalidate()
}
