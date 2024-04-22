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
import { EdgeStyleBase, IArrow, SvgVisual } from 'yfiles'

/**
 * Augment the SvgVisual type with the data used to cache the rendering information
 * @typedef {Object} Cache
 * @property {GeneralPath} generalPath
 * @property {number} distance
 */

/**
 * @typedef {TaggedSvgVisual.<SVGGElement,Cache>} CustomEdgeStyleVisual
 */

export class CustomEdgeStyle extends EdgeStyleBase {
  /**
   * Creates a new instance of this style using the given distance.
   * @param distance The distance between the paths. The default value is 1.
   * @param {number} [distance=1]
   */
  constructor(distance = 1) {
    super()
    this.distance = distance
  }

  /**
   * @param {!IRenderContext} context
   * @param {!IEdge} edge
   * @returns {!CustomEdgeStyleVisual}
   */
  createVisual(context, edge) {
    const generalPath = super.getPath(edge)
    const croppedGeneralPath = super.cropPath(edge, IArrow.NONE, IArrow.NONE, generalPath)

    const widePath = croppedGeneralPath.createSvgPath()
    widePath.setAttribute('fill', 'none')
    widePath.setAttribute('stroke', 'black')

    const thinPath = croppedGeneralPath.createSvgPath()
    thinPath.setAttribute('fill', 'none')
    thinPath.setAttribute('stroke', 'white')

    const distance = this.distance
    widePath.setAttribute('stroke-width', String(distance + 2))
    thinPath.setAttribute('stroke-width', String(distance))

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    group.append(widePath, thinPath)

    return SvgVisual.from(group, { generalPath, distance })
  }

  /**
   * @param {!IRenderContext} context
   * @param {!CustomEdgeStyleVisual} oldVisual
   * @param {!IEdge} edge
   * @returns {!CustomEdgeStyleVisual}
   */
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
    return oldVisual
  }
}
