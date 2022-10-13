/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ICanvasObject,
  ICanvasObjectDescriptor,
  IInputModeContext,
  INode,
  IPositionHandler,
  IRenderContext,
  IVisualCreator,
  Mapper,
  Point,
  Rect,
  SvgVisual,
  Visual
} from 'yfiles'
import type { LayerVisual } from './LayerVisual'

/**
 * Helper class that moves a node and uses the location of the mouse
 * to determine the layer where the nodes should be moved to.
 */
export class LayerPositionHandler extends ConstrainedPositionHandler {
  private canvasObject: ICanvasObject = null!

  /**
   * Creates a new instance that wraps the base handler
   */
  constructor(
    baseHandler: IPositionHandler,
    private layerVisual: LayerVisual,
    private readonly node: INode,
    private newLayerMapper: Mapper<INode, number>
  ) {
    super(baseHandler)
  }

  /**
   * Called when a node drag started.
   * This add a rectangle which highlights the layer into which the node would be currently dropped.
   * @see overrides {@link ConstrainedPositionHandler.onInitialized}
   */
  onInitialized(inputModeContext: IInputModeContext, originalLocation: Point): void {
    super.onInitialized(inputModeContext, originalLocation)

    // create the visual indicator
    const visual = new LayerIndicatorVisual()
    const backgroundGroup = inputModeContext.canvasComponent!.backgroundGroup
    this.canvasObject = backgroundGroup.addChild(
      visual,
      ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
    )
    this.updateTargetBounds(inputModeContext.canvasComponent!.lastEventLocation)
  }

  /**
   * Called when a node drag was canceled.
   * The highlighting rectangle is removed.
   * @see overrides {@link ConstrainedPositionHandler.onCanceled}
   */
  onCanceled(context: IInputModeContext, originalLocation: Point): void {
    super.onCanceled(context, originalLocation)
    // clean up
    this.canvasObject.remove()
  }

  /**
   * Called when a node drag was finished.
   * The layer is updated for the moved node and the highlighting rectangle is removed.
   * @see overrides {@link ConstrainedPositionHandler.onFinished}
   */
  onFinished(
    inputModeContext: IInputModeContext,
    originalLocation: Point,
    newLocation: Point
  ): void {
    super.onFinished(inputModeContext, originalLocation, newLocation)
    // calculate the target layer
    const newLayer = this.updateTargetBounds(inputModeContext.canvasComponent!.lastEventLocation)
    // clean up
    this.canvasObject.remove()
    this.newLayerMapper.set(this.node, newLayer)
  }

  /**
   * Updates the highlighting rectangle while the node is moved.
   * @see overrides {@link ConstrainedPositionHandler.onMoved}
   */
  onMoved(inputModeContext: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    super.onMoved(inputModeContext, originalLocation, newLocation)
    // update the bounds to highlight
    this.updateTargetBounds(inputModeContext.canvasComponent!.lastEventLocation)
  }

  /**
   * Does nothing because the location should not be constrained.
   * @see overrides {@link ConstrainedPositionHandler.constrainNewLocation}
   */
  constrainNewLocation(
    context: IInputModeContext,
    originalLocation: Point,
    newLocation: Point
  ): Point {
    // do not constrain...
    return newLocation
  }

  /**
   * Updates the target bounds of the currently hit layer.
   */
  updateTargetBounds(location: Point): number {
    const lastLayer = this.layerVisual.getLayer(location)
    if (
      this.canvasObject !== null &&
      this.canvasObject.userObject instanceof LayerIndicatorVisual
    ) {
      this.canvasObject.userObject.bounds = this.layerVisual.getLayerBounds(lastLayer)
    }
    return lastLayer
  }
}

/**
 * Visual that presents a rectangle which marks the current layer to drop a node.
 */
class LayerIndicatorVisual
  extends BaseClass<IVisualCreator>(IVisualCreator)
  implements IVisualCreator
{
  bounds: Rect | null = null

  createVisual(context: IRenderContext): SvgVisual {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.x.baseVal.value = this.bounds ? this.bounds.x : 0
    rect.y.baseVal.value = this.bounds ? this.bounds.y : 0
    rect.width.baseVal.value = this.bounds ? this.bounds.width : -1
    rect.height.baseVal.value = this.bounds ? this.bounds.height : -1
    rect.setAttribute('fill', 'rgba(80,80,80,0.1)')
    rect.setAttribute('stroke', 'darkgray')
    return new SvgVisual(rect)
  }

  updateVisual(context: IRenderContext, oldVisual: Visual): Visual {
    if (!(oldVisual instanceof SvgVisual)) {
      return this.createVisual(context)
    }
    const rect = oldVisual.svgElement as SVGRectElement
    rect.x.baseVal.value = this.bounds ? this.bounds.x : 0
    rect.y.baseVal.value = this.bounds ? this.bounds.y : 0
    rect.width.baseVal.value = this.bounds ? this.bounds.width : -1
    rect.height.baseVal.value = this.bounds ? this.bounds.height : -1
    return oldVisual
  }
}
