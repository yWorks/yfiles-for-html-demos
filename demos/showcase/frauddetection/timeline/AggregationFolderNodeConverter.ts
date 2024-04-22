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
  DefaultFolderNodeConverter,
  type FolderNodeState,
  type IFoldingView,
  type INode,
  Rect
} from 'yfiles'
import type { Bucket } from './bucket-aggregation'

/**
 * A simple folder node converter that maps the aggregated values of the folder to its height.
 */
export class AggregationFolderNodeConverter extends DefaultFolderNodeConverter {
  protected initializeFolderNodeLayout(
    state: FolderNodeState,
    foldingView: IFoldingView,
    viewNode: INode,
    masterNode: INode
  ): void {
    this.updateLayout(state, masterNode)
  }

  updateFolderNodeState(
    state: FolderNodeState,
    foldingView: IFoldingView,
    viewNode: INode,
    masterNode: INode
  ): void {
    super.updateFolderNodeState(state, foldingView, viewNode, masterNode)
    this.updateLayout(state, masterNode)
  }

  private updateLayout(state: FolderNodeState, masterNode: INode): void {
    const aggregatedValue = (masterNode.tag as Bucket<unknown>).aggregatedValue

    const width = this.folderNodeSize?.width ?? 20
    const height = Math.max(aggregatedValue, 1)
    state.layout = new Rect(
      masterNode.layout.center.x - width / 2,
      masterNode.layout.maxY - height,
      width,
      height
    )
  }
}
