/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
  CanvasComponent,
  ConcurrencyController,
  delegate,
  GraphComponent,
  IInputModeContext,
  InputModeBase,
  MouseEventArgs,
  MouseWheelBehaviors,
  ScrollBarVisibility
} from 'yfiles'

/**
 * A specialized input mode that shows a floating magnifying lens that magnifies the cursor's
 * surroundings.
 */
export class LensInputMode extends InputModeBase {
  constructor() {
    super()
    this.lensGraphComponent = null
    this.$zoomFactor = 3
    this.lensElement = document.createElement('div')
    this.lensElement.setAttribute(
      'style',
      `pointer-events: none;
          width: 202px;
          height: 202px;
          top: 10px;
          left: 10px;
          position: absolute;
          overflow: visible;
          transition: opacity .3s ease-in;`
    )
    this.lensElement.innerHTML = `
      <svg xmlns='http://www.w3.org/2000/svg' class='demo-lens-border'
        width='222px' height='222px' viewBox='-20 -20 222 222'
      >
        <defs>
          <linearGradient id='lens-gradient' x1='0' y1='0' x2='1' y2='1'>
            <stop stop-color='black' stop-opacity='0%' offset='0%' />
            <stop stop-color='black' stop-opacity='0%' offset='10%' />
            <stop stop-color='black' stop-opacity='20%' offset='100%' />
          </linearGradient>
        </defs>
        <circle r='90' cx='110' cy='110' stroke='black' stroke-width='2' fill='none' />
        <path d='M22, 130 -20 0 0 -20 130,22 A 100 100 0 0 0 22 130' fill='url(#lens-gradient)' />
      </svg>
      <div class='demo-lens-component'
        style='width: 180px; height: 180px; top: 40px; left: 40px; clip-path: circle(90px); background: #eeeeee; position: absolute;'></div>
      <svg xmlns='http://www.w3.org/2000/svg' class='demo-lens-cross'
        width='222px' height='222px' viewBox='-20 -20 222 222'
        style='position: absolute; top: 0; left: 0;'
      >
        <path d='M100,110 h8 m4,0 h8 M110, 100 v8 m0,4 v8' stroke='white' stroke-opacity='0.3'
          stroke-width='3' stroke-linecap='round' />
        <path d='M100,110 h8 m4,0 h8 M110, 100 v8 m0,4 v8' stroke='black' stroke-opacity='0.8'
          stroke-width='1' stroke-linecap='round' />
      </svg> `
  }

  /**
   * Hides the HTML element that represents the lens component.
   */
  hideLens() {
    this.lensElement.style.opacity = '0.0'
  }

  /**
   * Shows the HTML element that represents the lens component.
   */
  showLens() {
    this.lensElement.style.opacity = '1.0'
  }

  /**
   * Determines whether the lens element should be visible or not.
   * Normally, the magnifying glass should be hidden when the zoom level of the graphComponent is
   * larger than 0.7 or if the size of the graphComponent is small.
   */
  updateLensVisibility() {
    const canvasComponent = this.inputModeContext?.canvasComponent
    if (
      canvasComponent != null &&
      canvasComponent.zoom < 0.7 &&
      canvasComponent.size.width > 200 &&
      canvasComponent.size.height > 200 &&
      canvasComponent.viewport.contains(canvasComponent.lastEventLocation)
    ) {
      this.showLens()
      return true
    } else {
      this.hideLens()
      return false
    }
  }

  /**
   * Updates the location of the magnifying component.
   * @param {!CanvasComponent} sender The source of the event
   * @param location The current mouse location
   * @param {!MouseEventArgs} undefined
   */
  updateLensLocation(sender, { location }) {
    if (
      this.lensGraphComponent != null &&
      this.lensElement != null &&
      this.updateLensVisibility()
    ) {
      this.lensGraphComponent.center = location
      const viewCoords = sender.toViewCoordinates(location)
      this.lensElement.style.left = `${Math.round(viewCoords.x)}px`
      this.lensElement.style.top = `${Math.round(viewCoords.y)}px`
    }
  }

  /**
   * Returns the zoom factor of the graphComponent of the LensInputMode.
   * @type {number}
   */
  get zoomFactor() {
    return this.$zoomFactor
  }

  /**
   * Set the zoom factor of the graphComponent of the LensInputMode.
   * @type {number}
   */
  set zoomFactor(value) {
    this.$zoomFactor = value
    this.inputModeContext.canvasComponent.invalidate()
    this.lensGraphComponent.zoom = this.zoomFactor
  }

  /**
   * Installs this LensInputMode.
   * @param {!IInputModeContext} context The context to install this mode into
   * @param {!ConcurrencyController} controller The controller for this mode
   */
  install(context, controller) {
    super.install(context, controller)

    // gets the div for the lens graphComponent
    // initialize the lens graphComponent
    this.lensGraphComponent = new GraphComponent({
      div: this.lensElement.querySelector('.demo-lens-component'),
      graph: context.graph,
      // disable interaction and scrollbars
      mouseWheelBehavior: MouseWheelBehaviors.NONE,
      autoDrag: false,
      horizontalScrollBarPolicy: ScrollBarVisibility.NEVER,
      verticalScrollBarPolicy: ScrollBarVisibility.NEVER,
      // set the zoom factor of the graph component
      zoom: this.zoomFactor
    })

    const canvasComponent = context.canvasComponent
    canvasComponent.overlayPanel.appendChild(this.lensElement)

    // add the listener to the initial graphComponent that will update the position and the zoom of
    // the lens
    const mouseMoveListener = delegate(this.updateLensLocation, this)
    canvasComponent.addMouseMoveListener(mouseMoveListener)
    canvasComponent.addMouseDragListener(mouseMoveListener)

    const visibilityChangeListener = delegate(this.updateLensVisibility, this)
    canvasComponent.addZoomChangedListener(visibilityChangeListener)
    canvasComponent.addMouseLeaveListener(visibilityChangeListener)
    canvasComponent.addMouseEnterListener(visibilityChangeListener)

    this.hideLens()
  }

  /**
   * Uninstalls this LensInputMode.
   * @param {!IInputModeContext} context The context to install this mode into
   */
  uninstall(context) {
    this.hideLens()
    const canvasComponent = context.canvasComponent

    // remove the listeners
    const mouseMoveListener = delegate(this.updateLensLocation, this)
    canvasComponent.removeMouseMoveListener(mouseMoveListener)
    canvasComponent.removeMouseDragListener(mouseMoveListener)

    const visibilityChangeListener = delegate(this.updateLensVisibility, this)
    canvasComponent.removeZoomChangedListener(visibilityChangeListener)
    canvasComponent.removeMouseLeaveListener(visibilityChangeListener)
    canvasComponent.removeMouseEnterListener(visibilityChangeListener)

    // clean up
    canvasComponent.overlayPanel.removeChild(this.lensGraphComponent.div)
    this.lensGraphComponent.cleanUp()
    this.lensGraphComponent = null

    super.uninstall(context)
  }
}
