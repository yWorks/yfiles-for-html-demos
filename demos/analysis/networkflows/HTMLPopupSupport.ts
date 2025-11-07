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
  type GraphComponent,
  IEdge,
  type ILabelModelParameter,
  type ILabelOwner,
  type IModelItem,
  Point,
  SimpleLabel,
  Size
} from '@yfiles/yfiles'

/**
 * This class adds an HTML panel on top of the contents of the GraphComponent that can
 * display arbitrary information about a {@link IModelItem graph item}.
 * In order to not interfere with the positioning of the pop-up, HTML content
 * should be added as ancestor of the {@link HTMLPopupSupport.div div element}, and
 * use relative positioning. This implementation uses a {@link ILabelModelParameter label model
 * parameter} to determine the position of the pop-up.
 */
export class HTMLPopupSupport {
    private readonly labelModelParameter: ILabelModelParameter;
    private readonly div: HTMLElement;
    private readonly graphComponent: GraphComponent;
  private _currentItem: IModelItem | null
  private dirty: boolean

  /**
   * Constructor that takes the graphComponent, the container div element and an ILabelModelParameter
   * to determine the relative position of the popup.
   */
  constructor(
    graphComponent: GraphComponent,
    div: HTMLElement,
    labelModelParameter: ILabelModelParameter
  ) {
      this.graphComponent = graphComponent;
      this.div = div;
      this.labelModelParameter = labelModelParameter;
    this._currentItem = null
    this.dirty = false

    // make the popup invisible
    div.style.opacity = '0'
    div.style.display = 'none'

    this.registerListeners()
  }

  /**
   * Sets the {@link IModelItem item} to display information for.
   * Setting this property to a value other than null shows the pop-up.
   * Setting the property to null hides the pop-up.
   * @param value The current graph item
   */
  set currentItem(value: IModelItem | null) {
    if (value === this._currentItem) {
      return
    }
    this._currentItem = value
    if (value !== null) {
      this.show()
    } else {
      this.hide()
    }
  }

  /**
   * Gets the {@link IModelItem item} to display information for.
   * @returns The current graph item
   */
  get currentItem(): IModelItem | null {
    return this._currentItem
  }

  /**
   * Registers viewport, node bounds changes and visual tree listeners to the given graphComponent.
   */
  registerListeners(): void {
    // Adds listener for viewport changes
    this.graphComponent.addEventListener('viewport-changed', () => {
      if (this.currentItem) {
        this.dirty = true
      }
    })

    // Adds listeners for node bounds changes
    this.graphComponent.graph.addEventListener('node-layout-changed', (node, _oldLayout) => {
      if (
        ((this.currentItem && this.currentItem === node) || this.currentItem instanceof IEdge) &&
        (node === (this.currentItem as IEdge).sourcePort.owner ||
          node === (this.currentItem as IEdge).targetPort.owner)
      ) {
        this.dirty = true
      }
    })

    // Adds listener for updates of the visual tree
    this.graphComponent.addEventListener('updated-visual', () => {
      if (this.currentItem && this.dirty) {
        this.dirty = false
        this.updateLocation()
      }
    })
  }

  /**
   * Makes this pop-up visible.
   */
  show(): void {
    this.div.style.display = 'block'
    setTimeout(() => (this.div.style.opacity = '1'), 0)
    this.updateLocation()
  }

  /**
   * Hides this pop-up.
   */
  hide(): void {
    const parent = this.div.parentNode!
    const popupClone = this.div.cloneNode(true) as HTMLElement
    popupClone.setAttribute('class', `${popupClone.getAttribute('class')!} popupContentClone`)
    parent.appendChild(popupClone)
    // fade the clone out, then remove it from the DOM. Both actions need to be timed.
    setTimeout(() => {
      popupClone.setAttribute('style', `${popupClone.getAttribute('style')!} opacity: 0;`)
      setTimeout(() => parent.removeChild(popupClone), 300)
    }, 0)
    this.div.style.opacity = '0'
    this.div.style.display = 'none'
  }

  /**
   * Changes the location of this pop-up to the location calculated by the
   * {@link labelModelParameter}. Currently, this implementation does not support rotated pop-ups.
   */
  updateLocation(): void {
    if (!this.currentItem && !this.labelModelParameter) {
      return
    }
    const width = this.div.clientWidth
    const height = this.div.clientHeight
    const zoom = this.graphComponent.zoom

    const dummyLabel = new SimpleLabel(
      this.currentItem as ILabelOwner,
      '',
      this.labelModelParameter
    )
    dummyLabel.preferredSize = new Size(width / zoom, height / zoom)
    const newLayout = this.labelModelParameter.model.getGeometry(
      dummyLabel,
      this.labelModelParameter
    )
    this.setLocation(newLayout.anchorX, newLayout.anchorY - (height + 10) / zoom)
  }

  /**
   * Sets the location of this pop-up to the given world coordinates.
   * @param x The target x-coordinate of the pop-up.
   * @param y The target y-coordinate of the pop-up.
   */
  setLocation(x: number, y: number): void {
    // Calculate the view coordinates since we have to place the div in the regular HTML coordinate space
    const viewPoint = this.graphComponent.worldToViewCoordinates(new Point(x, y))
    this.div.style.setProperty('transform', `translate(${viewPoint.x}px, ${viewPoint.y}px)`)
  }
}
