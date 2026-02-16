/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  BaseClass,
  IBoundsProvider,
  IHitTestable,
  IObjectRenderer,
  IRenderTreeElement,
  IVisibilityTestable,
  IVisualCreator,
  SvgVisual
} from '@yfiles/yfiles'

/**
 * Creates the visualization for the limiting rectangle.
 */
export class LimitingRectangleRenderer extends BaseClass(IObjectRenderer, IVisualCreator) {
  rectangle = null

  /**
   * Gets the {@link IVisualCreator} for a given {@link IRenderTreeElement}.
   */
  getVisualCreator(renderTag) {
    this.rectangle = renderTag
    return this
  }

  /**
   * Returns an implementation of IBoundsProvider that can determine the visible bounds of the rendering of the user
   * object.
   * @param renderTag The user object to query the bounds for
   * @returns An implementation of IBoundsProvider
   */
  getBoundsProvider(renderTag) {
    return IBoundsProvider.UNBOUNDED
  }

  /**
   * Returns an implementation of IVisibilityTestable that can determine if the rendering of the user object would be
   * visible in a given context.
   * @param renderTag The user object to query the visibility test for
   * @returns An implementation of IVisibilityTestable
   */
  getVisibilityTestable(renderTag) {
    return IVisibilityTestable.ALWAYS
  }

  /**
   * Returns an implementation of IHitTestable that can determine whether the rendering of the user object has
   * been hit at a given coordinate.
   * @param renderTag The user object to do the hit testing for
   * @returns An implementation of IHitTestable
   */
  getHitTestable(renderTag) {
    return IHitTestable.NEVER
  }

  /**
   * Creates the renderer's visual.
   * @param ctx The context that describes where the visual will be used
   * @returns The newly created visual
   */
  createVisual(ctx) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')

    rect.x.baseVal.value = this.rectangle.x
    rect.y.baseVal.value = this.rectangle.y
    rect.width.baseVal.value = this.rectangle.width
    rect.height.baseVal.value = this.rectangle.height
    rect.setAttribute('fill', 'none')
    rect.setAttribute('stroke', 'black')
    rect.setAttribute('stroke-thickness', '2')

    return new SvgVisual(rect)
  }

  /**
   * Updates the renderer's visual.
   * @param ctx The context that describes where the visual will be used
   * @param oldVisual The old visual
   * @returns The newly created visual
   */
  updateVisual(ctx, oldVisual) {
    if (!(oldVisual instanceof SvgVisual && oldVisual.svgElement instanceof SVGRectElement)) {
      return this.createVisual(ctx)
    }

    const rect = oldVisual.svgElement
    rect.x.baseVal.value = this.rectangle.x
    rect.y.baseVal.value = this.rectangle.y
    rect.width.baseVal.value = this.rectangle.width
    rect.height.baseVal.value = this.rectangle.height
    return oldVisual
  }
}
