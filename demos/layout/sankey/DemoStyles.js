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

define(['yfiles/view-component'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * An EdgeStyle that visualizes the flow of each edge determined by the edge's tag.
   * @extends yfiles.styles.EdgeStyleBase
   */
  class DemoEdgeStyle extends yfiles.styles.EdgeStyleBase {
    /**
     * Creates a new instance of DemoEdgeStyle.
     * @param {boolean}highlight
     */
    constructor(highlight) {
      super()
      this.highlight = highlight
    }

    /**
     * Creates the visual for an edge.
     * @param {yfiles.view.IRenderContext} context The render context
     * @param {yfiles.graph.IEdge} edge The edge to which this style instance is assigned.
     * @see Overrides {@link yfiles.styles.EdgeStyleBase#createVisual}
     * @returns {yfiles.view.Visual} The new visual
     */
    createVisual(context, edge) {
      // This implementation creates a CanvasContainer and uses it for the rendering of the edge.
      const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')

      const selection = context.canvasComponent !== null ? context.canvasComponent.selection : null
      const selected = selection !== null && selection.isSelected(edge)
      // Get the necessary data for rendering of the edge
      const cache = this.createRenderDataCache(edge, selected)
      // Render the edge
      this.render(g, cache)
      return new yfiles.view.SvgVisual(g)
    }

    /**
     * Re-renders the edge using the old visual for performance reasons.
     * @param {yfiles.view.IRenderContext} context The render context
     * @param {yfiles.view.SvgVisual} oldVisual The old visual
     * @param {yfiles.graph.IEdge} edge The edge to which this style instance is assigned
     * @see Overrides {@link yfiles.styles.EdgeStyleBase#updateVisual}
     * @return {yfiles.view.Visual} The updated visual
     */
    updateVisual(context, oldVisual, edge) {
      const container = oldVisual.svgElement
      // get the data with which the old visual was created
      const oldCache = container['data-renderDataCache']

      const selection = context.canvasComponent !== null ? context.canvasComponent.selection : null
      const selected = selection !== null && selection.isSelected(edge)

      // get the data for the new visual
      const newCache = this.createRenderDataCache(edge, selected)

      // check if something changed
      if (newCache.equals(newCache, oldCache)) {
        // nothing changed, return the old visual
        return oldVisual
      }
      // something changed - re-render the visual
      while (container.hasChildNodes()) {
        // remove all children
        container.removeChild(container.firstChild)
      }
      this.render(container, newCache)
      return oldVisual
    }

    /**
     * Creates an object containing all necessary data to create an edge visual.
     * @param {yfiles.graph.IEdge} edge
     * @param {boolean} selected
     * @return {object}
     */
    createRenderDataCache(edge, selected) {
      return {
        thickness: edge.tag.thickness,
        selected,
        color: edge.tag.color,
        path: this.getPath(edge),
        equals: (self, other) =>
          self.thickness === other.thickness &&
          self.color === other.color &&
          self.path.hasSameValue(other.path) &&
          self.selected === other.selected
      }
    }

    /**
     * Creates the visual appearance of an edge.
     * @param {Element} container The svg container
     * @param {Object} cache The render data cache
     */
    render(container, cache) {
      // store information with the visual on how we created it
      container['data-renderDataCache'] = cache

      const path = cache.path.createSvgPath()
      path.setAttribute('fill', 'none')
      path.setAttribute('stroke-linejoin', 'round')
      const color = `rgb(${cache.color.r},${cache.color.g},${cache.color.b})`
      path.setAttribute('stroke', color)
      if (this.highlight) {
        path.setAttribute('stroke-width', Math.max(cache.thickness + 2, 2).toString())
      } else {
        path.setAttribute('stroke-width', cache.thickness.toString())
      }
      if (cache.selected) {
        path.setAttribute('opacity', '0.5')
      } else {
        path.setAttribute('opacity', '0.8')
      }
      container.appendChild(path)
    }

    /**
     * Creates a {@link yfiles.geometry.GeneralPath} from the edge's bends.
     * @param {yfiles.graph.IEdge} edge The edge to create the path for
     * @return {yfiles.geometry.GeneralPath} A {@link yfiles.geometry.GeneralPath} following the edge
     * @see Overrides {@link yfiles.styles.EdgeStyleBase#getPath}
     */
    getPath(edge) {
      // Create a general path from the locations of the ports and the bends of the edge.
      const path = new yfiles.geometry.GeneralPath()
      path.moveTo(edge.sourcePort.location)
      edge.bends.forEach(bend => {
        path.lineTo(bend.location)
      })
      path.lineTo(edge.targetPort.location)
      return path
    }

    /**
     * Determines whether the visual representation of the edge has been hit at the given location.
     * @param {yfiles.input.IInputModeContext} canvasContext The render context
     * @param {yfiles.geometry.Point} p The coordinates of the query in the world coordinate system
     * @param {yfiles.graph.IEdge} edge The given edge
     * @see Overrides {@link yfiles.styles.EdgeStyleBase#isHit}
     * @return {boolean} True if the edge has been hit, false otherwise
     */
    isHit(canvasContext, p, edge) {
      let thickness = 0
      const sourcePortX = edge.sourcePort.location.x
      const targetPortX = edge.targetPort.location.x

      const sourcePortLeft = sourcePortX < targetPortX
      if (edge.tag && edge.tag.thickness) {
        if (
          (sourcePortLeft && p.x >= sourcePortX && p.x <= targetPortX) ||
          (!sourcePortLeft && p.x <= sourcePortX && p.x >= targetPortX)
        ) {
          thickness = edge.tag.thickness * 0.5
        }
      }
      return this.getPath(edge).pathContains(p, canvasContext.hitTestRadius + thickness)
    }

    /**
     * Get the bounding box of the edge.
     * @see Overrides {@link yfiles.styles.EdgeStyleBase#getBounds}
     * @param {yfiles.view.ICanvasContext} canvasContext
     * @param {yfiles.graph.IEdge} edge
     * @return {yfiles.geometry.Rect}
     */
    getBounds(canvasContext, edge) {
      let thickness = 0
      if (edge.tag && edge.tag.thickness) {
        thickness = edge.tag.thickness * 0.5
      }
      return this.getPath(edge)
        .getBounds()
        .getEnlarged(thickness)
    }

    /**
     * This implementation of the look up provides a custom implementation of the
     * {@link yfiles.view.ISelectionIndicatorInstaller} interface that better suits to this style.
     * @see Overrides {@link yfiles.styles.EdgeStyleBase#lookup}
     * @param {yfiles.graph.IEdge} edge
     * @param {yfiles.lang.Class} type
     * @return {Object}
     */
    lookup(edge, type) {
      if (type === yfiles.view.ISelectionIndicatorInstaller.$class) {
        return new MySelectionInstaller()
      }

      return super.lookup.call(this, edge, type)
    }
  }

  /**
   * This customized {@link yfiles.view.EdgeSelectionIndicatorInstaller} overrides the
   * getStroke method to return <code>null</code>, so that no edge path is rendered if the edge is selected.
   */
  class MySelectionInstaller extends yfiles.view.EdgeSelectionIndicatorInstaller {
    /**
     * Returns null to prevent rendering of the edge path when the edge is selected.
     * @param {yfiles.view.CanvasComponent} canvas
     * @param {yfiles.graph.IEdge} edge
     * @return {null}
     */
    getStroke(canvas, edge) {
      return null
    }
  }

  /**
   * A highlight manager responsible for highlighting edges and labels. In particular, edge highlighting should remain
   * below the label group.
   */
  class HighlightManager extends yfiles.view.HighlightIndicatorManager {
    /**
     * Creates a new instance of HighlightManager.
     * @param {yfiles.view.CanvasComponent} canvas
     */
    constructor(canvas) {
      super(canvas)
      const graphModelManager = this.canvasComponent.graphModelManager
      this.edgeHighlightGroup = graphModelManager.contentGroup.addGroup()
      this.edgeHighlightGroup.below(graphModelManager.edgeLabelGroup)
    }

    /**
     * This implementation always returns the highlightGroup of the canvasComponent of this instance.
     * @param {yfiles.graph.IModelItem} item The item to check
     * @return {yfiles.view.ICanvasObjectGroup} An ICanvasObjectGroup or null
     */
    getCanvasObjectGroup(item) {
      if (yfiles.graph.IEdge.isInstance(item)) {
        return this.edgeHighlightGroup
      }
      return super.getCanvasObjectGroup(item)
    }

    /**
     * Callback used by install to retrieve the installer for a given item.
     * @param {yfiles.graph.IModelItem} item The item to find an installer for
     * @returns {yfiles.view.ICanvasObjectInstaller} The Highlighting installer
     */
    getInstaller(item) {
      if (yfiles.graph.IEdge.isInstance(item)) {
        return new yfiles.view.EdgeStyleDecorationInstaller({
          edgeStyle: new DemoEdgeStyle(true),
          zoomPolicy: yfiles.view.StyleDecorationZoomPolicy.WORLD_COORDINATES
        })
      } else if (yfiles.graph.ILabel.isInstance(item)) {
        return new yfiles.view.LabelStyleDecorationInstaller({
          labelStyle: new yfiles.styles.NodeStyleLabelStyleAdapter(
            new yfiles.styles.ShapeNodeStyle({
              shape: yfiles.styles.ShapeNodeShape.ROUND_RECTANGLE,
              stroke: '2px dodgerblue',
              fill: 'transparent'
            }),
            yfiles.styles.VoidLabelStyle.INSTANCE
          ),
          margins: 3,
          zoomPolicy: yfiles.view.StyleDecorationZoomPolicy.WORLD_COORDINATES
        })
      }
      return super.getInstaller(item)
    }
  }

  return {
    DemoEdgeStyle,
    HighlightManager
  }
})
