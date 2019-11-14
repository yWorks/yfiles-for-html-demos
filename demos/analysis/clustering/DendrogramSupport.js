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

define([
  'yfiles/view-editor',
  './DemoVisuals.js',
  'yfiles/view-layout-bridge',
  'yfiles/layout-hierarchic'
], (/** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles, DemoVisuals) => {
  /**
   * Responsible for building a dendrogram graph based on the result of the hierarchical clustering algorithm. As
   * input, the original graph that is the graph that will be clustered is also needed.
   */
  class DendrogramComponent {
    /**
     * Creates a new instance of a dendrogram component.
     * @param {yfiles.view.GraphComponent} graphComponent
     */
    constructor(graphComponent) {
      this.dendrogramComponent = new yfiles.view.GraphComponent('dendrogramGraphComponent')
      this.graphComponent = graphComponent
      this.init()
      this.initializeInputMode()
      this.initializeGraph()
    }

    /**
     * Initializes the input mode for this component.
     */
    initializeInputMode() {
      const mode = new yfiles.input.GraphEditorInputMode({
        allowCreateNode: false,
        allowCreateEdge: false,
        movableItems: yfiles.graph.GraphItemTypes.NONE,
        showHandleItems: yfiles.graph.GraphItemTypes.NONE,
        labelEditableItems: yfiles.graph.GraphItemTypes.NONE,
        deletableItems: yfiles.graph.GraphItemTypes.NONE,
        allowClipboardOperations: false
      })
      mode.itemHoverInputMode.hoverItems = yfiles.graph.GraphItemTypes.NODE
      mode.itemHoverInputMode.discardInvalidItems = false
      mode.itemHoverInputMode.addHoveredItemChangedListener(this.onHoveredItemChanged.bind(this))

      mode.moveInputMode.moveCursor = yfiles.view.Cursor.NS_RESIZE
      this.dendrogramComponent.inputMode = mode
    }

    /**
     * Sets the default styles for the component's graph.
     */
    initializeGraph() {
      const graph = this.dendrogramComponent.graph
      this.defaultNodeStyle = new yfiles.styles.ShapeNodeStyle({
        shape: 'ellipse',
        fill: 'rgb(51, 102, 153)',
        stroke: null
      })
      graph.nodeDefaults.style = this.defaultNodeStyle

      this.defaultEdgeStyle = new yfiles.styles.PolylineEdgeStyle({
        stroke: '3px gray'
      })

      graph.edgeDefaults.style = this.defaultEdgeStyle

      graph.nodeDefaults.labels.style = new yfiles.styles.DefaultLabelStyle({
        textSize: 8
      })

      graph.nodeDefaults.size = new yfiles.geometry.Size(10, 10)

      const defaultLabelModel = new yfiles.graph.ExteriorLabelModel({ insets: 3 })
      graph.nodeDefaults.labels.layoutParameter = defaultLabelModel.createParameter(
        yfiles.graph.ExteriorLabelModelPosition.NORTH_EAST
      )

      this.dendrogramComponent.highlightIndicatorManager = new HighlightManager(
        this.dendrogramComponent
      )
    }

    /**
     * Generates the dendrogram graph.
     * @param {yfiles.algorithms.Dendrogram} dendrogram The result of the previous clustering algorithm.
     * @param {yfiles.layout.YGraphAdapter} graphAdapter The graph adapter.
     * @return {Promise} a promise which resolves when the dendrogram is created and a layout algorithm is applied.
     */
    generateDendrogram(dendrogram, graphAdapter) {
      const hierarchicalGraph = this.dendrogramComponent.graph
      hierarchicalGraph.clear()
      // remove visuals
      this.removeVisuals()

      if (dendrogram.nodeCount === 0) {
        return Promise.resolve()
      }

      // the idea is to create the hierarchical graph from the dendrogram structure that is returned from the
      // clustering algorithm
      const root = dendrogram.root
      const dendro2hierarchical = new yfiles.collections.Mapper()
      const hierarchical2dendro = new yfiles.collections.Mapper()
      const node2parent = new yfiles.collections.Mapper()

      const layers = new yfiles.collections.Mapper()

      const stack = [root]
      while (stack.length > 0) {
        const node = stack.pop()

        // for each node of the dendrogram, we create a node for the hierarchical clustered graph.
        const hierarchicClusteredNode = hierarchicalGraph.createNode()
        dendro2hierarchical.set(node, hierarchicClusteredNode)
        hierarchical2dendro.set(hierarchicClusteredNode, node)

        if (dendrogram.isLeaf(node)) {
          const adapterNode = dendrogram.getOriginalNode(node)
          const originalGraphNode = graphAdapter.getOriginalNode(adapterNode)
          // maps the node of the original graph component with the node of the hierarchical clustered graph
          this.originalGraph2hierarchic.set(originalGraphNode, hierarchicClusteredNode)
          this.hierarchic2originalGraph.set(hierarchicClusteredNode, originalGraphNode)
          hierarchicClusteredNode.tag = {
            distance: dendrogram.getDissimilarityValue(node),
            leaf: true
          }
        } else {
          hierarchicClusteredNode.tag = {
            distance: dendrogram.getDissimilarityValue(node),
            leaf: false
          }
        }

        // for each parent-child relationship, we create an edge and we store the layer to which each hierarchical
        // node belongs.
        const parent = node2parent.get(node)
        if (parent) {
          // create an edge between parent-children
          const dendrogramParent = dendro2hierarchical.get(parent)
          hierarchicalGraph.createEdge(dendrogramParent, hierarchicClusteredNode)
          layers.set(hierarchicClusteredNode, layers.get(dendrogramParent) + 1)
        } else {
          layers.set(hierarchicClusteredNode, 0)
        }

        const children = dendrogram.getChildren(node)
        children.forEach(child => {
          node2parent.set(child, node)
          stack.push(child)
        })
      }

      // calculate the distance values and move all leaf-nodes to the bottommost layer
      const distanceValues = new yfiles.collections.Mapper()
      hierarchicalGraph.nodes.forEach(node => {
        // move all leaves at the bottom-most layers
        if (hierarchicalGraph.outDegree(node) === 0) {
          layers.set(node, dendrogram.levelCount - 1)
        } else {
          hierarchicalGraph.addLabel(
            node,
            `${Math.ceil(dendrogram.getDissimilarityValue(hierarchical2dendro.get(node)))}`
          )
        }
        // adjust the distances
        distanceValues.set(
          node,
          Math.ceil(dendrogram.getDissimilarityValue(hierarchical2dendro.get(node)))
        )
      })

      this.hierarchicClusteredGraph = this.dendrogramComponent.graph

      // run the custom layout
      const dendrogramLayout = new DendrogramLayout()
      // register mappers for the distance values and the layers needed for the layout calculation
      hierarchicalGraph.mapperRegistry.addMapper(
        yfiles.graph.INode.$class,
        yfiles.lang.Number.$class,
        DendrogramLayout.DISTANCE_VALUES_DP_KEY,
        distanceValues
      )
      hierarchicalGraph.mapperRegistry.addMapper(
        yfiles.graph.INode.$class,
        yfiles.lang.Number.$class,
        DendrogramLayout.LAYER_ID_DP_KEY,
        layers
      )

      return this.dendrogramComponent.morphLayout(dendrogramLayout, '0.5s').then(() => {
        // determine the maxY coordinate needed for the creation of the visual objects
        this.dendrogramMaxY = dendrogramLayout.maxY

        // create the axis visual
        this.createAxisVisual(dendrogram.getDissimilarityValue(dendrogram.root))
        // create the cut-off visual
        this.createCutoffVisual()
        this.dendrogramComponent.fitGraphBounds(new yfiles.geometry.Insets(60, 20, 20, 20))
      })
    }

    /**
     * Create the axis visual.
     * @param {number} maxDissimilarityValue The maximum distance value occurred by the clustering algorithm
     */
    createAxisVisual(maxDissimilarityValue) {
      const contentRect = this.dendrogramComponent.contentRect
      const axisVisual = new DemoVisuals.AxisVisual(maxDissimilarityValue, contentRect)
      this.axisCanvasObject = this.dendrogramComponent.backgroundGroup.addChild(
        axisVisual,
        yfiles.view.ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
      )
    }

    /**
     * Create the cut-off visual.
     */
    createCutoffVisual() {
      // creates the move input mode that manages the movement of the rectangle
      const modeInputMode = this.dendrogramComponent.inputMode.moveInputMode
      const contentRect = this.dendrogramComponent.contentRect

      // create a rectangle with width 2
      const rectangle = new yfiles.geometry.MutableRectangle(
        contentRect.x - 20,
        contentRect.y,
        contentRect.width + 40,
        2
      )

      // create the move input mode so that the rectangle is movable
      const moveInputMode = new yfiles.input.MoveInputMode()
      modeInputMode.hitTestable = yfiles.input.IHitTestable.create((context, location) => {
        const eps = context.hitTestRadius + 3 / context.zoom
        return rectangle.containsWithEps(location, eps)
      })

      // create the handlers to move the rectangle
      modeInputMode.positionHandler = new CutOffPositionHandler(
        rectangle,
        this.dendrogramComponent.contentRect
      )

      // add the dragging listener that will send the up-to-date cut-off value
      modeInputMode.addDraggingListener(() => {
        if (this.cutOffVisual) {
          this.cutOffVisual.cutOffValue = Math.ceil(
            this.dendrogramMaxY - this.cutOffVisual.rectangle.center.y + 1
          )
        }
      })

      // add the drag finished listener that will fire the drag finished event
      modeInputMode.addDragFinishedListener(() => {
        this.dragFinishedListener.call(this, this.cutOffVisual.cutOffValue)
      })

      modeInputMode.priority = 1
      this.dendrogramComponent.inputMode.add(moveInputMode)

      // create the cut-off visual and add it to the highlight group of the graph component
      this.cutOffVisual = new DemoVisuals.CutoffVisual(rectangle, this.dendrogramMaxY)
      this.cutOffCanvasObject = this.dendrogramComponent.highlightGroup.addChild(
        this.cutOffVisual,
        yfiles.view.ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
      )
    }

    /**
     * Updates the color of the given graph node based on the cut-off rectangle's position.
     * @param {yfiles.graph.INode} graphNode The node of the original graph component
     * @param {yfiles.view.Color} color The color to set
     */
    updateNodeState(graphNode, color) {
      const node = this.originalGraph2hierarchic.get(graphNode)
      if (node) {
        // adjust the node style
        const fill = new yfiles.view.SolidColorFill(color.r, color.g, color.b)
        const updatedNodeStyle = new yfiles.styles.ShapeNodeStyle({
          shape: 'ellipse',
          fill,
          stroke: null
        })
        this.hierarchicClusteredGraph.setStyle(node, updatedNodeStyle)
        this.visited.add(node)

        // update also the color of all nodes that lie below the node with the same color so that all nodes that
        // belong to the same cluster have the same color
        const cutOff = Math.round(this.dendrogramMaxY - this.cutOffVisual.rectangle.y - 1)
        const stack = [node]
        while (stack.length > 0) {
          const n = stack.pop()
          this.hierarchicClusteredGraph.inEdgesAt(n).forEach(edge => {
            const source = edge.sourceNode
            const target = edge.targetNode
            if (source.tag.distance < cutOff && target.tag.distance < cutOff) {
              const updatedEdgeStyle = new yfiles.styles.PolylineEdgeStyle({
                stroke: new yfiles.view.Stroke({
                  fill,
                  thickness: 3
                })
              })
              this.hierarchicClusteredGraph.setStyle(edge, updatedEdgeStyle)
              if (!this.visited.has(source)) {
                this.hierarchicClusteredGraph.setStyle(source, updatedNodeStyle)
                this.visited.add(source)
              }
              if (!this.visited.has(target)) {
                this.hierarchicClusteredGraph.setStyle(target, updatedNodeStyle)
                this.visited.add(target)
              }
              stack.push(source)
            }
          })
        }
      }
    }

    /**
     * Determines the subtree for the given node.
     * @param {yfiles.graph.INode} node The given node
     * @return {Array}
     */
    determineSubtree(node) {
      const adapter = new yfiles.layout.YGraphAdapter(this.hierarchicClusteredGraph)
      const adapterSubtreeNodes = new yfiles.algorithms.NodeList()
      yfiles.algorithms.Trees.collectSubtree(adapter.getCopiedNode(node), adapterSubtreeNodes)
      const subtreeNodes = []
      adapterSubtreeNodes.forEach(n => {
        subtreeNodes.push(adapter.getOriginalNode(n))
      })
      return subtreeNodes
    }

    /**
     * Called when a node of the hierarchical clustered graph is hovered to highlight the corresponding nodes of the
     * original graph.
     * @param {Object} sender The source of the event
     * @param {yfiles.input.HoveredItemChangedEventArgs} event The hover event
     */
    onHoveredItemChanged(sender, event) {
      const highlightIndicatorManager = this.dendrogramComponent.highlightIndicatorManager
      highlightIndicatorManager.clearHighlights()
      const originalGraphElements = []
      const item = event.item
      if (item) {
        if (yfiles.graph.INode.isInstance(item)) {
          highlightIndicatorManager.addHighlight(item)
          if (item.labels.size > 0) {
            highlightIndicatorManager.addHighlight(item.labels.get(0))
          }
          if (item.tag.leaf) {
            const originalGraphNode = this.hierarchic2originalGraph.get(item)
            if (originalGraphNode) {
              originalGraphElements.push(originalGraphNode)
            }
          } else {
            const subtreeNodes = this.determineSubtree(item)
            subtreeNodes.forEach(element => {
              if (yfiles.graph.INode.isInstance(element)) {
                const originalGraphNode = this.hierarchic2originalGraph.get(element)
                if (originalGraphNode) {
                  originalGraphElements.push(originalGraphNode)
                }
              }
              highlightIndicatorManager.addHighlight(element)
            })
          }
        }
      }
      if (this.highlightListener) {
        this.highlightListener.call(this, originalGraphElements)
      }
    }

    /**
     * Updates the highlight for the given node.
     * @param {yfiles.graph.INode} item The given node
     */
    updateHighlight(item) {
      const highlightIndicatorManager = this.dendrogramComponent.highlightIndicatorManager
      highlightIndicatorManager.clearHighlights()
      if (item) {
        const hierarchicNode = this.originalGraph2hierarchic.get(item)
        if (hierarchicNode) {
          highlightIndicatorManager.addHighlight(hierarchicNode)
        }
      }
    }

    /**
     * Sets the default styles to nodes and edges.
     */
    resetStyles() {
      this.hierarchicClusteredGraph.nodes.forEach(node => {
        this.hierarchicClusteredGraph.setStyle(node, this.defaultNodeStyle)
      })
      this.hierarchicClusteredGraph.edges.forEach(edge => {
        this.hierarchicClusteredGraph.setStyle(edge, this.defaultEdgeStyle)
      })
      this.visited.clear()
    }

    /**
     * Removes the visuals.
     */
    removeVisuals() {
      if (this.axisCanvasObject) {
        this.axisCanvasObject.remove()
        this.axisCanvasObject = null
      }

      if (this.cutOffCanvasObject) {
        this.cutOffCanvasObject.remove()
        this.cutOffCanvasObject = null
      }
    }

    /**
     * Adds a listener invoked when dragging is happening.
     * @param {function} listener The listener to add
     */
    addDraggingListener(listener) {
      this.draggingListener = listener
    }

    /**
     * Removes the listener invoked when dragging is happening.
     * @param {function} listener The listener to remove
     */
    removeDraggingListener(listener) {
      if (this.draggingListener === listener) {
        this.draggingListener = null
      }
    }

    /**
     * Adds a listener invoked when dragging has finished.
     * @param {function} listener The listener to add
     */
    addDragFinishedListener(listener) {
      this.dragFinishedListener = listener
    }

    /**
     * Removes the listener invoked when dragging has finished.
     * @param {function} listener The listener to remove
     */
    removeDragFinishedListener(listener) {
      if (this.dragFinishedListener === listener) {
        this.dragFinishedListener = null
      }
    }

    /**
     * Adds the listener invoked when the hovered nodes of the timeline graph change.
     * @param {function} listener The listener to add
     */
    addHighlightChangedListener(listener) {
      this.highlightListener = listener
    }

    /**
     * Removes the listener invoked when the hovered nodes of the timeline graph change.
     * @param {function} listener The listener to remove
     */
    removeHighlightChangedListener(listener) {
      if (this.highlightListener === listener) {
        this.highlightListener = null
      }
    }

    /**
     * Determines whether the component should be visible or not.
     * @param {boolean} showDendrogram True if the component should be visible, false otherwise
     */
    toggleVisibility(showDendrogram) {
      this.dendrogramComponent.div.style.display = showDendrogram ? 'inline' : 'none'
    }

    init() {
      this.axisCanvasObject = null
      this.cutOffCanvasObject = null
      this.dendrogramMaxY = 0
      this.hierarchic2originalGraph = new yfiles.collections.Mapper()
      this.originalGraph2hierarchic = new yfiles.collections.Mapper()
      this.visited = new Set()
      this.defaultNodeStyle = null
      this.defaultEdgeStyle = null
    }
  }

  /**
   * This class creates the layout of the hierarchical clustered graph. The layout is based on the hierarchic layout
   * algorithm but, the minimum length of each edge has to be equal to the distance provided by the clustering
   * algorithm between the source and target nodes of the edge. Also, a custom layering has to be used so that the
   * leaf nodes are always on the bottommost layer, while all other nodes are layered according to the order occurred
   * by the hierarchical clustering algorithm.
   */
  class DendrogramLayout extends yfiles.lang.Class(yfiles.layout.ILayoutAlgorithm) {
    /**
     * Gets the data provider key for storing the distances between the nodes.
     * @return {String}
     */
    static get DISTANCE_VALUES_DP_KEY() {
      return 'DISTANCE_VALUES_DP_KEY'
    }

    /**
     * Gets the data provider key for storing the layer IDs.
     * @return {yfiles.algorithms.NodeDpKey<number>}
     */
    static get LAYER_ID_DP_KEY() {
      return yfiles.hierarchic.GivenLayersLayerer.LAYER_ID_DP_KEY
    }

    /**
     * Sets the maximum y-coordinate that corresponds to the maximum distance value.
     * @param {number} maxY The maximum y-coordinate
     */
    set maxY(maxY) {
      this.$maxY = maxY
    }

    /**
     * Gets the maximum y-coordinate that corresponds to the maximum distance value.
     * @return {number}  The maximum y-coordinate
     */
    get maxY() {
      return this.$maxY
    }

    /**
     * Applies the layout to the given graph
     * @param {yfiles.layout.LayoutGraph} graph The graph to apply the layout
     */
    applyLayout(graph) {
      // run the hierarchic layout
      const hierarchicLayout = new yfiles.hierarchic.HierarchicLayout()
      hierarchicLayout.orthogonalRouting = true
      hierarchicLayout.minimumLayerDistance = 0
      hierarchicLayout.minimumNodeDistance = 4
      hierarchicLayout.edgeToEdgeDistance = 0

      // use the GivenLayersLayerer, so that the layer of the nodes are consistent to their layers determined by the
      // clustering dendrogram
      if (graph.getDataProvider(DendrogramLayout.LAYER_ID_DP_KEY)) {
        hierarchicLayout.fixedElementsLayerer = new yfiles.hierarchic.GivenLayersLayerer()
        hierarchicLayout.fromScratchLayeringStrategy =
          yfiles.hierarchic.LayeringStrategy.USER_DEFINED
      }
      const sourcePortConstraints = yfiles.algorithms.Maps.createHashedEdgeMap()
      const targetPortConstraints = yfiles.algorithms.Maps.createHashedEdgeMap()
      const edgeLayoutDescriptors = yfiles.algorithms.Maps.createHashedEdgeMap()

      const distanceValues = graph.getDataProvider(DendrogramLayout.DISTANCE_VALUES_DP_KEY)

      graph.nodes.forEach(node => {
        const edges = node.outEdges.toArray()
        if (edges.length > 0) {
          // apply port constraints so that one of the edges adjacent to the source node uses the right side while
          // the other edge the left side
          sourcePortConstraints.set(
            edges[0],
            yfiles.layout.PortConstraint.create(yfiles.layout.PortSide.EAST, true)
          )
          sourcePortConstraints.set(
            edges[1],
            yfiles.layout.PortConstraint.create(yfiles.layout.PortSide.WEST, true)
          )
          // edges at the target nodes are always connected from the top side
          targetPortConstraints.set(
            edges[0],
            yfiles.layout.PortConstraint.create(yfiles.layout.PortSide.NORTH, true)
          )
          targetPortConstraints.set(
            edges[1],
            yfiles.layout.PortConstraint.create(yfiles.layout.PortSide.NORTH, true)
          )
        }
      })

      // use the difference of the distances between the source and the target node as minimum length
      graph.edges.forEach(edge => {
        const edgeLength = distanceValues.get(edge.source) - distanceValues.get(edge.target)
        const eld = new yfiles.hierarchic.EdgeLayoutDescriptor()
        eld.minimumLength = edgeLength
        eld.minimumLastSegmentLength = 0
        eld.minimumFirstSegmentLength = 0
        edgeLayoutDescriptors.set(edge, eld)
      })

      graph.addDataProvider(
        yfiles.layout.PortConstraintKeys.SOURCE_PORT_CONSTRAINT_DP_KEY,
        sourcePortConstraints
      )
      graph.addDataProvider(
        yfiles.layout.PortConstraintKeys.TARGET_PORT_CONSTRAINT_DP_KEY,
        targetPortConstraints
      )
      graph.addDataProvider(
        yfiles.hierarchic.HierarchicLayoutCore.EDGE_LAYOUT_DESCRIPTOR_DP_KEY,
        edgeLayoutDescriptors
      )

      // apply the layout
      hierarchicLayout.applyLayout(graph)

      // now we have to adjust the y-coordinates of the nodes, so that the y-coordinate of each node equals exactly
      // to distance between the source and the target node
      const layersMap = new Map()
      const layers = graph.getDataProvider(DendrogramLayout.LAYER_ID_DP_KEY)

      let maxYValue = -Number.MIN_VALUE
      let maxDistanceValue = -Number.MIN_VALUE
      graph.nodes.forEach(node => {
        const layer = layers.get(node)
        if (!layersMap.get(layer)) {
          layersMap.set(layer, [])
        }
        layersMap.get(layer).push(node)
        maxYValue = Math.max(graph.getCenterY(node), maxYValue)
        maxDistanceValue = Math.max(distanceValues.get(node), maxDistanceValue)
      })

      this.maxY = -Number.MIN_VALUE
      layersMap.forEach(layerNodes => {
        layerNodes.forEach(node => {
          const distanceValue = distanceValues.get(node)
          const newY = maxYValue - distanceValue
          // adjust the node center
          graph.setCenter(node, graph.getCenterX(node), newY)

          node.outEdges.forEach(edge => {
            // move also the bends
            const points = graph.getPointList(edge)
            const newBendPositions = new yfiles.algorithms.YList()
            points.forEach(point => {
              newBendPositions.add(new yfiles.algorithms.YPoint(point.x, newY))
            })
            graph.setPoints(edge, newBendPositions)
          })

          this.maxY = Math.max(graph.getCenterY(node), this.maxY)
        })
      })

      // move each node to the x direction so that each node lies in the center of the distance between the two first
      // bends of the
      this.adjustXCoordinates(graph, graph.nodes.firstOrDefault())

      graph.edges.forEach(edge => {
        const updatedPath = new yfiles.algorithms.YList()
        updatedPath.add(
          new yfiles.algorithms.YPoint(graph.getCenterX(edge.target), graph.getCenterY(edge.source))
        )
        graph.setPoints(edge, updatedPath)
      })
    }

    /**
     * Move each node to the x-direction so that each node lies in the center of the distance between the two first
     * bends of the adjacent edges.
     * The graph should be traversed such that each time first the children of the root are examined and then, the
     * root.
     * @param {yfiles.layout.LayoutGraph} graph The given graph
     * @param {yfiles.algorithms.Node} root The root node
     */
    adjustXCoordinates(graph, root) {
      if (!root) {
        return
      }
      root.outEdges.forEach(edge => {
        this.adjustXCoordinates(graph, edge.target)
      })

      if (root.outDegree > 0) {
        const outEdges = root.outEdges.toArray()
        const target1X = graph.getCenterX(outEdges[0].target)
        const target2X = graph.getCenterX(outEdges[1].target)
        graph.setCenter(root, (target1X + target2X) * 0.5, graph.getCenterY(root))
      }
    }
  }

  /**
   * Creates the position handles for the timeline component.
   */
  class CutOffPositionHandler extends yfiles.lang.Class(yfiles.input.IPositionHandler) {
    /**
     * Creates a position handler for the timeline.
     * @param {yfiles.geometry.IMutableRectangle} rectangle The rectangle to read and write its location to.
     * @param {yfiles.geometry.Rect} boundaryRectangle The content rectangle of the timeline component.
     */
    constructor(rectangle, boundaryRectangle) {
      super()
      this.rectangle = rectangle
      this.offset = new yfiles.geometry.MutablePoint()
      this.boundaryRectangle = boundaryRectangle
    }

    /**
     * The last "drag-location" during dragging.
     * It helps calculating the current position of the rectangle and finding out if there was any movement.
     * @type {yfiles.geometry.Point}
     */
    get location() {
      return this.rectangle.topLeft
    }

    /**
     * Stores the initial location of the movement for reference, and calls the base method.
     * @param {yfiles.input.IInputModeContext} context The context to retrieve information
     */
    initializeDrag(context) {
      this.offset.y = this.location.y - context.canvasComponent.lastMouseEvent.location.y
    }

    /**
     * Constrains the movement to the horizontal axis.
     * @param {yfiles.input.IInputModeContext} context The context to retrieve information
     * @param {yfiles.geometry.Point} originalLocation The value of the location property at the time of
     *   initializeDrag
     * @param {yfiles.geometry.Point} newLocation The new location in the world coordinate system
     * @return {boolean}
     */
    handleMove(context, originalLocation, newLocation) {
      const newY = this.getY(newLocation.y + this.offset.y)
      this.rectangle.relocate(new yfiles.geometry.Point(this.rectangle.x, newY))
    }

    /**
     * Invoked when dragging has finished.
     * @param {yfiles.input.IInputModeContext} context The context to retrieve information
     * @param {yfiles.geometry.Point} originalLocation The value of the location property at the time of
     *   initializeDrag
     * @param {yfiles.geometry.Point} newLocation The new location in the world coordinate system
     */
    dragFinished(context, originalLocation, newLocation) {
      const newY = this.getY(newLocation.y + this.offset.y)
      this.rectangle.relocate(new yfiles.geometry.Point(this.rectangle.x, newY))
    }

    /**
     * Invoked when dragging was cancelled.
     * @param {yfiles.input.IInputModeContext} context The context to retrieve information
     * @param {yfiles.geometry.Point} originalLocation The value of the location property at the time of
     *   initializeDrag
     */
    cancelDrag(context, originalLocation) {
      this.rectangle.relocate(originalLocation)
    }

    /**
     * Returns the next x position. If the rectangle reaches the borders of the boundary rectangle, the position
     * changes accordingly such that the rectangle fits in the timeline.
     * @param {number} nextPositionY The next y-position
     * @return number The next x coordinate of the rectangle.
     */
    getY(nextPositionY) {
      const y1 = this.boundaryRectangle.y
      const y2 = this.boundaryRectangle.y + this.boundaryRectangle.height
      // check if the next position is within the boundary rectangle borders
      if (nextPositionY <= y1) {
        return y1
      } else if (nextPositionY + this.rectangle.height >= y2) {
        return y2 - this.rectangle.height
      }

      return nextPositionY
    }
  }

  /**
   * A highlight manager responsible for highlighting the dendrogram elements.
   * @extends yfiles.view.HighlightIndicatorManager
   */
  class HighlightManager extends yfiles.view.HighlightIndicatorManager {
    /**
     * Creates a new instance of HighlightManager.
     * @param {yfiles.view.CanvasComponent} canvas
     */
    constructor(canvas) {
      super(canvas)
      const graphModelManager = this.canvasComponent.graphModelManager
      // the edges' highlight group should be above the nodes
      this.edgeHighlightGroup = graphModelManager.contentGroup.addGroup()
      this.edgeHighlightGroup.below(graphModelManager.nodeGroup)

      // the nodes' highlight group should be above the nodes
      this.nodeHighlightGroup = graphModelManager.contentGroup.addGroup()
      this.nodeHighlightGroup.above(graphModelManager.nodeGroup)
    }

    /**
     * This implementation always returns the highlightGroup of the canvasComponent of this instance.
     * @param {yfiles.graph.IModelItem} item The item to check
     * @return {yfiles.view.ICanvasObjectGroup} An ICanvasObjectGroup or null
     */
    getCanvasObjectGroup(item) {
      if (yfiles.graph.IEdge.isInstance(item)) {
        return this.edgeHighlightGroup
      } else if (yfiles.graph.INode.isInstance(item)) {
        return this.nodeHighlightGroup
      }
      return super.getCanvasObjectGroup(item)
    }

    /**
     * Callback used by install to retrieve the installer for a given item.
     * @param {yfiles.graph.IModelItem} item The item to find an installer for
     * @return {yfiles.view.ICanvasObjectInstaller}
     */
    getInstaller(item) {
      if (yfiles.graph.INode.isInstance(item)) {
        return new yfiles.view.NodeStyleDecorationInstaller({
          margins: 3,
          zoomPolicy: yfiles.view.StyleDecorationZoomPolicy.MIXED,
          nodeStyle: new yfiles.styles.ShapeNodeStyle({
            shape: 'ellipse',
            fill: item.style.fill,
            stroke: null
          })
        })
      } else if (yfiles.graph.IEdge.isInstance(item)) {
        const fill = item.style.stroke.fill
        return new yfiles.view.EdgeStyleDecorationInstaller({
          edgeStyle: new yfiles.styles.PolylineEdgeStyle({
            stroke: new yfiles.view.Stroke(fill, 4)
          }),
          zoomPolicy: yfiles.view.StyleDecorationZoomPolicy.MIXED
        })
      } else if (yfiles.graph.ILabel.isInstance(item)) {
        return new yfiles.view.LabelStyleDecorationInstaller({
          margins: 3,
          zoomPolicy: yfiles.view.StyleDecorationZoomPolicy.WORLD_COORDINATES,
          labelStyle: new yfiles.styles.DefaultLabelStyle({
            backgroundFill: 'white',
            font: 'bold'
          })
        })
      }
      return super.getInstaller(item)
    }
  }

  return {
    DendrogramComponent,
    CutOffPositionHandler
  }
})
