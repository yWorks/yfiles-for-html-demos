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
  type CanvasComponent,
  EdgeStyleIndicatorRenderer,
  type GraphComponent,
  HighlightIndicatorManager,
  IEdge,
  type IModelItem,
  INode,
  type IObjectRenderer,
  type IRenderTreeGroup,
  NodeStyleIndicatorRenderer,
  PolylineEdgeStyle
} from '@yfiles/yfiles'
import { getStroke } from '../styles/graph-styles'
import { EntityNodeStyle } from '../styles/EntityNodeStyle'

/**
 * A highlight manager responsible for highlighting the fraud components.
 */
export class FraudHighlightManager extends HighlightIndicatorManager<IModelItem> {
  edgeHighlightGroup?: IRenderTreeGroup
  nodeHighlightGroup?: IRenderTreeGroup

  /**
   * Installs the manager on the component.
   * Adds the highlight group.
   */
  install(canvas: CanvasComponent): void {
    const graphModelManager = (canvas as GraphComponent).graphModelManager
    // the edges' highlight group should be above the nodes
    const renderTree = canvas.renderTree
    this.edgeHighlightGroup = renderTree.createGroup(graphModelManager.contentGroup!)
    this.edgeHighlightGroup.below(graphModelManager.nodeGroup)

    // the nodes' highlight group should be above the nodes
    this.nodeHighlightGroup = renderTree.createGroup(graphModelManager.contentGroup!)
    this.nodeHighlightGroup.above(graphModelManager.nodeGroup)
    super.install(canvas)
  }

  /**
   * Uninstalls the manager from the canvas.
   * Removes the highlight group.
   */
  uninstall(canvas: CanvasComponent): void {
    super.uninstall(canvas)
    if (this.edgeHighlightGroup) {
      canvas.renderTree.remove(this.edgeHighlightGroup)
      this.edgeHighlightGroup = undefined
    }
    if (this.nodeHighlightGroup) {
      canvas.renderTree.remove(this.nodeHighlightGroup)
      this.nodeHighlightGroup = undefined
    }
  }

  /**
   * Returns the render tree group for a given item.
   */
  getRenderTreeGroup(item: IModelItem): IRenderTreeGroup | null {
    return item instanceof IEdge
      ? this.edgeHighlightGroup!
      : item instanceof INode
        ? this.nodeHighlightGroup!
        : super.getRenderTreeGroup(item)
  }

  /**
   * Callback used by {@link install} to retrieve the object renderer for a given item.
   */
  getRenderer(item: IModelItem): IObjectRenderer | null {
    return item instanceof INode
      ? new NodeStyleIndicatorRenderer({
          margins: 2,
          zoomPolicy: 'world-coordinates',
          nodeStyle: new EntityNodeStyle()
        })
      : item instanceof IEdge
        ? new EdgeStyleIndicatorRenderer({
            edgeStyle: new PolylineEdgeStyle({ stroke: `8px solid ${getStroke(item)}` }),
            zoomPolicy: 'world-coordinates'
          })
        : super.getRenderer(item)
  }
}
