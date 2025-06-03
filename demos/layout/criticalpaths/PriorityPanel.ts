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
  EdgePathLabelModel,
  ExteriorNodeLabelModel,
  GraphComponent,
  IEdge,
  ILabelModelParameter,
  IModelItem,
  INode,
  Point,
  SimpleLabel,
  Size
} from '@yfiles/yfiles'

/**
 * This class adds an HTML panel on top of the contents of the GraphComponent that can display arbitrary information
 * about a {@link IModelItem graph item}. In order to not interfere with the positioning of the pop-up,
 * HTML content should be added as ancestor of the {@link PriorityPanel.div div element}, and use relative
 * positioning. This implementation uses an {@link ILabelModelParameter} to determine the position of
 * the pop-up.
 */
export class PriorityPanel {
  private readonly graphComponent: GraphComponent
  private readonly div: HTMLElement
  private dirty = false
  private _currentItems: IModelItem[] | null = null

  /**
   * Creates a new instance of {@link PriorityPanel}.
   */
  constructor(graphComponent: GraphComponent) {
    this.graphComponent = graphComponent
    this.div = document.getElementById('priority-panel')!

    // make the popup invisible
    this.div.style.opacity = '0'
    this.div.style.display = 'none'

    this.registerListeners()
    this.registerClickListeners()
  }

  /**
   * Sets the {@link IModelItem item} to display information for.
   * Setting this property to a value other than `null` shows the pop-up.
   * Setting the property to `null` hides the pop-up.
   */
  set currentItems(items: IModelItem[] | null) {
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
   * Returns all {@link IModelItem}s to display information for.
   */
  get currentItems(): IModelItem[] | null {
    return this._currentItems
  }

  /**
   * Registers listeners for viewport, node bounds and visual tree changes to the {@link GraphComponent}.
   */
  registerListeners(): void {
    // Adds listener for viewport changes
    this.graphComponent.addEventListener('viewport-changed', () => {
      if (this.currentItems && this.currentItems.length > 0) {
        this.dirty = true
      }
    })

    // Adds listener for updates of the visual tree
    this.graphComponent.addEventListener('updated-visual', () => {
      if (this.currentItems && this.currentItems.length > 0 && this.dirty) {
        this.dirty = false
        this.updateLocation()
      }
    })
  }

  /**
   * Registers click listeners for all buttons of this {@link PriorityPanel}.
   */
  registerClickListeners(): void {
    this.setClickListener(document.getElementById('priority-button-0')!, 0)
    this.setClickListener(document.getElementById('priority-button-1')!, 1)
    this.setClickListener(document.getElementById('priority-button-2')!, 2)
    this.setClickListener(document.getElementById('priority-button-3')!, 3)
    this.setClickListener(document.getElementById('priority-button-4')!, 4)
    this.setClickListener(document.getElementById('priority-button-5')!, 5)
  }

  /**
   * Registers a click listener to given element which will invoke the callback {@link itemPriorityChanged} and
   * {@link priorityChanged} in case the priority of the current item changed.
   */
  setClickListener(element: HTMLElement, priority: number): void {
    element.addEventListener('click', () => {
      if (this.currentItems) {
        this.currentItems.forEach((item) => {
          const oldPriority = item.tag && item.tag.priority ? item.tag.priority : 0
          if (oldPriority !== priority) {
            this.itemPriorityChanged(item, priority, oldPriority)
          }
        })
        this.priorityChanged()
        this.currentItems = null
      }
    })
  }

  /**
   * Makes this pop-up visible.
   */
  show(): void {
    this.div.style.display = 'inline-block'
    this.div.style.opacity = '1'
    for (let i = 0; i < 6; i++) {
      document.getElementById(`priority-button-${i}`)!.classList.remove('current-priority')
    }
    if (this.currentItems) {
      this.currentItems.forEach((item) => {
        document
          .getElementById(`priority-button-${item.tag.priority || 0}`)!
          .classList.add('current-priority')
      })
    }
    this.updateLocation()
  }

  /**
   * Hides this pop-up.
   */
  hide(): void {
    this.div.style.opacity = '0'
    this.div.style.display = 'none'
  }

  /**
   * Changes the location of this pop-up to the location calculated by the
   * {@link PriorityPanel.labelModelParameter}.
   */
  updateLocation(): void {
    if (!this.currentItems || this.currentItems.length === 0) {
      return
    }
    const width = this.div.offsetWidth
    const height = this.div.offsetHeight
    const zoom = this.graphComponent.zoom

    let dummyLabel: SimpleLabel | null = null
    let labelModelParameter: ILabelModelParameter | null = null
    const firstItem = this.currentItems[0]
    if (firstItem instanceof IEdge) {
      labelModelParameter = new EdgePathLabelModel({
        autoRotation: false
      }).createRatioParameter()
      dummyLabel = new SimpleLabel(firstItem, '', labelModelParameter)
    } else if (firstItem instanceof INode) {
      labelModelParameter = ExteriorNodeLabelModel.TOP
      dummyLabel = new SimpleLabel(firstItem, '', labelModelParameter)
    }
    if (labelModelParameter && dummyLabel) {
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
   */
  setLocation(x: number, y: number): void {
    // Calculate the view coordinates since we have to place the div in the regular HTML coordinate space
    const viewPoint = this.graphComponent.worldToViewCoordinates(new Point(x, y))
    this.div.style.left = `${viewPoint.x}px`
    this.div.style.top = `${viewPoint.y}px`
  }

  /**
   * Callback for when the priority changed for a specific edge.
   */
  itemPriorityChanged(item: IModelItem, newPriority: number, oldPriority: number): void {}

  /**
   * Callback for when the priority changed for some or all edges in the graph.
   */
  priorityChanged(): void {}
}

/**
 * Checks the given arrays for equality.
 */
function equals(array1: IModelItem[] | null, array2: IModelItem[] | null): boolean {
  if (array1 && array2) {
    if (array1.length === array2.length) {
      const a1 = array1.sort()
      const a2 = array2.sort()
      for (let i = 0; i < array1.length; i++) {
        if (a1[i] !== a2[i]) {
          return false
        }
      }
      return true
    }
  }
  return false
}
