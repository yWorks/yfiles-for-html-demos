/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  BaseClass,
  ConstrainedPositionHandler,
  ICanvasObjectDescriptor,
  IInputModeContext,
  INode,
  IPositionHandler,
  IRenderContext,
  IVisualCreator,
  Point,
  SvgVisual,
  Visual
} from 'yfiles'

/**
 * Helper class that moves a node and uses the location of the mouse
 * to determine the layer where the nodes should be moved to.
 */
export default class LayerPositionHandler extends ConstrainedPositionHandler {
  /**
   * Creates a new instance that wraps the base handler
   * @param {IPositionHandler} baseHandler
   * @param {LayerVisual} layerVisual
   * @param {INode} node
   * @param {IMapper.<INode,number>} layerMapper
   */
  constructor(baseHandler, layerVisual, node, layerMapper) {
    super(baseHandler)
    this.layerVisual = layerVisual
    this.node = node
    this.newLayerMapper = layerMapper
    this.canvasObject = null
  }

  /**
   * Called when a node drag started.
   * This add a rectangle which highlights the layer into which the node would be currently dropped.
   * @see overrides {@link ConstrainedPositionHandler#onInitialized}
   * @param {IInputModeContext} inputModeContext
   * @param {Point} originalLocation
   */
  onInitialized(inputModeContext, originalLocation) {
    super.onInitialized(inputModeContext, originalLocation)

    // create the visual indicator
    const visual = new LayerIndicatorVisual()
    const backgroundGroup = inputModeContext.canvasComponent.backgroundGroup
    this.canvasObject = backgroundGroup.addChild(
      visual,
      ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
    )
    this.updateTargetBounds(inputModeContext.canvasComponent.lastEventLocation)
  }

  /**
   * Called when a node drag was canceled.
   * The highlighting rectangle is removed.
   * @see overrides {@link ConstrainedPositionHandler#onCanceled}
   * @param {IInputModeContext} context
   * @param {Point} originalLocation
   */
  onCanceled(context, originalLocation) {
    super.onCanceled(context, originalLocation)
    // clean up
    this.canvasObject.remove()
    this.canvasObject = null
  }

  /**
   * Called when a node drag was finished.
   * The layer is updated for the moved node and the highlighting rectangle is removed.
   * @see overrides {@link ConstrainedPositionHandler#onFinished}
   * @param {IInputModeContext} inputModeContext
   * @param {Point} originalLocation
   * @param {Point} newLocation
   */
  onFinished(inputModeContext, originalLocation, newLocation) {
    super.onFinished(inputModeContext, originalLocation, newLocation)
    // calculate the target layer
    const newLayer = this.updateTargetBounds(inputModeContext.canvasComponent.lastEventLocation)
    // clean up
    this.canvasObject.remove()
    this.canvasObject = null
    this.newLayerMapper.set(this.node, newLayer)
  }

  /**
   * Updates the highlighting rectangle while the node is moved.
   * @see overrides {@link ConstrainedPositionHandler#onMoved}
   * @param {IInputModeContext} inputModeContext
   * @param {Point} originalLocation
   * @param {Point} newLocation
   */
  onMoved(inputModeContext, originalLocation, newLocation) {
    super.onMoved(inputModeContext, originalLocation, newLocation)
    // update the bounds to highlight
    this.updateTargetBounds(inputModeContext.canvasComponent.lastEventLocation)
  }

  /**
   * Does nothing because the location should not be constrained.
   * @see overrides {@link ConstrainedPositionHandler#constrainNewLocation}
   * @param {IInputModeContext} inputModeContext
   * @param {Point} originalLocation
   * @param {Point} newLocation
   */
  constrainNewLocation(context, originalLocation, newLocation) {
    // do not constrain...
    return newLocation
  }

  /**
   * Updates the target bounds of the currently hit layer.
   * @param {Point} location
   * @return {number}
   */
  updateTargetBounds(location) {
    const lastLayer = this.layerVisual.getLayer(location)
    if (this.canvasObject !== null) {
      this.canvasObject.userObject.bounds = this.layerVisual.getLayerBounds(lastLayer)
    }
    return lastLayer
  }
}

/**
 * Visual that presents a rectangle which marks the current layer to drop a node.
 */
class LayerIndicatorVisual extends BaseClass(IVisualCreator) {
  /**
   * @param {IRenderContext} context
   * @return {SvgVisual}
   */
  createVisual(context) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.x.baseVal.value = this.bounds ? this.bounds.x : 0
    rect.y.baseVal.value = this.bounds ? this.bounds.y : 0
    rect.width.baseVal.value = this.bounds ? this.bounds.width : -1
    rect.height.baseVal.value = this.bounds ? this.bounds.height : -1
    rect.setAttribute('fill', 'rgba(80,80,80,0.1)')
    rect.setAttribute('stroke', 'darkgray')
    return new SvgVisual(rect)
  }

  /**
   * @param {IRenderContext} context
   * @param {Visual} oldVisual
   * @return {Visual}
   */
  updateVisual(context, oldVisual) {
    const rect = oldVisual.svgElement
    rect.x.baseVal.value = this.bounds ? this.bounds.x : 0
    rect.y.baseVal.value = this.bounds ? this.bounds.y : 0
    rect.width.baseVal.value = this.bounds ? this.bounds.width : -1
    rect.height.baseVal.value = this.bounds ? this.bounds.height : -1
    return oldVisual
  }
}
