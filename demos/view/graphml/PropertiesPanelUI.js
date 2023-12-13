/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
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
/**
 * Properties Panel.
 */
export default class PropertiesPanelUI {
  graphPropertiesDiv
  itemPropertiesDiv
  itemPropertiesPanel
  reentrantFlag = false
  // prepare callback hooks, they will be assigned in PropertiesPanel
  itemPropertyAddedCallback = () => {}
  graphPropertyAddedCallback = () => {}
  itemValueChangedCallback = () => {}
  graphValueChangedCallback = () => {}

  /**
   * @param {!HTMLElement} div
   */
  constructor(div) {
    this.div = div
    this.graphPropertiesDiv = getDiv(div, '#graphPropertiesDiv')
    this.itemPropertiesDiv = getDiv(div, '#itemPropertiesDiv')
    this.itemPropertiesPanel = getDiv(div, '.custom-data-panel.item-data')
    this.itemPropertiesPanel.style.display = 'none'
    this.initializeNewPropertyListeners()
  }

  /**
   * Adds a graph property to the panel.
   * @param {!GraphMLProperty} property
   * @param {!string} value
   */
  addGraphProperty(property, value) {
    const container = this.createChildElement(property, value, this.graphValueChangedCallback)
    this.graphPropertiesDiv.appendChild(container)
  }

  /**
   * Adds an item property to the panel.
   * @param {!GraphMLProperty} property
   * @param {!string} value
   */
  addItemProperty(property, value) {
    const container = this.createChildElement(property, value, this.itemValueChangedCallback)
    this.itemPropertiesDiv.appendChild(container)
  }

  /**
   * Clears all item properties from the panel.
   */
  clearItemProperties() {
    while (this.itemPropertiesDiv.lastChild) {
      this.itemPropertiesDiv.removeChild(this.itemPropertiesDiv.lastChild)
    }
  }

  /**
   * Clears all properties from the panel.
   */
  clearAllProperties() {
    while (this.graphPropertiesDiv.lastChild) {
      this.graphPropertiesDiv.removeChild(this.graphPropertiesDiv.lastChild)
    }

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
   * @returns {!Element} the UI element
   * @param {!GraphMLProperty} property
   * @param {!string} value
   * @param {!function} callback
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
    const elGraph = getDiv(this.div, '.new-property-div.graph-data')
    const inputsGraph = elGraph.querySelectorAll('input')
    const nameInputGraph = inputsGraph[0]
    const valueInputGraph = inputsGraph[1]

    const graphDataListener = (event) => {
      if (event.key === 'Enter') {
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

    const elItem = getDiv(this.div, '.new-property-div.item-data')

    const inputsItem = elItem.querySelectorAll('input')
    const nameInputItem = inputsItem[0]
    const valueInputItem = inputsItem[1]

    const itemDataListener = (event) => {
      if (event.key === 'Enter') {
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

/**
 * @param {!HTMLElement} parent
 * @param {!string} selector
 * @returns {!HTMLDivElement}
 */
function getDiv(parent, selector) {
  return parent.querySelector(selector)
}
