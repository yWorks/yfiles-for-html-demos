/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ILabelOwner,
  ISnapReferenceProvider,
  OrthogonalSnapLine,
  Point,
  SnapLineOrientation,
  SnapLineSnapTypes,
  SnapReferenceVisualizationType
} from '@yfiles/yfiles'

/**
 * Wraps a given {@link ISnapReferenceProvider} and adds additional {@link OrthogonalSnapLine}s
 * for orthogonal labels of an {@link IModelItem}. For each orthogonal label there are
 * {@link OrthogonalSnapLine}s added for its top, bottom, left, and right side.
 */
export class OrthogonalLabelSnapLineProviderWrapper extends BaseClass(ISnapReferenceProvider) {
  wrapped
  item

  /**
   * Creates a new instance that wraps the given snap line provider.
   * @param item The owner of the label
   * @param wrapped The snap line provider that will be wrapped.
   */
  constructor(item, wrapped) {
    super()
    this.item = item
    this.wrapped = wrapped
  }

  /**
   * Calls {@link ISnapReferenceProvider.addSnapReferences} of the wrapped provider and adds custom
   * {@link OrthogonalSnapLine}s for the given `item`.
   * @param context The context which holds the settings for the snap lines.
   * @param args The argument to use for adding snap lines.
   * @see Specified by {@link ISnapReferenceProvider.addSnapReferences}.
   */
  addSnapReferences(context, args) {
    this.wrapped.addSnapReferences(context, args)

    if (this.item instanceof ILabelOwner) {
      this.addCustomSnapLines(args, this.item)
    }
  }

  /**
   * Adds custom snap lines for orthogonal labels
   * @param args The argument to use for adding snap lines.
   * @param labeledItem The item to add snap lines for.
   */
  addCustomSnapLines(args, labeledItem) {
    labeledItem.labels.forEach((label) => {
      // round UpX to its first 6 digits
      const upX = Math.round(label.layout.upX * 10 ** 6) / 10 ** 6
      // check if it's orthogonal
      if (upX === 0 || upX === 1 || upX === -1) {
        // label is orthogonal
        const bounds = label.layout.bounds

        // add snap lines to the top, bottom, left and right border of the label
        //
        // snap line for the label's top border
        const topCenter = bounds.topLeft.add(new Point(label.layout.width / 2, 0))
        let snapLine = new OrthogonalSnapLine(
          SnapLineOrientation.HORIZONTAL,
          SnapLineSnapTypes.BOTTOM,
          SnapReferenceVisualizationType.FIXED_LINE,
          topCenter,
          bounds.x - 10,
          bounds.maxX + 10,
          true,
          100
        )
        args.addSnapReference(snapLine)

        // snap line for the label's bottom border
        const bottomCenter = bounds.bottomLeft.add(new Point(label.layout.width / 2, 0))
        snapLine = new OrthogonalSnapLine(
          SnapLineOrientation.HORIZONTAL,
          SnapLineSnapTypes.TOP,
          SnapReferenceVisualizationType.FIXED_LINE,
          bottomCenter,
          bounds.x - 10,
          bounds.maxX + 10,
          true,
          100
        )
        args.addSnapReference(snapLine)

        // snap line for the label's left border
        const leftCenter = bounds.topLeft.add(new Point(0, label.layout.height / 2))
        snapLine = new OrthogonalSnapLine(
          SnapLineOrientation.VERTICAL,
          SnapLineSnapTypes.RIGHT,
          SnapReferenceVisualizationType.FIXED_LINE,
          leftCenter,
          bounds.y - 10,
          bounds.maxY + 10,
          true,
          100
        )
        args.addSnapReference(snapLine)

        // snap line for the label's right border
        const rightCenter = bounds.topRight.add(new Point(0, label.layout.height / 2))
        snapLine = new OrthogonalSnapLine(
          SnapLineOrientation.VERTICAL,
          SnapLineSnapTypes.LEFT,
          SnapReferenceVisualizationType.FIXED_LINE,
          rightCenter,
          bounds.y - 10,
          bounds.maxY + 10,
          true,
          100
        )
        args.addSnapReference(snapLine)
      }
    })
  }
}
