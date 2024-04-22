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
import type { ILayoutAlgorithm, LayoutData } from 'yfiles'
import {
  CompactDiskLayout,
  CompactDiskLayoutData,
  IGraph,
  OrganicLayout,
  RecursiveGroupLayout,
  RecursiveGroupLayoutData
} from 'yfiles'

/**
 * Demonstrates how to configure the {@link CompactDiskLayout} algorithm in conjunction with the
 * {@link RecursiveGroupLayout} and {@link OrganicLayout} to arrange the group node children in a
 * compact, circular way.
 * @param graph The graph to be laid out
 * @returns ({CompactDiskLayout, CompactDiskLayoutData}) the configured compact disk algorithm and the corresponding layout data
 */
export function createFeatureLayoutConfiguration(graph: IGraph): {
  layout: ILayoutAlgorithm
  layoutData: LayoutData
} {
  // create the compact disk layout responsible for group node contents
  const compactDiskLayout = new CompactDiskLayout({
    // add a little extra distance between nodes
    minimumNodeDistance: 4
  })

  // create the (optional) layout data to configure node types
  const compactDiskData = new CompactDiskLayoutData()
  // the node types are taken from an optional nodeType property on the node's tag
  compactDiskData.nodeTypes.delegate = (node) => (node.tag ? node.tag.nodeType : null)

  // create a recursive layout that will apply the compact disk layout to each grouping
  // hierarchy independently
  const recursiveGroupLayout = new RecursiveGroupLayout({
    coreLayout: new OrganicLayout({
      deterministic: true,
      minimumNodeDistance: 20
    })
  })

  // use the recursive group layout data to define that the content of each group node should
  // be arranged using the CompactDiskLayout algorithm configured above
  const recursiveLayoutData = new RecursiveGroupLayoutData()
  recursiveLayoutData.groupNodeLayouts.constant = compactDiskLayout

  return {
    layout: recursiveGroupLayout,
    layoutData: compactDiskData.combineWith(recursiveLayoutData)
  }
}
