/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

define([
  'yfiles/view-editor',
  'yfiles/view-layout-bridge',
  'yfiles/layout-hierarchic'
], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * A widget that can be used together with a {@link NeighborhoodView#graphComponent}
   * or an {@link yfiles.graph.IGraph} to display the neighborhood of a node.
   */
  class NeighborhoodView {
    /**
     * Creates a new instance of NeighborhoodView.
     * @param {string} id
     */
    constructor(id) {
      const component = new yfiles.view.GraphComponent(document.getElementById(id))
      component.mouseWheelBehavior = yfiles.view.MouseWheelBehaviors.NONE
      component.fitGraphBounds()
      this.neighborhoodComponent = component

      this.$graphComponent = null
      this.$sourceGraph = null
      this.$neighborhoodMode = NeighborhoodView.MODE_NEIGHBORHOOD
      this.$highlightStyle = null

      // The insets are applied to the graphComponent of this view.
      this.insets = null

      // Determines if the current root node should be highlighted.
      this.showHighlight = false

      // Checks whether to update the neighborhood view when the graph has been edited.
      this.autoUpdatesEnabled = false

      // The time in milliseconds that updates are scheduled before being executed.
      this.autoUpdateTimeMillis = 100

      // A callback that is invoked on a click in the neighborhood graph with the
      this.clickCallback = null

      // Maps nodes in NeighborhoodComponents's graph to nodes in SourceGraph.
      this.originalNodes = null

      // Timer to control the update scheduling.
      this.updateTimerId = -1

      this.$selectedNodes = null
      this.$useSelection = true

      this.$maxDistance = 1
      this.$maxSelectedNodesCount = 25
      this.showHighlight = true
      this.insets = new yfiles.geometry.Insets(5)
      this.autoUpdatesEnabled = true

      this.initializeInputMode()
      this.initializeHighlightStyle()
    }

    /**
     * Returns the GraphComponent whose graph is displayed in this view.
     * @type {yfiles.view.GraphComponent}
     */
    get graphComponent() {
      return this.$graphComponent
    }

    /**
     * Specifies the GraphComponent whose graph is displayed in this view.
     * @type {yfiles.view.GraphComponent}
     */
    set graphComponent(value) {
      if (this.$graphComponent !== null) {
        this.$graphComponent.removeGraphChangedListener(this.onGraphChanged.bind(this))
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
        this.$graphComponent.addGraphChangedListener(this.onGraphChanged.bind(this))
        if (this.useSelection) {
          this.installItemSelectionChangedListener()
        }
      } else {
        this.$sourceGraph = null
      }
    }

    /**
     * Returns the graph that's currently displayed by the neighborhood view.
     * @type {yfiles.graph.IGraph}
     */
    get sourceGraph() {
      return this.$sourceGraph
    }

    /**
     * Specifies the graph that's currently displayed by the neighborhood view.
     * @type {yfiles.graph.IGraph}
     */
    set sourceGraph(value) {
      if (this.$sourceGraph !== null) {
        this.uninstallEditListeners()
      }
      if (this.graphComponent !== null) {
        this.graphComponent.removeGraphChangedListener(this.onGraphChanged.bind(this))
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
     * @type {number}
     */
    get neighborhoodMode() {
      return this.$neighborhoodMode
    }

    /**
     * Specifies the method used for neighborhood computation.
     * @type {number}
     */
    set neighborhoodMode(value) {
      if (this.$neighborhoodMode !== value) {
        this.$neighborhoodMode = value
        this.update()
      }
    }

    /**
     * Returns the maximum distance for the neighborhood computation.
     * @type {number}
     */
    get maxDistance() {
      return this.$maxDistance
    }

    /**
     * Specifies the maximum distance for the neighborhood computation.
     * @type {number}
     */
    set maxDistance(value) {
      if (this.$maxDistance !== value) {
        this.$maxDistance = value
        this.update()
      }
    }

    /**
     * Returns the maximum number of selected nodes used for neighborhood computation.
     * If the number is exceeded the neighborhood will not be computed.
     * @type {number}
     */
    get maxSelectedNodesCount() {
      return this.$maxSelectedNodesCount
    }

    /**
     * Returns the configurable highlight style. If none is assigned, a default highlight style is used.
     * @type {yfiles.styles.INodeStyle}
     */
    get highlightStyle() {
      return this.$highlightStyle
    }

    /**
     * Specifies the configurable highlight style. If none is assigned, a default highlight style is used.
     * @type {yfiles.styles.INodeStyle}
     */
    set highlightStyle(value) {
      this.$highlightStyle = value
      this.installHighlightStyle(this.$highlightStyle)
    }

    /**
     * Gets the nodes whose neighborhoods are shown.
     * @type {yfiles.collections.ICollection.<yfiles.graph.INode>}
     */
    get selectedNodes() {
      return this.$selectedNodes
    }

    /**
     * Sets the nodes whose neighborhoods are shown.
     * @type {yfiles.collections.ICollection.<yfiles.graph.INode>}
     */
    set selectedNodes(value) {
      if (this.$selectedNodes !== value) {
        this.$selectedNodes = value
        this.update()
      }
    }

    /**
     * Gets whether to automatically synchronize the
     * {@link NeighborhoodView#graphComponent}'s selection to the
     * {@link NeighborhoodView#selectedNodes} of the neighborhood view.
     *
     * The default is <code>true</code>.
     *
     * The view is only updated automatically if {@link NeighborhoodView#autoUpdatesEnabled auto updates}
     * are enabled.
     * @type {boolean}
     */
    get useSelection() {
      return this.$useSelection
    }

    /**
     * Sets whether to automatically synchronize the
     * {@link NeighborhoodView#graphComponent}'s selection to the
     * {@link NeighborhoodView#selectedNodes} of the neighborhood view.
     *
     * The default is <code>true</code>.
     *
     * The view is only updated automatically if {@link NeighborhoodView#autoUpdatesEnabled auto updates}
     * are enabled.
     * @type {boolean}
     */
    set useSelection(value) {
      if (this.$useSelection !== value) {
        this.$useSelection = value
        if (value) {
          if (this.graphComponent !== null) {
            this.selectedNodes = new yfiles.collections.List(
              this.graphComponent.selection.selectedNodes
            )
          }
          this.installItemSelectionChangedListener()
        } else {
          this.uninstallItemSelectionChangedListener()
        }
      }
    }

    /**
     * Installs listeners such that the neighborhood component is updated if the
     * source graph is edited.
     */
    installEditListeners() {
      if (this.sourceGraph === null) {
        return
      }
      this.sourceGraph.addNodeCreatedListener(this.onNodeEdited.bind(this))
      this.sourceGraph.addNodeRemovedListener(this.onNodeRemoved.bind(this))
      this.sourceGraph.addNodeLayoutChangedListener(this.onNodeEdited.bind(this))
      this.sourceGraph.addNodeStyleChangedListener(this.onNodeEdited.bind(this))
      this.sourceGraph.addEdgeCreatedListener(this.onEdgeEdited.bind(this))
      this.sourceGraph.addEdgeRemovedListener(this.onEdgeEdited.bind(this))
      this.sourceGraph.addEdgePortsChangedListener(this.onEdgeEdited.bind(this))
      this.sourceGraph.addEdgeStyleChangedListener(this.onEdgeEdited.bind(this))
      this.sourceGraph.addPortAddedListener(this.onPortEdited.bind(this))
      this.sourceGraph.addPortRemovedListener(this.onPortEdited.bind(this))
      this.sourceGraph.addPortStyleChangedListener(this.onPortEdited.bind(this))
      this.sourceGraph.addLabelAddedListener(this.onLabelEdited.bind(this))
      this.sourceGraph.addLabelRemovedListener(this.onLabelEdited.bind(this))
      this.sourceGraph.addLabelStyleChangedListener(this.onLabelEdited.bind(this))
      this.sourceGraph.addLabelTextChangedListener(this.onLabelEdited.bind(this))

      this.sourceGraph.addIsGroupNodeChangedListener(this.onItemEdited.bind(this))
      this.sourceGraph.addParentChangedListener(this.onItemEdited.bind(this))
    }

    /**
     * Removes the edit listeners.
     */
    uninstallEditListeners() {
      if (this.sourceGraph === null) {
        return
      }
      this.sourceGraph.removeNodeCreatedListener(this.onNodeEdited.bind(this))
      this.sourceGraph.removeNodeRemovedListener(this.onNodeEdited.bind(this))
      this.sourceGraph.removeNodeLayoutChangedListener(this.onNodeEdited.bind(this))
      this.sourceGraph.removeNodeStyleChangedListener(this.onNodeEdited.bind(this))
      this.sourceGraph.removeEdgeCreatedListener(this.onEdgeEdited.bind(this))
      this.sourceGraph.removeEdgeRemovedListener(this.onEdgeEdited.bind(this))
      this.sourceGraph.removeEdgePortsChangedListener(this.onEdgeEdited.bind(this))
      this.sourceGraph.removeEdgeStyleChangedListener(this.onEdgeEdited.bind(this))
      this.sourceGraph.removePortAddedListener(this.onPortEdited.bind(this))
      this.sourceGraph.removePortRemovedListener(this.onPortEdited.bind(this))
      this.sourceGraph.removePortStyleChangedListener(this.onPortEdited.bind(this))
      this.sourceGraph.removeLabelAddedListener(this.onLabelEdited.bind(this))
      this.sourceGraph.removeLabelRemovedListener(this.onLabelEdited.bind(this))
      this.sourceGraph.removeLabelStyleChangedListener(this.onLabelEdited.bind(this))
      this.sourceGraph.removeLabelTextChangedListener(this.onLabelEdited.bind(this))

      this.sourceGraph.removeIsGroupNodeChangedListener(this.onItemEdited.bind(this))
      this.sourceGraph.removeParentChangedListener(this.onItemEdited.bind(this))
    }

    /**
     * @param {object} source
     * @param {yfiles.graph.NodeEventArgs} args
     */
    onItemEdited(source, args) {
      if (this.autoUpdatesEnabled) {
        this.scheduleUpdate()
      }
    }

    onNodeEdited() {
      if (this.autoUpdatesEnabled) {
        this.scheduleUpdate()
      }
    }

    onNodeRemoved() {
      if (this.autoUpdatesEnabled) {
        this.$selectedNodes = new yfiles.collections.List(
          this.graphComponent.selection.selectedNodes
        )
        this.scheduleUpdate()
      }
    }

    onEdgeEdited() {
      if (this.autoUpdatesEnabled) {
        this.scheduleUpdate()
      }
    }

    onLabelEdited() {
      if (this.autoUpdatesEnabled) {
        this.scheduleUpdate()
      }
    }

    onPortEdited() {
      if (this.autoUpdatesEnabled) {
        this.scheduleUpdate()
      }
    }

    /**
     * Called whenever the selection changes.
     * @param {object} sender
     * @param {yfiles.view.ItemSelectionChangedEventArgs} args
     */
    onItemSelectionChanged(sender, args) {
      if (this.autoUpdatesEnabled && yfiles.graph.INode.isInstance(args.item)) {
        this.$selectedNodes = new yfiles.collections.List(
          this.graphComponent.selection.selectedNodes
        )
        this.scheduleUpdate()
      }
    }

    /**
     * Installs the selection listeners.
     */
    installItemSelectionChangedListener() {
      if (this.graphComponent !== null) {
        this.graphComponent.selection.addItemSelectionChangedListener(
          this.onItemSelectionChanged.bind(this)
        )
      }
    }

    /**
     * Uninstalls the selection listeners.
     */
    uninstallItemSelectionChangedListener() {
      if (this.graphComponent !== null) {
        this.graphComponent.selection.removeItemSelectionChangedListener(
          this.onItemSelectionChanged.bind(this)
        )
      }
    }

    /**
     * Called when the graph property of the source graph is changed.
     * @param {object} sender
     * @param {yfiles.collections.ItemEventArgs} args
     */
    onGraphChanged(sender, args) {
      this.sourceGraph = this.graphComponent.graph
    }

    /**
     * Creates and installs the default highlight style.
     */
    initializeHighlightStyle() {
      // create semi transparent orange pen first
      const orangeRed = yfiles.view.Color.ORANGE_RED
      const orangePen = new yfiles.view.Stroke(orangeRed.r, orangeRed.g, orangeRed.b, 220, 3)
      // freeze it for slightly improved performance
      orangePen.freeze()

      const shapeStyle = new yfiles.styles.ShapeNodeStyle()
      shapeStyle.shape = 'rectangle'
      shapeStyle.stroke = orangePen
      shapeStyle.fill = null
      this.highlightStyle = shapeStyle

      // configure the highlight decoration installer
      this.installHighlightStyle(this.highlightStyle)
    }

    /**
     * Installs the given highlight style as node decorator.
     */
    installHighlightStyle(highlightStyle) {
      const nodeStyleHighlight = new yfiles.view.NodeStyleDecorationInstaller({
        nodeStyle: highlightStyle,
        // that should be slightly larger than the real node
        margins: 5,
        zoomPolicy: yfiles.view.StyleDecorationZoomPolicy.VIEW_COORDINATES
      })
      // register it as the default implementation for all nodes
      const decorator = this.neighborhoodComponent.graph.decorator
      decorator.nodeDecorator.highlightDecorator.setImplementation(nodeStyleHighlight)
    }

    /**
     * Initializes the input mode.
     */
    initializeInputMode() {
      // We disable focus, selection and marquee selection so the
      // component will display the plain graph without focus and
      // selection boundaries.
      const graphViewerInputMode = new yfiles.input.GraphViewerInputMode({
        clickableItems: yfiles.graph.GraphItemTypes.NODE,
        focusableItems: yfiles.graph.GraphItemTypes.NONE,
        selectableItems: yfiles.graph.GraphItemTypes.NONE,
        marqueeSelectableItems: yfiles.graph.GraphItemTypes.NONE
      })

      // Disable collapsing and expanding of groups
      graphViewerInputMode.navigationInputMode.collapsingGroupsAllowed = false
      graphViewerInputMode.navigationInputMode.expandingGroupsAllowed = false
      graphViewerInputMode.navigationInputMode.useCurrentItemForCommands = true
      graphViewerInputMode.moveViewportInputMode.enabled = false
      graphViewerInputMode.navigationInputMode.enabled = false

      // If an item is clicked, we want the view to show the neighborhood
      // of the clicked node, and invoke the click callback with the original
      // node.
      graphViewerInputMode.addItemClickedListener((sender, e) => {
        if (
          this.neighborhoodMode !== NeighborhoodView.MODE_FOLDER_CONTENTS &&
          yfiles.graph.INode.isInstance(e.item)
        ) {
          const node = e.item
          const originalNode = this.originalNodes.get(node)
          const selected = new yfiles.collections.List()
          selected.add(originalNode)
          this.selectedNodes = selected
          if (this.clickCallback !== null) {
            this.clickCallback(originalNode)
          }
        }
      })

      this.neighborhoodComponent.inputMode = graphViewerInputMode
    }

    /**
     * Schedules a call to {@link NeighborhoodView#update}. All consequent calls that
     * happen during the {@link NeighborhoodView#autoUpdateTimeMillis update time} are ignored.
     */
    scheduleUpdate() {
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
     * If {@link NeighborhoodView#autoUpdatesEnabled} is enabled, this method is
     * called automatically after the graph has been edited.
     *
     * Filters the source graph and calculates a layout based on the
     * value set in {@link NeighborhoodView#neighborhoodMode}.
     *
     * @see {@link NeighborhoodView#autoUpdatesEnabled}
     * @see {@link NeighborhoodView#useSelection}
     */
    update() {
      this.neighborhoodComponent.graph.clear()
      if (
        this.sourceGraph === null ||
        this.selectedNodes === null ||
        this.selectedNodes.size === 0 ||
        this.selectedNodes.size > this.maxSelectedNodesCount
      ) {
        return
      }

      this.originalNodes = new yfiles.collections.Mapper()
      const nodesToCopy = new Set()

      // Use one of our analysis algorithms to find the predecessors/successors
      const adapter = new yfiles.layout.YGraphAdapter(this.sourceGraph)

      // Create a list of start nodes.
      const startNodes = new yfiles.algorithms.NodeList()
      this.selectedNodes.forEach(node => {
        startNodes.push(adapter.getCopiedNode(node))
      })

      let /** @type {yfiles.collections.IEnumerable.<yfiles.graph.INode>} */ enumerable = null
      const copiedStartNodes = new yfiles.collections.List()

      if (this.neighborhoodMode !== NeighborhoodView.MODE_FOLDER_CONTENTS) {
        this.selectedNodes.forEach(node => {
          nodesToCopy.add(node)
        })

        switch (this.neighborhoodMode) {
          case NeighborhoodView.MODE_NEIGHBORHOOD:
            // Get direct and indirect neighbors of root node
            enumerable = adapter.createNodeEnumerable(
              yfiles.algorithms.GraphConnectivity.getNeighbors(
                adapter.yGraph,
                startNodes,
                this.maxDistance
              )
            )
            break
          case NeighborhoodView.MODE_PREDECESSORS:
            // Get predecessors of root node
            enumerable = adapter.createNodeEnumerable(
              yfiles.algorithms.GraphConnectivity.getPredecessors(
                adapter.yGraph,
                startNodes,
                this.maxDistance
              )
            )
            break
          case NeighborhoodView.MODE_SUCCESSORS:
            // Get successors of root node
            enumerable = adapter.createNodeEnumerable(
              yfiles.algorithms.GraphConnectivity.getSuccessors(
                adapter.yGraph,
                startNodes,
                this.maxDistance
              )
            )
            break
          default:
            // Get direct and indirect neighbors of root node
            enumerable = adapter.createNodeEnumerable(
              yfiles.algorithms.GraphConnectivity.getNeighbors(
                adapter.yGraph,
                startNodes,
                this.maxDistance
              )
            )
            break
        }

        if (enumerable !== null) {
          enumerable.forEach(node => {
            nodesToCopy.add(node)
          })
        }

        // Use GraphCopier to copy the nodes inside the neighborhood into the NeighborhoodComponent's graph.
        // Also, create the mapping of the copied nodes to original nodes inside the SourceGraph.
        const graphCopier = new yfiles.graph.GraphCopier()
        graphCopier.copy(
          this.sourceGraph,
          item => !yfiles.graph.INode.isInstance(item) || nodesToCopy.has(item),
          this.neighborhoodComponent.graph,
          null,
          new yfiles.geometry.Point(0, 0),
          (original, copy) => {
            if (yfiles.graph.INode.isInstance(original)) {
              this.originalNodes.set(copy, original)
              // noinspection JSCheckFunctionSignatures
              if (this.selectedNodes.includes(original)) {
                copiedStartNodes.add(copy)
              }
            }
          }
        )
      } else {
        if (this.selectedNodes.size > 1) {
          this.selectedNodes.forEach(node => {
            if (this.sourceGraph.getParent(node) !== null) {
              nodesToCopy.add(this.sourceGraph.foldingView.getMasterItem(node))
            }
          })
        }

        // Get descendants of root nodes.
        if (this.sourceGraph !== null) {
          const foldingView = this.sourceGraph.foldingView
          const groupingSupport = foldingView.manager.masterGraph.groupingSupport

          this.selectedNodes.forEach(node => {
            enumerable = groupingSupport.getDescendants(foldingView.getMasterItem(node))

            if (enumerable !== null) {
              enumerable.forEach(descendant => {
                nodesToCopy.add(descendant)
              })
            }
          })

          // Use GraphCopier to copy the nodes inside the neighborhood into the NeighborhoodComponent's graph.
          // Also, create the mapping of the copied nodes to original nodes inside the SourceGraph.
          // Include only edges that are descendants of the same root node.
          const graphCopier = new yfiles.graph.GraphCopier()
          graphCopier.copy(
            foldingView.manager.masterGraph,
            item => {
              if (yfiles.graph.IEdge.isInstance(item)) {
                const edge = yfiles.graph.IEdge.isInstance(item) ? item : null
                let intraComponentEdge = false
                this.selectedNodes.forEach(node => {
                  if (
                    groupingSupport.isDescendant(
                      edge.sourceNode,
                      foldingView.getMasterItem(node)
                    ) &&
                    groupingSupport.isDescendant(edge.targetNode, foldingView.getMasterItem(node))
                  ) {
                    intraComponentEdge = true
                  }
                })
                return intraComponentEdge
              }
              return !yfiles.graph.INode.isInstance(item) || nodesToCopy.has(item)
            },
            this.neighborhoodComponent.graph,
            null,
            new yfiles.geometry.Point(0, 0),
            (original, copy) => {
              if (yfiles.graph.INode.isInstance(original)) {
                this.originalNodes.set(copy, original)
                // noinspection JSCheckFunctionSignatures
                if (this.selectedNodes.includes(original)) {
                  copiedStartNodes.add(copy)
                }
              }
            }
          )
        }
      }

      // Layout the neighborhood graph using hierarchic layout.
      if (this.neighborhoodMode === NeighborhoodView.MODE_FOLDER_CONTENTS) {
        if (this.selectedNodes.size > 1) {
          this.neighborhoodComponent.graph.applyLayout(new yfiles.layout.ComponentLayout())
        }
      } else {
        this.neighborhoodComponent.graph.applyLayout(new yfiles.hierarchic.HierarchicLayout())
      }

      // Highlight the root node in the neighborhood graph.
      if (this.showHighlight && copiedStartNodes.size > 0) {
        const manager = this.neighborhoodComponent.highlightIndicatorManager
        manager.clearHighlights()
        copiedStartNodes.forEach(startNode => {
          manager.addHighlight(startNode)
        })
      }

      // Make the neighborhood graph fit inside the NeighborhoodComponent.
      this.neighborhoodComponent.fitGraphBounds(this.insets)
    }

    /**
     * Enumerations that holds the different modes of the NeighborhoodView.
     * @type {number}
     */
    static get MODE_NEIGHBORHOOD() {
      return 0
    }

    /** @type {number} */
    static get MODE_PREDECESSORS() {
      return 1
    }

    /** @type {number} */
    static get MODE_SUCCESSORS() {
      return 2
    }

    /** @type {number} */
    static get MODE_FOLDER_CONTENTS() {
      return 3
    }
  }

  return NeighborhoodView
})
