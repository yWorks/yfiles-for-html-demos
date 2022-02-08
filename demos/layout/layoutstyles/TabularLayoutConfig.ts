/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Enum,
  GraphComponent,
  ILayoutAlgorithm,
  LayoutData,
  PartitionGrid,
  PartitionGridData,
  TabularLayout,
  TabularLayoutData,
  TabularLayoutNodeLayoutDescriptor,
  TabularLayoutPolicy,
  YBoolean,
  YNumber,
  YString
} from 'yfiles'

import LayoutConfiguration from './LayoutConfiguration'
import {
  ComponentAttribute,
  Components,
  EnumValuesAttribute,
  LabelAttribute,
  MinMaxAttribute,
  OptionGroup,
  OptionGroupAttribute,
  TypeAttribute
} from '../../resources/demo-option-editor'

/**
 * Configuration options for the layout algorithm of the same name.
 */
const TabularLayoutConfig = (Class as any)('TabularLayoutConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('TabularLayout')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    //@ts-ignore
    LayoutConfiguration.call(this)

    const layout = new TabularLayout()

    this.layoutPolicyItem = LayoutPolicies.AUTO_SIZE
    this.rowCountItem = 8
    this.columnCountItem = 12
    this.horizontalAlignmentItem = HorizontalAlignments.CENTER
    this.verticalAlignmentItem = HorizontalAlignments.CENTER
    this.considerNodeLabelsItem = layout.considerNodeLabels
    this.minimumRowHeightItem = 0
    this.minimumColumnWidthItem = 0
    this.cellInsetsItem = 5
    this.title = 'Tabular Layout'
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph#mapperRegistry} if necessary.
   * @param graphComponent The <code>GraphComponent</code> to apply the
   *   configuration on.
   * @return The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent: GraphComponent): ILayoutAlgorithm {
    const layout = new TabularLayout()

    switch (this.layoutPolicyItem) {
      case LayoutPolicies.AUTO_SIZE:
        layout.layoutPolicy = TabularLayoutPolicy.AUTO_SIZE
        break
      case LayoutPolicies.FIXED_TABLE_SIZE:
      case LayoutPolicies.SINGLE_ROW:
      case LayoutPolicies.SINGLE_COLUMN:
        layout.layoutPolicy = TabularLayoutPolicy.FIXED_SIZE
        break
      case LayoutPolicies.FROM_SKETCH:
        layout.layoutPolicy = TabularLayoutPolicy.FROM_SKETCH
        break
      default:
    }

    layout.considerNodeLabels = this.considerNodeLabelsItem

    return layout
  },

  /**
   * Creates and configures the layout data.
   * @return The configured layout data.
   */
  createConfiguredLayoutData: function (
    graphComponent: GraphComponent,
    layout: TabularLayout
  ): LayoutData {
    let horizontalAlignment
    switch (this.horizontalAlignmentItem) {
      default:
      case HorizontalAlignments.CENTER:
        horizontalAlignment = 0.5
        break
      case HorizontalAlignments.LEFT:
        horizontalAlignment = 0
        break
      case HorizontalAlignments.RIGHT:
        horizontalAlignment = 1
        break
    }
    let verticalAlignment
    switch (this.verticalAlignmentItem) {
      default:
      case VerticalAlignments.CENTER:
        verticalAlignment = 0.5
        break
      case VerticalAlignments.TOP:
        verticalAlignment = 0
        break
      case VerticalAlignments.BOTTOM:
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
      case LayoutPolicies.FIXED_TABLE_SIZE: {
        const rowCount = this.rowCountItem
        const columnCount = this.columnCountItem
        if (rowCount * columnCount >= nodeCount) {
          partitionGrid = new PartitionGrid(rowCount, columnCount)
        } else {
          // make sure partitionGrid has enough cells for all nodes
          partitionGrid = new PartitionGrid(nodeCount / columnCount, columnCount)
        }
        break
      }
      case LayoutPolicies.SINGLE_ROW:
        partitionGrid = new PartitionGrid(1, nodeCount)
        break
      case LayoutPolicies.SINGLE_COLUMN:
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
      partitionGridData: new PartitionGridData({ grid: partitionGrid })
    })
  },

  /** @type {OptionGroup} */
  GeneralGroup: {
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
    get: function (): string {
      return (
        "<p style='margin-top:0'>The tabular layout style arranges the nodes in rows and columns. This is a" +
        ' very simple layout which is useful when nodes should be placed under/next to each other.</p>' +
        '<p>Edges are ignored in this layout style. Their bends are removed.</p>'
      )
    }
  },

  /** @type {LayoutPolicies} */
  layoutPolicyItem: {
    $meta: function () {
      return [
        LabelAttribute('Layout Mode', '#/api/TabularLayout#TabularLayout-property-layoutPolicy'),
        OptionGroupAttribute('GeneralGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Automatic Table Size', LayoutPolicies.AUTO_SIZE],
            ['Single Row', LayoutPolicies.SINGLE_ROW],
            ['Single Column', LayoutPolicies.SINGLE_COLUMN],
            ['Fixed Table Size', LayoutPolicies.FIXED_TABLE_SIZE],
            ['From Sketch', LayoutPolicies.FROM_SKETCH]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {number} */
  rowCountItem: {
    $meta: function () {
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
    value: 1
  },

  /** @type {boolean} */
  shouldDisableRowCountItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.layoutPolicyItem !== LayoutPolicies.FIXED_TABLE_SIZE
    }
  },

  /** @type {number} */
  columnCountItem: {
    $meta: function () {
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
    value: 1
  },

  /** @type {boolean} */
  shouldDisableColumnCountItem: <any>{
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function (): boolean {
      return this.layoutPolicyItem !== LayoutPolicies.FIXED_TABLE_SIZE
    }
  },

  /** @type {boolean} */
  considerNodeLabelsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Consider Node Labels',
          '#/api/TabularLayout#TabularLayout-property-considerNodeLabels'
        ),
        OptionGroupAttribute('GeneralGroup', 40),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {HorizontalAlignments} */
  horizontalAlignmentItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('GeneralGroup', 50),
        LabelAttribute(
          'Horizontal Alignment',
          '#/api/TabularLayoutNodeLayoutDescriptor#TabularLayoutNodeLayoutDescriptor-property-horizontalAlignment'
        ),
        EnumValuesAttribute().init({
          values: [
            ['Left', HorizontalAlignments.LEFT],
            ['Center', HorizontalAlignments.CENTER],
            ['Right', HorizontalAlignments.RIGHT]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {VerticalAlignments} */
  verticalAlignmentItem: {
    $meta: function () {
      return [
        OptionGroupAttribute('GeneralGroup', 60),
        LabelAttribute(
          'Vertical Alignment',
          '#/api/TabularLayoutNodeLayoutDescriptor#TabularLayoutNodeLayoutDescriptor-property-verticalAlignment'
        ),
        EnumValuesAttribute().init({
          values: [
            ['Top', VerticalAlignments.TOP],
            ['Center', VerticalAlignments.CENTER],
            ['Bottom', VerticalAlignments.BOTTOM]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

  /** @type {number} */
  cellInsetsItem: {
    $meta: function () {
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
    value: 0
  },

  /** @type {number} */
  minimumRowHeightItem: {
    $meta: function () {
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
    value: 0
  },

  /** @type {number} */
  minimumColumnWidthItem: {
    $meta: function () {
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
    value: 0
  }
})
export default TabularLayoutConfig

enum LayoutPolicies {
  AUTO_SIZE,
  SINGLE_ROW,
  SINGLE_COLUMN,
  FIXED_TABLE_SIZE,
  FROM_SKETCH
}
enum HorizontalAlignments {
  LEFT,
  CENTER,
  RIGHT
}
enum VerticalAlignments {
  TOP,
  CENTER,
  BOTTOM
}
