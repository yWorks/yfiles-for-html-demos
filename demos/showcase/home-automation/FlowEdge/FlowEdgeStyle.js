/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  BezierEdgeStyle,
  BezierEdgeStyleRenderer,
  GeneralPath,
  GraphComponent,
  IRenderContext,
  SvgVisualGroup,
  Visual
} from 'yfiles'

/**
 * This class decorates the original `BezierEdgeStyleRenderer` in such a way that the resulting
 * SVG visuals stay almost the same, but gain an additional outline edge that follows
 * the same curve as the original path. This way we don't need to re-implement any of the complex logic
 * behind plotting cubic Beziér curves based on point data.
 */
class FlowEdgeRenderer extends BezierEdgeStyleRenderer {
  /** @type {{container: 'flow-edge', basePath: 'flow-edge__main', outline: 'flow-edge__outline', animation: 'flow-edge__animation'}} */
  static get cssClass() {
    if (typeof FlowEdgeRenderer.$cssClass === 'undefined') {
      FlowEdgeRenderer.$cssClass = {
        container: 'flow-edge',
        basePath: 'flow-edge__main',
        outline: 'flow-edge__outline',
        animation: 'flow-edge__animation'
      }
    }

    return FlowEdgeRenderer.$cssClass
  }

  /** @type {{container: 'flow-edge', basePath: 'flow-edge__main', outline: 'flow-edge__outline', animation: 'flow-edge__animation'}} */
  static set cssClass(cssClass) {
    FlowEdgeRenderer.$cssClass = cssClass
  }

  /**
   * @param {?Visual} visual
   * @returns {?SVGGElement}
   */
  static getGroupElement(visual) {
    if (!(visual instanceof SvgVisualGroup) || !(visual.svgElement instanceof SVGGElement)) {
      return null
    }
    return visual.svgElement
  }

  /**
   * Retrieves the <path> created by the original `createVisual` implementation.
   * @param {?Visual} visual
   * @returns {?SVGPathElement}
   */
  static getOriginalPathElement(visual) {
    if (!(visual instanceof SvgVisualGroup)) {
      return null
    }
    const path = visual.svgElement.querySelector(
      `path:not(.${FlowEdgeRenderer.cssClass.outline}):not(.${FlowEdgeRenderer.cssClass.animation})`
    )
    return path instanceof SVGPathElement ? path : null
  }

  /**
   * Retrieves the outline <path> created by our ` createVisual` override.
   * @param {?Visual} visual
   * @returns {?SVGPathElement}
   */
  static getPathOutlineElement(visual) {
    if (!(visual instanceof SvgVisualGroup)) {
      return null
    }
    const path = visual.svgElement.querySelector(`path.${FlowEdgeRenderer.cssClass.outline}`)
    return path instanceof SVGPathElement ? path : null
  }

  /**
   * Retrieves the <path> animation created by our ` createVisual` override.
   * @param {?Visual} visual
   * @returns {?SVGPathElement}
   */
  static getPathAnimationElement(visual) {
    if (!(visual instanceof SvgVisualGroup)) {
      return null
    }
    const path = visual.svgElement.querySelector(`path.${FlowEdgeRenderer.cssClass.animation}`)
    return path instanceof SVGPathElement ? path : null
  }

  isDummyNewEdge
  isReconnecting

  /**
   * @param {!('newEdge'|'edgeReconnection')} [mode]
   */
  constructor(mode) {
    super()
    this.isDummyNewEdge = mode === 'newEdge'
    this.isReconnecting = mode === 'edgeReconnection'
  }

  /**
   * Applies BEM-style class modifiers to the provided element depending on the state
   * of the edge.
   * @param {!IRenderContext} context
   * @param {!SVGElement} element
   */
  setClassModifiers(context, element) {
    const gc = context.canvasComponent instanceof GraphComponent ? context.canvasComponent : null
    const { sourceNode, targetNode } = this.edge

    const isEdgeSelected = gc?.selection.isSelected(this.edge)
    const isEdgeHovered = gc?.highlightIndicatorManager.selectionModel?.includes(this.edge)

    const isConnectedNodeSelected =
      (sourceNode && gc?.selection.isSelected(sourceNode)) ||
      (targetNode && gc?.selection.isSelected(targetNode))

    const modifiers = {
      selected: isEdgeSelected,
      'connected-node-selected': isConnectedNodeSelected,
      reversed: this.edge.sourcePort?.tag.side === 'left',
      hovered: isEdgeHovered,
      'dummy-new-edge': this.isDummyNewEdge,
      reconnecting: this.isReconnecting
    }

    for (const [modifier, enabled] of Object.entries(modifiers)) {
      element.classList.toggle(
        `${FlowEdgeRenderer.cssClass.container}--${modifier}`,
        enabled ?? false
      )
    }
  }

  /**
   * Takes whatever visual is created by `BezierEdgeStyleRenderer`,
   * clones the `<path>` element from its group, sets a slightly thicker stroke
   * with a different color, and appends it to the top of the group so that
   * it's displayed in the background. This creates a border effect along the path.
   * @param {!IRenderContext} context
   * @returns {?Visual}
   */
  createVisual(context) {
    const visual = super.createVisual(context)
    const groupElement = FlowEdgeRenderer.getGroupElement(visual)
    const path = FlowEdgeRenderer.getOriginalPathElement(visual)
    if (!groupElement || !path) {
      return visual
    }

    this.setClassModifiers(context, groupElement)

    const outline = path.cloneNode(true)
    const animation = path.cloneNode(true)
    path.insertAdjacentElement('beforebegin', outline)
    path.insertAdjacentElement('afterend', animation)

    groupElement.classList.add(FlowEdgeRenderer.cssClass.container)
    path.classList.add(FlowEdgeRenderer.cssClass.basePath)
    outline.classList.add(FlowEdgeRenderer.cssClass.outline)
    animation.classList.add(FlowEdgeRenderer.cssClass.animation)

    return visual
  }

  /**
   * While updating the visual, we retrieve the extra outline added earlier
   * and synchronize its path data with the original <paths>'s data.
   * @param {!IRenderContext} context
   * @param {?Visual} oldVisual
   * @returns {?Visual}
   */
  updateVisual(context, oldVisual) {
    const visual = super.updateVisual(context, oldVisual)
    const groupElement = FlowEdgeRenderer.getGroupElement(visual)
    const path = FlowEdgeRenderer.getOriginalPathElement(visual)
    const outline = FlowEdgeRenderer.getPathOutlineElement(visual)
    const animation = FlowEdgeRenderer.getPathAnimationElement(visual)

    if (path && outline && animation) {
      const pathData = path.getAttribute('d')
      pathData && outline.setAttribute('d', pathData)
      pathData && animation.setAttribute('d', pathData)
    }

    groupElement && this.setClassModifiers(context, groupElement)

    return visual
  }

  /**
   * @param {!GeneralPath} path
   * @returns {!GeneralPath}
   */
  cropPath(path) {
    return path
  }
}

export class FlowEdgeStyle extends BezierEdgeStyle {
  /**
   * @param {!('newEdge'|'edgeReconnection')} [mode]
   */
  constructor(mode) {
    const renderer = new FlowEdgeRenderer(mode)
    super(renderer)
  }
}
