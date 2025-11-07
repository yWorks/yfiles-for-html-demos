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
import {
  CircularLayout,
  Class,
  ComponentAssignmentStrategy,
  type GraphComponent,
  HierarchicalLayout,
  type ILayoutAlgorithm,
  type LayoutData,
  OrganicLayout,
  OrthogonalLayout,
  PartialLayout,
  PartialLayoutData,
  PartialLayoutOrientation,
  PartialLayoutRoutingStyle,
  SubgraphPlacement
} from '@yfiles/yfiles'

import { LayoutConfiguration } from './LayoutConfiguration'
import {
  ComponentAttribute,
  EnumValuesAttribute,
  LabelAttribute,
  MinMaxAttribute,
  OptionGroup,
  OptionGroupAttribute,
  TypeAttribute
} from '@yfiles/demo-app/demo-option-editor'

export const SubgraphLayouts = { HIERARCHICAL: 0, ORGANIC: 1, CIRCULAR: 2, ORTHOGONAL: 3, AS_IS: 4 }
export type SubgraphLayouts = (typeof SubgraphLayouts)[keyof typeof SubgraphLayouts]

/**
 * Configuration options for the layout algorithm of the same name.
 */
export const PartialLayoutConfig = (Class as any)('PartialLayoutConfig', {
  $extends: LayoutConfiguration,

  _meta: {
    LayoutGroup: [
      new LabelAttribute('General'),
      new OptionGroupAttribute('RootGroup', 10),
      new TypeAttribute(OptionGroup)
    ],
    descriptionText: [
      new OptionGroupAttribute('DescriptionGroup', 10),
      new ComponentAttribute('html-block'),
      new TypeAttribute(String)
    ],
    routingToSubgraphItem: [
      new LabelAttribute(
        'Routing Style',
        '#/api/PartialLayout#PartialLayout-property-edgeRoutingStyle'
      ),
      new OptionGroupAttribute('LayoutGroup', 10),
      new EnumValuesAttribute([
        ['Auto-Detect', PartialLayoutRoutingStyle.AUTOMATIC],
        ['Octilinear', PartialLayoutRoutingStyle.OCTILINEAR],
        ['Straight-Line', PartialLayoutRoutingStyle.STRAIGHT_LINE],
        ['Orthogonal', PartialLayoutRoutingStyle.ORTHOGONAL],
        ['Organic', PartialLayoutRoutingStyle.ORGANIC]
      ]),
      new TypeAttribute(PartialLayoutRoutingStyle)
    ],
    componentAssignmentStrategyItem: [
      new LabelAttribute(
        'Placement Strategy',
        '#/api/PartialLayout#PartialLayout-property-componentAssignmentStrategy'
      ),
      new OptionGroupAttribute('LayoutGroup', 20),
      new EnumValuesAttribute([
        ['Connected Nodes as a Unit', ComponentAssignmentStrategy.CONNECTED],
        ['Each Node Separately', ComponentAssignmentStrategy.SINGLE],
        ['All Nodes as a Unit', ComponentAssignmentStrategy.SINGLE],
        ['Clustering', ComponentAssignmentStrategy.CLUSTERING]
      ]),
      new TypeAttribute(ComponentAssignmentStrategy)
    ],
    subgraphLayoutItem: [
      new LabelAttribute(
        'Subgraph Layout',
        '#/api/PartialLayout#PartialLayout-property-coreLayout'
      ),
      new OptionGroupAttribute('LayoutGroup', 30),
      new EnumValuesAttribute([
        ['Hierarchical', 'hierarchical'],
        ['Organic', 'organic'],
        ['Circular', 'circular'],
        ['Orthogonal', 'orthogonal'],
        ['As Is', 'as-is']
      ]),
      new TypeAttribute(SubgraphLayouts)
    ],
    subgraphPlacementItem: [
      new LabelAttribute(
        'Preferred Placement',
        '#/api/PartialLayout#PartialLayout-property-subgraphPlacement'
      ),
      new OptionGroupAttribute('LayoutGroup', 40),
      new EnumValuesAttribute([
        ['Close to Initial Position', SubgraphPlacement.FROM_SKETCH],
        ['Close to Neighbors', SubgraphPlacement.BARYCENTER]
      ]),
      new TypeAttribute(SubgraphPlacement)
    ],
    minNodeDistItem: [
      new LabelAttribute(
        'Minimum Node Distance',
        '#/api/PartialLayout#PartialLayout-property-minimumNodeDistance'
      ),
      new OptionGroupAttribute('LayoutGroup', 50),
      new MinMaxAttribute(1, 100),
      new ComponentAttribute('slider'),
      new TypeAttribute(Number)
    ],
    orientationItem: [
      new LabelAttribute(
        'Orientation',
        '#/api/PartialLayout#PartialLayout-property-layoutOrientation'
      ),
      new OptionGroupAttribute('LayoutGroup', 60),
      new EnumValuesAttribute([
        ['Auto Detect', PartialLayoutOrientation.AUTO_DETECT],
        ['Top to Bottom', PartialLayoutOrientation.TOP_TO_BOTTOM],
        ['Left to Right', PartialLayoutOrientation.LEFT_TO_RIGHT],
        ['Bottom to Top', PartialLayoutOrientation.BOTTOM_TO_TOP],
        ['Right to Left', PartialLayoutOrientation.RIGHT_TO_LEFT],
        ['None', PartialLayoutOrientation.NONE]
      ]),
      new TypeAttribute(PartialLayoutOrientation)
    ],
    alignNodesItem: [
      new LabelAttribute(
        'Align Nodes',
        '#/api/PartialLayout#PartialLayout-property-considerNodeAlignment'
      ),
      new OptionGroupAttribute('LayoutGroup', 70),
      new TypeAttribute(Boolean)
    ],
    moveFixedElementsItem: [
      new LabelAttribute(
        'Allow Moving Fixed Elements',
        '#/api/PartialLayout#PartialLayout-property-allowMovingFixedElements'
      ),
      new OptionGroupAttribute('LayoutGroup', 80),
      new TypeAttribute(Boolean)
    ]
  },

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    // @ts-ignore This is part of the old-school yFiles class definition used here
    LayoutConfiguration.call(this)
    this.routingToSubgraphItem = PartialLayoutRoutingStyle.AUTOMATIC
    this.componentAssignmentStrategyItem = ComponentAssignmentStrategy.CONNECTED
    this.subgraphLayoutItem = 'hierarchical'
    this.subgraphPlacementItem = SubgraphPlacement.FROM_SKETCH
    this.minNodeDistItem = 30
    this.orientationItem = PartialLayoutOrientation.AUTO_DETECT
    this.alignNodesItem = true
    this.title = 'Partial Layout'
  },

  /**
   * Creates and configures a layout.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @returns The configured layout.
   */
  createConfiguredLayout: function (graphComponent: GraphComponent): ILayoutAlgorithm {
    const layout = new PartialLayout()
    layout.considerNodeAlignment = this.alignNodesItem
    layout.minimumNodeDistance = this.minNodeDistItem
    layout.subgraphPlacement = this.subgraphPlacementItem
    layout.componentAssignmentStrategy = this.componentAssignmentStrategyItem
    layout.layoutOrientation = this.orientationItem
    layout.edgeRoutingStyle = this.routingToSubgraphItem
    layout.allowMovingFixedElements = this.moveFixedElementsItem

    let subgraphLayout = null
    if (this.componentAssignmentStrategyItem !== ComponentAssignmentStrategy.SINGLE) {
      switch (this.subgraphLayoutItem) {
        case 'hierarchical':
          subgraphLayout = new HierarchicalLayout()
          break
        case 'organic':
          subgraphLayout = new OrganicLayout()
          break
        case 'circular':
          subgraphLayout = new CircularLayout()
          break
        case 'orthogonal':
          subgraphLayout = new OrthogonalLayout()
          break
        default:
          break
      }
    }
    layout.coreLayout = subgraphLayout

    return layout
  },

  /**
   * Creates and configures the layout data.
   * @returns The configured layout data.
   */
  createConfiguredLayoutData: function (
    graphComponent: GraphComponent,
    layout: PartialLayout
  ): LayoutData {
    const partialLayoutData = new PartialLayoutData()
    const selection = graphComponent.selection

    partialLayoutData.scope.nodes = selection.nodes
    partialLayoutData.scope.edges = selection.edges

    return partialLayoutData
  },

  /** @type {OptionGroup} */
  LayoutGroup: null,

  /** @type {string} */
  descriptionText: {
    get: function (): string {
      return "<p style='margin-top:0'>Partial layout arranges user-specified parts of a diagram, the so-called partial elements, while keeping the other parts fixed. It is related to incremental graph layout. This concept is a perfect fit for incremental scenarios where subsequently added parts should be arranged so that they fit into a given, unchanged diagram.</p><p>In a first step, partial elements are combined to form subgraph components. Subsequently, these are arranged and afterwards placed so that the remainder of the diagram, which consists of the so-called fixed elements, is not affected.</p><p>Placing a subgraph component predominantly means finding a good position that both meets certain proximity criteria and offers enough space to accommodate the subgraph component.</p> <p>In this demo selected elements are considered by the algorithm as partial elements.</p>"
    }
  },

  /** @type {PartialLayoutRoutingStyle} */
  routingToSubgraphItem: null,

  /** @type {ComponentAssignmentStrategy} */
  componentAssignmentStrategyItem: null,

  /** @type {SubgraphLayouts} */
  subgraphLayoutItem: null,

  /** @type {SubgraphPlacement} */
  subgraphPlacementItem: null,

  /** @type {number} */
  minNodeDistItem: 1,

  /** @type {PartialLayoutOrientation} */
  orientationItem: null,

  /** @type {boolean} */
  alignNodesItem: false,

  /** @type {boolean} */
  moveFixedElementsItem: false
})
