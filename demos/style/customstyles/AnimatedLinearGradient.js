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
import { ICanvasContext, ISvgDefsCreator, Matrix } from 'yfiles'
import { SVGNS } from './Namespaces.js'

/**
 * @returns {!SVGLinearGradientElement}
 */
function createGradient() {
  const gradient = document.createElementNS(SVGNS, 'linearGradient')
  gradient.setAttribute('x1', '0')
  gradient.setAttribute('y1', '0')
  gradient.setAttribute('x2', '30')
  gradient.setAttribute('y2', '30')
  gradient.setAttribute('spreadMethod', 'repeat')
  const stop1 = document.createElementNS(SVGNS, 'stop')
  stop1.setAttribute('stop-color', 'rgb(255, 215, 0)')
  stop1.setAttribute('offset', '0')
  const stop2 = document.createElementNS(SVGNS, 'stop')
  stop2.setAttribute('stop-color', 'rgb(255, 245, 30)')
  stop2.setAttribute('offset', '0.5')
  const stop3 = document.createElementNS(SVGNS, 'stop')
  stop3.setAttribute('stop-color', 'rgb(255, 215, 0)')
  stop3.setAttribute('offset', '1')
  gradient.appendChild(stop1)
  gradient.appendChild(stop2)
  gradient.appendChild(stop3)

  // set gradient units to userSpaceOnUse in order to be interpreted globally
  gradient.setAttribute('gradientUnits', 'userSpaceOnUse')

  return gradient
}

// create the gradient element
const gradient = createGradient()

const defsCreator = ISvgDefsCreator.create({
  createDefsElement: context => gradient,

  accept: (context, node, id) =>
    node instanceof Element &&
    node.localName === 'path' &&
    node.hasAttribute('stroke') &&
    node.getAttribute('stroke') === `url(#${id})`,

  updateDefsElement: (context, oldElement) => {}
})

/** @type {number} */
let animationFrameId = -1

const startGradientAnimation = () => {
  let offset = 0
  const ANIMATION_SPEED = 0.05

  let previousTime = null

  const frameRequestCallback = timestamp => {
    // calculate the time since the last animation frame
    if (previousTime == null) {
      previousTime = timestamp
    }
    const dt = timestamp - previousTime
    previousTime = timestamp
    // check if the gradient is still alive
    if (gradient.ownerDocument !== null && gradient.parentNode !== null) {
      // calculate the new offset
      offset = (offset + dt * ANIMATION_SPEED) % 60
      // ...and set the new transform
      gradient.setAttribute(
        'gradientTransform',
        new Matrix(1, 0, 0, 1, offset, offset).toSvgTransform()
      )
      // re-start the animation
      animationFrameId = requestAnimationFrame(frameRequestCallback)
    } else {
      // if the gradient is dead, cancel the animation
      cancelAnimationFrame(animationFrameId)
      animationFrameId = -1
    }
  }
  // start the animation
  animationFrameId = window.requestAnimationFrame(frameRequestCallback)
}

export default {
  applyToElement: (context, element) => {
    const gradientId = context.getDefsId(defsCreator)
    element.setAttribute('stroke', `url(#${gradientId})`)
    // start animation if not already running
    if (animationFrameId < 0) {
      startGradientAnimation()
    }
  }
}
