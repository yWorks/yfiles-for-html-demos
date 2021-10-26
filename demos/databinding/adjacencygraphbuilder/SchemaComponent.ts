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
} from './ModelClasses'
import { EditAdjacencyNodesSourceDialog } from './EditAdjacencyNodeSourceDialog'
import { DemoEdgeStyle } from '../../resources/demo-styles'
import { ContentRectViewportLimiter } from './ContentRectViewportLimiter'
import { addClass } from '../../resources/demo-app'
import { FlippedArrow } from './FlippedArrow'
import ContextMenu from '../../utils/ContextMenu'

type NeighborType = 'successor' | 'predecessor'

type SchemaEdge = {
  neighborType: NeighborType
  thisSource: string
  neighborSource: string
  neighborBinding: string
}

/**
 * Adjacency graph builder sample data
 */
interface AdjacencyGraphBuilderSample {
  name: string
  nodesSources: AdjacencyNodesSourceDefinition[]
  edgesSource: SchemaEdge[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DataItemType = any
type DataType = DataItemType[] | Record<string, DataItemType>

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
  public adjacencyGraphBuilder: AdjacencyGraphBuilder
  private readonly edgeCreator: EdgeCreator<DataItemType>
  private readonly resultGraph: IGraph
  private readonly schemaGraphComponent: GraphComponent

  private newNodesSourcesCounter: number
  private readonly schemaChangedCallback: () => void

  constructor(selector: string, graph: IGraph, schemaChangedCallback: () => void) {
    this.resultGraph = graph
    this.schemaChangedCallback = schemaChangedCallback

    this.schemaGraphComponent = new GraphComponent(selector)
    this.configureSchemaStyles()

    this.schemaGraphComponent.inputMode = this.configureInputMode(this.schemaGraphComponent.graph)
    this.schemaGraphComponent.viewportLimiter = new ContentRectViewportLimiter()

    this.adjacencyGraphBuilder = new AdjacencyGraphBuilder(graph)
    this.edgeCreator = new EdgeCreator<DataItemType>()
    this.edgeCreator.defaults.style = new DemoEdgeStyle()

    this.newNodesSourcesCounter = 1
  }

  /**
   * Updates the content rectangle on schema changes and calls the
   * schemaChangedCallback
   */
  private schemaChanged(): void {
    this.schemaGraphComponent.updateContentRect()
    this.schemaChangedCallback()
  }

  /**
   * Configures the style of the schema graph nodes and edges
   */
  private configureSchemaStyles(): void {
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
   */
  private configureInputMode(graph: IGraph): IInputMode {
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

      const graphComponent = evt.context.canvasComponent as GraphComponent
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
          const sourceConnector = hitNode.tag as AdjacencyNodesSourceDefinitionBuilderConnector
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
   */
  setupEdgeContextMenu(inputMode: GraphEditorInputMode): void {
    const graphComponent = this.schemaGraphComponent
    inputMode.contextMenuItems = GraphItemTypes.EDGE

    const contextMenu = new ContextMenu(graphComponent)

    contextMenu.addOpeningEventListeners(graphComponent, (location: Point): void => {
      const worldLocation = graphComponent.toWorldFromPage(location)
      const showMenu = inputMode.contextMenuInputMode.shouldOpenMenu(worldLocation)
      if (showMenu) {
        contextMenu.show(location)
      }
    })

    // Add item-specific menu entries
    inputMode.addPopulateItemContextMenuListener(
      (sender: object, args: PopulateItemContextMenuEventArgs<IModelItem>): void => {
        contextMenu.clearItems()
        if (IEdge.isInstance(args.item)) {
          args.showMenu = true

          const edge = args.item
          contextMenu.addMenuItem('Invert neighbor type (successor/predecessor)', (): void => {
            edge.tag.neighborType =
              edge.tag.neighborType === 'predecessor' ? 'successor' : 'predecessor'
            this.recreateGraph()
          })
        }
      }
    )

    // Add a listener that closes the menu when the input mode requests this
    inputMode.contextMenuInputMode.addCloseMenuListener((): void => {
      contextMenu.close()
    })

    // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
    contextMenu.onClosedCallback = (): void => {
      inputMode.contextMenuInputMode.menuClosed()
    }
  }

  /**
   * Creates the tooltip content for a node
   * @param sourceConnector the {@link AdjacencyNodesSourceDefinitionBuilderConnector} to get the data from
   */
  private static createToolTip(
    sourceConnector: AdjacencyNodesSourceDefinitionBuilderConnector
  ): HTMLElement {
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
   * @param sample the sample data used for the graphs
   */
  loadSample(sample: AdjacencyGraphBuilderSample): void {
    this.schemaGraphComponent.graph.clear()
    this.adjacencyGraphBuilder = new AdjacencyGraphBuilder(this.resultGraph)

    const schemaGraphBuilder = new GraphBuilder(this.schemaGraphComponent.graph)
    const schemaNodesSource = schemaGraphBuilder.createNodesSource(sample.nodesSources, n => n.name)

    schemaNodesSource.nodeCreator.createLabelBinding(n => n.name)

    schemaNodesSource.nodeCreator.tagProvider = (
      sourceDefinition
    ): AdjacencyNodesSourceDefinitionBuilderConnector =>
      this.createAdjacencyNodesSourceConnector(sourceDefinition)

    schemaNodesSource.nodeCreator.styleProvider = (data): INodeStyle =>
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
  recreateGraph(): void {
    const schemaGraph = this.schemaGraphComponent.graph

    // gather remaining source definitions
    const adjacencyNodesSourcesDefinitions: AdjacencyNodesSourceDefinition[] = []
    schemaGraph.nodes.forEach((node: INode) => {
      const sourceConnector = node.tag as AdjacencyNodesSourceDefinitionBuilderConnector
      adjacencyNodesSourcesDefinitions.push(sourceConnector.sourceDefinition)
    })

    // gather remaining edge definitions
    const edgesSourceDefinitions: SchemaEdge[] = []
    schemaGraph.edges.forEach((edge: IEdge) => {
      const sourceConnector = edge.sourceNode!.tag as AdjacencyNodesSourceDefinitionBuilderConnector
      const targetConnector = edge.targetNode!.tag as AdjacencyNodesSourceDefinitionBuilderConnector

      const schemaEdge: SchemaEdge = {
        thisSource: sourceConnector.sourceDefinition.name,
        neighborSource: targetConnector.sourceDefinition.name,
        neighborBinding: edge.tag.provider,
        neighborType: edge.tag.neighborType
      }
      edgesSourceDefinitions.push(schemaEdge)
    })

    const adjacencyGraphBuilderSample: AdjacencyGraphBuilderSample = {
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
   * @param neighborDataProvider the binding string for the neighbor relation
   * @param edge the edge to connecting the nodes with neighbor relations
   * @param neighborType whether to add the source as successor or predecessor
   */
  private createNeighborRelationship(
    neighborDataProvider: string,
    edge: IEdge,
    neighborType: NeighborType
  ): void {
    const sourceConnector = edge.sourceNode!.tag as AdjacencyNodesSourceDefinitionBuilderConnector
    const targetConnector = edge.targetNode!.tag as AdjacencyNodesSourceDefinitionBuilderConnector

    edge.tag = {
      provider: neighborDataProvider,
      binding: createBinding(neighborDataProvider),
      neighborType
    }

    const neighborProvider = (dataItem: DataItemType): DataType => edge.tag.binding(dataItem)
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
   * @param node the schema graph node to attach the definition to
   */
  private createNewAdjacencyNodesSource(node: INode): void {
    const adjacencyNodesSourceDefinition = new AdjacencyNodesSourceDefinition()
    adjacencyNodesSourceDefinition.name = `Source ${this.newNodesSourcesCounter++}`
    adjacencyNodesSourceDefinition.data = ''
    adjacencyNodesSourceDefinition.idBinding = 'dataItem => dataItem'
    adjacencyNodesSourceDefinition.template = `<rect fill='#ff6c00' stroke='#662b00' stroke-width='1.5' rx='3.5' ry='3.5' width="{TemplateBinding width}" height="{TemplateBinding height}"></rect>
<text transform="translate(10 20)" data-content="{Binding id}" style="font-size:18px; fill:#000;"></text>`
    node.tag = this.createAdjacencyNodesSourceConnector(adjacencyNodesSourceDefinition)
    this.schemaGraphComponent.graph.addLabel(node, adjacencyNodesSourceDefinition.name)

    this.setSchemaNodeStyle(node)
  }

  /**
   * Creates a {@link AdjacencyNodesSourceDefinitionBuilderConnector} for a {@link AdjacencyNodesSourceDefinition}
   * @param sourceDefinition the AdjacencyNodesSourceDefinition to create the connector for
   */
  private createAdjacencyNodesSourceConnector(
    sourceDefinition: AdjacencyNodesSourceDefinition
  ): AdjacencyNodesSourceDefinitionBuilderConnector {
    const data = SchemaComponent.hasData(sourceDefinition) ? parseData(sourceDefinition.data) : []
    const nodesSource: AdjacencyNodesSource<DataItemType> =
      this.adjacencyGraphBuilder.createNodesSource(data)

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
   */
  private async applySchemaLayout(): Promise<void> {
    const layout = new HierarchicLayout({
      considerNodeLabels: true,
      integratedEdgeLabeling: true,
      backLoopRoutingForSelfLoops: true
    })
    await this.schemaGraphComponent.morphLayout(new PortCalculator(layout))
    this.schemaGraphComponent.updateContentRect()
  }

  /**
   * Opens the {@link EditAdjacencyNodesSourceDialog} for editing a schema nodes' business data
   * @param schemaNode the schema node to edit
   */
  private openEditNodeSourceDialog(schemaNode: INode): void {
    const sourceDefinitionConnector =
      schemaNode.tag as AdjacencyNodesSourceDefinitionBuilderConnector
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
   * @param nodesSourceDefinition
   */
  private static hasData(nodesSourceDefinition: AdjacencyNodesSourceDefinition): boolean {
    return !!nodesSourceDefinition.data && nodesSourceDefinition.data.length > 0
  }

  /**
   * Configures the given {@link CreateEdgeInputMode} to be able to finish the gesture on an empty
   * canvas with a newly created node.
   * @param {CreateEdgeInputMode} createEdgeInputMode
   */
  private enableTargetNodeCreation(createEdgeInputMode: CreateEdgeInputMode): void {
    createEdgeInputMode.dummyEdgeGraph.nodeDefaults.size =
      this.schemaGraphComponent.graph.nodeDefaults.size

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
    ): IEdge | null => {
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
   * @param node the node to set the style for
   */
  private setSchemaNodeStyle(node: INode): void {
    this.schemaGraphComponent.graph.setStyle(
      node,
      SchemaComponent.createSchemaNodeStyle(
        (node.tag as AdjacencyNodesSourceDefinitionBuilderConnector).sourceDefinition
      )
    )
  }

  /**
   * Creates a new {@link INodeStyle} depending on the nodesSourceDefinition.
   */
  private static createSchemaNodeStyle(
    nodesSourceDefinition: AdjacencyNodesSourceDefinition
  ): INodeStyle {
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
