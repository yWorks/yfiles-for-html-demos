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
import { EditLabelHelper } from '@yfiles/yfiles'

/**
 * Custom label edit helper.
 *
 * This class does the following:
 *
 * - Allow at most two labels
 * - Disallow editing the first label
 * - Use custom placement and style for the first label
 * - Change the appearance of the {@link TextEditorInputMode}
 * For convenience, this implementation inherits from the predefined {@link EditLabelHelper} class.
 */
export class CustomEditLabelHelper extends EditLabelHelper {
  firstLabelStyle
  firstLabelParam
  label
  owner

  /**
   * Creates an instance of CustomEditLabelHelper.
   */
  constructor(owner, label, firstLabelParam, firstLabelStyle) {
    super()
    this.owner = owner
    this.label = label
    this.firstLabelParam = firstLabelParam
    this.firstLabelStyle = firstLabelStyle
  }

  /**
   * This method is only called when a label should be added to owner.
   *
   * This implementation prevents adding of more than two labels
   */
  onLabelAdding(context, args) {
    args.textEditorInputModeConfigurator = this.configureTextEditorInputMode
    // Prevent adding more than two labels...
    if (!this.owner || this.owner.labels.size >= 2) {
      args.cancel = true
      return
    }
    super.onLabelAdding(context, args)
  }

  /**
   * Provides the label style for newly created labels.
   *
   * This implementation return the special style for the first if there are no labels yet, and the base style
   * otherwise.
   */
  getLabelStyle(context, owner) {
    if (owner.labels.size === 0 || !(this.firstLabelStyle === owner.labels.get(0).style)) {
      return this.firstLabelStyle
    }
    return super.getLabelStyle(context, owner)
  }

  /**
   * Provides the label model parameter for newly created labels.
   *
   * This implementation returns the special parameter for the first label if there are no labels yet, and the base
   * label model parameter otherwise.
   */
  getLabelParameter(context, owner) {
    if (
      owner.labels.size === 0 ||
      !(this.firstLabelParam === owner.labels.get(0).layoutParameter)
    ) {
      return this.firstLabelParam
    }
    return super.getLabelParameter(context, owner)
  }

  /**
   * This method is called when label should be edited.
   *
   * If a label is edited directly, we either return it (if it is the second label) or prevent editing.
   */
  onLabelEditing(context, args) {
    args.textEditorInputModeConfigurator = this.configureTextEditorInputMode
    if (this.label) {
      // We are directly editing the label
      if (this.label.style === this.firstLabelStyle) {
        // The first label is never editable
        args.label = null
        args.cancel = true
        return
      }

      // We are not the first label
      // return the label and disallow editing
      // If we are editing the first label, the framework will then try to add label by calling addLabel
      args.label = this.label
      args.handled = true
      return
    }

    // Implicit editing - this is only reached if we are trying to edit labels for an owner which does not yet have
    // any labels
    if (!this.owner) {
      super.onLabelEditing(context, args)
      return
    }
    if (this.owner.labels.size <= 1) {
      // Add a second label instead (since we'll never edit the first one)
      this.onLabelAdding(context, args)
      return
    }

    // If more than one label, edit the second one
    args.label =
      this.owner.labels.get(0).style === this.firstLabelStyle
        ? this.owner.labels.get(1)
        : this.owner.labels.get(0)
    args.handled = true
  }

  /**
   * Customize the text editor when we are using our helper.
   */
  configureTextEditorInputMode(context, mode, labelToEdit) {
    const textBox = mode.editorContainer
    textBox.classList.add('custom-label-editor')

    // Restore after editing
    const afterEditing = () => {
      textBox.classList.remove('custom-label-editor')
      mode.removeEventListener('text-edited', afterEditing)
      mode.removeEventListener('editing-canceled', afterEditing)
    }
    mode.addEventListener('text-edited', afterEditing)
    mode.addEventListener('editing-canceled', afterEditing)
  }
}
