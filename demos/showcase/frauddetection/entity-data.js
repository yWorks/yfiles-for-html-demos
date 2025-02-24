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
import { INode } from '@yfiles/yfiles'
/**
 * Type-safe getter for entity data stored in the node tag.
 */
export function getEntityData(node) {
  return node.tag
}
/**
 * Sets the given entity data to the given node.
 */
export function setEntityData(node, entity) {
  node.tag = entity
}
/**
 * Returns the information stored in the business data for the given node.
 * This is necessary for showing this information in the properties panel
 * and in the tooltip.
 */
export function getEntityInfo(node) {
  return getEntityData(node).info
}
/**
 * Returns an object containing all the information stored in the business data
 * for the given node
 * This is necessary for showing this information in the properties panel
 * and in the tooltip.
 */
export function getInfoMap(node) {
  const entity = getEntityData(node)
  const info = getEntityInfo(node)
  if (typeof info == 'string') {
    return { info: info }
  } else {
    const records = {}
    Object.keys(info).forEach((key) => {
      let value = info[key]
      if (Array.isArray(value)) {
        value = value[0]
      }
      records[key] = value
    })
    if (entity.enter.length > 0) {
      records['Enter Date'] = entity.enter[0].toString()
    }
    if (entity.exit.length > 0) {
      records['Exit Date'] = entity.exit[0].toString()
    }
    return records
  }
}
/**
 * Type-safe getter for connection data stored in the edge tag.
 */
export function getConnectionData(edge) {
  return edge.tag
}
/**
 * Sets the given connection data to the given edge.
 */
export function setConnectionData(edge, connection) {
  edge.tag = connection
}
/**
 * Returns the type of the connection stored in the business data for the given edge.
 * If no type exists in the data, it returns 'untyped'.
 */
export function getEdgeType(edge) {
  return getConnectionData(edge).type ?? 'untyped'
}
/**
 * Returns whether an item is tagged as fraud.
 */
export function isFraud(item) {
  const tag = item instanceof INode ? getEntityData(item) : getConnectionData(item)
  return tag.fraud ?? false
}
export function getTimeEntry(item) {
  const ni = item
  if (ni.enter.length === 1 && ni.exit.length === 1) {
    return { start: ni.enter[0].getTime(), end: ni.exit[0].getTime() }
  } else {
    return ni.enter.map((enter, index) => ({
      start: enter.getTime(),
      end: ni.exit[index].getTime()
    }))
  }
}
export function getNode(graph, entityData) {
  return graph.nodes.find((node) => {
    const data = getEntityData(node)
    return data.id === entityData.id
  })
}
