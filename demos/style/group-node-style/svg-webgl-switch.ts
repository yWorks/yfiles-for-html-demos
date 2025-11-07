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
import {
  FocusIndicatorManager,
  type GraphComponent,
  SelectionIndicatorManager,
  WebGLFocusIndicatorManager,
  type WebGLGraphModelManager,
  WebGLGraphModelManagerRenderMode,
  WebGLSelectionIndicatorManager
} from '@yfiles/yfiles'
import { addNavigationButtons, BrowserDetection } from '@yfiles/demo-app/demo-page'

let changeListener: EventListener

/**
 * Adds an event listener to the HTML select element with the given selector.
 * @param selector The selector that describes the HTML select element
 * @param graphComponent The current graph component
 */
export function initializeSvgWebGlSwitchButton(
  selector: string,
  graphComponent: GraphComponent
): void {
  const renderModeSelectElement = document.querySelector<HTMLSelectElement>(selector)!
  if (BrowserDetection.webGL2) {
    addNavigationButtons(renderModeSelectElement)
  } else {
    const optionElement = document.querySelector<HTMLOptionElement>('option[value="webgl"]')!
    optionElement.disabled = true
    optionElement.title = 'This style is disabled since WebGL is not available.'
  }

  changeListener = (e: Event) => {
    changeRenderMode(graphComponent, (e.target as HTMLSelectElement).value)
  }
  renderModeSelectElement.addEventListener('change', changeListener)
}

/**
 * Changes the style implementations in the given graph component from SVG to WebGL and vice versa.
 * @param graphComponent The demo's main graph view
 * @param renderMode The new type of style implementation to use. Either 'svg' or 'webgl'
 */
function changeRenderMode(graphComponent: GraphComponent, renderMode: string): void {
  const graphModelManager = graphComponent.graphModelManager as WebGLGraphModelManager
  if ('webgl' === renderMode) {
    graphModelManager.renderMode = WebGLGraphModelManagerRenderMode.WEBGL
    graphComponent.selectionIndicatorManager = new WebGLSelectionIndicatorManager()
    graphComponent.focusIndicatorManager = new WebGLFocusIndicatorManager()
  } else {
    graphModelManager.renderMode = WebGLGraphModelManagerRenderMode.SVG
    graphComponent.selectionIndicatorManager = new SelectionIndicatorManager()
    graphComponent.focusIndicatorManager = new FocusIndicatorManager()
  }
}

/**
 * Removes the event listener from the HTML select element with the given selector.
 * @param selector The selector that describes the HTML select element
 * @param graphComponent The current graph component
 */
export function updateSvgWebGlSwitchButton(selector: string, graphComponent: GraphComponent): void {
  const renderModeSelectElement = document.querySelector<HTMLSelectElement>(selector)!
  renderModeSelectElement.removeEventListener('change', changeListener)

  changeListener = (e: Event) => {
    changeRenderMode(graphComponent, (e.target as HTMLSelectElement).value)
  }
  renderModeSelectElement.addEventListener('change', changeListener)

  // set to current render mode
  changeRenderMode(graphComponent, renderModeSelectElement.value)
}
