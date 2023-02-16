/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  CanvasComponent,
  DefaultLabelStyle,
  EdgeStyleDecorationInstaller,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  HierarchicNestingPolicy,
  HighlightIndicatorManager,
  ICanvasObjectGroup,
  ICanvasObjectInstaller,
  IEdge,
  ILabel,
  IModelItem,
  INode,
  LabelStyleDecorationInstaller,
  NodeStyleDecorationInstaller,
  ShapeNodeStyle,
  Stroke,
  StyleDecorationZoomPolicy
} from 'yfiles'
import { NonRibbonEdgeStyle } from './NonRibbonEdgeStyle'

/**
 * Installs a visual representation of a highlight decoration for the node and edges such that:
 * - The node highlight is drawn below the node label's group, and thus labels are visible during node highlight.
 * - The edge highlight is drawn below the node group.
 */
export class HighlightManager extends HighlightIndicatorManager<IModelItem> {
  edgeHighlightGroup: ICanvasObjectGroup | null = null
  nodeHighlightGroup: ICanvasObjectGroup | null = null

  /**
   * Installs the manager on the canvas and creates the node and edge highlight groups.
   * @param canvas The given canvas
   */
  install(canvas: CanvasComponent) {
    if (canvas instanceof GraphComponent) {
      const graphModelManager = canvas.graphModelManager
      graphModelManager.hierarchicNestingPolicy = HierarchicNestingPolicy.NONE
      const contentGroup = graphModelManager.contentGroup
      // create a new group for the node highlight below the node labels so that labels are visible during node highlight
      this.nodeHighlightGroup = contentGroup.addGroup()
      this.nodeHighlightGroup.below(graphModelManager.nodeLabelGroup)
      // create a new group for the edge highlight that lies below the node group
      this.edgeHighlightGroup = contentGroup.addGroup()
      this.edgeHighlightGroup.below(graphModelManager.nodeGroup)
    }
    super.install(canvas)
  }

  /**
   * Uninstalls the manager from the canvas and removes the highlight groups.
   * @param canvas The given canvas
   */
  uninstall(canvas: CanvasComponent) {
    super.uninstall(canvas)
    if (this.nodeHighlightGroup) {
      this.nodeHighlightGroup.remove()
      this.nodeHighlightGroup = null
    }

    if (this.edgeHighlightGroup) {
      this.edgeHighlightGroup.remove()
      this.edgeHighlightGroup = null
    }
  }
  /**
   * Retrieves the Canvas Object group to use for the given item.
   * @param item The given item
   */
  getCanvasObjectGroup(item: IModelItem): ICanvasObjectGroup | null {
    if (item instanceof INode) {
      return this.nodeHighlightGroup
    } else if (item instanceof IEdge) {
      return this.edgeHighlightGroup
    }
    return super.getCanvasObjectGroup(item)!
  }

  /**
   * Callback used by install to retrieve the installer for a given item.
   * @param item The item to find an installer for
   */
  getInstaller(item: IModelItem): ICanvasObjectInstaller {
    if (item instanceof INode) {
      const style = item.style as ShapeNodeStyle
      return new NodeStyleDecorationInstaller({
        nodeStyle: new ShapeNodeStyle({
          shape: style.shape,
          fill: style.fill,
          stroke: style.stroke
        }),
        zoomPolicy: StyleDecorationZoomPolicy.WORLD_COORDINATES,
        margins: 2
      })
    } else if (item instanceof IEdge) {
      return new EdgeStyleDecorationInstaller({
        edgeStyle: new NonRibbonEdgeStyle(5),
        zoomPolicy: StyleDecorationZoomPolicy.WORLD_COORDINATES
      })
    } else if (item instanceof ILabel) {
      const style = (item.owner as INode).style as ShapeNodeStyle
      return new LabelStyleDecorationInstaller({
        labelStyle: new DefaultLabelStyle({
          shape: 'round-rectangle',
          backgroundStroke: new Stroke(style.fill, 2),
          backgroundFill: 'transparent',
          textFill: 'transparent'
        }),
        margins: 1,
        zoomPolicy: StyleDecorationZoomPolicy.WORLD_COORDINATES
      })
    }
    return super.getInstaller(item)!
  }
}

/**
 * Creates the highlight manager for this demo and determines which items have to be highlighted
 * @param graphComponent The given graphComponent
 */
export function configureHighlight(graphComponent: GraphComponent) {
  graphComponent.highlightIndicatorManager = new HighlightManager()

  const inputMode = graphComponent.inputMode as GraphViewerInputMode
  inputMode.itemHoverInputMode.hoverItems =
    GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.LABEL
  inputMode.itemHoverInputMode.addHoveredItemChangedListener((sender, evt) => {
    const highlightIndicatorManager = graphComponent.highlightIndicatorManager
    highlightIndicatorManager.clearHighlights()
    let item = evt.item
    if (evt.item instanceof ILabel) {
      item = evt.item.owner!
    }
    if (item instanceof INode) {
      // highlight the node, its adjacent edges and the node labels
      const node = item
      highlightNode(node, highlightIndicatorManager)
      graphComponent.graph.edgesAt(node).forEach(edge => {
        highlightIndicatorManager.addHighlight(edge)
      })
    } else if (item instanceof IEdge) {
      // highlight the edge and the incident source/target nodes
      const edge = item
      highlightIndicatorManager.addHighlight(edge)
      highlightNode(edge.sourceNode!, highlightIndicatorManager)
      highlightNode(edge.targetNode!, highlightIndicatorManager)
    }
  })
}

/**
 * Highlights the given node and its labels.
 * @param node The node to be highlighted
 * @param highlightIndicatorManager The highlight manager
 */
function highlightNode(
  node: INode,
  highlightIndicatorManager: HighlightIndicatorManager<IModelItem>
) {
  highlightIndicatorManager.addHighlight(node)
  node.labels.forEach(label => {
    highlightIndicatorManager.addHighlight(label)
  })
}
