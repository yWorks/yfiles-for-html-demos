/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

define(['yfiles/view-editor'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * Wraps a given {@link yfiles.input.ISnapLineProvider} and adds additional {@link yfiles.input.OrthogonalSnapLine}s
   * for orthogonal labels of an {@link yfiles.model.IModelItem}. For each orthogonal label there are
   * {@link yfiles.input.OrthogonalSnapLine}s added for it's top, bottom, left and right side.
   * @implements {yfiles.input.ISnapLineProvider}
   */
  class OrthogonalLabelSnapLineProviderWrapper extends yfiles.lang.Class(
    yfiles.input.ISnapLineProvider
  ) {
    /**
     * Creates a new instance that wraps the given <code>wrapped</code>.
     * @param {yfiles.input.ISnapLineProvider} wrapped The snap line provider that shall be wrapped.
     */
    constructor(wrapped) {
      super()
      this.wrapped = wrapped
    }

    /**
     * Calls {@link yfiles.input.ISnapLineProvider#addSnapLines} of the wrapped provider and adds custom
     * {@link yfiles.input.OrthogonalSnapLine}s for the <code>item</code>.
     * @param {yfiles.input.GraphSnapContext} context The context which holds the settings for the snap lines.
     * @param {yfiles.input.CollectGraphSnapLinesEventArgs} args The argument to use for adding snap lines.
     * @param {yfiles.graph.IModelItem} item The item to add snaplines for.
     * @see Specified by {@link yfiles.input.ISnapLineProvider#addSnapLines}.
     */
    addSnapLines(context, args, item) {
      this.wrapped.addSnapLines(context, args, item)

      // add snaplines for orthogonal labels
      const labeledItem = yfiles.graph.ILabelOwner.isInstance(item) ? item : null
      if (labeledItem === null) {
        return
      }
      labeledItem.labels.forEach(label => {
        // round UpX to its first 6 digits
        const upX = Math.round(label.layout.upX * Math.pow(10, 6)) / Math.pow(10, 6)
        // check if it's orthogonal
        if (upX === 0 || upX === 1 || upX !== -1) {
          // label is orthogonal
          const bounds = label.layout.bounds

          // add snaplines to the top, bottom, left and right border of the label
          const topCenter = bounds.topLeft.add(new yfiles.geometry.Point(label.layout.width / 2, 0))
          let snapLine = new yfiles.input.OrthogonalSnapLine(
            yfiles.input.SnapLineOrientation.HORIZONTAL,
            yfiles.input.SnapLineSnapTypes.BOTTOM,
            yfiles.input.SnapLine.SNAP_LINE_FIXED_LINE_KEY,
            topCenter,
            bounds.minX - 10,
            bounds.maxX + 10,
            label,
            100
          )
          args.addAdditionalSnapLine(snapLine)

          const bottomCenter = bounds.bottomLeft.add(
            new yfiles.geometry.Point(label.layout.width / 2, 0)
          )
          snapLine = new yfiles.input.OrthogonalSnapLine(
            yfiles.input.SnapLineOrientation.HORIZONTAL,
            yfiles.input.SnapLineSnapTypes.TOP,
            yfiles.input.SnapLine.SNAP_LINE_FIXED_LINE_KEY,
            bottomCenter,
            bounds.minX - 10,
            bounds.maxX + 10,
            label,
            100
          )
          args.addAdditionalSnapLine(snapLine)

          const leftCenter = bounds.topLeft.add(
            new yfiles.geometry.Point(0, label.layout.height / 2)
          )
          snapLine = new yfiles.input.OrthogonalSnapLine(
            yfiles.input.SnapLineOrientation.VERTICAL,
            yfiles.input.SnapLineSnapTypes.RIGHT,
            yfiles.input.SnapLine.SNAP_LINE_FIXED_LINE_KEY,
            leftCenter,
            bounds.minY - 10,
            bounds.maxY + 10,
            label,
            100
          )
          args.addAdditionalSnapLine(snapLine)

          const rightCenter = bounds.topRight.add(
            new yfiles.geometry.Point(0, label.layout.height / 2)
          )
          snapLine = new yfiles.input.OrthogonalSnapLine(
            yfiles.input.SnapLineOrientation.VERTICAL,
            yfiles.input.SnapLineSnapTypes.LEFT,
            yfiles.input.SnapLine.SNAP_LINE_FIXED_LINE_KEY,
            rightCenter,
            bounds.minY - 10,
            bounds.maxY + 10,
            label,
            100
          )
          args.addAdditionalSnapLine(snapLine)
        }
      })
    }
  }

  return OrthogonalLabelSnapLineProviderWrapper
})
