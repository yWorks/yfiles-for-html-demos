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
import { IEnumerable } from 'yfiles'

/**
 * @param {!GraphBuilder} graphBuilder
 * @returns {!NodesSource.<object>}
 */
export function createNodesSourceFromArray(graphBuilder) {
  const nodeData = [{ id: '00' }, { id: '01' }, { id: '02' }]

  // nodes source for the turquoise nodes
  const nodesSource = graphBuilder.createNodesSource(nodeData, (item) => item.id)

  return nodesSource
}

/**
 * @param {!GraphBuilder} graphBuilder
 * @returns {!NodesSource.<object>}
 */
export function createNodesSourceFromIEnumerable(graphBuilder) {
  const nodeData = IEnumerable.from([{ id: '10' }, { id: '11' }, { id: '12' }])

  // nodes source for the blue nodes
  const nodesSource = graphBuilder.createNodesSource(nodeData, (item) => item.id)

  return nodesSource
}

/**
 * @param {!GraphBuilder} graphBuilder
 * @returns {!NodesSource.<object>}
 */
export function createNodesSourceFromMap(graphBuilder) {
  const nodeData = new Map()
  nodeData.set('node1', { id: '30' })
  nodeData.set('node2', { id: '31' })
  nodeData.set('node3', { id: '32' })

  // nodes source for the red nodes
  const nodesSource = graphBuilder.createNodesSource(nodeData, (item, key) => item.id)

  return nodesSource
}

/**
 * @param {!GraphBuilder} graphBuilder
 * @returns {!NodesSource.<object>}
 */
export function createNodesSourceFromObject(graphBuilder) {
  const nodeData = {
    node1: { id: '20' },
    node2: { id: '21' },
    node3: { id: '22' }
  }

  // nodes source for the orange nodes
  const nodesSource = graphBuilder.createNodesSource(nodeData, (item, name) => item.id)

  return nodesSource
}

/**
 * @param {!GraphBuilder} graphBuilder
 * @returns {!NodesSource.<object>}
 */
export function createNodesSourceFromGenerator(graphBuilder) {
  const limit = 3
  function* nodes() {
    for (let i = 0; i < limit; i++) {
      yield { id: `4${i}` }
    }
  }

  // nodes source for the brown nodes
  const nodesSource = graphBuilder.createNodesSource(nodes, (item) => item.id)

  return nodesSource
}
