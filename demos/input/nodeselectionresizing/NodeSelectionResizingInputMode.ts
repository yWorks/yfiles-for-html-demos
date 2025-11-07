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
import {
  BaseClass,
  type ClickEventArgs,
  type CollectSnapResultsEventArgs,
  type ConcurrencyController,
  type Cursor,
  delegate,
  type EventArgs,
  type GraphComponent,
  type GraphEditorInputMode,
  GraphSnapContext,
  HandleInputMode,
  HandlePositions,
  type HandleType,
  type ICompoundEdit,
  IDragHandler,
  type IEnumerable,
  type IGraph,
  type IGraphSelection,
  IHandle,
  IInputMode,
  type IInputModeContext,
  type IList,
  type IModelItem,
  type INode,
  INodeReshapeSnapResultProvider,
  INodeSizeConstraintProvider,
  InputModeBase,
  type InputModeEventArgs,
  Insets,
  IPoint,
  IRectangle,
  type IRenderTreeElement,
  IReshapeHandler,
  type ISize,
  type ItemEventArgs,
  List,
  MutableRectangle,
  MutableSize,
  ObservableCollection,
  type OrthogonalEdgeDragHandler,
  OrthogonalEdgeEditingContext,
  Point,
  Rect,
  ReshapeHandlerHandle,
  ReshapePolicy,
  ReshapeRectangleContext,
  type SelectionEventArgs,
  Size
} from '@yfiles/yfiles'
import { RectangleRenderer } from '@yfiles/demo-utils/RectangleRenderer'

/**
 * An {@link IInputMode} for reshape handles for groups of nodes. Can be added as child input
 * mode of {@link GraphEditorInputMode} and changes the default node reshape handles when multiple nodes are
 * selected: instead of one set of handles per node, this input mode only shows a single set of handles around all
 * selected nodes.
 * Supports two different resize modes: 'resize' and 'scale'.
 */
export class NodeSelectionResizingInputMode extends InputModeBase {
  private $margins: Insets
  private $mode: 'scale' | 'resize'

  private handleInputMode: HandleInputMode | null

  private readonly moveHandleOrthogonalHelper: OrthogonalEdgeEditingHelper
  private rectangle: EncompassingRectangle | null
  private rectRenderTreeElement: IRenderTreeElement | null
  private ignoreSingleSelectionEvents: boolean

  /**
   * Gets the margins between the handle rectangle and the bounds of the selected nodes.
   */
  public get margins(): Insets {
    return this.$margins
  }

  /**
   * Sets the margins between the handle rectangle and the bounds of the selected nodes.
   */
  public set margins(value: Insets) {
    this.$margins = value
  }

  /**
   * Gets the current resize mode
   */
  public get mode(): 'scale' | 'resize' {
    return this.$mode
  }

  /**
   * Sets the current resize mode
   */
  public set mode(value: 'scale' | 'resize') {
    this.$mode = value
    if (this.handleInputMode) {
      this.updateHandles()
    }
  }

  constructor(mode?: 'scale' | 'resize', margins?: Insets) {
    super()
    this.$margins = margins || Insets.EMPTY
    this.$mode = mode || 'scale'
    this.rectangle = null
    this.rectRenderTreeElement = null
    this.handleInputMode = null
    this.moveHandleOrthogonalHelper = new OrthogonalEdgeEditingHelper()
    this.ignoreSingleSelectionEvents = false
  }

  public install(context: IInputModeContext, controller: ConcurrencyController): void {
    super.install(context, controller)
    const geim = context.inputMode as GraphEditorInputMode
    if (!geim) {
      throw new Error(
        'InvalidOperationException: NodeSelectionResizingInputMode must be installed as child mode of GraphEditorInputMode'
      )
    }

    // create own HandleInputMode for the handles
    this.handleInputMode = new HandleInputMode({ priority: 1, enabled: false })

    // notify the GraphSnapContext which nodes are resized and shouldn't provide SnapLines
    this.handleInputMode.addEventListener(
      'drag-started',
      delegate(this.registerReshapedNodes, this)
    )

    // forward events to OrthogonalEdgeEditingContext so it can handle keeping edges at reshaped nodes orthogonal
    this.handleInputMode.addEventListener(
      'drag-starting',
      delegate(this.moveHandleOrthogonalHelper.starting, this.moveHandleOrthogonalHelper)
    )
    this.handleInputMode.addEventListener(
      'drag-started',
      delegate(this.moveHandleOrthogonalHelper.started, this.moveHandleOrthogonalHelper)
    )
    this.handleInputMode.addEventListener(
      'drag-finished',
      delegate(this.moveHandleOrthogonalHelper.finished, this.moveHandleOrthogonalHelper)
    )
    this.handleInputMode.addEventListener(
      'drag-canceled',
      delegate(this.moveHandleOrthogonalHelper.canceled, this.moveHandleOrthogonalHelper)
    )

    this.handleInputMode.install(context, controller)

    // update handles depending on the changed node selection
    geim.addEventListener('multi-selection-started', delegate(this.multiSelectionStarted, this))
    geim.addEventListener('multi-selection-finished', delegate(this.multiSelectionFinished, this))
    ;(context.canvasComponent as GraphComponent).selection.addEventListener(
      'item-added',
      delegate(this.itemSelectionChanged, this)
    )
    ;(context.canvasComponent as GraphComponent).selection.addEventListener(
      'item-removed',
      delegate(this.itemSelectionChanged, this)
    )

    // add a NodeLayoutChanged listener so the reshape rect is updated when the nodes are moved (e.g. through
    // layout animations or MoveInputMode).
    context.graph!.addEventListener('node-layout-changed', delegate(this.nodeLayoutChanged, this))
  }

  /**
   * Notifies the current {@link GraphSnapContext} which nodes are going to be reshaped.
   */
  private registerReshapedNodes(event: InputModeEventArgs): void {
    // register reshaped nodes
    const snapContext = event.context.lookup(GraphSnapContext)
    if (snapContext && snapContext.enabled) {
      this.rectangle!.nodes.forEach((node) => {
        snapContext.addItemToBeReshaped(node)
      })
    }
  }

  /**
   * Invalidates the (bounds of the) {@link EncompassingRectangle} when any node layout is changed
   * but not by this input mode.
   */
  private nodeLayoutChanged(node: INode, oldLayout: Rect): void {
    if (this.rectangle && !this.handleInputMode!.isDragging) {
      this.rectangle.invalidate()
    }
  }

  public tryStop(): boolean {
    this.removeRectangleVisualization()
    return this.handleInputMode!.tryStop()
  }

  public cancel(): void {
    this.removeRectangleVisualization()
    this.handleInputMode!.cancel()
  }

  public uninstall(context: IInputModeContext): void {
    context.graph!.removeEventListener(
      'node-layout-changed',
      delegate(this.nodeLayoutChanged, this)
    )
    const geim = context.inputMode as GraphEditorInputMode
    geim.removeEventListener('multi-selection-started', delegate(this.multiSelectionStarted, this))
    geim.removeEventListener(
      'multi-selection-finished',
      delegate(this.multiSelectionFinished, this)
    )
    ;(context.canvasComponent as GraphComponent).selection.removeEventListener(
      'item-added',
      delegate(this.itemSelectionChanged, this)
    )
    ;(context.canvasComponent as GraphComponent).selection.removeEventListener(
      'item-removed',
      delegate(this.itemSelectionChanged, this)
    )

    // notify the GraphSnapContext which nodes are resized and shouldn't provide SnapLines
    this.handleInputMode!.removeEventListener(
      'drag-started',
      delegate(this.registerReshapedNodes, this)
    )

    // forward events to OrthogonalEdgeEditingContext so it can handle keeping edges at reshaped nodes orthogonal
    this.handleInputMode!.removeEventListener(
      'drag-starting',
      delegate(this.moveHandleOrthogonalHelper.starting, this.moveHandleOrthogonalHelper)
    )
    this.handleInputMode!.removeEventListener(
      'drag-started',
      delegate(this.moveHandleOrthogonalHelper.started, this.moveHandleOrthogonalHelper)
    )
    this.handleInputMode!.removeEventListener(
      'drag-finished',
      delegate(this.moveHandleOrthogonalHelper.finished, this.moveHandleOrthogonalHelper)
    )
    this.handleInputMode!.removeEventListener(
      'drag-canceled',
      delegate(this.moveHandleOrthogonalHelper.canceled, this.moveHandleOrthogonalHelper)
    )

    this.removeRectangleVisualization()

    this.handleInputMode!.uninstall(context)
    this.handleInputMode = null

    super.uninstall(context)
  }

  private multiSelectionStarted(__args: SelectionEventArgs<IModelItem>): void {
    // a multi-selection started so the ItemSelectionChanged events can be ignored until MultiSelectionFinished
    this.ignoreSingleSelectionEvents = true
  }

  private multiSelectionFinished(__args: SelectionEventArgs<IModelItem>): void {
    this.ignoreSingleSelectionEvents = false
    this.updateHandles()
  }

  private itemSelectionChanged(_evt: ItemEventArgs<IModelItem>): void {
    this.updateHandles()
  }

  private updateHandles(): void {
    if (this.ignoreSingleSelectionEvents) {
      // UpdateHandles was called by ItemSelectionChanged by this is a MultiSelection so we wait for MultiSelectionFinished
      return
    }
    // first, clear any existing handles
    this.clearHandles()

    const geim = this.parentInputModeContext!.inputMode as GraphEditorInputMode
    const selectedNodesCount = geim.graphComponent!.selection.nodes.size
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
  private clearHandles(): void {
    if (!this.handleInputMode!.tryStop()) {
      this.handleInputMode!.cancel()
    }
    this.handleInputMode!.enabled = false
    this.removeRectangleVisualization()
  }

  /**
   * Initializes the handles, the reshapeHandler and enables the handleInputMode.
   */
  private showHandles(): void {
    const graphComponent = this.parentInputModeContext!.canvasComponent as GraphComponent

    // collect all selected nodes as well as their descendents
    const reshapeNodes = this.collectReshapeNodes(graphComponent.graph, graphComponent.selection)

    // create a mutable rectangle, that is updated by the ReshapeHandler
    this.rectangle = new EncompassingRectangle(reshapeNodes, this.margins)

    // and visualize it
    this.rectRenderTreeElement = graphComponent.renderTree.createElement(
      graphComponent.renderTree.inputModeGroup,
      this.rectangle,
      new RectangleRenderer(undefined, undefined, undefined, this.margins)
    )

    this.rectRenderTreeElement!.toBack()

    // Create a reshape handler factory depending on the current mode
    const reshapeHandlerFactory =
      this.mode === 'scale'
        ? (): ScalingReshapeHandler => new ScalingReshapeHandler(this.rectangle!)
        : (): ResizingReshapeHandler => new ResizingReshapeHandler(this.rectangle!)

    // create and add the handles to our HandleInputMode
    this.handleInputMode!.handles = new ObservableCollection<IHandle>([
      this.createHandle(HandlePositions.TOP, reshapeHandlerFactory),
      this.createHandle(HandlePositions.TOP_LEFT, reshapeHandlerFactory),
      this.createHandle(HandlePositions.LEFT, reshapeHandlerFactory),
      this.createHandle(HandlePositions.BOTTOM_LEFT, reshapeHandlerFactory),
      this.createHandle(HandlePositions.BOTTOM, reshapeHandlerFactory),
      this.createHandle(HandlePositions.BOTTOM_RIGHT, reshapeHandlerFactory),
      this.createHandle(HandlePositions.RIGHT, reshapeHandlerFactory),
      this.createHandle(HandlePositions.TOP_RIGHT, reshapeHandlerFactory)
    ])
    this.handleInputMode!.enabled = true
  }

  /**
   * Collect all {@link IGraphselection.nodes selected nodes} and their descendents.
   */
  private collectReshapeNodes(graph: IGraph, selection: IGraphSelection): IList<INode> {
    const nodes = new Set<INode>()
    selection.nodes.forEach((node) => {
      if (nodes.add(node) && graph.isGroupNode(node)) {
        graph.groupingSupport.getDescendants(node).forEach((descendant) => {
          nodes.add(descendant)
        })
      }
    })
    return new List(nodes)
  }

  private createHandle(
    position: HandlePositions,
    reshapeHandlerFactory: () => ScalingReshapeHandler | ResizingReshapeHandler
  ): IHandle {
    const reshapeHandler = reshapeHandlerFactory()
    const handle = new NodeSelectionReshapeHandle(
      this.parentInputModeContext!,
      position,
      reshapeHandler,
      this.margins
    )
    reshapeHandler.handle = handle
    return handle
  }

  /**
   * Removes the rectRenderTreeElement.
   */
  private removeRectangleVisualization(): void {
    if (this.rectRenderTreeElement) {
      this.parentInputModeContext?.canvasComponent?.renderTree.remove(this.rectRenderTreeElement)
      this.rectRenderTreeElement = null
    }
    this.rectangle = null
  }
}

/**
 * Simplifies handling the {@link OrthogonalEdgeEditingContext} by listening to {@link HandleInputMode}
 * events.
 */
class OrthogonalEdgeEditingHelper {
  private editingContext: OrthogonalEdgeEditingContext | null

  constructor() {
    this.editingContext = null
  }

  public starting(event: InputModeEventArgs): void {
    const context = event.context
    const edgeEditingContext = context.lookup(OrthogonalEdgeEditingContext)
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

  public started(_evt: InputModeEventArgs): void {
    if (this.editingContext) {
      this.editingContext.dragInitialized()
    }
  }

  public finished(_evt: InputModeEventArgs): void {
    if (this.editingContext) {
      this.editingContext.dragFinished()
      this.editingContext = null
    }
  }

  public canceled(_evt: InputModeEventArgs): void {
    if (this.editingContext) {
      this.editingContext.cancelDrag()
      this.editingContext = null
    }
  }
}

/**
 * Returns whether `position` is {@link HandlePositions.TOP_LEFT},
 * {@link HandlePositions.TOP} or {@link HandlePositions.TOP_RIGHT}
 * @param position The position to check.
 * @returns `true` if the position is at any of the top sides.
 */
function isAnyTop(position: HandlePositions): boolean {
  return (
    (position & (HandlePositions.TOP_LEFT | HandlePositions.TOP | HandlePositions.TOP_RIGHT)) !== 0
  )
}

/**
 * Returns whether `position` is {@link HandlePositions.BOTTOM_LEFT},
 * {@link HandlePositions.BOTTOM} or {@link HandlePositions.BOTTOM_RIGHT}
 * @param position The position to check.
 * @returns `true` if the position is at any of the bottom sides.
 */
function isAnyBottom(position: HandlePositions): boolean {
  return (
    (position &
      (HandlePositions.BOTTOM_LEFT | HandlePositions.BOTTOM | HandlePositions.BOTTOM_RIGHT)) !==
    0
  )
}

/**
 * Returns whether `position` is {@link HandlePositions.TOP_LEFT},
 * {@link HandlePositions.LEFT} or {@link HandlePositions.BOTTOM_LEFT}
 * @param position The position to check.
 * @returns `true` if the position is at any of the left sides.
 */
function isAnyLeft(position: HandlePositions): boolean {
  return (
    (position & (HandlePositions.TOP_LEFT | HandlePositions.LEFT | HandlePositions.BOTTOM_LEFT)) !==
    0
  )
}

/**
 * Returns whether `position` is {@link HandlePositions.TOP_RIGHT},
 * {@link HandlePositions.RIGHT} or {@link HandlePositions.BOTTOM_RIGHT}
 * @param position The position to check.
 * @returns `true` if the position is at any of the right sides.
 */
function isAnyRight(position: HandlePositions): boolean {
  return (
    (position &
      (HandlePositions.TOP_RIGHT | HandlePositions.RIGHT | HandlePositions.BOTTOM_RIGHT)) !==
    0
  )
}

/**
 * An {@link IRectangle} implementation that encompasses a set of {@link INode} layouts. Can be
 * {@link EncompassingRectangle.invalidate invalidated} to fit the encompassed nodes or explicitly
 * {@link reshape reshaped}.
 */
class EncompassingRectangle extends BaseClass(IRectangle) {
  private readonly $nodes: IEnumerable<INode>
  private readonly $margins: Insets
  private readonly rectangle: MutableRectangle
  private tightRect: Rect
  private invalid: boolean

  constructor(nodes: IEnumerable<INode>, margins: Insets) {
    super()
    this.$nodes = nodes
    this.$margins = margins
    this.rectangle = new MutableRectangle()
    this.tightRect = Rect.EMPTY
    this.invalid = true
  }

  public invalidate(): void {
    this.invalid = true
  }

  public reshape(newRectangle: IRectangle): void {
    this.tightRect = newRectangle.toRect()
    this.rectangle.setShape(this.tightRect.getEnlarged(this.margins))
    this.invalid = false
  }

  private update(): void {
    if (!this.invalid) {
      return
    }

    this.rectangle.width = -1
    this.rectangle.height = -1
    this.rectangle.x = 0
    this.rectangle.y = 0

    this.nodes.forEach((node) => {
      this.rectangle.add(node.layout)
    })
    this.tightRect = this.rectangle.toRect()

    this.rectangle.x -= this.margins.left
    this.rectangle.y -= this.margins.top
    this.rectangle.width += this.margins.left + this.margins.right
    this.rectangle.height += this.margins.top + this.margins.bottom

    this.invalid = false
  }

  public get width(): number {
    this.update()
    return this.rectangle.width
  }

  public get height(): number {
    this.update()
    return this.rectangle.height
  }

  public get x(): number {
    this.update()
    return this.rectangle.x
  }

  public get y(): number {
    this.update()
    return this.rectangle.y
  }

  public get nodes(): IEnumerable<INode> {
    return this.$nodes
  }

  public get margins(): Insets {
    return this.$margins
  }

  public get tightRectangle(): Rect {
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
  // dictionaries storing the original layout, reshape handler and snap result provider of the reshape nodes
  protected readonly originalNodeLayouts: Map<INode, Rect>
  private readonly reshapeHandlers: Map<INode, IReshapeHandler>
  private readonly reshapeSnapResultProviders: Map<INode, INodeReshapeSnapResultProvider>
  private readonly orthogonalEdgeDragHandlers: Map<INode, OrthogonalEdgeDragHandler>

  private compoundEdit: ICompoundEdit | null

  private readonly rectangle: EncompassingRectangle

  private $originalBounds: Rect
  private $handle: NodeSelectionReshapeHandle | null

  /**
   * Gets a view of the bounds of the item.
   */
  public get bounds(): IRectangle {
    return this.rectangle.tightRectangle
  }

  /**
   * Returns the original bounds of the reshaped {@link EncompassingRectangle} without its margins.
   */
  protected get originalBounds(): Rect {
    return this.$originalBounds
  }

  /**
   * Returns the nodes to be reshaped.
   */
  protected get reshapeNodes(): IEnumerable<INode> {
    return this.rectangle.nodes
  }

  /**
   * The {@link NodeSelectionReshapeHandle} using this {@link IReshapeHandler}.
   */
  public get handle(): NodeSelectionReshapeHandle | null {
    return this.$handle
  }

  /**
   * The {@link NodeSelectionReshapeHandle} using this {@link IReshapeHandler}.
   */
  public set handle(value: NodeSelectionReshapeHandle | null) {
    this.$handle = value
  }

  constructor(rectangle: EncompassingRectangle) {
    super()
    this.rectangle = rectangle
    this.originalNodeLayouts = new Map<INode, Rect>()
    this.reshapeHandlers = new Map<INode, IReshapeHandler>()
    this.reshapeSnapResultProviders = new Map<INode, INodeReshapeSnapResultProvider>()
    this.orthogonalEdgeDragHandlers = new Map<INode, OrthogonalEdgeDragHandler>()
    this.compoundEdit = null
    this.$originalBounds = Rect.EMPTY
    this.$handle = null
  }

  public initializeReshape(context: IInputModeContext): void {
    this.$originalBounds = this.rectangle.tightRectangle

    // register our CollectSnapResults callback
    const snapContext = context.lookup(GraphSnapContext)
    if (snapContext) {
      snapContext.addEventListener('collect-snap-results', delegate(this.collectSnapResults, this))
    }

    // store original node layouts, reshape handlers and reshape snap result providers
    this.reshapeNodes.forEach((node) => {
      this.originalNodeLayouts.set(node, node.layout.toRect())

      // store reshape handler to change the shape of node
      const reshapeHandler = node.lookup(IReshapeHandler)
      if (reshapeHandler) {
        reshapeHandler.initializeReshape(context)
        this.reshapeHandlers.set(node, reshapeHandler)
      }
      // store reshape snap result provider to collect snap results where node would snap to snaplines etc.
      const snapResultProvider = node.lookup(INodeReshapeSnapResultProvider)
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
    this.handle!.minimumSize = this.calculateMinimumSize()
    this.handle!.maximumSize = this.calculateMaximumSize()

    // start a compound undo unit
    this.compoundEdit = context.graph!.beginEdit('Undo Group Resize', 'Redo Group Resize')
  }

  private collectSnapResults(evt: CollectSnapResultsEventArgs, context: GraphSnapContext): void {
    const lastEvent = evt.context.canvasComponent!.lastInputEvent
    const fixedAspectRatio = this.handle!.ratioReshapeRecognizer(lastEvent, this)
    const centered = this.handle!.centerReshapeRecognizer(lastEvent, this)

    const reshapePolicy = fixedAspectRatio ? this.handle!.reshapePolicy : ReshapePolicy.NONE
    const ratio = this.originalBounds.width / this.originalBounds.height

    const minScaleX = this.handle!.minimumSize.width / this.originalBounds.width
    const minScaleY = this.handle!.minimumSize.height / this.originalBounds.height
    const maxScaleX = this.handle!.maximumSize.width / this.originalBounds.width
    const maxScaleY = this.handle!.maximumSize.height / this.originalBounds.height

    this.reshapeSnapResultProviders.forEach(
      (handler: INodeReshapeSnapResultProvider, node: INode) => {
        // for each selected node that has an INodeReshapeSnapResultProvider we have to create
        // a suiting ReshapeRectangleContext
        const layout = this.originalNodeLayouts.get(node) as Rect

        // get factors that determine how the node layout changes depending on the mouse delta
        const topLeftChangeFactor = ReshapeHandlerBase.fixZero(
          this.getFactor(layout.x, layout.y, layout, centered, this.handle!.position)
        )
        const bottomRightChangeFactor = ReshapeHandlerBase.fixZero(
          this.getFactor(layout.maxX, layout.maxY, layout, centered, this.handle!.position)
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
          this.handle!.position,
          topLeftChangeFactor,
          bottomRightChangeFactor,
          sizeChangeFactor,
          reshapePolicy,
          ratio
        )

        // call the INodeReshapeSnapResultProvider
        handler.collectSnapResults(context, evt, node, reshapeRectangleContext)
      }
    )
  }

  /**
   * Calculates the {@link ReshapeHandlerHandle.minimumSize} considering all reshaped nodes.
   */
  protected calculateMinimumSize(): ISize {
    return Size.EMPTY
  }

  /**
   * Calculates the {@link ReshapeHandlerHandle.maximumSize} considering all reshaped nodes.
   */
  protected calculateMaximumSize(): ISize {
    return Size.EMPTY
  }

  /**
   * Calculates the horizontal and vertical factor the mouse movement has to be multiplied with to get the
   * horizontal and vertical delta for the point (x,y) inside the `originalNodeLayout`.
   * @param x The horizontal location inside `originalNodeLayout`.
   * @param y The vertical location inside `originalNodeLayout`.
   * @param originalNodeLayout The original layout of the node to calculate the factors for.
   * @param centered Whether center resizing is active.
   * @param position The handle position to calculate the factor for.
   */
  protected getFactor(
    x: number,
    y: number,
    originalNodeLayout: Rect,
    centered: boolean,
    position: HandlePositions
  ): Point {
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
   * @param x The horizontal location inside `originalNodeLayout`.
   * @param y The vertical location inside `originalNodeLayout`.
   * @param originalNodeLayout The original layout of the node to calculate the factors for.
   * @param centered Whether center resizing is active.
   */
  private getOrthogonalFactor(
    x: number,
    y: number,
    originalNodeLayout: Rect,
    centered: boolean
  ): Point {
    const ratio = this.originalBounds.width / this.originalBounds.height
    if (this.handle!.reshapePolicy === ReshapePolicy.HORIZONTAL) {
      const x2y = 1 / (ratio * (centered ? 1 : 2))
      const orthogonalPosition =
        this.handle!.position === HandlePositions.RIGHT
          ? HandlePositions.BOTTOM
          : HandlePositions.TOP
      const orthoFactor = this.getFactor(x, y, originalNodeLayout, true, orthogonalPosition)
      return new Point(orthoFactor.y * x2y, 0)
    } else if (this.handle!.reshapePolicy === ReshapePolicy.VERTICAL) {
      const x2y = ratio / (centered ? 1 : 2)
      const orthogonalPosition =
        this.handle!.position === HandlePositions.BOTTOM
          ? HandlePositions.RIGHT
          : HandlePositions.LEFT
      const orthoFactor = this.getFactor(x, y, originalNodeLayout, true, orthogonalPosition)
      return new Point(0, orthoFactor.x * x2y)
    }
    return Point.ORIGIN
  }

  public handleReshape(context: IInputModeContext, originalBounds: Rect, newBounds: Rect): void {
    // reshape the encompassing rectangle
    this.rectangle.reshape(newBounds)

    // update node layouts and bend locations
    this.updateNodeLayouts(context, originalBounds, newBounds)
  }

  private updateNodeLayouts(
    context: IInputModeContext,
    originalBounds: Rect,
    newBounds: Rect
  ): void {
    const dMinX = newBounds.x - originalBounds.x
    const dMinY = newBounds.y - originalBounds.y
    const dMaxX = newBounds.maxX - originalBounds.maxX
    const dMaxY = newBounds.maxY - originalBounds.maxY

    // calculate a possible mouse movement that could have led to the newBounds
    let dx = 0
    let dy = 0
    if (isAnyLeft(this.handle!.position)) {
      dx = dMinX
    } else if (isAnyRight(this.handle!.position)) {
      dx = dMaxX
    }
    if (isAnyTop(this.handle!.position)) {
      dy = dMinY
    } else if (isAnyBottom(this.handle!.position)) {
      dy = dMaxY
    }

    const centerResize = this.handle!.centerReshapeRecognizer(
      context.canvasComponent!.lastInputEvent,
      this
    )
    const ratioResize = this.handle!.ratioReshapeRecognizer(
      context.canvasComponent!.lastInputEvent,
      this
    )
    const useOrthogonalFactors =
      ratioResize &&
      (this.handle!.reshapePolicy === ReshapePolicy.HORIZONTAL ||
        this.handle!.reshapePolicy === ReshapePolicy.VERTICAL)

    this.originalNodeLayouts.forEach((originalLayout: Rect, node: INode) => {
      const reshapeHandler = this.reshapeHandlers.get(node)
      if (reshapeHandler) {
        const topLeftFactor = this.getFactor(
          originalLayout.x,
          originalLayout.y,
          originalLayout,
          centerResize,
          this.handle!.position
        )
        const bottomRightFactor = this.getFactor(
          originalLayout.maxX,
          originalLayout.maxY,
          originalLayout,
          centerResize,
          this.handle!.position
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
    this.orthogonalEdgeDragHandlers.forEach((handler: OrthogonalEdgeDragHandler) => {
      handler.handleMove()
    })
  }

  public cancelReshape(context: IInputModeContext, originalBounds: Rect): void {
    this.rectangle.reshape(originalBounds)
    this.reshapeHandlers.forEach((handler: IReshapeHandler, node: INode) => {
      handler.cancelReshape(context, this.originalNodeLayouts.get(node)!)
    })
    this.orthogonalEdgeDragHandlers.forEach((handler: OrthogonalEdgeDragHandler) => {
      handler.cancelDrag()
    })
    this.compoundEdit!.cancel()
    this.clear(context)
  }

  public reshapeFinished(context: IInputModeContext, originalBounds: Rect, newBounds: Rect): void {
    this.reshapeHandlers.forEach((handler: IReshapeHandler, node: INode) => {
      handler.reshapeFinished(context, this.originalNodeLayouts.get(node)!, handler.bounds.toRect())
    })
    this.orthogonalEdgeDragHandlers.forEach((handler: OrthogonalEdgeDragHandler) => {
      handler.finishDrag()
    })

    this.compoundEdit!.commit()
    this.clear(context)
  }

  protected clear(context: IInputModeContext): void {
    const snapContext = context.lookup(GraphSnapContext)
    if (snapContext) {
      snapContext.removeEventListener(
        'collect-snap-results',
        delegate(this.collectSnapResults, this)
      )
    }
    this.reshapeSnapResultProviders.clear()
    this.originalNodeLayouts.clear()
    this.reshapeHandlers.clear()
    this.orthogonalEdgeDragHandlers.clear()
    this.compoundEdit = null
  }

  /**
   * Sets x or y values that are close to 0 to be 0.
   */
  private static fixZero(p: Point): Point {
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
   */
  protected calculateMinimumSize(): ISize {
    const minSize = new MutableSize()
    this.reshapeNodes.forEach((node) => {
      minSize.width = Math.max(minSize.width, node.layout.width)
      minSize.height = Math.max(minSize.height, node.layout.height)
    })
    return minSize
  }

  protected calculateMaximumSize(): ISize {
    return Size.INFINITE
  }

  protected getFactor(
    x: number,
    y: number,
    originalNodeLayout: Rect,
    centered: boolean,
    position: HandlePositions
  ): Point {
    let fx = 0
    if ((position & HandlePositions.VERTICAL) === 0) {
      const boundsWidth = this.originalBounds.width - originalNodeLayout.width
      if (boundsWidth <= 0) {
        fx = centered ? 0 : 0.5
      } else {
        const xRatio = centered
          ? (2 * (originalNodeLayout.centerX - this.originalBounds.centerX)) / boundsWidth
          : (originalNodeLayout.x - this.originalBounds.x) / boundsWidth
        if (isAnyLeft(position)) {
          fx = centered ? -xRatio : 1 - xRatio
        } else if (isAnyRight(position)) {
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
          : (originalNodeLayout.y - this.originalBounds.y) / boundsHeight
        if (isAnyTop(position)) {
          fy = centered ? -yRatio : 1 - yRatio
        } else if (isAnyBottom(position)) {
          fy = yRatio
        }
      }
    }

    return new Point(fx, fy)
  }

  public handleReshape(context: IInputModeContext, originalBounds: Rect, newBounds: Rect): void {
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
   */
  protected calculateMinimumSize(): ISize {
    let minScaleX = 0
    let minScaleY = 0

    this.reshapeNodes.forEach((node) => {
      const constraintProvider = node.lookup(INodeSizeConstraintProvider)
      if (constraintProvider) {
        const minSize = constraintProvider.getMinimumSize()
        if (minSize !== Size.EMPTY) {
          const originalLayout = this.originalNodeLayouts.get(node)!
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
   */
  protected calculateMaximumSize(): ISize {
    let maxScaleX = Number.POSITIVE_INFINITY
    let maxScaleY = Number.POSITIVE_INFINITY

    this.reshapeNodes.forEach((node) => {
      const constraintProvider = node.lookup(INodeSizeConstraintProvider)
      if (constraintProvider) {
        const maxSize = constraintProvider.getMaximumSize()
        if (maxSize !== Size.INFINITE) {
          const originalLayout = this.originalNodeLayouts.get(node)!
          maxScaleX = Math.min(maxScaleX, maxSize.width / originalLayout.width)
          maxScaleY = Math.min(maxScaleY, maxSize.height / originalLayout.height)
        }
      }
    })

    const maxWidth = this.originalBounds.width * maxScaleX
    const maxHeight = this.originalBounds.height * maxScaleY
    return new Size(maxWidth, maxHeight)
  }

  protected getFactor(
    x: number,
    y: number,
    originalNodeLayout: Rect,
    centered: boolean,
    position: HandlePositions
  ): Point {
    const xRatio = centered
      ? (2 * (x - this.originalBounds.centerX)) / this.originalBounds.width
      : (x - this.originalBounds.x) / this.originalBounds.width
    const yRatio = centered
      ? (2 * (y - this.originalBounds.centerY)) / this.originalBounds.height
      : (y - this.originalBounds.y) / this.originalBounds.height

    let fx = 0
    if (isAnyLeft(position)) {
      fx = centered ? -xRatio : 1 - xRatio
    } else if (isAnyRight(position)) {
      fx = xRatio
    }
    let fy = 0
    if (isAnyTop(position)) {
      fy = centered ? -yRatio : 1 - yRatio
    } else if (isAnyBottom(position)) {
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
  private readonly reshapeHandlerHandle: ReshapeHandlerHandle
  private $location: IPoint | null

  readonly context: IInputModeContext
  margins: Insets

  constructor(
    context: IInputModeContext,
    position: HandlePositions,
    reshapeHandler: IReshapeHandler,
    margins: Insets
  ) {
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
    this.reshapeHandlerHandle.ratioReshapeRecognizer = (
      context.inputMode as GraphEditorInputMode
    ).handleInputMode.directionalConstraintRecognizer
  }

  get location(): IPoint {
    if (this.$location == null) {
      this.$location = new HandleLocation(this)
    }
    return this.$location
  }

  get reshapeHandler(): IReshapeHandler {
    return this.reshapeHandlerHandle.reshapeHandler
  }

  get position(): HandlePositions {
    return this.reshapeHandlerHandle.position
  }

  get reshapePolicy(): ReshapePolicy {
    return this.reshapeHandlerHandle.reshapePolicy
  }

  set reshapePolicy(value: ReshapePolicy) {
    this.reshapeHandlerHandle.reshapePolicy = value
  }

  get maximumSize(): ISize {
    return this.reshapeHandlerHandle.maximumSize
  }

  set maximumSize(value: ISize) {
    this.reshapeHandlerHandle.maximumSize = value
  }

  get minimumSize(): ISize {
    return this.reshapeHandlerHandle.minimumSize
  }

  set minimumSize(value: ISize) {
    this.reshapeHandlerHandle.minimumSize = value
  }

  centerReshapeRecognizer(evt: EventArgs, eventSource: any): boolean {
    return this.reshapeHandlerHandle.centerReshapeRecognizer(evt, eventSource)
  }

  ratioReshapeRecognizer(evt: EventArgs, eventSource: any): boolean {
    return this.reshapeHandlerHandle.ratioReshapeRecognizer!(evt, eventSource)
  }

  cancelDrag(context: IInputModeContext, originalLocation: Point): void {
    this.reshapeHandlerHandle.cancelDrag(context, originalLocation)
  }

  dragFinished(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    this.reshapeHandlerHandle.dragFinished(context, originalLocation, newLocation)
  }

  handleMove(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    this.reshapeHandlerHandle.handleMove(context, originalLocation, newLocation)
  }

  initializeDrag(context: IInputModeContext): void {
    this.reshapeHandlerHandle.initializeDrag(context)
  }

  get cursor(): Cursor {
    return this.reshapeHandlerHandle.cursor
  }

  get type(): HandleType {
    return this.reshapeHandlerHandle.type
  }

  get tag(): any {
    return null
  }

  /**
   * This implementation does nothing special when clicked.
   */
  handleClick(evt: ClickEventArgs): void {}
}

/**
 * An {@link IPoint} implementation that represents the location of a {@link NodeSelectionReshapeHandle}.
 * The handle location is calculated considering the position of the handle, the current bounds of the
 * reshape handler and the margins of the {@link EncompassingRectangle} as well as an additional
 * zoom-dependent offset.
 */
class HandleLocation extends BaseClass(IPoint) {
  private readonly offset: number
  private readonly outerThis: NodeSelectionReshapeHandle

  constructor(nodeSelectionReshapeHandle: NodeSelectionReshapeHandle) {
    super()
    this.offset = 5
    this.outerThis = nodeSelectionReshapeHandle
  }

  get x(): number {
    const bounds = this.outerThis.reshapeHandler.bounds
    switch (this.outerThis.position) {
      case HandlePositions.TOP_LEFT:
      case HandlePositions.LEFT:
      case HandlePositions.BOTTOM_LEFT:
        return bounds.x - (this.outerThis.margins.left + this.offset / this.outerThis.context.zoom)
      case HandlePositions.TOP:
      case HandlePositions.CENTER:
      case HandlePositions.BOTTOM:
      default:
        return bounds.x + bounds.width * 0.5
      case HandlePositions.TOP_RIGHT:
      case HandlePositions.RIGHT:
      case HandlePositions.BOTTOM_RIGHT:
        return (
          bounds.x +
          bounds.width +
          (this.outerThis.margins.right + this.offset / this.outerThis.context.zoom)
        )
    }
  }

  get y(): number {
    const bounds = this.outerThis.reshapeHandler.bounds
    switch (this.outerThis.position) {
      case HandlePositions.TOP_LEFT:
      case HandlePositions.TOP:
      case HandlePositions.TOP_RIGHT:
        return bounds.y - (this.outerThis.margins.top + this.offset / this.outerThis.context.zoom)
      case HandlePositions.LEFT:
      case HandlePositions.CENTER:
      case HandlePositions.RIGHT:
      default:
        return bounds.y + bounds.height * 0.5
      case HandlePositions.BOTTOM_LEFT:
      case HandlePositions.BOTTOM:
      case HandlePositions.BOTTOM_RIGHT:
        return (
          bounds.y +
          bounds.height +
          (this.outerThis.margins.top + this.offset / this.outerThis.context.zoom)
        )
    }
  }
}
