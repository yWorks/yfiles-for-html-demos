/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  DefaultLabelStyle,
  EdgeDirectionPolicy,
  Fill,
  GenericLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  IArrow,
  ICommand,
  IGraph,
  IHitTestable,
  INode,
  Insets,
  InsideOutsidePortLabelModel,
  InteriorStretchLabelModel,
  IPort,
  LabelEventArgs,
  License,
  NodeStylePortStyleAdapter,
  OrthogonalEdgeEditingContext,
  Point,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeStyle,
  Size,
  SolidColorFill
} from 'yfiles'
import { bindCommand, showApp } from '../../resources/demo-app.js'
import { ListNodeStyle } from './ListNodeStyle.js'
import { ContextMenu } from '../../utils/ContextMenu.js'
import {
  createPortLocationParameter,
  getPortForData,
  RowPositionHandler
} from './RowPositionHandler.js'

import { applyDemoTheme } from '../../resources/demo-styles.js'
import { fetchLicense } from '../../resources/fetch-license.js'

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  configureGraph(graphComponent.graph)

  // create some graph elements
  createSampleGraph(graphComponent.graph)

  // center the sample graph in the visible area
  graphComponent.fitGraphBounds()

  // configure user interaction
  initializeInteraction(graphComponent)

  registerCommands(graphComponent)

  showApp(graphComponent)
}

/**
 * Set up the {@link GraphEditorInputMode} and customize the editing gestures:
 * - do not delete labels and ports
 * - create only row containing nodes
 * - orthogonal edges
 * - register new label texts in the model data
 * - set up a special move mode
 * - set up a context menu
 * @param {!GraphComponent} graphComponent
 */
function initializeInteraction(graphComponent) {
  const geim = new GraphEditorInputMode({
    allowEditLabel: true,
    allowAddLabel: false,
    deletableItems: GraphItemTypes.NODE | GraphItemTypes.BEND | GraphItemTypes.EDGE,
    nodeCreator: (context, graph, location) =>
      createNode(graph, location, `Node ${graph.nodes.size + 1}`),
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext(),
    clickHitTestOrder: [
      GraphItemTypes.LABEL,
      GraphItemTypes.EDGE,
      GraphItemTypes.NODE,
      GraphItemTypes.ALL
    ]
  })

  // prefer edge creation over moving elements but only if the creation starts over a candidate
  geim.createEdgeInputMode.priority = geim.moveUnselectedInputMode.priority - 1
  geim.createEdgeInputMode.startOverCandidateOnly = true
  geim.createEdgeInputMode.edgeDirectionPolicy = EdgeDirectionPolicy.DETERMINE_FROM_PORT_CANDIDATES

  // register label changes in the model
  geim.addLabelTextChangedListener((sender, evt) => {
    if (evt.owner instanceof INode || evt.owner instanceof IPort) {
      if ('name' in evt.owner.tag) {
        evt.owner.tag.name = evt.item.text
      }
    }
  })

  geim.addDeletedItemListener((sender, evt) => {
    if (evt instanceof LabelEventArgs && evt.owner instanceof IPort) {
      const port = evt.owner
      const node = port.owner
      const nodeInfo = node.tag
      const index = nodeInfo.rows.indexOf(port.tag)
      if (index > -1) {
        removeRow(graphComponent.graph, node, index)
      }
    }
  })

  // disable normal move mode, enable unselected
  geim.moveInputMode.enabled = false
  geim.moveUnselectedInputMode.enabled = true
  const oldHitTestable = geim.moveUnselectedInputMode.hitTestable
  // only start move gestures if the mouse is over the node header or over a row with content
  geim.moveUnselectedInputMode.hitTestable = IHitTestable.create((context, location) => {
    const node = findNodeAt(geim, location)
    if (node && node.style instanceof ListNodeStyle) {
      return node.style.isHeaderHit(node, location) || node.style.getRowIndex(node, location) > -1
    }
    return oldHitTestable.isHit(context, location)
  })
  // the move gesture has been started
  geim.moveUnselectedInputMode.addQueryPositionHandlerListener((sender, evt) => {
    const location = evt.queryLocation
    const node = findNodeAt(geim, location)
    if (node && node.style instanceof ListNodeStyle) {
      // cursor is over a row: return a special position handler
      const index = node.style.getRowIndex(node, location)
      if (index > -1) {
        // create a position handler to move port #index around
        evt.positionHandler = new RowPositionHandler(node, index)
      }
    }
    // if the cursor is not over a row: use the default, i.e. do nothing here
  })

  // do not let the user drag at ports
  graphComponent.graph.decorator.edgeDecorator.edgeReconnectionPortCandidateProviderDecorator.hideImplementation()

  registerContextMenu(graphComponent, geim)

  graphComponent.inputMode = geim
}

/**
 * Finds the first node whose bounds contain the given location.
 * @param {!GraphEditorInputMode} mode
 * @param {!Point} location
 * @returns {?INode}
 */
function findNodeAt(mode, location) {
  return mode.findItems(location, [GraphItemTypes.NODE]).at(0)
}

/**
 * Creates a node with the special node style for row containers.
 * @param {!IGraph} graph The graph to create the node in.
 * @param {!Point} location The center of the newly created node.
 * @param {!string} label The node label.
 * @param rows An array of {@link RowInfo}s to create initial rows.
 * @param {?Array.<RowInfo>} [rows=null]
 * @returns {!INode}
 */
function createNode(graph, location, label, rows = null) {
  const nodeInfo = { name: label, rows: [], draggingIndex: null }
  const node = graph.createNode({
    layout: Rect.fromCenter(location, new Size(100, 200)),
    style: new ListNodeStyle(),
    labels: [
      {
        text: label,
        style: new DefaultLabelStyle({
          textFill: Fill.WHITE,
          horizontalTextAlignment: 'center',
          verticalTextAlignment: 'center',
          minimumSize: new Size(0, 20)
        })
      }
    ],
    tag: nodeInfo
  })
  if (rows) {
    for (const row of rows) {
      addRow(graph, node, row)
    }
  }
  return node
}

/**
 * Creates a new row.
 * The new row is always created at the bottom.
 * @param {!IGraph} graph The graph which contains the node.
 * @param {!INode} node The node to create the row for.
 * @param {!RowInfo} rowInfo The info which describes the row to create.
 */
function addRow(graph, node, rowInfo) {
  const labelStyle = new DefaultLabelStyle({
    insets: new Insets(3, 1, 3, 1),
    textFill: '#0C313A'
  })
  const portStyle = new NodeStylePortStyleAdapter(
    new ShapeNodeStyle({ fill: new SolidColorFill(0x30, 0x40, 0x48), shape: 'ellipse' })
  )

  const nodeInfo = node.tag
  if (rowInfo.in) {
    // the row is represented as a port with a label
    const port = graph.addPort({
      owner: node,
      style: portStyle,
      locationParameter: createPortLocationParameter(nodeInfo.rows.length, true, node.style),
      tag: { rowInfo: rowInfo, incoming: true }
    })
    graph.addLabel(
      port,
      rowInfo.in,
      new InsideOutsidePortLabelModel().createInsideParameter(),
      labelStyle
    )
  }
  if (rowInfo.out) {
    // the row is represented as a port with a label
    const port = graph.addPort({
      owner: node,
      style: portStyle,
      locationParameter: createPortLocationParameter(nodeInfo.rows.length, false, node.style),
      tag: { rowInfo: rowInfo, incoming: false }
    })
    graph.addLabel(
      port,
      rowInfo.out,
      new InsideOutsidePortLabelModel().createInsideParameter(),
      labelStyle
    )
  }

  // register the row
  nodeInfo.rows.push(rowInfo)

  // make sure the new row fits into the node
  const nl = node.layout
  const minHeight = node.style.getMinimumHeight(node)
  if (nl.height < minHeight) {
    graph.setNodeLayout(node, new Rect(nl.x, nl.y, nl.width, minHeight))
  }
}

/**
 * Removes the row at the given index.
 * This method assumes a valid row index.
 * @param {!IGraph} graph the graph that contains the node whose row will be removed.
 * @param {!INode} node the node whose row will be removed.
 * @param {number} rowIndex the index of the row that will be removed.
 */
function removeRow(graph, node, rowIndex) {
  // remove port and row info
  const nodeInfo = node.tag

  const portForData = getPortForData(node, nodeInfo.rows[rowIndex])
  portForData.toArray().forEach(port => {
    graph.remove(port)
  })
  nodeInfo.rows.splice(rowIndex, 1)

  // update subsequent rows
  for (let i = rowIndex; i < nodeInfo.rows.length; i++) {
    const ri = nodeInfo.rows[i]
    const portForData = getPortForData(node, ri)
    portForData.forEach(port => {
      const incoming = port.tag.incoming
      graph.setPortLocationParameter(port, createPortLocationParameter(i, incoming, node.style))
      // keep adjacent edges orthogonal
      const edge = graph.edgesAt(port).at(0)
      if (edge) {
        const bend = incoming ? edge.bends.at(-1) : edge.bends.at(0)
        if (bend) {
          graph.setBendLocation(bend, new Point(bend.location.x, port.location.y))
        } else {
          const sourceLocation = edge.sourcePort.location
          const targetLocation = edge.targetPort.location
          const x = sourceLocation.x + (targetLocation.x - sourceLocation.x) / 2
          graph.addBend(edge, new Point(x, sourceLocation.y))
          graph.addBend(edge, new Point(x, targetLocation.y))
        }
      }
    })
  }
}

/**
 * Configures default styles and default behavior for the given graph.
 * @param {!IGraph} graph
 */
function configureGraph(graph) {
  // sets some default styles
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '3px #2C4B52',
    targetArrow: IArrow.DEFAULT,
    smoothingLength: 50
  })
  graph.edgeDefaults.labels.style = new DefaultLabelStyle({
    textFill: 'black',
    backgroundStroke: 'black',
    backgroundFill: 'white',
    insets: 5
  })

  // do not remove ports when their adjacent edges are removed
  graph.nodeDefaults.ports.autoCleanUp = false

  // disallow moving main node label
  const labelModel = new GenericLabelModel(InteriorStretchLabelModel.NORTH)
  graph.nodeDefaults.labels.layoutParameter = labelModel.createDefaultParameter()
}

/**
 * Creates the initial sample graph.
 * @param {!IGraph} graph
 */
function createSampleGraph(graph) {
  // create the sample graph
  const n1 = createNode(graph, new Point(0, 0), 'Node 1', [
    { in: 'in 0', out: 'out 0' },
    { out: 'out 1' },
    { in: 'in 2', out: 'out 2' },
    { out: 'out 3' }
  ])

  const n2 = createNode(graph, new Point(400, 0), 'Node 2', [
    { in: 'in 0' },
    { in: 'in 1', out: 'out 1' },
    { in: 'in 2' },
    { in: 'in 3', out: 'out 3' }
  ])

  const out0 = n1.ports.get(1)
  const in0 = n2.ports.get(0)
  const out1 = n1.ports.get(2)
  const in2 = n2.ports.get(4)
  graph.createEdge({
    sourcePort: out0,
    targetPort: in0,
    bends: [new Point(150, out0.location.y), new Point(150, in0.location.y)]
  })
  graph.createEdge({
    sourcePort: out1,
    targetPort: in2,
    bends: [new Point(250, out1.location.y), new Point(250, in2.location.y)]
  })
}

/**
 * Registers a context menu for the given graph component.
 * The context menu will provide the following actions:
 * - Add input: adds a row with a port for incoming edges at the left
 * - Add output: adds a row with a port for outgoing edges at the right
 * - Remove: removes the row under the cursor
 * @param {!GraphComponent} graphComponent
 * @param {!GraphEditorInputMode} geim
 */
function registerContextMenu(graphComponent, geim) {
  const contextMenu = new ContextMenu(graphComponent)
  contextMenu.addOpeningEventListeners(graphComponent, location => {
    if (geim.contextMenuInputMode.shouldOpenMenu(graphComponent.toWorldFromPage(location))) {
      contextMenu.show(location)
    }
  })
  contextMenu.onClosedCallback = () => {
    geim.contextMenuInputMode.menuClosed()
  }
  geim.contextMenuInputMode.addCloseMenuListener(() => {
    contextMenu.close()
  })

  geim.addPopulateItemContextMenuListener((sender, args) => {
    contextMenu.clearItems()

    const node = args.item
    if (node instanceof INode && node.style instanceof ListNodeStyle) {
      args.showMenu = true

      // we have a row containing node at cursor location
      const style = node.style

      const graph = graphComponent.graph

      // add menu entries for adding input and output rows
      contextMenu.addMenuItem('Add input', () =>
        addRow(graph, node, { in: `in ${node.ports.size}` })
      )
      contextMenu.addMenuItem('Add output', () =>
        addRow(graph, node, { out: `out ${node.ports.size}` })
      )

      contextMenu.addMenuItem('Add input/output', () =>
        addRow(graph, node, { in: `in ${node.ports.size}`, out: `out ${node.ports.size}` })
      )

      // if we are over a row add an entry for removing that row
      const portInfoIndex = style.getRowIndex(node, args.queryLocation)
      if (portInfoIndex > -1) {
        const nodeInfo = node.tag
        const rowInfo = nodeInfo.rows[portInfoIndex]
        let text
        if (rowInfo.in) {
          text = rowInfo.in + ' '
        }
        if (rowInfo.out) {
          text = rowInfo.out
        }
        if (rowInfo.in || rowInfo.out) {
          contextMenu.addMenuItem(`Remove  ${text}`, () => removeRow(graph, node, portInfoIndex))
        }
      }
    }
  })
}

/**
 * Binds commands to the demo's UI controls.
 * @param {!GraphComponent} graphComponent
 */
function registerCommands(graphComponent) {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}

// model data for a node: the node's name and the rows
/**
 * @typedef {Object} NodeInfo
 * @property {number} draggingIndex
 * @property {string} name
 * @property {Array.<RowInfo>} rows
 */
// model data for a row: the name and whether it is for incoming or outgoing edges
/**
 * @typedef {Object} RowInfo
 * @property {string} [in]
 * @property {string} [out]
 */

// noinspection JSIgnoredPromiseFromCall
run()
