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
import { Animator, GraphComponent, TimeSpan } from 'yfiles'

/**
 * This controller manages the animation of the heatmap and process items.
 * It handles the state of the animation and updates the progress via a callback function.
 */
export class AnimationController {
  animator
  running
  setProgress

  /**
   * Creates a new Animation controller.
   * @param {!GraphComponent} graphComponent the graph component to which the animation belongs
   * @param {!TimeSpan} maxTime the maximum time that the animation can take
   * @param {!function} progressCallback a callback function to report the progress back
   */
  constructor(graphComponent, maxTime, progressCallback) {
    this.maxTime = maxTime
    this.graphComponent = graphComponent
    this.running = false
    this.setProgress = progressCallback
    this.animator = new Animator({
      canvas: graphComponent,
      allowUserInteraction: true,
      autoInvalidation: true
    })
  }

  /**
   * Starts the animation.
   * @returns {!Promise}
   */
  async runAnimation() {
    if (!this.running) {
      await this.animator.animate(this.setProgress, this.maxTime)
      this.running = false
    }
  }

  /**
   * Restarts the animation.
   * @returns {!Promise}
   */
  async restartAnimation() {
    if (this.animator) {
      this.animator.stop()
      this.animator.paused = false
    }
    this.running = false
    await this.runAnimation()
  }

  /**
   * Pauses the animation.
   */
  pauseAnimation() {
    this.animator.paused = !this.animator.paused
  }
}
