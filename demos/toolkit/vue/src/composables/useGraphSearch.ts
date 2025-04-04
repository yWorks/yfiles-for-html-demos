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
  GraphComponent,
  NodeStyleIndicatorRenderer,
  ShapeNodeStyle,
  Stroke,
  StyleIndicatorZoomPolicy
} from '@yfiles/yfiles'
import { onMounted } from 'vue'
import { GraphSearch } from '@yfiles/demo-utils/GraphSearch.ts'

export function useGraphSearch(getGraphComponent: () => GraphComponent) {
  let graphComponent: GraphComponent
  onMounted(() => {
    graphComponent = getGraphComponent()
    register()
  })

  let query = ''
  let graphSearch: GraphSearch

  /**
   * Initializes the node search input.
   */
  function register(): void {
    graphSearch = new GraphSearch(graphComponent)
    graphSearch.highlightRenderer = new NodeStyleIndicatorRenderer({
      nodeStyle: new ShapeNodeStyle({
        stroke: new Stroke(0x03, 0xa9, 0xf4, 220, 3),
        fill: null
      }),
      margins: 3,
      zoomPolicy: StyleIndicatorZoomPolicy.MIXED
    })
    graphComponent.graph.addEventListener('node-created', updateSearch)
    graphComponent.graph.addEventListener('node-removed', updateSearch)
    graphComponent.graph.addEventListener('label-added', updateSearch)
    graphComponent.graph.addEventListener('label-removed', updateSearch)
    graphComponent.graph.addEventListener('label-text-changed', updateSearch)
  }

  /**
   * Called when the search query changes.
   */
  function onSearchQueryChange(searchQuery: string): void {
    query = searchQuery
    updateSearch()
  }

  /**
   * Updates the search highlights.
   */
  function updateSearch(): void {
    graphSearch.updateSearch(query)
  }

  return {
    register,
    onSearchQueryChange
  }
}
