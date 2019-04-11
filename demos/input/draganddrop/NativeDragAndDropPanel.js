/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ILabel,
  ILabelModelParameterFinder,
  IListEnumerable,
  INode,
  Insets,
  IPort,
  SimpleNode,
  SvgExport
} from 'yfiles'

// @yjs:keep=effectAllowed
/**
 * A palette of sample nodes. Users can drag and drop the nodes from this palette to a graph control.
 */
export default class NativeDragAndDropPanel {
  /**
   * Create a new style panel in the given element.
   * @param {HTMLElement} div The element that will display the palette items.
   * @param {GraphComponent} graphComponent The graph component.
   */
  constructor(div, graphComponent) {
    this.div = div
    this.graphComponent = graphComponent
    this.$showPreview = true
    this.$copyNodeLabels = true
  }

  /**
   * Returns whether or not to show a preview during the drag.
   * @return {boolean}
   */
  get showPreview() {
    return this.$showPreview
  }

  /**
   * Sets whether or not to show a preview during the drag.
   * @param {boolean} showPreview
   */
  set showPreview(showPreview) {
    this.$showPreview = showPreview
  }

  /**
   * Whether the labels of the DnD node visual should be transferred to the created node or discarded.
   * @returns {Boolean}
   */
  get copyNodeLabels() {
    return this.$copyNodeLabels
  }

  set copyNodeLabels(value) {
    this.$copyNodeLabels = value
  }

  /**
   * Adds the items in the given array to the palette.
   * This method delegates the creation of the visualization of each node to createNodeVisual.
   * @param {function} itemFactory
   */
  populatePanel(itemFactory) {
    if (!itemFactory) {
      return
    }

    const items = itemFactory()

    // This map is used for getting the instances from the string data of the data transfer during 'drop'
    const id2items = new Map()

    // Convert the nodes into plain visualizations
    const exportGraphComponent = new GraphComponent()
    const noPreviewElement = document.createElement('div')
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const node = item.element

      // The node ID is used to get the node instance from the data transfer during 'drop'
      const nodeID = `node ${i}`
      const visual = this.createNodeVisual(item, exportGraphComponent)

      if (IPort.isInstance(node.tag)) {
        id2items.set(nodeID, node.tag)
      } else if (ILabel.isInstance(node.tag)) {
        id2items.set(nodeID, node.tag)
      } else {
        // Store a node without labels to create a plain node on drop
        const modifiedNode = new SimpleNode()
        modifiedNode.layout = node.layout
        modifiedNode.style = node.style
        modifiedNode.ports = node.ports
        modifiedNode.tag = node.tag
        modifiedNode.labels = this.$copyNodeLabels ? node.labels : IListEnumerable.EMPTY
        id2items.set(nodeID, modifiedNode)
      }

      // Set the node ID as data of the data transfer and configure some other drop properties according to the
      // dragged type
      visual.addEventListener('dragstart', e => {
        e.dataTransfer.dropEffect = 'copy'
        e.dataTransfer.effectAllowed = 'copy'

        if (IPort.isInstance(node.tag)) {
          e.dataTransfer.setData(IPort.$class.name, nodeID)
        } else if (ILabel.isInstance(node.tag)) {
          e.dataTransfer.setData(ILabel.$class.name, nodeID)
        } else {
          e.dataTransfer.setData(INode.$class.name, nodeID)
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
    }

    if (
      GraphEditorInputMode.isInstance(this.graphComponent.inputMode) &&
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
    }
  }

  /**
   * Creates an element that contains the visualization of the given node.
   * This method is used by populatePanel to create the visualization
   * for each node provided by the factory.
   * @param {Object} original
   * @param {GraphComponent} exportGraphComponent
   * @return {HTMLElement}
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

    exportGraphComponent.updateContentRect(new Insets(5))
    const exporter = new SvgExport(exportGraphComponent.contentRect)
    const element = exporter.exportSvg(exportGraphComponent)

    // Firefox does not display the SVG correctly because of the clip - so we remove it.
    element.removeAttribute('clip-path')
    return wrapNodeVisual(element, original.tooltip)
  }
}

/**
 * Wraps the original visualization in an HTML element.
 * @return {HTMLElement}
 */
function wrapNodeVisual(nodeVisual, tooltip) {
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
