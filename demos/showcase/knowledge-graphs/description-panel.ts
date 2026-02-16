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
import { type GraphComponent, type IEdge, INode } from '@yfiles/yfiles'
import { getEdgeTag, getNodeTag } from './types'
import { mergeDuplicates, removeElement, zoomToItem } from './analysis/handle-problematic-data'
import { initializeErrorBeaconAnimation } from './beacon-animation'

/**
 * Populates the demo description panel with UI elements for each detected data problem.
 * @param graphComponent - The graph component to analyze and display problems for
 * @param filteringCallback - The callback function in case where the filtering has to be reset
 */
export function initializeDescriptionPanel(
  graphComponent: GraphComponent,
  filteringCallback: () => Promise<void>
): void {
  const dataProblemsList = document.querySelector<HTMLDivElement>('#data-problems-list')!
  const problems = collectGraphProblems(graphComponent)
  renderDuplicateNodes(graphComponent, dataProblemsList, problems.duplicatedNodes)
  renderIsolatedNodes(graphComponent, dataProblemsList, problems.isolatedNodes)
  renderDanglingEdges(graphComponent, dataProblemsList, problems.danglingEdges)

  initializeErrorBeaconAnimation(graphComponent, filteringCallback)
}

/**
 * Represents collected problems from the graph.
 */
interface GraphProblems {
  duplicatedNodes: INode[]
  isolatedNodes: INode[]
  danglingEdges: IEdge[]
}

/**
 * Collects all problematic nodes and edges from the graph.
 *
 * @param graphComponent - The graph component to analyze
 */
function collectGraphProblems(graphComponent: GraphComponent): GraphProblems {
  const duplicatedNodes: INode[] = []
  const isolatedNodes: INode[] = []
  const danglingEdges: IEdge[] = []

  graphComponent.graph.nodes.forEach((node) => {
    const problemType = getNodeTag(node).problem?.type
    if (problemType === 'isolatedNode') {
      isolatedNodes.push(node)
    } else if (problemType === 'duplicate') {
      duplicatedNodes.push(node)
    }
  })

  graphComponent.graph.edges.forEach((edge) => {
    if (getEdgeTag(edge).problem?.type === 'danglingEdge') {
      danglingEdges.push(edge)
    }
  })

  return { duplicatedNodes, isolatedNodes, danglingEdges }
}

/**
 * Renders UI items for duplicate nodes in the problems list.
 *
 * @param graphComponent - The graph component
 * @param container - DOM element to append items to
 * @param nodes - Duplicate nodes to render
 */
function renderDuplicateNodes(
  graphComponent: GraphComponent,
  container: HTMLElement,
  nodes: INode[]
): void {
  nodes.forEach((node, index) => {
    const tag = getNodeTag(node)
    const problemId = tag.problem!.id!
    const isLastInGroup = isLastItemInProblemGroup(nodes, index, problemId)

    const element = createProblemContainer({
      id: tag.id,
      iconText: 'copy_all',
      labelText: `Node '${tag.label}' is duplicated`,
      zoomButtonText: 'Zoom to node',
      zoomCallback: () => zoomToItem(graphComponent, node),
      actionButtonText: 'Merge duplicates',
      actionCallback: () => mergeDuplicates(graphComponent, node)
    })

    container.appendChild(element)
    if (isLastInGroup) {
      container.appendChild(createSeparator(tag.id))
    }
  })
}

/**
 * Renders UI items for isolated nodes in the problems list.
 *
 * @param graphComponent - The graph component
 * @param container - DOM element to append items to
 * @param nodes - Isolated nodes to render
 */
function renderIsolatedNodes(
  graphComponent: GraphComponent,
  container: HTMLElement,
  nodes: INode[]
): void {
  nodes.forEach((node, index) => {
    const tag = getNodeTag(node)
    const problemId = tag.problem!.id!
    const isLastInGroup = isLastItemInProblemGroup(nodes, index, problemId)

    const element = createProblemContainer({
      id: tag.id,
      iconText: 'error',
      labelText: `Node '${tag.label}' is isolated`,
      zoomButtonText: 'Zoom to node',
      zoomCallback: () => zoomToItem(graphComponent, node),
      actionButtonText: 'Remove',
      actionCallback: () => removeElement(graphComponent, node)
    })

    container.appendChild(element)
    if (isLastInGroup) {
      container.appendChild(createSeparator(tag.id))
    }
  })
}

/**
 * Renders UI items for dangling edges in the problems list.
 *
 * @param graphComponent - The graph component
 * @param container - DOM element to append items to
 * @param edges - Dangling edges to render
 */
function renderDanglingEdges(
  graphComponent: GraphComponent,
  container: HTMLElement,
  edges: IEdge[]
): void {
  edges.forEach((edge, index) => {
    const tag = getEdgeTag(edge)
    const problemId = tag.problem!.id!
    const isLastInGroup = isLastItemInProblemGroup(edges, index, problemId)

    const element = createProblemContainer({
      id: tag.id,
      iconText: 'warning',
      labelText: `Edge '${tag.label}' has incorrect endpoints`,
      zoomButtonText: 'Zoom to edge',
      zoomCallback: () => zoomToItem(graphComponent, edge),
      actionButtonText: 'Remove',
      actionCallback: () => removeElement(graphComponent, edge)
    })

    container.appendChild(element)
    if (isLastInGroup) {
      container.appendChild(createSeparator(tag.id))
    }
  })
}

/**
 * Checks if an item is the last in its problem group.
 *
 * @param items - Array of items to check
 * @param index - Current index in the array
 * @param currentProblemId - Problem ID of current item
 */
function isLastItemInProblemGroup(
  items: INode[] | IEdge[],
  index: number,
  currentProblemId: number
): boolean {
  if (index === items.length - 1) {
    return true
  }

  const nextItem = items[index + 1]
  const nextProblemId =
    nextItem instanceof INode ? getNodeTag(nextItem).problem?.id : getEdgeTag(nextItem).problem?.id

  return nextProblemId !== currentProblemId
}

/**
 * Options for creating a problem container.
 */
interface ProblemContainerOptions {
  id: string
  iconText: string
  labelText: string
  zoomButtonText: string
  zoomCallback: () => Promise<void>
  actionButtonText?: string
  actionCallback?: () => void
}

/**
 * Creates a problem item container with icon, label, and action buttons.
 *
 * @param options - Configuration for the problem container
 */
function createProblemContainer(options: ProblemContainerOptions): HTMLElement {
  const container = document.createElement('div')
  container.className = 'data-problem-container'
  container.setAttribute('id', options.id)

  container.innerHTML = `
    <span class="material-icon">${options.iconText}</span>
    <div>
      <p>${options.labelText}</p>
      <button class="main-interaction-button zoom-button">${options.zoomButtonText}</button>
      ${options.actionButtonText ? `<button class="main-interaction-button action-button">${options.actionButtonText}</button>` : ''}
    </div>
  `

  // Setup zoom button listener
  const zoomButton = container.querySelector('.zoom-button')!
  zoomButton.addEventListener('click', async () => {
    await options.zoomCallback()
  })

  // Setup action button listener if provided
  if (options.actionButtonText && options.actionCallback) {
    const actionButton = container.querySelector('.action-button')!
    actionButton.addEventListener('click', options.actionCallback)
  }

  return container
}

/**
 * Creates a visual separator element between problem groups.
 *
 * @param id - The ID to associate with the separator
 */
function createSeparator(id: string): HTMLDivElement {
  const separator = document.createElement('div')
  separator.className = 'group-separator'
  separator.setAttribute('id', `sep-${id}`)
  return separator
}
