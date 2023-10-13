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
import { GraphItemTypes, IEdge, INode, Point, TimeSpan } from 'yfiles'
import { getConnectionData, getEntityInfo } from './entity-data.js'

/**
 * Enables the tooltips for the node elements.
 * @param {!GraphComponent} graphComponent
 */
export function enableTooltips(graphComponent) {
  const inputMode = graphComponent.inputMode

  // enable tooltips for nodes and edges
  inputMode.toolTipItems = GraphItemTypes.NODE | GraphItemTypes.EDGE

  const mouseHoverInputMode = inputMode.mouseHoverInputMode
  mouseHoverInputMode.toolTipLocationOffset = new Point(15, 15)
  mouseHoverInputMode.delay = TimeSpan.fromMilliseconds(100)
  mouseHoverInputMode.duration = TimeSpan.fromSeconds(3)

  inputMode.addQueryItemToolTipListener((_, evt) => {
    if (evt.handled) {
      // Tooltip content has already been assigned -> nothing to do.
      return
    }

    const item = evt.item
    if (item instanceof INode) {
      const nodeInfo = getEntityInfo(item)
      // show the first entry of the info element stored in the business data
      evt.toolTip = typeof nodeInfo == 'string' ? nodeInfo : nodeInfo[Object.keys(nodeInfo)[0]]
    } else if (item instanceof IEdge) {
      const connectionData = getConnectionData(item)
      if (connectionData.type !== undefined) {
        // show the type of the connection
        evt.toolTip = connectionData.type
      }
    }

    // Indicate that the tooltip content has been set.
    evt.handled = true
  })
}
