/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Animator,
  delegate,
  type GraphComponent,
  type GraphViewerInputMode,
  type MutableRectangle,
  Point,
  type Rect
} from '@yfiles/yfiles'

type TimeframeListener = (timeframe: Rect) => void
type AnimationEndedListener = () => void

/**
 * Creates the animation of the timeline.
 */
export class TimeframeAnimation {
  readonly timelineComponent: GraphComponent
  readonly timeframeRect: MutableRectangle
  private animator: Animator | null = null
  private timeframeListener: TimeframeListener | null = null
  private animationEndedListener: AnimationEndedListener | null = null
  animating = false

  /**
   * Creates a new TimeframeAnimation
   * @param timeframeRect The rectangle used in the {@link TimeframeRectangle}
   * @param timelineComponent The graph component presenting the timeline
   */
  constructor(timeframeRect: MutableRectangle, timelineComponent: GraphComponent) {
    this.timeframeRect = timeframeRect
    this.timelineComponent = timelineComponent
  }

  /**
   * Moves the time frame rightwards along the timeline until it reaches the right border.
   */
  playAnimation(): void {
    if (!this.animating) {
      this.animator = new Animator({
        canvasComponent: this.timelineComponent,
        allowUserInteraction: true
      })

      // set animating flag
      this.animating = true

      // start animation
      void this.animator.animate(() => {
        const timeframe = this.timeframeRect
        const viewport = this.timelineComponent.viewport
        const maxX =
          this.timelineComponent.contentBounds.x + this.timelineComponent.contentBounds.width

        // stop animation when time frame reached right border or if the input mode gets deactivated
        if (
          timeframe.x + timeframe.width >= maxX ||
          !(this.timelineComponent.inputMode as GraphViewerInputMode).enabled
        ) {
          this.stopAnimation()
          this.updateAnimationEndedListeners()
          return
        }

        // move time frame and update timeline graph
        timeframe.x += 1
        this.updateListeners(timeframe.toRect())

        // move viewport when the time frame leaves
        if (viewport.x + viewport.width < timeframe.x + timeframe.width * 0.5) {
          this.timelineComponent.viewPoint = new Point(timeframe.x, viewport.y)
        }
      }, Number.POSITIVE_INFINITY)
    }
  }

  /**
   * Stops moving the time frame.
   */
  stopAnimation(): void {
    if (this.animator !== null) {
      this.animator.stop()
      this.animator = null
      this.animating = false
    }
  }

  /**
   * Adds the listener invoked when the time frame changes.
   */
  setTimeframeListener(listener: TimeframeListener): void {
    this.timeframeListener = delegate.combine(this.timeframeListener, listener)
  }

  /**
   * Removes the listener invoked when the time frame changes.
   */
  removeTimeframeListener(listener: TimeframeListener): void {
    this.timeframeListener = delegate.remove(this.timeframeListener, listener)
  }

  /**
   * Updates all listeners that are interested in an interval change.
   */
  updateListeners(timeframe: Rect): void {
    this.timeframeListener?.(timeframe)
  }

  /**
   * Adds the listener invoked when the animation stops due to reaching the right end of the timeline.
   */
  setAnimationEndedListener(listener: AnimationEndedListener): void {
    this.animationEndedListener = delegate.combine(this.animationEndedListener, listener)
  }

  /**
   * Removes the listener invoked when the animation stops due to reaching the right end of the timeline.
   */
  removeAnimationEndedListener(listener: () => void): void {
    this.animationEndedListener = delegate.remove(this.animationEndedListener, listener)
  }

  /**
   * Updates all listeners that are interested in the event when the animation stops due to reaching the right
   * end of the timeline.
   */
  updateAnimationEndedListeners(): void {
    this.animationEndedListener?.()
  }
}
