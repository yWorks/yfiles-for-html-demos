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
  INode,
  NodeStyleIndicatorRenderer,
  ShapeNodeShape,
  ShapeNodeStyle
} from '@yfiles/yfiles'
import { GraphSearch } from '@yfiles/demo-utils/GraphSearch'

let graphSearch: GraphSearch

const searchBox: HTMLInputElement = document.querySelector<HTMLInputElement>('#searchBox')!

/**
 * Initializes the graph search object.
 */
export function initializeGraphSearch(graphComponent: GraphComponent) {
  graphSearch = new TreeOfLifeGraphSearch(graphComponent)
  graphSearch.highlightRenderer = new NodeStyleIndicatorRenderer({
    nodeStyle: new ShapeNodeStyle({
      shape: ShapeNodeShape.ROUND_RECTANGLE,
      stroke: '3px tomato',
      fill: null
    })
  })
  GraphSearch.registerEventListener(searchBox, graphSearch, getNodeLabelsForAutoComplete())
}

/**
 * Empties the search box.
 */
export function resetGraphSearch() {
  graphSearch.updateSearch('')
  searchBox.value = ''
  graphSearch.updateAutoCompleteSuggestions(searchBox, getNodeLabelsForAutoComplete())
}

function getNodeLabelsForAutoComplete() {
  return graphSearch.graphComponent.graph.nodeLabels
    .map((l) => l.text)
    .toSorted()
    .toArray()
}

class TreeOfLifeGraphSearch extends GraphSearch {
  /**
   * Returns whether the given node is a match when searching for the given label or id.
   */
  matches(node: INode, text: string) {
    return !!node.tag?.name?.toLowerCase().includes(text.toLowerCase())
  }
}
