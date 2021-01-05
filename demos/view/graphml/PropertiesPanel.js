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
import { HashMap, IEdge, IModelItem, INode, IPort, KeyScope, KeyType, List } from 'yfiles'
import PropertiesPanelUI from './PropertiesPanelUI.js'

/**
 * A panel that displays custom data associated with the graph and the current item.
 */
export class PropertiesPanel {
  /**
   * @param {HTMLElement} div
   */
  constructor(div) {
    this.itemMap = new HashMap()
    /** @type {HashMap.<GraphMLProperty,>} */
    this.graphMap = new HashMap()
    this.currentItem = null
    this.ui = new PropertiesPanelUI(div)

    // register the callback that is called when a new item property has been added
    this.ui.itemPropertyAddedCallback = (name, value) => {
      const scope = this.getCurrentItemScope()
      if (scope !== null) {
        const property = this.addItemProperty(name, KeyType.STRING, scope)
        this.setItemProperty(this.currentItem, property, value)
        this.ui.addItemProperty(property, value)
      }
      this.onSomethingChanged()
    }
    // register the callback that is called when a new graph property has been added
    this.ui.graphPropertyAddedCallback = (name, value) => {
      const property = this.addGraphProperty(name, KeyType.STRING)
      this.setGraphProperty(property, value)
      this.ui.addGraphProperty(property, value)
      this.onSomethingChanged()
    }
    // register the callback that is called when an item property's value has changed
    this.ui.itemValueChangedCallback = (property, newVal) => {
      const val = PropertiesPanel.parseValue(newVal, property.type)
      this.setItemProperty(this.currentItem, property, val)
      this.onSomethingChanged()
    }
    // register the callback that is called when a graph property's value has changed
    this.ui.graphValueChangedCallback = (property, newVal) => {
      const val = PropertiesPanel.parseValue(newVal, property.type)
      this.setGraphProperty(property, val)
      this.onSomethingChanged()
    }
  }

  /**
   * Gets the graph and item properties.
   * @type {IEnumerable.<GraphMLProperty>}
   */
  get properties() {
    const list = new List()
    list.addRange(this.itemMap.keys)
    list.addRange(this.graphMap.keys)
    return list
  }

  /**
   * Adds a new item property with the given name, type and scope.
   * @param {string} propertyName
   * @param {KeyType} type
   * @param {KeyScope} keyScope
   * @return {GraphMLProperty}
   */
  addItemProperty(propertyName, type, keyScope) {
    const property = new GraphMLProperty()
    property.name = propertyName
    property.type = type
    property.keyScope = keyScope

    this.itemMap.set(property, new HashMap())
    return property
  }

  /**
   * Adds a new graph property with the given name and type.
   * @param {string} propertyName
   * @param {KeyType} type
   * @return {GraphMLProperty}
   */
  addGraphProperty(propertyName, type) {
    const property = new GraphMLProperty()
    property.name = propertyName
    property.type = type
    property.keyScope = KeyScope.GRAPH

    this.graphMap.set(property, null)
    return property
  }

  /**
   * Gets the value for a given item and property.
   * @param {GraphMLProperty} property
   * @param {IModelItem} item
   * @return {Object}
   */
  getItemValue(property, item) {
    const propertyDict = this.itemMap.get(property)
    if (propertyDict.has(item)) {
      return this.itemMap.get(property).get(item)
    }
    return null
  }

  /**
   * Sets the property value for a given item.
   * @param {IModelItem} item
   * @param {GraphMLProperty} property
   * @param {object} value
   */
  setItemProperty(item, property, value) {
    const dict = this.itemMap.get(property)
    dict.set(item, value)
  }

  /**
   * Gets the graph value for the given property.
   * @param {GraphMLProperty} property
   * @return {Object}
   */
  getGraphValue(property) {
    if (this.graphMap.has(property)) {
      return this.graphMap.get(property)
    }
    return null
  }

  /**
   * Sets the graph value for the given property.
   * @param {GraphMLProperty} property
   * @param {object} value
   */
  setGraphProperty(property, value) {
    this.graphMap.set(property, value)
  }

  /**
   * Clears the current properties.
   */
  clear() {
    this.itemMap.clear()
    this.graphMap.clear()
    this.ui.clearAllProperties()
  }

  /**
   * Sets the item that is currently being displayed.
   * @param {IModelItem} currentItem
   */
  setCurrentItem(currentItem) {
    this.ui.setCurrentItemVisibility(currentItem !== null)
    this.ui.clearItemProperties()
    this.currentItem = currentItem
    this.itemMap.keys.forEach(property => {
      if (PropertiesPanel.suitsScope(currentItem, property.keyScope)) {
        this.ui.addItemProperty(property, this.getItemValue(property, currentItem))
      }
    })
  }

  /**
   * Displays the graph properties in the UI after all properties have been added.
   */
  showGraphProperties() {
    this.graphMap.keys.forEach(property => {
      this.ui.addGraphProperty(property, this.graphMap.get(property))
    })
  }

  /**
   * Parses the string value for the given key type.
   * @param {string} newVal The value to parse
   * @param {KeyType} keyType The target type
   * @return {Object} The parsed value.
   */
  static parseValue(newVal, keyType) {
    let val = newVal
    switch (keyType) {
      case KeyType.INT:
        val = Number.parseInt(newVal)
        break
      case KeyType.LONG:
        val = Number.parseInt(newVal)
        break
      case KeyType.FLOAT:
        val = Number.parseFloat(newVal)
        break
      case KeyType.DOUBLE:
        val = Number.parseFloat(newVal)
        break
      case KeyType.BOOLEAN:
        val = newVal
        break
      default:
    }
    return val
  }

  /**
   * Gets the scope that fits the current item.
   * @return {KeyScope}
   */
  getCurrentItemScope() {
    if (INode.isInstance(this.currentItem)) {
      return KeyScope.NODE
    }
    if (IEdge.isInstance(this.currentItem)) {
      return KeyScope.EDGE
    }
    if (IPort.isInstance(this.currentItem)) {
      return KeyScope.PORT
    }
    return null
  }

  /**
   * Checks if the given item suits the given scope.
   * @param {IModelItem} modelItem
   * @param {KeyScope} scope
   * @return {boolean}
   */
  static suitsScope(modelItem, scope) {
    switch (scope) {
      case KeyScope.ALL:
        return true
      case KeyScope.NODE:
        return INode.isInstance(modelItem)
      case KeyScope.EDGE:
        return IEdge.isInstance(modelItem)
      case KeyScope.PORT:
        return IPort.isInstance(modelItem)
      default:
        return false
    }
  }

  /**
   * Called when data has changed.
   * @param {function} listener the listener which gets notified when something changed.
   */
  addSomethingChangedListener(listener) {
    this.somethingChangedListener = listener
  }

  /**
   * Called when data has changed.
   */
  removeSomethingChangedListener() {
    this.somethingChangedListener = null
  }

  /**
   * Notifies the listener if there is one that something changed.
   */
  onSomethingChanged() {
    if (this.somethingChangedListener !== null) {
      this.somethingChangedListener()
    }
  }
}

/**
 * Models a property of the GraphML content.
 */
export class GraphMLProperty {
  constructor() {
    /** @type {Object} */
    this.defaultValue = null

    /** @type {boolean} */
    this.defaultExists = false

    /** @type {string} */
    this.name = null

    /** @type {KeyType} */
    this.type = KeyType.INT

    /** @type {KeyScope} */
    this.keyScope = KeyScope.ALL
  }
}
