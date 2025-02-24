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
  ComponentArrangementStyle,
  ComponentLayout,
  GraphComponent,
  ILayoutAlgorithm,
  Size
} from '@yfiles/yfiles'
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
} from '@yfiles/demo-resources/demo-option-editor'
/**
 * Configuration options for the layout algorithm of the same name.
 */
const ComponentLayoutConfig = Class('ComponentLayoutConfig', {
  $extends: LayoutConfiguration,
  _meta: {
    LayoutGroup: [
      new LabelAttribute('General'),
      new OptionGroupAttribute('RootGroup', 10),
      new TypeAttribute(OptionGroup)
    ],
    descriptionText: [
      new OptionGroupAttribute('DescriptionGroup', 10),
      new ComponentAttribute(Components.HTML_BLOCK),
      new TypeAttribute(String)
    ],
    styleItem: [
      new LabelAttribute('Layout Style', '#/api/ComponentLayout#ComponentLayout-property-style'),
      new OptionGroupAttribute('LayoutGroup', 10),
      new EnumValuesAttribute([
        ['No Arrangement', ComponentArrangementStyle.NONE],
        ['Fix Centers', ComponentArrangementStyle.KEEP_CENTERS],
        ['Try Keep Centers', ComponentArrangementStyle.TRY_KEEP_CENTERS],
        ['Multiple Rows', ComponentArrangementStyle.ROWS],
        ['Single Row', ComponentArrangementStyle.SINGLE_ROW],
        ['Single Column', ComponentArrangementStyle.SINGLE_COLUMN],
        ['Packed Rectangle', ComponentArrangementStyle.PACKED_RECTANGLE],
        ['Compact Rectangle', ComponentArrangementStyle.PACKED_COMPACT_RECTANGLE],
        ['Packed Circle', ComponentArrangementStyle.PACKED_CIRCLE],
        ['Compact Circle', ComponentArrangementStyle.PACKED_COMPACT_CIRCLE],
        ['Nested Rows', ComponentArrangementStyle.MULTI_ROWS],
        ['Compact Nested Rows', ComponentArrangementStyle.MULTI_ROWS_COMPACT],
        ['Width-constrained Nested Rows', ComponentArrangementStyle.MULTI_ROWS_WIDTH_CONSTRAINT],
        ['Height-constrained Nested Rows', ComponentArrangementStyle.MULTI_ROWS_HEIGHT_CONSTRAINT],
        [
          'Width-constrained Compact Nested Rows',
          ComponentArrangementStyle.MULTI_ROWS_WIDTH_CONSTRAINT_COMPACT
        ],
        [
          'Height-constrained Compact Nested Rows',
          ComponentArrangementStyle.MULTI_ROWS_HEIGHT_CONSTRAINT_COMPACT
        ]
      ]),
      new TypeAttribute(ComponentArrangementStyle)
    ],
    fromSketchItem: [
      new LabelAttribute(
        'Use Drawing as Sketch',
        '#/api/ComponentLayout#ComponentLayout-property-style'
      ),
      new OptionGroupAttribute('LayoutGroup', 30),
      new TypeAttribute(Boolean)
    ],
    useScreenRatioItem: [
      new LabelAttribute(
        'Use Screen Aspect Ratio',
        '#/api/ComponentLayout#ComponentLayout-property-preferredSize'
      ),
      new OptionGroupAttribute('LayoutGroup', 40),
      new TypeAttribute(Boolean)
    ],
    aspectRatioItem: [
      new LabelAttribute(
        'Aspect Ratio',
        '#/api/ComponentLayout#ComponentLayout-property-preferredSize'
      ),
      new OptionGroupAttribute('LayoutGroup', 50),
      new MinMaxAttribute(0.2, 5.0, 0.01),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    componentSpacingItem: [
      new LabelAttribute(
        'Minimum Component Distance',
        '#/api/ComponentLayout#ComponentLayout-property-componentSpacing'
      ),
      new OptionGroupAttribute('LayoutGroup', 60),
      new MinMaxAttribute(0.0, 400.0),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    gridEnabledItem: [
      new LabelAttribute(
        'Place on Grid',
        '#/api/ComponentLayout#ComponentLayout-property-gridSpacing'
      ),
      new OptionGroupAttribute('LayoutGroup', 70),
      new TypeAttribute(Boolean)
    ],
    gridSpacingItem: [
      new LabelAttribute(
        'Grid Spacing',
        '#/api/ComponentLayout#ComponentLayout-property-gridSpacing'
      ),
      new OptionGroupAttribute('LayoutGroup', 80),
      new MinMaxAttribute(2, 100),
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
    const layout = new ComponentLayout()
    this.styleItem = ComponentArrangementStyle.ROWS
    this.fromSketchItem = layout.fromSketchMode
    const size = layout.preferredSize
    this.useScreenRatioItem = true
    this.aspectRatioItem = size.width / size.height
    this.componentSpacingItem = layout.componentSpacing
    this.gridEnabledItem = layout.gridSpacing > 0
    this.gridSpacingItem = layout.gridSpacing > 0 ? layout.gridSpacing : 20.0
    this.title = 'Component Layout'
  },
  /**
   * Creates and configures a layout.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @returns The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent) {
    const layout = new ComponentLayout()
    layout.style = this.styleItem
    layout.fromSketchMode = this.fromSketchItem
    let w, h
    if (graphComponent !== null && this.useScreenRatioItem) {
      const canvasSize = graphComponent.innerSize
      w = canvasSize.width
      h = canvasSize.height
    } else {
      w = this.aspectRatioItem
      h = 1.0 / w
      w *= 400.0
      h *= 400.0
    }
    layout.preferredSize = new Size(w, h)
    layout.componentSpacing = this.componentSpacingItem
    layout.gridSpacing = this.gridEnabledItem ? this.gridSpacingItem : 0
    return layout
  },
  /** @type {OptionGroup} */
  LayoutGroup: {
    $meta: function () {
      return [
        new LabelAttribute('General'),
        new OptionGroupAttribute('RootGroup', 10),
        new TypeAttribute(OptionGroup)
      ]
    },
    value: null
  },
  /** @type {string} */
  descriptionText: {
    get: function () {
      return "<p style='margin-top:0'>The component layout arranges the connected components of a graph. It can use any other layout style to arrange each component separately, and then arranges the components as such.</p><p>In this demo, the arrangement of each component is just kept as it is.</p>"
    }
  },
  /** @type {ComponentArrangementStyle} */
  styleItem: null,
  /** @type {boolean} */
  fromSketchItem: false,
  /** @type {boolean} */
  useScreenRatioItem: false,
  /** @type {number} */
  aspectRatioItem: 0.2,
  /** @type {boolean} */
  shouldDisableAspectRatioItem: {
    get: function () {
      return this.useScreenRatioItem
    }
  },
  /** @type {number} */
  componentSpacingItem: 0,
  /** @type {boolean} */
  gridEnabledItem: false,
  /** @type {number} */
  gridSpacingItem: 2,
  /** @type {boolean} */
  shouldDisableGridSpacingItem: {
    get: function () {
      return !this.gridEnabledItem
    }
  }
})
export default ComponentLayoutConfig
