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
import { Color, WebGLGraphModelManagerRenderMode } from '@yfiles/yfiles'
import { getEdgeTag, getNodeTag } from './types'
import { resetBeaconAnimation } from './beacon-animation'

/** Tracks whether a filter has been applied to the graph. */
export let filterApplied = false

/** Tracks whether a fade-out animation is currently active. */
let fadeActive = false

/** Stores the current fade-out animation for cleanup. */
let fadeAnimation = null

const subjectSelect = document.querySelector('#subject-combo')
const predicateSelect = document.querySelector('#predicate-combo')
const objectSelect = document.querySelector('#object-combo')
const fadeOutButton = document.querySelector('#apply-fade-out')
const applyFilteringButton = document.querySelector('#apply-filtering')
const resetFilteringButton = document.querySelector('#reset-filtering')

/**
 * Creates the filtering panel and registers the listeners to its elements.
 * @param graphComponent - The given graphComponent
 * @param filteringCallback - A function called whenever filtering or reset have been applied
 */
export function initializeFilterPanel(graphComponent, filteringCallback) {
  const graph = graphComponent.graph

  // Sets up the fade out button with WebGL support check and click listener.
  const supportsWebGL =
    graphComponent.graphModelManager.renderMode === WebGLGraphModelManagerRenderMode.WEBGL

  // Populate select dropdowns from graph data
  initializeSelects(graph, subjectSelect, predicateSelect, objectSelect)

  // Registers up the apply filter button click listener.
  applyFilteringButton.addEventListener('click', async () => {
    await filterGraph(
      graphComponent,
      subjectSelect.value,
      predicateSelect.value,
      objectSelect.value,
      filteringCallback
    )
    fadeOutButton.setAttribute('aria-disabled', 'true')
    filterApplied = true
  })

  if (!supportsWebGL) {
    fadeOutButton.setAttribute('aria-disabled', 'true')
    fadeOutButton.title = 'Available only when WebGL is supported'
  }
  fadeOutButton.addEventListener('click', async (e) => {
    if (fadeOutButton.getAttribute('aria-disabled') === 'true') {
      e.preventDefault()
      return
    }

    // Reset existing fade animation if active
    await resetFiltering(graphComponent)
    const match = getMatchingItems(
      graph,
      subjectSelect.value,
      predicateSelect.value,
      objectSelect.value
    )

    // Get items to fade
    const filteredNodes = Array.from(graph.nodes).filter((node) => !match.has(node))
    const filteredEdges = Array.from(graph.edges).filter((edge) => !match.has(edge))
    const filteredLabels = Array.from(graph.labels).filter((label) => !match.has(label.owner))

    await fadeOut(graphComponent, filteredNodes, filteredEdges, filteredLabels)
  })

  // Registers the reset filter button click listener.
  resetFilteringButton.addEventListener('click', async () => {
    void resetFiltering(graphComponent, true)
    if (supportsWebGL) {
      fadeOutButton.setAttribute('aria-disabled', 'false')
    }

    if (filterApplied) {
      if (filteringCallback) {
        await filteringCallback()
      }
      filterApplied = false
    } else {
      await graphComponent.fitGraphBounds({ animated: true })
    }
  })
}

/**
 * Populates select dropdowns with node types and edge predicates from the graph.
 *
 * @param graph - The graph to extract data from
 * @param subjectSelect - Select element for node types (source)
 * @param predicateSelect - Select element for edge labels
 * @param objectSelect - Select element for node types (target)
 */
function initializeSelects(graph, subjectSelect, predicateSelect, objectSelect) {
  const nodeTypes = new Set(
    Array.from(graph.nodes)
      .map((node) => getNodeTag(node).type)
      .filter((type) => type !== undefined)
  )

  const edgeLabels = new Set(Array.from(graph.edges).map((edge) => getEdgeTag(edge).label))

  populateSelect(subjectSelect, Array.from(nodeTypes), true)
  populateSelect(predicateSelect, Array.from(edgeLabels), true)
  populateSelect(objectSelect, Array.from(nodeTypes), true)
}

/**
 * Finds all graph items (nodes and edges) matching the filter criteria.
 * An edge matches if:
 * - Its label matches the predicate (or predicate is empty).
 * - Its source node type matches the subject (or subject is empty).
 * - Its target node type matches the object (or object is empty).
 *
 * Matching items include the edge and both endpoint nodes.
 *
 * @param graph - The graph to search
 * @param subjectType - Source node type filter (empty string matches all)
 * @param predicateLabel - Edge label filter (empty string matches all)
 * @param objectType - Target node type filter (empty string matches all)
 * @returns Set of matching items
 */
function getMatchingItems(graph, subjectType, predicateLabel, objectType) {
  const match = new Set()
  graph.edges.forEach((edge) => {
    const sourceTag = getNodeTag(edge.sourceNode)
    const targetTag = getNodeTag(edge.targetNode)

    if (
      matchesValue(getEdgeTag(edge).label, predicateLabel) &&
      matchesValue(sourceTag.type, subjectType) &&
      matchesValue(targetTag.type, objectType)
    ) {
      match.add(edge)
      match.add(edge.sourceNode)
      match.add(edge.targetNode)
    }
  })

  return match
}

/**
 * Applies a filter to the graph by hiding non-matching items.
 *
 * Matches items based on subject type, predicate label, and object type,
 * then updates visibility in the filtered graph wrapper.
 *
 * @param graphComponent - The graph component to filter
 * @param subjectType - Source node type filter
 * @param predicateLabel - Edge label filter
 * @param objectType - Target node type filter
 * @param callback - Optional callback to run after filtering
 */
async function filterGraph(graphComponent, subjectType, predicateLabel, objectType, callback) {
  void resetFiltering(graphComponent)

  // Find matching items and update visibility
  const graph = graphComponent.graph
  const wrappedGraph = graph.wrappedGraph
  const match = getMatchingItems(wrappedGraph, subjectType, predicateLabel, objectType)
  updateGraphVisibility(
    graph,
    (node) => match.has(node),
    (edge) => match.has(edge),
    true
  )

  // Run callback if provided
  if (callback) {
    await callback()
  }

  updateErrorPanel(graph)
  updateGraphInformation(graph)
}

/**
 * Applies a fade-out animation to items not matching the filter.
 *
 * Creates a semi-transparent overlay fade animation for non-matching nodes, edges, and labels.
 * Only works with WebGL rendering mode.
 *
 * @param graphComponent - The graph component
 * @param filteredNodes - The nodes to be faded
 * @param filteredEdges - The edges to be faded
 * @param filteredLabels - The labels to be faded
 */
export async function fadeOut(graphComponent, filteredNodes, filteredEdges, filteredLabels) {
  // Create fade animation
  const graphModelManager = graphComponent.graphModelManager
  fadeAnimation = graphModelManager.createFadeAnimation({
    type: 'fade-out',
    timing: '500ms ease',
    color1: Color.fromRGBA(0, 0, 0, 0.2)
  })

  // Apply animation to items
  filteredNodes.forEach((node) => {
    getNodeTag(node).visible = false
    graphModelManager.setAnimations(node, [fadeAnimation])
  })
  filteredEdges.forEach((edge) => {
    getEdgeTag(edge).visible = false
    graphModelManager.setAnimations(edge, [fadeAnimation])
  })
  filteredLabels.forEach((label) => {
    graphModelManager.setAnimations(label, [fadeAnimation])
  })

  // Start animation
  await fadeAnimation.start()
  fadeActive = true
}

/**
 * Stops any active fade animation and updates the visibility tag value.
 * @param graph - The graph on which the animation should be reset
 */
export async function resetFadeAnimation(graph) {
  if (fadeActive && fadeAnimation) {
    await fadeAnimation.stop()
    fadeActive = false

    graph.nodes.forEach((node) => {
      getNodeTag(node).visible = true
    })
    graph.edges.forEach((edge) => {
      getEdgeTag(edge).visible = true
    })
  }
}

/**
 * Resets all filtering and fade animations to show the full graph.
 * Makes all items visible and stops any active fade animation.
 *
 * @param graphComponent - The graph component to reset
 * @param resetUI - True if the UI should be reset, false otherwise
 */
export async function resetFiltering(graphComponent, resetUI = false) {
  const graph = graphComponent.graph
  updateGraphVisibility(
    graph,
    () => true,
    () => true,
    true
  )

  // Stop fade animation if active
  await resetFadeAnimation(graph)

  // Stop beacon animation if active
  await resetBeaconAnimation()

  if (resetUI) {
    updateErrorPanel(graph)
    updateGraphInformation(graph)
    subjectSelect.selectedIndex = 0
    predicateSelect.selectedIndex = 0
    objectSelect.selectedIndex = 0
  }
}

/**
 * Updates the node and edge size based on the current graph state.
 *
 * @param graph - The given graph
 */
export function updateGraphInformation(graph) {
  document.querySelector('#graph-nodes').textContent = String(graph.nodes.size)
  document.querySelector('#graph-edges').textContent = String(graph.edges.size)

  const fullGraph = graph.wrappedGraph
  document.querySelector('#all-graph-nodes').textContent = String(fullGraph.nodes.size)
  document.querySelector('#all-graph-edges').textContent = String(fullGraph.edges.size)
}

/**
 * Checks if a value matches a filter pattern.
 * Empty filter pattern matches all values.
 *
 * @param value - The value to check
 * @param pattern - The filter pattern (empty matches all)
 */
function matchesValue(value, pattern) {
  return pattern === '' || value === pattern
}

/**
 * Populates a select element with options.
 *
 * @param select - The select element to populate
 * @param items - Array of values to add as options
 * @param includeAny - Whether to include an "any" option (default: true)
 * @param anyLabel - Label for the "any" option (default: "(Any)")
 */
function populateSelect(select, items, includeAny = true, anyLabel = '(Any)') {
  select.options.length = 0
  if (includeAny) {
    const opt = document.createElement('option')
    opt.value = ''
    opt.text = anyLabel
    select.add(opt)
  }
  for (const item of items) {
    const opt = document.createElement('option')
    opt.value = item
    opt.text = item
    select.add(opt)
  }
}

/**
 * Updates the error panel to show/hide items based on current graph visibility.
 * Disables problem items for nodes/edges that are currently hidden by filtering.
 *
 * @param graph - The current graph (maybe filtered)
 */
function updateErrorPanel(graph) {
  const currentNodeIds = Array.from(graph.nodes).map((node) => getNodeTag(node).id)
  const currentEdgeIds = Array.from(graph.edges).map((edge) => getEdgeTag(edge).id)
  const visibleIds = new Set(currentNodeIds.concat(currentEdgeIds))
  document.querySelectorAll('div.data-problem-container').forEach((container) => {
    if (visibleIds.has(container.id)) {
      container.classList.remove('disabled')
    } else {
      container.classList.add('disabled')
    }
  })

  const graphInformation = document.querySelector('.graph-information-container')
  const footnotes = graphInformation.querySelectorAll('.footnote')
  const footnoteDescription = graphInformation.querySelector('p.footnote')
  if (graph.nodes.size === 0) {
    footnoteDescription.textContent = '* No nodes and edges match the current filtering'
    footnotes.forEach((element) => element.classList.add('error'))
  } else {
    footnoteDescription.textContent = '* Depending on the current triplet filtering'
    footnotes.forEach((element) => element.classList.remove('error'))
  }
}

/**
 * Updates nodes/edge visibility in the wrapped graph using the given predicates.
 *
 * @param graph - The given graph
 * @param nodePredicate - Called with each node; returns true to make it visible
 * @param edgePredicate - Called with each edge; returns true to make it visible
 * @param updateGraph - If true, notify the FilteredGraphWrapper to re-evaluate filters
 */
function updateGraphVisibility(graph, nodePredicate, edgePredicate, updateGraph = false) {
  const wrappedGraph = graph.wrappedGraph
  wrappedGraph.nodes.forEach((node) => {
    getNodeTag(node).visible = Boolean(nodePredicate(node))
  })
  wrappedGraph.edges.forEach((edge) => {
    getEdgeTag(edge).visible = Boolean(edgePredicate(edge))
  })

  if (updateGraph) {
    // Notify graph of visibility changes
    graph.nodePredicateChanged()
    graph.edgePredicateChanged()
  }
}

/**
 * Enables/disabled the HTML elements of the filtering panel.
 * @param disabled - Thue if the panel items should be disabled, false otherwise
 */
export function setFilteringPanelDisabled(disabled) {
  subjectSelect.disabled = disabled
  predicateSelect.disabled = disabled
  objectSelect.disabled = disabled
  applyFilteringButton.disabled = disabled
  fadeOutButton.disabled = disabled
  resetFilteringButton.disabled = disabled
}
