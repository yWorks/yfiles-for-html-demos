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

define([], () => {
  /**
   * Properties Panel.
   */
  class PropertiesPanelUI {
    /**
     * @param {HTMLElement} div
     */
    constructor(div) {
      this.div = div
      this.graphMapping = {}
      this.itemMapping = {}
      this.graphPropertiesDiv = div.querySelector('#graphPropertiesDiv')
      this.itemPropertiesDiv = div.querySelector('#itemPropertiesDiv')
      this.itemPropertiesPanel = div.querySelector('.custom-data-panel.item-data')
      this.itemPropertiesPanel.style.display = 'none'
      this.initializeNewPropertyListeners()

      this.reentrantFlag = false

      // prepare callback hooks, they will be assigned in PropertiesPanel
      this.itemPropertyAddedCallback = null
      this.graphPropertyAddedCallback = null
      this.itemValueChangedCallback = null
      this.graphValueChangedCallback = null
    }

    /**
     * Adds a graph property to the panel.
     * @param {GraphMLProperty} property
     * @param {string} value
     */
    addGraphProperty(property, value) {
      const container = this.createChildElement(property, value, this.graphValueChangedCallback)
      this.graphMapping[property] = container

      this.graphPropertiesDiv.appendChild(container)
    }

    /**
     * Adds an item property to the panel.
     * @param {GraphMLProperty} property
     * @param {string} value
     */
    addItemProperty(property, value) {
      const container = this.createChildElement(property, value, this.itemValueChangedCallback)
      this.itemMapping[property] = container

      this.itemPropertiesDiv.appendChild(container)
    }

    /**
     * Clears all item properties from the panel.
     */
    clearItemProperties() {
      while (this.itemPropertiesDiv.firstChild) {
        this.itemPropertiesDiv.removeChild(this.itemPropertiesDiv.firstChild)
      }
      this.itemMapping = {}
    }

    /**
     * Clears all properties from the panel.
     */
    clearAllProperties() {
      while (this.graphPropertiesDiv.firstChild) {
        this.graphPropertiesDiv.removeChild(this.graphPropertiesDiv.firstChild)
      }
      this.graphMapping = {}

      this.clearItemProperties()
    }

    /**
     * Sets whether or not the items properties are visible. They may be hidden when no graph element is selected.
     * @param {boolean} visible
     */
    setCurrentItemVisibility(visible) {
      this.itemPropertiesPanel.style.display = visible ? 'block' : 'none'
    }

    /**
     * Creates a child element that represents an item/graph property.
     * @param {GraphMLProperty} property
     * @param {string} value
     * @param {function} callback
     * @return {Element} the UI element
     */
    createChildElement(property, value, callback) {
      const container = document.createElement('div')
      container.setAttribute('class', 'property')

      const label = document.createElement('span')
      label.textContent = property.name
      label.setAttribute('class', 'property-label')

      const textField = document.createElement('input')
      textField.type = 'text'
      textField.setAttribute('class', 'property-value')

      textField.value = value
      textField['data-value'] = value

      textField.addEventListener(
        'change',
        () => {
          if (callback && !this.reentrantFlag) {
            this.reentrantFlag = true
            callback(property, textField.value)
            this.reentrantFlag = false
          }
        },
        false
      )

      container.appendChild(label)
      container.appendChild(textField)

      return container
    }

    /**
     * Initialize listeners that are called when new properties are entered in the panel.
     */
    initializeNewPropertyListeners() {
      const elGraph = this.div.querySelector('.new-property-div.graph-data')
      const inputsGraph = elGraph.querySelectorAll('input')
      const nameInputGraph = inputsGraph[0]
      const valueInputGraph = inputsGraph[1]

      const graphDataListener = event => {
        const key = event.which || event.keyCode
        if (key === 13) {
          if (this.graphPropertyAddedCallback && nameInputGraph.value) {
            this.graphPropertyAddedCallback(nameInputGraph.value, valueInputGraph.value)
            nameInputGraph.value = ''
            valueInputGraph.value = ''
          }
          event.preventDefault()
        }
      }
      nameInputGraph.addEventListener('keypress', graphDataListener)
      valueInputGraph.addEventListener('keypress', graphDataListener)

      const elItem = this.div.querySelector('.new-property-div.item-data')

      const inputsItem = elItem.querySelectorAll('input')
      const nameInputItem = inputsItem[0]
      const valueInputItem = inputsItem[1]

      const itemDataListener = event => {
        const key = event.which || event.keyCode
        if (key === 13) {
          if (this.itemPropertyAddedCallback) {
            this.itemPropertyAddedCallback(nameInputItem.value, valueInputItem.value)
            nameInputItem.value = ''
            valueInputItem.value = ''
          }
          event.preventDefault()
        }
      }
      nameInputItem.addEventListener('keypress', itemDataListener)
      valueInputItem.addEventListener('keypress', itemDataListener)
    }
  }

  return PropertiesPanelUI
})
