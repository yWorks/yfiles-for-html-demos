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
  FocusIndicatorManager,
  SelectionIndicatorManager,
  WebGL2FocusIndicatorManager,
  WebGL2GraphModelManager,
  WebGL2GraphModelManagerRenderMode,
  WebGL2SelectionIndicatorManager
} from 'yfiles'
import { BrowserDetection } from 'demo-utils/BrowserDetection'
import { addNavigationButtons } from 'demo-resources/demo-page'

/** @type {EventListener} */
let changeListener

/**
 * Adds an event listener to the HTML select element with the given selector.
 * @param {!string} selector The selector that describes the HTML select element
 * @param {!GraphComponent} graphComponent The current graph component
 */
export function initializeSvgWebGlSwitchButton(selector, graphComponent) {
  const renderModeSelectElement = document.querySelector(selector)
  if (BrowserDetection.webGL2) {
    addNavigationButtons(renderModeSelectElement)
  } else {
    const optionElement = document.querySelector('option[value="webgl"]')
    optionElement.disabled = true
    optionElement.title = 'This style is disabled since WebGL2 is not available.'
  }

  changeListener = (e) => {
    changeRenderMode(graphComponent, e.target.value)
  }
  renderModeSelectElement.addEventListener('change', changeListener)
}

/**
 * Changes the style implementations in the given graph component from SVG to WebGL2 and vice versa.
 * @param {!GraphComponent} graphComponent The demo's main graph view
 * @param {!string} renderMode The new type of style implementation to use. Either 'svg' or 'webgl'
 */
function changeRenderMode(graphComponent, renderMode) {
  const graphModelManager = graphComponent.graphModelManager
  if ('webgl' === renderMode) {
    graphModelManager.renderMode = WebGL2GraphModelManagerRenderMode.WEB_GL
    graphComponent.selectionIndicatorManager = new WebGL2SelectionIndicatorManager()
    graphComponent.focusIndicatorManager = new WebGL2FocusIndicatorManager()
  } else {
    graphModelManager.renderMode = WebGL2GraphModelManagerRenderMode.SVG
    graphComponent.selectionIndicatorManager = new SelectionIndicatorManager()
    graphComponent.focusIndicatorManager = new FocusIndicatorManager()
  }
}

/**
 * Removes the event listener from the HTML select element with the given selector.
 * @param {!string} selector The selector that describes the HTML select element
 * @param {!GraphComponent} graphComponent The current graph component
 */
export function updateSvgWebGlSwitchButton(selector, graphComponent) {
  const renderModeSelectElement = document.querySelector(selector)
  renderModeSelectElement.removeEventListener('change', changeListener)

  changeListener = (e) => {
    changeRenderMode(graphComponent, e.target.value)
  }
  renderModeSelectElement.addEventListener('change', changeListener)

  // set to current render mode
  changeRenderMode(graphComponent, renderModeSelectElement.value)
}
