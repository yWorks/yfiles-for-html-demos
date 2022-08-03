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
import { IEdge, IGraph, IListEnumerable, INode, List } from 'yfiles'
import { ProcessItemVisual } from './ProcessItemVisual.js'
import { HeatData } from './HeatData.js'

/**
 * @param {!IGraph} graph
 * @param {!INode} startNode
 * @returns {?IEdge}
 */
function getRandomOutEdge(graph, startNode) {
  const probabilitySum = graph.outEdgesAt(startNode).sum(edge => edge.tag.probability)
  let value = Math.random() * probabilitySum
  return graph.outEdgesAt(startNode).find(edge => {
    value -= edge.tag.probability
    return value <= 0
  })
}

/**
 * @param {!IGraph} graph
 * @param {!ProcessItemVisual} processItemVisual
 * @returns {number}
 */
export function simulateRandomWalks(graph, processItemVisual) {
  function addHeat(heat, value, from, to) {
    for (let i = from; i < to; i += 0.1) {
      heat.addValue(i, value * 0.3)
    }
  }

  function nextInt(max) {
    return Math.floor(Math.random() * max)
  }

  function getRandom(list) {
    if (list.size > 0) {
      return list.get(nextInt(list.size))
    } else {
      return null
    }
  }

  let maxTime = 1

  const simulationCount = graph.nodes.size * 30

  for (let i = 0; i < simulationCount; i++) {
    const size = Math.random() * 3 + 5
    let time = Math.random() * 10
    const weight = size / 8
    const traversalDuration = Math.random() * 0.2 + 0.5
    const color = traversalDuration / 4 + 0.4
    let startNode = getRandom(graph.nodes.filter(node => graph.inDegree(node) === 0).toList())
    if (startNode) {
      startNode.tag.heat.addValue(time, weight)
      let maxLength = graph.edges.size * 2
      while (maxLength > 0) {
        if (graph.degree(startNode) > 0) {
          const nextEdge = getRandomOutEdge(graph, startNode)
          if (nextEdge === null) {
            break
          }
          processItemVisual.addItem(
            nextEdge,
            nextEdge.sourceNode !== startNode,
            time,
            time + traversalDuration,
            size,
            color
          )
          addHeat(nextEdge.tag.heat, weight, time, time + traversalDuration)

          const pause = Math.random() * startNode.tag.duration

          startNode = nextEdge.opposite(startNode)
          addHeat(
            startNode.tag.heat,
            weight,
            time + traversalDuration,
            time + traversalDuration + pause
          )
          time += traversalDuration + pause
        }
        maxLength--
      }
    }
    maxTime = Math.max(time, maxTime)
  }
  return maxTime
}
