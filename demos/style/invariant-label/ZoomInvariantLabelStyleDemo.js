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
  FreeEdgeLabelModel,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  IGraph,
  ILabelStyle,
  License,
  Rect,
  Size
} from 'yfiles'
import {
  FitOwnerLabelStyle,
  ZoomInvariantAboveThresholdLabelStyle,
  ZoomInvariantBelowThresholdLabelStyle,
  ZoomInvariantLabelStyleBase,
  ZoomInvariantOutsideRangeLabelStyle
} from './ZoomInvariantLabelStyle.js'
import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { addNavigationButtons, addOptions, finishLoading } from 'demo-resources/demo-page'

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  graphComponent.inputMode = new GraphViewerInputMode({
    selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.LABEL
  })

  initDemoStyles(graphComponent.graph)

  // Instances of {@link ZoomInvariantLabelStyleBase} should not be shared
  graphComponent.graph.nodeDefaults.labels.shareStyleInstance = false
  graphComponent.graph.edgeDefaults.labels.shareStyleInstance = false

  // For the general appearance of a label, we use the common demo defaults set above
  const baseLabelStyle = graphComponent.graph.nodeDefaults.labels.style

  // Initially, use FIXED_BELOW_THRESHOLD mode
  setLabelStyle(graphComponent.graph, 'FIXED_BELOW_THRESHOLD', baseLabelStyle)

  createGraph(graphComponent.graph)
  graphComponent.fitGraphBounds()

  initializeUI(graphComponent)
}

/**
 * Sets a new label style for the given mode to all labels in the graph.
 * @param {!IGraph} graph The graph.
 * @param {!string} mode The label style mode.
 * @param baseLabelStyle An optional base label style. If not provided, the graph defaults are used.
 * @param {?ILabelStyle} [baseLabelStyle=null]
 */
function setLabelStyle(graph, mode, baseLabelStyle = null) {
  const innerLabelStyle =
    baseLabelStyle ??
    graph.nodeDefaults.labels.style.innerLabelStyle ??
    graph.nodeDefaults.labels.style
  graph.nodeDefaults.labels.style = createLabelStyle(mode, innerLabelStyle)
  graph.edgeDefaults.labels.style = createLabelStyle(mode, innerLabelStyle)
  for (const label of graph.labels) {
    graph.setStyle(label, createLabelStyle(mode, innerLabelStyle))
  }
}

/**
 * Creates a new label style for the given mode and base style.
 * @param {!string} mode
 * @param {!ILabelStyle} baseLabelStyle
 */
function createLabelStyle(mode, baseLabelStyle) {
  if (mode === 'FIXED_ABOVE_THRESHOLD') {
    return new ZoomInvariantAboveThresholdLabelStyle(baseLabelStyle, 1)
  } else if (mode === 'FIXED_BELOW_THRESHOLD') {
    return new ZoomInvariantBelowThresholdLabelStyle(baseLabelStyle, 1)
  } else if (mode === 'INVARIANT_OUTSIDE_RANGE') {
    return new ZoomInvariantOutsideRangeLabelStyle(baseLabelStyle, 1, 3)
  } else if (mode === 'FIT_OWNER') {
    return new FitOwnerLabelStyle(baseLabelStyle)
  } else {
    return baseLabelStyle
  }
}

/**
 * Creates a sample graph.
 * @param {!IGraph} graph
 */
function createGraph(graph) {
  graph.nodeDefaults.size = new Size(60, 60)
  graph.edgeDefaults.labels.layoutParameter = new FreeEdgeLabelModel({
    edgeRelativeAngle: true
  }).createEdgeAnchored({ distance: 10 })

  const n0 = graph.createNode({ layout: new Rect(110, -500, 120, 60), labels: ['Eric Joplin'] })
  const n1 = graph.createNode({ layout: new Rect(-100, -300, 40, 60), labels: ['Gray Roberts'] })
  const n2 = graph.createNode({ layout: new Rect(150, -300, 40, 60), labels: ['Linda Newland'] })
  const n3 = graph.createNode({ layout: new Rect(450, -300, 40, 60), labels: ['David Kerry'] })
  const n4 = graph.createNode({ layout: new Rect(-470, -100, 60, 60), labels: ['Dorothy Turner'] })
  const n5 = graph.createNode({ layout: new Rect(-280, -100, 60, 60), labels: ['Martin Cornett'] })
  const n6 = graph.createNode({ layout: new Rect(-110, -100, 60, 60), labels: ['Howard Meyer'] })
  const n7 = graph.createNode({ layout: new Rect(140, -100, 60, 60), labels: ['Valerie Burnett'] })
  const n8 = graph.createNode({ layout: new Rect(440, -100, 60, 60), labels: ['Kim Finn'] })
  const n9 = graph.createNode({
    layout: new Rect(-140, 100, 120, 60),
    labels: ['Laurie Aitken Müller']
  })
  const n10 = graph.createNode({ layout: new Rect(-400, 100, 120, 60), labels: ['Rana Oxborough'] })

  graph.createEdge({ source: n0, target: n1, labels: ['Friend to'] })
  graph.createEdge({ source: n0, target: n2, labels: ['Like to work with'] })
  graph.createEdge({ source: n0, target: n3, labels: ['Have problem with'] })
  graph.createEdge({ source: n3, target: n8, labels: ['Friend to'] })
  graph.createEdge({ source: n2, target: n7, labels: ['Have problem with'] })
  graph.createEdge({ source: n1, target: n6, labels: ['Friend to'] })
  graph.createEdge({ source: n1, target: n5, labels: ['Like to work with'] })
  graph.createEdge({ source: n1, target: n4, labels: ['Friend to'] })
  graph.createEdge({ source: n4, target: n10, labels: ['Friend to'] })
  graph.createEdge({ source: n5, target: n10, labels: ['Friend to'] })
  graph.createEdge({ source: n6, target: n9, labels: ['Have problem with'] })
}

/**
 * Wires up the UI.
 * @param {!GraphComponent} graphComponent
 */
function initializeUI(graphComponent) {
  const modeSelectElement = document.querySelector('#modeChooserBox')
  addOptions(
    modeSelectElement,
    { value: 'FIXED_ABOVE_THRESHOLD', text: 'Fixed above zoom threshold' },
    { value: 'FIXED_BELOW_THRESHOLD', text: 'Fixed below zoom threshold' },
    { value: 'INVARIANT_OUTSIDE_RANGE', text: 'Fixed when outside specified range' },
    { value: 'FIT_OWNER', text: "Fit into the label's owner" },
    { value: 'DEFAULT', text: 'Default behaviour' }
  )
  addNavigationButtons(modeSelectElement).addEventListener('change', evt => {
    setLabelStyle(graphComponent.graph, modeSelectElement.value)

    // hide the threshold controls if not applicable for the selected zoom style
    document.getElementById('zoomThresholdControls').hidden =
      modeSelectElement.value === 'DEFAULT' || modeSelectElement.value === 'FIT_OWNER'

    // hide the maxScale controls if not applicable for the selected zoom style
    document.getElementById('maxScaleControls').hidden =
      modeSelectElement.value !== 'INVARIANT_OUTSIDE_RANGE'
  })

  // adds an event listener to the threshold slider
  const zoomThresholdInput = document.querySelector('#zoomThreshold')
  zoomThresholdInput.addEventListener('change', () => {
    document.querySelector('#zoomThresholdLabel').textContent = zoomThresholdInput.value
    const zoomThreshold = parseFloat(zoomThresholdInput.value)

    for (const label of graphComponent.graph.labels) {
      label.style.zoomThreshold = zoomThreshold
    }
    graphComponent.updateVisual()
  })

  const maxScaleInput = document.querySelector('#maxScale')
  maxScaleInput.addEventListener('change', () => {
    document.querySelector('#maxScaleLabel').textContent = maxScaleInput.value
    const maxScale = parseFloat(maxScaleInput.value)

    for (const label of graphComponent.graph.labels) {
      label.style.maxScale = maxScale
    }
    graphComponent.updateVisual()
  })

  // shows the current zoom level in the toolbar
  graphComponent.addZoomChangedListener(() => {
    document.querySelector('#zoomLevel').textContent = graphComponent.zoom.toFixed(2)
  })
}

run().then(finishLoading)
