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
  ConnectedComponents,
  CycleEdges,
  FilteredGraphWrapper,
  GraphComponent,
  IGraph,
  Mapper
} from 'yfiles'

/**
 * A simple fraud detection that scans for cycles where persons share phone numbers and addresses.
 */
export default class FraudDetection {
  /**
   * Creates a new FraudDetection.
   * @param {GraphComponent} graphComponent The graph component which contains the graph which is checked
   *   for fraud.
   */
  constructor(graphComponent) {
    this.graphComponent = graphComponent
  }

  /** @type {boolean} */
  set bankFraud(value) {
    this.bankFraudField = value
  }

  /** @type {boolean} */
  get bankFraud() {
    return this.bankFraudField
  }

  detectFraud() {
    if (this.bankFraud) {
      return this.detectBankFraud()
    }
    return this.detectInsuranceFraud()
  }

  /**
   * Scans the graph for cycles that only contain persons, phone numbers and addresses.
   */
  detectBankFraud() {
    const graph = this.graphComponent.graph

    const highlightPaintManager = this.graphComponent.highlightIndicatorManager
    highlightPaintManager.clearHighlights()

    const fraudsterNodes = []

    resetTags(graph)

    // hide bank branch nodes to avoid finding cycles other than fraud cycles
    const filteredGraph = new FilteredGraphWrapper(
      graph,
      node => node.tag.type !== 'Bank Branch',
      edge => true
    )

    // run the algorithm on the filtered graph
    const result = new CycleEdges({ directed: false }).run(filteredGraph)
    result.edges.forEach(edge => {
      const source = edge.sourceNode
      const target = edge.targetNode
      const sourceType = source.tag.type
      const targetType = target.tag.type

      if (
        (sourceType === 'Account Holder' ||
          sourceType === 'Phone Number' ||
          sourceType === 'Address') &&
        (targetType === 'Account Holder' ||
          targetType === 'Phone Number' ||
          targetType === 'Address')
      ) {
        source.tag.fraud = true
        target.tag.fraud = true
        fraudsterNodes.push(source)
        fraudsterNodes.push(target)
        if (edge.tag) {
          edge.tag.fraud = true
        }
      }
    })
    // dispose the filtered graph
    filteredGraph.dispose()
    return fraudsterNodes
  }

  /**
   * Checks in each connected component if the same persons are involved in more than one accidents
   * and then checks if some of these persons have the same lawyer or doctor.
   */
  detectInsuranceFraud() {
    const graph = this.graphComponent.graph
    resetTags(graph)

    const fraudsterNodes = []
    const result = new ConnectedComponents().run(graph)
    result.components.forEach(component => {
      const node2Accidents = new Mapper()

      let involvedAccidents = 0
      component.nodes.forEach(node => {
        if (node.tag.type === 'Accident') {
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

        component.nodes.forEach(node => {
          if (node.tag.type === 'Participant') {
            const accidents = []

            // determine if the person is involved in more than one accidents
            graph.outEdgesAt(node).forEach(edge => {
              const targetNode = edge.targetNode

              if (targetNode.tag.type === 'Car') {
                const accident = this.graphComponent.graph.outEdgesAt(targetNode).firstOrDefault()
                if (accident) {
                  accidents.push(accident)
                }
              } else if (targetNode.tag.type === 'Accident') {
                accidents.push(targetNode)
              }
            })

            // if the person is involved in all accidents of the component => fraud
            if (accidents.length === involvedAccidents) {
              node2Accidents.set(node, accidents)
              suspiciousPersons.push(node)

              graph.inEdgesAt(node).forEach(edge => {
                const oppositeNode = edge.sourceNode

                if (oppositeNode.tag.type === 'Lawyer') {
                  if (lawyerSet.add(oppositeNode)) {
                    lawyers.push(oppositeNode)
                  }
                } else if (oppositeNode.tag.type === 'Doctor') {
                  if (doctorSet.add(oppositeNode)) {
                    doctors.push(oppositeNode)
                  }
                }
              })
            }
          }
        })

        // if the suspicious persons share lawyers or doctors => fraud
        if (
          suspiciousPersons.length > lawyers.length ||
          suspiciousPersons.length > doctors.length
        ) {
          for (let j = 0; j < suspiciousPersons.length; j++) {
            const person = suspiciousPersons[j]
            person.tag.fraud = true
            fraudsterNodes.push(person)

            graph.edgesAt(person).forEach(edge => {
              edge.tag.fraud = true
            })
          }

          for (let j = 0; j < doctors.length; j++) {
            const doctor = doctors[j]
            if (graph.edgesAt(doctor).size > 1) {
              doctor.tag.fraud = true
              fraudsterNodes.push(doctor)
            }
          }

          for (let j = 0; j < lawyers.length; j++) {
            const lawyer = lawyers[j]
            if (graph.edgesAt(lawyer).size > 1) {
              lawyer.tag.fraud = true
              fraudsterNodes.push(lawyer)
            }
          }
        }
      }
    })
    return fraudsterNodes
  }
}

/**
 * Resets the tags of nodes and edges to no fraud.
 * @param {IGraph} graph
 */
function resetTags(graph) {
  const nodes = graph.nodes
  const edges = graph.edges
  nodes.forEach(node => {
    if (node.tag) {
      node.tag.fraud = false
    }
  })
  edges.forEach(edge => {
    if (edge.tag) {
      edge.tag.fraud = false
    }
  })
}
