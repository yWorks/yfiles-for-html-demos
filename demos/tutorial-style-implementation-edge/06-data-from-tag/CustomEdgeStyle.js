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
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { EdgeStyleBase, IArrow, SvgVisual } from '@yfiles/yfiles'
export class CustomEdgeStyle extends EdgeStyleBase {
  distance
  /**
   * Creates a new instance of this style using the given distance.
   * @param distance The distance between the paths. The default value is 1.
   */
  constructor(distance = 1) {
    super()
    this.distance = distance
  }
  createVisual(context, edge) {
    const generalPath = super.getPath(edge)
    const croppedGeneralPath = super.cropPath(edge, IArrow.NONE, IArrow.NONE, generalPath)
    const widePath = croppedGeneralPath.createSvgPath()
    widePath.setAttribute('fill', 'none')
    widePath.setAttribute('stroke', 'black')
    const thinPath = croppedGeneralPath.createSvgPath()
    thinPath.setAttribute('fill', 'none')
    const loadColor = this.getLoadColor(edge)
    thinPath.setAttribute('stroke', loadColor)
    const distance = this.distance
    widePath.setAttribute('stroke-width', String(distance + 2))
    thinPath.setAttribute('stroke-width', String(distance))
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    group.append(widePath, thinPath)
    return SvgVisual.from(group, { generalPath, distance, loadColor })
  }
  updateVisual(context, oldVisual, edge) {
    const cache = oldVisual.tag
    const group = oldVisual.svgElement
    const widePath = group.children[0]
    const thinPath = group.children[1]
    const newGeneralPath = super.getPath(edge)
    if (!newGeneralPath.hasSameValue(cache.generalPath)) {
      const croppedGeneralPath = super.cropPath(edge, IArrow.NONE, IArrow.NONE, newGeneralPath)
      const pathData = croppedGeneralPath.createSvgPathData()
      widePath.setAttribute('d', pathData)
      thinPath.setAttribute('d', pathData)
      cache.generalPath = newGeneralPath
    }
    if (this.distance !== cache.distance) {
      widePath.setAttribute('stroke-width', String(this.distance + 2))
      thinPath.setAttribute('stroke-width', String(this.distance))
      cache.distance = this.distance
    }
    const newLoadColor = this.getLoadColor(edge)
    if (newLoadColor !== cache.loadColor) {
      thinPath.setAttribute('stroke', newLoadColor)
      cache.loadColor = newLoadColor
    }
    return oldVisual
  }
  /**
   * Returns the color of an edge based on the load property of its tag object.
   * @param edge The edge to get a color for.
   * @returns The color string associated with the load value of the edge object. If the load value
   * of {@link IEdge.tag} is not specified, the function returns the default color 'white'.
   */
  getLoadColor(edge) {
    switch (edge.tag?.load) {
      case 'Free':
        return '#76b041'
      case 'Moderate':
        return '#ffc914'
      case 'Overloaded':
        return '#ff6c00'
      default:
        return 'white'
    }
  }
}
