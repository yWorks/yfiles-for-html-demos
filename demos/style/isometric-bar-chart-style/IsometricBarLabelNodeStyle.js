/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Font,
  FontStyle,
  FontWeight,
  INode,
  INodeStyle,
  IRenderContext,
  NodeStyleBase,
  Point,
  SvgVisual,
  SvgVisualGroup,
  TextRenderSupport,
  Visual
} from 'yfiles'

/**
 * An {@link INodeStyle} rendering a label using the node's tag for the content and placement.
 */
export class IsometricBarLabelNodeStyle extends NodeStyleBase {
  constructor() {
    super()
    this.svgNS = 'http://www.w3.org/2000/svg'
    this.font = new Font('Arial', 12, FontStyle.NORMAL, FontWeight.BOLD)
  }

  /**
   * @param {!IRenderContext} context
   * @param {!INode} node
   * @returns {?Visual}
   */
  createVisual(context, node) {
    const g = window.document.createElementNS(this.svgNS, 'g')

    // the offset off the label from the top of the bar in view coordinates
    const offset = -12
    // the size of the pointing triangle
    const triangleSize = 12

    // draw a small triangle as label pointer
    const triangle = window.document.createElementNS(this.svgNS, 'polygon')
    const svgPolygonDefinition = `${-triangleSize / 2},0 ${triangleSize / 2},0 0,${triangleSize}`
    triangle.setAttribute('points', svgPolygonDefinition)
    triangle.setAttribute('stroke', '#461622')
    triangle.setAttribute('stroke-width', '1.5px')
    triangle.setAttribute('fill', '#AB2346')
    SvgVisual.setTranslate(triangle, 0, offset)
    g.appendChild(triangle)

    // use the 'value' of the node.tag as label text
    const text = window.document.createElementNS(this.svgNS, 'text')
    const labelText = node.tag.value
    text.textContent = labelText
    const textOffset = offset - 20
    const textVerticalInset = 6
    const textContent = TextRenderSupport.addText(text, `${labelText}`, this.font)
    const textSize = TextRenderSupport.measureText(textContent, this.font)
    text.setAttribute('x', `${-textSize.width / 2}`)
    text.setAttribute('y', `${textOffset}`)

    // use a semi-transparent round rect as label background
    const background = window.document.createElementNS(this.svgNS, 'rect')
    background.setAttribute('fill', '#F6FFF7')

    // calculate background position
    const bgWidth = Math.max(textSize.width + 4, 10)
    const bgHeight = textSize.height + textVerticalInset
    background.setAttribute('x', `${-bgWidth / 2}`)
    background.setAttribute('y', `${textOffset - textVerticalInset / 2}`)
    background.setAttribute('height', `${bgHeight}`)
    background.setAttribute('width', `${bgWidth}`)
    background.setAttribute('rx', '3.5')
    background.setAttribute('ry', '3.5')

    g.appendChild(background)
    g.appendChild(text)

    // the label shall be rendered in view coordinates, that is without any visible transform
    const group = new SvgVisualGroup()
    group.transform = context.viewTransform

    // get the location of the node in view coordinates
    const viewCenter = context.toViewCoordinates(node.layout.center)
    // the tip of the bar, in view coordinates but zoom-independent
    const barTip = new Point(viewCenter.x, viewCenter.y - node.tag.height * context.zoom)

    SvgVisual.setTranslate(g, barTip.x, barTip.y)
    group.add(new SvgVisual(g))
    return group
  }
}
