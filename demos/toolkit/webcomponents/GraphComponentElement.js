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
import { GraphComponent, IGraph, IInputMode } from 'yfiles'

import { applyDemoTheme } from 'demo-resources/demo-styles'

if (window.customElements) {
  const template = document.createElement('template')

  template.innerHTML = `
<!-- include styles -->
<!-- these will not interfere with any user defined styles as they are encapsulated in the shadow DOM  -->
<style>
  .yfiles-canvascomponent {
    width: 100%;
    height: 100%;
  }
</style>
<slot></slot>
`

  /**
   * A custom element that displays a graph using a {@link GraphComponent}.
   * It reflects the GraphComponent's zoom property to an attribute.
   * Its contents are created by cloning a template.
   */
  class GraphComponentElement extends HTMLElement {
    _shadowRoot = null
    _graphComponent = null
    isInShadowRoot = false
    componentStyles = null

    /**
     * Lists for which attributes the attributeChangedCallback will be called.
     * @type {!Array.<string>}
     */
    static get observedAttributes() {
      return ['zoom']
    }

    /**
     * This will be called every time the element is inserted into the DOM.
     */
    connectedCallback() {
      // create a shadow root for this element "mode: 'open'" would work just as well.
      this._shadowRoot = this.attachShadow({ mode: 'closed' })

      // clone the template
      const stamped = template.content.cloneNode(true)

      // if we reconnect - we clean up the old component.
      if (this._graphComponent) {
        this._graphComponent.cleanUp()
      }

      this._graphComponent = new GraphComponent()
      applyDemoTheme(this._graphComponent)
      this.isInShadowRoot = true

      stamped.appendChild(this.graphComponent.div)

      // append the template and the GraphComponent div to the shadow root so that they are encapsulated
      this._shadowRoot.appendChild(stamped)

      // reflect the value of the graphComponent's zoom property as an HTML attribute
      this.updateZoomAttribute()
      // listen to changes in the graphComponent's zoom property (which may happend e.g. after a
      // fitGraphBounds call) and update the corresponding HTML attribute accordingly
      this.graphComponent.addZoomChangedListener(() => this.updateZoomAttribute())
    }

    /**
     * This will be called when an attribute was added, removed, updated, or replaced.
     *
     * Only attributes listed in the {@link observedAttributes} property will receive this callback.
     * @param {!string} name
     * @param {!string} oldValue
     * @param {!string} newValue
     */
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) {
        return
      }
      switch (name) {
        case 'zoom':
          try {
            // set the zoom to the new value if it can be parsed as a number
            this.graphComponent.zoom = parseFloat(newValue)
          } catch (e) {
            // if parsing fails, set the attribute value to the current zoom level to keep the
            // graphComponent's zoom value in sync with the attribute of the element
            this.updateZoomAttribute()
          }
          break
      }
    }

    /**
     * Gets the zoom factor of this element's associated graph component.
     * @type {number}
     */
    get zoom() {
      return this.graphComponent.zoom
    }

    /**
     * Sets the zoom factor of this element's associated graph component.
     * @type {number}
     */
    set zoom(value) {
      this.graphComponent.zoom = value
    }

    /**
     * Gets the input mode for this element's associated graph component.
     * @type {?IInputMode}
     */
    get editMode() {
      return this.graphComponent.inputMode
    }

    /**
     * Sets the input mode for this element's associated graph component.
     * @type {?IInputMode}
     */
    set editMode(value) {
      this.graphComponent.inputMode = value
    }

    /**
     * Gets the graph of this element's associated graph component.
     * @type {!IGraph}
     */
    get graph() {
      return this.graphComponent.graph
    }

    /**
     * Centers the graph of this element's associated graph component in said graph component's
     * visible area.
     */
    fitGraphBounds() {
      this.graphComponent.fitGraphBounds()
    }

    /**
     * Toggles whether the children of this element should reside inside its shadow root or not.
     */
    toggleShadowRoot() {
      if (this.isInShadowRoot) {
        this.componentStyles = this._shadowRoot.querySelectorAll('style')
        this.setParent(this)
      } else {
        this.setParent(this._shadowRoot)
      }
      this.isInShadowRoot = !this.isInShadowRoot
    }

    /**
     * Sets the parent node for this element's associated graph Component and the corresponding
     * style children.
     * @param {!Node} parent
     */
    setParent(parent) {
      parent.appendChild(this.graphComponent.div)

      const styles = this.componentStyles
      for (let i = 0; i < styles.length; i++) {
        parent.appendChild(styles[i])
      }
    }

    /**
     * Reflects the associated graphComponent's zoom property as HTML attribute.
     */
    updateZoomAttribute() {
      this.setAttribute('zoom', this.graphComponent.zoom.toString())
    }

    /**
     * @type {!GraphComponent}
     */
    get graphComponent() {
      return this._graphComponent
    }
  }

  // register the custom element with the browser
  window.customElements.define('graph-component', GraphComponentElement)
}
