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
import {
  DefaultLabelStyle,
  GraphComponent,
  GraphViewerInputMode,
  INode,
  InteriorStretchLabelModel,
  License,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  Size,
  TimeSpan
} from 'yfiles'
import { AnimationController } from './AnimationController.js'
import { ProcessingStepNodeStyleDecorator } from './ProcessingStepNodeStyleDecorator.js'
import { addHeatmap } from './process-visualization/heatmap.js'
import {
  extractGraph,
  getProcessStepData,
  getProcessTransitionData
} from './process-graph-extraction.js'
import { installProcessItemVisual, updateTime } from './process-visualization/ProcessItemVisual.js'
import { createSimulatedEventLog } from './simulation/simulator.js'
import { fetchLicense } from 'demo-resources/fetch-license'
import { checkWebGLSupport, finishLoading } from 'demo-resources/demo-page'
import { prepareProcessVisualization } from './process-visualization/process-visualization.js'
import { applyDemoTheme } from 'demo-resources/demo-styles'

/**
 * Initializes the graph and wires up the UI
 * @returns {!Promise}
 */
async function run() {
  if (!checkWebGLSupport()) {
    // only a warning is shown in the demo
    return
  }
  License.value = await fetchLicense()

  // stores the current time value in the animation
  let time = 0

  // this function provides the heat for a node or edge at a specific time
  // it is used to update the heat map or the node decoration
  const getHeat = item => {
    // we define the heat as the ratio of the current heat value to the item's capacity,
    // but not more than 1
    const data = item instanceof INode ? getProcessStepData(item) : getProcessTransitionData(item)
    return Math.min(1, data.heat.getValue(time) / data.capacity)
  }

  // create a GraphComponent
  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // create an input mode
  graphComponent.inputMode = new GraphViewerInputMode()

  // create and configure a default node and edge styles style
  const graph = graphComponent.graph
  initializeDemoStyles(graph, getHeat)

  // add the item visual to be able to render dots for the traversing events
  installProcessItemVisual(graphComponent)

  // run the simulation to create a random event log
  // this line can be replaced with the import of a custom event log
  const eventLog = createSimulatedEventLog()

  // extract a graph from the event log
  extractGraph(eventLog, graphComponent)

  // augment the graph with information about heat and traversing events
  const maxTime = prepareProcessVisualization(graph, eventLog)

  // add a heatmap visualization
  addHeatmap(graphComponent, getHeat)

  // wire up the controls
  const progressInput = document.querySelector('#progress')
  const restartAnimationButton = document.querySelector('#restart-animation')

  /**
   * Callback function to transfer the progress to the visuals and the toolbar slider
   */
  function setProgress(progress) {
    time = progress * maxTime
    updateTime(progress * maxTime)
    progressInput.value = String(progress * 100)
  }

  // initialize the animation and controls
  const animationController = new AnimationController(
    graphComponent,
    TimeSpan.fromSeconds(maxTime),
    setProgress
  )

  // set up the remainder of the UI
  progressInput.addEventListener('change', () => {
    if (!animationController.running) {
      setProgress(Number(progressInput.value) / 100)
      graphComponent.invalidate()
    }
  })
  restartAnimationButton.addEventListener('click', () => animationController.restartAnimation())

  // and start the playback of the simulation
  void animationController.runAnimation()
}

/**
 * Sets default styles for nodes and edges.
 * @param {!IGraph} graph the current graph
 * @param {!function} getHeat a head function that is used in the node visualization
 */
function initializeDemoStyles(graph, getHeat) {
  // Helper function to quantize a value to multiples of 1/30th.
  function quantize(value) {
    return Math.floor(value * 30) / 30
  }

  graph.nodeDefaults.style = new ProcessingStepNodeStyleDecorator(
    new ShapeNodeStyle({ fill: '#494949', stroke: 'none' }),
    node => quantize(getHeat(node))
  )
  graph.nodeDefaults.size = new Size(150, 30)
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    textFill: '#d0d0d0',
    verticalTextAlignment: 'center',
    insets: { top: 0, right: 0, bottom: 0, left: 35 }
  })
  graph.nodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.CENTER

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px solid #33a',
    targetArrow: '#33a triangle',
    smoothingLength: 10
  })
}

void run().then(finishLoading)
