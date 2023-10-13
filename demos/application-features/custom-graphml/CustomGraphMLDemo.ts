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
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Class,
  DefaultLabelStyle,
  EdgePathLabelModel,
  EdgeSides,
  ExteriorLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphMLIOHandler,
  GraphMLSupport,
  GroupNodeLabelModel,
  GroupNodeStyle,
  HierarchicLayout,
  IGraph,
  INode,
  KeyType,
  LayoutExecutor,
  License,
  Point,
  Size,
  StorageLocation,
  ToolTipQueryEventArgs,
  YObject
} from 'yfiles'

import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import type { JSONGraph } from 'demo-utils/json-model'
import graphData from './graph-data.json'

let graphComponent: GraphComponent

/**
 * Symbolic name for the mapper that allows transparent access to the correct implementation even across
 * wrapped graphs.
 */
const DATE_TIME_MAPPER_KEY = 'DateTimeMapperKey'

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  // initialize graph component
  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })

  // configures default styles for newly created graph elements
  initTutorialDefaults(graphComponent.graph)

  // sets up the data binding that stores the current date when a node is created
  enableDataBinding()

  // then build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  Class.ensure(LayoutExecutor)
  graphComponent.graph.applyLayout(
    new HierarchicLayout({ orthogonalRouting: true, minimumLayerDistance: 35 })
  )
  graphComponent.fitGraphBounds()

  // enable now the undo engine to prevent undoing of the graph creation
  graphComponent.graph.undoEngineEnabled = true

  // enable GraphML IO
  enableGraphML()

  // displays tooltips for the stored data items, so that something is visible to the user
  setupTooltips()
}

/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph: IGraph, graphData: JSONGraph): void {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder.createNodesSource({
    data: graphData.nodeList.filter(item => !item.isGroup),
    id: item => item.id,
    parentId: item => item.parentId
  })

  graphBuilder
    .createGroupNodesSource({
      data: graphData.nodeList.filter(item => item.isGroup),
      id: item => item.id
    })
    .nodeCreator.createLabelBinding(item => item.label)

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: item => item.source,
    targetId: item => item.target
  })

  graphBuilder.buildGraph()
}

/**
 * Sets up simple data binding - creates an IMapper, registers it and subscribe to the node creation event
 * on the graph.
 */
function enableDataBinding(): void {
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
  graph.addNodeCreatedListener((_, evt): void => {
    // Stores the current time as node creation time.
    dateMapper.set(evt.item, new Date())
  })
}

/**
 * Enables loading and saving the graph to GraphML.
 */
function enableGraphML(): void {
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
 */
function createGraphMLIOHandler(): GraphMLIOHandler {
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
      (args: object, e: any): void => {
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
      (element: Element): boolean => GraphMLIOHandler.matchesName(element, DATE_TIME_MAPPER_KEY),
      dateMapper,
      (sender: object, e: any): void => {
        // The actual value is a text node that can be retrieved from the event
        try {
          const stringValue = e.xmlNode.textContent
          e.result = JSON.parse(stringValue, (key: string, val: any): any => new Date(val))
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
 * the {@link MouseHoverInputMode.addQueryToolTipListener QueryToolTip} event of the
 * GraphEditorInputMode using the
 * {@link ToolTipQueryEventArgs} parameter.
 * The {@link ToolTipQueryEventArgs} parameter provides three relevant properties:
 * Handled, QueryLocation, and ToolTip. The Handled property is a flag which indicates
 * whether the tooltip was already set by one of possibly several tooltip providers. The
 * QueryLocation property contains the mouse position for the query in world coordinates.
 * The tooltip is set by setting the ToolTip property.
 */
function setupTooltips(): void {
  const graphEditorInputMode = graphComponent.inputMode as GraphEditorInputMode
  graphEditorInputMode.toolTipItems = GraphItemTypes.NODE
  graphEditorInputMode.addQueryItemToolTipListener((_, evt): void => {
    if (evt.handled) {
      // Tooltip content has already been assigned -> nothing to do.
      return
    }
    const item = evt.item
    if (INode.isInstance(item)) {
      const dateMapper = graphComponent.graph.mapperRegistry.getMapper<INode, Date>(
        DATE_TIME_MAPPER_KEY
      )
      if (dateMapper !== null && dateMapper.get(item)) {
        // Found a suitable mapper. Set the tooltip content.
        evt.toolTip = dateMapper.get(item)!.toLocaleString()
        // Indicate that the tooltip content has been set.
        evt.handled = true
      }
    }
  })

  // Add a little offset to the tooltip such that it is not obscured by the mouse pointer.
  graphEditorInputMode.mouseHoverInputMode.toolTipLocationOffset = new Point(20, 20)
}

/**
 * Initializes the defaults for the styling in this tutorial.
 *
 * @param graph The graph.
 */
function initTutorialDefaults(graph: IGraph): void {
  // set styles that are the same for all tutorials
  initDemoStyles(graph)

  // set the style, label and label parameter for group nodes
  graph.groupNodeDefaults.style = new GroupNodeStyle({
    tabFill: '#042d37',
    tabBackgroundFill: '#9dc6d0',
    tabPosition: 'top-trailing',
    stroke: '2px solid #9dc6d0',
    cornerRadius: 10
  })
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'left',
    textFill: '#042d37'
  })
  graph.groupNodeDefaults.labels.layoutParameter =
    new GroupNodeLabelModel().createTabBackgroundParameter()

  // set sizes and locations specific for this tutorial
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 5
  }).createParameter('south')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}

run().then(finishLoading)
