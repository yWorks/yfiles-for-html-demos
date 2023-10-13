/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
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
export class FPSMeter {
  _enabled
  scale
  frameCache
  fpsHistory
  fpsSpan
  canvasCtx
  cacheSize
  timerId = 0

  /**
   * Initializes a new FPS counter.
   */
  constructor() {
    this.scale = Math.floor(65.0 / 60.0)
    this.frameCache = []
    this.fpsHistory = []
    this.fpsSpan = document.getElementById('fps')

    this._enabled = true

    // configure canvas
    const canvas = document.querySelector('#fpsMeter')
    canvas.width = 200
    canvas.height = 75
    this.canvasCtx = canvas.getContext('2d')

    this.cacheSize = 20

    // draw empty background of the fps meter
    this.drawBackground()
  }

  /**
   * @type {boolean}
   */
  get enabled() {
    return this._enabled
  }

  /**
   * @type {boolean}
   */
  set enabled(value) {
    this._enabled = value
    if (value) {
      this.fpsSpan.textContent = ''
      if (this.canvasCtx) {
        this.drawFps()
      }
      document.getElementById('gt40').setAttribute('style', 'color: #FFFFFF')
      document.getElementById('lt20').setAttribute('style', 'color: #FFFFFF')
    } else {
      this.fpsSpan.textContent = '-'
      this.canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      this.canvasCtx.fillRect(0, 5, 200, 65)
      document.getElementById('gt40').setAttribute('style', 'color: #ADADAD')
      document.getElementById('lt20').setAttribute('style', 'color: #ADADAD')
    }
  }

  /**
   * Calculates and shows the frame rate. To be called once on each new frame.
   */
  showFps() {
    if (!this.enabled) {
      return
    }
    const time = new Date().getTime()
    const cache = this.frameCache
    cache.push(time)
    if (cache.length > this.cacheSize) {
      cache.shift()
    } else if (cache.length < 3) {
      // have at least 3 frames to calculate the framerate
      return
    }

    // update the UI periodically
    if (this.timerId === 0) {
      this.timerId = window.setTimeout(() => {
        const d = (cache[cache.length - 1] - cache[0]) * 0.001
        // Depending on the load, yFiles is capable of higher update rates than 60 fps.
        // However, most browsers can render at most 60 fps and to display the actual
        // re-drawing frequency, we limit the displayed fps to 60.
        const fps = Math.min(Math.floor(this.cacheSize / d), 60)
        this.timerId = 0
        this.fpsSpan.textContent = fps.toString()

        // visualize fps
        const fpsHist = this.fpsHistory
        fpsHist.push(fps)
        if (fpsHist.length > this.cacheSize) {
          fpsHist.shift()
        } else if (fpsHist.length < 2) {
          return
        }
        this.drawFps()
      }, 50)
    }
  }

  /**
   * Resets the internal cached frame times.
   */
  resetFrameArray() {
    this.frameCache = []
  }

  /**
   * Update the canvas.
   */
  drawFps() {
    this.canvasCtx.clearRect(0, 0, 200, 75)

    this.drawBackground()

    const slot = Math.floor(200.0 / this.cacheSize)
    this.canvasCtx.moveTo(0, 5)
    this.canvasCtx.beginPath()
    for (let i = 0; i < this.fpsHistory.length; i++) {
      this.canvasCtx.lineTo(i * slot, 70 - this.fpsHistory[i] * this.scale)
    }
    this.canvasCtx.stroke()
  }

  /**
   * Draws the striped background of the fps meter.
   */
  drawBackground() {
    // > 40 fps
    this.canvasCtx.fillStyle = 'rgba(0, 160, 0, 0.4)'
    this.canvasCtx.fillRect(0, 5, 200, this.scale * 25)
    // consider y-offset

    // 40 - 20 fps
    this.canvasCtx.fillStyle = 'rgba(255, 110, 0, 0.4)'
    this.canvasCtx.fillRect(0, this.scale * 30, 200, this.scale * 20)

    // < 20 fps
    this.canvasCtx.fillStyle = 'rgba(160, 0, 0, 0.4)'
    this.canvasCtx.fillRect(0, this.scale * 50, 200, this.scale * 20)
  }
}
