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
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  type Class,
  Font,
  GeneralPath,
  type IInputModeContext,
  type INode,
  INodeInsetsProvider,
  Insets,
  type IRenderContext,
  NodeStyleBase,
  type Point,
  Size,
  SvgVisual,
  type TaggedSvgVisual,
  TextRenderSupport,
  TextWrapping
} from 'yfiles'

const tabWidth = 50
const tabHeight = 14

/**
 * Augment the SvgVisual type with the data used to cache the rendering information
 */
type Cache = {
  width: number
  height: number
  fillColor: string
  showBadge: boolean
  title: string
}

type CustomGroupNodeStyleVisual = TaggedSvgVisual<SVGGElement, Cache>

export class CustomGroupNodeStyle extends NodeStyleBase<CustomGroupNodeStyleVisual> {
  protected createVisual(
    context: IRenderContext,
    node: INode
  ): CustomGroupNodeStyleVisual {
    const { x, y, width, height } = node.layout

    const pathElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    )
    pathElement.setAttribute('d', createPathData(0, 0, width, height))

    const fillColor = node.tag?.color ?? '#0b7189'
    pathElement.setAttribute('fill', fillColor)
    pathElement.setAttribute('stroke', '#333')

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    SvgVisual.setTranslate(g, x, y)

    g.append(pathElement)

    const showBadge = node.tag?.showBadge
    if (showBadge) {
      const badge = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'circle'
      )
      badge.setAttribute('r', '8')
      badge.setAttribute('fill', '#6c9f44')
      badge.setAttribute('stroke', '#496c2e')
      g.append(badge)
    }

    const title = node.tag?.title
    if (title) {
      const text = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      )
      text.setAttribute('fill', '#eee')
      SvgVisual.setTranslate(text, 10, 2)

      TextRenderSupport.addText({
        targetElement: text,
        text: node.tag.title,
        font: new Font('sans-serif', 10),
        wrapping: TextWrapping.CHARACTER_ELLIPSIS,
        maximumSize: new Size(tabWidth - 12, 15)
      })

      g.append(text)
    }

    return SvgVisual.from(g, {
      width,
      height,
      fillColor,
      showBadge,
      title
    })
  }

  protected updateVisual(
    context: IRenderContext,
    oldVisual: CustomGroupNodeStyleVisual,
    node: INode
  ): CustomGroupNodeStyleVisual {
    const { x, y, width, height } = node.layout
    // get the path element that needs updating from the old visual
    const g = oldVisual.svgElement
    const pathElement = g.firstElementChild
    // get the cache object we stored in createVisual
    const cache = oldVisual.tag

    const showBadge = node.tag?.showBadge
    const title = node.tag?.title
    if (
      !pathElement ||
      showBadge !== cache.showBadge ||
      title !== cache.title
    ) {
      // re-create the visual if the badge visibility or the title has changed
      return this.createVisual(context, node)
    }

    const fillColor = node.tag?.color ?? '#0b7189'
    if (fillColor !== cache.fillColor) {
      // update the fill color
      cache.fillColor = fillColor
      pathElement.setAttribute('fill', fillColor)
    }

    if (width !== cache.width || height !== cache.height) {
      // update the path data to fit the new width and height
      pathElement.setAttribute('d', createPathData(0, 0, width, height))
      cache.width = width
      cache.height = height
    }

    SvgVisual.setTranslate(g, x, y)
    return oldVisual
  }

  protected lookup(node: INode, type: Class): any {
    if (type === INodeInsetsProvider.$class) {
      // use a custom insets provider that reserves space for the tab
      return INodeInsetsProvider.create(
        node => new Insets(4, tabHeight + 4, 4, 4)
      )
    }
    return super.lookup(node, type)
  }

  protected isHit(
    context: IInputModeContext,
    location: Point,
    node: INode
  ): boolean {
    // Check for bounding box
    if (
      !node.layout.toRect().containsWithEps(location, context.hitTestRadius)
    ) {
      return false
    }
    const { x, y } = location
    const { x: layoutX, y: layoutY } = node.layout

    // Check for the upper-right corner, which is empty
    if (
      x > layoutX + tabWidth + context.hitTestRadius &&
      y < layoutY + tabHeight - context.hitTestRadius
    ) {
      return false
    }
    // all other points are either inside the tab or the rest of the node
    return true
  }

  protected getOutline(node: INode): GeneralPath | null {
    // Use the node's layout, and enlarge it with half the stroke width
    // to ensure that the arrow ends exactly at the outline
    const { x, y, width, height } = node.layout.toRect().getEnlarged(0.5)
    const path = new GeneralPath()
    path.moveTo(x, y)
    path.lineTo(x + tabWidth, y)
    path.lineTo(x + tabWidth, y + tabHeight)
    path.lineTo(x + width, y + tabHeight)
    path.lineTo(x + width, y + height)
    path.lineTo(x, y + height)
    path.close()
    return path
  }

  protected isInside(node: INode, location: Point): boolean {
    // Check for bounding box
    if (!node.layout.contains(location)) {
      return false
    }
    const { x, y } = location
    const { y: ly } = node.layout

    // Check for the upper-right corner, which is empty
    if (x > x + tabWidth && y < ly + tabHeight) {
      return false
    }
    // all other points are either inside the tab
    // or the rest of the node
    return true
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
