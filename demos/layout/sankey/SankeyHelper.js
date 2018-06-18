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
  'yfiles/view-component',
  'yfiles/view-layout-bridge'
], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * This layout stage ensures that the size of the nodes is large enough such that
   * all edges can be placed without overlaps.
   */
  class NodeResizingStage extends yfiles.layout.LayoutStageBase {
    /**
     * Creates a new instance of NodeResizingStage.
     * @param {yfiles.layout.ILayoutAlgorithm} layout
     */
    constructor(layout) {
      super(layout)
      this.layout = layout
      this.$layoutOrientation = yfiles.layout.LayoutOrientation.LEFT_TO_RIGHT
      this.$portBorderGapRatio = 0
      this.$minimumPortDistance = 0
    }

    /**
     * Gets the main orientation of the layout. Should be the same value as for the associated core layout
     * algorithm.
     * @return {yfiles.layout.LayoutOrientation} The main orientation of the layout
     */
    get layoutOrientation() {
      return this.$layoutOrientation
    }

    /**
     * Gets the main orientation of the layout. Should be the same value as for the associated core layout
     * algorithm.
     * @param {yfiles.layout.LayoutOrientation} orientation One of the default layout orientations
     */
    set layoutOrientation(orientation) {
      this.$layoutOrientation = orientation
    }

    /**
     * Gets the port border gap ratio for the port distribution at the sides of the nodes.
     * Should be the same value as for the associated core layout algorithm.
     * @return {number} The port border gap ratio
     */
    get portBorderGapRatio() {
      return this.$portBorderGapRatio
    }

    /**
     * Sets the port border gap ratio for the port distribution at the sides of the nodes. Should be the same value
     * as for the associated core layout algorithm.
     * @param {number} portBorderGapRatio The given ratio
     */
    set portBorderGapRatio(portBorderGapRatio) {
      this.$portBorderGapRatio = portBorderGapRatio
    }

    /**
     * Returns the minimum distance between two ports on the same node side.
     * @return {number} The minimum distance between two ports
     */
    get minimumPortDistance() {
      return this.$minimumPortDistance
    }

    /**
     * Gets the minimum distance between two ports on the same node side.
     * @param {number} minimumPortDistance The minimum distance
     */
    set minimumPortDistance(minimumPortDistance) {
      this.$minimumPortDistance = minimumPortDistance
    }

    /**
     * Applies the layout to the given graph.
     * @param {yfiles.layout.LayoutGraph} graph The given graph
     */
    applyLayout(graph) {
      graph.nodes.forEach(node => {
        this.adjustNodeSize(node, graph)
      })

      // run the core layout
      this.applyLayoutCore(graph)
    }

    /**
     * Adjusts the size of the given node.
     * @param {yfiles.algorithms.Node} node The given node
     * @param {yfiles.layout.LayoutGraph} graph The given graph
     */
    adjustNodeSize(node, graph) {
      let width = 60
      let height = 40

      const leftEdgeSpace = this.calcRequiredSpace(node.inEdges, graph)
      const rightEdgeSpace = this.calcRequiredSpace(node.outEdges, graph)
      if (
        this.layoutOrientation === yfiles.layout.LayoutOrientation.TOP_TO_BOTTOM ||
        this.layoutOrientation === yfiles.layout.LayoutOrientation.BOTTOM_TO_TOP
      ) {
        // we have to enlarge the width such that the in-/out-edges can be placed side by side without overlaps
        width = Math.max(width, leftEdgeSpace)
        width = Math.max(width, rightEdgeSpace)
      } else {
        // we have to enlarge the height such that the in-/out-edges can be placed side by side without overlaps
        height = Math.max(height, leftEdgeSpace)
        height = Math.max(height, rightEdgeSpace)
      }

      // adjust size for edges with strong port constraints
      const edgeThicknessDP = graph.getDataProvider(
        yfiles.hierarchic.HierarchicLayout.EDGE_THICKNESS_DP_KEY
      )
      if (edgeThicknessDP !== null) {
        node.edges.forEach(edge => {
          const thickness = edgeThicknessDP.getNumber(edge)

          const spc = yfiles.layout.PortConstraint.getSPC(graph, edge)
          if (edge.source === node && spc !== null && spc.strong) {
            const sourcePoint = graph.getSourcePointRel(edge)
            width = Math.max(width, Math.abs(sourcePoint.x) * 2 + thickness)
            height = Math.max(height, Math.abs(sourcePoint.y) * 2 + thickness)
          }

          const tpc = yfiles.layout.PortConstraint.getTPC(graph, edge)
          if (edge.target === node && tpc !== null && tpc.strong) {
            const targetPoint = graph.getTargetPointRel(edge)
            width = Math.max(width, Math.abs(targetPoint.x) * 2 + thickness)
            height = Math.max(height, Math.abs(targetPoint.y) * 2 + thickness)
          }
        })
      }
      graph.setSize(node, width, height)
    }

    /**
     * Calculates the space required when placing the given edge side by side without overlaps and considering
     * the specified minimum port distance and edge thickness.
     * @param {yfiles.collections.IEnumerable} edges The edges to calculate the space for
     * @param {yfiles.layout.LayoutGraph} graph The given graph
     */
    calcRequiredSpace(edges, graph) {
      let requiredSpace = 0
      const edgeThicknessDP = graph.getDataProvider(
        yfiles.hierarchic.HierarchicLayout.EDGE_THICKNESS_DP_KEY
      )
      let count = 0
      edges.forEach(edge => {
        const thickness = edgeThicknessDP === null ? 0 : edgeThicknessDP.getNumber(edge)
        requiredSpace += Math.max(thickness, 1)
        count++
      })

      requiredSpace += (count - 1) * this.minimumPortDistance
      requiredSpace += 2 * this.portBorderGapRatio * this.minimumPortDistance
      return requiredSpace
    }
  }

  /**
   * This class adds an HTML panel on top of the contents of the graphComponent that can
   * display arbitrary information about a {@link yfiles.graph.IModelItem graph item}.
   * In order to not interfere with the positioning of the pop-up, HTML content
   * should be added as ancestor of the {@link SankeyPopupSupport#div div element}, and
   * use relative positioning. This implementation uses a
   * {@link yfiles.graph.ILabelModelParameter label model parameter} to determine
   * the position of the pop-up.
   */
  class SankeyPopupSupport {
    /**
     * Constructor that takes the graphComponent, the container div element and an ILabelModelParameter
     * to determine the relative position of the popup.
     * @param {yfiles.view.GraphComponent} graphComponent The given graphComponent.
     * @param {Element} div The div element.
     * @param {yfiles.graph.ILabelModelParameter} labelModelParameter The label model parameter that determines
     * the position of the pop-up.
     */
    constructor(graphComponent, div, labelModelParameter) {
      this.graphComponent = graphComponent
      this.labelModelParameter = labelModelParameter
      this.$div = div
      this.$currentItem = null
      this.$dirty = false

      // make the popup invisible
      div.style.opacity = '0'
      div.style.display = 'none'

      this.registerListeners()
    }

    /**
     * Sets the container {@link HTMLPopupSupport#div div element}.
     * @param {HTMLElement} value The div element to be set.
     */
    set div(value) {
      this.$div = value
    }

    /**
     * Gets the container {@link HTMLPopupSupport#div div element}.
     * @return {HTMLElement}
     */
    get div() {
      return this.$div
    }

    /**
     * Sets the {@link yfiles.graph.IModelItem item} to display information for.
     * Setting this property to a value other than null shows the pop-up.
     * Setting the property to null hides the pop-up.
     * @param {yfiles.graph.IModelItem} value The current item.
     */
    set currentItem(value) {
      if (value === this.$currentItem) {
        return
      }
      this.$currentItem = value
      if (value !== null) {
        this.show()
      } else {
        this.hide()
      }
    }

    /**
     * Gets the {@link yfiles.graph.IModelItem item} to display information for.
     * @return {yfiles.graph.IModelItem} The item to display information for
     */
    get currentItem() {
      return this.$currentItem
    }

    /**
     * Sets the flag for the current position is no longer valid.
     * @param {boolean} value True if the current position is no longer valid, false otherwise.
     */
    set dirty(value) {
      this.$dirty = value
    }

    /**
     * Gets the flag for the current position is no longer valid.
     * @return {boolean} True if the current position is no longer valid, false otherwise
     */
    get dirty() {
      return this.$dirty
    }

    /**
     * Registers viewport, node bounds changes and visual tree listeners to the given graphComponent.
     */
    registerListeners() {
      // Adds listener for viewport changes
      this.graphComponent.addViewportChangedListener(() => {
        if (this.currentItem) {
          this.dirty = true
        }
      })

      // Adds listeners for node bounds changes
      this.graphComponent.graph.addNodeLayoutChangedListener(node => {
        if (
          ((this.currentItem && this.currentItem === node) ||
            yfiles.graph.IEdge.isInstance(this.currentItem)) &&
          (node === this.currentItem.sourcePort.owner || node === this.currentItem.targetPort.owner)
        ) {
          this.dirty = true
        }
      })

      // Adds listener for updates of the visual tree
      this.graphComponent.addUpdatedVisualListener(() => {
        if (this.currentItem && this.dirty) {
          this.dirty = false
          this.updateLocation()
        }
      })
    }

    /**
     * Makes this pop-up visible near the given item.
     */
    show() {
      this.div.style.display = 'block'
      this.div.style.opacity = '1'
      this.updateLocation()
    }

    /**
     * Hides this pop-up.
     */
    hide() {
      this.div.style.opacity = '0'
      this.div.style.display = 'none'
    }

    /**
     * Changes the location of this pop-up to the location calculated by the
     * {@link HTMLPopupSupport#labelModelParameter}. Currently, this implementation does not support rotated pop-ups.
     */
    updateLocation() {
      if (!this.currentItem && !this.labelModelParameter) {
        return
      }
      const width = this.div.clientWidth
      const height = this.div.clientHeight
      const zoom = this.graphComponent.zoom

      const dummyLabel = new yfiles.graph.SimpleLabel(
        this.currentItem,
        '',
        this.labelModelParameter
      )
      if (this.labelModelParameter.supports(dummyLabel)) {
        dummyLabel.preferredSize = new yfiles.geometry.Size(width / zoom, height / zoom)
        const newLayout = this.labelModelParameter.model.getGeometry(
          dummyLabel,
          this.labelModelParameter
        )
        this.setLocation(newLayout.anchorX, newLayout.anchorY - (height + 10) / zoom)
      }
    }

    /**
     * Sets the location of this pop-up to the given world coordinates.
     * @param {number} x The target x-coordinate of the pop-up.
     * @param {number} y The target y-coordinate of the pop-up.
     */
    setLocation(x, y) {
      // Calculate the view coordinates since we have to place the div in the regular HTML coordinate space
      const viewPoint = this.graphComponent.toViewCoordinates(new yfiles.geometry.Point(x, y))
      this.div.style.left = `${viewPoint.x}px`
      this.div.style.top = `${viewPoint.y}px`
    }
  }

  /**
   * This class provides undo/redo for an operation changing tag data.
   * @extends yfiles.graph.UndoUnitBase
   */
  class TagUndoUnit extends yfiles.graph.UndoUnitBase {
    /**
     * The constructor
     * @param {string} undoName Name of the undo operation
     * @param {string} redoName Name of the redo operation
     * @param {Object} oldTag The data to restore the previous state
     * @param {Object} newTag The data to restore the next state
     * @param {yfiles.graph.IModelItem} item The owner of the tag
     */
    constructor(undoName, redoName, oldTag, newTag, item) {
      super(undoName, redoName)
      this.oldTag = oldTag
      this.newTag = newTag
      this.item = item
    }

    /**
     * Undoes the work that is represented by this unit.
     */
    undo() {
      this.item.tag = this.oldTag
    }

    /**
     * Redoes the work that is represented by this unit.
     */
    redo() {
      this.item.tag = this.newTag
    }
  }

  return {
    NodeResizingStage,
    SankeyPopupSupport,
    TagUndoUnit
  }
})
