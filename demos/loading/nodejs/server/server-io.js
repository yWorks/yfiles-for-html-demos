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
const {
  BaseClass,
  INodeInsetsProvider,
  IMapper,
  Insets,
  IGraph,
  DefaultGraph,
  Mapper
} = require('yfiles-umd')
const jsonIO = require('./JsonIO')

class MapperInsetsProvider extends BaseClass(INodeInsetsProvider) {
  /**
   * Creates a new instance that uses the insets of the given mapper.
   * @param {IMapper} insetsMapper
   */
  constructor(insetsMapper) {
    super()
    this.insetsMapper = insetsMapper
  }

  /**
   * Returns the insets for the given item.
   * @param {T} item
   * @returns {Insets}
   */
  getInsets(item) {
    return this.insetsMapper.get(item)
  }
}

/**
 * Returns a JSON object that describes the structure and layout information of the given graph.
 *
 * @param graph {IGraph} The graph.
 * @returns {object} A JSON object that describes the structure and layout information of the given graph.
 */
const write = function(graph) {
  const jsonWriter = new jsonIO.JSONWriter()
  jsonWriter.nodeIdProvider = n => n.tag.id

  // In addition to the default data, we need the insets for the layout calculation
  jsonWriter.nodeDataCreated = (data, node, graph) => {
    const insetsProvider = node.lookup(INodeInsetsProvider.$class)
    if (insetsProvider !== null) {
      const insets = insetsProvider.getInsets(node)
      data.insets = {
        top: insets.top,
        right: insets.right,
        bottom: insets.bottom,
        left: insets.left
      }
    }
  }

  return jsonWriter.write(graph)
}

/**
 * Creates a IGraph from JSON data.
 *
 * @param {JSONGraph} jsonGraph the JSON representation of the graph
 * @returns {IGraph}
 */
const read = function(jsonGraph) {
  const graph = new DefaultGraph()

  // In addition to the default data, we get the insets from the layout calculation
  const insetsMapper = new Mapper({
    defaultValue: Insets.EMPTY
  })
  graph.decorator.nodeDecorator.insetsProviderDecorator.setImplementation(
    new MapperInsetsProvider(insetsMapper)
  )

  const jsonReader = new jsonIO.JSONReader()
  jsonReader.nodeIdProvider = n => n.tag.id
  jsonReader.nodeCreated = (node, nodeData) => {
    const insets = nodeData.insets
    if (insets) {
      insetsMapper.set(node, new Insets(insets.left, insets.top, insets.right, insets.bottom))
    }
  }

  jsonReader.read(graph, jsonGraph)

  return graph
}

module.exports = { write, read }
