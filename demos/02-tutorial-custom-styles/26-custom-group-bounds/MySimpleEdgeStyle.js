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

define(['yfiles/view-component', './MySimpleArrow.js', './AnimatedLinearGradient.js'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  MySimpleArrow,
  AnimatedGradient
) => {
  /**
   * This class is an example for a custom edge style based on {@link yfiles.styles.EdgeStyleBase}.
   * @extends yfiles.styles.EdgeStyleBase
   */
  class MySimpleEdgeStyle extends yfiles.styles.EdgeStyleBase {
    /**
     * Initializes a new instance of the {@link MySimpleEdgeStyle} class.
     */
    constructor() {
      super()
      this.$arrows = new MySimpleArrow()
      this.$pathThickness = 3
    }

    /**
     * Gets the thickness of the edge.
     * @type {number}
     */
    get pathThickness() {
      return this.$pathThickness
    }

    /**
     * Sets the thickness of the edge.
     * @type {number}
     */
    set pathThickness(value) {
      this.$pathThickness = value
    }

    /**
     * Gets the arrows drawn at the beginning and at the end of the edge.
     * @type {number}
     */
    get arrows() {
      return this.$arrows
    }

    /**
     * Sets the arrows drawn at the beginning and at the end of the edge.
     * @type {number}
     */
    set arrows(value) {
      this.$arrows = value
    }

    /**
     * Creates the visual for an edge.
     * @see Overrides {@link yfiles.styles.EdgeStyleBase#createVisual}
     * @return {yfiles.view.Visual}
     */
    createVisual(context, edge) {
      // This implementation creates a CanvasContainer and uses it for the rendering of the edge.
      const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
      // Get the necessary data for rendering of the edge
      const cache = this.createRenderDataCache(context, edge)
      // Render the edge
      this.render(context, edge, g, cache)
      return new yfiles.view.SvgVisual(g)
    }

    /**
     * Re-renders the edge using the old visual for performance reasons.
     * @see Overrides {@link yfiles.styles.EdgeStyleBase#updateVisual}
     * @return {yfiles.view.Visual}
     */
    updateVisual(context, oldVisual, edge) {
      const container = oldVisual.svgElement
      // get the data with which the oldvisual was created
      const oldCache = container['data-renderDataCache']
      // get the data for the new visual
      const newCache = this.createRenderDataCache(context, edge)

      // check if something changed
      if (!newCache.stateEquals(oldCache)) {
        // more than only the path changed - re-render the visual
        while (container.firstChild) {
          container.removeChild(container.firstChild)
        }
        this.render(context, edge, container, newCache)
        return oldVisual
      }

      if (!newCache.pathEquals(oldCache)) {
        // only the path changed - update the old visual
        this.updatePath(context, edge, container, newCache)
      }
      return oldVisual
    }

    /**
     * Creates an object containing all necessary data to create an edge visual.
     * @return {object}
     */
    createRenderDataCache(context, edge) {
      // Get the owner node's color
      const node = edge.sourcePort.owner
      let color
      const nodeStyle = node.style
      if (typeof nodeStyle.getNodeColor === 'function') {
        color = nodeStyle.getNodeColor(node)
      } else {
        color = '#0082b4'
      }

      const selection = context.canvasComponent !== null ? context.canvasComponent.selection : null
      const selected = selection !== null && selection.isSelected(edge)
      return {
        thickness: this.pathThickness,
        selected,
        color,
        path: this.getPath(edge),
        arrows: this.arrows,
        equals(other) {
          return this.pathEquals(other) && this.stateEquals(other)
        },
        stateEquals(other) {
          return (
            other.thickness === this.thickness &&
            other.selected === this.selected &&
            other.color === this.color &&
            this.arrows.equals(other.arrows)
          )
        },
        pathEquals(other) {
          return other.path.hasSameValue(this.path)
        }
      }
    }

    /**
     * Creates the visual appearance of an edge.
     */
    render(context, edge, container, cache) {
      const g = container

      // store information with the visual on how we created it
      g['data-renderDataCache'] = cache

      const path = cache.path.createSvgPath()

      path.setAttribute('fill', 'none')
      path.setAttribute('stroke-width', cache.thickness.toString())
      path.setAttribute('stroke-linejoin', 'round')

      if (cache.selected) {
        // Fill for selected state
        AnimatedGradient.applyToElement(context, path)
      } else {
        // Fill for non-selected state
        path.setAttribute('stroke', cache.color)
      }

      container.appendChild(path)

      // add the arrows to the container
      super.addArrows(context, container, edge, cache.path, cache.arrows, cache.arrows)
    }

    /**
     * Updates the edge path data as well as the arrow positions of the visuals stored in <param name="container" />.
     * @param context {yfiles.view.IRenderContext}
     * @param edge {yfiles.graph.IEdge}
     * @param container {SVGElement}
     * @param cache {RenderDataCache}
     */
    updatePath(context, edge, container, cache) {
      // The first child must be a path - else re-create the container from scratch
      if (
        container.childNodes.length === 0 ||
        !(container.childNodes[0] instanceof SVGPathElement)
      ) {
        while (container.firstChild) {
          container.removeChild(container.firstChild)
        }
        this.render(context, edge, container, cache)
        return
      }

      // store information with the visual on how we created it
      container['data-renderDataCache'] = cache

      const gp = cache.path

      const path = container.childNodes[0]

      const updatedPath = gp.createSvgPath()
      path.setAttribute('d', updatedPath.getAttribute('d'))

      // update the arrows
      super.updateArrows(context, container, edge, gp, cache.arrows, cache.arrows)
    }

    /**
     * Creates a {@link yfiles.geometry.GeneralPath} from the edge's bends.
     * @param {yfiles.graph.IEdge} edge The edge to create the path for.
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

      // shorten the path in order to provide room for drawing the arrows.
      const croppedPath = super.cropPath(edge, this.arrows, this.arrows, path)
      return croppedPath
    }

    /**
     * Determines whether the visual representation of the edge has been hit at the given location.
     * Overridden method to include the {@link MySimpleEdgeStyle#pathThickness} and the HitTestRadius specified in the
     * context in the calculation.
     * @see Overrides {@link yfiles.styles.EdgeStyleBase#isHit}
     * @return {boolean}
     */
    isHit(canvasContext, p, edge) {
      // Use the convenience method in GeneralPath
      return this.getPath(edge).pathContains(
        p,
        canvasContext.hitTestRadius + this.pathThickness * 0.5
      )
    }

    /**
     * Determines whether the edge is visible in the given rectangle.
     * Overridden method to improve performance of the suprt implementation
     * @see Overrides {@link yfiles.styles.EdgeStyleBase#isVisible}
     * @return {boolean}
     */
    isVisible(context, rectangle, edge) {
      // enlarge the test rectangle to include the path thickness
      const enlargedRectangle = rectangle.getEnlarged(this.pathThickness)
      // delegate to the efficient implementation of PolylineEdgeStyle
      return helperEdgeStyle.renderer
        .getVisibilityTestable(edge, helperEdgeStyle)
        .isVisible(context, enlargedRectangle)
    }

    /**
     * This implementation of the look up provides a custom implementation of the
     * {@link yfiles.view.ISelectionIndicatorInstaller} interface that better suits to this style.
     * @see Overrides {@link yfiles.styles.EdgeStyleBase#lookup}
     * @return {Object}
     */
    lookup(edge, type) {
      if (type === yfiles.view.ISelectionIndicatorInstaller.$class) {
        return new MySelectionInstaller()
      }

      return super.lookup.call(this, edge, type)
    }
  }

  const helperEdgeStyle = new yfiles.styles.PolylineEdgeStyle({
    sourceArrow: yfiles.styles.IArrow.NONE,
    targetArrow: yfiles.styles.IArrow.NONE
  })

  /**
   * This customized {@link yfiles.view.EdgeSelectionIndicatorInstaller} overrides the
   * getStroke method to return <code>null</code>, so that no edge path is rendered if the edge is selected.
   */
  class MySelectionInstaller extends yfiles.view.EdgeSelectionIndicatorInstaller {
    /** @return {yfiles.view.Stroke} */
    getStroke(canvas, edge) {
      return null
    }
  }

  return MySimpleEdgeStyle
})
