/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

define(['yfiles/view-component'], yfiles => {
  let lastClickedNode = null

  class ShortestPathSupport {
    constructor(graphComponent, graphMode) {
      this.graphComponent = graphComponent
      this.$graphMode = graphMode

      this.graphComponent.inputMode.addItemClickedListener((sender, args) => {
        this.updateShortestPathHighlight(args.item, this.graphMode)
      })

      this.graphComponent.graph.addNodeRemovedListener(() => {
        this.graphComponent.highlightIndicatorManager.clearHighlights()
      })
      this.graphComponent.graph.addEdgeRemovedListener(() => {
        this.graphComponent.highlightIndicatorManager.clearHighlights()
      })
    }

    get graphMode() {
      return this.$graphMode
    }

    set graphMode(value) {
      this.$graphMode = value
    }

    /**
     * Highlights the shortest path between the current clickNode and the last clicked node.
     * @param {yfiles.graph.INode} clickedNode
     * @param {boolean} graphMode
     */
    updateShortestPathHighlight(clickedNode, graphMode) {
      const highlightManager = this.graphComponent.highlightIndicatorManager
      const graph = this.graphComponent.graph

      if (graphMode) {
        if (lastClickedNode && graph.contains(lastClickedNode)) {
          const start = lastClickedNode
          const end = clickedNode

          // determine the shortest path using the Euclidean distances in the graph to weigh the edges
          const adapter = new yfiles.layout.YGraphAdapter(graph)
          const distances = yfiles.algorithms.Maps.createHashedEdgeMap()
          adapter.yGraph.edges.forEach(edge => {
            const sourcePoint = adapter.getOriginalEdge(edge).sourcePort.location
            const targetPoint = adapter.getOriginalEdge(edge).targetPort.location
            distances.set(edge, sourcePoint.distanceTo(targetPoint))
          })
          const pathEdges = yfiles.algorithms.ShortestPaths.singleSourceSingleSink(
            adapter.yGraph,
            adapter.getCopiedNode(start),
            adapter.getCopiedNode(end),
            false,
            distances
          )

          // highlight the shortest path
          highlightManager.clearHighlights()
          pathEdges.forEach(edge => {
            const originalEdge = adapter.getOriginalEdge(edge)
            highlightManager.addHighlight(originalEdge)
            highlightManager.addHighlight(originalEdge.sourceNode)
            highlightManager.addHighlight(originalEdge.targetNode)
            highlightManager.addHighlight(originalEdge.sourceNode.labels.first())
            highlightManager.addHighlight(originalEdge.targetNode.labels.first())
          })
          lastClickedNode = null
        } else {
          highlightManager.clearHighlights()
          highlightManager.addHighlight(clickedNode)
          highlightManager.addHighlight(clickedNode.labels.first())
          lastClickedNode = clickedNode
        }
      } else {
        lastClickedNode = null
      }
      this.graphComponent.invalidate()
    }

    updateHighlights() {
      const highlightManager = this.graphComponent.highlightIndicatorManager
      const highlightedItems = highlightManager.selectionModel.toArray()
      highlightManager.clearHighlights()
      highlightedItems.forEach(item => {
        this.graphComponent.highlightIndicatorManager.addHighlight(item)
      })
    }

    clearHighlights() {
      this.graphComponent.highlightIndicatorManager.clearHighlights()
    }
  }

  return ShortestPathSupport
})
