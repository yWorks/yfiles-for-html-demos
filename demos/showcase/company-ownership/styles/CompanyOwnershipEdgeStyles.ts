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
import type { CompanyRelationshipEdge, EdgeType } from '../data-types'
import {
  Arrow,
  EdgePathLabelModel,
  type IEdgeStyle,
  LabelDefaults,
  LabelStyle,
  PolylineEdgeStyle
} from '@yfiles/yfiles'

// configures the style of the edges based on their type
const smoothingLength = 5
const typeMap: Record<EdgeType, IEdgeStyle> = {
  ['Hierarchy']: new PolylineEdgeStyle({
    stroke: '2px #1a3442',
    targetArrow: new Arrow({ fill: '#1a3442', stroke: '2px #1a3442', type: 'triangle' }),
    smoothingLength
  }),
  ['Relation']: new PolylineEdgeStyle({
    stroke: '2px dashed #f26419',
    targetArrow: new Arrow({ fill: '#f26419', stroke: '1px #f26419', type: 'triangle' }),
    smoothingLength: 100
  })
}

/**
 * Returns the edge style for the given edge type.
 */
export function getEdgeStyle(edge: CompanyRelationshipEdge): IEdgeStyle {
  return typeMap[edge.type]
}

// configures the style of the edge labels
export const edgeLabelStyle = new LabelStyle({
  backgroundFill: '#D3D7D9',
  backgroundStroke: 'none',
  textFill: '#11232C',
  autoFlip: false,
  padding: [3, 5, 3, 5],
  shape: 'round-rectangle'
})

// configures the edge label model parameter
export const edgeLabelParameter = new EdgePathLabelModel({
  autoRotation: false
}).createRatioParameter(0.5)

// sets some defaults for the edge labels
export const edgeLabelDefaults = new LabelDefaults({
  style: edgeLabelStyle,
  layoutParameter: edgeLabelParameter
})
