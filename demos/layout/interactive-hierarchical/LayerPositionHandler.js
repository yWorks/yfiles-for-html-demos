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
  BaseClass,
  ConstrainedPositionHandler,
  IInputModeContext,
  INode,
  IPositionHandler,
  IRenderContext,
  IRenderTreeElement,
  IVisualCreator,
  Mapper,
  Point,
  Rect,
  SvgVisual,
  Visual
} from '@yfiles/yfiles'
/**
 * Helper class that moves a node and uses the location of the mouse
 * to determine the layer where the nodes should be moved to.
 */
export class LayerPositionHandler extends ConstrainedPositionHandler {
  layerVisual
  node
  newLayerMapper
  renderTreeElement = null
  /**
   * Creates a new instance that wraps the base handler
   */
  constructor(baseHandler, layerVisual, node, newLayerMapper) {
    super(baseHandler)
    this.layerVisual = layerVisual
    this.node = node
    this.newLayerMapper = newLayerMapper
  }
  /**
   * Called when a node drag started.
   * This add a rectangle which highlights the layer into which the node would be currently dropped.
   * @see overrides {@link ConstrainedPositionHandler.onInitialized}
   */
  onInitialized(inputModeContext, originalLocation) {
    super.onInitialized(inputModeContext, originalLocation)
    // create the visual indicator
    const visual = new LayerIndicatorVisual()
    this.renderTreeElement = inputModeContext.canvasComponent.renderTree.createElement(
      inputModeContext.canvasComponent.renderTree.backgroundGroup,
      visual
    )
    this.updateTargetBounds(inputModeContext.canvasComponent.lastEventLocation)
  }
  /**
   * Called when a node drag was canceled.
   * The highlighting rectangle is removed.
   * @see overrides {@link ConstrainedPositionHandler.onCanceled}
   */
  onCanceled(context, originalLocation) {
    super.onCanceled(context, originalLocation)
    // clean up
    context.canvasComponent?.renderTree.remove(this.renderTreeElement)
  }
  /**
   * Called when a node drag was finished.
   * The layer is updated for the moved node and the highlighting rectangle is removed.
   * @see overrides {@link ConstrainedPositionHandler.onFinished}
   */
  onFinished(inputModeContext, originalLocation, newLocation) {
    super.onFinished(inputModeContext, originalLocation, newLocation)
    // calculate the target layer
    const newLayer = this.updateTargetBounds(inputModeContext.canvasComponent.lastEventLocation)
    // clean up
    inputModeContext.canvasComponent?.renderTree.remove(this.renderTreeElement)
    this.newLayerMapper.set(this.node, newLayer)
  }
  /**
   * Updates the highlighting rectangle while the node is moved.
   * @see overrides {@link ConstrainedPositionHandler.onMoved}
   */
  onMoved(inputModeContext, originalLocation, newLocation) {
    super.onMoved(inputModeContext, originalLocation, newLocation)
    // update the bounds to highlight
    this.updateTargetBounds(inputModeContext.canvasComponent.lastEventLocation)
  }
  /**
   * Does nothing because the location should not be constrained.
   * @see overrides {@link ConstrainedPositionHandler.constrainNewLocation}
   */
  constrainNewLocation(context, originalLocation, newLocation) {
    // do not constrain...
    return newLocation
  }
  /**
   * Updates the target bounds of the currently hit layer.
   */
  updateTargetBounds(location) {
    const lastLayer = this.layerVisual.getLayer(location)
    if (
      this.renderTreeElement !== null &&
      this.renderTreeElement.tag instanceof LayerIndicatorVisual
    ) {
      this.renderTreeElement.tag.bounds = this.layerVisual.getLayerBounds(lastLayer)
    }
    return lastLayer
  }
}
/**
 * Visual that presents a rectangle which marks the current layer to drop a node.
 */
class LayerIndicatorVisual extends BaseClass(IVisualCreator) {
  bounds = null
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
  updateVisual(context, oldVisual) {
    if (!(oldVisual instanceof SvgVisual)) {
      return this.createVisual(context)
    }
    const rect = oldVisual.svgElement
    rect.x.baseVal.value = this.bounds ? this.bounds.x : 0
    rect.y.baseVal.value = this.bounds ? this.bounds.y : 0
    rect.width.baseVal.value = this.bounds ? this.bounds.width : -1
    rect.height.baseVal.value = this.bounds ? this.bounds.height : -1
    return oldVisual
  }
}
