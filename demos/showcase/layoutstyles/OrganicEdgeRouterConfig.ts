/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  type GraphComponent,
  type ILayoutAlgorithm,
  type LayoutData,
  OrganicEdgeRouter,
  OrganicEdgeRouterData
} from '@yfiles/yfiles'

import { LayoutConfiguration } from './LayoutConfiguration'
import {
  ComponentAttribute,
  LabelAttribute,
  MinMaxAttribute,
  OptionGroup,
  OptionGroupAttribute,
  TypeAttribute
} from '@yfiles/demo-app/demo-option-editor'

/**
 * Configuration options for the layout algorithm of the same name.
 */
export const OrganicEdgeRouterConfig = (Class as any)('OrganicEdgeRouterConfig', {
  $extends: LayoutConfiguration,

  _meta: {
    LayoutGroup: [
      new LabelAttribute('General'),
      new OptionGroupAttribute('RootGroup', 10),
      new TypeAttribute(OptionGroup)
    ],
    descriptionText: [
      new OptionGroupAttribute('DescriptionGroup', 10),
      new ComponentAttribute('html-block'),
      new TypeAttribute(String)
    ],
    selectionOnlyItem: [
      new LabelAttribute(
        'Route Selected Edges Only',
        '#/api/OrganicEdgeRouterData#OrganicEdgeRouterData-property-scope'
      ),
      new OptionGroupAttribute('LayoutGroup', 10),
      new TypeAttribute(Boolean)
    ],
    minimumNodeDistanceItem: [
      new LabelAttribute(
        'Minimum Distance',
        '#/api/OrganicEdgeRouter#OrganicEdgeRouter-property-minimumDistance'
      ),
      new OptionGroupAttribute('LayoutGroup', 20),
      new MinMaxAttribute(0, 100),
      new ComponentAttribute('slider'),
      new TypeAttribute(Number)
    ],
    keepBendsItem: [
      new LabelAttribute(
        'Keep Existing Bends',
        '#/api/OrganicEdgeRouter#OrganicEdgeRouter-property-keepExistingBends'
      ),
      new OptionGroupAttribute('LayoutGroup', 30),
      new TypeAttribute(Boolean)
    ],
    routeOnlyNecessaryItem: [
      new LabelAttribute(
        'Route Only Necessary',
        '#/api/OrganicEdgeRouter#OrganicEdgeRouter-property-routeAllEdges'
      ),
      new OptionGroupAttribute('LayoutGroup', 40),
      new TypeAttribute(Boolean)
    ],
    allowMovingNodesItem: [
      new LabelAttribute(
        'Allow Moving Nodes',
        '#/api/OrganicEdgeRouter#OrganicEdgeRouter-property-allowMovingNodes'
      ),
      new OptionGroupAttribute('LayoutGroup', 50),
      new TypeAttribute(Boolean)
    ]
  },

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    // @ts-ignore This is part of the old-school yFiles class definition used here
    LayoutConfiguration.call(this)
    const router = new OrganicEdgeRouter()
    this.selectionOnlyItem = false
    this.minimumNodeDistanceItem = 10
    this.keepBendsItem = router.keepExistingBends
    this.routeOnlyNecessaryItem = !router.routeAllEdges
    this.allowMovingNodesItem = false
    this.title = 'Organic Edge Router'
  },

  /**
   * Creates and configures a layout.
   * @param graphComponent The {@link GraphComponent} to apply the
   *   configuration on.
   * @returns The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent: GraphComponent): ILayoutAlgorithm {
    const router = new OrganicEdgeRouter()
    router.minimumDistance = this.minimumNodeDistanceItem
    router.keepExistingBends = this.keepBendsItem
    router.routeAllEdges = !this.routeOnlyNecessaryItem
    router.allowMovingNodes = this.allowMovingNodesItem
    return router
  },

  /**
   * Creates and configures the layout data.
   * @returns The configured layout data.
   */
  createConfiguredLayoutData: function (
    graphComponent: GraphComponent,
    layout: OrganicEdgeRouter
  ): LayoutData {
    const layoutData = new OrganicEdgeRouterData()
    if (this.selectionOnlyItem) {
      layoutData.scope.edges = graphComponent.selection.edges
    }
    return layoutData
  },

  /** @type {OptionGroup} */
  LayoutGroup: null,

  /** @type {string} */
  descriptionText: {
    get: function (): string {
      return "<p style='margin-top:0'>The organic edge routing algorithm routes edges in soft curves to ensure that they do not overlap with nodes. It is especially well suited for non-orthogonal, organic or circular diagrams.</p>"
    }
  },

  /** @type {boolean} */
  selectionOnlyItem: false,

  /** @type {number} */
  minimumNodeDistanceItem: 10,

  /** @type {boolean} */
  keepBendsItem: false,

  /** @type {boolean} */
  routeOnlyNecessaryItem: false,

  /** @type {boolean} */
  allowMovingNodesItem: false
})
