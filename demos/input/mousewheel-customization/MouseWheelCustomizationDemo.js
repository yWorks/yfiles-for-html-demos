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
  EventRecognizers,
  GraphComponent,
  GraphEditorInputMode,
  License,
  MouseWheelBehaviors,
  PointerEventArgs,
  Rect
} from '@yfiles/yfiles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-ui/finish-loading'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'

async function run() {
  License.value = await fetchLicense()

  // initialize the graph component
  const graphComponent = new GraphComponent('graphComponent')

  // Set custom style defaults that will be used for newly created graph items
  initDemoStyles(graphComponent.graph)
  // initialize the graph
  createSampleGraph(graphComponent.graph)
  initializeUI(graphComponent)

  // initialize the input mode
  graphComponent.inputMode = new GraphEditorInputMode()

  updateMouseWheelBehavior('custom', graphComponent)

  graphComponent.selection.add(graphComponent.graph.nodes.first())

  // center the graph
  void graphComponent.fitGraphBounds()
}

function updateModifiers(value, graphComponent) {
  switch (value) {
    case 'default':
      graphComponent.mouseWheelZoomEventRecognizer = EventRecognizers.CTRL_IS_DOWN
      graphComponent.horizontalScrollEventRecognizer = EventRecognizers.SHIFT_IS_DOWN
      break
    case 'alt':
      graphComponent.mouseWheelZoomEventRecognizer = EventRecognizers.ALT_IS_DOWN
      graphComponent.horizontalScrollEventRecognizer = EventRecognizers.CTRL_IS_DOWN
      break
  }
}

// a wheel event listener that resizes the selected nodes when shift and control both are pressed.
const customWheelListener = (evt, eventSource) => {
  const graphComponent = eventSource
  const graphEditorInputMode = graphComponent.inputMode
  const selectedNodes = graphComponent.selection.nodes
  if (evt.shiftKey && evt.ctrlKey) {
    // calculate the amount that the nodes need to grow, taking the mouse wheel delta into account
    const delta = evt.wheelDeltaY / 100
    let growthFactor = 1 + Math.abs(delta) * 0.2
    if (delta > 0) {
      // shrink the node
      growthFactor = 1 / growthFactor
    }

    selectedNodes.forEach((node) => {
      const oldLayout = node.layout.toRect()
      // calculate the new layout
      const newLayout = Rect.fromCenter(oldLayout.center, oldLayout.size.multiply(growthFactor))
      graphEditorInputMode.setNodeLayout(node, newLayout)
    })
    // calling preventDefault() on the event prevents the default mouse wheel behavior,
    // i.e., prevents zooming or scrolling the graph
    evt.preventDefault()
  }
}

function updateMouseWheelBehavior(value, graphComponent) {
  switch (value) {
    case 'none':
      graphComponent.mouseWheelBehavior = MouseWheelBehaviors.NONE
      graphComponent.removeEventListener('wheel', customWheelListener)
      break
    case 'zoom':
      graphComponent.mouseWheelBehavior = MouseWheelBehaviors.ZOOM
      graphComponent.removeEventListener('wheel', customWheelListener)
      break
    case 'scroll':
      graphComponent.mouseWheelBehavior = MouseWheelBehaviors.SCROLL
      graphComponent.removeEventListener('wheel', customWheelListener)
      break
    case 'both':
      graphComponent.mouseWheelBehavior = MouseWheelBehaviors.ZOOM | MouseWheelBehaviors.SCROLL
      graphComponent.removeEventListener('wheel', customWheelListener)
      break
    case 'custom':
      graphComponent.mouseWheelBehavior = MouseWheelBehaviors.ZOOM | MouseWheelBehaviors.SCROLL
      graphComponent.addEventListener('wheel', customWheelListener)
      break
  }
}

/**
 * Creates the initial sample graph.
 */
function createSampleGraph(graph) {
  graph.createNode(new Rect(100, 0, 50, 50))
  graph.createNode(new Rect(0, 0, 50, 50))
  graph.createNode(new Rect(200, 0, 50, 50))
}

/**
 * Wires up the toolbar UI elements.
 */
function initializeUI(graphComponent) {
  const modifiersSelect = document.querySelector('#modifiers-select')
  modifiersSelect.addEventListener('change', () => {
    updateModifiers(modifiersSelect.value, graphComponent)
  })
  const wheelBehaviorSelect = document.querySelector('#wheel-behavior-select')
  wheelBehaviorSelect.addEventListener('change', () => {
    updateMouseWheelBehavior(wheelBehaviorSelect.value, graphComponent)
  })
  const scrollFactorInput = document.querySelector('#scroll-factor-input')
  scrollFactorInput.addEventListener('change', () => {
    graphComponent.mouseWheelScrollFactor = Number.parseFloat(scrollFactorInput.value)
  })
  const zoomFactorInput = document.querySelector('#zoom-factor-input')
  zoomFactorInput.addEventListener('change', () => {
    graphComponent.mouseWheelZoomFactor = Number.parseFloat(zoomFactorInput.value)
  })
}

run().then(finishLoading)
