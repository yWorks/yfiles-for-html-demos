/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import yfiles, {
  GraphComponent,
  IEdge,
  ILabel,
  IListEnumerable,
  INode,
  Insets,
  IPort,
  ListEnumerable,
  Point,
  Rect,
  SimpleNode,
  SvgExport,
  VoidNodeStyle
} from 'yfiles'
import { passiveSupported } from './Workarounds'

type Item<T> = T | { element: T; tooltip?: string }

/**
 * A palette of sample nodes. Users can drag and drop the nodes from this palette to a graph control.
 */
export class DragAndDropPanel {
  /**
   * The desired maximum width of each item. This value is used to decide whether or not a
   * visualization must be scaled down.
   */
  maxItemWidth = 150
  /**
   * Whether the labels of the DnD node visual should be transferred to the created node or discarded.
   */
  copyNodeLabels = true
  /**
   * A callback that is called then the user presses the mouse button on an item.
   * It should start the actual drag and drop operation.
   */
  beginDragCallback: ((element: HTMLElement, tag: any) => void) | null = null

  /**
   * Create a new style panel in the given element.
   * @param div The element that will display the palette items.
   */
  constructor(public div: HTMLElement) {}

  /**
   * Adds the items provided by the given factory to this palette.
   * This method delegates the creation of the visualization of each node
   * to createNodeVisual.
   */
  populatePanel(itemFactory: (() => Item<INode | IEdge>[]) | null): void {
    if (!itemFactory) {
      return
    }

    // Create the nodes that specify the visualizations for the panel.
    const items = itemFactory()

    // Convert the nodes into plain visualizations
    const graphComponent = new GraphComponent()
    for (const item of items) {
      const modelItem = item instanceof INode || item instanceof IEdge ? item : item.element
      const visual =
        modelItem instanceof INode
          ? this.createNodeVisual(modelItem, graphComponent)
          : this.createEdgeVisual(modelItem, graphComponent)
      this.addPointerDownListener(modelItem, visual, this.beginDragCallback)
      this.div.appendChild(visual)
    }
  }

  /**
   * Creates an element that contains the visualization of the given node.
   * This method is used by populatePanel to create the visualization
   * for each node provided by the factory.
   */
  createNodeVisual(original: Item<INode>, graphComponent: GraphComponent): HTMLDivElement {
    const graph = graphComponent.graph
    graph.clear()

    const originalNode = original instanceof INode ? original : original.element
    const node = graph.createNode(originalNode.layout, originalNode.style, originalNode.tag)
    originalNode.labels.forEach((label: ILabel) => {
      graph.addLabel(
        node,
        label.text,
        label.layoutParameter,
        label.style,
        label.preferredSize,
        label.tag
      )
    })
    originalNode.ports.forEach(port => {
      graph.addPort(node, port.locationParameter, port.style, port.tag)
    })
    this.updateViewport(graphComponent)

    return this.exportAndWrap(
      graphComponent,
      original instanceof INode ? undefined : original.tooltip
    )
  }

  /**
   * Creates an element that contains the visualization of the given edge.
   */
  createEdgeVisual(original: Item<IEdge>, graphComponent: GraphComponent): HTMLDivElement {
    const graph = graphComponent.graph
    graph.clear()

    const originalEdge = original instanceof IEdge ? original : original.element

    const n1 = graph.createNode(new Rect(0, 10, 0, 0), VoidNodeStyle.INSTANCE)
    const n2 = graph.createNode(new Rect(50, 40, 0, 0), VoidNodeStyle.INSTANCE)
    const edge = graph.createEdge(n1, n2, originalEdge.style)
    graph.addBend(edge, new Point(25, 10))
    graph.addBend(edge, new Point(25, 40))

    this.updateViewport(graphComponent)

    // provide some more insets to account for the arrow heads
    graphComponent.updateContentRect(new Insets(5))

    return this.exportAndWrap(
      graphComponent,
      original instanceof IEdge ? undefined : original.tooltip
    )
  }

  updateViewport(graphComponent: GraphComponent): void {
    const graph = graphComponent.graph
    let viewport: Rect = Rect.EMPTY
    graph.nodes.forEach(node => {
      viewport = Rect.add(viewport, node.layout.toRect())
      node.labels.forEach(label => {
        viewport = Rect.add(viewport, label.layout.bounds)
      })
    })
    graph.edges.forEach(edge => {
      viewport = viewport.add(edge.sourcePort!.location)
      viewport = viewport.add(edge.targetPort!.location)
      edge.bends.forEach(bend => {
        viewport = viewport.add(bend.location.toPoint())
      })
    })
    viewport = viewport.getEnlarged(5)
    graphComponent.contentRect = viewport
    graphComponent.zoomTo(viewport)
  }

  /**
   * Exports and wraps the original visualization in an HTML element.
   */
  exportAndWrap(graphComponent: GraphComponent, tooltip?: string): HTMLDivElement {
    const exporter = new SvgExport({
      worldBounds: graphComponent.contentRect,
      margins: 5
    })

    exporter.scale = exporter.calculateScaleForWidth(
      Math.min(this.maxItemWidth, graphComponent.contentRect.width)
    )
    const visual = exporter.exportSvg(graphComponent)

    // Firefox does not display the SVG correctly because of the clip - so we remove it.
    visual.removeAttribute('clip-path')

    const div = document.createElement('div')
    div.setAttribute('class', 'demo-dndPanelItem')
    div.appendChild(visual)
    div.style.setProperty('width', visual.getAttribute('width'))
    div.style.setProperty('height', visual.getAttribute('height'))
    div.style.setProperty('touch-action', 'none')
    try {
      div.style.setProperty('cursor', 'grab', '')
    } catch (e) {
      /* IE9 doesn't support grab cursor */
    }
    if (tooltip) {
      div.title = tooltip
    }
    return div
  }

  /**
   * Adds a mousedown listener to the given element that starts the drag operation.
   */
  private addPointerDownListener(
    item: INode | IEdge,
    element: HTMLElement,
    callback: ((element: HTMLElement, tag: any) => void) | null
  ): void {
    if (!callback) {
      return
    }

    // the actual drag operation
    const doDragOperation = () => {
      // Ensure that the following code still works, even when the view-table module isn't loaded
      const IStripe = (yfiles as any).graph.IStripe
      if (IStripe && item.tag instanceof IStripe) {
        // If the dummy node has a stripe as its tag, we use the stripe directly
        // This allows StripeDropInputMode to take over
        callback(element, item.tag)
      } else if (item.tag instanceof ILabel || item.tag instanceof IPort) {
        callback(element, item.tag)
      } else if (item instanceof IEdge) {
        callback(element, item)
      } else if (item instanceof INode) {
        // Otherwise, we just use the node itself and let (hopefully) NodeDropInputMode take over
        const simpleNode = new SimpleNode()
        simpleNode.layout = item.layout
        simpleNode.style = item.style.clone()
        simpleNode.tag = item.tag
        simpleNode.labels = this.copyNodeLabels ? item.labels : IListEnumerable.EMPTY
        if (item.ports.size > 0) {
          simpleNode.ports = new ListEnumerable(item.ports)
        }
        callback(element, simpleNode)
      }
    }

    element.addEventListener(
      'mousedown',
      evt => {
        if (evt.button !== 0) {
          return
        }
        doDragOperation()
        evt.preventDefault()
      },
      false
    )

    const touchStartListener = (evt: Event): void => {
      doDragOperation()
      evt.preventDefault()
    }

    if (window.PointerEvent !== undefined) {
      element.addEventListener(
        'pointerdown',
        evt => {
          if (evt.pointerType === 'touch' || evt.pointerType === 'pen') {
            touchStartListener(evt)
          }
        },
        true
      )
    } else if ((window as any).MSPointerEvent !== undefined) {
      element.addEventListener(
        'MSPointerDown',
        (evt: any) => {
          if (
            evt.pointerType === evt.MSPOINTER_TYPE_TOUCH ||
            evt.pointerType === evt.MSPOINTER_TYPE_PEN
          ) {
            touchStartListener(evt)
          }
        },
        true
      )
    } else {
      element.addEventListener(
        'touchstart',
        touchStartListener,
        passiveSupported ? { passive: false } : false
      )
    }
  }
}
