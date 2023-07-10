/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
 * {@link IDataProvider} key used to specify the flowchart-specific type of each node.
 * Valid are all node type constants specified below.
 */
export const NODE_TYPE_DP_KEY = 'FlowchartLayout.NODE_TYPE_DP_KEY'

/**
 * {@link IDataProvider} key used to specify the flowchart-specific type of each edge.
 * Valid are all edge type constants specified below.
 */
export const EDGE_TYPE_DP_KEY = 'FlowchartLayout.EDGE_TYPE_DP_KEY'

export /**
 * @readonly
 * @enum {number}
 */
const NodeType = {
  Invalid: 0,
  Event: 1,
  StartEvent: 7,
  EndEvent: 9,
  Decision: 2,
  Process: 3,
  Group: 8,
  Annotation: 10,
  Pool: 12,
  Data: 11
}

export /**
 * @readonly
 * @enum {number}
 */
const EdgeType = {
  Invalid: 0,
  SequenceFlow: 4,
  MessageFlow: 5,
  Association: 6
}

/**
 * Returns true for activity nodes.
 * For Flowcharts, these are Process, Data, and Group. For BPMN, these are Task and
 * Sub-Process.
 * @param {!Graph} graph
 * @param {!YNode} node
 * @returns {boolean}
 */
export function isActivity(graph, node) {
  const type = getNodeType(graph, node)
  return type === NodeType.Process || type === NodeType.Data || type === NodeType.Group
}

/**
 * Returns true for group nodes.
 * For BPMN, this is Sub-Process.
 * @param {!Graph} graph
 * @param {!YNode} node
 * @returns {boolean}
 */
export function isGroup(graph, node) {
  return getNodeType(graph, node) === NodeType.Group
}

/**
 * Returns true for annotation nodes.
 * @param {!Graph} graph
 * @param {!YNode} node
 * @returns {boolean}
 */
export function isAnnotation(graph, node) {
  return getNodeType(graph, node) === NodeType.Annotation
}

/**
 * Returns true for event nodes.
 * For Flowchart, these are start and terminator, delay, display, manual operation and
 * preparation. For BPMN, these are start, end and other events.
 * @param {!Graph} graph
 * @param {!YNode} node
 * @returns {boolean}
 */
export function isEvent(graph, node) {
  const type = getNodeType(graph, node)
  return type === NodeType.StartEvent || type === NodeType.Event || type === NodeType.EndEvent
}

/**
 * Returns true for start event nodes.
 * @param {!Graph} graph
 * @param {!YNode} node
 * @returns {boolean}
 */
export function isStartEvent(graph, node) {
  return getNodeType(graph, node) === NodeType.StartEvent
}

/**
 * @param {!Graph} graph
 * @param {!Edge} edge
 * @returns {boolean}
 */
export function isUndefined(graph, edge) {
  return getEdgeType(graph, edge) === EdgeType.Invalid
}

/**
 * @param {!Graph} graph
 * @param {!Edge} edge
 * @returns {boolean}
 */
export function isRegularEdge(graph, edge) {
  return getEdgeType(graph, edge) === EdgeType.SequenceFlow
}

/**
 * @param {!Graph} graph
 * @param {!Edge} edge
 * @returns {boolean}
 */
export function isMessageFlow(graph, edge) {
  return getEdgeType(graph, edge) === EdgeType.MessageFlow
}

/**
 * @param {!Graph} graph
 * @param {!Edge} edge
 * @returns {number}
 */
export function getEdgeType(graph, edge) {
  const dataProvider = graph.getDataProvider(EDGE_TYPE_DP_KEY)
  return dataProvider === null ? EdgeType.Invalid : dataProvider.getInt(edge)
}

/**
 * @param {!Graph} graph
 * @param {!YNode} node
 * @returns {number}
 */
function getNodeType(graph, node) {
  const dataProvider = graph.getDataProvider(NODE_TYPE_DP_KEY)
  return dataProvider === null ? NodeType.Invalid : dataProvider.getInt(node)
}
