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
import { GraphComponent, LayoutExecutorAsync } from '@yfiles/yfiles'

const layoutWorker = new Worker(new URL('./LayoutWorker', import.meta.url), { type: 'module' })

/**
 * Keeps track of layout requests on the graph and makes sure that there is always a clean layout
 * afterwards.
 */
export class LayoutSupport {
  private executor: LayoutExecutorAsync
  private needsLayout = false
  private isLayoutRunning = false
  constructor(graphComponent: GraphComponent) {
    this.executor = new LayoutExecutorAsync({
      messageHandler: LayoutExecutorAsync.createWebWorkerMessageHandler(layoutWorker),
      graphComponent: graphComponent,
      animationDuration: '1s',
      animateViewport: true,
      easedAnimation: true
    })
  }

  /**
   * Can be called subsequent times, to schedule layouts without interfering with currently
   * running layouts.
   */
  async scheduleLayout() {
    this.needsLayout = true
    if (this.isLayoutRunning) {
      return
    }

    while (this.needsLayout) {
      this.isLayoutRunning = true
      this.needsLayout = false

      await this.executor.start()

      this.isLayoutRunning = false
    }
  }
}
