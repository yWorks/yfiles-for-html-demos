/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  BaseClass,
  type Constructor,
  EdgePathCropper,
  GeneralPath,
  GeometryUtilities,
  type ICanvasContext,
  IEdgePathCropper,
  type IInputModeContext,
  type IPort,
  type IRenderContext,
  IShapeGeometry,
  type Point,
  PortStyleBase,
  Rect,
  SvgVisual,
  type TaggedSvgVisual
} from '@yfiles/yfiles'

/**
 * Augment the SvgVisual type with the data used to cache the rendering information
 */
type Cache = { size: number; color: string }

type CustomPortStyleVisual = TaggedSvgVisual<SVGEllipseElement, Cache>

/**
 * A basic port style that renders a circle.
 */
export class CustomPortStyle extends PortStyleBase<CustomPortStyleVisual> {
  size: number

  constructor(size: number = 6) {
    super()
    this.size = size
  }

  protected createVisual(
    context: IRenderContext,
    port: IPort
  ): CustomPortStyleVisual {
    const ellipseElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'ellipse'
    )
    const { x, y } = port.location
    ellipseElement.setAttribute('cx', String(x))
    ellipseElement.setAttribute('cy', String(y))
    const radius = this.size * 0.5
    ellipseElement.setAttribute('rx', String(radius))
    ellipseElement.setAttribute('ry', String(radius))
    const color = port.tag.color ?? '#6c9f44'
    ellipseElement.setAttribute('fill', color)
    ellipseElement.setAttribute('stroke', '#e6f8ff')
    ellipseElement.setAttribute('stroke-width', '1')

    const cache = { size: this.size, color }

    return SvgVisual.from(ellipseElement, cache)
  }

  protected updateVisual(
    context: IRenderContext,
    oldVisual: CustomPortStyleVisual,
    port: IPort
  ): CustomPortStyleVisual {
    const { x, y } = port.location
    // get the ellipse element that needs updating from the old visual
    const ellipseElement = oldVisual.svgElement
    // get the cache object we stored in createVisual
    const cache = oldVisual.tag

    const color = port.tag.color ?? '#6c9f44'
    if (cache.color !== color) {
      ellipseElement.setAttribute('fill', color)
      cache.color = color
    }

    if (cache.size !== this.size) {
      const radius = this.size * 0.5
      ellipseElement.setAttribute('rx', String(radius))
      ellipseElement.setAttribute('ry', String(radius))
      cache.size = this.size
    }

    // move the visualization to the port location
    ellipseElement.setAttribute('cx', String(x))
    ellipseElement.setAttribute('cy', String(y))

    return oldVisual
  }

  protected isHit(
    context: IInputModeContext,
    location: Point,
    port: IPort
  ): boolean {
    // get the ellipse bounds
    const bounds = this.getBounds(context, port)
    // use a convenience function to check if the location is inside the ellipse
    return GeometryUtilities.ellipseContains(
      bounds,
      location,
      context.hitTestRadius
    )
  }

  protected lookup(port: IPort, type: Constructor<any>): any {
    if (type === IShapeGeometry) {
      // calculate the port bounds for edge cropping
      const bounds = this.getPortBounds(port)
      // the IShapeGeometry implementation for this style
      const PortShapeGeometry = class extends BaseClass(IShapeGeometry) {
        getIntersection(inner: Point, outer: Point): Point | null {
          return GeometryUtilities.getEllipseLineIntersection(
            bounds,
            inner,
            outer
          )
        }

        getOutline(): GeneralPath | null {
          const path = new GeneralPath()
          path.appendEllipse(bounds, false)
          return path
        }

        isInside(location: Point): boolean {
          return GeometryUtilities.ellipseContains(bounds, location, 0)
        }
      }
      return new PortShapeGeometry()
    }
    if (type === IEdgePathCropper) {
      // a custom IEdgePathCropped implementation that uses the IShapeGeometry defined above
      const CustomEdgePathCropper = class extends EdgePathCropper {
        protected getPortGeometry(port: IPort): IShapeGeometry | null {
          return port.lookup(IShapeGeometry)
        }
      }
      return new CustomEdgePathCropper({ cropAtPort: true })
    }
    return super.lookup(port, type)
  }

  protected getBounds(context: ICanvasContext, port: IPort): Rect {
    return this.getPortBounds(port)
  }

  /**
   * Calculates the port's bounds.
   */
  private getPortBounds(port: IPort): Rect {
    const { x, y } = port.location
    const radius = this.size * 0.5
    return new Rect(x - radius, y - radius, this.size, this.size)
  }
}
