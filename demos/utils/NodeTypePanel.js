/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  GraphComponent,
  ILabelModelParameter,
  INode,
  Point,
  SimpleLabel,
  Size
} from 'yfiles'
import { addClass, removeClass } from '../resources/demo-app.js'
import { colorSets } from '../resources/demo-styles.js'

/**
 * This class adds an HTML panel on top of the contents of the GraphComponent that can display arbitrary information
 * about an {@link INode}. In order to not interfere with the positioning of the pop-up, HTML content should be added
 * as ancestor of the {@link NodeTypePanel.div div element}, and use relative positioning. This implementation uses
 * an {@link ILabelModelParameter} to determine the position of the pop-up.
 */
export default class NodeTypePanel {
  /**
   * Creates a new instance of {@link NodeTypePanel}.
   * @param {!GraphComponent} graphComponent
   * @param {!Array.<ColorSetName>} typeColors
   */
  constructor(graphComponent, typeColors) {
    this.typeColors = typeColors
    this.graphComponent = graphComponent
    this.dirty = false
    this._currentItems = null
    this.div = document.getElementById('node-type-panel')

    // make the popup invisible
    this.div.style.opacity = '0'
    this.div.style.display = 'none'

    this.registerListeners()
    this.registerClickListeners()
  }

  /**
   * Sets the {@link INode nodes} to display the type choice pop-up for.
   * Setting this property to a value other than `null` shows the pop-up.
   * Setting the property to `null` hides the pop-up.
   * @type {?Array.<INode>}
   */
  set currentItems(items) {
    if (items && items.length > 0) {
      if (!equals(items, this._currentItems)) {
        this._currentItems = items
        this.show()
      }
    } else {
      this._currentItems = null
      this.hide()
    }
  }

  /**
   * Returns all {@link INode}s to display the pop-up for.
   * @type {?Array.<INode>}
   */
  get currentItems() {
    return this._currentItems
  }

  /**
   * Registers listeners for viewport, node bounds and visual tree changes to the {@link GraphComponent}.
   */
  registerListeners() {
    // Adds listener for viewport changes
    this.graphComponent.addViewportChangedListener(() => {
      if (this.currentItems && this.currentItems.length > 0) {
        this.dirty = true
      }
    })

    // Adds listener for updates of the visual tree
    this.graphComponent.addUpdatedVisualListener(() => {
      if (this.currentItems && this.currentItems.length > 0 && this.dirty) {
        this.dirty = false
        this.updateLocation()
      }
    })
  }

  /**
   * Registers click listeners for all buttons of this {@link NodeTypePanel}.
   */
  registerClickListeners() {
    for (const element of this.div.querySelectorAll('.node-type-button')) {
      const button = element
      const classes = button.getAttribute('class')
      const type = NodeTypePanel.findType(classes)
      if (type > -1) {
        button.style.backgroundColor = colorSets[this.typeColors[type]].fill
        this.addClickListener(button, type)
      }
    }
  }

  /**
   * @param {?string} cssClasses
   * @returns {number}
   */
  static findType(cssClasses) {
    if (cssClasses != null && cssClasses.length > 0) {
      for (const cssClass of cssClasses.split(' ')) {
        if (cssClass.startsWith('type-')) {
          return parseInt(cssClass.substring(5))
        }
      }
    }
    return -1
  }

  /**
   * Registers a click listener to given element which will invoke the callback {@link nodeTypeChanged} and
   * {@link typeChanged} in case the type of the current item changed.
   * @param {?Element} element
   * @param {number} type
   */
  addClickListener(element, type) {
    if (!element) {
      return
    }
    element.addEventListener('click', () => {
      if (this.currentItems) {
        this.currentItems.forEach(item => {
          const oldType = item.tag && item.tag.type
          if (oldType !== type) {
            this.nodeTypeChanged(item, type, oldType)
          }
        })
        this.typeChanged()
        this.currentItems = null
      }
    })
  }

  /**
   * Makes this pop-up visible.
   */
  show() {
    this.div.style.display = 'inline-block'
    this.div.style.opacity = '1'
    for (const btn of this.div.querySelectorAll('.node-type-button')) {
      removeClass(btn, 'current-type')
    }
    if (this.currentItems) {
      this.currentItems.forEach(item => {
        addClass(
          this.div.querySelector(`.type-${(item.tag && item.tag.type) || 0}`),
          'current-type'
        )
      })
    }
    this.updateLocation()
  }

  /**
   * Hides this pop-up.
   */
  hide() {
    this.div.style.opacity = '0'
    this.div.style.display = 'none'
  }

  /**
   * Changes the location of this pop-up to the location calculated by the
   * {@link NodeTypePanel.labelModelParameter}.
   */
  updateLocation() {
    if (!this.currentItems || this.currentItems.length === 0) {
      return
    }
    const width = this.div.offsetWidth
    const height = this.div.offsetHeight
    const zoom = this.graphComponent.zoom

    const labelModelParameter = new ExteriorLabelModel({ insets: [20, 0, 0, 0] }).createParameter(
      ExteriorLabelModelPosition.NORTH
    )
    const dummyLabel = new SimpleLabel(this.currentItems[0], '', labelModelParameter)
    if (labelModelParameter.supports(dummyLabel)) {
      dummyLabel.preferredSize = new Size(width / zoom, height / zoom)
      const { anchorX, anchorY } = labelModelParameter.model.getGeometry(
        dummyLabel,
        labelModelParameter
      )
      this.setLocation(anchorX, anchorY - height / zoom)
    }
  }

  /**
   * Sets the location of this pop-up to the given world coordinates.
   * @param {number} x
   * @param {number} y
   */
  setLocation(x, y) {
    // Calculate the view coordinates since we have to place the div in the regular HTML coordinate space
    const viewPoint = this.graphComponent.toViewCoordinates(new Point(x, y))
    this.div.style.left = `${viewPoint.x}px`
    this.div.style.top = `${viewPoint.y}px`
  }

  /**
   * Callback for when the type changed for a specific node
   * @param {!INode} item
   * @param {*} newType
   * @param {*} oldType
   */
  nodeTypeChanged(item, newType, oldType) {}

  /**
   * Callback for when the type changed for some or all nodes in the graph.
   */
  typeChanged() {}
}

/**
 * Checks the given arrays for equality.
 * @param {?Array.<INode>} nodes1
 * @param {?Array.<INode>} nodes2
 * @returns {boolean}
 */
function equals(nodes1, nodes2) {
  if (nodes1 === nodes2) {
    return true
  }
  if (nodes1 == null || nodes2 == null) {
    return false
  }
  if (nodes1.length !== nodes2.length) {
    return false
  }

  nodes1.sort()
  nodes2.sort()
  for (let i = 0; i < nodes1.length; i++) {
    if (nodes1[i] !== nodes2[i]) {
      return false
    }
  }
  return true
}
