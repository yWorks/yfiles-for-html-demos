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
import { GraphEditorInputMode, IGraph, IInputMode, License, Rect, ShapeNodeStyle } from 'yfiles'
import { fetchLicense } from '../../resources/fetch-license.js'

import './GraphComponentElement.js'
import { createDemoEdgeStyle } from '../../resources/demo-styles.js'

// wait for the custom graph-component element to be defined
if (window.customElements) {
  window.customElements.whenDefined('graph-component').then(run)
} else {
  const warningDiv = document.createElement('div')
  document.querySelector('.demo-content').appendChild(warningDiv)
  warningDiv.outerHTML = `
    <div style="padding: 50px; margin-top: 100px;">
      <p style="font-size: 2rem;">Your browser does not support Web Components.</p>
      <p> See <a href="https://www.webcomponents.org/">webcomponents.org</a> and
        <a href="https://caniuse.com/#search=web%20components">caniuse.com</a> for details on browser support for Web Components.
      </p>
    </div>
`
}

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

  document.querySelector('.demo-content').appendChild(graphComponent)

  graphComponent.editMode = new GraphEditorInputMode()

  // initialize graph
  initializeGraph(graphComponent.graph)

  registerCommands(graphComponent)

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

  // create small sample graph
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
function registerCommands(graphComponent) {
  addClickListener("button[data-command='ZoomIn']", () => {
    graphComponent.zoom *= 1.25
  })
  addClickListener("button[data-command='ZoomOut']", () => {
    graphComponent.zoom *= 0.8
  })
  addClickListener("button[data-command='FitContent']", () => {
    graphComponent.fitGraphBounds()
  })
  addClickListener("button[data-command='ZoomOriginal']", () => {
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
