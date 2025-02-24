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
  IBoundsProvider,
  IHitTestable,
  INode,
  INodeStyle,
  IObjectRenderer,
  IVisibilityTestable,
  IVisualCreator,
  Rect,
  SimpleNode
} from '@yfiles/yfiles'
/**
 * An {@link IObjectRenderer} for nodes using a fixed {@link INodeStyle node style}
 * as well as the layout and tag provided by callback functions.
 */
export class AugmentationNodeRenderer extends BaseClass(IObjectRenderer) {
  nodeStyle
  layoutProvider
  tagProvider
  dummyNode
  constructor(nodeStyle, layoutProvider, getNodeData) {
    super()
    this.layoutProvider = layoutProvider
    this.tagProvider = getNodeData
    this.nodeStyle = nodeStyle
    this.dummyNode = new SimpleNode()
  }
  configure(renderTag) {
    const originalNode = renderTag
    this.dummyNode.layout = this.layoutProvider(originalNode)
    this.dummyNode.tag = this.tagProvider(originalNode)
    return this.dummyNode
  }
  getBoundsProvider(renderTag) {
    return this.nodeStyle.renderer.getBoundsProvider(this.configure(renderTag), this.nodeStyle)
  }
  getHitTestable(renderTag) {
    return this.nodeStyle.renderer.getHitTestable(this.configure(renderTag), this.nodeStyle)
  }
  getVisibilityTestable(renderTag) {
    return IVisibilityTestable.ALWAYS
  }
  getVisualCreator(renderTag) {
    return this.nodeStyle.renderer.getVisualCreator(this.configure(renderTag), this.nodeStyle)
  }
}
