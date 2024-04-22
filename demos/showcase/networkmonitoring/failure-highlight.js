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
import {
  HighlightIndicatorManager,
  WebGL2BeaconNodeIndicatorStyle,
  WebGL2HighlightIndicatorManager
} from 'yfiles'
import { BrowserDetection } from 'demo-utils/BrowserDetection'

const highlightIndicatorManager = BrowserDetection.webGL2
  ? new WebGL2HighlightIndicatorManager({
      nodeStyle: new WebGL2BeaconNodeIndicatorStyle({
        shape: 'triangle',
        color: '#cc0000',
        pulseCount: 3,
        pulseWidth: 3,
        pulseDistance: 10,
        leaveTransition: '1s scale',
        timing: '1s ease-in-out 3 normal'
      })
    })
  : new HighlightIndicatorManager()

/**
 * Initializes failure highlighting for the given component.
 * @param {!CanvasComponent} canvasComponent
 */
export function installFailureHighlight(canvasComponent) {
  // First, check if the highlight is installed in another component
  uninstallFailureHighlight()
  highlightIndicatorManager.install(canvasComponent)
}

/**
 * Uninstalls failure highlighting from its component.
 */
export function uninstallFailureHighlight() {
  if (!highlightIndicatorManager.canvasComponent) {
    return
  }
  highlightIndicatorManager.uninstall(highlightIndicatorManager.canvasComponent)
}

/**
 * Shows the given node highlighted.
 * @param {!INode} node
 */
export function addFailureHighlight(node) {
  highlightIndicatorManager.addHighlight(node)
}

/**
 * Stops highlighting the given node.
 * @param {!INode} node
 */
export function removeFailureHighlight(node) {
  highlightIndicatorManager.removeHighlight(node)
}
