/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  BaseClass,
  Color,
  Cursor,
  DefaultLabelStyle,
  DendrogramNode,
  EdgeStyleDecorationInstaller,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  GivenLayersLayerer,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HierarchicLayout,
  HierarchicLayoutCore,
  HierarchicLayoutEdgeLayoutDescriptor,
  HierarchicLayoutLayeringStrategy,
  HierarchicalClusteringResult,
  HighlightIndicatorManager,
  ICanvasObjectDescriptor,
  ICanvasObjectGroup,
  ICanvasObjectInstaller,
  ICanvasObject,
  IEnumerable,
  IGraph,
  IEdge,
  IHitTestable,
  IInputModeContext,
  ILabel,
  ILayoutAlgorithm,
  IModelItem,
  IMutableRectangle,
  INode,
  IPositionHandler,
  Insets,
  LabelStyleDecorationInstaller,
  LayoutGraph,
  Mapper,
  Maps,
  NodeDpKey,
  MutablePoint,
  MutableRectangle,
  NodeStyleDecorationInstaller,
  Point,
  PolylineEdgeStyle,
  PortConstraint,
  PortConstraintKeys,
  PortSide,
  Rect,
  ShapeNodeStyle,
  Size,
  SolidColorFill,
  Stroke,
  StyleDecorationZoomPolicy,
  YList,
  YNode,
  YNumber,
  YPoint
} from 'yfiles'

import { AxisVisual, CutoffVisual, generateColors } from './DemoVisuals.js'
import { colorSets } from '../../resources/basic-demo-styles.js'

const DENDROGRAM_GRADIENT_START = Color.from(colorSets['demo-palette-42'].fill)
const DENDROGRAM_GRADIENT_END = Color.from(colorSets['demo-palette-44'].fill)
/**
 * Responsible for building a dendrogram graph based on the result of the hierarchical clustering algorithm.
 * The dendrogram is rendered in its own {@link GraphComponent}, the {@link dendrogramComponent}.
 * This also requires the graph that will be clustered (the original graph).
 */
export class DendrogramComponent {
  /**
   * Creates a new instance of a dendrogram component.
   * @param {!GraphComponent} graphComponent The {@link GraphComponent} which renders the original graph.
   */
  constructor(graphComponent) {
    this.graphComponent = graphComponent
    this.dendrogramComponent = new GraphComponent('dendrogramGraphComponent')
    this.defaultNodeStyle = new ShapeNodeStyle()
    this.defaultEdgeStyle = new PolylineEdgeStyle()

    // the idea is to create the hierarchical graph from the dendrogram structure that is returned from the
    // clustering algorithm
    this.dendro2hierarchical = new Mapper()

    this.hierarchical2dendro = new Mapper()

    // determine the maxY coordinate needed for the creation of the visual objects
    this.dendrogramMaxY = 0

    this.axisCanvasObject = null

    // create the cut-off visual and add it to the highlight group of the graph component
    this.cutOffVisual = null

    this.cutOffCanvasObject = null
    this.visited = new Set()
    this.dragFinishedListener = () => {}
    this.configureUserInteraction()

    this.configureGraph(this.dendrogramComponent.graph)
  }

  /**
   * Configures user interaction for the dendrogram component.
   */
  configureUserInteraction() {
    const mode = new GraphEditorInputMode({
      allowCreateNode: false,
      allowCreateEdge: false,
      movableItems: GraphItemTypes.NONE,
      showHandleItems: GraphItemTypes.NONE,
      labelEditableItems: GraphItemTypes.NONE,
      deletableItems: GraphItemTypes.NONE,
      selectableItems: GraphItemTypes.NONE,
      focusableItems: GraphItemTypes.NONE,
      allowClipboardOperations: false
    })
    mode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE
    mode.itemHoverInputMode.discardInvalidItems = false
    mode.itemHoverInputMode.addHoveredItemChangedListener((sender, evt) =>
      this.onHoveredItemChanged(evt.item)
    )
    mode.marqueeSelectionInputMode.enabled = false

    mode.moveInputMode.moveCursor = Cursor.NS_RESIZE

    this.dendrogramComponent.inputMode = mode
    this.dendrogramComponent.autoDrag = false
    this.dendrogramComponent.highlightIndicatorManager = new HighlightManager(
      this.dendrogramComponent
    )
  }

  /**
   * Sets the default styles for the given graph.
   * @param {!IGraph} graph The graph to configure.
   */
  configureGraph(graph) {
    this.defaultNodeStyle = new ShapeNodeStyle({
      shape: 'ellipse',
      fill: 'gray',
      stroke: null
    })
    graph.nodeDefaults.style = this.defaultNodeStyle

    this.defaultEdgeStyle = new PolylineEdgeStyle({
      stroke: '3px gray'
    })

    graph.edgeDefaults.style = this.defaultEdgeStyle

    graph.nodeDefaults.labels.style = new DefaultLabelStyle({
      textSize: 8
    })

    graph.nodeDefaults.size = new Size(10, 10)

    const defaultLabelModel = new ExteriorLabelModel({ insets: 3 })
    graph.nodeDefaults.labels.layoutParameter = defaultLabelModel.createParameter(
      ExteriorLabelModelPosition.NORTH_EAST
    )
  }

  /**
   * Generates the dendrogram graph.
   * @param {!HierarchicalClusteringResult} result The result of the clustering algorithm
   * @param cutoff The given cutoff value
   * @param {number} [cutoff]
   */
  generateDendrogram(result, cutoff) {
    const hierarchicalGraph = this.dendrogramComponent.graph
    this.clearDendrogram(cutoff)
    const dendrogramRoot = result.dendrogramRoot

    // the idea is to create the hierarchical graph from the dendrogram structure that is returned from the
    // clustering algorithm
    this.dendro2hierarchical.clear()
    this.hierarchical2dendro.clear()

    const layers = new Mapper()

    let maxLayer = 0
    const stack = [dendrogramRoot]
    while (stack.length > 0) {
      const node = stack.pop()

      // for each node of the dendrogram, we create a node for the hierarchical clustered graph.
      const hierarchicClusteredNode = hierarchicalGraph.createNode()
      this.dendro2hierarchical.set(node, hierarchicClusteredNode)
      this.hierarchical2dendro.set(hierarchicClusteredNode, node)

      // for each parent-child relationship, we create an edge and we store the layer to which each hierarchical
      // node belongs.
      const parent = node.parent
      let layer = 0
      if (parent) {
        // create an edge between parent-children
        const dendrogramParent = this.dendro2hierarchical.get(parent)
        hierarchicalGraph.createEdge(dendrogramParent, hierarchicClusteredNode)
        layer = layers.get(dendrogramParent) + 1
      }
      layers.set(hierarchicClusteredNode, layer)
      maxLayer = Math.max(layer, maxLayer)

      node.children.forEach(child => {
        stack.push(child)
      })
    }

    // calculate the distance values and move all leaf-nodes to the bottommost layer
    const distanceValues = new Mapper()
    hierarchicalGraph.nodes.forEach(node => {
      // move all leaves at the bottom-most layers
      if (hierarchicalGraph.outDegree(node) === 0) {
        layers.set(node, maxLayer - 1)
      } else {
        hierarchicalGraph.addLabel(
          node,
          `${Math.ceil(this.hierarchical2dendro.get(node).dissimilarityValue)}`
        )
      }
      // adjust the distances
      distanceValues.set(node, Math.ceil(this.hierarchical2dendro.get(node).dissimilarityValue))
    })

    // run the custom layout
    const dendrogramLayout = new DendrogramLayout()
    // register mappers for the distance values and the layers needed for the layout calculation
    hierarchicalGraph.mapperRegistry.addMapper(
      INode.$class,
      YNumber.$class,
      DendrogramLayout.DISTANCE_VALUES_DP_KEY,
      distanceValues
    )
    hierarchicalGraph.mapperRegistry.addMapper(
      INode.$class,
      YNumber.$class,
      DendrogramLayout.LAYER_ID_DP_KEY,
      layers
    )

    // apply the layout
    this.dendrogramComponent.graph.applyLayout(dendrogramLayout)
    this.dendrogramComponent.updateContentRect()

    // if there is no cutoff value, we do not have to create new visuals, only to update the nodes/edges styles to
    // match their corresponding clustering color
    if (!cutoff) {
      // determine the maxY coordinate needed for the creation of the visual objects
      this.dendrogramMaxY = dendrogramLayout.maxY
      // create the axis visual
      this.createAxisVisual(dendrogramRoot.dissimilarityValue)
      // create the cut-off visual
      this.createCutoffVisual()
      // the cut-off visual has now sensibly placed itself, so we can set the initial cutoff to it's value
      cutoff = this.cutOffVisual.cutOffValue
      this.dendrogramComponent.fitGraphBounds(new Insets(60, 60, 60, 60))
    }
    this.updateDendrogram(result, cutoff)
  }

  /**
   * Create the axis visual.
   * @param {number} maxDissimilarityValue The maximum distance value occurred by the clustering algorithm
   */
  createAxisVisual(maxDissimilarityValue) {
    const contentRect = this.dendrogramComponent.contentRect
    const axisVisual = new AxisVisual(maxDissimilarityValue, contentRect)
    this.axisCanvasObject = this.dendrogramComponent.backgroundGroup.addChild(
      axisVisual,
      ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
    )
  }

  /**
   * Create the cut-off visual.
   */
  createCutoffVisual() {
    // creates the move input mode that manages the movement of the rectangle
    const moveInputMode = this.dendrogramComponent.inputMode.moveInputMode
    const contentRect = this.dendrogramComponent.contentRect

    // create a rectangle with height 2
    const rectangle = new MutableRectangle(
      contentRect.x - 20,
      contentRect.y,
      contentRect.width + 40,
      2
    )

    // configure the move input mode so that the rectangle is movable
    moveInputMode.hitTestable = IHitTestable.create((context, location) => {
      const eps = context.hitTestRadius + 3 / context.zoom
      return rectangle.containsWithEps(location, eps)
    })

    // create the handlers to move the rectangle
    moveInputMode.positionHandler = new CutOffPositionHandler(
      rectangle,
      this.dendrogramComponent.contentRect
    )

    // add the dragging listener that will send the up-to-date cut-off value
    moveInputMode.addDraggingListener(() => {
      if (this.cutOffVisual) {
        this.cutOffVisual.cutOffValue = Math.ceil(
          this.dendrogramMaxY - this.cutOffVisual.rectangle.center.y + 1
        )
      }
    })

    // add the drag finished listener that will fire the drag finished event
    moveInputMode.addDragFinishedListener(() => {
      if (this.cutOffVisual) {
        this.dragFinishedListener(this.cutOffVisual.cutOffValue)
      }
    })

    moveInputMode.priority = 1

    // create the cut-off visual and add it to the highlight group of the graph component
    this.cutOffVisual = new CutoffVisual(rectangle, this.dendrogramMaxY)
    this.cutOffCanvasObject = this.dendrogramComponent.highlightGroup.addChild(
      this.cutOffVisual,
      ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
    )
  }

  /**
   * Updates the style of the hierarchical clustered graph so that they much with the colors of the original graph
   * @param {!HierarchicalClusteringResult} result The result of the clustering algorithm
   * @param {number} cutoff The given cutoff value
   */
  updateDendrogram(result, cutoff) {
    const colors = generateColors(
      DENDROGRAM_GRADIENT_START,
      DENDROGRAM_GRADIENT_END,
      result.clusters.size + 1
    )

    this.visited = new Set()
    result.clusters.forEach(cluster => {
      cluster.nodes.forEach(node => {
        // get the color of the cluster in the original graph
        const color = colors[result.nodeClusterIds.get(node)]
        if (result.getDendrogramNode(node)) {
          // go up until you find a parent whose cutoff value exceeds the given one and change the
          // its color and the color of its outgoing edges
          let parent = result.getDendrogramNode(node)
          while (parent && !this.visited.has(parent)) {
            // get the node in the hierarchical cluster graph and update its style
            if (parent.dissimilarityValue < cutoff && !this.visited.has(parent)) {
              const hierarchicalParent = this.dendro2hierarchical.get(parent)
              this.updateNodeStyle(hierarchicalParent, color)

              // update the style of the out-edges
              this.dendrogramComponent.graph.outEdgesAt(hierarchicalParent).forEach(edge => {
                this.updateEdgeStyle(edge, color)
              })
              this.visited.add(parent)
              parent = parent.parent
            } else {
              break
            }
          }
        }
      })
    })
  }

  /**
   * Updates the color of the given color
   * @param {!INode} node The node to update
   * @param {!Color} color The color to be used
   */
  updateNodeStyle(node, color) {
    const updatedNodeStyle = new ShapeNodeStyle({
      shape: 'ellipse',
      fill: new SolidColorFill(color.r, color.g, color.b),
      stroke: null
    })
    this.dendrogramComponent.graph.setStyle(node, updatedNodeStyle)
  }

  /**
   * Updates the color of the given edge
   * @param {!IEdge} edge The edge to update
   * @param {!Color} color The color to be used
   */
  updateEdgeStyle(edge, color) {
    const updatedEdgeStyle = new PolylineEdgeStyle({
      stroke: new Stroke({
        fill: new SolidColorFill(color.r, color.g, color.b),
        thickness: 3
      })
    })
    this.dendrogramComponent.graph.setStyle(edge, updatedEdgeStyle)
  }

  /**
   * Called when a node of the hierarchical clustered graph is hovered to highlight the corresponding nodes of the
   * original graph.
   * @param {!IModelItem} item The hovered item
   */
  onHoveredItemChanged(item) {
    const highlightIndicatorManager = this.dendrogramComponent.highlightIndicatorManager
    highlightIndicatorManager.clearHighlights()
    let nodesToHighlight = IEnumerable.from([])
    if (item && item instanceof INode) {
      // highlight the node of the hierarchical clustered graph
      highlightIndicatorManager.addHighlight(item)

      // get all descendants of this node from the dendrogram graph and highlight them too
      const dendrogramNode = this.hierarchical2dendro.get(item)
      const stack = [dendrogramNode]
      while (stack.length > 0) {
        const descendant = stack.pop()
        descendant.children.forEach(childNode => {
          highlightIndicatorManager.addHighlight(this.dendro2hierarchical.get(childNode))
          stack.push(childNode)
        })
      }
      nodesToHighlight = dendrogramNode.clusterNodes
    }

    // highlight also the nodes of the original graph that correspond to the highlighted node
    this.highlightNodes(nodesToHighlight)
  }

  /**
   * Highlights the given nodes of the original graph.
   * @param {!IEnumerable.<INode>} nodes The nodes of the original graph that will be highlighted.
   */
  highlightNodes(nodes) {
    const highlightManager = this.graphComponent.highlightIndicatorManager
    highlightManager.clearHighlights()
    nodes.forEach(node => {
      highlightManager.addHighlight(node)
    })
  }

  /**
   * Updates the highlight for the given node.
   * @param {!DendrogramNode} dendrogramNode The given node
   */
  updateHighlight(dendrogramNode) {
    const highlightIndicatorManager = this.dendrogramComponent.highlightIndicatorManager
    highlightIndicatorManager.clearHighlights()
    if (dendrogramNode) {
      const hierarchicalClusteredNode = this.dendro2hierarchical.get(dendrogramNode)
      highlightIndicatorManager.addHighlight(hierarchicalClusteredNode)
    }
  }

  /**
   * Clears the hierarchical clustered graph and removes the visuals.
   * @param cutoff the cut-off value
   * @param {number} [cutoff]
   */
  clearDendrogram(cutoff) {
    const hierarchicalGraph = this.dendrogramComponent.graph
    if (hierarchicalGraph.nodes.size > 0) {
      hierarchicalGraph.clear()
      if (!cutoff) {
        // remove visuals
        this.removeVisuals()
      }
    }
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
   * Adds a listener invoked when dragging has finished.
   * @param {!object} listener The listener to add
   */
  addDragFinishedListener(listener) {
    this.dragFinishedListener = listener
  }

  /**
   * Removes the listener invoked when dragging has finished.
   * @param {!object} listener The listener to remove
   */
  removeDragFinishedListener(listener) {
    if (this.dragFinishedListener === listener) {
      this.dragFinishedListener = () => {}
    }
  }

  /**
   * Determines whether the component should be visible or not.
   * @param {boolean} showDendrogram True if the component should be visible, false otherwise
   */
  toggleVisibility(showDendrogram) {
    this.dendrogramComponent.div.style.display = showDendrogram ? 'inline' : 'none'
  }
}

/**
 * This class creates the layout of the hierarchical clustered graph. The layout is based on the hierarchic layout
 * algorithm but the minimum length of each edge has to be equal to the distance provided by the clustering
 * algorithm between the source and target nodes of the edge. Also, a custom layering has to be used so that the
 * leaf nodes are always on the bottommost layer, while all other nodes are layered according to the order occurred
 * by the hierarchical clustering algorithm.
 */
class DendrogramLayout extends BaseClass(ILayoutAlgorithm) {
  constructor() {
    super()
    this.maxY = 0
  }

  /**
   * Gets the data provider key for storing the distances between the nodes.
   * @type {!string}
   */
  static get DISTANCE_VALUES_DP_KEY() {
    return 'DISTANCE_VALUES_DP_KEY'
  }

  /**
   * Gets the data provider key for storing the layer IDs.
   * @type {!NodeDpKey.<number>}
   */
  static get LAYER_ID_DP_KEY() {
    return GivenLayersLayerer.LAYER_ID_DP_KEY
  }

  /**
   * Applies the layout to the given graph
   * @param {!LayoutGraph} graph The graph to apply the layout
   */
  applyLayout(graph) {
    // run the hierarchic layout
    const hierarchicLayout = new HierarchicLayout()
    hierarchicLayout.orthogonalRouting = true
    hierarchicLayout.minimumLayerDistance = 0
    hierarchicLayout.edgeToEdgeDistance = 0

    // use the GivenLayersLayerer, so that the layer of the nodes are consistent to their layers determined by the
    // clustering dendrogram
    if (graph.getDataProvider(DendrogramLayout.LAYER_ID_DP_KEY)) {
      hierarchicLayout.fixedElementsLayerer = new GivenLayersLayerer()
      hierarchicLayout.fromScratchLayeringStrategy = HierarchicLayoutLayeringStrategy.USER_DEFINED
    }
    const sourcePortConstraints = Maps.createHashedEdgeMap()
    const targetPortConstraints = Maps.createHashedEdgeMap()
    const edgeLayoutDescriptors = Maps.createHashedEdgeMap()

    const distanceValues = graph.getDataProvider(DendrogramLayout.DISTANCE_VALUES_DP_KEY)

    graph.nodes.forEach(node => {
      const edges = node.outEdges.toArray()
      if (edges.length > 0) {
        // apply port constraints so that one of the edges adjacent to the source node uses the right side while
        // the other edge the left side
        sourcePortConstraints.set(edges[0], PortConstraint.create(PortSide.EAST, true))
        sourcePortConstraints.set(edges[1], PortConstraint.create(PortSide.WEST, true))
        // edges at the target nodes are always connected from the top side
        targetPortConstraints.set(edges[0], PortConstraint.create(PortSide.NORTH, true))
        targetPortConstraints.set(edges[1], PortConstraint.create(PortSide.NORTH, true))
      }
    })

    // use the difference of the distances between the source and the target node as minimum length
    graph.edges.forEach(edge => {
      const edgeLength = distanceValues.get(edge.source) - distanceValues.get(edge.target)
      edgeLayoutDescriptors.set(
        edge,
        new HierarchicLayoutEdgeLayoutDescriptor({
          minimumLength: edgeLength,
          minimumLastSegmentLength: 0,
          minimumFirstSegmentLength: 0
        })
      )
    })

    graph.addDataProvider(PortConstraintKeys.SOURCE_PORT_CONSTRAINT_DP_KEY, sourcePortConstraints)
    graph.addDataProvider(PortConstraintKeys.TARGET_PORT_CONSTRAINT_DP_KEY, targetPortConstraints)
    graph.addDataProvider(HierarchicLayoutCore.EDGE_LAYOUT_DESCRIPTOR_DP_KEY, edgeLayoutDescriptors)

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
          const newBendPositions = new YList()
          points.forEach(point => {
            newBendPositions.add(new YPoint(point.x, newY))
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
      const updatedPath = new YList()
      updatedPath.add(new YPoint(graph.getCenterX(edge.target), graph.getCenterY(edge.source)))
      graph.setPoints(edge, updatedPath)
    })
  }

  /**
   * Move each node to the x-direction so that each node lies in the center of the distance between the two first
   * bends of the adjacent edges.
   * The graph should be traversed such that each time first the children of the root are examined and then, the
   * root.
   * @param {!LayoutGraph} graph The given graph
   * @param {?YNode} root The root node
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
export class CutOffPositionHandler extends BaseClass(IPositionHandler) {
  /**
   * Creates a position handler for the timeline.
   * @param {!IMutableRectangle} rectangle The rectangle to read and write its location to.
   * @param {!Rect} boundaryRectangle The content rectangle of the timeline component.
   */
  constructor(rectangle, boundaryRectangle) {
    super()
    this.offset = new MutablePoint()
    this.rectangle = rectangle
    this.boundaryRectangle = boundaryRectangle
  }

  /**
   * The last "drag-location" during dragging.
   * It helps calculating the current position of the rectangle and finding out if there was any movement.
   * @type {!Point}
   */
  get location() {
    return this.rectangle.topLeft
  }

  /**
   * Stores the initial location of the movement for reference, and calls the base method.
   * @param {!IInputModeContext} context The context to retrieve information
   */
  initializeDrag(context) {
    this.offset.y = this.location.y - context.canvasComponent.lastMouseEvent.location.y
  }

  /**
   * Constrains the movement to the horizontal axis.
   * @param {!IInputModeContext} context The context to retrieve information
   * @param {!Point} originalLocation The value of the location property at the time of
   *   initializeDrag
   * @param {!Point} newLocation The new location in the world coordinate system
   */
  handleMove(context, originalLocation, newLocation) {
    const newY = this.getY(newLocation.y + this.offset.y)
    this.rectangle.relocate(new Point(this.rectangle.x, newY))
  }

  /**
   * Invoked when dragging has finished.
   * @param {!IInputModeContext} context The context to retrieve information
   * @param {!Point} originalLocation The value of the location property at the time of
   *   initializeDrag
   * @param {!Point} newLocation The new location in the world coordinate system
   */
  dragFinished(context, originalLocation, newLocation) {
    const newY = this.getY(newLocation.y + this.offset.y)
    this.rectangle.relocate(new Point(this.rectangle.x, newY))
  }

  /**
   * Invoked when dragging was cancelled.
   * @param {!IInputModeContext} context The context to retrieve information
   * @param {!Point} originalLocation The value of the location property at the time of
   *   initializeDrag
   */
  cancelDrag(context, originalLocation) {
    this.rectangle.relocate(originalLocation)
  }

  /**
   * Returns the next x position. If the rectangle reaches the borders of the boundary rectangle, the position
   * changes accordingly such that the rectangle fits in the timeline.
   * @param {number} nextPositionY The next y-position
   * @returns {number} number The next x coordinate of the rectangle.
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
 */
class HighlightManager extends HighlightIndicatorManager {
  /**
   * Creates a new instance of HighlightManager.
   * @param {!GraphComponent} graphComponent
   */
  constructor(graphComponent) {
    super(graphComponent)
    const graphModelManager = graphComponent.graphModelManager
    // the edges' highlight group should be above the nodes
    // the edges' highlight group should be above the nodes
    this.edgeHighlightGroup = graphModelManager.contentGroup.addGroup()
    this.edgeHighlightGroup.below(graphModelManager.nodeGroup)

    // the nodes' highlight group should be above the nodes
    // the nodes' highlight group should be above the nodes
    this.nodeHighlightGroup = graphModelManager.contentGroup.addGroup()
    this.nodeHighlightGroup.above(graphModelManager.nodeGroup)
  }

  /**
   * This implementation always returns the highlightGroup of the canvasComponent of this instance.
   * @param {!IModelItem} item The item to check
   * @returns {?ICanvasObjectGroup} An ICanvasObjectGroup or null
   */
  getCanvasObjectGroup(item) {
    if (item instanceof IEdge) {
      return this.edgeHighlightGroup
    } else if (INode.isInstance(item)) {
      return this.nodeHighlightGroup
    }
    return super.getCanvasObjectGroup(item)
  }

  /**
   * Callback used by install to retrieve the installer for a given item.
   * @param {!IModelItem} item The item to find an installer for
   * @returns {?ICanvasObjectInstaller}
   */
  getInstaller(item) {
    if (item instanceof INode) {
      return new NodeStyleDecorationInstaller({
        margins: 3,
        zoomPolicy: StyleDecorationZoomPolicy.MIXED,
        nodeStyle: new ShapeNodeStyle({
          shape: 'ellipse',
          fill: item.style.fill,
          stroke: null
        })
      })
    } else if (item instanceof IEdge) {
      const fill = item.style.stroke.fill
      return new EdgeStyleDecorationInstaller({
        edgeStyle: new PolylineEdgeStyle({
          stroke: new Stroke(fill, 4)
        }),
        zoomPolicy: StyleDecorationZoomPolicy.MIXED
      })
    } else if (ILabel.isInstance(item)) {
      return new LabelStyleDecorationInstaller({
        margins: 3,
        zoomPolicy: StyleDecorationZoomPolicy.WORLD_COORDINATES,
        labelStyle: new DefaultLabelStyle({
          font: 'bold'
        })
      })
    }
    return super.getInstaller(item)
  }
}
