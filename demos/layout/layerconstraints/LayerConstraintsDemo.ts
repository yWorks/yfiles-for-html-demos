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
  EdgeSegmentLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HierarchicalLayout,
  HierarchicalLayoutData,
  type IGraph,
  type IInputModeContext,
  INode,
  LabelStyle,
  LayoutExecutor,
  License,
  Point,
  Rect,
  Size
} from '@yfiles/yfiles'
import { RandomGraphGenerator } from '@yfiles/demo-utils/RandomGraphGenerator'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'
import { constraintNodeStyle } from './style-templates'

type LayerConstraintsData = { value: number; constraints: boolean }

async function run(): Promise<void> {
  License.value = licenseData

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
  const hierarchicalLayout = new HierarchicalLayout({
    fromScratchLayeringStrategy: 'hierarchical-topmost'
  })

  // and layout data for it
  const hierarchicalLayoutData = new HierarchicalLayoutData()

  const layerConstraints = hierarchicalLayoutData.layerConstraints

  // assign constraints for all nodes in the graph
  for (const node of graphComponent.graph.nodes) {
    const data = node.tag as LayerConstraintsData | null
    if (data && data.constraints) {
      // Ensure that nodes with value 0 and 7 are always at the top and bottom, respectively
      if (data.value === 0) {
        layerConstraints.placeAtTop(node)
      }
      if (data.value === 7) {
        layerConstraints.placeAtBottom(node)
      } else {
        // All nodes can then be sorted into their respective layers by their value
        layerConstraints.nodeComparables.mapper.set(node, data.value)
      }
    }
  }

  // perform the layout operation
  setUIDisabled(true)
  try {
    // Ensure that the LayoutExecutor class is not removed by build optimizers
    // It is needed for the 'applyLayoutAnimated' method in this demo.
    LayoutExecutor.ensure()

    await graphComponent.applyLayoutAnimated(hierarchicalLayout, '1s', hierarchicalLayoutData)
  } finally {
    setUIDisabled(false)
  }
}

/**
 * Disables the HTML elements of the UI and the input mode.
 *
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
    labelEditableItems: GraphItemTypes.EDGE | GraphItemTypes.EDGE_LABEL,
    showHandleItems: GraphItemTypes.ALL ^ GraphItemTypes.NODE
  })
  inputMode.editLabelInputMode.addEventListener('validate-label-text', (evt) => {
    function validateText(newText: string): string | null {
      if (evt.newText.length === 0) {
        return null
      }
      const result = Number.parseFloat(evt.newText)
      if (!Number.isNaN(result)) {
        // only allow numbers between 0 and 100
        return result > 100 && result <= 0 ? null : newText
      }
      return null
    }

    evt.validatedText = validateText(evt.newText.trim())
  })

  // listener for the buttons on the nodes
  inputMode.addEventListener('item-clicked', (evt) => {
    if (evt.item instanceof INode) {
      const node = evt.item
      const location = evt.location
      const { x, y, width, height } = node.layout
      const data = node.tag as LayerConstraintsData
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

  // create a simple label style
  const labelStyle = new LabelStyle({
    font: 'Arial',
    backgroundFill: 'white',
    autoFlip: true,
    padding: [3, 5, 3, 5]
  })

  // set the style as the default for all new labels
  graph.nodeDefaults.labels.style = labelStyle
  graph.edgeDefaults.labels.style = labelStyle
  graph.edgeDefaults.labels.layoutParameter =
    new EdgeSegmentLabelModel().createParameterFromCenter()
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
    nodeCreator: (graph: IGraph): INode => createNodeCallback(null!, graph, Point.ORIGIN, null)
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
    tag: { value: Math.round(Math.random() * 7), constraints: Math.random() < 0.9 }
  })
}

/**
 * Enables or disables all constraints for the graph's nodes.
 * @yjs:keep = constraints
 */
function setConstraintsEnabled(graphComponent: GraphComponent, enabled: boolean): void {
  const graph = graphComponent.graph
  for (const node of graph.nodes) {
    const data = node.tag as LayerConstraintsData
    if (data) {
      node.tag = { ...data, constraints: enabled }
    }
  }
  graphComponent.updateVisual()
}

run().then(finishLoading)
