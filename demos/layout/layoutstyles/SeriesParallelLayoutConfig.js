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
  Class,
  EdgeRouter,
  EdgeRouterScope,
  ForkStyle,
  GraphComponent,
  GraphMLAttribute,
  LayoutOrientation,
  OrganicEdgeRouter,
  SeriesParallelLayout,
  SeriesParallelLayoutPortAssignmentMode,
  SeriesParallelLayoutRoutingStyle,
  StraightLineEdgeRouter,
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
 * @yjs:keep=considerNodeLabelsItem,descriptionGroup,descriptionTextItem,distanceGroup,edgesGroup,generalGroup,labelingGroup,minimumEdgeLengthItem,minimumEdgeToEdgeDistanceItem,minimumFirstSegmentLengthItem,minimumLastSegmentLengthItem,minimumNodeToEdgeDistanceItem,minimumNodeToNodeDistanceItem,minimumPolylineSegmentLengthItem,minimumSlopeItem,orientationItem,placeEdgeLabelsItem,portStyleItem,preferredOctilinearSegmentLengthItem,routeEdgesInFlowDirectionItem,routingStyleItem,routingStyleNonSeriesParallelItem,shouldDisableMinimumPolylineSegmentLengthItem,shouldDisableMinimumSlopeItem,shouldDisablePreferredOctilinearSegmentLengthItem,useDrawingAsSketchItem,verticalAlignmentItem
 */
const SeriesParallelLayoutConfig = Class('SeriesParallelLayoutConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('SeriesParallelLayout')],

  constructor: function() {
    LayoutConfiguration.call(this)
    const layout = new SeriesParallelLayout()
    const edgeLayoutDescriptor = layout.defaultEdgeLayoutDescriptor

    this.orientationItem = LayoutOrientation.TOP_TO_BOTTOM
    this.verticalAlignmentItem = 0.5
    this.useDrawingAsSketchItem = layout.fromSketchMode
    this.minimumNodeToNodeDistanceItem = 30
    this.minimumNodeToEdgeDistanceItem = 15
    this.minimumEdgeToEdgeDistanceItem = 15
    this.considerNodeLabelsItem = true
    this.placeEdgeLabelsItem = true

    this.portStyleItem = SeriesParallelLayoutPortAssignmentMode.CENTER
    this.routingStyleItem = SeriesParallelLayoutRoutingStyle.ORTHOGONAL
    this.preferredOctilinearSegmentLengthItem = layout.preferredOctilinearSegmentLength
    this.minimumPolylineSegmentLengthItem = layout.minimumPolylineSegmentLength
    this.minimumSlopeItem = layout.minimumSlope
    this.routingStyleNonSeriesParallelItem = SeriesParallelLayoutConfig.ROUTING_STYLE_ORTHOGONAL
    this.routeEdgesInFlowDirectionItem = true
    this.minimumFirstSegmentLengthItem = edgeLayoutDescriptor.minimumFirstSegmentLength
    this.minimumLastSegmentLengthItem = edgeLayoutDescriptor.minimumLastSegmentLength
    this.minimumEdgeLengthItem = 20
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph#mapperRegistry} if necessary.
   * @param {GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
   *   configuration on.
   * @return {ILayoutAlgorithm} The configured layout algorithm.
   */
  createConfiguredLayout: function(graphComponent) {
    const layout = new SeriesParallelLayout()
    layout.generalGraphHandling = true

    layout.layoutOrientation = this.orientationItem

    layout.verticalAlignment = this.verticalAlignmentItem
    layout.fromSketchMode = this.useDrawingAsSketchItem

    layout.minimumNodeToNodeDistance = this.minimumNodeToNodeDistanceItem
    layout.minimumNodeToEdgeDistance = this.minimumNodeToEdgeDistanceItem
    layout.minimumEdgeToEdgeDistance = this.minimumEdgeToEdgeDistanceItem

    layout.considerNodeLabels = this.considerNodeLabelsItem
    layout.integratedEdgeLabeling = this.placeEdgeLabelsItem

    const portAssignment = layout.defaultPortAssignment
    portAssignment.mode = this.portStyleItem
    portAssignment.forkStyle = this.routeEdgesInFlowDirectionItem
      ? ForkStyle.OUTSIDE_NODE
      : ForkStyle.AT_NODE

    layout.routingStyle = this.routingStyleItem
    if (this.routingStyleItem === SeriesParallelLayoutRoutingStyle.OCTILINEAR) {
      layout.preferredOctilinearSegmentLength = this.preferredOctilinearSegmentLengthItem
    } else if (this.routingStyleItem === SeriesParallelLayoutRoutingStyle.POLYLINE) {
      layout.minimumPolylineSegmentLength = this.minimumPolylineSegmentLengthItem
      layout.minimumSlope = this.minimumSlopeItem
    }

    if (
      this.routingStyleNonSeriesParallelItem === SeriesParallelLayoutConfig.ROUTING_STYLE_ORTHOGONAL
    ) {
      const edgeRouter = new EdgeRouter()
      edgeRouter.rerouting = true
      edgeRouter.scope = EdgeRouterScope.ROUTE_AFFECTED_EDGES
      layout.nonSeriesParallelEdgeRouter = edgeRouter
      layout.nonSeriesParallelEdgesDpKey = edgeRouter.affectedEdgesDpKey
    } else if (
      this.routingStyleNonSeriesParallelItem === SeriesParallelLayoutConfig.ROUTING_STYLE_ORGANIC
    ) {
      const edgeRouter = new OrganicEdgeRouter()
      layout.nonSeriesParallelEdgeRouter = edgeRouter
      layout.nonSeriesParallelEdgesDpKey = OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY
    } else if (
      this.routingStyleNonSeriesParallelItem === SeriesParallelLayoutConfig.ROUTING_STYLE_STRAIGHT
    ) {
      const edgeRouter = new StraightLineEdgeRouter()
      edgeRouter.scope = EdgeRouterScope.ROUTE_AFFECTED_EDGES
      layout.nonSeriesParallelEdgeRouter = edgeRouter
      layout.nonSeriesParallelEdgesDpKey = edgeRouter.affectedEdgesDpKey
    }

    const edgeLayoutDescriptor = layout.defaultEdgeLayoutDescriptor
    edgeLayoutDescriptor.minimumFirstSegmentLength = this.minimumFirstSegmentLengthItem
    edgeLayoutDescriptor.minimumLastSegmentLength = this.minimumLastSegmentLengthItem
    edgeLayoutDescriptor.minimumLength = this.minimumEdgeLengthItem

    return layout
  },

  /**
   * Backing field for below property
   * @type {OptionGroup}
   */
  $descriptionGroup: null,

  /** @type {OptionGroup} */
  descriptionGroup: {
    $meta: function() {
      return [
        LabelAttribute('Description'),
        OptionGroupAttribute('RootGroup', 5),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    get: function() {
      return this.$descriptionGroup
    },
    set: function(value) {
      this.$descriptionGroup = value
    }
  },

  /**
   * Backing field for below property
   * @type {OptionGroup}
   */
  $generalGroup: null,

  /** @type {OptionGroup} */
  generalGroup: {
    $meta: function() {
      return [
        LabelAttribute('General'),
        OptionGroupAttribute('RootGroup', 10),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    get: function() {
      return this.$generalGroup
    },
    set: function(value) {
      this.$generalGroup = value
    }
  },

  /**
   * Backing field for below property
   * @type {OptionGroup}
   */
  $edgesGroup: null,

  /** @type {OptionGroup} */
  edgesGroup: {
    $meta: function() {
      return [
        LabelAttribute('Edges'),
        OptionGroupAttribute('RootGroup', 10),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    get: function() {
      return this.$edgesGroup
    },
    set: function(value) {
      this.$edgesGroup = value
    }
  },

  /** @type {string} */
  descriptionTextItem: {
    $meta: function() {
      return [
        OptionGroupAttribute('descriptionGroup', 10),
        ComponentAttribute(Components.HTML_BLOCK),
        TypeAttribute(YString.$class)
      ]
    },
    get: function() {
      return '<p>The series-parallel layout algorithm highlights the main direction or flow of a graph, similar to the hierarchic style. In comparison, this algorithm is usually faster but can be used only on special graphs, namely series-parallel graphs.</p>'
    }
  },

  /**
   * Backing field for below property
   * @type {LayoutOrientation}
   */
  $orientationItem: null,

  /** @type {LayoutOrientation} */
  orientationItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Orientation',
          '#/api/OrientationLayout#OrientationLayout-property-orientation'
        ),
        GraphMLAttribute().init({ defaultValue: LayoutOrientation.TOP_TO_BOTTOM }),
        OptionGroupAttribute('generalGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Top to Bottom', LayoutOrientation.TOP_TO_BOTTOM],
            ['Left to Right', LayoutOrientation.LEFT_TO_RIGHT],
            ['Bottom to Top', LayoutOrientation.BOTTOM_TO_TOP],
            ['Right to Left', LayoutOrientation.RIGHT_TO_LEFT]
          ]
        }),
        TypeAttribute(LayoutOrientation.$class)
      ]
    },
    get: function() {
      return this.$orientationItem
    },
    set: function(value) {
      this.$orientationItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $verticalAlignmentItem: 0,

  /** @type {number} */
  verticalAlignmentItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Vertical Alignment',
          '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-verticalAlignment'
        ),
        GraphMLAttribute().init({ defaultValue: 0.5 }),
        OptionGroupAttribute('generalGroup', 20),
        EnumValuesAttribute().init({
          values: [
            ['Top', 0.0],
            ['Center', 0.5],
            ['Bottom', 1.0]
          ]
        }),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$verticalAlignmentItem
    },
    set: function(value) {
      this.$verticalAlignmentItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $useDrawingAsSketchItem: false,

  /** @type {boolean} */
  useDrawingAsSketchItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Use Drawing as Sketch',
          '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-fromSketchMode'
        ),
        OptionGroupAttribute('generalGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$useDrawingAsSketchItem
    },
    set: function(value) {
      this.$useDrawingAsSketchItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {OptionGroup}
   */
  $distanceGroup: null,

  /** @type {OptionGroup} */
  distanceGroup: {
    $meta: function() {
      return [
        LabelAttribute('Minimum Distances'),
        OptionGroupAttribute('generalGroup', 30),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    get: function() {
      return this.$distanceGroup
    },
    set: function(value) {
      this.$distanceGroup = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumNodeToNodeDistanceItem: 0,

  /** @type {number} */
  minimumNodeToNodeDistanceItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Node to Node Distance',
          '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-minimumNodeToNodeDistance'
        ),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        OptionGroupAttribute('distanceGroup', 10),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$minimumNodeToNodeDistanceItem
    },
    set: function(value) {
      this.$minimumNodeToNodeDistanceItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumNodeToEdgeDistanceItem: 0,

  /** @type {number} */
  minimumNodeToEdgeDistanceItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Node to Edge Distance',
          '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-minimumNodeToEdgeDistance'
        ),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        OptionGroupAttribute('distanceGroup', 20),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$minimumNodeToEdgeDistanceItem
    },
    set: function(value) {
      this.$minimumNodeToEdgeDistanceItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumEdgeToEdgeDistanceItem: 0,

  /** @type {number} */
  minimumEdgeToEdgeDistanceItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Edge to Edge Distance',
          '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-minimumEdgeToEdgeDistance'
        ),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        OptionGroupAttribute('distanceGroup', 30),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$minimumEdgeToEdgeDistanceItem
    },
    set: function(value) {
      this.$minimumEdgeToEdgeDistanceItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {OptionGroup}
   */
  $labelingGroup: null,

  /** @type {OptionGroup} */
  labelingGroup: {
    $meta: function() {
      return [
        LabelAttribute('Labeling'),
        OptionGroupAttribute('generalGroup', 40),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    get: function() {
      return this.$labelingGroup
    },
    set: function(value) {
      this.$labelingGroup = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $considerNodeLabelsItem: false,

  /** @type {boolean} */
  considerNodeLabelsItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Consider Node Labels',
          '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-considerNodeLabels'
        ),
        OptionGroupAttribute('labelingGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$considerNodeLabelsItem
    },
    set: function(value) {
      this.$considerNodeLabelsItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $placeEdgeLabelsItem: false,

  /** @type {boolean} */
  placeEdgeLabelsItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Place Edge Labels',
          '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-integratedEdgeLabeling'
        ),
        OptionGroupAttribute('labelingGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$placeEdgeLabelsItem
    },
    set: function(value) {
      this.$placeEdgeLabelsItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {SeriesParallelLayoutPortAssignmentMode}
   */
  $portStyleItem: null,

  /** @type {SeriesParallelLayoutPortAssignmentMode} */
  portStyleItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Port Style',
          '#/api/yfiles.seriesparallel.DefaultPortAssignment#DefaultPortAssignment-property-mode'
        ),
        OptionGroupAttribute('edgesGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Centered', SeriesParallelLayoutPortAssignmentMode.CENTER],
            ['Distributed', SeriesParallelLayoutPortAssignmentMode.DISTRIBUTED]
          ]
        }),
        TypeAttribute(SeriesParallelLayoutPortAssignmentMode.$class)
      ]
    },
    get: function() {
      return this.$portStyleItem
    },
    set: function(value) {
      this.$portStyleItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {SeriesParallelLayoutRoutingStyle}
   */
  $routingStyleItem: null,

  /** @type {SeriesParallelLayoutRoutingStyle} */
  routingStyleItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Routing Style',
          '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-routingStyle'
        ),
        OptionGroupAttribute('edgesGroup', 20),
        EnumValuesAttribute().init({
          values: [
            ['Orthogonal', SeriesParallelLayoutRoutingStyle.ORTHOGONAL],
            ['Octilinear', SeriesParallelLayoutRoutingStyle.OCTILINEAR],
            ['Polyline', SeriesParallelLayoutRoutingStyle.POLYLINE]
          ]
        }),
        TypeAttribute(SeriesParallelLayoutRoutingStyle.$class)
      ]
    },
    get: function() {
      return this.$routingStyleItem
    },
    set: function(value) {
      this.$routingStyleItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $preferredOctilinearSegmentLengthItem: 0,

  /** @type {number} */
  preferredOctilinearSegmentLengthItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Preferred Octilinear Segment Length',
          '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-preferredOctilinearSegmentLength'
        ),
        OptionGroupAttribute('edgesGroup', 30),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$preferredOctilinearSegmentLengthItem
    },
    set: function(value) {
      this.$preferredOctilinearSegmentLengthItem = value
    }
  },

  /** @type {boolean} */
  shouldDisablePreferredOctilinearSegmentLengthItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.routingStyleItem !== SeriesParallelLayoutRoutingStyle.OCTILINEAR
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumPolylineSegmentLengthItem: 0,

  /** @type {number} */
  minimumPolylineSegmentLengthItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Minimum Polyline Segment Length',
          '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-minimumPolylineSegmentLength'
        ),
        OptionGroupAttribute('edgesGroup', 40),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$minimumPolylineSegmentLengthItem
    },
    set: function(value) {
      this.$minimumPolylineSegmentLengthItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableMinimumPolylineSegmentLengthItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.routingStyleItem !== SeriesParallelLayoutRoutingStyle.POLYLINE
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumSlopeItem: 0,

  /** @type {number} */
  minimumSlopeItem: {
    $meta: function() {
      return [
        MinMaxAttribute().init({
          min: 0.0,
          max: 5.0,
          step: 0.01
        }),
        LabelAttribute(
          'Minimum Slope',
          '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-minimumSlope'
        ),
        OptionGroupAttribute('edgesGroup', 50),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$minimumSlopeItem
    },
    set: function(value) {
      this.$minimumSlopeItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableMinimumSlopeItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.routingStyleItem !== SeriesParallelLayoutRoutingStyle.POLYLINE
    }
  },

  /**
   * Backing field for below property
   * @type {string}
   */
  $routingStyleNonSeriesParallelItem: null,

  /** @type {string} */
  routingStyleNonSeriesParallelItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Routing Style (Non-Series-Parallel Edges)',
          '#/api/yfiles.seriesparallel.SeriesParallelLayout#SeriesParallelLayout-property-nonSeriesParallelEdgeRouter'
        ),
        OptionGroupAttribute('edgesGroup', 60),
        EnumValuesAttribute().init({
          values: [
            ['Orthogonal', SeriesParallelLayoutConfig.ROUTING_STYLE_ORTHOGONAL],
            ['Organic', SeriesParallelLayoutConfig.ROUTING_STYLE_ORGANIC],
            ['Straight-Line', SeriesParallelLayoutConfig.ROUTING_STYLE_STRAIGHT]
          ]
        }),
        TypeAttribute(YString.$class)
      ]
    },
    get: function() {
      return this.$routingStyleNonSeriesParallelItem
    },
    set: function(value) {
      this.$routingStyleNonSeriesParallelItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $routeEdgesInFlowDirectionItem: false,

  /** @type {boolean} */
  routeEdgesInFlowDirectionItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Route Edges in Flow Direction',
          '#/api/yfiles.seriesparallel.DefaultPortAssignment#DefaultPortAssignment-property-forkStyle'
        ),
        OptionGroupAttribute('edgesGroup', 70),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function() {
      return this.$routeEdgesInFlowDirectionItem
    },
    set: function(value) {
      this.$routeEdgesInFlowDirectionItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumFirstSegmentLengthItem: 0,

  /** @type {number} */
  minimumFirstSegmentLengthItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Minimum First Segment Length',
          '#/api/SeriesParallelLayoutEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumFirstSegmentLength'
        ),
        OptionGroupAttribute('edgesGroup', 80),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$minimumFirstSegmentLengthItem
    },
    set: function(value) {
      this.$minimumFirstSegmentLengthItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumLastSegmentLengthItem: 0,

  /** @type {number} */
  minimumLastSegmentLengthItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Minimum Last Segment Length',
          '#/api/SeriesParallelLayoutEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumLastSegmentLength'
        ),
        OptionGroupAttribute('edgesGroup', 90),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$minimumLastSegmentLengthItem
    },
    set: function(value) {
      this.$minimumLastSegmentLengthItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumEdgeLengthItem: 0,

  /** @type {number} */
  minimumEdgeLengthItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Minimum Edge Length',
          '#/api/SeriesParallelLayoutEdgeLayoutDescriptor#EdgeLayoutDescriptor-property-minimumLength'
        ),
        OptionGroupAttribute('edgesGroup', 100),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$minimumEdgeLengthItem
    },
    set: function(value) {
      this.$minimumEdgeLengthItem = value
    }
  },

  $static: {
    /**
     * @type {string}
     */
    ROUTING_STYLE_ORTHOGONAL: 'RoutingStyle.Orthogonal',

    /**
     * @type {string}
     */
    ROUTING_STYLE_ORGANIC: 'RoutingStyle.Organic',

    /**
     * @type {string}
     */
    ROUTING_STYLE_STRAIGHT: 'RoutingStyle.Straight'
  }
})
export default SeriesParallelLayoutConfig
