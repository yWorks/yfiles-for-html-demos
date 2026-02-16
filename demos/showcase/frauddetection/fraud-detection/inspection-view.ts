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
  AdjacencyTypes,
  FilteredGraphWrapper,
  GraphComponent,
  GraphCopier,
  GraphEditorInputMode,
  HierarchicalLayout,
  HierarchicalLayoutData,
  IEdge,
  type IGraph,
  type IModelItem,
  INode,
  OrganicLayout,
  OrganicLayoutData,
  OrganicScope,
  PlaceNodesAtBarycenterStage,
  PlaceNodesAtBarycenterStageData,
  Rect
} from '@yfiles/yfiles'

import { type Entity, getEntityData, getNode, getTimeEntry, isFraud } from '../entity-data'
import { getComponentIdx, getComponentNodes } from './fraud-components'
import { Timeline } from '../timeline/Timeline'
import { clearPropertiesView, initializePropertiesView } from '../properties-view'
import { enableTooltips } from '../entity-tooltip'
import { initializeHighlights } from '../initialize-highlights'
import { useSingleSelection } from '../../mindmap/interaction/single-selection'

let fraudToolbarInitialized = false
let fraudDetectionComponent: GraphComponent
let fraudDetectionTimeline: Timeline<Entity>
let filteredGraph: FilteredGraphWrapper
let incrementalNodes: INode[] = []
let graphChanged = false
let componentIndex = -1

function getLayoutStyle(): 'organic' | 'hierarchical' {
  const bankFraud = document.querySelector<HTMLSelectElement>('#samples')!.value === 'bank-fraud'
  return bankFraud ? 'organic' : 'hierarchical'
}

/**
 * Runs the layout.
 */
async function runLayout(incremental = false): Promise<void> {
  if (!incremental) {
    void fraudDetectionComponent.fitGraphBounds()
  }

  if (getLayoutStyle() === 'organic') {
    const layout = new OrganicLayout({ deterministic: true, avoidNodeEdgeOverlap: true })

    if (incremental) {
      // move the new nodes between their neighbors before the actual layout for a smooth animation
      const layoutData = new PlaceNodesAtBarycenterStageData({
        affectedNodes: (node) => incrementalNodes.includes(node)
      })
      const initialLayout = new PlaceNodesAtBarycenterStage()
      fraudDetectionComponent.graph.applyLayout(initialLayout, layoutData)
    }

    // run the actual layout algorithm
    const organicLayoutData = new OrganicLayoutData()
    if (incremental) {
      organicLayoutData.scope.scopeModes = (node) =>
        incrementalNodes.includes(node)
          ? OrganicScope.INCLUDE_EXTENDED_NEIGHBORHOOD
          : OrganicScope.FIXED
    }

    await fraudDetectionComponent.applyLayoutAnimated({
      layout: layout,
      layoutData: organicLayoutData
    })
  } else {
    const layout = new HierarchicalLayout({
      layoutOrientation: 'bottom-to-top',
      fromSketchMode: incremental,
      defaultEdgeDescriptor: { routingStyleDescriptor: { defaultRoutingStyle: 'octilinear' } }
    })

    const hierarchicalLayoutData = new HierarchicalLayoutData()
    if (incremental) {
      hierarchicalLayoutData.incrementalNodes = incrementalNodes
    }

    await fraudDetectionComponent.applyLayoutAnimated({
      layout: layout,
      layoutData: hierarchicalLayoutData
    })
  }

  void fraudDetectionComponent.fitGraphBounds()

  incrementalNodes.length = 0
  graphChanged = false
}

/**
 * Initializes the input mode for the fraud detection graph component.
 */
function initializeInputMode(): void {
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
    movableSelectedItems: 'none',
    movableUnselectedItems: 'none'
  })
  inputMode.marqueeSelectionInputMode.enabled = false

  inputMode.addEventListener('deleting-selection', (evt) => {
    const selection = evt.selection
    for (const item of selection) {
      if (item instanceof INode) {
        filteredGraph.edgesAt(item, AdjacencyTypes.ALL).forEach((edge) => {
          if (!selection.includes(edge.opposite(item))) {
            incrementalNodes.push(edge.opposite(item) as INode)
          }
        })
      } else if (item instanceof IEdge) {
        if (!selection.includes(item.sourceNode)) {
          incrementalNodes.push(item.sourceNode)
        }
        if (!selection.includes(item.targetNode)) {
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
 */
function copyGraph(graph: IGraph, componentNodes: INode[]): void {
  const graphCopier = new GraphCopier()
  graphCopier.copy(graph, fraudDetectionComponent.graph, (item) => {
    return (
      !(item instanceof INode) ||
      (componentNodes.includes(item) && getEntityData(item).type !== 'Bank Branch')
    )
  })
}

/**
 * Creates and configures the timeline components.
 */
function initializeTimelineComponent(): void {
  fraudDetectionTimeline = new Timeline('fraud-detection-timeline-component', getTimeEntry)
  fraudDetectionTimeline.items = fraudDetectionComponent.graph.nodes.map(getEntityData).toArray()
  fraudDetectionTimeline.setBarHoverListener((nodes) => {
    const highlights = fraudDetectionComponent.highlights
    highlights.clear()

    const selected = new Set(nodes.map((node) => node.id))

    fraudDetectionComponent.graph.nodes.forEach((node) => {
      const entity = getEntityData(node)
      if (selected.has(entity.id)) {
        highlights.add(node)
      }
    })
  })

  fraudDetectionTimeline.setBarSelectListener((nodes) => {
    fraudDetectionComponent.selection.clear()
    if (nodes.length > 0) {
      let minX: number = Number.POSITIVE_INFINITY
      let maxX: number = Number.NEGATIVE_INFINITY
      let minY: number = Number.POSITIVE_INFINITY
      let maxY: number = Number.NEGATIVE_INFINITY
      nodes
        .map((node) => getNode(fraudDetectionComponent.graph, node))
        .filter((node) => filteredGraph.contains(node))
        .forEach((node) => {
          fraudDetectionComponent.selection.add(node!)
          const { x, y, width, height } = node!.layout
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
  fraudDetectionTimeline.setFilterChangedListener(() => {
    filteredGraph.nodePredicateChanged()

    if (incrementalNodes.length > 0 || graphChanged) {
      void runLayout(true)
    }
  })
}

/**
 * Initializes the graph of the fraud detection view.
 */
function initializeGraph(graph: IGraph): void {
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
        !filteredGraph
          .wrappedGraph!.neighbors(node)
          .every((neighbor) => fraudDetectionTimeline.filter(getEntityData(neighbor)))
      ) {
        return false
      }
    }

    return true
  })
  fraudDetectionComponent.graph = filteredGraph

  filteredGraph.addEventListener('node-created', (evt) => {
    const node = evt.item
    incrementalNodes.push(node)
  })

  filteredGraph.addEventListener('edge-created', (evt) => {
    const sourceNode = evt.item.sourceNode
    const targetNode = evt.item.targetNode
    if (!incrementalNodes.includes(sourceNode)) {
      incrementalNodes.push(sourceNode)
    }
    if (!incrementalNodes.includes(targetNode)) {
      incrementalNodes.push(targetNode)
    }
  })

  filteredGraph.addEventListener('edge-removed', (evt) => {
    const sourceNode = evt.item.sourceNode
    const targetNode = evt.item.targetNode
    if (!incrementalNodes.includes(sourceNode)) {
      incrementalNodes.push(sourceNode)
    }
    if (!incrementalNodes.includes(targetNode)) {
      incrementalNodes.push(targetNode)
    }
  })

  filteredGraph.addEventListener('node-removed', () => {
    graphChanged = true
  })

  incrementalNodes = []
  graphChanged = false
}

/**
 * Wires up the buttons of the inspection view component.
 */
function initializeFraudToolbarButtons(): void {
  toggleMainViewActionsVisibility(false)
  if (!fraudToolbarInitialized) {
    fraudToolbarInitialized = true

    document.getElementById('layout-button')!.addEventListener(
      'click',
      () => {
        void runLayout(false)
        void fraudDetectionComponent.fitGraphBounds()
      },
      true
    )
    document
      .getElementById('closeFraudDetection')!
      .addEventListener('click', closeFraudDetectionView, true)
  }
}

/**
 * Toggles the visibility of toolbar buttons that are not available in the fraud ring view.
 */
function toggleMainViewActionsVisibility(visible: boolean): void {
  document.querySelector<HTMLDivElement>('.main-view-buttons')!.style.display = visible
    ? 'flex'
    : 'none'
}

/**
 * Invoked when an edge/node of a fraud ring is clicked or a fraud warning button is pressed.
 */
export function openFraudDetectionView(compIndex: number, graphComponent: GraphComponent): void {
  if (compIndex === componentIndex) return

  closeFraudDetectionView()

  componentIndex = compIndex

  // create the fraud detection component div
  fraudDetectionComponent = new GraphComponent()
  const fraudDetectionViewDiv = document.querySelector<HTMLDivElement>('.fraud-detection-view')!
  const fraudDetectionTitle = document.querySelector<HTMLElement>('.fraud-detection-view__title')!
  const fraudDetectionTimeline = document.querySelector<HTMLDivElement>(
    '#fraud-detection-timeline-component'
  )!
  const fraudDetectionLayoutButton = document.querySelector<HTMLButtonElement>('#layout-button')!
  fraudDetectionViewDiv.insertBefore(fraudDetectionComponent.htmlElement, fraudDetectionTimeline)
  fraudDetectionComponent.htmlElement.id = 'fraud-detection-component'

  // display the component
  fraudDetectionViewDiv.classList.add('fraud-detection-view--visible')
  fraudDetectionLayoutButton.classList.add('visible')
  fraudDetectionTitle.innerHTML = `Fraud Ring ${compIndex}`

  initializeFraudToolbarButtons()
  initializeInputMode()
  initializeHighlights(fraudDetectionComponent)
  enableTooltips(fraudDetectionComponent)
  initializePropertiesView(fraudDetectionComponent)

  copyGraph(
    (graphComponent.graph as FilteredGraphWrapper).wrappedGraph!,
    getComponentNodes(compIndex)
  )
  initializeTimelineComponent()
  initializeGraph(fraudDetectionComponent.graph)
  void runLayout()
}

export function openInspectionViewForItem(item: IModelItem, graphComponent: GraphComponent): void {
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

export function closeFraudDetectionView(): void {
  if (componentIndex !== -1) {
    const fraudDetectionViewDiv = document.querySelector<HTMLDivElement>('.fraud-detection-view')!
    fraudDetectionViewDiv.classList.remove('fraud-detection-view--visible')
    const fraudDetectionLayoutButton = document.querySelector<HTMLButtonElement>('#layout-button')!
    fraudDetectionLayoutButton.classList.remove('visible')

    const fraudDetectionComponentDiv = document.getElementById('fraud-detection-component')
    if (fraudDetectionComponentDiv) {
      fraudDetectionComponentDiv.parentNode!.removeChild(fraudDetectionComponentDiv)
    }
    fraudDetectionTimeline.cleanUp()

    // remove elements from the div of the fraud detection timeline
    const graphTimeline = document.querySelector<HTMLDivElement>(
      '#fraud-detection-timeline-component'
    )!
    while (graphTimeline.hasChildNodes()) {
      const child = graphTimeline.firstChild!
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
  incrementalNodes = []
  componentIndex = -1
  clearPropertiesView()
  toggleMainViewActionsVisibility(true)
}
