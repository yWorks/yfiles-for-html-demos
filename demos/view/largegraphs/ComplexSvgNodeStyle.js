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
   * An SVG node style with a complex visualization. The style displays an SVG g elemnent consisting of
   * several SVG elements based on a random number in the node tag. The number determines
   * the actual icon.
   * The node style makes use of the defs element and only refers to the actual SVG elements.
   * The g element referenced by the use is expected to be of size 1x1 and scaled up according
   * to the node's size. Using an SVG with a viewport would work, too, however this is currently discouraged
   * for performance reasons in Firefox (see https://bugzilla.mozilla.org/show_bug.cgi?id=1420160 )
   * @extends yfiles.styles.NodeStyleBase
   */
  class ComplexSvgNodeStyle extends yfiles.styles.NodeStyleBase {
    /**
     * Creates an instance of the complex SVG node style.
     */
    constructor() {
      super()
      // Each SVG visualization is placed in the defs element.
      this.images = [
        new ImageDefsSupport('usericon_female1'),
        new ImageDefsSupport('usericon_female2'),
        new ImageDefsSupport('usericon_female3'),
        new ImageDefsSupport('usericon_female4'),
        new ImageDefsSupport('usericon_female5'),
        new ImageDefsSupport('usericon_male1'),
        new ImageDefsSupport('usericon_male2'),
        new ImageDefsSupport('usericon_male3'),
        new ImageDefsSupport('usericon_male4'),
        new ImageDefsSupport('usericon_male5')
      ]
    }

    /**
     * Callback that creates the visual.
     * This method is called in response to a {@link yfiles.view.IVisualCreator#createVisual}
     * call to the instance that has been queried from the {@link yfiles.styles.NodeStyleBase#renderer}.
     * @param {yfiles.view.IRenderContext} context The render context.
     * @param {yfiles.graph.INode} node The node to which this style instance is assigned.
     * @return {yfiles.view.Visual} The visual as required by the {@link yfiles.view.IVisualCreator#createVisual}
     *   interface.
     * @see {@link yfiles.styles.NodeStyleBase#updateVisual}
     */
    createVisual(context, node) {
      const { x, y, width, height } = node.layout

      // refer to the SVG by a 'use'
      const useElement = window.document.createElementNS('http://www.w3.org/2000/svg', 'use')

      // get the number stored in the node's tag
      let i = 0
      if (yfiles.lang.Number.isInstance(node.tag)) {
        i = node.tag | 0
      }
      i = Math.max(0, Math.min(this.images.length, i))

      // get the defs support for representation based on the tag number
      const defsSupport = this.images[i]

      // get the defs-id of the SVG group ...
      const id = context.getDefsId(defsSupport)
      // ... and assign it to the 'use'-element
      useElement.href.baseVal = `#${id}`

      // set the proper location and size of the use
      const matrix = new yfiles.geometry.Matrix(width, 0, 0, height, x, y)
      matrix.applyTo(useElement)

      // store the data with which we created the rect so we can efficiently update it later
      useElement['data-cache'] = {
        x,
        y,
        width,
        height
      }

      return new yfiles.view.SvgVisual(useElement)
    }

    /**
     * Callback that updates the visual previously created by {@link yfiles.styles.NodeStyleBase#createVisual}.
     * This method is called in response to a {@link yfiles.view.IVisualCreator#updateVisual}
     * call to the instance that has been queried from the {@link yfiles.styles.NodeStyleBase#renderer}.
     * This implementation simply delegates to {@link yfiles.styles.NodeStyleBase#createVisual} so subclasses
     * should override to improve rendering performance.
     * @param {yfiles.view.IRenderContext} context The render context.
     * @param {yfiles.view.Visual} oldVisual The visual that has been created in the call to
     *   {@link yfiles.styles.NodeStyleBase#createVisual}.
     * @param {yfiles.graph.INode} node The node to which this style instance is assigned.
     * @return {yfiles.view.Visual} The visual as required by the {@link yfiles.view.IVisualCreator#createVisual}
     *   interface.
     * @see {@link yfiles.styles.NodeStyleBase#createVisual}
     */
    updateVisual(context, oldVisual, node) {
      const { x, y, width, height } = node.layout

      // get the use element
      const useElement = oldVisual.svgElement

      // get the cache we stored in createVisual
      const cache = useElement['data-cache']

      // update width and height only if necessary
      if (cache.x !== x || cache.y !== y || cache.width !== width || cache.height !== height) {
        // set the proper location and size of the use
        const matrix = new yfiles.geometry.Matrix(width, 0, 0, height, x, y)
        matrix.applyTo(useElement)
        cache.x = x
        cache.y = y
        cache.width = width
        cache.height = height
      }

      return oldVisual
    }

    /**
     * Gets the outline of the node, an ellipse in this case.
     * This allows correct edge path intersection calculation, among others.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#getOutline}
     * @param {yfiles.graph.INode} node The node.
     * @return {yfiles.geometry.GeneralPath}
     */
    getOutline(node) {
      const outline = new yfiles.geometry.GeneralPath()
      outline.appendEllipse(node.layout, false)
      return outline
    }

    /**
     * Get the bounding box of the node.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#getBounds}
     * @param {yfiles.view.ICanvasContext} context The canvas context.
     * @param {yfiles.graph.INode} node The node.
     * @return {yfiles.geometry.Rect}
     */
    getBounds(context, node) {
      return node.layout.toRect()
    }

    /**
     * Hit test which considers the HitTestRadius specified in CanvasContext.
     * @param {yfiles.input.IInputModeContext} context The input mode context.
     * @param {yfiles.geometry.Point} p The location to be checked.
     * @param {yfiles.graph.INode} node The node that may be hit.
     * @return {boolean} True if p is inside node.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#isHit}
     */
    isHit(context, p, node) {
      if (!super.isHit(context, p, node)) {
        return false
      }
      return yfiles.geometry.GeomUtilities.ellipseContains(
        node.layout.toRect(),
        p,
        context.hitTestRadius
      )
    }

    /**
     * Checks if a node is inside a certain box. Considers HitTestRadius.
     * @param {yfiles.input.IInputModeContext} canvasContext The input mode context.
     * @param {yfiles.geometry.Rect} box the rectangle to be checked.
     * @param {yfiles.graph.INode} node The node that may be in the rectangle.
     * @return {boolean} True if the box intersects the elliptical shape of the node. Also true if box lies completely
     *   inside node.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#isInBox}
     */
    isInBox(canvasContext, box, node) {
      // early exit if not even the bounds are contained in the box
      if (!super.isInBox(canvasContext, box, node)) {
        return false
      }

      const eps = canvasContext.hitTestRadius

      const outline = this.getOutline(node)
      if (outline === null) {
        return false
      }

      if (outline.intersects(box, eps)) {
        return true
      }
      if (outline.pathContains(box.topLeft, eps) && outline.pathContains(box.bottomRight, eps)) {
        return true
      }
      return (
        box.contains(node.layout.toRect().topLeft) && box.contains(node.layout.toRect().bottomRight)
      )
    }

    /**
     * Exact geometric check whether a point p lies inside the node. This is important for intersection calculation,
     * among others.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#isInside}
     * @param {yfiles.graph.INode} node The node.
     * @param {yfiles.geometry.Point} p The point to be checked.
     * @return {boolean}
     */
    isInside(node, p) {
      if (!super.isInside(node, p)) {
        return false
      }
      return yfiles.geometry.GeomUtilities.ellipseContains(node.layout.toRect(), p, 0)
    }

    /**
     * Calculates the intersection point of the node's outline with a line between
     * an inner and an outer point.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#getIntersection}
     * @param {yfiles.graph.INode} node The node.
     * @param {yfiles.geometry.Point} inner The inner point of the line.
     * @param {yfiles.geometry.Point} outer The outer point of the line.
     * @return {yfiles.geometry.Point}
     */
    getIntersection(node, inner, outer) {
      return yfiles.geometry.GeomUtilities.findEllipseLineIntersection(
        node.layout.toRect(),
        inner,
        outer
      )
    }
  }

  /**
   * This class manages the defs element.
   */
  class ImageDefsSupport extends yfiles.lang.Class(yfiles.view.ISvgDefsCreator) {
    /**
     * Creates an instance of the defs support class. Each node type
     * is managed by its own defs support.
     * @param {string} id
     */
    constructor(id) {
      super()
      // the SVG groups are placed in the DOM and need to be fetched from there.
      const imageElement = window.document.getElementById(id)
      if (imageElement !== null) {
        this.element = imageElement
      }
    }

    /**
     * Creates the actual defs element.
     * @param {yfiles.view.ICanvasContext} context The canvas context.
     * @return {SVGElement}
     * @see Specified by {@link yfiles.view.ISvgDefsCreator#createDefsElement}.
     */
    createDefsElement(context) {
      // the element needs to be cloned otherwise it will be removed during canvas export
      if (this.element) {
        const visualElement = this.element.cloneNode(true)
        // prevent duplicate ids due to cloning
        visualElement.removeAttribute('id')
        return visualElement
      }
      return null
    }

    /**
     * Updates the defs element. This implementation does nothing.
     * @param {SVGElement} oldElement The old defs element.
     * @param {yfiles.view.ICanvasContext} context The canvas context.
     * @see Specified by {@link yfiles.view.ISvgDefsCreator#updateDefsElement}.
     */
    updateDefsElement(context, oldElement) {}

    /**
     * Checks if this defs element is still referenced by this node.
     * @param {yfiles.view.ICanvasContext} context The canvas context.
     * @param {Node} node The node.
     * @param {string} id The defs id.
     * @return {boolean}
     * @see Specified by {@link yfiles.view.ISvgDefsCreator#accept}.
     */
    accept(context, node, id) {
      // the element should never be removed from the DOM
      return true
    }
  }

  return ComplexSvgNodeStyle
})
