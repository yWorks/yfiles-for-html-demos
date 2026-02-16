/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EdgePortCandidates,
  EdgeRouter,
  EdgeRouterData,
  HierarchicalLayout,
  HierarchicalLayoutData,
  LayoutExecutor
} from '@yfiles/yfiles'
import { disableUIElements, enableUIElements } from '@yfiles/demo-app/demo-page'

/**
 * Applies the selected layout algorithm.
 * @param graphComponent The GraphComponent where the layout is applied to
 * @param clearUndo True if the undo engine should be cleared, false otherwise
 * @param fitBounds Whether the viewport should be adjusted to fit the graph's bounds
 */
export async function runLayout(graphComponent, clearUndo, fitBounds = true) {
  const algorithmSelect = document.querySelector('#algorithm-select-box')
  const selectedIndex = algorithmSelect.selectedIndex

  let layout
  let layoutData

  if (selectedIndex === 0) {
    layout = new HierarchicalLayout({ layoutOrientation: 'left-to-right' })
    const hierarchicalLayoutData = new HierarchicalLayoutData()
    hierarchicalLayoutData.ports.sourcePortCandidates = new EdgePortCandidates().addFixedCandidate(
      'right'
    )
    hierarchicalLayoutData.ports.targetPortCandidates = new EdgePortCandidates().addFixedCandidate(
      'left'
    )
    layoutData = hierarchicalLayoutData
  } else {
    layout = new EdgeRouter()
    const edgeRouterData = new EdgeRouterData()
    edgeRouterData.ports.sourcePortCandidates = new EdgePortCandidates().addFixedCandidate('right')
    edgeRouterData.ports.targetPortCandidates = new EdgePortCandidates().addFixedCandidate('left')
    layoutData = edgeRouterData
  }

  disableUIElements('#algorithm-select-box', '#layout-button')
  try {
    // Ensure that the LayoutExecutor class is not removed by build optimizers
    // It is needed for the 'applyLayoutAnimated' method in this demo.
    LayoutExecutor.ensure()

    await graphComponent.applyLayoutAnimated(layout, '0.5s', layoutData)
    if (fitBounds) {
      await graphComponent.fitGraphBounds()
    }
  } finally {
    enableUIElements()
    if (clearUndo) {
      graphComponent.graph.undoEngine.clear()
    }
  }
}
