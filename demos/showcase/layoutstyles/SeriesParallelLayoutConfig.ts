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
  Class,
  EdgeRouter,
  GraphComponent,
  ILayoutAlgorithm,
  LayoutOrientation,
  OrganicEdgeRouter,
  SeriesParallelLayout,
  SeriesParallelLayoutPortAssigner,
  SeriesParallelLayoutPortAssignmentMode,
  SeriesParallelLayoutRoutingStyle,
  StraightLineEdgeRouter
} from '@yfiles/yfiles'

import { LayoutConfiguration } from './LayoutConfiguration'

import {
  ComponentAttribute,
  Components,
  EnumValuesAttribute,
  LabelAttribute,
  MinMaxAttribute,
  OptionGroup,
  OptionGroupAttribute,
  TypeAttribute
} from '@yfiles/demo-resources/demo-option-editor'

enum NonSeriesParallelRoutingStyle {
  ORTHOGONAL,
  ORGANIC,
  STRAIGHT
}

/**
 * Configuration options for the layout algorithm of the same name.
 */
export const SeriesParallelLayoutConfig = (Class as any)('SeriesParallelLayoutConfig', {
  $extends: LayoutConfiguration,

  _meta: {
    generalGroup: [
      new LabelAttribute('General'),
      new OptionGroupAttribute('RootGroup', 10),
      new TypeAttribute(OptionGroup)
    ],
    edgesGroup: [
      new LabelAttribute('Edges'),
      new OptionGroupAttribute('RootGroup', 10),
      new TypeAttribute(OptionGroup)
    ],
    descriptionText: [
      new OptionGroupAttribute('descriptionGroup', 10),
      new ComponentAttribute(Components.HTML_BLOCK),
      new TypeAttribute(String)
    ],
    orientationItem: [
      new LabelAttribute(
        'Orientation',
        '#/api/SeriesParallelLayout#SeriesParallelLayout-property-layoutOrientation'
      ),
      new OptionGroupAttribute('generalGroup', 10),
      new EnumValuesAttribute([
        ['Top to Bottom', LayoutOrientation.TOP_TO_BOTTOM],
        ['Left to Right', LayoutOrientation.LEFT_TO_RIGHT],
        ['Bottom to Top', LayoutOrientation.BOTTOM_TO_TOP],
        ['Right to Left', LayoutOrientation.RIGHT_TO_LEFT]
      ]),
      new TypeAttribute(LayoutOrientation)
    ],
    parallelSubgraphAlignmentItem: [
      new LabelAttribute(
        'Parallel Subgraph Alignment',
        '#/api/SeriesParallelLayout#SeriesParallelLayout-property-parallelSubgraphAlignment'
      ),
      new OptionGroupAttribute('generalGroup', 20),
      new EnumValuesAttribute([
        ['Top', 0.0],
        ['Center', 0.5],
        ['Bottom', 1.0]
      ]),
      new TypeAttribute(Number)
    ],
    useDrawingAsSketchItem: [
      new LabelAttribute(
        'Use Drawing as Sketch',
        '#/api/SeriesParallelLayout#SeriesParallelLayout-property-fromSketchMode'
      ),
      new OptionGroupAttribute('generalGroup', 20),
      new TypeAttribute(Boolean)
    ],
    distanceGroup: [
      new LabelAttribute('Minimum Distances'),
      new OptionGroupAttribute('generalGroup', 30),
      new TypeAttribute(OptionGroup)
    ],
    minimumNodeToNodeDistanceItem: [
      new LabelAttribute(
        'Node Distance',
        '#/api/SeriesParallelLayout#SeriesParallelLayout-property-minimumNodeDistance'
      ),
      new MinMaxAttribute(0, 100),
      new OptionGroupAttribute('distanceGroup', 10),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumNodeToEdgeDistanceItem: [
      new LabelAttribute(
        'Node to Edge Distance',
        '#/api/SeriesParallelLayout#SeriesParallelLayout-property-minimumNodeToEdgeDistance'
      ),
      new MinMaxAttribute(0, 100),
      new OptionGroupAttribute('distanceGroup', 20),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumEdgeDistanceItem: [
      new LabelAttribute(
        'Edge Distance',
        '#/api/SeriesParallelLayout#SeriesParallelLayout-property-minimumEdgeDistance'
      ),
      new MinMaxAttribute(0, 100),
      new OptionGroupAttribute('distanceGroup', 30),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    labelingGroup: [
      new LabelAttribute('Labeling'),
      new OptionGroupAttribute('generalGroup', 40),
      new TypeAttribute(OptionGroup)
    ],
    considerNodeLabelsItem: [
      new LabelAttribute(
        'Consider Node Labels',
        '#/api/SeriesParallelLayout#SeriesParallelLayout-property-nodeLabelPlacement'
      ),
      new OptionGroupAttribute('labelingGroup', 20),
      new TypeAttribute(Boolean)
    ],
    placeEdgeLabelsItem: [
      new LabelAttribute(
        'Place Edge Labels',
        '#/api/SeriesParallelLayout#SeriesParallelLayout-property-edgeLabelPlacement'
      ),
      new OptionGroupAttribute('labelingGroup', 20),
      new TypeAttribute(Boolean)
    ],
    portStyleItem: [
      new LabelAttribute(
        'Port Style',
        '#/api/SeriesParallelLayoutPortAssigner#SeriesParallelLayoutPortAssigner-property-mode'
      ),
      new OptionGroupAttribute('edgesGroup', 10),
      new EnumValuesAttribute([
        ['Centered', SeriesParallelLayoutPortAssignmentMode.CENTER],
        ['Distributed', SeriesParallelLayoutPortAssignmentMode.DISTRIBUTED],
        ['Center on side', SeriesParallelLayoutPortAssignmentMode.CENTER_ON_SIDE],
        ['Distributed on side', SeriesParallelLayoutPortAssignmentMode.DISTRIBUTED_ON_SIDE]
      ]),
      new TypeAttribute(SeriesParallelLayoutPortAssignmentMode)
    ],
    routingStyleItem: [
      new LabelAttribute(
        'Routing Style',
        '#/api/SeriesParallelLayout#SeriesParallelLayout-property-edgeRoutingStyle'
      ),
      new OptionGroupAttribute('edgesGroup', 20),
      new EnumValuesAttribute([
        ['Orthogonal', SeriesParallelLayoutRoutingStyle.ORTHOGONAL],
        ['Octilinear', SeriesParallelLayoutRoutingStyle.OCTILINEAR],
        ['Polyline', SeriesParallelLayoutRoutingStyle.POLYLINE]
      ]),
      new TypeAttribute(SeriesParallelLayoutRoutingStyle)
    ],
    preferredOctilinearSegmentLengthItem: [
      new LabelAttribute(
        'Preferred Octilinear Segment Length',
        '#/api/SeriesParallelLayout#SeriesParallelLayout-property-preferredOctilinearSegmentLength'
      ),
      new OptionGroupAttribute('edgesGroup', 30),
      new MinMaxAttribute(0, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumPolylineSegmentLengthItem: [
      new LabelAttribute(
        'Minimum Polyline Segment Length',
        '#/api/SeriesParallelLayout#SeriesParallelLayout-property-minimumPolylineSegmentLength'
      ),
      new OptionGroupAttribute('edgesGroup', 40),
      new MinMaxAttribute(0, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumSlopeItem: [
      new MinMaxAttribute(0.0, 5.0, 0.01),
      new LabelAttribute(
        'Minimum Slope',
        '#/api/SeriesParallelLayout#SeriesParallelLayout-property-minimumSlope'
      ),
      new OptionGroupAttribute('edgesGroup', 50),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    routingStyleNonSeriesParallelItem: [
      new LabelAttribute(
        'Routing Style (Non-Series-Parallel Edges)',
        '#/api/SeriesParallelLayout#SeriesParallelLayout-property-nonSeriesParallelEdgeRouter'
      ),
      new OptionGroupAttribute('edgesGroup', 60),
      new EnumValuesAttribute([
        ['Orthogonal', NonSeriesParallelRoutingStyle.ORTHOGONAL],
        ['Organic', NonSeriesParallelRoutingStyle.ORGANIC],
        ['Straight-Line', NonSeriesParallelRoutingStyle.STRAIGHT]
      ]),
      new TypeAttribute(NonSeriesParallelRoutingStyle)
    ],
    minimumFirstSegmentLengthItem: [
      new LabelAttribute(
        'Minimum First Segment Length',
        '#/api/SeriesParallelLayoutEdgeDescriptor#SeriesParallelLayoutEdgeDescriptor-property-minimumFirstSegmentLength'
      ),
      new OptionGroupAttribute('edgesGroup', 80),
      new MinMaxAttribute(0, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumLastSegmentLengthItem: [
      new LabelAttribute(
        'Minimum Last Segment Length',
        '#/api/SeriesParallelLayoutEdgeDescriptor#SeriesParallelLayoutEdgeDescriptor-property-minimumLastSegmentLength'
      ),
      new OptionGroupAttribute('edgesGroup', 90),
      new MinMaxAttribute(0, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumEdgeLengthItem: [
      new LabelAttribute(
        'Minimum Edge Length',
        '#/api/SeriesParallelLayoutEdgeDescriptor#SeriesParallelLayoutEdgeDescriptor-property-minimumLength'
      ),
      new OptionGroupAttribute('edgesGroup', 100),
      new MinMaxAttribute(0, 100),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ]
  },

  constructor: function () {
    // @ts-ignore This is part of the old-school yFiles class definition used here
    LayoutConfiguration.call(this)
    const layout = new SeriesParallelLayout()
    const edgeDescriptor = layout.defaultEdgeDescriptor

    this.orientationItem = LayoutOrientation.TOP_TO_BOTTOM
    this.parallelSubgraphAlignmentItem = 0.5
    this.useDrawingAsSketchItem = layout.fromSketchMode
    this.minimumNodeToNodeDistanceItem = 30
    this.minimumNodeToEdgeDistanceItem = 15
    this.minimumEdgeDistanceItem = 15
    this.considerNodeLabelsItem = true
    this.placeEdgeLabelsItem = true

    this.portStyleItem = SeriesParallelLayoutPortAssignmentMode.CENTER
    this.routingStyleItem = SeriesParallelLayoutRoutingStyle.ORTHOGONAL
    this.preferredOctilinearSegmentLengthItem = layout.preferredOctilinearSegmentLength
    this.minimumPolylineSegmentLengthItem = layout.minimumPolylineSegmentLength
    this.minimumSlopeItem = layout.minimumSlope
    this.routingStyleNonSeriesParallelItem = NonSeriesParallelRoutingStyle.ORTHOGONAL
    this.minimumFirstSegmentLengthItem = edgeDescriptor.minimumFirstSegmentLength
    this.minimumLastSegmentLengthItem = edgeDescriptor.minimumLastSegmentLength
    this.minimumEdgeLengthItem = 20
    this.title = 'Series-Parallel Layout'
  },

  /**
   * Creates and configures a layout.
   * @param graphComponent The {@link GraphComponent} to apply the configuration on.
   * @returns The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent: GraphComponent): ILayoutAlgorithm {
    const layout = new SeriesParallelLayout()

    layout.layoutOrientation = this.orientationItem
    layout.parallelSubgraphAlignment = this.parallelSubgraphAlignmentItem
    layout.fromSketchMode = this.useDrawingAsSketchItem
    layout.minimumNodeDistance = this.minimumNodeToNodeDistanceItem
    layout.minimumNodeToEdgeDistance = this.minimumNodeToEdgeDistanceItem
    layout.minimumEdgeDistance = this.minimumEdgeDistanceItem
    layout.nodeLabelPlacement = this.considerNodeLabelsItem ? 'consider' : 'ignore'
    layout.edgeLabelPlacement = this.placeEdgeLabelsItem ? 'integrated' : 'ignore'

    const portAssignment = layout.defaultPortAssigner as SeriesParallelLayoutPortAssigner
    portAssignment.mode = this.portStyleItem

    layout.edgeRoutingStyle = this.routingStyleItem
    if (this.routingStyleItem === SeriesParallelLayoutRoutingStyle.OCTILINEAR) {
      layout.preferredOctilinearSegmentLength = this.preferredOctilinearSegmentLengthItem
    } else if (this.routingStyleItem === SeriesParallelLayoutRoutingStyle.POLYLINE) {
      layout.minimumPolylineSegmentLength = this.minimumPolylineSegmentLengthItem
      layout.minimumSlope = this.minimumSlopeItem
    }

    if (this.routingStyleNonSeriesParallelItem === NonSeriesParallelRoutingStyle.ORTHOGONAL) {
      layout.nonSeriesParallelEdgeRouter = new EdgeRouter({
        rerouting: true
      })
    } else if (this.routingStyleNonSeriesParallelItem === NonSeriesParallelRoutingStyle.ORGANIC) {
      layout.nonSeriesParallelEdgeRouter = new OrganicEdgeRouter()
    } else if (this.routingStyleNonSeriesParallelItem === NonSeriesParallelRoutingStyle.STRAIGHT) {
      layout.nonSeriesParallelEdgeRouter = new StraightLineEdgeRouter()
    }

    const edgeDescriptor = layout.defaultEdgeDescriptor
    edgeDescriptor.minimumFirstSegmentLength = this.minimumFirstSegmentLengthItem
    edgeDescriptor.minimumLastSegmentLength = this.minimumLastSegmentLengthItem
    edgeDescriptor.minimumLength = this.minimumEdgeLengthItem

    return layout
  },

  /** @type {OptionGroup} */
  generalGroup: null,

  /** @type {OptionGroup} */
  edgesGroup: null,

  /** @type {string} */
  descriptionText: {
    get: function () {
      return '<p>The series-parallel layout algorithm highlights the main direction or flow of a graph, similar to the hierarchical style. In comparison, this algorithm is usually faster but can be used only on special graphs, namely series-parallel graphs.</p>'
    }
  },

  /** @type {LayoutOrientation} */
  orientationItem: null,

  /** @type {number} */
  parallelSubgraphAlignmentItem: 0,

  /** @type {boolean} */
  useDrawingAsSketchItem: false,

  /** @type {OptionGroup} */
  distanceGroup: null,

  /** @type {number} */
  minimumNodeToNodeDistanceItem: 0,

  /** @type {number} */
  minimumNodeToEdgeDistanceItem: 0,

  /** @type {number} */
  minimumEdgeDistanceItem: 0,

  /** @type {OptionGroup} */
  labelingGroup: null,

  /** @type {boolean} */
  considerNodeLabelsItem: false,

  /** @type {boolean} */
  placeEdgeLabelsItem: false,

  /** @type {SeriesParallelLayoutPortAssignmentMode} */
  portStyleItem: null,

  /** @type {SeriesParallelLayoutRoutingStyle} */
  routingStyleItem: null,

  /** @type {number} */
  preferredOctilinearSegmentLengthItem: 0,

  /** @type {boolean} */
  shouldDisablePreferredOctilinearSegmentLengthItem: <any>{
    get: function () {
      return this.routingStyleItem !== SeriesParallelLayoutRoutingStyle.OCTILINEAR
    }
  },

  /** @type {number} */
  minimumPolylineSegmentLengthItem: 0,

  /** @type {boolean} */
  shouldDisableMinimumPolylineSegmentLengthItem: <any>{
    get: function () {
      return this.routingStyleItem !== SeriesParallelLayoutRoutingStyle.POLYLINE
    }
  },

  /** @type {number} */
  minimumSlopeItem: 0,

  /** @type {boolean} */
  shouldDisableMinimumSlopeItem: <any>{
    get: function () {
      return this.routingStyleItem !== SeriesParallelLayoutRoutingStyle.POLYLINE
    }
  },

  /** @type {string} */
  routingStyleNonSeriesParallelItem: null,

  /** @type {number} */
  minimumFirstSegmentLengthItem: 0,

  /** @type {number} */
  minimumLastSegmentLengthItem: 0,

  /** @type {number} */
  minimumEdgeLengthItem: 0
})
