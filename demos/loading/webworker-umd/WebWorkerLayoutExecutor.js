/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

define(['yfiles-umd/view-layout-bridge', 'WebWorkerJsonIO.js'], (
  /** @param {yfiles} yfiles */ yfiles,
  WebWorkerJsonIO
) => {
  const {
    GraphComponent,
    Mapper,
    IMapper,
    SimpleNode,
    IAnimation,
    ViewportAnimation,
    Animator,
    SimpleLabel,
    SimplePort,
    SimpleEdge,
    ILabelModelParameterFinder,
    OrientedRectangle,
    Rect,
    Point
  } = yfiles

  class WebWorkerLayoutExecutor {
    /**
     * Creates a new instance.
     * @param {GraphComponent} graphComponent
     * @param {Worker} worker
     */
    constructor(graphComponent, worker) {
      this.graphComponent = graphComponent
      this.worker = worker
    }

    /**
     * Starts layout calculation and applies the result to the graph.
     * @return {Promise}
     */
    start() {
      return new Promise((resolve, reject) => {
        this.worker.onmessage = async e => {
          const compoundEdit = this.graphComponent.graph.beginEdit('Layout', 'Layout')
          await applyCalculatedLayout(e.data, this.graphComponent)
          compoundEdit.commit()
          resolve()
        }
        this.worker.onerror = e => {
          e.preventDefault()
          if (e.message && e.message.indexOf('License Error') >= 0) {
            reject(
              new Error(
                'License Error: If you are using a license key for older versions (before 1.2),' +
                  ' please contact sales@yworks.com to receive an updated license key.'
              )
            )
          } else {
            reject(new Error(`${e.message} (${e.filename}:${e.lineno})`))
          }
        }

        const graphJSON = WebWorkerJsonIO.write(this.graphComponent.graph)
        this.worker.postMessage({
          graph: graphJSON
        })
      })
    }
  }

  /**
   * Applies the graph layout that was calculated by the web worker to the graph.
   * @param {Object} response The JSON object from the web worker that specifies the new graph layout.
   * @param {GraphComponent} graphComponent
   * calculation. This is set to <code>true</code> if this method is called directly after
   * loading a new sample graph.
   * @yjs:keep=nodeList,edgeList
   */
  function applyCalculatedLayout(response, graphComponent) {
    const nodes = response.nodeList
    const edges = response.edgeList

    // collect the resulting node, bend, port and label positions, so we
    // can animate to the new layout using IAnimation.createGraphAnimation
    const node2Layout = new Mapper()
    const edge2Bends = new Mapper()
    const port2Location = new Mapper()
    const label2Parameter = new Mapper()

    // make sure that the layout calculation is a single undo step
    const graph = graphComponent.graph

    // collect the new node layouts
    nodes.forEach(nodeObj => storeNodeLayout(node2Layout, label2Parameter, nodeObj, graphComponent))

    // collect the new bend and port locations
    edges.forEach(edgeObj =>
      storeEdgeLayout(
        edge2Bends,
        node2Layout,
        port2Location,
        label2Parameter,
        edgeObj,
        graphComponent
      )
    )

    // the target port location parameters have to be created for node instances that
    // are already located at the final locations.
    const portMapper = IMapper.fromDelegate(port => {
      const location = port2Location.get(port)
      const ownerLayout = node2Layout.get(port.owner)
      if (location !== null && ownerLayout !== null) {
        const dummyNode = new SimpleNode()
        dummyNode.layout = ownerLayout
        return port.locationParameter.model.createParameter(dummyNode, location)
      }
      return port.locationParameter
    })

    // we also animate the viewport, so the full graph is visible after the layout animation
    const bounds = response.graphBounds
    const targetBounds = new Rect(
      parseFloat(bounds.x),
      parseFloat(bounds.y),
      parseFloat(bounds.width),
      parseFloat(bounds.height)
    )
    const graphAnimation = IAnimation.createGraphAnimation(
      graph,
      node2Layout,
      edge2Bends,
      portMapper,
      label2Parameter,
      '1s'
    )
    const viewportAnimation = new ViewportAnimation(graphComponent, targetBounds, '1s')
    viewportAnimation.targetViewMargins = 10
    const parallelAnimation = IAnimation.createParallelAnimation([
      graphAnimation,
      viewportAnimation
    ])
    const animator = new Animator(graphComponent)

    return animator.animate(parallelAnimation)
  }

  /**
   * Stores the node layout copied from web worker's node object to the respective maps that
   * hold the information for the graph.
   * @param {Mapper} node2Layout The map that stores the node layouts.
   * @param {Mapper} label2Parameter The map that stores the label parameters.
   * @param {Object} nodeObj The JSON node object from the web worker that specifies the new node layout.
   * @param {GraphComponent} graphComponent
   */
  function storeNodeLayout(node2Layout, label2Parameter, nodeObj, graphComponent) {
    const node = graphComponent.graph.nodes.find(n => n.tag.id === nodeObj.tag.id)
    if (node !== null) {
      const newLayout = getLayoutFromObj(nodeObj)
      node2Layout.set(node, newLayout)

      // We need a dummy label with the new owner layout, so the ILabelModelParameterFinder can
      // calculate the parameter correctly.
      const dummyNode = new SimpleNode()
      dummyNode.layout = newLayout
      nodeObj.labels &&
        nodeObj.labels.forEach((labelObj, index) => {
          const label = node.labels.get(index)
          const dummyLabel = new SimpleLabel(dummyNode, label.text, label.layoutParameter)
          dummyLabel.preferredSize = label.preferredSize
          label2Parameter.set(label, getLabelParameter(labelObj.layout, dummyLabel))
        })
    }
  }

  /**
   * Retrieves the rectangle from the given node.
   * @param {JSONNode} jsonNode
   * @return {Rect}
   */
  function getLayoutFromObj(jsonNode) {
    const layout = jsonNode.layout
    const x = parseFloat(layout.x)
    const y = parseFloat(layout.y)
    const w = parseFloat(layout.width)
    const h = parseFloat(layout.height)
    return new Rect(x, y, w, h)
  }

  /**
   * Stores the edge layout alongside the port locations from the web worker's edge object to the respective maps that
   * hold the information for the graph.
   * @param {Mapper} edge2Bends The map that stores the edge bends.
   * @param {Mapper} node2Layout The map that stores the node layouts.
   * @param {Mapper} port2Location The map that stores the port locations.
   * @param {Mapper} label2Parameter The map that stores the label parameters.
   * @param {Object} edgeObj The JSON edge object from the web worker that specifies the new layout.
   * @param {GraphComponent} graphComponent
   */
  function storeEdgeLayout(
    edge2Bends,
    node2Layout,
    port2Location,
    label2Parameter,
    edgeObj,
    graphComponent
  ) {
    const edge = graphComponent.graph.edges.find(e => e.tag.id === edgeObj.tag.id)
    if (edge !== null) {
      // We need a dummy label with the new source/target port layout, so the ILabelModelParameterFinder can
      // calculate the parameter correctly
      const dummySource = new SimpleNode()
      const dummyTarget = new SimpleNode()
      dummySource.layout = node2Layout.get(edge.sourcePort.owner)
      dummyTarget.layout = node2Layout.get(edge.targetPort.owner)
      const sourcePort = new SimplePort(dummySource, edge.sourcePort.locationParameter)
      const targetPort = new SimplePort(dummyTarget, edge.targetPort.locationParameter)

      const dummyEdge = new SimpleEdge(sourcePort, targetPort)

      if (Array.isArray(edgeObj.bends)) {
        const bends = []
        for (let i = 0; i < edgeObj.bends.length; i++) {
          bends.push(getLocationFromObj(edgeObj.bends[i]))
        }
        edge2Bends.set(edge, bends)
      } else {
        edge2Bends.set(edge, [])
      }

      port2Location.set(edge.sourcePort, getLocationFromObj(edgeObj.sourcePort))
      port2Location.set(edge.targetPort, getLocationFromObj(edgeObj.targetPort))

      edgeObj.labels &&
        edgeObj.labels.forEach((labelObj, index) => {
          const label = edge.labels.get(index)
          const dummyLabel = new SimpleLabel(dummyEdge, label.text, label.layoutParameter)
          dummyLabel.preferredSize = label.preferredSize
          label2Parameter.set(label, getLabelParameter(labelObj.layout, dummyLabel))
        })
    }
  }

  /**
   * Returns the location stored in the given JSON object.
   * @param {Object} obj The JSON object that contains the location.
   * @return {Point} The location stored in the given JSON object.
   */
  function getLocationFromObj(obj) {
    const x = parseFloat(obj.x)
    const y = parseFloat(obj.y)
    return new Point(x, y)
  }

  /**
   * Converts the web worker's label layout to a label layout parameter with findBestParameter.
   * @param {Object} layoutObj The JSON label object from the web worker that specifies the new label layout.
   * @param {ILabel} dummyLabel A dummy label that is used to calculate the layout parameter.
   * @return {ILabelModelParameter} The parameter that best matches the new layout.
   */
  function getLabelParameter(layoutObj, dummyLabel) {
    const model = dummyLabel.layoutParameter.model
    const parameterFinder = model.lookup(ILabelModelParameterFinder.$class)
    const layout = new OrientedRectangle(
      layoutObj.anchorX,
      layoutObj.anchorY,
      layoutObj.width,
      layoutObj.height,
      layoutObj.upX,
      layoutObj.upY
    )
    return parameterFinder.findBestParameter(dummyLabel, model, layout)
  }

  return WebWorkerLayoutExecutor
})
