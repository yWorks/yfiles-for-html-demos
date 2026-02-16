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
  type ClickEventArgs,
  GraphComponent,
  GraphViewerInputMode,
  type IEdge,
  type IGraph,
  INode,
  LabelStyle,
  License,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  Size,
  StretchNodeLabelModel,
  TimeSpan
} from '@yfiles/yfiles'
import { AnimationController } from './AnimationController'
import { ProcessingStepNodeStyleDecorator } from './ProcessingStepNodeStyleDecorator'
import { addHeatmap } from './process-visualization/heatmap'
import {
  extractGraph,
  getProcessStepData,
  getProcessTransitionData
} from './process-graph-extraction'
import {
  installProcessItemVisual,
  type ProcessItemVisual,
  updateTime
} from './process-visualization/ProcessItemVisual'
import licenseData from '../../../lib/license.json'
import { checkWebGLSupport, finishLoading } from '@yfiles/demo-app/demo-page'
import { prepareProcessVisualization } from './process-visualization/process-visualization'
import { showItemOverlay } from './item-overlay'
import eventLog from './data/events.json'
import caseData from './data/cases.json'

let processItemVisual: ProcessItemVisual

let infiniteLoopEnabled: boolean = false

let graphComponent: GraphComponent

/**
 * Initializes the graph and wires up the UI
 */
async function run(): Promise<void> {
  if (!checkWebGLSupport()) {
    // only a warning is shown in the demo
    return
  }
  License.value = licenseData

  // stores the current time value in the animation
  let time = 0

  // this function provides the heat for a node or edge at a specific time
  // it is used to update the heat map or the node decoration
  const getHeat = (item: INode | IEdge): number => {
    // we define the heat as the ratio of the current heat value to the item's capacity,
    // but not more than 1
    const data = item instanceof INode ? getProcessStepData(item) : getProcessTransitionData(item)
    return Math.min(1, data.heat.getValue(time) / data.capacity)
  }

  graphComponent = new GraphComponent('#graphComponent')
  const inputMode = new GraphViewerInputMode()
  inputMode.addEventListener('item-clicked', graphClickListener)
  inputMode.addEventListener('canvas-clicked', graphClickListener)
  graphComponent.inputMode = inputMode

  const graph = graphComponent.graph
  initializeDemoStyles(graph, getHeat)

  extractGraph(eventLog, graphComponent)

  // add the item visual to be able to render dots for the traversing events
  processItemVisual = installProcessItemVisual(graphComponent)

  // augment the graph with information about heat and traversing events
  const maxTime = prepareProcessVisualization(graph, eventLog)

  // add a heatmap visualization
  addHeatmap(graphComponent, getHeat)

  // wire up the controls
  const progressInput = document.querySelector<HTMLInputElement>('#progress')!
  const animationControlButton = document.querySelector<HTMLButtonElement>('#animation-control')!
  const infiniteLoopButton = document.querySelector<HTMLButtonElement>('#infinite-loop')!

  const timeToSliderValue = (time: number) => (time / maxTime) * 100
  const sliderValueToTime = (value: string) => (Number(value) * maxTime) / 100

  // callback function passed to the animation controller to transfer the animation progress to the visuals and the toolbar slider
  function setProgress(timeStamp: number): void {
    time = timeStamp
    updateTime(time)
    progressInput.value = String(timeToSliderValue(time))
    updateProgressBarBackground()

    // animation has finished but infinite loop button is enabled -> automatic restart
    if (infiniteLoopEnabled && time === maxTime) {
      progressInput.classList.add('hide-thumb')
      setSingleCssClass(animationControlButton, 'demo-icon-yIconPause')
      // wait for animation's last tick to complete
      setTimeout(() => animationController.startAnimation(0))
    }
    // animation has finished -> no automatic restart, enable slider
    else if (time === maxTime) {
      progressInput.classList.remove('hide-thumb')
      setSingleCssClass(animationControlButton, 'demo-icon-yIconReload')
    }
    // animation still running
    else {
      progressInput.classList.add('hide-thumb')
    }
  }

  // initialize the animation and controls
  const animationController = new AnimationController(
    graphComponent,
    TimeSpan.fromSeconds(maxTime),
    setProgress
  )

  // set up the remainder of the UI
  progressInput.addEventListener('change', () => {
    if (animationController.running) return
    time = sliderValueToTime(progressInput.value)
    updateTime(time)
    updateProgressBarBackground()
    graphComponent.invalidate()
    if (Number(progressInput.value) < 100) {
      setSingleCssClass(animationControlButton, 'demo-icon-yIconPlay')
    }
  })

  animationControlButton.addEventListener('click', () => {
    if (animationController.running) {
      animationController.stopAnimation()
      progressInput.classList.remove('hide-thumb')
      setSingleCssClass(animationControlButton, 'demo-icon-yIconPlay')
    } else if (Number(progressInput.value) === 100) {
      animationController.startAnimation(0)
      setSingleCssClass(animationControlButton, 'demo-icon-yIconPause')
    } else {
      animationController.startAnimation(sliderValueToTime(progressInput.value))
      setSingleCssClass(animationControlButton, 'demo-icon-yIconPause')
    }
  })

  infiniteLoopButton.addEventListener('click', () => {
    if (infiniteLoopEnabled) {
      infiniteLoopEnabled = false
      infiniteLoopButton.classList.remove('infinite-loop-button-enabled')
      infiniteLoopButton.textContent = 'Enable infinite loop'
    } else {
      infiniteLoopEnabled = true
      infiniteLoopButton.classList.add('infinite-loop-button-enabled')
      infiniteLoopButton.textContent = 'Infinite loop enabled'
    }
  })

  function updateProgressBarBackground() {
    const value = parseFloat(progressInput.value)
    const min = parseFloat(progressInput.min)
    const max = parseFloat(progressInput.max)
    if (isNaN(value) || isNaN(min) || isNaN(max) || max === min) return
    const val = ((value - min) / (max - min)) * 100
    progressInput.style.setProperty('--val', `${val}`)
  }

  updateProgressBarBackground()
  progressInput.classList.add('hide-thumb')

  // start the simulation the first from the start or something
  void animationController.startAnimation(0)
}

/**
 * Sets default styles for nodes and edges.
 * @param graph the current graph
 * @param getHeat a head function that is used in the node visualization
 */
function initializeDemoStyles(graph: IGraph, getHeat: (node: INode) => number): void {
  // Helper function to quantize a value to multiples of 1/30th.
  function quantize(value: number): number {
    return Math.floor(value * 30) / 30
  }

  graph.nodeDefaults.style = new ProcessingStepNodeStyleDecorator(
    new ShapeNodeStyle({ shape: 'round-rectangle', cssClass: 'process-step-node' }),
    (node) => quantize(getHeat(node))
  )
  graph.nodeDefaults.size = new Size(150, 30)
  graph.nodeDefaults.labels.style = new LabelStyle({
    textFill: '#ffffff',
    verticalTextAlignment: 'center',
    padding: { top: 0, right: 0, bottom: 0, left: 35 }
  })
  graph.nodeDefaults.labels.layoutParameter = new StretchNodeLabelModel().createParameter('center')

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px solid #343e49',
    targetArrow: '#343e49 triangle',
    smoothingLength: 10
  })
}

/**
 * Finds all items that are within the mouse click area and display their info as a graph overlay.
 */
function graphClickListener(evt: ClickEventArgs) {
  const clickedEntries = processItemVisual.getEntriesAtLocation(evt.location)
  const viewCoordinates = graphComponent.worldToViewCoordinates([evt.location.x, evt.location.y])
  showItemOverlay(clickedEntries, viewCoordinates, caseData)
}

function setSingleCssClass(element: HTMLElement, cssClass: string): void {
  element.classList.remove(...element.classList)
  element.classList.add(cssClass)
}

run().then(finishLoading)
