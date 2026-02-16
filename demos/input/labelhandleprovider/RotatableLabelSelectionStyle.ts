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
  type ILabel,
  type IOrientedRectangle,
  type IRenderContext,
  LabelStyleBase,
  type OrientedRectangle,
  type Size,
  SvgVisual,
  type TaggedSvgVisual
} from '@yfiles/yfiles'

type RotatableLabelSelectionVisual = TaggedSvgVisual<SVGGElement, { layout: IOrientedRectangle }>

/**
 * A label style that visualizes the label selection for rotatable labels.
 */
export class RotatableLabelSelectionStyle extends LabelStyleBase<RotatableLabelSelectionVisual> {
  protected createVisual(_context: IRenderContext, label: ILabel): RotatableLabelSelectionVisual {
    const { width, height, center, angle } = label.layout as OrientedRectangle
    const halfWidth = width * 0.5
    const halfHeight = height * 0.5

    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', String(width))
    rect.setAttribute('height', String(height))
    rect.setAttribute('stroke', 'lightgrey')
    rect.setAttribute('stroke-width', '3px')
    rect.setAttribute('fill', 'none')
    container.appendChild(rect)

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', String(halfWidth))
    line.setAttribute('y1', '0')
    line.setAttribute('x2', String(halfWidth))
    line.setAttribute('y2', '-15')
    line.setAttribute('stroke', 'lightgrey')
    line.setAttribute('stroke-width', '3px')
    container.appendChild(line)

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', String(halfWidth))
    circle.setAttribute('cy', String(halfHeight))
    circle.setAttribute('r', '4')
    circle.setAttribute('stroke', 'black')
    circle.setAttribute('fill', 'none')
    container.appendChild(circle)

    container.setAttribute(
      'transform',
      `translate(${center.x - halfWidth} ${center.y - halfHeight}) rotate(${angle * (180 / 3.1415)})`
    )
    container.setAttribute('transform-origin', `center ${height * 0.5 + 15}px`)
    container.style.transformBox = `fill-box`

    return SvgVisual.from(container, { layout: label.layout })
  }

  protected updateVisual(
    _context: IRenderContext,
    oldVisual: RotatableLabelSelectionVisual,
    label: ILabel
  ): RotatableLabelSelectionVisual {
    const { center, width, height, upX, upY, angle } = label.layout as OrientedRectangle
    const oldLayout = oldVisual.tag.layout

    if (width !== oldLayout.width || height !== oldLayout.height) {
      return this.createVisual(_context, label)
    }

    if (
      center.x !== oldLayout.center.x ||
      center.y !== oldLayout.center.y ||
      width !== oldLayout.width ||
      height !== oldLayout.height ||
      upX !== oldLayout.upX ||
      upY !== oldLayout.upY
    ) {
      const halfWidth = width * 0.5
      const halfHeight = height * 0.5

      const container = oldVisual.svgElement
      container.setAttribute(
        'transform',
        `translate(${center.x - halfWidth} ${center.y - halfHeight}) rotate(${angle * (180 / 3.1415)})`
      )

      oldVisual.tag = { layout: label.layout }
    }

    return oldVisual
  }

  protected getPreferredSize(label: ILabel): Size {
    return label.preferredSize
  }
}
