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
import { GraphComponent, NodeSnapResultProvider } from '@yfiles/yfiles'
import { EqualAngleSnapLine, NodeSnapCircle, NodeSnapLine } from './SnapReferences'
import { EqualAngleObjectRenderer } from './EqualAngleObjectRenderer'

/**
 * Collects snap results for the demo's custom snap references.
 * @see SnapCircleProvider
 */
export class CircleSnapResultProvider extends NodeSnapResultProvider {
  /**
   * Collects snap results for circular snap references.
   */
  collectCircleSnapResults(context, evt, snapCircle, suggestedLayout, node) {
    if (snapCircle instanceof NodeSnapCircle) {
      if (!(evt.context.canvasComponent instanceof GraphComponent)) {
        return
      }

      const graph = evt.context.canvasComponent.graph
      for (const inEdge of graph.inEdgesAt(node)) {
        const parent = inEdge.sourceNode
        if (parent === snapCircle.node) {
          snapCircle.collectPointSnapResult(evt, node, suggestedLayout.center, 10)
        }
      }
    } else {
      super.collectCircleSnapResults(context, evt, snapCircle, suggestedLayout, node)
    }
  }

  /**
   * Collects snap results for snap lines radiating out from a given node.
   */
  collectLineSnapResults(context, evt, snapLine, suggestedLayout, node) {
    if (snapLine instanceof NodeSnapLine) {
      const parent = this.getParent(evt, node)
      if (parent === snapLine.node) {
        snapLine.collectPointSnapResult(evt, node, suggestedLayout.center)
      }
    } else if (snapLine instanceof EqualAngleSnapLine) {
      const parent = this.getParent(evt, node)
      if (parent === snapLine.parent) {
        const snapResult = snapLine.collectPointSnapResult(evt, node, suggestedLayout.center)
        if (snapResult != null) {
          snapResult.objectRenderer = EqualAngleObjectRenderer.INSTANCE
        }
      }
    } else {
      super.collectLineSnapResults(context, evt, snapLine, suggestedLayout, node)
    }
  }

  getParent(args, node) {
    const graphComponent = args.context.canvasComponent
    return graphComponent.graph.inEdgesAt(node).first()?.sourceNode ?? null
  }
}
