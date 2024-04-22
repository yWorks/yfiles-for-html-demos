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
/**
 * Zooms to the suitable point.
 * @param item The element that we clicked.
 * @param currentMouseClickLocation The arguments that is used by the event.
 */
import {
  type GraphComponent,
  type IModelItem,
  type ItemClickedEventArgs,
  type GraphInputMode,
  IEdge,
  ILabel,
  Point
} from 'yfiles'

export function addSmartClickNavigation(graphInputMode: GraphInputMode): void {
  graphInputMode.addItemLeftClickedListener(
    async (sender: object, event: ItemClickedEventArgs<IModelItem>): Promise<void> => {
      const graphComponent = graphInputMode.inputModeContext!.canvasComponent as GraphComponent
      if (!event.handled) {
        const item = event.item
        // gets the point where we should zoom in
        let location
        if (item instanceof IEdge) {
          location = getFocusPoint(item, graphComponent)
        } else if (item instanceof ILabel && item.owner instanceof IEdge) {
          location = getFocusPoint(item.owner, graphComponent)
        }
        if (location) {
          // zooms to the new location of the mouse
          const offset = event.location.subtract(graphComponent.viewport.center)
          await graphComponent.zoomToAnimated(location.subtract(offset), graphComponent.zoom)
        }
      }
    }
  )

  function getFocusPoint(item: IEdge, graphComponent: GraphComponent): Point | null {
    // If the source and the target node are in the view port, then zoom to the middle point of the edge
    const targetNodeCenter = item.targetNode!.layout.center
    const sourceNodeCenter = item.sourceNode!.layout.center
    const viewport = graphComponent.viewport
    if (viewport.contains(targetNodeCenter) && viewport.contains(sourceNodeCenter)) {
      // Do nothing if both nodes are visible
      return null
    } else {
      if (
        viewport.center.subtract(targetNodeCenter).vectorLength <
        viewport.center.subtract(sourceNodeCenter).vectorLength
      ) {
        // If the source node is out of the view port, then zoom to it
        return sourceNodeCenter
      } else {
        // Else zoom to the target node
        return targetNodeCenter
      }
    }
  }
}
