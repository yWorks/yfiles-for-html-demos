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
  CircularLayout,
  Class,
  ClearAreaLayout,
  ComponentAssignmentStrategy,
  Enum,
  GraphComponent,
  HierarchicLayout,
  ILayoutAlgorithm,
  LayoutData,
  OrganicLayout,
  OrthogonalLayout,
  PartialLayout,
  PartialLayoutData,
  PartialLayoutEdgeRoutingStrategy,
  PartialLayoutOrientation,
  SubgraphPlacement,
  YBoolean,
  YNumber,
  YString
} from 'yfiles'

import LayoutConfiguration from './LayoutConfiguration.js'
import {
  ComponentAttribute,
  Components,
  EnumValuesAttribute,
  LabelAttribute,
  MinMaxAttribute,
  OptionGroup,
  OptionGroupAttribute,
  TypeAttribute
} from 'demo-resources/demo-option-editor'

// We need to load the module 'layout-area' explicitly to be able to use the method
// 'allowMovingFixedElements' from the PartialLayout
Class.ensure(ClearAreaLayout)

/**
 * Configuration options for the layout algorithm of the same name.
 */
const PartialLayoutConfig = Class('PartialLayoutConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('PartialLayout')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    LayoutConfiguration.call(this)
    this.routingToSubgraphItem = PartialLayoutEdgeRoutingStrategy.AUTOMATIC
    this.componentAssignmentStrategyItem = ComponentAssignmentStrategy.CONNECTED
    this.subgraphLayoutItem = SubgraphLayouts.HIERARCHIC
    this.subgraphPlacementItem = SubgraphPlacement.FROM_SKETCH
    this.minNodeDistItem = 30
    this.orientationItem = PartialLayoutOrientation.AUTO_DETECT
    this.alignNodesItem = true
    this.title = 'Partial Layout'
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph.mapperRegistry} if necessary.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @returns The configured layout.
   */
  createConfiguredLayout: function (graphComponent) {
    const layout = new PartialLayout()
    layout.considerNodeAlignment = this.alignNodesItem
    layout.minimumNodeDistance = this.minNodeDistItem
    layout.subgraphPlacement = this.subgraphPlacementItem
    layout.componentAssignmentStrategy = this.componentAssignmentStrategyItem
    layout.layoutOrientation = this.orientationItem
    layout.edgeRoutingStrategy = this.routingToSubgraphItem
    layout.allowMovingFixedElements = this.moveFixedElementsItem

    let subgraphLayout = null
    if (this.componentAssignmentStrategyItem !== ComponentAssignmentStrategy.SINGLE) {
      switch (this.subgraphLayoutItem) {
        case SubgraphLayouts.HIERARCHIC:
          subgraphLayout = new HierarchicLayout()
          break
        case SubgraphLayouts.ORGANIC:
          subgraphLayout = new OrganicLayout()
          break
        case SubgraphLayouts.CIRCULAR:
          subgraphLayout = new CircularLayout()
          break
        case SubgraphLayouts.ORTHOGONAL:
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
  createConfiguredLayoutData: function (graphComponent, layout) {
    return new PartialLayoutData({
      affectedNodes: graphComponent.selection.selectedNodes,
      affectedEdges: graphComponent.selection.selectedEdges
    })
  },

  /** @type {OptionGroup} */
  LayoutGroup: {
    $meta: function () {
      return [
        LabelAttribute('General'),
        OptionGroupAttribute('RootGroup', 10),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {string} */
  descriptionText: {
    $meta: function () {
      return [
        OptionGroupAttribute('DescriptionGroup', 10),
        ComponentAttribute(Components.HTML_BLOCK),
        TypeAttribute(YString.$class)
      ]
    },
    get: function () {
      return "<p style='margin-top:0'>Partial layout arranges user-specified parts of a diagram, the so-called partial elements, while keeping the other parts fixed. It is related to incremental graph layout. This concept is a perfect fit for incremental scenarios where subsequently added parts should be arranged so that they fit into a given, unchanged diagram.</p><p>In a first step, partial elements are combined to form subgraph components. Subsequently, these are arranged and afterwards placed so that the remainder of the diagram, which consists of the so-called fixed elements, is not affected.</p><p>Placing a subgraph component predominantly means finding a good position that both meets certain proximity criteria and offers enough space to accommodate the subgraph component.</p> <p>In this demo selected elements are considered by the algorithm as partial elements.</p>"
    }
  },

  /** @type {PartialLayoutEdgeRoutingStrategy} */
  routingToSubgraphItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Edge Routing Style',
          '#/api/PartialLayout#PartialLayout-property-edgeRoutingStrategy'
        ),
        OptionGroupAttribute('LayoutGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Auto-Detect', PartialLayoutEdgeRoutingStrategy.AUTOMATIC],
            ['Octilinear', PartialLayoutEdgeRoutingStrategy.OCTILINEAR],
            ['Straight-Line', PartialLayoutEdgeRoutingStrategy.STRAIGHTLINE],
            ['Orthogonal', PartialLayoutEdgeRoutingStrategy.ORTHOGONAL],
            ['Organic', PartialLayoutEdgeRoutingStrategy.ORGANIC]
          ]
        }),
        TypeAttribute(PartialLayoutEdgeRoutingStrategy.$class)
      ]
    },
    value: null
  },

  /** @type {ComponentAssignmentStrategy} */
  componentAssignmentStrategyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Placement Strategy',
          '#/api/PartialLayout#PartialLayout-property-componentAssignmentStrategy'
        ),
        OptionGroupAttribute('LayoutGroup', 20),
        EnumValuesAttribute().init({
          values: [
            ['Connected Nodes as a Unit', ComponentAssignmentStrategy.CONNECTED],
            ['Each Node Separately', ComponentAssignmentStrategy.SINGLE],
            ['All Nodes as a Unit', ComponentAssignmentStrategy.CUSTOMIZED],
            ['Clustering', ComponentAssignmentStrategy.CLUSTERING]
          ]
        }),
        TypeAttribute(ComponentAssignmentStrategy.$class)
      ]
    },
    value: null
  },

  /** @type {SubgraphLayouts} */
  subgraphLayoutItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Subgraph Layouter',
          '#/api/PartialLayout#PartialLayout-property-coreLayout'
        ),
        OptionGroupAttribute('LayoutGroup', 30),
        EnumValuesAttribute().init({
          values: [
            ['Hierarchical', SubgraphLayouts.HIERARCHIC],
            ['Organic', SubgraphLayouts.ORGANIC],
            ['Circular', SubgraphLayouts.CIRCULAR],
            ['Orthogonal', SubgraphLayouts.ORTHOGONAL],
            ['As Is', SubgraphLayouts.AS_IS]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {SubgraphPlacement} */
  subgraphPlacementItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Preferred Placement',
          '#/api/PartialLayout#PartialLayout-property-subgraphPlacement'
        ),
        OptionGroupAttribute('LayoutGroup', 40),
        EnumValuesAttribute().init({
          values: [
            ['Close to Initial Position', SubgraphPlacement.FROM_SKETCH],
            ['Close to Neighbors', SubgraphPlacement.BARYCENTER]
          ]
        }),
        TypeAttribute(SubgraphPlacement.$class)
      ]
    },
    value: null
  },

  /** @type {number} */
  minNodeDistItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Node Distance',
          '#/api/PartialLayout#PartialLayout-property-minimumNodeDistance'
        ),
        OptionGroupAttribute('LayoutGroup', 50),
        MinMaxAttribute().init({
          min: 1,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 1
  },

  /** @type {PartialLayoutOrientation} */
  orientationItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Orientation',
          '#/api/PartialLayout#PartialLayout-property-layoutOrientation'
        ),
        OptionGroupAttribute('LayoutGroup', 60),
        EnumValuesAttribute().init({
          values: [
            ['Auto Detect', PartialLayoutOrientation.AUTO_DETECT],
            ['Top to Bottom', PartialLayoutOrientation.TOP_TO_BOTTOM],
            ['Left to Right', PartialLayoutOrientation.LEFT_TO_RIGHT],
            ['Bottom to Top', PartialLayoutOrientation.BOTTOM_TO_TOP],
            ['Right to Left', PartialLayoutOrientation.RIGHT_TO_LEFT],
            ['None', PartialLayoutOrientation.NONE]
          ]
        }),
        TypeAttribute(PartialLayoutOrientation.$class)
      ]
    },
    value: null
  },

  /** @type {boolean} */
  alignNodesItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Align Nodes',
          '#/api/PartialLayout#PartialLayout-property-considerNodeAlignment'
        ),
        OptionGroupAttribute('LayoutGroup', 70),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  moveFixedElementsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Allow Moving Fixed Elements',
          '#/api/PartialLayout#PartialLayout-property-allowMovingFixedElements'
        ),
        OptionGroupAttribute('LayoutGroup', 80),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  }
})
export default PartialLayoutConfig

export /**
 * @readonly
 * @enum {number}
 */
const SubgraphLayouts = {
  HIERARCHIC: 0,
  ORGANIC: 1,
  CIRCULAR: 2,
  ORTHOGONAL: 3,
  AS_IS: 4
}
