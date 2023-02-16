/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  BaseClass,
  ClickEventArgs,
  CollectSnapResultsEventArgs,
  ConcurrencyController,
  Cursor,
  delegate,
  EventArgs,
  GraphComponent,
  GraphEditorInputMode,
  GraphSnapContext,
  HandleInputMode,
  HandlePositions,
  HandleTypes,
  ICanvasObject,
  ICompoundEdit,
  IDragHandler,
  IEnumerable,
  IGraph,
  IGraphSelection,
  IHandle,
  IInputMode,
  IInputModeContext,
  IList,
  IModelItem,
  INode,
  INodeReshapeSnapResultProvider,
  INodeSizeConstraintProvider,
  InputModeBase,
  InputModeEventArgs,
  Insets,
  IPoint,
  IRectangle,
  IReshapeHandler,
  ISize,
  ItemSelectionChangedEventArgs,
  List,
  MutableRectangle,
  MutableSize,
  ObservableCollection,
  OrthogonalEdgeDragHandler,
  OrthogonalEdgeEditingContext,
  Point,
  Rect,
  RectangleIndicatorInstaller,
  ReshapeHandlerHandle,
  ReshapePolicy,
  ReshapeRectangleContext,
  SelectionEventArgs,
  Size
} from 'yfiles'

/**
 * An {@link IInputMode} for reshape handles for groups of nodes. Can be added as child input
 * mode of {@link GraphEditorInputMode} and changes the default node reshape handles when multiple nodes are
 * selected: instead of one set of handles per node, this input mode only shows a single set of handles around all
 * selected nodes.
 * Supports two different resize modes: 'resize' and 'scale'.
 */
export class NodeSelectionResizingInputMode extends InputModeBase {
  /**
   * Gets the margins between the handle rectangle and the bounds of the selected nodes.
   * @type {!Insets}
   */
  get margins() {
    return this.$margins
  }

  /**
   * Sets the margins between the handle rectangle and the bounds of the selected nodes.
   * @type {!Insets}
   */
  set margins(value) {
    this.$margins = value
  }

  /**
   * Gets the current resize mode
   * @type {!('scale'|'resize')}
   */
  get mode() {
    return this.$mode
  }

  /**
   * Sets the current resize mode
   * @type {!('scale'|'resize')}
   */
  set mode(value) {
    this.$mode = value
    if (this.handleInputMode) {
      this.updateHandles()
    }
  }

  /**
   * @param {!('scale'|'resize')} [mode]
   * @param {!Insets} [margins]
   */
  constructor(mode, margins) {
    super()
    this.$margins = margins || Insets.EMPTY
    this.$mode = mode || 'scale'
    this.rectangle = null
    this.rectCanvasObject = null
    this.handleInputMode = null
    this.moveHandleOrthogonalHelper = new OrthogonalEdgeEditingHelper()
    this.ignoreSingleSelectionEvents = false
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!ConcurrencyController} controller
   */
  install(context, controller) {
    super.install(context, controller)
    const geim = context.parentInputMode
    if (!geim) {
      throw new Error(
        'InvalidOperationException: NodeSelectionResizingInputMode must be installed as child mode of GraphEditorInputMode'
      )
    }

    // create own HandleInputMode for the handles
    this.handleInputMode = new HandleInputMode({
      priority: 1,
      enabled: false
    })

    // notify the GraphSnapContext which nodes are resized and shouldn't provide SnapLines
    this.handleInputMode.addDragStartedListener(delegate(this.registerReshapedNodes, this))

    // forward events to OrthogonalEdgeEditingContext so it can handle keeping edges at reshaped nodes orthogonal
    this.handleInputMode.addDragStartingListener(
      delegate(this.moveHandleOrthogonalHelper.starting, this.moveHandleOrthogonalHelper)
    )
    this.handleInputMode.addDragStartedListener(
      delegate(this.moveHandleOrthogonalHelper.started, this.moveHandleOrthogonalHelper)
    )
    this.handleInputMode.addDragFinishedListener(
      delegate(this.moveHandleOrthogonalHelper.finished, this.moveHandleOrthogonalHelper)
    )
    this.handleInputMode.addDragCanceledListener(
      delegate(this.moveHandleOrthogonalHelper.canceled, this.moveHandleOrthogonalHelper)
    )

    this.handleInputMode.install(context, controller)

    // update handles depending on the changed node selection
    geim.addMultiSelectionStartedListener(delegate(this.multiSelectionStarted, this))
    geim.addMultiSelectionFinishedListener(delegate(this.multiSelectionFinished, this))
    context.canvasComponent.selection.addItemSelectionChangedListener(
      delegate(this.itemSelectionChanged, this)
    )

    // add a NodeLayoutChanged listener so the reshape rect is updated when the nodes are moved (e.g. through
    // layout animations or MoveInputMode).
    context.graph.addNodeLayoutChangedListener(delegate(this.nodeLayoutChanged, this))
  }

  /**
   * Notifies the current {@link GraphSnapContext} which nodes are going to be reshaped.
   * @param {!object} sender
   * @param {!InputModeEventArgs} event
   */
  registerReshapedNodes(sender, event) {
    // register reshaped nodes
    const snapContext = event.context.lookup(GraphSnapContext.$class)
    if (snapContext && snapContext.enabled) {
      this.rectangle.nodes.forEach(node => {
        snapContext.addItemToBeReshaped(node)
      })
    }
  }

  /**
   * Invalidates the (bounds of the) {@link EncompassingRectangle} when any node layout is changed
   * but not by this input mode.
   * @param {!object} sender
   * @param {!INode} node
   * @param {!Rect} oldLayout
   */
  nodeLayoutChanged(sender, node, oldLayout) {
    if (this.rectangle && !this.handleInputMode.isDragging) {
      this.rectangle.invalidate()
    }
  }

  /**
   * @returns {boolean}
   */
  tryStop() {
    this.removeRectangleVisualization()
    return this.handleInputMode.tryStop()
  }

  cancel() {
    this.removeRectangleVisualization()
    this.handleInputMode.cancel()
  }

  /**
   * @param {!IInputModeContext} context
   */
  uninstall(context) {
    context.graph.removeNodeLayoutChangedListener(delegate(this.nodeLayoutChanged, this))
    const geim = context.parentInputMode
    geim.removeMultiSelectionStartedListener(delegate(this.multiSelectionStarted, this))
    geim.removeMultiSelectionFinishedListener(delegate(this.multiSelectionFinished, this))
    context.canvasComponent.selection.removeItemSelectionChangedListener(
      delegate(this.itemSelectionChanged, this)
    )

    // notify the GraphSnapContext which nodes are resized and shouldn't provide SnapLines
    this.handleInputMode.removeDragStartedListener(delegate(this.registerReshapedNodes, this))

    // forward events to OrthogonalEdgeEditingContext so it can handle keeping edges at reshaped nodes orthogonal
    this.handleInputMode.removeDragStartingListener(
      delegate(this.moveHandleOrthogonalHelper.starting, this.moveHandleOrthogonalHelper)
    )
    this.handleInputMode.removeDragStartedListener(
      delegate(this.moveHandleOrthogonalHelper.started, this.moveHandleOrthogonalHelper)
    )
    this.handleInputMode.removeDragFinishedListener(
      delegate(this.moveHandleOrthogonalHelper.finished, this.moveHandleOrthogonalHelper)
    )
    this.handleInputMode.removeDragCanceledListener(
      delegate(this.moveHandleOrthogonalHelper.canceled, this.moveHandleOrthogonalHelper)
    )

    this.removeRectangleVisualization()

    this.handleInputMode.uninstall(context)
    this.handleInputMode = null

    super.uninstall(context)
  }

  /**
   * @param {!object} sender
   * @param {!SelectionEventArgs.<IModelItem>} args
   */
  multiSelectionStarted(sender, args) {
    // a multi-selection started so the ItemSelectionChanged events can be ignored until MultiSelectionFinished
    this.ignoreSingleSelectionEvents = true
  }

  /**
   * @param {!object} sender
   * @param {!SelectionEventArgs.<IModelItem>} args
   */
  multiSelectionFinished(sender, args) {
    this.ignoreSingleSelectionEvents = false
    this.updateHandles()
  }

  /**
   * @param {!object} sender
   * @param {!ItemSelectionChangedEventArgs.<IModelItem>} evt
   */
  itemSelectionChanged(sender, evt) {
    this.updateHandles()
  }

  updateHandles() {
    if (this.ignoreSingleSelectionEvents) {
      // UpdateHandles was called by ItemSelectionChanged by this is a MultiSelection so we wait for MultiSelectionFinished
      return
    }
    // first, clear any existing handles
    this.clearHandles()

    const geim = this.inputModeContext.parentInputMode
    const selectedNodesCount = geim.graphComponent.selection.selectedNodes.size
    // use default behavior only if one node is selected
    geim.handleInputMode.enabled = selectedNodesCount <= 1

    if (selectedNodesCount >= 2) {
      // more than one node is selected so initialize resizing them as a group
      this.showHandles()
    }
  }

  /**
   * Clears any existing handles and disables the handleInputMode.
   */
  clearHandles() {
    if (!this.handleInputMode.tryStop()) {
      this.handleInputMode.cancel()
    }
    this.handleInputMode.enabled = false
    this.removeRectangleVisualization()
  }

  /**
   * Initializes the handles, the reshapeHandler and enables the handleInputMode.
   */
  showHandles() {
    const graphComponent = this.inputModeContext.canvasComponent

    // collect all selected nodes as well as their descendents
    const reshapeNodes = this.collectReshapeNodes(graphComponent.graph, graphComponent.selection)

    // create a mutable rectangle, that is updated by the ReshapeHandler
    this.rectangle = new EncompassingRectangle(reshapeNodes, this.margins)
    // and visualize it
    const rectangleIndicator = new RectangleIndicatorInstaller(
      this.rectangle,
      RectangleIndicatorInstaller.SELECTION_TEMPLATE_KEY
    )
    this.rectCanvasObject = rectangleIndicator.addCanvasObject(
      graphComponent.canvasContext,
      graphComponent.inputModeGroup,
      this.rectangle
    )
    this.rectCanvasObject.toBack()

    // Create a reshape handler factory depending on the current mode
    const reshapeHandlerFactory =
      this.mode === 'scale'
        ? () => new ScalingReshapeHandler(this.rectangle)
        : () => new ResizingReshapeHandler(this.rectangle)

    // create and add the handles to our HandleInputMode
    this.handleInputMode.handles = new ObservableCollection([
      this.createHandle(HandlePositions.NORTH, reshapeHandlerFactory),
      this.createHandle(HandlePositions.NORTH_WEST, reshapeHandlerFactory),
      this.createHandle(HandlePositions.WEST, reshapeHandlerFactory),
      this.createHandle(HandlePositions.SOUTH_WEST, reshapeHandlerFactory),
      this.createHandle(HandlePositions.SOUTH, reshapeHandlerFactory),
      this.createHandle(HandlePositions.SOUTH_EAST, reshapeHandlerFactory),
      this.createHandle(HandlePositions.EAST, reshapeHandlerFactory),
      this.createHandle(HandlePositions.NORTH_EAST, reshapeHandlerFactory)
    ])
    this.handleInputMode.enabled = true
  }

  /**
   * Collect all {@link IGraphSelection.selectedNodes selected nodes} and their descendents.
   * @param {!IGraph} graph
   * @param {!IGraphSelection} selection
   * @returns {!IList.<INode>}
   */
  collectReshapeNodes(graph, selection) {
    const nodes = new Set()
    selection.selectedNodes.forEach(node => {
      if (nodes.add(node) && graph.isGroupNode(node)) {
        graph.groupingSupport.getDescendants(node).forEach(descendant => {
          nodes.add(descendant)
        })
      }
    })
    return new List(nodes)
  }

  /**
   * @param {!HandlePositions} position
   * @param {!Function} reshapeHandlerFactory
   * @returns {!IHandle}
   */
  createHandle(position, reshapeHandlerFactory) {
    const reshapeHandler = reshapeHandlerFactory()
    const handle = new NodeSelectionReshapeHandle(
      this.inputModeContext,
      position,
      reshapeHandler,
      this.margins
    )
    reshapeHandler.handle = handle
    return handle
  }

  /**
   * Removes the rectCanvasObject.
   */
  removeRectangleVisualization() {
    if (this.rectCanvasObject) {
      this.rectCanvasObject.remove()
      this.rectCanvasObject = null
    }
    this.rectangle = null
  }
}

/**
 * Simplifies handling the {@link OrthogonalEdgeEditingContext} by listening to {@link HandleInputMode}
 * events.
 */
class OrthogonalEdgeEditingHelper {
  constructor() {
    this.editingContext = null
  }

  /**
   * @param {!object} sender
   * @param {!InputModeEventArgs} event
   */
  starting(sender, event) {
    const context = event.context
    const edgeEditingContext = context.lookup(OrthogonalEdgeEditingContext.$class)
    if (
      edgeEditingContext &&
      !edgeEditingContext.isInitializing &&
      !edgeEditingContext.isInitialized
    ) {
      this.editingContext = edgeEditingContext
      this.editingContext.initializeDrag(context)
    } else {
      this.editingContext = null
    }
  }

  /**
   * @param {!object} sender
   * @param {!InputModeEventArgs} evt
   */
  started(sender, evt) {
    if (this.editingContext) {
      this.editingContext.dragInitialized()
    }
  }

  /**
   * @param {!object} sender
   * @param {!InputModeEventArgs} evt
   */
  finished(sender, evt) {
    if (this.editingContext) {
      this.editingContext.dragFinished()
      this.editingContext = null
    }
  }

  /**
   * @param {!object} sender
   * @param {!InputModeEventArgs} evt
   */
  canceled(sender, evt) {
    if (this.editingContext) {
      this.editingContext.cancelDrag()
      this.editingContext = null
    }
  }
}

/**
 * Returns whether `position` is {@link HandlePositions.NORTH_WEST},
 * {@link HandlePositions.NORTH} or {@link HandlePositions.NORTH_EAST}
 * @param {!HandlePositions} position The position to check.
 * @returns {boolean} `true` if the position is at any of the north sides.
 */
function isAnyNorth(position) {
  return (
    (position &
      (HandlePositions.NORTH_WEST | HandlePositions.NORTH | HandlePositions.NORTH_EAST)) !==
    0
  )
}

/**
 * Returns whether `position` is {@link HandlePositions.SOUTH_WEST},
 * {@link HandlePositions.SOUTH} or {@link HandlePositions.SOUTH_EAST}
 * @param {!HandlePositions} position The position to check.
 * @returns {boolean} `true` if the position is at any of the south sides.
 */
function isAnySouth(position) {
  return (
    (position &
      (HandlePositions.SOUTH_WEST | HandlePositions.SOUTH | HandlePositions.SOUTH_EAST)) !==
    0
  )
}

/**
 * Returns whether `position` is {@link HandlePositions.NORTH_WEST},
 * {@link HandlePositions.WEST} or {@link HandlePositions.SOUTH_WEST}
 * @param {!HandlePositions} position The position to check.
 * @returns {boolean} `true` if the position is at any of the west sides.
 */
function isAnyWest(position) {
  return (
    (position &
      (HandlePositions.NORTH_WEST | HandlePositions.WEST | HandlePositions.SOUTH_WEST)) !==
    0
  )
}

/**
 * Returns whether `position` is {@link HandlePositions.NORTH_EAST},
 * {@link HandlePositions.EAST} or {@link HandlePositions.SOUTH_EAST}
 * @param {!HandlePositions} position The position to check.
 * @returns {boolean} `true` if the position is at any of the east sides.
 */
function isAnyEast(position) {
  return (
    (position &
      (HandlePositions.NORTH_EAST | HandlePositions.EAST | HandlePositions.SOUTH_EAST)) !==
    0
  )
}

/**
 * An {@link IRectangle} implementation that encompasses a set of {@link INode} layouts. Can be
 * {@link EncompassingRectangle.invalidate invalidated} to fit the encompassed nodes or explicitly
 * {@link reshape reshaped}.
 */
class EncompassingRectangle extends BaseClass(IRectangle) {
  /**
   * @param {!IEnumerable.<INode>} nodes
   * @param {!Insets} margins
   */
  constructor(nodes, margins) {
    super()
    this.$nodes = nodes
    this.$margins = margins
    this.rectangle = new MutableRectangle()
    this.tightRect = Rect.EMPTY
    this.invalid = true
  }

  invalidate() {
    this.invalid = true
  }

  /**
   * @param {!IRectangle} newRectangle
   */
  reshape(newRectangle) {
    this.tightRect = newRectangle.toRect()
    this.rectangle.reshape(this.tightRect.getEnlarged(this.margins))
    this.invalid = false
  }

  update() {
    if (!this.invalid) {
      return
    }

    this.rectangle.width = -1
    this.rectangle.height = -1
    this.rectangle.x = 0
    this.rectangle.y = 0

    this.nodes.forEach(node => {
      this.rectangle.setToUnion(this.rectangle, node.layout)
    })
    this.tightRect = this.rectangle.toRect()

    this.rectangle.x -= this.margins.left
    this.rectangle.y -= this.margins.top
    this.rectangle.width += this.margins.left + this.margins.right
    this.rectangle.height += this.margins.top + this.margins.bottom

    this.invalid = false
  }

  /**
   * @type {number}
   */
  get width() {
    this.update()
    return this.rectangle.width
  }

  /**
   * @type {number}
   */
  get height() {
    this.update()
    return this.rectangle.height
  }

  /**
   * @type {number}
   */
  get x() {
    this.update()
    return this.rectangle.x
  }

  /**
   * @type {number}
   */
  get y() {
    this.update()
    return this.rectangle.y
  }

  /**
   * @type {!IEnumerable.<INode>}
   */
  get nodes() {
    return this.$nodes
  }

  /**
   * @type {!Insets}
   */
  get margins() {
    return this.$margins
  }

  /**
   * @type {!Rect}
   */
  get tightRectangle() {
    this.update()
    return this.tightRect
  }
}

/**
 * The base {@link IReshapeHandler} class for the two resize modes.
 * This base class implements the interface methods, handles undo/redo support, orthogonal edge editing
 * and snapping, and contains code common to both modes.
 */
class ReshapeHandlerBase extends BaseClass(IReshapeHandler) {
  /**
   * Gets a view of the bounds of the item.
   * @type {!IRectangle}
   */
  get bounds() {
    return this.rectangle.tightRectangle
  }

  /**
   * Returns the original bounds of the reshaped {@link EncompassingRectangle} without its margins.
   * @type {!Rect}
   */
  get originalBounds() {
    return this.$originalBounds
  }

  /**
   * Returns the nodes to be reshaped.
   * @type {!IEnumerable.<INode>}
   */
  get reshapeNodes() {
    return this.rectangle.nodes
  }

  /**
   * The {@link NodeSelectionReshapeHandle} using this {@link IReshapeHandler}.
   * @type {?NodeSelectionReshapeHandle}
   */
  get handle() {
    return this.$handle
  }

  /**
   * The {@link NodeSelectionReshapeHandle} using this {@link IReshapeHandler}.
   * @type {?NodeSelectionReshapeHandle}
   */
  set handle(value) {
    this.$handle = value
  }

  /**
   * @param {!EncompassingRectangle} rectangle
   */
  constructor(rectangle) {
    super()
    this.rectangle = rectangle
    // dictionaries storing the original layout, reshape handler and snap result provider of the reshape nodes
    this.originalNodeLayouts = new Map()
    this.reshapeHandlers = new Map()
    this.reshapeSnapResultProviders = new Map()
    this.orthogonalEdgeDragHandlers = new Map()
    this.compoundEdit = null
    this.$originalBounds = Rect.EMPTY
    this.$handle = null
  }

  /**
   * @param {!IInputModeContext} context
   */
  initializeReshape(context) {
    this.$originalBounds = this.rectangle.tightRectangle

    // register our CollectSnapResults callback
    const snapContext = context.lookup(GraphSnapContext.$class)
    if (snapContext) {
      snapContext.addCollectSnapResultsListener(delegate(this.collectSnapResults, this))
    }

    // store original node layouts, reshape handlers and reshape snap result providers
    this.reshapeNodes.forEach(node => {
      this.originalNodeLayouts.set(node, node.layout.toRect())

      // store reshape handler to change the shape of node
      const reshapeHandler = node.lookup(IReshapeHandler.$class)
      if (reshapeHandler) {
        reshapeHandler.initializeReshape(context)
        this.reshapeHandlers.set(node, reshapeHandler)
      }
      // store reshape snap result provider to collect snap results where node would snap to snaplines etc.
      const snapResultProvider = node.lookup(INodeReshapeSnapResultProvider.$class)
      if (snapContext && snapResultProvider) {
        this.reshapeSnapResultProviders.set(node, snapResultProvider)
      }
      // store orthogonal edge drag handler that keeps edges at node orthogonal
      const orthogonalEdgeDragHandler =
        OrthogonalEdgeEditingContext.createOrthogonalEdgeDragHandler(context, node, false)
      if (orthogonalEdgeDragHandler) {
        this.orthogonalEdgeDragHandlers.set(node, orthogonalEdgeDragHandler)
      }
    })

    // update the minimum/maximum size of the handle considering all initial node layouts
    this.handle.minimumSize = this.calculateMinimumSize()
    this.handle.maximumSize = this.calculateMaximumSize()

    // start a compound undo unit
    this.compoundEdit = context.graph.beginEdit('Undo Group Resize', 'Redo Group Resize')
  }

  /**
   * @param {!object} sender
   * @param {!CollectSnapResultsEventArgs} args
   */
  collectSnapResults(sender, args) {
    const lastEvent = args.context.canvasComponent.lastInputEvent
    const fixedAspectRatio = this.handle.ratioReshapeRecognizer(this, lastEvent)
    const centered = this.handle.centerReshapeRecognizer(this, lastEvent)

    const reshapePolicy = fixedAspectRatio ? this.handle.reshapePolicy : ReshapePolicy.NONE
    const ratio = this.originalBounds.width / this.originalBounds.height

    const minScaleX = this.handle.minimumSize.width / this.originalBounds.width
    const minScaleY = this.handle.minimumSize.height / this.originalBounds.height
    const maxScaleX = this.handle.maximumSize.width / this.originalBounds.width
    const maxScaleY = this.handle.maximumSize.height / this.originalBounds.height

    this.reshapeSnapResultProviders.forEach((handler, node) => {
      // for each selected node that has an INodeReshapeSnapResultProvider we have to create
      // a suiting ReshapeRectangleContext
      const layout = this.originalNodeLayouts.get(node)

      // get factors that determine how the node layout changes depending on the mouse delta
      const topLeftChangeFactor = ReshapeHandlerBase.fixZero(
        this.getFactor(layout.minX, layout.minY, layout, centered, this.handle.position)
      )
      const bottomRightChangeFactor = ReshapeHandlerBase.fixZero(
        this.getFactor(layout.maxX, layout.maxY, layout, centered, this.handle.position)
      )

      // the SizeChangeFactor can be calculated using those two factors
      const pointDiffFactor = ReshapeHandlerBase.fixZero(
        bottomRightChangeFactor.subtract(topLeftChangeFactor)
      )
      const sizeChangeFactor = new Size(pointDiffFactor.x, pointDiffFactor.y)

      const reshapeRectangleContext = new ReshapeRectangleContext(
        layout,
        new Size(layout.width * minScaleX, layout.height * minScaleY),
        new Size(layout.width * maxScaleX, layout.height * maxScaleY),
        Rect.EMPTY,
        Rect.INFINITE,
        this.handle.position,
        topLeftChangeFactor,
        bottomRightChangeFactor,
        sizeChangeFactor,
        reshapePolicy,
        ratio
      )

      // call the INodeReshapeSnapResultProvider
      handler.collectSnapResults(sender, args, node, reshapeRectangleContext)
    })
  }

  /**
   * Calculates the {@link ReshapeHandlerHandle.minimumSize} considering all reshaped nodes.
   * @returns {!ISize}
   */
  calculateMinimumSize() {
    return Size.EMPTY
  }

  /**
   * Calculates the {@link ReshapeHandlerHandle.maximumSize} considering all reshaped nodes.
   * @returns {!ISize}
   */
  calculateMaximumSize() {
    return Size.EMPTY
  }

  /**
   * Calculates the horizontal and vertical factor the mouse movement has to be multiplied with to get the
   * horizontal and vertical delta for the point (x,y) inside the `originalNodeLayout`.
   * @param {number} x The horizontal location inside `originalNodeLayout`.
   * @param {number} y The vertical location inside `originalNodeLayout`.
   * @param {!Rect} originalNodeLayout The original layout of the node to calculate the factors for.
   * @param {boolean} centered Whether center resizing is active.
   * @param {!HandlePositions} position The handle position to calculate the factor for.
   * @returns {!Point}
   */
  getFactor(x, y, originalNodeLayout, centered, position) {
    return Point.ORIGIN
  }

  /**
   * Calculates the vertical and horizontal factor the mouse movement has to be multiplied with to get the
   * horizontal and vertical delta for the point (x,y) inside the `originalNodeLayout`.
   *
   * This factor is only used for {@link ReshapeHandlerHandle.ratioReshapeRecognizer ratio resizing}
   * using either {@link ReshapePolicy.HORIZONTAL} or {@link ReshapePolicy.VERTICAL}.
   *
   * The horizontal delta for point (x,y) is the vertical mouse delta multiplied by the y value of the returned factor.
   * The vertical delta for point (x,y) is the horizontal mouse delta multiplied by the x value of the returned factor.
   *
   * @param {number} x The horizontal location inside `originalNodeLayout`.
   * @param {number} y The vertical location inside `originalNodeLayout`.
   * @param {!Rect} originalNodeLayout The original layout of the node to calculate the factors for.
   * @param {boolean} centered Whether center resizing is active.
   * @returns {!Point}
   */
  getOrthogonalFactor(x, y, originalNodeLayout, centered) {
    const ratio = this.originalBounds.width / this.originalBounds.height
    if (this.handle.reshapePolicy === ReshapePolicy.HORIZONTAL) {
      const x2y = 1 / (ratio * (centered ? 1 : 2))
      const orthogonalPosition =
        this.handle.position === HandlePositions.EAST
          ? HandlePositions.SOUTH
          : HandlePositions.NORTH
      const orthoFactor = this.getFactor(x, y, originalNodeLayout, true, orthogonalPosition)
      return new Point(orthoFactor.y * x2y, 0)
    } else if (this.handle.reshapePolicy === ReshapePolicy.VERTICAL) {
      const x2y = ratio / (centered ? 1 : 2)
      const orthogonalPosition =
        this.handle.position === HandlePositions.SOUTH ? HandlePositions.EAST : HandlePositions.WEST
      const orthoFactor = this.getFactor(x, y, originalNodeLayout, true, orthogonalPosition)
      return new Point(0, orthoFactor.x * x2y)
    }
    return Point.ORIGIN
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!Rect} originalBounds
   * @param {!Rect} newBounds
   */
  handleReshape(context, originalBounds, newBounds) {
    // reshape the encompassing rectangle
    this.rectangle.reshape(newBounds)

    // update node layouts and bend locations
    this.updateNodeLayouts(context, originalBounds, newBounds)
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!Rect} originalBounds
   * @param {!Rect} newBounds
   */
  updateNodeLayouts(context, originalBounds, newBounds) {
    const dMinX = newBounds.x - originalBounds.x
    const dMinY = newBounds.y - originalBounds.y
    const dMaxX = newBounds.maxX - originalBounds.maxX
    const dMaxY = newBounds.maxY - originalBounds.maxY

    // calculate a possible mouse movement that could have led to the newBounds
    let dx = 0
    let dy = 0
    if (isAnyWest(this.handle.position)) {
      dx = dMinX
    } else if (isAnyEast(this.handle.position)) {
      dx = dMaxX
    }
    if (isAnyNorth(this.handle.position)) {
      dy = dMinY
    } else if (isAnySouth(this.handle.position)) {
      dy = dMaxY
    }

    const centerResize = this.handle.centerReshapeRecognizer(
      this,
      context.canvasComponent.lastInputEvent
    )
    const ratioResize = this.handle.ratioReshapeRecognizer(
      this,
      context.canvasComponent.lastInputEvent
    )
    const useOrthogonalFactors =
      ratioResize &&
      (this.handle.reshapePolicy === ReshapePolicy.HORIZONTAL ||
        this.handle.reshapePolicy === ReshapePolicy.VERTICAL)

    this.originalNodeLayouts.forEach((originalLayout, node) => {
      const reshapeHandler = this.reshapeHandlers.get(node)
      if (reshapeHandler) {
        const topLeftFactor = this.getFactor(
          originalLayout.x,
          originalLayout.y,
          originalLayout,
          centerResize,
          this.handle.position
        )
        const bottomRightFactor = this.getFactor(
          originalLayout.maxX,
          originalLayout.maxY,
          originalLayout,
          centerResize,
          this.handle.position
        )
        let orthogonalTopLeftFactor = Point.ORIGIN
        let orthogonalBottomRightFactor = Point.ORIGIN
        if (useOrthogonalFactors) {
          orthogonalTopLeftFactor = this.getOrthogonalFactor(
            originalLayout.x,
            originalLayout.y,
            originalLayout,
            centerResize
          )
          orthogonalBottomRightFactor = this.getOrthogonalFactor(
            originalLayout.maxX,
            originalLayout.maxY,
            originalLayout,
            centerResize
          )
        }

        const newX = originalLayout.x + dx * topLeftFactor.x + dy * orthogonalTopLeftFactor.y
        const newY = originalLayout.y + dy * topLeftFactor.y + dx * orthogonalTopLeftFactor.x
        const newMaxX =
          originalLayout.maxX + dx * bottomRightFactor.x + dy * orthogonalBottomRightFactor.y
        const newMaxY =
          originalLayout.maxY + dy * bottomRightFactor.y + dx * orthogonalBottomRightFactor.x

        const newLayout = new Rect(newX, newY, newMaxX - newX, newMaxY - newY)
        reshapeHandler.handleReshape(context, originalLayout, newLayout)
      }
    })
    this.orthogonalEdgeDragHandlers.forEach(handler => {
      handler.handleMove()
    })
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!Rect} originalBounds
   */
  cancelReshape(context, originalBounds) {
    this.rectangle.reshape(originalBounds)
    this.reshapeHandlers.forEach((handler, node) => {
      handler.cancelReshape(context, this.originalNodeLayouts.get(node))
    })
    this.orthogonalEdgeDragHandlers.forEach(handler => {
      handler.cancelDrag()
    })
    this.compoundEdit.cancel()
    this.clear(context)
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!Rect} originalBounds
   * @param {!Rect} newBounds
   */
  reshapeFinished(context, originalBounds, newBounds) {
    this.reshapeHandlers.forEach((handler, node) => {
      handler.reshapeFinished(context, this.originalNodeLayouts.get(node), handler.bounds.toRect())
    })
    this.orthogonalEdgeDragHandlers.forEach(handler => {
      handler.finishDrag()
    })

    this.compoundEdit.commit()
    this.clear(context)
  }

  /**
   * @param {!IInputModeContext} context
   */
  clear(context) {
    const snapContext = context.lookup(GraphSnapContext.$class)
    if (snapContext) {
      snapContext.removeCollectSnapResultsListener(delegate(this.collectSnapResults, this))
    }
    this.reshapeSnapResultProviders.clear()
    this.originalNodeLayouts.clear()
    this.reshapeHandlers.clear()
    this.orthogonalEdgeDragHandlers.clear()
    this.compoundEdit = null
  }

  /**
   * Sets x or y values that are close to 0 to be 0.
   * @param {!Point} p
   * @returns {!Point}
   */
  static fixZero(p) {
    const fixedX = Math.abs(p.x) < 0.0001 ? 0 : p.x
    const fixedY = Math.abs(p.y) < 0.0001 ? 0 : p.y
    return new Point(fixedX, fixedY)
  }
}

/**
 * A subclass of {@link ReshapeHandlerBase} that implements the resize logic for the 'scale'
 * resize mode.
 */
class ScalingReshapeHandler extends ReshapeHandlerBase {
  /**
   * Returns the size of the smallest node (the reshape rect cannot get smaller than this, since the
   * sizes of the nodes are not modified).
   * @returns {!ISize}
   */
  calculateMinimumSize() {
    const minSize = new MutableSize()
    this.reshapeNodes.forEach(node => {
      minSize.width = Math.max(minSize.width, node.layout.width)
      minSize.height = Math.max(minSize.height, node.layout.height)
    })
    return minSize
  }

  /**
   * @returns {!ISize}
   */
  calculateMaximumSize() {
    return Size.INFINITE
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {!Rect} originalNodeLayout
   * @param {boolean} centered
   * @param {!HandlePositions} position
   * @returns {!Point}
   */
  getFactor(x, y, originalNodeLayout, centered, position) {
    let fx = 0
    if ((position & HandlePositions.VERTICAL) === 0) {
      const boundsWidth = this.originalBounds.width - originalNodeLayout.width
      if (boundsWidth <= 0) {
        fx = centered ? 0 : 0.5
      } else {
        const xRatio = centered
          ? (2 * (originalNodeLayout.centerX - this.originalBounds.centerX)) / boundsWidth
          : (originalNodeLayout.minX - this.originalBounds.x) / boundsWidth
        if (isAnyWest(position)) {
          fx = centered ? -xRatio : 1 - xRatio
        } else if (isAnyEast(position)) {
          fx = xRatio
        }
      }
    }
    let fy = 0
    if ((position & HandlePositions.HORIZONTAL) === 0) {
      const boundsHeight = this.originalBounds.height - originalNodeLayout.height
      if (boundsHeight <= 0) {
        fy = centered ? 0 : 0.5
      } else {
        const yRatio = centered
          ? (2 * (originalNodeLayout.centerY - this.originalBounds.centerY)) / boundsHeight
          : (originalNodeLayout.minY - this.originalBounds.y) / boundsHeight
        if (isAnyNorth(position)) {
          fy = centered ? -yRatio : 1 - yRatio
        } else if (isAnySouth(position)) {
          fy = yRatio
        }
      }
    }

    return new Point(fx, fy)
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!Rect} originalBounds
   * @param {!Rect} newBounds
   */
  handleReshape(context, originalBounds, newBounds) {
    super.handleReshape(context, originalBounds, newBounds)
    const graph = context.graph
    if (graph == null) {
      return
    }
    const groupingSupport = graph.groupingSupport
    for (const node of this.reshapeNodes) {
      if (graph.isGroupNode(node)) {
        groupingSupport.enlargeGroupNode(context, node, true)
      }
    }
  }
}

/**
 * A subclass of {@link ReshapeHandlerBase} that implements the resize logic for the 'resize'
 * resize mode.
 */
class ResizingReshapeHandler extends ReshapeHandlerBase {
  /**
   * Considers the minimum scale factors for each node to respect its {@link INodeSizeConstraintProvider.getMinimumSize}
   * and combine them to a general minimum size.
   * @returns {!ISize}
   */
  calculateMinimumSize() {
    let minScaleX = 0
    let minScaleY = 0

    this.reshapeNodes.forEach(node => {
      const constraintProvider = node.lookup(INodeSizeConstraintProvider.$class)
      if (constraintProvider) {
        const minSize = constraintProvider.getMinimumSize(node)
        if (minSize !== Size.EMPTY) {
          const originalLayout = this.originalNodeLayouts.get(node)
          minScaleX = Math.max(minScaleX, minSize.width / originalLayout.width)
          minScaleY = Math.max(minScaleY, minSize.height / originalLayout.height)
        }
      }
    })

    const minWidth = this.originalBounds.width * minScaleX
    const minHeight = this.originalBounds.height * minScaleY
    return new Size(minWidth, minHeight)
  }

  /**
   * Considers the maximum scale factors for each node to respect its {@link INodeSizeConstraintProvider.getMaximumSize}
   * and combine them to a general maximum size.
   * @returns {!ISize}
   */
  calculateMaximumSize() {
    let maxScaleX = Number.POSITIVE_INFINITY
    let maxScaleY = Number.POSITIVE_INFINITY

    this.reshapeNodes.forEach(node => {
      const constraintProvider = node.lookup(INodeSizeConstraintProvider.$class)
      if (constraintProvider) {
        const maxSize = constraintProvider.getMaximumSize(node)
        if (maxSize !== Size.INFINITE) {
          const originalLayout = this.originalNodeLayouts.get(node)
          maxScaleX = Math.min(maxScaleX, maxSize.width / originalLayout.width)
          maxScaleY = Math.min(maxScaleY, maxSize.height / originalLayout.height)
        }
      }
    })

    const maxWidth = this.originalBounds.width * maxScaleX
    const maxHeight = this.originalBounds.height * maxScaleY
    return new Size(maxWidth, maxHeight)
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {!Rect} originalNodeLayout
   * @param {boolean} centered
   * @param {!HandlePositions} position
   * @returns {!Point}
   */
  getFactor(x, y, originalNodeLayout, centered, position) {
    const xRatio = centered
      ? (2 * (x - this.originalBounds.centerX)) / this.originalBounds.width
      : (x - this.originalBounds.x) / this.originalBounds.width
    const yRatio = centered
      ? (2 * (y - this.originalBounds.centerY)) / this.originalBounds.height
      : (y - this.originalBounds.y) / this.originalBounds.height

    let fx = 0
    if (isAnyWest(position)) {
      fx = centered ? -xRatio : 1 - xRatio
    } else if (isAnyEast(position)) {
      fx = xRatio
    }
    let fy = 0
    if (isAnyNorth(position)) {
      fy = centered ? -yRatio : 1 - yRatio
    } else if (isAnySouth(position)) {
      fy = yRatio
    }
    return new Point(fx, fy)
  }
}

/**
 * A {@link ReshapeHandlerHandle} for an {@link EncompassingRectangle} that considers the
 * {@link EncompassingRectangle.margins} for the calculation of its {@link IDragHandler.location}.
 */
class NodeSelectionReshapeHandle extends BaseClass(IHandle) {
  /**
   * @param {!IInputModeContext} context
   * @param {!HandlePositions} position
   * @param {!IReshapeHandler} reshapeHandler
   * @param {!Insets} margins
   */
  constructor(context, position, reshapeHandler, margins) {
    super()
    this.reshapeHandlerHandle = new ReshapeHandlerHandle(position, reshapeHandler)
    this.margins = margins
    this.context = context
    this.$location = null

    if ((position & HandlePositions.VERTICAL) !== 0) {
      this.reshapeHandlerHandle.reshapePolicy = ReshapePolicy.VERTICAL
    } else if ((position & HandlePositions.HORIZONTAL) !== 0) {
      this.reshapeHandlerHandle.reshapePolicy = ReshapePolicy.HORIZONTAL
    } else {
      this.reshapeHandlerHandle.reshapePolicy = ReshapePolicy.PROJECTION
    }
  }

  /**
   * @type {!IPoint}
   */
  get location() {
    if (this.$location == null) {
      this.$location = new HandleLocation(this)
    }
    return this.$location
  }

  /**
   * @type {!IReshapeHandler}
   */
  get reshapeHandler() {
    return this.reshapeHandlerHandle.reshapeHandler
  }

  /**
   * @type {!HandlePositions}
   */
  get position() {
    return this.reshapeHandlerHandle.position
  }

  /**
   * @type {!ReshapePolicy}
   */
  get reshapePolicy() {
    return this.reshapeHandlerHandle.reshapePolicy
  }

  /**
   * @type {!ReshapePolicy}
   */
  set reshapePolicy(value) {
    this.reshapeHandlerHandle.reshapePolicy = value
  }

  /**
   * @type {!ISize}
   */
  get maximumSize() {
    return this.reshapeHandlerHandle.maximumSize
  }

  /**
   * @type {!ISize}
   */
  set maximumSize(value) {
    this.reshapeHandlerHandle.maximumSize = value
  }

  /**
   * @type {!ISize}
   */
  get minimumSize() {
    return this.reshapeHandlerHandle.minimumSize
  }

  /**
   * @type {!ISize}
   */
  set minimumSize(value) {
    this.reshapeHandlerHandle.minimumSize = value
  }

  /**
   * @param {*} eventSource
   * @param {!EventArgs} evt
   * @returns {boolean}
   */
  centerReshapeRecognizer(eventSource, evt) {
    return this.reshapeHandlerHandle.centerReshapeRecognizer(eventSource, evt)
  }

  /**
   * @param {*} eventSource
   * @param {!EventArgs} evt
   * @returns {boolean}
   */
  ratioReshapeRecognizer(eventSource, evt) {
    return this.reshapeHandlerHandle.ratioReshapeRecognizer(eventSource, evt)
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   */
  cancelDrag(context, originalLocation) {
    this.reshapeHandlerHandle.cancelDrag(context, originalLocation)
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   */
  dragFinished(context, originalLocation, newLocation) {
    this.reshapeHandlerHandle.dragFinished(context, originalLocation, newLocation)
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   */
  handleMove(context, originalLocation, newLocation) {
    this.reshapeHandlerHandle.handleMove(context, originalLocation, newLocation)
  }

  /**
   * @param {!IInputModeContext} context
   */
  initializeDrag(context) {
    this.reshapeHandlerHandle.initializeDrag(context)
  }

  /**
   * @type {!Cursor}
   */
  get cursor() {
    return this.reshapeHandlerHandle.cursor
  }

  /**
   * @type {!HandleTypes}
   */
  get type() {
    return this.reshapeHandlerHandle.type
  }

  /**
   * This implementation does nothing special when clicked.
   * @param {!ClickEventArgs} evt
   */
  handleClick(evt) {}
}

/**
 * An {@link IPoint} implementation that represents the location of a {@link NodeSelectionReshapeHandle}.
 * The handle location is calculated considering the position of the handle, the current bounds of the
 * reshape handler and the margins of the {@link EncompassingRectangle} as well as an additional
 * zoom-dependent offset.
 */
class HandleLocation extends BaseClass(IPoint) {
  /**
   * @param {!NodeSelectionReshapeHandle} nodeSelectionReshapeHandle
   */
  constructor(nodeSelectionReshapeHandle) {
    super()
    this.offset = 5
    this.outerThis = nodeSelectionReshapeHandle
  }

  /**
   * @type {number}
   */
  get x() {
    const bounds = this.outerThis.reshapeHandler.bounds
    switch (this.outerThis.position) {
      case HandlePositions.NORTH_WEST:
      case HandlePositions.WEST:
      case HandlePositions.SOUTH_WEST:
        return bounds.x - (this.outerThis.margins.left + this.offset / this.outerThis.context.zoom)
      case HandlePositions.NORTH:
      case HandlePositions.CENTER:
      case HandlePositions.SOUTH:
      default:
        return bounds.x + bounds.width * 0.5
      case HandlePositions.NORTH_EAST:
      case HandlePositions.EAST:
      case HandlePositions.SOUTH_EAST:
        return (
          bounds.x +
          bounds.width +
          (this.outerThis.margins.right + this.offset / this.outerThis.context.zoom)
        )
    }
  }

  /**
   * @type {number}
   */
  get y() {
    const bounds = this.outerThis.reshapeHandler.bounds
    switch (this.outerThis.position) {
      case HandlePositions.NORTH_WEST:
      case HandlePositions.NORTH:
      case HandlePositions.NORTH_EAST:
        return bounds.y - (this.outerThis.margins.top + this.offset / this.outerThis.context.zoom)
      case HandlePositions.WEST:
      case HandlePositions.CENTER:
      case HandlePositions.EAST:
      default:
        return bounds.y + bounds.height * 0.5
      case HandlePositions.SOUTH_WEST:
      case HandlePositions.SOUTH:
      case HandlePositions.SOUTH_EAST:
        return (
          bounds.y +
          bounds.height +
          (this.outerThis.margins.top + this.offset / this.outerThis.context.zoom)
        )
    }
  }
}
