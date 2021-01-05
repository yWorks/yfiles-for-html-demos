/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ParallelEdgeRouter,
  ParallelEdgeRouterData,
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
const ParallelEdgeRouterConfig = Class('ParallelEdgeRouterConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('ParallelEdgeRouter')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    LayoutConfiguration.call(this)
    const router = new ParallelEdgeRouter()
    this.scopeItem = ParallelEdgeRouterConfig.EnumScope.SCOPE_ALL_EDGES
    this.useSelectedEdgesAsMasterItem = false
    this.considerEdgeDirectionItem = router.directedMode
    this.useAdaptiveLineDistanceItem = router.adaptiveLineDistances
    this.lineDistanceItem = router.lineDistance | 0
    this.joinEndsItem = router.joinEnds
    this.joinDistanceItem = router.absJoinEndDistance
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph#mapperRegistry} if necessary.
   * @param {GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
   *   configuration on.
   * @return {ILayoutAlgorithm} The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent) {
    const router = new ParallelEdgeRouter()
    router.adjustLeadingEdge = false
    router.directedMode = this.considerEdgeDirectionItem
    router.adaptiveLineDistances = this.useAdaptiveLineDistanceItem
    router.lineDistance = this.lineDistanceItem
    router.joinEnds = this.joinEndsItem
    router.absJoinEndDistance = this.joinDistanceItem

    return router
  },

  /**
   * Called by {@link LayoutConfiguration#apply} to create the layout data of the configuration. This
   * method is typically overridden to provide mappers for the different layouts.
   */
  createConfiguredLayoutData: function (graphComponent, layout) {
    const layoutData = new ParallelEdgeRouterData()
    const selection = graphComponent.selection

    if (this.scopeItem === ParallelEdgeRouterConfig.EnumScope.SCOPE_AT_SELECTED_NODES) {
      layoutData.affectedEdges = edge =>
        selection.isSelected(edge.sourceNode) || selection.isSelected(edge.targetNode)
    } else if (this.scopeItem === ParallelEdgeRouterConfig.EnumScope.SCOPE_SELECTED_EDGES) {
      layoutData.affectedEdges = selection.selectedEdges
    } else {
      layoutData.affectedEdges = edge => true
    }

    if (this.useSelectedEdgesAsMasterItem) {
      layoutData.leadingEdges = selection.selectedEdges
    }

    return layoutData
  },

  // ReSharper disable UnusedMember.Global
  // ReSharper disable InconsistentNaming

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
      return "<p style='margin-top:0'>The parallel edge routing algorithm routes parallel edges which connect the same pair of nodes in a graph. It is often used as layout stage for other layout algorithms to handle the parallel edges for those.</p>"
    }
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

  /**
   * Backing field for below property
   * @type {ParallelEdgeRouterConfig.EnumScope}
   */
  $scopeItem: null,

  /** @type {ParallelEdgeRouterConfig.EnumScope} */
  scopeItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Scope',
          '#/api/ParallelEdgeRouterData#ParallelEdgeRouterData-property-affectedEdges'
        ),
        OptionGroupAttribute('LayoutGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['All Edges', ParallelEdgeRouterConfig.EnumScope.SCOPE_ALL_EDGES],
            ['Selected Edges', ParallelEdgeRouterConfig.EnumScope.SCOPE_SELECTED_EDGES],
            ['Edges at Selected Nodes', ParallelEdgeRouterConfig.EnumScope.SCOPE_AT_SELECTED_NODES]
          ]
        }),
        TypeAttribute(ParallelEdgeRouterConfig.EnumScope.$class)
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
   * @type {boolean}
   */
  $useSelectedEdgesAsMasterItem: false,

  /** @type {boolean} */
  useSelectedEdgesAsMasterItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Use Selected Edges As Leading Edges',
          '#/api/ParallelEdgeRouterData#ParallelEdgeRouterData-property-leadingEdges'
        ),
        OptionGroupAttribute('LayoutGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$useSelectedEdgesAsMasterItem
    },
    set: function (value) {
      this.$useSelectedEdgesAsMasterItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $considerEdgeDirectionItem: false,

  /** @type {boolean} */
  considerEdgeDirectionItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Consider Edge Direction',
          '#/api/ParallelEdgeRouter#ParallelEdgeRouter-property-directedMode'
        ),
        OptionGroupAttribute('LayoutGroup', 30),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$considerEdgeDirectionItem
    },
    set: function (value) {
      this.$considerEdgeDirectionItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $useAdaptiveLineDistanceItem: false,

  /** @type {boolean} */
  useAdaptiveLineDistanceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Use Adaptive Line Distance',
          '#/api/ParallelEdgeRouter#ParallelEdgeRouter-property-adaptiveLineDistances'
        ),
        OptionGroupAttribute('LayoutGroup', 40),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$useAdaptiveLineDistanceItem
    },
    set: function (value) {
      this.$useAdaptiveLineDistanceItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $lineDistanceItem: 0,

  /** @type {number} */
  lineDistanceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Line Distance',
          '#/api/ParallelEdgeRouter#ParallelEdgeRouter-property-lineDistance'
        ),
        OptionGroupAttribute('LayoutGroup', 50),
        MinMaxAttribute().init({
          min: 0,
          max: 50
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$lineDistanceItem
    },
    set: function (value) {
      this.$lineDistanceItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $joinEndsItem: false,

  /** @type {boolean} */
  joinEndsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Join Ends',
          '#/api/ParallelEdgeRouter#ParallelEdgeRouter-property-joinEnds'
        ),
        OptionGroupAttribute('LayoutGroup', 60),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$joinEndsItem
    },
    set: function (value) {
      this.$joinEndsItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $joinDistanceItem: 0,

  /** @type {number} */
  joinDistanceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Join Distance',
          '#/api/ParallelEdgeRouter#ParallelEdgeRouter-property-absJoinEndDistance'
        ),
        OptionGroupAttribute('LayoutGroup', 70),
        MinMaxAttribute().init({
          min: 0,
          max: 50
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$joinDistanceItem
    },
    set: function (value) {
      this.$joinDistanceItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableJoinDistanceItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return !this.joinEndsItem
    }
  },

  $static: {
    // ReSharper restore UnusedMember.Global
    // ReSharper restore InconsistentNaming
    EnumScope: new EnumDefinition(() => {
      return {
        SCOPE_ALL_EDGES: 0,
        SCOPE_SELECTED_EDGES: 1,
        SCOPE_AT_SELECTED_NODES: 2
      }
    })
  }
})
export default ParallelEdgeRouterConfig
