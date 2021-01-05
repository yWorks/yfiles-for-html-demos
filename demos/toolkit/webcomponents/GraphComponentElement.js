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
</style>
<!-- The yfiles stylesheet is included for redundancy here if the 'style' property is not set -->
<link rel="stylesheet" href="../../node_modules/yfiles/yfiles.css">
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
      // if there is an external css style, create a new style element
      if (this.$cssStyle) {
        const styleEl = document.createElement('style')
        styleEl.innerHTML = this.$cssStyle
        stamped.appendChild(styleEl)
      }
      this.$componentStyles = stamped.querySelectorAll('style')

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

    get cssStyle() {
      return this.$cssStyle
    }

    // sets an external CSS style that is added to the web component
    set cssStyle(value) {
      this.$cssStyle = value
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
        Array.prototype.slice.apply(this.$componentStyles).forEach(styleElement => {
          this.appendChild(styleElement)
        })
      } else {
        const shadowRoot = this[shadowRootPrivate]
        shadowRoot.appendChild(this.$graphComponent.div)
        Array.prototype.slice.apply(this.$componentStyles).forEach(styleElement => {
          shadowRoot.appendChild(styleElement)
        })
      }
      this.$isInShadowRoot = !this.$isInShadowRoot
    }
  }

  // register the custom element with the browser
  window.customElements.define('graph-component', GraphComponentElement)
}
