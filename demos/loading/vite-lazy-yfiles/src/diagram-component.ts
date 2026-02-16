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
  Command,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicalLayout,
  LayoutExecutor,
  LayoutOrientation,
  License
} from '@yfiles/yfiles'

import {
  createGroupedSampleGraph,
  initializeBasicDemoStyles,
  initializeFolding
} from '@yfiles/demo-utils/sample-graph'

import licenseData from './license.json'

License.value = licenseData

/**
 * A basic diagram component that encapsulates yFiles functionality such that it can be easily
 * loaded on demand with vite's dynamic imports.
 */
export class DiagramComponent {
  private readonly graphComponent: GraphComponent

  constructor(container: HTMLDivElement) {
    // make GraphComponent available on this instance
    this.graphComponent = new GraphComponent(container)
    this.graphComponent.inputMode = new GraphEditorInputMode()

    // add a sample graph
    initializeFolding(this.graphComponent)
    initializeBasicDemoStyles(this.graphComponent.graph)
    createGroupedSampleGraph(this.graphComponent.graph)

    void this.applyLayout(LayoutOrientation.TOP_TO_BOTTOM)
    void this.graphComponent.fitGraphBounds()

    // wire up toolbar buttons
    this.initializeUI()
  }

  /**
   * Applies a basic hierarchical layout.
   */
  async applyLayout(layoutOrientation: LayoutOrientation = LayoutOrientation.LEFT_TO_RIGHT) {
    const layout = new HierarchicalLayout({ layoutOrientation })
    const executor = new LayoutExecutor({
      graphComponent: this.graphComponent,
      layout,
      animationDuration: '1s',
      animateViewport: true,
      easedAnimation: true
    })
    await executor.start()
  }

  /**
   * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's
   * toolbar.
   */
  initializeUI() {
    // enable the buttons of the toolbar
    Array.prototype.slice
      .apply(document.querySelectorAll('.demo-page__toolbar button'))
      .forEach((button) => button.removeAttribute('disabled'))

    // wire up buttons
    document.getElementById('zoom-in-btn')!.addEventListener('click', () => {
      this.graphComponent.executeCommand(Command.INCREASE_ZOOM)
    })
    document.getElementById('zoom-out-btn')!.addEventListener('click', () => {
      this.graphComponent.executeCommand(Command.DECREASE_ZOOM)
    })
    document.getElementById('reset-zoom-btn')!.addEventListener('click', () => {
      this.graphComponent.executeCommand(Command.ZOOM, 1)
    })
    document.getElementById('fit-zoom-btn')!.addEventListener('click', async () => {
      await this.graphComponent.fitGraphBounds()
    })
    document.getElementById('apply-layout-btn')!.addEventListener('click', async () => {
      await this.applyLayout()
    })
  }
}
