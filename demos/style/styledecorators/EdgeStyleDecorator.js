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
   * This edge style decorator shows how to decorate an edge style with bends that are rendered by a port style.
   *
   * This implementation wraps {@link yfiles.styles.PolylineEdgeStyle}.
   *
   * The {@link yfiles.styles.PolylineEdgeStyle#pen} of the wrapped style is modified based on the value stored in the
   * edge's tag. In order to render the edge's bend, and arbitrary {@link yfiles.styles.IPortStyle port style}, that
   * can be set in the constructor, is used.
   */
  class EdgeStyleDecorator extends yfiles.styles.EdgeStyleBase {
    /**
     * Initializes a new instance of this class.
     * @param {yfiles.styles.IPortStyle} bendStyle An optional port style that is used to draw the bends.
     */
    constructor(bendStyle) {
      super()
      this.bendStyle = bendStyle || null
      const baseStyle = new yfiles.styles.PolylineEdgeStyle()
      baseStyle.smoothing = 5.0
      this.baseStyle = baseStyle
    }

    /**
     * Creates a new visual as combination of the base edge visualization and the bend visualizations.
     * @param {yfiles.view.IRenderContext} context The render context.
     * @param {yfiles.graph.IEdge} edge The edge to which this style instance is assigned.
     * @returns {yfiles.view.Visual} The created visual.
     * @see yfiles.styles.EdgeStyleBase#createVisual
     */
    createVisual(context, edge) {
      // create container
      const group = new yfiles.view.SvgVisualGroup()
      // delegate rendering
      this.baseStyle.stroke = EdgeStyleDecorator.getStroke(edge.tag)
      const baseVisual = this.baseStyle.renderer
        .getVisualCreator(edge, this.baseStyle)
        .createVisual(context)
      group.add(baseVisual)

      if (this.bendStyle !== null) {
        const bendGroup = new yfiles.view.SvgVisualGroup()
        group.add(bendGroup)
        this.renderBends(context, bendGroup, edge)
      }
      return group
    }

    /**
     * Updates the provided visual.
     * @param {yfiles.view.IRenderContext} context The render context.
     * @param {yfiles.view.Visual|yfiles.view.SvgVisual} oldVisual The visual that has been created in the call to
     *        {@link yfiles.styles.EdgeStyleBase#createVisual}.
     * @param {yfiles.graph.IEdge} edge The edge to which this style instance is assigned.
     * @returns {yfiles.view.Visual} The updated visual.
     * @see yfiles.styles.EdgeStyleBase#updateVisual
     */
    updateVisual(context, oldVisual, edge) {
      // check whether the elements are as expected
      if (oldVisual.children.size !== 2) {
        return this.createVisual(context, edge)
      }

      let baseVisual = oldVisual.children.get(0)
      // delegate update
      this.baseStyle.stroke = EdgeStyleDecorator.getStroke(edge.tag)
      baseVisual = this.baseStyle.renderer
        .getVisualCreator(edge, this.baseStyle)
        .updateVisual(context, baseVisual)
      if (oldVisual.children.get(0) !== baseVisual) {
        oldVisual.children.set(0, baseVisual)
      }

      if (this.bendStyle !== null) {
        const bendGroup = oldVisual.children.get(1)
        this.renderBends(context, bendGroup, edge)
      }
      return oldVisual
    }

    /**
     * Renders the edge's bends, using {@link EdgeStyleDecorator#bendStyle} and dummy ports.
     * @param {yfiles.view.IRenderContext} context The render context.
     * @param {yfiles.view.SvgVisualGroup} group The group element.
     * @param {yfiles.graph.IEdge} edge The edge.
     */
    renderBends(context, group, edge) {
      const bends = edge.bends
      // remove surplus visuals
      while (group.children.size > bends.size) {
        // remove last child
        group.remove(group.children.get(group.children.size - 1))
      }
      // update existing bend visuals
      for (let i = 0; i < group.children.size; i++) {
        // create a dummy port at the bend's location to render
        const dummyPort = new yfiles.graph.SimplePort(
          edge,
          yfiles.graph.BendAnchoredPortLocationModel.INSTANCE.createFromSource(i - 1)
        )
        // update the dummy port visual
        if (
          this.bendStyle instanceof yfiles.styles.NodeStylePortStyleAdapter &&
          this.bendStyle.nodeStyle instanceof yfiles.styles.ShapeNodeStyle
        ) {
          this.bendStyle.renderSize = new yfiles.geometry.Size(
            this.baseStyle.stroke.thickness * 2,
            this.baseStyle.stroke.thickness * 2
          )
          this.bendStyle.nodeStyle.fill = this.baseStyle.stroke.fill
        }
        const visual = this.bendStyle.renderer
          .getVisualCreator(dummyPort, this.bendStyle)
          .updateVisual(context, group.children.get(i))
        // switch instances if necessary
        if (group.children.get(i) !== visual) {
          group.children.set(i, visual)
        }
      }
      // add missing visuals
      for (let i = group.children.size; i < bends.size; i++) {
        // create a dummy port at the bend's location to render
        const dummyPort = new yfiles.graph.SimplePort(
          edge,
          yfiles.graph.BendAnchoredPortLocationModel.INSTANCE.createFromSource(i - 1)
        )
        // render the dummy port visual
        if (
          this.bendStyle instanceof yfiles.styles.NodeStylePortStyleAdapter &&
          this.bendStyle.nodeStyle instanceof yfiles.styles.ShapeNodeStyle
        ) {
          this.bendStyle.renderSize = new yfiles.geometry.Size(
            this.baseStyle.stroke.thickness * 2,
            this.baseStyle.stroke.thickness * 2
          )
          this.bendStyle.nodeStyle.fill = this.baseStyle.stroke.fill
        }
        const bendVisual = this.bendStyle.renderer
          .getVisualCreator(dummyPort, this.bendStyle)
          .createVisual(context)
        group.children.add(bendVisual)
      }
    }

    /**
     * Returns a stroke for the provided data.
     * @param {object} data A custom data object.
     * @return {yfiles.view.Stroke} The stroke for the provided data.
     */
    static getStroke(data) {
      switch (data) {
        case 'TRAFFIC_VERY_HIGH':
          return new yfiles.view.Stroke(yfiles.view.Fill.RED, 3.0)
        case 'TRAFFIC_HIGH':
          return new yfiles.view.Stroke(yfiles.view.Fill.ORANGE, 2.0)
        case 'TRAFFIC_NORMAL':
          return new yfiles.view.Stroke(yfiles.view.Fill.BLACK, 1.0)
        case 'TRAFFIC_LOW':
          return new yfiles.view.Stroke(yfiles.view.Fill.LIGHT_GRAY, 1.0)
        default:
          return new yfiles.view.Stroke(yfiles.view.Fill.BLACK, 1.0)
      }
    }

    /**
     * Returns the bounds provided by the base style for the edge.
     * @param {yfiles.view.ICanvasContext} context The canvas context.
     * @param {yfiles.graph.IEdge} edge The edge to which this style instance is assigned.
     * @returns {yfiles.geometry.Rect} The visual bounds.
     * @override
     * @see yfiles.styles.EdgeStyleBase#getBounds
     */
    getBounds(context, edge) {
      return this.baseStyle.renderer.getBoundsProvider(edge, this.baseStyle).getBounds(context)
    }

    /**
     * Returns whether the base visualization for the specified edge is visible.
     * @param {yfiles.view.ICanvasContext} context The canvas context.
     * @param {yfiles.geometry.Rect} rectangle The clipping rectangle.
     * @param {yfiles.graph.IEdge} edge The edge to which this style instance is assigned.
     * @returns {boolean} <code>true</code> if the specified edge is visible in the clipping rectangle;
     *   <code>false</code> otherwise.
     * @override
     * @see yfiles.styles.EdgeStyleBase#isInside
     */
    isVisible(context, rectangle, edge) {
      return this.baseStyle.renderer
        .getVisibilityTestable(edge, this.baseStyle)
        .isVisible(context, rectangle)
    }

    /**
     * Returns whether the base visualization is hit.
     * @param {yfiles.input.IInputModeContext} context The context.
     * @param {yfiles.geometry.Point} location The point to test.
     * @param {yfiles.graph.IEdge} edge The edge to which this style instance is assigned.
     * @return {boolean} <code>true</code> if the base visualization is hit.
     * @see yfiles.styles.EdgeStyleBase#isHit
     */
    isHit(context, location, edge) {
      return this.baseStyle.renderer.getHitTestable(edge, this.baseStyle).isHit(context, location)
    }

    /**
     * Returns whether the base visualization is in the box.
     * @param {yfiles.input.IInputModeContext} context The input mode context.
     * @param {yfiles.geometry.Rect} rectangle The marquee selection box.
     * @param {yfiles.graph.IEdge} edge The edge to which this style instance is assigned.
     * @return {boolean} <code>true</code> if the base visualization is hit.
     * @see yfiles.styles.EdgeStyleBase#isInBox
     */
    isInBox(context, rectangle, edge) {
      // return only box containment test of baseStyle - we don't want the decoration to be marquee selectable
      return this.baseStyle.renderer
        .getMarqueeTestable(edge, this.baseStyle)
        .isInBox(context, rectangle)
    }

    /**
     * Delegates the lookup to the base style.
     * @param {yfiles.graph.IEdge} edge The edge to use for the context lookup.
     * @param {yfiles.lang.Class} type The type to query.
     * @returns {Object} An implementation of the <code>type</code> or <code>null</code>.
     * @see yfiles.styles.EdgeStyleBase#lookup
     */
    lookup(edge, type) {
      return this.baseStyle.renderer.getContext(edge, this.baseStyle).lookup(type)
    }
  }

  return EdgeStyleDecorator
})
