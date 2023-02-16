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
  HierarchicLayout,
  IGraph,
  ILayoutAlgorithm,
  INode,
  ItemMapping,
  LayoutData,
  Mapper,
  OrganicLayout,
  RadialLayout,
  RecursiveGroupLayout,
  RecursiveGroupLayoutData
} from 'yfiles'

/**
 * Demonstrates how to run a {@link RecursiveGroupLayout} with different layouts for the group nodes.
 * @param {!IGraph} graph The graph to be laid out
 * @returns {!object} {{RecursiveGroupLayout, RecursiveGroupLayoutData}} the configured layout algorithm and the corresponding layout data
 */
export function createFeatureLayoutConfiguration(graph) {
  // gets the group nodes
  const groupNode1 = graph.nodes.find(node => node.tag === 'Group 1')
  const groupNode2 = graph.nodes.find(node => node.tag === 'Group 2')
  const groupNode3 = graph.nodes.find(node => node.tag === 'Group 3')
  const groupNode4 = graph.nodes.find(node => node.tag === 'Group 4')

  // the RecursiveGroupLayout can use a core layout algorithm to arrange the top level hierarchy
  const coreLayout = new HierarchicLayout()
  const layout = new RecursiveGroupLayout({
    coreLayout
  })

  // assign a layout algorithm to each group node
  const mapper = new Mapper()
  mapper.set(groupNode1, new HierarchicLayout())
  mapper.set(groupNode2, new OrganicLayout({ minimumNodeDistance: 75 }))
  mapper.set(groupNode3, new RadialLayout())
  // Do not layout the children of group node 4, as they have
  // configured layout values.
  mapper.set(groupNode4, RecursiveGroupLayout.NULL_LAYOUT)
  // Alternatively, we could also set the default value of the mapper to NULL_LAYOUT
  // mapper.defaultValue = RecursiveGroupLayout.NULL_LAYOUT

  const layoutData = new RecursiveGroupLayoutData({
    groupNodeLayouts: ItemMapping.from(mapper)
  })

  return { layout, layoutData }
}
