/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/**
 * @param {!NodesSource.<EntityData>} nodesSource
 * @param {!GraphBuilder} graphBuilder
 * @param {!Data} data
 */
export function setDataAndUpdateGraph(nodesSource, graphBuilder, data) {
  // get the new data
  const newData = data.nodesSource.slice(0, 6)

  // assign the new data to the nodesSource
  graphBuilder.setData(nodesSource, newData)
  // tell GraphBuilder to update the graph structure
  graphBuilder.updateGraph()
}

/** @type {Set.<string>} */
let nodeTypes

/**
 * @param {!GraphBuilder} graphBuilder
 * @param {!Data} data
 * @returns {!Promise.<NodesSource.<EntityData>>}
 */
export async function createDynamicNodesSource(graphBuilder, data) {
  nodeTypes = new Set(['Corporation', 'Trust'])

  function* nodes() {
    for (const entity of data.nodesSource) {
      if (entity.type && nodeTypes.has(entity.type)) {
        yield entity
      }
    }
  }

  // create nodes source from dynamic data
  return graphBuilder.createNodesSource(nodes, 'id')
}

/**
 * @param {!GraphBuilder} graphBuilder
 */
export function updateGraph(graphBuilder) {
  // update displayed node types
  nodeTypes.delete('Corporation')
  nodeTypes.add('Branch')
  nodeTypes.add('PE_Risk')

  // since the nodesSource uses a generator function,
  // calling updateGraph is enough to update the graph structure
  graphBuilder.updateGraph()
}

/**
 * @param {!GraphBuilder} graphBuilder
 */
export function resetGraph(graphBuilder) {
  // reset node types
  nodeTypes = new Set(['Corporation', 'Trust'])
  graphBuilder.updateGraph()
}
