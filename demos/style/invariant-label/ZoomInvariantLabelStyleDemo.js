/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ICommand,
  ILabelStyle,
  INode,
  IRectangle,
  License,
  Rect,
  Size
} from 'yfiles'
import {
  FitOwnerLabelStyle,
  ZoomInvariantBelowThresholdLabelStyle,
  ZoomInvariantAboveThresholdLabelStyle,
  ZoomInvariantOutsideRangeLabelStyle,
  ZoomInvariantLabelStyleBase
} from './ZoomInvariantLabelStyle.js'
import {
  addNavigationButtons,
  bindChangeListener,
  bindCommand,
  checkLicense,
  showApp
} from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'
import { initDemoStyles } from '../../resources/demo-styles.js'
import { createBasicNodeLabelStyle } from '../../resources/basic-demo-styles.js'

/** @type {GraphComponent} */
let graphComponent

const ModeDescriptions = {
  DEFAULT: 'Default behaviour',
  FIXED_ABOVE_THRESHOLD: 'Fixed above zoom threshold',
  FIXED_BELOW_THRESHOLD: 'Fixed below zoom threshold',
  INVARIANT_OUTSIDE_RANGE: 'Fixed when outside specified range',
  FIT_OWNER: "Fit into the label's owner"
}

const modeChooserBox = document.getElementById('modeChooserBox')
const zoomThresholdLabel = document.getElementById('zoomThresholdLabel')
const zoomThresholdInput = document.getElementById('zoomThreshold')
const maxScaleLabel = document.getElementById('maxScaleLabel')
const maxScaleInput = document.getElementById('maxScale')
const zoomLevelDisplay = document.getElementById('zoomLevel')

// the general appearance of a label
const wrappedLabelStyle = createBasicNodeLabelStyle('demo-orange')

/**
 * @param {!object} licenseData
 */
function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  graphComponent.inputMode = new GraphViewerInputMode({
    selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.LABEL
  })

  // initialize mode chooser
  for (const [value, label] of Object.entries(ModeDescriptions)) {
    const option = document.createElement('option')
    option.text = label
    option.value = value
    modeChooserBox.add(option)
  }
  modeChooserBox.value = 'FIXED_BELOW_THRESHOLD'

  // adds an event listener to the threshold slider
  zoomThresholdInput.addEventListener('change', () => {
    zoomThresholdLabel.textContent = zoomThresholdInput.value
    for (const label of graphComponent.graph.labels) {
      label.style.zoomThreshold = parseFloat(zoomThresholdInput.value)
    }
    graphComponent.updateVisual()
  })

  maxScaleInput.addEventListener('change', () => {
    maxScaleLabel.textContent = maxScaleInput.value
    for (const label of graphComponent.graph.labels) {
      label.style.maxScale = parseFloat(maxScaleInput.value)
    }
    graphComponent.updateVisual()
  })

  // shows the current zoom level in the tool bar
  graphComponent.addZoomChangedListener(() => {
    zoomLevelDisplay.textContent = graphComponent.zoom.toFixed(2)
  })

  createGraph()

  registerCommands()

  showApp(graphComponent)
}

/**
 * Helper method to create node with the given layout and label
 * @param {!IRectangle} layout
 * @param {!string} label
 * @returns {!INode}
 */
function createNode(layout, label) {
  return graphComponent.graph.createNode({
    layout: layout,
    labels: [
      {
        text: label,
        style: new ZoomInvariantBelowThresholdLabelStyle(wrappedLabelStyle, 1)
      }
    ]
  })
}

/**
 * Helper method to create an edge with the given label between the given source and target.
 * @param {!INode} source
 * @param {!INode} target
 * @param {!string} label
 */
function createEdge(source, target, label) {
  return graphComponent.graph.createEdge({
    source: source,
    target: target,
    labels: [
      {
        text: label,
        style: new ZoomInvariantBelowThresholdLabelStyle(wrappedLabelStyle, 1)
      }
    ]
  })
}

/**
 * Creates a sample graph.
 */
function createGraph() {
  const graph = graphComponent.graph

  initDemoStyles(graph)

  graph.nodeDefaults.size = new Size(60, 60)
  graph.edgeDefaults.labels.layoutParameter = new FreeEdgeLabelModel({
    edgeRelativeAngle: true
  }).createEdgeAnchored({ distance: 10 })

  const n0 = createNode(new Rect(110, -500, 120, 60), 'Eric Joplin')
  const n1 = createNode(new Rect(-100, -300, 40, 60), 'Gray Roberts')
  const n2 = createNode(new Rect(150, -300, 40, 60), 'Linda Newland')
  const n3 = createNode(new Rect(450, -300, 40, 60), 'David Kerry')
  const n4 = createNode(new Rect(-470, -100, 60, 60), 'Dorothy Turner')
  const n5 = createNode(new Rect(-280, -100, 60, 60), 'Martin Cornett')
  const n6 = createNode(new Rect(-110, -100, 60, 60), 'Howard Meyer')
  const n7 = createNode(new Rect(140, -100, 60, 60), 'Valerie Burnett')
  const n8 = createNode(new Rect(440, -100, 60, 60), 'Kim Finn')
  const n9 = createNode(new Rect(-140, 100, 120, 60), 'Laurie Aitken Müller')
  const n10 = createNode(new Rect(-400, 100, 120, 60), 'Rana Oxborough')

  createEdge(n0, n1, 'Friend to')
  createEdge(n0, n2, 'Like to work with')
  createEdge(n0, n3, 'Have problem with')
  createEdge(n3, n8, 'Friend to')
  createEdge(n2, n7, 'Have problem with')
  createEdge(n1, n6, 'Friend to')
  createEdge(n1, n5, 'Like to work with')
  createEdge(n1, n4, 'Friend to')
  createEdge(n4, n10, 'Friend to')
  createEdge(n5, n10, 'Friend to')
  createEdge(n6, n9, 'Have problem with')

  graphComponent.fitGraphBounds()
}

/**
 * Wires up the UI.
 */
function registerCommands() {
  bindChangeListener('#modeChooserBox', () => {
    const mode = modeChooserBox.value
    for (const label of graphComponent.graph.labels) {
      let labelStyle = wrappedLabelStyle
      if (mode === 'FIXED_ABOVE_THRESHOLD') {
        labelStyle = new ZoomInvariantAboveThresholdLabelStyle(wrappedLabelStyle, 1)
      } else if (mode === 'FIXED_BELOW_THRESHOLD') {
        labelStyle = new ZoomInvariantBelowThresholdLabelStyle(wrappedLabelStyle, 1)
      } else if (mode === 'INVARIANT_OUTSIDE_RANGE') {
        labelStyle = new ZoomInvariantOutsideRangeLabelStyle(wrappedLabelStyle, 1, 3)
      } else if (mode === 'FIT_OWNER') {
        labelStyle = new FitOwnerLabelStyle(wrappedLabelStyle)
      }
      graphComponent.graph.setStyle(label, labelStyle)
    }

    // hide the threshold controls if not applicable for the selected zoom style
    document.getElementById('zoomThresholdControls').hidden =
      mode === 'DEFAULT' || mode === 'FIT_OWNER'

    // hide the maxScale controls if not applicable for the selected zoom style
    document.getElementById('maxScaleControls').hidden = mode !== 'INVARIANT_OUTSIDE_RANGE'

    graphComponent.updateVisual()
  })

  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  addNavigationButtons(modeChooserBox)
}

loadJson().then(checkLicense).then(run)
