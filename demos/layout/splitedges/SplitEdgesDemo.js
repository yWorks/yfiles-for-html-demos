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
  Arrow,
  ArrowType,
  CompositeLayoutData,
  EdgeRouter,
  EdgeRouterScope,
  EdgeStyleBase,
  EdgeStyleDecorationInstaller,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GroupingKeys,
  HierarchicLayout,
  HierarchicLayoutData,
  IArrow,
  ICommand,
  IEdge,
  IRenderContext,
  Insets,
  LayoutOrientation,
  License,
  PolylineEdgeStyle,
  RecursiveGroupLayout,
  RecursiveGroupLayoutData,
  SmoothingPolicy,
  StyleDecorationZoomPolicy,
  SvgVisual,
  SvgVisualGroup
} from 'yfiles'

import ContextMenuSupport from './ContextMenuSupport.js'
import { DemoGroupStyle, DemoNodeStyle } from '../../resources/demo-styles.js'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/** @type {GraphComponent} */
let graphComponent = null

function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  configureInteraction()
  createSampleGraph()
  registerCommands()
  showApp(graphComponent)
}

/**
 * Runs a {@link RecursiveGroupLayout} with {@link HierarchicLayout} as its core
 * layout.
 */
function runLayout() {
  const hierarchicLayout = new HierarchicLayout({
    layoutOrientation: LayoutOrientation.LEFT_TO_RIGHT
  })
  hierarchicLayout.edgeLayoutDescriptor.directGroupContentEdgeRouting = true
  hierarchicLayout.nodePlacer.barycenterMode = true

  const edgeRouter = new EdgeRouter({
    scope: EdgeRouterScope.ROUTE_AFFECTED_EDGES
  })
  edgeRouter.defaultEdgeLayoutDescriptor.directGroupContentEdgeRouting = true

  const recursiveGroupLayout = new RecursiveGroupLayout({
    coreLayout: hierarchicLayout,
    interEdgeRouter: edgeRouter,
    interEdgesDpKey: edgeRouter.affectedEdgesDpKey
  })

  // use the split ids from the edge tags
  const layoutData = new CompositeLayoutData(
    new RecursiveGroupLayoutData({
      sourceSplitIds: edge => (edge.tag && edge.tag.sourceSplitId ? edge.tag.sourceSplitId : null),
      targetSplitIds: edge => (edge.tag && edge.tag.targetSplitId ? edge.tag.targetSplitId : null)
    }),
    new HierarchicLayoutData({
      edgeThickness: 3
    })
  )

  graphComponent.graph.mapperRegistry.createConstantMapper(
    GroupingKeys.GROUP_NODE_INSETS_DP_KEY,
    new Insets(20, 35, 20, 20)
  )

  setUIDisabled(true)
  graphComponent.morphLayout(recursiveGroupLayout, '700ms', layoutData).then(() => {
    setUIDisabled(false)
  })
}

/**
 * Creates a simple sample graph.
 */
function createSampleGraph() {
  const graph = graphComponent.graph
  graph.clear()
  initializeDefaults()

  const nodes = []
  for (let i = 0; i < 8; i++) {
    nodes.push(graph.createNode())
  }
  const groupNode1 = graph.createGroupNode()
  graph.groupNodes(groupNode1, nodes.slice(0, 2))
  const groupNode2 = graph.createGroupNode()
  graph.groupNodes(groupNode2, nodes.slice(2, 5))
  const groupNode3 = graph.createGroupNode()
  graph.groupNodes(groupNode3, [groupNode2])

  graph.createEdge({
    source: nodes[0],
    target: groupNode1,
    tag: { targetSplitId: 'split0', color: 'crimson' }
  })
  graph.createEdge({
    source: groupNode1,
    target: groupNode3,
    tag: { sourceSplitId: 'split0', targetSplitId: 'split0', color: 'crimson' }
  })
  graph.createEdge({
    source: groupNode3,
    target: groupNode2,
    tag: { sourceSplitId: 'split0', targetSplitId: 'split0', color: 'crimson' }
  })
  graph.createEdge({
    source: groupNode2,
    target: nodes[2],
    tag: { sourceSplitId: 'split0', color: 'crimson' }
  })
  graph.createEdge({
    source: nodes[1],
    target: groupNode3,
    tag: { targetSplitId: 'split1', color: 'darkturquoise' }
  })
  graph.createEdge({
    source: groupNode3,
    target: nodes[3],
    tag: { sourceSplitId: 'split1', color: 'darkturquoise' }
  })
  graph.createEdge({
    source: groupNode3,
    target: nodes[5],
    tag: { sourceSplitId: 'split2', color: 'cornflowerblue' }
  })
  graph.createEdge({
    source: nodes[4],
    target: groupNode3,
    tag: { targetSplitId: 'split2', color: 'cornflowerblue' }
  })
  graph.createEdge({
    source: groupNode2,
    target: groupNode3,
    tag: { targetSplitId: 'split3', color: 'darkslateblue' }
  })
  graph.createEdge({
    source: groupNode3,
    target: nodes[6],
    tag: { sourceSplitId: 'split3', color: 'darkslateblue' }
  })
  graph.createEdge({
    source: nodes[0],
    target: nodes[7]
  })
  graph.createEdge({
    source: nodes[2],
    target: nodes[4]
  })
  graph.createEdge({
    source: nodes[3],
    target: nodes[4]
  })

  graph.edges.forEach(edge => {
    if (edge.tag && (edge.tag.sourceSplitId || edge.tag.targetSplitId)) {
      edge.style.stroke = `3px ${edge.tag.color}`
      edge.style.targetArrow = new Arrow({
        fill: edge.tag.color,
        type: ArrowType.TRIANGLE,
        scale: 1.5
      })
    }
  })

  runLayout()
}

/**
 * Initializes graph defaults.
 */
function initializeDefaults() {
  const graph = graphComponent.graph
  graph.nodeDefaults.style = new DemoNodeStyle()
  graph.nodeDefaults.style.cssClass = 'node-color'
  graph.nodeDefaults.size = [50, 30]

  graph.groupNodeDefaults.style = new DemoGroupStyle()
  graph.groupNodeDefaults.style.cssClass = 'group-border'

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '3px #BBBBBB',
    targetArrow: new Arrow({
      fill: '#BBBBBB',
      type: ArrowType.TRIANGLE,
      scale: 1.5
    }),
    smoothingLength: 15
  })
  graph.edgeDefaults.shareStyleInstance = false

  graph.decorator.edgeDecorator.selectionDecorator.setImplementation(
    new EdgeStyleDecorationInstaller({
      edgeStyle: new HighlightEdgeStyle(),
      zoomPolicy: StyleDecorationZoomPolicy.WORLD_COORDINATES
    })
  )
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
function registerCommands() {
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='GroupSelection']", ICommand.GROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='UngroupSelection']", ICommand.UNGROUP_SELECTION, graphComponent)
  bindAction("button[data-command='Layout']", () => runLayout())
  bindAction("button[data-command='Reset']", createSampleGraph)
}

/**
 * Disables the HTML elements of the UI.
 * @param disabled true if the element should be disabled, false otherwise
 */
function setUIDisabled(disabled) {
  document.querySelector("button[data-command='Layout']").disabled = disabled
  document.querySelector("button[data-command='Reset']").disabled = disabled
  graphComponent.inputMode.enabled = !disabled
}

/**
 * An edge style to draw the selection highlight 'below' the edge.
 */
class HighlightEdgeStyle extends EdgeStyleBase {
  /**
   * @param {IRenderContext} context
   * @param {IEdge} edge
   * @returns {Visual}
   */
  createVisual(context, edge) {
    const strokeColor = edge.style.stroke.fill.color
    const highlightColor = `rgba(${strokeColor.r}, ${strokeColor.g}, ${strokeColor.b})`
    const visualGroup = new SvgVisualGroup()
    const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const highlightPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const path = this.cropPath(
      edge,
      edge.style.sourceArrow,
      edge.style.targetArrow,
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

loadJson().then(run)
