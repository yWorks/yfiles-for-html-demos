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
  DashStyle,
  INodeStyle,
  Insets,
  ITable,
  LabelStyle,
  LineCap,
  NodeDropInputMode,
  NodeStyleStripeStyleAdapter,
  Rect,
  ShapeNodeShape,
  ShapeNodeStyle,
  SimpleNode,
  StretchStripeLabelModel,
  Stroke,
  Table
} from '@yfiles/yfiles'
import { DemoStripeStyle, DemoTableStyle } from './TableStyles'

import { DragAndDropPanel } from '@yfiles/demo-utils/DragAndDropPanel'
import { createDemoNodeStyle } from '@yfiles/demo-app/demo-styles'

/**
 * Configures drag and drop interaction that considers dropping nodes on table nodes.
 */
export function configureDndInputMode(graph) {
  const nodeDropInputMode = new NodeDropInputMode({
    showPreview: true,
    enabled: true,
    isGroupNodePredicate: (draggedNode) =>
      // tables and tagged nodes should be created as group nodes
      !!ITable.getTable(draggedNode) || draggedNode.tag === 'GroupNode'
  })

  nodeDropInputMode.isValidParentPredicate = (node) => {
    const draggedNode = nodeDropInputMode.lastDragEventArgs.item.getData('yfiles.graph.INode')
    if (ITable.getTable(draggedNode) && node !== null && graph.isGroupNode(node)) {
      // this node has a table associated - disallow dragging into a group node.
      return false
    }
    return graph.isGroupNode(node)
  }

  return nodeDropInputMode
}

/**
 * Configures the drag and drop panel.
 */
export function configureDndPanel() {
  const dndPanel = new DragAndDropPanel(document.querySelector('#dnd-panel'))
  dndPanel.maxItemWidth = 160
  dndPanel.populatePanel(createDndPanelNodes())
}

/**
 * Creates the nodes that provide the visualizations for the style panel.
 */
function createDndPanelNodes() {
  const nodeContainer = []

  // dummy table that serves to hold only a sample row
  const rowSampleTable = new Table()
  // dummy table that serves to hold only a sample column
  const columnSampleTable = new Table()

  // configure the defaults for the row sample table
  rowSampleTable.rowDefaults.style = new NodeStyleStripeStyleAdapter(new DemoStripeStyle())

  // create the sample row
  const rowSampleRow = rowSampleTable.createRow()
  // create an invisible sample column in this table so that we will see something.
  const rowSampleColumn = rowSampleTable.createColumn({
    width: 160,
    style: new NodeStyleStripeStyleAdapter(INodeStyle.VOID_NODE_STYLE)
  })
  // the sample row uses empty padding
  rowSampleTable.setStripePadding(rowSampleColumn, Insets.EMPTY)
  const labelStyle = new LabelStyle({
    textFill: 'white',
    horizontalTextAlignment: 'center',
    verticalTextAlignment: 'center'
  })
  rowSampleTable.addLabel({ owner: rowSampleRow, text: 'Row', style: labelStyle })

  const columnSampleRow = columnSampleTable.createRow({
    height: 160,
    style: new NodeStyleStripeStyleAdapter(INodeStyle.VOID_NODE_STYLE)
  })
  const columnSampleColumn = columnSampleTable.createColumn({
    width: 160,
    style: new NodeStyleStripeStyleAdapter(new DemoStripeStyle())
  })
  columnSampleTable.setStripePadding(columnSampleRow, Insets.EMPTY)
  columnSampleTable.addLabel(columnSampleColumn, 'Column', StretchStripeLabelModel.TOP, labelStyle)

  // table for a complete sample table node
  const sampleTable = new Table()
  sampleTable.padding = Insets.EMPTY

  // configure the defaults for the row sample table
  sampleTable.columnDefaults.minimumSize = sampleTable.rowDefaults.minimumSize = 50

  // setup defaults for the complete sample table
  // we use a custom style that alternates the stripe colors and uses a special style for all parent stripes.
  sampleTable.rowDefaults.style = new NodeStyleStripeStyleAdapter(new DemoStripeStyle())
  sampleTable.rowDefaults.labels.style = labelStyle

  // the style for the columns is simpler, we use a node control style that only points the header padding.
  sampleTable.columnDefaults.style = columnSampleTable.columnDefaults.style =
    new NodeStyleStripeStyleAdapter(new DemoStripeStyle())
  sampleTable.columnDefaults.labels.style = labelStyle

  // create a row and a column in the sample table
  sampleTable.createGrid(1, 1)
  // use twice the default width for this sample column (looks nicer in the preview...)
  sampleTable.setSize(sampleTable.columns.first(), sampleTable.columns.first().actualSize * 2)
  // bind the table to a dummy node which is used for drag & drop
  // binding the table is performed through a TableNodeStyle instance.
  // among other things, this also makes the table instance available in the node's lookup

  // add the sample node for the table
  const sampleTableNode = new SimpleNode()
  sampleTableNode.layout = sampleTable.layout.toRect()
  sampleTableNode.style = new DemoTableStyle(sampleTable)
  nodeContainer.push(sampleTableNode)

  // add sample rows and columns
  // we use dummy nodes to hold the associated stripe instances - this makes the style panel easier to use
  const columnSampleTableNode = new SimpleNode()
  columnSampleTableNode.layout = columnSampleTable.layout.toRect()
  columnSampleTableNode.style = new DemoTableStyle(columnSampleTable)
  columnSampleTableNode.tag = columnSampleTable.rootColumn.childColumns.at(0)
  nodeContainer.push(columnSampleTableNode)

  // add sample rows and columns
  // we use dummy nodes to hold the associated stripe instances - this makes the style panel easier to use
  const rowSampleTableNode = new SimpleNode()
  rowSampleTableNode.layout = rowSampleTable.layout.toRect()
  rowSampleTableNode.style = new DemoTableStyle(rowSampleTable)
  rowSampleTableNode.tag = rowSampleTable.rootRow.childRows.at(0)
  nodeContainer.push(rowSampleTableNode)

  // add normal sample leaf and group nodes
  const normalNode = new SimpleNode()
  normalNode.layout = new Rect(0, 0, 80, 50)
  normalNode.style = createDemoNodeStyle()
  nodeContainer.push(normalNode)

  const groupNode = new SimpleNode()
  groupNode.layout = new Rect(0, 0, 120, 70)
  groupNode.style = createGroupNodeStyle()
  groupNode.tag = 'GroupNode'
  nodeContainer.push(groupNode)

  return nodeContainer
}

/**
 * Creates a style that visualizes nodes as dash-dotted outline only.
 */
export function createGroupNodeStyle() {
  return new ShapeNodeStyle({
    shape: ShapeNodeShape.ROUND_RECTANGLE,
    fill: 'transparent',
    stroke: new Stroke({ dashStyle: DashStyle.DASH_DOT, lineCap: LineCap.SQUARE })
  })
}
