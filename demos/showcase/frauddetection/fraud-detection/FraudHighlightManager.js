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
  EdgeStyleDecorationInstaller,
  GraphComponent,
  HighlightIndicatorManager,
  IEdge,
  INode,
  NodeStyleDecorationInstaller,
  PolylineEdgeStyle
} from 'yfiles'
import { getStroke } from '../styles/graph-styles.js'
import { EntityNodeStyle } from '../styles/EntityNodeStyle.js'

/**
 * A highlight manager responsible for highlighting the fraud components.
 */
export class FraudHighlightManager extends HighlightIndicatorManager {
  edgeHighlightGroup
  nodeHighlightGroup

  /**
   * Installs the manager on the canvas.
   * Adds the highlight group.
   * @param {!CanvasComponent} canvas
   */
  install(canvas) {
    if (canvas instanceof GraphComponent) {
      const graphModelManager = canvas.graphModelManager
      // the edges' highlight group should be above the nodes
      this.edgeHighlightGroup = graphModelManager.contentGroup.addGroup()
      this.edgeHighlightGroup.below(graphModelManager.nodeGroup)

      // the nodes' highlight group should be above the nodes
      this.nodeHighlightGroup = graphModelManager.contentGroup.addGroup()
      this.nodeHighlightGroup.above(graphModelManager.nodeGroup)
    }
    super.install(canvas)
  }

  /**
   * Uninstalls the manager from the canvas.
   * Removes the highlight group.
   * @param {!CanvasComponent} canvas
   */
  uninstall(canvas) {
    super.uninstall(canvas)
    if (this.edgeHighlightGroup) {
      this.edgeHighlightGroup.remove()
      this.edgeHighlightGroup = undefined
    }
    if (this.nodeHighlightGroup) {
      this.nodeHighlightGroup.remove()
      this.nodeHighlightGroup = undefined
    }
  }

  /**
   * This implementation always returns the highlightGroup of this instance's canvasComponent.
   * @param {!IModelItem} item
   * @returns {?ICanvasObjectGroup}
   */
  getCanvasObjectGroup(item) {
    if (item instanceof IEdge) {
      return this.edgeHighlightGroup
    } else if (item instanceof INode) {
      return this.nodeHighlightGroup
    }
    return super.getCanvasObjectGroup(item)
  }

  /**
   * Callback used by install to retrieve the installer for a given item.
   * @param {!IModelItem} item
   * @returns {?ICanvasObjectInstaller}
   */
  getInstaller(item) {
    if (item instanceof INode) {
      return new NodeStyleDecorationInstaller({
        margins: 2,
        zoomPolicy: 'world-coordinates',
        nodeStyle: new EntityNodeStyle()
      })
    } else if (item instanceof IEdge) {
      return new EdgeStyleDecorationInstaller({
        edgeStyle: new PolylineEdgeStyle({
          stroke: `8px solid ${getStroke(item)}`
        }),
        zoomPolicy: 'world-coordinates'
      })
    }
    return super.getInstaller(item)
  }
}
