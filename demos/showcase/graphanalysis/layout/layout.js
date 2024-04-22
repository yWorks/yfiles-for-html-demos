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
  ComponentArrangementStyles,
  GenericLabeling,
  LabelingData,
  OrganicLayout,
  OrganicLayoutData,
  OrganicLayoutScope,
  PreferredPlacementDescriptor
} from 'yfiles'
import { setUIDisabled } from '../ui/ui-utils.js'
import { CentralityStage } from './CentralityStage.js'

/**
 * Runs a layout algorithm which calculates new positions and sizes for nodes, edges, and labels.
 * @param {!GraphComponent} graphComponent the graph component containing the current graph
 * @param animated whether to morph the positions of the nodes
 * @param affectedNodes A list of nodes that are incrementally included in the layout
 * @param {boolean} [animated=false]
 * @param {!Array.<INode>} [affectedNodes]
 * @returns {!Promise}
 */
export async function runLayout(graphComponent, animated = false, affectedNodes) {
  const { layout, layoutData } = getOrganicLayoutConfiguration(affectedNodes)

  setUIDisabled(true, graphComponent)
  await graphComponent.morphLayout(layout, animated ? '0.5s' : '0s', layoutData)
  setUIDisabled(false, graphComponent)
}

/**
 * Returns a configuration of organic layout that considers centrality results and labels.
 * @param affectedNodes A list of affected nodes. If it is defined, the layout only runs on a subset of nodes.
 * @param {!Array.<INode>} [affectedNodes]
 * @returns {!object}
 */
function getOrganicLayoutConfiguration(affectedNodes) {
  const organicLayout = new OrganicLayout({
    deterministic: true,
    considerNodeSizes: true,
    scope: affectedNodes ? OrganicLayoutScope.MAINLY_SUBSET : OrganicLayoutScope.ALL,
    labelingEnabled: true,
    labeling: new GenericLabeling({
      placeEdgeLabels: true,
      placeNodeLabels: false,
      deterministic: true
    })
  })
  organicLayout.componentLayout.style =
    ComponentArrangementStyles.NONE | ComponentArrangementStyles.MODIFIER_NO_OVERLAP

  organicLayout.prependStage(new CentralityStage(organicLayout))

  const organicLayoutData = new OrganicLayoutData({
    preferredEdgeLengths: (edge) =>
      edge.labels.reduce((width, label) => {
        return Math.max(label.layout.width + 50, width)
      }, 100),
    minimumNodeDistances: 30,
    affectedNodes: affectedNodes
  })

  const labelingData = new LabelingData({
    edgeLabelPreferredPlacement: (label) => {
      return new PreferredPlacementDescriptor({
        sideOfEdge: label.tag === 'centrality' ? 'on-edge' : 'left-of-edge',
        distanceToEdge: 5
      })
    }
  })

  return { layout: organicLayout, layoutData: organicLayoutData.combineWith(labelingData) }
}
