/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { ILayoutAlgorithm, LayoutGraph, LayoutGraphUtilities, LayoutStageBase, Point } from 'yfiles'

/**
 * A layout stage that centers the graph around the given center point.
 * It is applied to center the layout inside the viewport without changing the viewport of the graph component.
 */
export default class CenterGraphStage extends LayoutStageBase {
  /**
   * Creates a new instance with a center point.
   * @param {!ILayoutAlgorithm} coreLayout
   * @param {!Point} centerPoint
   */
  constructor(coreLayout, centerPoint) {
    super(coreLayout)
    this.centerPoint = centerPoint
  }

  /**
   * Centers the graph after calculating the core layout.
   * @param {!LayoutGraph} graph
   */
  applyLayout(graph) {
    this.applyLayoutCore(graph)

    const bounds = LayoutGraphUtilities.getBoundingBoxOfNodes(graph, graph.getNodeCursor())
    LayoutGraphUtilities.moveSubgraph(
      graph,
      graph.getNodeCursor(),
      this.centerPoint.x - bounds.centerX,
      this.centerPoint.y - bounds.centerY
    )
  }
}
