/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ICanvasContext,
  ICanvasObject,
  ICanvasObjectDescriptor,
  IHitTestable,
  IRenderContext,
  IVisibilityTestable,
  IVisualCreator,
  MutableRectangle,
  SvgVisual,
  Visual
} from 'yfiles'

/**
 * Creates the visualization for the limiting rectangle.
 */
export default class LimitingRectangleDescriptor extends BaseClass(
  ICanvasObjectDescriptor,
  IVisualCreator
) {
  constructor() {
    super()
    this.rectangle = null
  }

  /**
   * Gets the {@link IVisualCreator} for a given {@link ICanvasObject}.
   * @param {!object} forUserObject
   * @returns {!IVisualCreator}
   */
  getVisualCreator(forUserObject) {
    this.rectangle = forUserObject
    return this
  }

  /**
   * Determines whether the given canvas object is deemed dirty and needs updating.
   * @param {!ICanvasContext} context The context that will be used for the update
   * @param {!ICanvasObject} canvasObject The object to check
   * @returns {boolean} True if the given canvas object needs updating, false otherwise
   */
  isDirty(context, canvasObject) {
    return true
  }

  /**
   * Returns an implementation of IBoundsProvider that can determine the visible bounds of the rendering of the user
   * object.
   * @param {!object} forUserObject The user object to query the bounds for
   * @returns {!IBoundsProvider} An implementation of IBoundsProvider
   */
  getBoundsProvider(forUserObject) {
    return IBoundsProvider.UNBOUNDED
  }

  /**
   * Returns an implementation of IVisibilityTestable that can determine if the rendering of the user object would be
   * visible in a given context.
   * @param {!object} forUserObject The user object to query the visibility test for
   * @returns {!IVisibilityTestable} An implementation of IVisibilityTestable
   */
  getVisibilityTestable(forUserObject) {
    return IVisibilityTestable.ALWAYS
  }

  /**
   * Returns an implementation of IHitTestable that can determine whether the rendering of the user object has
   * been hit at a given coordinate.
   * @param {!object} forUserObject The user object to do the hit testing for
   * @returns {!IHitTestable} An implementation of IHitTestable
   */
  getHitTestable(forUserObject) {
    return IHitTestable.NEVER
  }

  /**
   * Creates the descriptor's visual.
   * @param {!IRenderContext} ctx The context that describes where the visual will be used
   * @returns {!Visual} The newly created visual
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
   * Updates the descriptor's visual.
   * @param {!IRenderContext} ctx The context that describes where the visual will be used
   * @param {!SvgVisual} oldVisual The old visual
   * @returns {!Visual} The newly created visual
   */
  updateVisual(ctx, oldVisual) {
    const rect = oldVisual.svgElement
    rect.x.baseVal.value = this.rectangle.x
    rect.y.baseVal.value = this.rectangle.y
    rect.width.baseVal.value = this.rectangle.width
    rect.height.baseVal.value = this.rectangle.height
    return oldVisual
  }
}
