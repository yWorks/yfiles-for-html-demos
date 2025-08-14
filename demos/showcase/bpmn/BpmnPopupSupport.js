/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ExteriorNodeLabelModel,
  FreeNodeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  HashMap,
  IEdge,
  ILabel,
  ILabelModelParameter,
  ILabelOwner,
  IModelItem,
  INode,
  IPort,
  NinePositionsEdgeLabelModel,
  Point,
  Rect,
  SimpleLabel,
  SimpleNode,
  Size
} from '@yfiles/yfiles'

import {
  ActivityNodeStyle,
  ActivityType,
  BpmnEdgeStyle,
  BpmnEdgeType,
  ChoreographyNodeStyle,
  ChoreographyType,
  ConversationNodeStyle,
  ConversationType,
  DataObjectNodeStyle,
  DataObjectType,
  EventCharacteristic,
  EventNodeStyle,
  EventPortStyle,
  EventType,
  GatewayNodeStyle,
  GatewayType,
  LoopCharacteristic,
  PoolNodeStyle,
  SubState,
  TaskType
} from './bpmn-view'

class BpmnPopup {
  graphComponent
  labelModelParameter
  divField
  _currentItem = null
  dirty = false

  constructor(graphComponent, div, labelModelParameter) {
    this.graphComponent = graphComponent
    this.labelModelParameter = labelModelParameter

    this.divField = div
    div.style.display = 'none'

    this.registerListeners()
  }

  /**
   * Returns the pop-up div.
   */
  get div() {
    return this.divField
  }

  /**
   * Gets the {@link IModelItem item} to display information for.
   * Setting this property to a value other than null shows the pop-up.
   * Setting the property to null hides the pop-up.
   */
  get currentItem() {
    return this._currentItem
  }

  /**
   * Sets the {@link IModelItem item} to display information for.
   * Setting this property to a value other than null shows the pop-up.
   * Setting the property to null hides the pop-up.
   */
  set currentItem(value) {
    if (value === this._currentItem) {
      return
    }
    this._currentItem = value
    if (value != null) {
      this.show()
    } else {
      this.hide()
    }
  }

  registerListeners() {
    // Add listener for viewport changes
    this.graphComponent.addEventListener('viewport-changed', () => {
      if (this._currentItem) {
        this.dirty = true
      }
    })

    // Add listeners for node bounds changes
    this.graphComponent.graph.addEventListener('node-layout-changed', (node) => {
      if (
        (this._currentItem && this._currentItem === node) ||
        (this._currentItem instanceof IEdge &&
          (node === this._currentItem.sourcePort.owner ||
            node === this._currentItem.targetPort.owner))
      ) {
        this.dirty = true
      }
    })

    // Add listener for updates of the visual tree
    this.graphComponent.addEventListener('updated-visual', () => {
      if (this._currentItem && this.dirty) {
        this.dirty = false
        this.updateLocation()
      }
    })
  }

  /**
   * Makes this pop-up visible near the given item.
   */
  show() {
    this.divField.style.display = 'block'
    this.updateLocation()
  }

  /**
   * Hides this pop-up.
   */
  hide() {
    this.divField.style.display = 'none'
  }

  /**
   * Changes the location of this pop-up to the location calculated by the
   * {@link BpmnPopupSupport.labelModelParameter}. Currently, this implementation does not support rotated pop-ups.
   */
  updateLocation() {
    if (!this._currentItem && !this.labelModelParameter) {
      return
    }
    const width = this.divField.clientWidth
    const height = this.divField.clientHeight
    const zoom = this.graphComponent.zoom

    const dummyLabel = new SimpleLabel({
      text: '',
      layoutParameter: FreeNodeLabelModel.CENTER,
      preferredSize: new Size(width / zoom, height / zoom)
    })

    if (this._currentItem instanceof IPort) {
      const location = this._currentItem.location
      const newSimpleNode = new SimpleNode()
      newSimpleNode.layout = new Rect(location.x - 10, location.y - 10, 20, 20)
      dummyLabel.owner = newSimpleNode
    } else if (this._currentItem instanceof ILabelOwner) {
      dummyLabel.owner = this._currentItem
    }

    dummyLabel.layoutParameter = this.labelModelParameter
    const layout = this.labelModelParameter.model.getGeometry(dummyLabel, this.labelModelParameter)
    this.setLocation(layout.anchorX, layout.anchorY - height / zoom)
  }

  /**
   * Sets the location of this pop-up to the given world coordinates.
   * @param x The target x-coordinate of the pop-up.
   * @param y The target y-coordinate of the pop-up.
   */
  setLocation(x, y) {
    // Calculate the view coordinates since we have to place the div in the regular HTML coordinate space
    const viewPoint = this.graphComponent.worldToViewCoordinates(new Point(x, y))
    this.divField.style.left = `${viewPoint.x}px`
    this.divField.style.top = `${viewPoint.y}px`
  }
}

/**
 * Manages visibility and content of popup.
 */
export class BpmnPopupSupport {
  gatewayTypeBox = document.querySelector('#gateway-type-box')
  eventTypeBox = document.querySelector('#event-type-box')
  eventCharacteristicBox = document.querySelector('#event-characteristic-box')
  activityAdHocCheckBox = document.querySelector('#activity-ad-hoc-checkbox')
  activityCompensationCheckBox = document.querySelector('#activity-compensation-checkbox')
  activityTypeBox = document.querySelector('#activity-type-box')
  activityLoopCharacteristicBox = document.querySelector('#activity-loop-characteristic-box')
  activitySubStateBox = document.querySelector('#activity-sub-state-box')
  activityTaskTypeBox = document.querySelector('#activity-task-type-box')
  activityTriggerEventCharacteristicBox = document.querySelector(
    '#activity-trigger-event-characteristic-box'
  )
  activityTriggerEventTypeBox = document.querySelector('#activity-trigger-event-type-box')
  conversationTypeBox = document.querySelector('#conversation-type-box')
  choreographyInitiatingAtTopCheckBox = document.querySelector(
    '#choreography-initiating-at-top-checkbox'
  )
  choreographyInitiatingMessageCheckBox = document.querySelector(
    '#choreography-initiating-message-checkbox'
  )
  choreographyResponseMessageCheckBox = document.querySelector(
    '#choreography-response-message-checkbox'
  )
  choreographyTypeBox = document.querySelector('#choreography-type-box')
  choreographyLoopCharacteristicBox = document.querySelector(
    '#choreography-loop-characteristic-box'
  )
  choreographySubStateBox = document.querySelector('#choreography-sub-state-box')
  dataObjectCollectionCheckBox = document.querySelector('#data-object-collection-checkbox')
  dataObjectTypeBox = document.querySelector('#data-object-type-box')
  poolMultipleCheckBox = document.querySelector('#pool-multiple-checkbox')
  edgeTypeBox = document.querySelector('#edge-type-box')
  portEventTypeBox = document.querySelector('#port-event-type-box')
  portEventCharacteristicBox = document.querySelector('#port-event-characteristic-box')

  graphComponent
  // the currently visible popup.
  activePopup = null
  // a mapping of BPMN styles to popup-support to identify the right popup to show for an item.
  typePopups = new HashMap()

  constructor(graphComponent) {
    this.graphComponent = graphComponent

    this.initializePopups()
    this.initializePopupSynchronization()
  }

  /**
   * Initialize UI elements used in the popups.
   */
  initializePopups() {
    // fill combo boxes with enum types
    populateComboBox(this.activityTypeBox, ActivityType)
    populateComboBox(this.gatewayTypeBox, GatewayType)
    populateComboBox(this.eventTypeBox, EventType)
    populateComboBox(this.eventCharacteristicBox, EventCharacteristic)
    populateComboBox(this.activityLoopCharacteristicBox, LoopCharacteristic)
    populateComboBox(this.activitySubStateBox, SubState)
    populateComboBox(this.activityTaskTypeBox, TaskType)
    populateComboBox(this.activityTriggerEventCharacteristicBox, EventCharacteristic)
    populateComboBox(this.activityTriggerEventTypeBox, EventType)
    populateComboBox(this.conversationTypeBox, ConversationType)
    populateComboBox(this.choreographyTypeBox, ChoreographyType)
    populateComboBox(this.choreographyLoopCharacteristicBox, LoopCharacteristic)
    populateComboBox(this.choreographySubStateBox, SubState)
    populateComboBox(this.dataObjectTypeBox, DataObjectType)
    populateComboBox(this.edgeTypeBox, BpmnEdgeType)
    populateComboBox(this.portEventTypeBox, EventType)
    populateComboBox(this.portEventCharacteristicBox, EventCharacteristic)

    // create a label model parameter that is used to position the node pop-up
    const nodeLabelModelParameter = new ExteriorNodeLabelModel({ margins: 10 }).createParameter(
      'top'
    )
    const edgeLabelModelParameter = NinePositionsEdgeLabelModel.CENTER_CENTERED

    // create the pop-ups
    this.createPopup('gateway-popup-content', GatewayNodeStyle, nodeLabelModelParameter)
    this.createPopup('event-popup-content', EventNodeStyle, nodeLabelModelParameter)
    this.createPopup('activity-popup-content', ActivityNodeStyle, nodeLabelModelParameter)
    this.createPopup('conversation-popup-content', ConversationNodeStyle, nodeLabelModelParameter)
    this.createPopup('choreography-popup-content', ChoreographyNodeStyle, nodeLabelModelParameter)
    this.createPopup('data-object-popup-content', DataObjectNodeStyle, nodeLabelModelParameter)
    this.createPopup('pool-popup-content', PoolNodeStyle, nodeLabelModelParameter)
    this.createPopup('edge-popup-content', BpmnEdgeStyle, edgeLabelModelParameter)
    this.createPopup('port-popup-content', EventPortStyle, nodeLabelModelParameter)
  }

  /**
   * Creates a popup for the given style.
   */
  createPopup(popupContentName, styleName, popupPlacement) {
    // get the popup template from the DOM
    const popupContent = window.document.getElementById(popupContentName)
    // create a popup support using the specified placement and content
    const popup = new BpmnPopup(this.graphComponent, popupContent, popupPlacement)
    // map the node/edge/port style to its popup support
    this.typePopups.set(styleName, popup)
  }

  hasPropertyPopup(clazz) {
    return this.typePopups.has(clazz)
  }

  /**
   * Shows an updated popup for the clicked item.
   */
  showPropertyPopup(clickedItem) {
    // hide any current popups
    this.hidePropertyPopup()

    // check if a popup support has been mapped to the style of the clicked item
    let popupValue
    const currentItem = clickedItem instanceof ILabel ? clickedItem.owner : clickedItem
    if (
      currentItem instanceof INode ||
      currentItem instanceof IEdge ||
      currentItem instanceof IPort
    ) {
      const style = currentItem.style
      const typePopup = this.typePopups.get(style.constructor)
      if (typePopup) {
        popupValue = typePopup
      }
    }

    if (popupValue) {
      // A popup was found for the double-clicked item so we update and show it
      this.activePopup = popupValue
      // update data displayed in the pop-up
      this.updatePopupContent(currentItem)
      // open pop-up
      this.activePopup.currentItem = currentItem
    }
  }

  /**
   * Hides the active popup by resetting its current item.
   */
  hidePropertyPopup() {
    if (this.activePopup) {
      this.activePopup.currentItem = null
      this.activePopup = null
      this.graphComponent.focus({ preventScroll: true })
    }
  }

  /**
   * Updates an open popup or closes the popup if the respective item was removed.
   */
  updatePopupState() {
    if (!this.activePopup) {
      return
    }
    const item = this.activePopup.currentItem
    if (this.graphComponent.graph.contains(item)) {
      this.showPropertyPopup(item)
    } else {
      this.hidePropertyPopup()
    }
  }

  /**
   * Updates the popup-content to be in sync with the selected options of the current item.
   * @param item The item for which the popup is assembled.
   */
  updatePopupContent(item) {
    // for all properties of the current item's style we set the value in the according combo or check box of the
    // active popup
    if (item instanceof INode) {
      const nodeStyle = item.style
      if (nodeStyle instanceof GatewayNodeStyle) {
        this.gatewayTypeBox.value = GatewayType[nodeStyle.type]
      }

      if (nodeStyle instanceof EventNodeStyle) {
        this.eventTypeBox.value = EventType[nodeStyle.type]
        this.eventCharacteristicBox.value = EventCharacteristic[nodeStyle.characteristic]
      }

      if (nodeStyle instanceof ActivityNodeStyle) {
        this.activityTypeBox.value = ActivityType[nodeStyle.activityType]
        this.activityAdHocCheckBox.checked = nodeStyle.adHoc
        this.activityCompensationCheckBox.checked = nodeStyle.compensation
        this.activityLoopCharacteristicBox.value = LoopCharacteristic[nodeStyle.loopCharacteristic]
        this.activitySubStateBox.value = SubState[nodeStyle.subState]
        this.activityTaskTypeBox.value = TaskType[nodeStyle.taskType]
        if (TaskType.EVENT_TRIGGERED === nodeStyle.taskType) {
          this.activityTriggerEventCharacteristicBox.value =
            EventCharacteristic[nodeStyle.triggerEventCharacteristic]
          this.activityTriggerEventCharacteristicBox.disabled = false
          this.activityTriggerEventTypeBox.value = EventType[nodeStyle.triggerEventType]
          this.activityTriggerEventTypeBox.disabled = false
        } else {
          this.activityTriggerEventCharacteristicBox.selectedIndex = -1
          this.activityTriggerEventCharacteristicBox.disabled = true
          this.activityTriggerEventTypeBox.selectedIndex = -1
          this.activityTriggerEventTypeBox.disabled = true
        }
      }

      if (nodeStyle instanceof ConversationNodeStyle) {
        this.conversationTypeBox.value = ConversationType[nodeStyle.type]
      }

      if (nodeStyle instanceof ChoreographyNodeStyle) {
        this.choreographyTypeBox.value = ChoreographyType[nodeStyle.type]
        this.choreographyInitiatingAtTopCheckBox.checked = nodeStyle.initiatingAtTop
        this.choreographyInitiatingMessageCheckBox.checked = nodeStyle.initiatingMessage
        this.choreographyResponseMessageCheckBox.checked = nodeStyle.responseMessage
        this.choreographyLoopCharacteristicBox.value =
          LoopCharacteristic[nodeStyle.loopCharacteristic]
        this.choreographySubStateBox.value = SubState[nodeStyle.subState]
      }

      if (nodeStyle instanceof DataObjectNodeStyle) {
        this.dataObjectTypeBox.value = DataObjectType[nodeStyle.type]
        this.dataObjectCollectionCheckBox.checked = nodeStyle.collection
      }

      if (nodeStyle instanceof PoolNodeStyle) {
        this.poolMultipleCheckBox.checked = nodeStyle.multipleInstance
      }
    } else if (item instanceof IEdge) {
      const edgeStyle = item.style

      if (edgeStyle instanceof BpmnEdgeStyle) {
        this.edgeTypeBox.value = BpmnEdgeType[edgeStyle.type]
      }
    } else if (item instanceof IPort) {
      const portStyle = item.style
      if (portStyle instanceof EventPortStyle) {
        this.portEventTypeBox.value = EventType[portStyle.type]
        this.portEventCharacteristicBox.value = EventCharacteristic[portStyle.characteristic]
      }
    }
  }

  /**
   * Updates the popup state after deleting an item or cut, undo, redo operations.
   */
  initializePopupSynchronization() {
    const graphEditorInputMode = this.graphComponent.inputMode
    graphEditorInputMode.addEventListener('deleted-item', this.updatePopupState.bind(this))
    this.graphComponent.clipboard.addEventListener('items-cut', this.updatePopupState.bind(this))
    this.graphComponent.graph.undoEngine.addEventListener(
      'unit-undone',
      this.updatePopupState.bind(this)
    )
    this.graphComponent.graph.undoEngine.addEventListener(
      'unit-redone',
      this.updatePopupState.bind(this)
    )
  }

  /**
   * Registers commands for each combo and check box that apply the new value to the according style property
   */
  registerPopupCommands() {
    this.gatewayTypeBox.addEventListener('change', () => {
      this.setNodeComboBoxValue(GatewayType, this.gatewayTypeBox, (node, value) => {
        node.style.type = value
      })
    })

    this.eventTypeBox.addEventListener('change', () => {
      this.setNodeComboBoxValue(EventType, this.eventTypeBox, (node, value) => {
        node.style.type = value
      })
    })

    this.eventCharacteristicBox.addEventListener('change', () => {
      this.setNodeComboBoxValue(EventCharacteristic, this.eventCharacteristicBox, (node, value) => {
        node.style.characteristic = value
      })
    })

    this.activityTypeBox.addEventListener('change', () => {
      this.setNodeComboBoxValue(ActivityType, this.activityTypeBox, (node, value) => {
        node.style.activityType = value
      })
    })

    this.activityAdHocCheckBox.addEventListener('change', () => {
      this.setNodeCheckBoxValue(this.activityAdHocCheckBox, (node, value) => {
        node.style.adHoc = value
      })
    })

    this.activityCompensationCheckBox.addEventListener('change', () => {
      this.setNodeCheckBoxValue(this.activityCompensationCheckBox, (node, value) => {
        node.style.compensation = value
      })
    })

    this.activityLoopCharacteristicBox.addEventListener('change', () => {
      this.setNodeComboBoxValue(
        LoopCharacteristic,
        this.activityLoopCharacteristicBox,
        (node, value) => {
          node.style.loopCharacteristic = value
        }
      )
    })

    this.activityLoopCharacteristicBox.addEventListener('change', () => {
      this.setNodeComboBoxValue(
        LoopCharacteristic,
        this.activityLoopCharacteristicBox,
        (node, value) => {
          node.style.loopCharacteristic = value
        }
      )
    })

    this.activitySubStateBox.addEventListener('change', () => {
      this.setNodeComboBoxValue(SubState, this.activitySubStateBox, (node, value) => {
        node.style.subState = value
      })
    })

    this.activityTaskTypeBox.addEventListener('change', () => {
      this.setNodeComboBoxValue(TaskType, this.activityTaskTypeBox, (node, value) => {
        const style = node.style
        style.taskType = value
        if (TaskType.EVENT_TRIGGERED === value) {
          this.activityTriggerEventCharacteristicBox.value =
            EventCharacteristic[style.triggerEventCharacteristic]
          this.activityTriggerEventCharacteristicBox.disabled = false
          this.activityTriggerEventTypeBox.value = EventType[style.triggerEventType]
          this.activityTriggerEventTypeBox.disabled = false
        } else {
          this.activityTriggerEventCharacteristicBox.selectedIndex = -1
          this.activityTriggerEventCharacteristicBox.disabled = true
          this.activityTriggerEventTypeBox.selectedIndex = -1
          this.activityTriggerEventTypeBox.disabled = true
        }
      })
    })

    this.activityTriggerEventCharacteristicBox.addEventListener('change', () => {
      this.setNodeComboBoxValue(
        EventCharacteristic,
        this.activityTriggerEventCharacteristicBox,
        (node, value) => {
          node.style.triggerEventCharacteristic = value
        }
      )
    })

    this.activityTriggerEventTypeBox.addEventListener('change', () => {
      this.setNodeComboBoxValue(EventType, this.activityTriggerEventTypeBox, (node, value) => {
        node.style.triggerEventType = value
      })
    })

    this.conversationTypeBox.addEventListener('change', () => {
      this.setNodeComboBoxValue(ConversationType, this.conversationTypeBox, (node, value) => {
        node.style.type = value
      })
    })

    this.choreographyTypeBox.addEventListener('change', () => {
      this.setNodeComboBoxValue(ChoreographyType, this.choreographyTypeBox, (node, value) => {
        node.style.type = value
      })
    })

    this.choreographyInitiatingAtTopCheckBox.addEventListener('change', () => {
      this.setNodeCheckBoxValue(this.choreographyInitiatingAtTopCheckBox, (node, value) => {
        node.style.initiatingAtTop = value
      })
    })

    this.choreographyInitiatingMessageCheckBox.addEventListener('change', () => {
      this.setNodeCheckBoxValue(this.choreographyInitiatingMessageCheckBox, (node, value) => {
        node.style.initiatingMessage = value
      })
    })

    this.choreographyResponseMessageCheckBox.addEventListener('change', () => {
      this.setNodeCheckBoxValue(this.choreographyResponseMessageCheckBox, (node, value) => {
        node.style.responseMessage = value
      })
    })

    this.choreographyLoopCharacteristicBox.addEventListener('change', () => {
      this.setNodeComboBoxValue(
        LoopCharacteristic,
        this.choreographyLoopCharacteristicBox,
        (node, value) => {
          node.style.loopCharacteristic = value
        }
      )
    })

    this.choreographySubStateBox.addEventListener('change', () => {
      this.setNodeComboBoxValue(SubState, this.choreographySubStateBox, (node, value) => {
        node.style.subState = value
      })
    })

    this.dataObjectTypeBox.addEventListener('change', () => {
      this.setNodeComboBoxValue(DataObjectType, this.dataObjectTypeBox, (node, value) => {
        node.style.type = value
      })
    })

    this.dataObjectCollectionCheckBox.addEventListener('change', () => {
      this.setNodeCheckBoxValue(this.dataObjectCollectionCheckBox, (node, value) => {
        node.style.collection = value
      })
    })

    this.poolMultipleCheckBox.addEventListener('click', () => {
      this.setNodeCheckBoxValue(this.poolMultipleCheckBox, (node, value) => {
        node.style.multipleInstance = value
      })
    })

    this.edgeTypeBox.addEventListener('change', () => {
      this.setEdgeType()
    })

    this.portEventTypeBox.addEventListener('change', () => {
      this.setPortComboBoxValue(EventType, this.portEventTypeBox, (port, value) => {
        port.style.type = value
      })
    })

    this.portEventCharacteristicBox.addEventListener('change', () => {
      this.setPortComboBoxValue(
        EventCharacteristic,
        this.portEventCharacteristicBox,
        (port, value) => {
          port.style.characteristic = value
        }
      )
    })

    document.querySelectorAll('.close-popup-button').forEach((btn) =>
      btn.addEventListener('click', () => {
        this.hidePropertyPopup()
      })
    )
  }

  /**
   * Set the value of the checkbox to the according node style property
   */
  setNodeCheckBoxValue(checkBox, setter) {
    if (!this.activePopup || !this.activePopup.currentItem) {
      return
    }
    const node = this.activePopup.currentItem
    this.graphComponent.graph.setStyle(node, node.style.clone())
    setter(node, checkBox.checked)
    this.graphComponent.invalidate()
  }

  /**
   * Sets the value of the combo box to the according node style property.
   */
  setNodeComboBoxValue(enumType, comboBox, setter) {
    if (!this.activePopup || !this.activePopup.currentItem) {
      return
    }
    const node = this.activePopup.currentItem
    this.graphComponent.graph.setStyle(node, node.style.clone())
    const value = enumType.from(comboBox.value)
    setter(node, value)
    this.graphComponent.invalidate()
  }

  /**
   * Sets the value of the combo box to the according port style property.
   */
  setPortComboBoxValue(enumType, comboBox, setter) {
    if (!this.activePopup || !this.activePopup.currentItem) {
      return
    }
    const port = this.activePopup.currentItem
    this.graphComponent.graph.setStyle(port, port.style.clone())
    const value = enumType.from(comboBox.value)
    setter(port, value)
    this.graphComponent.invalidate()
  }

  /**
   * Sets the edge style according to the current type.
   */
  setEdgeType() {
    // use the specified setter to set the value of the checkbox to the according node style property
    if (!this.activePopup || !this.activePopup.currentItem) {
      return
    }
    const edge = this.activePopup.currentItem
    this.graphComponent.graph.setStyle(edge, edge.style.clone())
    edge.style.type = BpmnEdgeType.from(this.edgeTypeBox.value)
    this.graphComponent.invalidate()
  }
}

/**
 * Adds options to the given combo box for the content of the enum type.
 */
function populateComboBox(comboBox, enumType) {
  for (const name of Object.keys(enumType)) {
    const option = document.createElement('option')
    option.innerText = getFriendlyName(name)
    option.value = name
    comboBox.options.add(option)
  }
}

/** Returns a readable name for all-caps enum constants. */
function getFriendlyName(name) {
  // First character in uppercase
  let result = name.substring(0, 1) + name.substring(1).toLowerCase()
  // Dashes where necessary
  result = result.replace(/(sub|non)_/g, '$1-')
  // Replace underscores with spaces
  result = result.replace(/_/g, ' ')
  return result
}
