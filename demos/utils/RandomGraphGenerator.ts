/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { HashMap, IGraph, INode } from '@yfiles/yfiles'

/**
 * A class that creates random graphs. The size of the graph and other options  may be specified.
 * These options influence the properties of the created graph.
 */
export class RandomGraphGenerator {
  /** The callback that is responsible for creating a new node. */
  nodeCreator: (graph: IGraph) => INode
  /** The node count of the graph to be generated. The default value is 30. */
  nodeCount: number
  /**
   * The edge count of the graph to be generated. The default value is 40.
   * If the edge count is higher than it is theoretically possible by the generator options set, then the highest
   * possible edge count is applied instead.
   */
  edgeCount: number
  /**
   * Whether or not to allow the generation of self-loops, i.e. edges with same source and target nodes.
   * If allowed it still could happen by chance that the generated graph contains no self-loops.
   * By default disallowed.
   */
  allowSelfLoops: boolean
  /**
   * Whether or not to allow the generation of cyclic graphs, i.e. graphs that contain directed cyclic paths.
   * If allowed it still could happen by chance that the generated graph is acyclic. By default allowed.
   */
  allowCycles: boolean
  /**
   * Whether or not to allow the generation of graphs that contain multiple edges, i.e. graphs that has more than one
   * edge that connect the same pair of nodes. If allowed it still could happen by chance that the generated graph
   * does not contain multiple edges. By default disallowed.
   */
  allowMultipleEdges: boolean

  /**
   * Creates a new instance of RandomGraphGenerator.
   */
  constructor(config: {
    nodeCreator?: (graph: IGraph) => INode
    $nodeCount?: number
    $edgeCount?: number
    $allowCycles?: boolean
    $allowSelfLoops?: boolean
    $allowMultipleEdges?: boolean
  }) {
    this.nodeCreator = config.nodeCreator || ((graph: IGraph): INode => graph.createNode())
    this.nodeCount = config.$nodeCount || 30
    this.edgeCount = config.$edgeCount || 40
    this.allowSelfLoops = config.$allowSelfLoops || false
    this.allowCycles = config.$allowCycles || false
    this.allowMultipleEdges = config.$allowMultipleEdges || false
  }

  /**
   * Generates a new random graph that obeys the specified settings.
   */
  generate(graph: IGraph): void {
    if (this.allowMultipleEdges) {
      this.generateMultipleGraph(graph)
    } else if (
      this.nodeCount > 1 &&
      this.edgeCount > 10 &&
      Math.log(this.nodeCount) * this.nodeCount < this.edgeCount
    ) {
      this.generateDenseGraph(graph)
    } else {
      this.generateSparseGraph(graph)
    }
  }

  /**
   * Random graph generator in case multiple edges are allowed.
   */
  generateMultipleGraph(graph: IGraph): void {
    const n = this.nodeCount
    const m = this.edgeCount
    const index = new HashMap<INode, number>()

    const deg = new Array(n)
    const nodes = new Array(n)
    for (let i = 0; i < n; i++) {
      nodes[i] = this.createNode(graph)
      index.set(nodes[i], i)
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
      graph.edges.forEach((edge) => {
        const sourcePort = edge.sourcePort
        const targetPort = edge.targetPort
        if (index.get(sourcePort.owner as INode)! > index.get(targetPort.owner as INode)!) {
          graph.reverse(edge)
        }
      })
    }
  }

  /**
   * Random graph generator for dense graphs.
   */
  generateDenseGraph(graph: IGraph): void {
    graph.clear()
    const nodes = new Array(this.nodeCount)

    for (let i = 0; i < this.nodeCount; i++) {
      nodes[i] = this.createNode(graph)
    }

    permutate(nodes)

    const m = Math.min(this.getMaxEdges(), this.edgeCount)
    const n = this.nodeCount

    const adder = this.allowSelfLoops && this.allowCycles ? 0 : 1

    const edgeWanted = getBoolArray(this.getMaxEdges(), m)
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
   */
  generateSparseGraph(graph: IGraph): void {
    graph.clear()
    const index = new HashMap<INode, number>()

    const n = this.nodeCount

    const m = Math.min(this.getMaxEdges(), this.edgeCount)

    const nodes = new Array(n)

    for (let i = 0; i < n; i++) {
      nodes[i] = this.createNode(graph)
      index.set(nodes[i], i)
    }

    permutate(nodes)

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
      graph.edges.forEach((edge) => {
        const sourcePort = edge.sourcePort
        const targetPort = edge.targetPort
        if (index.get(sourcePort.owner as INode)! > index.get(targetPort.owner as INode)!) {
          graph.reverse(edge)
        }
      })
    }
  }

  /**
   * Creates a node
   */
  createNode(graph: IGraph): INode {
    return this.nodeCreator(graph)
  }

  /**
   * Helper method that returns the maximum number of edges of a graph that still obeys the set structural
   * constraints.
   */
  getMaxEdges(): number {
    if (this.allowMultipleEdges) {
      return Number.MAX_SAFE_INTEGER
    }
    let maxEdges = (this.nodeCount * (this.nodeCount - 1)) / 2
    if (this.allowCycles && this.allowSelfLoops) {
      maxEdges += this.nodeCount
    }
    return maxEdges
  }
}

/**
 * Permutates the positions of the elements within the given array.
 */
function permutate(a: Array<any>): void {
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
 */
function getUniqueArray(n: number, min: number, max: number): number[] | null {
  max--

  let ret: number[] | null = null
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
 */
function getBoolArray(n: number, trueCount: number): boolean[] {
  if (trueCount > n) {
    throw new Error(`RandomSupport.GetBoolArray( ${n}, ${trueCount} )`)
  }

  const a = getUniqueArray(trueCount, 0, n)
  const b: boolean[] = []
  if (a) {
    for (let i = 0; i < a.length; i++) {
      b[a[i]] = true
    }
  }
  return b
}
