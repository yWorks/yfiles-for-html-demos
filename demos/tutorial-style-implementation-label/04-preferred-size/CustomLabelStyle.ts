/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
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
  Font,
  type ILabel,
  type IRenderContext,
  LabelStyleBase,
  Size,
  SvgVisual,
  TextRenderSupport,
  type Visual
} from 'yfiles'

const font: Font = new Font({
  fontFamily: 'Arial',
  fontSize: 12
})
const padding = 3

export class CustomLabelStyle extends LabelStyleBase {
  protected createVisual(
    context: IRenderContext,
    label: ILabel
  ): Visual | null {
    // create an SVG text element that displays the label text
    const textElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text'
    )

    const labelSize = label.layout.toSize()
    // use a convenience method to place text content in the <text> element.
    TextRenderSupport.addText(textElement, label.text, font)

    // move the text right and down to leave a little padding space
    textElement.setAttribute('transform', `translate(${padding} ${padding})`)

    // add a background shape
    const backgroundPathElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    )
    backgroundPathElement.setAttribute(
      'd',
      this.createBackgroundShapeData(labelSize)
    )
    backgroundPathElement.setAttribute('stroke', '#aaa')
    backgroundPathElement.setAttribute('fill', '#fffecd')

    const gElement = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    gElement.appendChild(backgroundPathElement)
    gElement.appendChild(textElement)

    // move text to label location
    const transform = LabelStyleBase.createLayoutTransform(
      context,
      label.layout,
      true
    )
    transform.applyTo(gElement)

    return new SvgVisual(gElement)
  }

  protected getPreferredSize(label: ILabel): Size {
    // measure the label text using the font
    const { width, height } = TextRenderSupport.measureText(label.text, font)
    // return the measured size plus a small padding
    return new Size(width + padding + padding, height + padding + padding)
  }

  /**
   * Creates a simple "speech balloon" shape.
   */
  private createBackgroundShapeData(labelSize: Size): string {
    const { width: w, height: h } = labelSize
    return `M 0 0 h ${w} v ${h} h -${w * 0.5 - 5} l -5 5 v -5 h -${w * 0.5} z`
  }
}
