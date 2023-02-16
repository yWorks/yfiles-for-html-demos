/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
import {
  GraphComponent,
  IEdge,
  ILabelModelParameter,
  IModelItem,
  INode,
  Point,
  SimpleLabel,
  Size
} from 'yfiles'

/**
 * This class adds an HTML panel on top of the contents of the GraphComponent that can
 * display arbitrary information about a {@link INode node} or an {@link IEdge edge}.
 * In order to not interfere with the positioning of the pop-up, HTML content should be added as
 * ancestor of the {@link HTMLPopupSupport.div div element}, and use relative positioning.
 * This implementation uses a {@link ILabelModelParameter label model parameter} to determine the
 * position of the pop-up.
 */
export default class HTMLPopupSupport {
  private _currentItem: IEdge | INode | null = null
  private dirty = false

  /**
   * Initializes a new HTMLPopupSupport instance for the given graph component, pop-up container
   * div, and pop-up placement parameter.
   * @param graphComponent The GraphComponent that displays the nodes and edges for which pop-ups
   * will be shown.
   * @param div The HTMLDivElement that is used as parent element for the pop-up element.
   * @param labelModelParameter The placement parameter that determines the pop-up location.
   */
  constructor(
    private graphComponent: GraphComponent,
    public div: HTMLElement,
    private labelModelParameter: ILabelModelParameter
  ) {
    // make the popup invisible
    div.style.opacity = '0'
    div.style.display = 'none'

    this.registerListeners()
  }

  /**
   * Gets the node or edge to display information for.
   */
  get currentItem(): IEdge | INode | null {
    return this._currentItem
  }

  /**
   * Sets the node or edge to display information for.
   * Setting this property to a value other than null shows the pop-up.
   * Setting the property to null hides the pop-up.
   */
  set currentItem(value: IEdge | INode | null) {
    if (value === this._currentItem) {
      return
    }
    this._currentItem = value
    if (value) {
      this.show()
    } else {
      this.hide()
    }
  }

  /**
   * Registers viewport, node bounds changes, and visual tree listeners to the support's associated
   * graph component.
   */
  private registerListeners(): void {
    // Adds listener for viewport changes
    this.graphComponent.addViewportChangedListener((sender, args) => {
      if (this.currentItem) {
        this.dirty = true
      }
    })

    // Adds listeners for node bounds changes
    this.graphComponent.graph.addNodeLayoutChangedListener((node, oldLayout) => {
      const item = this.currentItem
      if (item && (item === node || HTMLPopupSupport.isEdgeConnectedTo(item, node))) {
        this.dirty = true
      }
    })

    // Adds listener for updates of the visual tree
    this.graphComponent.addUpdatedVisualListener((sender, args) => {
      if (this.currentItem && this.dirty) {
        this.dirty = false
        this.updateLocation()
      }
    })
  }

  /**
   * Makes this pop-up visible.
   */
  private show(): void {
    this.div.style.display = 'block'
    setTimeout(() => {
      this.div.style.opacity = '1'
    }, 0)
    this.updateLocation()
  }

  /**
   * Hides this pop-up.
   */
  private hide(): void {
    const parent = this.div.parentNode!
    const popupClone = this.div.cloneNode(true) as HTMLElement
    popupClone.setAttribute('class', `${popupClone.getAttribute('class')} popupContentClone`)
    parent.appendChild(popupClone)
    // fade the clone out, then remove it from the DOM. Both actions need to be timed.
    setTimeout(() => {
      popupClone.setAttribute('style', `${popupClone.getAttribute('style')} opacity: 0;`)
      setTimeout(() => {
        parent.removeChild(popupClone)
      }, 300)
    }, 0)
    this.div.style.opacity = '0'
    this.div.style.display = 'none'
  }

  /**
   * Changes the location of this pop-up to the location calculated by the
   * {@link HTMLPopupSupport.labelModelParameter}. Currently, this implementation does not support rotated pop-ups.
   */
  private updateLocation(): void {
    if (!this.currentItem && !this.labelModelParameter) {
      return
    }
    const width = this.div.clientWidth
    const height = this.div.clientHeight
    const zoom = this.graphComponent.zoom

    const dummyLabel = new SimpleLabel(this.currentItem, '', this.labelModelParameter)
    if (this.labelModelParameter.supports(dummyLabel)) {
      dummyLabel.preferredSize = new Size(width / zoom, height / zoom)
      const newLayout = this.labelModelParameter.model.getGeometry(
        dummyLabel,
        this.labelModelParameter
      )
      this.setLocation(newLayout.anchorX, newLayout.anchorY - (height + 10) / zoom)
    }
  }

  /**
   * Sets the location of this pop-up to the given world coordinates.
   * @param x The target x-coordinate of the pop-up.
   * @param y The target y-coordinate of the pop-up.
   */
  private setLocation(x: number, y: number): void {
    // Calculate the view coordinates since we have to place the div in the regular HTML coordinate space
    const viewPoint = this.graphComponent.toViewCoordinates(new Point(x, y))
    this.div.style.setProperty('transform', `translate(${viewPoint.x}px, ${viewPoint.y}px)`)
  }

  /**
   * Determines if the given item is an IEdge connected to the given node.
   */
  private static isEdgeConnectedTo(item: IModelItem, node: INode): boolean {
    return (
      item instanceof IEdge && (item.sourcePort!.owner === node || item.targetPort!.owner === node)
    )
  }
}
