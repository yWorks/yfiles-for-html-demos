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
import {
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  IGraph,
  IModelItem,
  INode,
  INodeStyle,
  ItemClickedEventArgs,
  ItemEventArgs,
  Mapper,
  MouseWheelBehaviors,
  NodeStyleIndicatorRenderer,
  Rect,
  ShapeNodeStyle,
  StyleIndicatorZoomPolicy
} from '@yfiles/yfiles'

/**
 * Specifies the contract for callbacks that arrange the neighborhood graph of a given
 * neighborhood view.
 */
export type ApplyLayoutCallback = (view: NeighborhoodView, selectedViewNodes: INode[]) => void

/**
 * Specifies the contract for callbacks that create neighborhood graphs for a given neighborhood
 * view.
 */
export type BuildGraphCallback = (
  view: NeighborhoodView,
  selectedSourceNodes: INode[],
  itemCopiedCallback: (sourceItem: IModelItem, viewItem: IModelItem) => void
) => void

/**
 * A widget that can be used together with a {@link NeighborhoodView.graphComponent}
 * or an {@link IGraph} to display the neighborhood of a node.
 */
export class NeighborhoodView {
  /**
   * Determines if the current root node(s) should be highlighted.
   */
  showHighlight = true

  /**
   * Checks whether to update the neighborhood view when the graph has been edited.
   */
  autoUpdatesEnabled = true

  /**
   * A callback that is invoked on a click in the neighborhood graph with the clicked node.
   */
  clickCallback?: (node: INode) => void

  /**
   * Maps nodes in NeighborhoodComponent's graph to nodes in SourceGraph.
   */
  originalNodes!: Mapper<INode, INode>

  /**
   * Arranges this view's neighborhood graph whenever said graph is updated.
   */
  applyNeighborhoodLayout: ApplyLayoutCallback = () => {}

  /**
   * Builds this view's neighborhood graph whenever said graph is updated.
   */
  buildNeighborhoodGraph: BuildGraphCallback = () => {}

  /**
   * Invoked after the neighborhood graph has been updated.
   */
  onNeighborhoodUpdated: (view: NeighborhoodView) => void = (view) => {
    // Ensure the neighborhood graph fits inside the neighborhood graph component.
    void view.neighborhoodComponent.fitGraphBounds(5)
  }

  /**
   * The GraphComponent that displays the neighborhood
   */
  readonly neighborhoodComponent: GraphComponent

  private updateTimerId = -1
  private _graphComponent: GraphComponent | null = null
  private _sourceGraph: IGraph | null = null
  private _highlightStyle: INodeStyle = new ShapeNodeStyle({
    shape: 'round-rectangle',
    stroke: '3px solid #ff4500',
    fill: 'transparent'
  })
  private _selectedNodes: INode[] = []
  private _useSelection = true
  private readonly editListeners = new Map<string, any>()
  private readonly maxSelectedNodesCount = 25 // limit the neighborhood computation to avoid UI blocking

  /**
   * Creates a new instance of NeighborhoodView.
   */
  constructor(selector: string) {
    this.neighborhoodComponent = new GraphComponent({
      selector,
      mouseWheelBehavior: MouseWheelBehaviors.NONE
    })
    this.initializeInputMode()
    this.installHighlightStyle(this._highlightStyle)
    this.createEditListeners()
  }

  /**
   * Returns the GraphComponent whose graph is displayed in this view.
   */
  get graphComponent(): GraphComponent | null {
    return this._graphComponent
  }

  /**
   * Specifies the GraphComponent whose graph is displayed in this view.
   */
  set graphComponent(value: GraphComponent | null) {
    this.selectedNodes = []
    if (this._graphComponent !== null) {
      if (this.useSelection) {
        this.uninstallItemSelectionChangedListener()
      }
    }
    this._graphComponent = value
    if (this._sourceGraph !== null) {
      this.uninstallEditListeners()
    }
    if (this._graphComponent !== null) {
      this._sourceGraph = this._graphComponent.graph
      if (this._sourceGraph !== null) {
        this.installEditListeners()
      }
      if (this.useSelection) {
        this.installItemSelectionChangedListener()
      }
    } else {
      this._sourceGraph = null
    }
  }

  /**
   * Returns the graph that's currently displayed by the neighborhood view.
   */
  get sourceGraph(): IGraph | null {
    return this._sourceGraph
  }

  /**
   * Specifies the graph that's currently displayed by the neighborhood view.
   */
  set sourceGraph(value: IGraph | null) {
    if (this._sourceGraph !== null) {
      this.uninstallEditListeners()
    }
    if (this.graphComponent !== null) {
      if (this.useSelection) {
        this.uninstallItemSelectionChangedListener()
      }
      this.graphComponent = null
    }
    this._sourceGraph = value
    if (this._sourceGraph !== null) {
      this.installEditListeners()
    }
    this.update()
  }

  /**
   * Returns the graph that is displayed in this view.
   */
  get neighborhoodGraph() {
    return this.neighborhoodComponent.graph
  }

  /**
   * Returns the configurable highlight style. If none is assigned, a default highlight style is used.
   */
  get highlightStyle(): INodeStyle {
    return this._highlightStyle
  }

  /**
   * Specifies the configurable highlight style. If none is assigned, a default highlight style is used.
   */
  set highlightStyle(value: INodeStyle) {
    this._highlightStyle = value
    this.installHighlightStyle(this._highlightStyle)
  }

  /**
   * Gets the nodes whose neighborhoods are shown.
   */
  get selectedNodes(): INode[] {
    return this._selectedNodes
  }

  /**
   * Sets the nodes whose neighborhoods are shown.
   */
  set selectedNodes(value: INode[]) {
    if (this._selectedNodes !== value) {
      this._selectedNodes = value
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
    return this._useSelection
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
    if (this._useSelection !== value) {
      this._useSelection = value
      if (value) {
        this.selectedNodes = this.graphComponent?.selection.nodes.toArray() ?? []
        this.installItemSelectionChangedListener()
      } else {
        this.uninstallItemSelectionChangedListener()
      }
    }
  }

  private createEditListeners(): void {
    const editListeners = this.editListeners
    editListeners.clear()
    editListeners.set('nodeCreated', () => this.scheduleAutoUpdate())
    editListeners.set('nodeRemoved', () => this.scheduleAutoUpdate(true))
    editListeners.set('nodeLayoutChanged', ({ layout }: INode, oldLayout: Rect) => {
      if (layout.width !== oldLayout.width || layout.height !== oldLayout.height) {
        // only react to size changes, since the neighborhood view has its own layout
        this.scheduleAutoUpdate()
      }
    })
    editListeners.set('nodeStyleChanged', () => this.scheduleAutoUpdate())
    editListeners.set('edgeCreated', () => this.scheduleAutoUpdate())
    editListeners.set('edgeRemoved', () => this.scheduleAutoUpdate())
    editListeners.set('edgePortsChanged', () => this.scheduleAutoUpdate())
    editListeners.set('edgeStyleChanged', () => this.scheduleAutoUpdate())
    editListeners.set('portAdded', () => this.scheduleAutoUpdate())
    editListeners.set('portRemoved', () => this.scheduleAutoUpdate())
    editListeners.set('portStyleChanged', () => this.scheduleAutoUpdate())
    editListeners.set('labelAdded', () => this.scheduleAutoUpdate())
    editListeners.set('labelRemoved', () => this.scheduleAutoUpdate())
    editListeners.set('labelStyleChanged', () => this.scheduleAutoUpdate())
    editListeners.set('labelTextChanged', () => this.scheduleAutoUpdate())

    editListeners.set('isGroupNodeChanged', () => this.scheduleAutoUpdate())
    editListeners.set('parentChanged', () => this.scheduleAutoUpdate())
    editListeners.set('itemSelectionChanged', ({ item }: ItemEventArgs<IModelItem>) => {
      if (item instanceof INode) {
        this.scheduleAutoUpdate(true)
      }
    })
  }

  /**
   * Installs listeners such that the neighborhood component is updated if the
   * source graph is edited.
   */
  private installEditListeners(): void {
    const sourceGraph = this.sourceGraph
    if (sourceGraph === null) {
      return
    }
    const editListeners = this.editListeners
    sourceGraph.addEventListener('node-created', editListeners.get('nodeCreated'))
    sourceGraph.addEventListener('node-removed', editListeners.get('nodeRemoved'))
    sourceGraph.addEventListener('node-layout-changed', editListeners.get('nodeLayoutChanged'))
    sourceGraph.addEventListener('node-style-changed', editListeners.get('nodeStyleChanged'))
    sourceGraph.addEventListener('edge-created', editListeners.get('edgeCreated'))
    sourceGraph.addEventListener('edge-removed', editListeners.get('edgeRemoved'))
    sourceGraph.addEventListener('edge-ports-changed', editListeners.get('edgePortsChanged'))
    sourceGraph.addEventListener('edge-style-changed', editListeners.get('edgeStyleChanged'))
    sourceGraph.addEventListener('port-added', editListeners.get('portAdded'))
    sourceGraph.addEventListener('port-removed', editListeners.get('portRemoved'))
    sourceGraph.addEventListener('port-style-changed', editListeners.get('portStyleChanged'))
    sourceGraph.addEventListener('label-added', editListeners.get('labelAdded'))
    sourceGraph.addEventListener('label-removed', editListeners.get('labelRemoved'))
    sourceGraph.addEventListener('label-style-changed', editListeners.get('labelStyleChanged'))
    sourceGraph.addEventListener('label-text-changed', editListeners.get('labelTextChanged'))
    sourceGraph.addEventListener('is-group-node-changed', editListeners.get('isGroupNodeChanged'))
    sourceGraph.addEventListener('parent-changed', editListeners.get('parentChanged'))
  }

  /**
   * Removes the edit listeners.
   */
  private uninstallEditListeners(): void {
    const sourceGraph = this.sourceGraph
    if (sourceGraph === null) {
      return
    }
    const editListeners = this.editListeners
    sourceGraph.removeEventListener('node-created', editListeners.get('nodeCreated'))
    sourceGraph.removeEventListener('node-removed', editListeners.get('nodeRemoved'))
    sourceGraph.removeEventListener('node-layout-changed', editListeners.get('nodeLayoutChanged'))
    sourceGraph.removeEventListener('node-style-changed', editListeners.get('nodeStyleChanged'))
    sourceGraph.removeEventListener('edge-created', editListeners.get('edgeCreated'))
    sourceGraph.removeEventListener('edge-removed', editListeners.get('edgeRemoved'))
    sourceGraph.removeEventListener('edge-ports-changed', editListeners.get('edgePortsChanged'))
    sourceGraph.removeEventListener('edge-style-changed', editListeners.get('edgeStyleChanged'))
    sourceGraph.removeEventListener('port-added', editListeners.get('portAdded'))
    sourceGraph.removeEventListener('port-removed', editListeners.get('portRemoved'))
    sourceGraph.removeEventListener('port-style-changed', editListeners.get('portStyleChanged'))
    sourceGraph.removeEventListener('label-added', editListeners.get('labelAdded'))
    sourceGraph.removeEventListener('label-removed', editListeners.get('labelRemoved'))
    sourceGraph.removeEventListener('label-style-changed', editListeners.get('labelStyleChanged'))
    sourceGraph.removeEventListener('label-text-changed', editListeners.get('labelTextChanged'))
    sourceGraph.removeEventListener(
      'is-group-node-changed',
      editListeners.get('isGroupNodeChanged')
    )
    sourceGraph.removeEventListener('parent-changed', editListeners.get('parentChanged'))
  }

  /**
   * Schedules an {@link NeighborhoodView.update} if {@link NeighborhoodView.autoUpdatesEnabled}
   * is enabled.
   */
  private scheduleAutoUpdate(updateSelectedNodes = false): void {
    if (this.autoUpdatesEnabled) {
      if (updateSelectedNodes) {
        this._selectedNodes = this.graphComponent?.selection.nodes.toArray() ?? []
      }
      this.scheduleUpdate()
    }
  }

  /**
   * Installs the selection listeners.
   */
  private installItemSelectionChangedListener(): void {
    this.graphComponent?.selection.addEventListener(
      'item-added',
      this.editListeners.get('itemSelectionChanged')
    )
  }

  /**
   * Uninstalls the selection listeners.
   */
  private uninstallItemSelectionChangedListener(): void {
    this.graphComponent?.selection.removeEventListener(
      'item-removed',
      this.editListeners.get('itemSelectionChanged')
    )
  }

  /**
   * Installs the given highlight style as node decorator.
   */
  private installHighlightStyle(highlightStyle: INodeStyle): void {
    const nodeHighlightStyle = new NodeStyleIndicatorRenderer({
      nodeStyle: highlightStyle,
      // that should be slightly larger than the real node
      margins: 5,
      zoomPolicy: StyleIndicatorZoomPolicy.VIEW_COORDINATES
    })
    // register it as the default implementation for all nodes
    this.neighborhoodComponent.graph.decorator.nodes.highlightRenderer.addConstant(
      nodeHighlightStyle
    )
  }

  /**
   * Initializes the input mode.
   */
  private initializeInputMode(): void {
    // We disable focus, selection and marquee selection such that the
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
    graphViewerInputMode.addEventListener(
      'item-clicked',
      ({ item }: ItemClickedEventArgs<IModelItem>) => {
        if (item instanceof INode) {
          const originalNode = this.originalNodes.get(item)
          if (originalNode) {
            this.clickCallback?.(originalNode)
          }
        }
      }
    )

    this.neighborhoodComponent.inputMode = graphViewerInputMode
  }

  /**
   * Schedules a call to {@link NeighborhoodView.update}.
   */
  private scheduleUpdate(): void {
    if (this.updateTimerId >= 0) {
      // update is already scheduled
      return
    }
    // schedule an update
    this.updateTimerId = window.setTimeout(() => {
      this.update()
      this.updateTimerId = -1
    }, 100)
  }

  /**
   * Updates the neighborhood view.
   *
   * If {@link NeighborhoodView.autoUpdatesEnabled} is enabled, this method is
   * called automatically after the graph has been edited.
   *
   * {@link NeighborhoodView.buildNeighborhoodGraph} is called to populate the neighborhood graph.
   * {@link NeighborhoodView.applyNeighborhoodLayout} is called to arrange the neighborhood graph.
   *
   * @see {@link NeighborhoodView.autoUpdatesEnabled}
   * @see {@link NeighborhoodView.useSelection}
   */
  public update(): void {
    this.neighborhoodComponent.graph.clear()

    if (
      this.sourceGraph === null ||
      this.selectedNodes.length === 0 ||
      this.selectedNodes.length > this.maxSelectedNodesCount
    ) {
      this.onNeighborhoodUpdated(this)
      return
    }

    this.originalNodes = new Mapper<INode, INode>()

    const copiedStartNodes: INode[] = []

    this.buildNeighborhoodGraph(this, this.selectedNodes, (original, copy) => {
      if (original instanceof INode) {
        this.originalNodes.set(copy as INode, original)
        if (this.selectedNodes.includes(original)) {
          copiedStartNodes.push(copy as INode)
        }
      }
    })
    this.applyNeighborhoodLayout(this, copiedStartNodes)

    // Highlight the root node in the neighborhood graph.
    if (this.showHighlight && copiedStartNodes.length > 0) {
      const highlights = this.neighborhoodComponent.highlights
      highlights.clear()
      copiedStartNodes.forEach((startNode) => {
        highlights.add(startNode)
      })
    }

    this.onNeighborhoodUpdated(this)
  }
}
