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
import type { NodeTagProperty } from '../types'

/**
 * Represents a tag to be assigned to a node, consisting of an identifier, a layer for graph layout
 * purposes, and a typed list of properties, which holds stock and highlighting state.
 */
export class NodeTag {
  public id: string
  public layer: number
  public properties: NodeTagProperty[]

  constructor(id: string, layer: number, properties: NodeTagProperty[]) {
    this.id = id
    this.layer = layer
    this.properties = properties
  }

  public updatePropertyHighlight(propertyElementId: string, toHighlight: boolean) {
    this.properties = this.properties.map((prop: any) => {
      if (prop.elementId === propertyElementId) {
        return { ...prop, toHighlight }
      }
      return prop
    })
  }

  public updateAllPropertyHighlights(toHighlight: boolean) {
    this.properties = this.properties.map((prop: any) => ({ ...prop, toHighlight }))
  }

  public updatePropertyFlash(propertyElementId: string, toFlash: boolean) {
    this.properties = this.properties.map((prop: any) => {
      if (prop.elementId === propertyElementId) {
        return { ...prop, toFlash }
      }
      return prop
    })
  }

  public updatePropertyFlashAlert(propertyElementId: string, toFlashAlert: boolean) {
    this.properties = this.properties.map((prop: any) => {
      if (prop.elementId === propertyElementId) {
        return { ...prop, toFlashAlert }
      }
      return prop
    })
  }

  public propertyInStock(propertyElementId: string): boolean {
    const stock = this.properties.find(
      (prop: NodeTagProperty) => prop.elementId === propertyElementId
    )?.stock
    return stock !== undefined && stock > 0
  }

  public increasePropertyStock(propertyElementId: string) {
    this.properties = this.properties.map((prop: any) => {
      if (prop.elementId === propertyElementId) {
        const inStock = prop.stock + 1 > 0
        return { ...prop, toAlert: !inStock, stock: prop.stock + 1 }
      }
      return prop
    })
  }

  public decreasePropertyStock(propertyElementId: string) {
    this.properties = this.properties.map((prop: any) => {
      if (prop.elementId === propertyElementId) {
        const inStock = prop.stock - 1 > 0
        return { ...prop, toAlert: !inStock, stock: prop.stock - 1 }
      }
      return prop
    })
  }
}
