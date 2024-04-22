/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GraphHighlightIndicatorManager,
  GraphOverviewComponent,
  IArrow,
  License,
  PolylineEdgeStyle,
  Size,
  VoidNodeStyle
} from 'yfiles'
import PrintingSupport from 'demo-utils/PrintingSupport'
import { CollapsibleTree } from './CollapsibleTree.js'
import { fetchLicense } from 'demo-resources/fetch-license'
import { bindYFilesCommand, finishLoading } from 'demo-resources/demo-page'
import { initializeGraphSearch } from './OrgChartGraphSearch.js'
import { buildGraph, getEmployee } from './model/data-loading.js'
import { createOrgChartNodeStyle } from './graph-style/orgchart-node-style.js'
import { initializeInputMode, initializeInteractivity, showAllCommand } from './input.js'
import { applyDemoTheme } from 'demo-resources/demo-styles'

/** @type {GraphComponent} */
let graphComponent = null

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  // initialize the graph component and overview
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  new GraphOverviewComponent('overviewComponent', graphComponent)

  // the orgchart graph supports expanding collapsing subtrees
  const orgChartGraph = new CollapsibleTree(graphComponent)
  graphComponent.graph = orgChartGraph.filteredGraph

  // populate the graph with the sample data and set default styles
  initializeGraph(orgChartGraph)

  // initializes basic interaction with the graph including the properties panel
  initializeInputMode(graphComponent, orgChartGraph)

  // prepares the graph component and the graph to interactively collapse/expand subtrees
  initializeInteractivity(graphComponent, orgChartGraph)

  // add a graph search
  initializeGraphSearch(graphComponent, orgChartGraph)

  // wire up the UI
  initializeUI()

  // apply a layout
  configureOrgChartLayout(orgChartGraph)
  orgChartGraph.applyInitialLayout()
}

// Configures a tree layout that considers assistants and node types.
/**
 * @param {!CollapsibleTree} orgChartGraph
 */
function configureOrgChartLayout(orgChartGraph) {
  orgChartGraph.isAssistantNode = (node) => getEmployee(node)?.assistant ?? false
  orgChartGraph.nodeTypesMapping = (node) => getEmployee(node)?.status ?? null

  // sort subtrees by a fixed order of the business units
  const businessUnitOrder = ['Engineering', 'Production', 'Accounting', 'Sales', 'Marketing']
  orgChartGraph.outEdgeComparers = () => {
    return (edge1, edge2) => {
      const employee1 = getEmployee(edge1.targetNode)
      const employee2 = getEmployee(edge2.targetNode)
      if (
        employee1 &&
        employee1.businessUnit != null &&
        employee2 &&
        employee2.businessUnit != null
      ) {
        const index1 = businessUnitOrder.indexOf(employee1.businessUnit)
        const index2 = businessUnitOrder.indexOf(employee2.businessUnit)
        if (index1 !== -1 && index2 !== -1) {
          return index1 - index2
        }
      }
      return 0
    }
  }
}

/**
 * Creates and populates a new graph.
 * @param {!CollapsibleTree} orgChartGraph
 */
function initializeGraph(orgChartGraph) {
  initializeDefaultStyle(orgChartGraph)
  buildGraph(orgChartGraph.completeGraph)
}

/**
 * Sets style defaults for nodes and edges.
 * @param {!CollapsibleTree} orgChartGraph
 */
function initializeDefaultStyle(orgChartGraph) {
  const nodeSize = new Size(285, 100)

  const graph = orgChartGraph.completeGraph

  graph.nodeDefaults.style = createOrgChartNodeStyle(graphComponent, nodeSize)
  graph.nodeDefaults.size = nodeSize
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px rgb(170, 170, 170)',
    targetArrow: IArrow.NONE
  })

  // Hide the default highlight in favor of the CSS highlighting from the template styles
  graphComponent.highlightIndicatorManager = new GraphHighlightIndicatorManager({
    nodeStyle: VoidNodeStyle.INSTANCE
  })
}

/**
 * Wires up the UI.
 */
function initializeUI() {
  bindYFilesCommand('#show-all-button', showAllCommand, graphComponent, null, 'Show all nodes')
  document.getElementById('print-button').addEventListener('click', print)
}

/**
 * Prints the graph, separated in tiles.
 */
function print() {
  const printingSupport = new PrintingSupport()
  printingSupport.tiledPrinting = true
  printingSupport.scale = 0.29
  printingSupport.margin = 1
  printingSupport.tileWidth = 842
  printingSupport.tileHeight = 595
  void printingSupport.print(graphComponent, undefined)
}

void run().then(finishLoading)
