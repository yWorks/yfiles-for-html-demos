/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

/* eslint-disable no-undef */

require.config({
  paths: {
    yfiles: '../../../lib/umd/yfiles/',
    utils: '../../utils/',
    resources: '../../resources/'
  }
})

require([
  'yfiles/view-editor',
  'resources/demo-app',
  'utils/Workarounds',
  'resources/FlightData.js',
  'CenterGraphStage.js',
  'ZoomAnimation.js',
  'StylesSupport.js',
  'ShortestPathSupport.js',
  'CircleVisual.js',
  'yfiles/view-layout-bridge',
  'yfiles/layout-radial',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  BrowserSupport,
  FlightData,
  CenterGraphStage,
  ZoomAnimation,
  StylesSupport,
  ShortestPathSupport,
  CircleVisual
) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /** @type {boolean} */
  let graphMode = true

  /** @type {Array.<yfiles.graph.IEdge>} */
  let bfsEdges = null

  /** @type {ShortestPathSupport} */
  let shortestPathSupport = null

  let worldMap = null
  let graphLayer = null

  /** @type {boolean} */
  let layoutRunning = false

  /** @type {CircleVisual} */
  let circleVisual = null

  // define the GraphLayer yFiles for HTML extension
  L.GraphLayer = L.Layer.extend({
    onAdd(map) {
      // Initialize the GraphComponent and place it in the div with CSS selector #graphComponent
      this.graphComponent = new yfiles.view.GraphComponent()
      this.graphComponent.zoom = 1
      this.graphComponent.autoDrag = false
      this.graphComponent.horizontalScrollBarPolicy = yfiles.view.ScrollBarVisibility.NEVER
      this.graphComponent.verticalScrollBarPolicy = yfiles.view.ScrollBarVisibility.NEVER
      this.graphComponent.mouseWheelBehavior = yfiles.view.MouseWheelBehaviors.NONE
      circleVisual = new CircleVisual(graphMode)
      this.graphComponent.backgroundGroup.addChild(
        circleVisual,
        yfiles.view.ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
      )

      // Due to how Leaflet handles the different layers, we need to use the TIMER based sizeChangedDetection
      // In IE9, the size detection needs to be triggered regularly to keep the graph visible
      // In Chrome, this is needed to display the graph when the demo is opened in a background tab
      this.graphComponent.sizeChangedDetection = yfiles.view.SizeChangedDetectionMode.TIMER

      this.graphComponent.inputMode = new yfiles.input.GraphViewerInputMode({
        clickableItems: yfiles.graph.GraphItemTypes.NODE,
        selectableItems: yfiles.graph.GraphItemTypes.NONE,
        focusableItems: yfiles.graph.GraphItemTypes.NONE,
        marqueeSelectableItems: yfiles.graph.GraphItemTypes.NONE,
        clickSelectableItems: yfiles.graph.GraphItemTypes.NONE
      })

      this.graphComponent.inputMode.addItemDoubleClickedListener((sender, args) => {
        if (!graphMode) {
          const node = args.item
          if (node) {
            runLayout(node)
          }
        }
      })

      this.graphComponent.inputMode.mouseHoverInputMode.delay = '200ms'
      this.graphComponent.inputMode.mouseHoverInputMode.duration = '1000ms'
      this.graphComponent.inputMode.mouseHoverInputMode.toolTipLocationOffset = [10, 10]
      this.graphComponent.inputMode.addQueryItemToolTipListener((src, args) => {
        if (yfiles.graph.INode.isInstance(args.item) && !args.handled) {
          args.toolTip = args.item.labels.first().text
          args.handled = true
        }
      })

      // the should not change, because the GraphComponent is tied to the gestures of Leaflet
      this.graphComponent.inputMode.moveViewportInputMode.enabled = false

      // add a filter to determine which nodes are visible depending on the zoom level of the map
      this.graphComponent.graph = new yfiles.graph.FilteredGraphWrapper(
        this.graphComponent.graph,
        node => (graphMode ? node.tag.zoom <= map.getZoom() : true),
        edge =>
          graphMode
            ? edge.tag.zoom <= map.getZoom()
            : bfsEdges !== null && bfsEdges.indexOf(edge) >= 0
      )

      // initialize the shortest-path-gesture which highlights the shortest path between the last two clicked nodes
      shortestPathSupport = new ShortestPathSupport(this.graphComponent, graphMode)

      // add a background for the graph component to be able to fade the map in layout mode
      const backgroundDiv = document.createElement('div')
      backgroundDiv.id = 'component-background'
      backgroundDiv.appendChild(this.graphComponent.div)

      this.pane = map.getPane(this.options.pane)
      this.container = backgroundDiv
      this.pane.appendChild(this.container)
      this.mapPane = map.getPane('mapPane')

      // Add and position children elements if needed
      this.updateGraphDiv()

      setTimeout(() => {
        this.graphComponent.updateVisual()
      }, 400)

      map.on('zoom viewreset resize move moveend zoomend', this.updateGraphDiv, this)
      map.on('zoomstart', this.hideGraphComponent, this)
      map.on('zoomend', this.showGraphComponent, this)
      map.doubleClickZoom.disable()

      // restrict the viewport to the main world map, i.e. prevent infinite world panning
      const southWest = L.latLng(-89.98155760646617, -180)
      const northEast = L.latLng(89.99346179538875, 180)
      const bounds = L.latLngBounds(southWest, northEast)
      map.maxBounds = bounds
      map.on('drag', () => {
        map.panInsideBounds(bounds, { animate: false })
      })
    },

    onRemove(map) {
      L.DomUtil.remove(this.container)
      map.off('zoom viewreset resize move', this.updateGraphDiv, this)
      this.mapPane = null
    },

    /**
     * Synchronizes the viewport of the map and the GraphComponent
     * @param {yfiles.collections.Mapper?} nodeLocationsMapper
     */
    updateGraphDiv(nodeLocationsMapper) {
      // get the size of the map in DOM coordinates
      const mapSize = worldMap.getSize()
      // get the current position of the mapPane
      const globalPos = L.DomUtil.getPosition(this.mapPane)
      // calculate the top-left location of our pane
      const topLeft = globalPos.multiplyBy(-1)
      const bottomRight = topLeft.add(mapSize)
      const newSize = bottomRight.subtract(topLeft)

      // resize the graphComponent's div
      this.graphComponent.div.style.width = `${newSize.x}px`
      this.graphComponent.div.style.height = `${newSize.y}px`

      // anchor it at the top-left of the screen
      L.DomUtil.setPosition(this.pane, topLeft)

      const graph = this.graphComponent.graph
      if (graphMode) {
        // transform geo-locations and update the node locations
        graph.nodes.forEach(node => {
          const layerPoint = worldMap.latLngToLayerPoint(L.latLng(node.tag.lat, node.tag.lng))
          const width = node.layout.width
          const height = node.layout.height
          if (yfiles.collections.Mapper.isInstance(nodeLocationsMapper)) {
            // collect the new node locations to apply them later with an animation
            nodeLocationsMapper.set(
              node,
              new yfiles.geometry.Rect(
                layerPoint.x - width * 0.5,
                layerPoint.y - height,
                width,
                height
              )
            )
          } else {
            // apply the new node locations
            graph.setNodeCenter(
              node,
              new yfiles.geometry.Point(layerPoint.x, layerPoint.y - height * 0.5)
            )
          }

          if (worldMap.getZoom() >= 6) {
            // show the airport's IATA-code when the zoom level is high
            graph.setLabelText(node.labels.first(), node.tag.iata)
          } else {
            // show the city names when the zoom level is low
            graph.setLabelText(node.labels.first(), node.tag.name)
          }
        })

        // adjust the arc of the edges to avoid too long edges for close nodes
        StylesSupport.updateEdgeArcs(graph)

        // adjust the viewPoint in the graphComponent
        this.graphComponent.viewPoint = new yfiles.geometry.Point(topLeft.x, topLeft.y)

        graph.nodePredicateChanged()
        graph.edgePredicateChanged()

        // update highlights in case the arc height of edges changed
        shortestPathSupport.updateHighlights(this.graphComponent)

        // cause an immediate repaint
        this.graphComponent.updateVisual()
      } else {
        // when the nodes are not placed with their geo-coordinates, just update the graph and layout according to
        // zoom and location
        graph.nodePredicateChanged()
        graph.edgePredicateChanged()
        setTimeout(() => {
          if (layoutRunning) {
            return
          }
          layoutRunning = true
          runLayout().then(() => {
            layoutRunning = false
          })
        }, 5)
      }
    },

    /**
     * Hide graph component during zoom.
     */
    hideGraphComponent() {
      this.graphComponent.div.style.visibility = 'hidden'
    },

    /**
     * Show graph component after zooming gesture.
     */
    showGraphComponent() {
      this.graphComponent.div.style.visibility = 'visible'
    }
  })

  // register a control which toggles the graph mode between map and layout
  L.ToggleGraphControl = L.Control.extend({
    onAdd() {
      const div = document.createElement('div')
      // create a checkbox that toggles
      const toggleButton = document.createElement('input')
      toggleButton.type = 'checkbox'
      toggleButton.id = 'toggle-graph-mode-button'
      toggleButton.style.display = 'none'
      // add a label that makes the checkbox look like a button with an icon
      const toggleButtonLabel = document.createElement('label')
      toggleButtonLabel.setAttribute('for', 'toggle-graph-mode-button')
      app.addClass(toggleButtonLabel, 'toggle-graph-mode')
      toggleButtonLabel.title = 'Toggle Graph Mode'

      toggleButton.addEventListener('change', () => {
        graphMode = !graphMode
        shortestPathSupport.graphMode = graphMode
        circleVisual.graphMode = graphMode

        const graph = graphComponent.graph
        const backgroundDiv = document.getElementById('component-background')
        if (graphMode) {
          worldMap.dragging.enable()
          worldMap.touchZoom.enable()
          worldMap.scrollWheelZoom.enable()
          worldMap.boxZoom.enable()
          worldMap.keyboard.enable()
          worldMap.zoomControl.enable()
          if (worldMap.tap) {
            worldMap.tap.enable()
          }
          document.getElementById('graphComponent').style.cursor = 'grab'

          backgroundDiv.style.backgroundColor = 'rgba(0, 0, 0, 0)'

          // show the nodes on geo-coordinates
          // update the graph component and collect the new node locations in a mapper
          const nodeLocations = new yfiles.collections.Mapper()
          graphLayer.updateGraphDiv(nodeLocations)

          // move the nodes to their new locations in an animation while zooming to the old viewport
          toggleButton.disabled = true
          const zoomAnimation = new ZoomAnimation(graphComponent, 1, this.viewportCenter, 700)
          const graphAnimation = yfiles.view.IAnimation.createGraphAnimation(
            graphComponent.graph,
            nodeLocations,
            null,
            null,
            null,
            '700ms'
          )
          graphComponent.graph.edges.forEach(edge => graphComponent.graph.clearBends(edge))
          const animation = yfiles.view.IAnimation.createParallelAnimation([
            zoomAnimation,
            graphAnimation
          ])
          const animator = new yfiles.view.Animator(graphComponent)
          animator.animate(animation).then(() => {
            StylesSupport.applyMapStyles(graph.wrappedGraph)
            toggleButton.disabled = false
          })
        } else {
          // disable the map when the graph is shown with radial layout
          worldMap.dragging.disable()
          worldMap.touchZoom.disable()
          worldMap.scrollWheelZoom.disable()
          worldMap.boxZoom.disable()
          worldMap.keyboard.disable()
          worldMap.zoomControl.disable()
          if (worldMap.tap) {
            worldMap.tap.disable()
          }
          document.getElementById('graphComponent').style.cursor = 'default'

          // store viewport center to be able to restore the viewport when toggling back
          this.viewportCenter = graphComponent.viewport.center

          // run a layout with animation
          backgroundDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.7)'
          StylesSupport.applyLayoutStyles(graph.wrappedGraph)
          shortestPathSupport.clearHighlights()
          toggleButton.disabled = true
          if (!layoutRunning) {
            layoutRunning = true
            graphComponent.graph.edges.forEach(edge => graphComponent.graph.clearBends(edge))
            runLayout().then(() => {
              toggleButton.disabled = false
              layoutRunning = false
            })
          }
        }
      })

      div.appendChild(toggleButton)
      div.appendChild(toggleButtonLabel)
      return div
    },

    onRemove(map) {}
  })

  function run() {
    worldMap = L.map('graphComponent')

    // use openstreetmap tiles for this demo:
    // create the tile layer with correct attribution
    const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    const osmAttrib =
      'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'

    worldMap.setView(L.latLng(15.538, 16.523), 3)
    worldMap.addLayer(
      new L.TileLayer(osmUrl, {
        minZoom: 3,
        maxZoom: 12,
        attribution: osmAttrib
      })
    )
    L.control.scale().addTo(worldMap)

    // now create the GraphLayer
    graphLayer = new L.GraphLayer()
    // and add it to the map
    worldMap.addLayer(graphLayer)

    // obtain the graph that is displayed
    graphComponent = graphLayer.graphComponent
    createGraph()
    graphLayer.updateGraphDiv()

    initializeHighlights()

    // add the toggle graph control to the map
    new L.ToggleGraphControl().addTo(worldMap)

    // update map size when side-bar is toggled
    document
      .querySelector('button.demo-left-sidebar-toggle-button')
      .addEventListener('click', () => {
        setTimeout(() => {
          worldMap.invalidateSize()
        }, 400)
      })
    document.querySelector('a.action-run').addEventListener('click', () => {
      setTimeout(() => {
        worldMap.invalidateSize()
      }, 400)
    })

    app.show()
  }

  /**
   * Runs a radial layout.
   * @param {yfiles.graph.INode?} centerNode
   * @return {Promise}
   */
  function runLayout(centerNode) {
    const highlightManager = graphComponent.highlightIndicatorManager
    highlightManager.clearHighlights()
    const layout = new yfiles.radial.RadialLayout()
    layout.centerNodesPolicy = yfiles.radial.CenterNodesPolicy.CUSTOM
    const center =
      centerNode ||
      graphComponent.graph.wrappedGraph.nodes.find(node => node.tag.name === 'Frankfurt')
    showBfsEdges(center)
    graphComponent.graph.nodePredicateChanged()

    const layoutData = new yfiles.radial.RadialLayoutData()
    layoutData.centerNodes.items = new yfiles.collections.List({ items: [center] })

    graphComponent.graph.mapperRegistry.createMapper(yfiles.radial.RadialLayout.NODE_INFO_DP_KEY)

    // center the graph inside the viewport to avoid nodes flying in from the sides when switched back to map mode
    const centerGraphStage = new CenterGraphStage(layout, graphComponent.viewport.center)

    return graphComponent.morphLayout(centerGraphStage, '700ms', layoutData).then(() => {
      highlightManager.addHighlight(center)
      highlightManager.addHighlight(center.labels.first())
    })
  }

  /**
   * Uses BFS to find the edges between the center node and the other nodes in the graph and makes them visible.
   * @param {yfiles.graph.INode} centerNode
   */
  function showBfsEdges(centerNode) {
    const graph = graphComponent.graph.wrappedGraph
    bfsEdges = []

    const stack = [centerNode]
    const visited = [centerNode]
    while (stack.length > 0) {
      const node = stack.pop()
      graph.edgesAt(node).forEach(edge => {
        const opposite = edge.targetNode === node ? edge.sourceNode : edge.targetNode
        if (visited.indexOf(opposite) < 0) {
          bfsEdges.push(edge)
          stack.unshift(opposite)
          visited.push(opposite)
        }
      })
    }

    graphComponent.graph.edgePredicateChanged()
  }

  function initializeHighlights() {
    const decorator = graphComponent.graph.decorator
    decorator.nodeDecorator.highlightDecorator.setFactory(() => {
      if (graphMode) {
        return new yfiles.view.NodeStyleDecorationInstaller({
          nodeStyle: new yfiles.styles.ImageNodeStyle('resources/airport-drop-highlight.svg'),
          margins: 1.5
        })
      }
      return new yfiles.view.NodeStyleDecorationInstaller({
        nodeStyle: new yfiles.styles.ImageNodeStyle('resources/airport-circle-highlight.svg'),
        margins: 1.5
      })
    })

    decorator.labelDecorator.highlightDecorator.setImplementation(
      new yfiles.view.LabelStyleDecorationInstaller({
        labelStyle: new yfiles.styles.NodeStyleLabelStyleAdapter({
          nodeStyle: new yfiles.styles.ShapeNodeStyle({
            shape: yfiles.styles.ShapeNodeShape.ROUND_RECTANGLE,
            fill: 'darkorange',
            stroke: null
          }),
          labelStyle: new yfiles.styles.DefaultLabelStyle({
            textFill: 'white'
          }),
          labelStyleInsets: [3, 5]
        }),
        margins: 0,
        zoomPolicy: yfiles.view.StyleDecorationZoomPolicy.WORLD_COORDINATES
      })
    )
    decorator.edgeDecorator.highlightDecorator.setFactory(
      edge =>
        new yfiles.view.EdgeStyleDecorationInstaller({
          edgeStyle: new yfiles.styles.ArcEdgeStyle({
            stroke: '5px dashed darkorange',
            height: StylesSupport.getArcHeight(edge)
          })
        })
    )
  }

  /**
   * Builds the initial graph from FlightData.
   */
  function createGraph() {
    // prepare the styles for the graph
    const graph = graphComponent.graph
    StylesSupport.initializeDefaultStyles(graph)

    // read the graph from the data
    const builder = new yfiles.binding.GraphBuilder(graph)
    builder.nodesSource = FlightData.nodes
    builder.nodeIdBinding = 'id'
    builder.nodeLabelBinding = tag => tag.name || null
    builder.edgesSource = FlightData.edges
    builder.sourceNodeBinding = 'from'
    builder.targetNodeBinding = 'to'
    graphComponent.graph = builder.buildGraph()
  }

  run()
})
