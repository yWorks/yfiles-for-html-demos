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
  Animator,
  EdgePathLabelModel,
  EdgeSides,
  ExteriorNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphViewerInputMode,
  HierarchicalLayout,
  IGraph,
  Insets,
  LayoutExecutor,
  License,
  Rect,
  Size,
  ViewportLimitingPolicy
} from '@yfiles/yfiles'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { addNavigationButtons, finishLoading } from '@yfiles/demo-resources/demo-page'
import graphData from './graph-data.json'
import RectangleVisualCreator from './RectangleVisualCreator'
import { ProjectionAnimation } from './ProjectionAnimation'
const policySelect = document.querySelector('#policy-select')
const strictBoundsContainmentCheckbox = document.querySelector(
  '#strict-bounds-containment-checkbox'
)
const marginsLeftInput = document.querySelector('#margins-left-input')
const marginsTopInput = document.querySelector('#margins-top-input')
const marginsRightInput = document.querySelector('#margins-right-input')
const marginsBottomInput = document.querySelector('#margins-bottom-input')
const ratioWidthInput = document.querySelector('#ratio-width-input')
const ratioHeightInput = document.querySelector('#ratio-height-input')
// Visuals for showing the various areas relevant for limiter calculations
let contentMarginsVisual
let limiterBoundsVisual
let contentMarginsElement = null
let limiterBoundsElement = null
let graphComponent
let isometricView
/**
 * Runs this demo.
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')
  // Enable navigation
  graphComponent.inputMode = new GraphViewerInputMode()
  // Configures default styles for newly created graph elements
  initializeGraph(graphComponent.graph)
  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)
  // layout and center the graph
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(new HierarchicalLayout({ minimumLayerDistance: 35 }))
  await graphComponent.fitGraphBounds()
  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true
  addRectangleVisuals()
  initializeUI(graphComponent)
  updateViewportLimiterSettings(graphComponent)
}
/**
 * Applies the UI settings to the viewport limiter
 */
function updateViewportLimiterSettings(graphComponent) {
  graphComponent.viewportLimiter.strictBoundsContainment = strictBoundsContainmentCheckbox.checked
  graphComponent.viewportLimiter.viewportContentMargins = new Insets(
    Number(marginsTopInput.value),
    Number(marginsRightInput.value),
    Number(marginsBottomInput.value),
    Number(marginsLeftInput.value)
  )
  graphComponent.viewportLimiter.minimumViewportContentRatio = new Size(
    Number(ratioWidthInput.value),
    Number(ratioHeightInput.value)
  )
  switch (policySelect.value) {
    case 'WITHIN_MARGINS':
      graphComponent.viewportLimiter.policy = ViewportLimitingPolicy.WITHIN_MARGINS
      break
    case 'TOWARDS_LIMIT':
      graphComponent.viewportLimiter.policy = ViewportLimitingPolicy.TOWARDS_LIMIT
      break
    case 'STRICT':
      graphComponent.viewportLimiter.policy = ViewportLimitingPolicy.STRICT
      break
    case 'UNRESTRICTED':
      graphComponent.viewportLimiter.policy = ViewportLimitingPolicy.UNRESTRICTED
      break
  }
  updateRectangleVisualsRendering()
  graphComponent.invalidate()
}
/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)
  graphBuilder.createNodesSource({
    data: graphData.nodeList,
    id: (item) => item.id
  })
  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })
  graphBuilder.buildGraph()
}
/**
 * Initializes the defaults for the styling in this demo.
 */
function initializeGraph(graph) {
  // Set styles for this demo
  initDemoStyles(graph)
  // Set sizes and locations specific for this demo
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.layoutParameter = new ExteriorNodeLabelModel({
    margins: 5
  }).createParameter('bottom')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}
/**
 * Adds rectangle visuals for content area, limiter ratio margins and ratio
 */
function addRectangleVisuals() {
  const renderTree = graphComponent.renderTree
  renderTree.createElement(
    renderTree.backgroundGroup,
    new RectangleVisualCreator(
      'Content Area',
      'top',
      false,
      '#f6f6f6',
      '#000000',
      () => graphComponent.contentBounds
    )
  )
  contentMarginsVisual = new RectangleVisualCreator(
    'Margins',
    'bottom',
    true,
    'transparent',
    'red',
    () => calculateMarginsRect(),
    true
  )
  limiterBoundsVisual = new RectangleVisualCreator(
    'Viewport Limiter Bounds',
    'top',
    false,
    'transparent',
    'blue',
    () => calculateEffectiveRect(),
    true
  )
}
/**
 * Calculates the rectangle defined by the GraphComponent size and
 * ViewportLimiter viewport margins.
 */
function calculateMarginsRect() {
  const viewportLimiter = graphComponent.viewportLimiter
  if (viewportLimiter.policy === ViewportLimitingPolicy.UNRESTRICTED) {
    return null
  }
  const viewportContentMargins = viewportLimiter.viewportContentMargins
  const left = viewportContentMargins.left
  const top = viewportContentMargins.top
  const graphComponentSize = graphComponent.size
  const right = graphComponentSize.width - viewportContentMargins.right
  const bottom = graphComponentSize.height - viewportContentMargins.bottom
  const width = right - left
  const height = bottom - top
  const centerView = graphComponent.size.multiply(0.5)
  return new Rect(
    width <= 0 ? centerView.width : left,
    top <= 0 ? centerView.height : top,
    width <= 0 ? 1 : width,
    height <= 0 ? 1 : height
  )
}
/**
 * Calculates the effective ViewportLimiter area (bounds) as the marginsRect scaled by the available
 * space as defined by the viewportContentRatio
 */
function calculateEffectiveRect() {
  const viewportLimiter = graphComponent.viewportLimiter
  if (viewportLimiter.policy === ViewportLimitingPolicy.UNRESTRICTED) {
    return null
  }
  const margins = viewportLimiter.viewportContentMargins
  const ratio = viewportLimiter.minimumViewportContentRatio
  const canvasComponent = graphComponent.canvasContext.canvasComponent
  const availableWidth =
    canvasComponent.innerSize.width - canvasComponent.innerSize.width * ratio.width
  const availableHeight =
    canvasComponent.innerSize.height - canvasComponent.innerSize.height * ratio.height
  const effectiveMargins = new Insets(
    Math.min(margins.top, (margins.top * availableHeight) / margins.verticalInsets),
    Math.min(margins.right, (margins.right * availableWidth) / margins.horizontalInsets),
    Math.min(margins.bottom, (margins.bottom * availableHeight) / margins.verticalInsets),
    Math.min(margins.left, (margins.left * availableWidth) / margins.horizontalInsets)
  )
  const innerWidth =
    canvasComponent.innerSize.width -
    Math.min(effectiveMargins.horizontalInsets, canvasComponent.innerSize.width)
  const innerHeight =
    canvasComponent.innerSize.height -
    Math.min(effectiveMargins.verticalInsets, canvasComponent.innerSize.height)
  return new Rect(effectiveMargins.left, effectiveMargins.top, innerWidth, innerHeight)
}
/**
 * Enables/disables the rendering of the various rectangle visuals,
 * depending on the chosen limiter policy
 */
function updateRectangleVisualsRendering() {
  const renderTree = graphComponent.renderTree
  if (policySelect.value === 'UNRESTRICTED' && contentMarginsElement !== null) {
    renderTree.remove(contentMarginsElement)
    contentMarginsElement = null
    renderTree.remove(limiterBoundsElement)
    limiterBoundsElement = null
  } else if (contentMarginsElement === null) {
    contentMarginsElement = renderTree.createElement(
      renderTree.foregroundGroup,
      contentMarginsVisual
    )
    limiterBoundsElement = renderTree.createElement(renderTree.foregroundGroup, limiterBoundsVisual)
  }
}
/**
 * Animates the projection between two alpha and scale values.
 */
function animateProjection(fromAlpha, toAlpha, fromScale, toScale) {
  const projectionAnimation = new ProjectionAnimation(
    graphComponent,
    fromAlpha,
    toAlpha,
    fromScale,
    toScale
  )
  new Animator(graphComponent).animate(projectionAnimation.createEasedAnimation())
}
/**
 * Toggles the isometric view.
 */
function toggleProjection() {
  isometricView = !isometricView
  if (isometricView) {
    // set isometric projection
    animateProjection(0, -Math.PI / 4, 1, Math.sqrt(3) / 3)
  } else {
    // revert isometric projection
    animateProjection(-Math.PI / 4, 0, Math.sqrt(3) / 3, 1)
  }
}
/**
 * Initializes the UI elements that are specific to this demo.
 */
function initializeUI(graphComponent) {
  const icometricViewButton = document.querySelector('#isometric-view-toggle')
  icometricViewButton.addEventListener('click', () => {
    toggleProjection()
  })
  addNavigationButtons(policySelect, true, false, 'navigation-button')
  policySelect.addEventListener('change', () => {
    updateViewportLimiterSettings(graphComponent)
    updateDescriptionText()
  })
  strictBoundsContainmentCheckbox.addEventListener('change', () => {
    updateViewportLimiterSettings(graphComponent)
  })
  marginsLeftInput.addEventListener('change', () => {
    updateViewportLimiterSettings(graphComponent)
  })
  marginsTopInput.addEventListener('change', () => {
    updateViewportLimiterSettings(graphComponent)
  })
  marginsRightInput.addEventListener('change', () => {
    updateViewportLimiterSettings(graphComponent)
  })
  marginsBottomInput.addEventListener('change', () => {
    updateViewportLimiterSettings(graphComponent)
  })
  ratioWidthInput.addEventListener('change', () => {
    updateViewportLimiterSettings(graphComponent)
  })
  ratioHeightInput.addEventListener('change', () => {
    updateViewportLimiterSettings(graphComponent)
  })
  updateDescriptionText()
}
function getPolicyDescription() {
  switch (policySelect.value) {
    case 'WITHIN_MARGINS':
      return `<h3>Within Margins</h3>
        <p style='margin-top:0'>This policy strictly limits viewport movement to ensure that at least one part of the content area is always contained in the ViewportLimiter bounds.</p>`
    case 'TOWARDS_LIMIT':
      return `
        <h3>Towards Limit</h3>
        <p style='margin-top:0'>If the current viewport lies outside the ViewportLimiter bounds, the ViewportLimiter allows for changes <em>towards</em> the bounds but forbids changes <em>away</em> from them.</p>
        <p>While the viewport will not comply with the limits right away, this policy avoids the visible "jump" which can happen with the STRICT ViewportLimitingPolicy.</p>
        <h4>Experiment</h4>
        <ul>
          <li>Set the policy to <em>Unrestricted</em></li>
          <li>Pan the graph outside the viewport</li>
          <li>Set the policy to <em>Towards Limit</em></li>
          <li>Pan or zoom the graph. Only movement towards the viewport limit is possible.</li>
        </ul>`
    case 'STRICT':
      return `
        <h3>Strict</h3>
        <p style='margin-top:0'>Strictly applies the bounds. In case the viewport happens to be outside the limits, this might result in a noticeable "jump" upon the first pan or zoom gesture.</p>
        <h4>Experiment</h4>
        <ul>
          <li>Set the policy to <em>Unrestricted</em></li>
          <li>Pan the graph outside the viewport</li>
          <li>Set the policy to <em>Strict</em></li>
          <li>Pan or zoom the graph. The graph jumps to the viewport limit.</li>
        </ul>`
    case 'UNRESTRICTED':
      return `
        <h3>Unrestricted</h3>
        <p style='margin-top:0'>This policy disables limiting of the viewport. The graph can be panned out completely.</p>`
  }
}
export function updateDescriptionText() {
  const descriptionContainer = document.querySelector('#policy-description-container')
  descriptionContainer.classList.remove('highlight-description')
  const policyDescription = document.querySelector('#policy-description')
  policyDescription.innerHTML = getPolicyDescription()
  // highlight the description once
  setTimeout(() => {
    descriptionContainer.classList.add('highlight-description')
  }, 0)
}
run().then(finishLoading)
