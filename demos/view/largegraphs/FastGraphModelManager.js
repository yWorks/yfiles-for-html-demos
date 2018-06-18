/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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

define(['yfiles/view-editor', './SimpleSvgNodeStyle.js', './SvgEdgeStyle.js'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  SimpleSvgNodeStyle,
  SvgEdgeStyle
) => {
  /**
   * A {@link yfiles.view.GraphModelManager} implementation that uses several optimizations
   * to improve the rendering performance for large graphs.
   *
   * This class can be used in other applications to improve the user experience.
   *
   * The performance gain that can be achieved depends mainly on the configuration of
   * this class. Not all options are suited for all types of graphs and item styles. The
   * main optimization strategy can be configured using the
   * {@link FastGraphModelManager#graphOptimizationMode} property. This determines how the graph is rendered
   * when zoomed out below the threshold defined in {@link FastGraphModelManager#intermediateZoomThreshold}. For
   * zoom levels above the threshold, this implementation falls back to default rendering.
   * Most graph item styles show good performance in scenarios where only a few elements
   * are rendered, which is the case for high zoom levels. The graph items outside the
   * {@link yfiles.view.CanvasComponent#viewport viewport} are not rendered at all due to a
   * feature called 'virtualization'. Thus, the optimization strategy only has to be
   * applied when the graph is zoomed out.
   *
   * <ul>
   * <li>{@link OptimizationMode.DEFAULT} uses the default rendering that would also be
   * used by the default {@link yfiles.view.GraphModelManager}.</li>
   * <li>{@link OptimizationMode.STATIC} creates the graph visualization using the default
   * code. However, subsequent updates are ignored.</li>
   * <li>{@link OptimizationMode.LEVEL_OF_DETAIL} uses the graph item styles set in
   * {@link FastGraphModelManager#overviewNodeStyle}, {@link FastGraphModelManager#overviewEdgeStyle},
   * {@link FastGraphModelManager#overviewLabelStyle} and {@link FastGraphModelManager#overviewPortStyle}</li> to render the graph.
   * <li>{@link OptimizationMode.SVG_IMAGE} exports the complete graph to a static SVG image,
   * which is displayed instead of the default visualizations.</li>
   * <li>{@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK} uses
   * {@link FastGraphModelManager#drawNodeCallback callbacks} to draw the currently visible part of the graph
   * into a canvas. When the bounds of the pre-rendered image are left, or the zoom level changes
   * above a certain factor, the image is re-created. Use {@link FastGraphModelManager#imageSizeFactor} and
   * {@link FastGraphModelManager#refreshImageZoomFactor} to configure the size of the pre-rendered image and the
   * factor by which the zoom has to change to trigger re-creation of the image.</li>
   * <li>{@link OptimizationMode.DYNAMIC_CANVAS_WITH_ITEM_STYLES} draws the currently visible part
   * of the graph into a canvas using the original item styles. When the bounds of the pre-rendered
   * image are left, or the zoom level changes above a certain factor, the image is re-created.
   * Use {@link FastGraphModelManager#imageSizeFactor} and {@link FastGraphModelManager#refreshImageZoomFactor} to configure the size
   * of the pre-rendered image and the factor by which the zoom has to change to trigger re-creation
   * of the image.</li>
   * <li>{@link OptimizationMode.STATIC_CANVAS} creates a static image of the complete graph in a
   * canvas which is scaled based on the zoom level.</li>
   * <li>{@link OptimizationMode.WEBGL} renders a static image of the complete graph in a WebGL canvas.</li>
   * </ul>
   * @see {@link OptimizationMode}
   * @extends yfiles.view.GraphModelManager
   */
  class FastGraphModelManager extends yfiles.view.GraphModelManager {
    /**
     * Creates a new instance of this class.
     * @param {yfiles.view.CanvasComponent} canvas The {@link yfiles.view.CanvasComponent} that uses this instance.
     * @param {yfiles.view.ICanvasObjectGroup} contentGroup The content group in which to render the graph items.
     */
    constructor(canvas, contentGroup) {
      super(canvas, contentGroup)
      this.initFastGraphModelManager()
      if (!(canvas instanceof yfiles.view.GraphComponent)) {
        throw new yfiles.lang.Exception('Canvas must be a GraphComponent')
      }
      this.$graphComponent = canvas
      this.$contentGroup = contentGroup

      // set the graph for the component view
      this.graph = this.$graphComponent.graph

      // create the custom descriptors for graph items
      this.fastNodeDescriptor = new AutoSwitchDescriptor(
        yfiles.view.GraphModelManager.DEFAULT_NODE_DESCRIPTOR,
        this
      )
      this.fastEdgeDescriptor = new AutoSwitchDescriptor(
        yfiles.view.GraphModelManager.DEFAULT_EDGE_DESCRIPTOR,
        this
      )
      this.fastLabelDescriptor = new AutoSwitchDescriptor(
        yfiles.view.GraphModelManager.DEFAULT_LABEL_DESCRIPTOR,
        this
      )
      this.fastPortDescriptor = new AutoSwitchDescriptor(
        yfiles.view.GraphModelManager.DEFAULT_PORT_DESCRIPTOR,
        this
      )

      this.nodeDescriptor = this.fastNodeDescriptor
      this.edgeDescriptor = this.fastEdgeDescriptor
      this.nodeLabelDescriptor = this.fastLabelDescriptor
      this.edgeLabelDescriptor = this.fastLabelDescriptor
      this.portDescriptor = this.fastPortDescriptor

      // initialize the intermediate and overview styles with default values
      if (FastGraphModelManager.hasWebGLSupport()) {
        this.overviewNodeStyle = new yfiles.styles.WebGLShapeNodeStyle()
        this.overviewEdgeStyle = new yfiles.styles.WebGLPolylineEdgeStyle()
      } else {
        this.overviewNodeStyle = new SimpleSvgNodeStyle()
        this.overviewEdgeStyle = new SvgEdgeStyle()
      }
      // there is an intermediate level visualization for nodes and edges
      this.intermediateNodeStyle = new SimpleSvgNodeStyle()
      this.intermediateEdgeStyle = new SvgEdgeStyle()
      // we don't render ports and labels in other levels than the default level
      this.overviewLabelStyle = yfiles.styles.VoidLabelStyle.INSTANCE
      this.overviewPortStyle = yfiles.styles.VoidPortStyle.INSTANCE

      // set default values
      this.$intermediateZoomThreshold = 1
      this.$overviewZoomThreshold = 0.1
      this.$refreshImageZoomFactor = 0.5
      this.$imageSizeFactor = 2
      this.$maximumCanvasSize = new yfiles.geometry.Size(3000, 2000)

      this.$dirty = false
      this.$drawNodeCallback = null
      this.$drawEdgeCallback = null
      this.$drawNodeLabelCallback = null
      this.$drawEdgeLabelCallback = null

      // create the image renderer
      this.$imageRendererCanvasObject = null
      this.imageRenderer = new ImageGraphRenderer(this)
      if (this.$graphComponent.graph !== null) {
        // install the image renderer, if necessary
        this.updateImageRenderer()
      }

      // register to graphComponent events that could trigger a visualization change
      this.$graphComponent.addZoomChangedListener(this.onGraphComponentZoomChanged.bind(this))
      this.$graphComponent.addGraphChangedListener(this.onGraphComponentGraphChanged.bind(this))

      // add a chain link to the graphComponent's lookup that customizes item hit test
      this.initializeCustomHitTest()
    }

    /**
     * Gets the optimization mode used to render the graph
     * if the zoom level is below {@link FastGraphModelManager#zoomThreshold}.
     * @type {OptimizationMode}
     */
    set graphOptimizationMode(value) {
      this.$graphOptimizationMode = value
      this.updateEffectiveStyles()
      this.updateShouldUseImage()
      this.updateImageRenderer()
      this.updateGraph()
    }

    /**
     * Sets the optimization mode used to render the graph
     * if the zoom level is below {@link FastGraphModelManager#zoomThreshold}.
     * @type {OptimizationMode}
     */
    get graphOptimizationMode() {
      return this.$graphOptimizationMode
    }

    /**
     * Gets the GraphComponent.
     * @return {yfiles.view.GraphComponent}
     */
    get graphComponent() {
      return this.$graphComponent
    }

    /**
     * Sets the canvas object for image rendering.
     * @type {ImageGraphRenderer} value
     */
    set imageRendererCanvasObject(value) {
      this.$imageRendererCanvasObject = value
    }

    /**
     * Gets the canvas object for image rendering.
     * @type {ImageGraphRenderer} value
     */
    get imageRendererCanvasObject() {
      return this.$imageRendererCanvasObject
    }

    /**
     * Sets the intermediate node style.
     * @param {yfiles.styles.INodeStyle} value
     */
    set intermediateNodeStyle(value) {
      this.fastNodeDescriptor.intermediateStyle = value
    }

    /**
     * Gets the intermediate node style.
     * @type {yfiles.styles.INodeStyle}
     */
    get intermediateNodeStyle() {
      return this.fastNodeDescriptor.intermediateStyle
    }

    /**
     * Sets the intermediate edge style.
     * @param {yfiles.styles.IEdgeStyle} value
     */
    set intermediateEdgeStyle(value) {
      this.fastEdgeDescriptor.intermediateStyle = value
    }

    /**
     * Gets the intermediate edge style.
     * @type {yfiles.styles.IEdgeStyle}
     */
    get intermediateEdgeStyle() {
      return this.fastEdgeDescriptor.intermediateStyle
    }

    /**
     * Sets the overview node style.
     * @param {yfiles.styles.INodeStyle} value
     */
    set overviewNodeStyle(value) {
      this.fastNodeDescriptor.overviewStyle = value
    }

    /**
     * Gets the overview node style.
     * @type {yfiles.styles.INodeStyle}
     */
    get overviewNodeStyle() {
      return this.fastNodeDescriptor.overviewStyle
    }

    /**
     * Sets the overview edge styl.
     * @param {yfiles.styles.IEdgeStyle} value
     */
    set overviewEdgeStyle(value) {
      this.fastEdgeDescriptor.overviewStyle = value
    }

    /**
     * Gets the overview edge style.
     * @type {yfiles.styles.IEdgeStyle}
     */
    get overviewEdgeStyle() {
      return this.fastEdgeDescriptor.overviewStyle
    }

    /**
     * Sets the overview label style.
     * @param {yfiles.styles.ILabelStyle} value
     */
    set overviewLabelStyle(value) {
      this.fastLabelDescriptor.overviewStyle = this.fastLabelDescriptor.intermediateStyle = value
    }

    /**
     * Gets the overview label styl.
     * @type {yfiles.styles.ILabelStyle}
     */
    get overviewLabelStyle() {
      return this.fastLabelDescriptor.overviewStyle
    }

    /**
     * Sets the overview port style.
     * @param {yfiles.styles.IPortStyle} value
     */
    set overviewPortStyle(value) {
      this.fastPortDescriptor.overviewStyle = this.fastPortDescriptor.intermediateStyle = value
    }

    /**
     * Gets the overview port style.
     * @type {yfiles.styles.IPortStyle}
     */
    get overviewPortStyle() {
      return this.fastPortDescriptor.overviewStyle
    }

    /**
     * Sets the threshold below which the rendering is switched from
     * default rendering to the optimized intermediate variant.
     * @type {number}
     */
    set intermediateZoomThreshold(value) {
      this.$intermediateZoomThreshold = value
    }

    /**
     * Gets the threshold below which the rendering is switched from
     * default rendering to the optimized intermediate variant.
     * @type {number}
     */
    get intermediateZoomThreshold() {
      return this.$intermediateZoomThreshold
    }

    /**
     * Sets the threshold below which the rendering is switched from
     * intermediate rendering to the overview variant.
     * @type {number}
     */
    set overviewZoomThreshold(value) {
      this.$overviewZoomThreshold = value
    }

    /**
     * Gets the threshold below which the rendering is switched from
     * intermediate rendering to the overview variant.
     * @type {number}
     */
    get overviewZoomThreshold() {
      return this.$overviewZoomThreshold
    }

    /**
     * Sets the factor by which the zoom factor has to change in order
     * to refresh the pre-rendered canvas image, if {@link FastGraphModelManager#graphOptimizationMode}
     * is set to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}
     * or {@link OptimizationMode.DYNAMIC_CANVAS_WITH_ITEM_STYLES}.
     * @type {number}
     */
    set refreshImageZoomFactor(value) {
      this.$refreshImageZoomFactor = value
    }

    /**
     * Gets the factor by which the zoom factor has to change in order
     * to refresh the pre-rendered canvas image, if {@link FastGraphModelManager#graphOptimizationMode}
     * is set to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}
     * or {@link OptimizationMode.DYNAMIC_CANVAS_WITH_ITEM_STYLES}.
     * @type {number}
     */
    get refreshImageZoomFactor() {
      return this.$refreshImageZoomFactor
    }

    /**
     * Sets the factor that is used to calculate the size of
     * the pre-rendered image, if {@link FastGraphModelManager#graphOptimizationMode}
     * is set to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}
     * or {@link OptimizationMode.DYNAMIC_CANVAS_WITH_ITEM_STYLES}.
     * @type {number}
     */
    set imageSizeFactor(value) {
      this.$imageSizeFactor = value
    }

    /**
     * Gets the factor that is used to calculate the size of
     * the pre-rendered image, if {@link FastGraphModelManager#graphOptimizationMode}
     * is set to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}
     * or {@link OptimizationMode.DYNAMIC_CANVAS_WITH_ITEM_STYLES}.
     * @type {number}
     */
    get imageSizeFactor() {
      return this.$imageSizeFactor
    }

    /**
     * Sets the maximum size of the canvas if
     * {@link FastGraphModelManager#graphOptimizationMode} is set to
     * {@link OptimizationMode.STATIC_CANVAS}. The
     * default is 3000, 2000.
     *
     * Graphs that exceed this size result in a scaled down, lower quality
     * graph rendering.
     *
     * Please note that setting this to a very high value may lead to browser freezes.
     * @type {yfiles.geometry.Size}
     */
    set maximumCanvasSize(value) {
      this.$maximumCanvasSize = value
    }

    /**
     * Gets the maximum size of the canvas if
     * {@link FastGraphModelManager#graphOptimizationMode} is set to
     * {@link OptimizationMode.STATIC_CANVAS}. The
     * default is 3000, 2000.
     *
     * Graphs that exceed this size result in a scaled down, lower quality
     * graph rendering.
     *
     * Please note that setting this to a very high value may lead to browser freezes.
     * @type {yfiles.geometry.Size}
     */
    get maximumCanvasSize() {
      return this.$maximumCanvasSize
    }

    /**
     * Sets the callback to draw a node, if {@link FastGraphModelManager#graphOptimizationMode}
     * is set to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}.
     *
     * The node must be drawn in the world coordinate system.
     *
     * If this callback is null, fallback code is used to draw the node.
     * @type {function}
     */
    set drawNodeCallback(value) {
      this.$drawNodeCallback = value
    }

    /**
     * Gets the callback to draw a node, if {@link FastGraphModelManager#graphOptimizationMode}
     * is set to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}.
     *
     * The node must be drawn in the world coordinate system.
     *
     * If this callback is null, fallback code is used to draw the node.
     * @type {function}
     */
    get drawNodeCallback() {
      return this.$drawNodeCallback
    }

    /**
     * Sets the callback to draw an edge, if {@link FastGraphModelManager#graphOptimizationMode}
     * is set to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}.
     *
     * The edge must be drawn in the world coordinate system.
     *
     * If this callback is null, fallback code is used to draw the edge.
     * @type {function}
     */
    set drawEdgeCallback(value) {
      this.$drawEdgeCallback = value
    }

    /**
     * Gets the callback to draw an edge, if {@link FastGraphModelManager#graphOptimizationMode}
     * is set to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}.
     *
     * The edge must be drawn in the world coordinate system.
     *
     * If this callback is null, fallback code is used to draw the edge.
     * @type {function}
     */
    get drawEdgeCallback() {
      return this.$drawEdgeCallback
    }

    /**
     * Sets the callback to draw a node label, if {@link FastGraphModelManager#graphOptimizationMode}
     * is set to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}.
     * The label must be drawn in the world coordinate system.
     * @type {function}
     */
    set drawNodeLabelCallback(value) {
      this.$drawNodeLabelCallback = value
    }

    /**
     * Gets the callback to draw a node label, if {@link FastGraphModelManager#graphOptimizationMode}
     * is set to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}.
     * The label must be drawn in the world coordinate system.
     * @type {function}
     */
    get drawNodeLabelCallback() {
      return this.$drawNodeLabelCallback
    }

    /**
     * Sets the callback to draw an edge label, if {@link FastGraphModelManager#graphOptimizationMode}
     * is set to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}.
     * The label must be drawn in the world coordinate system.
     * @type {function(yfiles.graph.ILabel, Object)}
     */
    set drawEdgeLabelCallback(value) {
      this.$drawEdgeLabelCallback = value
    }

    /**
     * Gets the callback to draw an edge label, if {@link FastGraphModelManager#graphOptimizationMode}
     * is set to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}.
     * The label must be drawn in the world coordinate system.
     * @type {function(yfiles.graph.ILabel, Object)}
     */
    get drawEdgeLabelCallback() {
      return this.$drawEdgeLabelCallback
    }

    /**
     * Sets wheter or tno to re-create the graph visualization the next time the
     * {@link FastGraphModelManager#graphComponent} is rendered.
     * @see {@link yfiles.view.CanvasComponent#invalidate}
     * @type {boolean}
     */
    set dirty(value) {
      this.$dirty = value
    }

    /**
     * Gets wheter or tno to re-create the graph visualization the next time the
     * {@link FastGraphModelManager#graphComponent} is rendered.
     * @see {@link yfiles.view.CanvasComponent#invalidate}
     * @type {boolean}
     */
    get dirty() {
      return this.$dirty
    }

    /**
     * Tells the descriptors whether an image is used or default rendering.
     * true, if the image renderer should be used to render the graph.
     * False if the default rendering code should be used.
     */
    updateShouldUseImage() {
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
     * Sets either an empty graph or {@link yfiles.view.GraphComponent#graph this.graphComponent.graph}
     * as the  to display in this instance.
     *
     * If {@link FastGraphModelManager#shouldUseImage} is true, an empty graph instance is assigned.
     *
     * This is an optimization to disable expensive graph traversal code if only a static image is rendered.
     */
    updateGraph() {
      const shouldUseImage = this.updateShouldUseImage()
      if (shouldUseImage && this.graph === this.graphComponent.graph) {
        this.graph = new yfiles.graph.DefaultGraph()
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
        this.imageRendererCanvasObject = this.$contentGroup.addChild(
          this.imageRenderer,
          yfiles.view.ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
        )
      } else if (!imageRendererNeeded && this.imageRendererCanvasObject !== null) {
        // remove image renderer from graphComponent
        this.imageRendererCanvasObject.remove()
        this.imageRendererCanvasObject = null
      }
    }

    /**
     * Called when the {@link FastGraphModelManager#graphComponent}'s zoom factor changes.
     * @param {object} sender
     * @param {yfiles.lang.EventArgs} args
     */
    onGraphComponentZoomChanged() {
      this.updateImageRenderer()
      this.updateShouldUseImage()
      this.updateEffectiveStyles()
      this.updateGraph()
    }

    /**
     * Called when the {@link FastGraphModelManager#graphComponent}'s graph instance changes.
     * @param {object} sender
     * @param {yfiles.collections.ItemEventArgs.<yfiles.graph.IGraph>} args
     */
    onGraphComponentGraphChanged() {
      this.updateImageRenderer()
    }

    /**
     * Decorates the lookup chain of the {@link FastGraphModelManager#graphComponent}s
     * {@link yfiles.view.CanvasComponent#inputModeContextLookupChain}
     * with a chain link that provides {@link yfiles.input.IHitTester}s for
     * the graph items.
     * This is needed to make hit test work when an empty graph is
     * assigned to this instance for optimization.
     */
    initializeCustomHitTest() {
      this.graphComponent.inputModeContextLookupChain.add(
        new HitTestInputChainLink(this.graphComponent)
      )
    }

    initFastGraphModelManager() {
      this.$graphOptimizationMode = OptimizationMode.DEFAULT
    }

    /**
     * Whether the current browser supports WebGL rendering.
     * @returns {boolean}
     */
    static hasWebGLSupport() {
      const canvas = document.createElement('canvas')
      return !!canvas.getContext('webgl') || !!canvas.getContext('experimental-webgl')
    }
  }

  /**
   * The optimization used to render the graph.
   *
   * Generally, the optimization modes can be categorized in two groups:
   * {@link OptimizationMode.DEFAULT}, {@link OptimizationMode.STATIC} and {@link OptimizationMode.LEVEL_OF_DETAIL}
   * render each graph item separately using graph item styles. {@link OptimizationMode.SVG_IMAGE},
   * {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}, {@link OptimizationMode.DYNAMIC_CANVAS_WITH_ITEM_STYLES}
   * {@link OptimizationMode.STATIC_CANVAS}, and {@link OptimizationMode.WEBGL}  prepare a single canvas drawing that either contains the
   * complete graph, or the visible part of the graph. This static canvas image is rendered
   * as a whole, thus eliminating the need to render each item separately.
   *
   * Each optimization mode has different advantages and disadvantages. The concrete
   * use-cases for each option depend on various factors, like interaction, graph size
   * and visual complexity. Every optimization comes at a cost that makes this strategy
   * unsuitable for general use. Please read the descriptions of the separate optimization
   * modes for detailed information.
   * @readonly
   * @enum {number}
   */
  const OptimizationMode = {
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
     * @see {@link FastGraphModelManager#overviewNodeStyle}
     * @see {@link FastGraphModelManager#overviewEdgeStyle}
     * @see {@link FastGraphModelManager#overviewLabelStyle}
     * @see {@link FastGraphModelManager#overviewPortStyle}
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
     * using {@link FastGraphModelManager#imageSizeFactor}.
     * The image is re-created for quality if the bounds of the image are reached through panning,
     * or if the zoom level changes by a factor greater than {@link FastGraphModelManager#refreshImageZoomFactor}.
     *
     * The items in the graph are drawn using {@link FastGraphModelManager#drawNodeCallback},
     * {@link FastGraphModelManager#drawEdgeCallback} etc.
     *
     * This option is suited for scenarios with a large graph where the zoom level changes frequently.
     * Since the items are drawn with a (simple) canvas paint callback, the visualization can
     * be created very quickly, while still remaining a high-quality image. However, the item visualizations
     * are simplified compared to the actual item styles. A short freeze can occur when the
     * image is re-created.
     * @see {@link FastGraphModelManager#imageSizeFactor}
     * @see {@link FastGraphModelManager#refreshImageZoomFactor}
     * @see {@link FastGraphModelManager#drawNodeCallback}
     * @see {@link FastGraphModelManager#drawEdgeCallback}
     * @see {@link FastGraphModelManager#drawNodeLabelCallback}
     * @see {@link FastGraphModelManager#drawEdgeLabelCallback}
     */
    DYNAMIC_CANVAS_WITH_DRAW_CALLBACK: 4,

    /**
     * This option creates a static image of the currently visible part of the graph, using HTML canvas.
     * The items are drawn using the item styles.
     *
     * The size of the pre-rendered image can be specified relative to the viewport size
     * using {@link FastGraphModelManager#imageSizeFactor}.
     * The image is re-created for better quality if the bounds of the image are reached through panning,
     * or if the zoom level changes by a factor greater than {@link FastGraphModelManager#refreshImageZoomFactor}.
     *
     * This option is suited for scenarios with a large graph where the zoom level changes frequently.
     * In contrast to {@link OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK}, the actual item styles are used
     * to draw the graph. Based on the style, this can be quite expensive and thus can result in
     * worse image creation performance. Thus, the hiccups during zooming and panning can be longer.
     * @see {@link FastGraphModelManager#imageSizeFactor}
     * @see {@link FastGraphModelManager#refreshImageZoomFactor}
     * @see {@link FastGraphModelManager#drawNodeCallback}
     * @see {@link FastGraphModelManager#drawEdgeCallback}
     * @see {@link FastGraphModelManager#drawNodeLabelCallback}
     * @see {@link FastGraphModelManager#drawEdgeLabelCallback}
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
   * An {@link yfiles.view.ICanvasObjectDescriptor} implementation
   * that switches between default and optimized styles.
   * @implements {yfiles.view.ICanvasObjectDescriptor}
   */
  class AutoSwitchDescriptor extends yfiles.lang.Class(yfiles.view.ICanvasObjectDescriptor) {
    /**
     * Creates a new instance of AutoSwitchDescriptor.
     * @param {yfiles.view.ICanvasObjectDescriptor} backingInstance The ICanvasObjectDescriptor implementation
     * @param {FastGraphModelManager} manager A reference to the FastGraphModelManager.
     */
    constructor(backingInstance, manager) {
      super()
      this.backingInstance = backingInstance
      this.manager = manager
      // whether we are using an image for the rendering and should thus not normally be considered dirty
      this.shouldUseImage = false
      this.effectiveStyle = null
    }

    get intermediateStyle() {
      return this.$intermediateStyle
    }

    set intermediateStyle(value) {
      this.$intermediateStyle = value
      this.updateEffectiveStyle()
    }

    get overviewStyle() {
      return this.$overviewStyle
    }

    set overviewStyle(value) {
      this.$overviewStyle = value
      this.updateEffectiveStyle()
    }

    updateEffectiveStyle() {
      const manager = this.manager
      if (manager.graphOptimizationMode === OptimizationMode.LEVEL_OF_DETAIL) {
        // delegate rendering to overview styles
        if (manager.graphComponent.zoom < manager.overviewZoomThreshold) {
          this.effectiveStyle = this.$overviewStyle
        } else if (manager.graphComponent.zoom < manager.intermediateZoomThreshold) {
          this.effectiveStyle = this.$intermediateStyle
        } else {
          this.effectiveStyle = null
        }
      } else {
        this.effectiveStyle = null
      }
    }

    /**
     * @param {yfiles.view.ICanvasContext} context
     * @param {yfiles.view.ICanvasObject} canvasObject
     * @return {boolean}
     */
    isDirty(context, canvasObject) {
      return !this.shouldUseImage || this.backingInstance.isDirty(context, canvasObject)
    }

    /**
     * @param {yfiles.graph.IModelItem} item
     * @return {yfiles.view.IVisualCreator}
     */
    getVisualCreator(item) {
      const style = this.effectiveStyle || item.style
      return style.renderer.getVisualCreator(item, style)
    }

    /**
     * @param {yfiles.graph.IModelItem} item
     * @return {yfiles.view.IBoundsProvider}
     */
    getBoundsProvider(item) {
      const style = this.effectiveStyle || item.style
      return style.renderer.getBoundsProvider(item, style)
    }

    /**
     * @param {yfiles.graph.IModelItem} item
     * @return {yfiles.view.IVisibilityTestable}
     */
    getVisibilityTestable(item) {
      const style = this.effectiveStyle || item.style
      return style.renderer.getVisibilityTestable(item, style)
    }

    /**
     * @param {yfiles.graph.IModelItem} item
     * @return {yfiles.input.IHitTestable}
     */
    getHitTestable(item) {
      const style = this.effectiveStyle || item.style
      return style.renderer.getHitTestable(item, style)
    }
  }

  /**
   * Draws a pre-rendered image of the graph in canvas.
   * @implements {yfiles.view.IVisualCreator}
   * @implements {yfiles.view.IBoundsProvider}
   */
  class ImageGraphRenderer extends yfiles.lang.Class(
    yfiles.view.IVisualCreator,
    yfiles.view.IBoundsProvider
  ) {
    /**
     * Creates a new instance of ImageGraphRenderer.
     * @param {FastGraphModelManager} outer The descriptor to be installed.
     */
    constructor(outer) {
      super()
      this.outer = outer
    }

    /**
     * Gets the graphComponent's graph.
     * @type {yfiles.graph.IGraph}
     */
    get graph() {
      return this.outer.graphComponent.graph
    }

    /**
     * Creates the new visual.
     * @param {yfiles.view.IRenderContext} context The context to be used
     * @return {yfiles.view.Visual}
     */
    createVisual(context) {
      this.outer.dirty = false
      let /** yfiles.view.Visual */ visual = null
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
        visual['data-GraphOptimizationMode'] = optimizationMode
      }
      return visual
    }

    /**
     * Updates the current visual.
     * @param {yfiles.view.IRenderContext} context The context to be used
     * @param {yfiles.view.Visual} oldVisual The last visual that was returned
     * @return {yfiles.view.Visual}
     */
    updateVisual(context, oldVisual) {
      const oldMode = oldVisual['data-GraphOptimizationMode']
      const optimizationMode = this.outer.graphOptimizationMode
      // check if visual needs to be re-created
      if (this.outer.dirty || oldVisual === null || optimizationMode !== oldMode) {
        return this.createVisual(context)
      }
      if (
        optimizationMode === OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK &&
        oldVisual.needsUpdate(
          context.zoom,
          context.canvasComponent.viewport,
          context.canvasComponent.contentRect
        )
      ) {
        // update simple dynamic canvas if necessary
        this.updateSimpleDynamicCanvasVisual(oldVisual)
        return oldVisual
      }
      if (
        optimizationMode === OptimizationMode.DYNAMIC_CANVAS_WITH_ITEM_STYLES &&
        oldVisual.needsUpdate(
          context.zoom,
          context.canvasComponent.viewport,
          context.canvasComponent.contentRect
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
     * @see Specified by {@link yfiles.view.IBoundsProvider#getBounds}.
     * @param {yfiles.view.ICanvasContext} context
     * @return {yfiles.geometry.Rect}
     */
    getBounds(context) {
      const graph = this.graph
      if (graph !== null) {
        let bounds = yfiles.geometry.Rect.EMPTY
        graph.nodes.forEach(node => {
          bounds = yfiles.geometry.Rect.add(
            bounds,
            node.style.renderer.getBoundsProvider(node, node.style).getBounds(context)
          )
        })
        graph.edges.forEach(edge => {
          bounds = yfiles.geometry.Rect.add(
            bounds,
            edge.style.renderer.getBoundsProvider(edge, edge.style).getBounds(context)
          )
        })
        graph.nodeLabels.forEach(label => {
          bounds = yfiles.geometry.Rect.add(
            bounds,
            label.style.renderer.getBoundsProvider(label, label.style).getBounds(context)
          )
        })
        graph.edgeLabels.forEach(label => {
          bounds = yfiles.geometry.Rect.add(
            bounds,
            label.style.renderer.getBoundsProvider(label, label.style).getBounds(context)
          )
        })
        graph.ports.forEach(port => {
          bounds = yfiles.geometry.Rect.add(
            bounds,
            port.style.renderer.getBoundsProvider(port, port.style).getBounds(context)
          )
        })
        return bounds
      }
      return yfiles.geometry.Rect.EMPTY
    }

    /**
     * Creates a visual that renders a static SVG image of the graph.
     * @return {yfiles.view.Visual}
     */
    createStaticSvgVisual() {
      const contentRect = this.outer.graphComponent.contentRect
      const scale = this.getSuitableScale(this.outer.graphComponent.contentRect)
      const svg = this.exportRectToSvg(contentRect, scale)
      const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
      new yfiles.geometry.Matrix(1 / scale, 0, 0, 1 / scale, contentRect.x, contentRect.y).applyTo(
        g
      )
      g.appendChild(svg)
      return new yfiles.view.SvgVisual(g)
    }

    /**
     * Creates a visual that renders the currently visible part of the graph into a canvas
     * using draw callbacks.
     * @return {yfiles.view.Visual}
     */
    createSimpleDynamicCanvasVisual() {
      const visual = new CanvasRenderVisual(
        this.outer.refreshImageZoomFactor,
        this.outer.graphComponent.zoom,
        this.outer.maximumCanvasSize
      )
      this.drawSimpleCanvasImage(visual)
      return visual
    }

    /**
     * Updates the visual with the current viewport.
     * @param {yfiles.view.Visual} visual
     */
    updateSimpleDynamicCanvasVisual(visual) {
      this.drawSimpleCanvasImage(visual)
    }

    /**
     * Creates a Visual that renders the currently visible part of the graph into a canvas
     * using the actual item styles.
     * @return {CanvasRenderVisual}
     */
    createComplexDynamicCanvasVisual() {
      const visual = new CanvasRenderVisual(
        this.outer.refreshImageZoomFactor,
        this.outer.graphComponent.zoom,
        this.outer.maximumCanvasSize
      )
      this.drawComplexCanvasImage((image, targetWidth, targetHeight, exportRect) => {
        visual.update(image, targetWidth, targetHeight, exportRect, this.outer.graphComponent.zoom)
        this.outer.graphComponent.invalidate()
      })
      return visual
    }

    /**
     * Updates the visual with the current viewport.
     * @param {yfiles.view.Visual} oldVisual The last visual that was returned.
     */
    updateComplexDynamicCanvasVisual(oldVisual) {
      this.drawComplexCanvasImage((image, viewWidth, viewHeight, exportRect) => {
        oldVisual.update(image, viewWidth, viewHeight, exportRect, this.outer.graphComponent.zoom)
        this.outer.graphComponent.invalidate()
      })
    }

    /**
     * Creates a canvas image containing the complete graph.
     * @return {yfiles.view.Visual}
     */
    createCompleteGraphCanvasVisual() {
      const graphComponent = this.outer.graphComponent
      const zoom = graphComponent.zoom
      const exportRect = graphComponent.contentRect

      const scale = this.getSuitableScale(graphComponent.contentRect)
      const svgElement = this.exportRectToSvg(exportRect, scale)
      const dataUrl = yfiles.view.SvgExport.encodeSvgDataUrl(
        yfiles.view.SvgExport.exportSvgString(svgElement)
      )

      const targetCanvasWidth = exportRect.width * scale
      const targetCanvasHeight = exportRect.height * scale

      const image = new Image()
      image.src = dataUrl
      image.width = targetCanvasWidth
      image.height = targetCanvasHeight

      const visual = new CanvasRenderVisual(0, zoom, this.outer.maximumCanvasSize)

      image.addEventListener('load', () => {
        visual.update(image, targetCanvasWidth, targetCanvasHeight, exportRect, graphComponent.zoom)
        this.outer.graphComponent.invalidate()
      })

      return visual
    }

    createCompleteGraphWebglVisual() {
      return new GLVisual(this.outer.graphComponent.graph)
    }

    /**
     * Draws the graph into a canvas and updates the given visual with the newly created canvas.
     * @param {CanvasRenderVisual} visual The given visual
     */
    drawSimpleCanvasImage(visual) {
      const graphComponent = this.outer.graphComponent
      const viewport = graphComponent.viewport
      const zoom = graphComponent.zoom
      const factor = this.outer.imageSizeFactor
      const contentRect = graphComponent.contentRect

      // calculate the area to export in world coordinates
      let exportRect = new yfiles.geometry.Rect(
        viewport.x - (factor - 1) * 0.5 * viewport.width,
        viewport.y - (factor - 1) * 0.5 * viewport.height,
        viewport.width * factor,
        viewport.height * factor
      )

      // export intersection of desired exportRect and contentRect
      exportRect = new yfiles.geometry.Rect(
        new yfiles.geometry.Point(
          Math.max(exportRect.x, contentRect.x),
          Math.max(exportRect.y, contentRect.y)
        ),
        new yfiles.geometry.Point(
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
      const scale = Math.min(scaleX, scaleY)

      // create the canvas element
      const canvas = window.document.createElement('canvas')

      // set the canvas size to the target size
      canvas.width = targetWidth
      canvas.height = targetHeight

      const canvasContext = canvas.getContext('2d')
      canvasContext.save()

      // set the scale and translate so we can draw in the world coordinate system
      canvasContext.scale(scale, scale)
      canvasContext.translate(-exportRect.x, -exportRect.y)

      // draw the graph items in world coordinates
      this.graph.edges.forEach(edge => {
        this.drawEdge(edge, canvasContext)
      })

      this.graph.nodes.forEach(node => {
        this.drawNode(node, canvasContext)
      })

      this.graph.nodeLabels.forEach(label => {
        this.drawNodeLabel(label, canvasContext)
      })

      this.graph.edgeLabels.forEach(label => {
        this.drawEdgeLabel(label, canvasContext)
      })

      canvasContext.restore()

      visual.update(canvas, targetWidth, targetHeight, exportRect, zoom)
    }

    /**
     * Draws a node using the given context.
     * @param {yfiles.graph.INode} node The node to be drawn
     * @param {CanvasRenderingContext2D} canvasContext The given canvas context
     */
    drawNode(node, canvasContext) {
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
     * @param {yfiles.graph.IEdge} edge The edge to be drawn
     * @param {CanvasRenderingContext2D} canvasContext The given canvas context
     */
    drawEdge(edge, canvasContext) {
      if (this.outer.drawEdgeCallback !== null) {
        this.outer.drawEdgeCallback(edge, canvasContext)
      } else {
        canvasContext.strokeStyle = '#000000'
        const sourceLocation = edge.sourcePort.locationParameter.model.getLocation(
          edge.sourcePort,
          edge.sourcePort.locationParameter
        )
        const targetLocation = edge.targetPort.locationParameter.model.getLocation(
          edge.targetPort,
          edge.targetPort.locationParameter
        )
        canvasContext.beginPath()
        canvasContext.moveTo(sourceLocation.x, sourceLocation.y)
        edge.bends.forEach(bend => {
          canvasContext.lineTo(bend.location.x, bend.location.y)
        })
        canvasContext.lineTo(targetLocation.x, targetLocation.y)
        canvasContext.stroke()
      }
    }

    /**
     * Draws a node label using the given context.
     * @param {yfiles.graph.ILabel} label The node label to be drawn
     * @param {yfiles.view.ICanvasContext} canvasContext The given canvas context
     */
    drawNodeLabel(label, canvasContext) {
      if (this.outer.drawNodeLabelCallback !== null) {
        this.outer.drawNodeLabelCallback(label, canvasContext)
      }
    }

    /**
     * Draws an edge label using the given context.
     * @param {yfiles.graph.ILabel} label The edge label to be drawn
     * @param {yfiles.view.ICanvasContext} canvasContext The given canvas context
     */
    drawEdgeLabel(label, canvasContext) {
      if (this.outer.drawEdgeLabelCallback !== null) {
        this.outer.drawEdgeLabelCallback(label, canvasContext)
      }
    }

    /**
     * Draws the graph into an image using the item styles. Calls the given callback if finished.
     * @param {function(Image, number, number, yfiles.geometry.Rect)} callback The callback to call if the image has finished rendering.
     */
    drawComplexCanvasImage(callback) {
      const graphComponent = this.outer.graphComponent
      const viewport = graphComponent.viewport
      const zoom = graphComponent.zoom
      const factor = this.outer.imageSizeFactor
      const contentRect = graphComponent.contentRect

      // calculate the area to export in world coordinates
      let exportRect = new yfiles.geometry.Rect(
        viewport.x - (factor - 1) * 0.5 * viewport.width,
        viewport.y - (factor - 1) * 0.5 * viewport.height,
        viewport.width * factor,
        viewport.height * factor
      )

      // export intersection of desired exportRect and contentRect
      exportRect = new yfiles.geometry.Rect(
        new yfiles.geometry.Point(
          Math.max(exportRect.x, contentRect.x),
          Math.max(exportRect.y, contentRect.y)
        ),
        new yfiles.geometry.Point(
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
      const scale = Math.min(scaleX, scaleY)

      // export the graph to svg
      const svgElement = this.exportRectToSvg(exportRect, scale)
      const dataUrl = yfiles.view.SvgExport.encodeSvgDataUrl(
        yfiles.view.SvgExport.exportSvgString(svgElement)
      )

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
     * @param {yfiles.geometry.Rect} exportRect The area to be exported
     * @param {number} scale The given scale factor
     * @return {Element}
     */
    exportRectToSvg(exportRect, scale) {
      const exportComponent = new yfiles.view.GraphComponent()
      exportComponent.graph = this.graph
      const exporter = new yfiles.view.SvgExport(exportRect, scale)
      return exporter.exportSvg(exportComponent)
    }

    /**
     * Calculates a suitable scale for the given area, respecting {@link FastGraphModelManager#maximumCanvasSize}.
     * @param {yfiles.geometry.Rect} exportRect The area to be exported
     * @see {@link ImageGraphRenderer#exportRectToSvg}
     * @return {number}
     */
    getSuitableScale(exportRect) {
      const maxSize = this.outer.maximumCanvasSize

      const scaleX = exportRect.width > maxSize.width ? maxSize.width / exportRect.width : 1
      const scaleY = exportRect.height > maxSize.height ? maxSize.height / exportRect.height : 1

      return Math.min(scaleX, scaleY)
    }
  }

  /**
   * A render visual that draws a given canvas element in canvas.
   * @extends yfiles.view.HtmlCanvasVisual
   */
  class CanvasRenderVisual extends yfiles.view.HtmlCanvasVisual {
    /**
     * Creates a new CanvasRenderVisual instance.
     * @param {number} refreshImageZoomFactor The factor by which the zoom factor has to change
     * @param {number} initialZoom The initial zoom factor
     * @param {yfiles.geometry.Size} maxCanvasSize The maximum canvas size
     */
    constructor(refreshImageZoomFactor, initialZoom, maxCanvasSize) {
      super()
      this.$initialArea = new yfiles.geometry.Rect(
        new yfiles.geometry.Point(0, 0),
        new yfiles.geometry.Size(0, 0)
      )
      this.canvas = window.document.createElement('canvas')
      this.refreshImageZoomFactor = refreshImageZoomFactor
      this.initialZoom = initialZoom
      this.maxCanvasSize = maxCanvasSize
    }

    /**
     * Sets the initial rectangular area.
     * @type {yfiles.geometry.Rect}
     */
    set initialArea(value) {
      this.$initialArea = value
    }

    /**
     * Gets the initial rectangular area.
     * @type {yfiles.geometry.Rect}
     */
    get initialArea() {
      return this.$initialArea
    }

    /**
     * Paints onto the context using HTML5 Canvas operations.
     * @param {yfiles.view.IRenderContext} context The context to paint on
     * @param {CanvasRenderingContext2D} htmlCanvasContext The given HtmlCanvasContext
     */
    paint(context, htmlCanvasContext) {
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
     * changed beyond the thresholds defined in {@link FastGraphModelManager#refreshImageZoomFactor}
     * and {@link FastGraphModelManager#imageSizeFactor}.
     * @param {number} zoom The current zoom level.
     * @param {yfiles.geometry.Rect} viewport The current viewport.
     * @param {yfiles.geometry.Rect} contentRect
     * @return {boolean}
     */
    needsUpdate(zoom, viewport, contentRect) {
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
     * @param {Element} image The image or canvas to render in this visual.
     * @param {number} targetCanvasWidth The width of the canvas to render.
     * @param {number} targetCanvasHeight The height of the canvas to render
     * @param {yfiles.geometry.Rect} initialArea The area in world coordinates the image should be rendered in.
     * @param {number} initialZoom The zoom value at the time of creation.
     */
    update(image, targetCanvasWidth, targetCanvasHeight, initialArea, initialZoom) {
      // cast width and height to int because canvas.width and canvas.height do not support floating point numbers
      const w = Math.min(this.maxCanvasSize.width, targetCanvasWidth) | 0
      const h = Math.min(this.maxCanvasSize.height, targetCanvasHeight) | 0
      this.initialArea = initialArea
      this.initialZoom = initialZoom
      const canvasContext = this.canvas.getContext('2d')
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
   * @class GLVisual
   * @augments yfiles.view.WebGLVisual
   */
  class GLVisual extends yfiles.view.WebGLVisual {
    /**
     * Creates a new GLVisual.
     * @param {yfiles.graph.IGraph} graph The graph to render.
     */
    constructor(graph) {
      super()
      this.graph = graph
      this.edgeStyle = new yfiles.styles.WebGLPolylineEdgeStyle({
        thickness: 5
      })
      this.nodeStyle = new yfiles.styles.WebGLShapeNodeStyle({
        color: 'rgb(131, 68, 173)'
      })
    }

    /**
     * Paints onto the context using WebGL item styles.
     * @param {yfiles.view.IRenderContext} ctx The context to paint on
     * @param {WebGLRenderingContext} gl The given WebGLRenderingContext
     */
    render(ctx, gl) {
      if (!this.visuals) {
        this.visuals = []
        this.graph.edges.forEach(edge => {
          this.visuals.push(
            this.edgeStyle.renderer.getVisualCreator(edge, this.edgeStyle).createVisual(ctx)
          )
        })
        this.graph.nodes.forEach(node => {
          this.visuals.push(
            this.nodeStyle.renderer.getVisualCreator(node, this.nodeStyle).createVisual(ctx)
          )
        })
      }
      this.visuals.forEach(visual => {
        visual.render(ctx, gl)
      })
    }
  }

  /**
   * A custom lookup chain link to make hit test work.
   * @implements {yfiles.graph.IContextLookupChainLink}
   */
  class HitTestInputChainLink extends yfiles.lang.Class(yfiles.graph.IContextLookupChainLink) {
    /**
     * Constructs a new instance of HitTestInputChainLink.
     * @param {yfiles.view.GraphComponent} graphComponent The given graphComponent
     */
    constructor(graphComponent) {
      super()
      this.graphComponent = graphComponent
    }

    /**
     * Retrieves an implementation of the given type for a given item.
     * @param {yfiles.graph.IModelItem} item The item to lookup for
     * @param {yfiles.lang.Class} type The type to lookup for
     * @return {Object|null} the implementation found
     */
    contextLookup(item, type) {
      if (type === yfiles.input.IHitTester.$class) {
        return new MyHitTestEnumerator(this.graphComponent)
      }
      if (type === yfiles.input.INodeHitTester.$class) {
        return new MyNodeHitTestEnumerator(this.graphComponent)
      }
      if (type === yfiles.input.IEdgeHitTester.$class) {
        return new MyEdgeHitTestEnumerator(this.graphComponent)
      }
      if (type === yfiles.input.ILabelHitTester.$class) {
        return new MyLabelHitTestEnumerator(this.graphComponent)
      }
      if (type === yfiles.input.IPortHitTester.$class) {
        return new MyPortHitTestEnumerator(this.graphComponent)
      }
      if (type === yfiles.input.ILabelOwnerHitTester.$class) {
        return new MyLabelOwnerHitTestEnumerator(this.graphComponent)
      }

      if (this.next) {
        return this.next.contextLookup(item, type)
      }

      return null
    }

    /**
     * Called to register the fallback lookup implementation that should be used.
     * @param {yfiles.graph.IContextLookup} next The context to use as a fallback
     */
    setNext(next) {
      this.next = next
    }
  }

  /**
   * Enumerate hits of a given type for a certain position in world coordinates.
   * @implements {yfiles.input.IHitTester.<yfiles.graph.IModelItem>}
   */
  class MyHitTestEnumerator extends yfiles.lang.Class(yfiles.input.IHitTester) {
    /**
     * Constructs a new instance of HitTestInputChainLink.
     * @param {yfiles.view.GraphComponent} graphComponent The given graphComponent
     */
    constructor(graphComponent) {
      super()
      this.graphComponent = graphComponent
    }

    /**
     * Enumerates the hits for the given location.
     * @param {yfiles.input.IInputModeContext} context The context to perform the hit
     * @param {yfiles.geometry.Point} location The location in world coordinates
     * @return {yfiles.collections.IEnumerable.<yfiles.graph.IModelItem>}
     */
    enumerateHits(context, location) {
      const hits = new yfiles.collections.List()
      this.graphComponent.graph.nodeLabels.forEach(label => {
        if (label.style.renderer.getHitTestable(label, label.style).isHit(context, location)) {
          hits.add(label)
        }
      })
      this.graphComponent.graph.edgeLabels.forEach(label => {
        if (label.style.renderer.getHitTestable(label, label.style).isHit(context, location)) {
          hits.add(label)
        }
      })
      this.graphComponent.graph.edges.forEach(edge => {
        if (edge.style.renderer.getHitTestable(edge, edge.style).isHit(context, location)) {
          hits.add(edge)
        }
      })
      this.graphComponent.graph.nodes.forEach(node => {
        if (node.style.renderer.getHitTestable(node, node.style).isHit(context, location)) {
          hits.add(node)
        }
      })
      return hits
    }
  }

  /**
   * Enumerates over a collection of nodes.
   * @implements {yfiles.input.INodeHitTester}
   */
  class MyNodeHitTestEnumerator extends yfiles.lang.Class(yfiles.input.INodeHitTester) {
    /**
     * Creates a new instance of MyNodeHitTestEnumerator.
     * @param {yfiles.view.GraphComponent} graphComponent The given graphComponent
     */
    constructor(graphComponent) {
      super()
      this.graphComponent = graphComponent
    }

    /**
     * Enumerates the hits for the given location.
     * @param {yfiles.input.IInputModeContext} context The context to perform the hit
     * @param {yfiles.geometry.Point} location The location in world coordinates
     * @return {yfiles.collections.IEnumerable.<yfiles.graph.INode>}
     */
    enumerateHits(context, location) {
      const hits = new yfiles.collections.List()
      this.graphComponent.graph.nodes.forEach(node => {
        if (node.style.renderer.getHitTestable(node, node.style).isHit(context, location)) {
          hits.add(node)
        }
      })
      return hits
    }
  }

  /**
   * Enumerates over a collection of edges.
   * @implements {yfiles.input.IEdgeHitTester}
   */
  class MyEdgeHitTestEnumerator extends yfiles.lang.Class(yfiles.input.IEdgeHitTester) {
    /**
     * Creates a new instance of MyEdgeHitTestEnumerator.
     * @param {yfiles.view.GraphComponent} graphComponent The given graphComponent
     */
    constructor(graphComponent) {
      super()
      this.graphComponent = graphComponent
    }

    /**
     * Enumerates the hits for the given location.
     * @param {yfiles.input.IInputModeContext} context The context to perform the hit
     * @param {yfiles.geometry.Point} location The location in world coordinates
     * @return {yfiles.collections.IEnumerable.<yfiles.graph.IEdge>}
     */
    enumerateHits(context, location) {
      const hits = new yfiles.collections.List()
      this.graphComponent.graph.edges.forEach(edge => {
        if (edge.style.renderer.getHitTestable(edge, edge.style).isHit(context, location)) {
          hits.add(edge)
        }
      })
      return hits
    }
  }

  /**
   * Enumerates over a collection of labels.
   * @implements {yfiles.input.ILabelHitTester}
   */
  class MyLabelHitTestEnumerator extends yfiles.lang.Class(yfiles.input.ILabelHitTester) {
    /**
     * Creates a new instance of MyLabelHitTestEnumerator.
     * @param {yfiles.view.GraphComponent} graphComponent The given graphComponent
     */
    constructor(graphComponent) {
      super()
      this.graphComponent = graphComponent
    }

    /**
     * Enumerates the hits for the given location.
     * @param {yfiles.input.IInputModeContext} context The context to perform the hit
     * @param {yfiles.geometry.Point} location The location in world coordinates
     * @return {yfiles.collections.IEnumerable.<yfiles.graph.ILabel>}
     */
    enumerateHits(context, location) {
      const hits = new yfiles.collections.List()
      this.graphComponent.graph.edgeLabels.forEach(label => {
        if (label.style.renderer.getHitTestable(label, label.style).isHit(context, location)) {
          hits.add(label)
        }
      })
      this.graphComponent.graph.nodeLabels.forEach(label => {
        if (label.style.renderer.getHitTestable(label, label.style).isHit(context, location)) {
          hits.add(label)
        }
      })
      return hits
    }
  }

  /**
   * Enumerates over a collection of ports.
   * @implements {yfiles.input.IPortHitTester}
   */
  class MyPortHitTestEnumerator extends yfiles.lang.Class(yfiles.input.IPortHitTester) {
    /**
     * Creates a new instance of MyPortHitTestEnumerator.
     * @param {yfiles.view.GraphComponent} graphComponent The given graphComponent
     */
    constructor(graphComponent) {
      super()
      this.graphComponent = graphComponent
    }

    /**
     * Enumerates the hits for the given location.
     * @param {yfiles.input.IInputModeContext} context The context to perform the hit
     * @param {yfiles.geometry.Point} location The location in world coordinates
     * @return {yfiles.collections.IEnumerable.<yfiles.graph.IPort>}
     */
    enumerateHits(context, location) {
      const hits = new yfiles.collections.List()
      this.graphComponent.graph.ports.forEach(port => {
        if (port.style.renderer.getHitTestable(port, port.style).isHit(context, location)) {
          hits.add(port)
        }
      })
      return hits
    }
  }

  /**
   * Enumerates over a collection of label owners.
   * @implements {yfiles.input.ILabelOwnerHitTester}
   */
  class MyLabelOwnerHitTestEnumerator extends yfiles.lang.Class(yfiles.input.ILabelOwnerHitTester) {
    /**
     * Creates a new instance of MyLabelOwnerHitTestEnumerator.
     * @param {yfiles.view.GraphComponent} graphComponent The given graphComponent
     */
    constructor(graphComponent) {
      super()
      this.graphComponent = graphComponent
    }

    /**
     * Enumerates the hits for the given location.
     * @param {yfiles.input.IInputModeContext} context The context to perform the hit
     * @param {yfiles.geometry.Point} location The location in world coordinates
     * @return {yfiles.collections.IEnumerable.<yfiles.graph.ILabelOwner>}
     */
    enumerateHits(context, location) {
      const hits = new yfiles.collections.List()
      this.graphComponent.graph.edges.forEach(edge => {
        if (edge.style.renderer.getHitTestable(edge, edge.style).isHit(context, location)) {
          hits.add(edge)
        }
      })
      this.graphComponent.graph.nodes.forEach(node => {
        if (node.style.renderer.getHitTestable(node, node.style).isHit(context, location)) {
          hits.add(node)
        }
      })
      return hits
    }
  }

  return {
    FastGraphModelManager,
    OptimizationMode
  }
})
