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
  type ICanvasContext,
  type IPort,
  type IRenderContext,
  PortStyleBase,
  Rect,
  type Size,
  SvgVisual,
  type TaggedSvgVisual
} from '@yfiles/yfiles'

type CollapseState = { collapsed: boolean }

type CollapseExpandVisual = TaggedSvgVisual<SVGGElement, CollapseState>

export class CollapseExpandPortStyle extends PortStyleBase<CollapseExpandVisual> {
  constructor(
    public renderSize: Size,
    public isCollapsed: (port: IPort) => boolean
  ) {
    super()
  }

  protected createVisual(_context: IRenderContext, port: IPort): CollapseExpandVisual | null {
    const halfWidth = this.renderSize.width * 0.5
    const halfHeight = this.renderSize.height * 0.5
    const collapsed = this.isCollapsed(port)

    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement
    const portElement = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement
    portElement.classList.add('port')
    container.appendChild(portElement)
    const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
    ellipse.setAttribute('rx', String(halfWidth - 2))
    ellipse.setAttribute('ry', String(halfHeight - 2))
    portElement.appendChild(ellipse)
    const horizontalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    horizontalLine.classList.add('port-icon')
    horizontalLine.setAttribute('x1', String(-(halfWidth - 4)))
    horizontalLine.setAttribute('y1', '0')
    horizontalLine.setAttribute('x2', String(+(halfWidth - 4)))
    horizontalLine.setAttribute('y2', '0')
    portElement.appendChild(horizontalLine)
    const verticalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    verticalLine.setAttribute(
      'class',
      `port-icon ${collapsed ? 'port-icon-expand' : 'port-icon-collapse'}`
    )
    verticalLine.setAttribute('x1', '0')
    verticalLine.setAttribute('y1', '-1')
    verticalLine.setAttribute('x2', '0')
    verticalLine.setAttribute('y2', '1')
    portElement.appendChild(verticalLine)

    SvgVisual.setTranslate(container, port.location.x, port.location.y)

    return SvgVisual.from(container, {
      collapsed: collapsed
    })
  }

  protected updateVisual(
    _context: IRenderContext,
    oldVisual: CollapseExpandVisual,
    port: IPort
  ): CollapseExpandVisual {
    const container = oldVisual.svgElement
    const collapsed = this.isCollapsed(port)
    if (oldVisual.tag.collapsed !== collapsed) {
      container.lastElementChild!.lastElementChild!.setAttribute(
        'class',
        `port-icon ${collapsed ? 'port-icon-expand' : 'port-icon-collapse'}`
      )
      oldVisual.tag.collapsed = collapsed
    }
    SvgVisual.setTranslate(container, port.location.x, port.location.y)
    return oldVisual
  }

  protected getBounds(_context: ICanvasContext, port: IPort): Rect {
    const { width, height } = this.renderSize
    return new Rect(port.location.x - width * 0.5, port.location.y - height * 0.5, width, height)
  }
}
