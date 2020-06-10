/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  AdjacencyGraphBuilder,
  AdjacencyNodesSource,
  Arrow,
  ArrowType,
  CreateEdgeInputMode,
  Cursor,
  DefaultLabelStyle,
  DefaultPortCandidate,
  EdgeCreator,
  FreeEdgeLabelModel,
  FreeNodePortLocationModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HierarchicLayout,
  HierarchicLayoutData,
  IEdge,
  IGraph,
  IHitTestable,
  IInputMode,
  ILabel,
  IModelItem,
  INode,
  INodeStyle,
  LabelEventArgs,
  MouseButtons,
  MouseEventRecognizers,
  NinePositionsEdgeLabelModel,
  Point,
  PolylineEdgeStyle,
  PopulateItemContextMenuEventArgs,
  PortCalculator,
  PortConstraint,
  PortSide,
  ShapeNodeStyle,
  Size,
  StringTemplateNodeStyle,
  TimeSpan,
  VoidNodeStyle
} from 'yfiles'
import {
  AdjacencyNodesSourceDefinition,
  AdjacencyNodesSourceDefinitionBuilderConnector,
  createBinding,
  parseData
} from './ModelClasses.js'
import { EditAdjacencyNodesSourceDialog } from './EditAdjacencyNodeSourceDialog.js'
import { DemoEdgeStyle } from '../../resources/demo-styles.js'
import { ContentRectViewportLimiter } from './ContentRectViewportLimiter.js'
import { addClass } from '../../resources/demo-app.js'
import { FlippedArrow } from './FlippedArrow.js'
import ContextMenu from '../../utils/ContextMenu.js'

/**
 * @typedef {('successor' | 'predecessor')} NeighborType
 */

/**
 * @typedef {Object} AdjacencyGraphBuilderSample
 * @property {string} name
 * @property {Array.<AdjacencyNodesSourceDefinition>} nodesSources
 * @property {Array.<SchemaEdge>} edgesSource
 */

const arrow = new Arrow({
  fill: '#BBBBBB',
  type: ArrowType.TRIANGLE,
  scale: 1.5,
  cropLength: 2
})
const successorEdgeStyle = new PolylineEdgeStyle({
  stroke: '3px #BBBBBB',
  sourceArrow: new FlippedArrow(arrow, 1),
  smoothingLength: 15
})
const predecessorEdgeStyle = new PolylineEdgeStyle({
  stroke: '3px #BBBBBB',
  sourceArrow: arrow,
  smoothingLength: 15
})

/**
 * Schema component for building a graph using the {@link AdjacencyGraphBuilder}.
 * Displays a schema graph and builds the result graph from data contained
 * in the schema graph.
 */
export class SchemaComponent {
  /**
   * @param {string} selector
   * @param {IGraph} graph
   * @param {function} schemaChangedCallback
   */
  constructor(selector, graph, schemaChangedCallback) {
    this.resultGraph = graph
    this.schemaChangedCallback = schemaChangedCallback

    this.schemaGraphComponent = new GraphComponent(selector)
    this.configureSchemaStyles()

    this.schemaGraphComponent.inputMode = this.configureInputMode(this.schemaGraphComponent.graph)
    this.schemaGraphComponent.viewportLimiter = new ContentRectViewportLimiter()

    this.adjacencyGraphBuilder = new AdjacencyGraphBuilder(graph)
    this.edgeCreator = new EdgeCreator()
    this.edgeCreator.defaults.style = new DemoEdgeStyle()

    this.newNodesSourcesCounter = 1
  }

  /**
   * Updates the content rectangle on schema changes and calls the
   * schemaChangedCallback
   */
  schemaChanged() {
    this.schemaGraphComponent.updateContentRect()
    this.schemaChangedCallback()
  }

  /**
   * Configures the style of the schema graph nodes and edges
   */
  configureSchemaStyles() {
    const nodeDefaults = this.schemaGraphComponent.graph.nodeDefaults
    nodeDefaults.size = new Size(50, 50)
    nodeDefaults.labels.style = new DefaultLabelStyle({
      backgroundFill: 'rgba(255,255,255,0.7)',
      insets: [2, 5]
    })
    const edgeDefaults = this.schemaGraphComponent.graph.edgeDefaults
    edgeDefaults.style = successorEdgeStyle
    edgeDefaults.labels.style = new DefaultLabelStyle({
      backgroundFill: 'white',
      textFill: '#555555',
      insets: 2
    })
    edgeDefaults.labels.layoutParameter = NinePositionsEdgeLabelModel.CENTER_CENTERED
  }

  /**
   * Configures the input mode of the schema graph
   * @param {IGraph} graph
   * @returns {IInputMode}
   */
  configureInputMode(graph) {
    const inputMode = new GraphEditorInputMode()

    inputMode.clickableItems = GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.EDGE_LABEL
    inputMode.selectableItems =
      GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.EDGE_LABEL
    inputMode.labelEditableItems = GraphItemTypes.EDGE
    inputMode.showHandleItems = GraphItemTypes.NONE
    inputMode.focusableItems = GraphItemTypes.NONE
    inputMode.movableItems = GraphItemTypes.NONE
    inputMode.allowCreateBend = false

    // configure the tooltips
    inputMode.mouseHoverInputMode.delay = TimeSpan.from('0.5s')
    inputMode.mouseHoverInputMode.duration = TimeSpan.from('5m')

    // the pointer cursor should be shown when hovering over certain graph items to indicate their clickable
    inputMode.itemHoverInputMode.enabled = true
    inputMode.itemHoverInputMode.hoverItems =
      GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.EDGE_LABEL
    inputMode.itemHoverInputMode.hoverCursor = Cursor.POINTER

    // easily move viewport and create new edges when dragging on another node
    inputMode.marqueeSelectionInputMode.enabled = false
    inputMode.moveViewportInputMode.pressedRecognizer = MouseEventRecognizers.LEFT_DOWN
    inputMode.moveViewportInputMode.priority = inputMode.createEdgeInputMode.priority + 1
    this.enableTargetNodeCreation(inputMode.createEdgeInputMode)

    // start label edit when an edge or edge label is clicked
    inputMode.addItemClickedListener((sender, evt) => {
      if ((evt.mouseButtons & MouseButtons.LEFT) === 0) {
        return
      }

      const graphComponent = evt.context.canvasComponent
      if (IEdge.isInstance(evt.item)) {
        evt.handled = true
        const edge = evt.item
        graphComponent.selection.setSelected(edge, true)

        if (edge.labels.size === 0) {
          // noinspection JSIgnoredPromiseFromCall
          inputMode.addLabel(edge)
        } else {
          // noinspection JSIgnoredPromiseFromCall
          inputMode.editLabel(edge.labels.get(0))
        }
      } else if (ILabel.isInstance(evt.item) && IEdge.isInstance(evt.item.owner)) {
        evt.handled = true
        graphComponent.selection.setSelected(evt.item.owner, true)
        // noinspection JSIgnoredPromiseFromCall
        inputMode.editLabel(evt.item)
      }
    })

    // open node dialog when a node is double clicked
    inputMode.addItemDoubleClickedListener((sender, evt) => {
      if (INode.isInstance(evt.item)) {
        evt.handled = true
        this.openEditNodeSourceDialog(evt.item)
      }
    })

    // create a new nodes source and layout the graph
    inputMode.addNodeCreatedListener((sender, evt) => {
      this.createNewAdjacencyNodesSource(evt.item)
      // noinspection JSIgnoredPromiseFromCall
      this.applySchemaLayout()
    })

    // create the relationship in the AdjacencyGraphBuilder and layout the graph
    inputMode.createEdgeInputMode.addEdgeCreatedListener((sender, evt) => {
      this.createNeighborRelationship('successors', evt.item, 'successor')
      // noinspection JSIgnoredPromiseFromCall
      this.applySchemaLayout()
    })

    // update the schema
    inputMode.addLabelTextChangedListener((sender, evt) => {
      if (IEdge.isInstance(evt.owner)) {
        evt.owner.tag.provider = evt.item.text
        evt.owner.tag.binding = createBinding(evt.item.text)
        this.schemaChanged()
      }
    })

    // remove edge when label was removed, recreate graph on all removals
    inputMode.addDeletedItemListener((sender, evt) => {
      if (LabelEventArgs.isInstance(evt)) {
        if (evt.owner) {
          graph.remove(evt.owner)
        }
      }
      this.recreateGraph()
    })

    // create Tooltips for node data
    inputMode.addQueryItemToolTipListener((src, evt) => {
      if (evt.handled) {
        // A tooltip has already been assigned => nothing to do.
        return
      }

      if (INode.isInstance(evt.item)) {
        const hitNode = evt.item
        if (hitNode.labels.size > 0) {
          const sourceConnector = hitNode.tag
          evt.toolTip = SchemaComponent.createToolTip(sourceConnector)

          // Indicate that the toolTip has been set.
          evt.handled = true
        }
      }
    })

    // set up the edge context menu that allows to invert the edge type
    this.setupEdgeContextMenu(inputMode)

    return inputMode
  }

  /**
   * Initializes the context menu for schema edges.
   * @param {GraphEditorInputMode} inputMode
   */
  setupEdgeContextMenu(inputMode) {
    const graphComponent = this.schemaGraphComponent
    inputMode.contextMenuItems = GraphItemTypes.EDGE

    const contextMenu = new ContextMenu(graphComponent)

    contextMenu.addOpeningEventListeners(graphComponent, location => {
      const worldLocation = graphComponent.toWorldFromPage(location)
      const showMenu = inputMode.contextMenuInputMode.shouldOpenMenu(worldLocation)
      if (showMenu) {
        contextMenu.show(location)
      }
    })

    // Add item-specific menu entries
    inputMode.addPopulateItemContextMenuListener((sender, args) => {
      contextMenu.clearItems()
      if (IEdge.isInstance(args.item)) {
        args.showMenu = true

        const edge = args.item
        contextMenu.addMenuItem('Invert neighbor type (successor/predecessor)', () => {
          edge.tag.neighborType =
            edge.tag.neighborType === 'predecessor' ? 'successor' : 'predecessor'
          this.recreateGraph()
        })
      }
    })

    // Add a listener that closes the menu when the input mode requests this
    inputMode.contextMenuInputMode.addCloseMenuListener(() => {
      contextMenu.close()
    })

    // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
    contextMenu.onClosedCallback = () => {
      inputMode.contextMenuInputMode.menuClosed()
    }
  }

  /**
   * Creates the tooltip content for a node
   * @param {AdjacencyNodesSourceDefinitionBuilderConnector} sourceConnector the
   *   {@link AdjacencyNodesSourceDefinitionBuilderConnector} to get the data from
   * @returns {HTMLElement}
   */
  static createToolTip(sourceConnector) {
    const toolTip = document.createElement('div')
    addClass(toolTip, 'toolTip')

    const title = document.createElement('b')
    title.innerHTML = 'Data'
    toolTip.appendChild(title)

    const data = document.createElement('pre')
    data.innerHTML = sourceConnector.sourceDefinition.data || '<i>No data</i>'
    toolTip.appendChild(data)
    return toolTip
  }

  /**
   * Builds the schema graph using the provided {@link AdjacencyGraphBuilderSample}
   * @param {AdjacencyGraphBuilderSample} sample the sample data used for the graphs
   */
  loadSample(sample) {
    this.schemaGraphComponent.graph.clear()
    this.adjacencyGraphBuilder = new AdjacencyGraphBuilder(this.resultGraph)

    const schemaGraphBuilder = new GraphBuilder(this.schemaGraphComponent.graph)
    const schemaNodesSource = schemaGraphBuilder.createNodesSource(sample.nodesSources, n => n.name)

    schemaNodesSource.nodeCreator.createLabelBinding(n => n.name)

    schemaNodesSource.nodeCreator.tagProvider = sourceDefinition =>
      this.createAdjacencyNodesSourceConnector(sourceDefinition)

    schemaNodesSource.nodeCreator.styleProvider = data =>
      SchemaComponent.createSchemaNodeStyle(data)

    const schemaEdgesSource = schemaGraphBuilder.createEdgesSource(
      sample.edgesSource,
      e => e.thisSource,
      e => e.neighborSource
    )
    schemaEdgesSource.edgeCreator.addEdgeCreatedListener((sender, evt) => {
      this.createNeighborRelationship(
        evt.dataItem.neighborBinding,
        evt.item,
        evt.dataItem.neighborType
      )
    })

    schemaGraphBuilder.buildGraph()

    this.applySchemaLayout()
  }

  /**
   * Completely recreates the graph in case of a schema entry deletion
   * This is necessary, as it is not possible to remove sources from
   * the graph builder.
   */
  recreateGraph() {
    const schemaGraph = this.schemaGraphComponent.graph

    // gather remaining source definitions
    const adjacencyNodesSourcesDefinitions = Array()
    schemaGraph.nodes.forEach(node => {
      const sourceConnector = node.tag
      adjacencyNodesSourcesDefinitions.push(sourceConnector.sourceDefinition)
    })

    // gather remaining edge definitions
    const edgesSourceDefinitions = Array()
    schemaGraph.edges.forEach(edge => {
      const sourceConnector = edge.sourceNode.tag
      const targetConnector = edge.targetNode.tag

      const schemaEdge = {
        thisSource: sourceConnector.sourceDefinition.name,
        neighborSource: targetConnector.sourceDefinition.name,
        neighborBinding: edge.tag.provider,
        neighborType: edge.tag.neighborType
      }
      edgesSourceDefinitions.push(schemaEdge)
    })

    const adjacencyGraphBuilderSample = {
      name: 'empty',
      nodesSources: adjacencyNodesSourcesDefinitions,
      edgesSource: edgesSourceDefinitions
    }

    this.resultGraph.clear()

    this.loadSample(adjacencyGraphBuilderSample)
    this.schemaChanged()
  }

  /**
   * Creates the neighbor relations between to schema graph nodes connected by an edge.
   * @param {string} neighborDataProvider the binding string for the neighbor relation
   * @param {IEdge} edge the edge to connecting the nodes with neighbor relations
   * @param {NeighborType} neighborType whether to add the source as successor or predecessor
   */
  createNeighborRelationship(neighborDataProvider, edge, neighborType) {
    const sourceConnector = edge.sourceNode.tag
    const targetConnector = edge.targetNode.tag

    edge.tag = {
      provider: neighborDataProvider,
      binding: createBinding(neighborDataProvider),
      neighborType
    }

    const neighborProvider = dataItem => edge.tag.binding(dataItem)
    const neighborSource = targetConnector.nodesSource

    if (neighborType === 'successor') {
      sourceConnector.nodesSource.addSuccessorsSource(
        neighborProvider,
        neighborSource,
        this.edgeCreator
      )
    } else {
      sourceConnector.nodesSource.addPredecessorsSource(
        neighborProvider,
        neighborSource,
        this.edgeCreator
      )
    }

    this.schemaGraphComponent.graph.setStyle(
      edge,
      edge.tag.neighborType === 'successor' ? successorEdgeStyle : predecessorEdgeStyle
    )

    const labelModel = new FreeEdgeLabelModel()
    this.schemaGraphComponent.graph.addLabel(
      edge,
      neighborDataProvider,
      labelModel.createDefaultParameter()
    )
  }

  /**
   * Creates a new {@link AdjacencyNodesSourceDefinition} for use in the schema graph
   * @param {INode} node the schema graph node to attach the definition to
   */
  createNewAdjacencyNodesSource(node) {
    const adjacencyNodesSourceDefinition = new AdjacencyNodesSourceDefinition()
    adjacencyNodesSourceDefinition.name = `Source ${this.newNodesSourcesCounter++}`
    adjacencyNodesSourceDefinition.data = ''
    adjacencyNodesSourceDefinition.idBinding = 'dataItem => dataItem'
    adjacencyNodesSourceDefinition.template = `<rect fill="#ff6c00" stroke="white" rx="2" ry="2" width="{TemplateBinding width}" height="{TemplateBinding height}"></rect>
<text transform="translate(10 20)" data-content="{Binding id}" style="font-size:18px; fill:#000;"></text>`
    node.tag = this.createAdjacencyNodesSourceConnector(adjacencyNodesSourceDefinition)
    this.schemaGraphComponent.graph.addLabel(node, adjacencyNodesSourceDefinition.name)

    this.setSchemaNodeStyle(node)
  }

  /**
   * Creates a {@link AdjacencyNodesSourceDefinitionBuilderConnector} for a
   * {@link AdjacencyNodesSourceDefinition}
   * @param {AdjacencyNodesSourceDefinition} sourceDefinition the AdjacencyNodesSourceDefinition to
   *   create the connector for
   * @returns {AdjacencyNodesSourceDefinitionBuilderConnector}
   */
  createAdjacencyNodesSourceConnector(sourceDefinition) {
    const data = SchemaComponent.hasData(sourceDefinition) ? parseData(sourceDefinition.data) : []
    const nodesSource = this.adjacencyGraphBuilder.createNodesSource(data)

    const nodeCreator = nodesSource.nodeCreator
    nodeCreator.defaults.style = new StringTemplateNodeStyle(sourceDefinition.template)
    nodesSource.nodeCreator.defaults.size = new Size(150, 60)
    nodesSource.nodeCreator.addNodeUpdatedListener((sender, evt) => {
      nodeCreator.updateTag(evt.graph, evt.item, evt.dataItem)
      evt.graph.setStyle(evt.item, nodeCreator.defaults.style)
    })

    return new AdjacencyNodesSourceDefinitionBuilderConnector(
      sourceDefinition,
      nodesSource,
      this.adjacencyGraphBuilder
    )
  }

  /**
   * Applies the layout for the schema graph component
   * @returns {Promise}
   */
  async applySchemaLayout() {
    const layoutData = new HierarchicLayoutData({
      sourcePortConstraints: () => PortConstraint.create(PortSide.NORTH),
      targetPortConstraints: () => PortConstraint.create(PortSide.SOUTH)
    })

    const layout = new HierarchicLayout({
      considerNodeLabels: true,
      integratedEdgeLabeling: true
    })
    await this.schemaGraphComponent.morphLayout(new PortCalculator(layout), null, layoutData)
    this.schemaGraphComponent.updateContentRect()
  }

  /**
   * Opens the {@link EditAdjacencyNodesSourceDialog} for editing a schema nodes' business data
   * @param {INode} schemaNode the schema node to edit
   */
  openEditNodeSourceDialog(schemaNode) {
    const sourceDefinitionConnector = schemaNode.tag
    // noinspection JSIgnoredPromiseFromCall
    new EditAdjacencyNodesSourceDialog(sourceDefinitionConnector, () => {
      this.schemaGraphComponent.graph.setLabelText(
        schemaNode.labels.first(),
        sourceDefinitionConnector.sourceDefinition.name
      )
      this.setSchemaNodeStyle(schemaNode)
      this.schemaChanged()
    }).show()
  }

  /**
   * Returns whether a {@link AdjacencyNodesSourceDefinition} has its own data or not.
   * @param {AdjacencyNodesSourceDefinition} nodesSourceDefinition
   * @returns {boolean}
   */
  static hasData(nodesSourceDefinition) {
    return !!nodesSourceDefinition.data && nodesSourceDefinition.data.length > 0
  }

  /**
   * Configures the given {@link CreateEdgeInputMode} to be able to finish the gesture on an empty
   * canvas with a newly created node.
   * @param {CreateEdgeInputMode} createEdgeInputMode
   * @param {CreateEdgeInputMode} createEdgeInputMode
   */
  enableTargetNodeCreation(createEdgeInputMode) {
    createEdgeInputMode.dummyEdgeGraph.nodeDefaults.size = this.schemaGraphComponent.graph.nodeDefaults.size

    // each edge creation should use another random target node color
    createEdgeInputMode.addGestureStartingListener(src => {
      const nodeStyle = new ShapeNodeStyle({
        shape: 'ellipse',
        fill: '#6495ED',
        stroke: 'white'
      })

      src.dummyEdgeGraph.nodeDefaults.style = nodeStyle
      src.dummyEdgeGraph.setStyle(src.dummyTargetNode, nodeStyle)
    })

    // If targeting another node during edge creation, the dummy target node should not be rendered
    // because we'd use that actual graph node as target if the gesture is finished on a node.
    createEdgeInputMode.addTargetPortCandidateChangedListener((src, args) => {
      const dummyEdgeGraph = createEdgeInputMode.dummyEdgeGraph
      if (args.item && INode.isInstance(args.item.owner)) {
        dummyEdgeGraph.setStyle(createEdgeInputMode.dummyTargetNode, VoidNodeStyle.INSTANCE)
      } else {
        dummyEdgeGraph.setStyle(
          createEdgeInputMode.dummyTargetNode,
          dummyEdgeGraph.nodeDefaults.style
        )
      }
    })

    // allow the create edge gesture to be finished anywhere, since we'll create a node if there is
    // no target node in the graph at the given location
    createEdgeInputMode.prematureEndHitTestable = IHitTestable.ALWAYS
    createEdgeInputMode.forceSnapToCandidate = false

    // create a new node if the gesture finishes on the empty canvas
    const edgeCreator = createEdgeInputMode.edgeCreator
    createEdgeInputMode.edgeCreator = (
      context,
      graph,
      sourcePortCandidate,
      targetPortCandidate,
      templateEdge
    ) => {
      if (targetPortCandidate) {
        // an actual graph node was hit
        return edgeCreator(context, graph, sourcePortCandidate, targetPortCandidate, templateEdge)
      }
      // we use the dummy target node to create a new node at the current location
      const dummyTargetNode = createEdgeInputMode.dummyTargetNode
      const node = this.schemaGraphComponent.graph.createNode(dummyTargetNode.layout)
      this.createNewAdjacencyNodesSource(node)

      return edgeCreator(
        context,
        graph,
        sourcePortCandidate,
        new DefaultPortCandidate(node, FreeNodePortLocationModel.NODE_CENTER_ANCHORED),
        templateEdge
      )
    }
  }

  /**
   * Sets the style for a node in the schema graph
   * Sources with own data have a different style than sources without (octagon vs. circle)
   * @param {INode} node the node to set the style for
   */
  setSchemaNodeStyle(node) {
    this.schemaGraphComponent.graph.setStyle(
      node,
      SchemaComponent.createSchemaNodeStyle(node.tag.sourceDefinition)
    )
  }

  /**
   * Creates a new {@link INodeStyle} depending on the nodesSourceDefinition.
   * @param {AdjacencyNodesSourceDefinition} nodesSourceDefinition
   * @returns {INodeStyle}
   */
  static createSchemaNodeStyle(nodesSourceDefinition) {
    if (SchemaComponent.hasData(nodesSourceDefinition)) {
      return new ShapeNodeStyle({
        shape: 'octagon',
        fill: '#6495ED',
        stroke: 'white'
      })
    } else {
      return new ShapeNodeStyle({
        shape: 'ellipse',
        fill: '#eee',
        stroke: '5px solid #6495ED'
      })
    }
  }
}
