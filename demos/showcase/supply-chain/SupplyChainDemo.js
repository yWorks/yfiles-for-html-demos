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
  FolderNodeConverter,
  FoldingManager,
  FreeNodePortLocationModel,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  HierarchicalLayout,
  HierarchicalLayoutData,
  IEdge,
  LayoutExecutor,
  LayoutOrientation,
  License,
  PolylineEdgeStyle,
  PortPlacementPolicy,
  Rect,
  Size
} from '@yfiles/yfiles'
import { finishLoading } from '@yfiles/demo-app/demo-page'
import { createNodeContainerHTML, ListNodeStyle } from './styles/ListNodeStyle'
import { findNeighbors, produceStock, sellStock } from './utils/graph-logic'
import { testGraphData } from './resources/bakery-graph-data'
import { foldingLayout } from './utils/folding-layout'
import { buildPropertyElementId, buildSourcePortId, buildTargetPortId } from './utils/helpers'
import { initGraphStyles } from './styles/default-graph-styles'
import { PortMapWrapper } from './utils/PortMapWrapper'
import { NodeTag } from './utils/NodeTag'
import licenseValue from '../../../lib/license.json'

License.value = licenseValue

let graphComponent
let portMapWrapper
let viewGraph
let inputMode

const nodeWidth = 220
const fallbackNodeHeight = 100

/**
 * Initializes the graph component, sets up the graph viewer input mode, and applies graph styles.
 * Builds and folds the graph, sets up interactions, and runs the graph layout.
 */
async function run() {
  graphComponent = new GraphComponent('#graphComponent')
  graphComponent.contentMargins = 30
  inputMode = new GraphViewerInputMode({ focusableItems: 'none' })
  graphComponent.inputMode = inputMode

  initDemoDescription()

  viewGraph = initFolding()

  initInteractions()

  initGraphStyles(viewGraph)

  await buildGraph()

  finishLoading()

  await runLayout()
}

/**
 * Creates the HTML structure to be rendered inside the demo description bar. The content includes several
 * example nodes that illustrate the possible graph interactions.
 */
function initDemoDescription() {
  const examples = [
    {
      elementId: 'example-node-1',
      nodeId: 'ne-grain-coop-reims',
      class: 'disable-hover',
      colorGroupId: 1,
      onClick: () => {},
      onlyDisplayFirstProperty: false,
      propertyTag: []
    },
    {
      elementId: 'example-node-2',
      nodeId: 'brittany-egg-center',
      class: 'highlight-first-prop',
      colorGroupId: 2,
      onClick: (e) =>
        onPropertyElementClick(e, buildPropertyElementId('brittany-egg-center', 'p1')),
      onlyDisplayFirstProperty: true,
      propertyTag: []
    },
    {
      elementId: 'example-node-3',
      nodeId: 'paris-patisserie',
      class: 'highlight-first-prop-and-show-button',
      colorGroupId: 3,
      onClick: (e) => onPropertyElementClick(e, buildPropertyElementId('paris-patisserie', 'p1')),
      onlyDisplayFirstProperty: true,
      propertyTag: []
    },
    {
      elementId: 'example-node-4',
      nodeId: 'strasbourg-river-mill',
      class: 'disable-hover',
      colorGroupId: 1,
      onClick: () => {},
      onlyDisplayFirstProperty: false,
      propertyTag: [
        {
          elementId: buildPropertyElementId('strasbourg-river-mill', 'p1'),
          toHighlight: false,
          toFlash: false,
          toAlert: true,
          toFlashAlert: false,
          stock: 0
        }
      ]
    }
  ]

  for (const example of examples) {
    const div = document.getElementById(example.elementId)
    // clone node data to not affect the graph's data
    const nodeData = structuredClone(testGraphData.nodes.find((node) => node.id === example.nodeId))
    if (!div || !nodeData) continue
    if (example.onlyDisplayFirstProperty) {
      nodeData.properties = [nodeData.properties[0]]
    }
    div.style.width = `${nodeWidth}px`
    div.classList.add('example-node-container')
    div.classList.add(example.class)
    createNodeContainerHTML(
      div,
      nodeData,
      example.colorGroupId,
      new NodeTag('1', 1, example.propertyTag),
      (e) => example.onClick(e),
      true
    )
  }
}

/**
 * Initializes the folding manager and attaches event listeners for group expansion and collapsing
 * to handle neighbor highlighting.
 */
function initFolding() {
  const foldingManager = new FoldingManager()
  foldingManager.folderNodeConverter = new FolderNodeConverter({
    folderNodeDefaults: { copyLabels: true, size: new Size(nodeWidth, fallbackNodeHeight) }
  })
  const foldingView = foldingManager.createFoldingView()
  graphComponent.graph = foldingView.graph

  foldingLayout(graphComponent) // adapted from hierarchical nesting demo

  const navigationInputMode = inputMode.navigationInputMode
  navigationInputMode.addEventListener('group-expanded', () =>
    setTimeout(() => highlightNeighbors())
  )
  navigationInputMode.addEventListener('group-collapsed', () =>
    setTimeout(() => highlightNeighbors())
  )

  return graphComponent.graph
}

/**
 * Initializes interactions, including zoom limits, edge click event handling, item selection, hover,
 * and clear highlights.
 */
function initInteractions() {
  graphComponent.maximumZoom = 5
  graphComponent.minimumZoom = 0.05

  inputMode.addEventListener('item-clicked', (event, _) => {
    if (!(event.item instanceof IEdge)) return

    const edge = event.item
    clearNeighborHighlights()
    findNeighbors(graphComponent, portMapWrapper, edge)
    highlightNeighbors()
  })

  inputMode.selectableItems = GraphItemTypes.NONE
  inputMode.itemHoverInputMode.hoverItems = GraphItemTypes.EDGE
  inputMode.itemHoverInputMode.addEventListener('hovered-item-changed', ({ item, oldItem }) => {
    // highlight new item
    if (item instanceof IEdge) {
      const newStyle = item.style
      newStyle.cssClass = `${newStyle.cssClass} edge-hovering`
    }
    // de-highlight old item
    if (oldItem instanceof IEdge) {
      const oldStyle = oldItem.style
      oldStyle.cssClass = oldStyle.cssClass.replace('edge-hovering', '')
    }

    graphComponent.invalidate()
  })

  document
    .getElementById('clear-highlights')
    ?.addEventListener('click', () => clearNeighborHighlights())

  inputMode.addEventListener('canvas-clicked', () => clearNeighborHighlights())
}

/**
 * Builds the graph by processing the bakery data and creating group nodes, nodes, as well as the
 * list of properties within each node. Edges are routed between source and target ports which are
 * mapped to property HTML elements.
 */
async function buildGraph() {
  const groupNodeIdToGroupNode = new Map()
  const groupNodeIdToColorGroupId = new Map()
  const nodeIdToNode = new Map()
  portMapWrapper = new PortMapWrapper(viewGraph)
  const portLocationModel = new FreeNodePortLocationModel()

  for (let i = 0; i < testGraphData.groups.length; i++) {
    const group = testGraphData.groups[i]
    const groupNode = viewGraph.createGroupNode()
    viewGraph.addLabel(groupNode, group.headline)
    groupNodeIdToGroupNode.set(group.id, groupNode)
    groupNodeIdToColorGroupId.set(group.id, (i % 5) + 1)
  }

  for (const nodeData of testGraphData.nodes) {
    let colorGroupId = 0
    if (nodeData.groupId) {
      colorGroupId = groupNodeIdToColorGroupId.get(nodeData.groupId) ?? 0
    }

    const nodeTag = new NodeTag(
      nodeData.id,
      nodeData.layer ? nodeData.layer : 0,
      nodeData.properties.map((prop) => ({
        elementId: buildPropertyElementId(nodeData.id, prop.id),
        toHighlight: false,
        toFlash: false,
        toAlert: false,
        toFlashAlert: false,
        stock: prop.stock
      }))
    )

    const node = viewGraph.createNode({
      layout: new Rect(0, 0, nodeWidth, fallbackNodeHeight),
      style: new ListNodeStyle(nodeData, onPropertyElementClick, colorGroupId),
      tag: nodeTag,
      parent: nodeData.groupId ? groupNodeIdToGroupNode.get(nodeData.groupId) : null
    })
    nodeIdToNode.set(nodeData.id, node)
  }

  // call updateVisual to be able to access the node's HTML inside the DOM for port location calculations
  graphComponent.updateVisual()

  viewGraph.nodes
    .filter((node) => !viewGraph.isGroupNode(node) && !viewGraph.foldingView.isInFoldingState(node))
    .forEach((node) => {
      // calculate the height of the node's div container
      const helperDivHeight =
        document.getElementById(node.tag.id)?.getBoundingClientRect().height ?? 50
      viewGraph.setNodeLayout(node, new Rect(0, 0, nodeWidth, helperDivHeight))
    })

  for (const nodeData of testGraphData.nodes) {
    for (const property of nodeData.properties) {
      const sourcePortId = buildSourcePortId(nodeData.id, property.id)
      const targetPortId = buildTargetPortId(nodeData.id, property.id)
      const propertyElementId = buildPropertyElementId(nodeData.id, property.id)

      const propertyElement = document.getElementById(propertyElementId)
      const nodeContent = propertyElement?.parentElement?.parentElement
      const nodeContainer = document.querySelector('.node-container')
      let borderWidth = 0
      if (nodeContainer)
        borderWidth = parseInt(
          getComputedStyle(nodeContainer).getPropertyValue('border-width').split('px')[0]
        )
      let deltaY = 50
      if (propertyElement && nodeContent) {
        // calculate the property's y coordinate offset within its node
        deltaY =
          propertyElement.getBoundingClientRect().top -
          nodeContent.getBoundingClientRect().top +
          propertyElement.getBoundingClientRect().height / 2 +
          borderWidth
      }

      const sourcePort = viewGraph.addPort({
        tag: { id: sourcePortId, toHighlight: false },
        owner: nodeIdToNode.get(nodeData.id),
        locationParameter: portLocationModel.createParameterForRatios([1, 0], [0, deltaY])
      })
      portMapWrapper.setViewPort(sourcePortId, sourcePort)

      const targetPort = viewGraph.addPort({
        tag: { id: targetPortId, toHighlight: false },
        owner: nodeIdToNode.get(nodeData.id),
        locationParameter: portLocationModel.createParameterForRatios([0, 0], [0, deltaY])
      })
      portMapWrapper.setViewPort(targetPortId, targetPort)
    }
  }

  for (const edgeData of testGraphData.edges) {
    const sourcePortId = buildSourcePortId(edgeData.source.nodeId, edgeData.source.propertyId)
    const targetPortId = buildTargetPortId(edgeData.target.nodeId, edgeData.target.propertyId)

    viewGraph.createEdge({
      sourcePort: portMapWrapper.getViewPort(sourcePortId),
      targetPort: portMapWrapper.getViewPort(targetPortId),
      tag: { toHighlight: false },
      style: new PolylineEdgeStyle({
        smoothingLength: 50,
        stroke: 'currentColor',
        cssClass: 'bold-edge'
      })
    })
  }
}

/**
 * Handles the click event on a property element and triggers either a neighbor search or
 * produce / sell logic depending on the element that triggered the event.
 */
function onPropertyElementClick(e, propertyElementId) {
  const eventTriggerElement = e.target
  const eventListenerElement = e.currentTarget
  const currentPropertyElementId = propertyElementId ? propertyElementId : eventListenerElement.id

  if (eventTriggerElement.classList.contains('produce')) {
    produceStock(graphComponent, portMapWrapper, currentPropertyElementId)
  } else if (eventTriggerElement.classList.contains('sell')) {
    sellStock(graphComponent, portMapWrapper, currentPropertyElementId)
  } else {
    clearNeighborHighlights()
    findNeighbors(graphComponent, portMapWrapper, currentPropertyElementId)
    highlightNeighbors()
  }
}

/**
 * Runs the initial graph layout.
 */
async function runLayout() {
  const layout = new HierarchicalLayout({
    layoutOrientation: LayoutOrientation.LEFT_TO_RIGHT,
    minimumLayerDistance: 40,
    fromScratchLayeringStrategy: 'hierarchical-topmost'
  })
  layout.defaultEdgeDescriptor.routingStyleDescriptor.defaultRoutingStyle = 'polyline'

  const hierarchicalLayoutData = new HierarchicalLayoutData()

  // in the bakery data set, each node contains a 'layer' number that determines its horizontal
  // position (column) in the left-to-right hierarchical layout; these layer constraints ensure
  // that locations appearing earlier in the supply chain (e.g., farms) are positioned to the
  // left of locations that come later (e.g., bakeries)
  const layerConstraints = hierarchicalLayoutData.layerConstraints
  viewGraph.nodes
    .filter((node) => !viewGraph.isGroupNode(node) && !viewGraph.foldingView.isInFoldingState(node))
    .forEach((node) => {
      const tag = node.tag
      if (tag.layer > 0) {
        layerConstraints.nodeComparables.mapper.set(node, tag.layer)
      }
    })

  const executor = new LayoutExecutor({
    graphComponent: graphComponent,
    layout: layout,
    layoutData: hierarchicalLayoutData,
    portPlacementPolicies: PortPlacementPolicy.KEEP_PARAMETER,
    animateViewport: true,
    easedAnimation: true,
    animationDuration: '0s'
  })
  await executor.start()
}

/**
 * Highlights edges and ports depending on their `toHighlight` property in the tag object.
 */
function highlightNeighbors() {
  viewGraph.edges.forEach((edge) => {
    if (edge.tag.toHighlight) {
      graphComponent.highlights.add(edge)
    }
  })

  viewGraph.ports.forEach((port) => {
    if (port.tag.toHighlight) {
      graphComponent.highlights.add(port)
    }
  })

  // node property highlighting handled in updateVisual in ListNodeStyle
}

/**
 * Clears all highlighting state for edges, ports, and nodes by resetting the `toHighlight` property
 * in the tag objects. Clears all highlights in the graph.
 */
function clearNeighborHighlights() {
  const masterGraph = viewGraph.foldingView?.manager.masterGraph
  if (!masterGraph) return

  masterGraph.edges.forEach((edge) => {
    edge.tag = { ...edge.tag, toHighlight: false }
  })

  masterGraph.ports.forEach((port) => {
    port.tag = { ...port.tag, toHighlight: false }
  })

  masterGraph.nodes
    .filter((node) => !masterGraph.isGroupNode(node))
    .forEach((node) => {
      node.tag.updateAllPropertyHighlights(false)
    })

  graphComponent.highlights.clear()
}

void run()
