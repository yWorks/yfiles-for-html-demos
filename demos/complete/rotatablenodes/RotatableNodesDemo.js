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
  BalloonLayout,
  BevelNodeStyle,
  CircularLayout,
  Class,
  DefaultPortCandidate,
  EdgePathLabelModel,
  EdgeRouter,
  FoldingManager,
  FreeNodePortLocationModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLSupport,
  GraphSnapContext,
  HierarchicLayout,
  ICommand,
  INode,
  InteriorLabelModel,
  IPortCandidateProvider,
  LabelSnapContext,
  LayoutExecutor,
  License,
  NodeStylePortStyleAdapter,
  OrganicEdgeRouter,
  OrganicLayout,
  OrientedRectangle,
  OrthogonalEdgeEditingContext,
  OrthogonalLayout,
  Point,
  RadialLayout,
  ShapeNodeShape,
  ShapeNodeStyle,
  ShinyPlateNodeStyle,
  SimpleNode,
  Size,
  StorageLocation,
  TreeLayout,
  TreeReductionStage,
  YObject
} from 'yfiles'

import RotatedNodeLayoutStage from './RotatedNodeLayoutStage.js'
import { CircleSample, SineSample } from './resources/SampleData.js'
import RotationAwareGroupBoundsCalculator from './RotationAwareGroupBoundsCalculator.js'
import AdjustOutlinePortInsidenessEdgePathCropper from './AdjustOutlinePortInsidenessEdgePathCropper.js'
import * as RotatableNodeLabels from './RotatableNodeLabels.js'
import * as RotatablePorts from './RotatablePorts.js'
import DemoStyles, {
  DemoEdgeStyle,
  DemoGroupStyle,
  DemoNodeStyle,
  DemoSerializationListener
} from '../../resources/demo-styles.js'
import * as RotatableNodes from './RotatableNodes.js'
import { RotatableNodesSerializationListener } from './RotatableNodes.js'
import { bindAction, bindChangeListener, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/** @type {GraphComponent} */
let graphComponent = null

/** @type {GraphMLSupport} */
let graphmlSupport = null

function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  initializeInputMode()
  initializeGraphML()
  initializeGraph()
  loadGraph('sine')

  registerCommands()

  showApp(graphComponent)
}

/**
 * Initializes the interaction with the graph.
 */
function initializeInputMode() {
  graphComponent.inputMode = new GraphEditorInputMode({
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext(),
    snapContext: new GraphSnapContext({
      enabled: false,
      collectNodePairSegmentSnapLines: false,
      collectNodePairSnapLines: false,
      collectEdgeSnapLines: false,
      collectNodeSnapLines: false,
      collectPortSnapLines: false,
      snapBendAdjacentSegments: false,
      collectNodeSizes: false
    }),
    labelSnapContext: new LabelSnapContext({
      enabled: false
    }),
    allowClipboardOperations: true,
    allowGroupingOperations: true
  })

  // Update the label that shows the current rotation angle
  const handleInputMode = graphComponent.inputMode.handleInputMode
  handleInputMode.addDraggedListener((src, args) => {
    if (src.currentHandle instanceof RotatableNodes.NodeRotateHandle) {
      const rotatedNode = src.affectedItems.find(item => INode.isInstance(item))
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
  graphmlSupport = new GraphMLSupport({
    graphComponent, // configure to load and save to the file system
    storageLocation: StorageLocation.FILE_SYSTEM
  })
  const xmlNamespace = 'http://www.yworks.com/yFilesHTML/demos/RotatableNodes/1.0'
  graphmlSupport.graphMLIOHandler.addXamlNamespaceMapping(xmlNamespace, DemoStyles)
  graphmlSupport.graphMLIOHandler.addXamlNamespaceMapping(xmlNamespace, RotatableNodes)
  graphmlSupport.graphMLIOHandler.addXamlNamespaceMapping(xmlNamespace, RotatablePorts)
  graphmlSupport.graphMLIOHandler.addXamlNamespaceMapping(xmlNamespace, RotatableNodeLabels)
  graphmlSupport.graphMLIOHandler.addHandleSerializationListener(DemoSerializationListener)
  graphmlSupport.graphMLIOHandler.addHandleSerializationListener(
    RotatableNodesSerializationListener
  )
}

/**
 * Initializes styles and decorators for the graph.
 */
function initializeGraph() {
  const foldingManager = new FoldingManager()
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

  graph.nodeDefaults.style = new RotatableNodes.RotatableNodeStyleDecorator(new DemoNodeStyle())
  graph.nodeDefaults.shareStyleInstance = false
  graph.nodeDefaults.size = new Size(100, 50)

  const coreLabelModel = new InteriorLabelModel()
  graph.nodeDefaults.labels.layoutParameter = new RotatableNodeLabels.RotatableNodeLabelModelDecorator(
    coreLabelModel
  ).createWrappingParameter(InteriorLabelModel.CENTER)

  // Make ports visible
  graph.nodeDefaults.ports.style = new NodeStylePortStyleAdapter(
    new ShapeNodeStyle({
      shape: ShapeNodeShape.ELLIPSE,
      fill: 'red',
      stroke: 'red'
    })
  )
  // Use a rotatable port model as default
  graph.nodeDefaults.ports.locationParameter = new RotatablePorts.RotatablePortLocationModelDecorator().createWrappingParameter(
    FreeNodePortLocationModel.NODE_TOP_ANCHORED
  )

  const groupStyle = new DemoGroupStyle()
  groupStyle.isCollapsible = true
  graph.groupNodeDefaults.style = groupStyle

  graph.edgeDefaults.style = new DemoEdgeStyle()
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 10
  }).createDefaultParameter()

  foldingManager.masterGraph.undoEngineEnabled = true

  graphComponent.graph = graph
}

/**
 * Creates a {@link IPortCandidateProvider} that considers the node's shape and rotation.
 * @param {INode} node
 */
function createPortCandidateProvider(node) {
  const rotatedPortModel = RotatablePorts.RotatablePortLocationModelDecorator.INSTANCE
  const freeModel = FreeNodePortLocationModel.INSTANCE

  const rnsd = node.style
  const wrapped = rnsd.wrapped

  if (
    ShinyPlateNodeStyle.isInstance(wrapped) ||
    BevelNodeStyle.isInstance(wrapped) ||
    (ShapeNodeStyle.isInstance(wrapped) && wrapped.shape === ShapeNodeShape.ROUND_RECTANGLE)
  ) {
    return IPortCandidateProvider.combine(
      // Take all existing ports - these are assumed to have the correct port location model
      IPortCandidateProvider.fromUnoccupiedPorts(node),
      // Provide explicit candidates - these are all backed by a rotatable port location model
      IPortCandidateProvider.fromCandidates(
        // Port candidates at the corners that are slightly inset
        new DefaultPortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(
            freeModel.createParameterForRatios(new Point(0, 0), new Point(5, 5))
          )
        ),
        new DefaultPortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(
            freeModel.createParameterForRatios(new Point(0, 1), new Point(5, -5))
          )
        ),
        new DefaultPortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(
            freeModel.createParameterForRatios(new Point(1, 0), new Point(-5, 5))
          )
        ),
        new DefaultPortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(
            freeModel.createParameterForRatios(new Point(1, 1), new Point(-5, -5))
          )
        ),
        // Port candidates at the sides and the center
        new DefaultPortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.NODE_LEFT_ANCHORED)
        ),
        new DefaultPortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED)
        ),
        new DefaultPortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.NODE_CENTER_ANCHORED)
        ),
        new DefaultPortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.NODE_TOP_ANCHORED)
        ),
        new DefaultPortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.NODE_RIGHT_ANCHORED)
        )
      )
    )
  }
  if (
    wrapped instanceof DemoNodeStyle ||
    (ShapeNodeStyle.isInstance(wrapped) && wrapped.shape === ShapeNodeShape.RECTANGLE)
  ) {
    return IPortCandidateProvider.combine(
      IPortCandidateProvider.fromUnoccupiedPorts(node),
      IPortCandidateProvider.fromCandidates(
        // Port candidates at the corners
        new DefaultPortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.NODE_TOP_LEFT_ANCHORED)
        ),
        new DefaultPortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(
            FreeNodePortLocationModel.NODE_TOP_RIGHT_ANCHORED
          )
        ),
        new DefaultPortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(
            FreeNodePortLocationModel.NODE_BOTTOM_LEFT_ANCHORED
          )
        ),
        new DefaultPortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(
            FreeNodePortLocationModel.NODE_BOTTOM_RIGHT_ANCHORED
          )
        ),
        // Port candidates at the sides and the center
        new DefaultPortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.NODE_LEFT_ANCHORED)
        ),
        new DefaultPortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED)
        ),
        new DefaultPortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.NODE_CENTER_ANCHORED)
        ),
        new DefaultPortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.NODE_TOP_ANCHORED)
        ),
        new DefaultPortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.NODE_RIGHT_ANCHORED)
        )
      )
    )
  }
  if (ShapeNodeStyle.isInstance(wrapped)) {
    // Can be an arbitrary shape. First create a dummy node that is not rotated
    const dummyNode = new SimpleNode()
    dummyNode.style = wrapped
    dummyNode.layout = node.layout
    const shapeProvider = IPortCandidateProvider.fromShapeGeometry(dummyNode, 0)
    const shapeCandidates = shapeProvider.getAllTargetPortCandidates(null)
    const rotatingCandidates = shapeCandidates.map(
      candidate =>
        new DefaultPortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(candidate.locationParameter)
        )
    )
    return IPortCandidateProvider.combine(
      IPortCandidateProvider.fromUnoccupiedPorts(node),
      IPortCandidateProvider.fromCandidates(rotatingCandidates)
    )
  }
  return null
}

// We need to load the 'view-layout-bridge' module explicitly to prevent tree-shaking
// tools it from removing this dependency which is needed for 'applyLayout'.
Class.ensure(LayoutExecutor)

/**
 * Loads the graph from json-data.
 * @param {'sine'|'circle'} sample
 */
function loadGraph(sample) {
  const graph = graphComponent.graph
  const data = sample === 'sine' ? SineSample : CircleSample

  const builder = new GraphBuilder({
    graph,
    nodesSource: data.nodes,
    edgesSource: data.edges,
    sourceNodeBinding: 'source',
    targetNodeBinding: 'target',
    nodeIdBinding: 'id',
    nodeLabelBinding: n => `${n.angle}°`
  })
  builder.buildGraph()

  graph.nodes.forEach(node => {
    graph.setNodeCenter(node, new Point(node.tag.cx, node.tag.cy))
    node.style.angle = node.tag.angle
  })

  // apply an initial edge routing
  graph.mapperRegistry.createDelegateMapper(
    INode.$class,
    YObject.$class,
    RotatedNodeLayoutStage.ROTATED_NODE_LAYOUT_DP_KEY,
    node => {
      const style = node.style
      return {
        outline: style.renderer.getShapeGeometry(node, style).getOutline(),
        orientedLayout:
          style instanceof RotatableNodes.RotatableNodeStyleDecorator
            ? style.getRotatedLayout(node)
            : new OrientedRectangle(style.renderer.getBoundsProvider(node, style).getBounds())
      }
    }
  )
  graphComponent.graph.applyLayout(new RotatedNodeLayoutStage(new EdgeRouter()))
  graph.mapperRegistry.removeMapper(RotatedNodeLayoutStage.ROTATED_NODE_LAYOUT_DP_KEY)
  graphComponent.fitGraphBounds()

  // clear undo-queue
  graphComponent.graph.undoEngine.clear()
}

/**
 * Runs a layout algorithm which is configured to consider node rotations.
 */
async function applyLayout() {
  const graph = graphComponent.graph

  // provide the rotated outline and layout for the layout algorithm
  graph.mapperRegistry.createDelegateMapper(
    INode.$class,
    YObject.$class,
    RotatedNodeLayoutStage.ROTATED_NODE_LAYOUT_DP_KEY,
    node => {
      const style = node.style
      return {
        outline: style.renderer.getShapeGeometry(node, style).getOutline(),
        orientedLayout:
          style instanceof RotatableNodes.RotatableNodeStyleDecorator
            ? style.getRotatedLayout(node)
            : new OrientedRectangle(node.layout)
      }
    }
  )

  // get the selected layout algorithm
  let layout = getLayoutAlgorithm()

  // wrap the algorithm in RotatedNodeLayoutStage to make it aware of the node rotations
  layout = new RotatedNodeLayoutStage(layout)
  layout.edgeRoutingMode = getRoutingMode()
  try {
    // apply the layout
    await graphComponent.morphLayout(layout, '700ms')

    // clean up mapper registry
    graph.mapperRegistry.removeMapper(RotatedNodeLayoutStage.ROTATED_NODE_LAYOUT_DP_KEY)
  } catch (error) {
    if (typeof window.reportError === 'function') {
      window.reportError(error)
    } else {
      throw error
    }
  }
}

/**
 * Gets the layout algorithm selected by the user.
 * @return {ILayoutAlgorithm}
 */
function getLayoutAlgorithm() {
  const graph = graphComponent.graph
  const selectLayout = document.querySelector("select[data-command='SelectLayout']")
  let layout
  switch (selectLayout.value) {
    default:
    case 'hierarchic':
      layout = new HierarchicLayout()
      break
    case 'organic':
      layout = new OrganicLayout()
      layout.preferredEdgeLength =
        1.5 * Math.max(graph.nodeDefaults.size.width, graph.nodeDefaults.size.height)
      break
    case 'orthogonal':
      layout = new OrthogonalLayout()
      break
    case 'circular':
      layout = new CircularLayout()
      break
    case 'tree':
      layout = new TreeReductionStage(new TreeLayout())
      layout.nonTreeEdgeRouter = new OrganicEdgeRouter()
      break
    case 'balloon':
      layout = new TreeReductionStage(new BalloonLayout())
      layout.nonTreeEdgeRouter = new OrganicEdgeRouter()
      break
    case 'radial':
      layout = new RadialLayout()
      break
    case 'router-polyline':
      layout = new EdgeRouter()
      break
    case 'router-organic':
      layout = new OrganicEdgeRouter()
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
  const selectLayout = document.querySelector("select[data-command='SelectLayout']")
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
  bindAction("button[data-command='Open']", async () => {
    await graphmlSupport.openFile(graphComponent.graph, StorageLocation.FILE_SYSTEM)
    // after loading apply wrap node styles, node label models and port location models in rotatable decorators
    addRotatedStyles()

    graphComponent.fitGraphBounds()
  })
  bindCommand("button[data-command='Save']", ICommand.SAVE, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)
  bindCommand("button[data-command='Delete']", ICommand.DELETE, graphComponent)
  bindCommand("button[data-command='GroupSelection']", ICommand.GROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='UngroupSelection']", ICommand.UNGROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='EnterGroup']", ICommand.ENTER_GROUP, graphComponent)
  bindCommand("button[data-command='ExitGroup']", ICommand.EXIT_GROUP, graphComponent)

  bindAction('#demo-snapping-button', () => {
    graphComponent.inputMode.snapContext.enabled = document.querySelector(
      '#demo-snapping-button'
    ).checked
    graphComponent.inputMode.labelSnapContext.enabled = document.querySelector(
      '#demo-snapping-button'
    ).checked
  })
  bindAction('#demo-orthogonal-editing-button', () => {
    graphComponent.inputMode.orthogonalEdgeEditingContext.enabled = document.querySelector(
      '#demo-orthogonal-editing-button'
    ).checked
  })

  bindChangeListener("select[data-command='SelectSample']", value => loadGraph(value))

  bindChangeListener("select[data-command='SelectLayout']", applyLayout)
  bindAction("button[data-command='ApplyLayout']", applyLayout)
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
loadJson().then(run)
