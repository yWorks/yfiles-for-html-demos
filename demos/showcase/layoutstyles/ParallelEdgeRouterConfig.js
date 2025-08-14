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
  GraphComponent,
  ILayoutAlgorithm,
  LayoutData,
  ParallelEdgeRouter,
  ParallelEdgeRouterData
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

var Scope
;(function (Scope) {
  Scope[(Scope['SCOPE_ALL_EDGES'] = 0)] = 'SCOPE_ALL_EDGES'
  Scope[(Scope['SCOPE_SELECTED_EDGES'] = 1)] = 'SCOPE_SELECTED_EDGES'
  Scope[(Scope['SCOPE_AT_SELECTED_NODES'] = 2)] = 'SCOPE_AT_SELECTED_NODES'
})(Scope || (Scope = {}))

/**
 * Configuration options for the layout algorithm of the same name.
 */
export const ParallelEdgeRouterConfig = Class('ParallelEdgeRouterConfig', {
  $extends: LayoutConfiguration,

  _meta: {
    descriptionText: [
      new OptionGroupAttribute('DescriptionGroup', 10),
      new ComponentAttribute(Components.HTML_BLOCK),
      new TypeAttribute(String)
    ],
    LayoutGroup: [
      new LabelAttribute('General'),
      new OptionGroupAttribute('RootGroup', 10),
      new TypeAttribute(OptionGroup)
    ],
    scopeItem: [
      new LabelAttribute(
        'Scope',
        '#/api/ParallelEdgeRouterData#ParallelEdgeRouterData-property-affectedEdges'
      ),
      new OptionGroupAttribute('LayoutGroup', 10),
      new EnumValuesAttribute([
        ['All Edges', Scope.SCOPE_ALL_EDGES],
        ['Selected Edges', Scope.SCOPE_SELECTED_EDGES],
        ['Edges at Selected Nodes', Scope.SCOPE_AT_SELECTED_NODES]
      ]),
      new TypeAttribute(Scope)
    ],
    useSelectedEdgesAsMasterItem: [
      new LabelAttribute(
        'Use Selected Edges As Leading Edges',
        '#/api/ParallelEdgeRouterData#ParallelEdgeRouterData-property-leadingEdges'
      ),
      new OptionGroupAttribute('LayoutGroup', 20),
      new TypeAttribute(Boolean)
    ],
    considerEdgeDirectionItem: [
      new LabelAttribute(
        'Consider Edge Direction',
        '#/api/ParallelEdgeRouter#ParallelEdgeRouter-property-directedMode'
      ),
      new OptionGroupAttribute('LayoutGroup', 30),
      new TypeAttribute(Boolean)
    ],
    useAdaptiveEdgeDistanceItem: [
      new LabelAttribute(
        'Use Adaptive Edge Distance',
        '#/api/ParallelEdgeRouter#ParallelEdgeRouter-property-adaptiveEdgeDistances'
      ),
      new OptionGroupAttribute('LayoutGroup', 40),
      new TypeAttribute(Boolean)
    ],
    edgeDistanceItem: [
      new LabelAttribute(
        'Line Distance',
        '#/api/ParallelEdgeRouter#ParallelEdgeRouter-property-edgeDistance'
      ),
      new OptionGroupAttribute('LayoutGroup', 50),
      new MinMaxAttribute(0, 50),
      new ComponentAttribute(Components.SLIDER),
      new TypeAttribute(Number)
    ],
    joinEndsItem: [
      new LabelAttribute(
        'Join Ends',
        '#/api/ParallelEdgeRouter#ParallelEdgeRouter-property-joinEnds'
      ),
      new OptionGroupAttribute('LayoutGroup', 60),
      new TypeAttribute(Boolean)
    ],
    joinDistanceItem: [
      new LabelAttribute(
        'Join Distance',
        '#/api/ParallelEdgeRouter#ParallelEdgeRouter-property-absoluteJoinEndDistance'
      ),
      new OptionGroupAttribute('LayoutGroup', 70),
      new MinMaxAttribute(0, 50),
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
    const router = new ParallelEdgeRouter()
    this.scopeItem = Scope.SCOPE_ALL_EDGES
    this.useSelectedEdgesAsMasterItem = false
    this.considerEdgeDirectionItem = router.directedMode
    this.useAdaptiveEdgeDistanceItem = router.adaptiveEdgeDistances
    this.edgeDistanceItem = router.edgeDistance | 0
    this.joinEndsItem = router.joinEnds
    this.joinDistanceItem = router.absoluteJoinEndDistance
    this.title = 'Parallel Edge Router'
  },

  /**
   * Creates and configures a layout.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @returns The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent) {
    const router = new ParallelEdgeRouter()
    router.adjustLeadingEdge = false
    router.directedMode = this.considerEdgeDirectionItem
    router.adaptiveEdgeDistances = this.useAdaptiveEdgeDistanceItem
    router.edgeDistance = this.edgeDistanceItem
    router.joinEnds = this.joinEndsItem
    router.absoluteJoinEndDistance = this.joinDistanceItem

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
      layoutData.affectedEdges = (edge) =>
        selection.includes(edge.sourceNode) || selection.includes(edge.targetNode)
    } else if (this.scopeItem === Scope.SCOPE_SELECTED_EDGES) {
      layoutData.affectedEdges = selection.edges.toList()
    } else {
      layoutData.affectedEdges = () => true
    }

    if (this.useSelectedEdgesAsMasterItem) {
      layoutData.leadingEdges = selection.edges.toList()
    }

    return layoutData
  },

  /** @type {string} */
  descriptionText: {
    get: function () {
      return "<p style='margin-top:0'>The parallel edge routing algorithm routes parallel edges which connect the same pair of nodes in a graph. It is often used as layout stage for other layout algorithms to handle the parallel edges for those.</p>"
    }
  },

  /** @type {OptionGroup} */
  LayoutGroup: null,

  /** @type {Scope} */
  scopeItem: null,

  /** @type {boolean} */
  useSelectedEdgesAsMasterItem: false,

  /** @type {boolean} */
  considerEdgeDirectionItem: false,

  /** @type {boolean} */
  useAdaptiveEdgeDistanceItem: false,

  /** @type {number} */
  edgeDistanceItem: 0,

  /** @type {boolean} */
  joinEndsItem: false,

  /** @type {number} */
  joinDistanceItem: 0,

  /** @type {boolean} */
  shouldDisableJoinDistanceItem: {
    get: function () {
      return !this.joinEndsItem
    }
  }
})
