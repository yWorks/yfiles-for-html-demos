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
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Font,
  ILabel,
  IOrientedRectangle,
  IRenderContext,
  LabelStyleBase,
  Point,
  Rect,
  Size,
  SvgVisual,
  TextRenderSupport,
  TextWrapping
} from 'yfiles'

const HORIZONTAL_INSET = 2
const VERTICAL_INSET = 2

/**
 * This class is an example for a custom style based on the {@link LabelStyleBase}.
 * The font for the label text can be set. The label text is drawn with black letters inside a blue rounded rectangle.
 * This implementation returns a fixed desired size without taking the actual text size into account.
 * This is done to showcase the built-in line wrapping (trimming) feature of this style.
 */
export default class MySimpleLabelStyle extends LabelStyleBase {
  private $font: Font
  private $wrapping: TextWrapping

  /**
   * Initializes a new instance of the {@link MySimpleLabelStyle} class using the "Arial" font.
   */
  constructor() {
    super()
    this.$font = new Font({
      fontFamily: 'Arial',
      fontSize: 12,
      lineSpacing: 0.3
    })

    this.$wrapping = TextWrapping.NONE
  }

  get font(): Font {
    return this.$font
  }

  set font(value: Font) {
    this.$font = value
  }

  // ////////////// New in this sample ////////////////
  /**
   * Gets or sets the wrapping style.
   */
  get wrapping(): TextWrapping {
    return this.$wrapping
  }

  set wrapping(value: TextWrapping) {
    this.$wrapping = value
  }

  // //////////////////////////////////////////////////

  /**
   * Creates the visual for a label to be drawn.
   * @see Overrides {@link LabelStyleBase#createVisual}
   */
  createVisual(context: IRenderContext, label: ILabel): SvgVisual {
    // This implementation creates a 'g' element and uses it for the rendering of the label.
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    // Get the necessary data for rendering of the label
    const cache = this.createRenderDataCache(context, label, this.font, this.wrapping)
    // Render the label
    this.render(context, g, label.layout, cache)
    // move container to correct location
    const transform = LabelStyleBase.createLayoutTransform(context, label.layout, true)
    transform.applyTo(g)

    // set data item
    g.setAttribute('data-internalId', 'MySimpleLabel')
    ;(g as any)['data-item'] = label

    return new SvgVisual(g)
  }

  /**
   * Re-renders the label using the old visual for performance reasons.
   * @see Overrides {@link LabelStyleBase#updateVisual}
   */
  updateVisual(context: IRenderContext, oldVisual: SvgVisual, label: ILabel): SvgVisual {
    const container = oldVisual.svgElement as SVGGElement
    // get the data with which the oldvisual was created
    const oldCache = (container as any)['data-renderDataCache']
    // get the data for the new visual
    const newCache = this.createRenderDataCache(context, label, this.font, this.wrapping)
    if (!oldCache.equals(oldCache, newCache)) {
      // something changed - re-render the visual
      this.render(context, container, label.layout, newCache)
    }
    // nothing changed, return the old visual
    // arrange because the layout might have changed
    const transform = LabelStyleBase.createLayoutTransform(context, label.layout, true)
    transform.applyTo(container)
    return oldVisual
  }

  /**
   * Creates an object containing all necessary data to create a label visual.
   */
  createRenderDataCache(
    context: IRenderContext,
    label: ILabel,
    font: Font,
    wrapping: TextWrapping
  ): object {
    return {
      text: label.text,
      font,
      wrapping,
      equals: (self: any, other: any): boolean =>
        self.text === other.text && self.font.equals(other.font) && self.wrapping === other.wrapping
    }
  }

  /**
   * Creates the visual appearance of a label.
   * @param context {IRenderContext}
   * @param container {SVGGElement}
   * @param labelLayout {IOrientedRectangle}
   * @param cache {object}
   */
  render(
    context: IRenderContext,
    container: SVGGElement,
    labelLayout: IOrientedRectangle,
    cache: any
  ): void {
    // store information with the visual on how we created it
    ;(container as any)['data-renderDataCache'] = cache

    // background rectangle
    let rect: SVGRectElement
    if (container.childElementCount > 0) {
      rect = container.childNodes.item(0) as SVGRectElement
    } else {
      rect = window.document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.rx.baseVal.value = 5
      rect.ry.baseVal.value = 5
      container.appendChild(rect)
    }
    rect.width.baseVal.value = labelLayout.width
    rect.height.baseVal.value = labelLayout.height
    rect.setAttribute('stroke', 'skyblue')
    rect.setAttribute('stroke-width', '1')
    rect.setAttribute('fill', 'rgb(155,226,255)')

    let text: SVGTextElement
    if (container.childElementCount > 1) {
      text = container.childNodes.item(1) as SVGTextElement
    } else {
      text = window.document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('fill', '#000')
      container.appendChild(text)
    }

    const textSize = new Size(
      labelLayout.width - HORIZONTAL_INSET * 2,
      labelLayout.height - VERTICAL_INSET * 2
    )

    // //////////////////////////////////////////////////
    // ////////////// New in this sample ////////////////
    // //////////////////////////////////////////////////

    // SVG does not provide out-of-the box text wrapping.
    // The following line uses a convenience method that implements text wrapping
    // with ellipsis by splitting the text and inserting tspan elements as children
    // of the text element. It is not mandatory to use this method, since the same
    // things could be done manually.
    const textContent = TextRenderSupport.addText(
      text,
      cache.text,
      cache.font,
      textSize,
      this.wrapping
    )

    // calculate the size of the text element
    const measuredTextSize = TextRenderSupport.measureText(textContent, cache.font)

    text.setAttribute('transform', `translate(${HORIZONTAL_INSET} ${VERTICAL_INSET})`)
    while (container.childElementCount > 2) {
      container.removeChild(container.childNodes.item(2))
    }
    // add a clip-path, if necessary
    this.clipText(
      context,
      text,
      new Rect(new Point(HORIZONTAL_INSET, VERTICAL_INSET), textSize),
      measuredTextSize,
      container
    )

    // //////////////////////////////////////////////////
  }

  // ////////////// New in this sample ////////////////
  /**
   * Adds a clip-path to the container that clips the given text element at the clip bounds.
   * The clip-path is only added if necessary, i.e. if the measured bounds are larger than the clip bounds.
   * If a clip-path already exists, it is re-used.
   * @param context {IRenderContext}
   * @param textElement {SVGTextElement}
   * @param clipBounds {Rect}
   * @param measuredBounds {Size}
   * @param container {SVGGElement}
   */
  clipText(
    context: IRenderContext,
    textElement: SVGTextElement,
    clipBounds: Rect,
    measuredBounds: Size,
    container: SVGGElement
  ): void {
    let clip = null
    // try to find an existing clip-path element
    if (container.childNodes.length > 2) {
      clip = container.childNodes.item(2)
    }

    // check if the measured text bounds exceed the clip bounds
    if (measuredBounds.width > clipBounds.width || measuredBounds.height > clipBounds.height) {
      let clipRect: any
      if (clip === null) {
        // create clip-path element
        clip = window.document.createElementNS('http://www.w3.org/2000/svg', 'clipPath')
        // create a unique id which can be used to reference the clip-path
        const clipId = context.svgDefsManager.generateUniqueDefsId()
        clip.setAttribute('id', clipId)
        // create the rect at which the text is clipped
        clipRect = window.document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        clip.appendChild(clipRect)
        container.appendChild(clip)
        // reference the clip-path on the text element
        textElement.setAttribute('clip-path', `url(#${clipId})`)
      } else {
        clipRect = clip.childNodes.item(0)
      }
      // update the clip bounds
      clipRect.x.baseVal.value = -clipBounds.x
      clipRect.y.baseVal.value = -clipBounds.y
      clipRect.width.baseVal.value = clipBounds.width
      clipRect.height.baseVal.value = clipBounds.height
    } else if (clip !== null) {
      // no clip-path is needed
      // remove the existing clip-path
      container.removeChild(container.lastChild!)
      textElement.removeAttribute('clip-path')
    }
  }

  // //////////////////////////////////////////////////

  /**
   * Calculates the preferred size for the given label if this style is used for the rendering.
   * The size is calculated from the label's text.
   * @see Overrides {@link LabelStyleBase#getPreferredSize}
   */
  getPreferredSize(label: ILabel): Size {
    // //////////////////////////////////////////////////
    // ////////////// New in this sample ////////////////
    // //////////////////////////////////////////////////

    return new Size(50, 50)

    // //////////////////////////////////////////////////
  }
}
