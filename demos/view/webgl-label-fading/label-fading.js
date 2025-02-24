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
import { WebGLGraphModelManager } from '@yfiles/yfiles'
/**
 * Whether labels are currently faded.
 */
let labelsFaded = false
/**
 * Whether labels are currently animated.
 */
let animated = false
/**
 * Animation used to fade the labels.
 */
let labelsFadeAnimation
/**
 * Fade labels in/out depending on the configured threshold.
 */
let toggleLabelVisibility
/**
 * Registers label fading by adding the {@link toggleLabelVisibility} to zoom event of the
 * {@link GraphComponent}.
 */
export function registerLabelFading(graphComponent, labelFadeThreshold) {
  if (toggleLabelVisibility) {
    graphComponent.removeEventListener('zoom-changed', toggleLabelVisibility)
  }
  toggleLabelVisibility = () => {
    const zoom = graphComponent.zoom
    document.querySelector('#current-zoom').textContent = `${Math.round(zoom * 100)}%`
    if (zoom <= labelFadeThreshold) {
      fadeOutLabels(graphComponent)
    } else if (zoom > labelFadeThreshold) {
      fadeInLabels(graphComponent)
    }
  }
  graphComponent.addEventListener('zoom-changed', toggleLabelVisibility)
  // trigger it once to apply the current state
  toggleLabelVisibility()
}
/**
 * Fades out all labels by assigning a fade animation to them and starting it.
 */
function fadeOutLabels(graphComponent) {
  if (
    (!animated && labelsFaded) ||
    !(graphComponent.graphModelManager instanceof WebGLGraphModelManager)
  ) {
    return
  }
  const graphModelManager = graphComponent.graphModelManager
  labelsFadeAnimation = graphModelManager.createFadeAnimation({
    type: 'fade-out',
    timing: '500ms ease'
  })
  animated = true
  graphComponent.graph.labels.forEach((label) => {
    graphModelManager.setAnimations(label, [labelsFadeAnimation])
  })
  labelsFadeAnimation?.start().then(() => {
    labelsFaded = true
    animated = false
  })
}
/**
 * Fades in all labels by stopping the fade animation and subsequently removing it from the labels.
 * Note: When stopping a {@link WebGLAnimation} it runs "backward" and stays at the beginning.
 */
function fadeInLabels(graphComponent) {
  if (
    (!animated && !labelsFaded) ||
    !(graphComponent.graphModelManager instanceof WebGLGraphModelManager)
  ) {
    return
  }
  animated = true
  labelsFadeAnimation?.stop().then(() => {
    labelsFaded = false
    animated = false
  })
  labelsFadeAnimation = null
}
