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
import { BaseClass, CanvasComponent, IAnimation, Point, TimeSpan } from 'yfiles'

export default class ZoomAnimation extends BaseClass<IAnimation>(IAnimation) implements IAnimation {
  private readonly targetZoomLog: number
  private readonly _preferredDuration: TimeSpan

  constructor(
    private canvas: CanvasComponent,
    targetZoom: number,
    private readonly zoomPoint: Point,
    duration: number
  ) {
    super()
    this.canvas = canvas
    this.targetZoomLog = Math.log(targetZoom) / Math.log(2)
    this._preferredDuration = new TimeSpan(duration)
  }

  /**
   * The preferred duration of the animation.
   * @see Specified by {@link IAnimation#preferredDuration}.
   */
  get preferredDuration(): TimeSpan {
    return this._preferredDuration
  }

  /**
   * The zoom level difference between the initial and the target zoom level.
   */
  delta = 0

  /**
   * Binary logarithm of the initial zoom level.
   */
  initialZoomLog = 0

  /**
   * Initializes the animation.
   */
  initialize(): void {
    this.initialZoomLog = Math.log(this.canvas.zoom) / Math.log(2)
    this.delta = this.targetZoomLog - this.initialZoomLog
  }

  /**
   * Does the animation according to the relative animation time.
   * The animation starts with the time 0 and ends with time 1.
   */
  animate(time: number): void {
    const newZoom = this.initialZoomLog + this.delta * time
    this.canvas.zoomTo(this.zoomPoint, Math.pow(2, newZoom))
  }

  cleanUp(): void {}
}
