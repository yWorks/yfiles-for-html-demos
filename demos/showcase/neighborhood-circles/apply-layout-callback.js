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
import { Point, RadialLayout, RadialLayoutData } from '@yfiles/yfiles'

/**
 * Returns the layout callback suitable for the demo's neighborhood view.
 * @param onDone a callback that is invoked with geometry information about the circles on which
 * the nodes in the neighborhood view have been placed by the layout calculation.
 */
export function getApplyLayoutCallback(onDone) {
  return (view, nodes) => {
    // arrange the nodes in the neighborhood graph on concentric circles
    const radialLayout = new RadialLayout({ createControlPoints: true, edgeRoutingStyle: 'arc' })
    const radialLayoutData = new RadialLayoutData({ centerNodes: nodes })
    view.neighborhoodGraph.applyLayout(radialLayout, radialLayoutData)

    // collect the geometry of the calculated circles
    const indices = new Set()
    const circles = []
    for (const node of view.neighborhoodGraph.nodes) {
      const info = radialLayoutData.nodePlacementsResult.get(node)
      if (info) {
        if (!indices.has(info.circleIndex) && info.radius > 0) {
          indices.add(info.circleIndex)

          const nodeCenter = node.layout.center

          circles.push({
            center: new Point(
              nodeCenter.x - info.centerOffset.x,
              nodeCenter.y - info.centerOffset.y
            ),
            radius: info.radius,
            index: info.circleIndex
          })
        }
      }
    }
    circles.sort((c1, c2) => {
      if (c1.index < c2.index) {
        return -1
      } else if (c1.index > c2.index) {
        return 1
      } else {
        return 0
      }
    })

    // report the geometry of the calculated circles to interested parties
    // the demo uses this information to show the calculated circles in the background of the
    // neighborhood view
    onDone(view, circles)
  }
}
