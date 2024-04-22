/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
} from 'demo-resources/demo-option-editor'

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
    this.scopeItem = Scope.SCOPE_ALL_EDGES
    this.useSelectedEdgesAsMasterItem = false
    this.considerEdgeDirectionItem = router.directedMode
    this.useAdaptiveLineDistanceItem = router.adaptiveLineDistances
    this.lineDistanceItem = router.lineDistance | 0
    this.joinEndsItem = router.joinEnds
    this.joinDistanceItem = router.absJoinEndDistance
    this.title = 'Parallel Edge Router'
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph.mapperRegistry} if necessary.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @returns The configured layout algorithm.
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
   * Called by {@link LayoutConfiguration.apply} to create the layout data of the configuration. This
   * method is typically overridden to provide mappers for the different layouts.
   */
  createConfiguredLayoutData: function (graphComponent, layout) {
    const layoutData = new ParallelEdgeRouterData()
    const selection = graphComponent.selection

    if (this.scopeItem === Scope.SCOPE_AT_SELECTED_NODES) {
      layoutData.affectedEdges.delegate = (edge) =>
        selection.isSelected(edge.sourceNode) || selection.isSelected(edge.targetNode)
    } else if (this.scopeItem === Scope.SCOPE_SELECTED_EDGES) {
      layoutData.affectedEdges.items = selection.selectedEdges.toList()
    } else {
      layoutData.affectedEdges.delegate = (edge) => true
    }

    if (this.useSelectedEdgesAsMasterItem) {
      layoutData.leadingEdges.items = selection.selectedEdges.toList()
    }

    return layoutData
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

  /** @type {Scope} */
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
            ['All Edges', Scope.SCOPE_ALL_EDGES],
            ['Selected Edges', Scope.SCOPE_SELECTED_EDGES],
            ['Edges at Selected Nodes', Scope.SCOPE_AT_SELECTED_NODES]
          ]
        }),
        TypeAttribute(Enum.$class)
      ]
    },
    value: null
  },

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
    value: false
  },

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
    value: false
  },

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
    value: false
  },

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
    value: 0
  },

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
    value: false
  },

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
    value: 0
  },

  /** @type {boolean} */
  shouldDisableJoinDistanceItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return !this.joinEndsItem
    }
  }
})
export default ParallelEdgeRouterConfig

/**
 * @readonly
 * @enum {number}
 */
const Scope = {
  SCOPE_ALL_EDGES: 0,
  SCOPE_SELECTED_EDGES: 1,
  SCOPE_AT_SELECTED_NODES: 2
}
