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
// eslint-disable-next-line import/no-named-as-default
import yfiles, {
  DragDropEffects,
  DragDropItem,
  DragSource,
  GraphComponent,
  IEdge,
  ILabel,
  IListEnumerable,
  IModelItem,
  INode,
  IPort,
  LabelDropInputMode,
  ListEnumerable,
  NodeDropInputMode,
  Point,
  PortDropInputMode,
  Rect,
  SimpleNode,
  SvgExport,
  VoidNodeStyle
} from 'yfiles'

/**
 * @typedef {(T|object)} DragAndDropPanelItem
 */

/**
 * A drag and drop panel component, from which users can drag the items to a {@link GraphComponent}.
 *
 * The component is mounted into the provided HTML element. It can be populated with nodes,
 * edges, labels, and ports using {@link populatePanel}.
 */
export class DragAndDropPanel {
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
   * @param {!HTMLElement} div The element that will display the palette items.
   */
  constructor(div) {
    this.div = div
  }

  /**
   * Adds the provided items to this panel.
   * @param {!Iterable.<DragAndDropPanelItem.<(INode|IEdge)>>} items
   */
  populatePanel(items) {
    // Convert the nodes into plain visualizations
    const graphComponent = new GraphComponent()
    for (const item of items) {
      const modelItem = item instanceof INode || item instanceof IEdge ? item : item.modelItem
      const visual =
        modelItem instanceof INode
          ? this.createNodeVisual(modelItem, graphComponent)
          : this.createEdgeVisual(modelItem, graphComponent)
      this.addStartDragListeners(modelItem, visual)
      this.div.appendChild(visual)
    }
  }

  /**
   * @param {!HTMLElement} element
   * @param {!unknown} data
   */
  beginDrag(element, data) {
    const dragPreview = element.cloneNode(true)
    dragPreview.style.margin = '0'

    // Ensure that the following code still works, even when the view-table module isn't loaded
    const IStripe = yfiles.graph.IStripe
    const StripeDropInputMode = yfiles.input.StripeDropInputMode

    let dragSource = null
    if (IStripe && StripeDropInputMode && data instanceof IStripe) {
      dragSource = StripeDropInputMode.startDrag(
        element,
        data,
        DragDropEffects.ALL,
        true,
        dragPreview
      )
    } else if (data instanceof ILabel) {
      dragSource = LabelDropInputMode.startDrag(
        element,
        data,
        DragDropEffects.ALL,
        true,
        dragPreview
      )
    } else if (data instanceof IPort) {
      dragSource = PortDropInputMode.startDrag(
        element,
        data,
        DragDropEffects.ALL,
        true,
        dragPreview
      )
    } else if (data instanceof IEdge) {
      dragSource = new DragSource(element)
      void dragSource.startDrag(
        new DragDropItem(IEdge.$class.name, data),
        DragDropEffects.ALL,
        true,
        dragPreview
      )
    } else if (data instanceof INode) {
      dragSource = NodeDropInputMode.startDrag(
        element,
        data,
        DragDropEffects.ALL,
        true,
        dragPreview
      )
    }

    // let the GraphComponent handle the preview rendering if possible
    if (dragSource) {
      dragSource.addQueryContinueDragListener((src, args) => {
        if (args.dropTarget === null) {
          dragPreview.classList.remove('hidden')
        } else {
          dragPreview.classList.add('hidden')
        }
      })
    }
  }

  /**
   * Creates an element that contains the visualization of the given node.
   * This method is used by populatePanel to create the visualization
   * for each node provided by the factory.
   * @param {!DragAndDropPanelItem.<INode>} original
   * @param {!GraphComponent} graphComponent
   * @returns {!HTMLDivElement}
   */
  createNodeVisual(original, graphComponent) {
    const graph = graphComponent.graph
    graph.clear()

    const originalNode = original instanceof INode ? original : original.modelItem
    const node = graph.createNode(originalNode.layout, originalNode.style, originalNode.tag)
    originalNode.labels.forEach(label => {
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

    return this.exportAndWrap(
      graphComponent,
      original instanceof INode ? undefined : original.tooltip
    )
  }

  /**
   * Creates an element that contains the visualization of the given edge.
   * @param {!DragAndDropPanelItem.<IEdge>} original
   * @param {!GraphComponent} graphComponent
   * @returns {!HTMLDivElement}
   */
  createEdgeVisual(original, graphComponent) {
    const graph = graphComponent.graph
    graph.clear()

    const originalEdge = original instanceof IEdge ? original : original.modelItem

    const n1 = graph.createNode(new Rect(0, 10, 0, 0), VoidNodeStyle.INSTANCE)
    const n2 = graph.createNode(new Rect(50, 40, 0, 0), VoidNodeStyle.INSTANCE)
    const edge = graph.createEdge(n1, n2, originalEdge.style)
    graph.addBend(edge, new Point(25, 10))
    graph.addBend(edge, new Point(25, 40))

    return this.exportAndWrap(
      graphComponent,
      original instanceof IEdge ? undefined : original.tooltip
    )
  }

  /**
   * Exports and wraps the original visualization in an HTML element.
   * @param {!GraphComponent} graphComponent
   * @param {!string} [tooltip]
   * @returns {!HTMLDivElement}
   */
  exportAndWrap(graphComponent, tooltip) {
    graphComponent.updateContentRect(10)
    const exporter = new SvgExport({
      worldBounds: graphComponent.contentRect
    })

    exporter.scale = exporter.calculateScaleForWidth(
      Math.min(this.maxItemWidth, graphComponent.contentRect.width)
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
   * @param {!(INode|IEdge)} item
   * @param {!HTMLElement} element
   */
  addStartDragListeners(item, element) {
    // the actual drag operation
    const doDragOperation = () => {
      // Ensure that the following code still works, even when the view-table module isn't loaded
      const IStripe = yfiles.graph.IStripe
      if (IStripe && item.tag instanceof IStripe) {
        // If the dummy node has a stripe as its tag, we use the stripe directly
        // This allows StripeDropInputMode to take over
        this.beginDrag(element, item.tag)
      } else if (item.tag instanceof ILabel || item.tag instanceof IPort) {
        this.beginDrag(element, item.tag)
      } else if (item instanceof IEdge) {
        this.beginDrag(element, item)
      } /*if (item instanceof INode)*/ else {
        // Otherwise, we just use the node itself and let (hopefully) NodeDropInputMode take over
        const simpleNode = new SimpleNode()
        simpleNode.layout = item.layout
        simpleNode.style = item.style.clone()
        simpleNode.tag = item.tag
        simpleNode.labels = this.copyNodeLabels ? item.labels : IListEnumerable.EMPTY
        if (item.ports.size > 0) {
          simpleNode.ports = new ListEnumerable(item.ports)
        }
        this.beginDrag(element, simpleNode)
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

    const touchStartListener = evt => {
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
    } else if (window.MSPointerEvent !== undefined) {
      element.addEventListener(
        'MSPointerDown',
        evt => {
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
      element.addEventListener('touchstart', touchStartListener, { passive: false })
    }
  }
}
