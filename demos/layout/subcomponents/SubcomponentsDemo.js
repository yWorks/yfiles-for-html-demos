/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EdgeRouter,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HierarchicLayout,
  HierarchicLayoutData,
  ICommand,
  ILayoutAlgorithm,
  INode,
  LayoutOrientation,
  License,
  MinimumNodeSizeStage,
  OrganicLayout,
  OrthogonalLayout,
  StraightLineEdgeRouter,
  TreeLayout,
  TreeLayoutEdgeRoutingStyle,
  TreeReductionStage
} from 'yfiles'

import SampleData from './resources/SampleData.js'
import { DemoEdgeStyle, DemoNodeStyle } from '../../resources/demo-styles.js'
import { bindAction, bindChangeListener, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

let graphComponent = null

/**
 * The collection of subcomponents contains all currently assigned subcomponents.
 * @type {Array}
 */
const subcomponents = []

/**
 * The collection of colors (named like the according css-classes) that are assigned to the
 * subcomponents.
 * @type {string[]}
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

function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')
  graphComponent.inputMode = new GraphEditorInputMode({
    marqueeSelectableItems: GraphItemTypes.NODE
  })

  loadGraph()
  registerCommands()
  registerSelectionListener()

  showApp(graphComponent)
}

// We need to load the 'router-polyline' module explicitly to prevent tree-shaking
// tools it from removing this dependency which is needed for subcomponents layout.
Class.ensure(EdgeRouter)

function runLayout() {
  // initialize a hierarchic layout
  const hierarchicLayout = new HierarchicLayout({
    orthogonalRouting: true
  })

  // assign subcomponents with their own layout algorithm
  const hierarchicLayoutData = new HierarchicLayoutData()
  subcomponents.forEach(component => {
    hierarchicLayoutData.subComponents.add(component.layout).items = component.nodes
  })

  graphComponent.morphLayout(
    new MinimumNodeSizeStage(hierarchicLayout),
    '700ms',
    hierarchicLayoutData
  )
}

/**
 * Creates a new subcomponent that gets a specific layout from the given nodes.
 * @param {IEnumerable.<INode>} nodes
 * @param {ILayoutAlgorithm} layout
 * @param {boolean} applyLayout
 */
async function createSubcomponent(nodes, layout, applyLayout = false) {
  if (nodes.size > 0) {
    // find the next free subcomponent index
    let newSubcomponent
    let newSubcomponentIndex = subcomponents.findIndex(
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
    nodes.forEach(node => {
      const oldSubcomponentIndex = node.tag
      const oldSubcomponent = oldSubcomponentIndex ? subcomponents[oldSubcomponentIndex] : null
      if (oldSubcomponent && newSubcomponentIndex !== oldSubcomponentIndex) {
        const oldSubcomponentNodes = oldSubcomponent.nodes
        const nodeIndex = oldSubcomponentNodes.indexOf(node)
        oldSubcomponent.nodes.splice(nodeIndex, 1)
      }
      newSubcomponent.nodes.push(node)
      node.tag = newSubcomponentIndex
      node.style.cssClass = colors[newSubcomponentIndex % colors.length]
    })

    // first let the graph component update the nodes' colors
    await graphComponent.updateVisualAsync()
    if (applyLayout) {
      // then apply the layout
      runLayout()
    }
  }
}

/**
 * Removes the given nodes from every subcomponent.
 * @param {IEnumerable.<INode>} nodes
 */
function removeSubcomponent(nodes) {
  nodes.forEach(node => {
    if (node.tag !== null) {
      const subcomponentNodes = subcomponents[node.tag].nodes
      subcomponentNodes.splice(subcomponentNodes.indexOf(node), 1)
      node.tag = null
      node.style.cssClass = null
    }
  })

  runLayout()
}

/**
 * Loads the sample graph.
 */
function loadGraph() {
  const graph = graphComponent.graph
  graph.nodeDefaults.style = new DemoNodeStyle()
  graph.nodeDefaults.shareStyleInstance = false
  graph.edgeDefaults.style = new DemoEdgeStyle()

  const data = SampleData

  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: data.nodes,
    id: 'id',
    tag: data => (typeof data.tag !== 'undefined' ? parseInt(data.tag) : null)
  })
  builder.createEdgesSource(data.edges, 'source', 'target')

  builder.buildGraph()

  // create initial subcomponents
  const hierarchicLayout = new HierarchicLayout()
  hierarchicLayout.layoutOrientation = LayoutOrientation.LEFT_TO_RIGHT
  createSubcomponent(
    graph.nodes.filter(node => node.tag === 0),
    hierarchicLayout
  )
  const treeLayout = new TreeLayout()
  treeLayout.defaultNodePlacer.routingStyle = TreeLayoutEdgeRoutingStyle.POLYLINE
  const treeReductionStage = new TreeReductionStage()
  treeReductionStage.nonTreeEdgeRouter = new StraightLineEdgeRouter()
  treeLayout.prependStage(treeReductionStage)
  createSubcomponent(
    graph.nodes.filter(node => node.tag === 1),
    treeLayout
  )
  const organicLayout = new OrganicLayout()
  organicLayout.deterministic = true
  organicLayout.preferredEdgeLength = 70
  createSubcomponent(
    graph.nodes.filter(node => node.tag === 2),
    organicLayout
  )

  graphComponent.fitGraphBounds()

  runLayout()
}

/**
 * Binds commands to the buttons in the toolbar.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)

  const selectOrientation = document.getElementById('orientation-select')
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
    createSubcomponent(selectedNodes, layout, true)
  })
  bindAction("button[data-command='RemoveSubcomponent']", () => {
    const selectedNodes = graphComponent.selection.selectedNodes
    if (selectedNodes.size === 0) {
      return
    }
    removeSubcomponent(selectedNodes)
  })

  bindAction("button[data-command='Layout']", runLayout)
}

/**
 * Returns the layout algorithm that is specified in the combo-box.
 * @return {ILayoutAlgorithm}
 */
function getLayoutAlgorithm() {
  const layoutStyle = document.getElementById('layout-select').value

  let layoutAlgorithm
  switch (layoutStyle) {
    default:
    case 'tree':
      layoutAlgorithm = new TreeLayout()
      layoutAlgorithm.defaultNodePlacer.routingStyle = TreeLayoutEdgeRoutingStyle.POLYLINE
      // eslint-disable-next-line no-case-declarations
      const treeReductionStage = new TreeReductionStage()
      treeReductionStage.nonTreeEdgeRouter = new StraightLineEdgeRouter()
      layoutAlgorithm.prependStage(treeReductionStage)
      break
    case 'organic':
      layoutAlgorithm = new OrganicLayout()
      layoutAlgorithm.deterministic = true
      layoutAlgorithm.preferredEdgeLength = 70
      break
    case 'orthogonal':
      layoutAlgorithm = new OrthogonalLayout()
      break
    case 'hierarchic':
      layoutAlgorithm = new HierarchicLayout()
      break
  }
  return layoutAlgorithm
}

/**
 * Returns the layout orientation that is specified in the combo-box.
 * @return {LayoutOrientation}
 */
function getLayoutOrientation() {
  const orientation = document.getElementById('orientation-select').value
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
function registerSelectionListener() {
  const selectedNodes = graphComponent.selection.selectedNodes
  selectedNodes.addItemSelectionChangedListener(() => {
    if (graphComponent.selection.selectedNodes.size === 0) {
      document
        .querySelector("button[data-command='CreateSubcomponent']")
        .setAttribute('disabled', 'disabled')
      document
        .querySelector("button[data-command='RemoveSubcomponent']")
        .setAttribute('disabled', 'disabled')
    } else {
      document
        .querySelector("button[data-command='CreateSubcomponent']")
        .removeAttribute('disabled')
      document
        .querySelector("button[data-command='RemoveSubcomponent']")
        .removeAttribute('disabled')
    }
  })
}

// run the demo
loadJson().then(run)
