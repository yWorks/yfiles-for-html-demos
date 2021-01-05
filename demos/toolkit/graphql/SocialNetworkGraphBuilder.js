/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { GraphBuilder } from 'yfiles'

/**
 * A {@link GraphBuilder} that is tailored towards the social network use case in this demo.
 */
export class SocialNetworkGraphBuilder {
  constructor(graph) {
    this.$persons = []
    this.$seen = new Set()
    this.$graphBuilder = new GraphBuilder(graph)
    // create empty NodesSources whose data will be set on updateGraph
    this.$nodesSource = this.$graphBuilder.createNodesSource({
      data: [],
      id: 'id',
      labels: ['name']
    })
    this.$edgesSource = this.$graphBuilder.createEdgesSource([], 'from', 'to')
  }

  /**
   * Clears the graph.
   */
  clear() {
    this.$persons = []
    this.updateGraph()
  }

  /**
   * Adds the given persons to the graph.
   * @param {Array} persons The persons that should be added
   * @return {IEnumerable<INode>} The newly created nodes
   */
  addPersons(persons) {
    for (const person of persons) {
      this.$addPerson(person)
    }
    this.$seen.clear()

    const existingNodes = this.$graphBuilder.graph.nodes.toList()
    this.updateGraph()
    return this.$graphBuilder.graph.nodes.filter(node => !existingNodes.includes(node))
  }

  /**
   * Helper method to add a person to the graph in which we make sure to not add the same person
   * multiple times.
   * @param {object} newPerson The person that should be added
   * @return {object} The newly added or existing person
   */
  $addPerson(newPerson) {
    const existingPerson = this.$persons.find(p => p.id === newPerson.id)

    if (this.$seen.has(newPerson)) {
      return existingPerson
    }

    this.$seen.add(newPerson)

    if (newPerson.friends) {
      newPerson.friends = newPerson.friends.map(friend => this.$addPerson(friend))
    } else {
      newPerson.friends = []
    }

    if (existingPerson) {
      existingPerson.friends = Array.from(new Set(existingPerson.friends.concat(newPerson.friends)))
      existingPerson.icon = existingPerson.icon || newPerson.icon
      existingPerson.name = existingPerson.name || newPerson.name
      existingPerson.friendsCount = existingPerson.friendsCount || newPerson.friendsCount
      return existingPerson
    } else {
      this.$persons.push(newPerson)
      return newPerson
    }
  }

  /**
   * Updates the diagram with the help of the {@link GraphBuilder}.
   */
  updateGraph() {
    this.$graphBuilder.setData(this.$nodesSource, this.$persons)
    this.$graphBuilder.setData(this.$edgesSource, this.createEdgesSource())
    this.$graphBuilder.updateGraph()
  }

  /**
   * Creates the edges for the persons that are currently in the graph.
   * @return {[]} A list of connections
   */
  createEdgesSource() {
    const edges = []

    this.$persons.forEach(person => {
      person.friends.forEach(friend => {
        const from = Math.min(person.id, friend.id)
        const to = Math.max(person.id, friend.id)

        if (!edges.some(e => e.from === from && e.to === to)) {
          edges.push({ from, to })
        }
      })
    })

    return edges
  }
}
