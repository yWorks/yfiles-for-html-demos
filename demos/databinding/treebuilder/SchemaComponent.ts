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
  Arrow,
  ArrowType,
  CreateEdgeInputMode,
  Cursor,
  DefaultLabelStyle,
  DefaultPortCandidate,
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
  INode,
  INodeStyle,
  LabelEventArgs,
  MouseEventRecognizers,
  NinePositionsEdgeLabelModel,
  PolylineEdgeStyle,
  PortCalculator,
  PortConstraint,
  PortSide,
  ShapeNodeStyle,
  Size,
  StringTemplateNodeStyle,
  TimeSpan,
  TreeBuilder,
  TreeNodesSource,
  VoidNodeStyle
} from 'yfiles'
import {
  createBinding,
  parseData,
  TreeNodesSourceDefinition,
  TreeNodesSourceDefinitionBuilderConnector
} from './ModelClasses'
import { EditTreeNodesSourceDialog } from './EditTreeNodeSourceDialog'
import { DemoEdgeStyle } from '../../resources/demo-styles'
import { ContentRectViewportLimiter } from './ContentRectViewportLimiter'
import { addClass } from '../../resources/demo-app'

type SchemaEdge = { parentSource: string; childSource: string; childBinding: string }

/**
 * Tree builder sample data
 */
interface TreeBuilderSample {
  name: string
  nodesSources: TreeNodesSourceDefinition[]
  edgesSource: SchemaEdge[]
}

/**
 * Schema component for building a graph using the {@link TreeBuilder}.
 * Displays a schema graph and builds the result graph from data contained
 * in the schema graph.
 */
export class SchemaComponent {
  public treeBuilder: TreeBuilder
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

    this.treeBuilder = new TreeBuilder(graph)

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
    edgeDefaults.style = new PolylineEdgeStyle({
      stroke: '3px #BBBBBB',
      targetArrow: new Arrow({
        fill: '#BBBBBB',
        type: ArrowType.TRIANGLE
      }),
      smoothingLength: 15
    })
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
      this.createNewTreeNodesSource(evt.item, true)
      // noinspection JSIgnoredPromiseFromCall
      this.applySchemaLayout()
    })

    // create the relationship in the TreeBuilder and layout the graph
    inputMode.createEdgeInputMode.addEdgeCreatedListener((sender, evt) => {
      this.createChildRelationship('children', evt.item)
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
          const sourceConnector = hitNode.tag as TreeNodesSourceDefinitionBuilderConnector
          evt.toolTip = SchemaComponent.createToolTip(sourceConnector)

          // Indicate that the toolTip has been set.
          evt.handled = true
        }
      }
    })
    return inputMode
  }

  /**
   * Creates the tooltip content for a node
   * @param sourceConnector the {@link TreeNodesSourceDefinitionBuilderConnector} to get the data from
   */
  private static createToolTip(
    sourceConnector: TreeNodesSourceDefinitionBuilderConnector
  ): HTMLElement {
    const toolTip = document.createElement('div')
    addClass(toolTip, 'toolTip')

    const title = document.createElement('b')
    title.innerHTML = 'Data'
    toolTip.appendChild(title)

    const data = document.createElement('pre')
    data.innerHTML = sourceConnector.sourceDefinition.data || 'Child nodes source'
    toolTip.appendChild(data)
    return toolTip
  }

  /**
   * Builds the schema graph using the provided {@link TreeBuilderSample}
   * @param sample the sample data used for the graphs
   */
  loadSample(sample: TreeBuilderSample): void {
    this.schemaGraphComponent.graph.clear()
    this.treeBuilder = new TreeBuilder(this.resultGraph)

    const schemaGraphBuilder = new GraphBuilder(this.schemaGraphComponent.graph)
    const schemaNodesSource = schemaGraphBuilder.createNodesSource(sample.nodesSources, n => n.name)

    schemaNodesSource.nodeCreator.createLabelBinding(n => n.name)

    schemaNodesSource.nodeCreator.tagProvider = (
      sourceDefinition
    ): TreeNodesSourceDefinitionBuilderConnector =>
      this.createTreeNodesSourceConnector(sourceDefinition)

    schemaNodesSource.nodeCreator.styleProvider = (data): INodeStyle =>
      SchemaComponent.createSchemaNodeStyle(data)

    const schemaEdgesSource = schemaGraphBuilder.createEdgesSource(
      sample.edgesSource,
      e => e.parentSource,
      e => e.childSource
    )
    schemaEdgesSource.edgeCreator.addEdgeCreatedListener((sender, evt) => {
      this.createChildRelationship(evt.dataItem.childBinding, evt.item)
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
    const treeNodesSourcesDefinitions = Array<TreeNodesSourceDefinition>()
    schemaGraph.nodes.forEach((node: INode) => {
      const sourceConnector = node.tag as TreeNodesSourceDefinitionBuilderConnector
      treeNodesSourcesDefinitions.push(sourceConnector.sourceDefinition)
    })

    // gather remaining edge definitions
    const edgesSourceDefinitions = Array<SchemaEdge>()
    schemaGraph.edges.forEach((edge: IEdge) => {
      const sourceConnector = edge.sourceNode!.tag as TreeNodesSourceDefinitionBuilderConnector
      const targetConnector = edge.targetNode!.tag as TreeNodesSourceDefinitionBuilderConnector

      const schemaEdge: SchemaEdge = {
        parentSource: sourceConnector.sourceDefinition.name,
        childSource: targetConnector.sourceDefinition.name,
        childBinding: edge.tag.provider
      }
      edgesSourceDefinitions.push(schemaEdge)
    })

    const treeBuilderSample: TreeBuilderSample = {
      name: 'empty',
      nodesSources: treeNodesSourcesDefinitions,
      edgesSource: edgesSourceDefinitions
    }

    this.resultGraph.clear()

    this.loadSample(treeBuilderSample)
    this.schemaChanged()
  }

  /**
   * Creates the child relations between to schema graph nodes connected by an edge.
   * @param childDataProvider the binding string for the child relation
   * @param edge the edge to connecting the nodes with child relations
   */
  private createChildRelationship(childDataProvider: string, edge: IEdge): void {
    const sourceConnector = edge.sourceNode!.tag as TreeNodesSourceDefinitionBuilderConnector
    const targetConnector = edge.targetNode!.tag as TreeNodesSourceDefinitionBuilderConnector

    edge.tag = { provider: childDataProvider, binding: createBinding(childDataProvider) }

    sourceConnector.nodesSource.addChildNodesSource(
      dataItem => edge.tag.binding(dataItem),
      targetConnector.nodesSource
    )

    const labelModel = new FreeEdgeLabelModel()
    this.schemaGraphComponent.graph.addLabel(
      edge,
      childDataProvider,
      labelModel.createDefaultParameter()
    )
  }

  /**
   * Creates a new {@link TreeNodesSourceDefinition} for use in the schema graph
   * @param node the schema graph node to attach the definition to
   * @param isRoot whether the schema graph node is a root node or not
   */
  private createNewTreeNodesSource(node: INode, isRoot: boolean): void {
    const treeNodesSourceDefinition = new TreeNodesSourceDefinition()
    treeNodesSourceDefinition.name = `Source ${this.newNodesSourcesCounter++}`
    treeNodesSourceDefinition.data = isRoot ? "[{ id: 'A', children: [{id: 'B'}, {id: 'C'}] }]" : ''
    treeNodesSourceDefinition.idBinding = 'dataItem => dataItem'
    treeNodesSourceDefinition.template = `<rect fill="#ff6c00" stroke="white" rx="2" ry="2" width="{TemplateBinding width}" height="{TemplateBinding height}"></rect>
<text transform="translate(10 20)" data-content="{Binding id}" style="font-size:18px; fill:#000;"></text>`
    node.tag = this.createTreeNodesSourceConnector(treeNodesSourceDefinition)
    this.schemaGraphComponent.graph.addLabel(node, treeNodesSourceDefinition.name)

    this.setSchemaNodeStyle(node)
  }

  /**
   * Creates a {@link TreeNodesSourceDefinitionBuilderConnector} for a {@link TreeNodesSourceDefinition}
   * @param sourceDefinition the TreeNodesSourceDefinition to create the connector for
   */
  private createTreeNodesSourceConnector(
    sourceDefinition: TreeNodesSourceDefinition
  ): TreeNodesSourceDefinitionBuilderConnector {
    const data = SchemaComponent.isRootNodesSourceDefinition(sourceDefinition)
      ? parseData(sourceDefinition.data)
      : []
    const nodesSource: TreeNodesSource<any> = this.treeBuilder.createRootNodesSource(data)

    const nodeCreator = nodesSource.nodeCreator
    nodeCreator.defaults.style = new StringTemplateNodeStyle(sourceDefinition.template)
    nodesSource.nodeCreator.defaults.size = new Size(150, 60)
    nodesSource.nodeCreator.addNodeUpdatedListener((sender, evt) => {
      nodeCreator.updateTag(evt.graph, evt.item, evt.dataItem)
      evt.graph.setStyle(evt.item, nodeCreator.defaults.style)
    })
    nodesSource.parentEdgeCreator.defaults.style = new DemoEdgeStyle()

    return new TreeNodesSourceDefinitionBuilderConnector(
      sourceDefinition,
      nodesSource,
      this.treeBuilder
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
   * Opens the {@link EditTreeNodesSourceDialog} for editing a schema nodes' business data
   * @param schemaNode the schema node to edit
   */
  private openEditNodeSourceDialog(schemaNode: INode): void {
    const sourceDefinitionConnector = schemaNode.tag as TreeNodesSourceDefinitionBuilderConnector
    // noinspection JSIgnoredPromiseFromCall
    new EditTreeNodesSourceDialog(sourceDefinitionConnector, () => {
      this.schemaGraphComponent.graph.setLabelText(
        schemaNode.labels.first(),
        sourceDefinitionConnector.sourceDefinition.name
      )
      this.setSchemaNodeStyle(schemaNode)
      this.schemaChanged()
    }).show()
  }

  /**
   * Returns whether a {@link TreeNodesSourceDefinition} represents a root node or not.
   * A root node definition sources' data is non empty
   * @param nodesSourceDefinition
   */
  private static isRootNodesSourceDefinition(
    nodesSourceDefinition: TreeNodesSourceDefinition
  ): boolean {
    return !!nodesSourceDefinition.data && nodesSourceDefinition.data.length > 0
  }

  /**
   * Configures the given {@link CreateEdgeInputMode} to be able to finish the gesture on an empty
   * canvas with a newly created node.
   * @param {CreateEdgeInputMode} createEdgeInputMode
   */
  private enableTargetNodeCreation(createEdgeInputMode: CreateEdgeInputMode): void {
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
      this.createNewTreeNodesSource(node, false)

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
   * Root nodes have a different style than non-root nodes (octagon vs. circle)
   * @param node the node to set the style for
   */
  private setSchemaNodeStyle(node: INode): void {
    this.schemaGraphComponent.graph.setStyle(
      node,
      SchemaComponent.createSchemaNodeStyle(
        (node.tag as TreeNodesSourceDefinitionBuilderConnector).sourceDefinition
      )
    )
  }

  private static createSchemaNodeStyle(
    nodesSourceDefinition: TreeNodesSourceDefinition
  ): INodeStyle {
    if (SchemaComponent.isRootNodesSourceDefinition(nodesSourceDefinition)) {
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
