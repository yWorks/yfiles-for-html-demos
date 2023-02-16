/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  GroupCompactionPolicy,
  HierarchicLayout,
  IGraph,
  ILayoutAlgorithm,
  SimplexNodePlacer
} from 'yfiles'

/**
 * Demonstrates how to configure a left-to-right {@link HierarchicLayout} such that it
 * yields maximally compact group nodes.
 * @param graph The graph to be laid out
 * @returns the configured hierarchic layout algorithm
 */
export function createFeatureLayoutConfiguration(graph: IGraph): ILayoutAlgorithm {
  const hl = new HierarchicLayout({
    // recursively layer group nodes...
    recursiveGroupLayering: true,
    // the layering should try to keep the layer span of a group node low (the layer span is the
    // group width in a left-to-right layout)
    compactGroups: true,
    // reduce the node to node distance (affects only nodes on the same layer)
    nodeToNodeDistance: 10,
    // orthogonal routing reduces the space required for edges with bends when compared to
    // hierarchic layout's default polyline edge routing
    orthogonalRouting: true,
    layoutOrientation: 'left-to-right'
  })

  // get the SimplexNodePlacer which is the default placer configured on the hierarchic layout
  const simplex = hl.nodePlacer as SimplexNodePlacer

  // enable the maximal horizontal compaction strategy ...
  // (horizontal compaction means smaller group height in left-to-right layout)
  simplex.groupCompactionStrategy = GroupCompactionPolicy.MAXIMAL
  // ... and disable the reduction of bends such that compactness has priority over bend reduction
  simplex.bendReduction = false

  return hl
}

/**
 * Demonstrates how to run a left-to-right {@link HierarchicLayout} with the default configuration.
 * @param graph The graph to be laid out
 * @returns the configured hierarchic layout algorithm
 */
export function createDefaultLayoutConfiguration(graph: IGraph): ILayoutAlgorithm {
  return new HierarchicLayout({
    recursiveGroupLayering: true,
    orthogonalRouting: true,
    layoutOrientation: 'left-to-right'
  })
}
