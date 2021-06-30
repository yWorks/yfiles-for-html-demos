/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Class,
  DefaultNodePlacer,
  EdgeRouter,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HierarchicLayout,
  HierarchicLayoutData,
  ICommand,
  IEnumerable,
  IGraph,
  ILayoutAlgorithm,
  IList,
  INode,
  LayoutOrientation,
  License,
  MinimumNodeSizeStage,
  MultiStageLayout,
  OrganicLayout,
  OrthogonalLayout,
  StraightLineEdgeRouter,
  TreeLayout,
  TreeLayoutEdgeRoutingStyle,
  TreeReductionStage
} from 'yfiles'

import SampleData from './resources/SampleData'
import { DemoEdgeStyle, DemoNodeStyle } from '../../resources/demo-styles'
import { bindAction, bindChangeListener, bindCommand, showApp } from '../../resources/demo-app'
import loadJson from '../../resources/load-json'

// We need to load the 'router-polyline' module explicitly to prevent tree-shaking
// tools it from removing this dependency which is needed for subcomponents layout.
Class.ensure(EdgeRouter)

type SubComponent = {
  nodes: INode[]
  layout: ILayoutAlgorithm
}

/**
 * The collection of subcomponents contains all currently assigned subcomponents.
 */
const subcomponents: SubComponent[] = []

/**
 * The collection of colors (named like the according css-classes) that are assigned to the
 * subcomponents.
 */
const colors = [
  'crimson',
  'darkturquoise',
  'cornflowerblue',
  'darkslateblue',
  'gold',
  'mediumslateblue',
  'forestgreen',
  'mediumvioletred',
  'darkcyan',
  'chocolate',
  'limegreen',
  'mediumorchid',
  'royalblue',
  'orangered'
]

function run(licenseData: object): void {
  License.value = licenseData

  const graphComponent = new GraphComponent('graphComponent')

  configureUserInteraction(graphComponent)

  initializeGraph(graphComponent.graph)

  createSampleGraph(graphComponent.graph)

  initializeSubComponents(graphComponent)

  runLayout(graphComponent)

  registerSelectionListener(graphComponent)

  registerCommands(graphComponent)

  showApp(graphComponent)
}

/**
 * Arranges the graph in the given graph component.
 */
function runLayout(graphComponent: GraphComponent): void {
  // initialize a hierarchic layout
  const hierarchicLayout = new HierarchicLayout({
    orthogonalRouting: true
  })

  // assign subcomponents with their own layout algorithm
  const hierarchicLayoutData = new HierarchicLayoutData()
  for (const component of subcomponents) {
    hierarchicLayoutData.subComponents.add(component.layout).items = IList.from(component.nodes)
  }

  graphComponent.morphLayout(
    new MinimumNodeSizeStage(hierarchicLayout),
    '700ms',
    hierarchicLayoutData
  )
}

/**
 * Creates a new subcomponent that gets a specific layout from the given nodes.
 */
function createSubcomponent(nodes: IEnumerable<INode>, layout: ILayoutAlgorithm): void {
  if (nodes.size > 0) {
    // find the next free subcomponent index
    let newSubcomponent: SubComponent
    let newSubcomponentIndex: number = subcomponents.findIndex(
      component =>
        component.nodes.length === 0 || component.nodes.every(node => nodes.includes(node))
    )
    if (newSubcomponentIndex < 0) {
      // add a new subcomponent
      newSubcomponent = {
        nodes: [],
        layout
      }
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
      setStyleClass(node, colors[newSubcomponentIndex % colors.length])
    }
  }
}

/**
 * Removes the given nodes from every subcomponent.
 */
function removeSubcomponent(nodes: IEnumerable<INode>): void {
  for (const node of nodes) {
    if (node.tag !== null) {
      const subcomponentNodes = subcomponents[node.tag].nodes
      subcomponentNodes.splice(subcomponentNodes.indexOf(node), 1)
      node.tag = null
      setStyleClass(node, '')
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
  graph.nodeDefaults.style = new DemoNodeStyle()
  graph.nodeDefaults.shareStyleInstance = false
  graph.edgeDefaults.style = new DemoEdgeStyle()
}

/**
 * Creates a sample graph.
 */
function createSampleGraph(graph: IGraph): void {
  const data = SampleData

  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: data.nodes,
    id: 'id',
    tag: data => (typeof data.tag !== 'undefined' ? data.tag : null)
  })
  builder.createEdgesSource(data.edges, 'source', 'target')

  builder.buildGraph()
}

/**
 * Creates initial sub-components in the demo's sample graph.
 */
function initializeSubComponents(graphComponent: GraphComponent): void {
  const graph = graphComponent.graph

  const hierarchicLayout = new HierarchicLayout()
  hierarchicLayout.layoutOrientation = LayoutOrientation.LEFT_TO_RIGHT
  createSubcomponent(
    graph.nodes.filter(node => node.tag === 0),
    hierarchicLayout
  )
  const treeLayout = newTreeLayout()
  createSubcomponent(
    graph.nodes.filter(node => node.tag === 1),
    treeLayout
  )
  const organicLayout = newOrganicLayout()
  createSubcomponent(
    graph.nodes.filter(node => node.tag === 2),
    organicLayout
  )
}

/**
 * Sets the CSS class that determines the given node's styling.
 */
function setStyleClass(node: INode, cssClassName: string): void {
  ;(node.style as DemoNodeStyle).cssClass = cssClassName
}

/**
 * Returns a new layout algorithm instance for the layout type that is specified in the layout
 * combo box.
 */
function getLayoutAlgorithm(): MultiStageLayout {
  switch ((document.getElementById('layout-select') as HTMLSelectElement).value) {
    default:
    case 'tree':
      return newTreeLayout()
    case 'organic':
      return newOrganicLayout()
    case 'orthogonal':
      return new OrthogonalLayout()
    case 'hierarchic':
      return new HierarchicLayout()
  }
}

/**
 * Returns a new tree layout algorithm instance.
 */
function newTreeLayout(): TreeLayout {
  const treeReductionStage = new TreeReductionStage()
  treeReductionStage.nonTreeEdgeRouter = new StraightLineEdgeRouter()

  const tree = new TreeLayout()
  ;(tree.defaultNodePlacer as DefaultNodePlacer).routingStyle = TreeLayoutEdgeRoutingStyle.POLYLINE
  tree.prependStage(treeReductionStage)
  return tree
}

/**
 * Returns a new organic layout algorithm instance.
 */
function newOrganicLayout(): OrganicLayout {
  const organic = new OrganicLayout()
  organic.deterministic = true
  organic.preferredEdgeLength = 70
  return organic
}

/**
 * Returns the layout orientation that is specified in the combo-box.
 */
function getLayoutOrientation(): LayoutOrientation {
  const orientation: string = (document.getElementById('orientation-select') as HTMLSelectElement)
    .value
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
  const selectedNodes = graphComponent.selection.selectedNodes
  selectedNodes.addItemSelectionChangedListener(() => {
    if (graphComponent.selection.selectedNodes.size === 0) {
      document
        .querySelector("button[data-command='CreateSubcomponent']")!
        .setAttribute('disabled', 'disabled')
      document
        .querySelector("button[data-command='RemoveSubcomponent']")!
        .setAttribute('disabled', 'disabled')
    } else {
      document
        .querySelector("button[data-command='CreateSubcomponent']")!
        .removeAttribute('disabled')
      document
        .querySelector("button[data-command='RemoveSubcomponent']")!
        .removeAttribute('disabled')
    }
  })
}

/**
 * Binds actions to the controls in the demo's toolbar.
 */
function registerCommands(graphComponent: GraphComponent): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)

  const selectOrientation = document.getElementById('orientation-select') as HTMLSelectElement
  bindChangeListener("select[data-command='SelectLayout']", value => {
    selectOrientation.disabled = value !== 'tree' && value !== 'hierarchic'
  })

  bindAction("button[data-command='CreateSubcomponent']", () => {
    const selectedNodes = graphComponent.selection.selectedNodes
    if (selectedNodes.size === 0) {
      return
    }

    // configure the layout algorithm that is assigned to the new subcomponent
    const layout = getLayoutAlgorithm()
    layout.layoutOrientation = getLayoutOrientation()

    // create the subcomponent from all selected nodes with the chosen layout algorithm.
    createSubcomponent(selectedNodes, layout)

    runLayout(graphComponent)
  })
  bindAction("button[data-command='RemoveSubcomponent']", () => {
    const selectedNodes = graphComponent.selection.selectedNodes
    if (selectedNodes.size === 0) {
      return
    }
    removeSubcomponent(selectedNodes)
    runLayout(graphComponent)
  })

  bindAction("button[data-command='Layout']", () => runLayout(graphComponent))
}

// run the demo
loadJson().then(run)
