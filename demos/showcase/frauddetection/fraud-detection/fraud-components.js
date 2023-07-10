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
  Animator,
  ConnectedComponents,
  IEdge,
  INode,
  Insets,
  Mapper,
  Rect,
  ViewportAnimation
} from 'yfiles'
import { getEntityData, isFraud } from '../entity-data.js'
import { FraudHighlightManager } from './FraudHighlightManager.js'
import { openFraudDetectionView } from './inspection-view.js'
import { forceToolbarOverflowUpdate } from 'demo-resources/demo-page'

/**
 * The main graph component that displays the graph.
 * @type {GraphComponent}
 */
let graphComponent

/**
 * Holds the manager responsible for the highlighting of the fraud components.
 * @type {HighlightIndicatorManager.<IModelItem>}
 */
let fraudHighlightManager

/**
 * Holds the components that contain nodes marked as fraud.
 */
const visibleFraudComponents = []

/**
 * @param {!GraphComponent} gc
 */
export function initializeFraudHighlights(gc) {
  graphComponent = gc

  // initialize the fraud highlight manager
  fraudHighlightManager = new FraudHighlightManager()
  fraudHighlightManager.install(graphComponent)

  const inputMode = graphComponent.inputMode
  inputMode.itemHoverInputMode.addHoveredItemChangedListener((itemHoverInputMode, event) => {
    updateFraudHighlights(event.item, event.oldItem)
  })

  // clear the highlights when a node or an edge is removed
  const graph = graphComponent.graph
  graph.addNodeRemovedListener(() => {
    clearFraudHighlights()
  })

  graph.addEdgeRemovedListener(() => {
    clearFraudHighlights()
  })
}

/**
 * @param {!Array.<INode>} fraudsters
 */
export function updateFraudWarnings(fraudsters) {
  const currentFraudComponents = new Set()

  // add fraud warning for new fraud components
  fraudsters.forEach(node => {
    const componentIdx = getComponentIdx(node)
    if (visibleFraudComponents.indexOf(componentIdx) < 0) {
      visibleFraudComponents.push(componentIdx)
      createFraudWarning(componentIdx)
    }
    currentFraudComponents.add(componentIdx)
  })

  // remove from the toolbar the warning for the components that are not visible anymore
  for (let i = visibleFraudComponents.length - 1; i >= 0; i--) {
    const componentIdx = visibleFraudComponents[i]
    if (!currentFraudComponents.has(componentIdx)) {
      // remove the component from the visible components
      visibleFraudComponents.splice(i, 1)
      const componentNodes = getComponentNodes(componentIdx)
      // remove highlight from the component related to the removed warning sign
      componentNodes.forEach(node => {
        fraudHighlightManager.removeHighlight(node)
      })
      removeFraudWarning(componentIdx)
    }
  }
}

/**
 * Clears all fraud highlights.
 */
export function clearFraudHighlights() {
  fraudHighlightManager.clearHighlights()
}

/**
 * Adds the fraud warning button associated with the given component.
 * @param {number} componentIdx The index of the given component
 */
function createFraudWarning(componentIdx) {
  const warningButton = document.createElement('button')
  warningButton.title = `Component ${componentIdx}`
  warningButton.id = componentIdx.toString()
  warningButton.classList.add('warning')
  warningButton.textContent = componentIdx.toString()
  document.getElementById('fraud-rings').appendChild(warningButton)
  warningButton.addEventListener('click', () =>
    openFraudDetectionView(componentIdx, graphComponent)
  )
  warningButton.addEventListener('mouseover', event =>
    addFraudComponentHighlight(parseInt(event.currentTarget.id))
  )
  warningButton.addEventListener('mouseleave', () => removeFraudComponentHighlight())

  forceToolbarOverflowUpdate()
}

/**
 * @param {number} componentIdx
 */
function removeFraudWarning(componentIdx) {
  // remove the warning button
  const warningButton = document.getElementById(componentIdx.toString())
  if (warningButton && warningButton.parentNode) {
    warningButton.parentNode.removeChild(warningButton)
  }
  forceToolbarOverflowUpdate()
}

/**
 * Invoked when the mouse is over a warning button to highlight the associated component.
 * @param {number} componentIdx
 * @returns {!Promise}
 */
async function addFraudComponentHighlight(componentIdx) {
  fraudHighlightManager.clearHighlights()
  highlightFraudComponent(componentIdx)
  // animate the view port to the current component index
  await focusFraudComponent(componentIdx)
}

/**
 * Invoked when the mouse leaves a warning button.
 */
function removeFraudComponentHighlight() {
  fraudHighlightManager.clearHighlights()
}

/**
 * Animates the viewport to the given fraud component.
 * @param {number} componentIdx
 * @returns {!Promise}
 */
export async function focusFraudComponent(componentIdx = -1) {
  if (visibleFraudComponents.length > 0) {
    // if no component index is defined, focus on the first visible component instead
    await animateViewPort(componentIdx < 0 ? visibleFraudComponents[0] : componentIdx)
  }
}

/**
 * Animates the viewport to the selected fraud ring.
 * @param {number} componentIdx
 * @returns {!Promise}
 */
async function animateViewPort(componentIdx) {
  // find the component nodes
  const componentNodes = getComponentNodes(componentIdx)
  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  componentNodes.forEach(node => {
    if (graphComponent.graph.contains(node) && isFraud(node)) {
      const { x, y, width, height } = node.layout
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x + width)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y + height)
    }
  })
  if (isFinite(minX) && isFinite(maxX) && isFinite(minY) && isFinite(maxY)) {
    let rect = new Rect(minX, minY, maxX - minX, maxY - minY)
    if (graphComponent.viewport.contains(rect) && graphComponent.zoom > 0.8) {
      return
    }
    // Enlarge the viewport so that we get an overview of the neighborhood as well
    rect = rect.getEnlarged(new Insets(200))

    // Animate the transition to the failed element
    const animator = new Animator(graphComponent)
    animator.allowUserInteraction = true
    const viewportAnimation = new ViewportAnimation(graphComponent, rect, '1s')
    await animator.animate(viewportAnimation.createEasedAnimation(0, 1))
  }
}

/**
 * @param {?IModelItem} item
 * @param {?IModelItem} oldItem
 */
function updateFraudHighlights(item, oldItem) {
  fraudHighlightManager.clearHighlights()
  if (item) {
    if (item instanceof INode) {
      // also hover the warning button
      const componentIdx = getComponentIdx(item)
      const warningButton = document.getElementById(componentIdx.toString())
      if (warningButton) {
        warningButton.classList.add('hover')
      }
      if (isFraud(item)) {
        const componentIndex = getComponentIdx(item)
        highlightFraudComponent(componentIndex)
      }
    } else if (item instanceof IEdge && isFraud(item)) {
      const componentIndex = getComponentIdx(item.sourceNode)
      highlightFraudComponent(componentIndex)
    }
  }

  if (oldItem) {
    if (oldItem instanceof INode) {
      // remove hover class from the warning button
      const componentIdx = getComponentIdx(oldItem)
      const warningButton = document.getElementById(componentIdx.toString())
      // add hover class to button
      if (warningButton) {
        warningButton.classList.remove('hover')
      }
    }
  }
}

/**
 * Highlights the fraud component.
 * @param {number} componentIndex
 */
function highlightFraudComponent(componentIndex) {
  const componentNodes = getComponentNodes(componentIndex)
  const componentNodesSet = new Set(componentNodes)
  graphComponent.graph.edges.forEach(edge => {
    if (componentNodesSet.has(edge.sourceNode) && isFraud(edge)) {
      fraudHighlightManager.addHighlight(edge)
    }
  })
  componentNodes.forEach(node => {
    if (isFraud(node)) {
      fraudHighlightManager.addHighlight(node)
    }
  })
}

/**
 * Maps each component with the list of nodes that this component contains.
 */
const component2Nodes = new Mapper()

/**
 * Holds the component's index to which each node belongs.
 */
const node2Component = new Mapper()

/**
 * Calculates the connected components of the input graph and holds
 * the index of the component to which each component belongs.
 */
export function calculateComponents() {
  component2Nodes.clear()

  const fullGraph = graphComponent.graph.wrappedGraph
  const bankFraud = document.querySelector('#samples').value === 'bank-fraud'

  // for bank fraud, we remove the bank branch nodes to avoid having
  // large components that contain nodes that have no actual relationship with each other
  const result = new ConnectedComponents({
    subgraphNodes: node => !bankFraud || getEntityData(node).type !== 'Bank Branch'
  }).run(fullGraph)

  const nodeComponentIds = result.nodeComponentIds
  fullGraph.nodes.forEach(node => {
    const componentIdx = nodeComponentIds.get(node)
    node2Component.set(node, componentIdx)
    if (!component2Nodes.get(componentIdx)) {
      component2Nodes.set(componentIdx, [])
    }
    component2Nodes.get(componentIdx).push(node)
  })

  if (bankFraud) {
    // we un-hide the bank branch nodes
    // and add them to the components to which their neighbor nodes belong
    fullGraph.nodes.forEach(node => {
      if (getEntityData(node).type === 'Bank Branch') {
        fullGraph.edgesAt(node).forEach(edge => {
          const sourceNode = edge.sourceNode
          const targetNode = edge.targetNode
          const componentIdx =
            sourceNode === node ? getComponentIdx(targetNode) : getComponentIdx(sourceNode)
          const componentNodes = getComponentNodes(componentIdx)
          if (!componentNodes.includes(node)) {
            componentNodes.push(node)
          }
        })
      }
    })
  }
}

/**
 * @param {!INode} node
 * @returns {number}
 */
export function getComponentIdx(node) {
  return node2Component.get(node)
}

/**
 * @param {number} componentIdx
 * @returns {!Array.<INode>}
 */
export function getComponentNodes(componentIdx) {
  return component2Nodes.get(componentIdx) || []
}
