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
  DefaultLabelStyle,
  ExteriorLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphMLIOHandler,
  GraphMLSupport,
  ICommand,
  IModelItem,
  INode,
  InteriorStretchLabelModel,
  ItemEventArgs,
  KeyType,
  License,
  MouseHoverInputMode,
  PanelNodeStyle,
  Point,
  QueryItemToolTipEventArgs,
  ShapeNodeStyle,
  Size,
  StorageLocation,
  ToolTipQueryEventArgs,
  YObject
} from 'yfiles'

import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/** @type {GraphComponent} */
let graphComponent = null

/**
 * Symbolic name for the mapper that allows transparent access to the correct implementation even across
 * wrapped graphs.
 */
const DATE_TIME_MAPPER_KEY = 'DateTimeMapperKey'

/**
 * Bootstraps the demo.
 * @param {!object} licenseData
 */
function run(licenseData) {
  License.value = licenseData
  // initialize graph component
  graphComponent = new GraphComponent('#graphComponent')
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })
  graphComponent.graph.undoEngineEnabled = true

  // configures default styles for newly created graph elements
  initTutorialDefaults()

  // sets up the a data binding that stores the current date when a node is created
  enableDataBinding()

  // enable GraphML IO
  enableGraphML()

  // displays tooltips for the stored data items, so that something is visible to the user
  setupTooltips()

  // add a sample graph
  createGraph()

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Sets up simple data binding - creates an IMapper, registers it and subscribe to the node creation event
 * on the graph.
 */
function enableDataBinding() {
  const graph = graphComponent.graph
  // Creates a specialized IMapper instance, and registers it under a symbolic name.
  const dateMapper = graph.mapperRegistry.createMapper(
    INode.$class,
    YObject.$class,
    DATE_TIME_MAPPER_KEY
  )

  // Subscribes to the node creation event to record the node creation time.
  // Note that since this event is triggered after undo/redo, the time will
  // be updated during redo of node creations and undo of node deletions.
  // If this is unwanted behavior, you can customize the node creation itself
  // to associate this data with the element at the time of its initial creation,
  // e.g. by listening to the NodeCreated event of GraphEditorInputMode, see below
  graph.addNodeCreatedListener((source, eventArgs) => {
    // Stores the current time as node creation time.
    dateMapper.set(eventArgs.item, new Date())
  })
}

/**
 * Enables loading and saving the graph to GraphML.
 */
function enableGraphML() {
  // create a new GraphMLSupport instance that handles save and load operations
  // eslint-disable-next-line no-new
  new GraphMLSupport({
    graphComponent,
    // configure to load and save to the file system
    storageLocation: StorageLocation.FILE_SYSTEM,
    // set a custom GraphMLIOHandler
    graphMLIOHandler: createGraphMLIOHandler()
  })
}

/**
 * Register input and output handlers that store the data in the mapper as GraphMLAttributes resp. can read them
 * back.
 * @returns {!GraphMLIOHandler}
 */
function createGraphMLIOHandler() {
  // create an IOHandler that will be used for all IO operations
  const graphMLIOHandler = new GraphMLIOHandler()

  const registry = graphComponent.graph.mapperRegistry
  const dateMapper = registry.getMapper(DATE_TIME_MAPPER_KEY)
  if (dateMapper !== null) {
    // The OutputHandler just stores the string value of the attribute
    // We need to provide the symbolic name of the attribute in the graphml file, the data source as an IMapper and the
    // GraphML type of the attribute
    graphMLIOHandler.addOutputMapper(
      INode.$class,
      YObject.$class,
      DATE_TIME_MAPPER_KEY,
      'demo',
      dateMapper,
      (args, e) => {
        if (e.item instanceof Date) {
          e.writer.writeString(JSON.stringify(e.item))
        }
        e.handled = true
      },
      KeyType.STRING
    )

    // To read back a DateTime value from a string GraphML attribute, we have to provide an additional callback method.
    graphMLIOHandler.addInputMapper(
      INode.$class,
      YObject.$class,
      element => GraphMLIOHandler.matchesName(element, DATE_TIME_MAPPER_KEY),
      dateMapper,
      (sender, e) => {
        // The actual value is a text node that can be retrieved from the event
        try {
          const stringValue = e.xmlNode.textContent
          e.result = JSON.parse(stringValue, (key, val) => new Date(val))
        } catch (exception) {
          if (typeof window.console !== 'undefined') {
            window.console.log(exception)
          }
          e.result = new Date()
        }
      }
    )
  }
  return graphMLIOHandler
}

/**
 * Setup tooltips that return the value that is stored in the mapper.
 * Dynamic tooltips are implemented by adding a tooltip provider as an event handler for
 * the {@link MouseHoverInputMode#addQueryToolTipListener QueryToolTip} event of the
 * GraphEditorInputMode using the
 * {@link ToolTipQueryEventArgs} parameter.
 * The {@link ToolTipQueryEventArgs} parameter provides three relevant properties:
 * Handled, QueryLocation, and ToolTip. The Handled property is a flag which indicates
 * whether the tooltip was already set by one of possibly several tooltip providers. The
 * QueryLocation property contains the mouse position for the query in world coordinates.
 * The tooltip is set by setting the ToolTip property.
 */
function setupTooltips() {
  const graphEditorInputMode = graphComponent.inputMode
  graphEditorInputMode.toolTipItems = GraphItemTypes.NODE
  graphEditorInputMode.addQueryItemToolTipListener((src, eventArgs) => {
    if (eventArgs.handled) {
      // Tooltip content has already been assigned -> nothing to do.
      return
    }
    const item = eventArgs.item
    if (INode.isInstance(item)) {
      const dateMapper = graphComponent.graph.mapperRegistry.getMapper(DATE_TIME_MAPPER_KEY)
      if (dateMapper !== null) {
        // Found a suitable mapper. Set the tooltip content.
        eventArgs.toolTip = dateMapper.get(item).toLocaleString()
        // Indicate that the tooltip content has been set.
        eventArgs.handled = true
      }
    }
  })

  // Add a little offset to the tooltip such that it is not obscured by the mouse pointer.
  graphEditorInputMode.mouseHoverInputMode.toolTipLocationOffset = new Point(20, 20)
}

/**
 * Initializes the defaults for the styles in this tutorial.
 */
function initTutorialDefaults() {
  const graph = graphComponent.graph

  // configure defaults normal nodes and their labels
  graph.nodeDefaults.style = new ShapeNodeStyle({
    fill: 'darkorange',
    stroke: 'white'
  })
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    verticalTextAlignment: 'center',
    wrapping: 'word-ellipsis'
  })
  graph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.SOUTH

  // configure defaults group nodes and their labels
  graph.groupNodeDefaults.style = new PanelNodeStyle({
    color: 'rgb(214, 229, 248)',
    insets: [18, 5, 5, 5],
    labelInsetsColor: 'rgb(214, 229, 248)'
  })
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'right'
  })
  graph.groupNodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.NORTH
}

/**
 * Creates a simple sample graph.
 */
function createGraph() {
  const graph = graphComponent.graph

  const node1 = graph.createNodeAt([110, 20])
  const node2 = graph.createNodeAt([145, 95])
  const node3 = graph.createNodeAt([75, 95])
  const node4 = graph.createNodeAt([30, 175])
  const node5 = graph.createNodeAt([100, 175])

  graph.groupNodes({ children: [node1, node2, node3], labels: ['Group 1'] })

  const edge1 = graph.createEdge(node1, node2)
  const edge2 = graph.createEdge(node1, node3)
  const edge3 = graph.createEdge(node3, node4)
  const edge4 = graph.createEdge(node3, node5)
  const edge5 = graph.createEdge(node1, node5)
  graph.setPortLocation(edge1.sourcePort, new Point(123.33, 40))
  graph.setPortLocation(edge1.targetPort, new Point(145, 75))
  graph.setPortLocation(edge2.sourcePort, new Point(96.67, 40))
  graph.setPortLocation(edge2.targetPort, new Point(75, 75))
  graph.setPortLocation(edge3.sourcePort, new Point(65, 115))
  graph.setPortLocation(edge3.targetPort, new Point(30, 155))
  graph.setPortLocation(edge4.sourcePort, new Point(85, 115))
  graph.setPortLocation(edge4.targetPort, new Point(90, 155))
  graph.setPortLocation(edge5.sourcePort, new Point(110, 40))
  graph.setPortLocation(edge5.targetPort, new Point(110, 155))
  graph.addBends(edge1, [new Point(123.33, 55), new Point(145, 55)])
  graph.addBends(edge2, [new Point(96.67, 55), new Point(75, 55)])
  graph.addBends(edge3, [new Point(65, 130), new Point(30, 130)])
  graph.addBends(edge4, [new Point(85, 130), new Point(90, 130)])

  graphComponent.fitGraphBounds()
  graph.undoEngine.clear()
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function registerCommands() {
  bindAction("button[data-command='New']", () => {
    graphComponent.graph.clear()
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  })
  bindCommand("button[data-command='Open']", ICommand.OPEN, graphComponent)
  bindCommand("button[data-command='Save']", ICommand.SAVE, graphComponent)
  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
  bindCommand("button[data-command='GroupSelection']", ICommand.GROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='UngroupSelection']", ICommand.UNGROUP_SELECTION, graphComponent)
}

// start tutorial
loadJson().then(run)
