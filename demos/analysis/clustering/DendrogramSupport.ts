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
  BaseClass,
  Color,
  Cursor,
  type DendrogramNode,
  EdgePortCandidates,
  ExteriorNodeLabelModel,
  GenericLayoutData,
  GivenLayersAssigner,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  type HierarchicalClusteringResult,
  HierarchicalLayout,
  HierarchicalLayoutEdgeDescriptor,
  HierarchicalLayoutLayeringStrategy,
  type IEdge,
  type IGraph,
  IHitTestable,
  type IInputModeContext,
  ILayoutAlgorithm,
  type IMapper,
  type IModelItem,
  type IMutableRectangle,
  INode,
  IPositionHandler,
  type IRenderTreeElement,
  LabelStyle,
  type LayoutGraph,
  type LayoutNode,
  Mapper,
  MutablePoint,
  MutableRectangle,
  NodeDataKey,
  NodeStyleIndicatorRenderer,
  Point,
  PolylineEdgeStyle,
  PortSides,
  type Rect,
  ShapeNodeStyle,
  Size,
  Stroke
} from '@yfiles/yfiles'

import { AxisVisual, CutoffVisual, generateColors } from './DemoVisuals'
import { colorSets } from '@yfiles/demo-app/demo-styles'

const DENDROGRAM_GRADIENT_START = Color.from(colorSets['demo-palette-42'].fill)
const DENDROGRAM_GRADIENT_END = Color.from(colorSets['demo-palette-44'].fill)

/**
 * Responsible for building a dendrogram graph based on the result of the hierarchical clustering algorithm.
 * The dendrogram is rendered in its own {@link GraphComponent}, the {@link dendrogramComponent}.
 * This also requires the graph that will be clustered (the original graph).
 */
export class DendrogramComponent {
  private graphComponent: GraphComponent
  private dendrogramComponent: GraphComponent = new GraphComponent('dendrogram-graph-component')
  private defaultNodeStyle: ShapeNodeStyle = new ShapeNodeStyle()
  private defaultEdgeStyle: PolylineEdgeStyle = new PolylineEdgeStyle()
  // the idea is to create the hierarchical graph from the dendrogram structure that is returned from the
  // clustering algorithm
  private dendro2hierarchical: Mapper<DendrogramNode, INode> = new Mapper<DendrogramNode, INode>()
  private hierarchical2dendro: Mapper<INode, DendrogramNode> = new Mapper<INode, DendrogramNode>()
  // determine the maxY coordinate needed for the creation of the visual objects
  private dendrogramMaxY = 0
  private axisRenderTreeElement: IRenderTreeElement | null = null
  // create the cut-off visual and add it to the highlight group of the graph component
  private cutOffVisual: CutoffVisual | null = null
  private cutOffRenderTreeElement: IRenderTreeElement | null = null
  private visited: Set<DendrogramNode> = new Set<DendrogramNode>()
  private dragFinishedListener: { (value: number): void } = () => {}

  /**
   * Creates a new instance of a dendrogram component.
   * @param graphComponent The {@link GraphComponent} which renders the original graph.
   */
  constructor(graphComponent: GraphComponent) {
    this.graphComponent = graphComponent
    this.configureUserInteraction()

    this.configureGraph(this.dendrogramComponent.graph)
  }

  /**
   * Configures user interaction for the dendrogram component.
   */
  configureUserInteraction(): void {
    const mode = new GraphEditorInputMode({
      allowCreateNode: false,
      allowCreateEdge: false,
      movableSelectedItems: GraphItemTypes.NONE,
      showHandleItems: GraphItemTypes.NONE,
      labelEditableItems: GraphItemTypes.NONE,
      deletableItems: GraphItemTypes.NONE,
      selectableItems: GraphItemTypes.NONE,
      focusableItems: GraphItemTypes.NONE,
      allowClipboardOperations: false,
      itemHoverInputMode: { hoverItems: GraphItemTypes.NODE },
      marqueeSelectionInputMode: { enabled: false },
      moveSelectedItemsInputMode: { moveCursor: Cursor.NS_RESIZE }
    })
    mode.itemHoverInputMode.addEventListener('hovered-item-changed', (evt) =>
      this.onHoveredItemChanged(evt.item)
    )

    this.dendrogramComponent.inputMode = mode
    this.dendrogramComponent.autoScrollOnBounds = false
  }

  /**
   * Sets the default styles for the given graph.
   * @param graph The graph to configure.
   */
  configureGraph(graph: IGraph): void {
    this.defaultNodeStyle = new ShapeNodeStyle({ shape: 'ellipse', fill: 'gray', stroke: null })
    graph.nodeDefaults.style = this.defaultNodeStyle

    this.defaultEdgeStyle = new PolylineEdgeStyle({ stroke: '3px gray' })

    graph.edgeDefaults.style = this.defaultEdgeStyle

    graph.nodeDefaults.labels.style = new LabelStyle({ textSize: 8 })

    graph.nodeDefaults.size = new Size(10, 10)

    graph.nodeDefaults.labels.layoutParameter = new ExteriorNodeLabelModel({
      margins: 3
    }).createParameter('top-right')

    // configure node highlighting style
    graph.decorator.nodes.highlightRenderer.addFactory(
      (node) =>
        new NodeStyleIndicatorRenderer({
          nodeStyle: new ShapeNodeStyle({
            shape: 'ellipse',
            fill: (node.style as ShapeNodeStyle).fill,
            stroke: null
          }),
          margins: 3,
          zoomPolicy: 'mixed'
        })
    )
  }

  /**
   * Generates the dendrogram graph.
   * @param result The result of the clustering algorithm
   * @param cutoff The given cutoff value
   */
  async generateDendrogram(result: HierarchicalClusteringResult, cutoff?: number): Promise<void> {
    const hierarchicalGraph = this.dendrogramComponent.graph
    this.clearDendrogram(cutoff)
    const dendrogramRoot = result.dendrogramRoot!

    // the idea is to create the hierarchical graph from the dendrogram structure that is returned from the
    // clustering algorithm
    this.dendro2hierarchical.clear()
    this.hierarchical2dendro.clear()

    const layers = new Mapper<INode, number>()

    let maxLayer = 0
    const stack: DendrogramNode[] = [dendrogramRoot]
    while (stack.length > 0) {
      const node = stack.pop()!

      // for each node of the dendrogram, we create a node for the hierarchical clustered graph.
      const hierarchicalClusteredNode = hierarchicalGraph.createNode()
      this.dendro2hierarchical.set(node, hierarchicalClusteredNode)
      this.hierarchical2dendro.set(hierarchicalClusteredNode, node)

      // for each parent-child relationship, we create an edge,
      // and we store the layer to which each hierarchical node belongs.
      const parent = node.parent
      let layer = 0
      if (parent) {
        // create an edge between parent-children
        const dendrogramParent = this.dendro2hierarchical.get(parent)!
        hierarchicalGraph.createEdge(dendrogramParent, hierarchicalClusteredNode)
        layer = layers.get(dendrogramParent)! + 1
      }
      layers.set(hierarchicalClusteredNode, layer)
      maxLayer = Math.max(layer, maxLayer)

      node.children.forEach((child) => {
        stack.push(child)
      })
    }

    // calculate the distance values and move all leaf-nodes to the bottommost layer
    const distanceValues = new Mapper<INode, number>()
    hierarchicalGraph.nodes.forEach((node) => {
      // move all leaves at the bottom-most layers
      if (hierarchicalGraph.outDegree(node) === 0) {
        layers.set(node, maxLayer - 1)
      } else {
        hierarchicalGraph.addLabel(
          node,
          `${Math.ceil(this.hierarchical2dendro.get(node)!.dissimilarityValue)}`
        )
      }
      // adjust the distances
      distanceValues.set(node, Math.ceil(this.hierarchical2dendro.get(node)!.dissimilarityValue))
    })

    // run the custom layout
    const dendrogramLayout = new DendrogramLayout()
    const dendrogramLayoutData = new GenericLayoutData()
    // register mappers for the distance values and the layers needed for the layout calculation
    dendrogramLayoutData.addItemMapping(DendrogramLayout.DISTANCE_VALUES_DATA_KEY).mapper =
      distanceValues
    dendrogramLayoutData.addItemMapping(DendrogramLayout.LAYER_ID_DATA_KEY).mapper = layers

    // apply the layout
    this.dendrogramComponent.graph.applyLayout(dendrogramLayout, dendrogramLayoutData)
    this.dendrogramComponent.updateContentBounds()

    // if there is no cutoff value, we do not have to create new visuals, only to update the nodes/edges styles to
    // match their corresponding clustering color
    if (!cutoff) {
      // determine the maxY coordinate needed for the creation of the visual objects
      this.dendrogramMaxY = dendrogramLayout.maxY
      // create the axis visual
      this.createAxisVisual()
      // create the cut-off visual
      this.createCutoffVisual()
      // the cut-off visual has now sensibly placed itself, so we can set the initial cutoff to it's value
      cutoff = this.cutOffVisual!.cutOffValue
      await this.dendrogramComponent.fitGraphBounds(60)
    }
    this.updateDendrogram(result, cutoff)
  }

  /**
   * Create the axis visual.
   */
  createAxisVisual(): void {
    const contentRect = this.dendrogramComponent.contentBounds
    const axisVisual = new AxisVisual(contentRect)
    this.axisRenderTreeElement = this.dendrogramComponent.renderTree.createElement(
      this.dendrogramComponent.renderTree.backgroundGroup,
      axisVisual
    )
  }

  /**
   * Create the cut-off visual.
   */
  createCutoffVisual(): void {
    // creates the move input mode that manages the movement of the rectangle
    const moveSelectedItemsInputMode = (this.dendrogramComponent.inputMode as GraphEditorInputMode)
      .moveSelectedItemsInputMode
    const contentRect = this.dendrogramComponent.contentBounds

    // create a rectangle with height 2
    const rectangle = new MutableRectangle(
      contentRect.x - 20,
      contentRect.y,
      contentRect.width + 40,
      2
    )

    // configure the move input mode so that the rectangle is movable
    moveSelectedItemsInputMode.hitTestable = IHitTestable.create((context, location) => {
      const eps = context.hitTestRadius + 3 / context.zoom
      return rectangle.contains(location, eps)
    })

    // create the handlers to move the rectangle
    moveSelectedItemsInputMode.positionHandler = new CutOffPositionHandler(
      rectangle,
      this.dendrogramComponent.contentBounds
    )

    // add the dragging listener that will send the up-to-date cut-off value
    moveSelectedItemsInputMode.addEventListener('dragging', () => {
      if (this.cutOffVisual) {
        this.cutOffVisual.cutOffValue = Math.max(
          Math.ceil(this.dendrogramMaxY - this.cutOffVisual.rectangle.center.y + 1),
          0
        )
      }
    })

    // add the drag finished listener that will fire the drag finished event
    moveSelectedItemsInputMode.addEventListener('drag-finished', () => {
      if (this.cutOffVisual) {
        this.dragFinishedListener(this.cutOffVisual.cutOffValue)
      }
    })

    moveSelectedItemsInputMode.priority = 1

    // create the cut-off visual and add it to the highlight group of the graph component
    this.cutOffVisual = new CutoffVisual(rectangle, this.dendrogramMaxY)
    this.cutOffRenderTreeElement = this.dendrogramComponent.renderTree.createElement(
      this.dendrogramComponent.renderTree.highlightGroup,
      this.cutOffVisual
    )
  }

  /**
   * Updates the style of the hierarchical clustered graph so that they much with the colors of the original graph
   * @param result The result of the clustering algorithm
   * @param cutoff The given cutoff value
   */
  updateDendrogram(result: HierarchicalClusteringResult, cutoff: number): void {
    const colors = generateColors(
      DENDROGRAM_GRADIENT_START,
      DENDROGRAM_GRADIENT_END,
      result.clusters.size + 1
    )

    this.visited = new Set<DendrogramNode>()
    result.clusters.forEach((cluster) => {
      cluster.nodes.forEach((node) => {
        // get the color of the cluster in the original graph
        const color = colors[result.nodeClusterIds.get(node)!]
        if (result.getDendrogramNode(node)) {
          // go up until you find a parent whose cutoff value exceeds the given one and change
          // its color and the color of its outgoing edges
          let parent = result.getDendrogramNode(node)
          while (parent && !this.visited.has(parent)) {
            // get the node in the hierarchical cluster graph and update its style
            if (parent.dissimilarityValue < cutoff && !this.visited.has(parent)) {
              const hierarchicalParent = this.dendro2hierarchical.get(parent)
              if (!hierarchicalParent) {
                break
              }
              this.updateNodeStyle(hierarchicalParent, color)

              // update the style of the out-edges
              this.dendrogramComponent.graph.outEdgesAt(hierarchicalParent).forEach((edge) => {
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
   * @param node The node to update
   * @param color The color to be used
   */
  updateNodeStyle(node: INode, color: Color): void {
    const updatedNodeStyle = new ShapeNodeStyle({ shape: 'ellipse', fill: color, stroke: null })
    this.dendrogramComponent.graph.setStyle(node, updatedNodeStyle)
  }

  /**
   * Updates the color of the given edge
   * @param edge The edge to update
   * @param color The color to be used
   */
  updateEdgeStyle(edge: IEdge, color: Color): void {
    const updatedEdgeStyle = new PolylineEdgeStyle({
      stroke: new Stroke({ fill: color, thickness: 3 })
    })
    this.dendrogramComponent.graph.setStyle(edge, updatedEdgeStyle)
  }

  /**
   * Called when a node of the hierarchical clustered graph is hovered to highlight the corresponding nodes of the
   * original graph.
   * @param item The hovered item
   */
  onHoveredItemChanged(item: IModelItem | null): void {
    const highlights = this.dendrogramComponent.highlights
    highlights.clear()
    let nodesToHighlight: Iterable<INode> = []
    if (item instanceof INode) {
      // highlight the node of the hierarchical clustered graph
      highlights.add(item)

      // get all descendants of this node from the dendrogram graph and highlight them too
      const dendrogramNode = this.hierarchical2dendro.get(item)!
      const stack: DendrogramNode[] = [dendrogramNode]
      while (stack.length > 0) {
        const descendant = stack.pop()!
        descendant.children.forEach((childNode) => {
          highlights.add(this.dendro2hierarchical.get(childNode)!)
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
   * @param nodes The nodes of the original graph that will be highlighted.
   */
  private highlightNodes(nodes: Iterable<INode>): void {
    const highlights = this.graphComponent.highlights
    highlights.clear()
    for (const node of nodes) {
      highlights.add(node)
    }
  }

  /**
   * Updates the highlight for the given node.
   * @param dendrogramNode The given node
   */
  updateHighlight(dendrogramNode?: DendrogramNode): void {
    const highlights = this.dendrogramComponent.highlights
    highlights.clear()
    if (dendrogramNode) {
      const hierarchicalClusteredNode = this.dendro2hierarchical.get(dendrogramNode)!
      highlights.add(hierarchicalClusteredNode)
    }
  }

  /**
   * Clears the hierarchical clustered graph and removes the visuals.
   * @param cutoff the cut-off value
   */
  clearDendrogram(cutoff?: number): void {
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
  removeVisuals(): void {
    const renderTree = this.dendrogramComponent.renderTree
    if (this.axisRenderTreeElement) {
      renderTree.remove(this.axisRenderTreeElement)
      this.axisRenderTreeElement = null
    }

    if (this.cutOffRenderTreeElement) {
      renderTree.remove(this.cutOffRenderTreeElement)
      this.cutOffRenderTreeElement = null
    }
  }

  /**
   * Adds a listener invoked when dragging has finished.
   * @param listener The listener to add
   */
  setDragFinishedListener(listener: { (value: number): void }): void {
    this.dragFinishedListener = listener
  }

  /**
   * Removes the listener invoked when dragging has finished.
   * @param listener The listener to remove
   */
  removeDragFinishedListener(listener: { (value: number): void }): void {
    if (this.dragFinishedListener === listener) {
      this.dragFinishedListener = () => {}
    }
  }

  /**
   * Determines whether the component should be visible or not.
   * @param showDendrogram True if the component should be visible, false otherwise
   */
  toggleVisibility(showDendrogram: boolean): void {
    const element = this.dendrogramComponent.htmlElement
    if (showDendrogram) {
      element.classList.remove('hidden')
    } else {
      element.classList.add('hidden')
    }
  }
}

/**
 * This class creates the layout of the hierarchical clustered graph. The layout is based on the hierarchical layout
 * algorithm, but the minimum length of each edge has to be equal to the distance provided by the clustering
 * algorithm between the source and target nodes of the edge. Also, a custom layering has to be used so that the
 * leaf nodes are always on the bottommost layer, while all other nodes are layered according to the order occurred
 * by the hierarchical clustering algorithm.
 */
class DendrogramLayout extends BaseClass(ILayoutAlgorithm) {
  maxY = 0

  /**
   * Gets the data map key for storing the distances between the nodes.
   */
  static DISTANCE_VALUES_DATA_KEY: NodeDataKey<number> = new NodeDataKey(
    'DendrogramLayout.DISTANCE_VALUES_DATA_KEY'
  )

  /**
   * Gets the data map key for storing the layer IDs.
   */
  static LAYER_ID_DATA_KEY: NodeDataKey<number> = GivenLayersAssigner.LAYER_INDEX_DATA_KEY

  /**
   * Applies the layout to the given graph
   * @param graph The graph to apply the layout
   */
  applyLayout(graph: LayoutGraph): void {
    // the layers of the nodes are consistent to their layers determined by the clustering dendrogram
    const graphContext = graph.context!
    const layersResult = graphContext.getItemData(DendrogramLayout.LAYER_ID_DATA_KEY)!
    if (!layersResult) {
      throw new Error('Node layer IDs have to be defined')
    }
    // run the hierarchical layout
    const hierarchicalLayout = new HierarchicalLayout({
      minimumLayerDistance: 0,
      edgeDistance: 0,
      fromScratchLayeringStrategy: HierarchicalLayoutLayeringStrategy.USER_DEFINED
    })

    const hierarchicalLayoutData = hierarchicalLayout.createLayoutData(graph)
    // edges at source node should use either the left or the right side
    hierarchicalLayoutData.ports.sourcePortCandidates = () => {
      return new EdgePortCandidates()
        .addFixedCandidate(PortSides.RIGHT)
        .addFixedCandidate(PortSides.LEFT)
    }
    // edges at the target nodes are always connected from the top side
    hierarchicalLayoutData.ports.targetPortCandidates = () =>
      new EdgePortCandidates().addFixedCandidate(PortSides.TOP)

    // use the difference of the distances between the source and the target node as minimum length
    const distanceValues: IMapper<LayoutNode, number> = graphContext.getItemData(
      DendrogramLayout.DISTANCE_VALUES_DATA_KEY
    )!
    hierarchicalLayoutData.edgeDescriptors = (edge) => {
      const edgeLength = distanceValues.get(edge.source)! - distanceValues.get(edge.target)!
      return new HierarchicalLayoutEdgeDescriptor({
        minimumLength: edgeLength,
        minimumLastSegmentLength: 0,
        minimumFirstSegmentLength: 0
      })
    }

    // apply the layout
    graph.applyLayout(hierarchicalLayout, hierarchicalLayoutData)

    // now we have to adjust the y-coordinates of the nodes, so that the y-coordinate of each node
    // equals exactly the distance between the source and the target node
    const layersMap = new Map<number, LayoutNode[]>()

    let maxYValue: number = -Number.MIN_VALUE
    let maxDistanceValue: number = -Number.MIN_VALUE
    graph.nodes.forEach((node) => {
      const layer = layersResult.get(node)!
      if (!layersMap.get(layer)) {
        layersMap.set(layer, [])
      }
      layersMap.get(layer)!.push(node)
      maxYValue = Math.max(node.layout.centerY, maxYValue)
      maxDistanceValue = Math.max(distanceValues.get(node)!, maxDistanceValue)
    })

    this.maxY = -Number.MIN_VALUE
    layersMap.forEach((layerNodes) => {
      layerNodes.forEach((node) => {
        const distanceValue = distanceValues.get(node)!
        const newY = maxYValue - distanceValue
        // adjust the node center
        node.layout.center = new Point(node.layout.centerX, newY)

        node.outEdges.forEach((edge) => {
          // move also the bends
          edge.resetPath(false)
          edge.bends.forEach((point) => {
            graph.addBend(edge, point.x, newY)
          })
        })

        this.maxY = Math.max(node.layout.centerY, this.maxY)
      })
    })

    // move each node to the x direction so that each node lies in the center of the distance between the two first
    // bends of the edge
    this.adjustXCoordinates(graph, graph.nodes.at(0))

    graph.edges.forEach((edge) => {
      graph.addBend(edge, edge.target.layout.centerX, edge.source.layout.centerY)
    })
  }

  /**
   * Move each node to the x-direction so that each node lies in the center of the distance between the two first
   * bends of the adjacent edges.
   * The graph should be traversed such that each time first the children of the root are examined and then, the
   * root.
   * @param graph The given graph
   * @param root The root node
   */
  adjustXCoordinates(graph: LayoutGraph, root: LayoutNode | null): void {
    if (root == null) {
      return
    }
    const outEdges = root.outEdges
    outEdges.forEach((edge) => {
      this.adjustXCoordinates(graph, edge.target)
    })

    if (root.outDegree > 1) {
      const target1X = outEdges.at(0)!.target.layout.centerX
      const target2X = outEdges.at(1)!.target.layout.centerX
      root.layout.center = new Point((target1X + target2X) * 0.5, root.layout.centerY)
    }
  }
}

/**
 * Creates the position handles for the timeline component.
 */
export class CutOffPositionHandler extends BaseClass(IPositionHandler) {
  rectangle: IMutableRectangle
  offset: MutablePoint = new MutablePoint()
  boundaryRectangle: Rect

  /**
   * Creates a position handler for the timeline.
   * @param rectangle The rectangle to read and write its location to.
   * @param boundaryRectangle The content rectangle of the timeline component.
   */
  constructor(rectangle: IMutableRectangle, boundaryRectangle: Rect) {
    super()
    this.rectangle = rectangle
    this.boundaryRectangle = boundaryRectangle
  }

  /**
   * The last "drag-location" during dragging.
   * It helps calculate the current position of the rectangle and find out if there was any movement.
   */
  get location(): Point {
    return this.rectangle.topLeft
  }

  /**
   * Stores the initial location of the movement for reference, and calls the base method.
   * @param context The context to retrieve information
   */
  initializeDrag(context: IInputModeContext): void {
    this.offset.y = this.location.y - context.canvasComponent!.lastInputEvent.location.y
  }

  /**
   * Constrains the movement to the horizontal axis.
   * @param _context The context to retrieve information
   * @param _originalLocation The value of the location property at the time of
   *   initializeDrag
   * @param newLocation The new location in the world coordinate system
   */
  handleMove(_context: IInputModeContext, _originalLocation: Point, newLocation: Point): void {
    const newY = this.getY(newLocation.y + this.offset.y)
    this.rectangle.setLocation(new Point(this.rectangle.x, newY))
  }

  /**
   * Invoked when dragging has finished.
   * @param _context The context to retrieve information
   * @param _originalLocation The value of the location property at the time of
   *   initializeDrag
   * @param newLocation The new location in the world coordinate system
   */
  dragFinished(_context: IInputModeContext, _originalLocation: Point, newLocation: Point): void {
    const newY = this.getY(newLocation.y + this.offset.y)
    this.rectangle.setLocation(new Point(this.rectangle.x, newY))
  }

  /**
   * Invoked when dragging was cancelled.
   * @param _context The context to retrieve information
   * @param originalLocation The value of the location property at the time of
   *   initializeDrag
   */
  cancelDrag(_context: IInputModeContext, originalLocation: Point): void {
    this.rectangle.setLocation(originalLocation)
  }

  /**
   * Returns the next x position. If the rectangle reaches the borders of the boundary rectangle, the position
   * changes accordingly such that the rectangle fits in the timeline.
   * @param nextPositionY The next y-position
   * @returns number The next x coordinate of the rectangle.
   */
  getY(nextPositionY: number): number {
    const y1 = this.boundaryRectangle.y
    const y2 = this.boundaryRectangle.y + this.boundaryRectangle.height
    // check if the next position is within the boundary rectangle borders
    if (nextPositionY <= y1) {
      return y1
    } else if (nextPositionY + 2 * this.rectangle.height >= y2) {
      return y2 - 2 * this.rectangle.height
    }

    return nextPositionY
  }
}
