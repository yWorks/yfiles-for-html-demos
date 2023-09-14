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
  Arrow,
  Color,
  Fill,
  GenericLabeling,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GroupNodeLabelModel,
  HashMap,
  HierarchicLayout,
  IAnimation,
  ICanvasObject,
  ICanvasObjectDescriptor,
  ICommand,
  IGraph,
  ILayoutAlgorithm,
  INode,
  Insets,
  LayoutExecutor,
  License,
  List,
  MouseButtons,
  OrganicLayout,
  PartitionCellId,
  PartitionGrid,
  PartitionGridData,
  Point,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  Size,
  SolidColorFill
} from 'yfiles'

import PartitionGridVisualCreator, { generateGradientColors } from './PartitionGridVisualCreator.js'
import GraphData from './resources/GraphData.js'
import { applyDemoTheme, createDemoGroupStyle } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { bindYFilesCommand, finishLoading } from 'demo-resources/demo-page'

/**
 * Holds the GraphComponent.
 * @type {GraphComponent}
 */
let graphComponent

/**
 * Holds the colors for the nodes based on the column to which they belong.
 * @type {Array.<Color>}
 */
let nodeFills

/**
 * The visual creator for the partition grid.
 * @type {PartitionGridVisualCreator}
 */
let partitionGridVisualCreator

/**
 * The visual object for the partition grid that will be added to the graphComponent.
 * @type {ICanvasObject}
 */
let partitionGridVisualObject

/**
 * The Partition Grid
 * @type {PartitionGrid}
 */
let partitionGrid

/**
 * Holds the number of columns.
 * @type {number}
 */
let columnCount

/**
 * Holds the number of rows.
 * @type {number}
 */
let rowCount

/**
 * Holds the last applied layout algorithm.
 * @type {HierarchicLayout}
 */
let lastAppliedLayoutAlgorithm = new HierarchicLayout()

/**
 * Maps each row index with the number of nodes that belong to the particular row.
 */
const rows2nodes = new HashMap()

/**
 * Maps each column index with the number of nodes that belong to the particular column.
 */
const columns2nodes = new HashMap()

/**
 * Holds whether a layout is currently running.
 * @type {boolean}
 */
let layoutRunning = false

/**
 * Holds the selected cell id.
 * @type {CellId}
 */
let selectedCellId

/**
 * Runs the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  initializeGraph(graphComponent.graph)

  createSampleGraph(graphComponent.graph)

  initializeColumnAndRowCount(graphComponent.graph)

  nodeFills = generateNodeColors()

  initializeStyleAndTag(graphComponent.graph)

  initializePartitionGridVisual()

  configureUserInteraction()

  initializeUI()

  await runLayout()
}

/**
 * Initializes some default styles to the graph elements and adds the necessary event listeners.
 * @param {!IGraph} graph
 */
function initializeGraph(graph) {
  // set the default style for nodes, this style refers to the nodes without grid restrictions
  graph.nodeDefaults.size = new Size(30, 30)
  graph.nodeDefaults.style = new ShapeNodeStyle({
    fill: 'lightgray',
    stroke: null
  })
  graph.nodeDefaults.shareStyleInstance = false

  // set the default styles for group nodes
  graph.groupNodeDefaults.style = createDemoGroupStyle({ colorSetName: 'demo-palette-22' })
  graph.groupNodeDefaults.labels.layoutParameter =
    new GroupNodeLabelModel().createTabBackgroundParameter()

  // set the default style for edges
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: 'rgb(51, 102, 153)',
    targetArrow: new Arrow({
      type: 'short',
      stroke: 'rgb(51, 102, 153)',
      fill: 'rgb(51, 102, 153)'
    })
  })

  // add a node tag changed listener that will update the node style, as soon as a node changes a row/column
  graph.addNodeTagChangedListener((_, args) => {
    const node = args.item
    updateNodeFill(node)
    updateMapping(node, args.oldValue)
  })
}

/**
 * Creates a sample graph from structured data.
 * @param {!IGraph} graph
 */
function createSampleGraph(graph) {
  const graphBuilder = new GraphBuilder(graph)
  graphBuilder.createNodesSource({
    data: GraphData.nodes,
    id: 'id',
    parentId: 'group',
    labels: ['label']
  })
  const groupNodeCreator = graphBuilder.createGroupNodesSource(GraphData.groups, 'id').nodeCreator
  groupNodeCreator.createLabelBinding(() => 'Group')
  graphBuilder.createEdgesSource(GraphData.edges, 'source', 'target')

  graphBuilder.buildGraph()
}

/**
 * Determines the number of columns and rows needed for the given graph.
 * @param {!IGraph} graph
 */
function initializeColumnAndRowCount(graph) {
  // find the desired number of rows/columns
  let maxColumnId = 0
  let maxRowId = 0
  for (const node of graph.nodes) {
    if (!graph.isGroupNode(node)) {
      maxColumnId = Math.max(node.tag.column, maxColumnId)
      maxRowId = Math.max(node.tag.row, maxRowId)
    }
  }
  columnCount = maxColumnId + 1
  rowCount = maxRowId + 1
}

/**
 * Updates node colors based on the column/row to which the nodes belong and
 * replaces node tags with appropriate CellId instances.
 * @param {!IGraph} graph
 */
function initializeStyleAndTag(graph) {
  for (const node of graph.nodes) {
    if (graph.isGroupNode(node)) {
      continue
    }

    node.tag = {
      columnIndex: node.tag.column,
      rowIndex: node.tag.row
    }

    // check if the given node is assigned to a partition grid cell ...
    if (hasActiveRestrictions(node)) {
      // ... and update the node color appropriately
      updateNodeFill(node)
    }
  }
}

/**
 * Initializes the visual creator for the partition grid and adds it to the background of the graph
 * component.
 */
function initializePartitionGridVisual() {
  // if there exists a partition grid object, remove it
  removePartitionGridVisual()
  // add the visual object to the canvas
  partitionGridVisualCreator = new PartitionGridVisualCreator(rowCount, columnCount)
  partitionGridVisualObject = graphComponent.backgroundGroup.addChild(
    partitionGridVisualCreator,
    ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
  )
}

/**
 * Removes the current partition grid visualization.
 */
function removePartitionGridVisual() {
  if (partitionGridVisualCreator) {
    partitionGridVisualCreator = null
    partitionGridVisualObject.remove()
  }
}

/**
 * Configures user interaction for this demo.
 */
function configureUserInteraction() {
  const inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })

  const graph = graphComponent.graph
  // add a drag listener that will determine the column/row indices of the dragged elements based on their last
  // positions
  inputMode.moveInputMode.addDragFinishedListener(() => {
    for (const node of graphComponent.selection.selectedNodes) {
      if (!graph.isGroupNode(node)) {
        updateNodeRestrictions(node)
      } else {
        // for the group nodes, we only have to update the indices of their content
        const stack = [node]
        while (stack.length > 0) {
          const startNode = stack.pop()
          for (const child of graph.getChildren(startNode)) {
            updateNodeRestrictions(child)
            stack.push(child)
          }
        }
      }
    }
    runLayout()
  })

  // update the node style for the newly created node and run a layout
  inputMode.addNodeCreatedListener((_, args) => {
    const node = args.item
    if (!graph.isGroupNode(node)) {
      // if a node is created, we have to determine the column/row indices based on the position where the node is
      // created
      const cellId = determineCellIndex(node.layout.center)
      node.tag = {
        rowIndex: cellId.rowIndex,
        columnIndex: cellId.columnIndex
      }
    } else {
      graph.addLabel(node, 'Group')
    }
    // finally, run a layout using the last applied layout algorithm
    runLayout()
  })

  // whenever an edge is created, run a layout using the last applied layout algorithm
  inputMode.createEdgeInputMode.addEdgeCreatedListener(() => {
    runLayout()
  })

  // whenever a graph element is deleted, run a layout using the last applied layout algorithm
  inputMode.addDeletedSelectionListener(() => {
    runLayout()
  })

  // before a node is removed, remove its tag so that the row2nodes and column2nodes maps are updated
  inputMode.addDeletingSelectionListener((_, evt) => {
    for (const item of evt.selection) {
      if (item instanceof INode) {
        item.tag = {
          rowIndex: -1,
          columnIndex: -1
        }
      }
    }
  })

  // whenever a right-click on a cell occurs (on canvas), determine the row/column that is selected and highlight it
  inputMode.addCanvasClickedListener((_, evt) => {
    toggleDeleteButtonsVisibility(true, Point.ORIGIN)
    if (evt.mouseButtons === MouseButtons.RIGHT && partitionGridVisualCreator) {
      toggleDeleteButtonsVisibility(false, evt.location)
    }
  })

  // disable visibility buttons if are already enabled
  inputMode.addItemClickedListener(() => {
    if (!document.querySelector(`#delete-row`).disabled) {
      toggleDeleteButtonsVisibility(true, Point.ORIGIN)
    }
  })
  graphComponent.inputMode = inputMode

  // run the layout whenever a cut or paste action is performed, so that the layout is updated if new nodes are
  // added to the graph
  graphComponent.clipboard.addElementsPastedListener(() => {
    runLayout()
  })
  graphComponent.clipboard.addElementsCutListener(() => {
    runLayout()
  })
}

/**
 * Updates the partition cell indices for the given node only if it has active restrictions.
 * @param {!INode} node The node to be examined
 */
function updateNodeRestrictions(node) {
  if (!hasActiveRestrictions(node)) {
    return
  }
  // some offsets to be used when the rect lies on the border of two columns/rows
  const cellId = determineCellIndex(node.layout.center)
  // remove the node from the columns/rows' mapping before the last movement
  node.tag = {
    rowIndex: cellId.rowIndex,
    columnIndex: cellId.columnIndex
  }
}

/**
 * Updates the style of the given node.
 * @param {!INode} node The given node
 */
function updateNodeFill(node) {
  const style = node.style
  if (style instanceof ShapeNodeStyle) {
    let fill = Fill.LIGHT_SLATE_GRAY
    if (hasActiveRestrictions(node) && nodeFills) {
      // determine the node's fill based on the column and change the opacity depending on the row to which the node
      // belongs
      const nodeFill = nodeFills[node.tag.columnIndex]
      if (nodeFill) {
        fill = new SolidColorFill(
          nodeFill.r,
          nodeFill.g,
          nodeFill.b,
          node.tag.rowIndex % 2 === 0 ? 255 : 0.65 * 255
        )
      }
    }
    style.fill = fill
  }
}

/**
 * Arranges the graph with the given layout algorithm. If no argument is given, the last applied
 * layout algorithm will be used.
 * @param algorithm The given layout algorithm
 * @param {!ILayoutAlgorithm} [algorithm]
 * @returns {!Promise}
 */
async function runLayout(algorithm) {
  const layoutAlgorithm = algorithm || lastAppliedLayoutAlgorithm
  if (layoutAlgorithm instanceof OrganicLayout && !canExecuteOrganicLayout()) {
    alert('Group nodes cannot span more multiple grid cells.')
    return
  }
  if (layoutRunning) {
    return
  }
  layoutRunning = true
  // disable the UI
  setUIDisabled(true)

  // create the partition grid
  partitionGrid = createPartitionGrid()

  // set the partition grid to the partitionGridVisualCreator, so it can use the new layout of the rows/columns
  // for its animation
  if (partitionGridVisualCreator) {
    partitionGridVisualCreator.grid = partitionGrid
  }
  // create the partition grid data
  const partitionGridData = createPartitionGridData()

  // configure the layout algorithm
  configureAlgorithm(layoutAlgorithm)
  try {
    // configure the layout executor and start the layout
    const executor = new CustomLayoutExecutor(graphComponent, layoutAlgorithm)
    executor.duration = '1s'
    executor.layoutData = partitionGridData
    executor.animateViewport = true
    await executor.start()
  } finally {
    setUIDisabled(false)
    // adjust the bounds of the graph component so that empty rows/columns are also taken under consideration
    adjustGraphComponentBounds()
    layoutRunning = false
    lastAppliedLayoutAlgorithm = layoutAlgorithm
  }
}

/**
 * Configures the given layout algorithm.
 * @param {!ILayoutAlgorithm} layoutAlgorithm The given layout algorithm
 */
function configureAlgorithm(layoutAlgorithm) {
  if (layoutAlgorithm instanceof HierarchicLayout) {
    layoutAlgorithm.orthogonalRouting = true
    layoutAlgorithm.nodeToNodeDistance = 25
    layoutAlgorithm.integratedEdgeLabeling = true
  } else if (layoutAlgorithm instanceof OrganicLayout) {
    layoutAlgorithm.minimumNodeDistance = 30
    layoutAlgorithm.preferredEdgeLength = 60
    layoutAlgorithm.deterministic = true
    layoutAlgorithm.labelingEnabled = true
    const genericLabeling = new GenericLabeling()
    genericLabeling.placeEdgeLabels = true
    genericLabeling.placeNodeLabels = false
    layoutAlgorithm.labeling = genericLabeling
  }
}

/**
 * Updates the mapping between the columns/rows and the number of nodes that each column/row
 * contains. It has to be called whenever a node changes a column/row.
 * @param {!INode} node The given node
 * @param {!CellId} oldTag The given node's old tag
 */
function updateMapping(node, oldTag) {
  // remove from old row if there was in one
  if (oldTag != null && oldTag.rowIndex != null && oldTag.rowIndex !== -1) {
    const oldRowNodes = rows2nodes.get(oldTag.rowIndex)
    if (oldRowNodes) {
      oldRowNodes.splice(oldRowNodes.indexOf(node), 1)
    }
  }
  // add to the new row
  const rowIndex = node.tag.rowIndex
  if (rowIndex !== -1) {
    let rowNodes = rows2nodes.get(rowIndex)
    if (!rowNodes) {
      rowNodes = []
      rows2nodes.set(rowIndex, rowNodes)
    }
    if (rowNodes.indexOf(node) < 0) {
      rowNodes.push(node)
    }
  }

  if (oldTag != null && oldTag.columnIndex != null && oldTag.columnIndex !== -1) {
    const oldColumnNodes = columns2nodes.get(oldTag.columnIndex)
    if (oldColumnNodes) {
      oldColumnNodes.splice(oldColumnNodes.indexOf(node), 1)
    }
  }
  // add to the new row
  const columnIndex = node.tag.columnIndex
  if (columnIndex !== -1) {
    let columnNodes = columns2nodes.get(columnIndex)
    if (!columnNodes) {
      columnNodes = []
      columns2nodes.set(columnIndex, columnNodes)
    }
    if (columnNodes.indexOf(node) < 0) {
      columnNodes.push(node)
    }
  }
}

/**
 * Returns an array containing the indices of the rows/columns that contain nodes (non-empty).
 * @param {number} stripeCount the number of rows/columns in the current partition grid
 * @param {boolean} isRow `true` if we examine the rows, `false` otherwise
 * @returns {!Array.<number>} An array containing the indices of the non-empty rows/columns
 */
function getNonEmptyIndices(stripeCount, isRow) {
  const nonEmptyIndices = []
  const map = isRow ? rows2nodes : columns2nodes
  for (let i = 0; i < stripeCount; i++) {
    const nodes = map.get(i)
    if (nodes && nodes.length > 0) {
      nonEmptyIndices.push(i)
    }
  }
  return nonEmptyIndices
}

/**
 * Determines the cell indices to which the given point belongs.
 * @param {!Point} point The given point
 * @returns {!CellId} The row/column indices
 */
function determineCellIndex(point) {
  let rowIndex = -1
  let columnIndex = -1

  if (existsPartitionGrid()) {
    const firstRow = partitionGrid.rows.first()
    const lastRow = partitionGrid.rows.last()
    const firstColumn = partitionGrid.columns.first()
    const lastColumn = partitionGrid.columns.last()

    // find the row to which the rect belongs
    partitionGrid.rows.forEach((rowDescriptor, i) => {
      const minRowY = rowDescriptor.computedPosition
      const maxRowY = minRowY + rowDescriptor.computedHeight
      const minColumnX = firstColumn.computedPosition
      const maxColumnX = lastColumn.computedPosition + lastColumn.computedWidth
      if (
        point.y >= minRowY &&
        point.y <= maxRowY &&
        point.x >= minColumnX &&
        point.x < maxColumnX
      ) {
        rowIndex = i
        return
      }
    })

    // find the column to which the rect belongs
    partitionGrid.columns.forEach((columnDescriptor, i) => {
      const minColumnX = columnDescriptor.computedPosition
      const maxColumnX = minColumnX + columnDescriptor.computedWidth
      const minRowY = firstRow.computedPosition
      const maxRowY = lastRow.computedPosition + lastRow.computedHeight
      if (
        point.x >= minColumnX &&
        point.x <= maxColumnX &&
        point.y >= minRowY &&
        point.y < maxRowY
      ) {
        columnIndex = i
        return
      }
    })
  }
  return {
    rowIndex,
    columnIndex
  }
}

/**
 * Adjusts the bounds of the graph component so that possible empty rows/columns on the top/bottom
 * or left/right are also included in the graphComponent's bounds. This is necessary since method
 * {@link GraphComponent.fitGraphBounds} considers only the content rectangle of the graph
 * component which is defined from the positions of graph elements (nodes, edges, bends, etc.) but,
 * not from visual objects, like the partition grid visual. This means that possible empty rows on
 * the top/bottom or columns on the left/right have to be manually included in the graphComponent's
 * bounds using special insets.
 */
function adjustGraphComponentBounds() {
  if (existsPartitionGrid()) {
    const nonEmptyRows = getNonEmptyIndices(partitionGrid.rows.size, true)
    // empty rows on the top
    const emptyTop = nonEmptyRows[0]
    // empty rows on the bottom
    const emptyBottom = partitionGrid.rows.size - nonEmptyRows[nonEmptyRows.length - 1] - 1
    const nonEmptyColumns = getNonEmptyIndices(partitionGrid.columns.size, false)
    // empty columns on the left
    const emptyLeft = nonEmptyColumns[0]
    // empty columns on the right
    const emptyRight = partitionGrid.columns.size - nonEmptyColumns[nonEmptyColumns.length - 1] - 1

    const firstRow = partitionGrid.rows.first()
    const lastRow = partitionGrid.rows.last()
    const firstColumn = partitionGrid.columns.first()
    const lastColumn = partitionGrid.columns.last()

    if (emptyLeft && emptyTop && emptyRight && emptyBottom) {
      const insets = new Insets(
        emptyLeft * firstColumn.computedWidth,
        emptyTop * firstRow.computedHeight,
        emptyRight * lastColumn.computedWidth,
        emptyBottom * lastRow.computedHeight
      )
      graphComponent.fitGraphBounds(insets)
    }
  }
}

/**
 * Returns a partition cell for the given node if it has valid row/column indices or
 * `null` otherwise.
 * @param {!INode} node The given node to create the cell id for
 * @returns {?PartitionCellId} A partition cell for the given node if it has valid row/column indices
 * or `null` otherwise
 */
function createNodeCellId(node) {
  if (hasActiveRestrictions(node)) {
    return partitionGrid.createCellId(node.tag.rowIndex, node.tag.columnIndex)
  }
  return null
}

/**
 * Returns a partition cell for the given group node if any of its descendants has a valid
 * partition cell id or
 * `null` otherwise.
 * @param {!INode} node The group node to create the cell id for
 * @returns {?PartitionCellId} A partition cell id for the given group node if any of its descendants
 * has a valid partition cell id or `null` otherwise
 */
function getGroupNodeCellId(node) {
  const graph = graphComponent.graph

  // collect the RowDescriptor and ColumnDescriptor of the descendants of the node
  const rowSet = new List()
  const columnSet = new List()

  for (const child of graph.getChildren(node)) {
    // get the cell id of the child
    const childCellId = !graph.isGroupNode(child)
      ? createNodeCellId(child)
      : getGroupNodeCellId(child)
    // if there is a cell id, add all row and column descriptors to our row/columnSets
    if (childCellId) {
      for (const cellEntry of childCellId.cells) {
        rowSet.add(cellEntry.row)
        columnSet.add(cellEntry.column)
      }
    }
  }

  if (rowSet.size !== 0 && columnSet.size !== 0) {
    // at least one row and one column is specified by the children and should be spanned by this group node
    return partitionGrid.createCellSpanId(rowSet, columnSet)
  }
  // otherwise the group node doesn't span any partition cells
  return null
}

/**
 * Returns whether a given node has valid row/column indices.
 * @param {!INode} node The given node
 * @returns {boolean} `true` if the given node has valid row/column indices,
 *   `false` otherwise
 */
function hasActiveRestrictions(node) {
  return node.tag && node.tag.rowIndex >= 0 && node.tag.columnIndex >= 0
}

/**
 * Returns whether a partition grid currently exists.
 * @returns {!(boolean|PartitionGrid)}
 */
function existsPartitionGrid() {
  return partitionGrid && partitionGrid.rows.size > 0 && partitionGrid.columns.size > 0
}

/**
 * Returns the partition grid for each layout run.
 * @returns {!PartitionGrid} The newly created partition grid
 */
function createPartitionGrid() {
  const grid = new PartitionGrid(rowCount, columnCount)

  const minimumColumnWidth = getFloatValue('columnWidth')
  const leftInset = getFloatValue('leftInset')
  const rightInset = getFloatValue('rightInset')
  const fixedColumnOrder = document.querySelector(`#fix-column-order`).checked

  for (const columnDescriptor of grid.columns) {
    columnDescriptor.minimumWidth = minimumColumnWidth || 0
    columnDescriptor.leftInset = leftInset || 0
    columnDescriptor.rightInset = rightInset || 0
    columnDescriptor.indexFixed = fixedColumnOrder
  }

  const minimumRowHeight = getFloatValue('rowHeight')
  const topInset = getFloatValue('topInset')
  const bottomInset = getFloatValue('bottomInset')

  for (const rowDescriptor of grid.rows) {
    rowDescriptor.minimumHeight = minimumRowHeight || 0
    rowDescriptor.topInset = topInset || 0
    rowDescriptor.bottomInset = bottomInset || 0
  }
  return grid
}

/**
 * Returns the numeric value of the HTMLInputElement with the specified ID.
 * @param {!string} id
 * @returns {number}
 */
function getFloatValue(id) {
  return parseFloat(document.querySelector(`#${id}`).value)
}

/**
 * Returns the partition grid data for each layout run or null if no partition grid exists
 * @returns {?PartitionGridData} The newly created partition grid data
 */
function createPartitionGridData() {
  if (rowCount > 0 && columnCount > 0) {
    const graph = graphComponent.graph
    return new PartitionGridData({
      grid: partitionGrid,
      cellIds: node => {
        if (!graph.isGroupNode(node)) {
          return createNodeCellId(node)
        }
        // we have a group node
        const stretchGroups = document.querySelector(`#stretch-group-nodes`).checked
        if (!stretchGroups || graph.getChildren(node).size === 0) {
          // the group nodes shall not be stretched or the group node has no children, so we return null
          // this means the group node will be adjusted to contain its children but has no specific assignment to cells
          return null
        }
        // the group nodes has children whose partition cells shall be spanned so a spanning PartitionCellId is
        // created that contains all rows/column of its child nodes.
        return getGroupNodeCellId(node)
      }
    })
  }
  return null
}

/**
 * Wires up the UI.
 */
function initializeUI() {
  // create the new commands and bind them to the keyboard input mode.
  const kim = graphComponent.inputMode.keyboardInputMode

  const runHierarchicLayout = ICommand.createCommand()
  kim.addCommandBinding(
    runHierarchicLayout,
    (_, parameter) => {
      runLayout(parameter)
      return true
    },
    canExecuteAnyLayout
  )
  bindYFilesCommand(
    "button[data-command='HierarchicLayout']",
    runHierarchicLayout,
    graphComponent,
    new HierarchicLayout(),
    'Calculates a hierarchic layout'
  )

  const runOrganicLayout = ICommand.createCommand()
  kim.addCommandBinding(
    runOrganicLayout,
    (_, parameter) => {
      runLayout(parameter)
      return true
    },
    canExecuteOrganicLayout
  )
  bindYFilesCommand(
    "button[data-command='OrganicLayout']",
    runOrganicLayout,
    graphComponent,
    new OrganicLayout(),
    'Calculates an organic layout'
  )

  const addRestrictions = ICommand.createCommand()
  kim.addCommandBinding(
    addRestrictions,
    () => {
      executeAddRestrictions()
      return true
    },
    canExecuteAddRestrictions
  )
  bindYFilesCommand(
    "button[data-command='GenerateGridRestrictions']",
    addRestrictions,
    graphComponent,
    null,
    'Add Grid Restrictions to Selection'
  )

  const removeRestrictions = ICommand.createCommand()
  kim.addCommandBinding(
    removeRestrictions,
    () => {
      executeRemoveRestrictions()
      return true
    },
    canExecuteRemoveRestrictions
  )
  bindYFilesCommand(
    "button[data-command='RemoveRestrictions']",
    removeRestrictions,
    graphComponent,
    null,
    'Remove Restrictions From Selection'
  )

  document.querySelector('#add-row').addEventListener('click', () => {
    rowCount++
    // if the grid does not exist until now, create at least one column
    if (columnCount === 0) {
      columnCount = 1
    }
    nodeFills = generateNodeColors()
    updateGrid()
    // run the last applied layout algorithm
    runLayout()
  })
  document.querySelector('#add-column').addEventListener('click', () => {
    columnCount++
    // if the grid does not exist until now, create at least one row
    if (rowCount === 0) {
      rowCount = 1
    }
    nodeFills = generateNodeColors()
    updateGrid()
    // run the last applied layout algorithm
    runLayout()
  })
  document.querySelector('#delete-row').addEventListener('click', () => {
    if (selectedCellId && selectedCellId.rowIndex !== -1) {
      removeRow(selectedCellId.rowIndex)
      updateGridAfterRemove()
    }
  })

  document.querySelector('#delete-column').addEventListener('click', () => {
    if (selectedCellId && selectedCellId.columnIndex !== -1) {
      removeColumn(selectedCellId.columnIndex)
      updateGridAfterRemove()
    }
  })

  document.querySelector('#delete-empty-rows-columns').addEventListener('click', () => {
    if (existsPartitionGrid()) {
      for (let i = 0; i < rowCount; i++) {
        const nodes = rows2nodes.get(i)
        if (!nodes || nodes.length === 0) {
          removeRow(i)
          i = 0
        }
      }
      for (let i = 0; i < columnCount; i++) {
        const nodes = columns2nodes.get(i)
        if (!nodes || nodes.length === 0) {
          removeColumn(i)
          i = 0
        }
      }
      updateGridAfterRemove()
    }
  })

  // for each input, add a change listener to validate that the input is within the desired limits [0, 200]
  const inputFields = document.getElementsByClassName('option-input')
  for (const inputField of inputFields) {
    inputField.addEventListener('change', event => isValidInput(event, 200), false)
  }
}

/**
 * Removes the selected row from the grid.
 * @param {number} selectedIndex The selected row's index
 */
function removeRow(selectedIndex) {
  for (let i = selectedIndex; i < partitionGrid.rows.size; i++) {
    const nodes = rows2nodes.get(i)
    if (nodes && nodes.length > 0) {
      for (const node of nodes.slice(0)) {
        const columnIndex = i === selectedIndex ? -1 : node.tag.columnIndex
        const rowIndex = i === selectedIndex ? -1 : node.tag.rowIndex - 1
        node.tag = {
          columnIndex,
          rowIndex
        }
      }
    }
  }
  rowCount--
  // if this is the last row to be removed, reset the column number too
  if (rowCount === 0) {
    columnCount = 0
  }
}

/**
 * Removes the selected column from the grid.
 * @param {number} selectedIndex The selected row's index
 */
function removeColumn(selectedIndex) {
  for (let i = selectedIndex; i < partitionGrid.columns.size; i++) {
    const nodes = columns2nodes.get(i)
    if (nodes && nodes.length > 0) {
      for (const node of nodes.slice(0)) {
        const columnIndex = i === selectedIndex ? -1 : node.tag.columnIndex - 1
        const rowIndex = i === selectedIndex ? -1 : node.tag.rowIndex
        node.tag = {
          columnIndex,
          rowIndex
        }
      }
    }
  }
  columnCount--
  // if this is the last column to be removed, reset the row number too
  if (columnCount === 0) {
    rowCount = 0
  }
}

/**
 * Updates the grid and the layout after a delete operation has been performed.
 */
function updateGridAfterRemove() {
  updateGrid()
  runLayout()
  toggleDeleteButtonsVisibility(true, Point.ORIGIN)
}

/**
 * Adds or removes the partition grid visual.
 */
function updateGrid() {
  if (rowCount > 0 || columnCount > 0) {
    if (rowCount === 0) {
      rowCount = 1
    }
    if (columnCount === 0) {
      columnCount = 1
    }
    // update the partition grid visual
    initializePartitionGridVisual()
  } else {
    removePartitionGridVisual()
  }
}

/**
 * Checks whether the input provided by the user is valid, i.e., not larger than the desired value.
 * @param {!Event} input The user's input
 * @param {number} maxValue The maximum expected value
 * @returns {boolean} `true` if the input provided by the user is valid, i.e., not larger
 * than the desired value, `false` otherwise
 */
function isValidInput(input, maxValue) {
  const target = input.target
  const value = parseInt(target.value)
  if (value > maxValue) {
    alert(`Values cannot be larger than ${maxValue}`)
    target.value = maxValue.toString()
    return false
  }
  if (value < 0) {
    alert('Values must be non-negative')
    target.value = '0'
    return false
  }
  return true
}

/**
 * Checks whether a layout algorithm can be executed. A layout algorithm cannot be executed
 * when the graph is empty or a layout algorithm is already running.
 * @returns {boolean}
 */
function canExecuteAnyLayout() {
  // don't allow layouts for empty graphs
  const graph = graphComponent.graph
  return graph && graph.nodes.size !== 0
}

/**
 * Determines whether the organic layout command can be executed.
 * @returns {boolean}
 */
function canExecuteOrganicLayout() {
  if (!canExecuteAnyLayout()) {
    return false
  }

  // the __Organic__ layout doesn't support to stretch a group node if it contains child nodes assigned
  // to different rows or columns. In this case the __Organic__ layout button will be disabled.
  const graph = graphComponent.graph
  for (let i = 0; i < graph.nodes.size; i++) {
    const node = graph.nodes.get(i)
    if (graph.isGroupNode(node)) {
      const cellId = getFirstChildActiveRestriction(node)
      const stack = [node]
      while (stack.length > 0) {
        const startNode = stack.pop()
        const children = graph.getChildren(startNode)
        for (let j = 0; j < children.size; j++) {
          const descendant = children.get(j)
          if (
            hasActiveRestrictions(descendant) &&
            (cellId.rowIndex !== descendant.tag.rowIndex ||
              cellId.columnIndex !== descendant.tag.columnIndex)
          ) {
            // change the last applied layout algorithm to the hierarchic layout
            lastAppliedLayoutAlgorithm = new HierarchicLayout()
            return false
          }
          stack.push(descendant)
        }
      }
    }
  }
  return true
}

/**
 * Returns the cell id of the first child node that is not a group node.
 * @param {!INode} groupNode The group node
 * @returns {!CellId} The cell id indices
 */
function getFirstChildActiveRestriction(groupNode) {
  const graph = graphComponent.graph
  let rowIndex = -1
  let columnIndex = -1
  const stack = [groupNode]
  while (stack.length > 0) {
    const startNode = stack.pop()
    const children = graph.getChildren(startNode)
    for (let i = 0; i < children.size; i++) {
      const descendant = children.get(i)
      if (!graph.isGroupNode(descendant) && hasActiveRestrictions(descendant)) {
        rowIndex = descendant.tag.rowIndex
        columnIndex = descendant.tag.columnIndex
      }
      stack.push(descendant)
    }
  }
  return {
    rowIndex,
    columnIndex
  }
}

/**
 * Determines whether the remove restrictions command can be executed. This can occur only if there
 * exists at least one selected node (that is not a group node) with active grid restrictions.
 * @returns {boolean}
 */
function canExecuteRemoveRestrictions() {
  const selection = graphComponent.selection.selectedNodes
  const graph = graphComponent.graph
  return (
    selection.size > 0 &&
    selection.filter(node => !graph.isGroupNode(node) && hasActiveRestrictions(node)).size > 0
  )
}

/**
 * Executes the remove restrictions command.
 */
function executeRemoveRestrictions() {
  const graph = graphComponent.graph
  for (const node of graphComponent.selection.selectedNodes) {
    if (!graph.isGroupNode(node)) {
      node.tag = {
        columnIndex: -1,
        rowIndex: -1
      }
    }
  }
  // run the last applied layout algorithm
  runLayout()
}

/**
 * Determines whether the add restrictions command can be executed. This can occur only if there
 * exists at least one selected node (that is not a group node) and has no active grid
 * restrictions.
 * @returns {boolean}
 */
function canExecuteAddRestrictions() {
  const selection = graphComponent.selection.selectedNodes
  const graph = graphComponent.graph
  return (
    selection.size > 0 &&
    selection.filter(node => !graph.isGroupNode(node) && !hasActiveRestrictions(node)).size > 0
  )
}

/**
 * Executes the add restrictions command. Each node with no active restrictions will be assigned to
 * the cell that belongs based on its current position.
 */
function executeAddRestrictions() {
  // if there exists no grid, we cannot add placement restrictions
  if (!existsPartitionGrid()) {
    return
  }

  // add the restrictions for the selected nodes
  const graph = graphComponent.graph
  for (const node of graphComponent.selection.selectedNodes) {
    if (!graph.isGroupNode(node)) {
      // if the node has no restrictions, find the cell to which it belongs.
      const cellId = determineCellIndex(node.layout.center)
      const columnIndex = cellId.columnIndex
      const rowIndex = cellId.rowIndex
      node.tag = {
        columnIndex,
        rowIndex
      }
    }
  }
  // run the last applied layout algorithm
  runLayout()
}

/**
 * Generates an array of gradient colors between from orange to red.
 * @returns {!Array.<Color>}
 */
function generateNodeColors() {
  return generateGradientColors(Color.ORANGE, Color.RED, columnCount)
}

/**
 * Enables/Disables some toolbar elements and the input mode of the graph component.
 * @param {boolean} disabled `true` if the UI should be disabled, `false` otherwise.
 */
function setUIDisabled(disabled) {
  document.querySelector(`#add-row`).disabled = disabled
  document.querySelector(`#add-column`).disabled = disabled
  document.querySelector(`#delete-empty-rows-columns`).disabled = disabled
}

/**
 * Enables/disables the delete column/row buttons and updates the partition grid visual
 * @param {boolean} disabled `true` if the buttons should be disabled, `false` otherwise.
 * @param {!Point} location The location of the last mouse event
 */
function toggleDeleteButtonsVisibility(disabled, location) {
  document.querySelector(`#delete-row`).disabled = disabled
  document.querySelector(`#delete-column`).disabled = disabled

  if (partitionGridVisualCreator) {
    const cellId = disabled ? null : determineCellIndex(location)
    selectedCellId = cellId
    partitionGridVisualCreator.selectedCellId = cellId
    graphComponent.invalidate()
  }
}

/**
 * A class for implementing a layout executor that runs two parallel animations, i.e., animate the
 * graph itself as well as the partition grid visualization.
 */
class CustomLayoutExecutor extends LayoutExecutor {
  /**
   * @returns {*}
   */
  createMorphAnimation() {
    const graphMorphAnimation = super.createMorphAnimation()
    if (partitionGridVisualCreator) {
      // we want to animate the graph itself as well as the partition
      // grid visualization, so we use a parallel animation:
      return IAnimation.createParallelAnimation([graphMorphAnimation, partitionGridVisualCreator])
    }
    return graphMorphAnimation
  }
}

run().then(finishLoading)
