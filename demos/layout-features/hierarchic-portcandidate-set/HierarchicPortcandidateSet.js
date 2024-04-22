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
  HierarchicLayout,
  HierarchicLayoutData,
  IGraph,
  ILayoutAlgorithm,
  LayoutData,
  PortCandidate,
  PortCandidateSet,
  PortDirections
} from 'yfiles'

/**
 * Demonstrates how to run a {@link HierarchicLayout} with a configured {@link PortCandidateSet}.
 * @param {!IGraph} graph The graph to be laid out
 * @returns {!object} {{HierarchicLayout, HierarchicLayoutData}} the configured layout algorithm and the corresponding layout data
 */
export function createFeatureLayoutConfiguration(graph) {
  const layout = new HierarchicLayout()

  // Create a PortCandidateSet
  const pcs = new PortCandidateSet()

  // Add a PortCandidate for each side of the node. Allow only one connection to each candidate.
  pcs.add(PortCandidate.createCandidate(0, 0, PortDirections.NORTH, 0), 1)
  pcs.add(PortCandidate.createCandidate(0, 0, PortDirections.SOUTH, 0), 1)
  pcs.add(PortCandidate.createCandidate(0, 0, PortDirections.EAST, 0), 1)
  pcs.add(PortCandidate.createCandidate(0, 0, PortDirections.WEST, 0), 1)

  // Only use the candidate set for node number 5.
  const layoutData = new HierarchicLayoutData({
    nodePortCandidateSets: (node) => (parseInt(node.tag) === 5 ? pcs : null)
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
