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
  Color,
  HighlightIndicatorManager,
  INode,
  NodeStyleIndicatorRenderer,
  Point,
  Rect,
  ShapeNodeStyle,
  Stroke,
  StyleIndicatorZoomPolicy
} from '@yfiles/yfiles'

export class GraphSearch {
  graphComponent
  matchingNodes = []
  searchHighlightIndicatorManager

  /**
   * Registers event listeners at the search box.
   *
   * The search result is updated on every key press and the 'ENTER' key zooms the viewport to the currently
   * matching nodes.
   *
   * @param searchBox The search box element.
   * @param graphSearch The GraphSearch instance.
   * @param autoCompleteSuggestions A list of possible auto-complete suggestion strings. If omitted, no auto-complete will be available
   */
  static registerEventListener(searchBox, graphSearch, autoCompleteSuggestions) {
    if (autoCompleteSuggestions && searchBox instanceof HTMLInputElement) {
      const datalist = document.createElement('datalist')
      datalist.id = searchBox.id + '-autocomplete'
      searchBox.setAttribute('list', datalist.id)
      if (searchBox.parentElement) {
        searchBox.parentElement.insertBefore(datalist, searchBox)
      }
      graphSearch.updateAutoCompleteSuggestions(searchBox, autoCompleteSuggestions)
    }

    searchBox.addEventListener('input', async (e) => {
      const input = e.target
      const searchText = input.value
      graphSearch.updateSearch(searchText)

      // Zoom to search result if an element from the auto-completion list has been selected
      // How to detect this varies between browsers, sadly
      if (
        !(e instanceof InputEvent) /* Chrome */ ||
        e.inputType === 'insertReplacementText' /* Firefox */
      ) {
        // Determine whether we actually selected an element from the list
        if (hasSelectedElementFromDatalist(input, searchText)) {
          await graphSearch.zoomToSearchResult()
        }
      }
    })

    // adds the listener that will focus to the result of the search
    searchBox.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        await graphSearch.zoomToSearchResult()
      }
    })

    // adds the listener to enable auto-completion
    searchBox.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        return
      }
    })
  }

  /**
   * Creates a new instance of this class with the default highlight style.
   *
   * @param graphComponent The graphComponent on which the search will be applied
   */
  constructor(graphComponent) {
    this.graphComponent = graphComponent

    // initialize the default highlight style
    const highlightColor = Color.TOMATO
    this.searchHighlightIndicatorManager = new SearchHighlightIndicatorManager({
      nodeRenderer: new NodeStyleIndicatorRenderer({
        nodeStyle: new ShapeNodeStyle({
          stroke: new Stroke(highlightColor.r, highlightColor.g, highlightColor.b, 220, 3),
          fill: null
        }),
        margins: 3,
        zoomPolicy: StyleIndicatorZoomPolicy.MIXED
      }),
      domain: graphComponent.highlightIndicatorManager.domain
    })
    this.searchHighlightIndicatorManager.install(graphComponent)
  }

  /**
   * Gets the decoration style used for highlighting the matching nodes.
   */
  get highlightRenderer() {
    return this.searchHighlightIndicatorManager.nodeRenderer
  }

  /**
   * Sets the decoration style used for highlighting the matching nodes.
   * @param highlightRenderer The given highlight renderer
   */
  set highlightRenderer(highlightRenderer) {
    this.searchHighlightIndicatorManager.nodeRenderer = highlightRenderer
  }

  /**
   * Updates the search results for the given search query.
   * @param searchText The text of the search query.
   */
  updateSearch(searchText) {
    // we use the search highlight manager to highlight matching items
    const highlights = this.searchHighlightIndicatorManager.items

    // first remove previous highlights
    highlights.clear()
    this.matchingNodes = []
    if (searchText.trim() !== '') {
      this.graphComponent.graph.nodes
        .filter((node) => this.matches(node, searchText))
        .forEach((node) => {
          highlights.add(node)
          this.matchingNodes.push(node)
        })
    }
  }

  /**
   * Updates the auto-complete list for the given search field with
   * the given new suggestions.
   *
   * This will do nothing, unless auto-complete has been configured with initial suggestions
   * in the {@link registerEventListener} call.
   *
   * @param input An HTML `input` element that is used as a search input.
   * @param autoCompleteSuggestions A list of possible auto-complete suggestion strings.
   */
  updateAutoCompleteSuggestions(input, autoCompleteSuggestions) {
    const datalist = input.list
    if (!datalist) {
      return
    }
    while (datalist.lastChild) {
      datalist.lastChild.remove()
    }
    for (const item of autoCompleteSuggestions) {
      const option = document.createElement('option')
      option.value = item
      datalist.appendChild(option)
    }
  }

  /**
   * Zooms to the nodes that match the result of the current search.
   */
  zoomToSearchResult() {
    if (this.matchingNodes.length === 0) {
      return Promise.resolve()
    }

    const maxRect = this.matchingNodes
      .map((node) => node.layout.toRect())
      .reduce((prev, current) => Rect.add(prev, current))
    if (!maxRect.isFinite) {
      return Promise.resolve()
    }

    const rect = maxRect.getEnlarged(20)
    const componentWidth = this.graphComponent.size.width
    const componentHeight = this.graphComponent.size.height
    const maxPossibleZoom = Math.min(componentWidth / rect.width, componentHeight / rect.height)
    const zoom = Math.min(maxPossibleZoom, 1.5)
    return this.graphComponent.zoomToAnimated(zoom, new Point(rect.centerX, rect.centerY))
  }

  /**
   * Specifies whether the given node is a match when searching for the given text.
   *
   * This implementation searches for the given string in the label text of the nodes.
   * Overwrite this method to implement custom matching rules.
   *
   * @param node The node to be examined
   * @param text The text to be queried
   * @returns True if the node matches the text, false otherwise
   */
  matches(node, text) {
    return node.labels.some((label) => label.text.toLowerCase().indexOf(text.toLowerCase()) !== -1)
  }
}

function hasSelectedElementFromDatalist(input, searchText) {
  if (input.list) {
    for (const option of Array.from(input.list.children)) {
      if (option instanceof HTMLOptionElement && option.value === searchText) {
        return true
      }
    }
  }
  return false
}

/**
 * A highlight indicator manager allows setting a specific renderer for the node highlights.
 */
class SearchHighlightIndicatorManager extends HighlightIndicatorManager {
  nodeRenderer

  constructor({ nodeRenderer, domain }) {
    super()

    this.nodeRenderer = nodeRenderer
    this.domain = domain
  }

  getRenderer(item) {
    if (item instanceof INode) {
      return this.nodeRenderer
    }
    return super.getRenderer(item)
  }
}
