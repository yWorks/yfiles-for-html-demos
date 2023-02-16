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
  Class,
  CompactDiskLayout,
  Enum,
  FreeNodeLabelModel,
  GraphComponent,
  ILayoutAlgorithm,
  LayoutData,
  NodeLabelingPolicy,
  OrganicLayout,
  RecursiveGroupLayout,
  RecursiveGroupLayoutData,
  YBoolean,
  YNumber,
  YString
} from 'yfiles'

import LayoutConfiguration, { NodeLabelingPolicies } from './LayoutConfiguration.js'
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
const CompactDiskLayoutConfig = Class('CompactDiskLayoutConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('CompactDiskLayout')],

  constructor: function () {
    LayoutConfiguration.call(this)
    const layout = new CompactDiskLayout()

    this.useDrawingAsSketchItem = layout.fromSketchMode
    this.minimumNodeDistanceItem = layout.minimumNodeDistance
    this.nodeLabelingStyleItem = NodeLabelingPolicies.NONE
    this.layoutGroupsItem = GroupLayout.NONE

    this.title = 'Compact Disk Layout'
  },

  /**
   * Creates and configures a layout.
   * @param graphComponent The {@link GraphComponent} to apply the configuration on.
   * @returns The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent) {
    if (
      this.layoutGroupsItem === GroupLayout.RECURSIVE &&
      graphComponent.graph.nodes.some(n => graphComponent.graph.isGroupNode(n))
    ) {
      // if the recursive group layout option is enabled, use RecursiveGroupLayout with organic for
      // the top-level hierarchy - the actual compact disk layout will be specified as layout for
      // each group content in function createConfiguredLayoutData
      return new RecursiveGroupLayout({
        coreLayout: new OrganicLayout({
          deterministic: true,
          nodeOverlapsAllowed: false,
          minimumNodeDistance: this.minimumNodeDistanceItem
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
  createConfiguredLayoutData: function (graphComponent, layout) {
    if (this.layoutGroupsItem === GroupLayout.RECURSIVE) {
      const compactDiskLayout = this.createCompactDiskLayout(graphComponent)
      return new RecursiveGroupLayoutData({
        groupNodeLayouts: compactDiskLayout
      })
    }
    return undefined
  },

  /**
   * Creates and configures the actual compact disk layout algorithm.
   * @returns The configured compact disk layout.
   */
  createCompactDiskLayout: function (graphComponent) {
    const layout = new CompactDiskLayout()

    layout.fromSketchMode = this.useDrawingAsSketchItem

    layout.minimumNodeDistance = this.minimumNodeDistanceItem

    switch (this.nodeLabelingStyleItem) {
      case NodeLabelingPolicies.NONE:
        layout.considerNodeLabels = false
        break
      case NodeLabelingPolicies.RAYLIKE_LEAVES:
        layout.integratedNodeLabeling = true
        layout.nodeLabelingPolicy = NodeLabelingPolicy.RAY_LIKE_LEAVES
        break
      case NodeLabelingPolicies.CONSIDER_CURRENT_POSITION:
        layout.considerNodeLabels = true
        break
      case NodeLabelingPolicies.HORIZONTAL:
        layout.integratedNodeLabeling = true
        layout.nodeLabelingPolicy = NodeLabelingPolicy.HORIZONTAL
        break
      default:
        layout.considerNodeLabels = false
        break
    }

    if (
      this.nodeLabelingStyleItem === NodeLabelingPolicies.RAYLIKE_LEAVES ||
      this.nodeLabelingStyleItem === NodeLabelingPolicies.HORIZONTAL
    ) {
      graphComponent.graph.nodeLabels.forEach(label => {
        graphComponent.graph.setLabelLayoutParameter(
          label,
          FreeNodeLabelModel.INSTANCE.findBestParameter(
            label,
            FreeNodeLabelModel.INSTANCE,
            label.layout
          )
        )
      })
    }

    return layout
  },

  /** @type {OptionGroup} */
  generalGroup: {
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
  labelingGroup: {
    $meta: function () {
      return [
        LabelAttribute('Labeling'),
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
        OptionGroupAttribute('descriptionGroup', 10),
        ComponentAttribute(Components.HTML_BLOCK),
        TypeAttribute(YString.$class)
      ]
    },
    get: function () {
      return "<p>The nodes are arranged on a disk such that the disk's radius is minimized.</p><p>The layout mostly optimizes the dense placement of the nodes, while edges play a minor role. Hence, the compact disk layout is mostly suitable for graphs with small components whose loosely connected nodes should be grouped and packed in a small area.</p>"
    }
  },

  /** @type {boolean} */
  useDrawingAsSketchItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Use Drawing as Sketch',
          '#/api/CompactDiskLayout#CompactDiskLayout-property-fromSketchMode'
        ),
        OptionGroupAttribute('generalGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {number} */
  minimumNodeDistanceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Node Distance',
          '#/api/CompactDiskLayout#CompactDiskLayout-property-minimumNodeDistance'
        ),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        OptionGroupAttribute('generalGroup', 30),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {GroupLayout} */
  layoutGroupsItem: {
    $meta: function () {
      return [
        LabelAttribute('Layout Groups', '#/api/RecursiveGroupLayout'),
        OptionGroupAttribute('generalGroup', 40),
        EnumValuesAttribute().init({
          values: [
            ['Ignore Groups', GroupLayout.NONE],
            ['Layout Recursively', GroupLayout.RECURSIVE]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {NodeLabelingPolicies} */
  nodeLabelingStyleItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Node Labeling',
          '#/api/CompactDiskLayout#CompactDiskLayout-property-nodeLabelingPolicy'
        ),
        OptionGroupAttribute('labelingGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Ignore Labels', NodeLabelingPolicies.NONE],
            ['Consider Labels', NodeLabelingPolicies.CONSIDER_CURRENT_POSITION],
            ['Horizontal', NodeLabelingPolicies.HORIZONTAL],
            ['Ray-like at Leaves', NodeLabelingPolicies.RAYLIKE_LEAVES]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  }
})
export default CompactDiskLayoutConfig

/**
 * @readonly
 * @enum {number}
 */
const GroupLayout = {
  NONE: 0,
  RECURSIVE: 1
}
