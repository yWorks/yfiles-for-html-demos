/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
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
import type { INode, GraphComponent } from 'yfiles'
import GraphSearch from 'demo-utils/GraphSearch'
import { getEmployee } from './model/data-loading'
import type { CollapsibleTree } from './CollapsibleTree'

/**
 * Initializes the graph search to be able to search the graph for specific persons.
 */
export function initializeGraphSearch(
  graphComponent: GraphComponent,
  orgChartGraph: CollapsibleTree
): void {
  const graphSearch = new OrgChartGraphSearch(graphComponent)
  const searchBox = document.getElementById('searchBox') as HTMLInputElement
  GraphSearch.registerEventListener(searchBox, graphSearch)
  orgChartGraph.addGraphUpdatedListener(() => graphSearch.updateSearch(searchBox.value))
}

/**
 * Implements the custom graph search for this demo.
 * It matches the search term with the label text and the contents of the nodes' tags.
 */
export class OrgChartGraphSearch extends GraphSearch {
  /**
   * Returns whether the given node is a match when searching for the given text.
   * This method searches the matching string to the labels and the tags of the nodes.
   * @param node The node to be examined
   * @param text The text to be queried
   * @returns True if the node matches the text, false otherwise
   */
  matches(node: INode, text: string): boolean {
    const lowercaseText = text.toLowerCase()
    const employee = getEmployee(node)
    // the icon property does not have to be matched
    if (
      employee &&
      Object.entries(employee).some(
        ([prop, value]) =>
          prop !== 'icon' && value.toString().toLowerCase().indexOf(lowercaseText) !== -1
      )
    ) {
      return true
    }
    return node.labels.some(label => label.text.toLowerCase().indexOf(lowercaseText) !== -1)
  }
}
