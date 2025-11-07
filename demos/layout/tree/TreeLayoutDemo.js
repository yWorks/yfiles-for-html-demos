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
  LayoutExecutor,
  License,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  Size,
  TreeBuilder,
  TreeLayout
} from '@yfiles/yfiles'
import {
  createCategoryTreeConfiguration,
  createDefaultTreeConfiguration,
  createGeneralGraphConfiguration,
  createGenericConfiguration,
  createLargeTreeConfiguration,
  createWideTreeConfiguration
} from './TreeLayoutConfigurations'
import * as TreeData from './resources/TreeData'
import { LayerColors, SubtreePlacerPanel } from './SubtreePlacerPanel'
import licenseData from '../../../lib/license.json'
import { addNavigationButtons, finishLoading } from '@yfiles/demo-app/demo-page'
import { initializesInputMode } from './initialize-input-mode'

/**
 * The graph component which contains the tree graph.
 */
let graphComponent

/**
 * The panel which provides access to the subtree placer settings.
 */
let subtreePlacerPanel

/**
 * Flag to prevent re-entrant layout calculations.
 */
let busy = false

/**
 * Launches the TreeLayoutDemo.
 */
async function run() {
  License.value = licenseData

  // initialize the graph component
  graphComponent = new GraphComponent('graphComponent')
  // initialize the settings panel and registers a listener which updates the layout if settings were changed
  subtreePlacerPanel = new SubtreePlacerPanel(graphComponent)
  subtreePlacerPanel.setChangeListener(async () => await runLayout(false))

  // initialize interactive behavior and toolbar buttons
  initializeGraphDefaults()
  initializesInputMode(graphComponent, subtreePlacerPanel, runLayout)
  initializeUI()

  // load a sample graph
  await loadGraph()
}

/**
 * Runs a {@link TreeLayout} using the specified {@link ISubtreePlacer}s.
 */
async function runLayout(initConfig) {
  if (busy) {
    // there is already a layout calculating do not start another one
    return
  }

  setBusy(true)

  let configuration
  if (!initConfig) {
    // use the current configuration from the panel
    configuration = createGenericConfiguration(graphComponent.graph, subtreePlacerPanel)
  } else {
    // create a layout configuration according to the current sample
    switch (document.querySelector('#select-sample').value) {
      default:
        configuration = createGenericConfiguration(graphComponent.graph, subtreePlacerPanel)
        break
      case 'default':
        configuration = createDefaultTreeConfiguration(graphComponent.graph, subtreePlacerPanel)
        break
      case 'wide':
        configuration = createWideTreeConfiguration(graphComponent.graph, subtreePlacerPanel)
        break
      case 'category':
        configuration = createCategoryTreeConfiguration(graphComponent.graph, subtreePlacerPanel)
        break
      case 'general':
        configuration = createGeneralGraphConfiguration(graphComponent.graph, subtreePlacerPanel)
        break
      case 'large':
        configuration = createLargeTreeConfiguration(graphComponent.graph, subtreePlacerPanel)
        break
    }
  }

  // run the layout animated
  const executor = new LayoutExecutor({
    graphComponent,
    layout: configuration.layout,
    layoutData: configuration.layoutData,
    animateViewport: true,
    animationDuration: '0.5s'
  })
  await executor.start()

  setBusy(false)
}

function initializeGraphDefaults() {
  // initialize the node and edge default styles, they will be applied to the newly created graph
  graphComponent.graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'round-rectangle',
    stroke: 'white',
    fill: 'crimson'
  })
  graphComponent.graph.nodeDefaults.size = new Size(60, 30)
  graphComponent.graph.nodeDefaults.shareStyleInstance = false

  graphComponent.graph.edgeDefaults.style = new PolylineEdgeStyle({
    targetArrow: '#617984 medium triangle',
    stroke: '1.5px solid #617984'
  })
}

/**
 * Reads a tree graph from file
 */
async function loadGraph() {
  const graph = graphComponent.graph
  graph.clear()

  // select tree data
  let nodesSource
  const sample = document.querySelector('#select-sample').value
  switch (sample) {
    default:
    case 'default':
      nodesSource = TreeData.DefaultTree.nodesSource
      break
    case 'wide':
      nodesSource = TreeData.DefaultTree.nodesSource
      break
    case 'category':
      nodesSource = TreeData.CategoryTree.nodesSource
      break
    case 'general':
      nodesSource = TreeData.GeneralGraph.nodesSource
      break
    case 'large':
      nodesSource = TreeData.LargeTree.nodesSource
      break
  }

  // configure the tree builder
  const builder = new TreeBuilder(graph)
  const rootNodesSource = builder.createRootNodesSource(nodesSource, 'id')
  rootNodesSource.addChildNodesSource((data) => data.children, rootNodesSource)

  // create the graph
  builder.buildGraph()

  if (sample === 'general') {
    // add some non-tree edges
    graph.createEdge(graph.nodes.get(1), graph.nodes.get(22))
    graph.createEdge(graph.nodes.get(3), graph.nodes.get(16))
    graph.createEdge(graph.nodes.get(28), graph.nodes.get(26))
  }

  // update the node fill colors according to their layers
  graph.nodes.forEach((node) => {
    const layerColor = LayerColors[node.tag.layer % LayerColors.length]
    const style = node.style
    style.fill = layerColor.fill
    style.stroke = layerColor.stroke
    if (node.tag.assistant) {
      style.stroke = '2px dashed black'
    }
  })

  // apply layout
  await runLayout(true)
}

/**
 * Enables/disables interaction.
 */
function setBusy(isBusy) {
  graphComponent.inputMode.enabled = !isBusy
  // disable UI elements during the layout
  document
    .querySelector('.demo-sidebar__content')
    .querySelectorAll('input, select, button')
    .forEach((element) => {
      element.disabled = isBusy
    })
  document.querySelector('#select-sample').disabled = isBusy
  busy = isBusy
}

/**
 * Wires up the GUI.
 */
function initializeUI() {
  addNavigationButtons(document.querySelector('#select-sample')).addEventListener(
    'change',
    loadGraph
  )
}

run().then(finishLoading)
