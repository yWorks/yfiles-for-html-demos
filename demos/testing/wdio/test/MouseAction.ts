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
/**
 * A convenience class that allows for easy mouse action creation and execution.
 */
export class MouseAction {
  private static instances = 0

  private readonly actions: {
    type: string
    duration?: number
    x?: number
    y?: number
    button?: number
  }[] = []
  private readonly id = MouseAction.instances++

  clickAt(location) {
    return this.moveTo(location).mouseDown().pause(10).mouseUp()
  }

  moveTo({ x, y }, duration = 0) {
    this.actions.push({
      type: 'pointerMove',
      duration,
      x: Math.floor(x),
      y: Math.floor(y)
    })
    return this
  }

  mouseDown(button = 0) {
    this.actions.push({ type: 'pointerDown', button })
    return this
  }

  mouseUp(button = 0) {
    this.actions.push({ type: 'pointerUp', button })
    return this
  }

  pause(duration) {
    this.actions.push({ type: 'pause', duration })
    return this
  }

  async perform() {
    return browser.performActions([
      {
        type: 'pointer',
        parameters: { pointerType: 'mouse' },
        id: `mouse-${this.id}`,
        actions: this.actions
      }
    ])
  }
}
