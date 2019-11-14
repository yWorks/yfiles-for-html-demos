/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
;(() => {
  // wait for the custom graph-component element to be defined
  if (window.customElements && 'import' in document.createElement('link')) {
    window.customElements.whenDefined('graph-component').then(() => {
      run()
    })
  } else {
    document.querySelector('#graphComponent').innerHTML = `<div style="padding: 50px">
            <p style="font-size: 2rem;">Your browser doesn't support Web Components.</p>
            <p> See <a href="https://www.webcomponents.org/">webcomponents.org</a> and 
            <a href="https://caniuse.com/#search=web%20components">caniuse.com</a> for details on browser support for 
            Web Components.</p>
        </div>`
  }

  /* eslint-disable no-undef */

  /** @type {GraphComponent} */
  let graphComponent = null

  function run() {
    demoBrowserSupport.enableWorkarounds(yfiles)

    // create a custom graph component element
    graphComponent = document.querySelector('#graphComponent')
    graphComponent.inputMode = new yfiles.input.GraphEditorInputMode()

    // initialize graph
    initializeGraph(graphComponent.graph)

    registerCommands()

    // center graph
    graphComponent.fitGraphBounds()

    defineShadowDomHelper()
  }

  /**
   * @param {yfiles.graph.IGraph} graph
   */
  function initializeGraph(graph) {
    // initialize default styles
    graph.nodeDefaults.style = new yfiles.styles.ShapeNodeStyle({
      fill: 'black',
      stroke: 'white',
      shape: 'rectangle'
    })
    graph.edgeDefaults.style = new yfiles.styles.PolylineEdgeStyle({
      targetArrow: yfiles.styles.IArrow.DEFAULT
    })

    // create small sample graph
    const node1 = graph.createNode(new yfiles.geometry.Rect(50, 50, 30, 30))
    const node2 = graph.createNode(new yfiles.geometry.Rect(0, 150, 30, 30))
    const node3 = graph.createNode(new yfiles.geometry.Rect(100, 150, 30, 30))
    graph.createEdge(node1, node2)
    graph.createEdge(node1, node3)
  }

  /**
   * Wires up the UI.
   */
  function registerCommands() {
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
})()
