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
import { NodeTypeEnum } from '../data-types.js'
import {
  DefaultLabelStyle,
  Fill,
  InteriorLabelModel,
  LabelDefaults,
  Rect,
  Size,
  Stroke
} from 'yfiles'
import { CustomShapeNodeStyle } from './CustomShapeNodeStyle.js'
import { colorSets } from 'demo-resources/demo-colors'
import { tableNodeStyle } from './TableNodeStyle.js'

// maps each node type with an enum value
const nodeTypeMap = {
  Corporation: NodeTypeEnum.CORPORATION,
  CTB: NodeTypeEnum.CTB,
  Partnership: NodeTypeEnum.PARTNERSHIP,
  RCTB: NodeTypeEnum.RCTB,
  Branch: NodeTypeEnum.BRANCH,
  Disregarded: NodeTypeEnum.DISREGARDED,
  'Dual Resident': NodeTypeEnum.DUAL_RESIDENT,
  Multiple: NodeTypeEnum.MULTIPLE,
  Trust: NodeTypeEnum.TRUST,
  Individual: NodeTypeEnum.INDIVIDUAL,
  'Third Party': NodeTypeEnum.THIRD_PARTY,
  PE_Risk: NodeTypeEnum.PE_RISK,
  Trapezoid: NodeTypeEnum.TRAPEZOID
}

// maps each node type with a color palette
export const predefinedColorSets = new Map([
  ['Corporation', 'demo-palette-51'],
  ['CTB', 'demo-palette-52'],
  ['Partnership', 'demo-palette-53'],
  ['RCTB', 'demo-palette-54'],
  ['Branch', 'demo-palette-55'],
  ['Disregarded', 'demo-palette-56'],
  ['Dual Resident', 'demo-palette-57'],
  ['Multiple', 'demo-palette-58'],
  ['Trust', 'demo-palette-59'],
  ['Individual', 'demo-palette-510'],
  ['Third Party', 'demo-palette-511'],
  ['PE_Risk', 'demo-palette-61'],
  ['Trapezoid', 'demo-palette-62']
])

/**
 * Returns the style of a node based on its type.
 * @param {!Company} item The given node
 * @param {boolean} useShapeNodeStyle True if a shape node style should be used, false otherwise
 * @returns {!INodeStyle}
 */
export function getNodeStyle(item, useShapeNodeStyle) {
  const nodeType = item.nodeType
  const colorSet = colorSets[predefinedColorSets.get(nodeType) || 'demo-palette-51']
  return useShapeNodeStyle
    ? new CustomShapeNodeStyle(
        nodeTypeMap[nodeType],
        Stroke.from(colorSet.fill),
        Fill.from(colorSet.nodeLabelFill)
      )
    : tableNodeStyle
}

/**
 * Returns the layout of the nodes based on the style selection.
 * @param {boolean} useShapeNodeStyle True if shape node styles have to be applied, false otherwise
 * @returns {!Rect}
 */
export function getNodeLayout(useShapeNodeStyle) {
  return useShapeNodeStyle ? new Rect(0, 0, 120, 60) : new Rect(0, 0, 200, 110)
}

// configures the style of the node labels
export const nodeLabelStyle = new DefaultLabelStyle({
  wrapping: 'word-ellipsis',
  horizontalTextAlignment: 'center',
  verticalTextAlignment: 'center'
})

// configures the node label parameter
export const nodeLabelParameter = InteriorLabelModel.CENTER

// configures the node label size (used for wrapping)
export const labelSizeDefaults = new Size(80, 60)

// sets some defaults for node labels
export const nameLabelDefaults = new LabelDefaults({
  style: nodeLabelStyle,
  layoutParameter: nodeLabelParameter,
  autoAdjustPreferredSize: false
})
