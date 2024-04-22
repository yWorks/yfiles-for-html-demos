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
import { ConnectedComponents, CycleEdges, Mapper } from 'yfiles'
import {
  getConnectionData,
  getEntityData,
  setConnectionData,
  setEntityData
} from '../entity-data.js'

/**
 * Scans the graph for cycles that only contain persons, phone numbers and addresses.
 * @param {!GraphComponent} graphComponent
 * @returns {!Array.<INode>}
 */
export function detectBankFraud(graphComponent) {
  const graph = graphComponent.graph

  const fraudsterNodes = []

  resetTags(graphComponent)

  // run the algorithm on the filtered graph
  const result = new CycleEdges({
    directed: false,
    // only consider "non-bank branch" nodes to avoid finding cycles other than fraud cycles
    subgraphNodes: (node) => getEntityData(node).type !== 'Bank Branch'
  }).run(graph)

  for (const edge of result.edges) {
    const source = edge.sourceNode
    const target = edge.targetNode
    const sourceEntityData = getEntityData(source)
    const targetEntityData = getEntityData(target)
    const sourceType = sourceEntityData.type
    const targetType = targetEntityData.type

    if (
      (sourceType === 'Account Holder' ||
        sourceType === 'Phone Number' ||
        sourceType === 'Address') &&
      (targetType === 'Account Holder' || targetType === 'Phone Number' || targetType === 'Address')
    ) {
      updateNodeFraudTag(source, true)
      updateNodeFraudTag(target, true)
      fraudsterNodes.push(source)
      fraudsterNodes.push(target)
      updateEdgeFraudTag(edge, true)
    }
  }

  return fraudsterNodes
}

/**
 * Checks in each connected component if the same persons are involved in more than one accident
 * and then checks if some of these persons have the same lawyer or doctor.
 * @param {!GraphComponent} graphComponent
 * @returns {!Array.<INode>}
 */
export function detectInsuranceFraud(graphComponent) {
  const graph = graphComponent.graph
  resetTags(graphComponent)

  const fraudsterNodes = []
  const result = new ConnectedComponents().run(graph)
  result.components.forEach((component) => {
    const node2Accidents = new Mapper()

    let involvedAccidents = 0
    component.nodes.forEach((node) => {
      const entityData = getEntityData(node)
      if (entityData.type === 'Accident') {
        involvedAccidents++
      }
    })

    // if the person is involved in only one accident => no fraud
    if (involvedAccidents > 1) {
      const suspiciousPersons = []
      const lawyers = []
      const doctors = []
      const lawyerSet = new Set()
      const doctorSet = new Set()

      for (const node of component.nodes) {
        const entityData = getEntityData(node)
        if (entityData.type === 'Participant') {
          const accidents = []

          // determine if the person is involved in more than one accident
          for (const edge of graph.outEdgesAt(node)) {
            const targetNode = edge.targetNode

            const targetEntityData = getEntityData(targetNode)
            if (targetEntityData.type === 'Car') {
              const accident = graphComponent.graph.outEdgesAt(targetNode).at(0)
              if (accident) {
                accidents.push(accident)
              }
            } else if (targetEntityData.type === 'Accident') {
              accidents.push(targetNode)
            }
          }

          // if the person is involved in all accidents of the component => fraud
          if (accidents.length === involvedAccidents) {
            node2Accidents.set(node, accidents)
            suspiciousPersons.push(node)

            for (const edge of graph.inEdgesAt(node)) {
              const oppositeNode = edge.sourceNode

              const oppositeEntityData = getEntityData(oppositeNode)
              if (oppositeEntityData.type === 'Lawyer') {
                if (!lawyerSet.has(oppositeNode)) {
                  lawyers.push(oppositeNode)
                }
                lawyerSet.add(oppositeNode)
              } else if (oppositeEntityData.type === 'Doctor') {
                if (!doctorSet.has(oppositeNode)) {
                  doctors.push(oppositeNode)
                }
                doctorSet.add(oppositeNode)
              }
            }
          }
        }
      }

      // if the suspicious persons share lawyers or doctors => fraud
      if (suspiciousPersons.length > lawyers.length || suspiciousPersons.length > doctors.length) {
        for (const person of suspiciousPersons) {
          updateNodeFraudTag(person, true)
          fraudsterNodes.push(person)

          graph.edgesAt(person).forEach((edge) => {
            updateEdgeFraudTag(edge, true)
          })
        }

        for (const doctor of doctors) {
          if (graph.edgesAt(doctor).size > 1) {
            updateNodeFraudTag(doctor, true)
            fraudsterNodes.push(doctor)
          }
        }

        for (const lawyer of lawyers) {
          if (graph.edgesAt(lawyer).size > 1) {
            updateNodeFraudTag(lawyer, true)
            fraudsterNodes.push(lawyer)
          }
        }
      }
    }
  })
  return fraudsterNodes
}

/**
 * Updates explicitly the node tags so that the node styles are updated through the
 * `NodeTagChanged` event.
 * This is necessary if WebGL rendering is applied.
 * @param {!INode} node
 * @param {boolean} isFraud
 */
function updateNodeFraudTag(node, isFraud) {
  const entityData = getEntityData(node)
  setEntityData(node, { ...entityData, fraud: isFraud })
}

/**
 * Updates explicitly the edge tags so that the edge styles are updated through the
 * `EdgeTagChanged` event.
 * This is necessary if WebGL rendering is applied.
 * @param {!IEdge} edge
 * @param {boolean} isFraud
 */
function updateEdgeFraudTag(edge, isFraud) {
  const connectionData = getConnectionData(edge)
  setConnectionData(edge, { ...connectionData, fraud: isFraud })
}

/**
 * Resets the tags of nodes and edges to no-fraud.
 * @param {!GraphComponent} graphComponent
 */
function resetTags(graphComponent) {
  const graph = graphComponent.graph
  graph.nodes.forEach((node) => {
    updateNodeFraudTag(node, false)
  })
  graph.edges.forEach((edge) => {
    updateEdgeFraudTag(edge, false)
  })
}
