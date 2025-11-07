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
  DragDropEffects,
  DragDropItem,
  DragSource,
  GraphComponent,
  IEdge,
  IEdgeStyle,
  ILabel,
  type ILabelOwner,
  IListEnumerable,
  type IModelItem,
  INode,
  INodeStyle,
  IPort,
  IPortStyle,
  IStripe,
  LabelDropInputMode,
  NodeDropInputMode,
  Point,
  PortDropInputMode,
  Rect,
  SimpleNode,
  StripeDropInputMode,
  SvgExport
} from '@yfiles/yfiles'
import { EdgeDropInputMode } from './EdgeDropInputMode'

export type DragAndDropPanelItem<T extends IModelItem> = T | { modelItem: T; tooltip?: string }

/**
 * A drag and drop panel component, from which users can drag the items to a {@link GraphComponent}.
 *
 * The component is mounted into the provided HTML element. It can be populated with nodes,
 * edges, labels, and ports using {@link populatePanel}.
 */
export class DragAndDropPanel {
  div: HTMLElement
  /**
   * The desired maximum width of each item. This value is used to decide whether a
   * visualization must be scaled down.
   */
  maxItemWidth = 150
  /**
   * Whether the labels of the DnD node visual should be transferred to the created node or discarded.
   */
  copyNodeLabels = true

  /**
   * Create a new DragAndDropPanel and mount it to the provided div element.
   * @param div The element that will display the palette items.
   */
  constructor(div: HTMLElement) {
    this.div = div
  }

  /**
   * Adds the provided items to this panel.
   */
  populatePanel(items: Iterable<DragAndDropPanelItem<INode | IEdge | ILabel | IPort>>): void {
    // Convert the nodes into plain visualizations
    const graphComponent = new GraphComponent()
    for (const item of items) {
      const modelItem =
        item instanceof INode ||
        item instanceof IEdge ||
        item instanceof ILabel ||
        item instanceof IPort
          ? item
          : item.modelItem

      let visual: HTMLDivElement
      if (modelItem instanceof INode) {
        visual = this.createNodeVisual(modelItem, graphComponent)
      } else if (modelItem instanceof IEdge) {
        visual = this.createEdgeVisual(modelItem, graphComponent)
      } else if (modelItem instanceof ILabel) {
        visual = this.createLabelVisual(modelItem, graphComponent)
      } else {
        visual = this.createPortVisual(modelItem, graphComponent)
      }
      this.setStartDragListeners(modelItem, visual)
      this.div.appendChild(visual)
    }
  }

  private beginDrag(element: HTMLElement, data: unknown): void {
    const dragPreviewElement = createDragPreviewElement(element)
    const dragSource = this.startDrag(element, dragPreviewElement, data)

    // let the GraphComponent handle the preview rendering if possible
    if (dragSource) {
      dragSource.addEventListener('query-continue-drag', (evt) => {
        if (evt.dropTarget === null) {
          dragPreviewElement.classList.remove('hidden')
        } else {
          dragPreviewElement.classList.add('hidden')
        }
      })
    }
  }

  private startDrag(element: HTMLElement, dragPreviewElement: HTMLElement, data: unknown) {
    if (data instanceof INode) {
      return NodeDropInputMode.startDrag(
        element,
        data,
        DragDropEffects.ALL,
        true,
        dragPreviewElement
      )
    }
    if (data instanceof IEdge) {
      const dragSource = new DragSource(element)
      void dragSource.startDrag(
        new DragDropItem(EdgeDropInputMode.DEFAULT_TRANSFER_TYPE, data),
        DragDropEffects.ALL,
        true,
        dragPreviewElement
      )
      return dragSource
    }
    if (data instanceof ILabel) {
      return LabelDropInputMode.startDrag(
        element,
        data,
        DragDropEffects.ALL,
        true,
        dragPreviewElement
      )
    }
    if (data instanceof IPort) {
      return PortDropInputMode.startDrag(
        element,
        data,
        DragDropEffects.ALL,
        true,
        dragPreviewElement
      )
    }
    if (data instanceof IStripe) {
      return StripeDropInputMode.startDrag(
        element,
        data,
        DragDropEffects.ALL,
        true,
        dragPreviewElement
      )
    }
  }

  /**
   * Creates an element that contains the visualization of the given node.
   * This method is used by populatePanel to create the visualization
   * for each node provided by the factory.
   */
  private createNodeVisual(
    original: DragAndDropPanelItem<INode>,
    graphComponent: GraphComponent
  ): HTMLDivElement {
    const graph = graphComponent.graph
    graph.clear()

    const originalNode = original instanceof INode ? original : original.modelItem
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

    return this.exportAndWrap(
      graphComponent,
      original instanceof INode ? undefined : original.tooltip
    )
  }

  /**
   * Creates an element that contains the visualization of the given edge.
   */
  private createEdgeVisual(
    original: DragAndDropPanelItem<IEdge>,
    graphComponent: GraphComponent
  ): HTMLDivElement {
    const graph = graphComponent.graph
    graph.clear()

    const originalEdge = original instanceof IEdge ? original : original.modelItem

    const n1 = graph.createNode(new Rect(0, 10, 0, 0), INodeStyle.VOID_NODE_STYLE)
    const n2 = graph.createNode(new Rect(50, 40, 0, 0), INodeStyle.VOID_NODE_STYLE)
    const edge = graph.createEdge(n1, n2, originalEdge.style)
    graph.addBend(edge, new Point(25, 10))
    graph.addBend(edge, new Point(25, 40))

    return this.exportAndWrap(
      graphComponent,
      original instanceof IEdge ? undefined : original.tooltip
    )
  }

  /**
   * Creates an element that contains the visualization of the given label.
   */
  private createLabelVisual(
    original: DragAndDropPanelItem<ILabel>,
    graphComponent: GraphComponent
  ): HTMLDivElement {
    const graph = graphComponent.graph
    graph.clear()

    const originalLabel = original instanceof ILabel ? original : original.modelItem

    const node = graph.createNode(new Rect(0, 10, 0, 0), INodeStyle.VOID_NODE_STYLE)

    let labelOwner: ILabelOwner
    if (originalLabel.owner instanceof IPort) {
      labelOwner = graph.addPort({ owner: node, style: IPortStyle.VOID_PORT_STYLE })
    } else if (originalLabel.owner instanceof IEdge) {
      labelOwner = graph.createEdge(node, node, IEdgeStyle.VOID_EDGE_STYLE)
    } else {
      labelOwner = node
    }

    graph.addLabel(
      labelOwner,
      originalLabel.text,
      originalLabel.layoutParameter,
      originalLabel.style,
      originalLabel.preferredSize,
      originalLabel.tag
    )

    return this.exportAndWrap(
      graphComponent,
      original instanceof ILabel ? undefined : original.tooltip
    )
  }

  /**
   * Creates an element that contains the visualization of the given port.
   */
  private createPortVisual(
    original: DragAndDropPanelItem<IPort>,
    graphComponent: GraphComponent
  ): HTMLDivElement {
    const graph = graphComponent.graph
    graph.clear()

    const originalPort = original instanceof IPort ? original : original.modelItem

    const node = graph.createNode(new Rect(0, 10, 0, 0), INodeStyle.VOID_NODE_STYLE)
    const portOwner =
      originalPort.owner instanceof IEdge
        ? graph.createEdge(node, node, IEdgeStyle.VOID_EDGE_STYLE)
        : node

    graph.addPort({ owner: portOwner, style: originalPort.style })

    return this.exportAndWrap(
      graphComponent,
      original instanceof IPort ? undefined : original.tooltip
    )
  }

  /**
   * Exports and wraps the original visualization in an HTML element.
   */
  private exportAndWrap(graphComponent: GraphComponent, tooltip?: string): HTMLDivElement {
    graphComponent.updateContentBounds(10)
    const exporter = new SvgExport({ worldBounds: graphComponent.contentBounds })

    exporter.scale = exporter.calculateScaleForWidth(
      Math.min(this.maxItemWidth, graphComponent.contentBounds.width)
    )
    const visual = exporter.exportSvg(graphComponent)

    // Firefox does not display the SVG correctly because of the clip - so we remove it.
    visual.removeAttribute('clip-path')

    const div = document.createElement('div')
    div.setAttribute('class', 'demo-dnd-panel__item')
    div.appendChild(visual)
    if (tooltip) {
      div.title = tooltip
    }
    return div
  }

  /**
   * Adds mousedown and pointer down listeners to the given element that starts the drag operation.
   */
  private setStartDragListeners(item: INode | IEdge | ILabel | IPort, element: HTMLElement): void {
    // the actual drag operation
    const doDragOperation = () => {
      if (item.tag instanceof IStripe) {
        // If the dummy node has a stripe as its tag, we use the stripe directly
        // This allows StripeDropInputMode to take over
        this.beginDrag(element, item.tag)
      } else if (item.tag instanceof ILabel || item.tag instanceof IPort) {
        this.beginDrag(element, item.tag)
      } else if (item instanceof IEdge) {
        this.beginDrag(element, item)
      } else if (item instanceof ILabel) {
        this.beginDrag(element, item)
      } else if (item instanceof IPort) {
        this.beginDrag(element, item)
      } else {
        // Otherwise, we just use the node itself and let (hopefully) NodeDropInputMode take over
        const simpleNode = new SimpleNode()
        simpleNode.layout = item.layout
        simpleNode.style = item.style.clone()
        simpleNode.tag = item.tag
        simpleNode.labels = this.copyNodeLabels ? item.labels : IListEnumerable.EMPTY
        if (item.ports.size > 0) {
          simpleNode.ports = IListEnumerable.from(item.ports)
        }
        this.beginDrag(element, simpleNode)
      }
    }

    element.addEventListener(
      'pointerdown',
      (evt) => {
        if (evt.button !== 0) {
          return
        }
        doDragOperation()
        evt.preventDefault()
      },
      true
    )
  }
}

function createDragPreviewElement(templateElement: HTMLElement): HTMLElement {
  const dragPreview = templateElement.cloneNode(true) as HTMLElement
  dragPreview.style.margin = '0'
  return dragPreview
}
