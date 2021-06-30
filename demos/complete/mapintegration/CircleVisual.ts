/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GraphComponent,
  IGraph,
  IRenderContext,
  IVisualCreator,
  Point,
  RadialLayout,
  RadialLayoutNodeInfo,
  SvgVisual,
  Visual
} from 'yfiles'

/**
 * A visualization for the circles in the radial layout to emphasize the hops between airports.
 */
export default class CircleVisual
  extends BaseClass<IVisualCreator>(IVisualCreator)
  implements IVisualCreator
{
  private center: Point | null = null
  private radii: number[] = []

  constructor(graphMode: boolean) {
    super()
    this.graphMode = graphMode
  }

  /**
   * Whether or not the demo is in the graph mode.
   */
  graphMode: boolean

  createVisual(context: IRenderContext): SvgVisual {
    const graph = (context.canvasComponent as GraphComponent)!.graph
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    this.updateCircleInformation(graph)

    this.radii.forEach(radius => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', `${this.center!.x}`)
      circle.setAttribute('cy', `${this.center!.y}`)
      circle.setAttribute('r', `${radius}`)
      circle.setAttribute('class', 'circle')
      container.appendChild(circle)
    })

    const visual = new SvgVisual(container)
    ;(visual as any)['render-data-cache'] = {
      center: this.center,
      radii: this.radii,
      graphMode: this.graphMode
    }

    return visual
  }

  updateVisual(context: IRenderContext, oldVisual: Visual): Visual {
    const renderDataCache = (oldVisual as any)['render-data-cache']
    this.updateCircleInformation((context.canvasComponent as GraphComponent)!.graph)

    if (
      renderDataCache.graphMode !== this.graphMode ||
      renderDataCache.center !== this.center ||
      this.equalsArray(renderDataCache.radii, this.radii)
    ) {
      return this.createVisual(context)
    }

    return oldVisual
  }

  /**
   * Checks if the two arrays are equal.
   */
  equalsArray(array1: Array<number>, array2: number[]): boolean {
    if (array1 === array2) {
      return true
    }
    if (array1 === null || array2 === null) {
      return false
    }
    if (array1.length !== array2.length) {
      return false
    }

    // the radii in the arrays are sorted
    for (let i = 0; i < array1.length; ++i) {
      if (array1[i] !== array2[i]) {
        return false
      }
    }
    return true
  }

  /**
   * Updates the center and radii of the circles.
   */
  updateCircleInformation(graph: IGraph): void {
    const circleInfo = graph.mapperRegistry.getMapper(RadialLayout.NODE_INFO_DP_KEY)!

    this.center = null
    this.radii = []
    if (!this.graphMode) {
      graph.nodes.forEach(node => {
        const info = circleInfo.get(node) as RadialLayoutNodeInfo
        if (info) {
          if (this.center === null) {
            // only calculate the center once
            const nodeCenter = node.layout.center
            this.center = new Point(
              nodeCenter.x - info.centerOffset.x,
              nodeCenter.y - info.centerOffset.y
            )
          }

          if (this.radii.indexOf(info.radius) < 0) {
            // we collect the radii of all circles the  nodes are placed on
            this.radii.push(info.radius)
          }
        }
      })

      this.radii.sort()
    }
  }
}
