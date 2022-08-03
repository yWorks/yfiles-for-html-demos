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
  IBoundsProvider,
  ICanvasContext,
  ICanvasObject,
  ICanvasObjectDescriptor,
  ICanvasObjectGroup,
  IHighlightIndicatorInstaller,
  IHitTestable,
  ILabel,
  IRenderContext,
  IVisibilityTestable,
  IVisualCreator,
  Matrix,
  Point,
  Rect,
  SimpleLabel,
  SvgVisual,
  SvgVisualGroup,
  Visual,
  VoidVisualCreator
} from 'yfiles'

/**
 * Highlight installer that adds a highlight visual to a label which shows an enlarged version of the label.
 * When the zoom level is below 1, the highlight's size will be calculated without the zoom in view coordinates.
 * In case the zoom level is above 1, the highlight will only slightly enlarge the label.
 */
export default class MagnifyLabelHighlightInstaller
  extends BaseClass(IHighlightIndicatorInstaller)
  implements IHighlightIndicatorInstaller
{
  /**
   * This the main method of the interface that performs the installation of an item's visual representation in the
   * canvas by adding ICanvasObjects.
   * @param context The context that contains the information required to install the
   *   visual representation
   * @param group The canvas object group to add the newly generated ICanvasObject
   * @param item The item to install.
   * @return The newly generated ICanvasObject for the item's visual representation or
   *   null if nothing was installed.
   */
  addCanvasObject(
    context: ICanvasContext,
    group: ICanvasObjectGroup,
    item: any
  ): ICanvasObject | null {
    return item instanceof ILabel ? group.addChild(item, new LabelStyleDescriptor()) : null
  }
}

/**
 * Label style descriptor that provides all necessary information for the highlight.
 */
class LabelStyleDescriptor
  extends BaseClass(ICanvasObjectDescriptor, IVisualCreator, IBoundsProvider, IVisibilityTestable)
  implements ICanvasObjectDescriptor, IVisualCreator, IBoundsProvider, IVisibilityTestable
{
  // create a dummy label that will be drawn as highlight above the original label.
  private item: SimpleLabel = new SimpleLabel()
  private original: ILabel | null = null

  /**
   * Sets the item with all data relevant for drawing the highlight.
   * @param item The item to be set
   */
  private updateItem(item: any) {
    if (item instanceof ILabel) {
      this.original = item
      this.item.style = item.style
      this.item.tag = item.tag
      this.item.preferredSize = item.preferredSize
      this.item.layoutParameter = item.layoutParameter
      this.item.owner = item.owner
    } else {
      this.original = null
      this.item = new SimpleLabel()
    }
  }

  /**
   * Returns an implementation of IVisualCreator that will create the Visual tree for the user object.
   * @param forUserObject The user object to create a Visual for
   * @return An implementation of IVisualCreator
   */
  getVisualCreator(forUserObject: any): IVisualCreator {
    this.updateItem(forUserObject)
    return this.original !== null ? this : VoidVisualCreator.INSTANCE
  }

  /**
   * Returns an implementation of IBoundsProvider that can determine the visible bounds of the rendering of the user
   * object.
   * @param forUserObject The user object to query the bounds for
   * @return An implementation of IBoundsProvider
   */
  getBoundsProvider(forUserObject: any): IBoundsProvider {
    this.updateItem(forUserObject)
    return this.original !== null ? this : IBoundsProvider.EMPTY
  }

  /**
   * Returns an implementation of IVisibilityTestable that can determine if the rendering of the user object would be
   * visible in a given context.
   * @param forUserObject The user object to query the visibility test for
   * @return An implementation of IVisibilityTestable
   */
  getVisibilityTestable(forUserObject: any): IVisibilityTestable {
    this.updateItem(forUserObject)
    return this.original !== null ? this : IVisibilityTestable.NEVER
  }

  /**
   * Returns an implementation of IHitTestable that can determine whether the rendering of the user object has
   * been hit at a given coordinate.
   * @param forUserObject The user object to do the hit testing for
   * @return An implementation of IHitTestable
   */
  getHitTestable(forUserObject: any): IHitTestable {
    return IHitTestable.NEVER
  }

  /**
   * Determines whether the given canvas object is deemed dirty and needs updating.
   * @param context The context that will be used for the update
   * @param canvasObject The object to check
   * @return True if the given canvas object needs updating, false otherwise
   */
  isDirty(context: ICanvasContext, canvasObject: ICanvasObject): boolean {
    return true
  }

  /**
   * Creates the descriptor's visual.
   * @param context The context that describes where the visual will be used
   * @return The newly created visual
   */
  createVisual(context: IRenderContext): Visual | null {
    // create a visual group
    const group = new SvgVisualGroup()

    // use the label style to create a visual for the label
    const labelStyle = this.item.style
    const labelVisual = labelStyle.renderer
      .getVisualCreator(this.original!, labelStyle)
      .createVisual(context)
    group.add(labelVisual as SvgVisual)

    // move the combined visual to the location of the label
    // enlarge the highlight's size considering the zoom level
    this.arrangeVisual(context, group)
    return group
  }

  /**
   * Updates the descriptor's visual.
   * @param context The context that describes where the visual will be used
   * @param oldVisual The old visual
   * @return The newly created visual
   */
  updateVisual(context: IRenderContext, oldVisual: Visual): Visual | null {
    if (!(oldVisual instanceof SvgVisualGroup) || oldVisual.children.size !== 2) {
      return this.createVisual(context)
    }

    const labelVisual = oldVisual.children.get(0)
    if (labelVisual === null) {
      // nothing to draw
      return this.createVisual(context)
    }

    // use the label style to update the highlight
    const labelStyle = this.item.style
    const updatedLabelVisual = labelStyle.renderer
      .getVisualCreator(this.original!, labelStyle)
      .updateVisual(context, labelVisual)

    if (updatedLabelVisual === null) {
      // nothing to draw
      return null
    }

    // update visuals if necessary
    if (updatedLabelVisual !== labelVisual) {
      oldVisual.children.set(0, updatedLabelVisual as SvgVisual)
    }

    // move visual to the right location and adjust size
    this.arrangeVisual(context, oldVisual)
    return oldVisual
  }

  /**
   * Arranges the visual to the correct location.
   * @param context The context that describes where the visual will be used
   * @param group The svg visual group
   */
  private arrangeVisual(context: IRenderContext, group: SvgVisualGroup): void {
    const itemCenterX = this.item.layout.orientedRectangleCenter.x
    const itemCenterY = this.item.layout.orientedRectangleCenter.y
    const transform = new Matrix()
    transform.translate(new Point(itemCenterX, itemCenterY))
    const zoom = context.canvasComponent!.zoom
    if (zoom < 1) {
      // if the zoom level is below 1, reverse the zoom for this label before enlarging it
      transform.scale(1 / zoom, 1 / zoom)
    }
    transform.scale(1.2, 1.2)
    transform.translate(new Point(-itemCenterX, -itemCenterY))
    group.transform = transform
  }

  /**
   * Returns a tight rectangular area where the whole rendering would fit into.
   * @param context The context to calculate the bounds for
   * @return The bounds of the visual
   */
  getBounds(context: ICanvasContext): Rect {
    return this.item.style.renderer.getBoundsProvider(this.item, this.item.style).getBounds(context)
  }

  /**
   * Determines whether an element might intersect the visible region for a given context.
   * @param context The context to determine the visibility for.
   * @param rectangle The visible region clip
   * @return True if the element intersects the visible region, false otherwise
   */
  isVisible(context: ICanvasContext, rectangle: Rect): boolean {
    return this.getBounds(context).intersects(rectangle)
  }
}
