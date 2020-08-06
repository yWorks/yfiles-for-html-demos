/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ChannelEdgeRouter,
  ChannelEdgeRouterData,
  Class,
  EdgeRouterScope,
  GraphComponent,
  OrthogonalPatternEdgeRouter,
  OrthogonalSegmentDistributionStage,
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
 */
const ChannelEdgeRouterConfig = Class('ChannelEdgeRouterConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('ChannelEdgeRouter')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    LayoutConfiguration.call(this)
    this.scopeItem = EdgeRouterScope.ROUTE_ALL_EDGES
    this.minimumDistanceItem = 10
    this.activateGridRoutingItem = true
    this.gridSpacingItem = 20

    this.bendCostItem = 1.0
    this.edgeCrossingCostItem = 5.0
    this.nodeCrossingCostItem = 50.0
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph#mapperRegistry} if necessary.
   * @param {GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
   *   configuration on.
   * @return {ILayoutAlgorithm} The configured layout.
   */
  createConfiguredLayout: function (graphComponent) {
    const router = new ChannelEdgeRouter()

    const orthogonalPatternEdgeRouter = new OrthogonalPatternEdgeRouter()

    orthogonalPatternEdgeRouter.affectedEdgesDpKey = ChannelEdgeRouter.AFFECTED_EDGES_DP_KEY
    orthogonalPatternEdgeRouter.minimumDistance = this.minimumDistanceItem
    orthogonalPatternEdgeRouter.gridRouting = this.activateGridRoutingItem
    orthogonalPatternEdgeRouter.gridSpacing = this.gridSpacingItem

    orthogonalPatternEdgeRouter.bendCost = this.bendCostItem
    orthogonalPatternEdgeRouter.edgeCrossingCost = this.edgeCrossingCostItem
    orthogonalPatternEdgeRouter.nodeCrossingCost = this.nodeCrossingCostItem

    // disable edge overlap costs when Edge distribution will run afterwards anyway
    orthogonalPatternEdgeRouter.edgeOverlapCost = 0.0

    router.pathFinderStrategy = orthogonalPatternEdgeRouter

    const segmentDistributionStage = new OrthogonalSegmentDistributionStage()
    segmentDistributionStage.affectedEdgesDpKey = ChannelEdgeRouter.AFFECTED_EDGES_DP_KEY
    segmentDistributionStage.preferredDistance = this.minimumDistanceItem
    segmentDistributionStage.gridRouting = this.activateGridRoutingItem
    segmentDistributionStage.gridSpacing = this.gridSpacingItem

    router.edgeDistributionStrategy = segmentDistributionStage

    return router
  },

  /**
   * Called by {@link LayoutConfiguration#apply} to create the layout data of the configuration. This
   * method is typically overridden to provide mappers for the different layouts.
   */
  createConfiguredLayoutData: function (graphComponent, layout) {
    const layoutData = new ChannelEdgeRouterData()
    const selection = graphComponent.selection
    if (this.scopeItem === EdgeRouterScope.ROUTE_EDGES_AT_AFFECTED_NODES) {
      layoutData.affectedEdges = edge =>
        selection.isSelected(edge.sourceNode) || selection.isSelected(edge.targetNode)
    } else if (this.scopeItem === EdgeRouterScope.ROUTE_AFFECTED_EDGES) {
      layoutData.affectedEdges = edge => selection.isSelected(edge)
    } else {
      layoutData.affectedEdges = edge => true
    }
    return layoutData
  },

  /**
   * Called after the layout animation is done.
   * @see Overrides {@link LayoutConfiguration#postProcess}
   */
  postProcess: function (graphComponent) {},

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

  /** @type {OptionGroup} */
  CostsGroup: {
    $meta: function () {
      return [
        LabelAttribute('Costs'),
        OptionGroupAttribute('RootGroup', 20),
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
      return "<p style='margin - top:0'>Channel edge router uses a rather fast but simple algorithm for finding orthogonal edge routes. Compared to polyline and orthogonal edge router, edge segments can be very close to each other and edges may also overlap with nodes. However, this algorithm is faster in many situations.</p>"
    }
  },

  /**
   * Backing field for below property
   * @type {EdgeRouterScope}
   */
  $scopeItem: null,

  /** @type {EdgeRouterScope} */
  scopeItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Scope',
          '#/api/ChannelEdgeRouterData#ChannelEdgeRouterData-property-affectedEdges'
        ),
        OptionGroupAttribute('LayoutGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['All Edges', EdgeRouterScope.ROUTE_ALL_EDGES],
            ['Selected Edges', EdgeRouterScope.ROUTE_AFFECTED_EDGES],
            ['Edges at Selected Nodes', EdgeRouterScope.ROUTE_EDGES_AT_AFFECTED_NODES]
          ]
        }),
        TypeAttribute(EdgeRouterScope.$class)
      ]
    },
    get: function () {
      return this.$scopeItem
    },
    set: function (value) {
      this.$scopeItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumDistanceItem: 0,

  /** @type {number} */
  minimumDistanceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Distance',
          '#/api/OrthogonalPatternEdgeRouter#OrthogonalPatternEdgeRouter-property-minimumDistance'
        ),
        OptionGroupAttribute('LayoutGroup', 30),
        MinMaxAttribute().init({
          min: 0.0,
          max: 100.0
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$minimumDistanceItem
    },
    set: function (value) {
      this.$minimumDistanceItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $activateGridRoutingItem: false,

  /** @type {boolean} */
  activateGridRoutingItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Route on Grid',
          '#/api/OrthogonalPatternEdgeRouter#OrthogonalPatternEdgeRouter-property-gridRouting'
        ),
        OptionGroupAttribute('LayoutGroup', 40),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$activateGridRoutingItem
    },
    set: function (value) {
      this.$activateGridRoutingItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $gridSpacingItem: 0,

  /** @type {number} */
  gridSpacingItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Grid Spacing',
          '#/api/OrthogonalPatternEdgeRouter#OrthogonalPatternEdgeRouter-property-gridSpacing'
        ),
        OptionGroupAttribute('LayoutGroup', 50),
        MinMaxAttribute().init({
          min: 2,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$gridSpacingItem
    },
    set: function (value) {
      this.$gridSpacingItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableGridSpacingItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return !this.activateGridRoutingItem
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $bendCostItem: 0,

  /** @type {number} */
  bendCostItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Bend Cost',
          '#/api/OrthogonalPatternEdgeRouter#OrthogonalPatternEdgeRouter-property-bendCost'
        ),
        OptionGroupAttribute('CostsGroup', 10),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$bendCostItem
    },
    set: function (value) {
      this.$bendCostItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $edgeCrossingCostItem: 0,

  /** @type {number} */
  edgeCrossingCostItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Edge Crossing Cost',
          '#/api/OrthogonalPatternEdgeRouter#OrthogonalPatternEdgeRouter-property-edgeCrossingCost'
        ),
        OptionGroupAttribute('CostsGroup', 20),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$edgeCrossingCostItem
    },
    set: function (value) {
      this.$edgeCrossingCostItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $nodeCrossingCostItem: 0,

  /** @type {number} */
  nodeCrossingCostItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Node Overlap Cost',
          '#/api/OrthogonalPatternEdgeRouter#OrthogonalPatternEdgeRouter-property-nodeCrossingCost'
        ),
        OptionGroupAttribute('CostsGroup', 30),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$nodeCrossingCostItem
    },
    set: function (value) {
      this.$nodeCrossingCostItem = value
    }
  },
  $initChannelEdgeRouterConfig: function () {
    this.$scopeItem = EdgeRouterScope.ROUTE_ALL_EDGES
  }
})
export default ChannelEdgeRouterConfig
