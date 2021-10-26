/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  DragDropEffects,
  DragDropItem,
  DragEventArgs,
  DragSource,
  DropInputMode,
  HighlightIndicatorManager,
  IEdge,
  IGraph,
  IHitTester,
  IInputModeContext,
  IModelItem,
  INode,
  InputModeEventArgs,
  Point,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  SolidColorFill
} from 'yfiles'

/**
 * An {@link DropInputMode} specialized to drag and drop colors onto {@link INode}s and
 * {@link IEdge}s to change their current color.
 */
export class ColorDropInputMode extends DropInputMode {
  private _dropTarget: INode | IEdge | null

  /**
   * Constructs a new instance of class {@link ColorDropInputMode}.
   */
  constructor() {
    super('color')
    this._dropTarget = null
  }

  /**
   * Gets the currently dragged color from the drop data.
   */
  get draggedColor(): string {
    return this.dropData as string
  }

  /**
   * Gets the drop target at current mouse position.
   */
  get dropTarget(): INode | IEdge | null {
    return this._dropTarget
  }

  /**
   * Sets the the drop target and updates the highlighting.
   */
  set dropTarget(value: INode | IEdge | null) {
    if (this._dropTarget !== value) {
      const highlightManager = this.inputModeContext?.lookup(
        HighlightIndicatorManager.$class
      ) as HighlightIndicatorManager<IModelItem>

      if (highlightManager) {
        if (this._dropTarget) {
          highlightManager.removeHighlight(this._dropTarget)
        }
        if (value) {
          highlightManager.addHighlight(value)
        }
      }
      this._dropTarget = value
    }
  }

  protected onDraggedOver(evt: InputModeEventArgs) {
    super.onDraggedOver(this.createInputModeEventArgs())
    this.updateDropTarget(this.mousePosition.toPoint())
  }

  protected onDragLeft(evt: InputModeEventArgs) {
    super.onDragLeft(this.createInputModeEventArgs())
    this.cleanup()
  }

  protected onDragDropped(evt: InputModeEventArgs) {
    super.onDragDropped(this.createInputModeEventArgs())
    if (this.dropTarget && this.draggedColor) {
      this.applyColor(evt.context.graph, this.dropTarget, this.draggedColor)
    }
    this.cleanup()
  }

  /**
   * Updates the {@link dropTarget} at the given location.
   */
  private updateDropTarget(dragLocation: Point) {
    this.dropTarget = this.getDropTarget(dragLocation)
  }

  /**
   * Return an {@link INode} or an {@link IEdge} at the given location, when its color can be changed.
   * If there is no such item, <code>null</code> will be returned.
   */
  private getDropTarget(dragLocation: Point): INode | IEdge | null {
    const validDrag =
      !this.lastDragEventArgs || this.lastDragEventArgs.dropEffect !== DragDropEffects.NONE
    const context = this.inputModeContext
    const color = this.draggedColor

    if (validDrag && context && color) {
      const item = this.findEdgeOrNode(context, dragLocation)
      if (item && this.accept(item, color)) {
        return item
      }
    }
    return null
  }

  /**
   * Finds the first edge or node that contains the given location.
   */
  private findEdgeOrNode(context: IInputModeContext, location: Point): IEdge | INode | null {
    const hitTester = context.lookup(IHitTester.$class) as IHitTester<IModelItem>
    if (hitTester) {
      // hit testing needs to be done with a context whose parent input mode is this mode,
      // because hit testables may behave differently depending on context
      // this is e.g. the case for DemoGroupStyle, see DemoGroupStyle#isHit in
      // ../../resources/demo-styles.ts
      const childContext = IInputModeContext.createInputModeContext(this, context)
      return hitTester.enumerateHits(childContext, location).firstOrDefault(isEdgeOrNode) as
        | IEdge
        | INode
        | null
    }
    return null
  }

  /**
   * Checks whether the color of the specified {@link IModelItem item} can be changed.
   */
  private accept(item: IModelItem, color: string): boolean {
    if (item instanceof INode && item.style instanceof ShapeNodeStyle) {
      return !item.style.fill || !item.style.fill.hasSameValue(color)
    }

    if (item instanceof IEdge && item.style instanceof PolylineEdgeStyle && item.style.stroke) {
      return !item.style.stroke.fill || !item.style.stroke.fill.hasSameValue(color)
    }

    return false
  }

  /**
   * Changes the color of the given {@link INode} or {@link IEdge} to the given color.
   */
  private applyColor(graph: IGraph | null, item: INode | IEdge, color: string): void {
    if (item instanceof INode && item.style instanceof ShapeNodeStyle) {
      this.applyNodeColor(graph, item.style, color)
    }

    if (item instanceof IEdge && item.style instanceof PolylineEdgeStyle && item.style.stroke) {
      this.applyEdgeColor(graph, item.style, color)
    }
  }

  /**
   * Changes the color of the given {@link INode} to the given color.
   */
  private applyNodeColor(graph: IGraph | null, style: ShapeNodeStyle, color: string): void {
    const oldFill = style.fill
    const newFill = new SolidColorFill(color)
    if (graph) {
      graph.addUndoUnit(
        'Change Node Color',
        'Change Node Color',
        () => (style.fill = oldFill),
        () => (style.fill = newFill)
      )
    }
    style.fill = newFill
  }

  /**
   * Changes the color of the given {@link IEdge} to the given color.
   */
  private applyEdgeColor(graph: IGraph | null, style: PolylineEdgeStyle, color: string): void {
    const oldStroke = style.stroke
    const newStroke = style.stroke!.cloneCurrentValue()
    newStroke.fill = new SolidColorFill(color)
    if (graph) {
      graph.addUndoUnit(
        'Change Edge Color',
        'Change Edge Color',
        () => (style.stroke = oldStroke),
        () => (style.stroke = newStroke)
      )
    }
    style.stroke = newStroke
  }

  /**
   * Sets the {@link DragEventArgs.dropEffect drop effect} to {@link DragDropEffects.COPY copy} if
   * the current drop target is valid or to {@link DragDropEffects.NONE none} otherwise.
   * <p>
   * Depending on the current drop effect the CSS class <code>yfiles-cursor-dragdrop-copy</code> or
   * <code>yfiles-cursor-dragdrop-no-drop</code> is assigned to the element hovered during the drag
   * operation. This allows for updating the mouse cursor using CSS classes.
   * </p>
   */
  protected adjustEffect(evt: DragEventArgs): boolean {
    if (super.adjustEffect(evt)) {
      const target = this.getDropTarget(this.mousePosition.toPoint())
      evt.dropEffect = target ? DragDropEffects.COPY : DragDropEffects.NONE
      return true
    }
    return false
  }

  /**
   * Resets the {@link dropTarget}.
   */
  private cleanup() {
    this.dropTarget = null
  }

  /**
   * Starts a drag operation from the given HTML element.
   * The given color string constitutes the tranfer data of the drag operation.
   */
  public static startDrag(
    dragSource: HTMLElement,
    color: String,
    dragDropEffects: DragDropEffects = DragDropEffects.ALL,
    useCssCursors = true,
    dragPreview: HTMLElement | null = null
  ): DragSource {
    const source = new DragSource(dragSource)
    source.startDrag(new DragDropItem('color', color), dragDropEffects, useCssCursors, dragPreview)
    return source
  }
}

/**
 * Determines if the given item is an {@link IEdge} or an {@link INode} instance.
 */
function isEdgeOrNode(item: IModelItem): boolean {
  return item instanceof IEdge || item instanceof INode
}
