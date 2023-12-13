/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Arrow,
  ArrowType,
  EdgeRouter,
  EdgeStyleBase,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphSelectionIndicatorManager,
  GroupingKeys,
  HierarchicLayout,
  HierarchicLayoutData,
  IArrow,
  IEdge,
  IGraph,
  IRenderContext,
  LayoutOrientation,
  License,
  PolylineEdgeStyle,
  RecursiveGroupLayout,
  RecursiveGroupLayoutData,
  SimplexNodePlacer,
  Size,
  SmoothingPolicy,
  SolidColorFill,
  SvgVisual,
  SvgVisualGroup,
  Visual,
  YInsets
} from 'yfiles'

import ContextMenuSupport from './ContextMenuSupport.js'
import {
  applyDemoTheme,
  createDemoGroupStyle,
  createDemoNodeStyle
} from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import graphData from './graph-data.json'

/** @type {GraphComponent} */
let graphComponent

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  configureInteraction()
  await loadGraph()

  initializeUI()
}

/**
 * @returns {!Promise}
 */
async function loadGraph() {
  graphComponent.graph.clear()
  initializeDefaults()

  // then build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  await runLayout()
}
/**
 * Creates nodes and edges according to the given data.
 * @param {!IGraph} graph
 * @param {!JSONGraph} graphData
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder.createNodesSource({
    data: graphData.nodeList.filter((item) => !item.isGroup),
    id: (item) => item.id,
    parentId: (item) => item.parentId
  })

  graphBuilder
    .createGroupNodesSource({
      data: graphData.nodeList.filter((item) => item.isGroup),
      id: (item) => item.id,
      parentId: (item) => item.parentId
    })
    .nodeCreator.createLabelBinding((item) => item.label)

  const edgesSource = graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })
  edgesSource.edgeCreator.tagProvider = (item) => item.tag
  edgesSource.edgeCreator.styleBindings.addBinding('stroke', (item) =>
    item.tag ? `3px ${item.tag.color}` : undefined
  )
  edgesSource.edgeCreator.styleBindings.addBinding('targetArrow', (item) =>
    item.tag ? new Arrow({ fill: item.tag.color, type: 'triangle', scale: 1.5 }) : undefined
  )

  graphBuilder.buildGraph()
}

/**
 * Runs a {@link RecursiveGroupLayout} with {@link HierarchicLayout} as its core
 * layout.
 */
async function runLayout() {
  const hierarchicLayout = new HierarchicLayout({
    layoutOrientation: LayoutOrientation.LEFT_TO_RIGHT
  })
  hierarchicLayout.edgeLayoutDescriptor.directGroupContentEdgeRouting = true
  hierarchicLayout.nodePlacer.barycenterMode = true

  const edgeRouter = new EdgeRouter({
    scope: 'route-affected-edges'
  })
  edgeRouter.defaultEdgeLayoutDescriptor.directGroupContentEdgeRouting = true

  const recursiveGroupLayout = new RecursiveGroupLayout({
    coreLayout: hierarchicLayout,
    interEdgeRouter: edgeRouter,
    interEdgesDpKey: edgeRouter.affectedEdgesDpKey
  })

  // use the split ids from the edge tags
  const layoutData = new RecursiveGroupLayoutData({
    sourceSplitIds: (edge) => (edge.tag && edge.tag.sourceSplitId ? edge.tag.sourceSplitId : null),
    targetSplitIds: (edge) => (edge.tag && edge.tag.targetSplitId ? edge.tag.targetSplitId : null)
  }).combineWith(
    new HierarchicLayoutData({
      edgeThickness: 3
    })
  )

  graphComponent.graph.mapperRegistry.createConstantMapper(
    GroupingKeys.GROUP_NODE_INSETS_DP_KEY,
    new YInsets(35, 20, 20, 20)
  )

  setUIDisabled(true)
  await graphComponent.morphLayout(recursiveGroupLayout, '700ms', layoutData)
  setUIDisabled(false)

  graphComponent.graph.mapperRegistry.removeMapper(GroupingKeys.GROUP_NODE_INSETS_DP_KEY)
}

/**
 * Initializes graph defaults.
 */
function initializeDefaults() {
  const graph = graphComponent.graph

  graph.nodeDefaults.style = createDemoNodeStyle('demo-palette-58')
  graph.nodeDefaults.size = new Size(50, 30)

  graph.groupNodeDefaults.style = createDemoGroupStyle({ colorSetName: 'demo-palette-58' })

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '3px #4E4E4E',
    targetArrow: new Arrow({
      fill: '#4E4E4E',
      type: 'triangle',
      scale: 1.5
    }),
    smoothingLength: 15
  })
  graph.edgeDefaults.shareStyleInstance = false

  graphComponent.selectionIndicatorManager = new GraphSelectionIndicatorManager({
    edgeStyle: new HighlightEdgeStyle()
  })
}

/**
 * Sets a {@link GraphEditorInputMode} and initializes the context menu.
 */
function configureInteraction() {
  graphComponent.inputMode = new GraphEditorInputMode({
    selectableItems: GraphItemTypes.EDGE | GraphItemTypes.NODE,
    allowGroupingOperations: true
  })

  const contextMenuSupport = new ContextMenuSupport(graphComponent, runLayout)
  contextMenuSupport.createContextMenu()
}

/**
 * Binds the various actions to the buttons in the toolbar.
 */
function initializeUI() {
  document.querySelector('#layout').addEventListener('click', runLayout)
  document.querySelector('#reset').addEventListener('click', loadGraph)
}

/**
 * Disables the HTML elements of the UI.
 * @param {boolean} disabled true if the element should be disabled, false otherwise
 */
function setUIDisabled(disabled) {
  document.querySelector('#layout').disabled = disabled
  document.querySelector('#reset').disabled = disabled
  graphComponent.inputMode.enabled = !disabled
}

/**
 * An edge style to draw the selection highlight 'below' the edge.
 */
class HighlightEdgeStyle extends EdgeStyleBase {
  /**
   * @param {!IRenderContext} context
   * @param {!IEdge} edge
   * @returns {!Visual}
   */
  createVisual(context, edge) {
    const edgeStyle = edge.style
    const strokeColor = edgeStyle.stroke.fill?.color
    const highlightColor = `rgb(${strokeColor.r}, ${strokeColor.g}, ${strokeColor.b})`
    const visualGroup = new SvgVisualGroup()
    const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const highlightPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const path = this.cropPath(
      edge,
      edgeStyle.sourceArrow,
      edgeStyle.targetArrow,
      this.getPath(edge)
    ).createSmoothedPath(15, SmoothingPolicy.ASYMMETRIC, true)
    highlightPath.setAttribute('d', path.createSvgPathData())
    highlightPath.setAttribute('stroke', highlightColor)
    highlightPath.setAttribute('stroke-width', '6px')
    highlightPath.setAttribute('fill', 'none')
    this.addArrows(
      context,
      highlight,
      edge,
      path,
      IArrow.NONE,
      new Arrow({
        color: highlightColor,
        scale: 1.7,
        type: ArrowType.TRIANGLE
      })
    )
    highlight.appendChild(highlightPath)
    highlight.setAttribute('opacity', '0.75')

    const highlightVisual = new SvgVisual(highlight)
    visualGroup.add(highlightVisual)
    visualGroup.add(edge.style.renderer.getVisualCreator(edge, edge.style).createVisual(context))

    return visualGroup
  }
}

run().then(finishLoading)
