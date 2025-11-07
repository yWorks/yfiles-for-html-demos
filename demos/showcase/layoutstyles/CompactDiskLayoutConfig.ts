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
  CompactDiskLayout,
  FreeNodeLabelModel,
  type GraphComponent,
  type ILayoutAlgorithm,
  type LayoutData,
  OrganicLayout,
  RadialNodeLabelPlacement,
  RecursiveGroupLayout,
  RecursiveGroupLayoutData
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

const GroupLayout = { NONE: 0, RECURSIVE: 1 }

/**
 * Configuration options for the layout algorithm of the same name.
 */
export const CompactDiskLayoutConfig = (Class as any)('CompactDiskLayoutConfig', {
  $extends: LayoutConfiguration,

  _meta: {
    generalGroup: [
      new LabelAttribute('General'),
      new OptionGroupAttribute('RootGroup', 10),
      new TypeAttribute(OptionGroup)
    ],
    labelingGroup: [
      new LabelAttribute('Labeling'),
      new OptionGroupAttribute('RootGroup', 20),
      new TypeAttribute(OptionGroup)
    ],
    descriptionText: [
      new OptionGroupAttribute('descriptionGroup', 10),
      new ComponentAttribute('html-block'),
      new TypeAttribute(String)
    ],
    useDrawingAsSketchItem: [
      new LabelAttribute(
        'Use Drawing as Sketch',
        '#/api/CompactDiskLayout#CompactDiskLayout-property-fromSketchMode'
      ),
      new OptionGroupAttribute('generalGroup', 20),
      new TypeAttribute(Boolean)
    ],
    minimumNodeDistanceItem: [
      new LabelAttribute(
        'Minimum Node Distance',
        '#/api/CompactDiskLayout#CompactDiskLayout-property-minimumNodeDistance'
      ),
      new MinMaxAttribute(0, 100),
      new OptionGroupAttribute('generalGroup', 30),
      new ComponentAttribute('slider'),
      new TypeAttribute(Number)
    ],
    layoutGroupsItem: [
      new LabelAttribute('Layout Groups', '#/api/RecursiveGroupLayout'),
      new OptionGroupAttribute('generalGroup', 40),
      new EnumValuesAttribute([
        ['Ignore Groups', 'none'],
        ['Layout Recursively', 'recursive']
      ]),
      new TypeAttribute(GroupLayout)
    ],
    nodeLabelingStyleItem: [
      new LabelAttribute(
        'Node Labeling',
        '#/api/CompactDiskLayout#CompactDiskLayout-property-nodeLabelPlacement'
      ),
      new OptionGroupAttribute('labelingGroup', 10),
      new EnumValuesAttribute([
        ['Ignore Labels', RadialNodeLabelPlacement.IGNORE],
        ['Consider Labels', RadialNodeLabelPlacement.CONSIDER],
        ['Generic', RadialNodeLabelPlacement.GENERIC],
        ['Horizontal', RadialNodeLabelPlacement.HORIZONTAL],
        ['Ray-like at Leaves', RadialNodeLabelPlacement.RAY_LIKE_LEAVES],
        ['Ray-like', RadialNodeLabelPlacement.RAY_LIKE]
      ]),
      new TypeAttribute(RadialNodeLabelPlacement)
    ]
  },

  constructor: function () {
    // @ts-ignore This is part of the old-school yFiles class definition used here
    LayoutConfiguration.call(this)
    const layout = new CompactDiskLayout()

    this.useDrawingAsSketchItem = layout.fromSketchMode
    this.minimumNodeDistanceItem = layout.minimumNodeDistance
    this.nodeLabelingStyleItem = layout.nodeLabelPlacement
    this.layoutGroupsItem = 'none'

    this.title = 'Compact Disk Layout'
  },

  /**
   * Creates and configures a layout.
   * @param graphComponent The {@link GraphComponent} to apply the configuration on.
   * @returns The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent: GraphComponent): ILayoutAlgorithm {
    if (
      this.layoutGroupsItem === 'recursive' &&
      graphComponent.graph.nodes.some((n) => graphComponent.graph.isGroupNode(n))
    ) {
      // if the recursive group layout option is enabled, use RecursiveGroupLayout with organic for
      // the top-level hierarchy - the actual compact disk layout will be specified as layout for
      // each group content in function createConfiguredLayoutData
      return new RecursiveGroupLayout({
        coreLayout: new OrganicLayout({
          deterministic: true,
          allowNodeOverlaps: false,
          defaultMinimumNodeDistance: this.minimumNodeDistanceItem
        }),
        fromSketchMode: this.useDrawingAsSketchItem
      })
    }

    // just use plain CompactDiskLayout
    return this.createCompactDiskLayout(graphComponent)
  },

  /**
   * Creates and configures the layout data.
   * @returns The configured layout data.
   */
  createConfiguredLayoutData: function (
    graphComponent: GraphComponent,
    layout: ILayoutAlgorithm
  ): LayoutData | undefined {
    if (this.layoutGroupsItem === 'recursive') {
      const compactDiskLayout = this.createCompactDiskLayout(graphComponent)
      return new RecursiveGroupLayoutData({ groupNodeLayouts: compactDiskLayout })
    }
    return undefined
  },

  /**
   * Creates and configures the actual compact disk layout algorithm.
   * @returns The configured compact disk layout.
   */
  createCompactDiskLayout: function (graphComponent: GraphComponent): CompactDiskLayout {
    const layout = new CompactDiskLayout()

    layout.fromSketchMode = this.useDrawingAsSketchItem

    layout.minimumNodeDistance = this.minimumNodeDistanceItem

    layout.nodeLabelPlacement = this.nodeLabelingStyleItem

    if (
      this.nodeLabelingStyleItem !== RadialNodeLabelPlacement.IGNORE &&
      this.nodeLabelingStyleItem !== RadialNodeLabelPlacement.CONSIDER
    ) {
      graphComponent.graph.nodeLabels.forEach((label) => {
        graphComponent.graph.setLabelLayoutParameter(
          label,
          FreeNodeLabelModel.INSTANCE.findBestParameter(label, label.layout)
        )
      })
    }

    return layout
  },

  /** @type {OptionGroup} */
  generalGroup: null,

  /** @type {OptionGroup} */
  labelingGroup: null,

  /** @type {string} */
  descriptionText: {
    get: function () {
      return "<p>The nodes are arranged on a disk such that the disk's radius is minimized.</p><p>The layout mostly optimizes the dense placement of the nodes, while edges play a minor role. Hence, the compact disk layout is mostly suitable for graphs with small components whose loosely connected nodes should be grouped and packed in a small area.</p>"
    }
  },

  /** @type {boolean} */
  useDrawingAsSketchItem: false,

  /** @type {number} */
  minimumNodeDistanceItem: 0,

  /** @type {GroupLayout} */
  layoutGroupsItem: null,

  /** @type {RadialNodeLabelPlacement} */
  nodeLabelingStyleItem: null
})
