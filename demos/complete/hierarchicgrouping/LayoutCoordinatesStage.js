/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

define(['yfiles/layout'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * A {@link yfiles.algorithms.IDataProvider} to store the {@link yfiles.algorithms.YPointPath} for each edge for an
   * incremental layout.
   * @type {Symbol}
   */
  const EDGE_COORDINATES_DP_KEY = Symbol('EdgeCoordinatesDpKey')

  /**
   * A {@link yfiles.algorithms.IDataProvider} to store the top-left coordinate of each node for an incremental layout.
   * @type {Symbol}
   */
  const NODE_COORDINATES_DP_KEY = Symbol('NodeCoordinatesDpKey')

  /**
   * This {@link yfiles.layout.ILayoutStage} moves nodes and bends to the location that is specified in the
   * {@link yfiles.algorithms.IDataProvider}s before invoking the core layout.
   * It can be used to store the coordinates for an incremental layout before moving the graph elements to nice
   * starting locations before the layout animation.
   */
  class LayoutCoordinatesStage extends yfiles.layout.LayoutStageBase {
    /**
     * @param {yfiles.layout.LayoutGraph} graph
     */
    applyLayout(graph) {
      const nodeCoordinates = graph.getDataProvider(NODE_COORDINATES_DP_KEY)
      if (nodeCoordinates !== null) {
        graph.nodes.forEach(node => {
          const coordinates = nodeCoordinates.get(node)
          if (coordinates !== null) {
            graph.setLocation(node, coordinates.x, coordinates.y)
          }
        })
      }

      const edgeCoordinates = graph.getDataProvider(EDGE_COORDINATES_DP_KEY)
      if (edgeCoordinates !== null) {
        graph.edges.forEach(edge => {
          const path = edgeCoordinates.get(edge)
          if (path !== null) {
            if (path.length() > 0) {
              graph.setPoints(edge, path)
            } else {
              yfiles.layout.LayoutGraphUtilities.resetPath(graph, edge, false)
            }
          }
        })
      }

      this.applyLayoutCore(graph)
    }
  }

  return {
    NODE_COORDINATES_DP_KEY,
    EDGE_COORDINATES_DP_KEY,
    LayoutCoordinatesStage
  }
})
