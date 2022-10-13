/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Color,
  ComponentLayout,
  GraphComponent,
  GraphCopier,
  GraphItemTypes,
  GraphViewerInputMode,
  HierarchicLayout,
  ICollection,
  IEdge,
  IEnumerable,
  IGraph,
  IModelItem,
  INode,
  INodeStyle,
  Insets,
  ItemClickedEventArgs,
  ItemSelectionChangedEventArgs,
  List,
  Mapper,
  MouseWheelBehaviors,
  Neighborhood,
  NodeStyleDecorationInstaller,
  Point,
  Rect,
  ShapeNodeStyle,
  Stroke,
  StyleDecorationZoomPolicy,
  TraversalDirection
} from 'yfiles'

/**
 * A widget that can be used together with a {@link NeighborhoodView.graphComponent}
 * or an {@link IGraph} to display the neighborhood of a node.
 */
export default class NeighborhoodView {
  neighborhoodComponent: GraphComponent
  private $graphComponent: GraphComponent | null
  private $sourceGraph: IGraph | null
  private $neighborhoodMode: number
  private $highlightStyle!: INodeStyle
  insets: Insets
  showHighlight: boolean
  autoUpdatesEnabled: boolean
  autoUpdateTimeMillis: number
  clickCallback: any
  // Maps nodes in NeighborhoodComponents's graph to nodes in SourceGraph.
  originalNodes!: Mapper<INode, INode>
  updateTimerId: number
  private $selectedNodes: ICollection<INode> | null
  private $useSelection: boolean
  private $maxDistance: number
  private readonly $maxSelectedNodesCount: number
  private readonly $graphChangeListener: () => void
  private editListeners!: Map<string, any>

  /**
   * Creates a new instance of NeighborhoodView.
   */
  constructor(id: string) {
    const component = new GraphComponent(document.getElementById(id) as HTMLDivElement)
    component.mouseWheelBehavior = MouseWheelBehaviors.NONE
    component.fitGraphBounds()
    this.neighborhoodComponent = component

    this.$graphComponent = null
    this.$sourceGraph = null
    this.$neighborhoodMode = NeighborhoodView.MODE_NEIGHBORHOOD

    // Determines if the current root node should be highlighted.
    this.showHighlight = false

    // Checks whether to update the neighborhood view when the graph has been edited.
    this.autoUpdatesEnabled = false

    // The time in milliseconds that updates are scheduled before being executed.
    this.autoUpdateTimeMillis = 100

    // A callback that is invoked on a click in the neighborhood graph with the
    this.clickCallback = null

    // Timer to control the update scheduling.
    this.updateTimerId = -1

    this.$selectedNodes = null
    this.$useSelection = true

    this.$maxDistance = 1
    this.$maxSelectedNodesCount = 25
    this.showHighlight = true

    // The insets are applied to the graphComponent of this view.
    this.insets = new Insets(5)
    this.autoUpdatesEnabled = true

    this.initializeInputMode()
    this.initializeHighlightStyle()

    this.createEditListeners()
    this.$graphChangeListener = (): void => this.onGraphChanged()
  }

  /**
   * Returns the GraphComponent whose graph is displayed in this view.
   */
  get graphComponent(): GraphComponent | null {
    return this.$graphComponent
  }

  /**
   * Specifies the GraphComponent whose graph is displayed in this view.
   */
  set graphComponent(value: GraphComponent | null) {
    this.selectedNodes = null
    if (this.$graphComponent !== null) {
      this.$graphComponent.removeGraphChangedListener(this.$graphChangeListener)
      if (this.useSelection) {
        this.uninstallItemSelectionChangedListener()
      }
    }
    this.$graphComponent = value
    if (this.$sourceGraph !== null) {
      this.uninstallEditListeners()
    }
    if (this.$graphComponent !== null) {
      this.$sourceGraph = this.$graphComponent.graph
      if (this.$sourceGraph !== null) {
        this.installEditListeners()
      }
      this.$graphComponent.addGraphChangedListener(this.$graphChangeListener)
      if (this.useSelection) {
        this.installItemSelectionChangedListener()
      }
    } else {
      this.$sourceGraph = null
    }
  }

  /**
   * Returns the graph that's currently displayed by the neighborhood view.
   */
  get sourceGraph(): IGraph | null {
    return this.$sourceGraph
  }

  /**
   * Specifies the graph that's currently displayed by the neighborhood view.
   */
  set sourceGraph(value: IGraph | null) {
    if (this.$sourceGraph !== null) {
      this.uninstallEditListeners()
    }
    if (this.graphComponent !== null) {
      this.graphComponent.removeGraphChangedListener(this.$graphChangeListener)
      if (this.useSelection) {
        this.uninstallItemSelectionChangedListener()
      }
      this.graphComponent = null
    }
    this.$sourceGraph = value
    if (this.$sourceGraph !== null) {
      this.installEditListeners()
    }
    this.update()
  }

  /**
   * Returns the method used for neighborhood computation.
   */
  get neighborhoodMode(): number {
    return this.$neighborhoodMode
  }

  /**
   * Specifies the method used for neighborhood computation.
   */
  set neighborhoodMode(value: number) {
    if (this.$neighborhoodMode !== value) {
      this.$neighborhoodMode = value
      this.update()
    }
  }

  /**
   * Returns the maximum distance for the neighborhood computation.
   */
  get maxDistance(): number {
    return this.$maxDistance
  }

  /**
   * Specifies the maximum distance for the neighborhood computation.
   */
  set maxDistance(value: number) {
    if (this.$maxDistance !== value) {
      this.$maxDistance = value
      this.update()
    }
  }

  /**
   * Returns the maximum number of selected nodes used for neighborhood computation.
   * If the number is exceeded the neighborhood will not be computed.
   */
  get maxSelectedNodesCount(): number {
    return this.$maxSelectedNodesCount
  }

  /**
   * Returns the configurable highlight style. If none is assigned, a default highlight style is used.
   */
  get highlightStyle(): INodeStyle {
    return this.$highlightStyle
  }

  /**
   * Specifies the configurable highlight style. If none is assigned, a default highlight style is used.
   */
  set highlightStyle(value: INodeStyle) {
    this.$highlightStyle = value
    this.installHighlightStyle(this.$highlightStyle)
  }

  /**
   * Gets the nodes whose neighborhoods are shown.
   */
  get selectedNodes(): ICollection<INode> | null {
    return this.$selectedNodes
  }

  /**
   * Sets the nodes whose neighborhoods are shown.
   */
  set selectedNodes(value: ICollection<INode> | null) {
    if (this.$selectedNodes !== value) {
      this.$selectedNodes = value
      this.update()
    }
  }

  /**
   * Gets whether to automatically synchronize the
   * {@link NeighborhoodView.graphComponent}'s selection to the
   * {@link NeighborhoodView.selectedNodes} of the neighborhood view.
   *
   * The default is `true`.
   *
   * The view is only updated automatically if {@link NeighborhoodView.autoUpdatesEnabled auto updates}
   * are enabled.
   */
  get useSelection(): boolean {
    return this.$useSelection
  }

  /**
   * Sets whether to automatically synchronize the
   * {@link NeighborhoodView.graphComponent}'s selection to the
   * {@link NeighborhoodView.selectedNodes} of the neighborhood view.
   *
   * The default is `true`.
   *
   * The view is only updated automatically if {@link NeighborhoodView.autoUpdatesEnabled auto updates}
   * are enabled.
   */
  set useSelection(value: boolean) {
    if (this.$useSelection !== value) {
      this.$useSelection = value
      if (value) {
        if (this.graphComponent !== null) {
          this.selectedNodes = new List(this.graphComponent.selection.selectedNodes)
        }
        this.installItemSelectionChangedListener()
      } else {
        this.uninstallItemSelectionChangedListener()
      }
    }
  }

  createEditListeners(): void {
    this.editListeners = new Map()
    this.editListeners.set('nodeCreated', () => this.onNodeEdited())
    this.editListeners.set('nodeRemoved', () => this.onNodeRemoved())
    this.editListeners.set('nodeLayoutChanged', (source: object, node: INode, oldLayout: Rect) => {
      if (node.layout.width !== oldLayout.width || node.layout.height !== oldLayout.height) {
        // only react to size changes, since the neighborhood view has its own layout
        this.onNodeEdited()
      }
    })
    this.editListeners.set('nodeStyleChanged', () => this.onNodeEdited())
    this.editListeners.set('edgeCreated', () => this.onEdgeEdited())
    this.editListeners.set('edgeRemoved', () => this.onEdgeEdited())
    this.editListeners.set('edgePortsChanged', () => this.onEdgeEdited())
    this.editListeners.set('edgeStyleChanged', () => this.onEdgeEdited())
    this.editListeners.set('portAdded', () => this.onPortEdited())
    this.editListeners.set('portRemoved', () => this.onPortEdited())
    this.editListeners.set('portStyleChanged', () => this.onPortEdited())
    this.editListeners.set('labelAdded', () => this.onLabelEdited())
    this.editListeners.set('labelRemoved', () => this.onLabelEdited())
    this.editListeners.set('labelStyleChanged', () => this.onLabelEdited())
    this.editListeners.set('labelTextChanged', () => this.onLabelEdited())

    this.editListeners.set('isGroupNodeChanged', () => this.onItemEdited())
    this.editListeners.set('parentChanged', () => this.onItemEdited())
    this.editListeners.set(
      'itemSelectionChanged',
      (source: object, args: ItemSelectionChangedEventArgs<IModelItem>) =>
        this.onItemSelectionChanged(args.item)
    )
  }

  /**
   * Installs listeners such that the neighborhood component is updated if the
   * source graph is edited.
   */
  installEditListeners(): void {
    if (this.sourceGraph === null) {
      return
    }
    this.sourceGraph.addNodeCreatedListener(this.editListeners.get('nodeCreated'))
    this.sourceGraph.addNodeRemovedListener(this.editListeners.get('nodeRemoved'))
    this.sourceGraph.addNodeLayoutChangedListener(this.editListeners.get('nodeLayoutChanged'))
    this.sourceGraph.addNodeStyleChangedListener(this.editListeners.get('nodeStyleChanged'))
    this.sourceGraph.addEdgeCreatedListener(this.editListeners.get('edgeCreated'))
    this.sourceGraph.addEdgeRemovedListener(this.editListeners.get('edgeRemoved'))
    this.sourceGraph.addEdgePortsChangedListener(this.editListeners.get('edgePortsChanged'))
    this.sourceGraph.addEdgeStyleChangedListener(this.editListeners.get('edgeStyleChanged'))
    this.sourceGraph.addPortAddedListener(this.editListeners.get('portAdded'))
    this.sourceGraph.addPortRemovedListener(this.editListeners.get('portRemoved'))
    this.sourceGraph.addPortStyleChangedListener(this.editListeners.get('portStyleChanged'))
    this.sourceGraph.addLabelAddedListener(this.editListeners.get('labelAdded'))
    this.sourceGraph.addLabelRemovedListener(this.editListeners.get('labelRemoved'))
    this.sourceGraph.addLabelStyleChangedListener(this.editListeners.get('labelStyleChanged'))
    this.sourceGraph.addLabelTextChangedListener(this.editListeners.get('labelTextChanged'))
    this.sourceGraph.addIsGroupNodeChangedListener(this.editListeners.get('isGroupNodeChanged'))
    this.sourceGraph.addParentChangedListener(this.editListeners.get('parentChanged'))
  }

  /**
   * Removes the edit listeners.
   */
  uninstallEditListeners(): void {
    if (this.sourceGraph === null) {
      return
    }
    this.sourceGraph.removeNodeCreatedListener(this.editListeners.get('nodeCreated'))
    this.sourceGraph.removeNodeRemovedListener(this.editListeners.get('nodeRemoved'))
    this.sourceGraph.removeNodeLayoutChangedListener(this.editListeners.get('nodeLayoutChanged'))
    this.sourceGraph.removeNodeStyleChangedListener(this.editListeners.get('nodeStyleChanged'))
    this.sourceGraph.removeEdgeCreatedListener(this.editListeners.get('edgeCreated'))
    this.sourceGraph.removeEdgeRemovedListener(this.editListeners.get('edgeRemoved'))
    this.sourceGraph.removeEdgePortsChangedListener(this.editListeners.get('edgePortsChanged'))
    this.sourceGraph.removeEdgeStyleChangedListener(this.editListeners.get('edgeStyleChanged'))
    this.sourceGraph.removePortAddedListener(this.editListeners.get('portAdded'))
    this.sourceGraph.removePortRemovedListener(this.editListeners.get('portRemoved'))
    this.sourceGraph.removePortStyleChangedListener(this.editListeners.get('portStyleChanged'))
    this.sourceGraph.removeLabelAddedListener(this.editListeners.get('labelAdded'))
    this.sourceGraph.removeLabelRemovedListener(this.editListeners.get('labelRemoved'))
    this.sourceGraph.removeLabelStyleChangedListener(this.editListeners.get('labelStyleChanged'))
    this.sourceGraph.removeLabelTextChangedListener(this.editListeners.get('labelTextChanged'))
    this.sourceGraph.removeIsGroupNodeChangedListener(this.editListeners.get('isGroupNodeChanged'))
    this.sourceGraph.removeParentChangedListener(this.editListeners.get('parentChanged'))
  }

  onItemEdited(): void {
    if (this.autoUpdatesEnabled) {
      this.scheduleUpdate()
    }
  }

  onNodeEdited(): void {
    if (this.autoUpdatesEnabled) {
      this.scheduleUpdate()
    }
  }

  onNodeRemoved(): void {
    if (this.autoUpdatesEnabled) {
      this.$selectedNodes = new List(this.graphComponent!.selection.selectedNodes)
      this.scheduleUpdate()
    }
  }

  onEdgeEdited(): void {
    if (this.autoUpdatesEnabled) {
      this.scheduleUpdate()
    }
  }

  onLabelEdited(): void {
    if (this.autoUpdatesEnabled) {
      this.scheduleUpdate()
    }
  }

  onPortEdited(): void {
    if (this.autoUpdatesEnabled) {
      this.scheduleUpdate()
    }
  }

  /**
   * Called whenever the selection changes.
   */
  onItemSelectionChanged(item: IModelItem): void {
    if (this.autoUpdatesEnabled && INode.isInstance(item)) {
      this.$selectedNodes = new List(this.graphComponent!.selection.selectedNodes)
      this.scheduleUpdate()
    }
  }

  /**
   * Installs the selection listeners.
   */
  installItemSelectionChangedListener(): void {
    if (this.graphComponent !== null) {
      this.graphComponent.selection.addItemSelectionChangedListener(
        this.editListeners.get('itemSelectionChanged')
      )
    }
  }

  /**
   * Uninstalls the selection listeners.
   */
  uninstallItemSelectionChangedListener(): void {
    if (this.graphComponent !== null) {
      this.graphComponent.selection.removeItemSelectionChangedListener(
        this.editListeners.get('itemSelectionChanged')
      )
    }
  }

  /**
   * Called when the graph property of the source graph is changed.
   */
  onGraphChanged(): void {
    this.sourceGraph = this.graphComponent!.graph
  }

  /**
   * Creates and installs the default highlight style.
   */
  initializeHighlightStyle(): void {
    // create semi transparent orange pen first
    const orangeRed = Color.ORANGE_RED
    const orangePen = new Stroke(orangeRed.r, orangeRed.g, orangeRed.b, 220, 3).freeze()

    this.highlightStyle = new ShapeNodeStyle({
      shape: 'round-rectangle',
      stroke: orangePen,
      fill: 'transparent'
    })

    // configure the highlight decoration installer
    this.installHighlightStyle(this.highlightStyle)
  }

  /**
   * Installs the given highlight style as node decorator.
   */
  installHighlightStyle(highlightStyle: INodeStyle): void {
    const nodeStyleHighlight = new NodeStyleDecorationInstaller({
      nodeStyle: highlightStyle,
      // that should be slightly larger than the real node
      margins: 5,
      zoomPolicy: StyleDecorationZoomPolicy.VIEW_COORDINATES
    })
    // register it as the default implementation for all nodes
    const decorator = this.neighborhoodComponent.graph.decorator
    decorator.nodeDecorator.highlightDecorator.setImplementation(nodeStyleHighlight)
  }

  /**
   * Initializes the input mode.
   */
  initializeInputMode(): void {
    // We disable focus, selection and marquee selection so the
    // component will display the plain graph without focus and
    // selection boundaries.
    const graphViewerInputMode = new GraphViewerInputMode({
      clickableItems: GraphItemTypes.NODE,
      focusableItems: GraphItemTypes.NONE,
      selectableItems: GraphItemTypes.NONE,
      marqueeSelectableItems: GraphItemTypes.NONE
    })

    // Disable collapsing and expanding of groups
    const navigationInputMode = graphViewerInputMode.navigationInputMode
    navigationInputMode.allowCollapseGroup = false
    navigationInputMode.allowExpandGroup = false
    navigationInputMode.useCurrentItemForCommands = true
    graphViewerInputMode.moveViewportInputMode.enabled = false
    navigationInputMode.enabled = false

    // If an item is clicked, we want the view to show the neighborhood
    // of the clicked node, and invoke the click callback with the original
    // node.
    graphViewerInputMode.addItemClickedListener(
      (sender: object, e: ItemClickedEventArgs<IModelItem>) => {
        if (
          this.neighborhoodMode !== NeighborhoodView.MODE_FOLDER_CONTENTS &&
          INode.isInstance(e.item)
        ) {
          const node = e.item
          const originalNode = this.originalNodes.get(node)
          const selected = new List<INode>()
          selected.add(originalNode!)
          this.selectedNodes = selected
          if (this.clickCallback !== null) {
            this.clickCallback(originalNode)
          }
        }
      }
    )

    this.neighborhoodComponent.inputMode = graphViewerInputMode
  }

  /**
   * Schedules a call to {@link NeighborhoodView.update}. All consequent calls that
   * happen during the {@link NeighborhoodView.autoUpdateTimeMillis update time} are ignored.
   */
  scheduleUpdate(): void {
    if (this.updateTimerId >= 0) {
      // update is already scheduled
      return
    }
    // schedule an update
    this.updateTimerId = window.setTimeout(() => {
      this.update()
      this.updateTimerId = -1
    }, this.autoUpdateTimeMillis)
  }

  /**
   * Updates the neighborhood view.
   *
   * If {@link NeighborhoodView.autoUpdatesEnabled} is enabled, this method is
   * called automatically after the graph has been edited.
   *
   * Filters the source graph and calculates a layout based on the
   * value set in {@link NeighborhoodView.neighborhoodMode}.
   *
   * @see {@link NeighborhoodView.autoUpdatesEnabled}
   * @see {@link NeighborhoodView.useSelection}
   */
  update(): void {
    this.neighborhoodComponent.graph.clear()
    if (
      this.sourceGraph === null ||
      this.selectedNodes === null ||
      this.selectedNodes.size === 0 ||
      this.selectedNodes.size > this.maxSelectedNodesCount
    ) {
      return
    }

    this.originalNodes = new Mapper<INode, INode>()
    const nodesToCopy = new Set<INode>()

    // Create a list of start nodes.
    const startNodes = this.selectedNodes
    // @ts-ignore
    let enumerable: IEnumerable<INode> = null
    const copiedStartNodes = new List<INode>()

    if (this.neighborhoodMode !== NeighborhoodView.MODE_FOLDER_CONTENTS) {
      this.selectedNodes.forEach((node: INode) => {
        nodesToCopy.add(node)
      })

      let direction: TraversalDirection
      switch (this.neighborhoodMode) {
        case NeighborhoodView.MODE_PREDECESSORS:
          // Get predecessors of root node
          direction = TraversalDirection.PREDECESSOR
          break
        case NeighborhoodView.MODE_SUCCESSORS:
          // Get successors of root node
          direction = TraversalDirection.SUCCESSOR
          break
        case NeighborhoodView.MODE_BOTH:
          // Get predecessors and successors of root node
          direction = TraversalDirection.BOTH
          break
        default:
        case NeighborhoodView.MODE_NEIGHBORHOOD:
          // Get direct and indirect neighbors of root node
          direction = TraversalDirection.UNDIRECTED
          break
      }

      const result = new Neighborhood({
        startNodes,
        maximumDistance: this.maxDistance,
        traversalDirection: direction
      }).run(this.sourceGraph)

      result.neighbors.forEach((node: INode) => {
        nodesToCopy.add(node)
      })

      // Use GraphCopier to copy the nodes inside the neighborhood into the NeighborhoodComponent's graph.
      // Also, create the mapping of the copied nodes to original nodes inside the SourceGraph.
      const graphCopier = new GraphCopier()
      graphCopier.copy(
        this.sourceGraph,
        (item: IModelItem) => !INode.isInstance(item) || nodesToCopy.has(item),
        this.neighborhoodComponent.graph,
        null,
        new Point(0, 0),
        (original: IModelItem, copy: IModelItem) => {
          if (INode.isInstance(original)) {
            this.originalNodes.set(copy as INode, original)
            // noinspection JSCheckFunctionSignatures
            if (this.selectedNodes!.includes(original)) {
              copiedStartNodes.add(copy as INode)
            }
          }
        }
      )
    } else {
      const foldingView = this.sourceGraph.foldingView!
      if (this.selectedNodes.size > 1) {
        this.selectedNodes.forEach((node: INode) => {
          if (this.sourceGraph!.getParent(node) !== null) {
            nodesToCopy.add(foldingView.getMasterItem(node)!)
          }
        })
      }

      // Get descendants of root nodes.
      if (this.sourceGraph) {
        const groupingSupport = foldingView.manager.masterGraph.groupingSupport
        this.selectedNodes.forEach((node: INode) => {
          enumerable = groupingSupport.getDescendants(foldingView.getMasterItem(node))

          if (enumerable) {
            enumerable.forEach((descendant: INode) => {
              nodesToCopy.add(descendant)
            })
          }
        })

        // Use GraphCopier to copy the nodes inside the neighborhood into the NeighborhoodComponent's graph.
        // Also, create the mapping of the copied nodes to original nodes inside the SourceGraph.
        // Include only edges that are descendants of the same root node.
        const graphCopier = new GraphCopier()
        graphCopier.copy(
          foldingView.manager.masterGraph,
          (item: IModelItem) => {
            if (IEdge.isInstance(item)) {
              const edge = item
              let intraComponentEdge = false
              this.selectedNodes!.forEach((node: INode) => {
                if (
                  groupingSupport.isDescendant(edge.sourceNode, foldingView.getMasterItem(node)) &&
                  groupingSupport.isDescendant(edge.targetNode, foldingView.getMasterItem(node))
                ) {
                  intraComponentEdge = true
                }
              })
              return intraComponentEdge
            }
            return !INode.isInstance(item) || nodesToCopy.has(item)
          },
          this.neighborhoodComponent.graph,
          null,
          new Point(0, 0),
          (original: IModelItem, copy: IModelItem) => {
            if (INode.isInstance(original)) {
              this.originalNodes.set(copy as INode, original)
              // noinspection JSCheckFunctionSignatures
              if (this.selectedNodes!.includes(original)) {
                copiedStartNodes.add(copy as INode)
              }
            }
          }
        )
      }
    }

    // Layout the neighborhood graph using hierarchic layout.
    if (this.neighborhoodMode === NeighborhoodView.MODE_FOLDER_CONTENTS) {
      if (this.selectedNodes.size > 1) {
        this.neighborhoodComponent.graph.applyLayout(new ComponentLayout())
      }
    } else {
      this.neighborhoodComponent.graph.applyLayout(new HierarchicLayout())
    }

    // Highlight the root node in the neighborhood graph.
    if (this.showHighlight && copiedStartNodes.size > 0) {
      const manager = this.neighborhoodComponent.highlightIndicatorManager
      manager.clearHighlights()
      copiedStartNodes.forEach((startNode: INode) => {
        manager.addHighlight(startNode)
      })
    }

    // Make the neighborhood graph fit inside the NeighborhoodComponent.
    this.neighborhoodComponent.fitGraphBounds(this.insets)
  }

  /**
   * Enumerations that holds the different modes of the NeighborhoodView.
   */
  static get MODE_NEIGHBORHOOD(): number {
    return 0
  }

  static get MODE_PREDECESSORS(): number {
    return 1
  }

  static get MODE_SUCCESSORS(): number {
    return 2
  }

  static get MODE_FOLDER_CONTENTS(): number {
    return 3
  }

  static get MODE_BOTH(): number {
    return 4
  }
}
