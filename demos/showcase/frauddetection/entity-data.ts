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
import { type IEdge, type IGraph, INode } from 'yfiles'
import type { TimeEntry } from './timeline/Timeline'

/**
 * Type describing entities in business data.
 */
type BaseEntity = {
  id: number
  type: string
  info: string | { [key: string]: string }
}

/**
 * Type for importing business data containing strings as enter- and exit-dates.
 */
export type ImportEntity = BaseEntity & { enter: string[] | string; exit: string[] | string }

/**
 * Type for node data during runtime containing Date-type as enter and exit dates to easier comparison of dates.
 */
export type Entity = BaseEntity & { enter: Date[]; exit: Date[]; fraud?: boolean }

/**
 * Type describing connections between entities
 */
export type Connection = {
  from: number
  to: number
  type?: string
  fraud?: boolean
}

/**
 * Type for a whole set of business data.
 */
export type BusinessData = {
  nodesSource: ImportEntity[]
  edgesSource: Connection[]
}

/**
 * Type-safe getter for entity data stored in the node tag.
 */
export function getEntityData(node: INode): Entity {
  return node.tag as Entity
}

/**
 * Sets the given entity data to the given node.
 */
export function setEntityData(node: INode, entity: Entity): void {
  node.tag = entity
}

/**
 * Returns the information stored in the business data for the given node.
 * This is necessary for showing this information in the properties panel
 * and in the tooltip.
 */
export function getEntityInfo(node: INode): string | { [key: string]: string } {
  return getEntityData(node).info
}

/**
 * Returns an object containing all the information stored in the business data
 * for the given node
 * This is necessary for showing this information in the properties panel
 * and in the tooltip.
 */
export function getInfoMap(node: INode): Record<string, string> {
  const entity = getEntityData(node)
  const info = getEntityInfo(node)
  if (typeof info == 'string') {
    return { info: info }
  } else {
    const records: Record<string, string> = {}
    Object.keys(info).forEach((key: string) => {
      let value: string = info[key]
      if (Array.isArray(value)) {
        value = value[0] as string
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
export function getConnectionData(edge: IEdge): Connection {
  return edge.tag as Connection
}

/**
 * Sets the given connection data to the given edge.
 */
export function setConnectionData(edge: IEdge, connection: Connection): void {
  edge.tag = connection
}

/**
 * Returns the type of the connection stored in the business data for the given edge.
 * If no type exists in the data, it returns 'untyped'.
 */
export function getEdgeType(edge: IEdge): string {
  return getConnectionData(edge).type ?? 'untyped'
}

/**
 * Returns whether an item is tagged as fraud.
 */
export function isFraud(item: INode | IEdge): boolean {
  const tag = item instanceof INode ? getEntityData(item) : getConnectionData(item)
  return tag.fraud ?? false
}

export function getTimeEntry(item: Entity): TimeEntry {
  const ni = item as Entity

  if (ni.enter.length === 1 && ni.exit.length === 1) {
    return { start: ni.enter[0].getTime(), end: ni.exit[0].getTime() }
  } else {
    return ni.enter.map((enter, index) => ({
      start: enter.getTime(),
      end: ni.exit[index].getTime()
    }))
  }
}

export function getNode(graph: IGraph, entityData: Entity): INode | null {
  return graph.nodes.find((node) => {
    const data = getEntityData(node)
    return data.id === entityData.id
  })
}
