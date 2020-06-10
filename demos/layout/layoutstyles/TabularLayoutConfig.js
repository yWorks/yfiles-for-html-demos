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
  EnumDefinition,
  GraphComponent,
  PartitionGrid,
  TabularLayout,
  TabularLayoutData,
  TabularLayoutNodeLayoutDescriptor,
  TabularLayoutPolicy,
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
const TabularLayoutConfig = Class('TabularLayoutConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('TabularLayout')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function() {
    LayoutConfiguration.call(this)

    const layout = new TabularLayout()

    this.layoutPolicyItem = TabularLayoutConfig.EnumLayoutPolicies.AUTO_SIZE
    this.rowCountItem = 8
    this.columnCountItem = 12
    this.horizontalAlignmentItem = TabularLayoutConfig.EnumHorizontalAlignments.CENTER
    this.verticalAlignmentItem = TabularLayoutConfig.EnumHorizontalAlignments.CENTER
    this.considerNodeLabelsItem = layout.considerNodeLabels
    this.minimumRowHeightItem = 0
    this.minimumColumnWidthItem = 0
    this.cellInsetsItem = 5
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph#mapperRegistry} if necessary.
   * @param {GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
   *   configuration on.
   * @return {ILayoutAlgorithm} The configured layout algorithm.
   */
  createConfiguredLayout: function(graphComponent) {
    const layout = new TabularLayout()

    switch (this.layoutPolicyItem) {
      case TabularLayoutConfig.EnumLayoutPolicies.AUTO_SIZE:
        layout.layoutPolicy = TabularLayoutPolicy.AUTO_SIZE
        break
      case TabularLayoutConfig.EnumLayoutPolicies.FIXED_TABLE_SIZE:
      case TabularLayoutConfig.EnumLayoutPolicies.SINGLE_ROW:
      case TabularLayoutConfig.EnumLayoutPolicies.SINGLE_COLUMN:
        layout.layoutPolicy = TabularLayoutPolicy.FIXED_SIZE
        break
      case TabularLayoutConfig.EnumLayoutPolicies.FROM_SKETCH:
        layout.layoutPolicy = TabularLayoutPolicy.FROM_SKETCH
        break
      default:
    }

    layout.considerNodeLabels = this.considerNodeLabelsItem

    return layout
  },

  /**
   * Creates and configures the layout data.
   * @return {LayoutData} The configured layout data.
   */
  createConfiguredLayoutData: function(graphComponent, layout) {
    let horizontalAlignment
    switch (this.horizontalAlignmentItem) {
      default:
      case TabularLayoutConfig.EnumHorizontalAlignments.CENTER:
        horizontalAlignment = 0.5
        break
      case TabularLayoutConfig.EnumHorizontalAlignments.LEFT:
        horizontalAlignment = 0
        break
      case TabularLayoutConfig.EnumHorizontalAlignments.RIGHT:
        horizontalAlignment = 1
        break
    }
    let verticalAlignment
    switch (this.verticalAlignmentItem) {
      default:
      case TabularLayoutConfig.EnumVerticalAlignments.CENTER:
        verticalAlignment = 0.5
        break
      case TabularLayoutConfig.EnumVerticalAlignments.TOP:
        verticalAlignment = 0
        break
      case TabularLayoutConfig.EnumVerticalAlignments.BOTTOM:
        verticalAlignment = 1
        break
    }
    const nodeLayoutDescriptor = new TabularLayoutNodeLayoutDescriptor({
      horizontalAlignment,
      verticalAlignment
    })

    const nodeCount = graphComponent.graph.nodes.size
    let partitionGrid
    switch (this.layoutPolicyItem) {
      case TabularLayoutConfig.EnumLayoutPolicies.FIXED_TABLE_SIZE:
        const rowCount = this.rowCountItem
        const columnCount = this.columnCountItem
        if (rowCount * columnCount >= nodeCount) {
          partitionGrid = new PartitionGrid(rowCount, columnCount)
        } else {
          // make sure partitionGrid has enough cells for all nodes
          partitionGrid = new PartitionGrid(nodeCount / columnCount, columnCount)
        }
        break
      case TabularLayoutConfig.EnumLayoutPolicies.SINGLE_ROW:
        partitionGrid = new PartitionGrid(1, nodeCount)
        break
      case TabularLayoutConfig.EnumLayoutPolicies.SINGLE_COLUMN:
        partitionGrid = new PartitionGrid(nodeCount, 1)
        break
      default:
        partitionGrid = new PartitionGrid(1, 1)
    }

    const minimumRowHeight = this.minimumRowHeightItem
    const minimumColumnWidth = this.minimumColumnWidthItem
    const cellInsets = this.cellInsetsItem
    partitionGrid.rows.forEach(row => {
      row.minimumHeight = minimumRowHeight
      row.topInset = cellInsets
      row.bottomInset = cellInsets
    })
    partitionGrid.columns.forEach(column => {
      column.minimumWidth = minimumColumnWidth
      column.leftInset = cellInsets
      column.rightInset = cellInsets
    })

    return new TabularLayoutData({
      nodeLayoutDescriptors: nodeLayoutDescriptor,
      partitionGridData: { grid: partitionGrid }
    })
  },

  // ReSharper disable InconsistentNaming
  // ReSharper disable UnusedMember.Global
  /** @type {OptionGroup} */
  DescriptionGroup: {
    $meta: function() {
      return [
        LabelAttribute('Description'),
        OptionGroupAttribute('RootGroup', 5),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  GeneralGroup: {
    $meta: function() {
      return [
        LabelAttribute('General'),
        OptionGroupAttribute('RootGroup', 10),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  // ReSharper restore UnusedMember.Global
  // ReSharper restore InconsistentNaming
  /** @type {string} */
  descriptionText: {
    $meta: function() {
      return [
        OptionGroupAttribute('DescriptionGroup', 10),
        ComponentAttribute(Components.HTML_BLOCK),
        TypeAttribute(YString.$class)
      ]
    },
    get: function() {
      return (
        ("<p style='margin-top:0'>The tabular layout style arranges the nodes in rows and columns. This is a" +
        ' very simple layout which is useful when nodes should be placed under/next to each other.</p>' +
        '<p>Edges are ignored in this layout style. Their bends are removed.</p>')
      )
    }
  },

  /**
   * Backing field for below property
   * @type {TabularLayoutConfig.EnumLayoutPolicies}
   */
  $layoutPolicyItem: null,

  /** @type {TabularLayoutConfig.EnumLayoutPolicies} */
  layoutPolicyItem: {
    $meta: function() {
      return [
        LabelAttribute('Layout Mode', '#/api/TabularLayout#TabularLayout-property-layoutPolicy'),
        OptionGroupAttribute('GeneralGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Automatic Table Size', TabularLayoutConfig.EnumLayoutPolicies.AUTO_SIZE],
            ['Single Row', TabularLayoutConfig.EnumLayoutPolicies.SINGLE_ROW],
            ['Single Column', TabularLayoutConfig.EnumLayoutPolicies.SINGLE_COLUMN],
            ['Fixed Table Size', TabularLayoutConfig.EnumLayoutPolicies.FIXED_TABLE_SIZE],
            ['From Sketch', TabularLayoutConfig.EnumLayoutPolicies.FROM_SKETCH]
          ]
        }),
        TypeAttribute(TabularLayoutPolicy.$class)
      ]
    },
    get: function() {
      return this.$layoutPolicyItem
    },
    set: function(value) {
      this.$layoutPolicyItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $rowCountItem: 0,

  /** @type {number} */
  rowCountItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Row Count',
          '#/api/PartitionGrid#PartitionGrid-constructor-PartitionGrid(number,number)'
        ),
        OptionGroupAttribute('GeneralGroup', 20),
        MinMaxAttribute().init({
          min: 1,
          max: 200,
          step: 1
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$rowCountItem
    },
    set: function(value) {
      this.$rowCountItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableRowCountItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.layoutPolicyItem !== TabularLayoutConfig.EnumLayoutPolicies.FIXED_TABLE_SIZE
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $columnCountItem: 1,

  /** @type {number} */
  columnCountItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Column Count',
          '#/api/PartitionGrid#PartitionGrid-constructor-PartitionGrid(number,number)'
        ),
        OptionGroupAttribute('GeneralGroup', 30),
        MinMaxAttribute().init({
          min: 1,
          max: 200,
          step: 1
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$columnCountItem
    },
    set: function(value) {
      this.$columnCountItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableColumnCountItem: {
    $meta: function() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.layoutPolicyItem !== TabularLayoutConfig.EnumLayoutPolicies.FIXED_TABLE_SIZE
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
          '#/api/TabularLayout#TabularLayout-property-considerNodeLabels'
        ),
        OptionGroupAttribute('GeneralGroup', 40),
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
   * @type {TabularLayoutConfig.EnumHorizontalAlignments}
   */
  $horizontalAlignmentItem: null,

  /** @type {TabularLayoutConfig.EnumHorizontalAlignments} */
  horizontalAlignmentItem: {
    $meta: function() {
      return [
        OptionGroupAttribute('GeneralGroup', 50),
        LabelAttribute(
          'Horizontal Alignment',
          '#/api/TabularLayoutNodeLayoutDescriptor#TabularLayoutNodeLayoutDescriptor-property-horizontalAlignment'
        ),
        EnumValuesAttribute().init({
          values: [
            ['Left', TabularLayoutConfig.EnumHorizontalAlignments.LEFT],
            ['Center', TabularLayoutConfig.EnumHorizontalAlignments.CENTER],
            ['Right', TabularLayoutConfig.EnumHorizontalAlignments.RIGHT]
          ]
        }),
        TypeAttribute(TabularLayoutConfig.EnumHorizontalAlignments.$class)
      ]
    },
    get: function() {
      return this.$horizontalAlignmentItem
    },
    set: function(value) {
      this.$horizontalAlignmentItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {TabularLayoutConfig.EnumVerticalAlignments}
   */
  $verticalAlignmentItem: null,

  /** @type {TabularLayoutConfig.EnumVerticalAlignments} */
  verticalAlignmentItem: {
    $meta: function() {
      return [
        OptionGroupAttribute('GeneralGroup', 60),
        LabelAttribute(
          'Vertical Alignment',
          '#/api/TabularLayoutNodeLayoutDescriptor#TabularLayoutNodeLayoutDescriptor-property-verticalAlignment'
        ),
        EnumValuesAttribute().init({
          values: [
            ['Top', TabularLayoutConfig.EnumVerticalAlignments.TOP],
            ['Center', TabularLayoutConfig.EnumVerticalAlignments.CENTER],
            ['Bottom', TabularLayoutConfig.EnumVerticalAlignments.BOTTOM]
          ]
        }),
        TypeAttribute(TabularLayoutConfig.EnumVerticalAlignments.$class)
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
   * @type {number}
   */
  $cellInsetsItem: 0,

  /** @type {number} */
  cellInsetsItem: {
    $meta: function() {
      return [
        LabelAttribute('Cell Insets (all sides)', '#/api/RowDescriptor'),
        OptionGroupAttribute('GeneralGroup', 70),
        MinMaxAttribute().init({
          min: 0,
          max: 50,
          step: 1
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$cellInsetsItem
    },
    set: function(value) {
      this.$cellInsetsItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumRowHeightItem: 0,

  /** @type {number} */
  minimumRowHeightItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Minimum Row Height',
          '#/api/RowDescriptor#RowDescriptor-property-minimumHeight'
        ),
        OptionGroupAttribute('GeneralGroup', 80),
        MinMaxAttribute().init({
          min: 0,
          max: 100,
          step: 1
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$minimumRowHeightItem
    },
    set: function(value) {
      this.$minimumRowHeightItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumColumnWidthItem: 0,

  /** @type {number} */
  minimumColumnWidthItem: {
    $meta: function() {
      return [
        LabelAttribute(
          'Minimum Column Width',
          '#/api/ColumnDescriptor#ColumnDescriptor-property-minimumWidth'
        ),
        OptionGroupAttribute('GeneralGroup', 90),
        MinMaxAttribute().init({
          min: 0,
          max: 100,
          step: 1
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function() {
      return this.$minimumColumnWidthItem
    },
    set: function(value) {
      this.$minimumColumnWidthItem = value
    }
  },

  $static: {
    EnumLayoutPolicies: new EnumDefinition(() => {
      return {
        AUTO_SIZE: 0,
        SINGLE_ROW: 1,
        SINGLE_COLUMN: 2,
        FIXED_TABLE_SIZE: 3,
        FROM_SKETCH: 4
      }
    }),
    EnumHorizontalAlignments: new EnumDefinition(() => {
      return {
        LEFT: 0,
        CENTER: 1,
        RIGHT: 2
      }
    }),
    EnumVerticalAlignments: new EnumDefinition(() => {
      return {
        TOP: 0,
        CENTER: 1,
        BOTTOM: 2
      }
    })
  }
})
export default TabularLayoutConfig
