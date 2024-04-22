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
import {
  EdgeStyleBase,
  type GeneralPath,
  IArrow,
  type IEdge,
  type IRenderContext,
  SvgVisual,
  type TaggedSvgVisual
} from 'yfiles'

/**
 * Augment the SvgVisual type with the data used to cache the rendering information
 */
// the values we use to render the graphics
type Cache = {
  generalPath: GeneralPath
}

// the type of visual we create and update in CustomEdgeStyle
type CustomEdgeStyleVisual = TaggedSvgVisual<SVGGElement, Cache>

export class CustomEdgeStyle extends EdgeStyleBase<CustomEdgeStyleVisual> {
  protected createVisual(
    context: IRenderContext,
    edge: IEdge
  ): CustomEdgeStyleVisual {
    const generalPath = super.getPath(edge)!
    const croppedGeneralPath = super.cropPath(
      edge,
      IArrow.NONE,
      IArrow.NONE,
      generalPath
    )!

    const widePath = croppedGeneralPath.createSvgPath()
    widePath.setAttribute('fill', 'none')
    widePath.setAttribute('stroke', 'black')
    widePath.setAttribute('stroke-width', '4')

    const thinPath = croppedGeneralPath.createSvgPath()
    thinPath.setAttribute('fill', 'none')
    thinPath.setAttribute('stroke', 'white')
    thinPath.setAttribute('stroke-width', '2')

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    group.append(widePath, thinPath)

    // we use the factory method to create a properly typed SvgVisual
    return SvgVisual.from(group, { generalPath })
  }

  protected updateVisual(
    context: IRenderContext,
    oldVisual: CustomEdgeStyleVisual,
    edge: IEdge
  ): CustomEdgeStyleVisual {
    const cache = oldVisual.tag
    const oldGeneralPath = cache.generalPath
    const newGeneralPath = super.getPath(edge)!

    if (!newGeneralPath.hasSameValue(oldGeneralPath)) {
      const croppedGeneralPath = super.cropPath(
        edge,
        IArrow.NONE,
        IArrow.NONE,
        newGeneralPath
      )!
      const pathData = croppedGeneralPath.createSvgPathData()

      const group = oldVisual.svgElement
      const widePath = group.children[0]
      const thinPath = group.children[1]

      widePath.setAttribute('d', pathData)
      thinPath.setAttribute('d', pathData)

      cache.generalPath = newGeneralPath
    }
    return oldVisual
  }
}
