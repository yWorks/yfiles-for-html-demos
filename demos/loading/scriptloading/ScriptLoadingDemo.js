/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
'use strict'

/* global yfiles */

/** @type {GraphComponent} */
let graphComponent = null

const {
  GraphComponent,
  GraphEditorInputMode,
  HierarchicLayout,
  License,
  MinimumNodeSizeStage,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeStyle
} = yfiles

async function run() {
  const response = await fetch('../../../lib/license.json')
  License.value = await response.json()

  // initialize graph component
  graphComponent = new GraphComponent('graphComponent')
  graphComponent.inputMode = new GraphEditorInputMode()

  // initialize graph
  const graph = graphComponent.graph
  graph.undoEngineEnabled = true

  // initialize default styles
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'round-rectangle',
    fill: '#ff6c00',
    stroke: '1.5px #662b00'
  })
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: `1.5px #662b00`,
    targetArrow: `#662b00 small triangle`
  })

  // create small sample graph
  const node1 = graph.createNode(new Rect(50, 50, 30, 30))
  const node2 = graph.createNode(new Rect(0, 150, 30, 30))
  const node3 = graph.createNode(new Rect(100, 150, 30, 30))
  graph.createEdge(node1, node2)
  graph.createEdge(node1, node3)

  // center graph
  graphComponent.fitGraphBounds()

  // initialize layout button
  const element = document.querySelector("button[data-command='Layout']")
  element.addEventListener('click', applyLayout.bind(this))
}

/**
 * Calculates a hierarchic layout for the current graph.
 */
async function applyLayout() {
  setUIDisabled(true)
  const layout = new MinimumNodeSizeStage(new HierarchicLayout())
  try {
    await graphComponent.morphLayout(layout, '1s')
  } catch (error) {
    if (typeof window.reportError === 'function') {
      reportError(error)
    } else {
      throw error
    }
  } finally {
    setUIDisabled(false)
  }
}

/**
 * Disables the layout button and the input mode.
 *
 * @param disabled true if the elements should be disabled, false otherwise
 */
function setUIDisabled(disabled) {
  document.querySelector("button[data-command='Layout']").disabled = disabled
}

// noinspection JSIgnoredPromiseFromCall
run()
