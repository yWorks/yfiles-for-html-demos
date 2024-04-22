/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  FocusIndicatorManager,
  type GraphComponent,
  type ICanvasObjectGroup,
  type ICanvasObjectInstaller,
  type INode,
  NodeStyleDecorationInstaller,
  RectangleNodeStyle,
  ShapeNodeStyle
} from 'yfiles'
import { getNodeData, isRoot } from './data-types'

/**
 * A custom {@link FocusIndicatorManager} that adds the focus indicator for the root node in front
 * and the focus indicator of the other nodes behind the content group.
 */
export class MindMapFocusIndicatorManager extends FocusIndicatorManager<INode> {
  protected getCanvasObjectGroup(node: INode): ICanvasObjectGroup | null {
    const canvasComponent = this.canvasComponent as GraphComponent
    // choose the highlight group for the root (front) and the background group for others (back)
    return isRoot(node) ? canvasComponent.highlightGroup : canvasComponent.backgroundGroup
  }

  protected getInstaller(node: INode): ICanvasObjectInstaller | null {
    const nodeData = getNodeData(node)
    return isRoot(node)
      ? new NodeStyleDecorationInstaller({
          nodeStyle: new ShapeNodeStyle({
            shape: 'pill',
            stroke: `5px black`,
            fill: 'none'
          }),
          zoomPolicy: 'world-coordinates',
          margins: 0
        })
      : new NodeStyleDecorationInstaller({
          nodeStyle: new RectangleNodeStyle({
            corners: 'top',
            stroke: 'none',
            fill: `#99${nodeData.color.substring(1)}` // transparent color
          }),
          zoomPolicy: 'world-coordinates',
          margins: 0
        })
  }
}
