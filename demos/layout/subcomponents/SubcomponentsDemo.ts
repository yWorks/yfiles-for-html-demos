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
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HierarchicalLayout,
  HierarchicalLayoutData,
  HierarchicalLayoutSubcomponentDescriptor,
  IEnumerable,
  IGraph,
  ILayoutAlgorithm,
  INode,
  LayoutExecutor,
  LayoutOrientation,
  License,
  OrganicLayout,
  OrthogonalLayout,
  SingleLayerSubtreePlacer,
  StraightLineEdgeRouter,
  TreeLayout,
  TreeReductionStage
} from '@yfiles/yfiles'

import { createDemoEdgeStyle, createDemoNodeStyle } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'

type Subcomponent = { nodes: INode[]; layout: ILayoutAlgorithm }

type PlacementPolicyValue = 'automatic' | 'isolated' | 'always-integrated'

/**
 * The collection of subcomponents contains all currently assigned subcomponents.
 */
const subcomponents: Subcomponent[] = []

/**
 * The collection of node styles that are assigned to nodes that are members of the subcomponents.
 */
const nodeStyles = [
  createDemoNodeStyle('demo-blue'),
  createDemoNodeStyle('demo-red'),
  createDemoNodeStyle('demo-purple'),
  createDemoNodeStyle('demo-green'),
  createDemoNodeStyle('demo-lightblue')
]

async function run(): Promise<void> {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('graphComponent')
  configureUserInteraction(graphComponent)

  initializeGraph(graphComponent.graph)

  await createSampleGraph(graphComponent.graph)

  initializeSubcomponents(graphComponent)

  await runLayout(graphComponent)

  registerSelectionListener(graphComponent)

  initializeUI(graphComponent)
}

/**
 * Arranges the graph in the given graph component.
 */
function runLayout(graphComponent: GraphComponent): Promise<void> {
  // initialize a hierarchical layout
  const hierarchicalLayout = new HierarchicalLayout()

  // assign subcomponents with their own layout algorithm and placement policy
  const hierarchicalLayoutData = new HierarchicalLayoutData()
  for (const component of subcomponents) {
    // create a subcomponent descriptor that specifies the layout algorithm
    // and placement policy for the subcomponent
    const descriptor = new HierarchicalLayoutSubcomponentDescriptor({
      layoutAlgorithm: component.layout,
      placementPolicy: document.querySelector<HTMLSelectElement>('#subcomponent-policy-select')!
        .value as PlacementPolicyValue
    })
    // specify a subcomponent with the descriptor
    const subcomponent = hierarchicalLayoutData.subcomponents.add(descriptor)
    // and assign the nodes to this subcomponent
    subcomponent.items = component.nodes
  }

  // Ensure that the LayoutExecutor class is not removed by build optimizers
  // It is needed for the 'applyLayoutAnimated' method in this demo.
  LayoutExecutor.ensure()

  return graphComponent.applyLayoutAnimated(hierarchicalLayout, '700ms', hierarchicalLayoutData)
}

/**
 * Creates a new subcomponent that gets a specific layout from the given nodes.
 */
function createSubcomponent(
  graph: IGraph,
  nodes: IEnumerable<INode>,
  layout: ILayoutAlgorithm
): void {
  if (nodes.size > 0) {
    // find the next free subcomponent index
    let newSubcomponent: Subcomponent
    let newSubcomponentIndex: number = subcomponents.findIndex(
      (component) =>
        component.nodes.length === 0 || component.nodes.every((node) => nodes.includes(node))
    )
    if (newSubcomponentIndex < 0) {
      // add a new subcomponent
      newSubcomponent = { nodes: [], layout }
      subcomponents.push(newSubcomponent)
      newSubcomponentIndex = subcomponents.length - 1
    } else {
      // reuse the former subcomponent
      newSubcomponent = subcomponents[newSubcomponentIndex]
      newSubcomponent.nodes = []
      newSubcomponent.layout = layout
    }

    // update the subcomponents from which the nodes are taken as well as the new subcomponent
    for (const node of nodes) {
      const oldSubcomponentIndex = node.tag
      const oldSubcomponent = oldSubcomponentIndex ? subcomponents[oldSubcomponentIndex] : null
      if (oldSubcomponent && newSubcomponentIndex !== oldSubcomponentIndex) {
        const oldSubcomponentNodes = oldSubcomponent.nodes
        const nodeIndex = oldSubcomponentNodes.indexOf(node)
        oldSubcomponent.nodes.splice(nodeIndex, 1)
      }
      newSubcomponent.nodes.push(node)
      node.tag = newSubcomponentIndex
      graph.setStyle(node, nodeStyles[newSubcomponentIndex % nodeStyles.length])
    }
  }
}

/**
 * Removes the given nodes from every subcomponent.
 */
function removeSubcomponent(graph: IGraph, nodes: IEnumerable<INode>): void {
  for (const node of nodes) {
    if (node.tag !== null) {
      const subcomponentNodes = subcomponents[node.tag].nodes
      subcomponentNodes.splice(subcomponentNodes.indexOf(node), 1)
      node.tag = null
      graph.setStyle(node, graph.nodeDefaults.style.clone())
    }
  }
}

/**
 * Enables interactive editing for the given graph component.
 * Restricts marquee selection to nodes.
 */
function configureUserInteraction(graphComponent: GraphComponent): void {
  graphComponent.inputMode = new GraphEditorInputMode({
    marqueeSelectableItems: GraphItemTypes.NODE
  })
}

/**
 * Sets default styles for nodes and edges.
 */
function initializeGraph(graph: IGraph): void {
  graph.nodeDefaults.style = createDemoNodeStyle()
  graph.nodeDefaults.shareStyleInstance = false
  graph.edgeDefaults.style = createDemoEdgeStyle()
}

/**
 * Creates a sample graph.
 * @yjs:keep = nodes,edges
 */
async function createSampleGraph(graph: IGraph): Promise<void> {
  const response = await fetch('./resources/sample.json')
  const data = await response.json()

  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: data.nodes,
    id: 'id',
    tag: (data: Record<string, any>) => (data.tag != null ? data.tag : null)
  })
  builder.createEdgesSource(data.edges, 'source', 'target')

  builder.buildGraph()
}

/**
 * Creates initial subcomponents in the demo's sample graph.
 */
function initializeSubcomponents(graphComponent: GraphComponent): void {
  const graph = graphComponent.graph

  const hierarchicalLayout = new HierarchicalLayout()
  hierarchicalLayout.layoutOrientation = 'left-to-right'
  createSubcomponent(
    graph,
    graph.nodes.filter((node) => node.tag === 0),
    hierarchicalLayout
  )
  const treeLayout = createTreeLayout()
  createSubcomponent(
    graph,
    graph.nodes.filter((node) => node.tag === 1),
    treeLayout
  )
  const organicLayout = createOrganicLayout()
  createSubcomponent(
    graph,
    graph.nodes.filter((node) => node.tag === 2),
    organicLayout
  )
  createSubcomponent(
    graph,
    graph.nodes.filter((node) => node.tag === 3),
    hierarchicalLayout
  )
  const treeLayout2 = createTreeLayout()
  treeLayout2.layoutOrientation = LayoutOrientation.RIGHT_TO_LEFT
  createSubcomponent(
    graph,
    graph.nodes.filter((node) => node.tag === 4),
    treeLayout2
  )
}

/**
 * Returns a new layout algorithm instance for the layout type that is specified in the layout
 * combo box.
 */
function getLayoutAlgorithm(): TreeLayout | OrganicLayout | OrthogonalLayout | HierarchicalLayout {
  const layout = document.querySelector<HTMLSelectElement>('#layout-select')!.value
  switch (layout) {
    default:
    case 'tree':
      return createTreeLayout()
    case 'organic':
      return createOrganicLayout()
    case 'orthogonal':
      return new OrthogonalLayout()
    case 'hierarchical':
      return new HierarchicalLayout()
  }
}

/**
 * Returns a new tree layout algorithm instance.
 */
function createTreeLayout(): TreeLayout {
  const tree = new TreeLayout()
  ;(tree.defaultSubtreePlacer as SingleLayerSubtreePlacer).edgeRoutingStyle = 'polyline'
  return tree
}

/**
 * Returns a new organic layout algorithm instance.
 */
function createOrganicLayout(): OrganicLayout {
  return new OrganicLayout({ deterministic: true, defaultPreferredEdgeLength: 70 })
}

/**
 * Returns the layout orientation that is specified in the combo-box.
 */
function getLayoutOrientation(): LayoutOrientation {
  const orientation = document.querySelector<HTMLSelectElement>('#orientation-select')!.value
  switch (orientation) {
    default:
    case 'top-to-bottom':
      return LayoutOrientation.TOP_TO_BOTTOM
    case 'bottom-to-top':
      return LayoutOrientation.BOTTOM_TO_TOP
    case 'left-to-right':
      return LayoutOrientation.LEFT_TO_RIGHT
    case 'right-to-left':
      return LayoutOrientation.RIGHT_TO_LEFT
  }
}

/**
 * Enables/disables some UI elements depending on the current selection.
 */
function registerSelectionListener(graphComponent: GraphComponent): void {
  const selectedNodes = graphComponent.selection.nodes
  selectedNodes.addEventListener('item-added', () => {
    document.querySelector<HTMLButtonElement>('#create-subcomponent')!.removeAttribute('disabled')
    document.querySelector<HTMLButtonElement>('#remove-subcomponent')!.removeAttribute('disabled')
  })

  selectedNodes.addEventListener('item-removed', () => {
    if (graphComponent.selection.nodes.size === 0) {
      document
        .querySelector<HTMLButtonElement>('#create-subcomponent')!
        .setAttribute('disabled', 'disabled')
      document
        .querySelector<HTMLButtonElement>('#remove-subcomponent')!
        .setAttribute('disabled', 'disabled')
    } else {
      document.querySelector<HTMLButtonElement>('#create-subcomponent')!.removeAttribute('disabled')
      document.querySelector<HTMLButtonElement>('#remove-subcomponent')!.removeAttribute('disabled')
    }
  })
}

/**
 * Binds actions to the controls in the demo's toolbar.
 */
function initializeUI(graphComponent: GraphComponent): void {
  const selectOrientation = document.querySelector<HTMLSelectElement>('#orientation-select')!
  document.querySelector<HTMLSelectElement>('#layout-select')!.addEventListener('change', (evt) => {
    const value = (evt.target as HTMLSelectElement).value
    selectOrientation.disabled = value !== 'tree' && value !== 'hierarchical'
  })

  const createButton = document.querySelector<HTMLButtonElement>('#create-subcomponent')!
  const removeButton = document.querySelector<HTMLButtonElement>('#remove-subcomponent')!
  const layoutButton = document.querySelector<HTMLButtonElement>('#layout-button')!

  function toggleButtonState() {
    createButton.disabled = !createButton.disabled
    removeButton.disabled = !removeButton.disabled
    layoutButton.disabled = !layoutButton.disabled
  }

  createButton.addEventListener('click', async (e) => {
    const selectedNodes = graphComponent.selection.nodes
    if (selectedNodes.size === 0) {
      return
    }

    // configure the layout algorithm that is assigned to the new subcomponent
    const layout = getLayoutAlgorithm()
    layout.layoutOrientation = getLayoutOrientation()

    // create the subcomponent from all selected nodes with the chosen layout algorithm.
    createSubcomponent(graphComponent.graph, selectedNodes, layout)
    toggleButtonState()
    await runLayout(graphComponent).then(() => {
      toggleButtonState()
    })
  })

  removeButton.addEventListener('click', async () => {
    const selectedNodes = graphComponent.selection.nodes
    if (selectedNodes.size === 0) {
      return
    }
    removeSubcomponent(graphComponent.graph, selectedNodes)
    toggleButtonState()
    await runLayout(graphComponent).then(() => toggleButtonState())
  })

  layoutButton.addEventListener('click', async () => {
    toggleButtonState()
    await runLayout(graphComponent).then(() => toggleButtonState())
  })
}

run().then(finishLoading)
