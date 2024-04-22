/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { GraphEditorInputMode, IGraph, IInputMode, License, Rect, ShapeNodeStyle } from 'yfiles'
import { fetchLicense } from 'demo-resources/fetch-license'

import './GraphComponentElement.js'
import { createDemoEdgeStyle } from 'demo-resources/demo-styles'

// wait for the custom graph-component element to be defined
window.customElements.whenDefined('graph-component').then(run)

/**
 * @typedef {*} GraphComponentElementType
 */

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  // create a custom graph component element
  const graphComponent = document.createElement('graph-component')
  graphComponent.setAttribute('id', 'graphComponent')

  document.querySelector('.demo-page__main').appendChild(graphComponent)

  graphComponent.editMode = new GraphEditorInputMode()

  // initialize graph
  initializeGraph(graphComponent.graph)

  initializeUI(graphComponent)

  // center graph
  graphComponent.fitGraphBounds()

  defineShadowDomHelper()
}

/**
 * @param {!IGraph} graph
 */
function initializeGraph(graph) {
  // initialize default styles
  graph.nodeDefaults.style = new ShapeNodeStyle({ fill: 'orange' })
  graph.edgeDefaults.style = createDemoEdgeStyle()

  // create a small sample graph
  const node1 = graph.createNode(new Rect(50, 50, 30, 30))
  const node2 = graph.createNode(new Rect(0, 150, 30, 30))
  const node3 = graph.createNode(new Rect(100, 150, 30, 30))
  graph.createEdge(node1, node2)
  graph.createEdge(node1, node3)
}

/**
 * Binds actions to demo's UI controls.
 * @param {!GraphComponentElementType} graphComponent
 */
function initializeUI(graphComponent) {
  addClickListener("button[data-command='INCREASE_ZOOM']", () => {
    graphComponent.zoom *= 1.25
  })
  addClickListener("button[data-command='DECREASE_ZOOM']", () => {
    graphComponent.zoom *= 0.8
  })
  addClickListener("button[data-command='FIT_GRAPH_BOUNDS']", () => {
    graphComponent.fitGraphBounds()
  })
  addClickListener("button[data-command='ZOOM_ORIGINAL']", () => {
    // Demonstrates how changing the 'zoom' HTML attribute of a custom 'graph-component' element
    // will change the 'zoom' property of the corresponding yFiles GraphComponent instance.
    // This approach is meant as a proof-of-concept for reflecting GraphComponent properties as
    // HTML attributes.
    // In a real world application, the class defining the custom 'graph-component' should expose
    // a 'zoom' property of type number and simply forward calls of said property to the zoom
    // property of the associated yFiles GraphComponent instance (i.e. the approach from ZoomIn and
    // ZoomOut above).
    graphComponent.setAttribute('zoom', '1')
  })
  addClickListener('#useShadow', () => {
    graphComponent.toggleShadowRoot()
  })
}

/**
 * Adds the given handler as a listener for click events to the element identified by the given
 * selector.
 * @param {!string} selector
 * @param {!function} handler
 */
function addClickListener(selector, handler) {
  document.querySelector(selector).addEventListener('click', handler)
}

/**
 * Simple auxiliary custom element that puts all its children inside a shadow root
 */
function defineShadowDomHelper() {
  window.customElements.define(
    'shadow-dom',
    class extends HTMLElement {
      connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: 'open' })
        while (this.firstElementChild) {
          shadowRoot.appendChild(this.firstElementChild)
        }
      }
    }
  )
}
