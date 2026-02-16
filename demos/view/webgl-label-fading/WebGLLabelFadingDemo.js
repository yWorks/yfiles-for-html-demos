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
  GraphComponent,
  GraphViewerInputMode,
  License,
  NinePositionsEdgeLabelModel,
  Point,
  Rect,
  WebGLFocusIndicatorManager,
  WebGLGraphModelManager,
  WebGLHighlightIndicatorManager,
  WebGLSelectionIndicatorManager
} from '@yfiles/yfiles'

import { initDemoStyles } from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { addNavigationButtons, checkWebGL2Support, finishLoading } from '@yfiles/demo-app/demo-page'
import { registerLabelFading } from './label-fading'
import graphData from './resources/hierarchic_2000_2100.json'

async function run() {
  if (!checkWebGL2Support()) {
    return
  }

  License.value = licenseData

  // initialize a GraphComponent with a view-only input mode
  const graphComponent = new GraphComponent('#graphComponent')
  graphComponent.inputMode = new GraphViewerInputMode()
  initDemoStyles(graphComponent.graph)

  // Render graph in WebGL to utilize its label fading capabilities
  enableWebGLRendering(graphComponent)

  // register label fading at the GraphComponent zoom changes
  const thresholdSelect = document.querySelector('#label-fadeout-threshold')
  const fadeThreshold = Number(thresholdSelect.options[thresholdSelect.selectedIndex].value)
  registerLabelFading(graphComponent, fadeThreshold)

  // create an initial sample graph
  await createGraph(graphComponent.graph)
  void graphComponent.fitGraphBounds()

  // set up zoom threshold select
  initializeUI(graphComponent)
}

/**
 * Enables WebGL as the rendering technique.
 */
function enableWebGLRendering(graphComponent) {
  graphComponent.graphModelManager = new WebGLGraphModelManager()
  graphComponent.selectionIndicatorManager = new WebGLSelectionIndicatorManager()
  graphComponent.highlightIndicatorManager = new WebGLHighlightIndicatorManager()
  graphComponent.focusIndicatorManager = new WebGLFocusIndicatorManager()
}

/**
 * Configures the threshold values dropdown menu.
 */
function initializeUI(graphComponent) {
  const labelFadeoutThresholdSelect = document.querySelector('#label-fadeout-threshold')
  labelFadeoutThresholdSelect.addEventListener('change', (e) => {
    const selectElement = e.target
    registerLabelFading(graphComponent, Number(selectElement.value))
  })
  addNavigationButtons(labelFadeoutThresholdSelect, false)
}

/**
 * Creates an initial sample graph.
 * @yjs:keep = edgeList
 */
async function createGraph(graph) {
  graph.clear()

  const getRandomInt = (upper) => Math.floor(Math.random() * upper)
  // create a map to store the nodes for edge creation
  const nodeMap = new Map()

  // create the nodes
  for (const nodeData of graphData.nodeList) {
    const id = nodeData.id
    const l = nodeData.l
    const node = graph.createNode({
      layout: new Rect(l.x, l.y, l.w, l.h),
      tag: { id, type: getRandomInt(9) }
    })
    nodeMap.set(id, node)

    graph.addLabel(node, `Item \u2116 ${graph.nodes.size}\nType: ${node.tag.type}`)
  }

  for (const edgeData of graphData.edgeList) {
    // get the source and target node from the mapping
    const sourceNode = nodeMap.get(edgeData.s)
    const targetNode = nodeMap.get(edgeData.t)
    // create the source and target port
    const sourcePortLocation = edgeData.sp ? Point.from(edgeData.sp) : sourceNode.layout.center
    const targetPortLocation = edgeData.tp ? Point.from(edgeData.tp) : targetNode.layout.center
    const sourcePort = graph.addPortAt(sourceNode, sourcePortLocation)
    const targetPort = graph.addPortAt(targetNode, targetPortLocation)
    // create the edge
    const edge = graph.createEdge(sourcePort, targetPort)
    graph.addLabel(
      edge,
      `${sourceNode.tag.id}\u2192${targetNode.tag.id}`,
      NinePositionsEdgeLabelModel.CENTER_CENTERED
    )
    // add the bends
    if (edgeData.b != null) {
      const bendData = edgeData.b
      bendData.forEach((bend) => {
        graph.addBend(edge, Point.from(bend))
      })
    }
  }
}

run().then(finishLoading)
