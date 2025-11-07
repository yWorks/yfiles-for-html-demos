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
import { BaseClass, IPositionHandler } from '@yfiles/yfiles'
import { hideInfo, showInfo } from '../info-panel'
import { getDate, syncActivityWithNodeLayout, updateNodeColor } from '../gantt-utils'

/**
 * Controls the move of an activity node.
 */
export class ActivityNodePositionHandler extends BaseClass(IPositionHandler) {
  wrappedHandler
  node

  constructor(node, wrappedHandler) {
    super()
    this.node = node
    this.wrappedHandler = wrappedHandler
  }

  /**
   * Called when the grad gesture starts.
   */
  initializeDrag(context) {
    this.wrappedHandler?.initializeDrag(context)
  }

  /**
   * Shows the date at the current mouse location and updates the node color based on the color
   * of the task at the current mouse location.
   */
  handleMove(context, originalLocation, newLocation) {
    this.wrappedHandler?.handleMove(context, originalLocation, newLocation)

    // get the location of the node and calculate the date to which it belongs
    const location = this.node.layout.topLeft
    const text = getDate(location.x).format()

    // show the info panel
    showInfo(text, location, context.canvasComponent)

    // update the color of the node based on the task that exists at the current grid location
    updateNodeColor(this.node)
  }

  /**
   * Hides the info popup and writes back the current date/time information to the data associated with
   * the current activity node.
   */
  dragFinished(context, originalLocation, newLocation) {
    this.wrappedHandler?.dragFinished(context, originalLocation, newLocation)
    hideInfo()
    syncActivityWithNodeLayout(this.node)
  }

  /**
   * Hides the info popup and resets the node color to its original one.
   */
  cancelDrag(context, originalLocation) {
    this.wrappedHandler?.cancelDrag(context, originalLocation)
    hideInfo()
    updateNodeColor(this.node)
  }

  /**
   * Returns the top-left location of the node.
   */
  get location() {
    return this.node.layout.topLeft
  }
}
