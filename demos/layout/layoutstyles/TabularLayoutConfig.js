/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

/*eslint-disable*/
;(function(r) {
  ;(function(f) {
    if ('function' == typeof define && define.amd) {
      define(['yfiles/lang', 'yfiles/view-component', 'LayoutConfiguration.js'], f)
    } else {
      f(r.yfiles.lang, r.yfiles)
    }
  })((lang, yfiles) => {
    const demo = yfiles.module('demo')
    yfiles.module('demo', exports => {
      /**
       * Configuration options for the layout algorithm of the same name.
       * @class
       * @extends demo.LayoutConfiguration
       */
      exports.TabularLayoutConfig = new yfiles.lang.ClassDefinition(() => {
        /** @lends {demo.TabularLayoutConfig.prototype} */
        return {
          $extends: demo.LayoutConfiguration,

          $meta: [demo.options.LabelAttribute('TabularLayout')],

          /**
           * Setup default values for various configuration parameters.
           */
          constructor: function() {
            demo.LayoutConfiguration.call(this)

            const layout = new yfiles.layout.TabularLayout()

            this.layoutPolicyItem = demo.TabularLayoutConfig.EnumLayoutPolicies.AUTO_SIZE
            this.rowCountItem = 8
            this.columnCountItem = 12
            this.horizontalAlignmentItem = demo.TabularLayoutConfig.EnumHorizontalAlignments.CENTER
            this.verticalAlignmentItem = demo.TabularLayoutConfig.EnumHorizontalAlignments.CENTER
            this.considerNodeLabelsItem = layout.considerNodeLabels
            this.minimumRowHeightItem = 0
            this.minimumColumnWidthItem = 0
            this.cellInsetsItem = 5
          },

          /**
           * Creates and configures a layout and the graph's {@link yfiles.graph.IGraph#mapperRegistry} if necessary.
           * @param {yfiles.view.GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
           *   configuration on.
           * @return {yfiles.layout.ILayoutAlgorithm} The configured layout algorithm.
           */
          createConfiguredLayout: function(graphComponent) {
            const layout = new yfiles.layout.TabularLayout()

            switch (this.layoutPolicyItem) {
              case demo.TabularLayoutConfig.EnumLayoutPolicies.AUTO_SIZE:
                layout.layoutPolicy = yfiles.layout.TabularLayoutPolicy.AUTO_SIZE
                break
              case demo.TabularLayoutConfig.EnumLayoutPolicies.FIXED_TABLE_SIZE:
              case demo.TabularLayoutConfig.EnumLayoutPolicies.SINGLE_ROW:
              case demo.TabularLayoutConfig.EnumLayoutPolicies.SINGLE_COLUMN:
                layout.layoutPolicy = yfiles.layout.TabularLayoutPolicy.FIXED_SIZE
                break
              case demo.TabularLayoutConfig.EnumLayoutPolicies.FROM_SKETCH:
                layout.layoutPolicy = yfiles.layout.TabularLayoutPolicy.FROM_SKETCH
                break
              default:
            }

            layout.considerNodeLabels = this.considerNodeLabelsItem

            return layout
          },

          /**
           * Creates and configures the layout data.
           * @return {yfiles.layout.LayoutData} The configured layout data.
           */
          createConfiguredLayoutData: function(graphComponent, layout) {
            const nodeLayoutDescriptor = new yfiles.layout.TabularNodeLayoutDescriptor()
            switch (this.horizontalAlignmentItem) {
              default:
              case demo.TabularLayoutConfig.EnumHorizontalAlignments.CENTER:
                nodeLayoutDescriptor.horizontalAlignment = 0.5
                break
              case demo.TabularLayoutConfig.EnumHorizontalAlignments.LEFT:
                nodeLayoutDescriptor.horizontalAlignment = 0
                break
              case demo.TabularLayoutConfig.EnumHorizontalAlignments.RIGHT:
                nodeLayoutDescriptor.horizontalAlignment = 1
                break
            }
            switch (this.verticalAlignmentItem) {
              default:
              case demo.TabularLayoutConfig.EnumVerticalAlignments.CENTER:
                nodeLayoutDescriptor.verticalAlignment = 0.5
                break
              case demo.TabularLayoutConfig.EnumVerticalAlignments.TOP:
                nodeLayoutDescriptor.verticalAlignment = 0
                break
              case demo.TabularLayoutConfig.EnumVerticalAlignments.BOTTOM:
                nodeLayoutDescriptor.verticalAlignment = 1
                break
            }

            const nodeCount = graphComponent.graph.nodes.size
            let partitionGrid
            switch (this.layoutPolicyItem) {
              case demo.TabularLayoutConfig.EnumLayoutPolicies.FIXED_TABLE_SIZE:
                const rowCount = this.rowCountItem
                const columnCount = this.columnCountItem
                if (rowCount * columnCount >= nodeCount) {
                  partitionGrid = new yfiles.layout.PartitionGrid(rowCount, columnCount)
                } else {
                  // make sure partitionGrid has enough cells for all nodes
                  partitionGrid = new yfiles.layout.PartitionGrid(
                    nodeCount / columnCount,
                    columnCount
                  )
                }
                break
              case demo.TabularLayoutConfig.EnumLayoutPolicies.SINGLE_ROW:
                partitionGrid = new yfiles.layout.PartitionGrid(1, nodeCount)
                break
              case demo.TabularLayoutConfig.EnumLayoutPolicies.SINGLE_COLUMN:
                partitionGrid = new yfiles.layout.PartitionGrid(nodeCount, 1)
                break
              default:
                partitionGrid = new yfiles.layout.PartitionGrid(1, 1)
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

            const layoutData = new yfiles.layout.TabularLayoutData()
            layoutData.nodeLayoutDescriptors.constant = nodeLayoutDescriptor
            layoutData.partitionGridData.grid = partitionGrid

            return layoutData
          },

          // ReSharper disable InconsistentNaming
          // ReSharper disable UnusedMember.Global
          /** @type {demo.options.OptionGroup} */
          DescriptionGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Description'),
                demo.options.OptionGroupAttribute('RootGroup', 5),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          GeneralGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('General'),
                demo.options.OptionGroupAttribute('RootGroup', 10),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
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
                demo.options.OptionGroupAttribute('DescriptionGroup', 10),
                demo.options.ComponentAttribute(demo.options.Components.HTML_BLOCK),
                demo.options.TypeAttribute(yfiles.lang.String.$class)
              ]
            },
            get: function() {
              return (
                "<p style='margin-top:0'>The tabular layout style arranges the nodes in rows and columns. This is a" +
                ' very simple layout which is useful when nodes should be placed under/next to each other.</p>' +
                '<p>Edges are ignored in this layout style. Their bends are removed.</p>'
              )
            }
          },

          /**
           * Backing field for below property
           * @type {demo.TabularLayoutConfig.EnumLayoutPolicies}
           */
          $layoutPolicyItem: null,

          /** @type {demo.TabularLayoutConfig.EnumLayoutPolicies} */
          layoutPolicyItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Layout Mode',
                  '#/api/yfiles.layout.TabularLayout#TabularLayout-property-layoutPolicy'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Automatic Table Size', demo.TabularLayoutConfig.EnumLayoutPolicies.AUTO_SIZE],
                    ['Single Row', demo.TabularLayoutConfig.EnumLayoutPolicies.SINGLE_ROW],
                    ['Single Column', demo.TabularLayoutConfig.EnumLayoutPolicies.SINGLE_COLUMN],
                    [
                      'Fixed Table Size',
                      demo.TabularLayoutConfig.EnumLayoutPolicies.FIXED_TABLE_SIZE
                    ],
                    ['From Sketch', demo.TabularLayoutConfig.EnumLayoutPolicies.FROM_SKETCH]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.layout.TabularLayoutPolicy.$class)
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
                demo.options.LabelAttribute(
                  'Row Count',
                  '#/api/yfiles.layout.PartitionGrid#PartitionGrid-constructor-PartitionGrid(number,number)'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 20),
                demo.options.MinMaxAttribute().init({
                  min: 1,
                  max: 200,
                  step: 1
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
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
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return (
                this.layoutPolicyItem !==
                demo.TabularLayoutConfig.EnumLayoutPolicies.FIXED_TABLE_SIZE
              )
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
                demo.options.LabelAttribute(
                  'Column Count',
                  '#/api/yfiles.layout.PartitionGrid#PartitionGrid-constructor-PartitionGrid(number,number)'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 30),
                demo.options.MinMaxAttribute().init({
                  min: 1,
                  max: 200,
                  step: 1
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
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
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return (
                this.layoutPolicyItem !==
                demo.TabularLayoutConfig.EnumLayoutPolicies.FIXED_TABLE_SIZE
              )
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
                demo.options.LabelAttribute(
                  'Consider Node Labels',
                  '#/api/yfiles.layout.TabularLayout#TabularLayout-property-considerNodeLabels'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 40),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
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
           * @type {demo.TabularLayoutConfig.EnumHorizontalAlignments}
           */
          $horizontalAlignmentItem: null,

          /** @type {demo.TabularLayoutConfig.EnumHorizontalAlignments} */
          horizontalAlignmentItem: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('GeneralGroup', 50),
                demo.options.LabelAttribute(
                  'Horizontal Alignment',
                  '#/api/yfiles.layout.TabularNodeLayoutDescriptor#TabularNodeLayoutDescriptor-property-horizontalAlignment'
                ),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Left', demo.TabularLayoutConfig.EnumHorizontalAlignments.LEFT],
                    ['Center', demo.TabularLayoutConfig.EnumHorizontalAlignments.CENTER],
                    ['Right', demo.TabularLayoutConfig.EnumHorizontalAlignments.RIGHT]
                  ]
                }),
                demo.options.TypeAttribute(demo.TabularLayoutConfig.EnumHorizontalAlignments.$class)
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
           * @type {demo.TabularLayoutConfig.EnumVerticalAlignments}
           */
          $verticalAlignmentItem: null,

          /** @type {demo.TabularLayoutConfig.EnumVerticalAlignments} */
          verticalAlignmentItem: {
            $meta: function() {
              return [
                demo.options.OptionGroupAttribute('GeneralGroup', 60),
                demo.options.LabelAttribute(
                  'Vertical Alignment',
                  '#/api/yfiles.layout.TabularNodeLayoutDescriptor#TabularNodeLayoutDescriptor-property-verticalAlignment'
                ),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Top', demo.TabularLayoutConfig.EnumVerticalAlignments.TOP],
                    ['Center', demo.TabularLayoutConfig.EnumVerticalAlignments.CENTER],
                    ['Bottom', demo.TabularLayoutConfig.EnumVerticalAlignments.BOTTOM]
                  ]
                }),
                demo.options.TypeAttribute(demo.TabularLayoutConfig.EnumVerticalAlignments.$class)
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
                demo.options.LabelAttribute(
                  'Cell Insets (all sides)',
                  '#/api/yfiles.layout.RowDescriptor'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 70),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 50,
                  step: 1
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
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
                demo.options.LabelAttribute(
                  'Minimum Row Height',
                  '#/api/yfiles.layout.RowDescriptor#RowDescriptor-property-minimumHeight'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 80),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100,
                  step: 1
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
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
                demo.options.LabelAttribute(
                  'Minimum Column Width',
                  '#/api/yfiles.layout.ColumnDescriptor#ColumnDescriptor-property-minimumWidth'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 90),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100,
                  step: 1
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$minimumColumnWidthItem
            },
            set: function(value) {
              this.$minimumColumnWidthItem = value
            }
          },

          /** @lends {demo.TabularLayoutConfig} */
          $static: {
            EnumLayoutPolicies: new yfiles.lang.EnumDefinition(() => {
              return {
                AUTO_SIZE: 0,
                SINGLE_ROW: 1,
                SINGLE_COLUMN: 2,
                FIXED_TABLE_SIZE: 3,
                FROM_SKETCH: 4
              }
            }),
            EnumHorizontalAlignments: new yfiles.lang.EnumDefinition(() => {
              return {
                LEFT: 0,
                CENTER: 1,
                RIGHT: 2
              }
            }),
            EnumVerticalAlignments: new yfiles.lang.EnumDefinition(() => {
              return {
                TOP: 0,
                CENTER: 1,
                BOTTOM: 2
              }
            })
          }
        }
      })
    })
    return yfiles.module('demo')
  })
})(
  'undefined' !== typeof window
    ? window
    : 'undefined' !== typeof global
      ? global
      : 'undefined' !== typeof self
        ? self
        : this
)
