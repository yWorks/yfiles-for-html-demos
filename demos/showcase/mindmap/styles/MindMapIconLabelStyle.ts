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
  DelegatingLabelStyle,
  IconLabelStyle,
  type ILabel,
  type ILabelModelParameter,
  type ILabelStyle,
  type ILookup,
  IMarkupExtensionConverter,
  type INode,
  Insets,
  InteriorNodeLabelModel,
  type IWriteContext,
  MarkupExtension,
  Size
} from '@yfiles/yfiles'
import { getNodeData, type NodeData } from '../data-types'

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
 * A label style that renders an icon (the state label) next to a text.
 * The StateIcon property of the {@link NodeData} will determine the icon that will be rendered.
 * The placement of the icon is on the right (left) side of the text label for nodes on the
 * left (right) side of the tree.
 */
export class MindMapIconLabelStyle extends BaseClass(
  DelegatingLabelStyle,
  IMarkupExtensionConverter
) {
  private delegatingLabelStyle: ILabelStyle

  constructor(delegatingLabelStyle: ILabelStyle) {
    super()
    this.delegatingLabelStyle = delegatingLabelStyle
  }

  /**
   * Configures the inner icon label style used for rendering the icon.
   */
  protected getStyle(label: ILabel): ILabelStyle {
    const delegatingStyle = this.delegatingLabelStyle
    if (delegatingStyle instanceof IconLabelStyle) {
      delegatingStyle.iconSize = this.getIconSize(label)
      delegatingStyle.href = this.getIcon(label)
      delegatingStyle.iconPlacement = this.getIconPlacement(label)
      delegatingStyle.wrappedStylePadding = this.getWrappedStylePadding(label)
    }
    return delegatingStyle
  }

  /**
   * Returns the icon stored in the node's data.
   */
  getIcon(label: ILabel): string {
    const nodeData = getNodeData(label.owner as INode)
    return `resources/icons/${stateIcons[nodeData.stateIcon]}.svg`
  }

  /**
   * Returns the position of the icon compared to the text.
   * Icons that belong to nodes placed on the left of the root will be placed after the text.
   * Icons that belong to nodes placed on the right of the root will be placed before the text.
   */
  getIconPlacement(label: ILabel): ILabelModelParameter {
    const nodeData = getNodeData(label.owner as INode)
    return nodeData.left ? InteriorNodeLabelModel.RIGHT : InteriorNodeLabelModel.LEFT
  }

  /**
   * Returns the size of each icon or zero if no icon should be rendered.
   */
  getIconSize(label: ILabel): Size {
    const nodeData = getNodeData(label.owner as INode)
    return nodeData.stateIcon === 0 ? Size.EMPTY : stateIconSize
  }

  /**
   * Returns the padding for each icon based on the icon's position or zero
   * if no icon should be rendered.
   */
  getWrappedStylePadding(label: ILabel): Insets {
    const nodeData = getNodeData(label.owner as INode)
    if (nodeData.stateIcon > 0) {
      return nodeData.left
        ? new Insets(0, stateIconSize.width + 4, 0, 0)
        : new Insets(0, 0, 0, stateIconSize.width + 4)
    }
    return Insets.EMPTY
  }

  /**
   * Returns that this style can be converted.
   */
  canConvert(_context: IWriteContext, _value: MindMapIconLabelStyle): boolean {
    return true
  }

  /**
   * Converts this style using {@link MindMapIconLabelStyleExtension}.
   */
  convert(_context: IWriteContext, value: MindMapIconLabelStyle): MarkupExtension {
    const mindMapIconLabelStyleExtension = new MindMapIconLabelStyleExtension()
    mindMapIconLabelStyleExtension.delegatingLabelStyle = value.delegatingLabelStyle
    return mindMapIconLabelStyleExtension
  }
}

/**
 * A markup extension that creates a {@link MindMapIconLabelStyle} instance configured with a delegating label style.
 */
class MindMapIconLabelStyleExtension extends MarkupExtension {
  private _delegatingLabelStyle!: ILabelStyle

  /**
   * Gets or sets the label style that this icon label style delegates to.
   */
  get delegatingLabelStyle(): ILabelStyle {
    return this._delegatingLabelStyle
  }

  set delegatingLabelStyle(value: ILabelStyle) {
    this._delegatingLabelStyle = value
  }

  /**
   * Provides a {@link MindMapIconLabelStyle} instance using the configured delegating label style.
   * @returns A new `MindMapIconLabelStyle` initialized with the specified delegating label style.
   */
  provideValue(_serviceProvider: ILookup): MindMapIconLabelStyle {
    return new MindMapIconLabelStyle(this.delegatingLabelStyle)
  }
}

// export a default object to be able to map a namespace to this module for serialization
export default { MindMapIconLabelStyle, MindMapIconLabelStyleExtension }
