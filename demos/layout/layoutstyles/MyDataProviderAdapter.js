/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { CopiedLayoutGraph, DataProviderBase, IEdgeLabelLayout, INodeLabelLayout } from 'yfiles'

export default class MyDataProviderAdapter extends DataProviderBase {
  constructor(selectedLabelsAtItemProvider, layoutGraph) {
    super()
    this.$selectedLabelsAtItemProvider = selectedLabelsAtItemProvider
    this.$layoutGraph = layoutGraph
  }

  /** @return {boolean} */
  getBoolean(dataHolder) {
    if (INodeLabelLayout.isInstance(dataHolder)) {
      const node = this.$layoutGraph.getOwnerNode(dataHolder)
      if (this.$layoutGraph instanceof CopiedLayoutGraph) {
        const selectedLabels = this.$selectedLabelsAtItemProvider.get(node)
        if (selectedLabels !== null) {
          const nodeLabelLayouts = this.$layoutGraph.getLabelLayout(node)
          for (let i = 0; i < nodeLabelLayouts.length; i++) {
            const nodeLabelLayout = nodeLabelLayouts[i]
            if (nodeLabelLayout === dataHolder && selectedLabels.length > i) {
              return selectedLabels[i]
            }
          }
        }
      }
    } else if (IEdgeLabelLayout.isInstance(dataHolder)) {
      const edge = this.$layoutGraph.getOwnerEdge(dataHolder)
      if (this.$layoutGraph instanceof CopiedLayoutGraph) {
        const selectedLabels = this.$selectedLabelsAtItemProvider.get(edge)
        if (selectedLabels !== null) {
          const edgeLabelLayouts = this.$layoutGraph.getLabelLayout(edge)
          for (let i = 0; i < edgeLabelLayouts.length; i++) {
            const edgeLabelLayout = edgeLabelLayouts[i]
            if (edgeLabelLayout === dataHolder && selectedLabels.length > i) {
              return selectedLabels[i]
            }
          }
        }
      }
    }
    return false
  }
}
