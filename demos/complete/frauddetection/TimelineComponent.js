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
  Animator,
  BaseClass,
  EventRecognizers,
  Fill,
  FilteredGraphWrapper,
  Font,
  Geom,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  HandleInputMode,
  HandlePositions,
  HighlightIndicatorManager,
  ICanvasObjectDescriptor,
  ICollection,
  IComparer,
  IGraph,
  IHitTestable,
  IInputModeContext,
  IModelItem,
  IMutableRectangle,
  INode,
  IPositionHandler,
  IRenderContext,
  IVisualCreator,
  Insets,
  List,
  Mapper,
  MouseWheelBehaviors,
  MoveInputMode,
  MutablePoint,
  MutableRectangle,
  NodeStyleDecorationInstaller,
  ObservableCollection,
  Point,
  Rect,
  RectangleHandle,
  ScrollBarVisibility,
  ShapeNodeStyle,
  Size,
  StyleDecorationZoomPolicy,
  SvgVisual,
  TextRenderSupport,
  Visual
} from 'yfiles'

import { addClass, toggleClass } from '../../resources/demo-app.js'

/**
 * This class creates a timeline component to visualize time-dependent data. The component consists of a time axis
 * that visualizes the dates of the nodes of the source graph in the given data-set and an animated rectangle. The
 * nodes of the source graph are filtered based on whether they belong to the current time window represented by the
 * animated rectangle. The input is the HTML Element in which the component should be added and the graph component
 * of the source graph. The user can determine whether the timeline component should take care of the filtering of
 * nodes of the source graph. In the first case, property {@link TimelineComponent#filteringEnabled} should be set to
 * true. Otherwise, the user has to add a listener to the component that fires an event whenever the time window
 * changes, using method {@link TimelineComponent#addTimeFrameChangedListener}.
 *
 * Events like hover and selection of timeline nodes can be fired using methods
 * {@link TimelineComponent#addHighlightChangedListener} and {@link TimelineComponent#addSelectionChangedListener}.
 * Also, the timeline component has already registered listeners for reacting on hovering and selection of the nodes
 * of the source graph.
 *
 * Finally, method {@link TimelineComponent#createTimeline} has to be called in order to display the
 * timeline component. The method has to be set after all necessary listeners have been registered.
 */
export default class TimelineComponent {
  /**
   * Creates a new timeline component.
   * @param {HTMLElement} selector The components' HTML element
   * @param {GraphComponent} graphComponent The source GraphComponent
   */
  constructor(selector, graphComponent) {
    this.selector = selector
    this.createComponentDiv()
    this.initializeInputMode()
    this.initializeNodeStyle()
    this.init()
    this.graphComponent = graphComponent
  }

  /**
   * Gets the source GraphComponent
   * @type {GraphComponent}
   */
  get graphComponent() {
    return this.$graphComponent
  }

  /**
   * Sets the source GraphComponent
   * @param {GraphComponent} graphComponent
   */
  set graphComponent(graphComponent) {
    this.$graphComponent = graphComponent
    if (this.$graphComponent) {
      const filteredGraph = new FilteredGraphWrapper(
        this.graphComponent.graph,
        node => this.nodePredicateChanged(node),
        edge => true
      )
      this.graphComponent.graph = filteredGraph
      this.filteredGraph = filteredGraph
    }
  }

  /**
   * Creates the timeline component.
   */
  createTimeline() {
    if (this.graphComponent) {
      // create the timeline nodes
      this.createTimelineNodes()
      // add the necessary visuals and display the timeline
      this.displayTimeline(false)
    }
  }

  /**
   * Gets whether the timeline component should filter the nodes of the source graph.
   * @type {boolean}
   */
  get filteringEnabled() {
    return this.$filteringEnabled
  }

  /**
   * Sets whether the timeline component should filter the nodes of the source graph.
   * @param {boolean} filteringEnabled
   */
  set filteringEnabled(filteringEnabled) {
    this.$filteringEnabled = filteringEnabled
  }

  /**
   * Gets the filtered graph.
   * @type {FilteredGraphWrapper}
   */
  get filteredGraph() {
    return this.$filteredGraph
  }

  /**
   * Sets the filtered graph.
   * @param {FilteredGraphWrapper} filteredGraph
   */
  set filteredGraph(filteredGraph) {
    this.$filteredGraph = filteredGraph
  }

  /**
   * Gets whether or not different zoom levels can be applied.
   * @return {boolean}
   */
  get zoomLevelEnabled() {
    return this.$zoomLevelEnabled
  }

  /**
   * Sets whether or not different zoom levels can be applied. If enabled, the zoom level will change based on
   * mouse wheel gestures on the timeline component between months, years, and days. If not enabled, zoom level will
   * be set to months.
   * @param {boolean} zoomLevelEnabled
   */
  set zoomLevelEnabled(zoomLevelEnabled) {
    this.$zoomLevelEnabled = zoomLevelEnabled
    if (!this.$zoomLevelEnabled) {
      this.zoomLevel = ZoomLevel.ZOOM_MONTHS
      this.timelineComponent.removeMouseWheelListener((sender, evt) =>
        this.onMouseWheel(evt.wheelDelta, evt.location)
      )
    } else {
      this.timelineComponent.addMouseWheelListener((sender, evt) =>
        this.onMouseWheel(evt.wheelDelta, evt.location)
      )
    }
  }

  /**
   * Gets whether another operation that blocks the timeline is running.
   * @return {boolean}
   */
  get busy() {
    return this.$busy
  }

  /**
   * Sets whether another operation that blocks the timeline is running.
   * @param {boolean} busy
   */
  set busy(busy) {
    this.$busy = busy
    if (this.positionHandler) {
      this.positionHandler.enabled = !busy
    }
  }

  /**
   * Adds the listener invoked when the selected nodes of the timeline graph change.
   * @param {function(Array)} listener
   */
  addSelectionChangedListener(listener) {
    this.selectionListener = listener
  }

  /**
   * Removes the listener invoked when the selected nodes of the timeline graph change.
   * @param {function(Array)} listener
   */
  removeSelectionChangedListener(listener) {
    if (this.selectionListener === listener) {
      this.selectionListener = null
    }
  }

  /**
   * Adds the listener invoked when the hovered nodes of the timeline graph change.
   * @param {function(Array)} listener
   */
  addHighlightChangedListener(listener) {
    this.highlightListener = listener
  }

  /**
   * Removes the listener invoked when the hovered nodes of the timeline graph change.
   * @param {function(Array)} listener
   */
  removeHighlightChangedListener(listener) {
    if (this.highlightListener === listener) {
      this.highlightListener = null
    }
  }

  /**
   * Adds the listener invoked when the time frame changes.
   * @param {function} listener
   */
  addTimeFrameChangedListener(listener) {
    this.timeFrameListener = listener
  }

  /**
   * Removes the listener invoked when the time frame changes.
   * @param {function} listener
   */
  removeTimeFrameEventListener(listener) {
    if (this.timeFrameListener === listener) {
      this.timeFrameListener = null
    }
  }

  /**
   * Fired when the selected nodes of the timeline graph change.
   * @param {IModelItem} item
   */
  onItemSelectionChanged(item) {
    if (!this.selectionListener) {
      return
    }
    const graphNodesSelected = []
    if (item && INode.isInstance(item)) {
      const graphNodes = this.timelineNodes2graphNodes.get(item)
      if (graphNodes) {
        graphNodes.forEach(node => graphNodesSelected.push(node))
        this.selectionListener.call(this, graphNodesSelected)
      }
    }
  }

  /**
   * Fired when the hovered nodes of the timeline graph change.
   * @param {IModelItem} item
   */
  onHoveredItemChanged(item) {
    if (!this.busy) {
      const graphNodesSelected = []
      const highlightIndicatorManager = this.timelineComponent.highlightIndicatorManager
      highlightIndicatorManager.clearHighlights()
      if (item && INode.isInstance(item)) {
        highlightIndicatorManager.addHighlight(item)
        this.highlightedNodes.add(item)
        if (!this.highlightListener) {
          return
        }
        const graphNodes = this.timelineNodes2graphNodes.get(item)
        if (graphNodes) {
          graphNodes.forEach(node => {
            if (this.filteredGraph.contains(node)) {
              graphNodesSelected.push(node)
            }
          })
        }
      }
      if (this.highlightListener) {
        this.highlightListener.call(this, graphNodesSelected)
      }
    }
  }

  /**
   * Highlights the node of the timeline based on the highlighted nodes of the source graph.
   * @param {IModelItem} item
   */
  updateHighlight(item) {
    const highlightIndicatorManager = this.timelineComponent.highlightIndicatorManager
    highlightIndicatorManager.clearHighlights()
    if (INode.isInstance(item)) {
      const timelineNodes = this.graphNodes2timelineNodes.get(item)
      timelineNodes.forEach(timelineNode => highlightIndicatorManager.addHighlight(timelineNode))
    }
  }

  /**
   * Selects the nodes of the timeline based on the selected nodes of the source graph.
   * @param {ICollection} nodes
   */
  updateSelection(nodes) {
    this.timelineComponent.selection.clear()

    if (nodes) {
      nodes.forEach(node => {
        const timelineNodes = this.graphNodes2timelineNodes.get(node)
        timelineNodes.forEach(timelineNode => {
          this.timelineComponent.selection.setSelected(timelineNode, true)
        })
      })
    }
  }

  /**
   * Sets whether or not the timeline component is enabled.
   * @param {boolean} enabled true if the timeline component is enabled, false otherwise
   */
  setEnabled(enabled) {
    this.timelineComponent.inputMode.enabled = enabled
    this.updateVideoButtonVisibleState(enabled)
  }

  /**
   * Initializes the component's variables.
   */
  init() {
    this.$filteringEnabled = true
    this.$filteredGraph = null
    this.$zoomfactor = 1
    this.$videoEnabled = true
    this.$busy = false
    this.zoomLevel = ZoomLevel.ZOOM_MONTHS
    this.zoomLevelEnabled = true

    this.dates = new List()
    this.timelineNodes = new List()

    this.date2interval = new Mapper()
    this.interval2date = new Mapper()
    this.interval2timelineNodes = new Mapper()
    this.timelineNodes2graphNodes = new Mapper()
    this.graphNodes2timelineNodes = new Mapper()

    this.timeFrameWidth = 0
    this.timeFrameAnimation = null
    this.timeFrameVisual = null
    this.timeAxisVisual = null
    this.hitNode = null
    this.positionHandler = null

    this.highlightedNodes = new List()

    // initialize timeline listeners
    this.selectionListener = null
    this.highlightListener = null
    this.timeFrameListener = null
    this.timeAxisCanvasObject = null
    this.timeFrameCanvasObject = null
  }

  /**
   * Gets the zoom factor.
   * @type {number}
   */
  get zoomFactor() {
    return this.$zoomfactor
  }

  /**
   * Sets the zoom factor and adjusts appropriately the zoom level.
   * @param {number} value
   */
  set zoomFactor(value) {
    this.$zoomfactor = value
    // based on the value, initialize the zoom level
    if (value <= 0.8) {
      this.zoomLevel = ZoomLevel.ZOOM_YEARS
    } else if (value > 0.8 && value <= 1) {
      this.zoomLevel = ZoomLevel.ZOOM_MONTHS
    } else {
      this.zoomLevel = ZoomLevel.ZOOM_DAYS
    }
  }

  /**
   * Initializes the timeline component.
   */
  initializeInputMode() {
    // enable the input mode
    const inputMode = new GraphViewerInputMode({
      clickableItems: GraphItemTypes.NODE,
      multiSelectionRecognizer: EventRecognizers.NEVER
    })
    inputMode.moveViewportInputMode.priority = 2
    inputMode.navigationInputMode.enabled = false
    inputMode.marqueeSelectionInputMode.enabled = false
    inputMode.addItemClickedListener((sender, evt) => this.onItemSelectionChanged(evt.item))
    inputMode.addCanvasClickedListener((sender, evt) => this.onCanvasClicked(evt.clickCount))

    // add hover input mode
    const timelineItemHoverInputMode = inputMode.itemHoverInputMode
    timelineItemHoverInputMode.hoverItems = GraphItemTypes.NODE
    timelineItemHoverInputMode.discardInvalidItems = false
    timelineItemHoverInputMode.addHoveredItemChangedListener((sender, evt) =>
      this.onHoveredItemChanged(evt.item)
    )
    this.timelineComponent.inputMode = inputMode

    // configure mouse wheel and size changed listener
    this.timelineComponent.mouseWheelBehavior = MouseWheelBehaviors.NONE
    this.timelineComponent.horizontalScrollBarPolicy = ScrollBarVisibility.ALWAYS
    this.timelineComponent.addSizeChangedListener(this.onSizeChanged.bind(this))

    // add tooltips to show the number of events on each hovered node
    this.setupTooltips()
  }

  /**
   * Initializes the selection/highlight/default node styles.
   */
  initializeNodeStyle() {
    const timelineGraph = this.timelineComponent.graph

    // configure node style for timeline bars
    timelineGraph.nodeDefaults.style = new ShapeNodeStyle({
      shape: 'rectangle',
      stroke: 'transparent',
      fill: 'dark_gray'
    })
    timelineGraph.nodeDefaults.size = new Size(10, 30)
    timelineGraph.nodeDefaults.shareStyleInstance = false

    // configure highlight for timeline bars that is applied when nodes in graph component are hovered
    const nodeDecorator = timelineGraph.decorator.nodeDecorator
    nodeDecorator.highlightDecorator.setImplementation(
      new NodeStyleDecorationInstaller({
        nodeStyle: new ShapeNodeStyle({
          shape: 'rectangle',
          stroke: '3px slateblue',
          fill: 'transparent'
        }),
        margins: 1,
        zoomPolicy: StyleDecorationZoomPolicy.WORLD_COORDINATES
      })
    )

    // configure selection for timeline bars that is applied when nodes in graph component are selected
    nodeDecorator.selectionDecorator.setImplementation(
      new NodeStyleDecorationInstaller({
        nodeStyle: new ShapeNodeStyle({
          shape: 'rectangle',
          stroke: 'darkblue',
          fill: 'darkblue'
        }),
        margins: 0
      })
    )
    nodeDecorator.focusIndicatorDecorator.hideImplementation()

    // initialize the highlight manager
    this.timelineComponent.highlightIndicatorManager = new HighlightIndicatorManager(
      this.timelineComponent
    )
  }

  /**
   * Checks whether or not a node of the source graph should be displayed. If filtering is not enabled, it returns
   * always true.
   * @param {INode} node the node to check
   * @return {boolean} true if a node should be displayed, false otherwise
   */
  nodePredicateChanged(node) {
    if (this.filteringEnabled || !this.timeFrameVisual) {
      const timelineNodes = this.graphNodes2timelineNodes.get(node)

      if (timelineNodes) {
        const mid = timelineNodes.length / 2
        for (let i = 0; i < mid; i++) {
          if (
            Math.abs(
              timelineNodes[i].tag.isInTimeFrame + timelineNodes[mid + i].tag.isInTimeFrame
            ) < 2
          ) {
            return true
          }
        }
      }
      return false
    }
    return true
  }

  /**
   * Creates the nodes of the timeline graph and adds the time axis visual.
   */
  createTimelineNodes() {
    const graph = this.filteredGraph.wrappedGraph
    if (graph.nodes.size === 0) {
      this.updateVideoButtonVisibleState(false)
      return
    }
    // initialize the calendar based on the source graph
    this.initializeCalendar(graph)

    const timelineGraph = this.timelineComponent.graph

    // generates the full calendar between the first and the last day of the data-set
    const fullCalendar = TimelineComponent.generateFullCalendar(
      this.dates.get(0),
      this.dates.get(this.dates.size - 1)
    )

    const maxInterval = this.getMaxInterval(this.zoomLevel, fullCalendar)
    const xOffset = getXOffset(this.zoomLevel)

    // adds the visual that displays the timeline bar
    if (!this.timeAxisVisual) {
      this.timeAxisVisual = new TimeAxisVisual(fullCalendar, this.zoomLevel)
      this.timeAxisCanvasObject = this.timelineComponent.backgroundGroup.addChild(
        this.timeAxisVisual,
        ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
      )
    } else {
      this.timeAxisVisual.zoomLevel = this.zoomLevel
    }

    // associates the node with the enter/exit intervals to which they belong
    graph.nodes.forEach(node => {
      const enterDates = node.tag.enter
      enterDates.forEach(date => {
        const enterInterval = this.date2interval.get(TimelineComponent.getDateFormat(date))
        // associates the node with its enter/exit interval
        if (!this.interval2timelineNodes.get(enterInterval)) {
          this.interval2timelineNodes.set(enterInterval, [node])
        } else {
          this.interval2timelineNodes.get(enterInterval).push(node)
        }
      })

      const exitDates = node.tag.exit
      exitDates.forEach(date => {
        const exitInterval = this.date2interval.get(TimelineComponent.getDateFormat(date))
        // associates the node with its enter/exit interval
        if (!this.interval2timelineNodes.get(exitInterval)) {
          this.interval2timelineNodes.set(exitInterval, [node])
        } else {
          this.interval2timelineNodes.get(exitInterval).push(node)
        }
      })
    })

    let x = 0
    for (let i = 1; i <= maxInterval; i++) {
      const mainGraphNodes = this.interval2timelineNodes.get(i)
      let timelineNode

      // for each node of the source graph, we create the corresponding timeline node
      if (mainGraphNodes && mainGraphNodes.length !== 0) {
        const currentNodesCount = mainGraphNodes.length
        const unitHeight = 3
        // create the timeline nodes
        timelineNode = timelineGraph.createNode(
          new Rect(x, -currentNodesCount * unitHeight, xOffset - 5, currentNodesCount * unitHeight)
        )

        mainGraphNodes.forEach(node => {
          if (this.graphNodes2timelineNodes.get(node)) {
            this.graphNodes2timelineNodes.get(node).push(timelineNode)
          } else {
            this.graphNodes2timelineNodes.set(node, [timelineNode])
          }

          if (this.timelineNodes2graphNodes.get(timelineNode)) {
            this.timelineNodes2graphNodes.get(timelineNode).push(node)
          } else {
            this.timelineNodes2graphNodes.set(timelineNode, [node])
          }
        })

        // sorts the nodes of the source graph based on their dates
        mainGraphNodes.forEach(node => {
          if (this.graphNodes2timelineNodes.get(node)) {
            const list = this.graphNodes2timelineNodes.get(node)
            list.sort((node1, node2) => {
              if (node1.layout.x < node2.layout.x) {
                return -1
              } else if (node1.layout.x > node2.layout.x) {
                return 1
              }
              return 0
            })
          }
        })
      } else {
        // if no node is associated with a time interval we create only a node of unit height
        timelineNode = timelineGraph.createNode(new Rect(x, -1, xOffset - 5, 1))
      }

      timelineNode.tag = {
        type: 'bar',
        date: this.interval2date.get(i)
      }

      this.timelineNodes.add(timelineNode)
      x += xOffset
    }
  }

  /**
   * Finds and sorts the dates associated with each node of the source graph.
   * @param {IGraph} graph
   */
  initializeCalendar(graph) {
    graph.nodes.forEach(node => {
      const enterDates = node.tag.enter
      const convertedEnterDates = []
      const convertedExitDates = []

      enterDates.forEach(date => {
        const convertedDate = new Date(date)
        this.dates.add(convertedDate)
        convertedEnterDates.push(convertedDate)
      })
      node.tag.enter = convertedEnterDates

      const exitDates = node.tag.exit
      exitDates.forEach(date => {
        const convertedDate = new Date(date)
        this.dates.add(convertedDate)
        convertedExitDates.push(convertedDate)
      })
      node.tag.exit = convertedExitDates
    })

    this.dates.sort(
      new IComparer((entry1, entry2) => {
        // Shorthand interface implementation, sorts the dates in ascending order.
        if (entry1.getTime() < entry2.getTime()) {
          return -1
        } else if (entry1.getTime() > entry2.getTime()) {
          return 1
        }
        return 0
      })
    )
  }

  /**
   * Displays the timeline graph.
   * @param {boolean} moveOnlyRectangle true if only the rectangle should be moved, false otherwise
   */
  displayTimeline(moveOnlyRectangle) {
    if (this.filteredGraph.wrappedGraph.nodes.size === 0) {
      return
    }
    let updatedContentRectX
    const updateRequired = this.hitNode !== null

    if (!moveOnlyRectangle) {
      // find the nodes from which the visual rectangle starts/ends, such that after zooming the rectangle remains at
      // the same dates
      let visualRectangleStartNode
      let visualRectangleEndNode
      if (updateRequired) {
        const boundaryNodes = this.getBoundaryNodes()
        visualRectangleStartNode = boundaryNodes.visualRectangleStartNode
        visualRectangleEndNode = boundaryNodes.visualRectangleEndNode
      }

      this.resetTimeline()
      this.createTimelineNodes()

      // updates the content rect so that all the new nodes are included
      updatedContentRectX = this.getUpdatedRectanglePosition()
      const contentRect = this.timelineComponent.contentRect

      // if a date was hit, we have to find the interval to which it belongs in the updated timeline bar, since we
      // want after the zooming to be at the same time interval that we were before zooming
      // updatedRectangleStartNode, updatedRectangleEndNode holds the new timeline node after zooming
      let updatedRectangleStartNode
      let updatedRectangleEndNode
      let includedNodes = 0
      if (updateRequired) {
        for (let i = 0; i < this.timelineNodes.size; i++) {
          const node = this.timelineNodes.get(i)
          const dates = node.tag.date
          if (dates.includes(this.hitNode.tag.date[0])) {
            this.hitNode = node
          }
          // find the node from which the rectangle should start
          if (
            visualRectangleStartNode &&
            dates.indexOf(visualRectangleStartNode.tag.date[0]) >= 0
          ) {
            updatedRectangleStartNode = node
          }
          // count the nodes included between visualRectangleStartNode and updatedRectangleEndNode
          if (updatedRectangleStartNode && !updatedRectangleEndNode) {
            includedNodes++
          }

          // find the node at which the rectangle should end
          if (visualRectangleEndNode) {
            const nodeDates = visualRectangleEndNode.tag.date
            if (dates.indexOf(nodeDates[nodeDates.length - 1]) >= 0) {
              updatedRectangleEndNode = node
            }
          }

          // if both found, break
          if (updatedRectangleStartNode && updatedRectangleEndNode) {
            break
          }
        }
        this.updateTimeFrameWidth(contentRect, this.hitNode.layout.center.x, includedNodes)

        const lastNode = this.timelineComponent.graph.nodes.last()
        const lastX = lastNode.layout.x + lastNode.layout.width
        updatedContentRectX = updatedRectangleStartNode
          ? updatedRectangleStartNode.layout.x
          : this.hitNode.layout.x

        // adjusts the frame width if the rectangle does not fit
        if (updatedContentRectX + this.timeFrameWidth >= lastX) {
          this.timeFrameWidth = lastX - updatedContentRectX - 2
        }

        this.hitNode = null
      } else {
        // zooms to the content rect
        const zoomRect = new Rect(contentRect.centerX, contentRect.y, 0, contentRect.height)
        this.timelineComponent.maximumZoom = 100000
        this.timelineComponent.minimumZoom = 0.001
        this.timelineComponent.zoomTo(zoomRect)
        this.timelineComponent.minimumZoom = this.timelineComponent.zoom
        this.timelineComponent.maximumZoom = this.timelineComponent.zoom
      }
    }

    // initializes the rectangle's width
    if (this.timeFrameWidth === 0) {
      this.timeFrameWidth =
        Math.min(this.timelineComponent.size.width, this.timelineComponent.contentRect.width) * 0.4
    }

    // calculate the minimum and maximum y coordinates
    const boundary = this.calculateBoundaryCoordinates(this.timelineComponent.graph.nodes)
    const maxY = boundary.maxY
    const minY = boundary.minY

    const contentRect = this.timelineComponent.contentRect
    // on double click center the rectangle with respect to the mouse position
    if (moveOnlyRectangle) {
      updatedContentRectX = this.timelineComponent.lastMouseEvent.location.x
      const lastX = contentRect.x + contentRect.width

      if (updatedContentRectX + this.timeFrameWidth >= lastX) {
        updatedContentRectX = lastX - this.timeFrameWidth
      } else if (updatedContentRectX < contentRect.x) {
        updatedContentRectX = contentRect.x
      }
      if (
        updatedContentRectX < this.timelineComponent.viewPoint.x ||
        updatedContentRectX > this.timelineComponent.viewPoint.x + this.timelineComponent.size.width
      ) {
        this.timelineComponent.ensureVisible(
          new Rect(updatedContentRectX, minY - 4, this.timeFrameWidth, maxY - minY + 8)
        )
      }
      this.timelineComponent.invalidate()
    }

    // correct if the timeline graph does not fit in the timeline component
    if (contentRect.height >= this.timelineComponent.size.height) {
      const newZoomFactor = (this.timelineComponent.size.height - 15) / contentRect.height
      this.updateZoomFactor(newZoomFactor)
      this.timelineComponent.viewPoint = new Point(
        this.timelineComponent.viewPoint.x,
        contentRect.y
      )
    }

    // create the new rectangle
    const rectangle = new MutableRectangle(
      updatedContentRectX,
      minY - 4,
      this.timeFrameWidth,
      maxY - minY + 8
    )
    this.timeFrameWidth = rectangle.width

    // add the time frame visual or modify it if its already there
    if (!this.timeFrameVisual) {
      this.createTimeFrameVisual(rectangle)
    } else {
      this.timeFrameVisual.rectangle.reshape(rectangle)
      this.positionHandler.boundaryRectangle = contentRect
    }

    // updateRequired the timeline nodes
    const visualRect = this.timeFrameVisual.rectangle
    this.onTimeFrameChanged(visualRect.x, visualRect.x + visualRect.width)
  }

  /**
   * Returns the nodes of the timeline that lie on the left and right boundary of the visual rectangle.
   * @return {{visualRectangleStartNode: INode, visualRectangleEndNode: INode}}
   */
  getBoundaryNodes() {
    let visualRectangleStartNode
    let visualRectangleEndNode
    let minXFromStart = Number.MAX_VALUE
    let minXFromEnd = Number.MAX_VALUE
    const visualRect = this.timeFrameVisual.rectangle

    for (let i = 0; i < this.timelineNodes.size; i++) {
      const node = this.timelineNodes.get(i)
      const distFromStart = Math.abs(node.layout.x - visualRect.x)
      const distFromEnd = Math.abs(
        node.layout.x + node.layout.width - (visualRect.x + visualRect.width)
      )

      let firstFound = false
      let lastFound = false
      if (!firstFound && distFromStart <= minXFromStart) {
        visualRectangleStartNode = node
        minXFromStart = distFromStart
      } else {
        firstFound = true
      }
      if (!lastFound && distFromEnd <= minXFromEnd) {
        visualRectangleEndNode = node
        minXFromEnd = distFromEnd
      } else {
        lastFound = true
      }

      if (firstFound && lastFound) {
        break
      }
    }
    return {
      visualRectangleStartNode,
      visualRectangleEndNode
    }
  }

  /**
   * Updates the new content rectangle of the timeline component so that the labels showing years, months, days of
   * the timeline are being included in the content rectangle. At the end, returns the rectangle position which
   * has to be calculated based on the old rectangle.
   * @return {number}
   */
  getUpdatedRectanglePosition() {
    this.timelineComponent.updateContentRect(new Insets(10))

    let additionalHeight
    const labelHeight = 20
    const yOffset = 5

    // calculates the additional height needed for the labels showing years, months, days of the timeline
    switch (this.zoomLevel) {
      case ZoomLevel.ZOOM_YEARS:
        additionalHeight = yOffset + labelHeight
        break
      case ZoomLevel.ZOOM_DAYS:
        additionalHeight = 3 * (labelHeight + yOffset)
        break
      default:
      case ZoomLevel.ZOOM_MONTHS:
        additionalHeight = 2 * (labelHeight + yOffset)
        break
    }

    const bounds = this.timelineComponent.size
    const oldRect = this.timelineComponent.contentRect
    // updates the new content rectangle so that the labels showing years, months, days of the timeline are being
    // included
    const contentRect = new Rect(
      oldRect.x,
      oldRect.y,
      oldRect.width,
      oldRect.height + additionalHeight
    )
    this.timelineComponent.contentRect = contentRect

    // configures the viewport limiter so that its height is exactly the height of the content rect and
    // no vertical scrolling occurs
    const limiter = this.timelineComponent.viewportLimiter
    limiter.honorBothDimensions = false
    limiter.bounds = contentRect

    return oldRect.centerX - Math.min(oldRect.width, bounds.width) * 0.2
  }

  /**
   * Updates the frame window when the zoom level changes. If a user has zoomed to a specific date, we have
   * to scroll the timeline bar at this specific date. For this, we need to find the last mouse location and
   * calculate the new moveOnlyRectangle by changing the viewpoint of the graphComponent.
   * @param {Rect} contentRect
   * @param {number} hitNodeX
   * @param {number} includedNodes
   */
  updateTimeFrameWidth(contentRect, hitNodeX, includedNodes) {
    const lastMouseLocationX = this.timelineComponent.lastMouseEvent.location.x
    const oldViewPointX = this.timelineComponent.viewPoint.x

    const oldZoomFactor = this.timelineComponent.zoom
    const newZoomFactor = (this.timelineComponent.size.height - 15) / contentRect.height
    // we calculate the new view port based on the new zoom level
    const newViewPointX =
      hitNodeX - ((lastMouseLocationX - oldViewPointX) / newZoomFactor) * oldZoomFactor

    // the width of new rectangle is calculated by the width of the nodes included in each interval of the current
    // new zoom level
    // this width cannot also exceed the width of the timeline component
    this.timeFrameWidth = getXOffset(this.zoomLevel) * includedNodes
    // we set the minimumZoom/ maximumZoom to the new zoom factor, so that no other zooming is allowed
    this.updateZoomFactor(newZoomFactor)
    // we update the viewpoint
    this.timelineComponent.viewPoint = new Point(newViewPointX, contentRect.y)
  }

  /**
   * Finds the minimum and the maximum coordinates if the nodes of the timeline graph.
   * @param {ICollection} nodes
   * @returns {{maxY: number, minY: Number}}
   */
  calculateBoundaryCoordinates(nodes) {
    let minX = Number.MAX_VALUE
    let maxX = -Number.MIN_VALUE
    let minY = Number.MAX_VALUE
    let maxY = -Number.MIN_VALUE

    // finds the minimum and maximum y-coordinate of the timeline nodes
    nodes.forEach(node => {
      const layout = node.layout
      minX = Math.min(minX, layout.x)
      minY = Math.min(minY, layout.y)
      maxX = Math.max(maxX, layout.x + layout.width)
      maxY = Math.max(maxY, layout.y + layout.height)
    })
    return {
      minX,
      minY,
      maxX,
      maxY
    }
  }

  /**
   * Creates the rectangle of the timeline view that will determine which nodes will be included in the graph.
   * @param {Rect} rectangle The given rectangle based on which the visual will be created.
   */
  createTimeFrameVisual(rectangle) {
    this.timeFrameVisual = new TimeFrameVisual(rectangle)
    this.timeFrameCanvasObject = this.timelineComponent.backgroundGroup.addChild(
      this.timeFrameVisual,
      ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
    )

    // creates the handle input mode that manages the handles of the rectangle
    this.handleInputMode = new HandleInputMode()
    this.handleInputMode.priority = 0

    this.handles = new ObservableCollection()
    this.handles.add(new RectangleHandle(HandlePositions.EAST, rectangle))
    this.handles.add(new RectangleHandle(HandlePositions.WEST, rectangle))
    this.handleInputMode.handles = this.handles
    // add the listeners of dragging events
    this.handleInputMode.addDraggingListener(this.onManuallyTimeFrameChanged.bind(this))
    this.handleInputMode.addDragFinishedListener(this.onManuallyTimeFrameChanged.bind(this))
    this.timelineComponent.inputMode.add(this.handleInputMode)

    // creates the move input mode that manages the movement of the rectangle
    this.moveInputMode = new MoveInputMode()
    this.moveInputMode.hitTestable = IHitTestable.create((context, location) =>
      rectangle.containsWithEps(location, context.hitTestRadius + 3 / context.zoom)
    )
    this.positionHandler = new TimeFramePositionHandler(
      rectangle,
      this.timelineComponent.contentRect,
      !this.busy
    )
    this.moveInputMode.positionHandler = this.positionHandler
    this.moveInputMode.addDraggingListener(this.onManuallyTimeFrameChanged.bind(this))
    this.moveInputMode.addDragFinishedListener(this.onManuallyTimeFrameChanged.bind(this))
    this.moveInputMode.priority = 1
    this.timelineComponent.inputMode.add(this.moveInputMode)
  }

  /**
   * Updates the time frame based on the movement of the rectangle.
   */
  onManuallyTimeFrameChanged() {
    this.getTimeFrameAnimation().startLocation = null
    this.onTimeFrameChanged(
      this.timeFrameVisual.rectangle.x,
      this.timeFrameVisual.rectangle.x + this.timeFrameVisual.rectangle.width
    )
  }

  /**
   * Creates and returns the time frame animation for the video.
   * @returns {TimeFrameAnimation} The time frame animation
   */
  getTimeFrameAnimation() {
    if (
      this.timeFrameAnimation === null ||
      (this.timeFrameVisual && this.timeFrameAnimation.timeFrame !== this.timeFrameVisual.rectangle)
    ) {
      // create new animation object if there is none or if the time frame has changed
      this.timeFrameAnimation = new TimeFrameAnimation(
        this.timeFrameVisual.rectangle,
        this.timelineComponent,
        this.graphComponent
      )
      this.timeFrameAnimation.addTimeFrameListener(this.onTimeFrameChanged.bind(this))
      this.timeFrameAnimation.addAnimationEndedListener(this.onSwitchVideoButtonState.bind(this))
    }
    return this.timeFrameAnimation
  }

  /**
   * Updates the timeline nodes by adjusting their color based on which they belong to the rectangle or not and
   * also changes the predicate for the nodes of the graphComponent.
   * @param {number} minTime The minimum x coordinate of the visual rectangle
   * @param {number} maxTime The maximum x coordinate of the visual rectangle
   */
  onTimeFrameChanged(minTime, maxTime) {
    const timelineGraph = this.timelineComponent.graph

    // remove selections/highlights if the selected nodes are not any more in the graph
    if (this.graphComponent.selection.selectedNodes.size === 0) {
      this.timelineComponent.selection.clear()
    }

    if (this.highlightedNodes.size === 0) {
      this.timelineComponent.highlightIndicatorManager.clearHighlights()
    }

    // updates the rectangle width in case of a dragging event
    this.timeFrameWidth = maxTime - minTime

    const visibleGraphNodes = []
    let minX = Number.MAX_VALUE
    let maxX = -Number.MIN_VALUE
    let startDate
    let endDate
    let updateRequired = false
    const nodesToUpdate = []
    timelineGraph.nodes.forEach(node => {
      if (node.tag.type === 'bar') {
        const oldState = node.tag.isInTimeFrame
        const layout = node.layout
        if (minTime <= layout.center.x && maxTime >= layout.center.x) {
          node.style.fill = Fill.GRAY
          node.tag.isInTimeFrame = 0
          const graphNodes = this.timelineNodes2graphNodes.get(node)
          if (graphNodes) {
            graphNodes.forEach(n => visibleGraphNodes.push(n))
          }
          if (minX >= layout.center.x) {
            minX = layout.center.x
            startDate = node.tag.date
          }
          if (maxX <= layout.center.x) {
            maxX = layout.center.x
            endDate = node.tag.date
          }
        } else if (minTime > layout.center.x) {
          node.style.fill = Fill.LIGHT_GRAY
          node.tag.isInTimeFrame = 1
        } else if (maxTime < layout.center.x) {
          node.style.fill = Fill.LIGHT_GRAY
          node.tag.isInTimeFrame = -1
        }
        if (node.tag.isInTimeFrame !== oldState) {
          nodesToUpdate.push(node)
        }

        // only if at least one needs update, update the frame
        if (!updateRequired && node.tag.isInTimeFrame !== oldState) {
          updateRequired = true
        }
      }
    })

    // if the timeline component has to filter the graph, just call method nodePredicateChanged of the filtered
    // graph, otherwise fire the event
    if (updateRequired && this.filteringEnabled) {
      const visited = new Set()
      nodesToUpdate.forEach(node => {
        const graphNodes = this.timelineNodes2graphNodes.get(node)
        if (graphNodes) {
          graphNodes.forEach(n => {
            if (!visited.has(n)) {
              visited.add(n)
              this.filteredGraph.nodePredicateChanged(n)
            }
          })
        }
      })
    }
    // if there exists a timeFrame listener, we have to fire the start and the end dates
    if (updateRequired && this.timeFrameListener) {
      if (startDate && endDate) {
        this.timeFrameListener.call(this, startDate, endDate)
      }
    }
  }

  /**
   * Updates the timeline graph if the size of the panel changes.
   */
  onSizeChanged() {
    const contentRect = this.timelineComponent.contentRect
    const oldZoomFactor = this.timelineComponent.zoom
    const newZoomFactor = (this.timelineComponent.size.height - 15) / contentRect.height
    this.updateZoomFactor(newZoomFactor)
    const newViewPointX = contentRect.x / (newZoomFactor * oldZoomFactor)
    this.timelineComponent.viewPoint = new Point(newViewPointX, contentRect.y)
  }

  /**
   * Changes the zoom level of the timeline view so that more information about time intervals is displayed. The
   * order is years (zoom level 0.8) -> months (zoom level 1) -> days (zoom level 1.2). By default zoom === 1.
   * @param {number} wheelDelta The signed number of mouse wheel turn units
   * @param {Point} location The coordinates in the world coordinate space associated with the event
   */
  onMouseWheel(wheelDelta, location) {
    if (!this.busy) {
      const oldZoomFactor = this.zoomFactor
      if (wheelDelta === 1) {
        this.zoomFactor = Math.min(this.zoomFactor + 0.2, 1.2)
      } else {
        this.zoomFactor = Math.max(this.zoomFactor - 0.2, 0.8)
      }

      // if we have the same zoom factor, we don't have to update... else we have to find the node that was
      // hit by the mouse cursor, so that we determine the exact time interval that was hit
      if (this.zoomFactor !== oldZoomFactor) {
        this.hitNode = null

        if (this.timelineNodes) {
          this.hitPoint = location
          const boundary = this.calculateBoundaryCoordinates(this.timelineComponent.graph.nodes)
          const maxY = boundary.maxY
          const minY = boundary.minY

          let minDist = Number.MAX_VALUE
          this.timelineNodes.forEach(node => {
            const rectangleCenter = node.layout.center
            // we search for the node that is closer to the vertical line that passes from the hit point
            const distToNodeCenter = Geom.distanceToLineSegment(
              rectangleCenter.x,
              rectangleCenter.y,
              this.hitPoint.x,
              minY - 300,
              this.hitPoint.x,
              maxY + 300
            )
            if (distToNodeCenter < minDist) {
              minDist = distToNodeCenter
              this.hitNode = node
            }
          })
        }

        // update the timeline
        this.displayTimeline(false)
      }
    }
  }

  /**
   * Clicking on the canvas moves the rectangle to the mouse location and clears all selections and highlights
   * from the nodes.
   * @param {number} clickCount The number of clicks associated with the event
   */
  onCanvasClicked(clickCount) {
    this.timelineComponent.selection.clear()
    if (this.selectionListener) {
      this.selectionListener.call(this, [])
    }

    if (clickCount === 2) {
      this.displayTimeline(true)
    }
  }

  /**
   * Sets the minimum/maximum and zoom of the timeline component, so that no other zooming is allowed.
   * @param {number} zoomFactor
   */
  updateZoomFactor(zoomFactor) {
    this.timelineComponent.minimumZoom = zoomFactor
    this.timelineComponent.maximumZoom = zoomFactor
    this.timelineComponent.zoom = zoomFactor
  }

  /**
   * Resets the timeline graph and the corresponding maps.
   */
  resetTimeline() {
    if (this.timeFrameAnimation) {
      const animation = this.getTimeFrameAnimation()
      if (animation.animating) {
        animation.stopAnimation()
        this.onSwitchVideoButtonState()
      }
    }
    this.timelineComponent.graph.clear()
    this.timelineNodes.clear()
    this.interval2timelineNodes.clear()
    this.date2interval.clear()
    this.graphNodes2timelineNodes.clear()
    this.timelineNodes2graphNodes.clear()
    this.interval2date.clear()
    this.dates.clear()
    this.highlightedNodes.clear()
    this.updateVideoButtonVisibleState(true)
  }

  /**
   * Removes all visual objects from the timeline view.
   */
  removeTimelineComponent() {
    this.filteredGraph.wrappedGraph.clear()
    this.zoomFactor = 1
    this.resetTimeline()

    if (this.timeAxisCanvasObject) {
      this.timeAxisCanvasObject.remove()
      this.timeAxisCanvasObject = null
      this.timeAxisVisual = null
    }

    if (this.timeFrameCanvasObject) {
      this.timeFrameCanvasObject.remove()
      this.timeFrameCanvasObject = null
      this.timeFrameVisual = null

      // remove handles
      this.handles.clear()
      this.timelineComponent.inputMode.remove(this.handleInputMode)
      this.timelineComponent.inputMode.remove(this.moveInputMode)

      this.timeFrameWidth = 0
    }
  }

  /**
   * Sets the tooltip content that displays information about the hovered nodes.
   */
  setupTooltips() {
    const inputMode = this.timelineComponent.inputMode
    inputMode.toolTipItems = GraphItemTypes.NODE
    inputMode.addQueryItemToolTipListener((src, eventArgs) => {
      if (eventArgs.handled) {
        // Tooltip content has already been assigned -> nothing to do.
        return
      }
      const item = eventArgs.item
      if (INode.isInstance(item)) {
        const graphNodes = this.timelineNodes2graphNodes.get(item)
        eventArgs.toolTip = `${graphNodes ? graphNodes.length : 0}`
        eventArgs.handled = true
      }
    })

    // Add a little offset to the tooltip such that it is not obscured by the mouse pointer.
    inputMode.mouseHoverInputMode.toolTipLocationOffset = new Point(5, 5)
  }

  /**
   * Generates the full calendar between two given days.
   * @param {string} startDate
   * @param {string} endDate
   * @return {Array}
   */
  static generateFullCalendar(startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)

    const months = getMonths()
    // to correct the end date, we have to know exactly how many days each month has
    const days = calculateDaysOfMonth(months[end.getMonth()], end.getFullYear())

    // use the first day of the start month and the last day of the end month
    const correctedStartDate = new Date(start.getFullYear(), start.getMonth(), 1)
    const correctedEndDate = new Date(end.getFullYear(), end.getMonth(), days)

    // holds the in-between dates
    const dates = []
    let day

    let currentDate = correctedStartDate
    while (currentDate < correctedEndDate) {
      dates.push(new Date(currentDate))
      day = currentDate.getDate()
      currentDate = new Date(currentDate.setDate(++day))
    }
    dates.push(correctedEndDate)
    return dates
  }

  /**
   * Splits the calendar based on the current zoom level and returns the resulting number of divided periods.
   * @param {number} zoomLevel
   * @param {Array} fullCalendar
   * @return {number}
   */
  getMaxInterval(zoomLevel, fullCalendar) {
    switch (zoomLevel) {
      case ZoomLevel.ZOOM_YEARS:
        // display for each year, the corresponding months
        return this.splitInMonths(fullCalendar)
      case ZoomLevel.ZOOM_DAYS:
        // display all days
        return this.splitInDays(fullCalendar)
      default:
      case ZoomLevel.ZOOM_MONTHS:
        // display for each month, the corresponding weeks
        return this.splitInWeeks(fullCalendar)
    }
  }

  /**
   * Associates the nodes with the interval to which they belong based on their dates (in days).
   * @param {Array} fullCalendar
   */
  splitInDays(fullCalendar) {
    for (let i = 0; i < fullCalendar.length; i++) {
      const interval = i + 1
      const formattedDate = TimelineComponent.getDateFormat(fullCalendar[i])
      this.date2interval.set(formattedDate, interval)

      if (!this.interval2date.get(interval)) {
        this.interval2date.set(interval, [formattedDate])
      } else {
        this.interval2date.get(interval).push(formattedDate)
      }
    }
    // for the days the maximum interval equals to the size of the full calendar
    return fullCalendar.length
  }

  /**
   * Associates the nodes with the interval to which they belong based on their dates (in months).
   * @param {Array} fullCalendar
   */
  splitInMonths(fullCalendar) {
    const startMonth = fullCalendar[0].getMonth() + 1
    const startYear = fullCalendar[0].getFullYear()

    let maxInterval = -Number.MIN_VALUE
    fullCalendar.forEach(date => {
      const month = date.getMonth() + 1
      const year = date.getFullYear()

      const finalInterval = (year - startYear) * 12 + (month - startMonth) + 1
      maxInterval = Math.max(maxInterval, finalInterval)

      const formattedDate = TimelineComponent.getDateFormat(date)
      this.date2interval.set(formattedDate, finalInterval)

      if (!this.interval2date.get(finalInterval)) {
        this.interval2date.set(finalInterval, [formattedDate])
      } else {
        this.interval2date.get(finalInterval).push(formattedDate)
      }
    })

    return maxInterval
  }

  /**
   * Associates the nodes with the interval to which they belong based on their dates (in weeks).
   * @param {Array} fullCalendar
   */
  splitInWeeks(fullCalendar) {
    const startMonth = fullCalendar[0].getMonth() + 1
    const startYear = fullCalendar[0].getFullYear()

    let maxInterval = -Number.MIN_VALUE
    fullCalendar.forEach(date => {
      const month = date.getMonth() + 1
      const day = date.getDate()
      const year = date.getFullYear()

      let internalInterval
      if (day < 8) {
        internalInterval = 1
      } else if (day >= 8 && day < 15) {
        internalInterval = 2
      } else if (day >= 15 && day < 22) {
        internalInterval = 3
      } else {
        internalInterval = 4
      }

      const finalInterval =
        (year - startYear) * 12 * 4 + (month - startMonth) * 4 + internalInterval
      maxInterval = Math.max(maxInterval, finalInterval)

      const formattedDate = TimelineComponent.getDateFormat(date)
      this.date2interval.set(formattedDate, finalInterval)

      if (!this.interval2date.get(finalInterval)) {
        this.interval2date.set(finalInterval, [formattedDate])
      } else {
        this.interval2date.get(finalInterval).push(formattedDate)
      }
    })

    return maxInterval
  }

  /**
   * Returns the given date in "yyyy-mm-dd" format.
   * @param {Date} date
   */
  static getDateFormat(date) {
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
  }

  /**
   * Creates the div component.
   */
  createComponentDiv() {
    const container = document.getElementById(this.selector)
    this.timelineComponent = new GraphComponent()
    const timelineComponentDiv = this.timelineComponent.div
    timelineComponentDiv.id = `${this.selector}-innerDiv`
    addClass(timelineComponentDiv, 'innerDiv')
    container.appendChild(timelineComponentDiv)
    timelineComponentDiv.appendChild(this.createVideoButton())
  }

  /**
   * Creates the html div for the video buttons.
   * @return {Element}
   */
  createVideoButton() {
    const button = document.createElement('button')
    button.id = `${this.selector}-video-button`
    button.title = 'Play Video'
    addClass(button, 'video-button')
    addClass(button, 'play')
    button.addEventListener('click', this.onVideoButtonStateChanged.bind(this))
    return button
  }

  /**
   * Starts/stops the time-frame animation depending on the new state of the button.
   * Also updates the button icon.
   */
  onVideoButtonStateChanged() {
    const animation = this.getTimeFrameAnimation()
    if (animation.animating) {
      animation.stopAnimation()
    } else {
      this.graphComponent.fitGraphBounds()
      animation.playAnimation()
    }
    const videoButton = document.getElementById(`${this.selector}-video-button`)
    toggleClass(videoButton, 'play')
    toggleClass(videoButton, 'stop')
  }

  /**
   * Switches the icon of the video button.
   */
  onSwitchVideoButtonState() {
    const videoButton = document.getElementById(`${this.selector}-video-button`)
    toggleClass(videoButton, 'play')
    toggleClass(videoButton, 'stop')
  }

  /**
   * Disables the video buttons.
   * @param {boolean} enabled true if the video buttons should be enabled, false otherwise
   */
  updateVideoButtonVisibleState(enabled) {
    const videoButton = document.getElementById(`${this.selector}-video-button`)
    videoButton.disabled = !enabled
  }

  /**
   * Stops the animation.
   */
  onStop() {
    this.getTimeFrameAnimation().stopAnimation()
  }

  /**
   * Plays the animation.
   */
  onPlay() {
    const animation = this.getTimeFrameAnimation()
    animation.stopAnimation()
    animation.playAnimation()
  }
}

/**
 * Creates the time axis visual that displays information about years, months or days.
 */
class TimeAxisVisual extends BaseClass(IVisualCreator) {
  /**
   * Creates a new instance of TimeAxisVisual.
   * @param {Array} fullCalendar
   * @param {number} zoomLevel
   */
  constructor(fullCalendar, zoomLevel) {
    super()
    this.fullCalendar = fullCalendar
    this.zoomLevel = zoomLevel
  }

  /**
   * Creates the axis visual.
   * @param {IRenderContext} context
   * @returns {SvgVisual}
   */
  createVisual(context) {
    const container = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')

    // Cache the necessary data for rendering of the node
    const cache = { zoomLevel: this.zoomLevel }
    // Render the node
    this.render(container, cache)
    return new SvgVisual(container)
  }

  /**
   * Updates the axis visual to improve performance.
   * @param {IRenderContext} context
   * @param {Visual} oldVisual
   * @returns {SvgVisual}
   */
  updateVisual(context, oldVisual) {
    const container = oldVisual.svgElement
    // get the data with which the oldvisual was created
    const oldCache = container['data-renderDataCache']
    const newCache = { zoomLevel: this.zoomLevel }

    if (oldCache.zoomLevel !== newCache.zoomLevel) {
      return this.createVisual(context)
    }

    container['render-data-cache'] = newCache
    return oldVisual
  }

  /**
   * Renders the axis visual.
   * @param {SVGElement} container
   * @param {object} cache
   */
  render(container, cache) {
    container['data-renderDataCache'] = cache

    // determine the intermediate years between the first and the last date
    const years = TimeAxisVisual.findIntermediateYears(
      this.fullCalendar[0],
      this.fullCalendar[this.fullCalendar.length - 1]
    )

    // determine the intermediate months between the first and the last date
    const year2Months = TimeAxisVisual.findIntermediateMonths(this.fullCalendar)

    const height = 20
    let yearX = 0
    const y = 0

    for (let i = 0; i < years.length; i++) {
      const year = years[i]

      // alternate colors of consecutive years
      const color1 = i % 2 === 0 ? '#6991ff' : '#9bc3ff'
      const color2 = i % 2 === 0 ? '#9bc3ff' : '#6991ff'
      const yearColor = color1

      // show years
      const yearShape = window.document.createElementNS('http://www.w3.org/2000/svg', 'rect')

      let yearY
      switch (this.zoomLevel) {
        case ZoomLevel.ZOOM_YEARS:
          yearY = y + 5
          break
        case ZoomLevel.ZOOM_DAYS:
          yearY = y + 15 + 2 * height
          break
        default:
        case ZoomLevel.ZOOM_MONTHS:
          yearY = y + 10 + height
          break
      }

      // calculate the total number of days for the given months, since months do not consist of the same number of
      // days
      let totalDaysOfMonth = 0
      const months = year2Months.get(year)
      months.forEach(month => {
        totalDaysOfMonth += calculateDaysOfMonth(month, years[i])
      })

      const splitOffset = getSplitOffset(this.zoomLevel)
      const yearWidth =
        splitOffset === -1
          ? totalDaysOfMonth * 20
          : year2Months.get(year).length * getXOffset(this.zoomLevel) * splitOffset

      yearShape.setAttribute('x', yearX.toString())
      yearShape.setAttribute('y', yearY.toString())
      yearShape.setAttribute('width', (yearWidth - 4).toString())
      yearShape.setAttribute('height', height.toString())
      yearShape.setAttribute('fill', yearColor.toString())

      container.appendChild(yearShape)
      const yearText = `${year}`
      const yearTextSize = TextRenderSupport.measureText(yearText, new Font())

      const yearLabelText = window.document.createElementNS('http://www.w3.org/2000/svg', 'text')
      yearLabelText.setAttribute('x', (yearX + yearWidth * 0.5).toString())
      yearLabelText.setAttribute(
        'y',
        (yearY + (height * 0.5 + yearTextSize.height * 0.5) - 1).toString()
      )
      yearLabelText.setAttribute('fill', '#FFFFFF')
      yearLabelText.setAttribute('font-weight', 'bold')
      yearLabelText.setAttribute('text-anchor', 'middle')
      yearLabelText.textContent = yearText
      container.appendChild(yearLabelText)

      // draw months for each year if necessary
      if (this.zoomLevel !== ZoomLevel.ZOOM_YEARS) {
        let monthWidth = yearWidth / months.length

        let monthX = yearX
        let monthY
        switch (this.zoomLevel) {
          case ZoomLevel.ZOOM_DAYS:
            monthY = y + 10 + height
            break
          default:
          case ZoomLevel.ZOOM_MONTHS:
            monthY = y + 5
            break
        }
        const monthsArray = getMonths()
        months.forEach(month => {
          const days = calculateDaysOfMonth(month, year)

          if (this.zoomLevel === ZoomLevel.ZOOM_DAYS) {
            monthWidth = days * 15 + (days - 1) * 5
          }

          const monthsShape = window.document.createElementNS('http://www.w3.org/2000/svg', 'rect')
          monthsShape.setAttribute('x', monthX.toString())
          monthsShape.setAttribute('y', monthY.toString())
          const width = monthWidth + (this.zoomLevel === ZoomLevel.ZOOM_DAYS ? 0 : -4)
          monthsShape.setAttribute('width', width.toString())
          monthsShape.setAttribute('height', height.toString())

          // alternate colors of consecutive months
          let monthColor
          if (monthsArray.indexOf(month) % 2 === 0) {
            // choose color according to the year to get alternating colors for "December" and "January"
            monthColor = year % 2 === 0 ? color1 : color2
          } else {
            // choose color according to the year to get alternating colors for "December" and "January"
            monthColor = year % 2 === 0 ? color2 : color1
          }
          monthsShape.setAttribute('fill', monthColor)
          container.appendChild(monthsShape)

          const monthsText = month
          const monthsTextSize = TextRenderSupport.measureText(monthsText, new Font())
          const monthsLabelText = window.document.createElementNS(
            'http://www.w3.org/2000/svg',
            'text'
          )
          monthsLabelText.setAttribute('x', (monthX + monthWidth * 0.5).toString())
          monthsLabelText.setAttribute(
            'y',
            (monthY + (height * 0.5 + monthsTextSize.height * 0.5) - 1).toString()
          )
          monthsLabelText.setAttribute('fill', '#FFFFFF')
          monthsLabelText.setAttribute('font-weight', 'bold')
          monthsLabelText.setAttribute('text-anchor', 'middle')
          monthsLabelText.textContent = monthsText
          container.appendChild(monthsLabelText)

          if (this.zoomLevel === ZoomLevel.ZOOM_DAYS) {
            // show days for each month if necessary
            let daysX = monthX
            const daysY = y + 5

            for (let day = 1; day < days + 1; day++) {
              const daysWidth = 15

              const shape = window.document.createElementNS('http://www.w3.org/2000/svg', 'rect')
              shape.setAttribute('x', daysX.toString())
              shape.setAttribute('y', daysY.toString())
              shape.setAttribute('width', daysWidth.toString())
              shape.setAttribute('height', height.toString())
              shape.setAttribute('fill', monthColor)
              container.appendChild(shape)

              const labelText = window.document.createElementNS(
                'http://www.w3.org/2000/svg',
                'text'
              )
              const centerX = daysX + daysWidth * 0.5
              const centerY = daysY + (height * 0.5 + 5)

              labelText.setAttribute('x', centerX.toString())
              labelText.setAttribute('y', centerY.toString())
              labelText.setAttribute('fill', '#FFFFFF')
              labelText.setAttribute('font-weight', 'bold')
              labelText.setAttribute('font-size', '9')
              labelText.setAttribute('text-anchor', 'middle')
              labelText.textContent = day
              container.appendChild(labelText)
              daysX += daysWidth + 5
            }
          }
          monthX += monthWidth + (this.zoomLevel === ZoomLevel.ZOOM_DAYS ? 5 : 0)
        })
      }
      yearX += yearWidth
    }
  }

  /**
   * Generates the intermediate years between two dates.
   * @param {string} startDate
   * @param {string} endDate
   * @return {Array}
   */
  static findIntermediateYears(startDate, endDate) {
    const years = []
    const startYear = startDate.getFullYear()
    const endYear = endDate.getFullYear()

    for (let i = startYear; i <= endYear; i++) {
      years.push(i.toString())
    }
    return years
  }

  /**
   * Generates the intermediate months between two dates.
   * @param {Array} fullCalendar
   */
  static findIntermediateMonths(fullCalendar) {
    const /** @type {Date} */ startDate = fullCalendar[0]
    const /** @type {Date} */ endDate = fullCalendar[fullCalendar.length - 1]

    const months = getMonths()
    const startYear = startDate.getFullYear()
    const endYear = endDate.getFullYear()

    const year2Months = new Mapper()
    const diffYear = 12 * (endYear - startYear) + endDate.getMonth()

    for (let i = startDate.getMonth(); i <= diffYear; i++) {
      const year = `${Math.floor(startYear + i / 12)}`

      if (!year2Months.get(year)) {
        year2Months.set(year, [])
      }

      year2Months.get(year).push(months[i % 12])
    }
    return year2Months
  }
}

/**
 * Creates the visual rectangle that determines the current time window that will be examined.
 */
class TimeFrameVisual extends BaseClass(IVisualCreator) {
  /**
   * Creates a new instance of TimeFrameVisual.
   * @param {Rect} rectangle
   */
  constructor(rectangle) {
    super()
    this.$rectangle = rectangle
  }

  /**
   * Gets the rectangle that determines the bounds of this visual object.
   * @return {MutableRectangle}
   */
  get rectangle() {
    return this.$rectangle
  }

  /**
   * Sets the rectangle that determines the bounds of this visual object.
   * @param {MutableRectangle} rectangle
   */
  set rectangle(rectangle) {
    this.$rectangle = rectangle
  }

  /**
   * Creates the time frame rectangle.
   * @param {IRenderContext} context
   * @return {SvgVisual}
   */
  createVisual(context) {
    const svgNamespace = 'http://www.w3.org/2000/svg'
    const container = window.document.createElementNS(svgNamespace, 'g')
    const timeFrameRect = window.document.createElementNS(svgNamespace, 'rect')
    timeFrameRect.setAttribute('class', 'time-frame-rect')
    timeFrameRect.setAttribute('x', '0')
    timeFrameRect.setAttribute('y', '0')
    timeFrameRect.setAttribute('width', this.rectangle.width.toString())
    timeFrameRect.setAttribute('height', this.rectangle.height.toString())
    container.appendChild(timeFrameRect)

    container.setAttribute('transform', `translate(${this.rectangle.x} ${this.rectangle.y})`)

    container['render-data-cache'] = this.createRenderDataCache(this.rectangle)
    return new SvgVisual(container)
  }

  /**
   * Updates the time frame rectangle to improve performance.
   * @param {IRenderContext} context
   * @param {Visual} oldVisual
   * @returns {SvgVisual}
   */
  updateVisual(context, oldVisual) {
    const container = oldVisual.svgElement
    const oldDataCache = container['render-data-cache']
    const newDataCache = this.createRenderDataCache(this.rectangle)

    if (!newDataCache.equalsSize(newDataCache, oldDataCache)) {
      container.firstElementChild.setAttribute('width', this.rectangle.width.toString())
      container.firstElementChild.setAttribute('height', this.rectangle.height.toString())
    }

    if (!newDataCache.equalsLocation(newDataCache, oldDataCache)) {
      container.setAttribute('transform', `translate(${this.rectangle.x} ${this.rectangle.y})`)
    }

    container['render-data-cache'] = newDataCache

    return oldVisual
  }

  /**
   * Creates an object containing all necessary data to create a visual for the timeline frame.
   * @param {Rectangle} rectangle
   * @return {object}
   */
  createRenderDataCache(rectangle) {
    return {
      location: new Point(rectangle.x, rectangle.y),
      size: rectangle.toSize(),
      equalsLocation: (self, other) => self.location.equals(other.location),
      equalsSize: (self, other) => self.size.equals(other.size)
    }
  }
}

/**
 * Creates the animation of the timeline.
 */
class TimeFrameAnimation {
  /**
   * Creates a new TimeFrameAnimation
   * @param timeFrame The rectangle used in the {@link TimeFrameVisual}
   * @param timelineComponent The graph component presenting the timeline
   * @param graphComponent The graph component presenting the main graph
   */
  constructor(timeFrame, timelineComponent, graphComponent) {
    this.timeFrame = timeFrame
    this.timelineComponent = timelineComponent
    this.graphComponent = graphComponent
    this.animator = null
    this.startLocation = null
    this.timeFrameListeners = []
    this.animationEndedListeners = []
    this.animating = false
  }

  /**
   * Moves the time frame rightwards along the timeline until it reaches the right border.
   */
  playAnimation() {
    if (!this.animating) {
      const animator = new Animator(this.timelineComponent)
      animator.autoInvalidation = true
      animator.allowUserInteraction = true
      this.animator = animator

      // set animating flag
      this.animating = true

      // store start location to be able to reset animation
      this.startLocation = this.timeFrame.topLeft

      // start animation
      animator.animate(() => {
        const timeFrame = this.timeFrame
        const viewport = this.timelineComponent.viewport
        const maxX = this.timelineComponent.contentRect.x + this.timelineComponent.contentRect.width

        // stop animation when time frame reached right border or if the input mode gets de-activated
        if (timeFrame.x + timeFrame.width >= maxX || !this.timelineComponent.inputMode.enabled) {
          this.stopAnimation()
          this.updateAnimationEndedListeners()
        }

        // move time frame and update timeline graph
        timeFrame.x += 1
        this.updateListeners(timeFrame.x, timeFrame.x + timeFrame.width)

        // move viewport when the time frame leaves
        if (viewport.x + viewport.width < timeFrame.x + timeFrame.width * 0.5) {
          this.timelineComponent.viewPoint = new Point(timeFrame.x, viewport.y)
        }
      }, Number.POSITIVE_INFINITY)
    }
  }

  /**
   * Stops moving the time frame.
   */
  stopAnimation() {
    if (this.animator !== null) {
      this.animator.stop()
      this.animator = null
      this.animating = false
    }
  }

  /**
   * Adds the listener invoked when the time frame changes.
   */
  addTimeFrameListener(listener) {
    this.timeFrameListeners.push(listener)
  }

  /**
   * Removes the listener invoked when the time frame changes.
   * @param {function} listener
   */
  removeTimeFrameListener(listener) {
    const index = this.timeFrameListeners.indexOf(listener)
    if (index >= 0) {
      this.timeFrameListeners.splice(index, 1)
    }
  }

  /**
   * Updates all listeners that are interested in an interval change.
   * @param {number} minTime
   * @param {number} maxTime
   */
  updateListeners(minTime, maxTime) {
    this.timeFrameListeners.forEach(listener => {
      listener(minTime, maxTime)
    })
  }

  /**
   * Adds the listener invoked when the animation stops due to reaching the right end of the timeline.
   * @param {function} listener
   */
  addAnimationEndedListener(listener) {
    this.animationEndedListeners.push(listener)
  }

  /**
   * Removes the listener invoked when the animation stops due to reaching the right end of the timeline.
   * @param {function} listener
   */
  removeAnimationEndedListener(listener) {
    const index = this.animationEndedListeners.indexOf(listener)
    if (index >= 0) {
      this.animationEndedListeners.splice(index, 1)
    }
  }

  /**
   * Updates all listeners that are interested in the event when the the animation stops due to reaching the right
   * end of the timeline.
   */
  updateAnimationEndedListeners() {
    this.animationEndedListeners.forEach(listener => {
      listener()
    })
  }
}

/**
 * Creates the position handles for the timeline component.
 */
class TimeFramePositionHandler extends BaseClass(IPositionHandler) {
  /**
   * Creates a position handler for the timeline.
   * @param {IMutableRectangle} rectangle The rectangle to read and write its location to.
   * @param {Rect} boundaryRectangle The content rectangle of the timeline component.
   * @param {boolean} enabled Whether the handler should be enabled or not is enabled or not.
   */
  constructor(rectangle, boundaryRectangle, enabled) {
    super()
    this.rectangle = rectangle
    this.$offset = new MutablePoint()
    this.$enabled = enabled
    this.$boundaryRectangle = boundaryRectangle
  }

  /**
   * The last "drag-location" during dragging.
   * It helps calculating the current position of the rectangle and finding out if there was any movement.
   * @type {Point}
   */
  get location() {
    return this.rectangle.topLeft
  }

  /**
   * Gets the offset between the "drag-point" and the rectangle's location.
   * This offset helps keeping the relative position of the rectangle and the mouse cursor while dragging.
   * @type {MutablePoint}
   */
  get offset() {
    return this.$offset
  }

  /**
   * Sets the offset between the "drag-point" and the rectangle's location.
   * @param {MutablePoint} offset
   */
  set offset(offset) {
    this.$offset = offset
  }

  /**
   * Gets the content rectangle of the timeline component.
   * @type {Rect}
   */
  get boundaryRectangle() {
    return this.$boundaryRectangle
  }

  /**
   * Sets the content rectangle of the timeline component.
   * @param {Rect} boundaryRectangle
   */
  set boundaryRectangle(boundaryRectangle) {
    this.$boundaryRectangle = boundaryRectangle
  }

  /**
   * Checks whether the frame is busy so that the handler remains disabled.
   * @type boolean
   */
  get enabled() {
    return this.$enabled
  }

  /**
   * Enable/disable this position handler.
   * @param {boolean} enabled
   */
  set enabled(enabled) {
    this.$enabled = enabled
  }

  /**
   * Stores the initial location of the movement for reference, and calls the base method.
   * @see Specified by {@link IDragHandler#initializeDrag}.
   */
  initializeDrag(context) {
    this.offset.x = this.location.x - context.canvasComponent.lastMouseEvent.location.x
  }

  /**
   * Constrains the movement to the horizontal axis.
   * @param {IInputModeContext} inputModeContext
   * @param {Point} originalLocation
   * @param {Point} newLocation
   */
  handleMove(inputModeContext, originalLocation, newLocation) {
    if (this.enabled) {
      const newX = this.getX(
        newLocation.x + this.offset.x,
        this.boundaryRectangle.x,
        this.boundaryRectangle.x + this.boundaryRectangle.width
      )
      this.rectangle.relocate(new Point(newX, this.rectangle.y))
    }
  }

  /**
   * Invoked when dragging has finished.
   * @param {IInputModeContext} inputModeContext
   * @param {Point} originalLocation
   * @param {Point} newLocation
   */
  dragFinished(inputModeContext, originalLocation, newLocation) {
    const newX = this.getX(
      newLocation.x + this.offset.x,
      this.boundaryRectangle.x,
      this.boundaryRectangle.x + this.boundaryRectangle.width
    )
    this.rectangle.relocate(new Point(newX, this.rectangle.y))
  }

  /**
   * Invoked when dragging was cancelled.
   * @param {IInputModeContext} inputModeContext
   * @param {Point} originalLocation
   */
  cancelDrag(context, originalLocation) {
    this.rectangle.relocate(originalLocation)
  }

  /**
   * Returns the next x position. If the rectangle reaches the borders of the boundary rectangle, the position
   * changes accordingly such that the rectangle fits in the timeline.
   * @param {number} nextPositionX
   * @param {number} x1
   * @param {number} x2
   * @return {number} The next x coordinate of the rectangle.
   */
  getX(nextPositionX, x1, x2) {
    // check if the next position is within the boundary rectangle borders
    if (nextPositionX <= x1) {
      return x1
    } else if (nextPositionX + this.rectangle.width >= x2) {
      return x2 - this.rectangle.width
    }

    return nextPositionX
  }
}

/**
 * Represents the current zoom-level that will determine if years, months or days will be displayed.
 */
class ZoomLevel {
  /**
   * Zoom to years.
   * @return {number}
   */
  static get ZOOM_YEARS() {
    return 0
  }

  /**
   * Zoom to months.
   * @return {number}
   */
  static get ZOOM_MONTHS() {
    return 1
  }

  /**
   * Zoom to days.
   * @return {number}
   */
  static get ZOOM_DAYS() {
    return 2
  }
}

/**
 * Calculates the days of each month.
 * @param {string} month
 * @param {string} year
 * @return {number}
 */
function calculateDaysOfMonth(month, year) {
  switch (month) {
    case 'January':
    case 'March':
    case 'May':
    case 'July':
    case 'August':
    case 'October':
    case 'December':
      return 31
    case 'April':
    case 'June':
    case 'September':
    case 'November':
      return 30
    case 'February':
      // checks if the year is leap
      return new Date(year, 1, 29).getMonth() === 1 ? 29 : 28
    default:
      return -1
  }
}

/**
 * Returns an array with the months of a year.
 */
function getMonths() {
  return [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]
}

/**
 * Returns the size of the timeline nodes based on the zoom factor.
 * @param zoomLevel The current zoom level
 * @return {number} The width of the timeline nodes
 */
function getXOffset(zoomLevel) {
  switch (zoomLevel) {
    case ZoomLevel.ZOOM_DAYS:
      return 20
    default:
    case ZoomLevel.ZOOM_YEARS:
    case ZoomLevel.ZOOM_MONTHS:
      return 35
  }
}

/**
 * Returns the offset between two timeline nodes.
 * @param zoomLevel The current zoom level
 * @return {number} The split offset
 */
function getSplitOffset(zoomLevel) {
  switch (zoomLevel) {
    case ZoomLevel.ZOOM_YEARS:
      return 1
    case ZoomLevel.ZOOM_DAYS:
      // return -1, so that the offset is calculated afterwards based on how many days a month has
      return -1
    default:
    case ZoomLevel.ZOOM_MONTHS:
      return 4
  }
}
