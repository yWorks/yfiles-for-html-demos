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
  EdgePathLabelModel,
  FoldingManager,
  FreeNodePortLocationModel,
  GenericLayoutData,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLIOHandler,
  GraphSnapContext,
  INode,
  INodeStyle,
  InteriorNodeLabelModel,
  IOrientedRectangle,
  IPortCandidateProvider,
  LayoutExecutorAsync,
  License,
  OrientedRectangle,
  Point,
  PortCandidate,
  Rect,
  RectangleNodeStyle,
  ShapeNodeShape,
  ShapeNodeStyle,
  ShapePortStyle,
  SimpleNode,
  Size,
  SnappableItems
} from '@yfiles/yfiles'

import { RotatedNodeLayoutStage } from './RotatedNodeLayoutStage'
import { CircleSample, SineSample } from './resources/SampleData'
import { RotationAwareGroupBoundsCalculator } from './RotationAwareGroupBoundsCalculator'
import { AdjustOutlinePortInsidenessEdgePathCropper } from './AdjustOutlinePortInsidenessEdgePathCropper'
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
import {
  CachingOrientedRectangle,
  NodeRotateHandle,
  RotatableNodeStyleDecorator
} from './RotatableNodes'
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

let graphComponent

const selectLayout = document.querySelector('#select-layout')
const selectSample = document.querySelector('#select-sample')

const worker = new Worker(new URL('./WorkerLayout', import.meta.url), { type: 'module' })

async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  initializeInputMode()
  initializeGraph()
  await loadGraph('sine')
  initializeUI()
}

/**
 * Initializes the interaction with the graph.
 */
function initializeInputMode() {
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
      const rotatedNode = src.affectedItems.find((item) => item instanceof INode)
      if (
        rotatedNode &&
        rotatedNode.style instanceof RotatableNodeStyleDecorator &&
        rotatedNode.labels.size === 1 &&
        rotatedNode.labels.first().text.endsWith('°')
      ) {
        evt.context.graph.setLabelText(
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
function initializeGraph() {
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
function createPortCandidateProvider(node) {
  const rotatedPortModel = RotatablePortLocationModelDecorator.INSTANCE
  const freeModel = FreeNodePortLocationModel.INSTANCE

  const rnsd = node.style
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
    const shapeCandidates = shapeProvider.getAllTargetPortCandidates(null)
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
function isRoundRectangle(style) {
  return (
    (style instanceof ShapeNodeStyle && style.shape === ShapeNodeShape.ROUND_RECTANGLE) ||
    (style instanceof RectangleNodeStyle && style.cornerSize > 0)
  )
}

/**
 * Determines if the given style visualizes nodes with a rectangle shape.
 * @param style the style instance to check.
 */
function isRectangle(style) {
  return (
    (style instanceof ShapeNodeStyle && style.shape === ShapeNodeShape.RECTANGLE) ||
    (style instanceof RectangleNodeStyle && style.cornerSize === 0)
  )
}

/**
 * Loads the graph data.
 */
async function loadGraph(sample) {
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
      const nodeStyle = graph.nodeDefaults.getStyleInstance()
      nodeStyle.angle = data.angle
      return nodeStyle
    }
  })
  nodesSource.nodeCreator.createLabelBinding((data) => `${data.angle}°`)
  builder.createEdgesSource(data.edges, 'source', 'target')

  builder.buildGraph()

  // apply an initial edge routing
  await applyLayout('edge-router')
  void graphComponent.fitGraphBounds()

  // clear undo-queue
  graphComponent.graph.undoEngine.clear()
}

function getOrientedLayout(style, node) {
  return style instanceof RotatableNodeStyleDecorator
    ? style.getRotatedLayout(node)
    : new OrientedRectangle(node.layout)
}

/**
 * Runs a layout algorithm which is configured to consider node rotations.
 */
async function applyLayout(selectedLayout) {
  // provide the rotated layout for the layout algorithm
  const layoutData = new GenericLayoutData()
  layoutData.addItemMapping(RotatedNodeLayoutStage.ROTATED_NODE_LAYOUT_DATA_KEY).mapperFunction = (
    node
  ) => {
    const style = node.style
    let orientedLayout = getOrientedLayout(style, node)
    if (orientedLayout instanceof CachingOrientedRectangle) {
      // the Web Worker serialization works for OrientedRectangles out-of-the-box
      orientedLayout = orientedLayout.cachedOrientedRect
    }
    return orientedLayout
  }

  selectLayout.disabled = true
  selectSample.disabled = true
  try {
    // apply the layout
    const executor = new LayoutExecutorAsync({
      messageHandler: LayoutExecutorAsync.createWebWorkerMessageHandler(worker),
      graphComponent,
      layoutDescriptor: getLayoutDescriptor(selectedLayout),
      layoutData,
      animationDuration: '700ms'
    })

    // run the Web Worker layout
    await executor.start()
  } finally {
    selectSample.disabled = false
    selectLayout.disabled = false
  }
}

/**
 * Gets the layout algorithm selected by the user.
 */
function getLayoutDescriptor(selectedLayout) {
  const graph = graphComponent.graph
  switch (selectedLayout) {
    default:
    case 'hierarchical':
      return {
        name: 'HierarchicalLayout',
        properties: { minimumLayerDistance: 50, nodeDistance: 100 }
      }
    case 'organic':
      return {
        name: 'OrganicLayout',
        properties: {
          defaultPreferredEdgeLength:
            1.5 * Math.max(graph.nodeDefaults.size.width, graph.nodeDefaults.size.height)
        }
      }
    case 'orthogonal':
      return { name: 'OrthogonalLayout' }
    case 'circular':
      return { name: 'CircularLayout' }
    case 'tree':
      return { name: 'TreeLayout' }
    case 'radial-tree':
      return { name: 'RadialTreeLayout' }
    case 'radial':
      return { name: 'RadialLayout' }
    case 'edge-router':
      return { name: 'EdgeRouter' }
    case 'organic-edge-router':
      return { name: 'OrganicEdgeRouter', properties: { allowEdgeNodeOverlaps: false } }
  }
}

/**
 * Wires up the UI.
 */
function initializeUI() {
  const graphMLIOHandler = initializeGraphML()
  document.querySelector('#open-file-button').addEventListener('click', async () => {
    await openGraphML(graphComponent, graphMLIOHandler)
    // after loading apply, wrap node styles, node label models and port location models in rotatable decorators
    addRotatedStyles()
    void graphComponent.fitGraphBounds()
  })
  document.querySelector('#save-button').addEventListener('click', async () => {
    await saveGraphML(graphComponent, 'rotatableNodes.graphml', graphMLIOHandler)
  })

  const snappingButton = document.querySelector('#demo-snapping-button')
  snappingButton.addEventListener('click', () => {
    const inputMode = graphComponent.inputMode
    inputMode.snapContext.enabled = snappingButton.checked
  })

  const orthogonalEditing = document.querySelector('#demo-orthogonal-editing-button')
  orthogonalEditing.addEventListener('click', () => {
    const inputMode = graphComponent.inputMode
    inputMode.orthogonalEdgeEditingContext.enabled = orthogonalEditing.checked
  })

  addNavigationButtons(selectSample).addEventListener('change', (e) => {
    loadGraph(e.target.value)
  })

  addNavigationButtons(selectLayout).addEventListener('change', () =>
    applyLayout(selectLayout.value)
  )

  document.querySelector('#layout').addEventListener('click', () => applyLayout(selectLayout.value))
}

/**
 * When loading a graph without rotatable nodes, the node styles, node label models and port
 * location models are wrapped so they can be rotated in this demo.
 */
function addRotatedStyles() {
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
