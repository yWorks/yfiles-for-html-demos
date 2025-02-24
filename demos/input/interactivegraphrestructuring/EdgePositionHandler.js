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
import { BaseClass, IHandle, IPositionHandler, MutablePoint } from '@yfiles/yfiles'
/**
 * An {@link IPositionHandler} that moves the bends of an edge
 */
export class EdgePositionHandler extends BaseClass(IPositionHandler) {
  edge
  handles = []
  _location
  /**
   * Creates a new instance of the EdgePositionHandler
   * @param edge the edge which should be moved
   */
  constructor(edge) {
    super()
    this.edge = edge
    this._location = new MutablePoint()
  }
  /**
   * The Edge is canceled being dragged
   * @param context The context to retrieve information about the drag from
   * @param _originalLocation The value of the location property at the time of initializeDrag
   */
  cancelDrag(context, _originalLocation) {
    this.handles.forEach((handleStructure) => {
      handleStructure.handle.cancelDrag(context, handleStructure.originalLocation)
    })
  }
  /**
   * The Edge is canceled being dragged
   * @param context The context to retrieve information about the drag from
   * @param originalLocation The value of the location property at the time of initializeDrag
   * @param newLocation The coordinates in the world coordinate system that the client wants the handles to be at
   */
  dragFinished(context, originalLocation, newLocation) {
    const delta = newLocation.subtract(originalLocation)
    this.handles.forEach((handleStructure) => {
      handleStructure.handle.dragFinished(
        context,
        handleStructure.originalLocation,
        handleStructure.originalLocation.add(delta)
      )
    })
  }
  /**
   * The edge is dragged.
   * @param context The context to retrieve information about the drag from
   * @param originalLocation The value of the location property at the time of initializeDrag
   * @param newLocation The coordinates in the world coordinate system that the client wants the handles to be at
   */
  handleMove(context, originalLocation, newLocation) {
    const delta = newLocation.subtract(originalLocation)
    this.handles.forEach((handleStructure) => {
      handleStructure.handle.handleMove(
        context,
        handleStructure.originalLocation,
        handleStructure.originalLocation.add(delta)
      )
    })
  }
  /**
   * The edge is about to be dragged.
   * @param context The context to retrieve information about the drag from
   */
  initializeDrag(context) {
    for (let bend of this.edge.bends) {
      let handle = bend?.lookup(IHandle)
      if (handle) {
        this.handles.push(new HandleStructure(handle, handle.location.toPoint()))
      }
    }
  }
  get location() {
    return this._location
  }
}
/**
 * Helper class that represent a handle struct
 */
class HandleStructure {
  handle
  originalLocation
  constructor(handle, originalLocation) {
    this.handle = handle
    this.originalLocation = originalLocation
  }
}
