/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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

/* eslint-disable getter-return */

define(['yfiles/view-component', 'MindmapUtil.js', './DemoCommands.js'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  MindmapUtil,
  DemoCommands
) => {
  /**
   * A node style decorator that adds a collapse button to the node.
   *
   * This style implements the decorator pattern. Two {@link yfiles.styles.IconLabelStyle}
   * instances are used to render the collapse and expand buttons. The actual
   * style is determined using the {@link NodeData#isCollapsed isCollapsed}
   * information in the node's tag.
   *
   * A {@link yfiles.graph.SimpleLabel dummy label} is used to render the collapse
   * button. Two label model parameters determine the placement of the label on the
   * bottom-right and bottom-left corner of the node. This way the button placement
   * is determined automatically by the dummy label's style.
   * @extends yfiles.styles.NodeStyleBase
   */
  class CollapseDecorator extends yfiles.styles.NodeStyleBase {
    /**
     * Creates a new instance of this style using the given wrappedStyle style.
     * @param {yfiles.styles.INodeStyle} wrappedStyle The style that is decorated by this instance.
     */
    constructor(wrappedStyle) {
      super()
      this.wrappedStyle = wrappedStyle
      this.passiveSupported = detectPassiveSupported()
    }

    /**
     * Returns the size of the icon.
     * @return {yfiles.geometry.Size}
     */
    static get ICON_SIZE() {
      return new yfiles.geometry.Size(18, 18)
    }

    /**
     * Returns the style of an icon that will be placed on the left of the node.
     * @return {yfiles.styles.IconLabelStyle}
     */
    static get ICON_STYLE_LEFT() {
      return new yfiles.styles.IconLabelStyle({
        icon: 'resources/arrowLeft.svg',
        iconSize: CollapseDecorator.ICON_SIZE,
        iconPlacement: yfiles.graph.InteriorLabelModel.CENTER
      })
    }

    /**
     * Returns the style of an icon that will be placed on the right of the node.
     * @return {yfiles.styles.IconLabelStyle}
     */
    static get ICON_STYLE_RIGHT() {
      return new yfiles.styles.IconLabelStyle({
        icon: 'resources/arrowRight.svg',
        iconSize: CollapseDecorator.ICON_SIZE,
        iconPlacement: yfiles.graph.InteriorLabelModel.CENTER
      })
    }

    /**
     * Returns the label model parameter for a label that will be placed on the left of the node.
     * @return {yfiles.graph.ILabelModelParameter}
     */
    static get LABEL_MODEL_PARAMETER_LEFT() {
      return CollapseDecorator.initLabelModelParameterLeft(
        new yfiles.graph.ExteriorLabelModel(),
        new yfiles.geometry.Insets(0, 0, 0, -10)
      ).createParameter(yfiles.graph.ExteriorLabelModelPosition.SOUTH_WEST)
    }

    /**
     * Returns the label model parameter for a label that will be placed on the right of the node.
     * @return {yfiles.graph.ILabelModelParameter|yfiles.graph.IPortLocationModelParameter}
     */
    static get LABEL_MODEL_PARAMETER_RIGHT() {
      return CollapseDecorator.initLabelModelParameterRight(
        new yfiles.graph.ExteriorLabelModel(),
        new yfiles.geometry.Insets(0, 0, 0, -10)
      ).createParameter(yfiles.graph.ExteriorLabelModelPosition.SOUTH_EAST)
    }

    /**
     * Creates the wrappedStyle visual and adds the icon visualization.
     * @param {yfiles.view.IRenderContext} context The render context.
     * @param {yfiles.graph.INode} node The node to which this style instance is assigned.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#createVisual}
     * @return {yfiles.view.SvgVisual}
     */
    createVisual(context, node) {
      // create the outer g element
      const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')

      // create the wrappedStyle visual
      const wrappedStyleVisual = this.wrappedStyle.renderer
        .getVisualCreator(node, this.wrappedStyle)
        .createVisual(context)

      const iconVisual = this.createIconVisual(
        node,
        context,
        MindmapUtil.Structure.hasChildNodes(node, CollapseDecorator.getFullGraph(context))
      )

      // adds the click and touch event listeners to the state icon
      iconVisual.addEventListener(
        'click',
        () => {
          const demoCommand = new DemoCommands(context.canvasComponent)
          demoCommand.executeToggleCollapseState(node)
        },
        true
      )
      iconVisual.addEventListener(
        'touchstart',
        evt => {
          // prevent subsequent firing of a click event
          evt.preventDefault()
          const demoCommand = new DemoCommands(context.canvasComponent)
          demoCommand.executeToggleCollapseState(node)
        },
        this.passiveSupported
          ? {
              passive: false,
              useCapture: true
            }
          : true
      )

      // add both visuals to outer container
      g.appendChild(wrappedStyleVisual.svgElement)
      g.appendChild(iconVisual)

      // store wrappedStyle visual for updateVisual
      g['wrappedStyle-visual'] = wrappedStyleVisual
      return new yfiles.view.SvgVisual(g)
    }

    /**
     * Updates the Visual.
     * @param {yfiles.view.IRenderContext} context The render context.
     * @param {yfiles.view.Visual} oldVisual The old visual.
     * @param {yfiles.graph.INode} node The node to which this style instance is assigned.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#updateVisual}
     * @return {yfiles.view.Visual}
     */
    updateVisual(context, oldVisual, node) {
      const container = oldVisual.svgElement
      // retrieve the wrappedStyle visual from the container
      const wrappedStyleVisual = container['wrappedStyle-visual']
      // update the wrappedStyle visual
      const newWrappedVisual = this.wrappedStyle.renderer
        .getVisualCreator(node, this.wrappedStyle)
        .updateVisual(context, wrappedStyleVisual)
      if (!wrappedStyleVisual.equals(newWrappedVisual)) {
        container.childNodes[0] = newWrappedVisual.svgElement
        container['wrappedStyle-visual'] = newWrappedVisual
      }

      // retrieve the icon visual from the container
      const iconVisual = container.childNodes[1]
      // update the icon visual
      CollapseDecorator.updateIconVisual(
        node,
        context,
        iconVisual,
        MindmapUtil.Structure.hasChildNodes(node, CollapseDecorator.getFullGraph(context))
      )

      return oldVisual
    }

    /**
     * Creates the icon visualization.
     * @param {yfiles.graph.INode} node The node to create the visual for.
     * @param {yfiles.view.IRenderContext} context The render context.
     * @param {boolean} visible True if the icon should be visible, false otherwise.
     * @return {Element} The icon visual.
     */
    createIconVisual(node, context, visible) {
      const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')

      // create a label that acts as a dummy item to render the icon
      const label = CollapseDecorator.createDummyLabel(node)
      // store the label with the visual for updating
      g['data-renderCache'] = label

      if (visible) {
        // delegate the rendering of the dummy label to the label's style
        const renderer = label.style.renderer
        const creator = renderer.getVisualCreator(label, label.style)
        const iconVisual = creator.createVisual(context)
        iconVisual.svgElement.setAttribute('class', 'collapseButton')
        if (iconVisual !== null) {
          g.appendChild(iconVisual.svgElement)
        }
      }
      return g
    }

    /**
     * Updates the icon visualization with the current data.
     * @param {yfiles.graph.INode} node The node to update the visual for.
     * @param {yfiles.view.IRenderContext} context The render context.
     * @param {Element} container The HTML Element that contains the icon.
     * @param {boolean} visible True if the icon should be visible, false otherwise.
     */
    static updateIconVisual(node, context, container, visible) {
      // retrieve the old dummy label from the container
      const label = container['data-renderCache']
      // get the label model parameter and style to use for the dummy label
      const newModelParameter = CollapseDecorator.getLabelModelParameter(node.tag)
      const newStyle = CollapseDecorator.getLabelStyle(node.tag)

      const oldButtonVisual = container.hasChildNodes() ? container.childNodes[0] : null

      if (visible) {
        let /** @type {yfiles.view.Visual} */ newButtonVisual
        if (
          label.style.icon === newStyle.icon &&
          label.style.iconPlacement === newStyle.iconPlacement &&
          label.style.iconSize === newStyle.iconSize &&
          label.layoutParameter === newModelParameter
        ) {
          // if style and label model parameter did not change update the label visual
          newButtonVisual = label.style.renderer
            .getVisualCreator(label, label.style)
            .updateVisual(context, oldButtonVisual)
        } else {
          label.style = newStyle
          label.layoutParameter = newModelParameter
          // and create new label visual
          newButtonVisual = label.style.renderer
            .getVisualCreator(label, label.style)
            .createVisual(context)
        }

        if (oldButtonVisual !== newButtonVisual) {
          newButtonVisual.svgElement.setAttribute('class', 'collapseButton')
          while (container.hasChildNodes()) {
            // remove all children
            container.removeChild(container.firstChild)
          }
          container.appendChild(newButtonVisual.svgElement)
        }
      } else {
        // if not visible, remove all children
        while (container.hasChildNodes()) {
          // remove all children
          container.removeChild(container.firstChild)
        }
      }
    }

    /**
     * Creates the dummy label used to render the icon.
     * @param {yfiles.graph.INode} node The node to create the label for.
     * @return {yfiles.graph.SimpleLabel}
     */
    static createDummyLabel(node) {
      const data = node.tag
      // create a new dummy label
      const label = new yfiles.graph.SimpleLabel(
        node,
        '',
        CollapseDecorator.getLabelModelParameter(data)
      )
      // set the size
      label.preferredSize = CollapseDecorator.ICON_SIZE
      // set the label style
      label.style = CollapseDecorator.getLabelStyle(node.tag)
      return label
    }

    /**
     * Gets the label style used to render the dummy label.
     * @param {Object} data The node tag.
     * @return {yfiles.styles.IconLabelStyle}
     */
    static getLabelStyle(data) {
      return data.isLeft === data.isCollapsed
        ? CollapseDecorator.ICON_STYLE_LEFT
        : CollapseDecorator.ICON_STYLE_RIGHT
    }

    /**
     * Gets the label model parameter used to render the dummy label.
     * @param {Object} data The node tag.
     * @return {yfiles.graph.ILabelModelParameter}
     */
    static getLabelModelParameter(data) {
      if (data.depth === 0) {
        return yfiles.graph.ExteriorLabelModel.SOUTH
      }
      return data.isLeft
        ? CollapseDecorator.LABEL_MODEL_PARAMETER_LEFT
        : CollapseDecorator.LABEL_MODEL_PARAMETER_RIGHT
    }

    /**
     * Checks if the icon and the wrappedStyle style are visible.
     * @param {yfiles.view.ICanvasContext} canvasContext The canvas context.
     * @param {yfiles.geometry.Rect} clip The clipping rectangle.
     * @param {yfiles.graph.INode} node The given node.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#isVisible}
     * @return {boolean}
     */
    isVisible(canvasContext, clip, node) {
      // check if node bounds + icon is visible
      const isIconVisible = clip.intersects(
        node.layout
          .toRect()
          .getEnlarged(
            new yfiles.geometry.Insets(
              CollapseDecorator.ICON_SIZE.width,
              CollapseDecorator.ICON_SIZE.height,
              CollapseDecorator.ICON_SIZE.width,
              CollapseDecorator.ICON_SIZE.height
            )
          )
      )
      return (
        isIconVisible ||
        this.wrappedStyle.renderer
          .getVisibilityTestable(node, this.wrappedStyle)
          .isVisible(canvasContext, clip)
      )
    }

    /**
     * Delegates the call to the wrappedStyle style.
     * @param {yfiles.graph.INode} node The given node.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#getOutline}
     * @return {yfiles.geometry.GeneralPath}
     */
    getOutline(node) {
      return this.wrappedStyle.renderer.getShapeGeometry(node, this.wrappedStyle).getOutline()
    }

    /**
     * Delegates the call to the wrappedStyle style.
     * @param {yfiles.view.ICanvasContext} canvasContext The canvas context.
     * @param {yfiles.graph.INode} node The given node.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#getBounds}
     * @return {yfiles.geometry.Rect}
     */
    getBounds(canvasContext, node) {
      return this.wrappedStyle.renderer
        .getBoundsProvider(node, this.wrappedStyle)
        .getBounds(canvasContext)
    }

    /**
     * Delegates the call to the wrappedStyle style.
     * @param {yfiles.input.IInputModeContext} canvasContext The canvas context.
     * @param {yfiles.geometry.Point} p The point to test.
     * @param {yfiles.graph.INode} node The given node.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#isHit}
     * @return {boolean}
     */
    isHit(canvasContext, p, node) {
      return this.wrappedStyle.renderer
        .getHitTestable(node, this.wrappedStyle)
        .isHit(canvasContext, p)
    }

    /**
     * Delegates the call to the wrappedStyle style.
     * @param {yfiles.input.IInputModeContext} canvasContext The canvas context.
     * @param {yfiles.geometry.Rect} box The marquee selection box.
     * @param {yfiles.graph.INode} node The given node.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#isInBox}
     * @return {boolean}
     */
    isInBox(canvasContext, box, node) {
      return this.wrappedStyle.renderer
        .getMarqueeTestable(node, this.wrappedStyle)
        .isInBox(canvasContext, box)
    }

    /**
     * Delegates the call to the wrappedStyle style.
     * @param {yfiles.graph.INode} node The given node.
     * @param {yfiles.lang.Class} type The type to query.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#lookup}
     * @return {Object}
     */
    lookup(node, type) {
      return this.wrappedStyle.renderer.getContext(node, this.wrappedStyle).lookup(type)
    }

    /**
     * Delegates the call to the wrappedStyle style.
     * @param {yfiles.graph.INode} node The given node.
     * @param {yfiles.geometry.Point} inner The inner coordinates.
     * @param {yfiles.geometry.Point} outer The outer coordinates.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#getIntersection}
     * @return {yfiles.geometry.Point}
     */
    getIntersection(node, inner, outer) {
      return this.wrappedStyle.renderer
        .getShapeGeometry(node, this.wrappedStyle)
        .getIntersection(inner, outer)
    }

    /**
     * Delegates the call to the wrappedStyle style.
     * @param {yfiles.graph.INode} node The given node.
     * @param {yfiles.geometry.Point} point The point to test.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#isInside}
     * @return {boolean}
     */
    isInside(node, point) {
      return this.wrappedStyle.renderer.getShapeGeometry(node, this.wrappedStyle).isInside(point)
    }

    /**
     * Gets the full graph from the context.
     * @param {yfiles.view.IRenderContext} context The render context.
     * @return {yfiles.graph.IGraph}
     */
    static getFullGraph(context) {
      let /** @type {yfiles.graph.IGraph} */ graph = null
      if (context.canvasComponent instanceof yfiles.view.GraphComponent) {
        graph = context.canvasComponent.graph
        if (graph instanceof yfiles.graph.FilteredGraphWrapper) {
          graph = graph.wrappedGraph
        }
      }
      return graph
    }

    /**
     * Returns a label model parameter that places the label in the bottom-left of the node.
     * @param {yfiles.graph.ILabelModel} newExteriorLabelModel The given label model.
     * @param {yfiles.geometry.Insets] p1 The given insets.
     * @return {yfiles.graph.ILabelModel} The label model.
     */
    static initLabelModelParameterLeft(newExteriorLabelModel, p1) {
      newExteriorLabelModel.insets = p1
      return newExteriorLabelModel
    }

    /**
     * Returns a label model parameter that places the label in the bottom-right of the node.
     * @param {yfiles.graph.ILabelModel} newExteriorLabelModel The given label model.
     * @param {yfiles.geometry.Insets] p1 The given insets.
     * @return {yfiles.graph.ILabelModel} The label model.
     */
    static initLabelModelParameterRight(newExteriorLabelModel, p1) {
      newExteriorLabelModel.insets = p1
      return newExteriorLabelModel
    }
  }

  /**
   * Returns whether or not the browser supports active and passive event listeners. Feature Detection.
   * @return {boolean}
   */
  function detectPassiveSupported() {
    let supported
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get: () => {
          supported = true
        }
      })
      window.addEventListener('test', null, opts)
    } catch (e) {
      supported = false
    }

    return supported
  }

  return CollapseDecorator
})
