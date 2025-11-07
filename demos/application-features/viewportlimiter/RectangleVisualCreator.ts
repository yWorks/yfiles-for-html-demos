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
  BaseClass,
  type IRenderContext,
  IVisualCreator,
  type Rect,
  SvgVisual,
  SvgVisualGroup
} from '@yfiles/yfiles'

export class RectangleVisualCreator extends BaseClass(IVisualCreator) {
  private renderInViewCoordinates: boolean
  private boundsProvider: () => Rect | null
  private stroke: string
  private fill: string
  private dashed: boolean
  private titlePosition: 'top' | 'bottom'
  private title: string

  constructor(
    title: string,
    titlePosition: 'top' | 'bottom',
    dashed: boolean,
    fill: string,
    stroke: string,
    boundsProvider: () => Rect | null,
    renderInViewCoordinates = false
  ) {
    super()
    this.title = title
    this.titlePosition = titlePosition
    this.dashed = dashed
    this.fill = fill
    this.stroke = stroke
    this.boundsProvider = boundsProvider
    this.renderInViewCoordinates = renderInViewCoordinates
  }

  /**
   * Creates the visual that renders the content bounds.
   * @param context The context that describes where the visual will be used
   * return {Visual} The visual for the background
   */
  createVisual(context: IRenderContext): SvgVisualGroup {
    const groupVisual = new SvgVisualGroup()
    const rectangleElement = window.document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rectangleElement.setAttribute('fill', this.fill)
    rectangleElement.setAttribute('stroke', this.stroke)
    if (this.dashed) {
      rectangleElement.setAttribute('stroke-dasharray', '3')
    }
    const rectVisual = new SvgVisual(rectangleElement)

    const textElement = window.document.createElementNS('http://www.w3.org/2000/svg', 'text')
    textElement.textContent = this.title
    textElement.setAttribute('fill', this.stroke)
    const textVisual = new SvgVisual(textElement)

    groupVisual.add(rectVisual)
    groupVisual.add(textVisual)
    this.updateVisual(context, groupVisual)

    return groupVisual
  }

  /**
   * Updates the content bounds visual.
   * @param context The context that describes where the visual will be used
   * @param oldVisual The old visual
   * return {Visual} The visual that renders the content bounds
   */
  updateVisual(context: IRenderContext, oldVisual: SvgVisualGroup): SvgVisualGroup {
    if (oldVisual.children.size != 2) {
      return this.createVisual(context)
    }

    const rect = this.boundsProvider()
    if (rect != null) {
      if (this.renderInViewCoordinates) {
        oldVisual.transform = context.viewTransform
      }

      const rectangle = oldVisual.children.get(0)!.svgElement
      rectangle.setAttribute('x', rect.x.toString())
      rectangle.setAttribute('y', rect.y.toString())
      rectangle.setAttribute('width', rect.width > 0 ? rect.width.toString() : '1')
      rectangle.setAttribute('height', rect.height > 0 ? rect.height.toString() : '1')

      const text = oldVisual.children.get(1)!.svgElement

      text.setAttribute('x', `${rect.x + 10}`)
      if (this.titlePosition === 'top') {
        text.setAttribute('y', `${rect.y + 20}`)
      } else {
        const effectiveRectHeight = rect.height > 0 ? rect.height : 1
        text.setAttribute('y', `${rect.y + effectiveRectHeight - 10}`)
      }
    } else {
      return new SvgVisualGroup()
    }
    return oldVisual
  }
}
