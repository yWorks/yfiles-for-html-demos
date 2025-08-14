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
  FreeNodeLabelModel,
  GraphComponent,
  ILayoutAlgorithm,
  LayoutData,
  LayoutGrid,
  NodeLabelPlacement,
  TabularLayout,
  TabularLayoutData,
  TabularLayoutMode,
  TabularLayoutNodeDescriptor
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

/**
 * Configuration options for the layout algorithm of the same name.
 */
export const TabularLayoutConfig = (Class as any)('TabularLayoutConfig', {
  $extends: LayoutConfiguration,

  _meta: {
    GeneralGroup: [
      new LabelAttribute('General'),
      new OptionGroupAttribute('RootGroup', 10),
      new TypeAttribute(OptionGroup)
    ],
    descriptionText: [
      new OptionGroupAttribute('DescriptionGroup', 10),
      new ComponentAttribute(Components.HTML_BLOCK),
      new TypeAttribute(String)
    ],
    layoutModeItem: [
      new LabelAttribute('Layout Mode', '#/api/TabularLayout#TabularLayout-property-layoutMode'),
      new OptionGroupAttribute('GeneralGroup', 10),
      new EnumValuesAttribute([
        ['Automatic Table Size', LayoutPolicies.AUTO_SIZE],
        ['Single Row', LayoutPolicies.SINGLE_ROW],
        ['Single Column', LayoutPolicies.SINGLE_COLUMN],
        ['Fixed Table Size', LayoutPolicies.FIXED_TABLE_SIZE],
        ['From Sketch', LayoutPolicies.FROM_SKETCH]
      ]),
      new TypeAttribute(LayoutPolicies)
    ],
    rowCountItem: [
      new LabelAttribute('Row Count', '#/api/LayoutGrid#LayoutGrid-constructor-LayoutGrid'),
      new OptionGroupAttribute('GeneralGroup', 20),
      new MinMaxAttribute(1, 200, 1),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    columnCountItem: [
      new LabelAttribute('Column Count', '#/api/LayoutGrid#LayoutGrid-constructor-LayoutGrid'),
      new OptionGroupAttribute('GeneralGroup', 30),
      new MinMaxAttribute(1, 200, 1),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    nodeLabelingItem: [
      new LabelAttribute(
        'Node Labeling',
        '#/api/TabularLayout#TabularLayout-property-nodeLabelPlacement'
      ),
      new EnumValuesAttribute([
        ['Consider', NodeLabelPlacement.CONSIDER],
        ['Generic', NodeLabelPlacement.GENERIC],
        ['Ignore', NodeLabelPlacement.IGNORE]
      ]),
      new OptionGroupAttribute('GeneralGroup', 40),
      new TypeAttribute(NodeLabelPlacement)
    ],
    horizontalAlignmentItem: [
      new OptionGroupAttribute('GeneralGroup', 50),
      new LabelAttribute(
        'Horizontal Alignment',
        '#/api/TabularLayoutNodeDescriptor#TabularLayoutNodeDescriptor-property-horizontalAlignment'
      ),
      new EnumValuesAttribute([
        ['Left', HorizontalAlignments.LEFT],
        ['Center', HorizontalAlignments.CENTER],
        ['Right', HorizontalAlignments.RIGHT]
      ]),
      new TypeAttribute(HorizontalAlignments)
    ],
    verticalAlignmentItem: [
      new OptionGroupAttribute('GeneralGroup', 60),
      new LabelAttribute(
        'Vertical Alignment',
        '#/api/TabularLayoutNodeDescriptor#TabularLayoutNodeDescriptor-property-verticalAlignment'
      ),
      new EnumValuesAttribute([
        ['Top', VerticalAlignments.TOP],
        ['Center', VerticalAlignments.CENTER],
        ['Bottom', VerticalAlignments.BOTTOM]
      ]),
      new TypeAttribute(VerticalAlignments)
    ],
    cellPaddingItem: [
      new LabelAttribute('Cell Padding (all sides)', '#/api/LayoutGridRow'),
      new OptionGroupAttribute('GeneralGroup', 70),
      new MinMaxAttribute(0, 50, 1),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumRowHeightItem: [
      new LabelAttribute(
        'Minimum Row Height',
        '#/api/LayoutGridRow#LayoutGridRow-property-minimumHeight'
      ),
      new OptionGroupAttribute('GeneralGroup', 80),
      new MinMaxAttribute(0, 100, 1),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    minimumColumnWidthItem: [
      new LabelAttribute(
        'Minimum Column Width',
        '#/api/LayoutGridColumn#LayoutGridColumn-property-minimumWidth'
      ),
      new OptionGroupAttribute('GeneralGroup', 90),
      new MinMaxAttribute(0, 100, 1),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ]
  },

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    // @ts-ignore This is part of the old-school yFiles class definition used here
    LayoutConfiguration.call(this)

    const layout = new TabularLayout()

    this.layoutModeItem = LayoutPolicies.AUTO_SIZE
    this.rowCountItem = 8
    this.columnCountItem = 12
    this.horizontalAlignmentItem = HorizontalAlignments.CENTER
    this.verticalAlignmentItem = HorizontalAlignments.CENTER
    this.nodeLabelingItem = layout.nodeLabelPlacement
    this.minimumRowHeightItem = 0
    this.minimumColumnWidthItem = 0
    this.cellPaddingItem = 5
    this.title = 'Tabular Layout'
  },

  /**
   * Creates and configures a layout.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @returns The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent: GraphComponent): ILayoutAlgorithm {
    const layout = new TabularLayout()

    switch (this.layoutModeItem) {
      case LayoutPolicies.AUTO_SIZE:
        layout.layoutMode = TabularLayoutMode.AUTO_SIZE
        break
      case LayoutPolicies.FIXED_TABLE_SIZE:
      case LayoutPolicies.SINGLE_ROW:
      case LayoutPolicies.SINGLE_COLUMN:
        layout.layoutMode = TabularLayoutMode.FIXED_SIZE
        break
      case LayoutPolicies.FROM_SKETCH:
        layout.layoutMode = TabularLayoutMode.FROM_SKETCH
        break
      default:
    }

    layout.nodeLabelPlacement = this.nodeLabelingItem
    if (this.nodeLabelingItem === NodeLabelPlacement.GENERIC) {
      graphComponent.graph.nodeLabels.forEach((label) => {
        graphComponent.graph.setLabelLayoutParameter(
          label,
          FreeNodeLabelModel.INSTANCE.findBestParameter(label, label.layout)
        )
      })
    }

    return layout
  },

  /**
   * Creates and configures the layout data.
   * @returns The configured layout data.
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
    const nodeDescriptor = new TabularLayoutNodeDescriptor({
      horizontalAlignment,
      verticalAlignment
    })

    const nodeCount = graphComponent.graph.nodes.size
    let layoutGrid: LayoutGrid
    switch (this.layoutModeItem) {
      case LayoutPolicies.FIXED_TABLE_SIZE: {
        const rowCount = this.rowCountItem
        const columnCount = this.columnCountItem
        if (rowCount * columnCount >= nodeCount) {
          layoutGrid = new LayoutGrid(rowCount, columnCount)
        } else {
          // make sure layoutGrid has enough cells for all nodes
          layoutGrid = new LayoutGrid(nodeCount / columnCount, columnCount)
        }
        break
      }
      case LayoutPolicies.SINGLE_ROW:
        layoutGrid = new LayoutGrid(1, nodeCount)
        break
      case LayoutPolicies.SINGLE_COLUMN:
        layoutGrid = new LayoutGrid(nodeCount, 1)
        break
      default:
        layoutGrid = new LayoutGrid(1, 1)
    }

    const minimumRowHeight = this.minimumRowHeightItem
    const minimumColumnWidth = this.minimumColumnWidthItem
    const cellPadding = this.cellPaddingItem
    layoutGrid.rows.forEach((row) => {
      row.minimumHeight = minimumRowHeight
      row.topPadding = cellPadding
      row.bottomPadding = cellPadding
    })
    layoutGrid.columns.forEach((column) => {
      column.minimumWidth = minimumColumnWidth
      column.leftPadding = cellPadding
      column.rightPadding = cellPadding
    })

    const tabularLayoutData = new TabularLayoutData({ nodeDescriptors: nodeDescriptor })
    tabularLayoutData.layoutGridData.layoutGridCellDescriptors = () =>
      layoutGrid.createDynamicCellDescriptor()
    return tabularLayoutData
  },

  /** @type {OptionGroup} */
  GeneralGroup: null,

  /** @type {string} */
  descriptionText: {
    get: function (): string {
      return (
        "<p style='margin-top:0'>The tabular layout style arranges the nodes in rows and columns. This is a" +
        ' very simple layout which is useful when nodes should be placed under/next to each other.</p>' +
        '<p>Edges are ignored in this layout style. Their bends are removed.</p>'
      )
    }
  },

  /** @type {LayoutPolicies} */
  layoutModeItem: null,

  /** @type {number} */
  rowCountItem: 1,

  /** @type {boolean} */
  shouldDisableRowCountItem: <any>{
    get: function (): boolean {
      return this.layoutModeItem !== LayoutPolicies.FIXED_TABLE_SIZE
    }
  },

  /** @type {number} */
  columnCountItem: 1,

  /** @type {boolean} */
  shouldDisableColumnCountItem: <any>{
    get: function (): boolean {
      return this.layoutModeItem !== LayoutPolicies.FIXED_TABLE_SIZE
    }
  },

  /** @type {NodeLabelPlacement} */
  nodeLabelingItem: false,

  /** @type {HorizontalAlignments} */
  horizontalAlignmentItem: null,

  /** @type {VerticalAlignments} */
  verticalAlignmentItem: null,

  /** @type {number} */
  cellPaddingItem: 0,

  /** @type {number} */
  minimumRowHeightItem: 0,

  /** @type {number} */
  minimumColumnWidthItem: 0
})
