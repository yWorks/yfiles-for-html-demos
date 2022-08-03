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
import {
  ConcurrencyController,
  Cursor,
  GraphComponent,
  IGraph,
  IInputModeContext,
  INode,
  INodeHitTester,
  InputModeBase,
  Insets,
  ModifierKeys,
  MouseEventArgs,
  NodeEventArgs,
  SvgExport
} from 'yfiles'

import { detectSafariVersion } from '../../utils/Workarounds.js'

const isSafari = detectSafariVersion() > 0

/**
 * An input mode which supports dragging nodes from the component to another HTML element.
 *
 * HTML elements where the node can be dropped on can be defined with method {@link addDropTarget}.
 *
 * The static method {@link createNodeImage} can be used to create an {@link HTMLImageElement image representation} of the given node.
 */
export class NodeDragInputMode extends InputModeBase {
  constructor() {
    super()
    this.graphComponent = null
    this.node = null
    this.oldAutoDrag = null
    this.img = null

    //////////////////////////// Node to String handling //////////////////////////////////////
    this.nodeToId = new Map()

    this.idToNode = new Map()
  }

  /////////////////// common input mode handling ///////////////////////

  /**
   * Installs this input mode.
   * Adds all listeners.
   * @param {!IInputModeContext} context
   * @param {!ConcurrencyController} controller
   */
  install(context, controller) {
    super.install(context, controller)
    this.graphComponent = context.canvasComponent
    this.graphComponent.graph.addNodeRemovedListener(this.handleNodeRemoved.bind(this))
    this.graphComponent.addMouseDragListener(this.onMouseDrag.bind(this))
    this.graphComponent.addMouseDownListener(this.onMouseDown.bind(this))
    this.graphComponent.addMouseUpListener(this.onMouseUp.bind(this))
    this.graphComponent.div.addEventListener('dragstart', this.onDragStarted.bind(this))
    this.graphComponent.div.addEventListener('dragend', this.onDragEnd.bind(this))
    this.graphComponent.div.draggable = true
  }

  /**
   * Uninstalls this input mode.
   * @param {!IInputModeContext} context
   */
  uninstall(context) {
    super.uninstall(context)
    this.graphComponent.graph.removeNodeRemovedListener(this.handleNodeRemoved.bind(this))
    this.graphComponent.removeMouseDragListener(this.onMouseDrag.bind(this))
    this.graphComponent.removeMouseDownListener(this.onMouseDown.bind(this))
    this.graphComponent.removeMouseUpListener(this.onMouseUp.bind(this))
    this.graphComponent.div.removeEventListener('dragstart', this.onDragStarted.bind(this))
    this.graphComponent.div.removeEventListener('dragend', this.onDragEnd.bind(this))
    this.graphComponent.div.draggable = false
    this.graphComponent = null
  }

  /**
   * Cancels the input mode.
   */
  cancel() {
    this.node = null
    if (isSafari && this.img) {
      this.img.parentNode?.removeChild(this.img)
    }
    this.img = null
    return super.cancel()
  }

  //////////////////////////// native drag events

  /**
   * The actual HTML5 drag has been started on the div.
   * Sets the pre-rendered image which is dragged and the drag data.
   * @param {!DragEvent} event
   */
  onDragStarted(event) {
    if (this.node) {
      event.dataTransfer.setData('text/plain', this.getId(this.node))
      const layout = this.node.layout
      if (isSafari && this.img) {
        // Safari does not show the generated SVG unless it is added to the DOM
        document.body.appendChild(this.img)
      }
      event.dataTransfer.setDragImage(this.img, layout.width / 2, layout.height / 2)
    } else {
      event.preventDefault()
    }
  }

  /**
   * The actual HTML5 drag has been ended.
   * Dispatch an mouse up event on the component.
   */
  onDragEnd() {
    this.cancel()
    // dispatch an artificial mouse up event on the component
    // to fix the internal mouse handling:
    // the mouse up was part of the drag and drop gesture,
    // therefore yFiles thinks that the mouse is still down
    const evt = document.createEvent('MouseEvents')
    evt.initEvent('mouseup', true, true)
    this.graphComponent.div.dispatchEvent(evt)

    if (typeof this.oldAutoDrag === 'boolean') {
      this.graphComponent.autoDrag = this.oldAutoDrag
      this.oldAutoDrag = null
    }
  }

  //////////////////////// yFiles mouse events ////////////////////////////////////

  /**
   * Mouse down on the component.
   * If a node is hit "arm" this input mode by setting the node which might be dragged.
   * Also pre-render the image for the drag.
   * @param {*} _
   * @param {!MouseEventArgs} evt
   */
  onMouseDown(_, evt) {
    if (evt.modifiers !== ModifierKeys.NONE) {
      // To avoid clashes with the CreateEdgeInputMode:
      // Don't arm this mode if shift is held down
      return
    }
    const nodeHitTester = this.inputModeContext.lookup(INodeHitTester.$class)
    if (nodeHitTester) {
      const node = nodeHitTester.enumerateHits(this.inputModeContext, evt.location).at(0)
      if (node) {
        this.node = node
        // pre-render the image, otherwise it is not shown during the drag
        this.img = NodeDragInputMode.createNodeImage(node)
        this.img.width = node.layout.width
        this.img.height = node.layout.height
        this.controller.preferredCursor = Cursor.GRAB
      }
    }
  }

  /**
   * The mouse is dragged on the component.
   * Request the mutex, i.e. prevent other input modes from, being started.
   * The actual drag is started by the dragstart event handled by {@link onDragStarted}.
   */
  onMouseDrag() {
    if (this.node) {
      if (this.canRequestMutex()) {
        this.requestMutex()
        // disable auto drag. Otherwise the component will scroll if we drag outside it.
        this.oldAutoDrag = this.graphComponent.autoDrag
        this.graphComponent.autoDrag = false
      }
    }
  }

  /**
   * Cleans up if a mouse down is followed by a mouse drag but not a dragstart event.
   */
  onMouseUp() {
    if (this.node) {
      this.cancel()
    }
  }

  /////////////////////////////// image creation //////////////////////////////////////

  /**
   * Creates an img element which represents the dragged node.
   * This element is the actually dragged element.
   * @param {!INode} node The node to create the image for.
   * @returns {!HTMLImageElement} The img element which shows the node
   */
  static createNodeImage(node) {
    // Create the HTML element for the visual.
    const img = document.createElement('img')
    img.setAttribute('style', 'width: auto; height: auto;')
    // Create a visual for the node.
    const value = NodeDragInputMode.createNodeSvg(node)
    img.setAttribute('src', value)
    img.setAttribute('draggable', 'false')
    return img
  }

  /**
   * Creates an SVG which shows the node.
   * Returns it base64 encoded so we can use it as value for an img's src attribute.
   * @param {!INode} node
   * @returns {!string}
   */
  static createNodeSvg(node) {
    // another GraphComponent is utilized to export a visual of the given style
    if (!NodeDragInputMode._exportComponent) {
      NodeDragInputMode._exportComponent = new GraphComponent()
    }
    const exportComponent = NodeDragInputMode._exportComponent
    const exportGraph = exportComponent.graph
    exportGraph.clear()

    // we create a node in this GraphComponent that should be exported as SVG
    NodeDragInputMode.copyNode(node, exportGraph)
    exportComponent.updateContentRect(new Insets(5))

    // the SvgExport can export the content of any GraphComponent
    const svgExport = new SvgExport(exportComponent.contentRect)
    svgExport.cssStyleSheet = null
    const svg = svgExport.exportSvg(exportComponent)
    const svgString = SvgExport.exportSvgString(svg)
    return SvgExport.encodeSvgDataUrl(svgString)
  }

  /**
   * @param {!INode} node
   * @param {!IGraph} targetGraph
   */
  static copyNode(node, targetGraph) {
    const newNode = targetGraph.createNode(node.layout, node.style, node.tag)
    for (const label of node.labels) {
      targetGraph.addLabel(
        newNode,
        label.text,
        label.layoutParameter,
        label.style,
        label.preferredSize,
        label.tag
      )
    }
    for (const port of node.ports) {
      const newPort = targetGraph.addPort(newNode, port.locationParameter, port.style, port.tag)
      for (const label of port.labels) {
        targetGraph.addLabel(
          newPort,
          label.text,
          label.layoutParameter,
          label.style,
          label.preferredSize,
          label.tag
        )
      }
    }
  }

  /**
   * @param {!INode} node
   * @returns {!string}
   */
  getId(node) {
    let id = this.nodeToId.get(node)
    if (!id) {
      let counter = 0
      while (this.idToNode.has(counter.toString())) {
        counter++
      }
      id = counter.toString()
      this.nodeToId.set(node, id)
      this.idToNode.set(id, node)
    }
    return id
  }

  /**
   * @param {!string} id
   * @returns {!INode}
   */
  getNode(id) {
    return this.idToNode.get(id)
  }

  /**
   * @param {*} _
   * @param {!NodeEventArgs} evt
   */
  handleNodeRemoved(_, evt) {
    const id = this.nodeToId.get(evt.item)
    if (id) {
      this.idToNode.delete(id)
      this.nodeToId.delete(evt.item)
    }
  }

  //////////////////////////// Adding elements to drop at ///////////////////////////////////

  /**
   * Specifies the given {@link HTMLElement} as a target for dropping {@link INode nodes}.
   * @param {!HTMLElement} target An {@link HTMLElement} to be able to drop {@link INode nodes} on.
   * @param {!function} dropped A callback that will be called to handle the drop operation.
   */
  addDropTarget(target, dropped) {
    target.addEventListener('drop', evt => {
      const node = this.getNode(evt.dataTransfer.getData('text/plain'))
      dropped(evt, node)
      if (evt.stopPropagation) {
        evt.stopPropagation()
      }
      if (evt.preventDefault) {
        evt.preventDefault()
      }
    })
    target.addEventListener('dragover', evt => {
      if (evt.dataTransfer.getData(INode.$class.name)) {
        evt.dataTransfer.dropEffect = 'none'
        return
      }
      if (evt.preventDefault) {
        evt.preventDefault() // Necessary. Allows us to drop.
      }
      evt.dataTransfer.dropEffect = 'move' // See the section on the DataTransfer object.
    })
  }
}

/**
 * A GraphComponent which supports drag events.
 * Overrides the default where the GraphComponent prevents drag events.
 */
export class DraggableGraphComponent extends GraphComponent {
  /**
   * @param {!Event} evt
   */
  maybePreventPointerDefault(evt) {}
}
