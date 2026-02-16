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
import {
  Color,
  ILabelStyle,
  INode,
  LabelStyle,
  WebGLPolylineEdgeStyle,
  WebGLShapeNodeStyle
} from '@yfiles/yfiles'
import { getEdgeTag, getLabelTag, getNodeTag } from '../types'

/**
 * Maps cluster IDs to their associated color schemes.
 * Each cluster gets a distinct main color and light background variant.
 */
export const clusterIdToColors = new Map([
  [0, { main: '#B786FF', light: '#F7F2FF' }],
  [1, { main: '#8DB580', light: '#F2FFEF' }],
  [2, { main: '#F2D0A9', light: '#FFF8EF' }],
  [3, { main: '#4AD8FF', light: '#F1FCFF' }],
  [4, { main: '#82AEFF', light: '#F1F5FF' }],
  [5, { main: '#7EBD9D', light: '#EDFFF6' }],
  [6, { main: '#D5ACD3', light: '#FFF2FF' }],
  [7, { main: '#E4BEBF', light: '#FFF3F3' }],
  [8, { main: '#6CC7BF', light: '#F0FFFD' }],
  [9, { main: '#FBDD89', light: '#FFFBEE' }],
  [10, { main: '#dc67ce', light: '#fff3fd' }],
  [11, { main: '#67b7dc', light: '#f6fbff' }],
  [12, { main: '#ffadc6', light: '#fff3f3' }],
  [13, { main: '#17bebb', light: '#f3ffff' }]
])

/** Color used for error states (main stroke). */
export const errorMainColor = '#f40'

/** Color used for error states (light background). */
export const errorLightColor = '#ff6933'

/** Default text color. */
export const textColor = '#2A323C'

/**
 * Returns the Material Icons name for a given node type.
 *
 * @param type - The node type to get the icon for
 */
export function getNodeIcon(type) {
  switch (type && type.toLowerCase()) {
    case 'person':
      return 'person'
    case 'location':
      return 'location_on'
    case 'team':
      return 'diversity_1'
    case 'project':
      return 'view_kanban'
    case 'document':
      return 'article'
  }
  return ''
}

/**
 * Returns the Material Icons name for a problem indicator.
 *
 * @param problem - The problem to get the icon for
 */
export function getErrorLabel(problem) {
  return problem.type === 'duplicate' ? 'copy_all' : 'error'
}

/**
 * Creates a styled node based on its cluster and problem status.
 *
 * Virtual nodes are rendered as invisible. Normal nodes get colored by cluster,
 * with error-colored stroke and fill if marked as problematic.
 *
 * @param node - The node to style
 */
export function getNodeStyle(node) {
  const tag = getNodeTag(node)

  if (tag.virtual) {
    return new WebGLShapeNodeStyle({ stroke: 'transparent', fill: 'transparent' })
  }

  const clusterId = tag.clusterId
  const colorSet = clusterIdToColors.get(clusterId)

  return new WebGLShapeNodeStyle({
    stroke: tag.problem ? errorMainColor : colorSet.main,
    fill: tag.problem ? errorLightColor : colorSet.main,
    shape: 'ellipse',
    effect: 'ambient-fill-color'
  })
}

/**
 * Creates a styled edge based on its status.
 * Problem edges are styled with thick orange stroke. Normal edges adopt
 * the color of their source node's cluster with transparency.
 *
 * @param edge - The edge to style
 */
export function getEdgeStyle(edge) {
  let stroke = `20px #FF4400`

  if (!getEdgeTag(edge).problem) {
    const source = edge.sourceNode
    const sourceCluster = getNodeTag(source).clusterId
    const colorSet = clusterIdToColors.get(sourceCluster)
    const fill = Color.from(colorSet.main)
    stroke = `2px rgba(${fill.r}, ${fill.g}, ${fill.b}, 1)`
  }

  return new WebGLPolylineEdgeStyle({ stroke, effect: 'ambient-stroke-color' })
}

/**
 * Creates a label style based on the label type and visibility.
 * Returns void style if hidden, icon style for icon labels, error style for error labels,
 * or text style for regular labels.
 *
 * @param label - The label to style
 * @param ignoreVisibility - Whether to return the style regardless of the label's visibility
 */
export function getLabelStyle(label, ignoreVisibility = false) {
  const tag = getLabelTag(label)

  if (!tag.visible && !ignoreVisibility) {
    return ILabelStyle.VOID_LABEL_STYLE
  }

  if (tag.type === 'icon') {
    return getIconLabelStyle(label.owner)
  } else if (tag.type === 'error') {
    return errorNodeLabelStyle
  }

  return getTextLabelStyle(label.owner)
}

/**
 * Creates a text label style for nodes or edges.
 *
 * @param item - The node or edge to style the label for
 */
export function getTextLabelStyle(item) {
  const tag = item instanceof INode ? getNodeTag(item) : getEdgeTag(item)
  const clusterId =
    item instanceof INode ? getNodeTag(item).clusterId : getNodeTag(item.sourceNode).clusterId
  const colorSet = clusterIdToColors.get(clusterId)

  const backgroundStroke = `2px ${!tag.problem ? colorSet.main : errorMainColor}`
  const backgroundFill = `${!tag.problem ? colorSet.light : errorMainColor}`
  const textFill = !tag.problem ? textColor : 'white'
  const fontSize = item instanceof INode ? 60 : 28

  return new LabelStyle({
    font: `${fontSize}px sans-serif`,
    backgroundStroke,
    backgroundFill,
    textFill,
    horizontalTextAlignment: 'center',
    verticalTextAlignment: 'center',
    padding: [2, 6, 2, 6],
    shape: 'pill'
  })
}

/**
 * Creates an icon label style for Material Icons.
 *
 * @param node - The node to create icon style for
 */
export function getIconLabelStyle(node) {
  const size = node.layout.width

  return new LabelStyle({
    font: `${Math.floor(size * 0.6)}px Material Icons Outlined, sans-serif`,
    horizontalTextAlignment: 'center',
    verticalTextAlignment: 'center',
    textFill: textColor,
    wrapping: 'none',
    padding: [0, 0, size * 0.1, 0]
  })
}

/**
 * Predefined label style for error indicators using Material Icons.
 */
export const errorNodeLabelStyle = new LabelStyle({
  font: '40px Material Icons Outlined',
  horizontalTextAlignment: 'center',
  verticalTextAlignment: 'center',
  textFill: errorMainColor
})

/**
 * Returns whether the given item is a virtual node.
 * @param item - The item to be checked
 */
export function isVirtual(item) {
  return (item instanceof INode && getNodeTag(item).virtual) ?? false
}
