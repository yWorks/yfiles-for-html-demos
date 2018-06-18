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

require.config({
  paths: {
    yfiles: '../../../lib/umd/yfiles/',
    utils: '../../utils/',
    resources: '../../resources/'
  }
})

require([
  'yfiles/view-editor',
  'resources/demo-app',
  'resources/demo-styles',
  'AdditionalSnapLineVisualCreator.js',
  'ShapeBasedGridNodeSnapResultProvider.js',
  'OrthogonalLabelSnapLineProviderWrapper.js',
  'AdditionalSnapLineMoveInputMode.js',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  AdditionalSnapLineVisualCreator,
  ShapeBasedGridNodeSnapResultProvider,
  OrthogonalLabelSnapLineProviderWrapper,
  AdditionalSnapLineMoveInputMode
) => {
  /**
   * @type {yfiles.view.GridVisualCreator}
   */
  let grid = null

  /**
   * Returns a list of the free {@link AdditionalSnapLineVisualCreator}s used in this
   * This property is used by the {@link AdditionalSnapLineMoveInputMode} to access the
   * {@link AdditionalSnapLineVisualCreator}s used in this
   * @type {yfiles.collections.List.<AdditionalSnapLineVisualCreator>}
   */
  let additionalSnapLineVisualCreators = null

  function run() {
    // initialize the GraphComponent
    const graphComponent = new yfiles.view.GraphComponent('graphComponent')
    const graph = graphComponent.graph

    decorateModelItemLookupForCustomSnappingBehaviour(graph)

    const graphSnapContext = createGraphSnapContext()
    const labelSnapContext = createLabelSnapContext()

    initializeGrid(graphComponent, graphSnapContext)

    // Initialize two free snap lines that are also visualized in the GraphCanvasComponent
    additionalSnapLineVisualCreators = new yfiles.collections.List()
    addAdditionalSnapLineVisualCreator(
      graphComponent,
      new yfiles.geometry.Point(0, -70),
      new yfiles.geometry.Point(500, -70)
    )
    addAdditionalSnapLineVisualCreator(
      graphComponent,
      new yfiles.geometry.Point(-230, -50),
      new yfiles.geometry.Point(-230, 400)
    )

    // Initialize the input mode for this demo
    const graphEditorInputMode = new yfiles.input.GraphEditorInputMode({
      snapContext: graphSnapContext,
      labelSnapContext
    })

    // add an input mode that allows to move the custom AdditionalSnapLines
    const additionalSnapLineMoveInputMode = new AdditionalSnapLineMoveInputMode(
      additionalSnapLineVisualCreators
    )
    additionalSnapLineMoveInputMode.priority = -50
    graphEditorInputMode.add(additionalSnapLineMoveInputMode)

    graphComponent.inputMode = graphEditorInputMode

    graph.undoEngineEnabled = true

    initializeGraphDefaults(graph)

    // Initialize the graph by reading it from a file.
    createSampleGraph(graph)
    graphComponent.fitGraphBounds()

    app.show(graphComponent)
  }

  /**
   * Creates a pre-configured {@link yfiles.input.GraphSnapContext}.
   * @return {yfiles.input.GraphSnapContext}
   */
  function createGraphSnapContext() {
    const context = new yfiles.input.GraphSnapContext({
      snapOrthogonalMovement: false,
      snapBendAdjacentSegments: true,
      gridSnapType: yfiles.input.GridSnapTypes.ALL,
      snapDistance: 10
    })
    // use the free additional snap lines
    context.addCollectSnapLinesListener(collectAdditionalGraphSnapLines)
    return context
  }

  /**
   * Creates a pre-configured {@link yfiles.input.LabelSnapContext}.
   * @return {yfiles.input.LabelSnapContext}
   */
  function createLabelSnapContext() {
    const snapContext = new yfiles.input.LabelSnapContext({
      snapDistance: 10,
      collectInitialLocationSnapLines: false
    })

    snapContext.addCollectSnapLinesListener(collectAdditionalLabelSnapLines)

    return snapContext
  }

  /**
   * Sets to the node/edge decorator the desired snapping implementation.
   * @param {yfiles.graph.IGraph} graph The given graph
   */
  function decorateModelItemLookupForCustomSnappingBehaviour(graph) {
    // add additional snap lines for orthogonal labels of nodes
    const decorator = graph.decorator
    decorator.nodeDecorator.snapLineProviderDecorator.setImplementationWrapper(
      (node, wrappedProvider) => new OrthogonalLabelSnapLineProviderWrapper(wrappedProvider)
    )

    // add additional snap lines for orthogonal labels of edges
    decorator.edgeDecorator.snapLineProviderDecorator.setImplementationWrapper(
      (edge, wrappedProvider) => new OrthogonalLabelSnapLineProviderWrapper(wrappedProvider)
    )

    // for nodes using IShapeNodeStyle use a customized grid snapping behaviour based on their shape
    decorator.nodeDecorator.nodeSnapResultProviderDecorator.setImplementation(
      new ShapeBasedGridNodeSnapResultProvider()
    )
  }

  /**
   * Adds the grid to the graphComponent and a grid constraint provider to the snap context.
   * @param {yfiles.view.GraphComponent} graphComponent The given graphComponent
   * @param {yfiles.input.GraphSnapContext} graphSnapContext The configured snap context
   */
  function initializeGrid(graphComponent, graphSnapContext) {
    const gridInfo = new yfiles.view.GridInfo()
    gridInfo.horizontalSpacing = 200
    gridInfo.verticalSpacing = 200

    grid = new yfiles.view.GridVisualCreator(gridInfo)
    graphComponent.backgroundGroup.addChild(
      grid,
      yfiles.view.ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
    )

    graphComponent.invalidate()
    graphComponent.addZoomChangedListener(() => {
      graphComponent.invalidate()
    })
    graphComponent.addViewportChangedListener(() => graphComponent.invalidate())

    graphSnapContext.nodeGridConstraintProvider = new yfiles.input.GridConstraintProvider(gridInfo)
    graphSnapContext.bendGridConstraintProvider = new yfiles.input.GridConstraintProvider(gridInfo)
  }

  /**
   * Initializes the default styles for the given graphComponent.
   * @param {yfiles.graph.IGraph} graph The given graph
   */
  function initializeGraphDefaults(graph) {
    const labelStyle = new yfiles.styles.DefaultLabelStyle()
    graph.nodeDefaults.labels.style = labelStyle
    graph.nodeDefaults.labels.layoutParameter = yfiles.graph.FreeNodeLabelModel.INSTANCE.createParameter(
      [0.5, 0.0],
      [0, -10],
      [0.5, 1.0],
      [0, 0],
      0.0
    )

    graph.edgeDefaults.labels.style = labelStyle
    graph.edgeDefaults.labels.layoutParameter = new yfiles.graph.SmartEdgeLabelModel().createParameterFromSource(
      0,
      0,
      0.5
    )

    DemoStyles.initDemoStyles(graph)
    graph.nodeDefaults.size = new yfiles.geometry.Size(50, 50)
  }

  /**
   * Adds a new {@link AdditionalSnapLineVisualCreator} to the graphComponent that spans between
   * <code>from</code> and <code>to</code>.
   * @param {yfiles.view.GraphComponent} graphComponent The given graphComponent
   * @param {yfiles.geometry.Point} from The start location of the snap line.
   * @param {yfiles.geometry.Point} to The end location of the snap line.
   */
  function addAdditionalSnapLineVisualCreator(graphComponent, from, to) {
    const lineVisualCreator = new AdditionalSnapLineVisualCreator(from, to)
    additionalSnapLineVisualCreators.add(lineVisualCreator)
    // Specify the canvas object descriptor for this line. It is responsible for the rendering, amongst others.
    graphComponent.backgroundGroup.addChild(
      lineVisualCreator,
      yfiles.view.ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
    )
  }

  /**
   * Creates and adds {@link yfiles.input.SnapLine}s for the free {@link AdditionalSnapLineVisualCreator}
   * to a {@link yfiles.input.GraphSnapContext}.
   * While the {@link AdditionalSnapLineVisualCreator}s are used to visualize and represent free snap lines,
   * according {@link yfiles.input.OrthogonalSnapLine}s have to be added to the snapping mechanism to describe their
   * snapping behavior.
   * @param {Object} sender The snap context sending this event.
   * @param {yfiles.input.CollectGraphSnapLinesEventArgs} e The event arguments to add the snap lines to.
   */
  function collectAdditionalGraphSnapLines(sender, e) {
    additionalSnapLineVisualCreators.forEach(creator => {
      creator.createSnapLines().forEach(snapLine => {
        e.addAdditionalSnapLine(snapLine)
      })
    })
  }

  /**
   * Creates and adds {@link yfiles.input.SnapLine}s for the free {@link AdditionalSnapLineVisualCreator}
   * to a {@link yfiles.input.LabelSnapContext}.
   * While the {@link AdditionalSnapLineVisualCreator}s are used to visualize and represent free snap lines,
   * according {@link yfiles.input.OrthogonalSnapLine}s have to be added to the snapping mechanism to describe their
   * snapping behavior.
   * @param {Object} sender The snap context sending this event.
   * @param {yfiles.input.CollectLabelSnapLineEventArgs} e The event arguments to add the snap lines to.
   */
  function collectAdditionalLabelSnapLines(sender, e) {
    additionalSnapLineVisualCreators.forEach(creator => {
      creator.createSnapLines().forEach(snapLine => {
        e.addSnapLine(snapLine)
      })
    })
  }

  /**
   * Creates the sample graph.
   * @param {yfiles.graph.IGraph} graph
   */
  function createSampleGraph(graph) {
    graph.clear()

    const starShape = new yfiles.styles.ShapeNodeStyle({
      shape: 'star5',
      fill: 'rgb(104, 176, 227)',
      stroke: 'rgb(104, 176, 227)'
    })

    graph.createNode(new yfiles.geometry.Rect(-100, 260, 75, 75), starShape)
    graph.createNode(new yfiles.geometry.Rect(40, 260, 75, 75), starShape)

    const n1 = graph.createNode(new yfiles.geometry.Rect(-80, 60, 50, 50))
    graph.addLabel(
      n1,
      'This node label has an extra extended super long text\nso you can see how nodes snap all along its border.'
    )
    const n2 = graph.createNode(new yfiles.geometry.Rect(360, 280, 50, 50))
    graph.createNode(new yfiles.geometry.Rect(50, -90, 50, 50))

    const edge = graph.createEdge(n1, n2)
    graph.addBend(edge, new yfiles.geometry.Point(130, 85), 0)
    graph.addBend(edge, new yfiles.geometry.Point(130, 210), 1)
    graph.addBend(edge, new yfiles.geometry.Point(280, 210), 2)
    graph.addBend(edge, new yfiles.geometry.Point(320, 305), 3)
    const smartEdgeLabelModel = new yfiles.graph.SmartEdgeLabelModel()
    graph.addLabel(
      edge,
      'Other graph items can snap\nto this edge label as long as\nit is orthogonal.',
      smartEdgeLabelModel.createParameterFromSource(2, 10, 0.5)
    )
  }

  // run the demo
  run()
})
