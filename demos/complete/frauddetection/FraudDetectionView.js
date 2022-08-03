/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  AdjacencyTypes,
  FilteredGraphWrapper,
  GraphComponent,
  GraphCopier,
  GraphEditorInputMode,
  GraphItemTypes,
  HierarchicLayout,
  HierarchicLayoutData,
  IEdge,
  IGraph,
  ILayoutAlgorithm,
  IModelItem,
  INode,
  ItemCollection,
  LayoutGraph,
  LayoutStageBase,
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
  YBoolean,
  YPoint
} from 'yfiles'

import NodePopup from './NodePopup.js'
import TimelineComponent from './TimelineComponent.js'

/**
 * @typedef {Object} NodeTag
 * @property {number} id
 * @property {string} type
 * @property {Array.<Date>} enter
 * @property {Array.<Date>} exit
 * @property {(string|object)} info
 * @property {number} x
 * @property {number} y
 */

/**
 * This class provides a detailed view a fraud component.
 */
export default class FraudDetectionView {
  /**
   * @param {!IGraph} inputGraph
   * @param {!Array.<INode>} componentNodes
   * @param {number} componentIndex
   * @param {!('organic'|'hierarchic')} layoutStyle
   * @param {!function} [onCloseListener]
   */
  constructor(inputGraph, componentNodes, componentIndex, layoutStyle, onCloseListener) {
    this.onCloseListener = onCloseListener
    this.layoutStyle = layoutStyle
    this.componentIndex = componentIndex
    this.inputGraph = inputGraph
    this.nodesAdded = null
    this.graphChanged = false
    this.incrementalNodes = []
    this.layoutFromScratch = true
    this.componentNodes = new Set(componentNodes)
    this.initializeFraudDetectionView()
  }

  /**
   * Initializes the fraud detection view.
   */
  initializeFraudDetectionView() {
    // create the fraud detection component div
    this.fraudDetectionComponent = new GraphComponent()
    const fraudDetectionViewDiv = document.getElementById('fraudDetectionView')
    const fraudDetectionToolbar = document.getElementById('fraudDetectionToolbar')
    const fraudDetectionTitle = document.getElementById('fraudDetectionTitle')
    const fraudDetectionTimeline = document.getElementById('fraudDetectionTimeline')
    fraudDetectionViewDiv.insertBefore(this.fraudDetectionComponent.div, fraudDetectionTimeline)
    this.fraudDetectionComponent.div.id = 'fraudDetectionComponent'

    // display the component
    fraudDetectionViewDiv.style.display = 'block'
    fraudDetectionToolbar.style.display = 'inline'
    fraudDetectionTitle.innerHTML = `Fraud Ring ${this.componentIndex}`

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
      null
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
      () => true
    )
    this.fraudDetectionComponent.graph = this.filteredGraph

    this.filteredGraph.addNodeCreatedListener((sender, args) => {
      const node = args.item
      this.incrementalNodes.push(node)
      if (!this.nodesAdded) {
        this.nodesAdded = new Mapper()
      }
      this.nodesAdded.set(node, true)
    })

    this.filteredGraph.addEdgeCreatedListener((sender, args) => {
      const sourceNode = args.item.sourceNode
      const targetNode = args.item.targetNode
      if (!this.incrementalNodes.includes(sourceNode)) {
        this.incrementalNodes.push(sourceNode)
      }
      if (!this.incrementalNodes.includes(targetNode)) {
        this.incrementalNodes.push(targetNode)
      }
    })

    this.filteredGraph.addEdgeRemovedListener((sender, args) => {
      const sourceNode = args.item.sourceNode
      const targetNode = args.item.targetNode
      if (!this.incrementalNodes.includes(sourceNode)) {
        this.incrementalNodes.push(sourceNode)
      }
      if (!this.incrementalNodes.includes(targetNode)) {
        this.incrementalNodes.push(targetNode)
      }
    })

    this.filteredGraph.addNodeRemovedListener(() => {
      this.graphChanged = true
    })

    this.incrementalNodes = []
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
        nodes
          .filter(node => this.filteredGraph.contains(node))
          .forEach(node => {
            this.fraudDetectionComponent.selection.setSelected(node, true)
            const nodeLayout = node.layout
            minX = Math.min(minX, nodeLayout.x)
            maxX = Math.max(maxX, nodeLayout.x + nodeLayout.width)
            minY = Math.min(minY, nodeLayout.y)
            maxY = Math.max(maxY, nodeLayout.y + nodeLayout.height)
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
   * @returns {boolean} true if the node should be visible, false otherwise
   * @param {!INode} node
   */
  nodePredicate(node) {
    return this.visibleNodesSet === null || this.visibleNodesSet.has(node)
  }

  /**
   * Invoked when the timeline frame changes.
   * @param {!Array.<string>} minTime
   * @param {!Array.<string>} maxTime
   */
  onTimeFrameChanged(minTime, maxTime) {
    if (!minTime || !maxTime || minTime.length === 0 || maxTime.length < 1) {
      return
    }
    const startDate = minTime[0]
    const endDate = maxTime[maxTime.length - 1]
    this.visibleNodesSet.clear()

    this.filteredGraph.wrappedGraph.nodes.forEach(node => {
      const tag = node.tag
      tag.enter.forEach((sDate, index) => {
        const tDate = new Date(tag.exit[index])
        if (
          !(
            tDate.getTime() < new Date(startDate).getTime() ||
            new Date(sDate).getTime() > new Date(endDate).getTime()
          )
        ) {
          this.visibleNodesSet.add(node)
        }
      })
    })

    this.filteredGraph.nodePredicateChanged()

    // In bank fraud detection, there exist bank branch nodes that are connected to many nodes, and thus the enter
    // and exit dates may cover a really wide time range. To avoid, having isolated bank nodes, we remove them
    // after  filtering if they have no connections to the current graph nodes.
    if (this.layoutStyle === 'organic') {
      this.filteredGraph.nodes.forEach(node => {
        if (node.tag.type === 'Bank Branch' && this.filteredGraph.degree(node) === 0) {
          this.visibleNodesSet.delete(node)
        }
      })

      this.filteredGraph.nodePredicateChanged()
    }

    if (this.incrementalNodes.length > 0 || this.graphChanged) {
      this.runLayout(this.layoutFromScratch)
    }
  }

  /**
   * Runs the layout.
   * @param {boolean} fromScratch
   */
  runLayout(fromScratch) {
    if (this.layoutStyle === 'organic') {
      const layout = new OrganicLayout()
      layout.deterministic = true
      layout.scope = fromScratch ? OrganicLayoutScope.ALL : OrganicLayoutScope.MAINLY_SUBSET
      layout.considerNodeSizes = true
      layout.nodeEdgeOverlapAvoided = true

      if (!fromScratch) {
        layout.appendStage(new InitialPositionsStage(layout))
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
        layoutOrientation: 'bottom-to-top',
        orthogonalRouting: false,
        layoutMode: fromScratch ? 'from-scratch' : 'incremental'
      })

      const hierarchicLayoutData = new HierarchicLayoutData()
      if (!fromScratch) {
        hierarchicLayoutData.incrementalHints.incrementalLayeringNodes = ItemCollection.from(
          this.incrementalNodes
        )
      }

      layout.prependStage(new PortCalculator())

      // apply layout
      this.filteredGraph.applyLayout(layout, hierarchicLayoutData)
    }

    this.fraudDetectionComponent.fitGraphBounds()
    this.layoutFromScratch = false
    this.incrementalNodes.length = 0
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
      clickableItems: 'node',
      selectableItems: 'node',
      focusableItems: 'none',
      showHandleItems: 'none',
      deletableItems: 'none'
    })
    inputMode.marqueeSelectionInputMode.enabled = false

    inputMode.addDeletingSelectionListener((sender, args) => {
      const selection = args.selection
      for (const item of selection) {
        if (item instanceof INode) {
          this.filteredGraph.edgesAt(item, AdjacencyTypes.ALL).forEach(edge => {
            if (!selection.isSelected(edge.opposite(item))) {
              this.incrementalNodes.push(edge.opposite(item))
            }
          })
        } else if (item instanceof IEdge) {
          if (!selection.isSelected(item.sourceNode)) {
            this.incrementalNodes.push(item.sourceNode)
          }
          if (!selection.isSelected(item.targetNode)) {
            this.incrementalNodes.push(item.targetNode)
          }
        }
      }
    })

    // create the node popup
    this.nodePopup = new NodePopup(this.fraudDetectionComponent, 'fraudPopup')

    inputMode.addCanvasClickedListener(() => {
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
        // Tooltip content has already been assigned -> nothing to do.
        return
      }
      const item = eventArgs.item
      if (IEdge.isInstance(item) && this.layoutStyle === 'hierarchic') {
        eventArgs.toolTip = item.tag.type

        // Indicate that the tooltip content has been set.
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
    graphItemHoverInputMode.addHoveredItemChangedListener((sender, event) =>
      this.updateHighlights(event.oldItem, event.item)
    )

    const moveInputMode = inputMode.moveInputMode
    moveInputMode.addDragStartedListener(() => {
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
   * @param {?IModelItem} oldItem The item that was previously hovered, possibly null
   * @param {!IModelItem} currentItem The currently hovered item
   */
  updateHighlights(oldItem, currentItem) {
    const highlightManager = this.fraudDetectionComponent.highlightIndicatorManager

    if (currentItem) {
      highlightManager.addHighlight(currentItem)
    }

    if (oldItem) {
      highlightManager.removeHighlight(oldItem)
    }

    this.fraudDetectionTimeline.updateHighlight(currentItem)
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

    if (this.fraudDetectionTimeline) {
      const animation = this.fraudDetectionTimeline.getTimeFrameAnimation()
      if (animation && animation.animating) {
        animation.stopAnimation()
      }
    }

    if (this.onCloseListener) {
      this.onCloseListener()
    }
  }
}

/**
 * This stage is responsible for placing the new nodes that are inserted to the graph at the position of the first
 * neighbor that is already placed.
 */
class InitialPositionsStage extends LayoutStageBase {
  /**
   * Creates a new instance of InitialPositionsStage.
   * @param {!ILayoutAlgorithm} layout
   */
  constructor(layout) {
    super(layout)
  }

  /**
   * Applies the layout
   * @param {!LayoutGraph} graph The graph to be laid out.
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
