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
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Font,
  type IInputModeContext,
  type ILabel,
  type IRenderContext,
  LabelStyleBase,
  Point,
  Rect,
  Size,
  SvgVisual,
  type TaggedSvgVisual,
  TextRenderSupport
} from '@yfiles/yfiles'

const font: Font = new Font({
  fontFamily: 'Arial',
  fontSize: 12
})
const padding = 3
const tailWidth = 10
const tailHeight = 20

/**
 * Augment the SvgVisual type with the data used to cache the rendering information
 */
type Cache = {
  width: number
  height: number
  text: string
}

type CustomLabelStyleVisual = TaggedSvgVisual<SVGGElement, Cache>

export class CustomLabelStyle extends LabelStyleBase<CustomLabelStyleVisual> {
  protected createVisual(
    context: IRenderContext,
    label: ILabel
  ): CustomLabelStyleVisual {
    // create an SVG text element that displays the label text
    const textElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text'
    )

    const labelSize = label.layout.toSize()
    TextRenderSupport.addText(textElement, label.text, font)

    textElement.setAttribute('transform', `translate(${padding} ${padding})`)

    // add a background shape
    const backgroundPathElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    )
    backgroundPathElement.setAttribute(
      'd',
      createBackgroundShapeData(labelSize)
    )
    backgroundPathElement.setAttribute('stroke', '#aaa')
    backgroundPathElement.setAttribute(
      'fill',
      label.tag?.backgroundColor || '#fffecd'
    )

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

    const cache = {
      width: labelSize.width,
      height: labelSize.height,
      text: label.text
    }

    return SvgVisual.from(gElement, cache)
  }

  protected updateVisual(
    context: IRenderContext,
    oldVisual: CustomLabelStyleVisual,
    label: ILabel
  ): CustomLabelStyleVisual {
    const gElement = oldVisual.svgElement
    const labelSize = label.layout.toSize()
    // get the cache object we stored in createVisual
    const cache = oldVisual.tag

    // check if the label size or text has changed
    if (
      labelSize.width !== cache.width ||
      labelSize.height !== cache.height ||
      label.text !== cache.text
    ) {
      // get the path and text element
      const backgroundPath = gElement.children.item(0)
      const textElement = gElement.children.item(1)
      if (backgroundPath) {
        backgroundPath.setAttribute('d', createBackgroundShapeData(labelSize))
      }
      if (textElement instanceof SVGTextElement) {
        TextRenderSupport.addText(textElement, label.text, font)
      }

      // update the cache with the new values
      cache.width = labelSize.width
      cache.height = labelSize.height
      cache.text = label.text
    }

    // move text to label location
    const transform = LabelStyleBase.createLayoutTransform(
      context,
      label.layout,
      true
    )
    transform.applyTo(gElement)

    return oldVisual
  }

  protected getPreferredSize(label: ILabel): Size {
    // measure the label text using the font
    const { width, height } = TextRenderSupport.measureText(label.text, font)
    // return the measured size plus a small padding
    return new Size(width + padding + padding, height + padding + padding)
  }

  protected isHit(
    context: IInputModeContext,
    location: Point,
    label: ILabel
  ): boolean {
    const labelLayout = label.layout
    // first check if the label layout is hit
    if (labelLayout.contains(location, context.hitTestRadius)) {
      return true
    }
    // if the layout is not hit, we have to check the tail triangle.
    // instead of checking the real label layout, we pretend the tail triangle is placed
    // non-rotated at 0/0 and transform the hit-test location accordingly.

    // create the inverted layout transform
    const layoutTransform = LabelStyleBase.createLayoutTransform(
      context.canvasComponent!.createRenderContext(),
      labelLayout,
      true
    )
    layoutTransform.invert()
    // transform the location and subtract the tail position
    const transformedLocation = layoutTransform
      .transform(location)
      .subtract(new Point(labelLayout.width * 0.5, labelLayout.height))

    // check the rectangular tail bounds
    const tailBounds = new Rect(0, 0, tailWidth, tailHeight)
    if (!tailBounds.contains(transformedLocation, context.hitTestRadius)) {
      return false
    }

    // the location is inside the tail bounds - check if it's inside the triangle
    const tailHeightAtLocationX =
      tailHeight * ((tailWidth - transformedLocation.x) / tailWidth)
    return (
      transformedLocation.y <= tailHeightAtLocationX + context.hitTestRadius
    )
  }
}

/**
 * Creates a simple "speech balloon" shape.
 */
export function createBackgroundShapeData(labelSize: Size): string {
  const { width: w, height: h } = labelSize
  return `M 0 0 h ${w} v ${h} h -${
    w * 0.5 - tailWidth
  } l -${tailWidth} ${tailHeight} v -${tailHeight} h -${w * 0.5} z`
}
