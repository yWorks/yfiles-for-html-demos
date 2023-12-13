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
  control,
  DomUtil,
  LatLng,
  latLngBounds,
  Layer,
  type LayerOptions,
  type LeafletEvent,
  Map as LeafletMap,
  type MapOptions,
  TileLayer
} from 'leaflet'
import {
  type ArcEdgeStyle,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  type INode,
  Point
} from 'yfiles'
import { getArcHeight } from './map-styles'
import 'leaflet/dist/leaflet.css'

export type NodeCoordinateMapping = (node: INode) => { lat: number; lng: number }
export type ZoomChanged = (graphComponent: GraphComponent, zoom: number) => void

export type GraphLayerOptions = {
  coordinateMapping?: NodeCoordinateMapping
  zoomChanged?: ZoomChanged
} & LayerOptions

export type MapData = { graphLayer: GraphLayer; map: LeafletMap }

/**
 * Creates a Leaflet map and adds a graph layer which contains a {@link GraphComponent}.
 * @yjs:keep = control
 */
export function createMap(
  containerId: string,
  coordinateMapping: NodeCoordinateMapping,
  zoomChanged: ZoomChanged,
  leafletOptions?: MapOptions
): MapData {
  // use openstreetmap tiles for this demo:
  // create the tile layer with the correct attribution
  const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  const osmAttrib = 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'

  // create the map
  const worldMap = new LeafletMap(containerId, leafletOptions)
  worldMap.setView(new LatLng(15.538, 16.523), 3)
  worldMap.addLayer(
    new TileLayer(osmUrl, {
      minZoom: 3,
      maxZoom: 12,
      attribution: osmAttrib
    })
  )

  // add a zoom control
  control.scale().addTo(worldMap)

  // now create the GraphLayer
  const graphLayer = new GraphLayer({ coordinateMapping, zoomChanged })
  // and add it to the map
  worldMap.addLayer(graphLayer)

  return { graphLayer, map: worldMap }
}

/**
 * A Leaflet-layer that contains a {@link GraphComponent}.
 * The {@link GraphComponent} is placed above the map layer,
 * and won't adjust the viewport but calculates the node locations using the geolocations.
 */
export class GraphLayer extends Layer {
  private readonly coordinateMapping?: NodeCoordinateMapping
  private readonly zoomChanged?: ZoomChanged
  readonly graphComponent: GraphComponent
  private pane?: HTMLElement
  private mapPane?: HTMLElement

  /**
   * Instantiates the graph layer and initializes the {@link GraphComponent}.
   */
  constructor(options?: GraphLayerOptions) {
    super(options)

    // initialize fields
    this.coordinateMapping = options?.coordinateMapping
    this.zoomChanged = options?.zoomChanged

    // initialize the GraphComponent and place it in the div with CSS selector #graphComponent
    this.graphComponent = new GraphComponent({
      zoom: 1,
      autoDrag: false,
      horizontalScrollBarPolicy: 'never',
      verticalScrollBarPolicy: 'never',
      mouseWheelBehavior: 'none',
      // Due to how Leaflet handles the different layers, we need to use the timer-based size-change detection.
      // This is needed to display the graph when the demo is opened in a background tab
      sizeChangedDetection: 'timer'
    })

    // initialize the interaction with the GraphComponent
    const inputMode = new GraphViewerInputMode({
      clickableItems: GraphItemTypes.NODE,
      selectableItems: GraphItemTypes.NONE,
      focusableItems: GraphItemTypes.NONE,
      marqueeSelectableItems: GraphItemTypes.NONE,
      clickSelectableItems: GraphItemTypes.NONE
    })
    // the viewport should not change, because the GraphComponent is tied to the gestures of Leaflet
    inputMode.moveViewportInputMode.enabled = false

    this.graphComponent.inputMode = inputMode
  }

  /**
   * @yjs:keep = animate
   */
  onAdd(map: LeafletMap): this {
    this.pane = map.getPane('overlayPane')!
    this.pane.appendChild(this.graphComponent.div)
    this.mapPane = map.getPane('mapPane')

    map.on(
      'zoom viewreset resize move moveend zoomend',
      this.updateGraphDivHandler.bind(this),
      this
    )
    map.on('zoomstart', this.hideGraphComponent, this)
    map.on('zoomend', this.showGraphComponent, this)
    map.doubleClickZoom.disable()

    // restrict the viewport to the main world map, i.e., prevent infinite world panning
    const southWest = new LatLng(-89.98155760646617, -180)
    const northEast = new LatLng(89.99346179538875, 180)
    const bounds = latLngBounds(southWest, northEast)
    map.setMaxBounds(bounds)
    map.on('drag', () => {
      map.panInsideBounds(bounds, { animate: false })
    })

    // Call updateGraphDiv once to show graph in the initial view
    setTimeout(() => this.updateGraphDiv(map))
    return this
  }

  onRemove(map: LeafletMap): this {
    map.off(
      'zoom viewreset resize move moveend zoomend',
      this.updateGraphDivHandler.bind(this),
      this
    )
    map.off('zoomstart', this.hideGraphComponent, this)
    map.off('zoomend', this.showGraphComponent, this)
    this.pane = undefined
    this.mapPane = undefined
    this.graphComponent.cleanUp()
    this.graphComponent.div.remove()
    return this
  }

  /**
   * Listener for various {@link Map} events, see {@link onAdd} and {@link onRemove}.
   */
  updateGraphDivHandler(evt: LeafletEvent): void {
    this.updateGraphDiv(evt.target as LeafletMap)
  }

  /**
   * Synchronizes the viewport of the map and the {@link GraphComponent}.
   * @yjs:keep = getSize,setPosition,getPosition
   */
  updateGraphDiv(map: LeafletMap): void {
    const graphComponent = this.graphComponent
    // get the size of the map in DOM coordinates
    const mapSize = map.getSize()
    // get the current position of the mapPane
    const globalPos = DomUtil.getPosition(this.mapPane!)
    // calculate the top-left location of our pane
    const topLeft = globalPos.multiplyBy(-1)
    const bottomRight = topLeft.add(mapSize)
    const newSize = bottomRight.subtract(topLeft)

    // resize the graphComponent's div
    graphComponent.div.style.width = `${newSize.x}px`
    graphComponent.div.style.height = `${newSize.y}px`

    // anchor it at the top-left of the screen
    DomUtil.setPosition(this.pane!, topLeft)

    // update the node locations and edge arcs
    this.mapLayout(graphComponent, map)

    graphComponent.viewPoint = topLeft

    graphComponent.updateVisual()

    if (this.zoomChanged) {
      // execute the callback, when the zoom changed
      this.zoomChanged(graphComponent, map.getZoom())
    }
  }

  /**
   * Calculates the coordinates of the nodes from their geolocations
   * and updates the arc heights of the edges.
   */
  private mapLayout(graphComponent: GraphComponent, map: LeafletMap): void {
    const graph = graphComponent.graph
    // transform geolocations and update the node locations
    graph.nodes.forEach((node) => {
      const coords = this.getGeoCoordinates(node)
      const layerPoint = map.latLngToLayerPoint(new LatLng(coords.lat, coords.lng))
      // apply the new node locations
      graph.setNodeCenter(node, new Point(layerPoint.x, layerPoint.y - node.layout.height * 0.5))
    })

    // update the arc heights for the edges
    graph.edges.forEach((edge) => {
      const style = edge.style as ArcEdgeStyle
      style.height = getArcHeight(edge)
    })
  }

  /**
   * Returns the geo-coordinates for the given node using a specified mapping function.
   */
  private getGeoCoordinates(node: INode): { lat: number; lng: number } {
    if (this.coordinateMapping) {
      return this.coordinateMapping(node)
    }
    return { lat: 0, lng: 0 }
  }

  /**
   * Hides the {@link GraphComponent} during zoom.
   */
  hideGraphComponent(): void {
    this.graphComponent.div.style.visibility = 'hidden'
  }

  /**
   * Shows the {@link GraphComponent} after zooming gesture.
   */
  showGraphComponent(): void {
    this.graphComponent.div.style.visibility = 'visible'
  }
}
