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
import { addClass, hasClass, removeClass } from '../../resources/demo-app.js'
import { CSS_CLASS_PRESET_APPLIED } from './PresetsUiBuilder.js'

const CSS_CLASS_VISIBLE = 'visible'
const CSS_CLASS_ACTIVE = 'active'

/**
 * Manages the tooltips for the preset buttons.
 */
export class Tooltip {
  constructor() {
    this.element = document.getElementById('preset-tooltip')
    this.dummy = Tooltip.createDummyElement(this.element)
    this.deltaHeight = this.element.parentElement.getBoundingClientRect().top
  }

  /**
   * Shows the tooltip text for the given activator element.
   * @param {!HTMLElement} activator The button for which the tool tip is shown.
   * @param {!string} content The tool tip text.
   */
  show(activator, content) {
    const triangleSize = 12
    const activatorBounds = activator.getBoundingClientRect()
    const activatorAnchorX = activatorBounds.left + activatorBounds.width / 2
    const activatorAnchorY = activatorBounds.top + activatorBounds.height + triangleSize + 2

    const tooltipHeight = this.calculateTooltipHeight(content)
    if (Tooltip.fitsViewport(activatorAnchorY + tooltipHeight)) {
      // do not hide tooltip if a new one is already triggered
      clearTimeout(this.hideTimer)

      const element = this.element
      const contentDiv = element.querySelector('.content')
      contentDiv.innerHTML = content
      element.style.display = 'block'
      element.style.top = `${activatorAnchorY - this.deltaHeight}px`

      const tooltipBounds = element.getBoundingClientRect()
      const triangle = element.querySelector('.triangle')
      triangle.style.left = `${activatorAnchorX - tooltipBounds.left - triangleSize}px`

      this.updateActive(activator)
      addClass(element, CSS_CLASS_VISIBLE)
    }
  }

  /**
   * Hides the tooltip.
   */
  hide() {
    const element = this.element
    removeClass(element, CSS_CLASS_VISIBLE)

    // remove the tooltip from the DOM, after the fade-out CSS transition has finished
    this.hideTimer = setTimeout(() => {
      element.style.display = 'none'
    }, 210)
  }

  /**
   * @param {!HTMLElement} activator The button for which the tool tip is shown.
   */
  updateActive(activator) {
    const element = this.element
    removeClass(element, CSS_CLASS_ACTIVE)
    if (hasClass(activator, CSS_CLASS_PRESET_APPLIED)) {
      addClass(element, CSS_CLASS_ACTIVE)
    }
  }

  /**
   * Whether the tooltip fits into the current view port without being clipped.
   * @param {number} maxY The maximum y-coordinate of the current viewport.
   * @returns {boolean}
   */
  static fitsViewport(maxY) {
    return document.documentElement.clientHeight > maxY
  }

  /**
   * @param {!string} content The tool tip text.
   * @returns {number}
   */
  calculateTooltipHeight(content) {
    this.dummy.innerHTML = content
    const height = this.dummy.getBoundingClientRect().height
    this.dummy.innerHTML = ''
    return height
  }

  /**
   * Creates a dummy element to measure the tooltip height off-screen in order to not show the
   * tooltip content if it does not fit the current viewport.
   * @param {!HTMLDivElement} tooltipElement The container for the tool tip text.
   * @returns {!HTMLDivElement}
   */
  static createDummyElement(tooltipElement) {
    const dummy = document.createElement('div')
    addClass(dummy, 'preset-tooltip-dummy')
    dummy.style.width = tooltipElement.style.width
    tooltipElement.parentElement.appendChild(dummy)
    return dummy
  }
}
