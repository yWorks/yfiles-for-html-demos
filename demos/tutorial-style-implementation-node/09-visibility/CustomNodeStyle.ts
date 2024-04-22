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
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  GeneralPath,
  type ICanvasContext,
  type IInputModeContext,
  type INode,
  type IRenderContext,
  NodeStyleBase,
  type Point,
  Rect,
  Size,
  SvgVisual,
  type Visual
} from 'yfiles'

const tabWidth = 50
const tabHeight = 14

export class CustomNodeStyle extends NodeStyleBase {
  protected createVisual(context: IRenderContext, node: INode): Visual | null {
    const { x, y, width, height } = node.layout

    const circleElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle'
    )
    circleElement.cx.baseVal.value = node.layout.width * 0.5
    circleElement.cy.baseVal.value = node.layout.height * 0.5
    circleElement.r.baseVal.value = Math.max(
      node.layout.width,
      node.layout.height
    )
    circleElement.setAttribute('fill', '#0b7189')
    circleElement.setAttribute('fill-opacity', '0.3')

    const pathElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    )
    pathElement.setAttribute('d', createPathData(0, 0, width, height))

    pathElement.setAttribute('fill', node.tag?.color ?? '#0b7189')
    pathElement.setAttribute('stroke', '#333')

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    SvgVisual.setTranslate(g, x, y)

    g.append(circleElement)
    g.append(pathElement)

    return new SvgVisual(g)
  }


  protected isVisible(
    context: ICanvasContext,
    rectangle: Rect,
    node: INode
  ): boolean {
    // consider the circle, which is twice the size of the node
    const circleDiameter = Math.max(node.layout.height, node.layout.width) * 2
    const bounds = Rect.fromCenter(
      node.layout.center,
      new Size(circleDiameter, circleDiameter)
    )
    return rectangle.intersects(bounds)
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
