/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EnumDefinition,
  GraphComponent,
  HierarchicLayout,
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
} from '../../resources/demo-option-editor.js'

/**
 * Configuration options for the layout algorithm of the same name.
 * @yjs:keep=DescriptionGroup,LayoutGroup,alignNodesItem,descriptionText,minNodeDistItem,componentAssignmentStrategyItem,orientationItem,routingToSubgraphItem,subgraphLayoutItem,subgraphPlacementItem
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
    this.subgraphLayoutItem = PartialLayoutConfig.EnumSubgraphLayouts.IHL
    this.subgraphPlacementItem = SubgraphPlacement.FROM_SKETCH
    this.minNodeDistItem = 30
    this.orientationItem = PartialLayoutOrientation.AUTO_DETECT
    this.alignNodesItem = true
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph#mapperRegistry} if necessary.
   * @param {GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
   *   configuration on.
   * @return {ILayoutAlgorithm} The configured layout.
   */
  createConfiguredLayout: function (graphComponent) {
    const layout = new PartialLayout()
    layout.considerNodeAlignment = this.alignNodesItem
    layout.minimumNodeDistance = this.minNodeDistItem
    layout.subgraphPlacement = this.subgraphPlacementItem
    layout.componentAssignmentStrategy = this.componentAssignmentStrategyItem
    layout.layoutOrientation = this.orientationItem
    layout.edgeRoutingStrategy = this.routingToSubgraphItem

    let subgraphLayout = null
    if (this.componentAssignmentStrategyItem !== ComponentAssignmentStrategy.SINGLE) {
      switch (this.subgraphLayoutItem) {
        case PartialLayoutConfig.EnumSubgraphLayouts.IHL:
          subgraphLayout = new HierarchicLayout()
          break
        case PartialLayoutConfig.EnumSubgraphLayouts.ORGANIC:
          subgraphLayout = new OrganicLayout()
          break
        case PartialLayoutConfig.EnumSubgraphLayouts.CIRCULAR:
          subgraphLayout = new CircularLayout()
          break
        case PartialLayoutConfig.EnumSubgraphLayouts.ORTHOGONAL:
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
   * @return {LayoutData} The configured layout data.
   */
  createConfiguredLayoutData: function (graphComponent, layout) {
    return new PartialLayoutData({
      affectedNodes: graphComponent.selection.selectedNodes,
      affectedEdges: graphComponent.selection.selectedEdges
    })
  },

  // ReSharper disable UnusedMember.Global
  // ReSharper disable InconsistentNaming
  /** @type {OptionGroup} */
  DescriptionGroup: {
    $meta: function () {
      return [
        LabelAttribute('Description'),
        OptionGroupAttribute('RootGroup', 5),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
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
      return "<p style='margin-top:0'>Partial layout arranges user-specified parts of a diagram, the so-called partial elements, while keeping the other parts fixed. It is related to incremental graph layout. This concept is a perfect fit for incremental scenarios where subsequently added parts should be arranged so that they fit into a given, unchanged diagram.</p><p>In a first step, partial elements are combined to form subgraph components. Subsequently, these are arranged and afterwards placed so that the remainder of the diagram, which consists of the so-called fixed elements, is not affected.</p><p>Placing a subgraph component predominantly means finding a good position that both meets certain proximity criteria and offers enough space to accommodate the subgraph component.</p>"
    }
  },

  /**
   * Backing field for below property
   * @type {PartialLayoutEdgeRoutingStrategy}
   */
  $routingToSubgraphItem: null,

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
    get: function () {
      return this.$routingToSubgraphItem
    },
    set: function (value) {
      this.$routingToSubgraphItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {ComponentAssignmentStrategy}
   */
  $componentAssignmentStrategyItem: null,

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
    get: function () {
      return this.$componentAssignmentStrategyItem
    },
    set: function (value) {
      this.$componentAssignmentStrategyItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {PartialLayoutConfig.EnumSubgraphLayouts}
   */
  $subgraphLayoutItem: null,

  /** @type {PartialLayoutConfig.EnumSubgraphLayouts} */
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
            ['Hierarchical', PartialLayoutConfig.EnumSubgraphLayouts.IHL],
            ['Organic', PartialLayoutConfig.EnumSubgraphLayouts.ORGANIC],
            ['Circular', PartialLayoutConfig.EnumSubgraphLayouts.CIRCULAR],
            ['Orthogonal', PartialLayoutConfig.EnumSubgraphLayouts.ORTHOGONAL],
            ['As Is', PartialLayoutConfig.EnumSubgraphLayouts.AS_IS]
          ]
        }),
        TypeAttribute(PartialLayoutConfig.EnumSubgraphLayouts.$class)
      ]
    },
    get: function () {
      return this.$subgraphLayoutItem
    },
    set: function (value) {
      this.$subgraphLayoutItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {SubgraphPlacement}
   */
  $subgraphPlacementItem: 0,

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
    get: function () {
      return this.$subgraphPlacementItem
    },
    set: function (value) {
      this.$subgraphPlacementItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minNodeDistItem: 0,

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
    get: function () {
      return this.$minNodeDistItem
    },
    set: function (value) {
      this.$minNodeDistItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {PartialLayoutOrientation}
   */
  $orientationItem: null,

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
    get: function () {
      return this.$orientationItem
    },
    set: function (value) {
      this.$orientationItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $alignNodesItem: false,

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
    get: function () {
      return this.$alignNodesItem
    },
    set: function (value) {
      this.$alignNodesItem = value
    }
  },

  $static: {
    // ReSharper restore UnusedMember.Global
    // ReSharper restore InconsistentNaming
    EnumSubgraphLayouts: new EnumDefinition(() => {
      return {
        IHL: 0,
        ORGANIC: 1,
        CIRCULAR: 2,
        ORTHOGONAL: 3,
        AS_IS: 4
      }
    })
  }
})
export default PartialLayoutConfig
