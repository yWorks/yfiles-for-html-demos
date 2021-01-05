/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GraphEditorInputMode,
  IArrow,
  License,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeStyle
} from 'yfiles'
import { enableWorkarounds } from '../../utils/Workarounds.js'
import loadJson from '../../resources/load-json.js'

import './GraphComponentElement.js'

// wait for the custom graph-component element to be defined
if (window.customElements) {
  window.customElements.whenDefined('graph-component').then(loadJson).then(run)
} else {
  const warningDiv = document.createElement('div')
  document.querySelector('.demo-content').appendChild(warningDiv)
  warningDiv.outerHTML = `
    <div style="padding: 50px; margin-top: 100px;">
      <p style="font-size: 2rem;">Your browser doesn't support Web Components.</p>
      <p> See <a href="https://www.webcomponents.org/">webcomponents.org</a> and
        <a href="https://caniuse.com/#search=web%20components">caniuse.com</a> for details on browser support for Web Components.
      </p>
    </div>
`
}

async function run(licenseData) {
  License.value = licenseData
  enableWorkarounds()

  // create a custom graph component element
  const graphComponent = document.createElement('graph-component')
  graphComponent.setAttribute('id', 'graphComponent')

  // load yFiles.css since the CSS has to be set when the GraphComponent is initialized
  // simply including a <link> in the webcomponent is not enough, since it is loaded in a non-blocking way
  const response = await fetch('../../node_modules/yfiles/yfiles.css')

  if (response.status === 200) {
    // set loaded CSS
    graphComponent.cssStyle = await response.text()
  }

  document.querySelector('.demo-content').appendChild(graphComponent)

  graphComponent.inputMode = new GraphEditorInputMode()

  // initialize graph
  initializeGraph(graphComponent.graph)

  registerCommands(graphComponent)

  // center graph
  graphComponent.fitGraphBounds()

  defineShadowDomHelper()
}

function initializeGraph(graph) {
  // initialize default styles
  graph.nodeDefaults.style = new ShapeNodeStyle({
    fill: 'orange',
    stroke: 'white',
    shape: 'rectangle'
  })
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    targetArrow: IArrow.DEFAULT
  })

  // create small sample graph
  const node1 = graph.createNode(new Rect(50, 50, 30, 30))
  const node2 = graph.createNode(new Rect(0, 150, 30, 30))
  const node3 = graph.createNode(new Rect(100, 150, 30, 30))
  graph.createEdge(node1, node2)
  graph.createEdge(node1, node3)
}

/**
 * Wires up the UI.
 */
function registerCommands(graphComponent) {
  document.querySelector("button[data-command='ZoomIn']").addEventListener('click', () => {
    graphComponent.zoom *= 1.2
  })
  document.querySelector("button[data-command='ZoomOut']").addEventListener('click', () => {
    graphComponent.zoom /= 1.2
  })
  document.querySelector("button[data-command='FitContent']").addEventListener('click', () => {
    graphComponent.fitGraphBounds()
  })
  document.querySelector("button[data-command='ZoomOriginal']").addEventListener('click', () => {
    graphComponent.zoom = 1
  })
  document.querySelector('#useShadow').addEventListener('click', () => {
    graphComponent.toggleShadowRoot()
  })
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
