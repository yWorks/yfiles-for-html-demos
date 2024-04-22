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
import { ICanvasContext, IPort, Point, PortStyleBase, Rect } from 'yfiles'
import type { FlowNodePortProperties } from './FlowNodePort'

type DummyPortOptions = {
  nodeBounds: Rect
  side: FlowNodePortProperties['side']
  isConnected?: boolean
}

export class FlowNodePortStyle extends PortStyleBase {
  static readonly size = 12
  static readonly nodeMargin = 3
  static readonly nodeReservedWidthForPort =
    FlowNodePortStyle.size / 2 + FlowNodePortStyle.nodeMargin

  /**
   * Creates a visual for the dummy "port" that will be rendered as part of node visual
   * to bypass DnD limitations. (We can't render actual ports when preparing nodes
   * for the DnD palette, as dragging such a node to the main graph results in an
   * uncatchable exception).
   */
  static createDummyPortElement({
    nodeBounds,
    side,
    isConnected = false
  }: DummyPortOptions): SVGGElement {
    const { size } = FlowNodePortStyle
    const outerRadius = size / 2
    const innerRadius = size / 2 / 2 + 0.5
    const color = isConnected ? 'rgb(0, 0, 0)' : 'rgb(153, 153, 153)'

    const location = {
      left: new Point(0, nodeBounds.height / 2),
      right: new Point(nodeBounds.width, nodeBounds.height / 2)
    }[side]
    const { x, y } = location

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const outer = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
    const inner = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')

    outer.setAttribute('cx', String(x))
    outer.setAttribute('cy', String(y))
    outer.setAttribute('rx', String(outerRadius))
    outer.setAttribute('ry', String(outerRadius))
    outer.setAttribute('fill', 'rgb(255, 255, 255)')
    outer.setAttribute('stroke', color)
    outer.setAttribute('stroke-width', '1')

    inner.setAttribute('cx', String(x))
    inner.setAttribute('cy', String(y))
    inner.setAttribute('rx', String(innerRadius))
    inner.setAttribute('ry', String(innerRadius))
    inner.setAttribute('fill', color)

    group.setAttribute('style', 'cursor: crosshair')
    group.appendChild(outer)
    group.appendChild(inner)

    return group
  }

  static updateDummyPortElement({
    element,
    nodeBounds,
    side
  }: { element: SVGGElement } & DummyPortOptions): void {
    const location = {
      left: new Point(0, nodeBounds.height / 2),
      right: new Point(nodeBounds.width, nodeBounds.height / 2)
    }[side]
    const { x, y } = location
    element.querySelectorAll('ellipse').forEach((e) => {
      e.setAttribute('cx', String(x))
      e.setAttribute('cy', String(y))
    })
  }

  /**
   * The actual visual is rendered as part of the accompanying node.
   */
  protected createVisual(): null {
    return null
  }

  protected getBounds(_context: ICanvasContext, port: IPort): Rect {
    const { size } = FlowNodePortStyle
    return Rect.fromCenter(port.location, [size, size])
  }
}
