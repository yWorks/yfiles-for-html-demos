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
import { LayoutStageBase, Size } from '@yfiles/yfiles'

/**
 * A LayoutStage for changing the sizes of the nodes according to their centrality values.
 */
export class CentralityStage extends LayoutStageBase {
  /**
   * Whether the edges should be considered directed or undirected.
   */
  directed = false

  /**
   * Applies the layout to the given graph.
   * @param graph the given graph
   */
  applyLayoutImpl(graph) {
    if (!this.coreLayout) {
      return
    }

    // change the node sizes if a centrality algorithm is applied
    const isCentralityAlgorithm = graph.nodes.some((node) => node.tag.centrality !== undefined)
    if (isCentralityAlgorithm) {
      const mostCentralSize = 100
      const leastCentralSize = 30
      graph.nodes.forEach((node) => {
        let centralityId = node.tag.centrality
        // centrality values are already normalized in [0,1]
        if (Number.isNaN(centralityId)) {
          centralityId = 0
        }
        const size = Math.floor(
          leastCentralSize + centralityId * (mostCentralSize - leastCentralSize)
        )
        node.layout.size = new Size(size, size)
      })
    } else {
      graph.nodes.forEach((node) => {
        node.layout.size = new Size(30, 30)
      })
    }

    // run the core layout
    this.coreLayout.applyLayout(graph)
  }
}
