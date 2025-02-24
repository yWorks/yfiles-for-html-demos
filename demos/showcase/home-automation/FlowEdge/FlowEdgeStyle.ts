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
  DelegatingEdgeStyle,
  GeneralPath,
  GraphComponent,
  type IArrow,
  type IEdge,
  type IEdgeStyle,
  IRenderContext,
  SvgVisualGroup,
  Visual
} from '@yfiles/yfiles'

/**
 * This class decorates the original `BezierEdgeStyleRenderer` in such a way that the resulting
 * SVG visuals stay almost the same, but gain an additional outline edge that follows
 * the same curve as the original path. This way, we don't need to re-implement any of the complex logic
 * behind plotting cubic Beziér curves based on point data.
 */
export class FlowEdgeStyle extends DelegatingEdgeStyle {
  private static cssClass = {
    container: 'flow-edge',
    basePath: 'flow-edge__main',
    outline: 'flow-edge__outline',
    animation: 'flow-edge__animation'
  }

  private readonly isDummyNewEdge: boolean
  private readonly isReconnecting: boolean

  constructor(
    private delegatingStyle: IEdgeStyle,
    mode?: 'newEdge' | 'edgeReconnection'
  ) {
    super()
    this.isDummyNewEdge = mode === 'newEdge'
    this.isReconnecting = mode === 'edgeReconnection'
  }

  protected getStyle(edge: IEdge): IEdgeStyle {
    return this.delegatingStyle
  }

  private static getGroupElement(visual: Visual | null): SVGGElement | null {
    if (!(visual instanceof SvgVisualGroup) || !(visual.svgElement instanceof SVGGElement)) {
      return null
    }
    return visual.svgElement
  }

  /**
   * Retrieves the <path> created by the original `createVisual` implementation.
   */
  private static getOriginalPathElement(visual: Visual | null): SVGPathElement | null {
    if (!(visual instanceof SvgVisualGroup)) {
      return null
    }
    const path = visual.svgElement.querySelector(
      `path:not(.${FlowEdgeStyle.cssClass.outline}):not(.${FlowEdgeStyle.cssClass.animation})`
    )
    return path instanceof SVGPathElement ? path : null
  }

  /**
   * Retrieves the outline <path> created by our ` createVisual` override.
   */
  private static getPathOutlineElement(visual: Visual | null): SVGPathElement | null {
    if (!(visual instanceof SvgVisualGroup)) {
      return null
    }
    const path = visual.svgElement.querySelector(`path.${FlowEdgeStyle.cssClass.outline}`)
    return path instanceof SVGPathElement ? path : null
  }

  /**
   * Retrieves the <path> animation created by our ` createVisual` override.
   */
  private static getPathAnimationElement(visual: Visual | null): SVGPathElement | null {
    if (!(visual instanceof SvgVisualGroup)) {
      return null
    }
    const path = visual.svgElement.querySelector(`path.${FlowEdgeStyle.cssClass.animation}`)
    return path instanceof SVGPathElement ? path : null
  }

  /**
   * Applies BEM-style class modifiers to the provided element depending on the state
   * of the edge.
   */
  private setClassModifiers(context: IRenderContext, element: SVGElement, edge: IEdge): void {
    const gc = context.canvasComponent instanceof GraphComponent ? context.canvasComponent : null
    const { sourceNode, targetNode } = edge

    const isEdgeSelected = gc?.selection.includes(edge)
    const isEdgeHovered = gc?.highlights.includes(edge)

    const isConnectedNodeSelected =
      (sourceNode && gc?.selection.includes(sourceNode)) ||
      (targetNode && gc?.selection.includes(targetNode))

    const modifiers = {
      selected: isEdgeSelected,
      'connected-node-selected': isConnectedNodeSelected,
      reversed: edge.sourcePort.tag.side === 'left',
      hovered: isEdgeHovered,
      'dummy-new-edge': this.isDummyNewEdge,
      reconnecting: this.isReconnecting
    }

    for (const [modifier, enabled] of Object.entries(modifiers)) {
      element.classList.toggle(`${FlowEdgeStyle.cssClass.container}--${modifier}`, enabled ?? false)
    }
  }

  /**
   * Takes whatever visual is created by `BezierEdgeStyleRenderer`,
   * clones the `<path>` element from its group, sets a slightly thicker stroke
   * with a different color, and appends it to the top of the group so that
   * it's displayed in the background. This creates a border effect along the path.
   */
  protected createVisual(context: IRenderContext, edge: IEdge): Visual | null {
    const delegatingStyle = this.getStyle(edge)
    const visual = delegatingStyle.renderer
      .getVisualCreator(edge, delegatingStyle)
      .createVisual(context)
    const groupElement = FlowEdgeStyle.getGroupElement(visual)
    const path = FlowEdgeStyle.getOriginalPathElement(visual)
    if (!groupElement || !path) {
      return visual
    }

    this.setClassModifiers(context, groupElement, edge)

    const outline = path.cloneNode(true) as SVGPathElement
    const animation = path.cloneNode(true) as SVGPathElement
    path.insertAdjacentElement('beforebegin', outline)
    path.insertAdjacentElement('afterend', animation)

    groupElement.classList.add(FlowEdgeStyle.cssClass.container)
    path.classList.add(FlowEdgeStyle.cssClass.basePath)
    outline.classList.add(FlowEdgeStyle.cssClass.outline)
    animation.classList.add(FlowEdgeStyle.cssClass.animation)

    return visual
  }

  /**
   * While updating the visual, we retrieve the extra outline added earlier
   * and synchronize its path data with the original <paths>'s data.
   */
  protected updateVisual(
    context: IRenderContext,
    oldVisual: Visual | null,
    edge: IEdge
  ): Visual | null {
    const delegatingStyle = this.getStyle(edge)
    const visual = delegatingStyle.renderer
      .getVisualCreator(edge, delegatingStyle)
      .updateVisual(context, oldVisual)
    const groupElement = FlowEdgeStyle.getGroupElement(visual)
    const path = FlowEdgeStyle.getOriginalPathElement(visual)
    const outline = FlowEdgeStyle.getPathOutlineElement(visual)
    const animation = FlowEdgeStyle.getPathAnimationElement(visual)

    if (path && outline && animation) {
      const pathData = path.getAttribute('d')
      pathData && outline.setAttribute('d', pathData)
      pathData && animation.setAttribute('d', pathData)
    }

    groupElement && this.setClassModifiers(context, groupElement, edge)

    return visual
  }

  protected cropPath(
    _edge: IEdge,
    _sourceArrow: IArrow,
    _targetArrow: IArrow,
    path: GeneralPath
  ): GeneralPath | null {
    return path
  }
}
