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
  CompositeLabelModel,
  EdgeLabelPreferredPlacement,
  EdgePathLabelModel,
  EdgeSegmentLabelModel,
  EdgeSides,
  ExteriorNodeLabelModel,
  ExteriorNodeLabelModelPosition,
  FolderNodeConverter,
  FolderNodeDefaults,
  type FolderNodeState,
  FoldingEdgeConverter,
  type FoldingLabelDefaults,
  type FoldingManager,
  FoldingSynchronizationOptions,
  Font,
  FreeEdgeLabelModel,
  FreeNodeLabelModel,
  GenericLabeling,
  GenericLabelingData,
  HashMap,
  HorizontalTextAlignment,
  type ICollection,
  IColumn,
  type IEdge,
  type IEnumerable,
  type IFoldingView,
  type IGraph,
  type ILabel,
  type ILabelOwner,
  type IMap,
  INode,
  Insets,
  InsideOutsidePortLabelModel,
  type IPort,
  type IPortStyle,
  IRow,
  type IStripe,
  type ITable,
  ITagOwner,
  LabelAlongEdgePlacements,
  LabelEdgeSides,
  LabelStyle,
  List,
  OrientedRectangle,
  Point,
  Rect,
  SimpleLabel,
  SimpleNode,
  Size,
  StretchNodeLabelModel,
  TextDecorations,
  TextWrapping,
  VerticalTextAlignment
} from '@yfiles/yfiles'
import {
  ActivityNodeStyle,
  ActivityType,
  AnnotationNodeStyle,
  BpmnEdgeStyle,
  BpmnEdgeType,
  ChoreographyLabelModel,
  ChoreographyNodeStyle,
  ConversationNodeStyle,
  ConversationType,
  DataObjectNodeStyle,
  DataObjectType,
  DataStoreNodeStyle,
  EventCharacteristic,
  EventNodeStyle,
  EventPortStyle,
  EventType,
  GatewayNodeStyle,
  GatewayType,
  GroupNodeStyle,
  LoopCharacteristic,
  MessageLabelStyle,
  Participant,
  PoolNodeStyle,
  SubState,
  TaskType
} from './bpmn-view'

type Diagram = { name: string; nodeCount: number; edgeCount: number }
type SelectedDiagramCallback = (selected: IEnumerable<Diagram>) => Promise<string>

/**
 * Parser for the BPMN 2.0 abstract syntax.
 */
export class BpmnDiParser {
  private static _MULTI_LINE_EXTERIOR_NODE_LABELS: boolean
  private static _PARSE_EDGES: boolean
  private static _SHOW_ALL_DIAGRAMS: boolean
  private static _PARSE_FOLDED_DIAGRAMS: boolean
  private static _PARSE_ALL_LABELS: boolean
  private static _REARRANGE_LABELS: boolean

  onSetNodeTag: ((shape: BpmnShape) => any) | null = null
  onSetEdgeTag: ((shape: BpmnEdge) => any) | null = null
  // The current parsed BpmnDocument
  document: BpmnDocument = null!
  // The currently used diagram
  currentDiagram: BpmnDiagram = null!
  private view: IFoldingView | null = null
  // LabelModel for Nodes with Exterior Label. Provides 32 possible Positions.
  compositeLabelModel: CompositeLabelModel = null!
  // Can't use BPMN-Constants here, so we have to add the standard size of message envelopes.
  private bpmnMessageSize: Size = new Size(20, 14)
  // Maps a process BpmnElement to the BpmnElement that referenced this process in a 'processRef'
  processRefSource: HashMap<BpmnElement, BpmnElement> = new HashMap()

  /**
   * The master graph
   */
  get masterGraph(): IGraph {
    return this.view!.manager.masterGraph
  }

  /**
   * The current folding manager and current folding view
   */
  get manager(): FoldingManager {
    return this.view!.manager
  }

  /**
   * Flag that sets the rearrangement of Labels. Does not work properly with custom label bounds
   */
  static get REARRANGE_LABELS(): boolean {
    if (typeof BpmnDiParser._REARRANGE_LABELS === 'undefined') {
      BpmnDiParser._REARRANGE_LABELS = false
    }

    return BpmnDiParser._REARRANGE_LABELS
  }

  /**
   * Flag that decides if Labels should be parsed, if bpmndi:BPMNLabel XML element is missing
   */
  static get PARSE_ALL_LABELS(): boolean {
    if (typeof BpmnDiParser._PARSE_ALL_LABELS === 'undefined') {
      BpmnDiParser._PARSE_ALL_LABELS = true
    }

    return BpmnDiParser._PARSE_ALL_LABELS
  }

  /**
   * Flag that decides if the folded Diagrams inside a selected diagram should also be parsed
   */
  static get PARSE_FOLDED_DIAGRAMS(): boolean {
    if (typeof BpmnDiParser._PARSE_FOLDED_DIAGRAMS === 'undefined') {
      BpmnDiParser._PARSE_FOLDED_DIAGRAMS = true
    }

    return BpmnDiParser._PARSE_FOLDED_DIAGRAMS
  }

  /**
   * Flag that decides if only top level diagrams can be selected, or all possible Diagrams in the file
   */
  static get SHOW_ALL_DIAGRAMS(): boolean {
    if (typeof BpmnDiParser._SHOW_ALL_DIAGRAMS === 'undefined') {
      BpmnDiParser._SHOW_ALL_DIAGRAMS = false
    }

    return BpmnDiParser._SHOW_ALL_DIAGRAMS
  }

  /**
   * Flag, if false, no edges are parsed (Debug)
   */
  static get PARSE_EDGES(): boolean {
    if (typeof BpmnDiParser._PARSE_EDGES === 'undefined') {
      BpmnDiParser._PARSE_EDGES = true
    }

    return BpmnDiParser._PARSE_EDGES
  }

  /**
   * Flag to determine, if external node Labels should be single- or multiline Implementation left unfinished, since
   * the right way to do would be overriding the renderer
   */
  static get MULTI_LINE_EXTERIOR_NODE_LABELS(): boolean {
    if (typeof BpmnDiParser._MULTI_LINE_EXTERIOR_NODE_LABELS === 'undefined') {
      BpmnDiParser._MULTI_LINE_EXTERIOR_NODE_LABELS = false
    }

    return BpmnDiParser._MULTI_LINE_EXTERIOR_NODE_LABELS
  }

  /**
   * Constructs a new instance of the parser
   */
  constructor() {
    this.initGenericLabelModel()
  }

  /**
   * Called to parse and build a graph.
   * @param graph The graph Instance build the diagram in.
   * @param data data to get the graph from.
   * @param selectDiagramCallback Callback method which chooses one diagram name from a given list.
   * If no method is provided the first diagram is chosen.
   */
  load(
    graph: IGraph,
    data: string,
    selectDiagramCallback?: SelectedDiagramCallback
  ): Promise<void> {
    // Initialize FoldingManager & View for the Graph
    this.view = graph.foldingView
    if (!this.view) {
      throw new Error('Folding must be enabled.')
    }
    const multiLabelFolderNodeConverter = new MultiLabelFolderNodeConverter()
    multiLabelFolderNodeConverter.labelDefaults.style = BpmnLabelStyle.newDefaultInstance()
    multiLabelFolderNodeConverter.labelDefaults.shareStyleInstance = false
    // Initialize the default Layout for folded Group Nodes
    this.manager.folderNodeConverter = multiLabelFolderNodeConverter
    // Initialize the Layout for Edges alongside folded Group Nodes
    this.manager.foldingEdgeConverter = new FoldingEdgeConverter({
      foldingEdgeDefaults: {
        copyLabels: true,
        shareStyleInstance: false,
        initializeOptions: FoldingSynchronizationOptions.LAYOUT
      },
      reuseMasterPorts: true,
      reuseFolderNodePorts: true
    })

    // Clear previous Graph
    this.masterGraph.clear()

    // Create BpmnDocument from XML Stream
    const parser = new DOMParser()
    const doc = parser.parseFromString(data, 'application/xml')
    this.document = new BpmnDocument(doc)

    const topLevelDiagrams = BpmnDiParser.SHOW_ALL_DIAGRAMS
      ? this.document.diagrams
      : this.document.topLevelDiagrams

    // Get the Diagram to load
    let diaToLoad: BpmnDiagram | null
    return new Promise((resolve: (value?: BpmnDiagram | null) => void): void => {
      if (selectDiagramCallback) {
        selectDiagramCallback(
          topLevelDiagrams.map((d) => ({
            name: d.name,
            nodeCount: d.plane!.listOfShapes.size,
            edgeCount: d.plane!.listOfEdges.size
          }))
        ).then((chosenName: string) => {
          diaToLoad = topLevelDiagrams.find((d) => d.name === chosenName)
          resolve(diaToLoad)
        })
      } else {
        diaToLoad = topLevelDiagrams.at(0) ?? null
        resolve(diaToLoad)
      }
    }).then((diaToLoad) => {
      // Loads the selected Diagram into the supplied Graph
      if (diaToLoad) {
        this.loadDiagram(diaToLoad, null)
      }
    })
  }

  /**
   * Initialize the genericLabelModel Using a model with 32 positions (better than ExteriorNodeLabelModel which only has 8) to enable more options for customization in the user interface.
   */
  private initGenericLabelModel(): void {
    let exteriorNodeLabelModel = new ExteriorNodeLabelModel({ margins: 3 })
    this.compositeLabelModel = new CompositeLabelModel()
    this.compositeLabelModel.addParameter(
      exteriorNodeLabelModel.createParameter(ExteriorNodeLabelModelPosition.BOTTOM)
    )
    this.compositeLabelModel.addParameter(
      exteriorNodeLabelModel.createParameter(ExteriorNodeLabelModelPosition.BOTTOM_RIGHT)
    )
    this.compositeLabelModel.addParameter(
      exteriorNodeLabelModel.createParameter(ExteriorNodeLabelModelPosition.BOTTOM_LEFT)
    )
    this.compositeLabelModel.addParameter(
      exteriorNodeLabelModel.createParameter(ExteriorNodeLabelModelPosition.TOP)
    )
    this.compositeLabelModel.addParameter(
      exteriorNodeLabelModel.createParameter(ExteriorNodeLabelModelPosition.TOP_RIGHT)
    )
    this.compositeLabelModel.addParameter(
      exteriorNodeLabelModel.createParameter(ExteriorNodeLabelModelPosition.TOP_LEFT)
    )
    this.compositeLabelModel.addParameter(
      exteriorNodeLabelModel.createParameter(ExteriorNodeLabelModelPosition.LEFT)
    )
    this.compositeLabelModel.addParameter(
      exteriorNodeLabelModel.createParameter(ExteriorNodeLabelModelPosition.RIGHT)
    )
    // Big Insets
    exteriorNodeLabelModel = new ExteriorNodeLabelModel({ margins: 18 })
    this.compositeLabelModel.addParameter(
      exteriorNodeLabelModel.createParameter(ExteriorNodeLabelModelPosition.BOTTOM)
    )
    this.compositeLabelModel.addParameter(
      exteriorNodeLabelModel.createParameter(ExteriorNodeLabelModelPosition.BOTTOM_RIGHT)
    )
    this.compositeLabelModel.addParameter(
      exteriorNodeLabelModel.createParameter(ExteriorNodeLabelModelPosition.BOTTOM_LEFT)
    )
    this.compositeLabelModel.addParameter(
      exteriorNodeLabelModel.createParameter(ExteriorNodeLabelModelPosition.TOP)
    )
    this.compositeLabelModel.addParameter(
      exteriorNodeLabelModel.createParameter(ExteriorNodeLabelModelPosition.TOP_RIGHT)
    )
    this.compositeLabelModel.addParameter(
      exteriorNodeLabelModel.createParameter(ExteriorNodeLabelModelPosition.TOP_LEFT)
    )
    this.compositeLabelModel.addParameter(
      exteriorNodeLabelModel.createParameter(ExteriorNodeLabelModelPosition.LEFT)
    )
    this.compositeLabelModel.addParameter(
      exteriorNodeLabelModel.createParameter(ExteriorNodeLabelModelPosition.RIGHT)
    )

    // Label Positions between existing exterior positions
    const freeNodeLabelModel = new FreeNodeLabelModel()
    // Small Insets
    this.compositeLabelModel.addParameter(
      freeNodeLabelModel.createParameter(
        new Point(0.25, 0),
        new Point(-1.5, -3),
        new Point(0.75, 1),
        new Point(0, 0),
        0
      )
    )
    this.compositeLabelModel.addParameter(
      freeNodeLabelModel.createParameter(
        new Point(0.75, 0),
        new Point(1.5, -3),
        new Point(0.25, 1),
        new Point(0, 0),
        0
      )
    )
    this.compositeLabelModel.addParameter(
      freeNodeLabelModel.createParameter(
        new Point(1, 0.25),
        new Point(3, -1.5),
        new Point(0, 0.75),
        new Point(0, 0),
        0
      )
    )
    this.compositeLabelModel.addParameter(
      freeNodeLabelModel.createParameter(
        new Point(1, 0.75),
        new Point(3, 1.5),
        new Point(0, 0.25),
        new Point(0, 0),
        0
      )
    )
    this.compositeLabelModel.addParameter(
      freeNodeLabelModel.createParameter(
        new Point(0.75, 1),
        new Point(1.5, 3),
        new Point(0.25, 0),
        new Point(0, 0),
        0
      )
    )
    this.compositeLabelModel.addParameter(
      freeNodeLabelModel.createParameter(
        new Point(0.25, 1),
        new Point(-1.5, 3),
        new Point(0.75, 0),
        new Point(0, 0),
        0
      )
    )
    this.compositeLabelModel.addParameter(
      freeNodeLabelModel.createParameter(
        new Point(0, 0.75),
        new Point(-3, 1.5),
        new Point(1, 0.25),
        new Point(0, 0),
        0
      )
    )
    this.compositeLabelModel.addParameter(
      freeNodeLabelModel.createParameter(
        new Point(0, 0.25),
        new Point(-3, -1.5),
        new Point(1, 0.75),
        new Point(0, 0),
        0
      )
    )
    // Big Insets
    this.compositeLabelModel.addParameter(
      freeNodeLabelModel.createParameter(
        new Point(0.25, 0),
        new Point(-9, -18),
        new Point(0.75, 1),
        new Point(0, 0),
        0
      )
    )
    this.compositeLabelModel.addParameter(
      freeNodeLabelModel.createParameter(
        new Point(0.75, 0),
        new Point(9, -18),
        new Point(0.25, 1),
        new Point(0, 0),
        0
      )
    )
    this.compositeLabelModel.addParameter(
      freeNodeLabelModel.createParameter(
        new Point(1, 0.25),
        new Point(18, -9),
        new Point(0, 0.75),
        new Point(0, 0),
        0
      )
    )
    this.compositeLabelModel.addParameter(
      freeNodeLabelModel.createParameter(
        new Point(1, 0.75),
        new Point(18, 9),
        new Point(0, 0.25),
        new Point(0, 0),
        0
      )
    )
    this.compositeLabelModel.addParameter(
      freeNodeLabelModel.createParameter(
        new Point(0.75, 1),
        new Point(9, 18),
        new Point(0.25, 0),
        new Point(0, 0),
        0
      )
    )
    this.compositeLabelModel.addParameter(
      freeNodeLabelModel.createParameter(
        new Point(0.25, 1),
        new Point(-9, 18),
        new Point(0.75, 0),
        new Point(0, 0),
        0
      )
    )
    this.compositeLabelModel.addParameter(
      freeNodeLabelModel.createParameter(
        new Point(0, 0.75),
        new Point(-18, 9),
        new Point(1, 0.25),
        new Point(0, 0),
        0
      )
    )
    this.compositeLabelModel.addParameter(
      freeNodeLabelModel.createParameter(
        new Point(0, 0.25),
        new Point(-18, -9),
        new Point(1, 0.75),
        new Point(0, 0),
        0
      )
    )
  }

  /**
   * Builds the first diagram via drawing the individual nodes and edges.
   * @param diagram The diagram to draw
   * @param localRoot The local root node
   */
  private loadDiagram(diagram: BpmnDiagram, localRoot: INode | null): void {
    this.currentDiagram = diagram

    // iterate the BpmnElements of the BpmnPlane and build up all with a BpmnShape first and with a BpmnEdge afterwards
    const bpmnEdges = new List<BpmnEdge>()
    const plane = diagram.plane!
    for (const child of plane.element!.children) {
      this.buildElement(child, plane, localRoot, bpmnEdges)
    }
    for (const bpmnEdge of bpmnEdges) {
      this.buildEdge(bpmnEdge)
    }

    // If we collapse the shape before we add edges, edge labels disappear -> Folding after edge creation
    // But we have to rearrange Labels first, otherwise they are not in sync with the positions after folding.
    this.rearrange()
    const view = this.view!
    for (const shape of plane.listOfShapes) {
      if (shape.isExpanded === 'false') {
        view.collapse(shape.element!.node!)
      }
    }

    if (BpmnDiParser.PARSE_FOLDED_DIAGRAMS) {
      for (const child of diagram.children) {
        const collapsed = !view.isExpanded(child.value.node!)
        const lastRoot = view.localRoot
        if (collapsed) {
          view.localRoot = child.value.node
        }
        this.loadDiagram(child.key, child.value.node)
        if (collapsed) {
          view.localRoot = lastRoot
        }
      }
    }

    const groupNodes = this.masterGraph.nodes
      .filter((node) => node.style instanceof GroupNodeStyle)
      .toList()
    for (const groupNode of groupNodes) {
      if (this.masterGraph.getChildren(groupNode).size === 0) {
        const newChildren = this.masterGraph
          .getChildren(this.masterGraph.getParent(groupNode))
          .filter(
            (child) =>
              child !== groupNode &&
              groupNode.layout.contains(child.layout.topLeft) &&
              groupNode.layout.contains(child.layout.bottomRight)
          )
          .toList()
        for (const newChild of newChildren) {
          this.masterGraph.setParent(newChild, groupNode)
        }
      }
    }
  }

  /**
   * Returns the {@link BpmnShape} for the `element` in the context of this `plane`.
   * @param element The element to get the shape for.
   * @param plane The plane containing the shape for the element.
   */
  private getShape(element: BpmnElement, plane: BpmnPlane): BpmnShape | null {
    const referencedElement =
      element.name === 'participantRef' ? this.document.elements.get(element.value!) : null

    // check if there is a valid shape for this element or the referenced one
    for (const shape of plane.listOfShapes) {
      if (this.isValidShape(shape, element, referencedElement, plane)) {
        return shape
      }
    }
    return null
  }

  /**
   * Returns whether the `shape` belongs to this `element` or `referencedElement` in the context of the `plane`.
   * @param shape The shape to check validity for.
   * @param element The element to check if the shape is valid.
   * @param referencedElement The element referenced by element.
   * @param plane The plane containing this shape.
   */
  private isValidShape(
    shape: BpmnShape,
    element: BpmnElement,
    referencedElement: BpmnElement | null,
    plane: BpmnPlane
  ): boolean {
    if (shape.element !== element && shape.element !== referencedElement) {
      // shape has to be defined for Element or referenced Element
      return false
    }
    if (!shape.choreographyActivityShape) {
      // there is no ChoreographyActivityShape, so no further checks needed
      return true
    }
    if (
      element.parent &&
      (element.parent.name === 'choreographyTask' || element.parent.name === 'subChoreography')
    ) {
      // if a ChoreographyActivityShape is defined, we need to be inside the defined choreographyTask or subChoreography
      const choreoShape = this.getShape(element.parent, plane)
      if (choreoShape) {
        return shape.choreographyActivityShape === choreoShape.id
      }
    }
    return false
  }

  /**
   * Returns the {@link BpmnEdge} for the `element` in the context of this `plane`.
   * @param element The element to get an BpmnEdge for.
   * @param plane The plane containing the BpmnEdges.
   */
  private static getEdge(element: BpmnElement, plane: BpmnPlane): BpmnEdge | null {
    for (const bpmnEdge of plane.listOfEdges) {
      if (bpmnEdge.element === element) {
        return bpmnEdge
      }
    }
    return null
  }

  /**
   * Recursively builds BPMN items from `element` and its descendents.
   * @param element The element to build an BPMN item for.
   * @param plane The plane containing the shapes for the current {@link BpmnDiagram}.
   * @param localRoot The current root node.
   * @param bpmnEdges The Collection to add all found {@link BpmnEdge} to process later.
   */
  private buildElement(
    element: BpmnElement,
    plane: BpmnPlane,
    localRoot: INode | null,
    bpmnEdges: ICollection<BpmnEdge>
  ): void {
    if (element.name === 'laneSet') {
      // build up the Pool structure defined by the laneSet
      this.buildPool(element, plane, localRoot)
    } else {
      const bpmnShape = this.getShape(element, plane)
      const bpmnEdge = BpmnDiParser.getEdge(element, plane)
      if (bpmnShape) {
        if (!element.parent!.node) {
          element.parent!.node = localRoot
        }
        this.buildShape(bpmnShape, element)
      } else if (bpmnEdge) {
        bpmnEdges.add(bpmnEdge)
        return
      }
      if (element.process) {
        // The element references another Process so build it as well
        const process = { value: null }
        if (this.tryGetElementForId(element.process, process)) {
          this.processRefSource.set(process.value!, element)
          this.buildElement(process.value!, plane, localRoot, bpmnEdges)
        }
      }
      // check if all children or only data associations shall be processed
      let parseOnlyDataAssociations =
        bpmnShape && element.name === 'subProcess' && bpmnShape.isExpanded === 'false'
      if (parseOnlyDataAssociations) {
        // this is a collapsed subProcess - check if it is linked to its own Diagram
        if (!this.document.elementToDiagram.has(element)) {
          // there is no diagram associated with the subProcess so we parse the children for this diagram
          parseOnlyDataAssociations = false
        }
      }
      for (const child of element.children) {
        if (
          !parseOnlyDataAssociations ||
          child.name === 'dataInputAssociation' ||
          child.name === 'dataOutputAssociation'
        ) {
          this.buildElement(child, plane, localRoot, bpmnEdges)
        }
      }
    }
  }

  /**
   * Looks up the {@link BpmnElement} registered by `id`.
   * @param id The id to look up the element for.
   * @param element The element to set if one could be found for the given id.
   * @param element.value The element to set if one could be found for the given id.
   */
  private tryGetElementForId(id: string | null, element: { value: BpmnElement | null }): boolean {
    element.value = null
    if (id == null) {
      return false
    }
    if (this.document.elements.has(id)) {
      element.value = this.document.elements.get(id)
      return true
    }
    const separatorIndex = id.indexOf(':')
    if (separatorIndex <= 0) {
      return false
    }
    // if no element was found for id but the id was prefixed for a namespace, try to find an element for an id without prefix
    const shortId = id.substr(separatorIndex + 1)
    if (this.document.elements.has(shortId)) {
      element.value = this.document.elements.get(shortId)
      return true
    }
    return false
  }

  /**
   * Uses a labeling algorithm to rearrange the labels to reduce overlaps
   */
  private rearrange(): void {
    if (!BpmnDiParser.REARRANGE_LABELS) {
      return
    }
    const labelingData = new GenericLabelingData()
    labelingData.edgeLabelPreferredPlacements = (label: ILabel): EdgeLabelPreferredPlacement => {
      if (/yes|no/i.test(label.text)) {
        const preferredPlacementDescriptor = new EdgeLabelPreferredPlacement()
        preferredPlacementDescriptor.placementAlongEdge = LabelAlongEdgePlacements.AT_SOURCE
        preferredPlacementDescriptor.distanceToEdge = 5
        preferredPlacementDescriptor.edgeSide =
          LabelEdgeSides.LEFT_OF_EDGE | LabelEdgeSides.RIGHT_OF_EDGE
        return preferredPlacementDescriptor
      }
      const preferredPlacementDescriptor2 = new EdgeLabelPreferredPlacement()
      preferredPlacementDescriptor2.placementAlongEdge = LabelAlongEdgePlacements.AT_CENTER
      preferredPlacementDescriptor2.distanceToEdge = 5
      preferredPlacementDescriptor2.edgeSide =
        LabelEdgeSides.LEFT_OF_EDGE | LabelEdgeSides.RIGHT_OF_EDGE
      return preferredPlacementDescriptor2
    }
    const labeling = new GenericLabeling({
      scope: 'edge-labels',
      moveInternalNodeLabels: false,
      reduceLabelOverlaps: true
    })
    labeling.defaultNodeLabelingCosts.ambiguousPlacementCost = 1.0
    labeling.defaultEdgeLabelingCosts.ambiguousPlacementCost = 1.0
    this.masterGraph.applyLayout(labeling, labelingData)
  }

  /**
   * Creates an {@link INode} on the graph
   * @param shape The {@link BpmnShape} to draw.
   * @param originalElement The original element the shape shall be applied for.
   */
  private buildShape(shape: BpmnShape, originalElement: BpmnElement): void {
    const bounds = new Rect(shape.x, shape.y, shape.width, shape.height)

    switch (shape.element!.name) {
      // Gateways
      case 'exclusiveGateway':
        if (shape.isMarkerVisible) {
          this.buildGatewayNode(shape, bounds, GatewayType.EXCLUSIVE_WITH_MARKER)
        } else {
          this.buildGatewayNode(shape, bounds, GatewayType.EXCLUSIVE_WITHOUT_MARKER)
        }
        break
      case 'parallelGateway':
        this.buildGatewayNode(shape, bounds, GatewayType.PARALLEL)
        break
      case 'inclusiveGateway':
        this.buildGatewayNode(shape, bounds, GatewayType.INCLUSIVE)
        break
      case 'eventBasedGateway':
        if (shape.getAttribute('eventGatewayType') === 'Exclusive') {
          this.buildGatewayNode(shape, bounds, GatewayType.EXCLUSIVE_EVENT_BASED)
        } else if (shape.getAttribute('eventGatewayType') === 'Parallel') {
          this.buildGatewayNode(shape, bounds, GatewayType.PARALLEL_EVENT_BASED)
        } else {
          this.buildGatewayNode(shape, bounds, GatewayType.EVENT_BASED)
        }
        break
      case 'complexGateway':
        this.buildGatewayNode(shape, bounds, GatewayType.COMPLEX)
        break

      // Activities - Tasks
      case 'task':
        this.buildTaskNode(shape, bounds, TaskType.ABSTRACT)
        break
      case 'userTask':
        this.buildTaskNode(shape, bounds, TaskType.USER)
        break
      case 'manualTask':
        this.buildTaskNode(shape, bounds, TaskType.MANUAL)
        break
      case 'serviceTask':
        this.buildTaskNode(shape, bounds, TaskType.SERVICE)
        break
      case 'scriptTask':
        this.buildTaskNode(shape, bounds, TaskType.SCRIPT)
        break
      case 'sendTask':
        this.buildTaskNode(shape, bounds, TaskType.SEND)
        break
      case 'receiveTask':
        this.buildTaskNode(shape, bounds, TaskType.RECEIVE)
        break
      case 'businessRuleTask':
        this.buildTaskNode(shape, bounds, TaskType.BUSINESS_RULE)
        break

      // Activities - subProcess
      case 'subProcess':
        if (shape.getAttribute('triggeredByEvent') === 'true') {
          this.buildSubProcessNode(shape, bounds, ActivityType.EVENT_SUB_PROCESS)
        } else {
          this.buildSubProcessNode(shape, bounds, ActivityType.SUB_PROCESS)
        }
        break

      // Activities - Ad-Hoc Sub-Process
      case 'adHocSubProcess':
        if (shape.getAttribute('triggeredByEvent') === 'true') {
          this.buildSubProcessNode(shape, bounds, ActivityType.EVENT_SUB_PROCESS)
        } else {
          this.buildSubProcessNode(shape, bounds, ActivityType.SUB_PROCESS)
        }
        break

      // Activities - Transaction
      case 'transaction':
        this.buildSubProcessNode(shape, bounds, ActivityType.TRANSACTION)
        break

      // Activities - callActivity
      case 'callActivity':
        this.buildSubProcessNode(shape, bounds, ActivityType.CALL_ACTIVITY)
        break

      // Events
      case 'startEvent':
        if (shape.getAttribute('isInterrupting') === 'true') {
          this.buildEventNode(shape, bounds, EventCharacteristic.SUB_PROCESS_INTERRUPTING)
        } else if (shape.getAttribute('isInterrupting') === 'false') {
          this.buildEventNode(shape, bounds, EventCharacteristic.SUB_PROCESS_NON_INTERRUPTING)
        } else {
          this.buildEventNode(shape, bounds, EventCharacteristic.START)
        }
        break
      case 'endEvent':
        this.buildEventNode(shape, bounds, EventCharacteristic.END)
        break
      case 'boundaryEvent':
        // Boundary Events are realized as Ports instead of Nodes
        this.buildBoundaryEvent(shape)
        break
      case 'intermediateThrowEvent':
        this.buildEventNode(shape, bounds, EventCharacteristic.THROWING)
        break
      case 'intermediateCatchEvent':
        this.buildEventNode(shape, bounds, EventCharacteristic.CATCHING)
        break

      // Conversation
      case 'conversation':
        this.buildConversationNode(shape, bounds, ConversationType.CONVERSATION, null)
        break
      case 'callConversation': {
        const refElement = { value: null }
        if (this.tryGetElementForId(shape.getAttribute('calledCollaborationRef')!, refElement)) {
          switch ((refElement.value! as BpmnElement).name) {
            case 'collaboration':
              this.buildConversationNode(
                shape,
                bounds,
                ConversationType.CALLING_COLLABORATION,
                refElement.value
              )
              break
            case 'globalConversation':
              this.buildConversationNode(
                shape,
                bounds,
                ConversationType.CALLING_GLOBAL_CONVERSATION,
                refElement.value
              )
              break
            default:
              // This should not happen under strict conformance
              this.buildConversationNode(
                shape,
                bounds,
                ConversationType.CONVERSATION,
                refElement.value
              )
              break
          }
        }
        break
      }
      case 'subConversation':
        this.buildConversationNode(shape, bounds, ConversationType.SUB_CONVERSATION, null)
        break

      // Choreography
      case 'choreographyTask':
      case 'subChoreography':
      case 'callChoreography':
        this.buildChoreographyNode(shape, bounds)
        break

      // Participants
      case 'participant': {
        const parent = originalElement.parent as BpmnElement
        // If the participant is not part of a choreography node, create a node
        if (parent.name.toLowerCase().indexOf('choreography') === -1) {
          this.buildParticipantNode(shape, bounds)
        } else if (parent.node) {
          // Else add it to the appropriate choreography
          this.buildParticipantLabel(shape)
        }
        break
      }
      case 'participantRef':
        break
      case 'textAnnotation':
        this.buildTextAnnotationNode(shape, bounds)
        break
      case 'group':
        this.buildGroupNode(shape, bounds)
        break
      case 'dataObjectReference': {
        // Find out, if the data Object is a collection
        let collection = false
        const dataObject = { value: null }
        if (this.tryGetElementForId(shape.getAttribute('dataObjectRef')!, dataObject)) {
          const bpmnElement = dataObject.value! as BpmnElement
          if (bpmnElement.attributes.has('isCollection')) {
            if (bpmnElement.attributes.get('isCollection') === 'true') {
              collection = true
            }
          }
        }
        this.buildDataObjectNode(shape, bounds, DataObjectType.NONE, collection)
        break
      }
      case 'dataInput': {
        // Find out, if the data Object is a collection
        const collection = shape.getAttribute('isCollection') === 'true'
        this.buildDataObjectNode(shape, bounds, DataObjectType.INPUT, collection)
        break
      }
      case 'dataOutput': {
        // Find out, if the data Object is a collection
        const collection = shape.getAttribute('isCollection') === 'true'
        this.buildDataObjectNode(shape, bounds, DataObjectType.OUTPUT, collection)
        break
      }
      // DataStore
      case 'dataStoreReference':
        this.buildDataStoreReferenceNode(shape, bounds)
        break
    }
    const iNode = shape.element!.node
    if (iNode) {
      this.setNodeTag(shape, iNode)
    }
  }

  /**
   * Creates an {@link IEdge} on the graph
   * @param edge The {@link BpmnEdge} to draw.
   */
  private buildEdge(edge: BpmnEdge): void {
    const element = edge.element!
    const source = edge.source!
    let iEdge: IEdge | null = null
    switch (element.name) {
      case 'sequenceFlow':
        if (element.getChild('conditionExpression') && !source.name.endsWith('Gateway')) {
          iEdge = this.buildDefaultEdge(edge, BpmnEdgeType.CONDITIONAL_FLOW)
        } else if (source && source.getValue('default') === element.id) {
          iEdge = this.buildDefaultEdge(edge, BpmnEdgeType.DEFAULT_FLOW)
        } else {
          iEdge = this.buildDefaultEdge(edge, BpmnEdgeType.SEQUENCE_FLOW)
        }
        break
      case 'association':
        switch (edge.getAttribute('associationDirection')) {
          case 'None':
            iEdge = this.buildDefaultEdge(edge, BpmnEdgeType.ASSOCIATION)
            break
          case 'One':
            iEdge = this.buildDefaultEdge(edge, BpmnEdgeType.DIRECTED_ASSOCIATION)
            break
          case 'Both':
            iEdge = this.buildDefaultEdge(edge, BpmnEdgeType.BIDIRECTED_ASSOCIATION)
            break
          default:
            // This shouldn't happen under strict conformance
            iEdge = this.buildDefaultEdge(edge, BpmnEdgeType.ASSOCIATION)
            break
        }
        break
      case 'dataAssociation':
        iEdge = this.buildDefaultEdge(edge, BpmnEdgeType.ASSOCIATION)
        break
      case 'conversationLink':
        iEdge = this.buildDefaultEdge(edge, BpmnEdgeType.CONVERSATION)
        break
      case 'messageFlow':
        iEdge = this.buildMessageFlow(edge)
        break
      case 'dataInputAssociation':
        iEdge = this.buildDefaultEdge(edge, BpmnEdgeType.DIRECTED_ASSOCIATION)
        break
      case 'dataOutputAssociation':
        iEdge = this.buildDefaultEdge(edge, BpmnEdgeType.DIRECTED_ASSOCIATION)
        break
    }
    if (iEdge) {
      // Create label & set style
      this.addEdgeLabel(edge)

      this.setEdgeTag(edge, iEdge)
    }
  }

  /**
   * Callback to add some of the {@link BpmnShape} or {@link BpmnElement} data to the {@link ITagOwner.tag} of `iNode`.
   * @param shape The bpmn shape used to create the node.
   * @param iNode The node whose tag shall be filled.
   */
  setNodeTag(shape: BpmnShape, iNode: INode): void {
    if (this.onSetNodeTag) {
      iNode.tag = this.onSetNodeTag(shape)
    }
  }

  /**
   * Callback to add some of the {@link BpmnEdge} or {@link BpmnElement} data to the {@link ITagOwner.tag} of `iEdge`.
   * @param edge The bpmn edge used to create the edge.
   * @param iEdge The edge whose tag shall be filled.
   */
  setEdgeTag(edge: BpmnEdge, iEdge: IEdge): void {
    if (this.onSetEdgeTag) {
      iEdge.tag = this.onSetEdgeTag(edge)
    }
  }

  /**
   * Builds a Gateway node
   */
  private buildGatewayNode(shape: BpmnShape, bounds: Rect, type: number): void {
    const node = this.masterGraph.createNode(bounds)
    const element = shape.element!
    this.setParent(node, (element.parent as BpmnElement).node!)
    element.node = node

    // dataAssociations point to invisible children of activities, therefore, the INode has to be linked there
    element.setINodeInputOutput(node)

    // Add Style
    const gatewayStyle = new GatewayNodeStyle()
    gatewayStyle.type = type
    this.masterGraph.setStyle(node, gatewayStyle)

    // Add Label
    const label = this.addNodeLabel(node, shape)
    if (shape.hasLabelPosition()) {
      this.setFixedBoundsLabelStyle(label, shape.labelBounds)
    } else {
      this.setExternalLabelStyle(label)
      if (shape.hasLabelSize()) {
        this.masterGraph.setLabelPreferredSize(label, shape.labelBounds.size)
      }
    }
  }

  /**
   * Builds a Task node
   */
  private buildTaskNode(shape: BpmnShape, bounds: Rect, type: number): void {
    const node = this.masterGraph.createNode(bounds)
    const element = shape.element!
    this.setParent(node, (element.parent as BpmnElement).node!)
    element.node = node

    // dataAssociations point to invisible children of activities, therefore, the INode has to be linked there
    element.setINodeInputOutput(node)

    // Add Style
    const activityStyle = new ActivityNodeStyle()
    activityStyle.compensation = shape.getAttribute('isForCompensation') === 'true'
    activityStyle.loopCharacteristic = element.getLoopCharacteristics()
    activityStyle.activityType = ActivityType.TASK
    activityStyle.taskType = type
    this.masterGraph.setStyle(node, activityStyle)

    // Add Label
    const label = this.addNodeLabel(node, shape)
    this.setInternalLabelStyle(label)
  }

  /**
   * Builds a SubProcess node
   */
  private buildSubProcessNode(shape: BpmnShape, bounds: Rect, type: number): void {
    const node = this.masterGraph.createNode(bounds)
    const element = shape.element!

    // All SubProcess have to be GroupNodes, so they can be collapsed/expanded
    this.masterGraph.setIsGroupNode(node, true)

    this.setParent(node, (element.parent as BpmnElement).node!)
    element.node = node
    const calledElement = { value: null }

    // If this subProcess is a callActivity and calls an existing process, link the Node there as well
    if (element.calledElement) {
      if (this.tryGetElementForId(element.calledElement, calledElement)) {
        ;(calledElement.value! as BpmnElement).node = node
      }
    }

    // dataAssociations point to invisible children of activities, therefore, the INode has to be linked there
    element.setINodeInputOutput(node)

    const activityStyle = new ActivityNodeStyle()
    activityStyle.compensation = shape.getAttribute('isForCompensation') === 'true'
    activityStyle.loopCharacteristic = element.getLoopCharacteristics()
    // Get, if the subProcess is expanded
    const label = this.addNodeLabel(node, shape)
    this.setSubProcessLabelStyle(label)
    activityStyle.activityType = type
    activityStyle.triggerEventType = BpmnDiParser.getEventType(shape)

    if (shape.getAttribute('isInterrupting') === 'true') {
      activityStyle.triggerEventCharacteristic = EventCharacteristic.SUB_PROCESS_INTERRUPTING
    } else {
      activityStyle.triggerEventCharacteristic = EventCharacteristic.SUB_PROCESS_NON_INTERRUPTING
    }
    activityStyle.subState = SubState.DYNAMIC

    this.masterGraph.setStyle(node, activityStyle)
  }

  /**
   * Builds an Event node
   */
  private buildEventNode(shape: BpmnShape, bounds: Rect, characteristic: number): void {
    const node = this.masterGraph.createNode(bounds)
    const element = shape.element!
    this.setParent(node, (element.parent as BpmnElement).node!)
    element.node = node

    // dataAssociations point to invisible children of activities, therefore, the INode has to be linked there
    element.setINodeInputOutput(node)

    // Add Style
    const eventStyle = new EventNodeStyle()
    eventStyle.type = BpmnDiParser.getEventType(shape)
    eventStyle.characteristic = characteristic
    this.masterGraph.setStyle(node, eventStyle)

    // Add Label
    const label = this.addNodeLabel(node, shape)
    if (shape.hasLabelPosition()) {
      this.setFixedBoundsLabelStyle(label, shape.labelBounds)
    } else {
      this.setExternalLabelStyle(label)
      if (shape.hasLabelSize()) {
        this.masterGraph.setLabelPreferredSize(label, shape.labelBounds.size)
      }
    }
  }

  /**
   * Builds a Boundary Event, realized as a port instead of a node
   */
  private buildBoundaryEvent(shape: BpmnShape): void {
    const parent = { value: null }
    this.tryGetElementForId(shape.getAttribute('attachedToRef')!, parent)
    const portStyle = new EventPortStyle()
    portStyle.type = BpmnDiParser.getEventType(shape)
    portStyle.characteristic =
      shape.getAttribute('cancelActivity') === 'false'
        ? EventCharacteristic.BOUNDARY_NON_INTERRUPTING
        : EventCharacteristic.BOUNDARY_INTERRUPTING

    const parentValue = parent.value
    if (!parentValue) {
      throw new Error('Shape with no parent')
    }

    const parentNode = (parentValue as BpmnElement).node
    if (!parentNode) {
      this.document.messages.add(
        'The node for boundaryEvent ' + shape.id + ' was not (yet) created!'
      )
      return
    }

    const element = shape.element!

    // dataAssociations point to invisible children of Tasks, therefore, the INode has to be linked there
    element.setINodeInputOutput(parentNode)

    const port = this.masterGraph.addPortAt(
      parentNode,
      new Point(shape.x + shape.width / 2, shape.y + shape.height / 2),
      portStyle as IPortStyle,
      null
    )
    element.port = port
    element.node = parentNode
    const label = this.addNodeLabel(port, shape)

    if (shape.hasLabelPosition()) {
      this.setFixedBoundsLabelStyle(label, shape.labelBounds)
    } else {
      this.masterGraph.setStyle(label, new LabelStyle())
      if (shape.hasLabelSize()) {
        this.masterGraph.setLabelPreferredSize(label, shape.labelBounds.size)
      } else {
        const outsideModel = new InsideOutsidePortLabelModel()
        outsideModel.distance = 10
        this.masterGraph.setLabelLayoutParameter(label, outsideModel.createOutsideParameter())
      }
    }
  }

  /**
   * Builds a Conversation node
   */
  private buildConversationNode(
    shape: BpmnShape,
    bounds: Rect,
    type: number,
    refElement: BpmnElement | null
  ): void {
    const node = this.masterGraph.createNode(bounds)
    const element = shape.element!
    this.setParent(node, (element.parent as BpmnElement).node!)

    element.node = node

    // dataAssociations point to invisible children of Tasks, therefore, the INode has to be linked there
    element.setINodeInputOutput(node)

    // Add Style
    const conversationStyle = new ConversationNodeStyle()
    conversationStyle.type = type
    this.masterGraph.setStyle(node, conversationStyle)

    // Add Label
    const label = this.addNodeLabel(node, shape)
    if (shape.hasLabelPosition()) {
      this.setFixedBoundsLabelStyle(label, shape.labelBounds)
    } else {
      this.setExternalLabelStyle(label)
      if (shape.hasLabelSize()) {
        this.masterGraph.setLabelPreferredSize(label, shape.labelBounds.size)
      }
    }
  }

  /**
   * Builds a Choreography node
   */
  private buildChoreographyNode(shape: BpmnShape, bounds: Rect): void {
    const node = this.masterGraph.createGroupNode(this.view!.localRoot, bounds)
    const element = shape.element!
    this.setParent(node, (element.parent as BpmnElement).node!)
    element.node = node

    // dataAssociations point to invisible children of Tasks, therefore, the INode has to be linked there
    element.setINodeInputOutput(node)

    const choreographyStyle = new ChoreographyNodeStyle()
    choreographyStyle.loopCharacteristic = element.getLoopCharacteristics()
    // Get Loop Characteristics
    element.topParticipants = 0
    element.bottomParticipants = 0
    const label = this.addNodeLabel(node, shape)

    // Get SubState
    if (shape.isExpanded === 'true') {
      choreographyStyle.subState = SubState.NONE
      this.masterGraph.setStyle(node, choreographyStyle)
    } else if (shape.isExpanded === 'false') {
      choreographyStyle.subState = SubState.DYNAMIC
      this.masterGraph.setStyle(node, choreographyStyle)
    } else {
      this.masterGraph.setStyle(node, choreographyStyle)
    }

    this.setChoreographyLabelStyle(label)
  }

  /**
   * Builds a dataObject Node
   */
  private buildDataObjectNode(
    shape: BpmnShape,
    bounds: Rect,
    type: number,
    isCollection: boolean
  ): void {
    const node = this.masterGraph.createNode(bounds)
    const element = shape.element!
    this.setParent(node, (element.parent as BpmnElement).node!)
    element.node = node

    // dataAssociations point to invisible children of Tasks, therefore, the INode has to be linked there
    element.setINodeInputOutput(node)

    const objectStyle = new DataObjectNodeStyle()
    objectStyle.type = type
    objectStyle.collection = isCollection
    this.masterGraph.setStyle(node, objectStyle)

    const label = this.addNodeLabel(node, shape)

    if (shape.hasLabelPosition()) {
      this.setFixedBoundsLabelStyle(label, shape.labelBounds)
    } else {
      this.setExternalLabelStyle(label)
      if (shape.hasLabelSize()) {
        this.masterGraph.setLabelPreferredSize(label, shape.labelBounds.size)
      }
    }
  }

  /**
   * Builds a participant node (actually a pool)
   */
  private buildParticipantNode(shape: BpmnShape, bounds: Rect): void {
    const element = shape.element!
    const processRef = element.process
    const processElement = { value: null }
    if (
      !processRef ||
      !this.tryGetElementForId(processRef, processElement) ||
      !(processElement.value! as BpmnElement).getChild('laneSet')
    ) {
      // not connected to a process so we need our own node

      const node = this.masterGraph.createNode(bounds)
      this.setParent(node, (element.parent as BpmnElement).node!)
      element.node = node
      if (processElement.value) {
        ;(processElement.value! as BpmnElement).node = node
      }

      // dataAssociations point to invisible children of Tasks, therefore, the INode has to be linked there
      element.setINodeInputOutput(node)

      const partStyle = BpmnDiParser.createTable(shape)
      if (element.hasChild('participantMultiplicity')) {
        if (convertToInt(element.getChildAttribute('participantMultiplicity', 'maximum')!) > 1) {
          partStyle.multipleInstance = true
        }
      }

      this.masterGraph.setStyle(node, partStyle)

      const table = partStyle.tableNodeStyle.table
      if (shape.isHorizontal ?? false) {
        const row = table.rootRow.childRows.first()!
        BpmnDiParser.addTableLabel(table, row, shape)
      } else {
        const column = table.rootColumn.childColumns.first()!
        BpmnDiParser.addTableLabel(table, column, shape)
      }
    }
  }

  /**
   * Builds a participant label inside a choreography node
   */
  private buildParticipantLabel(shape: BpmnShape): void {
    const choreography = this.currentDiagram.plane!.getShape(
      shape.choreographyActivityShape
    )!.element!
    const node = choreography.node!
    let top = false
    let index = 0
    const choreographyNodeStyle = node.style as ChoreographyNodeStyle
    let multipleInstance = false
    const element = shape.element!

    if (element.hasChild('participantMultiplicity')) {
      if (convertToInt(element.getChildAttribute('participantMultiplicity', 'maximum')!) > 1) {
        multipleInstance = true
      }
    }
    const participant = new Participant()
    participant.multiInstance = multipleInstance
    let label: ILabel = this.addParticipantLabel(node, shape)
    switch (shape.partBandKind) {
      case ParticipantBandKind.TOP_INITIATING:
        if (shape.isMessageVisible) {
          choreographyNodeStyle.initiatingMessage = true
        }
        choreographyNodeStyle.initiatingAtTop = true
        choreographyNodeStyle.topParticipants.add(participant)
        top = true
        index = choreography.topParticipants++
        break
      case ParticipantBandKind.TOP_NON_INITIATING:
        if (shape.isMessageVisible) {
          choreographyNodeStyle.responseMessage = true
        }
        choreographyNodeStyle.topParticipants.add(participant)
        top = true
        index = choreography.topParticipants++
        break
      case ParticipantBandKind.BOTTOM_INITIATING:
        if (shape.isMessageVisible) {
          choreographyNodeStyle.initiatingMessage = true
        }
        choreographyNodeStyle.initiatingAtTop = false
        choreographyNodeStyle.bottomParticipants.add(participant)
        index = choreography.bottomParticipants++
        break
      case ParticipantBandKind.BOTTOM_NON_INITIATING:
        if (shape.isMessageVisible) {
          choreographyNodeStyle.responseMessage = true
        }
        choreographyNodeStyle.bottomParticipants.add(participant)
        index = choreography.bottomParticipants++
        break
      case ParticipantBandKind.MIDDLE_INITIATING:
        // This shouldn't happen under strict conformance
        if (shape.isMessageVisible) {
          choreographyNodeStyle.initiatingMessage = true
        }
        if (choreography.topParticipants < choreography.bottomParticipants) {
          top = true
          index = choreography.topParticipants++
          choreographyNodeStyle.initiatingAtTop = true
          choreographyNodeStyle.topParticipants.add(participant)
        } else {
          index = choreography.bottomParticipants++
          choreographyNodeStyle.initiatingAtTop = false
          choreographyNodeStyle.bottomParticipants.add(participant)
        }
        break
      case ParticipantBandKind.MIDDLE_NON_INITIATING:
        if (shape.isMessageVisible) {
          choreographyNodeStyle.responseMessage = true
        }
        if (choreography.topParticipants < choreography.bottomParticipants) {
          top = true
          index = choreography.topParticipants++
          choreographyNodeStyle.topParticipants.add(participant)
        } else {
          index = choreography.bottomParticipants++
          choreographyNodeStyle.bottomParticipants.add(participant)
        }
        break
    }
    element.node = node

    // Sets the label Style of the new participant
    let parameter = ChoreographyLabelModel.INSTANCE.createParticipantParameter(top, index)
    this.masterGraph.setLabelLayoutParameter(label, parameter)
    let defaultLabelStyle: LabelStyle = this.setCustomLabelStyle(label)
    this.masterGraph.setStyle(label, defaultLabelStyle)

    // checks, if there is a message, if yes, tries to set text label
    if (shape.isMessageVisible && choreography.hasChild('messageFlowRef')) {
      const children = choreography.getChildren('messageFlowRef')

      for (const child of children) {
        const messageFlow = { value: null }
        if (this.tryGetElementForId(child.value!, messageFlow)) {
          if ((messageFlow.value! as BpmnElement).source === element.id) {
            const message = (messageFlow.value! as BpmnElement).label || ''
            label = this.masterGraph.addLabel({
              owner: node,
              text: message,
              tag: shape.labelStyle || null
            })
            if (top) {
              parameter = ChoreographyLabelModel.NORTH_MESSAGE
            } else {
              parameter = ChoreographyLabelModel.SOUTH_MESSAGE
            }
            this.masterGraph.setLabelLayoutParameter(label, parameter)
            defaultLabelStyle = this.setCustomLabelStyle(label)
            this.masterGraph.setStyle(label, defaultLabelStyle)
            break
          }
        }
      }
    }
  }

  /**
   * Builds a TextAnnotationNode
   */
  private buildTextAnnotationNode(shape: BpmnShape, bounds: Rect): void {
    const node = this.masterGraph.createNode(bounds)
    const element = shape.element!
    this.setParent(node, (element.parent as BpmnElement).node!)
    element.node = node

    // Add Style
    const annotationStyle = new AnnotationNodeStyle()
    this.masterGraph.setStyle(node, annotationStyle)

    // Add Label
    const label = this.addNodeLabel(node, shape)
    this.setInternalLabelStyle(label)
  }

  /**
   * Builds a Group Node
   */
  private buildGroupNode(shape: BpmnShape, bounds: Rect): void {
    const element = shape.element!
    const node = this.masterGraph.createGroupNode(
      element.parent!.node,
      bounds,
      new GroupNodeStyle(),
      null
    )
    element.node = node

    // Before Adding a Label, we need to get the Label Text, which is located in a categoryValue
    // The id of this category value is located in the Label
    for (const childElement of this.document.elements) {
      if (childElement.value.id === element.label && childElement.value.attributes.has('value')) {
        element.label = childElement.value.attributes.get('value')!
        break
      }
    }

    // Add Label
    const label = this.addNodeLabel(node, shape)
    this.setGroupLabelStyle(label)
  }

  /**
   * Builds a DataStoreReference Node
   */
  private buildDataStoreReferenceNode(shape: BpmnShape, bounds: Rect): void {
    const node = this.masterGraph.createNode(bounds)
    const element = shape.element!
    this.setParent(node, (element.parent as BpmnElement).node!)
    element.node = node

    // dataAssociations point to invisible children of Tasks, therefore, the INode has to be linked there
    element.setINodeInputOutput(node)

    // Add Style
    const dataStoreStyle = new DataStoreNodeStyle()
    this.masterGraph.setStyle(node, dataStoreStyle)

    // Add Label
    const label = this.addNodeLabel(node, shape)
    if (shape.hasLabelPosition()) {
      this.setFixedBoundsLabelStyle(label, shape.labelBounds)
    } else {
      this.setExternalLabelStyle(label)
      if (shape.hasLabelSize()) {
        this.masterGraph.setLabelPreferredSize(label, shape.labelBounds.size)
      }
    }
  }

  /**
   * Retrieves the correct EventType, returns EventNodeStyle with the EventType set accordingly
   */
  private static getEventType(shape: BpmnShape): number {
    let eventType = EventType.PLAIN
    const element = shape.element!

    if (element.hasChild('messageEventDefinition')) {
      eventType = EventType.MESSAGE
    }
    if (element.hasChild('timerEventDefinition')) {
      eventType = EventType.TIMER
    }
    if (element.hasChild('terminateEventDefinition')) {
      eventType = EventType.TERMINATE
    }
    if (element.hasChild('escalationEventDefinition')) {
      eventType = EventType.ESCALATION
    }
    if (element.hasChild('errorEventDefinition')) {
      eventType = EventType.ERROR
    }
    if (element.hasChild('conditionalEventDefinition')) {
      eventType = EventType.CONDITIONAL
    }
    if (element.hasChild('compensateEventDefinition')) {
      eventType = EventType.COMPENSATION
    }
    if (element.hasChild('cancelEventDefinition')) {
      eventType = EventType.CANCEL
    }
    if (element.hasChild('linkEventDefinition')) {
      eventType = EventType.LINK
    }
    if (element.hasChild('signalEventDefinition')) {
      eventType = EventType.SIGNAL
    }
    if (element.hasChild('multipleEventDefinition')) {
      eventType = EventType.MULTIPLE
    }
    if (element.hasChild('parallelEventDefinition')) {
      eventType = EventType.PARALLEL_MULTIPLE
    }
    return eventType
  }

  /**
   * Sets the parentNode of a Node, if the parentNode is part of the current Graph
   */
  private setParent(node: INode, parentNode: INode): void {
    if (this.masterGraph.contains(parentNode)) {
      this.masterGraph.setParent(node, parentNode)
    }
  }

  /**
   * Adds a label to a node
   */
  private addNodeLabel(owner: ILabelOwner, shape: BpmnShape): ILabel {
    // blank label, in case we added none
    let name = shape.element!.label
    // only has label name, if we added one before
    if ((!shape.hasLabel && !BpmnDiParser.PARSE_ALL_LABELS) || !name) {
      name = ''
    }
    return this.masterGraph.addLabel({ owner, text: name, tag: shape.labelStyle || null })
  }

  /**
   * Adds a label to a participant
   */
  private addParticipantLabel(owner: ILabelOwner, shape: BpmnShape): ILabel {
    // blank label, in case we added none
    let name = shape.element!.label
    // only has label name, if we added one before
    if ((!shape.hasLabel && !BpmnDiParser.PARSE_ALL_LABELS) || !name) {
      name = ''
    }
    return this.masterGraph.addLabel({ owner, text: name, tag: shape.labelStyle || null })
  }

  /**
   * Adds a label to a table object (rows/columns)
   */
  private static addTableLabel(table: ITable, owner: IStripe, shape: BpmnShape): void {
    // blank label, in case we added none
    let name = shape.element!.label
    // only has label name, if we added one before
    if ((!shape.hasLabel && !BpmnDiParser.PARSE_ALL_LABELS) || !name) {
      name = ''
    }
    table.addLabel({ owner, text: name, tag: shape.labelStyle || null })
  }

  /**
   * Adds a label to an edge
   */
  private addEdgeLabel(edge: BpmnEdge): void {
    // blank label, in case we added none
    let name = edge.element!.label
    // only has label name, if we added one before
    if ((!edge.hasLabel && !BpmnDiParser.PARSE_ALL_LABELS) || !name) {
      name = ''
    }
    if (name !== '') {
      const owner = edge.element!.edge as ILabelOwner
      const label = this.masterGraph.addLabel({ owner, text: name, tag: edge.labelStyle || null })

      if (edge.hasLabelPosition()) {
        this.setFixedBoundsLabelStyle(label, edge.labelBounds)
      } else {
        this.setEdgeLabelStyle(label)
        if (edge.hasLabelSize()) {
          this.masterGraph.setLabelPreferredSize(label, edge.labelBounds.size)
        }
      }
    }
  }

  /**
   * Sets label style, if there are fixed bounds for this label
   */
  private setFixedBoundsLabelStyle(label: ILabel, bounds: Rect): void {
    const model = label.owner instanceof INode ? new FreeNodeLabelModel() : new FreeEdgeLabelModel()
    const parameter = model.findBestParameter(label, new OrientedRectangle(bounds))
    this.masterGraph.setLabelLayoutParameter(label, parameter)
    const defaultLabelStyle = this.setCustomLabelStyle(label)
    this.masterGraph.setStyle(label, defaultLabelStyle)
    this.masterGraph.setLabelPreferredSize(label, new Size(bounds.width, bounds.height))
  }

  /**
   * Sets label style for tasks (Centered)
   */
  private setInternalLabelStyle(label: ILabel): void {
    const model = new StretchNodeLabelModel({ padding: 3 })
    this.masterGraph.setLabelLayoutParameter(label, model.createParameter('center'))
    const defaultLabelStyle = this.setCustomLabelStyle(label)
    defaultLabelStyle.horizontalTextAlignment = HorizontalTextAlignment.CENTER
    defaultLabelStyle.verticalTextAlignment = VerticalTextAlignment.CENTER
    defaultLabelStyle.wrapping = TextWrapping.WRAP_WORD
    this.masterGraph.setStyle(label, defaultLabelStyle)
  }

  /**
   * Sets label style nodes that have an external label (bottom of the node).
   */
  private setExternalLabelStyle(label: ILabel): void {
    this.masterGraph.setLabelLayoutParameter(label, this.compositeLabelModel.parameters.first()!)
    const defaultLabelStyle = this.setCustomLabelStyle(label)
    defaultLabelStyle.horizontalTextAlignment = HorizontalTextAlignment.CENTER
    defaultLabelStyle.verticalTextAlignment = VerticalTextAlignment.CENTER
    this.masterGraph.setStyle(label, defaultLabelStyle)

    if (BpmnDiParser.MULTI_LINE_EXTERIOR_NODE_LABELS) {
      // Set some bounds to make labels multi - row
      const maxWidth = Math.max((label.owner as INode).layout.width * 1.5, 100)
      let maxHeight = label.preferredSize.height
      let width = maxWidth
      const height = maxHeight
      while (width < label.preferredSize.width) {
        maxHeight += height
        width += maxWidth
      }
      this.masterGraph.setLabelPreferredSize(label, new Size(maxWidth, maxHeight))
    }
  }

  /**
   * Sets label style for the TaskNameBand in a Choreography
   */
  private setChoreographyLabelStyle(label: ILabel): void {
    this.masterGraph.setLabelLayoutParameter(label, ChoreographyLabelModel.TASK_NAME_BAND)
    const defaultLabelStyle = this.setCustomLabelStyle(label)
    defaultLabelStyle.wrapping = TextWrapping.WRAP_WORD
    defaultLabelStyle.horizontalTextAlignment = HorizontalTextAlignment.CENTER
    defaultLabelStyle.verticalTextAlignment = VerticalTextAlignment.CENTER
    this.masterGraph.setStyle(label, defaultLabelStyle)
  }

  /**
   * Sets label style for SubProcesses (Upper left corner)
   */
  private setSubProcessLabelStyle(label: ILabel): void {
    const model = new StretchNodeLabelModel({ padding: 3 })
    this.masterGraph.setLabelLayoutParameter(label, model.createParameter('top'))
    const defaultLabelStyle = this.setCustomLabelStyle(label)
    defaultLabelStyle.horizontalTextAlignment = HorizontalTextAlignment.LEFT
    defaultLabelStyle.verticalTextAlignment = VerticalTextAlignment.TOP
    this.masterGraph.setStyle(label, defaultLabelStyle)
  }

  /**
   * Sets label style for Groups (Upper boundary)
   */
  private setGroupLabelStyle(label: ILabel): void {
    const model = new StretchNodeLabelModel({ padding: 3 })
    this.masterGraph.setLabelLayoutParameter(label, model.createParameter('top'))
    const defaultLabelStyle = this.setCustomLabelStyle(label)
    defaultLabelStyle.horizontalTextAlignment = HorizontalTextAlignment.CENTER
    this.masterGraph.setStyle(label, defaultLabelStyle)
  }

  /**
   * Sets edge label style
   */
  private setEdgeLabelStyle(label: ILabel): void {
    if (label) {
      const model = new EdgePathLabelModel(
        0,
        0,
        0,
        true,
        EdgeSides.ON_EDGE | EdgeSides.LEFT_OF_EDGE | EdgeSides.RIGHT_OF_EDGE
      )
      model.offset = 7
      model.sideOfEdge = EdgeSides.ABOVE_EDGE
      model.autoRotation = false
      this.masterGraph.setLabelLayoutParameter(label, model.createRatioParameter())
      const defaultLabelStyle = this.setCustomLabelStyle(label)
      defaultLabelStyle.horizontalTextAlignment = HorizontalTextAlignment.CENTER
      this.masterGraph.setStyle(label, defaultLabelStyle)
    }
  }

  /**
   * Sets custom style elements
   */
  private setCustomLabelStyle(label: ILabel): LabelStyle {
    const styleName = label.tag
    return this.currentDiagram.getStyle(styleName)
  }

  /**
   * Builds all edges, except for message flows
   */
  private buildDefaultEdge(edge: BpmnEdge, type: number): IEdge | null {
    const sourceVar = edge.source
    const targetVar = edge.target
    const waypoints = edge.waypoints
    const id = edge.id

    // Check, if source and target were correctly parsed
    if (!sourceVar) {
      this.document.messages.add('Edge ' + id + ' has no valid Source.')
      return null
    }
    if (!targetVar) {
      this.document.messages.add('Edge ' + id + ' has no valid Target.')
      return null
    }

    // Get source & target node
    let sourceNode: INode | null = sourceVar.node
    let targetNode: INode | null = targetVar.node

    if (!sourceNode || !targetNode) {
      return null
    }

    // Get bends & ports from waypoints
    const count = waypoints.size
    let source = sourceNode.layout.center
    let target = targetNode.layout.center
    if (count > 0) {
      // First waypoint is source Port
      source = waypoints.get(0)
      // Last is target port
      target = waypoints.get(count - 1)
      waypoints.remove(source)
      waypoints.remove(target)
    }

    let sourcePort: IPort | null = null
    let targetPort: IPort | null = null

    // Use boundary event port, if source is a boundary event
    if (sourceVar.name === 'boundaryEvent') {
      sourcePort = sourceVar.port
      if (sourcePort) {
        sourceNode = sourcePort.owner as INode
      } else {
        this.document.messages.add(
          'The source boundary event for edge ' + id + ' was not (yet) created.'
        )
        return null
      }
    } else if (sourceNode) {
      sourcePort = this.masterGraph.addPortAt(sourceNode, source)
    }

    // Use boundary event port, if target is a boundary event
    if (targetVar.name === 'boundaryEvent') {
      targetPort = targetVar.port
      if (targetPort) {
        targetNode = targetPort.owner as INode
      } else {
        this.document.messages.add(
          'The target boundary event for edge ' + id + ' was not (yet) created.'
        )
        return null
      }
    } else if (targetNode) {
      targetPort = this.masterGraph.addPortAt(targetNode, target)
    }

    // Test for textAnnotation, workaround fix for textAnnotations
    if (type === BpmnEdgeType.ASSOCIATION) {
      if (!targetNode) {
        targetPort = this.masterGraph.addPortAt(sourceNode, target)
      }

      if (!sourceNode) {
        sourcePort = this.masterGraph.addPortAt(targetNode, source)
      }
    }

    // Test if one of the ports is still null, notify user and carry on.
    if (!sourcePort) {
      this.document.messages.add('Edge ' + id + ' has no valid Source.')
      return null
    }
    if (!targetPort) {
      this.document.messages.add('Edge ' + id + ' has no valid Target.')
      return null
    }

    // Create edge on graph
    const iEdge = this.masterGraph.createEdge(sourcePort, targetPort)
    for (const point of waypoints) {
      this.masterGraph.addBend(iEdge, point, -1)
    }

    edge.element!.edge = iEdge

    // Set edge style
    const edgeStyle = new BpmnEdgeStyle()
    edgeStyle.type = type
    this.masterGraph.setStyle(iEdge, edgeStyle)

    return iEdge
  }

  /**
   * Builds MessageFlow edges
   */
  private buildMessageFlow(edge: BpmnEdge): IEdge | null {
    const sourceVar = edge.source
    const targetVar = edge.target
    const waypoints = edge.waypoints
    const id = edge.id

    // Check, if source and target were correctly parsed
    if (!sourceVar) {
      this.document.messages.add('Edge ' + id + ' has no valid Source.')
      return null
    }
    if (!targetVar) {
      this.document.messages.add('Edge ' + id + ' has no valid Target.')
      return null
    }

    // Get source & target node
    const sourceNode = sourceVar.node!
    const targetNode = targetVar.node!

    // Get bends & ports from waypoints
    const count = waypoints.size
    let source = sourceNode.layout.center
    let target = targetNode.layout.center
    if (count > 0) {
      // First waypoint is source Port
      source = waypoints.get(0)
      // Last is target port
      target = waypoints.get(count - 1)
      waypoints.remove(source)
      waypoints.remove(target)
    }

    // Get source & target port
    const sourcePort =
      sourceVar.name === 'boundaryEvent'
        ? sourceVar.port
        : this.masterGraph.addPortAt(sourceNode, source)!
    const targetPort =
      targetVar.name === 'boundaryEvent'
        ? targetVar.port
        : this.masterGraph.addPortAt(targetNode, target)!

    const iEdge = this.masterGraph.createEdge(sourcePort!, targetPort!)
    for (const point of waypoints) {
      this.masterGraph.addBend(iEdge, point, -1)
    }
    edge.element!.edge = iEdge

    // If there is a message icon, add a corresponding label
    switch (edge.messageVisibleK) {
      case MessageVisibleKind.INITIATING: {
        const messageLabel = this.masterGraph.addLabel(iEdge, '')
        const messageLabelStyle = new MessageLabelStyle()
        messageLabelStyle.isInitiating = true
        this.masterGraph.setStyle(messageLabel, messageLabelStyle)
        const model = new EdgeSegmentLabelModel(
          0,
          0,
          0,
          true,
          EdgeSides.ON_EDGE | EdgeSides.LEFT_OF_EDGE | EdgeSides.RIGHT_OF_EDGE
        )
        model.sideOfEdge = EdgeSides.ON_EDGE
        model.autoRotation = false
        this.masterGraph.setLabelPreferredSize(messageLabel, this.bpmnMessageSize)
        this.masterGraph.setLabelLayoutParameter(
          messageLabel,
          model.createParameterFromCenter(0.5, EdgeSides.ON_EDGE)
        )
        break
      }
      case MessageVisibleKind.NON_INITIATING: {
        const messageLabel = this.masterGraph.addLabel(iEdge, '')
        const messageLabelStyle = new MessageLabelStyle()
        messageLabelStyle.isInitiating = false
        this.masterGraph.setStyle(messageLabel, messageLabelStyle)
        const model = new EdgeSegmentLabelModel(
          0,
          0,
          0,
          true,
          EdgeSides.ON_EDGE | EdgeSides.LEFT_OF_EDGE | EdgeSides.RIGHT_OF_EDGE
        )
        model.sideOfEdge = EdgeSides.ON_EDGE
        model.autoRotation = false
        this.masterGraph.setLabelPreferredSize(messageLabel, this.bpmnMessageSize)
        this.masterGraph.setLabelLayoutParameter(
          messageLabel,
          model.createParameterFromCenter(0.5, EdgeSides.ON_EDGE)
        )
        break
      }
      case MessageVisibleKind.UNSPECIFIED:
        break
    }

    // Set edge style
    const edgeStyle = new BpmnEdgeStyle()
    edgeStyle.type = BpmnEdgeType.MESSAGE_FLOW
    this.masterGraph.setStyle(iEdge, edgeStyle)

    return iEdge
  }

  private buildPool(element: BpmnElement, plane: BpmnPlane, localRoot: INode | null): INode {
    let parent: BpmnElement = element.parent!
    while (parent.name !== 'process' && parent.name !== 'subProcess') {
      parent = parent.parent!
    }

    let layout: Rect = Rect.EMPTY
    let isHorizontal: boolean | null = null
    let multipleInstance = false

    let tableShape: BpmnShape | null = this.getShape(element, plane)
    if (!tableShape && parent) {
      tableShape = this.getShape(parent, plane)
      if (!tableShape && this.processRefSource.has(parent)) {
        const processRefSource = this.processRefSource.get(parent)!
        tableShape = this.getShape(processRefSource, plane)
        if (processRefSource.hasChild('participantMultiplicity')) {
          if (
            convertToInt(
              processRefSource.getChildAttribute('participantMultiplicity', 'maximum')!
            ) > 1
          ) {
            multipleInstance = true
          }
        }
      }
    }

    if (tableShape) {
      // table has a shape itself so we use its layout to initialize the table
      layout = new Rect(tableShape.x, tableShape.y, tableShape.width, tableShape.height)
      if (tableShape.isHorizontal != null) {
        isHorizontal = tableShape.isHorizontal
      }
    }
    const calculateRect = layout.isEmpty
    if (calculateRect || isHorizontal == null) {
      // check the child lanes for their shapes
      for (const lane of element.getChildren('lane')) {
        const laneShape = this.getShape(lane, plane)
        if (laneShape) {
          if (calculateRect) {
            layout = Rect.add(
              layout,
              new Rect(laneShape.x, laneShape.y, laneShape.width, laneShape.height)
            )
          }
          if (isHorizontal == null && laneShape.isHorizontal != null) {
            isHorizontal = laneShape.isHorizontal
          }
        }
      }
    }
    // fallback
    isHorizontal = isHorizontal ?? false
    let node: INode
    if (!layout.isEmpty) {
      let table: ITable
      if (parent && parent.table) {
        table = parent.table
        node = parent.node!
      } else {
        // table was already initialized for the Process due to a Participant element
        node = this.masterGraph.createNode(localRoot, layout)
        const poolStyle = BpmnDiParser.createPoolNodeStyle(isHorizontal)
        poolStyle.multipleInstance = multipleInstance
        this.masterGraph.setStyle(node, poolStyle)
        table = poolStyle.tableNodeStyle.table

        // create dummy stripe for the direction where no lanes are defined
        if (isHorizontal) {
          const col = table.createColumn(layout.width - table.rowDefaults.padding.left)
          col.tag = new Point(layout.x, layout.y)
        } else {
          const row = table.createRow(layout.height - table.columnDefaults.padding.top)
          row.tag = new Point(layout.x, layout.y)
        }
      }

      let parentStripe: IStripe = isHorizontal
        ? (table.rootRow.childRows.at(0) ?? table.rootRow)
        : (table.rootColumn.childColumns.at(0) ?? table.rootColumn)
      if (tableShape) {
        parentStripe = this.addToTable(tableShape, table, node, parentStripe, isHorizontal)
      }

      element.node = node
      if (!parent.node) {
        parent.node = node
      }

      this.addChildLanes(element, table, parentStripe, plane, node, isHorizontal)

      // Resize the root row/column after adding a column/row with insets
      if (isHorizontal) {
        const max = table.rootRow.leaves
          .map((s: IStripe) => s.layout.x - table.layout.x + s.totalPadding.left)
          .reduce((acc: number, val: number) => Math.max(acc, val), Number.MIN_VALUE)
        table.setSize(table.rootColumn.childColumns.first()!, node.layout.width - max)
      } else {
        const max = table.rootColumn.leaves
          .map((s: IStripe) => s.layout.y - table.layout.y + s.totalPadding.top)
          .reduce((acc: number, val: number) => Math.max(acc, val), Number.MIN_VALUE)
        table.setSize(table.rootRow.childRows.first()!, node.layout.height - max)
      }

      /*
       * There can be situations, in which the table Layout does not match the node size. In this case, we
       * resize the node
       */
      if (node.layout.width !== table.layout.width) {
        this.masterGraph.setNodeLayout(
          node,
          new Rect(node.layout.x, node.layout.y, table.layout.width, node.layout.height)
        )
      }
      if (node.layout.height !== table.layout.height) {
        this.masterGraph.setNodeLayout(
          node,
          new Rect(node.layout.x, node.layout.y, node.layout.width, table.layout.height)
        )
      }
    }
    return node!
  }

  private addChildLanes(
    element: BpmnElement,
    table: ITable,
    parentStripe: IStripe,
    plane: BpmnPlane,
    node: INode,
    isHorizontal: boolean
  ): void {
    for (const lane of element.getChildren('lane')) {
      const laneShape = this.getShape(lane, plane)
      if (laneShape) {
        const addedStripe = this.addToTable(laneShape, table, node, parentStripe, isHorizontal)
        for (const refElement of lane.getChildren('flowNodeRef')) {
          const bpmnElement = { value: null }
          if (refElement.value && this.tryGetElementForId(refElement.value, bpmnElement)) {
            ;(bpmnElement.value! as BpmnElement).parent!.node = node
          }
        }
        const childLaneSet = lane.getChild('childLaneSet')
        if (childLaneSet) {
          this.addChildLanes(childLaneSet, table, addedStripe, plane, node, isHorizontal)
        }
      }
    }
  }

  /**
   * Adds the given lane to the appropriate table (pool), or creates a new one
   */
  private addToTable(
    shape: BpmnShape,
    table: ITable,
    node: INode,
    parentStripe: IStripe,
    isHorizontal: boolean
  ): IStripe {
    // lane element
    const element = shape.element!

    // Link the node to the BpmnElement of the lane

    element.node = node
    if (isHorizontal) {
      const parentRow = parentStripe instanceof IRow ? parentStripe : null
      // getIndex
      const index = parentRow
        ? parentRow.childRows.filter((siblingRow) => siblingRow.tag.y < shape.y).size
        : -1

      const row = table.createChildRow({
        parent: parentRow,
        height: shape.height,
        index: index,
        tag: new Point(shape.x, shape.y)
      })

      BpmnDiParser.addTableLabel(table, row, shape)
      return row
    } else {
      const parentCol = parentStripe instanceof IColumn ? parentStripe : null
      // getIndex
      const index = parentCol
        ? parentCol.childColumns.filter((siblingCol) => siblingCol.tag.x < shape.x).size
        : -1

      const col = table.createChildColumn({
        parent: parentCol,
        width: shape.width,
        index: index,
        tag: new Point(shape.x, shape.y)
      })

      BpmnDiParser.addTableLabel(table, col, shape)
      return col
    }
  }

  /**
   * Creates table (participant/pool)
   */
  private static createTable(shape: BpmnShape): PoolNodeStyle {
    const poolNodeStyle = BpmnDiParser.createPoolNodeStyle(shape.isHorizontal ?? false)
    const table = poolNodeStyle.tableNodeStyle.table

    // Create first row & column
    const col = table.createColumn(shape.width - table.rowDefaults.padding.left)
    const row = table.createRow(shape.height - table.columnDefaults.padding.top)

    const location = new Point(shape.x, shape.y)
    row.tag = location
    col.tag = location
    return poolNodeStyle
  }

  private static createPoolNodeStyle(isHorizontal: boolean): PoolNodeStyle {
    const partStyle = new PoolNodeStyle(!isHorizontal)
    const table = partStyle.tableNodeStyle.table

    if (isHorizontal) {
      table.columnDefaults.padding = Insets.EMPTY
    } else {
      table.rowDefaults.padding = Insets.EMPTY
    }

    // Set table padding to 0
    table.padding = Insets.EMPTY

    return partStyle
  }
}

/**
 * Class for BPMNDiagram objects.
 */
export class BpmnDiagram {
  // BPMNPlane of this diagram
  plane: BpmnPlane | null = null
  // The default label style for this diagram instance
  defaultStyle: LabelStyle = null!
  // List of all child diagrams this diagram contains
  children: HashMap<BpmnDiagram, BpmnElement> = new HashMap()
  // All BPMNLabelStyle instances of this diagram
  styles: HashMap<string, BpmnLabelStyle> = new HashMap()
  // Id of this diagram
  id = ''
  // These parameters are currently unused. They are part of the BPMN Syntax and might be used in the future.
  documentation = ''
  resolution = ''
  // Get name, if it exists
  // The name of this diagram
  name: string

  /**
   * Constructs a new diagram instance
   * @param xNode The XML node which is the root for this diagram instance
   */
  constructor(xNode: Element) {
    this.name = BpmnNamespaceManager.getAttributeValue(xNode, BpmnNamespaceManager.BPMN, 'name')
    // Name Diagram "Unnamed", if it has no name (for choosing, if file contains multiple diagrams)
    if (!this.name) {
      this.name = 'Unnamed Diagram'
    }
    this.id = BpmnNamespaceManager.getAttributeValue(xNode, BpmnNamespaceManager.BPMN, 'id')
    this.documentation = BpmnNamespaceManager.getAttributeValue(
      xNode,
      BpmnNamespaceManager.BPMN,
      'documentation'
    )
    this.resolution = BpmnNamespaceManager.getAttributeValue(
      xNode,
      BpmnNamespaceManager.BPMN,
      'resolution'
    )
  }

  /**
   * Adds a plane to this diagram. Only happens once, but is caught elsewhere
   */
  addPlane(plane: BpmnPlane): void {
    this.plane = plane
  }

  /**
   * Adds a LabelStyle to the collection of styles in this diagram
   * @param style The {@link BpmnLabelStyle} to add
   */
  addStyle(style: BpmnLabelStyle): void {
    this.styles.set(style.id, style)
  }

  /**
   * Returns the given Style, or the default style, in case it does nor exist
   * @param style The id (name) of the style to get
   */
  getStyle(style: string): LabelStyle {
    if (!style) {
      return this.defaultStyle.clone()
    }
    if (this.styles.has(style)) {
      return this.styles.get(style)!.getStyle().clone()
    }
    return this.defaultStyle.clone()
  }

  /**
   * Adds a child diagramm to this diagram
   * @param diagram The child diagram
   * @param localRoot The local root element
   */
  addChild(diagram: BpmnDiagram, localRoot: BpmnElement): void {
    this.children.set(diagram, localRoot)
  }

  /**
   * @returns The name of the Diagram
   */
  toString(): string {
    return this.name
  }
}

/**
 * Utility class holding the information of a BPMN {@link Document}.
 */
export class BpmnDocument {
  // Mapping of all IDs of BPMN elements to these elements.
  elements: HashMap<string, BpmnElement> = new HashMap()
  // List of all diagrams, that are parsed from this document.
  diagrams: List<BpmnDiagram> = new List()
  // List of diagrams representing a "process", "choreography" or "collaboration"
  topLevelDiagrams: List<BpmnDiagram> = new List()
  // Mapping from a BPMN element to the diagram representing it.
  elementToDiagram: HashMap<BpmnElement, BpmnDiagram> = new HashMap()
  // Collection of all warning during program flow
  messages: List<string> = new List()

  /**
   * Creates a new instance for the BPMN {@link Document}.
   * @param doc The BPMN document to parse.
   */
  constructor(doc: Document) {
    // parse the XML file
    const callingElements = new List<BpmnElement>()
    this.recursiveElements(doc.documentElement, null, callingElements)

    // collect all elements that are linked to from a plane
    for (const diagram of this.diagrams) {
      try {
        const planeElement = diagram.plane!.element!
        this.elementToDiagram.set(planeElement, diagram)
      } catch {
        this.messages.add(`Tried to add a diagram with the already existing id: ${diagram.id}`)
      }
    }

    // collect all diagrams where the plane corresponds to a Top Level BpmnElement (Process/Choreography/Collaboration)
    for (const diagram of this.diagrams) {
      const element = diagram.plane!.element!
      const elementName = element.name
      if (
        elementName === 'process' ||
        elementName === 'choreography' ||
        elementName === 'collaboration'
      ) {
        this.topLevelDiagrams.add(diagram)
        for (const callingElement of callingElements) {
          if (callingElement.calledElement === element.id) {
            const parent = callingElement.getNearestAncestor(this.elementToDiagram)
            if (parent) {
              parent.addChild(diagram, callingElement)
            }
          }
        }
        for (const child of element.children) {
          this.collectChildDiagrams(child, diagram)
        }
      }
    }
  }

  /**
   * Collect all {@link BpmnDiagram} where the plane corresponds to a {@link BpmnElement} in `diagram`.
   * @param bpmnElement The element to check.
   * @param diagram The diagram to collect the child diagrams for.
   */
  private collectChildDiagrams(bpmnElement: BpmnElement, diagram: BpmnDiagram): void {
    let currentDiagram: BpmnDiagram = diagram

    if (this.elementToDiagram.has(bpmnElement)) {
      const childDiagram = this.elementToDiagram.get(bpmnElement)!
      diagram.addChild(childDiagram, bpmnElement)
      currentDiagram = childDiagram
    }
    for (const child of bpmnElement.children) {
      this.collectChildDiagrams(child, currentDiagram)
    }
    if (bpmnElement.process && this.elements.has(bpmnElement.process)) {
      const process = this.elements.get(bpmnElement.process)!
      this.collectChildDiagrams(process, currentDiagram)
    }
  }

  /**
   * Traverses Depth-First through the bpmn XML file, collecting and linking all Elements.
   * @param xNode The XML node to start with
   * @param parent The parent {@link BpmnElement}
   * @param callingElements A list to add all {@link BpmnElement} with a valid 'CalledElement' or 'Process' property.
   */
  private recursiveElements(
    xNode: Element,
    parent: BpmnElement | null,
    callingElements: ICollection<BpmnElement>
  ): void {
    const element = new BpmnElement(xNode)
    if (element.calledElement) {
      callingElements.add(element)
    } else if (element.process) {
      callingElements.add(element)
    }

    // Only xml nodes with an id can be bpmn elements
    if (element.id) {
      try {
        this.elements.set(element.id, element)
        // some tools prefix the ids with a namespace prefix but don't use this namespace to reference it
        // so if the id contains a prefix, it is mapped with and without it
        const prefix = xNode.prefix
        if (prefix) {
          this.elements.set(`${prefix}:${element.id}`, element)
        }
      } catch {
        this.messages.add(
          `Error while trying to add second Element with the same id: ${element.id}`
        )
      }
    }

    // Double-link bpmn element to the given parent element
    if (parent) {
      parent.addChild(element)
    }
    element.parent = parent

    // Call all xml children
    for (let i = 0; i < xNode.children.length; ++i) {
      const xChild = xNode.children[i]
      const nameSpace = xChild.namespaceURI
      const localName = xChild.localName
      if (nameSpace === BpmnNamespaceManager.BPMN) {
        // Add all bpmn elements to the dictionary
        this.recursiveElements(xChild, element, callingElements)
      } else if (nameSpace === BpmnNamespaceManager.BPMN_DI) {
        // Parse a diagram as whole
        if (localName === 'BPMNDiagram') {
          const diagram = this.buildDiagram(xChild)
          if (diagram.plane) {
            this.diagrams.add(diagram)
          } else {
            this.messages.add(
              'The plane for diagram + ' + diagram.id + ' was not correctly parsed.'
            )
          }
        }
      } else {
        element.foreignChildren.add(xChild)
      }
    }
  }

  /**
   * Creates a {@link BpmnDiagram}.
   * @param xNode The XML node to start with
   * @returns The parsed {@link BpmnDiagram}
   */
  private buildDiagram(xNode: Element): BpmnDiagram {
    const diagram = new BpmnDiagram(xNode)

    const bpmnPlane = this.buildPlane(
      BpmnNamespaceManager.getElement(xNode, BpmnNamespaceManager.BPMN_DI, 'BPMNPlane')!
    )
    if (bpmnPlane) {
      diagram.addPlane(bpmnPlane)
    }

    for (const xChild of BpmnNamespaceManager.getElements(
      xNode,
      BpmnNamespaceManager.BPMN_DI,
      'BPMNLabelStyle'
    )) {
      const style = new BpmnLabelStyle(xChild)
      diagram.addStyle(style)
    }

    // Setting a default LabelStyle for all labels that do not have their own style.
    diagram.defaultStyle = BpmnLabelStyle.newDefaultInstance()

    return diagram
  }

  /**
   * Parse all bpmn shapes and bpmn edges and their associations and attributes from one {@link BpmnPlane}
   * @param xNode The XML node to start with
   */
  private buildPlane(xNode: Element): BpmnPlane | null {
    const plane = new BpmnPlane(xNode, this.elements)
    if (!plane.element) {
      return null
    }

    // All Shapes
    for (const xChild of BpmnNamespaceManager.getElements(
      xNode,
      BpmnNamespaceManager.BPMN_DI,
      'BPMNShape'
    )) {
      const shape = new BpmnShape(xChild, this.elements)
      if (shape.element) {
        plane.addShape(shape)
      } else {
        this.messages.add(
          'Error in parsing shape ' + shape.id + ', could not find corresponding BPMNElement.'
        )
        continue
      }

      // Shapes usually define their bounds
      shape.addBounds(BpmnNamespaceManager.getElement(xChild, BpmnNamespaceManager.DC, 'Bounds')!)

      // Shapes can have a BPMNLabel as child
      const bpmnLabel = BpmnNamespaceManager.getElement(
        xChild,
        BpmnNamespaceManager.BPMN_DI,
        'BPMNLabel'
      )
      if (bpmnLabel) {
        // Label bounds
        const bounds = BpmnNamespaceManager.getElement(
          bpmnLabel,
          BpmnNamespaceManager.DC,
          'Bounds'
        )!
        shape.addLabel(bounds)
        // BpmnLabelStyle
        shape.labelStyle = BpmnNamespaceManager.getAttributeValue(
          bpmnLabel,
          BpmnNamespaceManager.BPMN_DI,
          'labelStyle'
        )
      }
    }

    for (const xChild of BpmnNamespaceManager.getElements(
      xNode,
      BpmnNamespaceManager.BPMN_DI,
      'BPMNEdge'
    )) {
      const edge = new BpmnEdge(xChild, this.elements)
      if (edge.element) {
        plane.addEdge(edge)
      } else {
        this.messages.add(
          'Error in parsing edge ' + edge.id + ', could not find corresponding BPMNElement.'
        )
        continue
      }

      // Edges define 2 or more Waypoints
      for (const waypoint of BpmnNamespaceManager.getElements(
        xChild,
        BpmnNamespaceManager.DI,
        'waypoint'
      )) {
        edge.addWayPoint(waypoint)
      }

      // Edges can have a BPMNLabel as child
      const bpmnLabel = BpmnNamespaceManager.getElement(
        xChild,
        BpmnNamespaceManager.BPMN_DI,
        'BPMNLabel'
      )
      if (bpmnLabel) {
        // Label bounds
        const bounds = BpmnNamespaceManager.getElement(
          bpmnLabel,
          BpmnNamespaceManager.DC,
          'Bounds'
        )!
        edge.addLabel(bounds)
        // BpmnLabelStyle
        edge.labelStyle = BpmnNamespaceManager.getAttributeValue(
          bpmnLabel,
          BpmnNamespaceManager.BPMN_DI,
          'labelStyle'
        )
      }
    }
    return plane
  }
}

/**
 * Class for BPMNEdge objects
 */
export class BpmnEdge {
  private static _CALCULATE_SIZE_LABEL_STYLE: LabelStyle
  private static _CALCULATE_SIZE_LABEL: SimpleLabel

  // The custom style of this label
  labelStyle: string = null!
  // List of all waypoints (ports and bends)
  waypoints: List<Point> = new List()
  // True, if this edge has a label
  hasLabel = false
  // The label bounds of this edge
  labelBounds: Rect = new Rect(0, 0, 0, 0)
  // The source element of this edge
  source: BpmnElement | null = null
  // The target element of this edge
  target: BpmnElement | null = null
  // Visibility of a message envelope on this edge
  messageVisibleK: number
  // Get id
  // The id of this edge
  id: string
  // The {@link BpmnElement} this edge references to
  element: BpmnElement | null

  static get CALCULATE_SIZE_LABEL(): SimpleLabel {
    if (typeof BpmnEdge._CALCULATE_SIZE_LABEL === 'undefined') {
      BpmnEdge._CALCULATE_SIZE_LABEL = new SimpleLabel(
        new SimpleNode(),
        '',
        FreeNodeLabelModel.CENTER
      )
    }

    return BpmnEdge._CALCULATE_SIZE_LABEL
  }

  static get CALCULATE_SIZE_LABEL_STYLE(): LabelStyle {
    if (typeof BpmnEdge._CALCULATE_SIZE_LABEL_STYLE === 'undefined') {
      BpmnEdge._CALCULATE_SIZE_LABEL_STYLE = new LabelStyle()
    }

    return BpmnEdge._CALCULATE_SIZE_LABEL_STYLE
  }

  /**
   * Calculate the preferred size for `text` using a {@link LabelStyle}.
   * @param text The text to measure.
   * @returns The preferred Size of the given text.
   */
  static calculatePreferredSize(text: string): Size {
    BpmnEdge.CALCULATE_SIZE_LABEL.text = text
    return BpmnEdge.CALCULATE_SIZE_LABEL_STYLE.renderer.getPreferredSize(
      BpmnEdge.CALCULATE_SIZE_LABEL,
      BpmnEdge.CALCULATE_SIZE_LABEL_STYLE
    )
  }

  /**
   * Constructs a new edge instance
   * @param xEdge The XML element which represents this edge
   * @param elements Dictionary of all bpmn elements from this file parsing
   */
  constructor(xEdge: Element, elements: IMap<string, BpmnElement>) {
    // Visibility of a message envelope on this edge
    this.messageVisibleK = MessageVisibleKind.UNSPECIFIED

    // Get id
    // The id of this edge
    this.id = BpmnNamespaceManager.getAttributeValue(xEdge, BpmnNamespaceManager.BPMN_DI, 'Id')
    // Get and link element
    const attribute = BpmnNamespaceManager.getAttributeValue(
      xEdge,
      BpmnNamespaceManager.BPMN_DI,
      'bpmnElement'
    )
    this.element = attribute ? (elements.has(attribute) ? elements.get(attribute) : null) : null

    // If there is no element, skip
    if (!this.element) {
      return
    }

    // Source and target elements can be specified as attribute of the element
    // or as children of the element (in data associations).
    let sourceRef: string
    let targetRef: string

    // Getting source element id
    const sourceVar = this.element.source
    if (sourceVar) {
      sourceRef = sourceVar
    } else {
      sourceRef = this.element.loadSourceFromChild()
    }

    // Getting and linking source element
    if (elements.has(sourceRef)) {
      this.source = elements.get(sourceRef)
    }

    // Getting target element id
    const targetVar = this.element.target
    if (targetVar) {
      targetRef = targetVar
    } else {
      targetRef = this.element.loadTargetFromChild()
    }

    // Getting and linking target element
    if (elements.has(targetRef)) {
      this.target = elements.get(targetRef)
    }

    switch (
      BpmnNamespaceManager.getAttributeValue(
        xEdge,
        BpmnNamespaceManager.BPMN_DI,
        'messageVisibleKind'
      )
    ) {
      case 'non_initiating':
        this.messageVisibleK = MessageVisibleKind.NON_INITIATING
        break
      case 'initiating':
        this.messageVisibleK = MessageVisibleKind.INITIATING
        break
      default:
        this.messageVisibleK = MessageVisibleKind.UNSPECIFIED
        break
    }
  }

  /**
   * Add a label and its bounds to the edge
   * @param xBounds The XML element of the label bounds
   */
  addLabel(xBounds: Element): void {
    this.hasLabel = true
    if (!xBounds) {
      return
    }

    // If there are bounds, set standard values, first.
    let labelX = 0
    let labelY = 0
    let labelWidth = 100
    let labelHeight = 20

    let attr: string = BpmnNamespaceManager.getAttributeValue(xBounds, BpmnNamespaceManager.DC, 'x')
    if (attr) {
      labelX = convertToDouble(attr)
    }

    attr = BpmnNamespaceManager.getAttributeValue(xBounds, BpmnNamespaceManager.DC, 'y')
    if (attr) {
      labelY = convertToDouble(attr)
    }

    attr = BpmnNamespaceManager.getAttributeValue(xBounds, BpmnNamespaceManager.DC, 'height')
    if (attr) {
      labelHeight = convertToDouble(attr)
    }

    attr = BpmnNamespaceManager.getAttributeValue(xBounds, BpmnNamespaceManager.DC, 'width')
    if (attr) {
      labelWidth = convertToDouble(attr)
    }

    // In case, the label sizes were set to 0
    if (labelWidth < 1 || labelHeight < 1) {
      const text = this.element!.label
      const preferredSize = BpmnEdge.calculatePreferredSize(text)

      labelWidth = preferredSize.width
      labelHeight = preferredSize.height
    }

    this.labelBounds = new Rect(labelX, labelY, labelWidth, labelHeight)
  }

  /**
   * Adds a waypoint to the edge
   * @param xWaypoint The waypoint to add
   */
  addWayPoint(xWaypoint: Element): void {
    let x = 0
    let y = 0

    let attr: string = BpmnNamespaceManager.getAttributeValue(
      xWaypoint,
      BpmnNamespaceManager.DI,
      'x'
    )
    if (attr) {
      x = convertToDouble(attr)
    }
    attr = BpmnNamespaceManager.getAttributeValue(xWaypoint, BpmnNamespaceManager.DI, 'y')
    if (attr) {
      y = convertToDouble(attr)
    }

    const tuple = new Point(x, y)
    this.waypoints.add(tuple)
  }

  /**
   * Returns true, if the edge has width and height attributes set.
   * @returns True, if the label has size, false if not
   */
  hasLabelSize(): boolean {
    return this.labelBounds.width > 0 && this.labelBounds.height > 0
  }

  /**
   * Returns true, if the top left point of the bounds is not 0/0 (standard case)
   * @returns True, if the label has a given position, false if it is 0/0
   */
  hasLabelPosition(): boolean {
    return this.labelBounds.x > 0 && this.labelBounds.y > 0
  }

  /**
   * Returns the value of the given attribute of the linked BpmnElement, or null
   * @param attribute Id (name) of the attribute to get
   * @returns value of the attribute or null
   */
  getAttribute(attribute: string): string | null {
    return this.element!.getValue(attribute)
  }
}

/**
 * Class for Bpmn Element objects
 */
export class BpmnElement {
  // Id of this element
  id: string | null = null
  // Number of TopParticipants, if this is a choreography Node
  topParticipants = 0
  // Number of BottomParticipants, if this is a choreography Node
  bottomParticipants = 0
  // The parent BpmnElement
  parent: BpmnElement | null = null
  // The corresponding INode, if this element is a BpmnShape
  node: INode | null = null
  // The corresponding table, if this element is part of a pool
  table: ITable | null = null
  // The reference to a process, if this element is a subprocess
  process: string | null = null
  // The source element, if this element is an edge
  source: string | null = null
  // The target element, if this element is an edge
  target: string | null = null
  // The element called by this element, if it is a calling element
  calledElement: string | null = null
  // The corresponding IPort if this element is a BoundaryEvent
  port: IPort | null = null
  // The corresponding IEdge, if this element is an Edge
  edge: IEdge | null = null
  // List of all children of this element
  children: List<BpmnElement> = new List()
  // List of all {@link Node} that were children of this element but have a different namespace then {@link BpmnNamespaceManager.BPMN} or {@link BpmnNamespaceManager.BPMN_DI}.
  foreignChildren: List<Element> = new List()
  // List of all attributes, that do not have a Property
  attributes: HashMap<string, string> = new HashMap()
  // Initialize blank Label
  // The label text of this element
  label = ''
  // The value (string text between XML tags) of this Element
  value: string | null
  // The name of the element type
  name: string

  /**
   * Class for BPMNElement objects
   * @param xNode The XML Node to turn into a BpmnElement
   */
  constructor(xNode: Element) {
    // Parsing all Attributes
    const attrList = new List<Attr>()
    for (let i = 0; i < xNode.attributes.length; ++i) {
      attrList.add(xNode.attributes[i])
    }
    for (const attribute of BpmnNamespaceManager.attributesInNamespace(
      attrList,
      BpmnNamespaceManager.BPMN
    )) {
      const localName = attribute.localName
      switch (localName) {
        case 'id':
          this.id = attribute.value
          break
        case 'name':
          this.label = attribute.value
          break
        case 'sourceRef':
          this.source = attribute.value
          break
        case 'targetRef':
          this.target = attribute.value
          break
        case 'processRef':
          this.process = attribute.value
          break
        case 'calledElement':
        case 'calledChoreographyRef':
          this.calledElement = attribute.value
          break
        default:
          this.attributes.set(localName, attribute.value)
          break
      }
    }

    // The value (string text between XML tags) of this Element
    this.value = xNode.textContent
    // The name of the element type
    this.name = xNode.localName
    switch (this.name) {
      case 'group':
        this.label = BpmnNamespaceManager.getAttributeValue(
          xNode,
          BpmnNamespaceManager.BPMN,
          'categoryValueRef'
        )
        break
      case 'textAnnotation': {
        const element = BpmnNamespaceManager.getElement(xNode, BpmnNamespaceManager.BPMN, 'text')
        if (element) {
          this.label = element.textContent!
        }
        break
      }
    }
  }

  /**
   * Adds a child to the current BpmnElement
   * @param child The child to be added
   */
  addChild(child: BpmnElement): void {
    this.children.add(child)
  }

  /**
   * Returns true, if a child with the given name exists
   * @param name The name
   */
  hasChild(name: string): boolean {
    for (const child of this.children) {
      if (child.name === name) {
        return true
      }
    }
    return false
  }

  /**
   * Returns the Value of an Attribute of a given child
   * @param name The name
   * @param attribute The Attribute
   */
  getChildAttribute(name: string, attribute: string): string | null {
    let value: string | null = null
    for (const child of this.children) {
      if (child.name === name) {
        value = child.attributes.has(attribute) ? child.attributes.get(attribute) : null
      }
    }
    return value
  }

  /**
   * Returns the first child with the given name
   * @param name The name
   */
  getChild(name: string): BpmnElement | null {
    for (const child of this.children) {
      if (child.name === name) {
        return child
      }
    }
    return null
  }

  /**
   * Returns all children with the given name
   * @param name The name
   */
  getChildren(name: string): IEnumerable<BpmnElement> {
    const retChildren = new List<BpmnElement>()
    for (const child of this.children) {
      if (child.name === name) {
        retChildren.add(child)
      }
    }
    return retChildren
  }

  /**
   * Retrieves the sourceRef string of the current element
   * @returns The sourceRef string
   */
  loadSourceFromChild(): string {
    let ret = ''
    for (const child of this.children) {
      if (child.name === 'sourceRef') {
        ret = child.value!
      }
    }
    return ret
  }

  /**
   * Retrieves the targetRef string of the current element
   * @returns The targetRef string
   */
  loadTargetFromChild(): string {
    let ret = ''
    for (const child of this.children) {
      if (child.name === 'targetRef') {
        ret = child.value!
      }
    }
    return ret
  }

  /**
   * Sets the INode of all dataInput and dataOutput hidden children to the given node
   * @param node The node
   */
  setINodeInputOutput(node: INode): void {
    for (const child of this.children) {
      const name = child.name
      if (name === 'ioSpecification') {
        for (const childChild of child.children) {
          const childName = childChild.name
          if (childName === 'dataOutput' || childName === 'dataInput') {
            childChild.node = node
          }
        }
      }
      if (name === 'dataInput') {
        child.node = node
      }
      if (name === 'dataOutput') {
        child.node = node
      }
      if (name === 'property') {
        child.node = node
      }
    }
  }

  /**
   * Returns the Loop Characteristics of this Element
   */
  getLoopCharacteristics(): number {
    if (this.hasChild('multiInstanceLoopCharacteristics')) {
      if (this.getChildAttribute('multiInstanceLoopCharacteristics', 'isSequential') === 'true') {
        return LoopCharacteristic.SEQUENTIAL
      }

      return LoopCharacteristic.PARALLEL
    }

    if (this.hasChild('standardLoopCharacteristics')) {
      return LoopCharacteristic.LOOP
    }

    return LoopCharacteristic.NONE
  }

  /**
   * Returns the value of the given attribute, or null
   * @param attribute The attribute
   * @returns The value, or null
   */
  getValue(attribute: string): string | null {
    return this.attributes.has(attribute) ? this.attributes.get(attribute) : null
  }

  /**
   * Searches until the nearest Ancestor in a given List of BpmnElements is found, or null if there is no ancestor in the List (Which means there is something wrong)
   * @param planeElements A list of BpmnElements
   */
  getNearestAncestor(planeElements: HashMap<BpmnElement, BpmnDiagram>): BpmnDiagram | null {
    let parent = this.parent
    while (parent) {
      if (planeElements.has(parent)) {
        return planeElements.get(parent)
      }
      parent = parent.parent
    }
    return null
  }
}

/**
 * Class for BPMNLabelStyle objects
 */
export class BpmnLabelStyle {
  private static _LABEL_TEXT_SIZE: number

  // The id (name) of this style
  id: string
  // The font used in this style
  font = 'Arial'
  // The font size used in this style
  size = 0
  // True, if this style depicts text in bold
  isBold = false
  // True, if this style depicts text in italic
  isItalic = false
  // True, if this style underlines text
  isUnderline = false
  // True, if this style depicts style with a StrikeThrough
  isStrikeThrough = false
  // {@link LabelStyle} that represents this BpmnLabelStyle
  labelStyle: LabelStyle

  /**
   * Constant that sets the standard Text size of Labels. yFiles Standard is 12 pt, but the Bpmn Demo files look better with 11pt
   */
  static get LABEL_TEXT_SIZE(): number {
    if (typeof BpmnLabelStyle._LABEL_TEXT_SIZE === 'undefined') {
      BpmnLabelStyle._LABEL_TEXT_SIZE = 11
    }

    return BpmnLabelStyle._LABEL_TEXT_SIZE
  }

  /**
   * The default label Style
   */
  static newDefaultInstance(): LabelStyle {
    const defaultLabelStyle = new LabelStyle()

    // Set font
    const font = 'Arial'

    // Set text size
    defaultLabelStyle.textSize = BpmnLabelStyle.LABEL_TEXT_SIZE

    // Set Typeface
    defaultLabelStyle.font = new Font(font, BpmnLabelStyle.LABEL_TEXT_SIZE)
    defaultLabelStyle.wrapping = TextWrapping.WRAP_WORD
    defaultLabelStyle.horizontalTextAlignment = HorizontalTextAlignment.CENTER
    defaultLabelStyle.verticalTextAlignment = VerticalTextAlignment.CENTER
    return defaultLabelStyle
  }

  /**
   * Constructs an instance of {@link LabelStyle} representing this Style
   * @param xStyle The XML Element to be converted into this style
   */
  constructor(xStyle: Element) {
    this.id = BpmnNamespaceManager.getAttributeValue(xStyle, BpmnNamespaceManager.DC, 'id')

    // Parse Values of the Label Style
    const xFont = BpmnNamespaceManager.getElement(xStyle, BpmnNamespaceManager.DC, 'Font')
    if (xFont) {
      this.font = BpmnNamespaceManager.getAttributeValue(xFont, BpmnNamespaceManager.DC, 'name')

      let attr: string = BpmnNamespaceManager.getAttributeValue(
        xFont,
        BpmnNamespaceManager.DC,
        'size'
      )
      if (attr) {
        this.size = convertToDouble(attr)
      }

      attr = BpmnNamespaceManager.getAttributeValue(xFont, BpmnNamespaceManager.DC, 'isBold')
      if (attr) {
        this.isBold = convertToBoolean(attr)
      }
      attr = BpmnNamespaceManager.getAttributeValue(xFont, BpmnNamespaceManager.DC, 'isItalic')
      if (attr) {
        this.isItalic = convertToBoolean(attr)
      }

      attr = BpmnNamespaceManager.getAttributeValue(xFont, BpmnNamespaceManager.DC, 'isUnderline')
      if (attr) {
        this.isUnderline = convertToBoolean(attr)
      }

      attr = BpmnNamespaceManager.getAttributeValue(
        xFont,
        BpmnNamespaceManager.DC,
        'isStrikeThrough'
      )
      if (attr) {
        this.isStrikeThrough = convertToBoolean(attr)
      }
    }
    const defaultLabelStyle = new LabelStyle()
    defaultLabelStyle.horizontalTextAlignment = HorizontalTextAlignment.CENTER
    defaultLabelStyle.verticalTextAlignment = VerticalTextAlignment.CENTER
    this.labelStyle = defaultLabelStyle

    // Set text size
    if (this.size > 0) {
      this.labelStyle.textSize = this.size
    } else {
      this.labelStyle.textSize = BpmnLabelStyle.LABEL_TEXT_SIZE
    }

    let textDecoration: TextDecorations = TextDecorations.NONE
    // Set Underline
    if (this.isUnderline) {
      textDecoration |= TextDecorations.UNDERLINE
    }

    // Set StrikeThrough
    if (this.isStrikeThrough) {
      textDecoration |= TextDecorations.LINE_THROUGH
    }

    this.labelStyle.font = new Font(
      this.font,
      BpmnLabelStyle.LABEL_TEXT_SIZE,
      this.isItalic ? 'italic' : 'normal',
      this.isBold ? 'bold' : 'normal',
      textDecoration
    )

    this.labelStyle.wrapping = TextWrapping.WRAP_WORD
  }

  /**
   * Returns the {@link LabelStyle} that represents this BpmnLabelStyle instance
   */
  getStyle(): LabelStyle {
    return this.labelStyle
  }
}

/**
 * Provides convenience methods to search for specific XElements and XAttributes and test results for the relevant BPMN Namespaces
 */
export class BpmnNamespaceManager {
  private static _DC: string
  private static _DI: string
  private static _BPMN_DI: string
  private static _BPMN: string
  private static _XSI: string

  static get XSI(): string {
    if (typeof BpmnNamespaceManager._XSI === 'undefined') {
      BpmnNamespaceManager._XSI = 'http://www.w3.org/2001/XMLSchema-instance'
    }

    return BpmnNamespaceManager._XSI
  }

  static get BPMN(): string {
    if (typeof BpmnNamespaceManager._BPMN === 'undefined') {
      BpmnNamespaceManager._BPMN = 'http://www.omg.org/spec/BPMN/20100524/MODEL'
    }

    return BpmnNamespaceManager._BPMN
  }

  static get BPMN_DI(): string {
    if (typeof BpmnNamespaceManager._BPMN_DI === 'undefined') {
      BpmnNamespaceManager._BPMN_DI = 'http://www.omg.org/spec/BPMN/20100524/DI'
    }

    return BpmnNamespaceManager._BPMN_DI
  }

  static get DI(): string {
    if (typeof BpmnNamespaceManager._DI === 'undefined') {
      BpmnNamespaceManager._DI = 'http://www.omg.org/spec/DD/20100524/DI'
    }

    return BpmnNamespaceManager._DI
  }

  static get DC(): string {
    if (typeof BpmnNamespaceManager._DC === 'undefined') {
      BpmnNamespaceManager._DC = 'http://www.omg.org/spec/DD/20100524/DC'
    }

    return BpmnNamespaceManager._DC
  }

  /**
   * Returns all Attributes in the list that belong to the given namespace
   * @param list The given list
   * @param nameSpace The namespace
   * @returns The list with all items left in the namespaces.
   */
  static attributesInNamespace(list: IEnumerable<Attr>, nameSpace: string): IEnumerable<Attr> {
    // Some Attributes do not have a namespace declared explicitly. Since we test the parent for the correct namespace this is ok.
    return list.filter((el) => !el.namespaceURI || el.namespaceURI === nameSpace)
  }

  /**
   * Returns the value of the given attribute in the given XElement
   * @param xElement The xElement
   * @param nameSpace The namespace
   * @param attributeName The local name of the attribute
   */
  static getAttributeValue(xElement: Element, nameSpace: string, attributeName: string): string {
    return (xElement.getAttributeNS(nameSpace, attributeName) ||
      xElement.getAttribute(attributeName))!
  }

  /**
   * Returns the child XML element with the given namespace and local name
   * @param xElement The element
   * @param nameSpace The namespace
   * @param localName The local name
   */
  static getElement(xElement: Element, nameSpace: string, localName: string): Element | null {
    const children = xElement.children
    for (let i = 0; i < children.length; ++i) {
      if (children[i].localName === localName && children[i].namespaceURI === nameSpace) {
        return children[i]
      }
    }
    return null
  }

  /**
   * Returns the child XML element with the given namespace and local name
   * @param xElement The element
   * @param nameSpace The namespace
   * @param localName The local name
   */
  static getElements(
    xElement: Element,
    nameSpace: string,
    localName: string
  ): IEnumerable<Element> {
    const result = new List<Element>()
    const children = xElement.children
    for (let i = 0; i < children.length; ++i) {
      if (children[i].localName === localName && children[i].namespaceURI === nameSpace) {
        result.add(children[i])
      }
    }
    return result
  }
}

/**
 * Class for BPMNPlane objects
 */
export class BpmnPlane {
  // List of all {@link BpmnEdge}s in this plane
  listOfEdges: List<BpmnEdge> = new List()
  // List of all {@link BpmnShape}s in this plane
  listOfShapes: List<BpmnShape> = new List()
  // The {@link BpmnElement} this plane refers to
  element: BpmnElement | null

  /**
   * Constructs a new plane instance
   * @param xNode The XML element which represents this plane
   * @param elements Dictionary of all bpmn elements from this file parsing
   */
  constructor(xNode: Element, elements: IMap<string, BpmnElement>) {
    // A BPMNPlane only has one bpmnElement and no further attributes
    const attribute = BpmnNamespaceManager.getAttributeValue(
      xNode,
      BpmnNamespaceManager.BPMN_DI,
      'bpmnElement'
    )
    this.element = elements.has(attribute) ? elements.get(attribute) : null
  }

  /**
   * Adds a new {@link BpmnEdge} to this planes list of edges.
   * @param edge Edge to add
   */
  addEdge(edge: BpmnEdge): void {
    this.listOfEdges.add(edge)
  }

  /**
   * Adds a new {@link BpmnShape} to this planes list of shapes.
   * @param shape Shape to add
   */
  addShape(shape: BpmnShape): void {
    this.listOfShapes.add(shape)
  }

  /**
   * Returns the {@link BpmnShape} with the given id.
   * @param id Id
   * @returns A {@link BpmnShape} with the given id, or null if no {@link BpmnShape} with this id exists
   */
  getShape(id: string): BpmnShape | null {
    for (const shape of this.listOfShapes) {
      if (shape.id === id) {
        return shape
      }
    }
    return null
  }
}

/**
 * Class for BPMNShape objects
 */
export class BpmnShape {
  // Determines the kind of the participant band, if this participant should be depicted as participant band instead of
  // being depicted as lane
  partBandKind: number | null = null
  // Custom {@link BpmnLabelStyle} for the label of this shape
  labelStyle: string = null!
  // Is true, if this shape has a label
  hasLabel = false
  // Bounds for the shapes label, if it has one
  labelBounds: Rect = new Rect(0, 0, 0, 0)
  // X position of the upper left corner of this shape
  x = 0
  // Y position of the upper left corner of this shape
  y = 0
  // Height of the shape
  height = 30
  // Width of the shape
  width = 30
  // The {@link BpmnElement} this shape refers to
  element: BpmnElement | null
  // Get the id
  // Id of this shape
  id: string = null!
  // Get all additional Attributes
  // Attribute which indicates the orientation if this is a pool or lane
  isHorizontal: boolean | null = null
  // String id of the expansion state of this shape
  isExpanded: string = null!
  // Determines, if a marker should be depicted on the shape for exclusive Gateways.
  isMarkerVisible = false
  // Determines, if a message envelope should be depicted connected to the shape for participant bands
  isMessageVisible = false
  // The string id of the choreographyActivityShape if this shape is depicting a participant band
  choreographyActivityShape: string = null!

  /**
   * Constructs a new shape instance
   * @param xShape The XML element which represents this shape
   * @param elements Dictionary of all bpmn elements from this file parsing
   */
  constructor(xShape: Element, elements: IMap<string, BpmnElement>) {
    // Get and Link the corresponding element
    const attribute = BpmnNamespaceManager.getAttributeValue(
      xShape,
      BpmnNamespaceManager.BPMN_DI,
      'bpmnElement'
    )
    this.element = elements.has(attribute) ? elements.get(attribute) : null

    // If there is no element, skip
    if (!this.element) {
      return
    }

    this.id = BpmnNamespaceManager.getAttributeValue(xShape, BpmnNamespaceManager.BPMN_DI, 'id')

    const isHorizontalString = BpmnNamespaceManager.getAttributeValue(
      xShape,
      BpmnNamespaceManager.BPMN_DI,
      'isHorizontal'
    )
    this.isHorizontal = isHorizontalString != null ? convertToBoolean(isHorizontalString) : null
    this.isExpanded = BpmnNamespaceManager.getAttributeValue(
      xShape,
      BpmnNamespaceManager.BPMN_DI,
      'isExpanded'
    )
    this.isMarkerVisible = convertToBoolean(
      BpmnNamespaceManager.getAttributeValue(
        xShape,
        BpmnNamespaceManager.BPMN_DI,
        'isMarkerVisible'
      )
    )
    this.isMessageVisible = convertToBoolean(
      BpmnNamespaceManager.getAttributeValue(
        xShape,
        BpmnNamespaceManager.BPMN_DI,
        'isMessageVisible'
      )
    )
    this.choreographyActivityShape = BpmnNamespaceManager.getAttributeValue(
      xShape,
      BpmnNamespaceManager.BPMN_DI,
      'choreographyActivityShape'
    )

    switch (
      BpmnNamespaceManager.getAttributeValue(
        xShape,
        BpmnNamespaceManager.BPMN_DI,
        'participantBandKind'
      )
    ) {
      case 'top_non_initiating':
        this.partBandKind = ParticipantBandKind.TOP_NON_INITIATING
        break
      case 'top_initiating':
        this.partBandKind = ParticipantBandKind.TOP_INITIATING
        break
      case 'middle_non_initiating':
        this.partBandKind = ParticipantBandKind.MIDDLE_NON_INITIATING
        break
      case 'middle_initiating':
        this.partBandKind = ParticipantBandKind.MIDDLE_INITIATING
        break
      case 'bottom_non_initiating':
        this.partBandKind = ParticipantBandKind.BOTTOM_NON_INITIATING
        break
      case 'bottom_initiating':
        this.partBandKind = ParticipantBandKind.BOTTOM_INITIATING
        break
    }
  }

  /**
   * Adds the bound of this shape
   * @param xBounds XML element representing the bounds
   */
  addBounds(xBounds: Element): void {
    let attr: string = BpmnNamespaceManager.getAttributeValue(xBounds, BpmnNamespaceManager.DC, 'x')
    if (attr) {
      this.x = convertToDouble(attr)
    }

    attr = BpmnNamespaceManager.getAttributeValue(xBounds, BpmnNamespaceManager.DC, 'y')
    if (attr) {
      this.y = convertToDouble(attr)
    }

    attr = BpmnNamespaceManager.getAttributeValue(xBounds, BpmnNamespaceManager.DC, 'height')
    if (attr) {
      this.height = convertToDouble(attr)
    }

    attr = BpmnNamespaceManager.getAttributeValue(xBounds, BpmnNamespaceManager.DC, 'width')
    if (attr) {
      this.width = convertToDouble(attr)
    }

    // Check for size 0
    if (this.height === 0) {
      this.height = 30
    }

    if (this.width === 0) {
      this.width = 30
    }
  }

  /**
   * Add the label bounds for this shapes label
   * @param xBounds The XML element representing this labels bounds
   */
  addLabel(xBounds: Element): void {
    this.hasLabel = true
    if (!xBounds) {
      return
    }

    // If there are bounds, set standard values, first.
    let labelX = 0
    let labelY = 0
    let labelWidth = 0
    let labelHeight = 0

    let attr: string = BpmnNamespaceManager.getAttributeValue(xBounds, BpmnNamespaceManager.DC, 'x')
    if (attr) {
      labelX = convertToDouble(attr)
    }

    attr = BpmnNamespaceManager.getAttributeValue(xBounds, BpmnNamespaceManager.DC, 'y')
    if (attr) {
      labelY = convertToDouble(attr)
    }

    attr = BpmnNamespaceManager.getAttributeValue(xBounds, BpmnNamespaceManager.DC, 'height')
    if (attr) {
      labelHeight = convertToDouble(attr)
    }

    attr = BpmnNamespaceManager.getAttributeValue(xBounds, BpmnNamespaceManager.DC, 'width')
    if (attr) {
      labelWidth = convertToDouble(attr)
    }

    // In case, the label sizes were set to 0
    if (labelWidth < 1) {
      labelWidth = 100
    }
    if (labelHeight < 1) {
      labelHeight = 20
    }

    this.labelBounds = new Rect(labelX, labelY, labelWidth, labelHeight)
  }

  /**
   * Returns the value of the given attribute of the linked {@link BpmnElement}, or null
   * @param attribute The attribute to receive
   */
  getAttribute(attribute: string): string | null {
    return this.element!.getValue(attribute)
  }

  /**
   * Returns true, if the shape has width and height attributes set.
   * @returns True, if the label has size, false if not
   */
  hasLabelSize(): boolean {
    return this.labelBounds.width > 0 && this.labelBounds.height > 0
  }

  /**
   * Returns true, if the top left point of the bounds is not (0,0)
   */
  hasLabelPosition(): boolean {
    return this.labelBounds.x > 0 && this.labelBounds.y > 0
  }
}

export class MultiLabelFolderNodeConverter extends FolderNodeConverter {
  private choreographyFolderNodeDefaults: FolderNodeDefaults

  constructor() {
    super()
    this.folderNodeDefaults = this.createFolderNodeDefaults()
    this.choreographyFolderNodeDefaults = this.createChoreographFolderNodeDefaults()
  }

  get labelDefaults(): FoldingLabelDefaults {
    return this.folderNodeDefaults.labels
  }

  private createFolderNodeDefaults() {
    const folderNodeDefaults = new FolderNodeDefaults()
    folderNodeDefaults.copyLabels = true
    folderNodeDefaults.ports.copyLabels = true
    folderNodeDefaults.labels.layoutParameter = new StretchNodeLabelModel({
      padding: 3
    }).createParameter('center')
    return folderNodeDefaults
  }

  private createChoreographFolderNodeDefaults() {
    const folderNodeDefaults = new FolderNodeDefaults()
    folderNodeDefaults.copyLabels = true
    folderNodeDefaults.ports.copyLabels = true
    folderNodeDefaults.labels.shareStyleInstance = true // we want to keep the instances
    folderNodeDefaults.labels.style = null
    folderNodeDefaults.labels.layoutParameter = null
    return folderNodeDefaults
  }

  updateFolderNodeState(
    state: FolderNodeState,
    foldingView: IFoldingView,
    viewNode: INode,
    masterNode: INode
  ): void {
    if (viewNode.style instanceof ChoreographyNodeStyle) {
      this.choreographyFolderNodeDefaults.updateState(state, masterNode)
    } else {
      this.folderNodeDefaults.updateState(state, masterNode)
    }
  }

  initializeFolderNodeState(
    state: FolderNodeState,
    foldingView: IFoldingView,
    viewNode: INode,
    masterNode: INode
  ): void {
    if (viewNode.style instanceof ChoreographyNodeStyle) {
      this.choreographyFolderNodeDefaults.initializeState(state, masterNode)
    } else {
      this.folderNodeDefaults.initializeState(state, masterNode)
    }
  }

  updateGroupNodeState(
    state: FolderNodeState,
    foldingView: IFoldingView,
    viewNode: INode,
    masterNode: INode
  ): void {
    // TODO - implement and write back labels!
    if (state.labels.size === viewNode.labels.size) {
      for (let i = 0; i < state.labels.size; i++) {
        foldingView.graph.setLabelText(viewNode.labels.at(i)!, state.labels.at(i)!.text)
      }
    }
  }
}

/**
 * Visibility of a message envelope on an edge
 * @readonly
 * @enum {number}
 */
export const MessageVisibleKind = { UNSPECIFIED: 0, INITIATING: 1, NON_INITIATING: 2 }

/**
 * Enum for the different participant bands
 * @readonly
 * @enum {number}
 */
export const ParticipantBandKind = {
  BOTTOM_INITIATING: 0,
  TOP_NON_INITIATING: 1,
  MIDDLE_NON_INITIATING: 2,
  BOTTOM_NON_INITIATING: 3,
  TOP_INITIATING: 4,
  MIDDLE_INITIATING: 5
}

function convertToBoolean(s: string): boolean {
  return new RegExp('true', 'i').test(s)
}

function convertToInt(s: string): number {
  return parseInt(s, 10)
}

function convertToDouble(s: string): number {
  return parseFloat(s)
}
