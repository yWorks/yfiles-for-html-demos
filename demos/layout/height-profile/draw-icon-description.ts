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
  BaseClass,
  type GraphComponent,
  type ICanvasObject,
  ICanvasObjectDescriptor,
  type INode,
  type IRenderContext,
  IVisualCreator,
  SvgVisual,
  type Visual
} from 'yfiles'
import { getWayPoint } from './resources/TrekkingData'

/**
 * The visual that contains the icon associated with a node that is being hovered.
 */
let iconDescriptionVisual: ICanvasObject | null

/**
 * Adds the icon visual associated to the given node to the background group of the
 * given graph component.
 * Called when a node is being hovered.
 */
export function addIconDescription(graphComponent: GraphComponent, node: INode): void {
  iconDescriptionVisual = graphComponent.highlightGroup.addChild(
    new IconDescriptionVisual(node),
    ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
  )
}

/**
 * Removes the icon visual from the background group of the given graph component.
 * Called whenever the highlighting of a node is being removed.
 */
export function removeIconDescription(): void {
  if (iconDescriptionVisual) {
    iconDescriptionVisual.remove()
    iconDescriptionVisual = null
  }
}

/**
 * Creates a background visual that contains an icon for the given node.
 */
export class IconDescriptionVisual
  extends BaseClass<IVisualCreator>(IVisualCreator)
  implements IVisualCreator
{
  constructor(private readonly node: INode) {
    super()
  }

  /**
   * Creates an image element with the icon associated to the current node and a line that connects
   * the node with the image element.
   */
  createVisual(context: IRenderContext): SvgVisual {
    const data = getWayPoint(this.node)
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    if (data?.icon != null) {
      const layout = this.node.layout
      const cx = layout.x + layout.width * 0.5
      // create the icon and add it to the container
      const imageWidth = 300
      const imageHeight = 200
      const imageX = Math.max(5, layout.center.x - imageWidth * 0.5)
      const imageY = -250

      const image = document.createElementNS('http://www.w3.org/2000/svg', 'image')
      image.x.baseVal.value = Math.max(5, imageX)
      image.y.baseVal.value = imageY
      image.width.baseVal.value = imageWidth
      image.height.baseVal.value = imageHeight
      image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', data.icon)
      image.setAttribute('style', 'pointer-events: none')
      container.appendChild(image)

      // create the icon border
      const rectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rectangle.x.baseVal.value = imageX
      rectangle.y.baseVal.value = imageY
      rectangle.width.baseVal.value = imageWidth
      rectangle.height.baseVal.value = imageHeight
      rectangle.setAttribute('stroke', '#0b7189')
      rectangle.setAttribute('stroke-width', '2')
      rectangle.setAttribute('fill', 'none')
      container.appendChild(rectangle)

      // create the line that connects the node with the icon
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.x1.baseVal.value = cx
      line.x2.baseVal.value = cx
      line.y1.baseVal.value = layout.y + layout.height
      line.y2.baseVal.value = imageY
      line.setAttribute('stroke', '#0b7189')
      line.setAttribute('stroke-width', '1')
      line.setAttribute('stroke-dasharray', '2')
      container.appendChild(line)
    }

    return new SvgVisual(container)
  }

  /**
   * Delegates the call to the {@link createVisual} method.
   */
  updateVisual(context: IRenderContext, oldVisual: Visual | null): Visual | null {
    return this.createVisual(context)
  }
}
