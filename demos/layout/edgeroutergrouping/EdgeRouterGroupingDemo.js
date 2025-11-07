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
  Arrow,
  ArrowType,
  BridgeCrossingStyle,
  BridgeManager,
  EdgeRouter,
  EdgeRouterData,
  EdgeStyleBase,
  EdgeStyleIndicatorRenderer,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphObstacleProvider,
  IArrow,
  IEdge,
  INode,
  IPortStyle,
  LayoutExecutor,
  License,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeShape,
  ShapePortStyle,
  SmoothingPolicy,
  SvgVisual,
  SvgVisualGroup
} from '@yfiles/yfiles'

import SampleData from './resources/SampleData'
import { createDemoNodeStyle, initDemoStyles } from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'

let graphComponent

let portGroupMode = false

async function run() {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')
  configureInteraction()
  createSampleGraph()
  initializeUI()
}

/**
 * Applies the {@link EdgeRouter} to the current graph including the edge/port group information in
 * the edges' tags.
 */
async function runEdgeRouter() {
  setUIDisabled(true)

  const layout = new EdgeRouter()
  const layoutData = new EdgeRouterData()

  if (portGroupMode) {
    layoutData.ports.sourcePortGroupIds = (edge) =>
      edge.tag && edge.tag.sourceGroupId ? edge.tag.sourceGroupId : null
    layoutData.ports.targetPortGroupIds = (edge) =>
      edge.tag && edge.tag.targetGroupId ? edge.tag.targetGroupId : null
  } else {
    layoutData.sourceGroupIds = (edge) =>
      edge.tag && edge.tag.sourceGroupId ? edge.tag.sourceGroupId : null
    layoutData.targetGroupIds = (edge) =>
      edge.tag && edge.tag.targetGroupId ? edge.tag.targetGroupId : null
  }

  // Ensure that the LayoutExecutor class is not removed by build optimizers
  // It is needed for the 'applyLayoutAnimated' method in this demo.
  LayoutExecutor.ensure()

  await graphComponent.applyLayoutAnimated(layout, '700ms', layoutData)
  setUIDisabled(false)
}

function createSampleGraph() {
  const graph = graphComponent.graph
  graph.clear()
  initDemoStyles(graph, { extraCropLength: 0 })
  graph.nodeDefaults.style = createDemoNodeStyle('demo-palette-44')
  graph.nodeDefaults.size = [50, 30]
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '3px #BBBBBB',
    targetArrow: new Arrow({ fill: '#BBBBBB', type: ArrowType.TRIANGLE }),
    smoothingLength: 15
  })
  graph.edgeDefaults.shareStyleInstance = false

  graph.decorator.edges.selectionRenderer.addConstant(
    new EdgeStyleIndicatorRenderer({
      edgeStyle: new HighlightEdgeStyle(),
      zoomPolicy: 'world-coordinates'
    })
  )

  const bridgeManager = new BridgeManager({
    canvasComponent: graphComponent,
    defaultBridgeCrossingStyle: BridgeCrossingStyle.GAP
  })
  bridgeManager.addObstacleProvider(new GraphObstacleProvider())

  const defaultNodeSize = graph.nodeDefaults.size
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: SampleData.nodes,
    id: 'id',
    layout: (data) =>
      new Rect(data.location.x, data.location.y, defaultNodeSize.width, defaultNodeSize.height),
    tag: (data) => ({ id: data.id })
  })
  builder.createEdgesSource(SampleData.edges, 'from', 'to', 'id')
  builder.buildGraph()

  graph.edges.forEach((edge) => {
    edge.tag = edge.tag.groupIds
    updateStyles(edge)
  })

  graphComponent.fitGraphBounds()
  runEdgeRouter()
}

/**
 * Updates the selection when an item is right-clicked for a context menu.
 */
function updateSelection(item) {
  const selection = graphComponent.selection
  if (item) {
    if (!selection.includes(item)) {
      selection.clear()
      selection.add(item)
    } else {
      if (item instanceof IEdge) {
        selection.nodes.clear()
      } else {
        selection.edges.clear()
      }
      selection.add(item)
    }
  }
}

/**
 * Groups the given edges according to the type. In case 'override' is true, a new tag is set.
 */
function groupEdges(type, edges, override) {
  const id = Date.now()
  edges.forEach((edge) => {
    const tag = { sourceGroupId: undefined, targetGroupId: undefined }
    switch (type) {
      case 'source':
        tag.sourceGroupId = `s ${id} ${hashCode(edge.sourceNode)}`
        break
      case 'target':
        tag.targetGroupId = `t ${id} ${hashCode(edge.targetNode)}`
        break
      case 'source-and-target':
        tag.sourceGroupId = `s ${id} ${hashCode(edge.sourceNode)}`
        tag.targetGroupId = `t ${id} ${hashCode(edge.targetNode)}`
        break
      default:
    }

    if (!edge.tag || override || type === 'ungroup') {
      edge.tag = tag
    } else {
      edge.tag.sourceGroupId = tag.sourceGroupId || edge.tag.sourceGroupId
      edge.tag.targetGroupId = tag.targetGroupId || edge.tag.targetGroupId
    }
    updateStyles(edge)
  })

  runEdgeRouter()
}

/**
 * Returns the hash code of the given node.
 */
function hashCode(node) {
  return node.hashCode()
}

/**
 * Updates the styles to distinguish the different types of edge/port grouping.
 */
function updateStyles(edge) {
  const tag = edge.tag
  if (!tag) {
    return // the ungrouped edge default
  }

  let color = '#BBBBBB'
  if (portGroupMode) {
    if (tag.sourceGroupId && tag.targetGroupId) {
      color = '#FFA500'
    } else if (tag.sourceGroupId) {
      color = '#DC143C'
    } else if (tag.targetGroupId) {
      color = '#D2691E'
    }
  } else if (tag.sourceGroupId && tag.targetGroupId) {
    color = '#6495ED'
  } else if (tag.sourceGroupId) {
    color = '#4169E1'
  } else if (tag.targetGroupId) {
    color = '#483D8B'
  }

  const portStyle = new ShapePortStyle({
    shape: ShapeNodeShape.ELLIPSE,
    fill: color,
    stroke: null,
    renderSize: [7, 7]
  })
  if (tag.sourceGroupId) {
    graphComponent.graph.setStyle(edge.sourcePort, portStyle)
  } else {
    graphComponent.graph.setStyle(edge.sourcePort, IPortStyle.VOID_PORT_STYLE)
  }
  if (tag.targetGroupId) {
    graphComponent.graph.setStyle(edge.targetPort, portStyle)
  } else {
    graphComponent.graph.setStyle(edge.targetPort, IPortStyle.VOID_PORT_STYLE)
  }

  graphComponent.graph.setStyle(
    edge,
    new PolylineEdgeStyle({
      stroke: `3px ${color}`,
      targetArrow: new Arrow({
        fill: color,
        stroke: color,
        type: ArrowType.TRIANGLE,
        cropLength: tag.targetGroupId ? 4 : 0.5
      }),
      smoothingLength: 15
    })
  )
}

/**
 * Sets a {@link GraphEditorInputMode} and initializes the context menu.
 */
function configureInteraction() {
  const inputMode = new GraphEditorInputMode({
    selectableItems: GraphItemTypes.EDGE | GraphItemTypes.NODE
  })

  inputMode.addEventListener('populate-item-context-menu', (evt) => populateContextMenu(evt))
  graphComponent.inputMode = inputMode
}

/**
 * Adds menu items to the context menu depending on what type of graph element was hit.
 */
function populateContextMenu(args) {
  if (args.handled) {
    return
  }

  let item = args.item
  const selection = graphComponent.selection
  if (!item && selection.edges.size > 0) {
    item = selection.edges.first()
  }
  updateSelection(item)

  const menuItems = []
  if (item instanceof IEdge) {
    const selectedEdges = selection.edges.toArray()
    if (portGroupMode) {
      menuItems.push({
        label: 'Source Port Group',
        action: () => groupEdges('source', selectedEdges, true),
        cssClass: 'source-port-group'
      })
      menuItems.push({
        label: 'Target Port Group',
        action: () => groupEdges('target', selectedEdges, true),
        cssClass: 'target-port-group'
      })
      menuItems.push({
        label: 'Source and Target Port Group',
        action: () => groupEdges('source-and-target', selectedEdges, true),
        cssClass: 'source-and-target-port-group'
      })
    } else {
      menuItems.push({
        label: 'Source Group',
        action: () => groupEdges('source', selectedEdges, true),
        cssClass: 'source-edge-group'
      })
      menuItems.push({
        label: 'Target Group',
        action: () => groupEdges('target', selectedEdges, true),
        cssClass: 'target-edge-group'
      })
      menuItems.push({
        label: 'Source and Target Group',
        action: () => groupEdges('source-and-target', selectedEdges, true),
        cssClass: 'source-and-target-edge-group'
      })
    }
    menuItems.push({ label: 'Ungroup', action: () => groupEdges('ungroup', selectedEdges, true) })
  } else if (item instanceof INode) {
    let outgoingEdges = []
    let incomingEdges = []
    let incidentEdges = []
    selection.nodes.forEach((node) => {
      outgoingEdges = outgoingEdges.concat(graphComponent.graph.outEdgesAt(node).toArray())
      incomingEdges = incomingEdges.concat(graphComponent.graph.inEdgesAt(node).toArray())
      incidentEdges = incidentEdges.concat(graphComponent.graph.edgesAt(node).toArray())
    })
    if (portGroupMode) {
      menuItems.push({
        label: 'Port Group Outgoing Edges',
        action: () => groupEdges('source', outgoingEdges, false),
        cssClass: 'source-port-group'
      })
      menuItems.push({
        label: 'Port Group Incoming Edges',
        action: () => groupEdges('target', incomingEdges, false),
        cssClass: 'target-port-group'
      })
      menuItems.push({
        label: 'Port Group Incident Edges',
        action: () => {
          groupEdges('source', outgoingEdges, false)
          groupEdges('target', incomingEdges, false)
        },
        cssClass: 'source-and-target-port-group'
      })
    } else {
      menuItems.push({
        label: 'Group Outgoing Edges',
        action: () => groupEdges('source', outgoingEdges, false),
        cssClass: 'source-edge-group'
      })
      menuItems.push({
        label: 'Group Incoming Edges',
        action: () => groupEdges('target', incomingEdges, false),
        cssClass: 'target-edge-group'
      })
      menuItems.push({
        label: 'Group Incident Edges',
        action: () => groupEdges('source-and-target', incidentEdges, false),
        cssClass: 'source-and-target-edge-group'
      })
    }
    menuItems.push({
      label: 'Ungroup Incident Edges',
      action: () => groupEdges('ungroup', incidentEdges, false)
    })
  } else {
    const allEdges = graphComponent.graph.edges.toArray()
    if (portGroupMode) {
      menuItems.push({
        label: 'Source Port Group All Edges',
        action: () => groupEdges('source', allEdges, true),
        cssClass: 'source-port-group'
      })
      menuItems.push({
        label: 'Target Port Group All Edges',
        action: () => groupEdges('target', allEdges, true),
        cssClass: 'target-port-group'
      })
      menuItems.push({
        label: 'Source and Target Port Group All Edges',
        action: () => groupEdges('source-and-target', allEdges, true),
        cssClass: 'source-and-target-port-group'
      })
    } else {
      menuItems.push({
        label: 'Source Group All Edges',
        action: () => groupEdges('source', allEdges, true),
        cssClass: 'source-edge-group'
      })
      menuItems.push({
        label: 'Target Group All Edges',
        action: () => groupEdges('target', allEdges, true),
        cssClass: 'target-edge-group'
      })
      menuItems.push({
        label: 'Source and Target Group All Edges',
        action: () => groupEdges('source-and-target', allEdges, true),
        cssClass: 'source-and-target-edge-group'
      })
    }
    menuItems.push({
      label: 'Ungroup All Edges',
      action: () => groupEdges('ungroup', allEdges, true)
    })
  }
  if (menuItems.length > 0) {
    args.contextMenu = menuItems
  }
}

/**
 * Binds the various actions to the buttons in the toolbar.
 */
function initializeUI() {
  document.querySelector('#layout').addEventListener('click', runEdgeRouter)
  document.querySelector('#reset').addEventListener('click', createSampleGraph)
  document.querySelector('#toggle-port-group-mode').addEventListener('change', async (evt) => {
    const value = evt.target.value
    portGroupMode = value === 'port-grouping'
    graphComponent.graph.edges.forEach((edge) => {
      updateStyles(edge)
    })
    await runEdgeRouter()
  })
}

/**
 * Disables the HTML elements of the UI.
 * @param disabled true if the element should be disabled, false otherwise
 */
function setUIDisabled(disabled) {
  document.querySelector('#reset').disabled = disabled
  document.querySelector('#layout').disabled = disabled
  document.querySelector('#toggle-port-group-mode').disabled = disabled
  graphComponent.inputMode.enabled = !disabled
}

/**
 * An edge style to draw the selection highlight 'below' the edge.
 */
class HighlightEdgeStyle extends EdgeStyleBase {
  createVisual(context, edge) {
    const style = edge.style
    const highlightColor = style.stroke.fill.value
    const visualGroup = new SvgVisualGroup()
    const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const highlightPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const path = this.cropPath(
      edge,
      style.sourceArrow,
      style.targetArrow,
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
        fill: highlightColor,
        lengthScale: 1.5,
        widthScale: 1.5,
        type: ArrowType.TRIANGLE
      })
    )
    highlight.appendChild(highlightPath)
    highlight.setAttribute('opacity', '0.75')

    const highlightVisual = new SvgVisual(highlight)
    visualGroup.add(highlightVisual)
    visualGroup.add(style.renderer.getVisualCreator(edge, style).createVisual(context))

    return visualGroup
  }
}

run().then(finishLoading)
