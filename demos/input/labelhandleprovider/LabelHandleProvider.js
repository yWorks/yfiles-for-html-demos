/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
﻿'use strict'

define(['yfiles/view-editor', 'LabelResizeHandle.js', 'LabelRotateHandle.js'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  LabelResizeHandle,
  LabelRotateHandle
) => {
  /**
   * A custom {@link yfiles.input.IHandleProvider} implementation that returns a {@link LabelResizeHandle} for each
   * label which can be resized and a {@link LabelRotateHandle} for each label which can be rotated.
   */
  class LabelHandleProvider extends yfiles.lang.Class(yfiles.input.IHandleProvider) {
    /**
     * Creates a new instance of <code>LabelHandleProvider</code>.
     * @param {yfiles.graph.ILabel} label The given label
     */
    constructor(label) {
      super()
      this.$label = label
    }

    /**
     * Implementation of {@link yfiles.input.IHandleProvider#getHandles}.
     *
     * Returns a list of available handles for the label this instance has been created for.
     * @param {yfiles.input.IInputModeContext} context
     * @return {yfiles.collections.IEnumerable<yfiles.input.IHandle>}
     */
    getHandles(context) {
      // return a list of the available handles
      const handles = new yfiles.collections.List()
      const labelModel = this.$label.layoutParameter.model
      if (labelModel instanceof yfiles.graph.InteriorStretchLabelModel) {
        // Some label models are not resizable at all - don't provide any handles
      } else if (
        labelModel instanceof yfiles.graph.FreeEdgeLabelModel ||
        labelModel instanceof yfiles.graph.FreeNodeLabelModel ||
        labelModel instanceof yfiles.graph.FreeLabelModel
      ) {
        // These models support resizing in one direction
        handles.add(new LabelResizeHandle(this.$label, false))
        // They also support rotation
        handles.add(new LabelRotateHandle(this.$label, context))
      } else {
        // For all other models, we assume the *center* needs to stay the same
        // This requires that the label must be resized symmetrically in both directions
        handles.add(new LabelResizeHandle(this.$label, true))
      }
      return handles
    }
  }

  return LabelHandleProvider
})
