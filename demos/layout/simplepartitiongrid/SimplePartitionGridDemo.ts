/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  HierarchicLayout,
  ICanvasObjectDescriptor,
  ICommand,
  INode,
  License,
  PartitionGrid,
  PartitionGridData
} from 'yfiles'
import GraphData from './resources/GraphData'
import { bindCommand, checkLicense, showApp } from '../../resources/demo-app'
import loadJson from '../../resources/load-json'
import SimplePartitionGridVisualCreator from './SimplePartitionGridVisualCreator'
import { initDemoStyles } from '../../resources/demo-styles'

/**
 * Holds the GraphComponent
 */
let graphComponent: GraphComponent

/**
 * The Partition Grid
 */
let partitionGrid: PartitionGrid

/**
 * Runs the demo.
 */
function run(licenseData: object): void {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  // Initialize the styles for the graph elements
  initDemoStyles(graphComponent.graph)

  // Initialize the input mode
  graphComponent.inputMode = new GraphViewerInputMode()

  // Load the graph
  loadSampleGraph()

  // Create the partition grid
  createPartitionGrid()

  // Initialize the visual creator for the partition grid
  initializePartitionGridVisual()

  // Run the layout
  runLayout()

  // Bind the demo buttons to their commands
  registerCommands()

  // Initialize the demo application's CSS and Javascript for the description
  showApp(graphComponent)
}

/**
 * Creates the partition grid.
 * @return The created partition grid
 */
function createPartitionGrid(): PartitionGrid | null {
  const graph = graphComponent.graph

  // find the desired number of rows/columns
  let columnCount = Number.NEGATIVE_INFINITY
  let rowCount = Number.NEGATIVE_INFINITY
  graph.nodes.forEach(node => {
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

  // creates and configures the PartitionGrid
  if (rowCount > 0 && columnCount > 0) {
    partitionGrid = new PartitionGrid(rowCount, columnCount)

    partitionGrid.columns.forEach(columnDescriptor => {
      columnDescriptor.minimumWidth = 50
      columnDescriptor.leftInset = 10
      columnDescriptor.rightInset = 10
    })

    partitionGrid.rows.forEach(rowDescriptor => {
      rowDescriptor.minimumHeight = 50
      rowDescriptor.topInset = 10
      rowDescriptor.bottomInset = 10
    })
    return partitionGrid
  }
  return null
}

/**
 * Arranges the graph with the hierarchic layout algorithm.
 */
function runLayout(): void {
  // configures the layout algorithm
  const layoutAlgorithm = new HierarchicLayout({
    orthogonalRouting: true,
    nodeToNodeDistance: 25,
    integratedEdgeLabeling: true
  })

  // create the partition grid data
  const partitionGridData = new PartitionGridData({
    grid: partitionGrid,
    cellIds: (node: INode) =>
      !graphComponent.graph.isGroupNode(node)
        ? partitionGrid.createCellId(node.tag.rowIndex, node.tag.columnIndex)
        : null
  })

  // applies the layout algorithm to the graph
  graphComponent.morphLayout(layoutAlgorithm, '1s', partitionGridData)
}

/**
 * Initializes the visual creator for the partition grid and adds it to the background of the graph
 * component.
 */
function initializePartitionGridVisual(): void {
  // adds the visual object to the canvas
  const partitionGridVisualCreator = new SimplePartitionGridVisualCreator(partitionGrid)
  graphComponent.backgroundGroup.addChild(
    partitionGridVisualCreator,
    ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
  )
}

/**
 * Loads the sample graph.
 */
function loadSampleGraph(): void {
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

/**
 * Wires up the UI.
 */
function registerCommands(): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}
// run the demo
loadJson().then(checkLicense).then(run)
