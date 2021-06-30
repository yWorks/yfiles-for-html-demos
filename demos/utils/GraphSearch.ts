/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Color,
  GraphComponent,
  HighlightIndicatorManager,
  ICanvasObjectInstaller,
  INode,
  Insets,
  NodeStyleDecorationInstaller,
  Point,
  Rect,
  ShapeNodeStyle,
  Stroke,
  StyleDecorationZoomPolicy
} from 'yfiles'

export default class GraphSearch {
  graphComponent: GraphComponent
  searchHighlightIndicatorInstaller: SearchHighlightIndicatorManager
  matchingNodes: INode[] = []

  /**
   * Registers event listeners at the search box.
   *
   * The search result is updated on every key press and the 'ENTER' key zooms the viewport to the currently
   * matching nodes.
   *
   * @param searchBox The search box element.
   * @param graphSearch The GraphSearch instance.
   */
  static registerEventListener(searchBox: HTMLElement, graphSearch: GraphSearch): void {
    searchBox.addEventListener('input', e => {
      graphSearch.updateSearch((e.target as HTMLInputElement).value)
    })

    // adds the listener that will focus to the result of the search
    searchBox.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        graphSearch.zoomToSearchResult()
      }
    })
  }

  /**
   * Creates a new instance of this class with the default highlight style.
   *
   * @param graphComponent The graphComponent on which the search will be applied
   */
  constructor(graphComponent: GraphComponent) {
    this.graphComponent = graphComponent
    this.searchHighlightIndicatorInstaller = new SearchHighlightIndicatorManager(
      this.graphComponent
    )
  }

  /**
   * Gets the decoration installer used for highlighting the matching nodes.
   */
  get highlightDecoration(): NodeStyleDecorationInstaller {
    return this.searchHighlightIndicatorInstaller.nodeHighlightDecoration
  }

  /**
   * Sets the decoration installer used for highlighting the matching nodes.
   * @param highlightDecoration The given highlight style
   */
  set highlightDecoration(highlightDecoration: NodeStyleDecorationInstaller) {
    this.searchHighlightIndicatorInstaller.nodeHighlightDecoration = highlightDecoration
  }

  /**
   * Updates the search results for the given search query.
   * @param searchText The text of the search query.
   */
  updateSearch(searchText: string): void {
    // we use the search highlight manager to highlight matching items
    const manager = this.searchHighlightIndicatorInstaller

    // first remove previous highlights
    manager.clearHighlights()
    this.matchingNodes = []
    if (searchText.trim() !== '') {
      this.graphComponent.graph.nodes
        .filter(node => this.matches(node, searchText))
        .forEach(node => {
          manager.addHighlight(node)
          this.matchingNodes.push(node)
        })
    }
  }

  /**
   * Zooms to the nodes that match the result of the current search.
   */
  zoomToSearchResult(): void {
    if (this.matchingNodes.length === 0) {
      this.graphComponent.fitGraphBounds()
      return
    }
    // determine the rectangle which contains the matching nodes
    let minX: number = Number.POSITIVE_INFINITY
    let maxX: number = Number.NEGATIVE_INFINITY
    let minY: number = Number.POSITIVE_INFINITY
    let maxY: number = Number.NEGATIVE_INFINITY

    this.matchingNodes.forEach(node => {
      const nodeLayout = node.layout
      minX = Math.min(minX, nodeLayout.x)
      maxX = Math.max(maxX, nodeLayout.x + nodeLayout.width)
      minY = Math.min(minY, nodeLayout.y)
      maxY = Math.max(maxY, nodeLayout.y + nodeLayout.height)
    })
    if (isFinite(minX) && isFinite(maxX) && isFinite(minY) && isFinite(maxY)) {
      let rect: Rect = new Rect(minX, minY, maxX - minX, maxY - minY)
      // enlarge it with some insets
      rect = rect.getEnlarged(new Insets(20))
      // calculate the maximum possible zoom
      const componentWidth = this.graphComponent.size.width
      const componentHeight = this.graphComponent.size.height
      const maxPossibleZoom = Math.min(componentWidth / rect.width, componentHeight / rect.height)
      // zoom to this rectangle with maximum zoom 1.5
      const zoom = Math.min(maxPossibleZoom, 1.5)
      this.graphComponent.zoomToAnimated(new Point(rect.centerX, rect.centerY), zoom)
    }
  }

  /**
   * Specifies whether the given node is a match when searching for the given text.
   *
   * This implementation searches for the given string in the label text of the nodes.
   * Overwrite this method to implement custom matching rules.
   *
   * @param node The node to be examined
   * @param text The text to be queried
   * @return True if the node matches the text, false otherwise
   */
  matches(node: INode, text: string): boolean {
    return node.labels.some(label => label.text.toLowerCase().indexOf(text.toLowerCase()) !== -1)
  }
}

/**
 * A {@link HighlightIndicatorManager} that uses the given decoration installer to highlight nodes of
 * the graph.
 */
class SearchHighlightIndicatorManager extends HighlightIndicatorManager<INode> {
  private $decorationInstaller: NodeStyleDecorationInstaller

  /**
   * Creates the SearchHighlightIndicatorManager.
   * @param canvasComponent The associated graphComponent
   * highlighting
   */
  constructor(canvasComponent: CanvasComponent) {
    super(canvasComponent)
    // initialize the default highlight style
    const highlightColor = Color.TOMATO
    this.$decorationInstaller = new NodeStyleDecorationInstaller({
      nodeStyle: new ShapeNodeStyle({
        stroke: new Stroke(highlightColor.r, highlightColor.g, highlightColor.b, 220, 3),
        fill: null
      }),
      margins: 3,
      zoomPolicy: StyleDecorationZoomPolicy.MIXED
    })
  }

  /**
   * Gets the highlight decoration used for the nodes.
   */
  get nodeHighlightDecoration(): NodeStyleDecorationInstaller {
    return this.$decorationInstaller
  }

  /**
   * Sets the highlight decoration used for the nodes.
   * @param highlightDecoration The given highlight style
   */
  set nodeHighlightDecoration(highlightDecoration: NodeStyleDecorationInstaller) {
    this.$decorationInstaller = highlightDecoration
  }

  /**
   * Callback used by install to retrieve the installer for a given item.
   * @param item The item to find an installer for.
   */
  getInstaller(item: INode): ICanvasObjectInstaller {
    return this.$decorationInstaller
  }
}
