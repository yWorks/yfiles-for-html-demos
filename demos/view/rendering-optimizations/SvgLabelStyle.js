/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ILabel,
  IOrientedRectangle,
  IRenderContext,
  IVisualCreator,
  LabelStyleBase,
  Size,
  SvgVisual,
  TextRenderSupport,
  TextWrapping,
  Visual
} from 'yfiles'

const SVG_NS = 'http://www.w3.org/2000/svg'

/**
 * A fast label style. It only renders the text but doesn't support features like text clipping and
 * trimming that are potentially costly.
 */
export default class SvgLabelStyle extends LabelStyleBase {
  /**
   * Create a new instance of this label style.
   */
  constructor() {
    super()
    this.font = new Font({ fontSize: 14 })
  }

  /**
   * Creates the visual representation for the given label.
   * @param {!IRenderContext} context The render context.
   * @param {!ILabel} label The label to which this style instance is assigned.
   * @returns {!Visual} The visual as required by the {@link IVisualCreator#createVisual} interface.
   * @see {@link SvgLabelStyle#updateVisual}
   */
  createVisual(context, label) {
    const layout = label.layout

    const g = document.createElementNS(SVG_NS, 'g')

    // render the label
    this.render(label, layout, g)

    // move container to correct location
    const transform = LabelStyleBase.createLayoutTransform(context, label.layout, true)
    transform.applyTo(g)

    // Cache the necessary data for rendering of the label
    g['data-cache'] = label.text
    return new SvgVisual(g)
  }

  /**
   * Updates the visual representation for the given label.
   * @param {!IRenderContext} context The render context.
   * @param {!SvgVisual} oldVisual The visual that has been created in the call to
   * {@link SvgLabelStyle#createVisual}.
   * @param {!ILabel} label The label to which this style instance is assigned.
   * @returns {!Visual} The visual as required by the {@link IVisualCreator#createVisual} interface.
   * @see {@link SvgLabelStyle#createVisual}
   */
  updateVisual(context, oldVisual, label) {
    const layout = label.layout
    const g = oldVisual.svgElement

    // if text changed, re-create the text element
    const oldText = g['data-cache']
    if (oldText !== label.text) {
      // remove the old text element
      g.removeChild(g.firstChild)
      this.render(label, layout, g)
      // update the cache
      g['data-cache'] = label.text
    }

    // move container to correct location
    const transform = LabelStyleBase.createLayoutTransform(context, label.layout, true)
    transform.applyTo(g)

    return oldVisual
  }

  /**
   * Creates the text element and appends it to the given g element.
   * @param {!ILabel} label The label to render.
   * @param {!IOrientedRectangle} layout The bounds of the label.
   * @param {!SVGElement} g The group element to which the text is appended.
   */
  render(label, layout, g) {
    const text = document.createElementNS(SVG_NS, 'text')
    text.setAttribute('fill', 'black')

    TextRenderSupport.addText(text, label.text, this.font, layout.toSize(), TextWrapping.NONE)

    g.appendChild(text)
  }

  /**
   * Calculates the preferred {@link Size size} for the given label.
   * @param {!ILabel} label The label to which this style instance is assigned.
   * @returns {!Size} The preferred size.
   */
  getPreferredSize(label) {
    return TextRenderSupport.measureText(label.text, this.font)
  }
}
