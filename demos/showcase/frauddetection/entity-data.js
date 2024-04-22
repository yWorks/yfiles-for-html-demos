/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { INode } from 'yfiles'
/**
 * Type describing entities in business data.
 * @typedef {Object} BaseEntity
 * @property {number} id
 * @property {string} type
 * @property {(string|object)} info
 */

/**
 * Type for importing business data containing strings as enter- and exit-dates.
 * @typedef {*} ImportEntity
 */

/**
 * Type for node data during runtime containing Date-type as enter and exit dates to easier comparison of dates.
 * @typedef {*} Entity
 */

/**
 * Type describing connections between entities
 * @typedef {Object} Connection
 * @property {number} from
 * @property {number} to
 * @property {string} [type]
 * @property {boolean} [fraud]
 */

/**
 * Type for a whole set of business data.
 * @typedef {Object} BusinessData
 * @property {Array.<ImportEntity>} nodesSource
 * @property {Array.<Connection>} edgesSource
 */

/**
 * Type-safe getter for entity data stored in the node tag.
 * @param {!INode} node
 * @returns {!Entity}
 */
export function getEntityData(node) {
  return node.tag
}

/**
 * Sets the given entity data to the given node.
 * @param {!INode} node
 * @param {!Entity} entity
 */
export function setEntityData(node, entity) {
  node.tag = entity
}

/**
 * Returns the information stored in the business data for the given node.
 * This is necessary for showing this information in the properties panel
 * and in the tooltip.
 * @param {!INode} node
 * @returns {!(string|object)}
 */
export function getEntityInfo(node) {
  return getEntityData(node).info
}

/**
 * Returns an object containing all the information stored in the business data
 * for the given node
 * This is necessary for showing this information in the properties panel
 * and in the tooltip.
 * @param {!INode} node
 * @returns {!Record.<string,string>}
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
 * @param {!IEdge} edge
 * @returns {!Connection}
 */
export function getConnectionData(edge) {
  return edge.tag
}

/**
 * Sets the given connection data to the given edge.
 * @param {!IEdge} edge
 * @param {!Connection} connection
 */
export function setConnectionData(edge, connection) {
  edge.tag = connection
}

/**
 * Returns the type of the connection stored in the business data for the given edge.
 * If no type exists in the data, it returns 'untyped'.
 * @param {!IEdge} edge
 * @returns {!string}
 */
export function getEdgeType(edge) {
  return getConnectionData(edge).type ?? 'untyped'
}

/**
 * Returns whether an item is tagged as fraud.
 * @param {!(INode|IEdge)} item
 * @returns {boolean}
 */
export function isFraud(item) {
  const tag = item instanceof INode ? getEntityData(item) : getConnectionData(item)
  return tag.fraud ?? false
}

/**
 * @param {!Entity} item
 * @returns {!TimeEntry}
 */
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

/**
 * @param {!IGraph} graph
 * @param {!Entity} entityData
 * @returns {?INode}
 */
export function getNode(graph, entityData) {
  return graph.nodes.find((node) => {
    const data = getEntityData(node)
    return data.id === entityData.id
  })
}
