/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
  BalloonLayout,
  BevelNodeStyle,
  CircularLayout,
  Class,
  DefaultPortCandidate,
  EdgePathLabelModel,
  EdgeRouter,
  FoldingManager,
  FreeNodePortLocationModel,
  GeneralPath,
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
  Rect,
  ShapeNodeShape,
  ShapeNodeStyle,
  ShinyPlateNodeStyle,
  SimpleNode,
  Size,
  StorageLocation,
  TreeLayout,
  TreeReductionStage,
  YObject,
  ILayoutAlgorithm,
  INodeStyle,
  IOrientedRectangle
} from 'yfiles'

import RotatedNodeLayoutStage from './RotatedNodeLayoutStage'
import { CircleSample, SineSample } from './resources/SampleData'
import RotationAwareGroupBoundsCalculator from './RotationAwareGroupBoundsCalculator'
import AdjustOutlinePortInsidenessEdgePathCropper from './AdjustOutlinePortInsidenessEdgePathCropper'
import * as RotatableNodeLabels from './RotatableNodeLabels'
import * as RotatablePorts from './RotatablePorts'
import DemoStyles, {
  DemoEdgeStyle,
  DemoGroupStyle,
  DemoNodeStyle,
  DemoSerializationListener
} from '../../resources/demo-styles'
import * as RotatableNodes from './RotatableNodes'
import { RotatableNodesSerializationListener, RotatableNodeStyleDecorator } from './RotatableNodes'
import {
  addNavigationButtons,
  bindAction,
  bindChangeListener,
  bindCommand,
  checkLicense,
  showApp
} from '../../resources/demo-app'
import loadJson from '../../resources/load-json'

let graphComponent: GraphComponent

let graphmlSupport: GraphMLSupport

const selectLayout = document.querySelector(
  "select[data-command='SelectLayout']"
) as HTMLSelectElement
const selectSample = document.querySelector(
  "select[data-command='SelectSample']"
) as HTMLSelectElement

function run(licenseData: object): void {
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
function initializeInputMode(): void {
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
  const handleInputMode = (graphComponent.inputMode as GraphEditorInputMode).handleInputMode
  handleInputMode.addDraggedListener((src, args) => {
    if (src.currentHandle instanceof RotatableNodes.NodeRotateHandle) {
      const rotatedNode = src.affectedItems.find(item => item instanceof INode) as INode
      if (
        rotatedNode &&
        rotatedNode.style instanceof RotatableNodes.RotatableNodeStyleDecorator &&
        rotatedNode.labels.size === 1 &&
        rotatedNode.labels.first().text.endsWith('°')
      ) {
        args.context.graph!.setLabelText(
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
function initializeGraphML(): void {
  // initialize (de-)serialization for load/save commands
  graphmlSupport = new GraphMLSupport({
    graphComponent,
    storageLocation: StorageLocation.FILE_SYSTEM
  })

  // enable serialization of the required classes - without a namespace mapping, serialization will fail
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
function initializeGraph(): void {
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
  graph.nodeDefaults.labels.layoutParameter =
    new RotatableNodeLabels.RotatableNodeLabelModelDecorator(
      coreLabelModel
    ).createWrappingParameter(InteriorLabelModel.CENTER)

  // Make ports visible
  graph.nodeDefaults.ports.style = new NodeStylePortStyleAdapter(
    new ShapeNodeStyle({
      shape: ShapeNodeShape.ELLIPSE,
      fill: '#662b00',
      stroke: '#662b00'
    })
  )
  // Use a rotatable port model as default
  graph.nodeDefaults.ports.locationParameter =
    new RotatablePorts.RotatablePortLocationModelDecorator().createWrappingParameter(
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
 */
function createPortCandidateProvider(node: INode) {
  const rotatedPortModel = RotatablePorts.RotatablePortLocationModelDecorator.INSTANCE
  const freeModel = FreeNodePortLocationModel.INSTANCE

  const rnsd = node.style as RotatableNodeStyleDecorator
  const wrapped = rnsd.wrapped

  if (
    wrapped instanceof ShinyPlateNodeStyle ||
    wrapped instanceof BevelNodeStyle ||
    (wrapped instanceof ShapeNodeStyle && wrapped.shape === ShapeNodeShape.ROUND_RECTANGLE)
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
    (wrapped instanceof ShapeNodeStyle && wrapped.shape === ShapeNodeShape.RECTANGLE)
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
  if (wrapped instanceof ShapeNodeStyle) {
    // Can be an arbitrary shape. First create a dummy node that is not rotated
    const dummyNode = new SimpleNode()
    dummyNode.style = wrapped
    dummyNode.layout = node.layout
    const shapeProvider = IPortCandidateProvider.fromShapeGeometry(dummyNode, 0)
    const shapeCandidates = shapeProvider.getAllTargetPortCandidates(null!)
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
 * Loads the graph data.
 */
function loadGraph(sample: 'sine' | 'circle'): void {
  const graph = graphComponent.graph
  graph.clear()
  const data = sample === 'sine' ? SineSample : CircleSample

  const defaultNodeSize = graph.nodeDefaults.size
  const builder = new GraphBuilder(graph)
  const nodesSource = builder.createNodesSource({
    data: data.nodes,
    id: 'id',
    layout: data => new Rect(data.cx, data.cy, defaultNodeSize.width, defaultNodeSize.height),
    style: data => {
      const nodeStyle = graph.nodeDefaults.getStyleInstance() as RotatableNodeStyleDecorator
      nodeStyle.angle = data.angle
      return nodeStyle
    }
  })
  nodesSource.nodeCreator.createLabelBinding(data => `${data.angle}°`)
  builder.createEdgesSource(data.edges, 'source', 'target')

  builder.buildGraph()

  // apply an initial edge routing
  graph.mapperRegistry.createDelegateMapper(
    INode.$class,
    YObject.$class,
    RotatedNodeLayoutStage.ROTATED_NODE_LAYOUT_DP_KEY,
    node => {
      const style = node.style
      return {
        outline: getOutline(style, node),
        orientedLayout: getOrientedLayout(style, node)
      }
    }
  )
  graphComponent.graph.applyLayout(new RotatedNodeLayoutStage(new EdgeRouter()))
  graph.mapperRegistry.removeMapper(RotatedNodeLayoutStage.ROTATED_NODE_LAYOUT_DP_KEY)
  graphComponent.fitGraphBounds()

  // clear undo-queue
  graphComponent.graph.undoEngine!.clear()
}

function getOutline(style: INodeStyle, node: INode): GeneralPath {
  let outline = style.renderer.getShapeGeometry(node, style).getOutline()
  if (!outline) {
    // style is rectangular use the oriented layout as outline
    const layout = getOrientedLayout(style, node)
    outline = new GeneralPath()
    outline.appendOrientedRectangle(layout, false)
  }
  return outline
}

function getOrientedLayout(style: INodeStyle, node: INode): IOrientedRectangle {
  return style instanceof RotatableNodes.RotatableNodeStyleDecorator
    ? style.getRotatedLayout(node)
    : new OrientedRectangle(node.layout)
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
        outline: getOutline(style, node),
        orientedLayout: getOrientedLayout(style, node)
      }
    }
  )

  // get the selected layout algorithm
  const layout = getLayoutAlgorithm()

  // wrap the algorithm in RotatedNodeLayoutStage to make it aware of the node rotations
  const rotatedNodeLayout = new RotatedNodeLayoutStage(layout)
  rotatedNodeLayout.edgeRoutingMode = getRoutingMode()

  selectLayout.disabled = true
  selectSample.disabled = true
  try {
    // apply the layout
    await graphComponent.morphLayout(rotatedNodeLayout, '700ms')

    // clean up mapper registry
    graph.mapperRegistry.removeMapper(RotatedNodeLayoutStage.ROTATED_NODE_LAYOUT_DP_KEY)
  } catch (error) {
    if (typeof (window as any).reportError === 'function') {
      ;(window as any).reportError(error)
    } else {
      throw error
    }
  } finally {
    selectSample.disabled = false
    selectLayout.disabled = false
  }
}

/**
 * Gets the layout algorithm selected by the user.
 */
function getLayoutAlgorithm(): ILayoutAlgorithm {
  const graph = graphComponent.graph
  switch (selectLayout.value) {
    default:
    case 'hierarchic':
      return new HierarchicLayout()
    case 'organic':
      return new OrganicLayout({
        preferredEdgeLength:
          1.5 * Math.max(graph.nodeDefaults.size.width, graph.nodeDefaults.size.height)
      })
    case 'orthogonal':
      return new OrthogonalLayout()
    case 'circular':
      return new CircularLayout()
    case 'tree':
      return new TreeReductionStage({
        coreLayout: new TreeLayout(),
        nonTreeEdgeRouter: new OrganicEdgeRouter()
      })
    case 'balloon':
      return new TreeReductionStage({
        coreLayout: new BalloonLayout(),
        nonTreeEdgeRouter: new OrganicEdgeRouter()
      })
    case 'radial':
      return new RadialLayout()
    case 'router-polyline':
      return new EdgeRouter()
    case 'router-organic':
      return new OrganicEdgeRouter({ edgeNodeOverlapAllowed: false })
  }
}

/**
 * Get the routing mode that suits the selected layout algorithm. Layout algorithm that place edge
 * ports in the center of the node don't need to add a routing step.
 */
function getRoutingMode(): 'no-routing' | 'shortest-straight-path-to-border' | 'fixed-port' {
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
function registerCommands(): void {
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
    const inputMode = graphComponent.inputMode as GraphEditorInputMode
    inputMode.snapContext!.enabled = (
      document.getElementById('demo-snapping-button') as HTMLInputElement
    ).checked
    inputMode.labelSnapContext!.enabled = (
      document.getElementById('demo-snapping-button') as HTMLInputElement
    ).checked
  })
  bindAction('#demo-orthogonal-editing-button', () => {
    const inputMode = graphComponent.inputMode as GraphEditorInputMode
    inputMode.orthogonalEdgeEditingContext!.enabled = (
      document.querySelector('#demo-orthogonal-editing-button') as HTMLInputElement
    ).checked
  })

  bindChangeListener("select[data-command='SelectSample']", value => loadGraph(value))
  addNavigationButtons(selectSample)

  bindChangeListener("select[data-command='SelectLayout']", applyLayout)
  addNavigationButtons(selectLayout)

  bindAction("button[data-command='ApplyLayout']", applyLayout)
}

/**
 * When loading a graph without rotatable nodes, the node styles, node label models and port
 * location models are wrapped so they can be rotated in this demo.
 */
function addRotatedStyles(): void {
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
loadJson().then(checkLicense).then(run)
