/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  BendConverter,
  Class,
  CompositeLayoutStage,
  GraphComponent,
  ILayoutAlgorithm,
  LayoutData,
  OrganicEdgeRouter,
  OrganicEdgeRouterData,
  RemoveOverlapsStage,
  SequentialLayout,
  YBoolean,
  YNumber,
  YString
} from 'yfiles'

import LayoutConfiguration from './LayoutConfiguration.js'
import {
  ComponentAttribute,
  Components,
  LabelAttribute,
  MinMaxAttribute,
  OptionGroup,
  OptionGroupAttribute,
  TypeAttribute
} from '../../resources/demo-option-editor.js'

/**
 * Configuration options for the layout algorithm of the same name.
 */
const OrganicEdgeRouterConfig = Class('OrganicEdgeRouterConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('OrganicEdgeRouter')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    LayoutConfiguration.call(this)
    const router = new OrganicEdgeRouter()
    this.selectionOnlyItem = false
    this.minimumNodeDistanceItem = router.minimumDistance
    this.keepBendsItem = router.keepExistingBends
    this.routeOnlyNecessaryItem = !router.routeAllEdges
    this.allowMovingNodesItem = false
    this.title = 'Organic Edge Router'
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph.mapperRegistry} if necessary.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @return The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent) {
    const router = new OrganicEdgeRouter()
    router.minimumDistance = this.minimumNodeDistanceItem
    router.keepExistingBends = this.keepBendsItem
    router.routeAllEdges = !this.routeOnlyNecessaryItem

    const layout = new SequentialLayout()
    if (this.allowMovingNodesItem) {
      // if we are allowed to move nodes, we can improve the routing results by temporarily enlarging nodes and
      // removing overlaps (this strategy ensures that there is enough space for the edges)
      const cls = new CompositeLayoutStage()
      cls.appendStage(router.createNodeEnlargementStage())
      cls.appendStage(new RemoveOverlapsStage(0))
      layout.appendLayout(cls)
    }
    if (router.keepExistingBends) {
      // we want to keep the original bends
      const bendConverter = new BendConverter()
      bendConverter.affectedEdgesDpKey = OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY
      bendConverter.adoptAffectedEdges = this.selectionOnlyItem
      bendConverter.coreLayout = router
      layout.appendLayout(bendConverter)
    } else {
      layout.appendLayout(router)
    }

    return layout
  },

  /**
   * Creates and configures the layout data.
   * @return The configured layout data.
   */
  createConfiguredLayoutData: function (graphComponent, layout) {
    if (this.selectionOnlyItem) {
      return new OrganicEdgeRouterData({
        affectedEdges: graphComponent.selection.selectedEdges
      })
    } else {
      return new OrganicEdgeRouterData()
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
      return "<p style='margin-top:0'>The organic edge routing algorithm routes edges in soft curves to ensure that they do not overlap with nodes. It is especially well suited for non-orthogonal, organic or circular diagrams.</p>"
    }
  },

  /** @type {boolean} */
  selectionOnlyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Route Selected Edges Only',
          '#/api/OrganicEdgeRouterData#OrganicEdgeRouterData-property-affectedEdges'
        ),
        OptionGroupAttribute('LayoutGroup', 10),
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
          'Minimum Distance',
          '#/api/OrganicEdgeRouter#OrganicEdgeRouter-property-minimumDistance'
        ),
        OptionGroupAttribute('LayoutGroup', 20),
        MinMaxAttribute().init({
          min: 0,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    value: 0
  },

  /** @type {boolean} */
  keepBendsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Keep Existing Bends',
          '#/api/OrganicEdgeRouter#OrganicEdgeRouter-property-keepExistingBends'
        ),
        OptionGroupAttribute('LayoutGroup', 30),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  routeOnlyNecessaryItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Route Only Necessary',
          '#/api/OrganicEdgeRouter#OrganicEdgeRouter-property-routeAllEdges'
        ),
        OptionGroupAttribute('LayoutGroup', 40),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  },

  /** @type {boolean} */
  allowMovingNodesItem: {
    $meta: function () {
      return [
        LabelAttribute('Allow Moving Nodes', '#/api/CompositeLayoutStage'),
        OptionGroupAttribute('LayoutGroup', 50),
        TypeAttribute(YBoolean.$class)
      ]
    },
    value: false
  }
})
export default OrganicEdgeRouterConfig
