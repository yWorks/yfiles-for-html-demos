/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  CanvasComponent,
  Class,
  DefaultGraph,
  GraphComponent,
  GraphModelManager,
  HtmlCanvasVisual,
  IBoundsProvider,
  ICanvasContext,
  ICanvasObject,
  ICanvasObjectDescriptor,
  ICanvasObjectGroup,
  IContextLookup,
  IContextLookupChainLink,
  IEdge,
  IEdgeHitTester,
  IEdgeStyle,
  IEnumerable,
  IGraph,
  IHitTestable,
  IHitTester,
  IInputModeContext,
  ILabel,
  ILabelHitTester,
  ILabelOwner,
  ILabelOwnerHitTester,
  ILabelStyle,
  IModelItem,
  INode,
  INodeHitTester,
  INodeStyle,
  IPort,
  IPortHitTester,
  IPortStyle,
  IRenderContext,
  IVisibilityTestable,
  IVisualCreator,
  List,
  Matrix,
  Point,
  Rect,
  Size,
  SvgExport,
  SvgVisual,
  Visual,
  VoidLabelStyle,
  VoidPortStyle,
  WebGLPolylineEdgeStyle,
  WebGLShapeNodeStyle,
  WebGLVisual
} from 'yfiles'

import SvgEdgeStyle from './SvgEdgeStyle'
import SimpleSvgNodeStyle from './SimpleSvgNodeStyle'
import { BrowserDetection } from 'demo-utils/BrowserDetection'

/**
 * A {@link GraphModelManager} implementation that uses several optimizations
 * to improve the rendering performance especially for large graphs.
 *
 * This class can be used in other applications to improve the user experience.
 *
 * The performance gain that can be achieved depends mainly on the configuration of
 * this class. Not all options are suited for all types of graphs and item styles. The
 * main optimization strategy can be configured using the
 * {@link FastGraphModelManager.graphOptimizationMode} property. This determines how the graph is rendered
 * when zoomed out below the threshold defined in {@link FastGraphModelManager.intermediateZoomThreshold}. For
 * zoom levels above the threshold, this implementation falls back to default rendering.
 * Most graph item styles show good performance in scenarios where only a few elements
 * are rendered, which is the case for high zoom levels. The graph items outside the
 * {@link CanvasComponent.viewport viewport} are not rendered at all due to a
 * feature called 'virtualization'. Thus, the optimization strategy only has to be
 * applied when the graph is zoomed out.
 *
 * - {@link OptimizationMode.DEFAULT} uses the default rendering that would also be
 *   used by the default {@link GraphModelManager}.
 * - {@link OptimizationMode.STATIC} creates the graph visualization using the default
 *   code. However, subsequent updates are ignored.
 * - {@link OptimizationMode.LEVEL_OF_DETAIL} uses the graph item styles set in
 *   {@link FastGraphModelManager.overviewNodeStyle}, {@link FastGraphModelManager.overviewEdgeStyle},
 *   {@link FastGraphModelManager.overviewLabelStyle} and {@link FastGraphModelManager.overviewPortStyle}
 *   to render the graph.
 * - {@link OptimizationMode.SVG_IMAGE} exports the complete graph to a static SVG image,
 *   which is displayed instead of the default visualizations.
 * - {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK} uses
 *   {@link FastGraphModelManager.drawNodeCallback callbacks} to draw the currently visible part of the graph
 *   into a canvas. When the bounds of the pre-rendered image are left, or the zoom level changes
 *   above a certain factor, the image is re-created. Use {@link FastGraphModelManager.imageSizeFactor} and
 *   {@link FastGraphModelManager.refreshImageZoomFactor} to configure the size of the pre-rendered image and the
 *   factor by which the zoom has to change to trigger re-creation of the image.
 * - {@link OptimizationMode.DYNAMIC_CANVAS_WITH_ITEM_STYLES} draws the currently visible part
 *   of the graph into a canvas using the original item styles. When the bounds of the pre-rendered
 *   image are left, or the zoom level changes above a certain factor, the image is re-created.
 *   Use {@link FastGraphModelManager.imageSizeFactor} and {@link FastGraphModelManager.refreshImageZoomFactor} to
 *   configure the size of the pre-rendered image and the factor by which the zoom has to change to trigger re-creation
 *   of the image.
 * - {@link OptimizationMode.STATIC_CANVAS} creates a static image of the complete graph in a
 *   canvas which is scaled based on the zoom level.
 * - {@link OptimizationMode.WEBGL} renders a static image of the complete graph in a WebGL canvas.
 *
 * @see {@link OptimizationMode}
 */
export class FastGraphModelManager extends GraphModelManager {
  private _graphComponent: GraphComponent | null

  // create the custom descriptors for graph items
  private readonly fastNodeDescriptor: AutoSwitchDescriptor = new AutoSwitchDescriptor(
    GraphModelManager.DEFAULT_NODE_DESCRIPTOR,
    this
  )
  private readonly fastEdgeDescriptor: AutoSwitchDescriptor = new AutoSwitchDescriptor(
    GraphModelManager.DEFAULT_EDGE_DESCRIPTOR,
    this
  )
  private readonly fastLabelDescriptor: AutoSwitchDescriptor = new AutoSwitchDescriptor(
    GraphModelManager.DEFAULT_LABEL_DESCRIPTOR,
    this
  )
  private readonly fastPortDescriptor: AutoSwitchDescriptor = new AutoSwitchDescriptor(
    GraphModelManager.DEFAULT_PORT_DESCRIPTOR,
    this
  )

  private _overviewNodeStyle: INodeStyle
  private _overviewEdgeStyle: IEdgeStyle

  // set default values
  private _intermediateZoomThreshold = 1
  private _overviewZoomThreshold = 0.1
  private _refreshImageZoomFactor = 0.5
  private _imageSizeFactor = 2
  private _maximumCanvasSize: Size = new Size(3000, 2000)
  private _dirty = false
  private _drawNodeCallback:
    | ((node: INode, canvasContext: CanvasRenderingContext2D) => void)
    | null = null
  private _drawEdgeCallback:
    | ((edge: IEdge, canvasContext: CanvasRenderingContext2D) => void)
    | null = null
  private _drawNodeLabelCallback:
    | ((label: ILabel, canvasContext: CanvasRenderingContext2D) => void)
    | null = null
  private _drawEdgeLabelCallback:
    | ((label: ILabel, canvasContext: CanvasRenderingContext2D) => void)
    | null = null

  // create the image renderer
  private _imageRendererCanvasObject: ICanvasObject | null = null
  private readonly imageRenderer: ImageGraphRenderer

  // add a chain link to the graphComponent's lookup that customizes item hit test
  private hitTestInputChainLink: HitTestInputChainLink | null = null

  private _graphOptimizationMode = OptimizationMode.DEFAULT

  private readonly zoomChangedHandler: () => void
  private readonly graphChangedHandler: () => void

  /**
   * Creates a new instance of this class.
   * @param graphComponent The {@link GraphComponent} that uses this instance.
   * @param contentGroup The content group in which to render the graph items.
   */
  constructor(graphComponent: GraphComponent, contentGroup: ICanvasObjectGroup) {
    super(graphComponent, contentGroup)
    this._graphComponent = graphComponent
    this._graphOptimizationMode = OptimizationMode.DEFAULT

    // set the graph for the component view
    this.graph = graphComponent.graph

    this.nodeDescriptor = this.fastNodeDescriptor
    this.edgeDescriptor = this.fastEdgeDescriptor
    this.nodeLabelDescriptor = this.fastLabelDescriptor
    this.edgeLabelDescriptor = this.fastLabelDescriptor
    this.portDescriptor = this.fastPortDescriptor

    // initialize the intermediate and overview styles with default values
    if (BrowserDetection.webGL) {
      this.overviewNodeStyle = new WebGLShapeNodeStyle()
      this.overviewEdgeStyle = new WebGLPolylineEdgeStyle()
      this._overviewNodeStyle = new WebGLShapeNodeStyle()
      this._overviewEdgeStyle = new WebGLPolylineEdgeStyle()
    } else {
      this.overviewNodeStyle = new SimpleSvgNodeStyle()
      this.overviewEdgeStyle = new SvgEdgeStyle()
      this._overviewNodeStyle = new SimpleSvgNodeStyle()
      this._overviewEdgeStyle = new SvgEdgeStyle()
    }
    // there is an intermediate level visualization for nodes and edges
    this.intermediateNodeStyle = new SimpleSvgNodeStyle()
    this.intermediateEdgeStyle = new SvgEdgeStyle()
    // we do not render ports and labels in other levels than the default level
    this.overviewLabelStyle = VoidLabelStyle.INSTANCE
    this.overviewPortStyle = VoidPortStyle.INSTANCE

    this.imageRenderer = new ImageGraphRenderer(this)

    this.zoomChangedHandler = () => this.onGraphComponentZoomChanged()
    this.graphChangedHandler = () => this.onGraphComponentGraphChanged()
  }

  install(graphComponent: GraphComponent, graph: IGraph): void {
    super.install(graphComponent, graph)

    this._graphComponent = graphComponent

    // register to graphComponent events that could trigger a visualization change
    graphComponent.addZoomChangedListener(this.zoomChangedHandler)
    graphComponent.addGraphChangedListener(this.graphChangedHandler)

    this.hitTestInputChainLink = new HitTestInputChainLink(graphComponent)
    graphComponent.inputModeContextLookupChain.add(this.hitTestInputChainLink)

    if (graphComponent.graph != null) {
      // install rendering, if necessary
      this.updateRendering()
    }
  }

  uninstall(graphComponent: GraphComponent): void {
    if (this._imageRendererCanvasObject) {
      this._imageRendererCanvasObject.remove()
      this._imageRendererCanvasObject = null
    }

    // unregister to graphComponent events that could trigger a visualization change
    graphComponent.removeGraphChangedListener(this.graphChangedHandler)
    graphComponent.removeZoomChangedListener(this.zoomChangedHandler)

    graphComponent.inputModeContextLookupChain.remove(this.hitTestInputChainLink!)
    this.hitTestInputChainLink = null

    this._graphComponent = null

    super.uninstall(graphComponent)
  }

  get graphComponent(): GraphComponent | null {
    return this._graphComponent
  }

  /**
   * Gets the optimization mode used to render the graph
   * if the zoom level is below {@link FastGraphModelManager.zoomThreshold}.
   */
  set graphOptimizationMode(value: number) {
    this._graphOptimizationMode = value
    this.updateRendering()
  }

  /**
   * Sets the optimization mode used to render the graph
   * if the zoom level is below {@link FastGraphModelManager.zoomThreshold}.
   */
  get graphOptimizationMode(): number {
    return this._graphOptimizationMode
  }

  /**
   * Sets the canvas object for image rendering.
   */
  set imageRendererCanvasObject(value: ICanvasObject | null) {
    this._imageRendererCanvasObject = value
  }

  /**
   * Gets the canvas object for image rendering.
   */
  get imageRendererCanvasObject(): ICanvasObject | null {
    return this._imageRendererCanvasObject
  }

  /**
   * Sets the intermediate node style.
   */
  set intermediateNodeStyle(value: INodeStyle) {
    this.fastNodeDescriptor.intermediateStyle = value
  }

  /**
   * Gets the intermediate node style.
   */
  get intermediateNodeStyle(): INodeStyle {
    return this.fastNodeDescriptor.intermediateStyle as INodeStyle
  }

  /**
   * Sets the intermediate edge style.
   */
  set intermediateEdgeStyle(value: IEdgeStyle) {
    this.fastEdgeDescriptor.intermediateStyle = value
  }

  /**
   * Gets the intermediate edge style.
   */
  get intermediateEdgeStyle(): IEdgeStyle {
    return this.fastEdgeDescriptor.intermediateStyle as IEdgeStyle
  }

  /**
   * Sets the overview node style.
   */
  set overviewNodeStyle(value: INodeStyle) {
    this.fastNodeDescriptor.overviewStyle = value
  }

  /**
   * Gets the overview node style.
   */
  get overviewNodeStyle(): INodeStyle {
    return this.fastNodeDescriptor.overviewStyle as INodeStyle
  }

  /**
   * Sets the overview edge style.
   */
  set overviewEdgeStyle(value: IEdgeStyle) {
    this.fastEdgeDescriptor.overviewStyle = value
  }

  /**
   * Gets the overview edge style.
   */
  get overviewEdgeStyle(): IEdgeStyle {
    return this.fastEdgeDescriptor.overviewStyle as IEdgeStyle
  }

  /**
   * Sets the overview label style.
   */
  set overviewLabelStyle(value: ILabelStyle) {
    this.fastLabelDescriptor.overviewStyle = this.fastLabelDescriptor.intermediateStyle = value
  }

  /**
   * Gets the overview label style.
   */
  get overviewLabelStyle(): ILabelStyle {
    return this.fastLabelDescriptor.overviewStyle as ILabelStyle
  }

  /**
   * Sets the overview port style.
   */
  set overviewPortStyle(value: IPortStyle) {
    this.fastPortDescriptor.overviewStyle = this.fastPortDescriptor.intermediateStyle = value
  }

  /**
   * Gets the overview port style.
   */
  get overviewPortStyle(): IPortStyle {
    return this.fastPortDescriptor.overviewStyle as IPortStyle
  }

  /**
   * Sets the threshold below which the rendering is switched from
   * default rendering to the optimized intermediate variant.
   */
  set intermediateZoomThreshold(value: number) {
    this._intermediateZoomThreshold = value
  }

  /**
   * Gets the threshold below which the rendering is switched from
   * default rendering to the optimized intermediate variant.
   */
  get intermediateZoomThreshold(): number {
    return this._intermediateZoomThreshold
  }

  /**
   * Sets the threshold below which the rendering is switched from
   * intermediate rendering to the overview variant.
   */
  set overviewZoomThreshold(value: number) {
    this._overviewZoomThreshold = value
  }

  /**
   * Gets the threshold below which the rendering is switched from
   * intermediate rendering to the overview variant.
   */
  get overviewZoomThreshold(): number {
    return this._overviewZoomThreshold
  }

  /**
   * Sets the factor by which the zoom factor has to change in order
   * to refresh the pre-rendered canvas image, if {@link
   * FastGraphModelManager#graphOptimizationMode} is set to
   * {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK} or
   * {@link OptimizationMode.DYNAMIC_CANVAS_WITH_ITEM_STYLES}.
   */
  set refreshImageZoomFactor(value: number) {
    this._refreshImageZoomFactor = value
  }

  /**
   * Gets the factor by which the zoom factor has to change in order
   * to refresh the pre-rendered canvas image, if {@link
   * FastGraphModelManager#graphOptimizationMode} is set to
   * {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK} or
   * {@link OptimizationMode.DYNAMIC_CANVAS_WITH_ITEM_STYLES}.
   */
  get refreshImageZoomFactor(): number {
    return this._refreshImageZoomFactor
  }

  /**
   * Sets the factor that is used to calculate the size of
   * the pre-rendered image, if {@link FastGraphModelManager.graphOptimizationMode}
   * is set to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}
   * or {@link OptimizationMode.DYNAMIC_CANVAS_WITH_ITEM_STYLES}.
   */
  set imageSizeFactor(value: number) {
    this._imageSizeFactor = value
  }

  /**
   * Gets the factor that is used to calculate the size of
   * the pre-rendered image, if {@link FastGraphModelManager.graphOptimizationMode}
   * is set to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}
   * or {@link OptimizationMode.DYNAMIC_CANVAS_WITH_ITEM_STYLES}.
   */
  get imageSizeFactor(): number {
    return this._imageSizeFactor
  }

  /**
   * Sets the maximum size of the canvas if
   * {@link FastGraphModelManager.graphOptimizationMode} is set to
   * {@link OptimizationMode.STATIC_CANVAS}. The
   * default is 3000, 2000.
   *
   * Graphs that exceed this size result in a scaled down, lower quality
   * graph rendering.
   *
   * Please note that setting this to a very high value may lead to browser freezes.
   */
  set maximumCanvasSize(value: Size) {
    this._maximumCanvasSize = value
  }

  /**
   * Gets the maximum size of the canvas if
   * {@link FastGraphModelManager.graphOptimizationMode} is set to
   * {@link OptimizationMode.STATIC_CANVAS}. The
   * default is 3000, 2000.
   *
   * Graphs that exceed this size result in a scaled down, lower quality
   * graph rendering.
   *
   * Please note that setting this to a very high value may lead to browser freezes.
   */
  get maximumCanvasSize(): Size {
    return this._maximumCanvasSize
  }

  /**
   * Sets the callback to draw a node, if {@link FastGraphModelManager.graphOptimizationMode}
   * is set to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}.
   *
   * The node must be drawn in the world coordinate system.
   *
   * If this callback is null, fallback code is used to draw the node.
   */
  set drawNodeCallback(
    value: ((node: INode, canvasContext: CanvasRenderingContext2D) => void) | null
  ) {
    this._drawNodeCallback = value
  }

  /**
   * Gets the callback to draw a node, if {@link FastGraphModelManager.graphOptimizationMode}
   * is set to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}.
   *
   * The node must be drawn in the world coordinate system.
   *
   * If this callback is null, fallback code is used to draw the node.
   */
  get drawNodeCallback(): ((node: INode, canvasContext: CanvasRenderingContext2D) => void) | null {
    return this._drawNodeCallback
  }

  /**
   * Sets the callback to draw an edge, if {@link FastGraphModelManager.graphOptimizationMode}
   * is set to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}.
   *
   * The edge must be drawn in the world coordinate system.
   *
   * If this callback is null, fallback code is used to draw the edge.
   */
  set drawEdgeCallback(
    value: ((edge: IEdge, canvasContext: CanvasRenderingContext2D) => void) | null
  ) {
    this._drawEdgeCallback = value
  }

  /**
   * Gets the callback to draw an edge, if {@link FastGraphModelManager.graphOptimizationMode}
   * is set to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}.
   *
   * The edge must be drawn in the world coordinate system.
   *
   * If this callback is null, fallback code is used to draw the edge.
   */
  get drawEdgeCallback(): ((edge: IEdge, canvasContext: CanvasRenderingContext2D) => void) | null {
    return this._drawEdgeCallback
  }

  /**
   * Sets the callback to draw a node label, if {@link FastGraphModelManager.graphOptimizationMode}
   * is set to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}.
   * The label must be drawn in the world coordinate system.
   */
  set drawNodeLabelCallback(
    value: ((label: ILabel, canvasContext: CanvasRenderingContext2D) => void) | null
  ) {
    this._drawNodeLabelCallback = value
  }

  /**
   * Gets the callback to draw a node label, if {@link FastGraphModelManager.graphOptimizationMode}
   * is set to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}.
   * The label must be drawn in the world coordinate system.
   */
  get drawNodeLabelCallback():
    | ((label: ILabel, canvasContext: CanvasRenderingContext2D) => void)
    | null {
    return this._drawNodeLabelCallback
  }

  /**
   * Sets the callback to draw an edge label, if {@link FastGraphModelManager.graphOptimizationMode}
   * is set to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}.
   * The label must be drawn in the world coordinate system.
   *
   * The callback is of type `function(ILabel, Object)`
   */
  set drawEdgeLabelCallback(
    value: ((label: ILabel, canvasContext: CanvasRenderingContext2D) => void) | null
  ) {
    this._drawEdgeLabelCallback = value
  }

  /**
   * Gets the callback to draw an edge label, if {@link FastGraphModelManager.graphOptimizationMode}
   * is set to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}.
   * The label must be drawn in the world coordinate system.
   *
   * The callback is of type `function(ILabel, Object)`
   */
  get drawEdgeLabelCallback():
    | ((label: ILabel, canvasContext: CanvasRenderingContext2D) => void)
    | null {
    return this._drawEdgeLabelCallback
  }

  /**
   * Sets whether or tno to re-create the graph visualization the next time the
   * {@link FastGraphModelManager.graphComponent} is rendered.
   * @see {@link CanvasComponent.invalidate}
   */
  set dirty(value: boolean) {
    this._dirty = value
  }

  /**
   * Gets whether or tno to re-create the graph visualization the next time the
   * {@link FastGraphModelManager.graphComponent} is rendered.
   * @see {@link CanvasComponent.invalidate}
   */
  get dirty(): boolean {
    return this._dirty
  }

  /**
   * Tells the descriptors whether an image is used or default rendering.
   * `true`, if the image renderer should be used to render the graph.
   * `false` if the default rendering code should be used.
   */
  updateShouldUseImage(): boolean {
    if (this.graphComponent == null) {
      return false
    }
    const optimizationMode = this.graphOptimizationMode
    const value =
      this.graphComponent.zoom <= this.intermediateZoomThreshold &&
      (optimizationMode === OptimizationMode.STATIC_CANVAS ||
        optimizationMode === OptimizationMode.SVG_IMAGE ||
        optimizationMode === OptimizationMode.DYNAMIC_CANVAS_WITH_ITEM_STYLES ||
        optimizationMode === OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK ||
        optimizationMode === OptimizationMode.WEBGL)

    this.fastNodeDescriptor.shouldUseImage = value
    this.fastEdgeDescriptor.shouldUseImage = value
    this.fastLabelDescriptor.shouldUseImage = value
    this.fastPortDescriptor.shouldUseImage = value

    return value
  }

  /**
   * Calls {@link updateEffectiveStyles}, {@link updateImageRenderer}, and {@link updateGraph} to
   * adjust the used styles and the rendering method (image or directly) based on the set
   * {@link graphOptimizationMode} and the current {@link GraphComponent.zoom zoom} level.
   */
  updateRendering() {
    this.updateEffectiveStyles()
    this.updateGraph()
    this.updateImageRenderer()
  }

  /**
   * Sets the styles to use on the descriptors depending on the current
   * graphOptimizationMode and the zoom level of the GraphComponent
   */
  updateEffectiveStyles() {
    this.fastNodeDescriptor.updateEffectiveStyle()
    this.fastEdgeDescriptor.updateEffectiveStyle()
    this.fastLabelDescriptor.updateEffectiveStyle()
    this.fastPortDescriptor.updateEffectiveStyle()
  }

  /**
   * Sets either an empty graph or {@link GraphComponent.graph this.graphComponent.graph}
   * as the graph to display in this instance.
   *
   * If {@link FastGraphModelManager.shouldUseImage} is true, an empty graph instance is assigned.
   *
   * This is an optimization to disable expensive graph traversal code if only a static image is
   * rendered.
   */
  updateGraph(): void {
    if (this.graphComponent == null) {
      return
    }
    const shouldUseImage = this.updateShouldUseImage()
    if (shouldUseImage && this.graph === this.graphComponent.graph) {
      this.graph = new DefaultGraph()
    } else if (!shouldUseImage && this.graph !== this.graphComponent.graph) {
      this.graph = this.graphComponent.graph
    }
  }

  /**
   * Installs the image renderer in the graphComponent if needed, or removes
   * it if not needed.
   */
  updateImageRenderer() {
    const imageRendererNeeded = this.updateShouldUseImage()
    if (imageRendererNeeded && this.imageRendererCanvasObject === null) {
      // add image renderer to graphComponent
      this.imageRendererCanvasObject = this.contentGroup.addChild(
        this.imageRenderer,
        ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
      )
    } else if (!imageRendererNeeded && this.imageRendererCanvasObject !== null) {
      // remove image renderer from graphComponent
      this.imageRendererCanvasObject.remove()
      this.imageRendererCanvasObject = null
    }
  }

  /**
   * Called when the {@link FastGraphModelManager.graphComponent}'s zoom factor changes.
   */
  onGraphComponentZoomChanged() {
    this.updateRendering()
  }

  /**
   * Called when the {@link FastGraphModelManager.graphComponent}'s graph instance changes.
   */
  onGraphComponentGraphChanged() {
    this.updateRendering()
  }
}

/**
 * The optimization used to render the graph.
 *
 * Generally, the optimization modes can be categorized in two groups:
 * {@link OptimizationMode.DEFAULT}, {@link OptimizationMode.STATIC} and {@link OptimizationMode.LEVEL_OF_DETAIL}
 * render each graph item separately using graph item styles. {@link OptimizationMode.SVG_IMAGE},
 * {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}, {@link OptimizationMode.DYNAMIC_CANVAS_WITH_ITEM_STYLES}
 * {@link OptimizationMode.STATIC_CANVAS}, and {@link OptimizationMode.WEBGL}  prepare a single canvas drawing that
 * either contains the complete graph, or the visible part of the graph. This static canvas image is rendered as a
 * whole, thus eliminating the need to render each item separately.
 *
 * Each optimization mode has different advantages and disadvantages. The concrete
 * use-cases for each option depend on various factors, like interaction, graph size
 * and visual complexity. Every optimization comes at a cost that makes this strategy
 * unsuitable for general use. Please read the descriptions of the separate optimization
 * modes for detailed information.
 * @readonly
 * @enum {number}
 */
export const OptimizationMode = {
  /**
   * Uses the default rendering code that delegates the rendering to the item styles.
   */
  DEFAULT: 0,

  /**
   * With this option, the graph visualization is created using the default rendering code.
   * However, subsequent updates are ignored. This makes panning very fast. However,
   * structural changes to the graph, e.g. moving nodes or changing item styles do not result
   * in an updated visualization, but are ignored.
   * This option is best suited for viewer only applications with not too big graphs
   * that rely on the actual item style.
   */
  STATIC: 1,

  /**
   * This option uses a level-of-detail approach to render graph items. In the overview level,
   * items are rendered with alternative styles. This can be used to assign simpler item styles
   * that improve the performance in overview level.
   *
   * With this approach, the rendering still makes use of virtualization, i.e. visualizations are
   * removed if the item leaves the viewport and re-created if it enters the viewport again.
   *
   * This approach can be applied for dynamic editor scenarios where the graph structure or
   * the item visualizations have to be changed often.
   * @see {@link FastGraphModelManager.overviewNodeStyle}
   * @see {@link FastGraphModelManager.overviewEdgeStyle}
   * @see {@link FastGraphModelManager.overviewLabelStyle}
   * @see {@link FastGraphModelManager.overviewPortStyle}
   */
  LEVEL_OF_DETAIL: 2,

  /**
   * This option creates a static SVG image of the graph at zoom level 1 and uses this image
   * instead of calling the render code of the actual item styles.
   *
   * In contrast to {@link OptimizationMode.STATIC}, this approach does not use virtualization,
   * i.e. the complete graph is part of the DOM at all times.
   *
   * This approach is best suited for static scenarios, e.g. viewer only applications with not too
   * big graphs.
   */
  SVG_IMAGE: 3,

  /**
   * This option creates a static image of the currently visible part of the graph, using HTML canvas.
   *
   * The size of the pre-rendered image can be specified relative to the viewport size
   * using {@link FastGraphModelManager.imageSizeFactor}.
   * The image is re-created for quality if the bounds of the image are reached through panning,
   * or if the zoom level changes by a factor greater than {@link FastGraphModelManager.refreshImageZoomFactor}.
   *
   * The items in the graph are drawn using {@link FastGraphModelManager.drawNodeCallback},
   * {@link FastGraphModelManager.drawEdgeCallback} etc.
   *
   * This option is suited for scenarios with a large graph where the zoom level changes frequently.
   * Since the items are drawn with a (simple) canvas paint callback, the visualization can
   * be created very quickly, while still remaining a high-quality image. However, the item visualizations
   * are simplified compared to the actual item styles. A short freeze can occur when the
   * image is re-created.
   * @see {@link FastGraphModelManager.imageSizeFactor}
   * @see {@link FastGraphModelManager.refreshImageZoomFactor}
   * @see {@link FastGraphModelManager.drawNodeCallback}
   * @see {@link FastGraphModelManager.drawEdgeCallback}
   * @see {@link FastGraphModelManager.drawNodeLabelCallback}
   * @see {@link FastGraphModelManager.drawEdgeLabelCallback}
   */
  DYNAMIC_CANVAS_WITH_DRAW_CALLBACK: 4,

  /**
   * This option creates a static image of the currently visible part of the graph, using HTML canvas.
   * The items are drawn using the item styles.
   *
   * The size of the pre-rendered image can be specified relative to the viewport size
   * using {@link FastGraphModelManager.imageSizeFactor}.
   * The image is re-created for better quality if the bounds of the image are reached through panning,
   * or if the zoom level changes by a factor greater than {@link FastGraphModelManager.refreshImageZoomFactor}.
   *
   * This option is suited for scenarios with a large graph where the zoom level changes frequently.
   * In contrast to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}, the actual item styles are used
   * to draw the graph. Based on the style, this can be quite expensive and thus can result in
   * worse image creation performance. Thus, the hiccups during zooming and panning can be longer.
   * @see {@link FastGraphModelManager.imageSizeFactor}
   * @see {@link FastGraphModelManager.refreshImageZoomFactor}
   * @see {@link FastGraphModelManager.drawNodeCallback}
   * @see {@link FastGraphModelManager.drawEdgeCallback}
   * @see {@link FastGraphModelManager.drawNodeLabelCallback}
   * @see {@link FastGraphModelManager.drawEdgeLabelCallback}
   */
  DYNAMIC_CANVAS_WITH_ITEM_STYLES: 5,

  /**
   * This option exports an HTML5 canvas image of the complete graph and draws it into the graphComponent.
   * The item styles are used to draw the image.
   * Since the image is not dynamically re-created if the zoom level changes, this option produces bad results
   * for higher zoom levels. It is only suitable for scenarios where the graph is drawn with very low zoom levels,
   * e.g. in a graph overview.
   */
  STATIC_CANVAS: 6,

  /**
   * This option draws the complete graph onto a WebGL canvas using predefined WebGL item styles.
   */
  WEBGL: 7
}

/**
 * An {@link ICanvasObjectDescriptor} implementation
 * that switches between default and optimized styles.
 */
class AutoSwitchDescriptor extends BaseClass(ICanvasObjectDescriptor) {
  // whether we are using an image for the rendering and should thus not normally be considered dirty
  shouldUseImage = false
  private effectiveStyle: INodeStyle | IEdgeStyle | ILabelStyle | IPortStyle | null = null
  private _intermediateStyle: INodeStyle | IEdgeStyle | ILabelStyle | IPortStyle | null = null
  private _overviewStyle: INodeStyle | IEdgeStyle | ILabelStyle | IPortStyle | null = null

  /**
   * Creates a new instance of AutoSwitchDescriptor.
   * @param backingInstance The ICanvasObjectDescriptor implementation
   * @param manager A reference to the FastGraphModelManager.
   */
  constructor(
    private readonly backingInstance: ICanvasObjectDescriptor,
    private readonly manager: FastGraphModelManager
  ) {
    super()
  }

  get intermediateStyle(): INodeStyle | IEdgeStyle | ILabelStyle | IPortStyle | null {
    return this._intermediateStyle
  }

  set intermediateStyle(value: INodeStyle | IEdgeStyle | ILabelStyle | IPortStyle | null) {
    this._intermediateStyle = value
    this.updateEffectiveStyle()
  }

  get overviewStyle(): INodeStyle | IEdgeStyle | ILabelStyle | IPortStyle | null {
    return this._overviewStyle
  }

  set overviewStyle(value: INodeStyle | IEdgeStyle | ILabelStyle | IPortStyle | null) {
    this._overviewStyle = value
    this.updateEffectiveStyle()
  }

  updateEffectiveStyle(): void {
    const manager = this.manager
    if (
      manager.graphOptimizationMode !== OptimizationMode.LEVEL_OF_DETAIL ||
      manager.graphComponent == null
    ) {
      this.effectiveStyle = null
    }
    // delegate rendering to overview styles
    else if (manager.graphComponent.zoom < manager.overviewZoomThreshold) {
      this.effectiveStyle = this._overviewStyle
    } else if (manager.graphComponent.zoom < manager.intermediateZoomThreshold) {
      this.effectiveStyle = this._intermediateStyle
    } else {
      this.effectiveStyle = null
    }
  }

  isDirty(context: ICanvasContext, canvasObject: ICanvasObject): boolean {
    return !this.shouldUseImage || this.backingInstance.isDirty(context, canvasObject)
  }

  getVisualCreator(item: IModelItem): IVisualCreator {
    const style = this.effectiveStyle || (item as any).style
    return style.renderer.getVisualCreator(item, style)
  }

  getBoundsProvider(item: IModelItem): IBoundsProvider {
    const style = this.effectiveStyle || (item as any).style
    return style.renderer.getBoundsProvider(item, style)
  }

  getVisibilityTestable(item: IModelItem): IVisibilityTestable {
    const style = this.effectiveStyle || (item as any).style
    return style.renderer.getVisibilityTestable(item, style)
  }

  getHitTestable(item: IModelItem): IHitTestable {
    const style = this.effectiveStyle || (item as any).style
    return style.renderer.getHitTestable(item, style)
  }
}

/**
 * Draws a pre-rendered image of the graph in canvas.
 */
class ImageGraphRenderer extends BaseClass(IVisualCreator, IBoundsProvider) {
  /**
   * Creates a new instance of ImageGraphRenderer.
   * @param outer The descriptor to be installed.
   */
  constructor(private readonly outer: FastGraphModelManager) {
    super()
  }

  /**
   * Gets the graphComponent's graph.
   */
  get graph(): IGraph {
    return this.outer.graphComponent!.graph
  }

  /**
   * Creates the new visual.
   * @param context The context to be used
   */
  createVisual(context: IRenderContext): Visual {
    this.outer.dirty = false
    let visual: Visual
    const optimizationMode = this.outer.graphOptimizationMode
    switch (optimizationMode) {
      case OptimizationMode.SVG_IMAGE:
        visual = this.createStaticSvgVisual()
        break
      case OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK:
        visual = this.createSimpleDynamicCanvasVisual()
        break
      case OptimizationMode.DYNAMIC_CANVAS_WITH_ITEM_STYLES:
        visual = this.createComplexDynamicCanvasVisual()
        break
      case OptimizationMode.STATIC_CANVAS:
        visual = this.createCompleteGraphCanvasVisual()
        break
      case OptimizationMode.WEBGL:
        visual = this.createCompleteGraphWebglVisual()
        break
      default:
        visual = this.createStaticSvgVisual()
        break
    }
    if (visual !== null) {
      ;(visual as any)['data-GraphOptimizationMode'] = optimizationMode
    }
    return visual
  }

  /**
   * Updates the current visual.
   * @param context The context to be used
   * @param oldVisual The last visual that was returned
   */
  updateVisual(context: IRenderContext, oldVisual: CanvasRenderVisual): Visual {
    const oldMode = (oldVisual as any)['data-GraphOptimizationMode']
    const optimizationMode = this.outer.graphOptimizationMode
    // check if visual needs to be re-created
    if (this.outer.dirty || oldVisual === null || optimizationMode !== oldMode) {
      return this.createVisual(context)
    }
    const canvasComponent = context.canvasComponent!
    if (
      optimizationMode === OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK &&
      (oldVisual as any).needsUpdate(
        context.zoom,
        canvasComponent.viewport,
        canvasComponent.contentRect
      )
    ) {
      // update simple dynamic canvas if necessary
      this.updateSimpleDynamicCanvasVisual(oldVisual)
      return oldVisual
    }
    if (
      optimizationMode === OptimizationMode.DYNAMIC_CANVAS_WITH_ITEM_STYLES &&
      (oldVisual as any).needsUpdate(
        context.zoom,
        canvasComponent.viewport,
        canvasComponent.contentRect
      )
    ) {
      // update complex dynamic canvas if necessary
      this.updateComplexDynamicCanvasVisual(oldVisual)
      return oldVisual
    }
    return oldVisual
  }

  /**
   * Custom bounds calculation for image object.
   * This is necessary because the default bounds calculation is
   * disabled by assigning an empty graph.
   * @see Specified by {@link IBoundsProvider.getBounds}.
   */
  getBounds(context: ICanvasContext): Rect {
    const graph = this.graph
    if (graph !== null) {
      let bounds: Rect = Rect.EMPTY
      graph.nodes.forEach((node) => {
        bounds = Rect.add(
          bounds,
          node.style.renderer.getBoundsProvider(node, node.style).getBounds(context)
        )
      })
      graph.edges.forEach((edge) => {
        bounds = Rect.add(
          bounds,
          edge.style.renderer.getBoundsProvider(edge, edge.style).getBounds(context)
        )
      })
      graph.nodeLabels.forEach((label) => {
        bounds = Rect.add(
          bounds,
          label.style.renderer.getBoundsProvider(label, label.style).getBounds(context)
        )
      })
      graph.edgeLabels.forEach((label) => {
        bounds = Rect.add(
          bounds,
          label.style.renderer.getBoundsProvider(label, label.style).getBounds(context)
        )
      })
      graph.ports.forEach((port) => {
        bounds = Rect.add(
          bounds,
          port.style.renderer.getBoundsProvider(port, port.style).getBounds(context)
        )
      })
      return bounds
    }
    return Rect.EMPTY
  }

  /**
   * Creates a visual that renders a static SVG image of the graph.
   */
  createStaticSvgVisual(): Visual {
    const contentRect = this.outer.graphComponent!.contentRect
    const scale = this.getSuitableScale(this.outer.graphComponent!.contentRect)
    const svg = this.exportRectToSvg(contentRect, scale)
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    new Matrix(1 / scale, 0, 0, 1 / scale, contentRect.x, contentRect.y).applyTo(g)
    g.appendChild(svg)
    return new SvgVisual(g)
  }

  /**
   * Creates a visual that renders the currently visible part of the graph into a canvas
   * using draw callbacks.
   */
  createSimpleDynamicCanvasVisual(): Visual {
    const visual = new CanvasRenderVisual(
      this.outer.refreshImageZoomFactor,
      this.outer.graphComponent!.zoom,
      this.outer.maximumCanvasSize
    )
    this.drawSimpleCanvasImage(visual)
    return visual
  }

  /**
   * Updates the visual with the current viewport.
   */
  updateSimpleDynamicCanvasVisual(visual: CanvasRenderVisual): void {
    this.drawSimpleCanvasImage(visual)
  }

  /**
   * Creates a Visual that renders the currently visible part of the graph into a canvas
   * using the actual item styles.
   */
  createComplexDynamicCanvasVisual(): CanvasRenderVisual {
    const graphComponent = this.outer.graphComponent!
    const visual = new CanvasRenderVisual(
      this.outer.refreshImageZoomFactor,
      graphComponent.zoom,
      this.outer.maximumCanvasSize
    )
    this.drawComplexCanvasImage(
      (
        image: HTMLCanvasElement | HTMLImageElement,
        targetWidth: number,
        targetHeight: number,
        exportRect: Rect
      ) => {
        visual.update(image, targetWidth, targetHeight, exportRect, graphComponent.zoom)
        graphComponent.invalidate()
      }
    )
    return visual
  }

  /**
   * Updates the visual with the current viewport.
   * @param oldVisual The last visual that was returned.
   */
  updateComplexDynamicCanvasVisual(oldVisual: CanvasRenderVisual): void {
    const graphComponent = this.outer.graphComponent!
    this.drawComplexCanvasImage(
      (
        image: HTMLCanvasElement | HTMLImageElement,
        viewWidth: number,
        viewHeight: number,
        exportRect: Rect
      ) => {
        oldVisual.update(image, viewWidth, viewHeight, exportRect, graphComponent.zoom)
        graphComponent.invalidate()
      }
    )
  }

  /**
   * Creates a canvas image containing the complete graph.
   */
  createCompleteGraphCanvasVisual(): Visual {
    const graphComponent = this.outer.graphComponent!
    const zoom = graphComponent.zoom
    const exportRect = graphComponent.contentRect

    const scale = this.getSuitableScale(graphComponent.contentRect)
    const svgElement = this.exportRectToSvg(exportRect, scale)
    const dataUrl = SvgExport.encodeSvgDataUrl(SvgExport.exportSvgString(svgElement))

    const targetCanvasWidth = exportRect.width * scale
    const targetCanvasHeight = exportRect.height * scale

    const image = new Image()
    image.src = dataUrl
    image.width = targetCanvasWidth
    image.height = targetCanvasHeight

    const visual = new CanvasRenderVisual(0, zoom, this.outer.maximumCanvasSize)

    image.addEventListener('load', () => {
      visual.update(image, targetCanvasWidth, targetCanvasHeight, exportRect, graphComponent.zoom)
      graphComponent.invalidate()
    })

    return visual
  }

  createCompleteGraphWebglVisual(): GLVisual {
    return new GLVisual(this.outer.graphComponent!.graph)
  }

  /**
   * Draws the graph into a canvas and updates the given visual with the newly created canvas.
   * @param visual The given visual
   */
  drawSimpleCanvasImage(visual: CanvasRenderVisual): void {
    const graphComponent = this.outer.graphComponent!
    const viewport = graphComponent.viewport
    const zoom = graphComponent.zoom
    const factor = this.outer.imageSizeFactor
    const contentRect = graphComponent.contentRect

    // calculate the area to export in world coordinates
    let exportRect: Rect = new Rect(
      viewport.x - (factor - 1) * 0.5 * viewport.width,
      viewport.y - (factor - 1) * 0.5 * viewport.height,
      viewport.width * factor,
      viewport.height * factor
    )

    // export intersection of desired exportRect and contentRect
    exportRect = new Rect(
      new Point(Math.max(exportRect.x, contentRect.x), Math.max(exportRect.y, contentRect.y)),
      new Point(
        Math.min(exportRect.bottomRight.x, contentRect.bottomRight.x),
        Math.min(exportRect.bottomRight.y, contentRect.bottomRight.y)
      )
    )

    // calculate the size of the target image in view coordinates
    const targetWidth = exportRect.width * zoom
    const targetHeight = exportRect.height * zoom

    // calculate the scale to draw the graph in world coordinates into the target image
    const scaleX = targetWidth / exportRect.width
    const scaleY = targetHeight / exportRect.height
    let scale: number = Math.min(scaleX, scaleY)
    if (scale <= 0 || Number.isNaN(scale)) {
      scale = 1
    }

    // create the canvas element
    const canvas = window.document.createElement('canvas')

    // set the canvas size to the target size
    canvas.width = targetWidth
    canvas.height = targetHeight

    const canvasContext = canvas.getContext('2d')!
    canvasContext.save()

    // set the scale and translate so we can draw in the world coordinate system
    canvasContext.scale(scale, scale)
    canvasContext.translate(-exportRect.x, -exportRect.y)

    // draw the graph items in world coordinates
    this.graph.edges.forEach((edge) => {
      this.drawEdge(edge, canvasContext)
    })

    this.graph.nodes.forEach((node) => {
      this.drawNode(node, canvasContext)
    })

    this.graph.nodeLabels.forEach((label) => {
      this.drawNodeLabel(label, canvasContext)
    })

    this.graph.edgeLabels.forEach((label) => {
      this.drawEdgeLabel(label, canvasContext)
    })

    canvasContext.restore()

    visual.update(canvas, targetWidth, targetHeight, exportRect, zoom)
  }

  /**
   * Draws a node using the given context.
   * @param node The node to be drawn
   * @param canvasContext The given canvas context
   */
  drawNode(node: INode, canvasContext: CanvasRenderingContext2D): void {
    if (this.outer.drawNodeCallback !== null) {
      this.outer.drawNodeCallback(node, canvasContext)
    } else {
      canvasContext.fillStyle = '#aaaaaa'
      const layout = node.layout
      canvasContext.fillRect(layout.x, layout.y, layout.width, layout.height)
    }
  }

  /**
   * Draws an edge using the given context.
   * @param edge The edge to be drawn
   * @param canvasContext The given canvas context
   */
  drawEdge(edge: IEdge, canvasContext: CanvasRenderingContext2D): void {
    if (this.outer.drawEdgeCallback !== null) {
      this.outer.drawEdgeCallback(edge, canvasContext)
    } else {
      canvasContext.strokeStyle = '#000000'
      const sourcePort = edge.sourcePort!
      const targetPort = edge.targetPort!
      const sourceLocation = sourcePort.locationParameter.model.getLocation(
        sourcePort,
        sourcePort.locationParameter
      )
      const targetLocation = targetPort.locationParameter.model.getLocation(
        targetPort,
        targetPort.locationParameter
      )
      canvasContext.beginPath()
      canvasContext.moveTo(sourceLocation.x, sourceLocation.y)
      edge.bends.forEach((bend) => {
        canvasContext.lineTo(bend.location.x, bend.location.y)
      })
      canvasContext.lineTo(targetLocation.x, targetLocation.y)
      canvasContext.stroke()
    }
  }

  /**
   * Draws a node label using the given context.
   * @param label The node label to be drawn
   * @param canvasContext The given canvas context
   */
  drawNodeLabel(label: ILabel, canvasContext: CanvasRenderingContext2D): void {
    if (this.outer.drawNodeLabelCallback !== null) {
      this.outer.drawNodeLabelCallback(label, canvasContext)
    }
  }

  /**
   * Draws an edge label using the given context.
   * @param label The edge label to be drawn
   * @param canvasContext The given canvas context
   */
  drawEdgeLabel(label: ILabel, canvasContext: CanvasRenderingContext2D): void {
    if (this.outer.drawEdgeLabelCallback !== null) {
      this.outer.drawEdgeLabelCallback(label, canvasContext)
    }
  }

  /**
   * Draws the graph into an image using the item styles. Calls the given callback if finished.
   * @param callback The callback to call if the image has
   *   finished rendering.
   */
  drawComplexCanvasImage(
    callback: (
      image: HTMLCanvasElement | HTMLImageElement,
      targetWidth: number,
      targetHeight: number,
      exportRect: Rect
    ) => void
  ) {
    const graphComponent = this.outer.graphComponent!
    const viewport = graphComponent.viewport
    const zoom = graphComponent.zoom
    const factor = this.outer.imageSizeFactor
    const contentRect = graphComponent.contentRect

    // calculate the area to export in world coordinates
    let exportRect: Rect = new Rect(
      viewport.x - (factor - 1) * 0.5 * viewport.width,
      viewport.y - (factor - 1) * 0.5 * viewport.height,
      viewport.width * factor,
      viewport.height * factor
    )

    // export intersection of desired exportRect and contentRect
    exportRect = new Rect(
      new Point(Math.max(exportRect.x, contentRect.x), Math.max(exportRect.y, contentRect.y)),
      new Point(
        Math.min(exportRect.bottomRight.x, contentRect.bottomRight.x),
        Math.min(exportRect.bottomRight.y, contentRect.bottomRight.y)
      )
    )

    // calculate the size of the target image in view coordinates
    const targetWidth = exportRect.width * zoom
    const targetHeight = exportRect.height * zoom

    // calculate the scale to draw the graph in world coordinates into the target image
    const scaleX = targetWidth / exportRect.width
    const scaleY = targetHeight / exportRect.height
    let scale: number = Math.min(scaleX, scaleY)

    if (scale <= 0 || Number.isNaN(scale)) {
      scale = 1
    }

    // export the graph to svg
    const svgElement = this.exportRectToSvg(exportRect, scale)
    const dataUrl = SvgExport.encodeSvgDataUrl(SvgExport.exportSvgString(svgElement))

    const image = new Image()
    image.src = dataUrl
    image.width = targetWidth
    image.height = targetHeight

    // invoke the callback if the image is loaded
    image.addEventListener('load', () => {
      callback(image, targetWidth, targetHeight, exportRect)
    })
  }

  /**
   * Exports the given area of the graphComponent into an SVG element with the given scale factor.
   * @param exportRect The area to be exported
   * @param scale The given scale factor
   */
  exportRectToSvg(exportRect: Rect, scale: number): Element {
    const exportComponent = new GraphComponent()
    exportComponent.graph = this.graph
    const exporter = new SvgExport(exportRect, scale)
    return exporter.exportSvg(exportComponent)
  }

  /**
   * Calculates a suitable scale for the given area, respecting {@link FastGraphModelManager.maximumCanvasSize}.
   * @param exportRect The area to be exported
   * @see {@link ImageGraphRenderer.exportRectToSvg}
   */
  getSuitableScale(exportRect: Rect): number {
    const maxSize = this.outer.maximumCanvasSize

    const scaleX = exportRect.width > maxSize.width ? maxSize.width / exportRect.width : 1
    const scaleY = exportRect.height > maxSize.height ? maxSize.height / exportRect.height : 1

    let scale: number = Math.min(scaleX, scaleY)
    if (scale <= 0 || Number.isNaN(scale)) {
      scale = 1
    }
    return scale
  }
}

/**
 * A render visual that draws a given canvas element in canvas.
 */
class CanvasRenderVisual extends HtmlCanvasVisual {
  private initialArea: Rect = new Rect(new Point(0, 0), new Size(0, 0))
  private readonly canvas: HTMLCanvasElement

  /**
   * Creates a new CanvasRenderVisual instance.
   * @param refreshImageZoomFactor The factor by which the zoom factor has to change
   * @param initialZoom The initial zoom factor
   * @param maxCanvasSize The maximum canvas size
   */
  constructor(
    private readonly refreshImageZoomFactor: number,
    private initialZoom: number,
    private readonly maxCanvasSize: Size
  ) {
    super()
    this.canvas = document.createElement('canvas')
  }

  /**
   * Paints onto the context using HTML5 Canvas operations.
   * @param context The context to paint on
   * @param htmlCanvasContext The given HtmlCanvasContext
   */
  paint(context: IRenderContext, htmlCanvasContext: CanvasRenderingContext2D): void {
    htmlCanvasContext.drawImage(
      this.canvas,
      this.initialArea.topLeft.x,
      this.initialArea.topLeft.y,
      this.initialArea.width,
      this.initialArea.height
    )
  }

  /**
   * Returns whether the visual needs an update because the zoom level or the viewport has
   * changed beyond the thresholds defined in {@link FastGraphModelManager.refreshImageZoomFactor}
   * and {@link FastGraphModelManager.imageSizeFactor}.
   * @param zoom The current zoom level.
   * @param viewport The current viewport.
   * @param contentRect The current graphComponent's content rectangle.
   */
  needsUpdate(zoom: number, viewport: Rect, contentRect: Rect): boolean {
    if (
      zoom / this.initialZoom < this.refreshImageZoomFactor ||
      this.initialZoom / zoom < this.refreshImageZoomFactor
    ) {
      return true
    }
    const x = Math.max(viewport.x, contentRect.x)
    const y = Math.max(viewport.y, contentRect.y)
    const brx = Math.min(viewport.bottomRight.x, contentRect.bottomRight.x)
    const bry = Math.min(viewport.bottomRight.y, contentRect.bottomRight.y)
    return (
      x < this.initialArea.x ||
      y < this.initialArea.y ||
      brx > this.initialArea.bottomRight.x ||
      bry > this.initialArea.bottomRight.y
    )
  }

  /**
   * Updates the visual with the new image data.
   * @param image The image or canvas to render in this visual.
   * @param targetCanvasWidth The width of the canvas to render.
   * @param targetCanvasHeight The height of the canvas to render
   * @param initialArea The area in world coordinates the image should be rendered in.
   * @param initialZoom The zoom value at the time of creation.
   */
  update(
    image: HTMLCanvasElement | HTMLImageElement,
    targetCanvasWidth: number,
    targetCanvasHeight: number,
    initialArea: Rect,
    initialZoom: number
  ): void {
    // cast width and height to int because canvas.width and canvas.height do not support floating point numbers
    const w = Math.min(this.maxCanvasSize.width, targetCanvasWidth) | 0
    const h = Math.min(this.maxCanvasSize.height, targetCanvasHeight) | 0
    this.initialArea = initialArea
    this.initialZoom = initialZoom
    const canvasContext = this.canvas.getContext('2d')!
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w
      this.canvas.height = h
    } else {
      canvasContext.clearRect(0, 0, w, h)
    }
    canvasContext.drawImage(image, 0, 0, w, h)
  }
}

/**
 * A render visual that draws a given graph in a canvas using WebGL item styles.
 */
class GLVisual extends WebGLVisual {
  private readonly edgeStyle: WebGLPolylineEdgeStyle = new WebGLPolylineEdgeStyle({
    thickness: 5
  })
  private readonly nodeStyle: WebGLShapeNodeStyle = new WebGLShapeNodeStyle({
    color: '#FF6C00'
  })
  private visuals: WebGLVisual[] | null = null

  /**
   * Creates a new GLVisual.
   * @param graph The graph to render.
   */
  constructor(private readonly graph: IGraph) {
    super()
  }

  /**
   * Paints onto the context using WebGL item styles.
   * @param ctx The context to paint on
   * @param gl The given WebGLRenderingContext
   */
  render(ctx: IRenderContext, gl: WebGLRenderingContext): void {
    if (!this.visuals) {
      this.visuals = []
      this.graph.edges.forEach((edge) => {
        this.visuals!.push(
          this.edgeStyle.renderer
            .getVisualCreator(edge, this.edgeStyle)
            .createVisual(ctx) as WebGLVisual
        )
      })
      this.graph.nodes.forEach((node) => {
        this.visuals!.push(
          this.nodeStyle.renderer
            .getVisualCreator(node, this.nodeStyle)
            .createVisual(ctx) as WebGLVisual
        )
      })
    }
    this.visuals.forEach((visual) => {
      visual.render(ctx, gl)
    })
  }
}

/**
 * A custom lookup chain link for fast hit testing.
 * The {@link IHitTester} implementations returned by this link ignore the actual rendering order
 * and simply iterate over the corresponding model items in the graph of the link's graph component.
 */
class HitTestInputChainLink extends BaseClass(IContextLookupChainLink) {
  private next: IContextLookup | null = null

  /**
   * Constructs a new instance of HitTestInputChainLink.
   * @param graphComponent The graph component whose elements will be enumerated.
   */
  constructor(private readonly graphComponent: GraphComponent) {
    super()
  }

  /**
   * Retrieves an implementation of the given type for a given item.
   * @param item The item to lookup for
   * @param type The type to lookup for
   * @returns the implementation found
   */
  contextLookup(item: object, type: Class<any>): object | null {
    const graph = this.graphComponent.graph
    if (type === IHitTester.$class) {
      return new MyHitTestEnumerator(graph)
    }
    if (type === INodeHitTester.$class) {
      return new MyNodeHitTestEnumerator(graph)
    }
    if (type === IEdgeHitTester.$class) {
      return new MyEdgeHitTestEnumerator(graph)
    }
    if (type === ILabelHitTester.$class) {
      return new MyLabelHitTestEnumerator(graph)
    }
    if (type === IPortHitTester.$class) {
      return new MyPortHitTestEnumerator(graph)
    }
    if (type === ILabelOwnerHitTester.$class) {
      return new MyLabelOwnerHitTestEnumerator(graph)
    }

    if (this.next) {
      return this.next.contextLookup(item, type)
    }

    return null
  }

  /**
   * Called to register the fallback lookup implementation that should be used.
   * @param next The context to use as a fallback
   */
  setNext(next: IContextLookup): void {
    this.next = next
  }
}

/**
 * Enumerates all graph elements of a given graph for hit testing.
 */
class MyHitTestEnumerator extends BaseClass(IHitTester) {
  /**
   * Initializes a new instance of {@link MyHitTestEnumerator}.
   * @param graph The graph whose elements will be enumerated.
   */
  constructor(private readonly graph: IGraph) {
    super()
  }

  /**
   * Enumerates the hits for the given location.
   * @param context The context to perform the hit
   * @param location The location in world coordinates
   */
  enumerateHits(context: IInputModeContext, location: Point): IEnumerable<IModelItem> {
    const hits = new List<IModelItem>()
    this.graph.nodeLabels.forEach((label) => {
      if (label.style.renderer.getHitTestable(label, label.style).isHit(context, location)) {
        hits.add(label)
      }
    })
    this.graph.edgeLabels.forEach((label) => {
      if (label.style.renderer.getHitTestable(label, label.style).isHit(context, location)) {
        hits.add(label)
      }
    })
    this.graph.edges.forEach((edge) => {
      if (edge.style.renderer.getHitTestable(edge, edge.style).isHit(context, location)) {
        hits.add(edge)
      }
    })
    this.graph.nodes.forEach((node) => {
      if (node.style.renderer.getHitTestable(node, node.style).isHit(context, location)) {
        hits.add(node)
      }
    })
    return hits
  }
}

/**
 * Enumerates all nodes of a given graph for hit testing.
 */
class MyNodeHitTestEnumerator extends BaseClass<INodeHitTester>(INodeHitTester) {
  /**
   * Initializes a new instance of {@link MyNodeHitTestEnumerator}.
   * @param graph The graph whose nodes will be enumerated.
   */
  constructor(private readonly graph: IGraph) {
    super()
  }

  /**
   * Enumerates the hits for the given location.
   * @param context The context to perform the hit
   * @param location The location in world coordinates
   */
  enumerateHits(context: IInputModeContext, location: Point): IEnumerable<INode> {
    const hits = new List<INode>()
    this.graph.nodes.forEach((node) => {
      if (node.style.renderer.getHitTestable(node, node.style).isHit(context, location)) {
        hits.add(node)
      }
    })
    return hits
  }
}

/**
 * Enumerates all edges of a given graph for hit testing.
 */
class MyEdgeHitTestEnumerator extends BaseClass(IEdgeHitTester) {
  /**
   * Initializes a new instance of {@link MyEdgeHitTestEnumerator}.
   * @param graph The graph whose edges will be enumerated.
   */
  constructor(private readonly graph: IGraph) {
    super()
  }

  /**
   * Enumerates the hits for the given location.
   * @param context The context to perform the hit
   * @param location The location in world coordinates
   */
  enumerateHits(context: IInputModeContext, location: Point): IEnumerable<IEdge> {
    const hits = new List<IEdge>()
    this.graph.edges.forEach((edge) => {
      if (edge.style.renderer.getHitTestable(edge, edge.style).isHit(context, location)) {
        hits.add(edge)
      }
    })
    return hits
  }
}

/**
 * Enumerates all labels of a given graph for hit testing.
 */
class MyLabelHitTestEnumerator extends BaseClass<ILabelHitTester>(ILabelHitTester) {
  /**
   * Initializes a new instance of {@link MyLabelHitTestEnumerator}.
   * @param graph The graph whose labels will be enumerated.
   */
  constructor(private readonly graph: IGraph) {
    super()
  }

  /**
   * Enumerates the hits for the given location.
   * @param context The context to perform the hit
   * @param location The location in world coordinates
   */
  enumerateHits(context: IInputModeContext, location: Point): IEnumerable<ILabel> {
    const hits = new List<ILabel>()
    this.graph.edgeLabels.forEach((label) => {
      if (label.style.renderer.getHitTestable(label, label.style).isHit(context, location)) {
        hits.add(label)
      }
    })
    this.graph.nodeLabels.forEach((label) => {
      if (label.style.renderer.getHitTestable(label, label.style).isHit(context, location)) {
        hits.add(label)
      }
    })
    return hits
  }
}

/**
 * Enumerates all ports of a given graph for hit testing.
 */
class MyPortHitTestEnumerator extends BaseClass(IPortHitTester) {
  /**
   * Initializes a new instance of {@link MyPortHitTestEnumerator}.
   * @param graph The graph whose ports will be enumerated.
   */
  constructor(private readonly graph: IGraph) {
    super()
  }

  /**
   * Enumerates the hits for the given location.
   * @param context The context to perform the hit
   * @param location The location in world coordinates
   */
  enumerateHits(context: IInputModeContext, location: Point): IEnumerable<IPort> {
    const hits = new List<IPort>()
    this.graph.ports.forEach((port) => {
      if (port.style.renderer.getHitTestable(port, port.style).isHit(context, location)) {
        hits.add(port)
      }
    })
    return hits
  }
}

/**
 * Enumerates all nodes and edges of a given graph for hit testing.
 */
class MyLabelOwnerHitTestEnumerator extends BaseClass(ILabelOwnerHitTester) {
  /**
   * Initializes a new instance of {@link MyLabelOwnerHitTestEnumerator}.
   * @param graph The graph whose nodes and edges will be enumerated.
   */
  constructor(private readonly graph: IGraph) {
    super()
  }

  /**
   * Enumerates the hits for the given location.
   * @param context The context to perform the hit
   * @param location The location in world coordinates
   */
  enumerateHits(context: IInputModeContext, location: Point): IEnumerable<ILabelOwner> {
    const hits = new List<ILabelOwner>()
    this.graph.edges.forEach((edge) => {
      if (edge.style.renderer.getHitTestable(edge, edge.style).isHit(context, location)) {
        hits.add(edge)
      }
    })
    this.graph.nodes.forEach((node) => {
      if (node.style.renderer.getHitTestable(node, node.style).isHit(context, location)) {
        hits.add(node)
      }
    })
    return hits
  }
}
