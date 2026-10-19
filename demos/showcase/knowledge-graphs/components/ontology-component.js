/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Command,
  EdgeLabelPreferredPlacement,
  EdgeStyleIndicatorRenderer,
  FreeEdgeLabelModel,
  GenericLabeling,
  GenericLabelingData,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  IEdge,
  ILabel,
  INode,
  InteriorNodeLabelModel,
  LabelStyle,
  LabelStyleIndicatorRenderer,
  NodeStyleIndicatorRenderer,
  OrthogonalLayout,
  ParallelEdgeRouter,
  Point,
  PolylineEdgeStyle,
  PopoverBehavior,
  PopoverDescriptor,
  Rect,
  ShapeNodeStyle,
  Stroke
} from '@yfiles/yfiles'

import { bindYFilesCommand } from '@yfiles/demo-app/modern/element-utils'
import {
  filterGraph,
  filterOutTypes,
  getWrappedGraph,
  highlightTypes,
  resetFading,
  resetFiltering
} from '../filtering'
import { edgeMatchesTriplet, getMatchingItems, nodeMatchesTriplet } from '../triplet-matching'
import { clusterIdToColors, textColor } from '../styles/graph-styles'
import { getEdgeTag, getNodeTag, getOntologyTag } from '../types'
import { isNeighborhoodOpen, toggleComponentPanel } from './neighborhood-component'

// State management for type visibility filters
const nodeFilters = new Set()
const edgeFilters = new Set()

// UI element references
const resetButton = document.querySelector('#reset-visibility')
const ontologyCollapseButton = document.querySelector('.ontology-container > .collapse.icon')
const interactionPanel = document.querySelector('.interaction-panel')
const ontologyPanel = document.querySelector('.ontology-container')
const fitContentButton = document.querySelector('#fit-content')

// Graph component references
let ontologyGC = null
let originalGC = null

// Triplet filtering state
let filterApplied = false
let filteredElements = new Set()
let activeTriplet = null

// Operation state management
let operationInProgress = false

// Interaction state
let lastItemClicked = null

/**
 * Initializes the ontology overview component and connects it to the original graph.
 *
 * Sets up styles, creates the ontology graph structure, initializes interaction handlers,
 * and configures the UI. This must be called once during application startup.
 *
 * @param originalGraphComponent - The main graph component used as the source graph
 * @param supportsWebGL2 - Whether the browser supports WebGL2
 */
export function initializeOntologyComponent(originalGraphComponent, supportsWebGL2) {
  ontologyGC = new GraphComponent('#ontology-graphComponent')
  originalGC = originalGraphComponent
  initializeStyles()
  createOntologyGraph()
  initializeInteraction(supportsWebGL2)
  initializeComponentUI()
  updateUI()
}

/**
 * Initializes the default styles and selection renderers for the ontology graph.
 */
function initializeStyles() {
  const { primaryColor, secondaryColor } = getColorScheme()
  const selectionColor = '#e56399'
  const graph = ontologyGC.graph

  // Configure node styles and node labels.
  graph.nodeDefaults.style = new ShapeNodeStyle({
    stroke: new Stroke(primaryColor, 4),
    fill: primaryColor,
    shape: 'ellipse'
  })
  graph.nodeDefaults.shareStyleInstance = false
  graph.nodeDefaults.size = [120, 120]
  graph.nodeDefaults.labels.style = new LabelStyle({
    font: '20px sans-serif',
    backgroundFill: secondaryColor,
    horizontalTextAlignment: 'center',
    verticalTextAlignment: 'center',
    padding: [2, 6, 2, 6],
    shape: 'squircle',
    textFill: textColor
  })
  graph.nodeDefaults.labels.shareStyleInstance = false
  graph.nodeDefaults.labels.layoutParameter = InteriorNodeLabelModel.CENTER

  // Configure edge styles and edge labels.
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: `4px ${primaryColor}`,
    targetArrow: `${primaryColor} x-large triangle`,
    smoothingLength: 20
  })
  graph.edgeDefaults.shareStyleInstance = false
  graph.edgeDefaults.labels.style = new LabelStyle({
    font: '20px sans-serif',
    backgroundStroke: `2px ${primaryColor}`,
    backgroundFill: secondaryColor,
    horizontalTextAlignment: 'center',
    verticalTextAlignment: 'center',
    padding: [2, 6, 2, 6],
    shape: 'squircle'
  })
  graph.edgeDefaults.labels.shareStyleInstance = false
  graph.edgeDefaults.labels.layoutParameter = FreeEdgeLabelModel.INSTANCE.createParameter()

  // Configure node selection and highlight rendering.
  const nodeRenderer = new NodeStyleIndicatorRenderer({
    nodeStyle: new ShapeNodeStyle({
      stroke: new Stroke(selectionColor, 4),
      fill: 'transparent',
      shape: 'ellipse'
    }),
    zoomPolicy: 'mixed',
    margins: 5
  })
  graph.decorator.nodes.selectionRenderer.addConstant(nodeRenderer)
  graph.decorator.nodes.highlightRenderer.addConstant(nodeRenderer)

  // Configure edge selection and highlight rendering.
  const edgeRenderer = new EdgeStyleIndicatorRenderer({
    edgeStyle: new PolylineEdgeStyle({
      stroke: `4px ${selectionColor}`,
      targetArrow: 'none',
      smoothingLength: 20
    }),
    zoomPolicy: 'mixed'
  })
  graph.decorator.edges.selectionRenderer.addConstant(edgeRenderer)
  graph.decorator.edges.highlightRenderer.addConstant(edgeRenderer)

  // Configure label selection and highlight rendering.
  const labelRenderer = new LabelStyleIndicatorRenderer({
    labelStyle: new LabelStyle({
      font: '20px sans-serif',
      backgroundStroke: `2px ${selectionColor}`,
      backgroundFill: secondaryColor,
      horizontalTextAlignment: 'center',
      verticalTextAlignment: 'center',
      padding: [2, 6, 2, 6],
      shape: 'squircle'
    }),
    zoomPolicy: 'world-coordinates',
    margins: 5
  })
  graph.decorator.labels.highlightRenderer.addConstant(labelRenderer)
  graph.decorator.labels.selectionRenderer.addConstant(labelRenderer)
}

/**
 * Builds the ontology graph from the node and edge types in the original graph.
 *
 * Process:
 * - Extracts unique node types from the original graph and creates ontology nodes
 * - Extracts unique source-predicate-target combinations and creates ontology edges
 * - Applies orthogonal layout with parallel edge routing
 * - Positions edge labels on specific sides for improved readability
 *
 * Each unique node type becomes a single ontology node.
 * Each unique source-target-edge-type combination becomes a single ontology edge.
 */
function createOntologyGraph() {
  const ontologyGraph = ontologyGC.graph
  const originalGraph = getWrappedGraph(originalGC.graph)
  const typeToNode = new Map()

  // Create ontology nodes for each unique node type
  originalGraph.nodes.forEach((node) => {
    const type = getNodeTag(node).type
    if (!type || typeToNode.has(type)) {
      return
    }
    typeToNode.set(type, ontologyGraph.createNode({ tag: { type, visible: true }, labels: [type] }))
  })

  // Create ontology edges for each unique triplet (source type, edge type, target type)
  originalGraph.edges.forEach((edge) => {
    const sourceType = getNodeTag(edge.sourceNode).type
    const targetType = getNodeTag(edge.targetNode).type
    const edgeType = getEdgeTag(edge).type
    if (!sourceType || !targetType || !edgeType) {
      return
    }

    const sourceNode = typeToNode.get(sourceType)
    const targetNode = typeToNode.get(targetType)
    if (!sourceNode || !targetNode) {
      return
    }

    // Avoid duplicate triplet edges
    const alreadyExists = ontologyGraph.edges.some(
      (ontologyEdge) =>
        ontologyEdge.sourceNode === sourceNode &&
        ontologyEdge.targetNode === targetNode &&
        getOntologyTag(ontologyEdge).type === edgeType
    )
    if (!alreadyExists) {
      ontologyGraph.createEdge({
        source: sourceNode,
        target: targetNode,
        tag: { type: edgeType, visible: true },
        labels: [edgeType]
      })
    }
  })

  // Apply orthogonal layout with parallel edge routing
  const orthogonalLayout = new OrthogonalLayout({
    nodeLabelPlacement: 'consider',
    edgeLabelPlacement: 'integrated',
    gridSpacing: 30
  })
  const parallelEdgeRouter = orthogonalLayout.layoutStages.get(ParallelEdgeRouter)
  parallelEdgeRouter.enabled = true
  parallelEdgeRouter.edgeDistance = 15

  // Position specific edge labels on opposite sides for better readability
  const labelingData = new GenericLabelingData({
    scope: { edgeLabels: (label) => label.text === 'member_in' || label.text === 'leads' },
    edgeLabelPreferredPlacements: (label) =>
      new EdgeLabelPreferredPlacement({
        distanceToEdge: 5,
        edgeSide:
          label.text === 'member_in'
            ? 'right-of-edge'
            : label.text === 'leads'
              ? 'left-of-edge'
              : 'on-edge'
      })
  })
  const labeling = new GenericLabeling({ coreLayout: orthogonalLayout, scope: 'edge-labels' })
  ontologyGraph.applyLayout(labeling, labelingData)
  void ontologyGC.zoomTo(getComponentBounds(ontologyGC))
}

/**
 * Configures selection, hover, tooltip, popover, and graph resize interactions.
 * @param supportsWebGL2 - Whether the browser supports WebGL2
 */
function initializeInteraction(supportsWebGL2) {
  const inputMode = new GraphViewerInputMode({
    selectableItems: GraphItemTypes.NONE,
    clickableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.EDGE_LABEL,
    clickSelectableItems: GraphItemTypes.NONE,
    toolTipItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    itemHoverInputMode: {
      hoverItems: GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.EDGE_LABEL
    },
    // Prevent interaction while an operation is in progress
    clickablePredicate: (item) => !operationInProgress && canBeClicked(item)
  })

  // Canvas click: reset highlighting and clear the last clicked item
  inputMode.addEventListener('canvas-clicked', async () => {
    if (isNeighborhoodOpen) {
      toggleComponentPanel(false)
    }
    await runOperation(() => resetHighlighting())
  })

  // Item click: select and highlight the triplet matching the item
  inputMode.addEventListener('item-left-clicked', async (event, sender) => {
    event.handled = true
    if (operationInProgress) {
      return
    }

    const item = event.item
    if (!canBeClicked(item)) {
      ontologyGC.selection.remove(item)
      return
    }

    if (isNeighborhoodOpen) {
      toggleComponentPanel(false)
    }

    const refItem = getRefOntologyItem(item)
    let currentTriplet

    // Extract the triplet from the clicked item
    if (refItem instanceof IEdge) {
      currentTriplet = getTriplet(refItem) ?? undefined
    } else if (refItem instanceof INode) {
      currentTriplet = { subject: getOntologyTag(refItem).type }
    }

    // Calculate popover position based on the layout item
    const layoutItem = event.item instanceof IEdge ? event.item.labels.at(0) : event.item
    if (layoutItem instanceof INode || layoutItem instanceof ILabel) {
      const layout = layoutItem.layout

      const popoverDescriptor = new PopoverDescriptor({
        anchor: new Point(layout.center.x + layout.width * 0.5, layout.center.y),
        offset: new Point(10, 0),
        behavior: PopoverBehavior.AUTO
      })

      popoverDescriptor.content = createPopoverContent(refItem, popoverDescriptor)
      void sender.popoverManager.open(popoverDescriptor)

      if (!currentTriplet) {
        return
      }

      // Prevent highlighting the same item twice
      if (lastItemClicked === item) {
        return
      }

      selectClickedItem(item)
      await runOperation(async () => {
        if (supportsWebGL2) {
          await highlightTypes(
            originalGC,
            currentTriplet.subject,
            currentTriplet.predicate,
            currentTriplet.object
          )
        }
        lastItemClicked = item
      })
    }
  })

  // Hover: show highlights for the hovered item
  inputMode.itemHoverInputMode.addEventListener('hovered-item-changed', (event) => {
    ontologyGC.highlights.clear()
    const item = event.item
    if (!item || !canBeClicked(item)) {
      return
    }

    const refItem = getRefOntologyItem(item)
    if (getOntologyTag(refItem).visible) {
      updateGraphHighlights(refItem)
    }
  })

  // Tooltip: display help text
  inputMode.addEventListener('query-item-tool-tip', (event) => {
    if (event.handled || !event.item) {
      return
    }

    const refItem = getRefOntologyItem(event.item)
    const isEdge = refItem instanceof IEdge
    event.toolTip = `
      <div class="ontology-edge-tooltip">
        ${createTooltipContent(isEdge)}
      </div>
    `
    event.handled = true
  })

  ontologyGC.inputMode = inputMode

  // Auto-zoom to fit content when the component is resized
  ontologyGC.addEventListener('size-changed', () => {
    void ontologyGC.zoomTo(getComponentBounds(ontologyGC))
  })
}

/**
 * Updates the visibility filter for a node or edge type.
 *
 * When a type is hidden, all original graph nodes and edges of that type
 * are removed from the visible graph. The triplet filter, if active, is preserved.
 *
 * @param item - The ontology node or edge representing the type
 * @param visible - Whether the type should remain visible
 */
async function filterOutElements(item, visible) {
  const refItem = getRefOntologyItem(item)
  const type = getOntologyTag(refItem).type
  const filters = refItem instanceof INode ? nodeFilters : edgeFilters

  // Add or remove the type from the visibility filter set
  if (visible) {
    filters.add(type)
  } else {
    filters.delete(type)
  }

  // Re-apply the combined type and triplet filters to the original graph
  await filterOutTypes(originalGC, isOriginalNodeVisible, isOriginalEdgeVisible)
  ontologyGC.selection.clear()

  renderOntologyGraph()
  updateUI()
}

/**
 * Returns whether an original graph edge matches the active triplet.
 *
 * If no triplet is active, all edges match.
 *
 * @param edge - The original graph edge to test
 * @returns True if the edge matches the active triplet
 */
function matchesActiveTripletEdge(edge) {
  return !activeTriplet || edgeMatchesTriplet(edge, activeTriplet)
}

/**
 * Returns whether an original graph node belongs to an edge matching the active triplet.
 *
 * A node is considered part of the active triplet if it is either the source or target
 * of an edge that matches the triplet criteria.
 *
 * If no triplet is active, all nodes match.
 *
 * @param node - The original graph node to test
 * @returns True if the node is connected to a matching triplet edge
 */
function matchesActiveTripletNode(node) {
  return (
    !activeTriplet || nodeMatchesTriplet(getWrappedGraph(originalGC.graph), node, activeTriplet)
  )
}

/**
 * Returns whether an original graph node should remain visible.
 *
 * A node is visible if:
 * 1. Its type is not in the type hide filter, AND
 * 2. It matches the active triplet filter, if one is applied
 *
 * @param node - The original graph node to test
 * @returns True if the node should be visible
 */
function isOriginalNodeVisible(node) {
  return !nodeFilters.has(getNodeTag(node).type) && matchesActiveTripletNode(node)
}

/**
 * Returns whether an original graph edge should remain visible.
 *
 * An edge is visible if:
 * 1. Its type is not in the type hide filter, AND
 * 2. It matches the active triplet filter, if one is applied
 *
 * @param edge - The original graph edge to test
 * @returns True if the edge should be visible
 */
function isOriginalEdgeVisible(edge) {
  return !edgeFilters.has(getEdgeTag(edge).type) && matchesActiveTripletEdge(edge)
}

/**
 * Returns the ontology item represented by a node, edge, or label.
 *
 * If the item is a label, returns its owner.
 *
 * @param item - The model item to resolve
 * @returns The ontology node or edge
 */
function getRefOntologyItem(item) {
  if (item instanceof ILabel) {
    return item.owner
  }
  return item
}

/**
 * Returns whether an ontology item matches the active triplet filter.
 *
 * Labels are checked through their owner because `filteredElements` contains
 * ontology edges and nodes as well as labels returned by `getMatchingItems`.
 *
 * @param item - The ontology item to test
 * @returns True if the item matches or if no filter is active
 */
function isFiltered(item) {
  if (!activeTriplet) {
    return true
  }

  const refItem = getRefOntologyItem(item)
  return filteredElements.has(item) || filteredElements.has(refItem)
}

/**
 * Returns whether an ontology item can be clicked or selected.
 *
 * Items that do not match the active triplet filter cannot be interacted with.
 *
 * @param item - The ontology item to test
 * @returns True if the item can be interacted with
 */
function canBeClicked(item) {
  return isFiltered(item)
}

/**
 * Resets possible fade out operations.
 * @param resetUI - Whether to reset the UI
 */
async function resetHighlighting(resetUI = true) {
  lastItemClicked = null
  await resetFading(originalGC, resetUI)
}

/**
 * Renders ontology items according to type visibility and the active triplet.
 *
 * This function changes only the CSS rendering state via `setRendered()`.
 * It does not modify the ontology item visibility tags.
 *
 * Rendering logic:
 * - Nodes and edges are visible if: type is visible AND item matches triplet
 * - Labels inherit visibility from their owner
 */
function renderOntologyGraph() {
  const graph = ontologyGC.graph
  const tripletFilterActive = activeTriplet !== null

  graph.nodes.forEach((node) => {
    const matches = !tripletFilterActive || filteredElements.has(node)
    setRendered(node, getOntologyTag(node).visible && matches)
  })

  graph.edges.forEach((edge) => {
    const matches = !tripletFilterActive || filteredElements.has(edge)
    const visible =
      getOntologyTag(edge).visible &&
      getOntologyTag(edge.sourceNode).visible &&
      getOntologyTag(edge.targetNode).visible &&
      matches

    setRendered(edge, visible)
  })

  graph.labels.forEach((label) => {
    const owner = getRefOntologyItem(label)
    const matches =
      !tripletFilterActive || filteredElements.has(label) || filteredElements.has(owner)

    setRendered(label, getOntologyTag(owner).visible && matches)
  })

  ontologyGC.invalidate()
}

/**
 * Removes the ontology triplet filter.
 *
 * Type visibility is preserved. Hidden types remain hidden.
 */
function resetElementOpacity() {
  filteredElements.clear()
  activeTriplet = null
  renderOntologyGraph()
}

/**
 * Applies subject, predicate, and object matching to the ontology graph.
 *
 * Finds all ontology items that match the given triplet and updates the rendering
 * to highlight matching items and dim non-matching ones.
 *
 * @param subject - Optional source node type filter
 * @param predicate - Optional edge type filter
 * @param object - Optional target node type filter
 */
function updateElementOpacity(subject, predicate, object) {
  filteredElements = getMatchingItems(ontologyGC.graph, subject, predicate, object)
  renderOntologyGraph()
}

/**
 * Creates the context menu popover for an ontology item.
 *
 * The popover provides actions to:
 * - Filter the original graph by the triplet
 * - Show or hide the type in both graphs
 *
 * @param item - The ontology node or edge represented by the popover
 * @param popoverDescriptor - The descriptor used to close the popover
 * @returns The generated popover content as an HTML div
 */
function createPopoverContent(item, popoverDescriptor) {
  const popup = document.createElement('div')
  popup.className = 'ontology-popover'

  const ontologyTag = getOntologyTag(item)
  const visible = ontologyTag.visible
  const triplet = item instanceof IEdge ? getTriplet(item) : undefined
  const canUseTripletActions = triplet !== undefined
  const canFilterCurrentTriplet = item instanceof IEdge && canFilterTriplet(item)

  popup.innerHTML = `
    ${
      canUseTripletActions
        ? `
        <button class="popup-button filter-triplet-button">
          <span class="material-symbols-outlined">
            ${filterApplied ? 'filter_alt_off' : 'filter_alt'}
          </span>
          ${filterApplied ? 'Unfilter' : 'Filter'} Triplet
        </button>
    `
        : ''
    }
      <button class="popup-button show-hide-type-button">
        <span class="material-symbols-outlined">
          ${visible ? 'visibility' : 'visibility_off'}
        </span>
        ${visible ? 'Hide' : 'Show'} Type '${ontologyTag.type}'
      </button>
  `

  // Handle the "Filter Triplet" action
  const filterTripletButton = popup.querySelector('.filter-triplet-button')

  if (filterTripletButton && item instanceof IEdge) {
    setButtonDisabled(filterTripletButton, operationInProgress || !canFilterCurrentTriplet)

    filterTripletButton.addEventListener('click', async () => {
      if (isButtonDisabled(filterTripletButton)) {
        return
      }

      popoverDescriptor.close()
      await runOperation(async () => {
        const currentTriplet = getTriplet(item)
        if (filterApplied) {
          // Unfilter: restore the original graph and clear the triplet filter
          await resetFiltering(originalGC, true)
          filterApplied = false
          resetElementOpacity()
          ontologyGC.selection.clear()

          // Reapply any manually hidden types
          await filterOutTypes(originalGC, isOriginalNodeVisible, isOriginalEdgeVisible)
          renderOntologyGraph()
          return
        }

        // Apply filter: set the active triplet and filter the original graph
        activeTriplet = currentTriplet
        updateElementOpacity(
          currentTriplet.subject,
          currentTriplet.predicate,
          currentTriplet.object
        )
        selectClickedItem(item)

        await filterGraph(
          originalGC,
          currentTriplet.subject,
          currentTriplet.predicate,
          currentTriplet.object
        )

        filterApplied = true
        ontologyGC.invalidate()
        lastItemClicked = null
      })
    })
  }

  // Handle the "Show/Hide Type" action
  const filterOutType = popup.querySelector('.show-hide-type-button')
  filterOutType.addEventListener('click', async () => {
    if (isButtonDisabled(filterOutType)) {
      return
    }

    popoverDescriptor.close()
    setButtonDisabled(filterOutType, true)

    await runOperation(async () => {
      // Reset highlighting before changing visibility
      await resetFading(originalGC, false)

      // Update type visibility and reapply filters
      await filterOutElements(item, visible)
      setVisible(item, !visible)

      if (item instanceof IEdge && item.labels.at(0)) {
        setRendered(item.labels.at(0), !visible)
      }

      renderOntologyGraph()
      lastItemClicked = null
    })
  })

  return popup
}

/**
 * Initializes the reset button and other component-level UI interactions.
 *
 * Binds commands to:
 * - Zoom in/out controls
 * - Fit content button
 * - Reset all filters and highlighting
 * - Toggle interaction panel collapse
 * - Handle layout and hover events
 */
function initializeComponentUI() {
  bindYFilesCommand('#zoom-in', Command.INCREASE_ZOOM, ontologyGC, null, 'Increase Zoom')
  bindYFilesCommand('#zoom-out', Command.DECREASE_ZOOM, ontologyGC, null, 'Decrease Zoom')

  fitContentButton.addEventListener('click', async () => {
    await ontologyGC.zoomToAnimated(getComponentBounds(ontologyGC))
  })

  resetButton.addEventListener('click', async () => {
    if (isButtonDisabled(resetButton)) {
      return
    }

    await runOperation(async () => {
      // Reset original graph filters and highlighting
      await resetFiltering(originalGC, true)
      await resetFading(originalGC, true)

      // Clear all filter state
      nodeFilters.clear()
      edgeFilters.clear()
      filteredElements.clear()
      activeTriplet = null
      filterApplied = false

      // Reset ontology visibility and rendering
      const graph = ontologyGC.graph
      graph.nodes.forEach((node) => setVisible(node, true))
      graph.edges.forEach((edge) => setVisible(edge, true))
      graph.labels.forEach((label) => setRendered(label, true))

      // Restore all original graph items
      await filterOutTypes(
        originalGC,
        () => true,
        () => true
      )

      ontologyGC.selection.clear()
      ontologyGC.highlights.clear()
      ontologyGC.invalidate()
    })
  })

  // Toggle interaction panel collapse
  ontologyCollapseButton.addEventListener('click', () => {
    const expanded = interactionPanel.classList.toggle('expanded')
    ontologyCollapseButton.setAttribute('aria-expanded', String(expanded))
    ontologyCollapseButton.title = expanded ? 'Shrink view' : 'Enlarge View'
    ontologyCollapseButton.textContent = expanded ? 'collapse_content' : 'expand_content'
  })

  document.addEventListener(
    'pointerdown',
    async (event) => {
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }
      if (target instanceof Element) {
        const isErrorBeacon = target.id === 'error-beacon-animation'
        const isOriginalGCClick = target.parentElement?.id === 'graphComponent'
        if (ontologyPanel.contains(target) || isErrorBeacon || isOriginalGCClick) {
          return
        }
      }
      await runOperation(async () => await resetOntologyGraphState())
    },
    true
  )

  // Listen for layout changes
  window.addEventListener('start-layout', () => {
    updateUI()
  })

  // Mirror highlights from the original graph
  window.addEventListener('hover-items-changed', (event) => {
    const highlightedElements = event.detail
    updateOntologyHighlightsFromOriginalGraph(highlightedElements)
  })
}

/**
 * Returns the currently selected ontology edge if it represents a valid triplet.
 *
 * @returns The selected edge, or null if no valid edge is selected
 */
function getSelectedEdge() {
  const edge = ontologyGC.selection.edges.at(0)
  return edge && getTriplet(edge) ? edge : null
}

/**
 * Returns whether a valid ontology edge is currently selected.
 *
 * @returns True if a valid edge is selected
 */
function hasSelectedEdge() {
  return getSelectedEdge() !== null
}

/**
 * Creates a triplet from an ontology edge.
 *
 * Returns null if any component of the triplet is currently hidden.
 *
 * @param edge - The ontology edge
 * @returns The triplet, or null if any component is hidden
 */
function getTriplet(edge) {
  const sourceTag = getOntologyTag(edge.sourceNode)
  const targetTag = getOntologyTag(edge.targetNode)
  const edgeTag = getOntologyTag(edge)

  if (!sourceTag.visible || !targetTag.visible || !edgeTag.visible) {
    return null
  }

  return { subject: sourceTag.type, predicate: edgeTag.type, object: targetTag.type }
}

/**
 * Returns whether all types represented by an ontology edge are currently visible.
 *
 * @param edge - The ontology edge
 * @returns True if the source type, edge type, and target type are all visible
 */
function canFilterTriplet(edge) {
  return (
    getOntologyTag(edge.sourceNode).visible &&
    getOntologyTag(edge.targetNode).visible &&
    getOntologyTag(edge).visible
  )
}

/**
 * Highlights an ontology item and its related elements.
 *
 * For nodes: adds the node to highlights.
 * For edges: adds the edge, both endpoint nodes, and the edge label to highlights.
 *
 * @param item - The ontology item to highlight
 */
function updateGraphHighlights(item) {
  const highlights = ontologyGC.highlights

  if (item instanceof INode) {
    highlights.add(item)
  } else if (item instanceof IEdge) {
    highlights.add(item)
    highlights.add(item.sourceNode)
    highlights.add(item.targetNode)

    const label = item.labels.at(0)
    if (label) {
      highlights.add(label)
    }
  }
}

/**
 * Mirrors highlights from the original graph to the ontology graph.
 *
 * When items in the original graph are highlighted, this function finds their
 * corresponding type nodes and edges in the ontology and highlights them as well.
 *
 * @param highlightedElements - The items currently highlighted in the original graph
 */
function updateOntologyHighlightsFromOriginalGraph(highlightedElements) {
  const graph = ontologyGC.graph
  const ontologyHighlights = ontologyGC.highlights
  ontologyHighlights.clear()

  highlightedElements?.forEach((item) => {
    if (item instanceof INode) {
      // Find the ontology node with matching type
      const highlightedNode = graph.nodes.find(
        (node) => getOntologyTag(node).type === getNodeTag(item).type
      )

      if (highlightedNode) {
        ontologyHighlights.add(highlightedNode)
      }
    } else if (item instanceof IEdge) {
      // Find the ontology edge with matching type and highlight it with endpoints
      const highlightedEdge = graph.edges.find(
        (edge) => getOntologyTag(edge).type === getEdgeTag(item).type
      )

      if (highlightedEdge) {
        ontologyHighlights.add(highlightedEdge)
        ontologyHighlights.add(highlightedEdge.sourceNode)
        ontologyHighlights.add(highlightedEdge.targetNode)

        const label = highlightedEdge.labels.at(0)
        if (label) {
          ontologyHighlights.add(label)
        }
      }
    }
  })

  ontologyGC.invalidate()
}

/**
 * Returns the colors used by the ontology graph.
 *
 * Uses the color scheme defined for cluster ID 3 in the graph styles.
 *
 * @returns An object containing `primaryColor` and `secondaryColor`
 */
function getColorScheme() {
  const colorTheme = clusterIdToColors.get(3)
  return { primaryColor: colorTheme.main, secondaryColor: colorTheme.secondary }
}

/**
 * Calculates bounds containing all nodes, edge bends, and labels.
 *
 * Used for auto-zooming to fit all content in the viewport.
 *
 * @param graphComponent - The graph component whose bounds should be calculated
 * @returns A rectangle encompassing all graph content with 30px padding
 */
function getComponentBounds(graphComponent) {
  const graph = graphComponent.graph
  let bounds = Rect.EMPTY

  graph.nodes.forEach((node) => {
    bounds = bounds.add(node.layout.toRect())
  })

  graph.edges.forEach((edge) => {
    edge.bends.forEach((bend) => {
      bounds = bounds.add(bend.location.toPoint())
    })
  })

  graph.labels.forEach((label) => {
    bounds = bounds.add(label.layout.bounds)
  })

  return bounds.getEnlarged(30)
}

/**
 * Updates all controls that depend on graph state.
 *
 * Controls managed:
 * - Reset button: enabled/disabled based on operation state and filter state
 * - Button title: provides user guidance
 *
 * Uses CSS classes instead of the native disabled property so that application styling remains in control.
 */
function updateUI() {
  const hasEdgeSelection = hasSelectedEdge()
  const busy = operationInProgress
  const hasVisibilityFilters = nodeFilters.size > 0 || edgeFilters.size > 0

  setButtonDisabled(resetButton, busy || (!hasVisibilityFilters && !filterApplied))
  resetButton.title = 'Reset filtering and highlighting'

  // Keep the state available for context menu logic
  void hasEdgeSelection
}

/**
 * Selects an ontology item by clearing the current selection and adding the item.
 *
 * For edges: also adds the source node, target node, and edge label to the selection.
 * For nodes: adds only the node itself.
 *
 * @param item - The ontology item to select
 */
function selectClickedItem(item) {
  if (!canBeClicked(item)) {
    return
  }

  const refItem = getRefOntologyItem(item)
  const selection = ontologyGC.selection
  selection.clear()

  if (refItem instanceof IEdge) {
    selection.add(refItem.sourceNode)
    selection.add(refItem.targetNode)
    selection.add(refItem)

    const label = refItem.labels.at(0)
    if (label) {
      selection.add(label)
    }
  } else if (refItem instanceof INode) {
    selection.add(refItem)
  }
}

/**
 * Runs an asynchronous operation while preventing concurrent operations.
 *
 * Benefits:
 * - Prevents overlapping filtering or highlighting operations
 * - Keeps the UI synchronized with operation state
 * - Ensures proper error handling and cleanup
 *
 * @param operation - The asynchronous function to execute
 */
async function runOperation(operation) {
  if (operationInProgress) {
    return
  }

  operationInProgress = true
  updateUI()

  try {
    await operation()
  } finally {
    operationInProgress = false
    updateUI()
  }
}

/**
 * Updates an item's visibility tag and CSS class.
 *
 * Labels do not have an ontology visibility tag, so only their CSS class is updated.
 *
 * @param item - The graph item to update
 * @param visible - Whether the item should be visible
 */
function setVisible(item, visible) {
  if (!(item instanceof ILabel)) {
    getOntologyTag(item).visible = visible
  }

  setRendered(item, visible)
}

/**
 * Resets the highlighting and clears the graph selection.
 */
export async function resetOntologyGraphState() {
  await resetHighlighting(false)
  ontologyGC.selection.clear()
}

/**
 * Updates only the rendered CSS state of an item.
 *
 * This changes the visual appearance without modifying the ontology visibility tag.
 *
 * @param item - The graph item to update
 * @param visible - Whether the item should be rendered as visible
 */
function setRendered(item, visible) {
  const style = item.style
  style.cssClass = visible ? 'element-visible' : 'element-hidden'
}

/**
 * Updates a button using a CSS class instead of the native disabled property.
 *
 * @param button - The HTML button element
 * @param disabled - True to disable, false to enable
 */
function setButtonDisabled(button, disabled) {
  button.classList.toggle('disabled', disabled)
  button.setAttribute('aria-disabled', String(disabled))
}

/**
 * Returns whether a button currently has the disabled CSS state.
 *
 * @param button - The HTML button element
 * @returns True if the button has the disabled CSS class
 */
function isButtonDisabled(button) {
  return button.classList.contains('disabled')
}

/**
 * Creates the tooltip content displayed in tooltips.
 *
 * The content adapts based on whether the tooltip is for an edge or a node.
 *
 * @param includeEdgeText - Whether to include text specific to edges
 * @returns HTML tooltip content as a string
 */
function createTooltipContent(includeEdgeText) {
  const edgeContent = includeEdgeText
    ? `
  <li>
    Click an edge to filter its associated triplet via the context menu.
  </li>
 `
    : ''

  return `<div><ul>
  <li>
    Click an element to highlight its triplet.
  </li>
  ${edgeContent}
  <li>
    Click an element to hide or show its type in the graph via the context menu.
  </li>
  <li>
    Press <span class="icon-text">reset_settings</span> to reset filtering, visibility and highlighting.
  </li>
  </ul></div>`
}
