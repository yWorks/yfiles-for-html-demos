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
 * This file provides the JSON data model for the {@link {import("./json-writer").toJSON} function.
 */

/**
 * Represents a point.
 * This representation can be auto-converted into a yFiles {@link Point}
 */
export type JSONPoint = [number, number]

/**
 * Represents a rectangle.
 * This representation can be auto-converted into a yFiles {@link Rect}
 */
export type JSONRectangle = {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Represents a rotated rectangle.
 * This representation can be auto-converted into a yFiles {@link OrientedRectangle}
 */
export type JSONOrientedRectangle = {
  anchorX: number
  anchorY: number
  width: number
  height: number
  upX: number
  upY: number
}

/**
 * The type of node IDs.
 */
export type NodeID = string | number

/**
 * Represents the data of a label.
 */
export type JSONLabel = {
  text: string
  layout?: JSONOrientedRectangle
  layoutParameter?: Record<string, unknown>
}

/**
 * Represents the data of a node.
 */
export type JSONNode = {
  id: NodeID
  parentId?: NodeID
  isGroup?: boolean
  layout?: JSONRectangle
  center?: JSONPoint
  labels?: JSONLabel[]
  labelTexts?: string[]
  data?: any
}

/**
 * Represents the data of an edge.
 */
export type JSONEdge = {
  source: NodeID
  target: NodeID
  sourcePort?: JSONPoint
  targetPort?: JSONPoint
  sourcePortParameter?: string
  targetPortParameter?: string
  bends?: JSONPoint[]
  labels?: JSONLabel[]
  data?: any
}

/**
 * Represents the data of a graph.
 */
export type JSONGraph = {
  nodeList: JSONNode[]
  edgeList: JSONEdge[]
}
