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
import {
  HierarchicLayout,
  HierarchicLayoutData,
  IEdge,
  IGraph,
  ILayoutAlgorithm,
  LayoutData
} from 'yfiles'

/**
 * Demonstrates how to run a {@link HierarchicLayout} with edge grouping.
 * @param {!IGraph} graph The graph to be laid out
 * @returns {!object} {{HierarchicLayout, HierarchicLayoutData}} the configured layout algorithm and the corresponding layout data
 */
export function createFeatureLayoutConfiguration(graph) {
  const layout = new HierarchicLayout()

  // specify an id for all edges starting in node 0
  const nodeSourceGroupId = 'node 0 source edges'

  // specify an id for all edges ending in node 5
  const nodeTargetGroupId = 'node 5 target edges'

  // use LayoutData to configure edge grouping
  const layoutData = new HierarchicLayoutData({
    //group edges at their source side if the source node's tag is '0' (equal to label in this sample)
    sourceGroupIds: edge => (edge.sourceNode.tag === 0 ? nodeSourceGroupId : null),
    //group edges at their target side if the target node's tag is '5' (equal to label in this sample)
    targetGroupIds: edge => (edge.targetNode.tag === 5 ? nodeTargetGroupId : null)
  })

  return { layout, layoutData }
}

/**
 * Demonstrates how to run a {@link HierarchicLayout} with the default configuration.
 * @param {!IGraph} graph The graph to be laid out
 * @returns {!object} {{HierarchicLayout, HierarchicLayoutData}} the configured layout algorithm and the corresponding layout data
 */
export function createDefaultLayoutConfiguration(graph) {
  const layout = new HierarchicLayout()
  const layoutData = new HierarchicLayoutData()

  return { layout, layoutData }
}
