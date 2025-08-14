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
  type GeneralPath,
  type INode,
  type IRenderContext,
  NodeStyleBase,
  type Point,
  type Size,
  SvgVisual,
  type Visual
} from '@yfiles/yfiles'
import { getNodeHighlightInfo } from '../NodeHighlightInfo'
import type { LogicGateType } from '../LogicGateType'

/**
 * The base class for the logic gate node style. This handles the create
 * and update of the node visuals.
 */
export abstract class GateNodeStyle extends NodeStyleBase {
  // color for input pins
  static IN_COLOR = '#E01A4F'
  // color for output pins
  static OUT_COLOR = '#01BAFF'

  protected constructor(readonly gateType: LogicGateType) {
    super()
  }

  abstract render(container: Element, cache: Cache, node: INode): void

  protected createVisual(context: IRenderContext, node: INode): SvgVisual {
    // This implementation creates a 'g' element and uses it as a container for the rendering of the node.
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    // Cache the necessary data for rendering of the node
    const cache = createRenderDataCache(node)
    // Render the node
    this.render(g, cache, node)
    // set the location
    SvgVisual.setTranslate(g, node.layout.x, node.layout.y)
    return new SvgVisual(g)
  }

  /**
   * Re-renders the node using the old visual for performance reasons.
   * @param context The render context
   * @param oldVisual The old visual
   * @param node The node to which this style instance is assigned
   * @see Overrides {@link NodeStyleBase.updateVisual}
   */
  protected updateVisual(context: IRenderContext, oldVisual: Visual, node: INode): Visual {
    if (!(oldVisual instanceof SvgVisual)) {
      return this.createVisual(context, node)
    }
    const container = oldVisual.svgElement as CacheOwnerElement
    // get the data with which the oldvisual was created
    const oldCache = container['data-cache']
    // get the data for the new visual
    const newCache = createRenderDataCache(node)

    // check if something changed except for the location of the node
    if (!newCache.equals(oldCache)) {
      // something changed - re-render the visual
      while (container.lastChild != null) {
        container.removeChild(container.lastChild)
      }
      this.render(container, newCache, node)
    }
    // make sure that the location is up-to-date
    SvgVisual.setTranslate(container, node.layout.x, node.layout.y)
    return oldVisual
  }
}

export type CacheOwnerElement = SVGElement & { 'data-cache'?: Cache }

export type Cache = {
  size: Size
  sourceHighlight: boolean
  targetHighlight: boolean
  equals: (this: Cache, other?: Cache) => boolean
}

/**
 * Creates an object containing all necessary data to create a visual for the node.
 * @param node The node to which this style instance is assigned.
 * @returns The render data cache object
 */
export function createRenderDataCache(node: INode): Cache {
  return {
    size: node.layout.toSize(),
    sourceHighlight: getNodeHighlightInfo(node).sourceHighlight,
    targetHighlight: getNodeHighlightInfo(node).targetHighlight,
    equals(other?: Cache): boolean {
      return (
        !!other &&
        this.size.equals(other.size) &&
        this.sourceHighlight === other.sourceHighlight &&
        this.targetHighlight === other.targetHighlight
      )
    }
  }
}

/**
 * Calculates a point on the Bézier cubic curve based on the given t value.
 * @param t The parametric value t in [0,1]
 * @param firstPoint The first point of the curve
 * @param endPoint The end point of the curve
 * @param c1 The first control point of the curve
 * @param c2 The second control point of the curve
 * @returns The calculated point the cubic Bézier curve
 */
export function getPointOnCurve(
  t: number,
  firstPoint: Point,
  endPoint: Point,
  c1: Point,
  c2: Point
): number {
  return (
    (1 - t) ** 3 * firstPoint.x +
    3 * (1 - t) ** 2 * t * c1.x +
    3 * (1 - t) * t * t * c2.x +
    t * t * t * endPoint.x
  )
}

/**
 * Creates an SVG ellipse and appends it to the given container element.
 * @param container The SVG element to append the ellipse to
 * @param cx The x coordinate of the center of the ellipse
 * @param cy The y coordinate of the center of the ellipse
 * @param rx The horizontal radius
 * @param ry The vertical radius
 */
export function appendEllipse(
  container: Element,
  cx: number,
  cy: number,
  rx: number,
  ry: number
): void {
  const ellipse = window.document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
  ellipse.cx.baseVal.value = cx
  ellipse.cy.baseVal.value = cy
  ellipse.rx.baseVal.value = rx
  ellipse.ry.baseVal.value = ry
  setAttribute(ellipse, 'fill', 'white')
  setAttribute(ellipse, 'stroke', 'black')
  setAttribute(ellipse, 'stroke-width', '2')
  container.appendChild(ellipse)
}

/**
 * Creates a svg path from the given general path and appends it to the given container element.
 * @param container The svg element to append the path to
 * @param generalPath The given general path
 * @param fill The fill for this path
 * @param stroke The stroke for this path
 */
export function createPath(
  container: Element,
  generalPath: GeneralPath,
  fill?: string,
  stroke?: string
): void {
  const path = generalPath.createSvgPath()
  setAttribute(path, 'stroke', stroke ?? 'black')
  setAttribute(path, 'stroke-width', '2')
  setAttribute(path, 'fill', fill ?? 'none')
  setAttribute(path, 'stroke-linejoin', 'round')
  container.appendChild(path)
}

/**
 * Creates a svg text element with the given content and font size.
 * @param textContent The text content
 * @param fontSize The font size
 * @param color The text color
 * @returns The created text element
 */
export function createText(textContent: string, fontSize: number, color: string): Element {
  const text = window.document.createElementNS('http://www.w3.org/2000/svg', 'text')
  text.textContent = textContent
  setAttribute(text, 'font-family', 'Arial')
  setAttribute(text, 'fill', color)

  setAttribute(text, 'font-size', `${fontSize}px`)
  setAttribute(text, 'font-family', 'Arial')
  setAttribute(text, 'font-weight', 'bold')
  return text
}

export function setAttribute(element: Element, name: string, value: number | string): void {
  element.setAttribute(name, value.toString())
}
