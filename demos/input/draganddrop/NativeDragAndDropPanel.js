/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
import {
  GraphComponent,
  GraphEditorInputMode,
  IEdge,
  ILabel,
  ILabelModelParameterFinder,
  IListEnumerable,
  IModelItem,
  INode,
  Insets,
  IPort,
  Point,
  Rect,
  SimpleNode,
  SvgExport,
  VoidNodeStyle
} from 'yfiles'
import EdgeDropInputMode from './EdgeDropInputMode.js'

export class DragAndDropPanelItem {
  /**
   * @param {!T} element
   * @param {!string} tooltip
   */
  constructor(element, tooltip) {
    this.tooltip = tooltip
    this.element = element
  }
}

// @yjs:keep=effectAllowed

/**
 * A palette of sample nodes. Users can drag and drop the nodes from this palette to a graph control.
 */
export class NativeDragAndDropPanel {
  /**
   * Create a new style panel in the given element.
   * @param {!HTMLElement} div The element that will display the palette items.
   * @param {!GraphComponent} graphComponent The graph component.
   */
  constructor(div, graphComponent) {
    // Whether or not to show a preview during the drag.
    this.showPreview = true

    // Whether the labels of the DnD node visual should be transferred to the created node or discarded.
    this.copyNodeLabels = true

    this.div = div
    this.graphComponent = graphComponent
  }

  /**
   * Adds the items in the given array to the palette.
   * This method delegates the creation of the visualization of each node to createNodeVisual.
   * @param {!function} itemFactory
   */
  populatePanel(itemFactory) {
    const items = itemFactory()

    // This map is used for getting the instances from the string data of the data transfer during 'drop'
    const id2items = new Map()

    // Convert the nodes into plain visualizations
    const exportGraphComponent = new GraphComponent()
    const noPreviewElement = document.createElement('div')

    items.forEach((item, i) => {
      const modelItem = item.element

      // The item ID is used to get the node instance from the data transfer during 'drop'
      const itemId = `item ${i}`
      const visual =
        modelItem instanceof INode
          ? this.createNodeVisual(item, exportGraphComponent)
          : this.createEdgeVisual(item, exportGraphComponent)

      if (modelItem.tag instanceof IPort) {
        id2items.set(itemId, modelItem.tag)
      } else if (modelItem.tag instanceof ILabel) {
        id2items.set(itemId, modelItem.tag)
      } else if (modelItem instanceof IEdge) {
        id2items.set(itemId, modelItem)
      } else {
        // Store a node without labels to create a plain node on drop
        const modifiedNode = new SimpleNode()
        modifiedNode.layout = modelItem.layout
        modifiedNode.style = modelItem.style
        modifiedNode.ports = modelItem.ports
        modifiedNode.tag = modelItem.tag
        modifiedNode.labels = this.copyNodeLabels ? modelItem.labels : IListEnumerable.EMPTY
        id2items.set(itemId, modifiedNode)
      }

      // Set the item ID as data of the data transfer and configure some other drop properties according to the
      // dragged type
      visual.addEventListener('dragstart', e => {
        if (!e.dataTransfer) {
          return
        }

        e.dataTransfer.dropEffect = 'copy'
        e.dataTransfer.effectAllowed = 'copy'

        if (modelItem.tag instanceof IPort) {
          e.dataTransfer.setData(IPort.$class.name, itemId)
        } else if (modelItem.tag instanceof ILabel) {
          e.dataTransfer.setData(ILabel.$class.name, itemId)
        } else if (modelItem instanceof IEdge) {
          e.dataTransfer.setData(IEdge.$class.name, itemId)
        } else {
          e.dataTransfer.setData(INode.$class.name, itemId)
        }
        if (!this.showPreview) {
          document.body.appendChild(noPreviewElement)
          e.dataTransfer.setDragImage(noPreviewElement, 0, 0)
        }
      })
      visual.addEventListener('dragend', () => {
        if (!this.showPreview) {
          document.body.removeChild(noPreviewElement)
        }
      })

      // Finally, add the visual to palette
      this.div.appendChild(visual)
    })

    if (
      this.graphComponent.inputMode instanceof GraphEditorInputMode &&
      this.graphComponent.inputMode.nodeDropInputMode
    ) {
      // An item creator returns the node instance for the ID of the data transfer.
      // In this demo, we get the node from the 'id2items' map
      const oldItemCreator = this.graphComponent.inputMode.nodeDropInputMode.itemCreator
      this.graphComponent.inputMode.nodeDropInputMode.itemCreator = (
        context,
        graph,
        info,
        dropTarget,
        dropLocation
      ) => {
        const node = typeof info === 'string' ? id2items.get(info) : info
        // The old item creator handles the placement of the new node in the graph
        return oldItemCreator(context, graph, node, dropTarget, dropLocation)
      }

      // An item creator returns the port instance for the ID of the data transfer.
      // In this demo, we get the port from the 'id2items' map
      const portDropInputMode = this.graphComponent.inputMode.portDropInputMode
      const oldPortCreator = portDropInputMode.itemCreator
      portDropInputMode.itemCreator = (context, graph, info, dropTarget, dropLocation) => {
        let port = info
        if (typeof info === 'string') {
          port = id2items.get(info)
        }

        // the old item creator handles the placement of the new node in the graph
        return oldPortCreator(context, graph, port, dropTarget, dropLocation)
      }

      // An item creator returns the label instance for the ID of the data transfer.
      // In this demo, we get the label from the 'id2items' map
      const labelDropInputMode = this.graphComponent.inputMode.labelDropInputMode
      const oldLabelCreator = labelDropInputMode.itemCreator
      labelDropInputMode.itemCreator = (context, graph, info, dropTarget, dropLocation) => {
        let label = info
        if (typeof info === 'string') {
          label = id2items.get(info)
          const finder = label.layoutParameter.model.lookup(ILabelModelParameterFinder.$class)
          if (finder) {
            label.layoutParameter = finder.findBestParameter(
              label,
              label.layoutParameter.model,
              label.layout
            )
          }
        }

        // the old item creator handles the placement of the new node in the graph
        return oldLabelCreator(context, graph, label, dropTarget, dropLocation)
      }

      const edgeDropInputMode = this.graphComponent.inputMode
        .getSortedModes()
        .find(mode => mode instanceof EdgeDropInputMode)
      if (edgeDropInputMode instanceof EdgeDropInputMode) {
        const oldEdgeCreator = edgeDropInputMode.itemCreator
        edgeDropInputMode.itemCreator = (context, graph, info, dropTarget, dropLocation) => {
          let edge = info
          if (typeof info === 'string') {
            edge = id2items.get(info)
          }

          // the old item creator handles the placement of the new node in the graph
          return oldEdgeCreator(context, graph, edge, dropTarget, dropLocation)
        }
      }
    }
  }

  /**
   * Creates an element that contains the visualization of the given node.
   * This method is used by populatePanel to create the visualization
   * for each node provided by the factory.
   * @param {!DragAndDropPanelItem.<INode>} original
   * @param {!GraphComponent} exportGraphComponent
   * @returns {!HTMLElement}
   */
  createNodeVisual(original, exportGraphComponent) {
    const exportGraph = exportGraphComponent.graph
    exportGraph.clear()
    const originalNode = original.element

    const node = exportGraph.createNode(
      originalNode.layout.toRect(),
      originalNode.style,
      originalNode.tag
    )
    originalNode.labels.forEach(label => {
      exportGraph.addLabel(
        node,
        label.text,
        label.layoutParameter,
        label.style,
        label.preferredSize,
        label.tag
      )
    })
    originalNode.ports.forEach(port => {
      exportGraph.addPort(node, port.locationParameter, port.style, port.tag)
    })

    return exportAndWrap(exportGraphComponent, original.tooltip)
  }

  /**
   * Creates an element that contains the visualization of the given edge.
   * @param {!DragAndDropPanelItem.<IEdge>} original
   * @param {!GraphComponent} graphComponent
   * @returns {!HTMLElement}
   */
  createEdgeVisual(original, graphComponent) {
    const exportGraph = graphComponent.graph
    exportGraph.clear()

    const originalEdge = original.element

    const n1 = exportGraph.createNode(new Rect(0, 10, 0, 0), VoidNodeStyle.INSTANCE)
    const n2 = exportGraph.createNode(new Rect(50, 40, 0, 0), VoidNodeStyle.INSTANCE)
    const edge = exportGraph.createEdge(n1, n2, originalEdge.style)
    exportGraph.addBend(edge, new Point(25, 10))
    exportGraph.addBend(edge, new Point(25, 40))

    return exportAndWrap(graphComponent, original.tooltip)
  }
}

/**
 * Exports and wraps the original visualization in an HTML element.
 * @param {!GraphComponent} graphComponent
 * @param {!string} tooltip
 * @returns {!HTMLElement}
 */
function exportAndWrap(graphComponent, tooltip) {
  graphComponent.updateContentRect(new Insets(5))
  const exporter = new SvgExport(graphComponent.contentRect)
  const nodeVisual = exporter.exportSvg(graphComponent)

  // Firefox does not display the SVG correctly because of the clip - so we remove it.
  nodeVisual.removeAttribute('clip-path')

  // create the HTML element
  const div = document.createElement('div')
  div.setAttribute('class', 'dndPanelItem')
  div.appendChild(nodeVisual)
  div.style.setProperty('width', nodeVisual.getAttribute('width'), '')
  div.style.setProperty('height', nodeVisual.getAttribute('height'), '')
  div.style.setProperty('touch-action', 'none', '')
  try {
    div.style.setProperty('cursor', 'grab', '')
  } catch (e) {
    /* IE9 doesn't support grab cursor */
  }
  div.setAttribute('draggable', 'true')
  div.title = tooltip
  return div
}
