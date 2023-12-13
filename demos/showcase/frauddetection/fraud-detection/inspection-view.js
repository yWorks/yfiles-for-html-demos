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
  AdjacencyTypes,
  FilteredGraphWrapper,
  GraphComponent,
  GraphCopier,
  GraphEditorInputMode,
  HierarchicLayout,
  HierarchicLayoutData,
  IEdge,
  INode,
  LayoutStageBase,
  Mapper,
  OrganicLayout,
  OrganicLayoutData,
  OrganicLayoutScope,
  PortCalculator,
  Rect,
  YBoolean
} from 'yfiles'

import { getEntityData, getNode, getTimeEntry, isFraud } from '../entity-data.js'
import { getComponentIdx, getComponentNodes } from './fraud-components.js'
import Timeline from '../timeline/Timeline.js'
import { clearPropertiesView, initializePropertiesView } from '../properties-view.js'
import { enableTooltips } from '../entity-tooltip.js'
import { initializeHighlights } from '../initialize-highlights.js'
import { useSingleSelection } from '../../mindmap/interaction/single-selection.js'

/** @type {boolean} */
let fraudToolbarInitialized = false
/** @type {GraphComponent} */
let fraudDetectionComponent
/** @type {Timeline.<Entity>} */
let fraudDetectionTimeline
/** @type {FilteredGraphWrapper} */
let filteredGraph
/** @type {Array} */
let incrementalNodes = []
/** @type {boolean} */
let graphChanged = false
/** @type {boolean} */
let layoutFromScratch = true
const nodesAdded = new Mapper()
/** @type {number} */
let componentIndex = -1

/**
 * @returns {!('organic'|'hierarchic')}
 */
function getLayoutStyle() {
  const bankFraud = document.querySelector('#samples').value === 'bank-fraud'
  return bankFraud ? 'organic' : 'hierarchic'
}

/**
 * Runs the layout.
 * @param {boolean} fromScratch
 * @returns {!Promise}
 */
async function runLayout(fromScratch) {
  if (getLayoutStyle() === 'organic') {
    const layout = new OrganicLayout()
    layout.deterministic = true
    layout.scope = fromScratch ? OrganicLayoutScope.ALL : OrganicLayoutScope.MAINLY_SUBSET
    layout.considerNodeSizes = true
    layout.nodeEdgeOverlapAvoided = true

    if (!fromScratch) {
      layout.appendStage(new InitialPositionsStage(layout))
    }

    const organicLayoutData = new OrganicLayoutData({
      affectedNodes: incrementalNodes
    })

    // apply layout
    const graph = fraudDetectionComponent.graph
    graph.mapperRegistry.addMapper(INode.$class, YBoolean.$class, 'NODES_ADDED', nodesAdded)
    graph.applyLayout(layout, organicLayoutData)
    graph.mapperRegistry.removeMapper('NODES_ADDED')
  } else {
    const layout = new HierarchicLayout({
      layoutOrientation: 'bottom-to-top',
      orthogonalRouting: false,
      layoutMode: fromScratch ? 'from-scratch' : 'incremental'
    })

    const hierarchicLayoutData = new HierarchicLayoutData()
    if (!fromScratch) {
      hierarchicLayoutData.incrementalHints.incrementalLayeringNodes = incrementalNodes
    }

    layout.prependStage(new PortCalculator())

    // apply layout
    await fraudDetectionComponent.morphLayout(layout, '1s', hierarchicLayoutData)
  }

  if (layoutFromScratch) {
    fraudDetectionComponent.fitGraphBounds()
  }
  layoutFromScratch = false
  incrementalNodes.length = 0
  graphChanged = false
  nodesAdded.clear()
}

/**
 * Initializes the input mode for the fraud detection graph component.
 */
function initializeInputMode() {
  const inputMode = new GraphEditorInputMode({
    allowCreateNode: false,
    allowCreateEdge: false,
    allowCreateBend: false,
    allowDuplicate: false,
    allowGroupingOperations: false,
    allowClipboardOperations: false,
    allowUndoOperations: false,
    allowEditLabelOnDoubleClick: false,
    clickableItems: 'node',
    selectableItems: 'node',
    focusableItems: 'none',
    showHandleItems: 'none',
    deletableItems: 'none',
    movableItems: 'none'
  })
  inputMode.marqueeSelectionInputMode.enabled = false
  inputMode.moveUnselectedInputMode.enabled = true

  inputMode.addDeletingSelectionListener((_, evt) => {
    const selection = evt.selection
    for (const item of selection) {
      if (item instanceof INode) {
        filteredGraph.edgesAt(item, AdjacencyTypes.ALL).forEach((edge) => {
          if (!selection.isSelected(edge.opposite(item))) {
            incrementalNodes.push(edge.opposite(item))
          }
        })
      } else if (item instanceof IEdge) {
        if (!selection.isSelected(item.sourceNode)) {
          incrementalNodes.push(item.sourceNode)
        }
        if (!selection.isSelected(item.targetNode)) {
          incrementalNodes.push(item.targetNode)
        }
      }
    }
  })

  fraudDetectionComponent.inputMode = inputMode

  useSingleSelection(fraudDetectionComponent)
}

/**
 * Copies to the fraud detection component graph only the part of the input graph that belongs to the investigated
 * component.
 * @param {!IGraph} graph
 * @param {!Set.<INode>} componentNodes
 */
function copyGraph(graph, componentNodes) {
  const graphCopier = new GraphCopier()
  graphCopier.copy(
    graph,
    (item) =>
      !INode.isInstance(item) ||
      (componentNodes.has(item) && getEntityData(item).type !== 'Bank Branch'),
    fraudDetectionComponent.graph,
    null
  )
}

/**
 * Creates and configures the timeline components.
 */
function initializeTimelineComponent() {
  fraudDetectionTimeline = new Timeline('fraud-detection-timeline-component', getTimeEntry)
  fraudDetectionTimeline.items = fraudDetectionComponent.graph.nodes.map(getEntityData).toArray()
  fraudDetectionTimeline.addBarHoverListener((nodes) => {
    const highlightManager = fraudDetectionComponent.highlightIndicatorManager
    highlightManager.clearHighlights()

    const selected = new Set(nodes.map((node) => node.id))

    fraudDetectionComponent.graph.nodes.forEach((node) => {
      const entity = getEntityData(node)
      if (selected.has(entity.id)) {
        highlightManager.addHighlight(node)
      }
    })
  })

  fraudDetectionTimeline.addBarSelectListener((nodes) => {
    fraudDetectionComponent.selection.clear()
    if (nodes.length > 0) {
      let minX = Number.POSITIVE_INFINITY
      let maxX = Number.NEGATIVE_INFINITY
      let minY = Number.POSITIVE_INFINITY
      let maxY = Number.NEGATIVE_INFINITY
      nodes
        .map((node) => getNode(fraudDetectionComponent.graph, node))
        .filter((node) => filteredGraph.contains(node))
        .forEach((node) => {
          fraudDetectionComponent.selection.setSelected(node, true)
          const { x, y, width, height } = node.layout
          minX = Math.min(minX, x)
          maxX = Math.max(maxX, x + width)
          minY = Math.min(minY, y)
          maxY = Math.max(maxY, y + height)
        })
      if (
        minX !== Number.POSITIVE_INFINITY &&
        maxX !== Number.NEGATIVE_INFINITY &&
        minY !== Number.POSITIVE_INFINITY &&
        maxY !== Number.NEGATIVE_INFINITY
      ) {
        void fraudDetectionComponent.ensureVisible(new Rect(minX, minY, maxX - minX, maxY - minY))
      }
    }
  })
  fraudDetectionTimeline.addFilterChangedListener(() => {
    filteredGraph.nodePredicateChanged()

    if (incrementalNodes.length > 0 || graphChanged) {
      void runLayout(layoutFromScratch)
    }
  })
}

/**
 * Initializes the graph of the fraud detection view.
 * @param {!IGraph} graph
 */
function initializeGraph(graph) {
  // get the graph from the timeline component
  filteredGraph = new FilteredGraphWrapper(graph, (node) => {
    const visible = fraudDetectionTimeline.filter(getEntityData(node))

    if (!visible) {
      return false
    }

    // In bank fraud detection, there exist bank branch nodes that are connected to many nodes,
    // and thus the enter/exit dates may cover a really wide time range.
    // To avoid having isolated bank nodes, we remove them after filtering if they have no
    // connections to the current graph nodes.
    if (getLayoutStyle() === 'organic') {
      if (
        getEntityData(node).type === 'Bank Branch' &&
        !filteredGraph.wrappedGraph
          .neighbors(node)
          .every((neighbor) => fraudDetectionTimeline.filter(getEntityData(neighbor)))
      ) {
        return false
      }
    }

    return true
  })
  fraudDetectionComponent.graph = filteredGraph

  filteredGraph.addNodeCreatedListener((_, evt) => {
    const node = evt.item
    incrementalNodes.push(node)
    nodesAdded.set(node, true)
  })

  filteredGraph.addEdgeCreatedListener((_, evt) => {
    const sourceNode = evt.item.sourceNode
    const targetNode = evt.item.targetNode
    if (!incrementalNodes.includes(sourceNode)) {
      incrementalNodes.push(sourceNode)
    }
    if (!incrementalNodes.includes(targetNode)) {
      incrementalNodes.push(targetNode)
    }
  })

  filteredGraph.addEdgeRemovedListener((_, evt) => {
    const sourceNode = evt.item.sourceNode
    const targetNode = evt.item.targetNode
    if (!incrementalNodes.includes(sourceNode)) {
      incrementalNodes.push(sourceNode)
    }
    if (!incrementalNodes.includes(targetNode)) {
      incrementalNodes.push(targetNode)
    }
  })

  filteredGraph.addNodeRemovedListener(() => {
    graphChanged = true
  })

  incrementalNodes = []
  graphChanged = false
  layoutFromScratch = true
}

/**
 * Wires up the buttons of the inspection view component.
 */
function initializeFraudToolbarButtons() {
  toggleMainViewActionsVisibility(false)
  if (!fraudToolbarInitialized) {
    fraudToolbarInitialized = true

    document.getElementById('layout-button').addEventListener(
      'click',
      () => {
        void runLayout(true)
        fraudDetectionComponent.fitGraphBounds()
      },
      true
    )
    document
      .getElementById('closeFraudDetection')
      .addEventListener('click', closeFraudDetectionView, true)
  }
}

/**
 * Toggles the visibility of toolbar buttons that are not available in the fraud ring view.
 * @param {boolean} visible
 */
function toggleMainViewActionsVisibility(visible) {
  document.querySelector('.main-view-buttons').style.display = visible ? 'flex' : 'none'
}

/**
 * Invoked when an edge/node of a fraud ring is clicked or a fraud warning button is pressed.
 * @param {number} compIndex
 * @param {!GraphComponent} graphComponent
 */
export function openFraudDetectionView(compIndex, graphComponent) {
  if (compIndex === componentIndex) return

  closeFraudDetectionView()

  const componentNodes = new Set(getComponentNodes(compIndex))
  componentIndex = compIndex

  // create the fraud detection component div
  fraudDetectionComponent = new GraphComponent()
  const fraudDetectionViewDiv = document.querySelector('.fraud-detection-view')
  const fraudDetectionTitle = document.querySelector('.fraud-detection-view__title')
  const fraudDetectionTimeline = document.querySelector('#fraud-detection-timeline-component')
  const fraudDetectionLayoutButton = document.querySelector('#layout-button')
  fraudDetectionViewDiv.insertBefore(fraudDetectionComponent.div, fraudDetectionTimeline)
  fraudDetectionComponent.div.id = 'fraud-detection-component'

  // display the component
  fraudDetectionViewDiv.classList.add('fraud-detection-view--visible')
  fraudDetectionLayoutButton.classList.add('visible')
  fraudDetectionTitle.innerHTML = `Fraud Ring ${compIndex}`

  initializeFraudToolbarButtons()
  initializeInputMode()
  initializeHighlights(fraudDetectionComponent)
  enableTooltips(fraudDetectionComponent)
  initializePropertiesView(fraudDetectionComponent)

  copyGraph(graphComponent.graph.wrappedGraph, componentNodes)
  initializeTimelineComponent()
  initializeGraph(fraudDetectionComponent.graph)
  void fraudDetectionComponent.fitGraphBounds({ animated: true })
}

/**
 * @param {!IModelItem} item
 * @param {!GraphComponent} graphComponent
 */
export function openInspectionViewForItem(item, graphComponent) {
  if (item instanceof INode) {
    if (isFraud(item)) {
      openFraudDetectionView(getComponentIdx(item), graphComponent)
    }
  } else if (item instanceof IEdge) {
    if (isFraud(item)) {
      openFraudDetectionView(getComponentIdx(item.sourceNode), graphComponent)
    }
  }
}

export function closeFraudDetectionView() {
  if (componentIndex !== -1) {
    const fraudDetectionViewDiv = document.querySelector('.fraud-detection-view')
    fraudDetectionViewDiv.classList.remove('fraud-detection-view--visible')
    const fraudDetectionLayoutButton = document.querySelector('#layout-button')
    fraudDetectionLayoutButton.classList.remove('visible')

    const fraudDetectionComponentDiv = document.getElementById('fraud-detection-component')
    if (fraudDetectionComponentDiv) {
      fraudDetectionComponentDiv.parentNode.removeChild(fraudDetectionComponentDiv)
    }
    fraudDetectionTimeline.cleanUp()

    // remove elements from the div of the fraud detection timeline
    const graphTimeline = document.querySelector('#fraud-detection-timeline-component')
    while (graphTimeline.hasChildNodes()) {
      const child = graphTimeline.firstChild
      while (child.lastChild != null) {
        child.removeChild(child.lastChild)
      }
      graphTimeline.removeChild(child)
    }

    const animation = fraudDetectionTimeline.getTimeframeAnimation()
    if (animation.animating) {
      animation.stopAnimation()
    }
  }
  componentIndex = -1
  clearPropertiesView()
  toggleMainViewActionsVisibility(true)
}

/**
 * This stage is responsible for placing the new nodes that are inserted to the graph at the position of the first
 * neighbor that is already placed.
 */
class InitialPositionsStage extends LayoutStageBase {
  /**
   * Applies the layout
   * @param {!LayoutGraph} graph The graph to be laid out.
   */
  applyLayout(graph) {
    const nodesAdded = graph.getDataProvider('NODES_ADDED')

    graph.nodes.forEach((node) => {
      if (nodesAdded.getBoolean(node)) {
        const visited = new Set()
        const stack = [node]
        let coordinates = null
        while (stack.length > 0) {
          const stackNode = stack.pop()
          if (nodesAdded.getBoolean(node) && !visited.has(stackNode)) {
            for (const edge of stackNode.inEdges) {
              const opposite = edge.opposite(stackNode)
              if (!nodesAdded.getBoolean(opposite)) {
                coordinates = graph.getCenter(opposite)
              } else {
                stack.push(opposite)
              }
            }
            visited.add(stackNode)
          }

          if (coordinates != null) {
            graph.setCenter(node, coordinates)
            stack.length = 0
          }
        }
      }
    })
    this.applyLayoutCore(graph)
  }
}
