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
import { FilteredGraphWrapper, GraphBuilder, INode, License, Point } from '@yfiles/yfiles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import { flightData } from './resources/flight-data'
import { initializeDefaultMapStyles } from './map-styles'
import { createMap } from './leaflet-graph-layer'
import { initializeShortestPaths } from './shortest-paths'
import { getAirportData } from './data-types'
async function run() {
  License.value = await fetchLicense()
  // create a Leaflet map that will contain the graphComponent
  const mapData = createMap('graphComponent', coordinateMapping, zoomChanged)
  const graphComponent = mapData.graphLayer.graphComponent
  // obtain the graph that is displayed
  createGraph(graphComponent, mapData.map)
  // add tooltips when hovering an airport
  initializeTooltips(graphComponent)
  // initialize the shortest-path-gesture
  // which highlights the shortest path between the last two clicked nodes
  initializeShortestPaths(graphComponent, mapData.map)
  // update map size when sidebar is toggled
  document.querySelector('.demo-description__toggle-button').addEventListener('click', () => {
    setTimeout(() => {
      mapData.map.invalidateSize()
    }, 400)
  })
  document.querySelector('.demo-description__play-button').addEventListener('click', () => {
    setTimeout(() => {
      mapData.map.invalidateSize()
    }, 400)
  })
}
/**
 * Builds the initial graph from FlightData.
 */
function createGraph(graphComponent, map) {
  const graph = graphComponent.graph
  // prepare the styles for the graph
  initializeDefaultMapStyles(graph)
  // read the graph from the data
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: flightData.airports,
    id: 'iata',
    labels: ['name']
  })
  builder.createEdgesSource(flightData.connections, 'from', 'to')
  builder.buildGraph()
  // add a filter to determine which nodes are visible depending on the zoom level of the map
  graphComponent.graph = new FilteredGraphWrapper(graph, (node) => {
    const zoom = map.getZoom()
    const airportData = getAirportData(node)
    const passengers = airportData.passengers
    switch (zoom) {
      case 1:
        return passengers > 50000000
      case 2:
        return passengers > 40000000
      case 3:
        return passengers > 30000000
      case 4:
        return passengers > 20000000
      case 5:
        return passengers > 10000000
      default:
        // higher zoom levels -> show all airports
        return zoom > 5
    }
  })
}
function initializeTooltips(graphComponent) {
  const inputMode = graphComponent.inputMode
  // initialize tooltips
  inputMode.toolTipInputMode.delay = '200ms'
  inputMode.toolTipInputMode.duration = '1000ms'
  inputMode.toolTipInputMode.toolTipLocationOffset = new Point(10, 10)
  inputMode.addEventListener('query-item-tool-tip', (evt) => {
    const item = evt.item
    if (item instanceof INode && !evt.handled && item.labels.size > 0) {
      evt.toolTip = item.labels.at(0).text
      evt.handled = true
    }
  })
}
/**
 * Mapping function that extracts the coordinates for each node from its business data.
 */
function coordinateMapping(node) {
  const airportData = getAirportData(node)
  return { lat: airportData.lat, lng: airportData.lng }
}
/**
 * Function that updates the graph after the map's zoom has changed.
 */
function zoomChanged(graphComponent, zoom) {
  const graph = graphComponent.graph
  if (graph instanceof FilteredGraphWrapper) {
    // update visibility of the nodes which depends on the zoom level
    graph.nodePredicateChanged()
    graph.edgePredicateChanged()
  }
  // update the label for the airports since they depend on the zoom level
  graph.nodes.forEach((node) => {
    const airportData = getAirportData(node)
    // show the airport's IATA-code when the zoom value is low
    graph.setLabelText(node.labels.at(0), zoom >= 4 ? airportData.name : airportData.iata)
  })
}
void run().then(finishLoading)
