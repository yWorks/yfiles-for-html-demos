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
import {
  GenericLayoutData,
  GroupNodeStyle,
  IEdge,
  type IGraph,
  type ILabel,
  type IModelItem,
  INode,
  type LayoutData,
  PortConstraintKeys,
  TableNodeStyle
} from 'yfiles'

import { FlowchartNodeStyle, FlowchartNodeType } from '../style/FlowchartStyle'
import { EDGE_TYPE_DP_KEY, EdgeType, NODE_TYPE_DP_KEY, NodeType } from './flowchart-elements'

import { BranchDirection, FlowchartLayout } from './FlowchartLayout'

export type InEdgeGrouping = 'optimized' | 'none' | 'all'

const nodeActivityElements = new Set([
  FlowchartNodeType.Process,
  FlowchartNodeType.PredefinedProcess,
  FlowchartNodeType.LoopLimit,
  FlowchartNodeType.LoopLimitEnd
])
const nodeAnnotationElements = new Set([FlowchartNodeType.Annotation])
const nodeDataElements = new Set([
  FlowchartNodeType.Card,
  FlowchartNodeType.Cloud,
  FlowchartNodeType.Data,
  FlowchartNodeType.Database,
  FlowchartNodeType.DirectData,
  FlowchartNodeType.Document,
  FlowchartNodeType.InternalStorage,
  FlowchartNodeType.ManualInput,
  FlowchartNodeType.PaperType,
  FlowchartNodeType.StoredData,
  FlowchartNodeType.SequentialData
])
const nodeEndElements = new Set([FlowchartNodeType.Terminator])
const nodeEventElements = new Set([
  FlowchartNodeType.Delay,
  FlowchartNodeType.Display,
  FlowchartNodeType.ManualOperation,
  FlowchartNodeType.Preparation
])
const nodeGatewayElements = new Set([FlowchartNodeType.Decision])
const nodeReferenceElements = new Set([
  FlowchartNodeType.OnPageReference,
  FlowchartNodeType.OffPageReference
])
const nodeStartElements = new Set([FlowchartNodeType.Start1, FlowchartNodeType.Start2])

/**
 * Prepares flowchart specific layout hints for the flowchart styles and configures
 * the preferred direction of decision nodes' outgoing edges ('branch' edges).
 * These hints are interpreted by {@link FlowchartLayout}.
 */
export class FlowchartLayoutData {
  private $preferredPositiveBranchDirection = 0
  private $preferredNegativeBranchDirection = 0
  private $adjustedPositiveBranchDirection = 0
  private $adjustedNegativeBranchDirection = 0

  constructor() {
    this.preferredPositiveBranchDirection = BranchDirection.WithTheFlow
    this.preferredNegativeBranchDirection = BranchDirection.Flatwise
  }

  /**
   * The label text that defines a negative branch.
   */
  negativeBranchLabel = 'No'

  /**
   * The label text that defines a positive branch.
   */
  positiveBranchLabel = 'Yes'

  /**
   * Returns the preferred direction for negative branches.
   * @returns the preferred direction for negative branches.
   */
  get preferredNegativeBranchDirection(): BranchDirection {
    return this.$preferredNegativeBranchDirection
  }

  /**
   * Sets the preferred direction for negative branches.
   * @param direction the preferred direction for negative branches.
   */
  set preferredNegativeBranchDirection(direction: BranchDirection) {
    this.$preferredNegativeBranchDirection = direction
    this.$adjustedPositiveBranchDirection = this.calculateAdjustedPositiveBranchDirection()
    this.$adjustedNegativeBranchDirection = this.calculateAdjustedNegativeBranchDirection()
  }

  /**
   * Returns the preferred direction for positive branches.
   * @returns the preferred direction for positive branches.
   */
  get preferredPositiveBranchDirection(): BranchDirection {
    return this.$preferredPositiveBranchDirection
  }

  /**
   * Sets the preferred direction for positive branches.
   * @param direction the preferred direction for positive branches.
   */
  set preferredPositiveBranchDirection(direction: BranchDirection) {
    this.$preferredPositiveBranchDirection = direction
    this.$adjustedPositiveBranchDirection = this.calculateAdjustedPositiveBranchDirection()
    this.$adjustedNegativeBranchDirection = this.calculateAdjustedNegativeBranchDirection()
  }

  /**
   * Returns the adjusted direction that is set to negative branches. If the preferred positive and negative branches
   * interfere, this class adjusts them.
   * @returns the adjusted direction that is set to negative branches.
   */
  get adjustedNegativeBranchDirection(): BranchDirection {
    return this.$adjustedNegativeBranchDirection
  }

  /**
   * Returns the adjusted direction that is set to positive branches. If the preferred positive and negative branches
   * interfere, this class adjusts them.
   * @returns the adjusted direction that is set to positive branches.
   */
  get adjustedPositiveBranchDirection(): BranchDirection {
    return this.$adjustedPositiveBranchDirection
  }

  /**
   * Specifies in which way incoming-edges are grouped. There is either no grouping, a full grouping or an optimized
   * grouping. The optimized grouping keeps the edges centered at the four sides of the node like in most flowchart
   * diagrams.
   */
  inEdgeGrouping: InEdgeGrouping = 'optimized'

  /**
   * Returns the flow direction for negative branches
   * according to the {@link FlowchartLayoutData.preferredNegativeBranchDirection}
   * and the {@link FlowchartLayoutData.adjustedNegativeBranchDirection}.
   */
  private calculateAdjustedNegativeBranchDirection(): BranchDirection {
    const positiveDir = this.adjustedPositiveBranchDirection
    const negativeDir = this.preferredNegativeBranchDirection

    switch (negativeDir) {
      case BranchDirection.Straight:
        return positiveDir !== BranchDirection.WithTheFlow
          ? BranchDirection.WithTheFlow
          : BranchDirection.Flatwise

      case BranchDirection.Flatwise:
        if (positiveDir === BranchDirection.RightInFlow) {
          return BranchDirection.LeftInFlow
        } else if (positiveDir === BranchDirection.LeftInFlow) {
          return BranchDirection.RightInFlow
        }
        return negativeDir

      default:
      case BranchDirection.AgainstTheFlow:
        return BranchDirection.Undefined
      case BranchDirection.WithTheFlow:
        return positiveDir !== negativeDir ? negativeDir : BranchDirection.Flatwise

      case BranchDirection.LeftInFlow:
        return positiveDir !== negativeDir ? negativeDir : BranchDirection.RightInFlow

      case BranchDirection.RightInFlow:
        return positiveDir !== negativeDir ? negativeDir : BranchDirection.LeftInFlow
    }
  }

  /**
   * Returns the flow direction for positive branches
   * according to the {@link FlowchartLayoutData.preferredPositiveBranchDirection}.
   */
  private calculateAdjustedPositiveBranchDirection(): BranchDirection {
    switch (this.preferredPositiveBranchDirection) {
      case BranchDirection.Straight:
        return BranchDirection.WithTheFlow
      case BranchDirection.AgainstTheFlow:
        return BranchDirection.Undefined
      case BranchDirection.Flatwise:
        if (this.preferredNegativeBranchDirection === BranchDirection.RightInFlow) {
          return BranchDirection.LeftInFlow
        } else if (this.preferredNegativeBranchDirection === BranchDirection.LeftInFlow) {
          return BranchDirection.RightInFlow
        }
        return this.preferredPositiveBranchDirection
      default:
        return this.preferredPositiveBranchDirection
    }
  }

  /**
   * Creates the layout data for FlowChart layout
   */
  create(graph: IGraph): LayoutData {
    const data = new GenericLayoutData()

    data.addEdgeItemMapping(FlowchartLayout.PREFERRED_DIRECTION_DP_KEY).delegate = (
      edge
    ): BranchDirection => this.getBranchType(edge)

    data.addNodeItemMapping(NODE_TYPE_DP_KEY).delegate = (node): NodeType | EdgeType =>
      this.getType(node)
    data.addEdgeItemMapping(EDGE_TYPE_DP_KEY).delegate = (edge): NodeType | EdgeType =>
      this.getType(edge)

    if (graph.groupingSupport.hasGroupNodes()) {
      data.addLabelItemMapping(FlowchartLayout.LABEL_LAYOUT_DP_KEY).delegate = (label): boolean => {
        const node = label.owner
        return node instanceof INode && label === node.labels.at(0) && !graph.isGroupNode(node)
      }
    }

    if (this.inEdgeGrouping !== 'none') {
      let inDegreeThreshold: number
      let degreeThreshold: number
      if (this.inEdgeGrouping === 'all') {
        inDegreeThreshold = 0
        degreeThreshold = 0
      } else {
        inDegreeThreshold = 3
        degreeThreshold = 4
      }

      data.addEdgeItemMapping(PortConstraintKeys.TARGET_GROUP_ID_DP_KEY).delegate = (
        edge
      ): INode | null => {
        const node = edge.targetNode!
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
   * @returns one of the node type constants in the FlowchartElements file.
   */
  getType(item: IModelItem): number {
    if (item instanceof INode) {
      const style = item.style
      if (style instanceof TableNodeStyle) {
        return NodeType.Pool
      } else if (style instanceof GroupNodeStyle) {
        return NodeType.Group
      } else if (style instanceof FlowchartNodeStyle) {
        const type = style.type
        if (nodeActivityElements.has(type)) {
          return NodeType.Process
        } else if (nodeDataElements.has(type)) {
          return NodeType.Data
        } else if (nodeAnnotationElements.has(type)) {
          return NodeType.Annotation
        } else if (nodeGatewayElements.has(type)) {
          return NodeType.Decision
        } else if (nodeEndElements.has(type)) {
          return NodeType.EndEvent
        } else if (nodeEventElements.has(type)) {
          return NodeType.Event
        } else if (nodeReferenceElements.has(type)) {
          return NodeType.Process
        } else if (nodeStartElements.has(type)) {
          return NodeType.StartEvent
        }
      }
    } else if (item instanceof IEdge) {
      if (
        this.getType(item.sourceNode!) === NodeType.Annotation ||
        this.getType(item.targetNode!) === NodeType.Annotation
      ) {
        return EdgeType.MessageFlow
      }
      return EdgeType.SequenceFlow
    }
    return NodeType.Invalid
  }

  /**
   * Returns the branch type of the given edge.
   * @returns one of the direction constants in {@link FlowchartLayout}.
   */
  getBranchType(edge: IEdge): BranchDirection {
    if (this.isPositiveBranch(edge)) {
      return this.adjustedPositiveBranchDirection
    } else if (this.isNegativeBranch(edge)) {
      return this.adjustedNegativeBranchDirection
    }
    return BranchDirection.Undefined
  }

  /**
   * Returns whether the given edge is a positive branch. This default implementation considers an edge
   *  as a positive branch if its source is a decision and if its label text equals 'Yes' (ignoring case considerations).
   * @param edge the edge to consider.
   * @returns whether the given edge is a positive branch.
   */
  isPositiveBranch(edge: IEdge): boolean {
    return (
      this.getType(edge.sourceNode!) === NodeType.Decision &&
      edge.labels.size > 0 &&
      FlowchartLayoutData.isMatchingLabelText(edge.labels.first(), this.positiveBranchLabel)
    )
  }

  /**
   * Returns whether the given edge is a positive branch. This default implementation considers an edge
   *  as a negative branch if its source is a decision and if its label text equals 'No' (ignoring case considerations).
   * @param edge the edge to consider.
   * @returns whether the given edge is a negative branch.
   */
  isNegativeBranch(edge: IEdge): boolean {
    return (
      this.getType(edge.sourceNode!) === NodeType.Decision &&
      edge.labels.size > 0 &&
      FlowchartLayoutData.isMatchingLabelText(edge.labels.first(), this.negativeBranchLabel)
    )
  }

  /**
   * Returns true if the text of the given label equals, case ignored, the given text.
   */
  static isMatchingLabelText(label: ILabel, text: string): boolean {
    return label.text.toLowerCase() === text.toLowerCase()
  }
}
