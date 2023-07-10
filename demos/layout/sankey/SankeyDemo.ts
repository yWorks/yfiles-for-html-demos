/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
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
import { GraphBuilder, GraphComponent, License } from 'yfiles'

import { electionData } from './resources/samples'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import type { VoterShift } from './data-types'
import { initializeDefaultStyles, updateAdjacentEdges } from './styles-support'
import { configureInteraction } from './interaction/configure-interaction'
import { initializeNodePopup } from './node-popup'
import { initializeHighlight } from './interaction/configure-highlight'
import { getThickness } from './edge-thickness'
import { updateStylesAndLayout } from './sankey-layout'
import { allowOnlyVerticalNodeMovement } from './interaction/constrain-node-movement'
import { applyDemoTheme } from 'demo-resources/demo-styles'

async function run(): Promise<void> {
  License.value = await fetchLicense()
  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  // set default styles for nodes, edges and edge labels
  initializeDefaultStyles(graphComponent)

  // initializes and configures the interaction for this demo
  configureInteraction(graphComponent)

  // constrain the node movement only along the y-axis
  allowOnlyVerticalNodeMovement(graphComponent.graph)

  // sets the highlighting style for the edges and edge labels, and
  // configures the highlighting behavior
  initializeHighlight(graphComponent)

  // adds a popup on node click that allows changing the node's color
  initializeNodePopup(graphComponent)

  // enables the undo engine to revert graph changes
  graphComponent.graph.undoEngineEnabled = true

  // builds the graph from the given dataset
  await buildGraph(graphComponent)

  initializeUI(graphComponent)
}

/**
 * Creates the sample graph.
 */
async function buildGraph(graphComponent: GraphComponent): Promise<void> {
  const graph = graphComponent.graph
  const builder = new GraphBuilder(graph)

  // create the graph nodes
  builder.createNodesSource({
    data: electionData.parties,
    id: 'id',
    labels: ['name']
  })

  // create the graph edges and assign the thickness to the edge's data
  builder.createEdgesSource({
    data: electionData.voterShift,
    sourceId: 'source',
    targetId: 'target',
    labels: ['voters'],
    tag: (data: VoterShift) => {
      return { ...data, thickness: getThickness(data.voters) }
    }
  })

  builder.buildGraph()

  // update the node and edge style based on the desired colors and thickness and run a layout
  await updateStylesAndLayout(graphComponent, false)

  // clear the undo engine
  graphComponent.graph.undoEngine!.clear()
}

/**
 * Binds actions to the toolbar elements.
 */
function initializeUI(graphComponent: GraphComponent): void {
  document
    .querySelector<HTMLSelectElement>('#colorDirection')!
    .addEventListener('change', (): void => {
      const graph = graphComponent.graph
      for (const node of graph.nodes) {
        updateAdjacentEdges(node, graph)
      }
      graphComponent.invalidate()
    })
}

void run().then(finishLoading)
