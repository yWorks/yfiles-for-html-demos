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
import { HierarchicalLayout, HierarchicalLayoutData } from '@yfiles/yfiles'
/**
 * Creates a {@link HierarchicalLayout} and the respective {@link HierarchicalLayoutData} so
 * that all groups contained in the graph a treated as tabular group nodes.
 * @param sorted whether the tabular group child nodes should be sorted by their label text
 * @param childDistance the distance between tabular group child nodes
 * @returns the configured hierarchical layout algorithm
 */
export function createTabularGroupsHierarchicalLayout(sorted = false, childDistance = 0) {
  const hl = new HierarchicalLayout({
    layoutOrientation: 'left-to-right',
    minimumLayerDistance: 50
  })
  // create a layout data
  const data = new HierarchicalLayoutData()
  // defines all groups to be tabular groups
  data.tabularGroups = () => true
  // configure order of tabular group children, if desired
  if (sorted) {
    data.tabularGroupChildComparators.constant = (node1, node2) => {
      const label1 = node1.labels.at(0)
      const label2 = node2.labels.at(0)
      if (label1 && label2) {
        // compare label text (invert comparison because left-to-right layout has node sequence
        // inside a layer ordered from bottom to top)
        return -label1.text.localeCompare(label2.text)
      }
      return 0
    }
  }
  // specify the distance between tabular group child nodes
  hl.defaultNodeDescriptor.tabularGroupChildDistance = childDistance
  return { layout: hl, layoutData: data }
}
/**
 * Returns a {@link HierarchicalLayout} with a left-to-right layout orientation.
 * @returns the configured hierarchical layout algorithm
 */
export function createDefaultHierarchicalLayout() {
  return new HierarchicalLayout({
    layoutOrientation: 'left-to-right',
    minimumLayerDistance: 50
  })
}
