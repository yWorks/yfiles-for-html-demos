/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { type GraphComponent, type WebGL2Animation, WebGL2GraphModelManager } from 'yfiles'

/**
 * Whether labels are currently faded.
 */
let labelsFaded = false

/**
 * Animation used to fade the labels.
 */
let labelsFadeAnimation: WebGL2Animation | null

/**
 * Fade labels in/out depending on the configured threshold.
 */
let toggleLabelVisibility: (graphComponent: GraphComponent) => void

/**
 * Registers label fading by adding the {@link toggleLabelVisibility} to zoom event of the
 * {@link GraphComponent}.
 */
export function registerLabelFading(graphComponent: GraphComponent, labelFadeThreshold: number) {
  if (toggleLabelVisibility) {
    graphComponent.removeZoomChangedListener(toggleLabelVisibility)
  }

  toggleLabelVisibility = (graphComponent: GraphComponent) => {
    const zoom = graphComponent.zoom
    document.querySelector<HTMLSpanElement>('#current-zoom')!.textContent = `${Math.round(
      zoom * 100
    )}%`
    if (zoom <= labelFadeThreshold) {
      fadeOutLabels(graphComponent)
    } else if (zoom > labelFadeThreshold) {
      fadeInLabels(graphComponent)
    }
  }

  graphComponent.addZoomChangedListener(toggleLabelVisibility)

  // trigger it once to apply the current state
  toggleLabelVisibility(graphComponent)
}

/**
 * Fades out all labels by assigning a fade animation to them and starting it.
 */
function fadeOutLabels(graphComponent: GraphComponent) {
  if (labelsFaded || !(graphComponent.graphModelManager instanceof WebGL2GraphModelManager)) {
    return
  }

  const graphModelManager = graphComponent.graphModelManager
  labelsFaded = true

  labelsFadeAnimation = graphModelManager.createFadeAnimation({
    type: 'fade-out',
    timing: '500ms ease'
  })

  graphComponent.graph.labels.forEach((label) => {
    graphModelManager.setAnimations(label, [labelsFadeAnimation!])
  })

  labelsFadeAnimation.start()
}

/**
 * Fades in all labels by stopping the fade animation and subsequently removing it from the labels.
 * Note: When stopping a {@link WebGL2Animation} it runs "backward" and stays at the beginning.
 */
function fadeInLabels(graphComponent: GraphComponent) {
  if (!labelsFaded || !(graphComponent.graphModelManager instanceof WebGL2GraphModelManager)) {
    return
  }

  labelsFaded = false
  const graphModelManager = graphComponent.graphModelManager

  labelsFadeAnimation?.stop().then(() => {
    graphComponent.graph.labels.forEach((label) => {
      graphModelManager.setAnimations(label, [])
    })
  })

  labelsFadeAnimation = null
}
