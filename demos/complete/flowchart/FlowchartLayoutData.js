/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
import {
  CollapsibleNodeStyleDecorator,
  GenericLayoutData,
  IEdge,
  IGraph,
  ILabel,
  IModelItem,
  INode,
  LayoutData,
  PortConstraintKeys,
  TableNodeStyle
} from 'yfiles'

import { FlowchartNodeStyle } from './FlowchartStyle.js'
import {
  EDGE_TYPE_DP_KEY,
  EDGE_TYPE_MESSAGE_FLOW,
  EDGE_TYPE_SEQUENCE_FLOW,
  NODE_TYPE_ANNOTATION,
  NODE_TYPE_DATA,
  NODE_TYPE_DECISION,
  NODE_TYPE_DP_KEY,
  NODE_TYPE_END_EVENT,
  NODE_TYPE_EVENT,
  NODE_TYPE_GROUP,
  NODE_TYPE_POOL,
  NODE_TYPE_PROCESS,
  NODE_TYPE_START_EVENT,
  TYPE_INVALID
} from './FlowchartElements.js'

import FlowchartLayout from './FlowchartLayout.js'

const nodeActivityElements = new Set(['process', 'predefinedProcess', 'loopLimit', 'loopLimitEnd'])
const nodeAnnotationElements = new Set(['annotation'])
const nodeDataElements = new Set([
  'card',
  'cloud',
  'data',
  'database',
  'directData',
  'document',
  'internalStorage',
  'manualInput',
  'paperType',
  'storedData',
  'sequentialData'
])
const nodeEndElements = new Set(['terminator'])
const nodeEventElements = new Set(['delay', 'display', 'manualOperation', 'preparation'])
const nodeGatewayElements = new Set(['decision'])
const nodeReferenceElements = new Set(['onPageReference', 'offPageReference'])
const nodeStartElements = new Set(['start1', 'start2'])

/**
 * Prepares flowchart specific layout hints for the flowchart styles and configures
 * the preferred direction of outgoing edges of decision nodes ('branch' edges).
 * These hints are interpreted by {@link FlowchartLayout}.
 */
export default class FlowchartLayoutData {
  constructor() {
    this.$preferredPositiveBranchDirection = 0
    this.$preferredNegativeBranchDirection = 0
    this.$adjustedPositiveBranchDirection = 0
    this.$adjustedNegativeBranchDirection = 0

    // The label text that defines a negative branch.
    this.negativeBranchLabel = 'No'

    // The label text that defines a positive branch.
    this.positiveBranchLabel = 'Yes'

    // Specifies in which way incoming-edges are grouped. There is either no grouping, a full grouping or an optimized
    // grouping. The optimized grouping keeps the edges centered at the four sides of the node like in most flowchart
    // diagrams.
    this.inEdgeGrouping = 'optimized'

    this.preferredPositiveBranchDirection = FlowchartLayout.DIRECTION_WITH_THE_FLOW
    this.preferredNegativeBranchDirection = FlowchartLayout.DIRECTION_FLATWISE
  }

  /**
   * Returns the preferred direction for negative branches.
   * @returns the preferred direction for negative branches.
   * @type {number}
   */
  get preferredNegativeBranchDirection() {
    return this.$preferredNegativeBranchDirection
  }

  /**
   * Sets the preferred direction for negative branches.
   * @param direction the preferred direction for negative branches.
   * @type {number}
   */
  set preferredNegativeBranchDirection(direction) {
    this.$preferredNegativeBranchDirection = direction
    this.$adjustedPositiveBranchDirection = this.calculateAdjustedPositiveBranchDirection()
    this.$adjustedNegativeBranchDirection = this.calculateAdjustedNegativeBranchDirection()
  }

  /**
   * Returns the preferred direction for positive branches.
   * @returns the preferred direction for positive branches.
   * @type {number}
   */
  get preferredPositiveBranchDirection() {
    return this.$preferredPositiveBranchDirection
  }

  /**
   * Sets the preferred direction for positive branches.
   * @param direction the preferred direction for positive branches.
   * @type {number}
   */
  set preferredPositiveBranchDirection(direction) {
    this.$preferredPositiveBranchDirection = direction
    this.$adjustedPositiveBranchDirection = this.calculateAdjustedPositiveBranchDirection()
    this.$adjustedNegativeBranchDirection = this.calculateAdjustedNegativeBranchDirection()
  }

  /**
   * Returns the adjusted direction that is set to negative branches. If the preferred positive and negative branches
   * interfere, this class adjusts them.
   * @returns the adjusted direction that is set to negative branches.
   * @type {number}
   */
  get adjustedNegativeBranchDirection() {
    return this.$adjustedNegativeBranchDirection
  }

  /**
   * Returns the adjusted direction that is set to positive branches. If the preferred positive and negative branches
   * interfere, this class adjusts them.
   * @returns the adjusted direction that is set to positive branches.
   * @type {number}
   */
  get adjustedPositiveBranchDirection() {
    return this.$adjustedPositiveBranchDirection
  }

  /**
   * Returns the flow direction for negative branches
   * according to the {@link preferredNegativeBranchDirection}
   * and the {@link adjustedNegativeBranchDirection}.
   * @returns {number}
   */
  calculateAdjustedNegativeBranchDirection() {
    const positiveDir = this.adjustedPositiveBranchDirection
    const negativeDir = this.preferredNegativeBranchDirection

    switch (negativeDir) {
      case FlowchartLayout.DIRECTION_STRAIGHT:
        return positiveDir !== FlowchartLayout.DIRECTION_WITH_THE_FLOW
          ? FlowchartLayout.DIRECTION_WITH_THE_FLOW
          : FlowchartLayout.DIRECTION_FLATWISE

      case FlowchartLayout.DIRECTION_FLATWISE:
        if (positiveDir === FlowchartLayout.DIRECTION_RIGHT_IN_FLOW) {
          return FlowchartLayout.DIRECTION_LEFT_IN_FLOW
        } else if (positiveDir === FlowchartLayout.DIRECTION_LEFT_IN_FLOW) {
          return FlowchartLayout.DIRECTION_RIGHT_IN_FLOW
        }
        return negativeDir

      default:
      case FlowchartLayout.DIRECTION_AGAINST_THE_FLOW:
        return FlowchartLayout.DIRECTION_UNDEFINED
      case FlowchartLayout.DIRECTION_WITH_THE_FLOW:
        return positiveDir !== negativeDir ? negativeDir : FlowchartLayout.DIRECTION_FLATWISE

      case FlowchartLayout.DIRECTION_LEFT_IN_FLOW:
        return positiveDir !== negativeDir ? negativeDir : FlowchartLayout.DIRECTION_RIGHT_IN_FLOW

      case FlowchartLayout.DIRECTION_RIGHT_IN_FLOW:
        return positiveDir !== negativeDir ? negativeDir : FlowchartLayout.DIRECTION_LEFT_IN_FLOW
    }
  }

  /**
   * Returns the flow direction for positive branches
   * according to the {@link preferredPositiveBranchDirection}.
   * @returns {number}
   */
  calculateAdjustedPositiveBranchDirection() {
    switch (this.preferredPositiveBranchDirection) {
      case FlowchartLayout.DIRECTION_STRAIGHT:
        return FlowchartLayout.DIRECTION_WITH_THE_FLOW
      case FlowchartLayout.DIRECTION_AGAINST_THE_FLOW:
        return FlowchartLayout.DIRECTION_UNDEFINED
      case FlowchartLayout.DIRECTION_FLATWISE:
        if (this.preferredNegativeBranchDirection === FlowchartLayout.DIRECTION_RIGHT_IN_FLOW) {
          return FlowchartLayout.DIRECTION_LEFT_IN_FLOW
        } else if (
          this.preferredNegativeBranchDirection === FlowchartLayout.DIRECTION_LEFT_IN_FLOW
        ) {
          return FlowchartLayout.DIRECTION_RIGHT_IN_FLOW
        }
        return this.preferredPositiveBranchDirection
      default:
        return this.preferredPositiveBranchDirection
    }
  }

  /**
   * Creates the layout data for FlowChart layout
   * @param {!IGraph} graph
   * @returns {!LayoutData}
   */
  create(graph) {
    const data = new GenericLayoutData()

    data.addEdgeItemMapping(FlowchartLayout.PREFERRED_DIRECTION_DP_KEY).delegate = edge =>
      this.getBranchType(edge)

    data.addNodeItemMapping(NODE_TYPE_DP_KEY).delegate = node => this.getType(node)
    data.addEdgeItemMapping(EDGE_TYPE_DP_KEY).delegate = edge => this.getType(edge)

    if (graph.groupingSupport.hasGroupNodes()) {
      data.addLabelItemMapping(FlowchartLayout.LABEL_LAYOUT_DP_KEY).delegate = label => {
        const node = label.owner
        return node instanceof INode && label === node.labels.at(0) && !graph.isGroupNode(node)
      }
    }

    if (this.inEdgeGrouping !== 'none') {
      let inDegreeThreshold
      let degreeThreshold
      if (this.inEdgeGrouping === 'all') {
        inDegreeThreshold = 0
        degreeThreshold = 0
      } else {
        inDegreeThreshold = 3
        degreeThreshold = 4
      }

      data.addEdgeItemMapping(PortConstraintKeys.TARGET_GROUP_ID_DP_KEY).delegate = edge => {
        const node = edge.targetNode
        return graph.inDegree(node) >= 2 &&
          graph.inDegree(node) >= inDegreeThreshold &&
          graph.degree(node) >= degreeThreshold
          ? node
          : null
      }
    }
    return data
  }

  /**
   * Returns the flowchart element type of the given model item.
   * @returns {number} one of the node type constants in the FlowchartElements file.
   * @param {!IModelItem} item
   */
  getType(item) {
    if (item instanceof INode) {
      const style = item.style
      if (style instanceof TableNodeStyle) {
        return NODE_TYPE_POOL
      } else if (style instanceof CollapsibleNodeStyleDecorator) {
        return NODE_TYPE_GROUP
      } else if (style instanceof FlowchartNodeStyle) {
        const type = style.type
        if (nodeActivityElements.has(type)) {
          return NODE_TYPE_PROCESS
        } else if (nodeDataElements.has(type)) {
          return NODE_TYPE_DATA
        } else if (nodeAnnotationElements.has(type)) {
          return NODE_TYPE_ANNOTATION
        } else if (nodeGatewayElements.has(type)) {
          return NODE_TYPE_DECISION
        } else if (nodeEndElements.has(type)) {
          return NODE_TYPE_END_EVENT
        } else if (nodeEventElements.has(type)) {
          return NODE_TYPE_EVENT
        } else if (nodeReferenceElements.has(type)) {
          return NODE_TYPE_PROCESS
        } else if (nodeStartElements.has(type)) {
          return NODE_TYPE_START_EVENT
        }
      }
    } else if (item instanceof IEdge) {
      if (
        this.getType(item.sourceNode) === NODE_TYPE_ANNOTATION ||
        this.getType(item.targetNode) === NODE_TYPE_ANNOTATION
      ) {
        return EDGE_TYPE_MESSAGE_FLOW
      }
      return EDGE_TYPE_SEQUENCE_FLOW
    }
    return TYPE_INVALID
  }

  /**
   * Returns the branch type of the given edge.
   * @returns {number} one of the direction constants in {@link FlowchartLayout}.
   * @param {!IEdge} edge
   */
  getBranchType(edge) {
    if (this.isPositiveBranch(edge)) {
      return this.adjustedPositiveBranchDirection
    } else if (this.isNegativeBranch(edge)) {
      return this.adjustedNegativeBranchDirection
    }
    return FlowchartLayout.DIRECTION_UNDEFINED
  }

  /**
   * Returns whether or not the given edge is a positive branch. This default implementation considers an edge
   * as positive branch if its source is a decision and if its label text equals 'Yes' (ignoring case considerations).
   * @param {!IEdge} edge the edge to consider.
   * @returns {boolean} whether or not the given edge is a positive branch.
   */
  isPositiveBranch(edge) {
    return (
      this.getType(edge.sourceNode) === NODE_TYPE_DECISION &&
      edge.labels.size > 0 &&
      FlowchartLayoutData.isMatchingLabelText(edge.labels.first(), this.positiveBranchLabel)
    )
  }

  /**
   * Returns whether or not the given edge is a positive branch. This default implementation considers an edge
   * as negative branch if its source is a decision and if its label text equals 'No' (ignoring case considerations).
   * @param {!IEdge} edge the edge to consider.
   * @returns {boolean} whether or not the given edge is a negative branch.
   */
  isNegativeBranch(edge) {
    return (
      this.getType(edge.sourceNode) === NODE_TYPE_DECISION &&
      edge.labels.size > 0 &&
      FlowchartLayoutData.isMatchingLabelText(edge.labels.first(), this.negativeBranchLabel)
    )
  }

  /**
   * Returns true if text of the given label equals, case ignored, the given text.
   * @param {!ILabel} label
   * @param {!string} text
   * @returns {boolean}
   */
  static isMatchingLabelText(label, text) {
    return label.text.toLowerCase() === text.toLowerCase()
  }
}
