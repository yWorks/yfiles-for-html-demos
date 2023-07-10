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
import { HashMap, IEdge, IModelItem, INode, IPort, KeyScope, KeyType, List } from 'yfiles'
import { GraphMLProperty } from './GraphMLProperty'
import PropertiesPanelUI from './PropertiesPanelUI'

/**
 * A panel that displays custom data associated with the graph and the current item.
 */
export class PropertiesPanel {
  private itemMap: HashMap<GraphMLProperty, HashMap<IModelItem, any>> = new HashMap()
  private graphMap: HashMap<GraphMLProperty, any> = new HashMap()
  private _currentItem: IModelItem | null = null
  private ui: PropertiesPanelUI
  private somethingChangedListener: () => void = () => {}

  constructor(div: HTMLElement) {
    this.ui = new PropertiesPanelUI(div)

    // register the callback that is called when a new item property has been added
    this.ui.itemPropertyAddedCallback = (name, value) => {
      const scope = this.getCurrentItemScope()
      if (scope) {
        const property = this.addItemProperty(name, KeyType.STRING, scope)
        this.setItemProperty(this.currentItem!, property, value)
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
      this.setItemProperty(this.currentItem!, property, val)
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
   */
  get properties(): List<GraphMLProperty> {
    const list = new List<GraphMLProperty>()
    list.addRange(this.itemMap.keys)
    list.addRange(this.graphMap.keys)
    return list
  }

  /**
   * Adds a new item property with the given name, type and scope.
   */
  addItemProperty(propertyName: string, type: KeyType, keyScope: KeyScope): GraphMLProperty {
    const property = new GraphMLProperty()
    property.name = propertyName
    property.type = type
    property.keyScope = keyScope

    this.itemMap.set(property, new HashMap<IModelItem, any>())
    return property
  }

  /**
   * Adds a new graph property with the given name and type.
   */
  addGraphProperty(propertyName: string, type: KeyType): GraphMLProperty {
    const property = new GraphMLProperty()
    property.name = propertyName
    property.type = type
    property.keyScope = KeyScope.GRAPH

    this.graphMap.set(property, null)
    return property
  }

  /**
   * Gets the value for a given item and property.
   */
  getItemValue(item: IModelItem, property: GraphMLProperty): any {
    const propertiesMap = this.itemMap.get(property)
    if (propertiesMap && propertiesMap.has(item)) {
      return propertiesMap.get(item)
    }
    return null
  }

  /**
   * Sets the property value for a given item.
   */
  setItemProperty(item: IModelItem, property: GraphMLProperty, value: any): void {
    const propertiesMap = this.itemMap.get(property)
    if (propertiesMap) {
      propertiesMap.set(item, value)
    }
  }

  /**
   * Gets the graph value for the given property.
   */
  getGraphValue(property: GraphMLProperty): any {
    if (this.graphMap.has(property)) {
      return this.graphMap.get(property)
    }
    return null
  }

  /**
   * Sets the graph value for the given property.
   */
  setGraphProperty(property: GraphMLProperty, value: any): void {
    this.graphMap.set(property, value)
  }

  /**
   * Clears the current properties.
   */
  clear(): void {
    this.itemMap.clear()
    this.graphMap.clear()
    this.ui.clearAllProperties()
  }

  get currentItem(): IModelItem | null {
    return this._currentItem
  }

  /**
   * Sets the item that is currently being displayed.
   */
  set currentItem(currentItem: IModelItem | null) {
    this.ui.setCurrentItemVisibility(!!currentItem)
    this.ui.clearItemProperties()
    this._currentItem = currentItem

    if (currentItem) {
      this.itemMap.keys.forEach(property => {
        if (PropertiesPanel.suitsScope(currentItem, property.keyScope)) {
          this.ui.addItemProperty(property, this.getItemValue(currentItem, property))
        }
      })
    }
  }

  /**
   * Displays the graph properties in the UI after all properties have been added.
   */
  showGraphProperties(): void {
    this.graphMap.keys.forEach(property => {
      this.ui.addGraphProperty(property, this.graphMap.get(property))
    })
  }

  /**
   * Parses the string value for the given key type.
   * @param newVal The value to parse
   * @param keyType The target type
   * @returns The parsed value.
   */
  private static parseValue(newVal: string, keyType: KeyType): any {
    switch (keyType) {
      case KeyType.INT:
        return Number.parseInt(newVal)
      case KeyType.LONG:
        return Number.parseInt(newVal)
      case KeyType.FLOAT:
        return Number.parseFloat(newVal)
      case KeyType.DOUBLE:
        return Number.parseFloat(newVal)
      case KeyType.BOOLEAN:
        return !!newVal
      default:
        return newVal
    }
  }

  /**
   * Gets the scope that fits the current item.
   */
  private getCurrentItemScope(): KeyScope | null {
    if (this.currentItem instanceof INode) {
      return KeyScope.NODE
    }
    if (this.currentItem instanceof IEdge) {
      return KeyScope.EDGE
    }
    if (this.currentItem instanceof IPort) {
      return KeyScope.PORT
    }
    return null
  }

  /**
   * Checks if the given item suits the given scope.
   */
  private static suitsScope(modelItem: IModelItem, scope: KeyScope): boolean {
    switch (scope) {
      case KeyScope.ALL:
        return true
      case KeyScope.NODE:
        return modelItem instanceof INode
      case KeyScope.EDGE:
        return modelItem instanceof IEdge
      case KeyScope.PORT:
        return modelItem instanceof IPort
      default:
        return false
    }
  }

  /**
   * Called when data has changed.
   * @param listener the listener which gets notified when something changed.
   */
  addSomethingChangedListener(listener: () => void): void {
    this.somethingChangedListener = listener
  }

  /**
   * Called when data has changed.
   */
  removeSomethingChangedListener(): void {
    this.somethingChangedListener = () => {}
  }

  /**
   * Notifies the listener if there is one that something changed.
   */
  private onSomethingChanged(): void {
    this.somethingChangedListener()
  }
}
