/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  type INode,
  type IRenderContext,
  NodeStyleBase,
  SvgVisual,
  type TaggedSvgVisual
} from 'yfiles'

const tabWidth = 50
const tabHeight = 14

/**
 * Augment the SvgVisual type with the data used to cache the rendering information
 */
// the values we use to render the graphics
type Cache = {
  width: number
  height: number
}

// the type of visual we create and update in CustomNodeStyle
type CustomNodeStyleVisual = TaggedSvgVisual<SVGPathElement, Cache>

export class CustomNodeStyle extends NodeStyleBase<CustomNodeStyleVisual> {
  protected createVisual(
    context: IRenderContext,
    node: INode
  ): CustomNodeStyleVisual {
    const { x, y, width, height } = node.layout

    const pathElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    )
    // we render the path at 0,0 and translate the visual to it's final location
    pathElement.setAttribute('d', createPathData(0, 0, width, height))
    SvgVisual.setTranslate(pathElement, x, y)

    pathElement.setAttribute('fill', '#0b7189')
    pathElement.setAttribute('stroke', '#042d37')

    // we use the factory method to create a properly typed SvgVisual
    return SvgVisual.from(pathElement, { width, height })
  }

  protected updateVisual(
    context: IRenderContext,
    oldVisual: CustomNodeStyleVisual,
    node: INode
  ): CustomNodeStyleVisual {
    const { x, y, width, height } = node.layout
    // get the path element that needs updating from the old visual
    const pathElement = oldVisual.svgElement
    // get the cache object we stored in createVisual
    const cache = oldVisual.tag

    if (width !== cache.width || height !== cache.height) {
      // update the path data to fit the new width and height
      pathElement.setAttribute('d', createPathData(0, 0, width, height))
      oldVisual.tag = { width, height }
    }

    SvgVisual.setTranslate(pathElement, x, y)
    return oldVisual
  }
}

/**
 * Creates the path data for the SVG path element.
 */
export function createPathData(
  x: number,
  y: number,
  width: number,
  height: number
): string {
  return `M ${x} ${y} h ${tabWidth} v ${tabHeight} h ${width - tabWidth} v ${
    height - tabHeight
  } h ${-width} z`
}
