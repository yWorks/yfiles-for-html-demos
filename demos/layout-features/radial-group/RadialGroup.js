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
import { IGraph, RadialGroupLayout, RadialGroupLayoutData } from '@yfiles/yfiles'
/**
 * Demonstrates how to configure the {@link RadialGroupLayout} algorithm.
 * @param graph The graph to be laid out
 * @returns ({RadialGroupLayout, RadialGroupLayoutData}) the configured cactus algorithm and the corresponding layout data
 */
export function createFeatureLayoutConfiguration(graph) {
  // create the configured cactus group layout
  const layout = new RadialGroupLayout({
    // use the default group sizing policy which optimizes for compact drawings
    groupSizePolicy: 'adaptive',
    // specify that labels at leaf nodes are placed ray-like
    nodeLabelPlacement: 'ray-like-leaves',
    // increase the preferred root wedge to allow children on 200 degrees
    preferredRootSectorAngle: 200
  })
  // enable bundled edges and enable the fitting to bezier control points which in
  // conjunction with the BezierEdgeStyle generates smoother curves
  layout.edgeBundling.defaultBundleDescriptor.bundled = true
  layout.edgeBundling.defaultBundleDescriptor.bezierFitting = true
  // create the (optional) layout data and specify that parent and child nodes are allowed to
  // overlap a bit more than by default (0.2), so that the drawing becomes more compact,
  // expect for some nodes with a specific flag, we do not want to have overlaps at all
  const layoutData = new RadialGroupLayoutData()
  layoutData.parentOverlapRatios = (node) => (node.tag && node.tag.avoidParentOverlap ? 0 : 0.5)
  return { layout, layoutData }
}
