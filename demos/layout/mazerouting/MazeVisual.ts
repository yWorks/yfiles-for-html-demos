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
  type INode,
  type IRenderContext,
  IVisualCreator,
  type SvgVisual,
  SvgVisualGroup
} from '@yfiles/yfiles'

/**
 * This class implements the maze visualization based on the nodes that form the maze.
 */
export class MazeVisual extends BaseClass(IVisualCreator) {
  /**
   * Creates a new instance of MazeVisual.
   */
  constructor(private readonly nodes: Iterable<INode>) {
    super()
  }

  /**
   * Creates the maze visual.
   * @param context The render context
   * @returns The maze visual
   */
  createVisual(context: IRenderContext): SvgVisual {
    const visualGroup = new SvgVisualGroup()
    for (const node of this.nodes) {
      const nodeVisual = node.style.renderer
        .getVisualCreator(node, node.style)
        .createVisual(context)
      visualGroup.add(nodeVisual as SvgVisual)
    }
    return visualGroup
  }

  /**
   * Updates the maze visual. As the maze cannot be changed in this demo, the old visual is
   * returned.
   * @param context The render context
   * @param oldVisual The old visual
   * @returns The updated visual
   */
  updateVisual(context: IRenderContext, oldVisual: SvgVisual): SvgVisual {
    return oldVisual
  }
}
