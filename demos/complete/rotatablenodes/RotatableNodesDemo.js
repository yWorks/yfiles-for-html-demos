/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
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
  'RotatableNodes.js',
  'RotatablePorts.js',
  'RotatableNodeLabels.js',
  'AdjustOutlinePortInsidenessEdgePathCropper.js',
  'RotationAwareGroupBoundsCalculator.js',
  'RotatedNodeLayoutStage.js',
  'resources/SampleData.js',
  'yfiles/view-layout-bridge',
  'yfiles/layout',
  'yfiles/view-graphml',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  RotatableNodes,
  RotatablePorts,
  RotatableNodeLabels,
  AdjustOutlinePortInsidenessEdgePathCropper,
  RotationAwareGroupBoundsCalculator,
  RotatedNodeLayoutStage,
  SampleData
) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /** @type {yfiles.graphml.GraphMLSupport} */
  let graphmlSupport = null

  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    initializeInputMode()
    initializeGraphML()
    initializeGraph()
    loadGraph('sine')

    registerCommands()

    app.show(graphComponent)
  }

  /**
   * Initializes the interaction with the graph.
   */
  function initializeInputMode() {
    graphComponent.inputMode = new yfiles.input.GraphEditorInputMode({
      orthogonalEdgeEditingContext: new yfiles.input.OrthogonalEdgeEditingContext(),
      snapContext: new yfiles.input.GraphSnapContext({
        enabled: false,
        collectNodePairSegmentSnapLines: false,
        collectNodePairSnapLines: false,
        collectEdgeSnapLines: false,
        collectNodeSnapLines: false,
        collectPortSnapLines: false,
        snapBendAdjacentSegments: false,
        collectNodeSizes: false
      }),
      labelSnapContext: new yfiles.input.LabelSnapContext({
        enabled: false
      }),
      allowClipboardOperations: true,
      allowGroupingOperations: true
    })

    // Update the label that shows the current rotation angle
    const handleInputMode = graphComponent.inputMode.handleInputMode
    handleInputMode.addDraggedListener((src, args) => {
      if (src.currentHandle instanceof RotatableNodes.NodeRotateHandle) {
        const rotatedNode = src.affectedItems.find(item => yfiles.graph.INode.isInstance(item))
        if (
          rotatedNode &&
          rotatedNode.style instanceof RotatableNodes.RotatableNodeStyleDecorator &&
          rotatedNode.labels.size === 1 &&
          rotatedNode.labels.first().text.endsWith('°')
        ) {
          args.context.graph.setLabelText(
            rotatedNode.labels.first(),
            `${rotatedNode.style.angle.toFixed(0)}°`
          )
        }
      }
    })
  }

  /**
   * Initialize loading from and saving to graphml-files.
   */
  function initializeGraphML() {
    // initialize (de-)serialization for load/save commands
    graphmlSupport = new yfiles.graphml.GraphMLSupport({
      graphComponent, // configure to load and save to the file system
      storageLocation: yfiles.graphml.StorageLocation.FILE_SYSTEM
    })
    const graphmlHandler = new yfiles.graphml.GraphMLIOHandler()
    const xmlNamespace = 'http://www.yworks.com/yFilesHTML/demos/RotatableNodes/1.0'
    graphmlHandler.addXamlNamespaceMapping(xmlNamespace, DemoStyles)
    graphmlHandler.addXamlNamespaceMapping(xmlNamespace, RotatableNodes)
    graphmlHandler.addXamlNamespaceMapping(xmlNamespace, RotatablePorts)
    graphmlHandler.addXamlNamespaceMapping(xmlNamespace, RotatableNodeLabels)
    graphmlSupport.graphMLIOHandler = graphmlHandler
  }

  /**
   * Initializes styles and decorators for the graph.
   */
  function initializeGraph() {
    const foldingManager = new yfiles.graph.FoldingManager()
    const graph = foldingManager.createFoldingView().graph

    const decorator = graph.decorator

    // For rotated nodes, need to provide port candidates that are backed by a rotatable port location model
    // If you want to support non-rotated port candidates, you can just provide undecorated instances here
    decorator.nodeDecorator.portCandidateProviderDecorator.setFactory(
      node => node.style instanceof RotatableNodes.RotatableNodeStyleDecorator,
      createPortCandidateProvider
    )

    decorator.portDecorator.edgePathCropperDecorator.setImplementation(
      new AdjustOutlinePortInsidenessEdgePathCropper()
    )
    decorator.nodeDecorator.groupBoundsCalculatorDecorator.setImplementation(
      new RotationAwareGroupBoundsCalculator()
    )

    graph.nodeDefaults.style = new RotatableNodes.RotatableNodeStyleDecorator(
      new DemoStyles.DemoNodeStyle()
    )
    graph.nodeDefaults.shareStyleInstance = false
    graph.nodeDefaults.size = new yfiles.geometry.Size(100, 50)

    const coreLabelModel = new yfiles.graph.InteriorLabelModel()
    graph.nodeDefaults.labels.layoutParameter = new RotatableNodeLabels.RotatableNodeLabelModelDecorator(
      coreLabelModel
    ).createWrappingParameter(yfiles.graph.InteriorLabelModel.CENTER)

    // Make ports visible
    graph.nodeDefaults.ports.style = new yfiles.styles.NodeStylePortStyleAdapter(
      new yfiles.styles.ShapeNodeStyle({
        shape: yfiles.styles.ShapeNodeShape.ELLIPSE,
        fill: 'red',
        stroke: 'red'
      })
    )
    // Use a rotatable port model as default
    graph.nodeDefaults.ports.locationParameter = new RotatablePorts.RotatablePortLocationModelDecorator().createWrappingParameter(
      yfiles.graph.FreeNodePortLocationModel.NODE_TOP_ANCHORED
    )

    const groupStyle = new DemoStyles.DemoGroupStyle()
    groupStyle.isCollapsible = true
    graph.groupNodeDefaults.style = groupStyle

    graph.edgeDefaults.style = new DemoStyles.DemoEdgeStyle()
    graph.edgeDefaults.labels.layoutParameter = new yfiles.graph.EdgePathLabelModel({
      distance: 10
    }).createDefaultParameter()

    foldingManager.masterGraph.undoEngineEnabled = true

    graphComponent.graph = graph
  }

  /**
   * Creates a {@link yfiles.input.IPortCandidateProvider} that considers the node's shape and rotation.
   * @param {yfiles.graph.INode} node
   */
  function createPortCandidateProvider(node) {
    const rotatedPortModel = RotatablePorts.RotatablePortLocationModelDecorator.INSTANCE
    const freeModel = yfiles.graph.FreeNodePortLocationModel.INSTANCE

    const rnsd = node.style
    const wrapped = rnsd.wrapped

    if (
      yfiles.styles.ShinyPlateNodeStyle.isInstance(wrapped) ||
      yfiles.styles.BevelNodeStyle.isInstance(wrapped) ||
      (yfiles.styles.ShapeNodeStyle.isInstance(wrapped) &&
        wrapped.shape === yfiles.styles.ShapeNodeShape.ROUND_RECTANGLE)
    ) {
      return yfiles.input.IPortCandidateProvider.combine(
        // Take all existing ports - these are assumed to have the correct port location model
        yfiles.input.IPortCandidateProvider.fromUnoccupiedPorts(node),
        // Provide explicit candidates - these are all backed by a rotatable port location model
        yfiles.input.IPortCandidateProvider.fromCandidates(
          // Port candidates at the corners that are slightly inset
          new yfiles.input.DefaultPortCandidate(
            node,
            rotatedPortModel.createWrappingParameter(
              freeModel.createParameterForRatios(
                new yfiles.geometry.Point(0, 0),
                new yfiles.geometry.Point(5, 5)
              )
            )
          ),
          new yfiles.input.DefaultPortCandidate(
            node,
            rotatedPortModel.createWrappingParameter(
              freeModel.createParameterForRatios(
                new yfiles.geometry.Point(0, 1),
                new yfiles.geometry.Point(5, -5)
              )
            )
          ),
          new yfiles.input.DefaultPortCandidate(
            node,
            rotatedPortModel.createWrappingParameter(
              freeModel.createParameterForRatios(
                new yfiles.geometry.Point(1, 0),
                new yfiles.geometry.Point(-5, 5)
              )
            )
          ),
          new yfiles.input.DefaultPortCandidate(
            node,
            rotatedPortModel.createWrappingParameter(
              freeModel.createParameterForRatios(
                new yfiles.geometry.Point(1, 1),
                new yfiles.geometry.Point(-5, -5)
              )
            )
          ),
          // Port candidates at the sides and the center
          new yfiles.input.DefaultPortCandidate(
            node,
            rotatedPortModel.createWrappingParameter(
              yfiles.graph.FreeNodePortLocationModel.NODE_LEFT_ANCHORED
            )
          ),
          new yfiles.input.DefaultPortCandidate(
            node,
            rotatedPortModel.createWrappingParameter(
              yfiles.graph.FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED
            )
          ),
          new yfiles.input.DefaultPortCandidate(
            node,
            rotatedPortModel.createWrappingParameter(
              yfiles.graph.FreeNodePortLocationModel.NODE_CENTER_ANCHORED
            )
          ),
          new yfiles.input.DefaultPortCandidate(
            node,
            rotatedPortModel.createWrappingParameter(
              yfiles.graph.FreeNodePortLocationModel.NODE_TOP_ANCHORED
            )
          ),
          new yfiles.input.DefaultPortCandidate(
            node,
            rotatedPortModel.createWrappingParameter(
              yfiles.graph.FreeNodePortLocationModel.NODE_RIGHT_ANCHORED
            )
          )
        )
      )
    }
    if (
      wrapped instanceof DemoStyles.DemoNodeStyle ||
      (yfiles.styles.ShapeNodeStyle.isInstance(wrapped) &&
        wrapped.shape === yfiles.styles.ShapeNodeShape.RECTANGLE)
    ) {
      return yfiles.input.IPortCandidateProvider.combine(
        yfiles.input.IPortCandidateProvider.fromUnoccupiedPorts(node),
        yfiles.input.IPortCandidateProvider.fromCandidates(
          // Port candidates at the corners
          new yfiles.input.DefaultPortCandidate(
            node,
            rotatedPortModel.createWrappingParameter(
              yfiles.graph.FreeNodePortLocationModel.NODE_TOP_LEFT_ANCHORED
            )
          ),
          new yfiles.input.DefaultPortCandidate(
            node,
            rotatedPortModel.createWrappingParameter(
              yfiles.graph.FreeNodePortLocationModel.NODE_TOP_RIGHT_ANCHORED
            )
          ),
          new yfiles.input.DefaultPortCandidate(
            node,
            rotatedPortModel.createWrappingParameter(
              yfiles.graph.FreeNodePortLocationModel.NODE_BOTTOM_LEFT_ANCHORED
            )
          ),
          new yfiles.input.DefaultPortCandidate(
            node,
            rotatedPortModel.createWrappingParameter(
              yfiles.graph.FreeNodePortLocationModel.NODE_BOTTOM_RIGHT_ANCHORED
            )
          ),
          // Port candidates at the sides and the center
          new yfiles.input.DefaultPortCandidate(
            node,
            rotatedPortModel.createWrappingParameter(
              yfiles.graph.FreeNodePortLocationModel.NODE_LEFT_ANCHORED
            )
          ),
          new yfiles.input.DefaultPortCandidate(
            node,
            rotatedPortModel.createWrappingParameter(
              yfiles.graph.FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED
            )
          ),
          new yfiles.input.DefaultPortCandidate(
            node,
            rotatedPortModel.createWrappingParameter(
              yfiles.graph.FreeNodePortLocationModel.NODE_CENTER_ANCHORED
            )
          ),
          new yfiles.input.DefaultPortCandidate(
            node,
            rotatedPortModel.createWrappingParameter(
              yfiles.graph.FreeNodePortLocationModel.NODE_TOP_ANCHORED
            )
          ),
          new yfiles.input.DefaultPortCandidate(
            node,
            rotatedPortModel.createWrappingParameter(
              yfiles.graph.FreeNodePortLocationModel.NODE_RIGHT_ANCHORED
            )
          )
        )
      )
    }
    if (yfiles.styles.ShapeNodeStyle.isInstance(wrapped)) {
      // Can be an arbitrary shape. First create a dummy node that is not rotated
      const dummyNode = new yfiles.graph.SimpleNode()
      dummyNode.style = wrapped
      dummyNode.layout = node.layout
      const shapeProvider = yfiles.input.IPortCandidateProvider.fromShapeGeometry(dummyNode, 0)
      const shapeCandidates = shapeProvider.getAllTargetPortCandidates(null)
      const rotatingCandidates = shapeCandidates.map(
        candidate =>
          new yfiles.input.DefaultPortCandidate(
            node,
            rotatedPortModel.createWrappingParameter(candidate.locationParameter)
          )
      )
      return yfiles.input.IPortCandidateProvider.combine(
        yfiles.input.IPortCandidateProvider.fromUnoccupiedPorts(node),
        yfiles.input.IPortCandidateProvider.fromCandidates(rotatingCandidates)
      )
    }
    return null
  }

  /**
   * Loads the graph from json-data.
   * @param {'sine'|'circle'} sample
   */
  function loadGraph(sample) {
    const graph = graphComponent.graph
    const data = sample === 'sine' ? SampleData.SineSample : SampleData.CircleSample

    const builder = new yfiles.binding.GraphBuilder(graph)
    builder.nodesSource = data.nodes
    builder.edgesSource = data.edges
    builder.sourceNodeBinding = 'source'
    builder.targetNodeBinding = 'target'
    builder.nodeIdBinding = 'id'
    builder.nodeLabelBinding = n => `${n.angle}°`

    builder.buildGraph()

    graph.nodes.forEach(node => {
      graph.setNodeCenter(node, new yfiles.geometry.Point(node.tag.cx, node.tag.cy))
      node.style.angle = node.tag.angle
    })

    // apply an initial edge routing
    graph.mapperRegistry.createDelegateMapper(
      yfiles.graph.INode.$class,
      yfiles.lang.Object.$class,
      RotatedNodeLayoutStage.ROTATED_NODE_LAYOUT_DP_KEY,
      node => {
        const style = node.style
        return {
          outline: style.renderer.getShapeGeometry(node, style).getOutline(),
          orientedLayout:
            style instanceof RotatableNodes.RotatableNodeStyleDecorator
              ? style.getRotatedLayout(node)
              : new yfiles.geometry.OrientedRectangle(
                  style.renderer.getBoundsProvider(node, style).getBounds()
                )
        }
      }
    )
    graphComponent.graph.applyLayout(new RotatedNodeLayoutStage(new yfiles.router.EdgeRouter()))
    graph.mapperRegistry.removeMapper(RotatedNodeLayoutStage.ROTATED_NODE_LAYOUT_DP_KEY)
    graphComponent.fitGraphBounds()

    // clear undo-queue
    graphComponent.graph.undoEngine.clear()
  }

  /**
   * Runs a layout algorithm which is configured to consider node rotations.
   */
  function applyLayout() {
    const graph = graphComponent.graph

    // provide the rotated outline and layout for the layout algorithm
    graph.mapperRegistry.createDelegateMapper(
      yfiles.graph.INode.$class,
      yfiles.lang.Object.$class,
      RotatedNodeLayoutStage.ROTATED_NODE_LAYOUT_DP_KEY,
      node => {
        const style = node.style
        return {
          outline: style.renderer.getShapeGeometry(node, style).getOutline(),
          orientedLayout:
            style instanceof RotatableNodes.RotatableNodeStyleDecorator
              ? style.getRotatedLayout(node)
              : new yfiles.geometry.OrientedRectangle(node.layout)
        }
      }
    )

    // get the selected layout algorithm
    let layout = getLayoutAlgorithm()

    // wrap the algorithm in RotatedNodeLayoutStage to make it aware of the node rotations
    layout = new RotatedNodeLayoutStage(layout)
    layout.edgeRoutingMode = getRoutingMode()

    // apply the layout
    graphComponent
      .morphLayout(layout, '700ms')
      .then(() => {
        // clean up mapper registry
        graph.mapperRegistry.removeMapper(RotatedNodeLayoutStage.ROTATED_NODE_LAYOUT_DP_KEY)
      })
      .catch(error => {
        if (typeof window.reportError === 'function') {
          window.reportError(error)
        }
      })
  }

  /**
   * Gets the layout algorithm selected by the user.
   * @return {yfiles.layout.ILayoutAlgorithm}
   */
  function getLayoutAlgorithm() {
    const graph = graphComponent.graph
    const selectLayout = document.querySelector("select[data-command='SelectLayout'")
    let layout
    switch (selectLayout.value) {
      default:
      case 'hierarchic':
        layout = new yfiles.hierarchic.HierarchicLayout()
        break
      case 'organic':
        layout = new yfiles.organic.OrganicLayout()
        layout.preferredEdgeLength =
          1.5 * Math.max(graph.nodeDefaults.size.width, graph.nodeDefaults.size.height)
        break
      case 'orthogonal':
        layout = new yfiles.orthogonal.OrthogonalLayout()
        break
      case 'circular':
        layout = new yfiles.circular.CircularLayout()
        break
      case 'tree':
        layout = new yfiles.tree.TreeReductionStage(new yfiles.tree.TreeLayout())
        layout.nonTreeEdgeRouter = new yfiles.router.OrganicEdgeRouter()
        break
      case 'balloon':
        layout = new yfiles.tree.TreeReductionStage(new yfiles.tree.BalloonLayout())
        layout.nonTreeEdgeRouter = new yfiles.router.OrganicEdgeRouter()
        break
      case 'radial':
        layout = new yfiles.radial.RadialLayout()
        break
      case 'router-polyline':
        layout = new yfiles.router.EdgeRouter()
        break
      case 'router-organic':
        layout = new yfiles.router.OrganicEdgeRouter()
        layout.edgeNodeOverlapAllowed = false
        break
    }
    return layout
  }

  /**
   * Get the routing mode that suits the selected layout algorithm. Layout algorithm that place edge ports in the
   * center of the node don't need to add a routing step.
   * @return {string}
   */
  function getRoutingMode() {
    const selectLayout = document.querySelector("select[data-command='SelectLayout'")
    const value = selectLayout.value
    if (
      value === 'hierarchic' ||
      value === 'orthogonal' ||
      value === 'tree' ||
      value === 'router-polyline'
    ) {
      return 'shortest-straight-path-to-border'
    }
    return 'no-routing'
  }

  /**
   * Wires up the UI.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindAction("button[data-command='Open']", () => {
      graphmlSupport
        .openFile(graphComponent.graph, yfiles.graphml.StorageLocation.FILE_SYSTEM)
        .then(() => {
          // after loading apply wrap node styles, node label models and port location models in rotatable decorators
          addRotatedStyles()

          graphComponent.fitGraphBounds()
        })
    })
    app.bindCommand("button[data-command='Save']", iCommand.SAVE, graphComponent)
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)
    app.bindCommand("button[data-command='Undo']", iCommand.UNDO, graphComponent)
    app.bindCommand("button[data-command='Redo']", iCommand.REDO, graphComponent)
    app.bindCommand("button[data-command='Cut']", iCommand.CUT, graphComponent)
    app.bindCommand("button[data-command='Copy']", iCommand.COPY, graphComponent)
    app.bindCommand("button[data-command='Paste']", iCommand.PASTE, graphComponent)
    app.bindCommand("button[data-command='Delete']", iCommand.DELETE, graphComponent)
    app.bindCommand(
      "button[data-command='GroupSelection']",
      iCommand.GROUP_SELECTION,
      graphComponent
    )
    app.bindCommand(
      "button[data-command='UngroupSelection']",
      iCommand.UNGROUP_SELECTION,
      graphComponent
    )
    app.bindCommand("button[data-command='EnterGroup']", iCommand.ENTER_GROUP, graphComponent)
    app.bindCommand("button[data-command='ExitGroup']", iCommand.EXIT_GROUP, graphComponent)

    app.bindAction('#demo-snapping-button', () => {
      graphComponent.inputMode.snapContext.enabled = document.querySelector(
        '#demo-snapping-button'
      ).checked
      graphComponent.inputMode.labelSnapContext.enabled = document.querySelector(
        '#demo-snapping-button'
      ).checked
    })
    app.bindAction('#demo-orthogonal-editing-button', () => {
      graphComponent.inputMode.orthogonalEdgeEditingContext.enabled = document.querySelector(
        '#demo-orthogonal-editing-button'
      ).checked
    })

    app.bindChangeListener("select[data-command='SelectSample']", value => loadGraph(value))

    app.bindChangeListener("select[data-command='SelectLayout']", applyLayout)
    app.bindAction("button[data-command='ApplyLayout']", applyLayout)
  }

  /**
   * When loading a graph without rotatable nodes, the node styles, node label models and port location models are
   * wrapped so they can be rotated in this demo.
   */
  function addRotatedStyles() {
    const graph = graphComponent.graph
    graph.nodes.forEach(node => {
      if (!graph.isGroupNode(node)) {
        if (!(node.style instanceof RotatableNodes.RotatableNodeStyleDecorator)) {
          graph.setStyle(node, new RotatableNodes.RotatableNodeStyleDecorator(node.style))
        }
        node.labels.forEach(label => {
          if (
            !(
              label.layoutParameter instanceof
              RotatableNodeLabels.RotatableNodeLabelModelDecoratorParameter
            )
          ) {
            graph.setLabelLayoutParameter(
              label,
              new RotatableNodeLabels.RotatableNodeLabelModelDecorator(
                label.layoutParameter.model
              ).createWrappingParameter(label.layoutParameter)
            )
          }
        })
        node.ports.forEach(port => {
          if (
            !(
              port.locationParameter instanceof
              RotatablePorts.RotatablePortLocationModelDecoratorParameter
            )
          ) {
            graph.setPortLocationParameter(
              port,
              RotatablePorts.RotatablePortLocationModelDecorator.INSTANCE.createWrappingParameter(
                port.locationParameter
              )
            )
          }
        })
      }
    })
  }

  // run the demo
  run()
})
