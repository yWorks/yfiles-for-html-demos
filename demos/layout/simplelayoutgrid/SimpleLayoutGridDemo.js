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
  GraphViewerInputMode,
  HierarchicalLayout,
  HierarchicalLayoutData,
  LayoutExecutor,
  LayoutGrid,
  License
} from '@yfiles/yfiles'
import GraphData from './resources/GraphData'
import { SimpleLayoutGridVisualCreator } from './SimpleLayoutGridVisualCreator'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
/**
 * Holds the GraphComponent
 */
let graphComponent
/**
 * The Layout Grid
 */
let layoutGrid
/**
 * Runs the demo.
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  // Initialize the styles for the graph elements
  initDemoStyles(graphComponent.graph)
  // Initialize the input mode
  graphComponent.inputMode = new GraphViewerInputMode()
  // Load the graph
  loadSampleGraph()
  // Create the layout grid
  createLayoutGrid()
  // Initialize the visual creator for the layout grid
  initializeLayoutGridVisual()
  // Run the layout
  runLayout()
}
/**
 * Creates the layout grid.
 * @returns The created layout grid
 */
function createLayoutGrid() {
  const graph = graphComponent.graph
  // find the desired number of rows/columns
  let columnCount = Number.NEGATIVE_INFINITY
  let rowCount = Number.NEGATIVE_INFINITY
  graph.nodes.forEach((node) => {
    if (!graph.isGroupNode(node)) {
      const columnIndex = node.tag.column
      const rowIndex = node.tag.row
      // the column/row indices are stored to each node's tag
      node.tag = {
        rowIndex,
        columnIndex
      }
      columnCount = Math.max(columnIndex, columnCount)
      rowCount = Math.max(rowIndex, rowCount)
    } else {
      graph.addLabel(node, 'Group')
    }
  })
  columnCount++
  rowCount++
  // creates and configures the LayoutGrid
  if (rowCount > 0 && columnCount > 0) {
    layoutGrid = new LayoutGrid(rowCount, columnCount)
    layoutGrid.columns.forEach((columnDescriptor) => {
      columnDescriptor.minimumWidth = 50
      columnDescriptor.leftPadding = 10
      columnDescriptor.rightPadding = 10
    })
    layoutGrid.rows.forEach((rowDescriptor) => {
      rowDescriptor.minimumHeight = 50
      rowDescriptor.topPadding = 10
      rowDescriptor.bottomPadding = 10
    })
    return layoutGrid
  }
  return null
}
/**
 * Arranges the graph with the hierarchical layout algorithm.
 */
function runLayout() {
  // configures the layout algorithm
  const layoutAlgorithm = new HierarchicalLayout({
    nodeDistance: 25
  })
  // create the grid cell descriptors
  const layoutData = new HierarchicalLayoutData({
    layoutGridData: {
      layoutGridCellDescriptors: (node) =>
        !graphComponent.graph.isGroupNode(node)
          ? layoutGrid.createCellDescriptor(node.tag.rowIndex, node.tag.columnIndex)
          : null
    }
  })
  // Ensure that the LayoutExecutor class is not removed by build optimizers
  // It is needed for the 'applyLayoutAnimated' method in this demo.
  LayoutExecutor.ensure()
  // applies the layout algorithm to the graph
  void graphComponent.applyLayoutAnimated(layoutAlgorithm, '1s', layoutData)
}
/**
 * Initializes the visual creator for the layout grid and adds it to the background of the graph
 * component.
 */
function initializeLayoutGridVisual() {
  // adds the visual object to the canvas
  const layoutGridVisualCreator = new SimpleLayoutGridVisualCreator(layoutGrid)
  graphComponent.renderTree.createElement(
    graphComponent.renderTree.backgroundGroup,
    layoutGridVisualCreator
  )
}
/**
 * Loads the sample graph.
 */
function loadSampleGraph() {
  const graphBuilder = new GraphBuilder(graphComponent.graph)
  graphBuilder.createNodesSource({
    data: GraphData.nodes,
    id: 'id',
    parentId: 'group',
    labels: ['label']
  })
  graphBuilder.createGroupNodesSource(GraphData.groups, 'id')
  graphBuilder.createEdgesSource(GraphData.edges, 'source', 'target')
  graphBuilder.buildGraph()
}
run().then(finishLoading)
