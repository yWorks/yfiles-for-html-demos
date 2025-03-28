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
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Arrow,
  ArrowType,
  BezierEdgePathLabelModel,
  BezierEdgeSegmentLabelModel,
  BezierEdgeStyle,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  HorizontalTextAlignment,
  IBend,
  IHandle,
  IInputMode,
  ILabelModelParameter,
  LabelStyle,
  License,
  ShapeNodeShape,
  ShapeNodeStyle
} from '@yfiles/yfiles'
import { BezierGraphEditorInputMode } from './BezierGraphEditorInputMode'
import { InnerControlPointHandle, OuterControlPointHandle } from './BezierHandles'
import { BezierBendCreator } from './BezierBendCreator'
import { BezierEdgeHandleProvider } from './BezierEdgeHandleProvider'
import { BezierSelectionStyle } from './BezierSelectionStyle'
import { BezierCreateEdgeInputMode } from './BezierCreateEdgeInputMode'
import { SampleCircle, SampleLabels } from './resources/SampleGraphs'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
let graphComponent = null
/**
 * Configuration object for managing the demo settings
 */
const config = {
  smoothSegments: true,
  angle: 0,
  autoRotation: true,
  autoSnapping: true,
  enableEditing: true
}
const bezierEdgeSegmentLabelModel = new BezierEdgeSegmentLabelModel({ autoSnapping: true })
const bezierPathLabelModel = new BezierEdgePathLabelModel({ autoSnapping: true })
const bezierEdgeStyle = new BezierEdgeStyle({
  stroke: '3px #4169E1',
  targetArrow: new Arrow({
    fill: '#4169E1',
    stroke: '#4169E1',
    type: ArrowType.TRIANGLE
  })
})
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  graphComponent.inputMode = createEditorMode()
  initializeGraph()
  initializeUI()
}
/**
 * Creates the default input mode for the GraphComponent, a {@link GraphEditorInputMode}.
 * a new GraphEditorInputMode instance and configures snapping and orthogonal edge editing
 */
function createEditorMode() {
  return new BezierGraphEditorInputMode(config)
}
/**
 * Initializes the graph instance setting default styles
 * and creating a small sample graph.
 */
function initializeGraph() {
  const graph = graphComponent.graph
  // We need to provide our own handles for bezier edge bends:
  registerBezierDecorators()
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: ShapeNodeShape.ELLIPSE,
    fill: 'lightgray',
    stroke: null
  })
  graph.edgeDefaults.style = bezierEdgeStyle
  graph.edgeDefaults.labels.style = new LabelStyle({
    backgroundFill: '#FFFFFF',
    backgroundStroke: '#FFA500',
    padding: 3,
    horizontalTextAlignment: HorizontalTextAlignment.CENTER
  })
  graph.edgeDefaults.labels.layoutParameter = bezierPathLabelModel.createParameter(0.5)
  loadSample(SampleCircle)
  graph.undoEngineEnabled = true
}
function registerBezierDecorators() {
  const graph = graphComponent.graph
  graph.decorator.bends.handle.hide(
    (b) =>
      !config.enableEditing &&
      b.owner.style instanceof BezierEdgeStyle &&
      b.owner.bends.size % 3 === 2
  )
  graph.decorator.bends.handle.addWrapperFactory(
    (b) =>
      config.enableEditing &&
      config.smoothSegments &&
      b.owner.style instanceof BezierEdgeStyle &&
      b.owner.bends.size % 3 === 2,
    (b, h) => {
      const index = b.index
      switch (index % 3) {
        case 0:
        case 1:
          // Handle for the first control point of a triple
          return new OuterControlPointHandle(h, b)
        case 2:
        default:
          // The "middle" control point controls the previous and next ones
          return new InnerControlPointHandle(h, b)
      }
    }
  )
  // Override the default for bezier edges
  graph.decorator.edges.bendCreator.addWrapperFactory(
    (edge) => config.enableEditing && edge.style instanceof BezierEdgeStyle,
    (edge, originalBendCreator) =>
      originalBendCreator != null ? new BezierBendCreator(edge, originalBendCreator) : null
  )
  // And always show bend handles
  graph.decorator.edges.handleProvider.addWrapperFactory(
    (edge) => config.enableEditing && edge.style instanceof BezierEdgeStyle,
    (edge, coreImpl) => new BezierEdgeHandleProvider(edge, coreImpl)
  )
  graph.decorator.edges.selectionRenderer.addWrapperFactory(
    (e) => e.style instanceof BezierEdgeStyle,
    (_, coreImpl) => new BezierSelectionStyle(coreImpl)
  )
  // since removing bends also affects our handles, we need to let the input mode
  // requery the handles to get the fresh ones.
  function requeryHandles() {
    graphComponent.inputMode.requeryHandles()
  }
  graph.addEventListener('bend-removed', requeryHandles)
  graph.addEventListener('bend-added', requeryHandles)
}
function loadSample(sample) {
  graphComponent.graph.clear()
  const builder = new GraphBuilder(graphComponent.graph)
  builder.createNodesSource({
    data: sample.nodes,
    id: 'id',
    layout: 'layout'
  })
  const edgeCreator = builder.createEdgesSource(sample.edges, 'source', 'target', 'id').edgeCreator
  if (sample === SampleLabels) {
    // add label with the according label models from the sample data
    const labelCreator = edgeCreator.createLabelsSource((data) => data.labels).labelCreator
    labelCreator.textProvider = (data) => data.text
    labelCreator.layoutParameterProvider = (data) => {
      if (data.model === 'segment') {
        if (data.fromSource) {
          return bezierEdgeSegmentLabelModel.createParameterFromSource(
            data.segmentIndex,
            data.segmentRatio,
            data.distance
          )
        } else {
          return bezierEdgeSegmentLabelModel.createParameterFromTarget(
            data.segmentIndex,
            data.segmentRatio,
            data.distance
          )
        }
      } else {
        return bezierPathLabelModel.createParameter(data.ratio, data.distance)
      }
    }
  }
  const graph = builder.buildGraph()
  // add label with the according label models from the sample data
  graph.edges.forEach((edge) => {
    if (edge.tag.bends) {
      edge.tag.bends.forEach((bend) => {
        graph.addBend(edge, bend)
      })
    }
  })
  void graphComponent.fitGraphBounds()
  graph.undoEngine?.clear()
}
function initializeUI() {
  document.querySelector('#bezier-editing').addEventListener('click', () => {
    config.enableEditing = !config.enableEditing
    if (graphComponent) {
      const geim = graphComponent.inputMode
      if (geim instanceof GraphEditorInputMode) {
        // update the handle visualization
        geim.requeryHandles()
        const bceim = geim.createEdgeInputMode
        if (bceim instanceof BezierCreateEdgeInputMode) {
          bceim.createSmoothSplines = config.enableEditing
        }
      }
    }
    document.querySelector('#smooth-editing').disabled = !config.enableEditing
  })
  document.querySelector('#smooth-editing').addEventListener('click', () => {
    config.smoothSegments = !config.smoothSegments
    if (graphComponent) {
      const geim = graphComponent.inputMode
      if (geim instanceof GraphEditorInputMode) {
        const bceim = geim.createEdgeInputMode
        if (bceim instanceof BezierCreateEdgeInputMode) {
          bceim.createSmoothSplines = config.smoothSegments
        }
        geim.requeryHandles()
      }
    }
  })
  document.querySelector('#auto-rotation').addEventListener('click', () => {
    config.autoRotation = !config.autoRotation
    bezierEdgeSegmentLabelModel.autoRotation = config.autoRotation
    bezierPathLabelModel.autoRotation = config.autoRotation
    if (graphComponent) {
      graphComponent.updateVisual()
    }
  })
  document.querySelector('#auto-snapping').addEventListener('click', () => {
    config.autoSnapping = !config.autoSnapping
    bezierEdgeSegmentLabelModel.autoSnapping = config.autoSnapping
    bezierPathLabelModel.autoSnapping = config.autoSnapping
    if (graphComponent) {
      graphComponent.updateVisual()
    }
  })
  const angleLabel = document.querySelector('#angle-label')
  document.querySelector('#angle-range').addEventListener('input', (evt) => {
    const value = evt.target.value
    config.angle = Number(value)
    bezierEdgeSegmentLabelModel.angle = (Math.PI * config.angle) / 180.0
    bezierPathLabelModel.angle = (Math.PI * config.angle) / 180.0
    angleLabel.innerText = String(config.angle)
    if (graphComponent) {
      graphComponent.updateVisual()
    }
  })
  document.querySelector('#sample-select').addEventListener('change', (evt) => {
    const value = evt.target.value
    if (value === 'circle') {
      loadSample(SampleCircle)
    } else {
      loadSample(SampleLabels)
    }
  })
}
run().then(finishLoading)
