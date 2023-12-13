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
import {
  GraphComponent,
  GraphEditorInputMode,
  HierarchicLayout,
  ICommand,
  LayoutExecutor,
  LayoutOrientation,
  License
} from 'yfiles'

import {
  createGroupedSampleGraph,
  initializeBasicDemoStyles,
  initializeFolding
} from 'utils/sample-graph'

import licenseData from './license.json'
License.value = licenseData

/**
 * A basic diagram component that encapsulates yFiles functionality such that it can be easily
 * loaded on demand with webpack's dynamic imports.
 */
export class DiagramComponent {
  private graphComponent: GraphComponent

  constructor(container: HTMLDivElement) {
    this.graphComponent = new GraphComponent(container)
    this.graphComponent.inputMode = new GraphEditorInputMode()
    // make GraphComponent available on this instance

    // add a sample graph
    initializeFolding(this.graphComponent)
    initializeBasicDemoStyles(this.graphComponent.graph)
    createGroupedSampleGraph(this.graphComponent.graph)

    this.applyLayout(LayoutOrientation.TOP_TO_BOTTOM)
    this.graphComponent.fitGraphBounds()

    // wire up toolbar buttons
    this.initializeUI()
  }

  /**
   * Loads separate webpack chunks that contain the yFiles layout functionality on-demand
   * and then applies a basic hierarchic layout.
   */
  async applyLayout(layoutOrientation: LayoutOrientation = LayoutOrientation.LEFT_TO_RIGHT) {
    const layout = new HierarchicLayout({
      layoutOrientation
    })
    const executor = new LayoutExecutor(this.graphComponent, layout)
    executor.duration = '1s'
    executor.animateViewport = true
    executor.easedAnimation = true
    executor.start()
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
      ICommand.INCREASE_ZOOM.execute(null, this.graphComponent)
    })
    document.getElementById('zoom-out-btn')!.addEventListener('click', () => {
      ICommand.DECREASE_ZOOM.execute(null, this.graphComponent)
    })
    document.getElementById('reset-zoom-btn')!.addEventListener('click', () => {
      ICommand.ZOOM.execute(1, this.graphComponent)
    })
    document.getElementById('fit-zoom-btn')!.addEventListener('click', () => {
      ICommand.FIT_GRAPH_BOUNDS.execute(null, this.graphComponent)
    })
    document.getElementById('apply-layout-btn')!.addEventListener('click', () => {
      this.applyLayout()
    })
  }
}
