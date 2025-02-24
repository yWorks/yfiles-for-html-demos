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
  CircularLayout,
  EdgePathLabelModel,
  EdgeRouter,
  FoldingManager,
  FreeNodePortLocationModel,
  GeneralPath,
  GenericLayoutData,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLIOHandler,
  GraphSnapContext,
  HierarchicalLayout,
  ILayoutAlgorithm,
  type IModelItem,
  INode,
  INodeStyle,
  InteriorNodeLabelModel,
  IOrientedRectangle,
  IPortCandidateProvider,
  LayoutExecutor,
  License,
  ShapePortStyle,
  OrganicEdgeRouter,
  OrganicLayout,
  OrientedRectangle,
  OrthogonalLayout,
  Point,
  PortCandidate,
  RadialLayout,
  RadialTreeLayout,
  Rect,
  RectangleNodeStyle,
  ShapeNodeShape,
  ShapeNodeStyle,
  SimpleNode,
  Size,
  SnappableItems,
  TreeLayout,
  TreeReductionStage
} from '@yfiles/yfiles'

import RotatedNodeLayoutStage from './RotatedNodeLayoutStage'
import { CircleSample, SineSample } from './resources/SampleData'
import RotationAwareGroupBoundsCalculator from './RotationAwareGroupBoundsCalculator'
import AdjustOutlinePortInsidenessEdgePathCropper from './AdjustOutlinePortInsidenessEdgePathCropper'
import * as RotatableNodeLabels from './RotatableNodeLabels'
import {
  RotatableNodeLabelModelDecorator,
  RotatableNodeLabelModelDecoratorParameter
} from './RotatableNodeLabels'
import * as RotatablePorts from './RotatablePorts'
import {
  RotatablePortLocationModelDecorator,
  RotatablePortLocationModelDecoratorParameter
} from './RotatablePorts'
import * as RotatableNodes from './RotatableNodes'
import { NodeRotateHandle, RotatableNodeStyleDecorator } from './RotatableNodes'
import {
  createDemoEdgeLabelStyle,
  createDemoEdgeStyle,
  createDemoGroupStyle,
  createDemoNodeLabelStyle,
  createDemoNodeStyle
} from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { addNavigationButtons, finishLoading } from '@yfiles/demo-resources/demo-page'
import { openGraphML, saveGraphML } from '@yfiles/demo-utils/graphml-support'

let graphComponent: GraphComponent

const selectLayout = document.querySelector<HTMLSelectElement>('#select-layout')!
const selectSample = document.querySelector<HTMLSelectElement>('#select-sample')!

async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  initializeInputMode()
  initializeGraph()
  loadGraph('sine')
  initializeUI()
}

/**
 * Initializes the interaction with the graph.
 */
function initializeInputMode(): void {
  let graphEditorInputMode = new GraphEditorInputMode({
    snapContext: new GraphSnapContext({
      enabled: true,
      snappableItems: SnappableItems.NONE,
      collectNodePairSegmentSnapLines: false,
      collectNodePairSnapLines: false,
      collectNodeSizes: false
    }),
    allowClipboardOperations: true
  })
  graphComponent.inputMode = graphEditorInputMode

  // Update the label that shows the current rotation angle
  const handleInputMode = graphEditorInputMode.handleInputMode
  handleInputMode.addEventListener('dragged', (evt, src) => {
    if (src.currentHandle instanceof NodeRotateHandle) {
      const rotatedNode = src.affectedItems.find(
        (item: IModelItem) => item instanceof INode
      ) as INode
      if (
        rotatedNode &&
        rotatedNode.style instanceof RotatableNodeStyleDecorator &&
        rotatedNode.labels.size === 1 &&
        rotatedNode.labels.first()!.text.endsWith('°')
      ) {
        evt.context.graph!.setLabelText(
          rotatedNode.labels.first()!,
          `${rotatedNode.style.angle.toFixed(0)}°`
        )
      }
    }
  })
}

/**
 * Initialize loading from and saving to graphml-files.
 */
function initializeGraphML(): GraphMLIOHandler {
  // initialize (de-)serialization for load/save commands
  const graphMLIOHandler = new GraphMLIOHandler()

  // enable serialization of the required classes - without a namespace mapping, serialization will fail
  const xmlNamespace = 'http://www.yworks.com/yFilesHTML/demos/RotatableNodes/1.0'

  graphMLIOHandler.addXamlNamespaceMapping(xmlNamespace, RotatableNodes)
  graphMLIOHandler.addXamlNamespaceMapping(xmlNamespace, RotatablePorts)
  graphMLIOHandler.addXamlNamespaceMapping(xmlNamespace, RotatableNodeLabels)

  return graphMLIOHandler
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
  decorator.nodes.portCandidateProvider.addFactory(
    (node) => node.style instanceof RotatableNodeStyleDecorator,
    createPortCandidateProvider
  )

  decorator.ports.edgePathCropper.addConstant(new AdjustOutlinePortInsidenessEdgePathCropper())
  decorator.nodes.groupBoundsCalculator.addFactory(
    (node) => new RotationAwareGroupBoundsCalculator(node)
  )

  graph.nodeDefaults.style = new RotatableNodeStyleDecorator(createDemoNodeStyle())
  graph.nodeDefaults.shareStyleInstance = false
  graph.nodeDefaults.size = new Size(100, 50)

  const coreLabelModel = new InteriorNodeLabelModel()
  graph.nodeDefaults.labels.style = createDemoNodeLabelStyle()
  graph.nodeDefaults.labels.layoutParameter = new RotatableNodeLabelModelDecorator(
    coreLabelModel
  ).createWrappingParameter(InteriorNodeLabelModel.CENTER)

  // Make ports visible
  graph.nodeDefaults.ports.style = new ShapePortStyle({
    shape: ShapeNodeShape.ELLIPSE,
    fill: '#662b00',
    stroke: '#662b00'
  })
  // Use a rotatable port model as default
  graph.nodeDefaults.ports.locationParameter =
    new RotatablePortLocationModelDecorator().createWrappingParameter(FreeNodePortLocationModel.TOP)

  graph.groupNodeDefaults.style = createDemoGroupStyle({ foldingEnabled: true })

  graph.edgeDefaults.style = createDemoEdgeStyle({ orthogonalEditing: true })
  graph.edgeDefaults.labels.style = createDemoEdgeLabelStyle()
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 10
  }).createRatioParameter()

  foldingManager.masterGraph.undoEngineEnabled = true

  graphComponent.graph = graph
}

/**
 * Creates a {@link IPortCandidateProvider} that considers the node's shape and rotation.
 */
function createPortCandidateProvider(node: INode): IPortCandidateProvider {
  const rotatedPortModel = RotatablePortLocationModelDecorator.INSTANCE
  const freeModel = FreeNodePortLocationModel.INSTANCE

  const rnsd = node.style as RotatableNodeStyleDecorator
  const wrapped = rnsd.wrapped

  if (isRoundRectangle(wrapped)) {
    return IPortCandidateProvider.combine(
      // Take all existing ports - these are assumed to have the correct port location model
      IPortCandidateProvider.fromUnoccupiedPorts(node),
      // Provide explicit candidates - these are all backed by a rotatable port location model
      IPortCandidateProvider.fromCandidates(
        // Port candidates at the corners that are slightly inset
        new PortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(
            freeModel.createParameterForRatios(new Point(0, 0), new Point(5, 5))
          )
        ),
        new PortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(
            freeModel.createParameterForRatios(new Point(0, 1), new Point(5, -5))
          )
        ),
        new PortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(
            freeModel.createParameterForRatios(new Point(1, 0), new Point(-5, 5))
          )
        ),
        new PortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(
            freeModel.createParameterForRatios(new Point(1, 1), new Point(-5, -5))
          )
        ),
        // Port candidates at the sides and the center
        new PortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.LEFT)
        ),
        new PortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.BOTTOM)
        ),
        new PortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.CENTER)
        ),
        new PortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.TOP)
        ),
        new PortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.RIGHT)
        )
      )
    )
  }
  if (isRectangle(wrapped)) {
    return IPortCandidateProvider.combine(
      IPortCandidateProvider.fromUnoccupiedPorts(node),
      IPortCandidateProvider.fromCandidates(
        // Port candidates at the corners
        new PortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.TOP_LEFT)
        ),
        new PortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.TOP_RIGHT)
        ),
        new PortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.BOTTOM_LEFT)
        ),
        new PortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.BOTTOM_RIGHT)
        ),
        // Port candidates at the sides and the center
        new PortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.LEFT)
        ),
        new PortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.BOTTOM)
        ),
        new PortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.CENTER)
        ),
        new PortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.TOP)
        ),
        new PortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(FreeNodePortLocationModel.RIGHT)
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
      (candidate) =>
        new PortCandidate(
          node,
          rotatedPortModel.createWrappingParameter(candidate.locationParameter)
        )
    )
    return IPortCandidateProvider.combine(
      IPortCandidateProvider.fromUnoccupiedPorts(node),
      IPortCandidateProvider.fromCandidates(rotatingCandidates)
    )
  }
  return IPortCandidateProvider.NO_CANDIDATES
}

/**
 * Determines if the given style visualizes nodes with a rounded rectangle shape.
 * @param style the style instance to check.
 */
function isRoundRectangle(style: INodeStyle): boolean {
  return (
    (style instanceof ShapeNodeStyle && style.shape === ShapeNodeShape.ROUND_RECTANGLE) ||
    (style instanceof RectangleNodeStyle && style.cornerSize > 0)
  )
}

/**
 * Determines if the given style visualizes nodes with a rectangle shape.
 * @param style the style instance to check.
 */
function isRectangle(style: INodeStyle): boolean {
  return (
    (style instanceof ShapeNodeStyle && style.shape === ShapeNodeShape.RECTANGLE) ||
    (style instanceof RectangleNodeStyle && style.cornerSize === 0)
  )
}

// Ensure that the LayoutExecutor class is not removed by build optimizers
// It is needed for the 'applyLayoutAnimated' method in this demo.
LayoutExecutor.ensure()

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
    layout: (data) => new Rect(data.cx, data.cy, defaultNodeSize.width, defaultNodeSize.height),
    style: (data) => {
      const nodeStyle = graph.nodeDefaults.getStyleInstance() as RotatableNodeStyleDecorator
      nodeStyle.angle = data.angle
      return nodeStyle
    }
  })
  nodesSource.nodeCreator.createLabelBinding((data) => `${data.angle}°`)
  builder.createEdgesSource(data.edges, 'source', 'target')

  builder.buildGraph()

  // apply an initial edge routing
  const layoutData = new GenericLayoutData()
  layoutData.addItemMapping(RotatedNodeLayoutStage.ROTATED_NODE_LAYOUT_DATA_KEY).mapperFunction = (
    node
  ) => {
    const style = node.style
    return {
      outline: getOutline(style, node),
      orientedLayout: getOrientedLayout(style, node)
    }
  }
  graphComponent.graph.applyLayout(new RotatedNodeLayoutStage(new EdgeRouter()), layoutData)
  void graphComponent.fitGraphBounds()

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
  return style instanceof RotatableNodeStyleDecorator
    ? style.getRotatedLayout(node)
    : new OrientedRectangle(node.layout)
}

/**
 * Runs a layout algorithm which is configured to consider node rotations.
 */
async function applyLayout() {
  // provide the rotated outline and layout for the layout algorithm
  const layoutData = new GenericLayoutData()
  layoutData.addItemMapping(RotatedNodeLayoutStage.ROTATED_NODE_LAYOUT_DATA_KEY).mapperFunction = (
    node
  ) => {
    const style = node.style
    return {
      outline: getOutline(style, node),
      orientedLayout: getOrientedLayout(style, node)
    }
  }
  // get the selected layout algorithm
  const layout = getLayoutAlgorithm()

  // wrap the algorithm in RotatedNodeLayoutStage to make it aware of the node rotations
  const rotatedNodeLayout = new RotatedNodeLayoutStage(layout)
  rotatedNodeLayout.edgeRoutingMode = getRoutingMode()

  selectLayout.disabled = true
  selectSample.disabled = true
  try {
    // apply the layout
    await graphComponent.applyLayoutAnimated(rotatedNodeLayout, '700ms', layoutData)
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
    case 'hierarchical':
      return new HierarchicalLayout({
        minimumLayerDistance: 50,
        nodeDistance: 100,
        defaultEdgeDescriptor: {
          routingStyleDescriptor: {
            defaultRoutingStyle: 'octilinear'
          }
        }
      })
    case 'organic':
      return new OrganicLayout({
        defaultPreferredEdgeLength:
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
    case 'radial-tree':
      return new TreeReductionStage({
        coreLayout: new RadialTreeLayout(),
        nonTreeEdgeRouter: new OrganicEdgeRouter()
      })
    case 'radial':
      return new RadialLayout()
    case 'router-polyline':
      return new EdgeRouter()
    case 'router-organic':
      return new OrganicEdgeRouter({ allowEdgeNodeOverlaps: false })
  }
}

/**
 * Get the routing mode that suits the selected layout algorithm. Layout algorithms that place edge
 * ports in the center of the node don't need to add a routing step.
 */
function getRoutingMode(): 'no-routing' | 'shortest-straight-path-to-border' | 'fixed-port' {
  const value = selectLayout.value
  if (
    value === 'hierarchical' ||
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
function initializeUI(): void {
  const graphMLIOHandler = initializeGraphML()
  document
    .querySelector<HTMLInputElement>('#open-file-button')!
    .addEventListener('click', async () => {
      await openGraphML(graphComponent, graphMLIOHandler)
      // after loading apply, wrap node styles, node label models and port location models in rotatable decorators
      addRotatedStyles()
      void graphComponent.fitGraphBounds()
    })
  document.querySelector<HTMLInputElement>('#save-button')!.addEventListener('click', async () => {
    await saveGraphML(graphComponent, 'rotatableNodes.graphml', graphMLIOHandler)
  })

  const snappingButton = document.querySelector<HTMLInputElement>('#demo-snapping-button')!
  snappingButton.addEventListener('click', () => {
    const inputMode = graphComponent.inputMode as GraphEditorInputMode
    inputMode.snapContext!.enabled = snappingButton.checked
  })

  const orthogonalEditing = document.querySelector<HTMLInputElement>(
    '#demo-orthogonal-editing-button'
  )!
  orthogonalEditing.addEventListener('click', () => {
    const inputMode = graphComponent.inputMode as GraphEditorInputMode
    inputMode.orthogonalEdgeEditingContext!.enabled = orthogonalEditing.checked
  })

  addNavigationButtons(selectSample).addEventListener('change', (e: Event) => {
    loadGraph((e.target as HTMLSelectElement).value as 'sine' | 'circle')
  })

  addNavigationButtons(selectLayout).addEventListener('change', applyLayout)

  document.querySelector('#layout')!.addEventListener('click', applyLayout)
}

/**
 * When loading a graph without rotatable nodes, the node styles, node label models and port
 * location models are wrapped so they can be rotated in this demo.
 */
function addRotatedStyles(): void {
  const graph = graphComponent.graph
  graph.nodes.forEach((node) => {
    if (!graph.isGroupNode(node)) {
      if (!(node.style instanceof RotatableNodeStyleDecorator)) {
        graph.setStyle(node, new RotatableNodeStyleDecorator(node.style))
      }
      node.labels.forEach((label) => {
        if (!(label.layoutParameter instanceof RotatableNodeLabelModelDecoratorParameter)) {
          graph.setLabelLayoutParameter(
            label,
            new RotatableNodeLabelModelDecorator(
              label.layoutParameter.model
            ).createWrappingParameter(label.layoutParameter)
          )
        }
      })
      node.ports.forEach((port) => {
        if (!(port.locationParameter instanceof RotatablePortLocationModelDecoratorParameter)) {
          graph.setPortLocationParameter(
            port,
            RotatablePortLocationModelDecorator.INSTANCE.createWrappingParameter(
              port.locationParameter
            )
          )
        }
      })
    }
  })
}

run().then(finishLoading)
