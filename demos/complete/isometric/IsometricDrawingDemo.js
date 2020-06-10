/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  CompositeLayoutData,
  ExteriorLabelModel,
  FixNodeLayoutData,
  FoldingManager,
  FreeEdgeLabelModel,
  FreeNodePortLocationModel,
  GraphBuilder,
  GraphComponent,
  GraphItemTypes,
  GraphMLSupport,
  GraphViewerInputMode,
  HashMap,
  HierarchicLayout,
  HierarchicLayoutData,
  ICommand,
  IEdge,
  ILabel,
  IModelItem,
  INode,
  Insets,
  LabelAngleReferences,
  LabelLayoutTranslator,
  LabelPlacements,
  LabelSideReferences,
  LayoutExecutor,
  LayoutGraph,
  LayoutGraphAdapter,
  LayoutMode,
  License,
  NodeAlignmentPolicy,
  NodeHalo,
  OrthogonalLayout,
  OrthogonalLayoutData,
  Point,
  PolylineEdgeStyle,
  PreferredPlacementDescriptor,
  SerializationProperties,
  Size,
  StorageLocation,
  YObject
} from 'yfiles'

import IsometricData from './resources/IsometricData.js'
import FixGroupStateIconStage from './FixGroupStateIconStage.js'
import IsometricTransformationStage from './IsometricTransformationStage.js'
import * as IsometricTransformationSupport from './IsometricTransformationSupport.js'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import { EdgeLabelStyle, GroupLabelStyle, GroupNodeStyle, NodeStyle } from './IsometricStyles.js'
import loadJson from '../../resources/load-json.js'

let graphComponent = null

/**
 * The currently selected layout type determines whether {@link HierarchicLayout} or
 * {@link OrthogonalLayout} is applied to the graph.
 * @type {'hierarchic'|'orthogonal'}
 */
let layoutType = 'hierarchic'

/**
 * A flag that signals whether or not a layout is currently running to prevent re-entrant layout
 * calculations.
 * @type {boolean}
 */
let layoutRunning = false

/**
 * Starts the demo which displays graphs in an isometric fashion to create an impression of a
 * 3-dimensional view.
 */
function run(licenseData) {
  License.value = licenseData
  // initialize graph component
  graphComponent = new GraphComponent('graphComponent')
  graphComponent.minimumZoom = 0.05
  graphComponent.maximumZoom = 4.0

  // enable/configure folding
  const manager = new FoldingManager(graphComponent.graph)
  manager.folderNodeConverter.copyFirstLabel = true
  manager.folderNodeConverter.cloneNodeStyle = true
  manager.folderNodeConverter.folderNodeSize = new Size(210, 120)
  manager.folderNodeConverter.folderNodeStyle = new GroupNodeStyle()
  manager.foldingEdgeConverter.copyFirstLabel = true
  graphComponent.graph = manager.createFoldingView().graph

  // initialize interaction
  graphComponent.inputMode = new GraphViewerInputMode()
  graphComponent.inputMode.selectableItems = GraphItemTypes.NONE
  graphComponent.inputMode.focusableItems = GraphItemTypes.NONE
  graphComponent.inputMode.navigationInputMode.allowCollapseGroup = true
  graphComponent.inputMode.navigationInputMode.allowExpandGroup = true
  graphComponent.inputMode.navigationInputMode.fitContentAfterGroupActions = false
  graphComponent.inputMode.navigationInputMode.autoGroupNodeAlignmentPolicy =
    NodeAlignmentPolicy.BOTTOM_LEFT

  // add hierarchy change listeners to invoke an incremental layout when collapsing/expanding a group
  const geometries = new HashMap()
  let fixPoint
  graphComponent.inputMode.navigationInputMode.addGroupCollapsingListener((source, args) => {
    const group = args.item
    fixPoint = calculateFixPoint(group)
  })
  graphComponent.inputMode.navigationInputMode.addGroupCollapsedListener((source, args) => {
    const group = args.item
    geometries.set(group, group.tag.geometry)
    group.tag.geometry = {
      width: 155,
      height: 0,
      depth: 90,
      horizontal: true
    }
    restoreFixPoint(group, fixPoint)
    runLayout(group)
  })
  graphComponent.inputMode.navigationInputMode.addGroupExpandingListener((source, args) => {
    const group = args.item
    fixPoint = calculateFixPoint(group)
  })
  graphComponent.inputMode.navigationInputMode.addGroupExpandedListener((source, args) => {
    const group = args.item
    if (geometries.get(group)) {
      group.tag.geometry = geometries.get(group)
    }
    restoreFixPoint(group, fixPoint)
    runLayout(group)
  })

  // load sample graph
  loadGraph()

  // moves the group nodes to the start of the rendering list, causing it to be drawn
  // first and therefore to be rendered in the back.
  graphComponent.graphModelManager.groupNodeGroup.toBack()

  // bind commands to toolbar buttons
  registerCommands()

  showApp(graphComponent)
}

/**
 * Calculates the current location of the front corner of the given node in view space.
 * @param {INode} node The node that should be fixed
 * @return {Point}
 */
function calculateFixPoint(node) {
  const corners = IsometricTransformationSupport.calculateCorners(node.tag.geometry)
  IsometricTransformationSupport.moveTo(node.layout.x, node.layout.y, corners)

  return new Point(
    corners[IsometricTransformationSupport.C3_X],
    corners[IsometricTransformationSupport.C3_Y]
  )
}

/**
 * Moves the node with its front corner of the given node in view space to the fix point.
 * @param {INode} node The node that should be fixed
 * @param {Point} fixPoint the coordinates of the fixed point
 */
function restoreFixPoint(node, fixPoint) {
  const graph = graphComponent.graph
  const corners = IsometricTransformationSupport.calculateCorners(node.tag.geometry)
  IsometricTransformationSupport.moveTo(node.layout.x, node.layout.y, corners)

  const newCornerX = corners[IsometricTransformationSupport.C3_X]
  const newCornerY = corners[IsometricTransformationSupport.C3_Y]

  const dx = fixPoint.x - newCornerX
  const dy = fixPoint.y - newCornerY

  if (graph.isGroupNode(node)) {
    graph.getChildren(node).forEach(child => {
      graph.setNodeCenter(child, new Point(child.layout.center.x + dx, child.layout.center.y + dy))
    })
  }
  graph.setNodeCenter(node, new Point(node.layout.center.x + dx, node.layout.center.y + dy))
}

function getPreferredLabelPlacement() {
  return new PreferredPlacementDescriptor({
    angle: 0,
    angleReference: LabelAngleReferences.RELATIVE_TO_EDGE_FLOW,
    sideOfEdge: LabelPlacements.LEFT_OF_EDGE,
    sideReference: LabelSideReferences.ABSOLUTE_WITH_RIGHT_IN_NORTH
  })
}

/**
 * Invokes a layout specified by the current {@link layoutType}. If there is a fixed node, the
 * layout is calculated incrementally.
 * @param {INode} fixedNode if defined the layout will be incrementally and this node remains at
 *   its
 *                                       location
 */
async function runLayout(fixedNode) {
  if (layoutRunning) {
    return Promise.reject(new Error('layout is running'))
  }

  layoutRunning = true

  const incremental = !!fixedNode

  // add mapper to make transformation data stored in the user data of the nodes/edges available during layout
  const mapperRegistry = graphComponent.graph.mapperRegistry
  mapperRegistry.createDelegateMapper(
    IModelItem.$class,
    YObject.$class,
    IsometricTransformationStage.TRANSFORMATION_DATA_DP_KEY,
    item => {
      if (INode.isInstance(item) || (ILabel.isInstance(item) && IEdge.isInstance(item.owner))) {
        return item.tag.geometry
      }
      return null
    }
  )

  // configure layout
  const configuration =
    layoutType === 'hierarchic'
      ? getHierarchicLayoutConfiguration(incremental)
      : getOrthogonalLayoutConfiguration()
  let layout = new IsometricTransformationStage(configuration.layout, incremental)
  let layoutData = configuration.layoutData

  // add NodeHalos around the group nodes so the layout keeps space under the group nodes
  // to let the label of the group nodes visible
  for (const node of graphComponent.graph.nodes) {
    if (graphComponent.graph.isGroupNode(node)) {
      layoutData.nodeHalos.mapper.set(node, NodeHalo.create(0, 0, 20, 0))
    }
  }

  if (incremental) {
    // fixate the location of the given fixed node
    layout = new FixGroupStateIconStage(layout)
    layoutData = new CompositeLayoutData(
      configuration.layoutData,
      new FixNodeLayoutData({
        fixedNodes: fixedNode
      })
    )
  }

  setUIDisabled(true)

  // configure layout execution to not move the view port
  const executor = new LayoutExecutor({
    graphComponent,
    layout,
    layoutData,
    animateViewport: !incremental,
    duration: '0.5s',
    updateContentRect: false
  })

  // start layout
  const promise = await executor.start()
  mapperRegistry.removeMapper(IsometricTransformationStage.TRANSFORMATION_DATA_DP_KEY)
  mapperRegistry.removeMapper(
    LayoutGraphAdapter.EDGE_LABEL_LAYOUT_PREFERRED_PLACEMENT_DESCRIPTOR_DP_KEY
  )
  layoutRunning = false
  setUIDisabled(false)
  return promise
}

/**
 * Creates an hierarchic layout configuration consisting of layout algorithm and layout data.
 * @param {boolean} incremental <code>true</code> in case the layout should be calculated
 *   incrementally
 * @return {{layout: HierarchicLayout, layoutData: HierarchicLayoutData}}
 */
function getHierarchicLayoutConfiguration(incremental) {
  const layout = new HierarchicLayout({
    orthogonalRouting: true,
    nodeToEdgeDistance: 50,
    minimumLayerDistance: 40,
    labelingEnabled: false,
    integratedEdgeLabeling: true,
    considerNodeLabels: true
  })

  if (incremental) {
    layout.layoutMode = LayoutMode.INCREMENTAL
  }

  // use preferred placement descriptors to place the labels vertically on the edges
  const layoutData = new HierarchicLayoutData({
    edgeLabelPreferredPlacement: getPreferredLabelPlacement(),
    incrementalHints: (item, hintsFactory) =>
      IEdge.isInstance(item) ? hintsFactory.createSequenceIncrementallyHint(item) : null
  })

  return {
    layout,
    layoutData
  }
}

/**
 * Creates an orthogonal layout configuration consisting of layout algorithm and layout data.
 * @return {{layout: OrthogonalLayout, layoutData: OrthogonalLayoutData}}
 */
function getOrthogonalLayoutConfiguration() {
  // this label layout translator does nothing because the TransformationLayoutStage prepares the labels for layout
  // but OrthogonalLayout needs a label layout translator for integrated edge labeling and node label consideration
  const labelLayoutTranslator = new IsometricLabelLayoutTranslator()

  const layout = new OrthogonalLayout({
    integratedEdgeLabeling: true,
    considerNodeLabels: true,
    labeling: labelLayoutTranslator
  })

  const layoutData = new OrthogonalLayoutData({
    edgeLabelPreferredPlacement: getPreferredLabelPlacement()
  })

  return {
    layout,
    layoutData
  }
}

/**
 * This label layout translator does nothing because the TransformationLayoutStage prepares the
 * labels for layout but OrthogonalGroupLayouter needs a label layout translator for integrated
 * edge labeling and node label consideration.
 */
class IsometricLabelLayoutTranslator extends LabelLayoutTranslator {
  /**
   * @param {LayoutGraph} graph
   */
  applyLayout(graph) {
    if (this.coreLayout) {
      this.coreLayout.applyLayout(graph)
    }
  }
}

/**
 * Loads a graph from JSON and initializes all styles and isometric data.
 * The graph also gets an initial layout.
 */
function loadGraph() {
  let graph = graphComponent.graph

  graph.nodeDefaults.style = new NodeStyle()
  graph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.SOUTH
  graph.groupNodeDefaults.style = new GroupNodeStyle()
  graph.groupNodeDefaults.labels.style = new GroupLabelStyle()

  const graphBuilder = new GraphBuilder(graphComponent.graph)
  graphBuilder.createNodesSource({
    data: IsometricData.nodesSource,
    id: 'id',
    parentId: 'group',
    labels: ['label']
  })
  graphBuilder.createGroupNodesSource({
    data: IsometricData.groupsSource,
    id: 'id',
    labels: ['label']
  })
  const edgesSource = graphBuilder.createEdgesSource(IsometricData.edgesSource, 'from', 'to')
  const edgeLabelsSource = edgesSource.edgeCreator.createLabelsSource(edgeData => [edgeData.label])
  edgeLabelsSource.labelCreator.addLabelAddedListener((sender, args) => {
    const label = args.item
    const layout = label.layout
    const insets = new Insets(3)
    label.tag = {
      geometry: {
        width: layout.width + insets.left + insets.right,
        height: layout.height + insets.top + insets.bottom,
        depth: layout.height + insets.top + insets.bottom,
        horizontal: true
      }
    }
    graph.setStyle(label, new EdgeLabelStyle(insets))
  })

  graph = graphBuilder.buildGraph()

  runLayout()
}

/**
 * Binds actions to the toolbar buttons.
 */
function registerCommands() {
  const graphmlSupport = new GraphMLSupport()

  // ignore deserialization errors when loading graphs that use different styles
  // the styles will be replaced with isometric styles later
  graphmlSupport.graphMLIOHandler.deserializationPropertyOverrides.set(
    SerializationProperties.IGNORE_XAML_DESERIALIZATION_ERRORS,
    true
  )
  bindAction("button[data-command='Open']", async () => {
    try {
      await graphmlSupport.openFile(graphComponent.graph, StorageLocation.FILE_SYSTEM)

      setUIDisabled(true)
      // after loading apply isometric styles and geometry to the nodes and labels
      applyIsometricStyles()
      await runLayout()
    } catch (error) {
      if (typeof window.reportError === 'function') {
        window.reportError(error)
      } else {
        throw error
      }
    } finally {
      setUIDisabled(false)
    }
  })

  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindAction("button[data-command='HierarchicLayout']", () => {
    layoutType = 'hierarchic'
    runLayout()
  })
  bindAction("button[data-command='OrthogonalLayout']", () => {
    layoutType = 'orthogonal'
    runLayout()
  })
}

/**
 * Adds isometric styles and geometry data to nodes and labels of the graph. Also free label and
 * port location models are applied to retrieve the correct positions calculated by the layout
 * algorithm.
 */
function applyIsometricStyles() {
  const foldingManager = graphComponent.graph.foldingView.manager
  const graph = foldingManager.masterGraph
  graph.nodes.forEach(node => {
    const group = graph.isGroupNode(node)
    updateGeometry(node, node.layout, group ? 0 : 20)
    if (group) {
      node.tag.fill = 'rgba(202,236,255,0.5)'
      graph.setStyle(node, new GroupNodeStyle())
      foldingManager.getFolderNodeState(node).style = new GroupNodeStyle()
      const firstLabel = node.labels.firstOrDefault()
      if (firstLabel) {
        updateGeometry(firstLabel, firstLabel.layout, firstLabel.layout.height, new Insets(3))
        graph.setStyle(firstLabel, new GroupLabelStyle())
        graph.setLabelLayoutParameter(firstLabel, graph.groupNodeDefaults.labels.layoutParameter)
      }
      const firstFolderLabel = foldingManager.getFolderNodeState(node).labels.firstOrDefault()
      if (firstFolderLabel) {
        const label = firstFolderLabel.asLabel()
        updateGeometry(label, label.layout, label.layout.height, new Insets(3))
        firstFolderLabel.style = new GroupLabelStyle()
      }
    } else {
      node.tag.fill = 'rgba(255,153,0,1)'
      graph.setStyle(node, new NodeStyle())
    }
  })
  graph.edges.forEach(edge => {
    graph.setStyle(edge, new PolylineEdgeStyle())
    edge.labels.forEach(label => {
      updateGeometry(label, label.layout, label.layout.height, new Insets(3))
      graph.setStyle(label, new EdgeLabelStyle())
      graph.setLabelLayoutParameter(label, FreeEdgeLabelModel.INSTANCE.createDefaultParameter())
    })
  })
  graph.ports.forEach(port => {
    graph.setPortLocationParameter(port, FreeNodePortLocationModel.NODE_CENTER_ANCHORED)
  })
}

/**
 * Updates the tag of the given item with geometry data.
 * In case the tag already contains valid geometry data, it stays unchanged.
 * @param {IModelItem} item the item for which the tag is updated.
 * @param {IRectangle|IOrientedRectangle} layout the 2D-geometry for the item
 * @param {number} height the height of the resulting solid figure
 * @param {Insets} insets insets that are added to the layout information to create a padding
 */
function updateGeometry(item, layout, height, insets) {
  if (
    item.tag &&
    item.tag.geometry &&
    item.tag.geometry.width &&
    item.tag.geometry.height &&
    item.tag.geometry.depth
  ) {
    return
  }

  const inset = insets || Insets.EMPTY
  const geometry = {
    width: layout.width + inset.left + inset.right,
    height: height + inset.top + inset.bottom,
    depth: layout.height + inset.top + inset.bottom,
    horizontal: true
  }
  if (item.tag) {
    item.tag.geometry = geometry
  } else {
    item.tag = { geometry }
  }
}

/**
 * Disables buttons in the toolbar.
 * @param {boolean} disabled
 */
function setUIDisabled(disabled) {
  document.getElementById('open-file').disabled = disabled
  document.getElementById('hierarchic-layout').disabled = disabled
  document.getElementById('orthogonal-layout').disabled = disabled
}

loadJson().then(run)
