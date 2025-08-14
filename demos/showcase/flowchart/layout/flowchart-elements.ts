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
// This file provides type constants and corresponding isXYZType() methods for Flowchart symbols.
// These constants and methods are used by FlowchartLayout and its associated classes to identify
// specific types of nodes and handle them appropriately.

import {
  EdgeDataKey,
  type LayoutEdge,
  type LayoutGraph,
  type LayoutNode,
  NodeDataKey
} from '@yfiles/yfiles'

/**
 * {@link IMapper} key used to specify the flowchart-specific type of each node.
 * Valid are all node type constants specified below.
 */
export const NODE_TYPE_DATA_KEY = new NodeDataKey<number>('FlowchartLayout.NODE_TYPE_DATA_KEY')

/**
 * {@link IMapper} key used to specify the flowchart-specific type of each edge.
 * Valid are all edge type constants specified below.
 */
export const EDGE_TYPE_DATA_KEY = new EdgeDataKey<number>('FlowchartLayout.EDGE_TYPE_DATA_KEY')

export enum MultiPageNodeType {
  Invalid = 0,
  Event = 1,
  StartEvent = 7,
  EndEvent = 9,
  Decision = 2,
  Process = 3,
  Group = 8,
  Annotation = 10,
  Pool = 12,
  Data = 11
}

export enum MultiPageEdgeType {
  Invalid = 0,
  SequenceFlow = 4,
  MessageFlow = 5,
  Association = 6
}

/**
 * Returns true for activity nodes.
 * For Flowcharts, these are Process, Data, and Group. For BPMN, these are Task and
 * Sub-Process.
 */
export function isActivity(graph: LayoutGraph, node: LayoutNode): boolean {
  const type = getNodeType(graph, node)
  return (
    type === MultiPageNodeType.Process ||
    type === MultiPageNodeType.Data ||
    type === MultiPageNodeType.Group
  )
}

/**
 * Returns true for group nodes.
 * For BPMN, this is Sub-Process.
 */
export function isGroup(graph: LayoutGraph, node: LayoutNode): boolean {
  return getNodeType(graph, node) === MultiPageNodeType.Group
}

/**
 * Returns true for annotation nodes.
 */
export function isAnnotation(graph: LayoutGraph, node: LayoutNode): boolean {
  return getNodeType(graph, node) === MultiPageNodeType.Annotation
}

/**
 * Returns true for event nodes.
 * For Flowchart, these are start and terminator, delay, display, manual operation and
 * preparation. For BPMN, these are start, end and other events.
 */
export function isEvent(graph: LayoutGraph, node: LayoutNode): boolean {
  const type = getNodeType(graph, node)
  return (
    type === MultiPageNodeType.StartEvent ||
    type === MultiPageNodeType.Event ||
    type === MultiPageNodeType.EndEvent
  )
}

/**
 * Returns true for start event nodes.
 */
export function isStartEvent(graph: LayoutGraph, node: LayoutNode): boolean {
  return getNodeType(graph, node) === MultiPageNodeType.StartEvent
}

export function isUndefined(graph: LayoutGraph, edge: LayoutEdge): boolean {
  const type = getEdgeType(graph, edge)
  return !type || type === MultiPageEdgeType.Invalid
}

export function isRegularEdge(graph: LayoutGraph, edge: LayoutEdge): boolean {
  return getEdgeType(graph, edge) === MultiPageEdgeType.SequenceFlow
}

export function isMessageFlow(graph: LayoutGraph, edge: LayoutEdge): boolean {
  return getEdgeType(graph, edge) === MultiPageEdgeType.MessageFlow
}

export function getEdgeType(graph: LayoutGraph, edge: LayoutEdge): number {
  const edgeTypeDataMap = graph.context.getItemData(EDGE_TYPE_DATA_KEY)
  return edgeTypeDataMap === null ? MultiPageEdgeType.Invalid : edgeTypeDataMap.get(edge)!
}

function getNodeType(graph: LayoutGraph, node: LayoutNode): number {
  const nodeTypeDataMap = graph.context.getItemData(NODE_TYPE_DATA_KEY)
  return nodeTypeDataMap === null ? MultiPageNodeType.Invalid : nodeTypeDataMap.get(node)!
}
