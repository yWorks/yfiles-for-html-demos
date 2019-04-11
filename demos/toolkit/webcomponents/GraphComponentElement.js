/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
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
import { GraphComponent } from 'yfiles'

if (window.customElements) {
  const template = document.createElement('template')

  template.innerHTML = `
<!-- include yfiles styles -->
<!-- these will not interfere with any user defined styles as they are encapsulated in the shadow DOM  -->
<style>
  .yfiles-canvascomponent {
    width: 100%;
    height: 100%;
  }

  .yfiles-canvascomponent, .yfiles-svgpanel {
    position: relative;
  }

  .yfiles-svgpanel {
    /*
      For exact label size measurement, use the below property
      to emphasize geometric precision over legibility and rendering speed.
    */
    /* text-rendering: geometricPrecision; */
  }

  /* Layout the components of a CanvasComponent in a grid */

  .yfiles-canvascomponent {
    position: relative;
    overflow: hidden;
    -ms-touch-action: none;
    touch-action: none;
    /* prevent selecting text by double click */
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .yfiles-canvascomponent .yfiles-svgpanel {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
  }

  /* this is a dummy animation that is used for detecting element insertion into the DOM */
  .yfiles-resize-sensor .yfiles-resize-sensor-expand {
    animation-duration: 0.001s;
    animation-name: yfiles-dom-sensor-inserted;
  }

  @keyframes yfiles-dom-sensor-inserted {
    from { opacity: 0.99; }
    to { opacity: 1; }
  }

  /* Style the scrollbars */

  .yfiles-canvascomponent .yfiles-scrollbar.yfiles-scrollbar-vertical {
    background: #eee;
    width: 15px;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
  }

  .yfiles-canvascomponent .yfiles-scrollbar.yfiles-scrollbar-horizontal {
    background: #eee;
    height: 15px;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .yfiles-canvascomponent .yfiles-scrollbar.yfiles-scrollbar-vertical div {
    /* set the size to all inner elements as well to ensure that none accidentally enlarges the scrollbar */
    width: 15px;
  }

  .yfiles-canvascomponent .yfiles-scrollbar.yfiles-scrollbar-horizontal div {
    /* set the size to all inner elements as well to ensure that none accidentally enlarges the scrollbar */
    height: 15px;
  }

  .yfiles-canvascomponent .yfiles-scrollbar .yfiles-button.yfiles-button-left {
    background: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2215%22%20height%3D%2215%22%3E%3Cpath%20d%3D%22M5%207.5%20L10%204%20L10%2011%20Z%22/%3E%3C/svg%3E");
  }

  .yfiles-canvascomponent .yfiles-scrollbar .yfiles-button.yfiles-button-right {
    background: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2215%22%20height%3D%2215%22%3E%3Cpath%20d%3D%22M5%204%20L10%207.5%20L5%2011%20Z%22/%3E%3C/svg%3E");
  }

  .yfiles-canvascomponent .yfiles-scrollbar .yfiles-button.yfiles-button-up {
    background: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2215%22%20height%3D%2215%22%3E%3Cpath%20d%3D%22M4%2010%20L7.5%205%20L11%2010%20Z%22/%3E%3C/svg%3E");
  }

  .yfiles-canvascomponent .yfiles-scrollbar .yfiles-button.yfiles-button-down {
    background: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2215%22%20height%3D%2215%22%3E%3Cpath%20d%3D%22M4%205%20L11%205%20L7.5%2010%20Z%22/%3E%3C/svg%3E");
  }

  .yfiles-canvascomponent .yfiles-scrollbar .yfiles-button:not(.yfiles-button-disabled):hover {
    background-color: #bbb;
  }

  .yfiles-canvascomponent .yfiles-scrollbar .yfiles-button.yfiles-button-disabled {
    opacity: 0.3;
  }

  .yfiles-canvascomponent .yfiles-scrollbar, .yfiles-canvascomponent .yfiles-scrollbar-range, .yfiles-canvascomponent .yfiles-scrollbar-range-content {
    background-color: transparent;
  }

  .yfiles-canvascomponent .yfiles-scrollbar-range.yfiles-scrollbar-range-vertical .yfiles-scrollbar-slider {
    border: none;
    background: #cccccc;
    border-radius: 0;
    width: 15px;
  }

  .yfiles-canvascomponent .yfiles-scrollbar-range.yfiles-scrollbar-range-horizontal .yfiles-scrollbar-slider {
    border: none;
    background: #cccccc;
    border-radius: 0;
    height: 15px;
  }

  .yfiles-canvascomponent .yfiles-scrollbar-range.yfiles-scrollbar-range-horizontal .yfiles-scrollbar-slider:hover,
  .yfiles-canvascomponent .yfiles-scrollbar-range.yfiles-scrollbar-range-vertical .yfiles-scrollbar-slider:hover {
    background: #bbb;
  }

  .yfiles-canvascomponent .yfiles-scrollbar-range.yfiles-scrollbar-range-horizontal .yfiles-scrollbar-slider .yfiles-scrollbar-slider-dragging,
  .yfiles-canvascomponent .yfiles-scrollbar-range.yfiles-scrollbar-range-vertical .yfiles-scrollbar-slider .yfiles-scrollbar-slider-dragging {
    background: #9B9B9B;
  }

  .yfiles-canvascomponent .yfiles-scrollbar .yfiles-button:not(.yfiles-button-disabled).yfiles-scrollbar-button-down {
    background-color: #9b9b9b;
  }

  /* Layout the scrollbars */

  .yfiles-canvascomponent .yfiles-scrollbar div {
    overflow: hidden;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  .yfiles-canvascomponent .yfiles-scrollbar-content {
    cursor: default;
  }

  .yfiles-canvascomponent .yfiles-scrollbar > div {
    position: absolute;
  }

  .yfiles-canvascomponent .yfiles-scrollbar .yfiles-scrollbar-range.yfiles-scrollbar-range-horizontal {
    left: 15px;
    right: 15px;
    top: 0;
    bottom: 0;
    height: 15px;
  }

  .yfiles-canvascomponent .yfiles-scrollbar .yfiles-scrollbar-range.yfiles-scrollbar-range-vertical {
    width: 15px;
    left: 0;
    right: 0;
    top: 15px;
    bottom: 15px;
  }

  .yfiles-canvascomponent .yfiles-scrollbar .yfiles-scrollbar-range-content, .yfiles-canvascomponent .yfiles-scrollbar .yfiles-scrollbar-slider-content {
    /* set maximum size in both dimension and override for specific elements if required */
    width: 100%;
    height: 100%;
  }

  .yfiles-canvascomponent .yfiles-scrollbar .yfiles-button {
    color: #000;
    width: 15px;
    height: 15px;
    font-size: 10px;
    line-height: 15px;
    text-align: center;
    vertical-align: middle;
    position: absolute;
    border: none;
    border-radius: 0;
  }

  .yfiles-canvascomponent .yfiles-scrollbar .yfiles-button-left {
    left: 0;
    top: 0;
    bottom: 0;
  }

  .yfiles-canvascomponent .yfiles-scrollbar .yfiles-button-right {
    right: 0;
    top: 0;
    bottom: 0;
  }

  .yfiles-canvascomponent .yfiles-scrollbar .yfiles-button-up {
    left: 0;
    right: 0;
    top: 0;
  }

  .yfiles-canvascomponent .yfiles-scrollbar .yfiles-button-down {
    left: 0;
    right: 0;
    bottom: 0;
  }

  /* Misc styling */

  .yfiles-canvascomponent, .yfiles-canvascomponent-svg {
    outline: 0;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  .yfiles-canvascomponent-svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .yfiles-tooltip {
    font-size: 10pt;
    background-color: #ffffd0;
    border: 1px solid black;
    padding: 2px;
    position: absolute;
    overflow: visible;
  }

  .yfiles-dropshadow-image {
    pointer-events: none;
  }

  .yfiles-canvascomponent .yfiles-labeleditbox-container {
    border: 1px solid black;
    background-color: white;
    padding: 2px;
  }

  .yfiles-canvascomponent .yfiles-labeleditbox-container:focus {
    outline: none;
  }

  .yfiles-canvascomponent .yfiles-labeleditbox {
    box-sizing: border-box; /* box model is crucial for measuring */
    resize: none;
    overflow: hidden;
    width: 100%;
    height: 100%;
    background-color: transparent;
    border: 0 none;
    padding: 0;
    line-height: normal;
    font-family: sans-serif;
    font-size: 10pt;
    font-stretch: normal;
    font-style: normal;
    font-variant: normal;
    font-weight: 400;
    text-decoration: none;
    text-transform: none;
    letter-spacing: normal;
    word-spacing: 0;
    outline: none;
    white-space: pre;
  }

  .yfiles-collapsebutton {
    cursor: pointer;
  }

  .yfiles-overlaypanel {
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
  }

  .yfiles-canvascomponent ::-webkit-scrollbar {
    -webkit-appearance: none;
  }
</style>
<slot></slot>
`

  const shadowRootPrivate = Symbol('shadowRoot')

  /**
   * A custom element that displays a graph using a {@link GraphComponent}. It reflects the GraphComponent's
   * zoom property to an attribute. Its contents are created by cloning a template.
   */
  class GraphComponentElement extends HTMLElement {
    /**
     * Lists for which attributes the attributeChangedCallback will be called.
     */
    static get observedAttributes() {
      return ['zoom']
    }

    /**
     * This will be called every time the element is inserted into the DOM.
     */
    connectedCallback() {
      // create a shadow root for this element "mode: 'open'" would work just as well.
      const shadowRoot = (this[shadowRootPrivate] = this.attachShadow({ mode: 'closed' }))

      // clone the template
      const stamped = template.content.cloneNode(true)
      this.$yfilesStyles = stamped.querySelector('style')

      // if we reconnect - we clean up the old component.
      if (this.$graphComponent) {
        this.$graphComponent.cleanUp()
      }

      this.$graphComponent = new GraphComponent()
      this.$isInShadowRoot = true

      stamped.appendChild(this.$graphComponent.div)

      // append the template and the GraphComponent div to the shadow root so that they are encapsulated
      shadowRoot.appendChild(stamped)

      // reflect the initial zoom value to the zoom attribute
      this.setAttribute('zoom', this.$graphComponent.zoom.toString())
      // listen to changes in the zoom level and reflect them to the zoom attribute
      this.$graphComponent.addZoomChangedListener(() => {
        this.setAttribute('zoom', this.$graphComponent.zoom.toString())
      })
    }

    /**
     * This will be called when an attribute was added, removed, updated, or replaced.
     *
     * Only attributes listed in the {@link observedAttributes} property will receive this callback.
     */
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) {
        return
      }
      switch (name) {
        case 'zoom':
          try {
            // set the zoom to the new value if it can be parsed as a number
            this.zoom = parseFloat(newValue)
          } catch (e) {
            // if parsing fails, set the attribute value to the current zoom level to keep the
            // GraphControls zoom value in sync with the attribute of the element
            this.setAttribute('zoom', this.$graphComponent.zoom.toString())
          }
          break
      }
    }

    get zoom() {
      return this.getAttribute('zoom')
    }

    set zoom(value) {
      if (typeof value === 'number') {
        this.$graphComponent.zoom = value
      }
    }

    get inputMode() {
      return this.$graphComponent.inputMode
    }

    set inputMode(value) {
      this.$graphComponent.inputMode = value
    }

    get graph() {
      return this.$graphComponent.graph
    }

    fitGraphBounds() {
      this.$graphComponent.fitGraphBounds()
    }

    /**
     * Toggles whether the children of this element should reside inside its shadow root or not.
     */
    toggleShadowRoot() {
      if (this.$isInShadowRoot) {
        this.appendChild(this.$graphComponent.div)
        this.appendChild(this.$yfilesStyles)
      } else {
        const shadowRoot = this[shadowRootPrivate]
        shadowRoot.appendChild(this.$graphComponent.div)
        shadowRoot.appendChild(this.$yfilesStyles)
      }
      this.$isInShadowRoot = !this.$isInShadowRoot
    }
  }

  // register the custom element with the browser
  window.customElements.define('graph-component', GraphComponentElement)
}
