/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

require.config({
  paths: {
    yfiles: '../../../lib/umd/yfiles/',
    utils: '../../utils/',
    resources: '../../resources/'
  }
})

require([
  'yfiles/view-editor',
  'resources/demo-app',
  'resources/GraphData.js',
  './PartitionGridVisualCreator.js',
  'yfiles/layout-hierarchic',
  'yfiles/layout-organic',
  'yfiles/view-layout-bridge',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  GraphData,
  PartitionGridVisualCreator
) => {
  /**
   * Holds the GraphComponent.
   * @type {yfiles.view.GraphComponent}
   */
  let graphComponent = null

  /**
   * Holds the colors for the nodes based on the column to which they belong.
   * @type {Array}
   */
  let nodeFills = null

  /**
   * The visual creator for the partition grid.
   * @type {PartitionGridVisualCreator}
   */
  let partitionGridVisualCreator = null

  /**
   * The visual object for the partition grid that will be added to the graphComponent.
   * @type {yfiles.view.ICanvasObject}
   */
  let partitionGridVisualObject = null

  /**
   * The Partition Grid
   * @type {yfiles.layout.PartitionGrid}
   */
  let partitionGrid = null

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
   * @type {yfiles.layout.ILayoutAlgorithm}
   */
  let lastAppliedLayoutAlgorithm = new yfiles.hierarchic.HierarchicLayout()

  /**
   * Maps each row index with the number of nodes that belong to the particular row.
   * @type {yfiles.collections.Map}
   */
  const rows2nodes = new yfiles.collections.Map()

  /**
   * Maps each column index with the number of nodes that belong to the particular column.
   * @type {yfiles.collections.Map}
   */
  const columns2nodes = new yfiles.collections.Map()

  /**
   * Holds whether a layout is currently running.
   * @type {boolean}
   */
  let layoutRunning = false

  /**
   * Holds the selected cell id.
   * @type {Object}
   */
  let selectedCellId = null

  /**
   * Runs the demo.
   */
  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    initializeGraph()

    loadSampleGraph()

    initializePartitionGridVisual()

    createInputMode()

    registerCommands()

    runLayout()

    app.show(graphComponent)
  }

  /**
   * Initializes some default styles to the graph elements and adds the necessary event listeners.
   */
  function initializeGraph() {
    const graph = graphComponent.graph
    // set the default style for nodes, this style refers to the nodes without grid restrictions
    graph.nodeDefaults.size = new yfiles.geometry.Size(30, 30)
    graph.nodeDefaults.style = new yfiles.styles.ShapeNodeStyle({
      fill: 'lightgray',
      stroke: null
    })
    graph.nodeDefaults.shareStyleInstance = false

    // set the default styles for group nodes
    graph.groupNodeDefaults.style = new yfiles.styles.PanelNodeStyle({
      color: 'lavenderblush',
      insets: [25, 5, 5, 5],
      labelInsetsColor: 'peachpuff'
    })
    graph.groupNodeDefaults.labels.layoutParameter = yfiles.graph.InteriorStretchLabelModel.NORTH

    // set the default style for edges
    graph.edgeDefaults.style = new yfiles.styles.PolylineEdgeStyle({
      stroke: 'rgb(51, 102, 153)',
      targetArrow: new yfiles.styles.Arrow({
        type: 'short',
        stroke: 'rgb(51, 102, 153)',
        fill: 'rgb(51, 102, 153)'
      })
    })

    // add a node tag changed listener that will update the node style, as soon as a node changes a row/column
    graph.addNodeTagChangedListener((sender, args) => {
      const node = args.item
      updateNodeFill(node)
      updateMapping(node, args.oldValue)
    })

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
   * Loads the sample graph.
   */
  function loadSampleGraph() {
    let graph = graphComponent.graph
    const graphBuilder = new yfiles.binding.GraphBuilder(graph)
    graphBuilder.nodesSource = GraphData.nodes
    graphBuilder.edgesSource = GraphData.edges
    graphBuilder.groupsSource = GraphData.groups
    graphBuilder.sourceNodeBinding = 'source'
    graphBuilder.targetNodeBinding = 'target'
    graphBuilder.nodeIdBinding = 'id'
    graphBuilder.groupBinding = 'group'
    graphBuilder.parentGroupBinding = 'parentGroup'
    graphBuilder.groupIdBinding = 'id'
    graph = graphBuilder.buildGraph()

    // find the desired number of rows/columns
    columnCount = Number.NEGATIVE_INFINITY
    rowCount = Number.NEGATIVE_INFINITY
    graph.nodes.forEach(node => {
      if (!graph.isGroupNode(node)) {
        const columnIndex = node.tag.column
        const rowIndex = node.tag.row
        // the column/row indices are stored to each node's tag
        // if no information is available then, the indices are -1
        node.tag = {
          rowIndex,
          columnIndex
        }

        if (columnIndex !== -1 && rowIndex !== -1) {
          columnCount = Math.max(columnIndex, columnCount)
          rowCount = Math.max(rowIndex, rowCount)
        }
      } else {
        graph.addLabel(node, 'Group')
      }
    })
    columnCount++
    rowCount++

    // update the node fill colors based on the column/row to which they belong
    nodeFills = generateGradientColor(yfiles.view.Color.ORANGE, yfiles.view.Color.RED)
    graph.nodes.forEach(node => {
      // update the partition grid colors
      if (!graph.isGroupNode(node) && hasActiveRestrictions(node)) {
        updateNodeFill(node)
      }
    })
  }

  /**
   * Initializes the visual creator for the partition grid and adds it to the background of the graph component.
   */
  function initializePartitionGridVisual() {
    // if there exists a partition grid object, remove it
    removePartitionGridVisual()
    // add the visual object to the canvas
    partitionGridVisualCreator = new PartitionGridVisualCreator(rowCount, columnCount)
    partitionGridVisualObject = graphComponent.backgroundGroup.addChild(
      partitionGridVisualCreator,
      yfiles.view.ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
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
   * Creates the input mode.
   */
  function createInputMode() {
    const inputMode = new yfiles.input.GraphEditorInputMode({
      allowGroupingOperations: true
    })

    const graph = graphComponent.graph
    // add a drag listener that will determine the column/row indices of the dragged elements based on their last
    // positions
    inputMode.moveInputMode.addDragFinishedListener(() => {
      graphComponent.selection.selectedNodes.forEach(node => {
        if (!graph.isGroupNode(node)) {
          updateNodeRestrictions(node)
        } else {
          // for the group nodes, we only have to update the indices of their content
          const stack = [node]
          while (stack.length > 0) {
            const startNode = stack.pop()
            graph.getChildren(startNode).forEach(child => {
              updateNodeRestrictions(child)
              stack.push(child)
            })
          }
        }
      })
      runLayout()
    })

    // update the node style for the newly created node and run a layout
    inputMode.addNodeCreatedListener((sender, args) => {
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
    inputMode.addDeletingSelectionListener((sender, args) => {
      const selection = args.selection
      selection.forEach(item => {
        if (yfiles.graph.INode.isInstance(item)) {
          item.tag = {
            rowIndex: -1,
            columnIndex: -1
          }
        }
      })
    })

    // whenever a right-click on a cell occurs (on canvas), determine the row/column that is selected and highlight it
    inputMode.addCanvasClickedListener((sender, args) => {
      toggleDeleteButtonsVisibility(true)
      if (args.mouseButtons === yfiles.view.MouseButtons.RIGHT) {
        if (partitionGridVisualCreator) {
          toggleDeleteButtonsVisibility(false, args.location)
        }
      }
    })

    // disable visibility buttons if are already enabled
    inputMode.addItemClickedListener(() => {
      if (!document.getElementById('DeleteRow').disabled) {
        toggleDeleteButtonsVisibility(true)
      }
    })
    graphComponent.inputMode = inputMode
  }

  /**
   * Updates the partition cell indices for the given node only if it has active restrictions.
   * @param {yfiles.graph.INode} node The node to be examined
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
   * @param {yfiles.graph.INode} node The given node
   */
  function updateNodeFill(node) {
    let fill = yfiles.view.Fill.LIGHT_SLATE_GRAY
    if (hasActiveRestrictions(node) && nodeFills) {
      // determine the node's fill based on the column and change the opacity depending on the row to which the node
      // belongs
      const nodeFill = nodeFills[node.tag.columnIndex]
      fill = new yfiles.view.SolidColorFill(
        nodeFill.r,
        nodeFill.g,
        nodeFill.b,
        node.tag.rowIndex % 2 === 0 ? 255 : 0.65 * 255
      )
    }
    node.style.fill = fill
  }

  /**
   * Arranges the graph with the given layout algorithm. If no argument is given, the last applied layout algorithm
   * will be used.
   * @param {yfiles.layout.ILayoutAlgorithm} algorithm The given layout algorithm
   */
  function runLayout(algorithm) {
    const layoutAlgorithm = algorithm || lastAppliedLayoutAlgorithm
    if (layoutAlgorithm instanceof yfiles.organic.OrganicLayout && !canExecuteOrganicLayout()) {
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

    // set the partition grid to the partitionGridVisualCreator so it can use the new layout of the rows/columns
    // for its animation
    if (partitionGridVisualCreator) {
      partitionGridVisualCreator.grid = partitionGrid
    }
    // create the partition grid data
    const partitionGridData = createPartitionGridData()

    // configure the layout algorithm
    configureAlgorithm(layoutAlgorithm)

    // configure the layout executor and start the layout
    const executor = new CustomLayoutExecutor(graphComponent, layoutAlgorithm)
    executor.duration = '1s'
    executor.layoutData = partitionGridData
    executor.animateViewport = true
    executor
      .start()
      .then(() => {
        setUIDisabled(false)
        // adjust the bounds of the graph component so that empty rows/columns are also taken under consideration
        adjustGraphComponentBounds()
        layoutRunning = false
        lastAppliedLayoutAlgorithm = layoutAlgorithm
      })
      .catch(error => {
        setUIDisabled(false)
        adjustGraphComponentBounds()
        layoutRunning = false
        lastAppliedLayoutAlgorithm = layoutAlgorithm
        if (typeof window.reportError === 'function') {
          window.reportError(error)
        }
      })
  }

  /**
   * Configures the given layout algorithm.
   * @param {yfiles.layout.ILayoutAlgorithm} layoutAlgorithm The given layout algorithm
   */
  function configureAlgorithm(layoutAlgorithm) {
    if (layoutAlgorithm instanceof yfiles.hierarchic.HierarchicLayout) {
      layoutAlgorithm.orthogonalRouting = true
      layoutAlgorithm.nodeToNodeDistance = 25
      layoutAlgorithm.integratedEdgeLabeling = true
    } else if (layoutAlgorithm instanceof yfiles.organic.OrganicLayout) {
      layoutAlgorithm.minimumNodeDistance = 30
      layoutAlgorithm.preferredEdgeLength = 60
      layoutAlgorithm.deterministic = true
      layoutAlgorithm.labelingEnabled = true
      const genericLabeling = new yfiles.labeling.GenericLabeling()
      genericLabeling.placeEdgeLabels = true
      genericLabeling.placeNodeLabels = false
      layoutAlgorithm.labeling = genericLabeling
    }
  }

  /**
   * Updates the mapping between the columns/rows and the number of nodes the each column/row contains.
   * It has to be called whenever a node changes a column/row.
   * @param {yfiles.graph.INode} node The given node
   * @param {Object} oldTag The given node's old tag
   */
  function updateMapping(node, oldTag) {
    // remove from old row if there was in one
    if (oldTag && typeof oldTag.rowIndex !== 'undefined' && oldTag.rowIndex !== -1) {
      const oldRowNodes = rows2nodes.get(oldTag.rowIndex)
      oldRowNodes.splice(oldRowNodes.indexOf(node), 1)
    }
    // add to the new row
    const rowIndex = node.tag.rowIndex
    if (rowIndex !== -1) {
      if (!rows2nodes.get(rowIndex)) {
        rows2nodes.set(rowIndex, [])
      }
      const rowNodes = rows2nodes.get(rowIndex)
      if (rowNodes.indexOf(node) < 0) {
        rowNodes.push(node)
      }
    }

    if (oldTag && typeof oldTag.columnIndex !== 'undefined' && oldTag.columnIndex !== -1) {
      const oldColumnNodes = columns2nodes.get(oldTag.columnIndex)
      oldColumnNodes.splice(oldColumnNodes.indexOf(node), 1)
    }
    // add to the new row
    const columnIndex = node.tag.columnIndex
    if (columnIndex !== -1) {
      if (!columns2nodes.get(columnIndex)) {
        columns2nodes.set(columnIndex, [])
      }
      const columnNodes = columns2nodes.get(columnIndex)
      if (columnNodes.indexOf(node) < 0) {
        columnNodes.push(node)
      }
    }
  }

  /**
   * Returns an array containing the indices of the rows/columns that contain nodes (non-empty).
   * @param {yfiles.algorithms.YList} list The given list of rows/columns
   * @param {boolean} isRow <code>True</code> if we examine the rows, <code>false</code> otherwise
   * @return {Array} An array containing the indices of the non-empty rows/columns
   */
  function getNonEmptyIndices(list, isRow) {
    const nonEmptyIndices = []
    const map = isRow ? rows2nodes : columns2nodes
    for (let i = 0; i < list.size; i++) {
      if (map.get(i) && map.get(i).length > 0) {
        nonEmptyIndices.push(i)
      }
    }
    return nonEmptyIndices
  }

  /**
   * Determines the cell indices to which the given point belongs.
   * @param {yfiles.geometry.Point} point The given point
   * @return {{rowIndex: number, columnIndex: number}} The row/column indices
   */
  function determineCellIndex(point) {
    let rowIndex = -1
    let columnIndex = -1

    if (existsPartitionGrid()) {
      const firstRow = partitionGrid.rows.get(0)
      const lastRow = partitionGrid.rows.get(partitionGrid.rows.size - 1)
      const firstColumn = partitionGrid.columns.get(0)
      const lastColumn = partitionGrid.columns.get(partitionGrid.columns.size - 1)

      // find the row to which the rect belongs
      for (let i = 0; i < partitionGrid.rows.size; i++) {
        const rowDescriptor = partitionGrid.rows.get(i)
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
          break
        }
      }

      // find the column to which the rect belongs
      for (let i = 0; i < partitionGrid.columns.size; i++) {
        const columnDescriptor = partitionGrid.columns.get(i)
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
          break
        }
      }
    } else {
      rowIndex = getRandomInt(3)
      columnIndex = getRandomInt(5)
    }
    return {
      rowIndex,
      columnIndex
    }
  }

  /**
   * Adjusts the bounds of the graph component so that possible empty rows/columns on the top/bottom or left/right
   * are also included in the graphComponent's bounds.
   * This is necessary since method {@link yfiles.view.GraphComponent#fitGraphBounds} considers only the content
   * rectangle of the graph component which is defined from the positions of graph elements (nodes, edges,
   * bends, etc) but, not from visual objects, like the partition grid visual. This means that possible empty
   * rows on the top/bottom or columns on the left/right have to be manually included in the graphComponent's bounds
   * using special insets.
   */
  function adjustGraphComponentBounds() {
    if (existsPartitionGrid()) {
      const nonEmptyRows = getNonEmptyIndices(partitionGrid.rows, true)
      // empty rows on the top
      const emptyTop = nonEmptyRows[0]
      // empty rows on the bottom
      const emptyBottom = partitionGrid.rows.size - nonEmptyRows[nonEmptyRows.length - 1] - 1
      const nonEmptyColumns = getNonEmptyIndices(partitionGrid.columns, false)
      // empty columns on the left
      const emptyLeft = nonEmptyColumns[0]
      // empty columns on the right
      const emptyRight =
        partitionGrid.columns.size - nonEmptyColumns[nonEmptyColumns.length - 1] - 1

      const firstRow = partitionGrid.rows.get(0)
      const lastRow = partitionGrid.rows.get(partitionGrid.rows.size - 1)
      const firstColumn = partitionGrid.columns.get(0)
      const lastColumn = partitionGrid.columns.get(partitionGrid.columns.size - 1)

      if (emptyLeft && emptyTop && emptyRight && emptyBottom) {
        const insets = new yfiles.geometry.Insets(
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
   * Returns a partition cell for the given node if it has valid row/column indices or <code>null</code> otherwise.
   * @param {yfiles.graph.INode} node The given node to create the cell id for
   * @return {yfiles.layout.PartitionCellId} A partition cell for the given node if it has valid row/column indices
   * or <code>null</code> otherwise
   */
  function createNodeCellId(node) {
    if (hasActiveRestrictions(node)) {
      return partitionGrid.createCellId(node.tag.rowIndex, node.tag.columnIndex)
    }
    return null
  }

  /**
   * Returns a partition cell for the given group node if any of its descendants has a valid partition cell id or
   * <code>null</code> otherwise.
   * @param {yfiles.graph.INode} node The group node to create the cell id for
   * @return {yfiles.layout.PartitionCellId} A partition cell id for the given group node if any of its descendants
   * has a valid partition cell id or <code>null</code> otherwise
   */
  function getGroupNodeCellId(node) {
    const graph = graphComponent.graph

    // collect the RowDescriptor and ColumnDescriptor of the descendants of the node
    const rowSet = new yfiles.collections.List()
    const columnSet = new yfiles.collections.List()

    graph.getChildren(node).forEach(child => {
      // get the cell id of the child
      const childCellId = !graph.isGroupNode(child)
        ? createNodeCellId(child)
        : getGroupNodeCellId(child)
      // if there is a cell id, add all row and column descriptors to our row/columnSets
      if (childCellId) {
        childCellId.cells.forEach(cellEntry => {
          rowSet.add(cellEntry.row)
          columnSet.add(cellEntry.column)
        })
      }
    })

    if (rowSet.size !== 0 && columnSet.size !== 0) {
      // at least one row and one column is specified by the children and should be spanned by this group node
      return partitionGrid.createCellSpanId(rowSet, columnSet)
    }
    // otherwise the group node doesn't span any partition cells
    return null
  }

  /**
   * Returns whether or not a given node has valid row/column indices.
   * @param {yfiles.graph.INode} node The given node
   * @return {boolean} <code>True</code> if the given node has valid row/column indices, <code>false</code> otherwise
   */
  function hasActiveRestrictions(node) {
    return node.tag && node.tag.rowIndex >= 0 && node.tag.columnIndex >= 0
  }

  /**
   * Returns whether or not a partition grid currently exists.
   * @return {yfiles.layout.PartitionGrid|boolean}
   */
  function existsPartitionGrid() {
    return partitionGrid && partitionGrid.rows.size > 0 && partitionGrid.columns.size > 0
  }

  /**
   * Returns the partition grid for each layout run.
   * @return {yfiles.layout.PartitionGrid} The newly created partition grid
   */
  function createPartitionGrid() {
    if (rowCount > 0 && columnCount > 0) {
      partitionGrid = new yfiles.layout.PartitionGrid(rowCount, columnCount)

      const minimumColumnWidth = parseFloat(document.getElementById('columnWidth').value)
      const leftInset = parseFloat(document.getElementById('leftInset').value)
      const rightInset = parseFloat(document.getElementById('rightInset').value)
      const fixedColumnOrder = document.getElementById('fixColumnOrder').checked

      partitionGrid.columns.forEach(columnDescriptor => {
        columnDescriptor.minimumWidth = minimumColumnWidth || 0
        columnDescriptor.leftInset = leftInset || 0
        columnDescriptor.rightInset = rightInset || 0
        columnDescriptor.indexFixed = fixedColumnOrder
      })

      const minimumRowHeight = parseFloat(document.getElementById('rowHeight').value)
      const topInset = parseFloat(document.getElementById('topInset').value)
      const bottomInset = parseFloat(document.getElementById('bottomInset').value)

      partitionGrid.rows.forEach(rowDescriptor => {
        rowDescriptor.minimumHeight = minimumRowHeight || 0
        rowDescriptor.topInset = topInset || 0
        rowDescriptor.bottomInset = bottomInset || 0
      })
      return partitionGrid
    }
    return null
  }

  /**
   * Returns the partition grid data for each layout run or null if no partition grid exists
   * @return {yfiles.layout.PartitionGridData} The newly created partition grid data
   */
  function createPartitionGridData() {
    const graph = graphComponent.graph
    if (rowCount > 0 && columnCount > 0) {
      const partitionGridData = new yfiles.layout.PartitionGridData()
      partitionGridData.grid = partitionGrid
      partitionGridData.cellIds.contextDelegate = node => {
        if (!graph.isGroupNode(node)) {
          return createNodeCellId(node)
        }
        // we have a group node
        const stretchGroups = document.getElementById('stretchGroupNodes').checked
        if (!stretchGroups || graph.getChildren(node).size === 0) {
          // the group nodes shall not be stretched or the group node has no children so we return null
          // this means the group node will be adjusted to contain its children but has no specific assignment to cells
          return null
        }
        // the group nodes has children whose partition cells shall be spanned so a spanning PartitionCellId is
        // created that contains all rows/column of its child nodes.
        return getGroupNodeCellId(node)
      }
      return partitionGridData
    }
    return null
  }

  /**
   * Wires up the UI.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)

    app.bindCommand(
      "button[data-command='GroupSelection']",
      iCommand.GROUP_SELECTION,
      graphComponent
    )
    app.bindCommand(
      "button[data-command='UngroupSelection']",
      iCommand.UNGROUP_SELECTION,
      graphComponent
    )

    // create the new commands and bind them to the keyboard input mode.
    const kim = graphComponent.inputMode.keyboardInputMode

    const runHierarchicLayout = iCommand.createCommand()
    kim.addCommandBinding(
      runHierarchicLayout,
      (command, parameter, sender) => runLayout(parameter),
      canExecuteAnyLayout
    )
    app.bindCommand(
      "button[data-command='HierarchicLayout']",
      runHierarchicLayout,
      graphComponent,
      new yfiles.hierarchic.HierarchicLayout()
    )

    const runOrganicLayout = iCommand.createCommand()
    kim.addCommandBinding(
      runOrganicLayout,
      (command, parameter, sender) => runLayout(parameter),
      canExecuteOrganicLayout
    )
    app.bindCommand(
      "button[data-command='OrganicLayout']",
      runOrganicLayout,
      graphComponent,
      new yfiles.organic.OrganicLayout()
    )

    const addRestrictions = iCommand.createCommand()
    kim.addCommandBinding(addRestrictions, executeAddRestrictions, canExecuteAddRestrictions)
    app.bindCommand(
      "button[data-command='GenerateGridRestrictions']",
      addRestrictions,
      graphComponent
    )

    const removeRestrictions = iCommand.createCommand()
    kim.addCommandBinding(
      removeRestrictions,
      executeRemoveRestrictions,
      canExecuteRemoveRestrictions
    )
    app.bindCommand("button[data-command='RemoveRestrictions']", removeRestrictions, graphComponent)

    app.bindAction("button[data-command='AddRow']", () => {
      rowCount++
      // if the grid does not exist until now, create at least one column
      if (columnCount === 0) {
        columnCount = 1
      }
      nodeFills = generateGradientColor(yfiles.view.Color.ORANGE, yfiles.view.Color.RED)
      updateGrid()
      // run the last applied layout algorithm
      runLayout()
    })
    app.bindAction("button[data-command='AddColumn']", () => {
      columnCount++
      // if the grid does not exist until now, create at least one row
      if (rowCount === 0) {
        rowCount = 1
      }
      nodeFills = generateGradientColor(yfiles.view.Color.ORANGE, yfiles.view.Color.RED)
      updateGrid()
      // run the last applied layout algorithm
      runLayout()
    })
    app.bindAction("button[data-command='DeleteRow']", () => {
      if (selectedCellId.rowIndex !== -1) {
        removeRow(selectedCellId.rowIndex)
        updateGridAfterRemove()
      }
    })

    app.bindAction("button[data-command='DeleteColumn']", () => {
      if (selectedCellId.columnIndex !== -1) {
        removeColumn(selectedCellId.columnIndex)
        updateGridAfterRemove()
      }
    })

    app.bindAction("button[data-command='DeleteEmptyRowsColumns']", () => {
      if (existsPartitionGrid()) {
        for (let i = 0; i < rowCount; i++) {
          if (!rows2nodes.get(i) || rows2nodes.get(i).length === 0) {
            removeRow(i)
            i = 0
          }
        }
        for (let i = 0; i < columnCount; i++) {
          if (!columns2nodes.get(i) || columns2nodes.get(i).length === 0) {
            removeColumn(i)
            i = 0
          }
        }
        updateGridAfterRemove()
      }
    })

    // for each input, add a change listener to validate that the input is within the desired limits [0, 200]
    const inputFields = document.getElementsByClassName('option-input')
    for (let i = 0; i < inputFields.length; i++) {
      inputFields[i].addEventListener(
        'change',
        value => {
          isValidInput(value, 200)
        },
        false
      )
    }
  }

  /**
   * Removes the selected row from the grid.
   * @param {number} selectedIndex The selected row's index
   */
  function removeRow(selectedIndex) {
    for (let i = selectedIndex; i < partitionGrid.rows.size; i++) {
      if (rows2nodes.get(i) && rows2nodes.get(i).length > 0) {
        rows2nodes
          .get(i)
          .slice(0)
          .forEach(node => {
            const rowIndex = i === selectedIndex ? -1 : node.tag.rowIndex - 1
            const columnIndex = i === selectedIndex ? -1 : node.tag.columnIndex
            node.tag = {
              columnIndex,
              rowIndex
            }
          })
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
      if (columns2nodes.get(i) && columns2nodes.get(i).length > 0) {
        columns2nodes
          .get(i)
          .slice(0)
          .forEach(node => {
            const columnIndex = i === selectedIndex ? -1 : node.tag.columnIndex - 1
            const rowIndex = i === selectedIndex ? -1 : node.tag.rowIndex
            node.tag = {
              columnIndex,
              rowIndex
            }
          })
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
    toggleDeleteButtonsVisibility(true)
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
   * @param {number} input The user's input
   * @param {number} maxValue The maximum expected value
   * @return {boolean} <code>True</code> if the input provided by the user is valid, i.e., not larger than the
   * desired value, <code>false</code> otherwise
   */
  function isValidInput(input, maxValue) {
    if (input.target.value > maxValue) {
      alert(`Values cannot be larger than ${maxValue}`)
      input.target.value = 10
      return false
    }
    if (input.target.value < 0) {
      alert('Values must be non-negative')
      input.target.value = 10
      return false
    }
    return true
  }

  /**
   * Checks whether or not a layout algorithm can be executed. A layout algorithm cannot be executed when the graph is
   * empty or a layout algorithm is already running.
   */
  function canExecuteAnyLayout() {
    // don't allow layouts for empty graphs
    const graph = graphComponent.graph
    return graph && graph.nodes.size !== 0
  }

  /**
   * Determines whether the organic layout command can be executed.
   */
  function canExecuteOrganicLayout() {
    if (!canExecuteAnyLayout()) {
      return false
    }

    // the <em>Organic</em> layout doesn't support to stretch a group node if it contains child nodes assigned
    // to different rows or columns. In this case the <em>Organic</em> layout button will be disabled.
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
              lastAppliedLayoutAlgorithm = new yfiles.hierarchic.HierarchicLayout()
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
   * @param {yfiles.graph.INode} groupNode The group node
   * @return {Object} The cell id indices
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
   * Determines whether the remove restrictions command can be executed. This can occur only if there exists at least
   * one selected node (that is not a group node) with active grid restrictions.
   */
  function canExecuteRemoveRestrictions() {
    const selection = graphComponent.selection.selectedNodes
    return (
      selection.size > 0 &&
      selection.filter(
        node => !graphComponent.graph.isGroupNode(node) && hasActiveRestrictions(node)
      ).size > 0
    )
  }

  /**
   * Executes the remove restrictions command.
   */
  function executeRemoveRestrictions() {
    graphComponent.selection.selectedNodes.forEach(node => {
      if (!graphComponent.graph.isGroupNode(node)) {
        node.tag = {
          columnIndex: -1,
          rowIndex: -1
        }
      }
    })
    // run the last applied layout algorithm
    runLayout()
  }

  /**
   * Determines whether the add restrictions command can be executed. This can occur only if there exists at least
   * one selected node (that is not a group node) and has no active grid restrictions.
   */
  function canExecuteAddRestrictions() {
    const selection = graphComponent.selection.selectedNodes
    return (
      selection.size > 0 &&
      selection.filter(
        node => !graphComponent.graph.isGroupNode(node) && !hasActiveRestrictions(node)
      ).size > 0
    )
  }

  /**
   * Executes the add restrictions command. Each node with no active restrictions will be assigned to the cell
   * that belongs based on its current position.
   */
  function executeAddRestrictions() {
    // if there exists no grid, initialize it with some default values
    if (!existsPartitionGrid()) {
      rowCount = 4
      columnCount = 5
      updateGrid()
    }

    // add the restrictions for the selected nodes
    graphComponent.selection.selectedNodes.forEach(node => {
      if (!graphComponent.graph.isGroupNode(node)) {
        // if the node has no restrictions, find the cell to which it belongs.
        const cellId = determineCellIndex(node.layout.center)
        const columnIndex = cellId.columnIndex
        const rowIndex = cellId.rowIndex
        node.tag = {
          columnIndex,
          rowIndex
        }
      }
    })
    // run the last applied layout algorithm
    runLayout()
  }

  /**
   * Generate an array of gradient colors between the start color and the end color.
   * @param {yfiles.view.Color} startColor The start color
   * @param {yfiles.view.Color} endColor The end color
   * @return {Array} An array of gradient colors between the start color and the end color
   */
  function generateGradientColor(startColor, endColor) {
    const stepCount = columnCount
    const colors = []

    for (let i = 0; i < columnCount; i++) {
      const r = (startColor.r * (stepCount - i) + endColor.r * i) / stepCount
      const g = (startColor.g * (stepCount - i) + endColor.g * i) / stepCount
      const b = (startColor.b * (stepCount - i) + endColor.b * i) / stepCount
      const a = (startColor.a * (stepCount - i) + endColor.a * i) / stepCount
      colors.push(new yfiles.view.Color(r | 0, g | 0, b | 0, a | 0))
    }
    return colors
  }

  /**
   * Enables/Disables some toolbar elements and the input mode of the graph component.
   * @param {boolean} disabled <code>True</code> if the UI should be disabled, <code>false</code> otherwise.
   */
  function setUIDisabled(disabled) {
    document.getElementById('AddRow').disabled = disabled
    document.getElementById('AddColumn').disabled = disabled
  }

  /**
   * Enables/disables the delete column/row buttons and updates the partition grid visual
   * @param {boolean} disabled <code>True</code> if the buttons should be disabled, <code>false</code> otherwise.
   * @param {yfiles.geometry.Point} location The location of the last mouse event
   */
  function toggleDeleteButtonsVisibility(disabled, location) {
    document.getElementById('DeleteRow').disabled = disabled
    document.getElementById('DeleteColumn').disabled = disabled

    if (partitionGridVisualCreator) {
      const cellId = disabled ? null : determineCellIndex(location)
      selectedCellId = cellId
      partitionGridVisualCreator.selectedCellId = cellId
      graphComponent.invalidate()
    }
  }

  /**
   * Generates a random integer with the given bound.
   * @param {number} upper The given upper bound
   * @return {number}
   */
  function getRandomInt(upper) {
    return Math.floor(Math.random() * upper)
  }

  /**
   * A class for implementing a layout executor that runs two parallel animations, i.e., animate the graph itself as
   * well as the partition grid visualization.
   */
  class CustomLayoutExecutor extends yfiles.layout.LayoutExecutor {
    createMorphAnimation() {
      const graphMorphAnimation = super.createMorphAnimation()
      if (partitionGridVisualCreator) {
        // we want to animate the graph itself as well as the partition
        // grid visualization so we use a parallel animation:
        return yfiles.view.IAnimation.createParallelAnimation([
          graphMorphAnimation,
          partitionGridVisualCreator
        ])
      }
      return graphMorphAnimation
    }
  }

  // run the demo
  run()
})
