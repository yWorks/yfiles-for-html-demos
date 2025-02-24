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
  GraphBuilder,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  HierarchicalLayout,
  IGraph,
  ILabelStyle,
  LabelStyle,
  LayoutExecutor,
  License,
  Rect
} from '@yfiles/yfiles'
import {
  FitOwnerLabelStyle,
  ZoomInvariantAboveThresholdLabelStyle,
  ZoomInvariantBelowThresholdLabelStyle,
  ZoomInvariantLabelStyleBase,
  ZoomInvariantOutsideRangeLabelStyle
} from './ZoomInvariantLabelStyle'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { addNavigationButtons, addOptions, finishLoading } from '@yfiles/demo-resources/demo-page'
import graphData from './graph-data.json'
async function run() {
  License.value = await fetchLicense()
  const graphComponent = new GraphComponent('graphComponent')
  graphComponent.inputMode = new GraphViewerInputMode({
    selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.LABEL
  })
  initDemoStyles(graphComponent.graph)
  // For the general appearance of a label, we use the common demo defaults set above
  const baseLabelStyle = graphComponent.graph.nodeDefaults.labels.style
  // Initially, use FIXED_BELOW_THRESHOLD mode
  setLabelStyle(graphComponent.graph, 'FIXED_BELOW_THRESHOLD', baseLabelStyle)
  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)
  // layout and center the graph
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(
    new HierarchicalLayout({
      minimumLayerDistance: 100,
      edgeDistance: 100,
      nodeToEdgeDistance: 100
    })
  )
  void graphComponent.fitGraphBounds()
  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true
  // Instances of {@link ZoomInvariantLabelStyleBase} should not be shared
  graphComponent.graph.nodeDefaults.labels.shareStyleInstance = false
  graphComponent.graph.edgeDefaults.labels.shareStyleInstance = false
  initializeUI(graphComponent)
}
/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)
  const nodesSource = graphBuilder.createNodesSource({
    data: graphData.nodeList,
    id: (item) => item.id
  })
  nodesSource.nodeCreator.createLabelBinding((item) => item.label)
  nodesSource.nodeCreator.layoutProvider = (item) =>
    item.tag === 'level 1' ? new Rect(0, 0, 100, 70) : new Rect(0, 0, 30, 70)
  graphBuilder
    .createEdgesSource({
      data: graphData.edgeList,
      sourceId: (item) => item.source,
      targetId: (item) => item.target
    })
    .edgeCreator.createLabelBinding((item) => item.label)
  graphBuilder.buildGraph()
}
/**
 * Sets a new label style for the given mode to all labels in the graph.
 * @param graph The graph.
 * @param mode The label style mode.
 * @param baseLabelStyle An optional base label style. If not provided, the graph defaults are used.
 */
function setLabelStyle(graph, mode, baseLabelStyle = null) {
  const innerLabelStyle =
    baseLabelStyle ??
    graph.nodeDefaults.labels.style.innerLabelStyle ??
    graph.nodeDefaults.labels.style
  graph.nodeDefaults.labels.style = createLabelStyle(mode, innerLabelStyle)
  graph.edgeDefaults.labels.style = createLabelStyle(mode, innerLabelStyle)
  // to make sure that the selection rectangle has the correct label bounds, the label style should not be shared
  graph.nodeDefaults.labels.shareStyleInstance = false
  graph.edgeDefaults.labels.shareStyleInstance = false
  for (const label of graph.labels) {
    graph.setStyle(label, createLabelStyle(mode, innerLabelStyle))
  }
}
/**
 * Creates a new label style for the given mode and base style.
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
 * Wires up the UI.
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
  addNavigationButtons(modeSelectElement).addEventListener('change', (_evt) => {
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
  graphComponent.addEventListener('zoom-changed', () => {
    document.querySelector('#zoomLevel').textContent = graphComponent.zoom.toFixed(2)
  })
  modeSelectElement.dispatchEvent(new Event('change'))
}
run().then(finishLoading)
