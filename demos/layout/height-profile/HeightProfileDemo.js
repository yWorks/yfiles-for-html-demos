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
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  LayoutExecutor,
  License
} from '@yfiles/yfiles'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'
import { configureLayout } from './configure-layout'
import { initializeStyles } from './styles'
import { scaleData } from './scale-data'
import { drawTrekkingTrail } from './draw-trekking-trail'
import { drawAxis } from './draw-axis'
import { initializeGraph } from './create-graph'
import { configureHighlight } from './configure-highlight'
import { nodeData } from './resources/TrekkingData'

async function run() {
  License.value = licenseData

  const graphComponent = new GraphComponent('#graphComponent')
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
 */
async function runLayout(graphComponent) {
  // Ensure that the LayoutExecutor class is not removed by build optimizers
  // It is needed for the 'applyLayoutAnimated' method in this demo.
  LayoutExecutor.ensure()

  const { layout, layoutData } = configureLayout(graphComponent.graph)
  graphComponent.graph.applyLayout(layout, layoutData)

  await graphComponent.fitGraphBounds()
}

void run().then(finishLoading)
