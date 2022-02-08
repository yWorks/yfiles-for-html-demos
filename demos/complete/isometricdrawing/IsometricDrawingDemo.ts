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
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DefaultFolderNodeConverter,
  DefaultFoldingEdgeConverter,
  DefaultLabelStyle,
  EdgePathLabelModel,
  ExteriorLabelModel,
  FoldingManager,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLSupport,
  GraphSnapContext,
  GridInfo,
  GridStyle,
  GridVisualCreator,
  HierarchicLayout,
  HierarchicLayoutData,
  ICanvasObjectDescriptor,
  IEdge,
  IIncrementalHintsFactory,
  ILayoutAlgorithm,
  IModelItem,
  INode,
  INodeInsetsProvider,
  Insets,
  InteriorStretchLabelModel,
  InteriorStretchLabelModelPosition,
  LabelAngleReferences,
  LabelPlacements,
  LabelSideReferences,
  LayoutData,
  LayoutExecutor,
  License,
  Matrix,
  OrthogonalEdgeEditingContext,
  OrthogonalLayout,
  OrthogonalLayoutData,
  PreferredPlacementDescriptor,
  Rect,
  RenderModes,
  SerializationProperties,
  Size,
  StorageLocation,
  Stroke,
  WebGLPolylineEdgeStyle
} from 'yfiles'
import IsometricData from './resources/IsometricData'
import { bindAction, bindInputListener, checkLicense, showApp } from '../../resources/demo-app'
import loadJson from '../../resources/load-json'
import IsometricWebGLNodeStyle from './IsometricWebGLNodeStyle'
import HeightHandleProvider from './HeightHandleProvider'
import { isWebGlSupported } from '../../utils/Workarounds'

const MINIMUM_NODE_HEIGHT = 3

let graphComponent: GraphComponent = null!

/**
 * A flag that signals whether or not a layout is currently running to prevent re-entrant layout
 * calculations.
 */
let layoutRunning = false

let gridVisualCreator: GridVisualCreator = null!

/**
 * Starts the demo which displays graphs in an isometric fashion to create an impression of a
 * 3-dimensional view.
 */
function run(licenseData: object): void {
  if (!isWebGlSupported()) {
    document.getElementById('no-webgl-support')!.removeAttribute('style')
    showApp(null)
    return
  }
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  // enable/configure folding
  const manager = new FoldingManager(graphComponent.graph)
  const folderNodeConverter = manager.folderNodeConverter as DefaultFolderNodeConverter
  folderNodeConverter.copyFirstLabel = true
  folderNodeConverter.cloneNodeStyle = true
  folderNodeConverter.folderNodeSize = new Size(210, 120)
  ;(manager.foldingEdgeConverter as DefaultFoldingEdgeConverter).copyFirstLabel = true
  graphComponent.graph = manager.createFoldingView().graph

  // initialize interaction
  const graphEditorInputMode = new GraphEditorInputMode()

  // we use orthogonal edge editing and snapping, both very helpful for editing in isometric views
  graphEditorInputMode.orthogonalEdgeEditingContext = new OrthogonalEdgeEditingContext()
  graphEditorInputMode.snapContext = new GraphSnapContext()
  graphComponent.inputMode = graphEditorInputMode

  initializeGraph()

  loadGraph()

  registerCommands()

  showApp(graphComponent)
}

function runHierarchicLayout(): Promise<void> {
  const layout = new HierarchicLayout({
    orthogonalRouting: true,
    nodeToEdgeDistance: 50,
    minimumLayerDistance: 40,
    labelingEnabled: true,
    integratedEdgeLabeling: true,
    considerNodeLabels: true,
    gridSpacing: 10
  })
  const layoutData = new HierarchicLayoutData({
    edgeLabelPreferredPlacement: new PreferredPlacementDescriptor({
      angle: 0,
      distanceToEdge: 10,
      angleReference: LabelAngleReferences.RELATIVE_TO_EDGE_FLOW,
      sideOfEdge: LabelPlacements.LEFT_OF_EDGE,
      sideReference: LabelSideReferences.ABSOLUTE_WITH_RIGHT_IN_NORTH
    }),
    incrementalHints: (item: IModelItem, hintsFactory: IIncrementalHintsFactory): object | null =>
      IEdge.isInstance(item) ? hintsFactory.createSequenceIncrementallyHint(item) : null
  })
  return runLayout(layout, layoutData)
}

function runOrthogonalLayout(): Promise<void> {
  const layout = new OrthogonalLayout({
    integratedEdgeLabeling: true,
    considerNodeLabels: true,
    gridSpacing: 10
  })

  const layoutData = new OrthogonalLayoutData({
    edgeLabelPreferredPlacement: new PreferredPlacementDescriptor({
      angle: 0,
      distanceToEdge: 10,
      angleReference: LabelAngleReferences.RELATIVE_TO_EDGE_FLOW,
      sideOfEdge: LabelPlacements.LEFT_OF_EDGE,
      sideReference: LabelSideReferences.ABSOLUTE_WITH_RIGHT_IN_NORTH
    })
  })
  return runLayout(layout, layoutData)
}

async function runLayout(layout: ILayoutAlgorithm, layoutData: LayoutData): Promise<void> {
  if (layoutRunning) {
    return Promise.reject(new Error('layout is running'))
  }

  layoutRunning = true
  setUIDisabled(true)

  // configure layout execution to not move the view port
  const executor = new LayoutExecutor({
    graphComponent,
    layout,
    layoutData,
    animateViewport: true,
    duration: '0.5s'
  })

  // start layout
  const promise = await executor.start()
  layoutRunning = false
  setUIDisabled(false)
  return promise
}

function initializeGraph(): void {
  const graph = graphComponent.graph

  // enable isometric projection
  graphComponent.projection = Matrix.ISOMETRIC

  gridVisualCreator = new GridVisualCreator(new GridInfo(20))
  gridVisualCreator.gridStyle = GridStyle.LINES
  gridVisualCreator.stroke = new Stroke(210, 210, 210, 255, 0.1)
  gridVisualCreator.renderMode = RenderModes.WEB_GL
  gridVisualCreator.visibilityThreshold = 10
  graphComponent.backgroundGroup.addChild(
    gridVisualCreator,
    ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
  )

  graph.nodeDefaults.style = new IsometricWebGLNodeStyle()
  graph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.SOUTH_WEST
  graph.edgeDefaults.style = new WebGLPolylineEdgeStyle({
    thickness: 2,
    color: '#444'
  })
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel(10).createRatioParameter()
  graph.groupNodeDefaults.labels.layoutParameter = new InteriorStretchLabelModel({
    insets: 10
  }).createParameter(InteriorStretchLabelModelPosition.SOUTH)
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    font: 'bold 14px Arial,sans-serif',
    horizontalTextAlignment: 'right'
  })
  graph.groupNodeDefaults.style = new IsometricWebGLNodeStyle()

  // add handle that enables the user to change the height of a node
  graph.decorator.nodeDecorator.handleProviderDecorator.setImplementationWrapper(
    n => !graph.isGroupNode(n),
    (node, delegateProvider) =>
      new HeightHandleProvider(node!, delegateProvider!, MINIMUM_NODE_HEIGHT)
  )

  graph.decorator.nodeDecorator.insetsProviderDecorator.setImplementation(
    node => graph.isGroupNode(node),
    INodeInsetsProvider.create(() => new Insets(10, 10, 10, 50))
  )

  // ensure that every node has geometry and color information
  graph.addNodeCreatedListener((sender, evt) => {
    ensureNodeTag(evt.item)
    if (graph.isGroupNode(evt.item)) {
      adaptGroupNodes()
    }
  })

  graph.addIsGroupNodeChangedListener(() => {
    adaptGroupNodes()
  })
}

/**
 * Loads a graph from JSON and initializes all styles and isometric data.
 * The graph also gets an initial layout.
 */
function loadGraph(): void {
  const graph = graphComponent.graph

  const graphBuilder = new GraphBuilder(graph)
  graphBuilder.createNodesSource({
    data: IsometricData.nodesSource,
    id: 'id',
    parentId: 'group',
    labels: ['label'],
    layout: (data: any) => new Rect(0, 0, data.width, data.depth)
  })
  graphBuilder.createGroupNodesSource({
    data: IsometricData.groupsSource,
    id: 'id',
    labels: ['label']
  })
  const edgesSource = graphBuilder.createEdgesSource({
    data: IsometricData.edgesSource,
    sourceId: 'from',
    targetId: 'to'
  })
  edgesSource.edgeCreator.createLabelsSource((edgeData: any) => [edgeData.label])

  graphBuilder.buildGraph()

  runHierarchicLayout()
}

/**
 * Adapt the group node height and colors: group nodes should be flat,
 * but nested group nodes should still be drawn on top of each other
 */
function adaptGroupNodes(): void {
  const graph = graphComponent.graph

  for (const groupNode of graph.nodes.filter(n => graph.isGroupNode(n))) {
    const nestingLevel = graph.groupingSupport.getPathToRoot(groupNode).size
    groupNode.tag.height = nestingLevel * 0.01
    // make sure edges are still drawn on top of group nodes
    groupNode.tag.bottom = -0.5
    groupNode.tag.color = { r: 0.3, g: 0.4, b: 1, a: Math.min(1, 0.4 + nestingLevel * 0.1) }
  }

  graphComponent.invalidate()
}

/**
 * Ensures that the node has geometry and color information present in its tag.
 * @param {INode} node
 */
function ensureNodeTag(node: INode): void {
  if (!node.tag || typeof node.tag !== 'object') {
    node.tag = {}
  }
  if (typeof node.tag.height !== 'number') {
    node.tag.height = MINIMUM_NODE_HEIGHT + Math.round(Math.random() * 30)
  }
  if (typeof node.tag.color !== 'object') {
    node.tag.color = {}
  }
  const color = node.tag.color
  for (const component of 'rgba'.split('')) {
    if (typeof color[component] !== 'number') {
      color[component] = -1
    }
    if (color[component] > 1 && color[component] <= 255) {
      color[component] /= 255
    }
    if (color[component] < 0 || color[component] > 1) {
      color[component] = component === 'a' ? 1 : Math.random()
    }
  }
}

/**
 * Binds actions to the toolbar buttons.
 */
function registerCommands(): void {
  const graphmlSupport = new GraphMLSupport()

  // ignore deserialization errors when loading graphs that use different styles
  // the styles will be replaced with isometric styles later
  graphmlSupport.graphMLIOHandler.deserializationPropertyOverrides.set(
    SerializationProperties.IGNORE_XAML_DESERIALIZATION_ERRORS,
    true
  )

  bindInputListener('#rotation', value => {
    const isometricProjection = Matrix.ISOMETRIC.clone()
    isometricProjection.rotate(parseFloat(value))
    graphComponent.projection = isometricProjection
  })

  bindAction("button[data-command='Open']", async () => {
    try {
      await graphmlSupport.openFile(graphComponent.graph, StorageLocation.FILE_SYSTEM)

      for (const node of graphComponent.graph.nodes) {
        graphComponent.graph.setStyle(node, graphComponent.graph.nodeDefaults.style)
      }

      for (const edge of graphComponent.graph.edges) {
        graphComponent.graph.setStyle(edge, graphComponent.graph.edgeDefaults.style)
      }

      setUIDisabled(true)
      await runHierarchicLayout()
    } catch (error) {
      if (typeof (window as any).reportError === 'function') {
        ;(window as any).reportError(error)
      } else {
        throw error
      }
    } finally {
      setUIDisabled(false)
    }
  })

  bindAction("button[data-command='FitContent']", () => graphComponent.fitGraphBounds())

  bindAction("button[data-command='HierarchicLayout']", () => runHierarchicLayout())
  bindAction("button[data-command='OrthogonalLayout']", () => runOrthogonalLayout())
  bindAction('#grid-toggle', () => {
    gridVisualCreator.visible = !gridVisualCreator.visible
    graphComponent.invalidate()
  })
}

/**
 * Disables buttons in the toolbar.
 */
function setUIDisabled(disabled: boolean): void {
  ;(document.getElementById('open-file') as HTMLInputElement).disabled = disabled
  ;(document.getElementById('fit-content') as HTMLInputElement).disabled = disabled
  ;(document.getElementById('hierarchic-layout') as HTMLInputElement).disabled = disabled
  ;(document.getElementById('orthogonal-layout') as HTMLInputElement).disabled = disabled
  ;(document.getElementById('grid-toggle') as HTMLInputElement).disabled = disabled
  ;(document.getElementById('rotation') as HTMLInputElement).disabled = disabled
}

loadJson().then(checkLicense).then(run)
