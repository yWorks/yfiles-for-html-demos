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
  HandlesRenderTag,
  HandleType,
  type IPoint,
  IRenderContext,
  ObjectRendererBase,
  SvgVisual
} from '@yfiles/yfiles'

/**
 * Keep the information, whether this is our custom handles visualization.
 */
type SVGTaggedGElement = SVGGElement & { customHandlesElement?: boolean }

/**
 * Renders large handles for resize and move as circles.
 */
export class TouchHandlesRenderer extends ObjectRendererBase<HandlesRenderTag, SvgVisual> {
  static readonly handleRadius = 15

  private resizeHandles = [
    HandleType.RESIZE,
    HandleType.RESIZE_BOTTOM,
    HandleType.RESIZE_BOTTOM_LEFT,
    HandleType.RESIZE_BOTTOM_RIGHT,
    HandleType.RESIZE_TOP,
    HandleType.RESIZE_TOP_LEFT,
    HandleType.RESIZE_TOP_RIGHT,
    HandleType.RESIZE_LEFT,
    HandleType.RESIZE_RIGHT
  ]

  private moveHandles = [HandleType.MOVE, HandleType.MOVE2, HandleType.MOVE3]

  protected createVisual(context: IRenderContext, renderTag: HandlesRenderTag): SvgVisual | null {
    const group: SVGTaggedGElement = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    group.customHandlesElement = true
    group.classList.add('demo-handles')
    return this.updateVisual(context, new SvgVisual(group), renderTag)
  }

  protected updateVisual(
    context: IRenderContext,
    oldVisual: SvgVisual,
    renderTag: HandlesRenderTag
  ): SvgVisual | null {
    if (!('customHandlesElement' in oldVisual.svgElement)) {
      return this.createVisual(context, renderTag)
    }

    // Show the handles with zoom independent size
    const radius = TouchHandlesRenderer.handleRadius / context.canvasComponent!.zoom

    const group = oldVisual.svgElement
    const children = group.children
    const numberOldChildren = children.length
    const newChildren: SVGCircleElement[] = []

    let index = 0
    for (const handle of renderTag.handles) {
      const type = handle.type
      if (this.resizeHandles.indexOf(type) == -1 && this.moveHandles.indexOf(type) == -1) {
        continue
      }
      let circle: SVGCircleElement

      // If the number of current children is larger than the number of old children,
      // create a new circle element. Otherwise, reuse children already in the DOM.
      if (index >= numberOldChildren) {
        circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        newChildren.push(circle)
      } else {
        circle = children[index] as SVGCircleElement
      }

      // place the reshape handles on the selection rectangle of the node by considering the handle offset
      const handleOffset = renderTag.inputMode.getHandleOffset(handle).multiply(1 / context.zoom)
      const handleLocation = handle.location.toPoint().add(handleOffset)

      switch (type) {
        case HandleType.RESIZE:
        case HandleType.RESIZE_BOTTOM:
        case HandleType.RESIZE_BOTTOM_LEFT:
        case HandleType.RESIZE_BOTTOM_RIGHT:
        case HandleType.RESIZE_TOP:
        case HandleType.RESIZE_TOP_LEFT:
        case HandleType.RESIZE_TOP_RIGHT:
        case HandleType.RESIZE_LEFT:
        case HandleType.RESIZE_RIGHT:
          this.configureHandleCircle(circle, handleLocation, radius, 'resize')
          break
        case HandleType.MOVE:
        case HandleType.MOVE2:
        case HandleType.MOVE3:
          this.configureHandleCircle(circle, handleLocation, radius, 'move')
          break
      }
      index++
    }

    group.append(...newChildren)

    // Remove child elements that are not used anymore.
    for (; index < numberOldChildren; index++) {
      group.lastChild?.remove()
    }

    return oldVisual
  }

  /**
   * Updates an {@link SVGCircleElement} by updating its position and type
   */
  private configureHandleCircle(
    circle: SVGCircleElement,
    location: IPoint,
    radius: number,
    type: 'default' | 'resize' | 'move'
  ): SVGCircleElement {
    circle.r.baseVal.value = radius
    circle.setAttribute('transform', `translate(${location.x} ${location.y})`)
    circle.dataset.handleType = type
    return circle
  }
}
