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
import { HierarchicLayout, HierarchicLayoutData, IGraph } from 'yfiles'

/**
 * Creates a {@link HierarchicLayout} and the respective {@link HierarchicLayoutData} so
 * that all groups contained in the graph a treated as tabular group nodes.
 * @param {!IGraph} graph the graph to be laid out
 * @param sorted whether the tabular group child nodes should be sorted by their label text
 * @param childDistance the distance between tabular group child nodes
 * @returns {!object} the configured hierarchic layout algorithm
 * @param {boolean} [sorted=false]
 * @param {number} [childDistance=0]
 */
export function createTabularGroupsHierarchicLayout(graph, sorted = false, childDistance = 0) {
  const hl = new HierarchicLayout({
    orthogonalRouting: true,
    layoutOrientation: 'left-to-right',
    minimumLayerDistance: 50
  })

  // create a layout data
  const data = new HierarchicLayoutData()

  // defines all groups to be tabular groups
  data.tabularGroups.delegate = () => true

  // configure order of tabular group children, if desired
  if (sorted) {
    data.tabularGroupChildComparers.constant = (node1, node2) => {
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
  hl.nodeLayoutDescriptor.tabularGroupChildDistance = childDistance

  return { layout: hl, layoutData: data }
}

/**
 * Returns a {@link HierarchicLayout} with a left-to-right layout orientation.
 * @param {!IGraph} graph the graph to be laid out
 * @returns {!HierarchicLayout} the configured hierarchic layout algorithm
 */
export function createDefaultHierarchicLayout(graph) {
  return new HierarchicLayout({
    orthogonalRouting: true,
    layoutOrientation: 'left-to-right',
    minimumLayerDistance: 50
  })
}
