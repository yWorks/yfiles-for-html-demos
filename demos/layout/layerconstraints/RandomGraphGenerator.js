/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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

/* eslint-disable no-continue */

define(['yfiles/view-component'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * A class that creates random graphs. The size of the graph and other options  may be specified.
   * These options influence the properties of the created graph.
   */
  class RandomGraphGenerator {
    /**
     * Creates a new instance of RandomGraphGenerator.
     * @param {object} config
     */
    constructor(config) {
      this.$nodeCreator = config.nodeCreator ? config.nodeCreator : graph => graph.createNode()
      this.$nodeCount = config.$nodeCount || 30
      this.$edgeCount = config.$edgeCount || 40
      this.$allowSelfLoops = config.$allowSelfLoops
      this.$allowCycles = config.$allowCycles
      this.$allowMultipleEdges = config.$allowMultipleEdges
    }

    /**
     * Gets or sets the callback that is responsible for creating a new node.
     * @return {function(IInputModeContext, IGraph, Point, INode)}
     */
    get nodeCreator() {
      return this.$nodeCreator
    }

    /**
     * Gets or sets the callback that is responsible for creating a new node.
     * @param {function(IInputModeContext, IGraph, Point, INode)} value
     */
    set nodeCreator(value) {
      this.$nodeCreator = value
    }

    /**
     * Gets or sets the node count of the graph to be generated. The default value is 30.
     * @return {number}
     */
    get nodeCount() {
      return this.$nodeCount
    }

    /**
     * Gets or sets the node count of the graph to be generated. The default value is 30.
     * @param {number} value
     */
    set nodeCount(value) {
      this.$nodeCount = value
    }

    /**
     * Gets or sets the edge count of the graph to be generated. The default value is 40.
     * If the edge count is higher than it is theoretically possible by the generator options set, then the highest
     * possible edge count is applied instead.
     * @return {number}
     */
    get edgeCount() {
      return this.$edgeCount
    }

    /**
     * Gets or sets the edge count of the graph to be generated. The default value is 40.
     * If the edge count is higher than it is theoretically possible by the generator options set, then the highest
     * possible edge count is applied instead.
     * @param {number} value
     */
    set edgeCount(value) {
      this.$edgeCount = value
    }

    /**
     * Whether or not to allow the generation of self-loops, i.e. edges with same source and target nodes.
     * If allowed it still could happen by chance that the generated graph contains no self-loops.
     * By default disallowed.
     * @return {boolean}
     */
    get allowSelfLoops() {
      return this.$allowSelfLoops
    }

    /**
     * Whether or not to allow the generation of self-loops, i.e. edges with same source and target nodes.
     * If allowed it still could happen by chance that the generated graph contains no self-loops.
     * By default disallowed.
     * @param {boolean} value
     */
    set allowSelfLoops(value) {
      this.$allowSelfLoops = value
    }

    /**
     * Whether or not to allow the generation of cyclic graphs, i.e. graphs that contain directed cyclic paths.
     * If allowed it still could happen by chance that the generated graph is acyclic. By default allowed.
     * @return {boolean}
     */
    get allowCycles() {
      return this.$allowCycles
    }

    /**
     * Whether or not to allow the generation of cyclic graphs, i.e. graphs that contain directed cyclic paths.
     * If allowed it still could happen by chance that the generated graph is acyclic. By default allowed.
     * @param {boolean} value
     */
    set allowCycles(value) {
      this.$allowCycles = value
    }

    /**
     * Whether or not to allow the generation of graphs that contain multiple edges, i.e. graphs that has more than one
     * edge that connect the same pair of nodes. If allowed it still could happen by chance that the generated graph
     * does not contain multiple edges. By default disallowed.
     * @return {boolean}
     */
    get allowMultipleEdges() {
      return this.$allowMultipleEdges
    }

    /**
     * Whether or not to allow the generation of graphs that contain multiple edges, i.e. graphs that has more than one
     * edge that connect the same pair of nodes. If allowed it still could happen by chance that the generated graph
     * does not contain multiple edges. By default disallowed.
     * @param {boolean} value
     */
    set allowMultipleEdges(value) {
      this.$allowMultipleEdges = value
    }

    /**
     * Generates a new random graph that obeys the specified settings.
     * In case an existing graph is passed, it clears this graph and generates new nodes and edges for it, so that the
     * specified settings are obeyed, otherwise a new graph is created.
     * @param {yfiles.graph.IGraph} graph
     */
    generate(graph) {
      const newGraph = graph || new yfiles.graph.DefaultGraph()
      if (this.allowMultipleEdges) {
        this.generateMultipleGraph(newGraph)
      } else if (
        this.nodeCount > 1 &&
        this.edgeCount > 10 &&
        Math.log(this.nodeCount) * this.nodeCount < this.edgeCount
      ) {
        this.generateDenseGraph(newGraph)
      } else {
        this.generateSparseGraph(newGraph)
      }
    }

    /**
     * Random graph generator in case multiple edges are allowed.
     * @param {yfiles.graph.IGraph} graph
     */
    generateMultipleGraph(graph) {
      const n = this.nodeCount
      const m = this.edgeCount
      const index = new yfiles.collections.Map()

      const deg = new Array(n)
      const nodes = new Array(n)
      for (let i = 0; i < n; i++) {
        nodes[i] = this.createNode(graph)
        index[nodes[i]] = i
      }

      for (let i = 0; i < m; i++) {
        deg[Math.floor(Math.random() * n)]++
      }

      for (let i = 0; i < n; i++) {
        const v = nodes[i]
        let d = deg[i]
        while (d > 0) {
          const j = Math.floor(Math.random() * n)
          if (j === i && (!this.allowCycles || !this.allowSelfLoops)) {
            continue
          }
          graph.createEdge(v, nodes[j])
          d--
        }
      }

      if (!this.allowCycles) {
        graph.edges.forEach(edge => {
          const sourcePort = edge.sourcePort
          const targetPort = edge.targetPort
          if (index[sourcePort.owner] > index[targetPort.owner]) {
            graph.setEdgePorts(edge, targetPort, sourcePort)
          }
        })
      }
    }

    /**
     * Random graph generator for dense graphs.
     * @param {yfiles.graph.IGraph} graph
     */
    generateDenseGraph(graph) {
      graph.clear()
      const nodes = new Array(this.nodeCount)

      for (let i = 0; i < this.nodeCount; i++) {
        nodes[i] = this.createNode(graph)
      }

      RandomSupport.permutate(nodes)

      const m = Math.min(this.getMaxEdges(), this.edgeCount)
      const n = this.nodeCount

      const adder = this.allowSelfLoops && this.allowCycles ? 0 : 1

      const edgeWanted = RandomSupport.getBoolArray(this.getMaxEdges(), m)
      for (let i = 0, k = 0; i < n; i++) {
        for (let j = i + adder; j < n; j++, k++) {
          if (edgeWanted[k]) {
            if (this.allowCycles && Math.random() > 0.5) {
              graph.createEdge(nodes[j], nodes[i])
            } else {
              graph.createEdge(nodes[i], nodes[j])
            }
          }
        }
      }
    }

    /**
     * Random graph generator for sparse graphs.
     * @param {yfiles.graph.IGraph} graph
     */
    generateSparseGraph(graph) {
      graph.clear()
      const index = new yfiles.collections.Map()

      const n = this.nodeCount

      const m = Math.min(this.getMaxEdges(), this.edgeCount)

      const nodes = new Array(n)

      for (let i = 0; i < n; i++) {
        nodes[i] = this.createNode(graph)
        index[nodes[i]] = i
      }

      RandomSupport.permutate(nodes)

      let count = m
      while (count > 0) {
        const vi = Math.floor(Math.random() * n)
        const v = nodes[vi]
        const w = nodes[Math.floor(Math.random() * n)]

        if (graph.getEdge(v, w) || (v === w && (!this.allowSelfLoops || !this.allowCycles))) {
          continue
        }
        graph.createEdge(v, w)
        count--
      }

      if (!this.allowCycles) {
        graph.edges.forEach(edge => {
          const sourcePort = edge.sourcePort
          const targetPort = edge.targetPort
          if (index[sourcePort.owner] > index[targetPort.owner]) {
            graph.setEdgePorts(edge, targetPort, sourcePort)
          }
        })
      }
    }

    createNode(graph) {
      return this.nodeCreator(graph)
    }

    /**
     * Helper method that returns the maximum number of edges of a graph that still obeys the set structural
     * constraints.
     */
    getMaxEdges() {
      if (this.allowMultipleEdges) {
        return Number.MAX_SAFE_INTEGER
      }
      let maxEdges = this.nodeCount * (this.nodeCount - 1) / 2
      if (this.allowCycles && this.allowSelfLoops) {
        maxEdges += this.nodeCount
      }
      return maxEdges
    }
  }

  class RandomSupport {
    /**
     * Permutates the positions of the elements within the given array.
     * @param {Array} a
     */
    static permutate(a) {
      // forth...
      for (let i = 0; i < a.length; i++) {
        const j = Math.floor(Math.random() * a.length)
        const tmp = a[i]
        a[i] = a[j]
        a[j] = tmp
      }
      // back...
      for (let i = a.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * a.length)
        const tmp = a[i]
        a[i] = a[j]
        a[j] = tmp
      }
    }

    /**
     * Returns an array of n unique random integers that lie within the range min (inclusive) and max (exclusive).
     * If max - min &lt; n then null is returned.
     * @param {number} n
     * @param {number} min
     * @param {number} max
     * @return {Array}
     */
    static getUniqueArray(n, min, max) {
      max--

      let ret = null
      const l = max - min + 1
      if (l >= n && n > 0) {
        const accu = new Array(l)
        ret = new Array(n)
        for (let i = 0, j = min; i < l; i++, j++) {
          accu[i] = j
        }
        for (let j = 0, m = l - 1; j < n; j++, m--) {
          const r = Math.floor(Math.random() * (m + 1))
          ret[j] = accu[r]
          if (r < m) {
            accu[r] = accu[m]
          }
        }
      }
      return ret
    }

    /**
     * Returns an array of n randomly chosen boolean values of which trueCount of them are true.
     * If the requested numbers of true values is bigger than the number
     * of requested boolean values, an Exception is raised.
     * @param {number} n
     * @param {number} trueCount
     * @return {Array}
     */
    static getBoolArray(n, trueCount) {
      if (trueCount > n) {
        throw new Error(`RandomSupport.GetBoolArray( ${n}, ${trueCount} )`)
      }

      const a = RandomSupport.getUniqueArray(trueCount, 0, n)
      const b = [[]]
      if (a) {
        for (let i = 0; i < a.length; i++) {
          b[a[i]] = true
        }
      }
      return b
    }
  }

  return RandomGraphGenerator
})
