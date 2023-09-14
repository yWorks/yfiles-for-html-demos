/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { IconLabelStyleRenderer, Insets, InteriorLabelModel, Size } from 'yfiles'
import { getNodeData } from '../data-types.js'

/**
 * The default size for a state icon.
 */
const stateIconSize = new Size(16, 16)

/**
 * A set of state icons.
 */
export const stateIcons = [
  'no-icon',
  'smiley-happy',
  'smiley-not-amused',
  'smiley-grumpy',
  'abstract-green',
  'abstract-red',
  'abstract-blue',
  'question-mark',
  'exclamation-mark',
  'delete',
  'checkmark',
  'star'
]

/**
 * A label style renderer that renders an icon (the state label) next to a text.
 * The StateIcon property of the {@link NodeData} will determine the icon that will be rendered.
 * The placement of the icon is on the right (left) side of the text label for nodes on the
 * left (right) side of the tree.
 */
export class MindMapIconLabelStyleRenderer extends IconLabelStyleRenderer {
  /**
   * Returns the icon stored in the node's data.
   * @returns {?string}
   */
  getIcon() {
    const nodeData = getNodeData(this.label.owner)
    return `resources/icons/${stateIcons[nodeData.stateIcon]}.svg`
  }

  /**
   * Returns the position of the icon compared to the text.
   * Icons that belong to nodes placed on the left of the root will be placed after the text.
   * Icons that belong to nodes placed on the right of the root will be placed before the text.
   * @returns {!ILabelModelParameter}
   */
  getIconPlacement() {
    const nodeData = getNodeData(this.label.owner)
    return nodeData.left ? InteriorLabelModel.EAST : InteriorLabelModel.WEST
  }

  /**
   * Returns the size of each icon or zero if no icon should be rendered.
   * @returns {!Size}
   */
  getIconSize() {
    const nodeData = getNodeData(this.label.owner)
    return nodeData.stateIcon === 0 ? Size.EMPTY : stateIconSize
  }

  /**
   * Returns the insets for each icon based on the icon's position or zero
   * if no icon should be rendered.
   * @returns {!Insets}
   */
  getWrappedStyleInsets() {
    const nodeData = getNodeData(this.label.owner)
    if (nodeData.stateIcon > 0) {
      return nodeData.left
        ? new Insets(0, 0, stateIconSize.width + 4, 0)
        : new Insets(stateIconSize.width + 4, 0, 0, 0)
    }
    return Insets.EMPTY
  }
}
