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
import {
  ComponentArrangementStyle,
  EdgeLabelPreferredPlacement,
  GenericLabelingData,
  type GraphComponent,
  type ILayoutAlgorithm,
  type INode,
  type LayoutData,
  OrganicLayout,
  OrganicLayoutData,
  OrganicScope
} from '@yfiles/yfiles'
import { setUIDisabled } from '../ui/ui-utils'
import { CentralityStage } from './CentralityStage'

/**
 * Runs a layout algorithm which calculates new positions and sizes for nodes, edges, and labels.
 * @param graphComponent the graph component containing the current graph
 * @param animated whether to morph the positions of the nodes
 * @param affectedNodes A list of nodes that are incrementally included in the layout
 */
export async function runLayout(
  graphComponent: GraphComponent,
  animated = false,
  affectedNodes?: INode[]
): Promise<void> {
  const { layout, layoutData } = getOrganicLayoutConfiguration(affectedNodes)

  setUIDisabled(true, graphComponent)
  await graphComponent.applyLayoutAnimated(layout, animated ? '0.5s' : '0s', layoutData)
  setUIDisabled(false, graphComponent)
}

/**
 * Returns a configuration of organic layout that considers centrality results and labels.
 * @param affectedNodes A list of affected nodes. If it is defined, the layout only runs on a subset of nodes.
 */
function getOrganicLayoutConfiguration(affectedNodes?: INode[] | undefined): {
  layout: ILayoutAlgorithm
  layoutData: LayoutData
} {
  const organicLayout: OrganicLayout = new OrganicLayout({
    deterministic: true,
    componentLayout: { style: ComponentArrangementStyle.TRY_KEEP_CENTERS },
    genericLabeling: { enabled: true, scope: 'edge-labels', deterministic: true }
  })
  organicLayout.layoutStages.prepend(new CentralityStage(organicLayout))

  const organicLayoutData = new OrganicLayoutData({
    preferredEdgeLengths: (edge) =>
      edge.labels.reduce((width, label) => {
        return Math.max(label.layout.width + 50, width)
      }, 100),
    minimumNodeDistances: 30
  })
  if (affectedNodes) {
    organicLayoutData.scope.scopeModes = (node) => {
      return affectedNodes.includes(node)
        ? OrganicScope.INCLUDE_EXTENDED_NEIGHBORHOOD
        : OrganicScope.FIXED
    }
  }

  const labelingData = new GenericLabelingData({
    edgeLabelPreferredPlacements: (label): EdgeLabelPreferredPlacement => {
      return new EdgeLabelPreferredPlacement({
        edgeSide: label.tag === 'centrality' ? 'on-edge' : 'left-of-edge',
        distanceToEdge: 5
      })
    }
  })

  return { layout: organicLayout, layoutData: organicLayoutData.combineWith(labelingData) }
}
