/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
// This file provides type constants and corresponding isXYZType() methods for Flowchart symbols.
// These constants and methods are used by FlowchartLayout and its associated classes to identify
// specific types of nodes and handle them appropriately.

import { EdgeDataKey, NodeDataKey } from '@yfiles/yfiles'

/**
 * {@link IMapper} key used to specify the flowchart-specific type of each node.
 * Valid are all node type constants specified below.
 */
export const NODE_TYPE_DATA_KEY = new NodeDataKey('FlowchartLayout.NODE_TYPE_DATA_KEY')

/**
 * {@link IMapper} key used to specify the flowchart-specific type of each edge.
 * Valid are all edge type constants specified below.
 */
export const EDGE_TYPE_DATA_KEY = new EdgeDataKey('FlowchartLayout.EDGE_TYPE_DATA_KEY')

/**
 * Returns true for activity nodes.
 * For Flowcharts, these are Process, Data, and Group. For BPMN, these are Task and
 * Sub-Process.
 */
export function isActivity(graph, node) {
  const type = getNodeType(graph, node)
  return type === 'Process' || type === 'Data' || type === 'Group'
}

/**
 * Returns true for group nodes.
 * For BPMN, this is Sub-Process.
 */
export function isGroup(graph, node) {
  return getNodeType(graph, node) === 'Group'
}

/**
 * Returns true for annotation nodes.
 */
export function isAnnotation(graph, node) {
  return getNodeType(graph, node) === 'Annotation'
}

/**
 * Returns true for event nodes.
 * For Flowchart, these are start and terminator, delay, display, manual operation and
 * preparation. For BPMN, these are start, end and other events.
 */
export function isEvent(graph, node) {
  const type = getNodeType(graph, node)
  return type === 'StartEvent' || type === 'Event' || type === 'EndEvent'
}

/**
 * Returns true for start event nodes.
 */
export function isStartEvent(graph, node) {
  return getNodeType(graph, node) === 'StartEvent'
}

export function isUndefined(graph, edge) {
  return getEdgeType(graph, edge) === 'Invalid'
}

export function isRegularEdge(graph, edge) {
  return getEdgeType(graph, edge) === 'SequenceFlow'
}

export function isMessageFlow(graph, edge) {
  return getEdgeType(graph, edge) === 'MessageFlow'
}

export function getEdgeType(graph, edge) {
  const edgeTypeDataMap = graph.context.getItemData(EDGE_TYPE_DATA_KEY)
  return edgeTypeDataMap === null ? 'Invalid' : edgeTypeDataMap.get(edge)
}

function getNodeType(graph, node) {
  const nodeTypeDataMap = graph.context.getItemData(NODE_TYPE_DATA_KEY)
  return nodeTypeDataMap === null ? 'Invalid' : nodeTypeDataMap.get(node)
}
