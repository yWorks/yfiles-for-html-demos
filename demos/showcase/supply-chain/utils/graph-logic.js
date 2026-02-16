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
import { AdjacencyTypes, IEdge } from '@yfiles/yfiles'
import {
  buildSourcePortIdFromPropertyElementId,
  buildTargetPortIdFromPropertyElementId,
  getPropertyElementIdFromPortId
} from './helpers'

/**
 * Finds and marks neighbor elements in the graph starting either from a property within a node or
 * from an edge. This method traverses the graph in both directions – upstream and downstream –
 * to find neighboring graph elements, i.e., properties and edges.
 */
export function findNeighbors(graphComponent, portMapWrapper, startingPoint) {
  // perform neighbor search on the master graph to ensure consistency independent of the current folding state
  const masterGraph = graphComponent.graph.foldingView?.manager.masterGraph
  if (!masterGraph) return

  if (typeof startingPoint === 'string') {
    traverseGraph({ outgoing: true, propertyElementId: startingPoint, masterGraph, portMapWrapper })
    traverseGraph({
      outgoing: false,
      propertyElementId: startingPoint,
      masterGraph,
      portMapWrapper
    })
  }

  if (startingPoint instanceof IEdge) {
    const edge = startingPoint
    edge.tag = { ...edge.tag, toHighlight: true }

    const targetPropertyElementId = getPropertyElementIdFromPortId(edge.targetPort.tag.id)
    const sourcePropertyElementId = getPropertyElementIdFromPortId(edge.sourcePort.tag.id)

    traverseGraph({
      outgoing: true,
      propertyElementId: targetPropertyElementId,
      masterGraph,
      portMapWrapper
    })
    traverseGraph({
      outgoing: false,
      propertyElementId: sourcePropertyElementId,
      masterGraph,
      portMapWrapper
    })
  }
}

/**
 * Traverses the graph starting from a given property and saves the highlighting state for all edges
 * and properties that are recursive neighbors of the initial property, using edge tags or
 * corresponding node tags.
 */
function traverseGraph(params) {
  // keep track of ports that have been visited already
  const visitedPorts = new Set()
  // keep queue of ports to visit
  const queuedPorts = []
  const startPortId = params.outgoing
    ? buildSourcePortIdFromPropertyElementId(params.propertyElementId)
    : buildTargetPortIdFromPropertyElementId(params.propertyElementId)
  const firstPort = params.portMapWrapper.getMasterPort(startPortId)
  if (!firstPort) return
  firstPort.owner.tag.updatePropertyHighlight(params.propertyElementId, true)
  firstPort.tag = { ...firstPort.tag, toHighlight: true }

  queuedPorts.push(firstPort)
  visitedPorts.add(firstPort)

  const MAX_ITERATIONS = 1000
  let iterations = 0

  while (queuedPorts.length > 0 && iterations < MAX_ITERATIONS) {
    iterations++
    const port = queuedPorts.shift()

    const edges = params.masterGraph.edgesAt(
      port,
      params.outgoing ? AdjacencyTypes.OUTGOING : AdjacencyTypes.INCOMING
    )
    for (const edge of edges) {
      const connectedPort = params.outgoing ? edge.targetPort : edge.sourcePort
      visitedPorts.add(connectedPort)
      const connectedPortId = connectedPort.tag.id.toString()
      const propertyElementId = getPropertyElementIdFromPortId(connectedPortId)

      edge.tag = { ...edge.tag, toHighlight: true }
      connectedPort.tag = { ...connectedPort.tag, toHighlight: true }
      connectedPort.owner.tag.updatePropertyHighlight(propertyElementId, true)

      const nextPortId = params.outgoing
        ? buildSourcePortIdFromPropertyElementId(propertyElementId)
        : buildTargetPortIdFromPropertyElementId(propertyElementId)
      const nextPort = params.portMapWrapper.getMasterPort(nextPortId)

      if (!nextPort) continue

      nextPort.tag = { ...nextPort.tag, toHighlight: true }

      if (!visitedPorts.has(nextPort)) {
        visitedPorts.add(nextPort)
        queuedPorts.push(nextPort)
      }
    }
  }

  if (iterations >= MAX_ITERATIONS) {
    console.warn(
      'The finding neighbors algorithm reached its maximum iteration limit. The graph may contain too many connections or cycles.'
    )
  }
}

/**
 * Handles the logic of producing stock, i.e., increasing the stock by 1, for a given property.
 * The stock of a property can only be increased if the stock of all incoming properties is larger
 * than 0. Displays an alert message if that condition is not met.
 */
export function produceStock(graphComponent, portMapWrapper, currentPropertyElementId) {
  // workaround: use master port to access master node
  const currentNode = portMapWrapper.getMasterPort(
    buildTargetPortIdFromPropertyElementId(currentPropertyElementId)
  )?.owner
  if (!currentNode) return

  // use master graph to ensure consistency independent of the current folding state
  const masterGraph = graphComponent.graph.foldingView?.manager.masterGraph
  if (!masterGraph) return

  const targetPort = portMapWrapper.getMasterPort(
    buildTargetPortIdFromPropertyElementId(currentPropertyElementId)
  )
  if (!targetPort) return

  const incomingEdges = masterGraph.edgesAt(targetPort, AdjacencyTypes.INCOMING)
  const incomingPropertyElements = []
  incomingEdges.forEach((edge) => {
    incomingPropertyElements.push(getPropertyElementIdFromPortId(edge.sourcePort.tag.id))
  })

  const propertyElementsOutOfStock = []
  incomingPropertyElements.forEach((propertyElementId) => {
    const node = portMapWrapper.getMasterPort(
      buildTargetPortIdFromPropertyElementId(propertyElementId)
    )?.owner
    if (!node) return
    if (!node.tag.propertyInStock(propertyElementId)) {
      propertyElementsOutOfStock.push(propertyElementId)
    }
  })

  if (propertyElementsOutOfStock.length === 0) {
    incomingPropertyElements.forEach((propertyElementId) => {
      const node = portMapWrapper.getMasterPort(
        buildTargetPortIdFromPropertyElementId(propertyElementId)
      )?.owner
      if (!node) return
      node.tag.decreasePropertyStock(propertyElementId)
      node.tag.updatePropertyFlash(propertyElementId, true)
    })
    currentNode.tag.increasePropertyStock(currentPropertyElementId)
    currentNode.tag.updatePropertyFlash(currentPropertyElementId, true)
  } else {
    propertyElementsOutOfStock.forEach((propertyElementId) => {
      const node = portMapWrapper.getMasterPort(
        buildTargetPortIdFromPropertyElementId(propertyElementId)
      )?.owner
      if (!node) return
      node.tag.updatePropertyFlashAlert(propertyElementId, true)
      const propertyElement = document.querySelector(
        `#${CSS.escape(propertyElementId)} .node-property`
      )
      const snackbar = document.getElementById('snackbar')
      snackbar.className = 'show'
      snackbar.textContent = `Not enough ${propertyElement?.textContent} in stock`
      setTimeout(function () {
        snackbar.className = snackbar.className.replace('show', '')
      }, 6000)
    })
  }

  graphComponent.invalidate()
}

/**
 * Handles the logic of selling a stock item, i.e., decreasing the stock by 1, for a given property.
 * If the stock is insufficient, displays an alert message.
 */
export function sellStock(graphComponent, portMapWrapper, propertyElementId) {
  // workaround: use master port to access master node
  const node = portMapWrapper.getMasterPort(
    buildTargetPortIdFromPropertyElementId(propertyElementId)
  )?.owner
  if (!node) return

  if (node.tag.propertyInStock(propertyElementId)) {
    node.tag.decreasePropertyStock(propertyElementId)
    node.tag.updatePropertyFlash(propertyElementId, true)
  } else {
    node.tag.updatePropertyFlashAlert(propertyElementId, true)
    const propertyElement = document.querySelector(
      `#${CSS.escape(propertyElementId)} .node-property`
    )
    const snackbar = document.getElementById('snackbar')
    snackbar.className = 'show'
    snackbar.textContent = `Not enough ${propertyElement?.textContent} in stock`
    setTimeout(function () {
      snackbar.className = snackbar.className.replace('show', '')
    }, 6000)
  }

  graphComponent.invalidate()
}
