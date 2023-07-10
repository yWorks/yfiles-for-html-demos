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
import {
  BaseClass,
  INodeStyle,
  IRenderContext,
  IVisualCreator,
  IVisualTemplate,
  Rect,
  SimpleNode,
  SvgVisual
} from 'yfiles'

/**
 * A simple adapter class to use {@link INodeStyle}s to render port candidates.
 */
export default class PortCandidateTemplate extends BaseClass<IVisualTemplate>(IVisualTemplate) {
  private readonly dummyNode: SimpleNode

  /**
   * Creates a new instance of this adapter class.
   */
  constructor(nodeStyle: INodeStyle) {
    super()

    // create a dummy node to render
    this.dummyNode = newDummyNode(nodeStyle)
  }

  /**
   * Delegates to the given {@link INodeStyle} to create the visual.
   * @param context The context that describes where the visual will be used.
   * @param bounds The current bounds to use for the visual.
   * @param dataObject The data object to visualize.
   */
  createVisual(context: IRenderContext, bounds: Rect, dataObject: object): SvgVisual {
    // delegate the rendering to the node style
    return this.getVisualCreator().createVisual(context) as SvgVisual
  }

  /**
   * Delegates to the given {@link INodeStyle} to update the visual.
   * @param context The context that describes where the visual will be used in.
   * @param oldVisual The visual instance that had been returned the last time the
   * {@link IVisualTemplate.createVisual} method was called on this instance.
   * @param bounds The current bounds to use for the visual.
   * @param dataObject The data object to visualize.
   */
  updateVisual(
    context: IRenderContext,
    oldVisual: SvgVisual,
    bounds: Rect,
    dataObject: object
  ): SvgVisual {
    // delegate the rendering to the node style
    return this.getVisualCreator().updateVisual(context, oldVisual) as SvgVisual
  }

  private getVisualCreator(): IVisualCreator {
    const style = this.dummyNode.style
    return style.renderer.getVisualCreator(this.dummyNode, style)
  }
}

function newDummyNode(style: INodeStyle): SimpleNode {
  const node = new SimpleNode()
  node.style = style
  // set the size of the port candidate here - it has to be centered at 0/0
  node.layout = new Rect(-8, -8, 16, 16)
  return node
}
