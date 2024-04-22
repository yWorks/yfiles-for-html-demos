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
import { GraphComponent, GraphItemTypes, GraphViewerInputMode, Insets, License } from 'yfiles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import { configureLayout } from './configure-layout.js'
import { initializeStyles } from './styles.js'
import { SCALED_MAX_Y, scaleData } from './scale-data.js'
import { drawTrekkingTrail } from './draw-trekking-trail.js'
import { drawAxis } from './draw-axis.js'
import { initializeGraph } from './create-graph.js'
import { configureHighlight } from './configure-highlight.js'
import { nodeData } from './resources/TrekkingData.js'
import { applyDemoTheme } from 'demo-resources/demo-styles'

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // configure user interaction, disable selection and focus
  graphComponent.inputMode = new GraphViewerInputMode({
    selectableItems: GraphItemTypes.NONE,
    focusableItems: GraphItemTypes.NONE
  })

  // assign the default style and size for the waypoints
  initializeStyles(graphComponent.graph)

  // configure highlights for hovered nodes
  configureHighlight(graphComponent)

  // scale the data and draw the trekking trail and the axis
  const originalTrail = nodeData.trail
  const scaledTrail = scaleData(originalTrail)
  drawTrekkingTrail(graphComponent, scaledTrail)
  drawAxis(graphComponent, originalTrail)

  // read the waypoints from the dataset and creates the associated label nodes
  initializeGraph(graphComponent)

  // configure and run an OrganicLayout with the constraints for aligning waypoints and their
  // associated labels
  void runLayout(graphComponent)
}

/**
 * Runs the {@link OrganicLayout} with the necessary constraints to obtain a height profile visualization.
 * @param {!GraphComponent} graphComponent
 * @returns {!Promise}
 */
async function runLayout(graphComponent) {
  const graph = graphComponent.graph
  const { layout, layoutData } = configureLayout(graph)
  graph.applyLayout(layout, layoutData)

  graphComponent.fitGraphBounds()
}

void run().then(finishLoading)
