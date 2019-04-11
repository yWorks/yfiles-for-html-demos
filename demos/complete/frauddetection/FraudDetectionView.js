/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
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
import {
  AdjacencyTypes,
  FilteredGraphWrapper,
  GraphComponent,
  GraphCopier,
  GraphEditorInputMode,
  GraphItemTypes,
  HierarchicLayout,
  HierarchicLayoutData,
  HoveredItemChangedEventArgs,
  IEdge,
  ILayoutAlgorithm,
  IMapper,
  INode,
  LayoutGraph,
  LayoutMode,
  LayoutOrientation,
  LayoutStageBase,
  List,
  Mapper,
  NodeStyleDecorationInstaller,
  OrganicLayout,
  OrganicLayoutData,
  OrganicLayoutScope,
  Point,
  PortCalculator,
  Rect,
  ShapeNodeStyle,
  StyleDecorationZoomPolicy,
  YBoolean
} from 'yfiles'

import NodePopup from './NodePopup.js'
import TimelineComponent from './TimelineComponent.js'

/**
 * This class provides a detailed view a fraud component.
 */
export default class FraudDetectionView {
  constructor(inputGraph, componentNodes, componentIndex, layoutAlgorithm, onCloseListener) {
    this.inputGraph = inputGraph
    this.componentNodes = new Set(componentNodes)
    this.$componentIndex = componentIndex
    this.layoutAlgorithm = layoutAlgorithm
    this.onCloseListener = onCloseListener
    this.filteredGraph = null
    this.initializeFraudDetectionView()
  }

  /**
   * Gets the fraud component index.
   * @return {number} The fraud component index
   */
  get componentIndex() {
    return this.$componentIndex
  }

  /**
   * Sets the fraud component index.
   * @param {number} value The fraud component index to set
   */
  set componentIndex(value) {
    this.$componentIndex = value
  }

  /**
   * Initializes the fraud detection view.
   */
  initializeFraudDetectionView() {
    // create the fraud detection component div
    this.fraudDetectionComponent = new GraphComponent()
    const fraudDetectionViewDiv = document.getElementById('fraudDetectionView')
    const fraudDetectionTimeline = document.getElementById('fraudDetectionTimeline')
    fraudDetectionViewDiv.insertBefore(this.fraudDetectionComponent.div, fraudDetectionTimeline)
    this.fraudDetectionComponent.div.id = 'fraudDetectionComponent'

    // display the component
    document.getElementById('fraudDetectionView').style.display = 'block'
    document.getElementById('fraudDetectionToolbar').style.display = 'inline'
    document.getElementById('fraudDetectionTitle').innerHTML = `Fraud Ring ${this.componentIndex}`

    this.visibleNodesSet = null

    this.initializeHighlightStyle()
    this.initializeInputMode()

    this.copyGraph()
    this.initializeTimelineComponent()
    this.initializeGraph()

    this.registerCommands()
  }

  /**
   * Copies to the fraud detection component graph only the part of the input graph that belongs to the investigated
   * component.
   */
  copyGraph() {
    const graphCopier = new GraphCopier()
    graphCopier.copy(
      this.inputGraph,
      item =>
        !INode.isInstance(item) ||
        (this.componentNodes.has(item) && item.tag.type !== 'Bank Branch'),
      this.fraudDetectionComponent.graph,
      null,
      Point.ORIGIN,
      (original, copy) => {}
    )
  }

  /**
   * Initializes the graph of the fraud detection view.
   */
  initializeGraph() {
    // get the graph from the timeline component
    this.filteredGraph = new FilteredGraphWrapper(
      this.fraudDetectionTimeline.filteredGraph.wrappedGraph,
      this.nodePredicate.bind(this),
      edge => true
    )
    this.fraudDetectionComponent.graph = this.filteredGraph

    this.filteredGraph.addNodeCreatedListener((sender, args) => {
      const node = args.item
      this.incrementalNodes.add(node)
      if (!this.nodesAdded) {
        this.nodesAdded = new Mapper()
      }
      this.nodesAdded.set(node, true)
    })

    this.filteredGraph.addEdgeCreatedListener((sender, args) => {
      if (!this.incrementalNodes.includes(args.item.sourceNode)) {
        this.incrementalNodes.add(args.item.sourceNode)
      }
      if (!this.incrementalNodes.includes(args.item.targetNode)) {
        this.incrementalNodes.add(args.item.targetNode)
      }
    })

    this.filteredGraph.addEdgeRemovedListener((sender, args) => {
      if (!this.incrementalNodes.includes(args.item.sourceNode)) {
        this.incrementalNodes.add(args.item.sourceNode)
      }
      if (!this.incrementalNodes.includes(args.item.targetNode)) {
        this.incrementalNodes.add(args.item.targetNode)
      }
    })

    this.filteredGraph.addNodeRemovedListener((sender, args) => {
      this.graphChanged = true
    })

    this.incrementalNodes = new List()
    this.graphChanged = false
    this.layoutFromScratch = true

    // create the timeline graph
    this.fraudDetectionTimeline.createTimeline()
  }

  /**
   * Creates and configures the timeline components.
   */
  initializeTimelineComponent() {
    this.visibleNodesSet = new Set()

    this.fraudDetectionTimeline = new TimelineComponent(
      'fraudDetectionTimeline',
      this.fraudDetectionComponent
    )
    this.fraudDetectionTimeline.addHighlightChangedListener(nodes => {
      const highlightManager = this.fraudDetectionComponent.highlightIndicatorManager
      highlightManager.clearHighlights()
      if (nodes.length > 0) {
        nodes.forEach(node => {
          if (this.filteredGraph.contains(node)) {
            highlightManager.addHighlight(node)
          }
        })
      }
    })

    this.fraudDetectionTimeline.addSelectionChangedListener(nodes => {
      this.fraudDetectionComponent.selection.clear()
      if (nodes.length > 0) {
        let minX = Number.POSITIVE_INFINITY
        let maxX = Number.NEGATIVE_INFINITY
        let minY = Number.POSITIVE_INFINITY
        let maxY = Number.NEGATIVE_INFINITY
        nodes.forEach(node => {
          if (this.filteredGraph.contains(node)) {
            this.fraudDetectionComponent.selection.setSelected(node, true)
            const nodeLayout = node.layout
            minX = Math.min(minX, nodeLayout.x)
            maxX = Math.max(maxX, nodeLayout.x + nodeLayout.width)
            minY = Math.min(minY, nodeLayout.y)
            maxY = Math.max(maxY, nodeLayout.y + nodeLayout.height)
          }
        })
        if (
          minX !== Number.POSITIVE_INFINITY &&
          maxX !== Number.NEGATIVE_INFINITY &&
          minY !== Number.POSITIVE_INFINITY &&
          maxY !== Number.NEGATIVE_INFINITY
        ) {
          this.fraudDetectionComponent.ensureVisible(new Rect(minX, minY, maxX - minX, maxY - minY))
        }
      }
    })
    this.fraudDetectionTimeline.addTimeFrameChangedListener(this.onTimeFrameChanged.bind(this))
  }

  /**
   * Determines whether or not a node of the filtered graph should be visible.
   * @param {INode} node
   * @return {boolean} true if the node should be visible, false otherwise
   */
  nodePredicate(node) {
    return this.visibleNodesSet === null || this.visibleNodesSet.has(node)
  }

  /**
   * Invoked when the timeline frame changes.
   * @param {number} minTime
   * @param {number} maxTime
   */
  onTimeFrameChanged(minTime, maxTime) {
    if (!minTime || !maxTime || minTime.length === 0 || maxTime.length < 1) {
      return
    }
    const startDate = minTime[0]
    const endDate = maxTime[maxTime.length - 1]
    this.visibleNodesSet.clear()

    this.filteredGraph.wrappedGraph.nodes.forEach(node => {
      node.tag.enter.forEach((sDate, index) => {
        const tDate = node.tag.exit[index]
        if (
          !(tDate.getTime() < new Date(startDate).getTime() || sDate > new Date(endDate).getTime())
        ) {
          this.visibleNodesSet.add(node)
        }
      })
    })

    this.filteredGraph.nodePredicateChanged()

    // In bank fraud detection, there exist bank branch nodes that are connected to many nodes, and thus the enter
    // and exit dates may cover a really wide time range. To avoid, having isolated bank nodes, we remove them
    // after  filtering if they have no connections to the current graph nodes.
    if (this.layoutAlgorithm === FraudDetectionView.ORGANIC) {
      this.filteredGraph.nodes.forEach(node => {
        if (node.tag.type === 'Bank Branch' && this.filteredGraph.degree(node) === 0) {
          this.visibleNodesSet.delete(node)
        }
      })

      this.filteredGraph.nodePredicateChanged()
    }

    if (this.incrementalNodes.size > 0 || this.graphChanged) {
      this.runLayout(this.layoutFromScratch)
    }
  }

  /**
   * Runs the layout.
   * @param {boolean} fromScratch
   */
  runLayout(fromScratch) {
    if (this.layoutAlgorithm === FraudDetectionView.ORGANIC) {
      const layout = new OrganicLayout()
      layout.deterministic = true
      layout.scope = fromScratch ? OrganicLayoutScope.ALL : OrganicLayoutScope.MAINLY_SUBSET
      layout.considerNodeSizes = true
      layout.nodeEdgeOverlapAvoided = true

      if (!fromScratch) {
        layout.appendStage(new InitialPositionsStage(layout, this.nodesAdded))
      }

      const organicLayoutData = new OrganicLayoutData({
        affectedNodes: this.incrementalNodes
      })

      // apply layout
      this.fraudDetectionComponent.graph.mapperRegistry.addMapper(
        INode.$class,
        YBoolean.$class,
        'NODES_ADDED',
        this.nodesAdded
      )
      this.filteredGraph.applyLayout(layout, organicLayoutData)
      this.fraudDetectionComponent.graph.mapperRegistry.removeMapper('NODES_ADDED')
    } else {
      const layout = new HierarchicLayout({
        layoutOrientation: LayoutOrientation.BOTTOM_TO_TOP,
        orthogonalRouting: false,
        layoutMode: fromScratch ? LayoutMode.FROM_SCRATCH : LayoutMode.INCREMENTAL
      })

      const hierarchicLayoutData = new HierarchicLayoutData()
      if (!fromScratch) {
        hierarchicLayoutData.incrementalHints.incrementalLayeringNodes = this.incrementalNodes
      }

      layout.prependStage(new PortCalculator())

      // apply layout
      this.filteredGraph.applyLayout(layout, hierarchicLayoutData)
    }

    this.fraudDetectionComponent.fitGraphBounds()
    this.layoutFromScratch = false
    this.incrementalNodes.clear()
    this.graphChanged = false
    this.nodesAdded.clear()
  }

  /**
   * Initializes the input mode for the fraud detection graph component.
   */
  initializeInputMode() {
    const inputMode = new GraphEditorInputMode({
      allowCreateNode: false,
      allowCreateEdge: false,
      allowCreateBend: false,
      allowDuplicate: false,
      allowGroupingOperations: false,
      allowClipboardOperations: false,
      allowUndoOperations: false,
      allowEditLabelOnDoubleClick: false,
      clickableItems: GraphItemTypes.NODE,
      selectableItems: GraphItemTypes.NODE,
      focusableItems: GraphItemTypes.NONE,
      showHandleItems: GraphItemTypes.NONE,
      deletableItems: GraphItemTypes.NONE
    })
    inputMode.marqueeSelectionInputMode.enabled = false

    inputMode.addDeletingSelectionListener((sender, args) => {
      const selection = args.selection
      selection.selectedNodes.forEach(node => {
        this.filteredGraph.edgesAt(node, AdjacencyTypes.ALL).forEach(edge => {
          if (!selection.isSelected(edge.opposite(node))) {
            this.incrementalNodes.add(edge.opposite(node))
          }
        })
      })
      selection.selectedEdges.forEach(edge => {
        if (!selection.isSelected(edge.sourceNode)) {
          this.incrementalNodes.add(edge.sourceNode)
        }
        if (!selection.isSelected(edge.targetNode)) {
          this.incrementalNodes.add(edge.targetNode)
        }
      })
    })

    // create the node popup
    this.nodePopup = new NodePopup(this.fraudDetectionComponent, 'fraudPopup')

    inputMode.addCanvasClickedListener((sender, event) => {
      // remove the node popup
      this.nodePopup.updatePopup(null)
    })

    // show popup on right click
    inputMode.addItemRightClickedListener((sender, event) => {
      this.nodePopup.updatePopup(event.item)
      event.handled = true
    })

    inputMode.toolTipItems = GraphItemTypes.EDGE
    inputMode.addQueryItemToolTipListener((src, eventArgs) => {
      if (eventArgs.handled) {
        // A tooltip has already been assigned -> nothing to do.
        return
      }
      const item = eventArgs.item
      if (IEdge.isInstance(item) && this.layoutAlgorithm === FraudDetectionView.HIERARCHIC) {
        eventArgs.toolTip = item.tag.type

        // Indicate that the tooltip has been set.
        eventArgs.handled = true
      } else {
        eventArgs.handled = false
      }
    })

    // Add a little offset to the tooltip such that it is not obscured by the mouse pointer.
    inputMode.mouseHoverInputMode.toolTipLocationOffset = new Point(20, 20)

    // add item hover input mode to highlight nodes on hover
    const graphItemHoverInputMode = inputMode.itemHoverInputMode
    graphItemHoverInputMode.hoverItems = GraphItemTypes.NODE
    graphItemHoverInputMode.discardInvalidItems = false
    // add listener to react to hover changes
    graphItemHoverInputMode.addHoveredItemChangedListener((sender, event) => {
      this.updateHighlights(sender, event)
    })

    const moveInputMode = inputMode.moveInputMode
    moveInputMode.addDragStartedListener((sender, event) => {
      // remove the node popup
      this.nodePopup.updatePopup(null)
    })

    // add listener to react to selection changes
    this.fraudDetectionComponent.selection.addItemSelectionChangedListener(() => {
      this.fraudDetectionTimeline.updateSelection(
        this.fraudDetectionComponent.selection.selectedNodes
      )
    })

    this.fraudDetectionComponent.inputMode = inputMode
  }

  /**
   * Updates the highlights of the hovered node.
   * @param {object} sender
   * @param {HoveredItemChangedEventArgs} event
   */
  updateHighlights(sender, event) {
    const item = event.item
    const oldItem = event.oldItem

    const highlightManager = this.fraudDetectionComponent.highlightIndicatorManager

    if (item) {
      highlightManager.addHighlight(item)
    }

    if (oldItem) {
      highlightManager.removeHighlight(oldItem)
    }

    this.fraudDetectionTimeline.updateHighlight(item)
  }

  /**
   * Initializes the graph with default styles and decorators for highlights and selections.
   */
  initializeHighlightStyle() {
    const graph = this.fraudDetectionComponent.graph

    // highlight node style
    graph.decorator.nodeDecorator.highlightDecorator.setImplementation(
      new NodeStyleDecorationInstaller({
        nodeStyle: new ShapeNodeStyle({
          fill: 'transparent',
          stroke: '3px slateblue',
          shape: 'ellipse'
        }),
        zoomPolicy: StyleDecorationZoomPolicy.MIXED,
        margins: 2
      })
    )

    // selection node style
    graph.decorator.nodeDecorator.selectionDecorator.setImplementation(
      new NodeStyleDecorationInstaller({
        nodeStyle: new ShapeNodeStyle({
          fill: 'transparent',
          stroke: '3px darkblue',
          shape: 'ellipse'
        }),
        margins: 2,
        zoomPolicy: StyleDecorationZoomPolicy.MIXED
      })
    )

    // no focus indication
    graph.decorator.nodeDecorator.focusIndicatorDecorator.hideImplementation()
  }

  /**
   * Wires up the buttons of the Fraud Detection View Component.
   */
  registerCommands() {
    document
      .getElementById('layoutButton')
      .addEventListener('click', () => this.runLayout(true), true)
    document
      .getElementById('closeFraudDetection')
      .addEventListener('click', this.close.bind(this), true)
  }

  /**
   * Invoked when the close button is pressed.
   */
  close() {
    document.getElementById('fraudDetectionView').style.display = 'none'
    document.getElementById('fraudDetectionToolbar').style.display = 'none'

    const fraudDetectionComponentDiv = document.getElementById('fraudDetectionComponent')
    if (fraudDetectionComponentDiv) {
      fraudDetectionComponentDiv.parentNode.removeChild(fraudDetectionComponentDiv)
    }

    // remove elements from the div of the fraud detection timeline
    const graphTimeline = document.getElementById('fraudDetectionTimeline')
    while (graphTimeline.hasChildNodes()) {
      const child = graphTimeline.firstChild
      while (child.hasChildNodes()) {
        child.removeChild(child.firstChild)
      }
      graphTimeline.removeChild(child)
    }

    if (this.onCloseListener) {
      this.onCloseListener()
    }
  }

  static get ORGANIC() {
    return 0
  }

  static get HIERARCHIC() {
    return 1
  }
}

/**
 * This stage is responsible for placing the new nodes that are inserted to the graph at the position of the first
 * neighbor that is already placed.
 */
class InitialPositionsStage extends LayoutStageBase {
  /**
   * Creates a new instance of InitialPositionsStage.
   * @param {ILayoutAlgorithm} layout
   * @param {IMapper} incrementalNodes
   */
  constructor(layout, incrementalNodes) {
    super(layout)
    this.incrementalNodes = incrementalNodes
  }

  /**
   * Applies the layout
   * @param {LayoutGraph} graph The graph to be laid out.
   */
  applyLayout(graph) {
    const nodesAdded = graph.getDataProvider('NODES_ADDED')

    graph.nodes.forEach(node => {
      if (nodesAdded.getBoolean(node)) {
        const visited = new Set()
        const stack = [node]
        let coordinates = null
        while (stack.length > 0) {
          const stackNode = stack.pop()
          if (nodesAdded.getBoolean(node) && !visited.has(stackNode)) {
            // eslint-disable-next-line no-loop-func
            stackNode.inEdges.forEach(edge => {
              const opposite = edge.opposite(stackNode)
              if (!nodesAdded.getBoolean(opposite)) {
                coordinates = graph.getCenter(opposite)
              } else {
                stack.push(opposite)
              }
            })
            visited.add(stackNode)
          }

          if (coordinates !== null) {
            graph.setCenter(node, coordinates)
            stack.length = 0
          }
        }
      }
    })
    this.applyLayoutCore(graph)
  }
}
