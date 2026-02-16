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
import {
  type IEdge,
  type IEdgeStyle,
  type IEnumerable,
  type IGraph,
  type INode,
  type INodeStyle,
  type IRenderContext,
  type IVisualCreator,
  ObjectRendererBase,
  SvgVisual,
  SvgVisualGroup,
  type Visual
} from '@yfiles/yfiles'

/**
 * An {@link GraphOverviewComponent#graphOverviewRenderer overview renderer} that uses item styles
 * to create an SVG visualization of the graph overview.
 *
 * This implementation delegates the creation of the item visuals to the items' styles.
 * The appearance of the items can be customized by replacing the style provider functions
 * {@link edgeStyle}, {@link groupNodeStyle}, and {@link nodeStyle}.
 */
export class OverviewSvgRenderer extends ObjectRendererBase<IGraph> {
  private getNodeStyle: (node: INode) => INodeStyle = (node) => node.style
  private getGroupNodeStyle: (node: INode) => INodeStyle = (node) => node.style
  private getEdgeStyle: (edge: IEdge) => IEdgeStyle = (edge) => edge.style

  /**
   * Gets the function that returns the overview style to use for any given edge.
   * By default, this function will return the {@link IEdge#style edge's style}.
   */
  get edgeStyle(): (edge: IEdge) => IEdgeStyle {
    return this.getEdgeStyle
  }

  /**
   * Sets the function that returns the overview style to use for any given edge.
   * By default, this function will return the {@link IEdge#style edge's style}.
   */
  set edgeStyle(provider: (edge: IEdge) => IEdgeStyle) {
    this.getEdgeStyle = provider
  }

  /**
   * Gets the function that returns the overview style to use for any given group node.
   * By default, this function will return the {@link INode#style node's style}.
   */
  get groupNodeStyle(): (node: INode) => INodeStyle {
    return this.getGroupNodeStyle
  }

  /**
   * Sets the function that returns the overview style to use for any given group node.
   * By default, this function will return the {@link INode#style node's style}.
   */
  set groupNodeStyle(provider: (node: INode) => INodeStyle) {
    this.getGroupNodeStyle = provider
  }

  /**
   * Gets the function that returns the overview style to use for any given non-group node.
   * By default, this function will return the {@link INode#style node's style}.
   */
  get nodeStyle(): (node: INode) => INodeStyle {
    return this.getNodeStyle
  }

  /**
   * Sets the function that returns the overview style to use for any given non-group node.
   * By default, this function will return the {@link INode#style node's style}.
   */
  set nodeStyle(provider: (Node: INode) => INodeStyle) {
    this.getNodeStyle = provider
  }

  /**
   * Creates the overview visualization for the given graph.
   * This method creates a visual that includes only nodes and edges.
   * For each node or edge, this method will delegate creating the individual visual of the
   * respective item to the style returned by {@link edgeStyle}, {@link groupNodeStyle}, or
   * {@link nodeStyle} as appropriate.
   */
  protected createVisual(context: IRenderContext, graph: IGraph): Visual | null {
    if (graph.nodes.size < 1) {
      return null
    }

    const container = new SvgVisualGroup()
    container.add(this.createEdgeVisuals(context, graph))
    container.add(this.createNodeVisuals(context, graph))
    return container
  }

  /**
   * Creates a composite visualization of all the edges in the given graph.
   */
  private createEdgeVisuals(context: IRenderContext, graph: IGraph): MyVisualGroup {
    const edgeStyleProvider = this.getEdgeStyle
    const container = new MyVisualGroup()
    for (const edge of graph.edges) {
      const style = edgeStyleProvider(edge)
      const visual = style.renderer.getVisualCreator(edge, style).createVisual(context)
      if (visual instanceof SvgVisual) {
        container.addPair(style.renderer.getVisualCreator(edge, style), visual)
      }
    }
    return container
  }

  /**
   * Creates a composite visualization of all the nodes in the given graph.
   */
  private createNodeVisuals(context: IRenderContext, graph: IGraph): MyVisualGroup {
    const nodeStyleProvider = this.getNodeStyle
    const groupStyleProvider = this.getGroupNodeStyle
    const container = new MyVisualGroup()
    for (const node of graph.groupingSupport.getDescendants(null)) {
      const style = graph.isGroupNode(node) ? groupStyleProvider(node) : nodeStyleProvider(node)
      const visual = style.renderer.getVisualCreator(node, style).createVisual(context)
      if (visual instanceof SvgVisual) {
        container.addPair(style.renderer.getVisualCreator(node, style), visual)
      }
    }
    return container
  }

  /**
   * Updates the overview visualization for the given graph.
   * For each node or edge, this method will delegate updating the individual visual of the
   * respective item to the style returned by {@link edgeStyle}, {@link groupNodeStyle}, or
   * {@link nodeStyle} as appropriate.
   */
  protected updateVisual(context: IRenderContext, oldVisual: Visual, graph: IGraph): Visual | null {
    if (graph.nodes.size < 1) {
      return null
    }

    if (oldVisual instanceof SvgVisualGroup && oldVisual.children.size === 2) {
      const edgesContainer = oldVisual.children.get(0)
      const nodesContainer = oldVisual.children.get(1)
      if (edgesContainer instanceof MyVisualGroup && nodesContainer instanceof MyVisualGroup) {
        this.updateEdgeVisuals(context, edgesContainer, graph)
        this.updateNodeVisuals(context, nodesContainer, graph)
      }
      return oldVisual
    }
    return this.createVisual(context, graph)
  }

  /**
   * Updates the composite visualization of all the edges in the given graph.
   */
  private updateEdgeVisuals(
    context: IRenderContext,
    container: MyVisualGroup,
    graph: IGraph
  ): void {
    OverviewSvgRenderer.updateVisuals(context, container, graph.edges, (edge) => {
      const style = this.getEdgeStyle(edge)
      return style.renderer.getVisualCreator(edge, style)
    })
  }

  /**
   * Updates the composite visualization of all the nodes in the given graph.
   */
  private updateNodeVisuals(
    context: IRenderContext,
    container: MyVisualGroup,
    graph: IGraph
  ): void {
    OverviewSvgRenderer.updateVisuals(
      context,
      container,
      graph.groupingSupport.getDescendants(null),
      (node) => {
        const style = graph.isGroupNode(node)
          ? this.getGroupNodeStyle(node)
          : this.getNodeStyle(node)
        return style.renderer.getVisualCreator(node, style)
      }
    )
  }

  /**
   * Updates the visuals for all items in the given container
   */
  private static updateVisuals<TItem>(
    context: IRenderContext,
    container: MyVisualGroup,
    items: IEnumerable<TItem>,
    getVisualCreator: (item: TItem) => IVisualCreator
  ): void {
    const oldSize = container.creators.length

    let currentIndex = 0
    for (const node of items) {
      const visualCreator = getVisualCreator(node)

      if (currentIndex < oldSize) {
        // there is an old visual and an old visual creator
        // replace the old visual with an updated visual

        const newVisual =
          visualCreator === container.creators[currentIndex]
            ? visualCreator.updateVisual(context, container.visuals[currentIndex])
            : visualCreator.createVisual(context)
        if (newVisual instanceof SvgVisual) {
          container.setPair(currentIndex, visualCreator, newVisual)
          ++currentIndex
        }
      } else {
        // the number of items in the graph has increased
        // add the new visuals and the visual creators to the container

        const newVisual = visualCreator.createVisual(context)
        if (newVisual instanceof SvgVisual) {
          container.addPair(visualCreator, newVisual)
          ++currentIndex
        }
      }
    }

    // if the number of items in the graph has decreased, remove the obsolete visuals and
    // visual creators from the container
    container.trim(currentIndex)
  }
}

/**
 * Custom visual container that stores the visual creator that created a given visual in addition
 * to the actual visuals.
 */
class MyVisualGroup extends SvgVisual {
  readonly creators: IVisualCreator[] = []
  readonly visuals: SvgVisual[] = []
  private readonly elements: SVGElement[] = []

  constructor() {
    super(document.createElementNS('http://www.w3.org/2000/svg', 'g'))
  }

  /**
   * Stores the given visual creator and the given visual.
   * The given visual has to have been created by the given visual creator.
   */
  addPair(visualCreator: IVisualCreator, visual: SvgVisual): void {
    this.creators.push(visualCreator)
    this.visuals.push(visual)
    const childElement = visual.svgElement
    this.svgElement.appendChild(childElement)
    this.elements.push(childElement)
  }

  /**
   * Sets the given visual creator and the given visual at the given index.
   * The given visual has to have been created by the given visual creator.
   */
  setPair(index: number, visualCreator: IVisualCreator, visual: SvgVisual): void {
    this.creators[index] = visualCreator
    this.visuals[index] = visual
    const childElement = visual.svgElement
    this.svgElement.replaceChild(childElement, this.elements[index])
    this.elements[index] = childElement
  }

  /**
   * Removes stored visual creators and visuals until this container stores at most the given
   * number of visual creators and visuals.
   */
  trim(size: number): void {
    const oldSize = this.creators.length
    if (size < oldSize) {
      const parentElement = this.svgElement
      for (let i = parentElement.childNodes.length - 1; i >= size; --i) {
        parentElement.removeChild(parentElement.lastChild!)
      }
      this.elements.splice(size, oldSize - size)
      this.visuals.splice(size, oldSize - size)
      this.creators.splice(size, oldSize - size)
    }
  }
}
