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
import { CanvasComponent, GraphComponent, GraphOverviewComponent, ICommand } from 'yfiles'
import { initToolbars } from './toolbar'
import { bindYFilesCommand } from './element-utils'

export function finishLoading(): void {
  const graphComponent = CanvasComponent.getComponent(document.querySelector('#graphComponent'))
  if (graphComponent instanceof GraphComponent) {
    registerDefaultCommands(graphComponent)
    registerDevicePixelRatioChangeListener(graphComponent)
  }

  const overviewComponent = CanvasComponent.getComponent(
    document.querySelector('#overviewComponent')
  )
  if (overviewComponent instanceof GraphOverviewComponent) {
    registerDevicePixelRatioChangeListener(overviewComponent)
  }

  document.body.classList.add('loaded')
  window['data-demo-status'] = 'OK'

  initToolbars()
}

/**
 * Sets the device pixel ratio of the given component and register a listener that applies
 * device pixel ratio changes.
 */
function registerDevicePixelRatioChangeListener(canvasComponent: CanvasComponent) {
  let removeCallback = () => {}

  const updatePixelRatio = () => {
    removeCallback()
    const mqString = `(resolution: ${window.devicePixelRatio}dppx)`
    const media = matchMedia(mqString)
    media.addEventListener('change', updatePixelRatio)
    removeCallback = () => {
      media.removeEventListener('change', updatePixelRatio)
    }

    canvasComponent.devicePixelRatio = window.devicePixelRatio || 1
  }
  updatePixelRatio()
}

function registerDefaultCommands(graphComponent: GraphComponent): void {
  document.querySelector("button[data-command='NEW']")?.addEventListener('click', () => {
    graphComponent.graph.clear()
    graphComponent.graph.undoEngine?.clear()
    graphComponent.fitGraphBounds()
  })

  bindYFilesCommand(
    "[data-command='OPEN']",
    ICommand.OPEN,
    graphComponent,
    null,
    'Open a GraphML file'
  )
  bindYFilesCommand(
    "[data-command='SAVE']",
    ICommand.SAVE,
    graphComponent,
    null,
    'Save a GraphML file'
  )

  bindYFilesCommand(
    "[data-command='FIT_GRAPH_BOUNDS']",
    ICommand.FIT_GRAPH_BOUNDS,
    graphComponent,
    null,
    'Fit content'
  )
  bindYFilesCommand(
    "[data-command='INCREASE_ZOOM']",
    ICommand.INCREASE_ZOOM,
    graphComponent,
    null,
    'Increase zoom'
  )
  bindYFilesCommand(
    "[data-command='DECREASE_ZOOM']",
    ICommand.DECREASE_ZOOM,
    graphComponent,
    null,
    'Decrease zoom'
  )
  bindYFilesCommand(
    "[data-command='ZOOM_ORIGINAL']",
    ICommand.ZOOM,
    graphComponent,
    1.0,
    'Zoom to original size'
  )

  bindYFilesCommand("[data-command='CUT']", ICommand.CUT, graphComponent, null, 'Cut')
  bindYFilesCommand("[data-command='COPY']", ICommand.COPY, graphComponent, null, 'Copy')
  bindYFilesCommand("[data-command='PASTE']", ICommand.PASTE, graphComponent, null, 'Paste')
  bindYFilesCommand("[data-command='DELETE']", ICommand.DELETE, graphComponent, null, 'Delete')

  bindYFilesCommand("[data-command='UNDO']", ICommand.UNDO, graphComponent, null, 'Undo')
  bindYFilesCommand("[data-command='REDO']", ICommand.REDO, graphComponent, null, 'Redo')

  bindYFilesCommand(
    "[data-command='GROUP_SELECTION']",
    ICommand.GROUP_SELECTION,
    graphComponent,
    null,
    'Group selected element'
  )
  bindYFilesCommand(
    "[data-command='UNGROUP_SELECTION']",
    ICommand.UNGROUP_SELECTION,
    graphComponent,
    null,
    'Ungroup selected element'
  )
  bindYFilesCommand(
    "[data-command='ENTER_GROUP']",
    ICommand.ENTER_GROUP,
    graphComponent,
    null,
    'Enter group'
  )
  bindYFilesCommand(
    "[data-command='EXIT_GROUP']",
    ICommand.EXIT_GROUP,
    graphComponent,
    null,
    'Exit group'
  )
}
