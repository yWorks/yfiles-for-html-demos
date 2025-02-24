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
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HierarchicalLayout,
  HierarchicalLayoutData,
  IGraph,
  IInputModeContext,
  INode,
  LayoutExecutor,
  License,
  Point,
  Rect,
  Size
} from '@yfiles/yfiles'

import RandomGraphGenerator from '@yfiles/demo-utils/RandomGraphGenerator'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import { constraintNodeStyle } from './style-templates'

type SequenceConstraintsData = { value: number; constraints: boolean }

async function run(): Promise<void> {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('graphComponent')
  initializeInputMode(graphComponent)
  initializeGraph(graphComponent.graph)

  createGraph(graphComponent.graph)

  await runLayout(graphComponent)

  initializeUI(graphComponent)
}

/**
 * @yjs:keep = constraints
 */
async function runLayout(graphComponent: GraphComponent): Promise<void> {
  // create a new layout algorithm
  const hierarchicalLayout = new HierarchicalLayout()

  // and layout data for it
  const hierarchicalLayoutData = new HierarchicalLayoutData()

  // this is the factory that we apply the constraints to
  const sequenceConstraints = hierarchicalLayoutData.sequenceConstraints

  // assign constraints for the nodes in the graph
  for (const node of graphComponent.graph.nodes) {
    const data = node.tag as SequenceConstraintsData | null
    if (data && data.constraints) {
      if (data.value === 0) {
        sequenceConstraints.placeNodeAtHead(node)
      } else if (data.value === 7) {
        sequenceConstraints.placeNodeAtTail(node)
      } else {
        sequenceConstraints.itemComparables.mapper.set(node, data.value)
      }
    }
  }

  // Ensure that the LayoutExecutor class is not removed by build optimizers
  // It is needed for the 'applyLayoutAnimated' method in this demo.
  LayoutExecutor.ensure()

  // perform the layout operation
  setUIDisabled(true)
  try {
    await graphComponent.applyLayoutAnimated(hierarchicalLayout, '1s', hierarchicalLayoutData)
  } finally {
    setUIDisabled(false)
  }
}

/**
 * Disables the HTML elements of the UI and the input mode.
 * @param disabled true if the elements should be disabled, false otherwise
 */
function setUIDisabled(disabled: boolean): void {
  document.querySelector<HTMLButtonElement>('#new-button')!.disabled = disabled
  document.querySelector<HTMLButtonElement>('#enable-all-constraints')!.disabled = disabled
  document.querySelector<HTMLButtonElement>('#disable-all-constraints')!.disabled = disabled
  document.querySelector<HTMLButtonElement>('#layout')!.disabled = disabled
}

/**
 * Initializes the input mode for interaction.
 * @yjs:keep = constraints
 */
function initializeInputMode(graphComponent: GraphComponent): void {
  const inputMode = new GraphEditorInputMode({
    nodeCreator: createNodeCallback,
    labelEditableItems: GraphItemTypes.NONE,
    showHandleItems: GraphItemTypes.ALL ^ GraphItemTypes.NODE
  })

  // listener for the buttons on the nodes
  inputMode.addEventListener('item-clicked', (evt) => {
    if (evt.item instanceof INode) {
      const node = evt.item
      const location = evt.location
      const { x, y, width, height } = node.layout
      const data = node.tag as SequenceConstraintsData
      if (data.constraints) {
        if (location.y > y + height * 0.5) {
          if (location.x < x + width * 0.3) {
            node.tag = { ...data, value: Math.max(0, data.value - 1) }
          } else if (location.x > x + width * 0.7) {
            node.tag = { ...data, value: Math.min(7, data.value + 1) }
          } else {
            node.tag = { ...data, constraints: !data.constraints }
          }
        }
      } else {
        node.tag = { ...data, constraints: !data.constraints }
      }
    }
  })

  graphComponent.inputMode = inputMode
}

/**
 * Initializes the graph instance setting default styles and creates a small sample graph.
 */
function initializeGraph(graph: IGraph): void {
  // minimum size for nodes
  const size = new Size(60, 50)

  // set the style as the default for all new nodes
  graph.nodeDefaults.style = constraintNodeStyle
  graph.nodeDefaults.size = size
}

/**
 * Clears the existing graph and creates a new random graph
 */
function createGraph(graph: IGraph): void {
  // remove all nodes and edges from the graph
  graph.clear()

  // create a new random graph
  new RandomGraphGenerator({
    $allowCycles: true,
    $allowMultipleEdges: false,
    $allowSelfLoops: false,
    $edgeCount: 25,
    $nodeCount: 20,
    nodeCreator: (graph) => createNodeCallback(null!, graph, Point.ORIGIN, null)
  }).generate(graph)
}

/**
 * Binds actions to the buttons in the toolbar.
 */
function initializeUI(graphComponent: GraphComponent): void {
  const graph = graphComponent.graph

  document.querySelector<HTMLButtonElement>('#new-button')!.addEventListener('click', async () => {
    createGraph(graph)
    await runLayout(graphComponent)
  })
  document
    .querySelector<HTMLButtonElement>('#enable-all-constraints')!
    .addEventListener('click', () => setConstraintsEnabled(graphComponent, true))
  document
    .querySelector<HTMLButtonElement>('#disable-all-constraints')!
    .addEventListener('click', () => setConstraintsEnabled(graphComponent, false))
  document
    .querySelector<HTMLButtonElement>('#layout')!
    .addEventListener('click', async () => await runLayout(graphComponent))
}

/**
 * Callback that actually creates the node and its business object.
 */
function createNodeCallback(
  _context: IInputModeContext,
  graph: IGraph,
  location: Point,
  _parent: INode | null
): INode {
  const bounds = Rect.fromCenter(location, graph.nodeDefaults.size)
  return graph.createNode({
    layout: bounds,
    tag: {
      value: Math.round(Math.random() * 7),
      constraints: Math.random() < 0.9
    }
  })
}

/**
 * Enables or disables all constraints for the graph's nodes.
 * @yjs:keep = constraints
 */
function setConstraintsEnabled(graphComponent: GraphComponent, enabled: boolean): void {
  const graph = graphComponent.graph
  for (const node of graph.nodes) {
    const data = node.tag as SequenceConstraintsData
    if (data) {
      node.tag = { ...data, constraints: enabled }
    }
  }
  graphComponent.updateVisual()
}

run().then(finishLoading)
