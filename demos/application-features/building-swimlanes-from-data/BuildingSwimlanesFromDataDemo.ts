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
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CssFill,
  EdgePathLabelModel,
  EdgeSides,
  GraphClipboard,
  GraphComponent,
  GraphEditorInputMode,
  HashMap,
  HierarchicalLayout,
  IEdge,
  IGraph,
  IModelItem,
  INode,
  InteriorNodeLabelModel,
  IStripeStyle,
  ITable,
  LabelStyle,
  LayoutExecutor,
  License,
  NodeStyleStripeStyleAdapter,
  ParentNodeDetectionModes,
  Rect,
  RectangleNodeStyle,
  ReparentStripeHandler,
  ShapeNodeStyle,
  Size,
  Table,
  TableEditorInputMode,
  TableNodeStyle,
  TimeSpan
} from '@yfiles/yfiles'

import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import { downloadFile } from '@yfiles/demo-utils/file-support'
import graphData from './graph-data.json'

let graphComponent: GraphComponent

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupSelection: false
  })

  // Enable general undo support
  graphComponent.graph.undoEngineEnabled = true

  // configures the table editor input mode
  configureTableEditing(graphComponent)

  // configures default styles for newly created graph elements
  initializeGraph(graphComponent.graph)

  void loadGraph()

  // bind the buttons to their functionality
  initializeUI()
}

async function loadGraph(): Promise<void> {
  // then build the graph with the given data set
  buildGraph(graphComponent.graph, graphData)

  // Automatically layout the swimlanes. The HierarchicalLayout respects the node to cell assignment based on the
  // node's center position.
  await runLayout('0s')
  // Finally, clear the undo engine to prevent undoing of the graph creation.
  graphComponent.graph.undoEngine?.clear()
}

function configureTableEditing(graphComponent: GraphComponent): void {
  const graphEditorInputMode = graphComponent.inputMode as GraphEditorInputMode

  // use the undo support from the graph also for all future table instances
  Table.installStaticUndoSupport(graphComponent.graph)

  const reparentStripeHandler = new ReparentStripeHandler()
  reparentStripeHandler.maxColumnLevel = 1
  reparentStripeHandler.maxRowLevel = 1

  // Create a new TEIM instance which also allows drag and drop
  const tableInputMode = new TableEditorInputMode({
    reparentStripeHandler,
    // we set the priority higher than for the handle input mode so that handles win if both gestures are possible
    priority: graphEditorInputMode.handleInputMode.priority + 1
  })
  tableInputMode.stripeDropInputMode.enabled = true

  // Add to GEIM
  graphEditorInputMode.add(tableInputMode)

  // prevent re-parenting of tables into tables by copy & paste
  const clipboard = new GraphClipboard()
  clipboard.parentNodeDetection = ParentNodeDetectionModes.PREVIOUS_PARENT
  graphComponent.clipboard = clipboard

  // prevent selection of the table node
  graphEditorInputMode.selectablePredicate = (item: IModelItem): boolean => {
    return !(item instanceof INode && ITable.getTable(item))
  }
}

/**
 * Iterates through the given data set and creates nodes and edges according to the given data.
 * How to iterate through the data set and which information are applied to the graph, depends on the structure of
 * the input data. However, the general approach is always the same, i.e. iterating through the data set and
 * calling the graph item factory methods like
 * {@link IGraph.createNode()},
 * {@link IGraph.createGroupNode()},
 * {@link IGraph.createEdge()},
 * {@link IGraph.addLabel()}
 * and other {@link IGraph} functions to apply the given information to the graph model.
 *
 * @param graph The graph.
 * @param graphData The graph data that was loaded from the JSON file.
 * @yjs:keep = nodesSource,edgesSource
 */
function buildGraph(graph: IGraph, graphData: any): void {
  // Store lanes and nodes references.
  // It will be easier to assign lanes or connect them with edges afterwards.
  const nodes: { [id: string]: INode } = {}
  const lanes: { [id: string]: number } = {}

  // Swimlanes are a special application of Tables, either one row with several columns (i.e. vertical swimlanes), or
  // one column with several rows (i.e. horizontal swimlanes).
  // In this case we go with the vertical swimlanes. Therefore, we create a Table with one row and multiple columns,
  // depending on the input data.
  const table = new Table()

  // Configure the row style, i.e. the container for the swimlanes. In this case, they should not be rendered at all,
  // since we are creating a vertical swimlane. However, in the general case of Tables, we could use a
  // semi-transparent style here to create overlapping cell colors.
  table.rowDefaults.padding = [10, 0, 0, 0]
  table.rowDefaults.style = IStripeStyle.VOID_STRIPE_STYLE

  // Configure the column style, i.e. the actual swimlanes.
  table.columnDefaults.padding = [30, 10, 10, 10]
  table.columnDefaults.labels.style = new LabelStyle({
    backgroundFill: '#e0e0e0',
    backgroundStroke: 'black',
    verticalTextAlignment: 'center',
    horizontalTextAlignment: 'center',
    textSize: 16,
    padding: [3, 5, 3, 5]
  })
  table.columnDefaults.size = 200
  table.columnDefaults.style = new NodeStyleStripeStyleAdapter(
    new ShapeNodeStyle({
      fill: '#c4d7ed',
      stroke: 'black',
      shape: 'rectangle'
    })
  )

  // The second column style that is used for the even-odd styling of the columns.
  const alternateColumnStyle = new NodeStyleStripeStyleAdapter(
    new ShapeNodeStyle({
      fill: '#abc8e2',
      stroke: 'black',
      shape: 'rectangle'
    })
  )

  // Create the single container row.
  table.createRow()

  // Iterate the lanes data and create the according lanes.
  graphData.lanesSource.forEach((laneData: any, index: number): void => {
    const column = table.createColumn({
      tag: laneData,
      style: index % 2 === 0 ? table.columnDefaults.style : alternateColumnStyle
    })
    table.addLabel(column, laneData.label || laneData.id)

    // We store the lane index to easily assign nodes to them later.
    lanes[laneData.id] = index
  })

  // Create a top-level group node and bind, via the TableNodeStyle, the table to it.
  const tableStyle = new TableNodeStyle(table)
  const tableGroupNode = graph.createGroupNode(null, table.layout.toRect(), tableStyle)

  // Iterate the node data and create the according nodes.
  graphData.nodesSource.forEach((nodeData: any): void => {
    const size = nodeData.size || [50, 50]
    const node = graph.createNode({
      labels: nodeData.label != null ? [nodeData.label] : [],
      layout: new Rect(0, 0, size[0], size[1]),
      tag: nodeData
    })
    if (nodeData.fill) {
      // If the node data specifies an individual fill color, adjust the style.
      const nodeStyle = graph.nodeDefaults.style.clone() as RectangleNodeStyle
      nodeStyle.fill = nodeData.fill
      graph.setStyle(node, nodeStyle)
    }
    nodes[nodeData.id] = node

    if (nodeData.lane) {
      // Nodes are assigned to lanes based on their center location. We could either place them manually by getting
      // the respective lane's bounds, or we can use a helper function to place nodes in specific cells. In case of
      // manually, placing the nodes, don't forget to also reparent the nodes to the table group, which is also done
      // by the helper function.
      ITable.placeNodeInCell(
        graph,
        node,
        tableGroupNode,
        table.columns.at(lanes[nodeData.lane])!,
        table.rows.first()!
      )
    }
  })

  // Iterate the edge data and create the according edges.
  graphData.edgesSource.forEach((edgeData: any): void => {
    // Note that nodes and groups need to have disjoint sets of ids, otherwise it is impossible to determine
    // which node is the correct source/target.
    graph.createEdge({
      source: nodes[edgeData.from],
      target: nodes[edgeData.to],
      labels: edgeData.label != null ? [edgeData.label] : [],
      tag: edgeData
    })
  })
}

/**
 * Serializes the graph to JSON.
 * @param graph The graph
 */
function writeToJSON(graph: IGraph): any {
  const jsonOutput = {
    nodesSource: [],
    edgesSource: [],
    lanesSource: []
  }

  // find the table, we assume there is only one
  const tableNode = graph.nodes.find((node: INode): boolean => !!ITable.getTable(node))
  const table = tableNode ? ITable.getTable(tableNode) : null

  // serialize the nodes with their swimlane information
  const node2id = new HashMap()
  graph.nodes.forEach((node: INode, i: number): void => {
    // skip the table node
    if (node === tableNode) {
      return
    }

    // save the id to easily create the edgesSource afterwards
    node2id.set(node, i)

    // serialize the node
    const jsonNode = {
      id: i,
      size: [node.layout.width, node.layout.height],
      fill: ((node.style as RectangleNodeStyle).fill! as CssFill).value
    }
    if (node.labels.size > 0) {
      ;(jsonNode as any).label = node.labels.first()!.text
    }
    ;(jsonOutput.nodesSource as any).push(jsonNode)

    // store the lane of the node
    if (table) {
      const column = table.findColumn(tableNode!, node.layout.center)
      if (column) {
        const columnId = `lane${column.index}`
        ;(jsonNode as any).lane = columnId
        // store new lanes in the json
        if (!jsonOutput.lanesSource.find((lane: any): boolean => lane.id === columnId)) {
          const jsonLane = { id: columnId }
          if (column.labels.size > 0) {
            ;(jsonNode as any).label = column.labels.first()!.text
          }
          ;(jsonOutput.lanesSource as any).push(jsonLane)
        }
      }
    }
  })

  // serialize the edges
  graph.edges.forEach((edge: IEdge): void => {
    const sourceId = node2id.get(edge.sourceNode)
    const targetId = node2id.get(edge.targetNode)
    ;(jsonOutput.edgesSource as any).push({
      from: sourceId,
      to: targetId
    })
  })

  return jsonOutput
}

/**
 * Runs a {@link HierarchicalLayout} on the current graph. The
 * {@link HierarchicalLayout} respects the node to cell (or swimlane) assignment by considering the
 * nodes location in relation to the swimlane bounds.
 * @param duration The animation duration of the layout.
 */
function runLayout(duration: TimeSpan | string): Promise<any> {
  const layout = new HierarchicalLayout({
    layoutOrientation: 'top-to-bottom',
    componentLayout: { enabled: true }
  })

  // We use Layout executor convenience method that already sets up the whole layout pipeline correctly
  const layoutExecutor = new LayoutExecutor({
    graphComponent,
    layout,
    // Table layout is enabled by default already...
    configureTableLayout: true,
    animationDuration: duration,
    animateViewport: true
  })

  // Apply an initial layout
  return layoutExecutor.start()
}

/**
 * Initializes the defaults for the styling in this demo.
 *
 * @param graph The graph.
 */
function initializeGraph(graph: IGraph): void {
  // set styles for this demo
  initDemoStyles(graph, { orthogonalEditing: true })

  // set sizes and locations specific for this demo
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.layoutParameter = InteriorNodeLabelModel.CENTER
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}

/**
 * Binds the buttons in the toolbar to their functionality.
 */
function initializeUI(): void {
  document
    .querySelector<HTMLButtonElement>('#save-to-json')!
    .addEventListener('click', (): void => {
      const graph = graphComponent.graph
      const json = writeToJSON(graph)
      downloadFile(JSON.stringify(json), 'graph.json')
    })
  document
    .querySelector<HTMLButtonElement>('#layout-button')!
    .addEventListener('click', (): Promise<any> => runLayout('1s'))
}

run().then(finishLoading)
