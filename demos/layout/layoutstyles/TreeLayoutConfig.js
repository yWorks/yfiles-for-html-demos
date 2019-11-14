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
      define([
        'yfiles/lang',
        'yfiles/view-component',
        './HandleEdgesBetweenGroupsStage.js',
        'LayoutConfiguration.js'
      ], f)
    } else {
      f(r.yfiles.lang, r.yfiles)
    }
  })(function(lang, yfiles, HandleEdgesBetweenGroupsStage) {
    const demo = yfiles.module('demo')
    yfiles.module('demo', function(exports) {
      /**
       * Configuration options for the layout algorithm of the same name.
       * @class
       * @extends demo.LayoutConfiguration
       */
      exports.TreeLayoutConfig = new yfiles.lang.ClassDefinition(function() {
        /** @lends {demo.TreeLayoutConfig.prototype} */
        return {
          $extends: demo.LayoutConfiguration,

          $meta: [demo.options.LabelAttribute('TreeLayout')],

          /**
           * Setup default values for various configuration parameters.
           */
          constructor: function() {
            demo.LayoutConfiguration.call(this)

            const layout = new yfiles.tree.ClassicTreeLayout()
            const aspectRatioNodePlacer = new yfiles.tree.AspectRatioNodePlacer()
            const defaultNodePlacer = new yfiles.tree.DefaultNodePlacer()

            this.layoutStyleItem = demo.TreeLayoutConfig.EnumStyle.DEFAULT
            this.routingStyleForNonTreeEdgesItem = demo.TreeLayoutConfig.EnumRoute.ORTHOGONAL
            this.edgeBundlingStrengthItem = 0.95
            this.actOnSelectionOnlyItem = false

            this.defaultLayoutOrientationItem = yfiles.layout.LayoutOrientation.TOP_TO_BOTTOM
            this.classicLayoutOrientationItem = yfiles.layout.LayoutOrientation.TOP_TO_BOTTOM

            this.minimumNodeDistanceItem = layout.minimumNodeDistance | 0
            this.minimumLayerDistanceItem = layout.minimumLayerDistance | 0
            this.portStyleItem = yfiles.tree.PortStyle.NODE_CENTER

            this.considerNodeLabelsItem = false

            this.orthogonalEdgeRoutingItem = false

            this.verticalAlignmentItem = 0.5
            this.childPlacementPolicyItem = yfiles.tree.LeafPlacement.SIBLINGS_ON_SAME_LAYER
            this.enforceGlobalLayeringItem = false

            this.nodePlacerItem = demo.TreeLayoutConfig.EnumNodePlacer.DEFAULT

            this.spacingItem = 20
            this.rootAlignmentItem = demo.TreeLayoutConfig.EnumRootAlignment.CENTER
            this.allowMultiParentsItem = false
            this.portAssignmentItem = yfiles.tree.PortAssignmentMode.NONE

            this.hvHorizontalSpaceItem = defaultNodePlacer.horizontalDistance | 0
            this.hvVerticalSpaceItem = defaultNodePlacer.verticalDistance | 0

            this.busAlignmentItem = 0.5

            this.arHorizontalSpaceItem = aspectRatioNodePlacer.horizontalDistance | 0
            this.arVerticalSpaceItem = aspectRatioNodePlacer.verticalDistance | 0
            this.nodePlacerAspectRatioItem = aspectRatioNodePlacer.aspectRatio

            this.arUseViewAspectRatioItem = true
            this.compactPreferredAspectRatioItem = 1

            this.edgeLabelingItem = demo.TreeLayoutConfig.EnumEdgeLabeling.NONE
            this.labelPlacementAlongEdgeItem =
              demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.CENTERED
            this.labelPlacementSideOfEdgeItem =
              demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE
            this.labelPlacementOrientationItem =
              demo.LayoutConfiguration.EnumLabelPlacementOrientation.HORIZONTAL
            this.labelPlacementDistanceItem = 10
          },

          /**
           * Creates and configures a layout and the graph's {@link yfiles.graph.IGraph#mapperRegistry} if necessary.
           * @param {yfiles.view.GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
           *   configuration on.
           * @return {yfiles.layout.ILayoutAlgorithm} The configured layout algorithm.
           */
          createConfiguredLayout: function(graphComponent) {
            let /**yfiles.layout.MultiStageLayout*/ layout

            switch (this.layoutStyleItem) {
              default:
              case demo.TreeLayoutConfig.EnumStyle.DEFAULT:
                layout = this.$configureDefaultLayout()
                break
              case demo.TreeLayoutConfig.EnumStyle.CLASSIC:
                layout = this.$configureClassicLayout()
                break
              case demo.TreeLayoutConfig.EnumStyle.HORIZONTAL_VERTICAL:
                layout = new yfiles.tree.TreeLayout()
                break
              case demo.TreeLayoutConfig.EnumStyle.COMPACT:
                layout = this.$configureCompactLayout(graphComponent)
                break
            }

            layout.parallelEdgeRouterEnabled = false
            layout.componentLayout.style = yfiles.layout.ComponentArrangementStyles.MULTI_ROWS
            layout.subgraphLayoutEnabled = this.actOnSelectionOnlyItem

            layout.prependStage(this.$createTreeReductionStage())

            const placeLabels =
              this.edgeLabelingItem === demo.TreeLayoutConfig.EnumEdgeLabeling.INTEGRATED ||
              this.edgeLabelingItem === demo.TreeLayoutConfig.EnumEdgeLabeling.GENERIC

            // required to prevent WrongGraphStructure exception which may be thrown by TreeLayout if there are edges
            // between group nodes
            layout.prependStage(new HandleEdgesBetweenGroupsStage(placeLabels))

            layout.considerNodeLabels = this.considerNodeLabelsItem

            if (this.edgeLabelingItem === demo.TreeLayoutConfig.EnumEdgeLabeling.GENERIC) {
              layout.integratedEdgeLabeling = false

              const labeling = new yfiles.labeling.GenericLabeling()
              labeling.placeEdgeLabels = true
              labeling.placeNodeLabels = false
              labeling.reduceAmbiguity = this.reduceAmbiguityItem
              layout.labelingEnabled = true
              layout.labeling = labeling
            } else if (
              this.edgeLabelingItem === demo.TreeLayoutConfig.EnumEdgeLabeling.INTEGRATED
            ) {
              layout.integratedEdgeLabeling = true
            }

            demo.LayoutConfiguration.addPreferredPlacementDescriptor(
              graphComponent.graph,
              this.labelPlacementAlongEdgeItem,
              this.labelPlacementSideOfEdgeItem,
              this.labelPlacementOrientationItem,
              this.labelPlacementDistanceItem
            )

            return layout
          },

          createConfiguredLayoutData: function(graphComponent, layout) {
            if (this.layoutStyleItem === demo.TreeLayoutConfig.EnumStyle.DEFAULT) {
              const graph = graphComponent.graph
              const layoutData = new yfiles.tree.TreeLayoutData()
              layoutData.gridNodePlacerRowIndices.delegate = node => {
                const predecessors = graph.predecessors(node)
                const parent = predecessors.firstOrDefault()
                if (parent) {
                  const siblings = graph.successors(parent).toArray()
                  return siblings.indexOf(node) % Math.round(Math.sqrt(siblings.length))
                }
                return 0
              }
              layoutData.leftRightPlacersLeftNodes.delegate = node => {
                const predecessors = graph.predecessors(node)
                const parent = predecessors.firstOrDefault()
                if (parent) {
                  const siblings = graph.successors(parent).toArray()
                  return siblings.indexOf(node) % 2 !== 0
                }
                return false
              }
              layoutData.compactNodePlacerStrategyMementos = new yfiles.collections.Mapper()
              return layoutData
            } else if (
              this.layoutStyleItem === demo.TreeLayoutConfig.EnumStyle.HORIZONTAL_VERTICAL
            ) {
              const layoutData = new yfiles.tree.TreeLayoutData()
              layoutData.nodePlacers.delegate = node => {
                // children of selected nodes should be placed vertical and to the right of their child nodes, while
                // the children of non-selected horizontal downwards
                const childPlacement = graphComponent.selection.isSelected(node)
                  ? yfiles.tree.ChildPlacement.VERTICAL_TO_RIGHT
                  : yfiles.tree.ChildPlacement.HORIZONTAL_DOWNWARD

                const hvNodePlacer = new yfiles.tree.DefaultNodePlacer(
                  childPlacement,
                  yfiles.tree.RootAlignment.LEADING_ON_BUS,
                  this.hvVerticalSpaceItem,
                  this.hvHorizontalSpaceItem
                )
                return hvNodePlacer
              }
              return layoutData
            }
            return null
          },

          /**
           * Configures the tree reduction stage that will handle edges that do not belong to the tree.
           * @return {yfiles.tree.TreeReductionStage}
           */
          $createTreeReductionStage: function() {
            // configures tree reduction stage and non-tree edge routing
            const reductionStage = new yfiles.tree.TreeReductionStage()
            if (this.edgeLabelingItem === demo.TreeLayoutConfig.EnumEdgeLabeling.INTEGRATED) {
              reductionStage.nonTreeEdgeLabelingAlgorithm = new yfiles.labeling.GenericLabeling()
            }
            reductionStage.multiParentAllowed =
              (this.layoutStyleItem === demo.TreeLayoutConfig.EnumStyle.CLASSIC &&
                !this.enforceGlobalLayeringItem &&
                this.childPlacementPolicyItem !==
                  yfiles.tree.LeafPlacement.ALL_LEAVES_ON_SAME_LAYER) ||
              (this.layoutStyleItem === demo.TreeLayoutConfig.EnumStyle.DEFAULT &&
                (this.nodePlacerItem === demo.TreeLayoutConfig.EnumNodePlacer.DEFAULT ||
                  this.nodePlacerItem === demo.TreeLayoutConfig.EnumNodePlacer.BUS ||
                  this.nodePlacerItem === demo.TreeLayoutConfig.EnumNodePlacer.LEFT_RIGHT ||
                  this.nodePlacerItem === demo.TreeLayoutConfig.EnumNodePlacer.DENDROGRAM) &&
                this.allowMultiParentsItem)

            if (this.routingStyleForNonTreeEdgesItem === demo.TreeLayoutConfig.EnumRoute.ORGANIC) {
              reductionStage.nonTreeEdgeRouter = new yfiles.router.OrganicEdgeRouter()
              reductionStage.nonTreeEdgeSelectionKey =
                yfiles.router.OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY
            } else if (
              this.routingStyleForNonTreeEdgesItem === demo.TreeLayoutConfig.EnumRoute.ORTHOGONAL
            ) {
              const edgeRouter = new yfiles.router.EdgeRouter()
              edgeRouter.rerouting = true
              edgeRouter.scope = yfiles.router.Scope.ROUTE_AFFECTED_EDGES
              reductionStage.nonTreeEdgeRouter = edgeRouter
              reductionStage.nonTreeEdgeSelectionKey = edgeRouter.affectedEdgesDpKey
            } else if (
              this.routingStyleForNonTreeEdgesItem === demo.TreeLayoutConfig.EnumRoute.STRAIGHTLINE
            ) {
              reductionStage.nonTreeEdgeRouter = reductionStage.createStraightLineRouter()
            } else if (
              this.routingStyleForNonTreeEdgesItem === demo.TreeLayoutConfig.EnumRoute.BUNDLED
            ) {
              const ebc = reductionStage.edgeBundling
              const bundlingDescriptor = new yfiles.layout.EdgeBundleDescriptor()
              bundlingDescriptor.bundled = true
              ebc.bundlingStrength = this.edgeBundlingStrengthItem
              ebc.defaultBundleDescriptor = bundlingDescriptor
            }
            return reductionStage
          },

          /**
           * Configures the default tree layout algorithm.
           * @return {yfiles.layout.MultiStageLayout}
           */
          $configureDefaultLayout: function() {
            const isDefaultNodePlacer =
              this.nodePlacerItem === demo.TreeLayoutConfig.EnumNodePlacer.DEFAULT
            const isAspectRatioNodePlacer =
              this.nodePlacerItem === demo.TreeLayoutConfig.EnumNodePlacer.ASPECT_RATIO

            const layout = new yfiles.tree.TreeLayout()
            layout.layoutOrientation = isAspectRatioNodePlacer
              ? yfiles.layout.LayoutOrientation.TOP_TO_BOTTOM
              : this.defaultLayoutOrientationItem

            const spacing = this.spacingItem

            let rootAlignment
            switch (this.rootAlignmentItem) {
              default:
              case demo.TreeLayoutConfig.EnumRootAlignment.CENTER:
                rootAlignment = isDefaultNodePlacer
                  ? yfiles.tree.RootAlignment.CENTER
                  : yfiles.tree.RootNodeAlignment.CENTER
                break
              case demo.TreeLayoutConfig.EnumRootAlignment.MEDIAN:
                rootAlignment = isDefaultNodePlacer
                  ? yfiles.tree.RootAlignment.MEDIAN
                  : yfiles.tree.RootNodeAlignment.MEDIAN
                break
              case demo.TreeLayoutConfig.EnumRootAlignment.LEFT:
                rootAlignment = isDefaultNodePlacer
                  ? yfiles.tree.RootAlignment.LEADING
                  : yfiles.tree.RootNodeAlignment.LEFT
                break
              case demo.TreeLayoutConfig.EnumRootAlignment.LEADING:
                rootAlignment = isDefaultNodePlacer
                  ? yfiles.tree.RootAlignment.LEADING_OFFSET
                  : yfiles.tree.RootNodeAlignment.LEADING
                break
              case demo.TreeLayoutConfig.EnumRootAlignment.RIGHT:
                rootAlignment = isDefaultNodePlacer
                  ? yfiles.tree.RootAlignment.TRAILING
                  : yfiles.tree.RootNodeAlignment.RIGHT
                break
              case demo.TreeLayoutConfig.EnumRootAlignment.TRAILING:
                rootAlignment = isDefaultNodePlacer
                  ? yfiles.tree.RootAlignment.TRAILING_OFFSET
                  : yfiles.tree.RootNodeAlignment.TRAILING
                break
            }

            const aspectRatio = this.nodePlacerAspectRatioItem
            const allowMultiParents = this.allowMultiParentsItem

            switch (this.nodePlacerItem) {
              default:
              case demo.TreeLayoutConfig.EnumNodePlacer.DEFAULT:
                const defaultNodePlacer = new yfiles.tree.DefaultNodePlacer()
                defaultNodePlacer.horizontalDistance = spacing
                defaultNodePlacer.verticalDistance = spacing
                defaultNodePlacer.rootAlignment = rootAlignment
                layout.defaultNodePlacer = defaultNodePlacer
                layout.multiParentAllowed = allowMultiParents
                break
              case demo.TreeLayoutConfig.EnumNodePlacer.SIMPLE:
                const simpleNodePlacer = new yfiles.tree.SimpleNodePlacer()
                simpleNodePlacer.spacing = spacing
                simpleNodePlacer.rootAlignment = rootAlignment
                layout.defaultNodePlacer = simpleNodePlacer
                break
              case demo.TreeLayoutConfig.EnumNodePlacer.BUS:
                const busNodePlacer = new yfiles.tree.BusNodePlacer()
                busNodePlacer.spacing = spacing
                layout.defaultNodePlacer = busNodePlacer
                layout.multiParentAllowed = allowMultiParents
                break
              case demo.TreeLayoutConfig.EnumNodePlacer.DOUBLE_LINE:
                const doubleLineNodePlacer = new yfiles.tree.DoubleLineNodePlacer()
                doubleLineNodePlacer.spacing = spacing
                doubleLineNodePlacer.rootAlignment = rootAlignment
                layout.defaultNodePlacer = doubleLineNodePlacer
                break
              case demo.TreeLayoutConfig.EnumNodePlacer.LEFT_RIGHT:
                const leftRightNodePlacer = new yfiles.tree.LeftRightNodePlacer()
                leftRightNodePlacer.spacing = spacing
                layout.defaultNodePlacer = leftRightNodePlacer
                layout.multiParentAllowed = allowMultiParents
                break
              case demo.TreeLayoutConfig.EnumNodePlacer.LAYERED:
                const layeredNodePlacer = new yfiles.tree.LayeredNodePlacer()
                layeredNodePlacer.spacing = spacing
                layeredNodePlacer.layerSpacing = spacing
                layeredNodePlacer.rootAlignment = rootAlignment
                layout.defaultNodePlacer = layeredNodePlacer
                break
              case demo.TreeLayoutConfig.EnumNodePlacer.ASPECT_RATIO:
                const aspectRatioNodePlacer = new yfiles.tree.AspectRatioNodePlacer()
                aspectRatioNodePlacer.horizontalDistance = spacing
                aspectRatioNodePlacer.verticalDistance = spacing
                aspectRatioNodePlacer.aspectRatio = aspectRatio
                layout.defaultNodePlacer = aspectRatioNodePlacer
                break
              case demo.TreeLayoutConfig.EnumNodePlacer.DENDROGRAM:
                const dendrogramNodePlacer = new yfiles.tree.DendrogramNodePlacer()
                dendrogramNodePlacer.minimumRootDistance = spacing
                dendrogramNodePlacer.minimumSubtreeDistance = spacing
                layout.defaultNodePlacer = dendrogramNodePlacer
                layout.multiParentAllowed = allowMultiParents
                break
              case demo.TreeLayoutConfig.EnumNodePlacer.GRID:
                const gridNodePlacer = new yfiles.tree.GridNodePlacer()
                gridNodePlacer.spacing = spacing
                gridNodePlacer.rootAlignment = rootAlignment
                layout.defaultNodePlacer = gridNodePlacer
                break
              case demo.TreeLayoutConfig.EnumNodePlacer.COMPACT:
                const compactNodePlacer = new yfiles.tree.CompactNodePlacer()
                compactNodePlacer.horizontalDistance = spacing
                compactNodePlacer.verticalDistance = spacing
                compactNodePlacer.preferredAspectRatio = aspectRatio
                layout.defaultNodePlacer = compactNodePlacer
                break
            }

            layout.defaultPortAssignment = new yfiles.tree.DefaultPortAssignment(
              this.portAssignmentItem
            )
            layout.groupingSupported = true

            return layout
          },

          /**
           * Configures the default classic tree layout algorithm.
           * @return {yfiles.layout.MultiStageLayout}
           */
          $configureClassicLayout: function() {
            const layout = new yfiles.tree.ClassicTreeLayout()

            layout.minimumNodeDistance = this.minimumNodeDistanceItem
            layout.minimumLayerDistance = this.minimumLayerDistanceItem

            const ol = layout.orientationLayout
            ol.orientation = this.classicLayoutOrientationItem

            if (this.orthogonalEdgeRoutingItem) {
              layout.edgeRoutingStyle = yfiles.tree.EdgeRoutingStyle.ORTHOGONAL
            } else {
              layout.edgeRoutingStyle = yfiles.tree.EdgeRoutingStyle.PLAIN
            }

            layout.leafPlacement = this.childPlacementPolicyItem
            layout.enforceGlobalLayering = this.enforceGlobalLayeringItem
            layout.portStyle = this.portStyleItem

            layout.verticalAlignment = this.verticalAlignmentItem
            layout.busAlignment = this.busAlignmentItem

            return layout
          },

          /**
           * Configures the tree layout algorithm with the appropriate node placer to obtain a compact tree layout.
           * @return {yfiles.layout.MultiStageLayout}
           */
          $configureCompactLayout: function(graphComponent) {
            const layout = new yfiles.tree.TreeLayout()
            const aspectRatioNodePlacer = new yfiles.tree.AspectRatioNodePlacer()

            if (graphComponent && this.arUseViewAspectRatioItem) {
              const size = graphComponent.innerSize
              aspectRatioNodePlacer.aspectRatio = size.width / size.height
            } else {
              aspectRatioNodePlacer.aspectRatio = this.compactPreferredAspectRatioItem
            }

            aspectRatioNodePlacer.horizontalDistance = this.arHorizontalSpaceItem
            aspectRatioNodePlacer.verticalDistance = this.arVerticalSpaceItem

            layout.defaultNodePlacer = aspectRatioNodePlacer
            return layout
          },

          // ReSharper disable UnusedMember.Global
          // ReSharper disable InconsistentNaming
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

          /** @type {demo.options.OptionGroup} */
          DefaultGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Default'),
                demo.options.OptionGroupAttribute('RootGroup', 15),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          HVGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Horizontal-Vertical'),
                demo.options.OptionGroupAttribute('RootGroup', 20),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          CompactGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Compact'),
                demo.options.OptionGroupAttribute('RootGroup', 30),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          ClassicGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Classic'),
                demo.options.OptionGroupAttribute('RootGroup', 40),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          LabelingGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Labeling'),
                demo.options.OptionGroupAttribute('RootGroup', 50),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          NodePropertiesGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Node Settings'),
                demo.options.OptionGroupAttribute('LabelingGroup', 10),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          EdgePropertiesGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Edge Settings'),
                demo.options.OptionGroupAttribute('LabelingGroup', 20),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /** @type {demo.options.OptionGroup} */
          PreferredPlacementGroup: {
            $meta: function() {
              return [
                demo.options.LabelAttribute('Preferred Edge Label Placement'),
                demo.options.OptionGroupAttribute('LabelingGroup', 30),
                demo.options.TypeAttribute(demo.options.OptionGroup.$class)
              ]
            },
            value: null
          },

          /**
           * Gets the description text.
           * The description text.
           * @type {string}
           */
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
                '<p>The various flavors of the tree layout styles are great for highlighting child-parent relationships in graphs that form one or more trees, ' +
                'or trees with only few additional edges.</p>' +
                '<p>The need to visualize directed or undirected trees arises in many application areas, for example</p>' +
                '<ul>' +
                '<li>Dataflow analysis</li>' +
                '<li>Software engineering</li>' +
                '<li>Network management</li>' +
                '<li>Bioinformatics</li>' +
                '</ul>'
              )
            }
          },

          /**
           * Backing field for below property
           * @type {demo.TreeLayoutConfig.EnumStyle}
           */
          $layoutStyleItem: null,

          /** @type {demo.TreeLayoutConfig.EnumStyle} */
          layoutStyleItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Layout Style',
                  '#/api/yfiles.tree.TreeLayout#TreeLayout-property-defaultNodePlacer'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Default', demo.TreeLayoutConfig.EnumStyle.DEFAULT],
                    ['Horizontal-Vertical', demo.TreeLayoutConfig.EnumStyle.HORIZONTAL_VERTICAL],
                    ['Compact', demo.TreeLayoutConfig.EnumStyle.COMPACT],
                    ['Classic', demo.TreeLayoutConfig.EnumStyle.CLASSIC]
                  ]
                }),
                demo.options.TypeAttribute(demo.TreeLayoutConfig.EnumStyle.$class)
              ]
            },
            get: function() {
              return this.$layoutStyleItem
            },
            set: function(value) {
              this.$layoutStyleItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {demo.TreeLayoutConfig.EnumRoute}
           */
          $routingStyleForNonTreeEdgesItem: null,

          /** @type {demo.TreeLayoutConfig.EnumRoute} */
          routingStyleForNonTreeEdgesItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Routing Style for Non-Tree Edges',
                  '#/api/yfiles.tree.TreeReductionStage#TreeReductionStage-property-nonTreeEdgeRouter'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 20),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Orthogonal', demo.TreeLayoutConfig.EnumRoute.ORTHOGONAL],
                    ['Organic', demo.TreeLayoutConfig.EnumRoute.ORGANIC],
                    ['Straight-Line', demo.TreeLayoutConfig.EnumRoute.STRAIGHTLINE],
                    ['Bundled', demo.TreeLayoutConfig.EnumRoute.BUNDLED]
                  ]
                }),
                demo.options.TypeAttribute(demo.TreeLayoutConfig.EnumRoute.$class)
              ]
            },
            get: function() {
              return this.$routingStyleForNonTreeEdgesItem
            },
            set: function(value) {
              this.$routingStyleForNonTreeEdgesItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $edgeBundlingStrengthItem: 1.0,

          /** @type {number} */
          edgeBundlingStrengthItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Bundling Strength',
                  '#/api/yfiles.layout.EdgeBundling#EdgeBundling-property-bundlingStrength'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 30),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 1.0,
                  step: 0.01
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$edgeBundlingStrengthItem
            },
            set: function(value) {
              this.$edgeBundlingStrengthItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableEdgeBundlingStrengthItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return (
                this.routingStyleForNonTreeEdgesItem !== demo.TreeLayoutConfig.EnumRoute.BUNDLED
              )
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $actOnSelectionOnlyItem: false,

          /** @type {boolean} */
          actOnSelectionOnlyItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Act on Selection Only',
                  '#/api/yfiles.tree.TreeLayout#MultiStageLayout-property-subgraphLayoutEnabled'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 40),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$actOnSelectionOnlyItem
            },
            set: function(value) {
              this.$actOnSelectionOnlyItem = value
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
                  '#/api/yfiles.tree.TreeLayout#TreeLayout-property-considerNodeLabels'
                ),
                demo.options.OptionGroupAttribute('GeneralGroup', 50),
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
           * @type {yfiles.tree.INodePlacer}
           */
          $nodePlacerItem: null,

          /** @type {demo.TreeLayoutConfig.EnumNodePlacer} */
          nodePlacerItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Node Placer',
                  '#/api/yfiles.tree.TreeLayout#TreeLayout-property-defaultNodePlacer'
                ),
                demo.options.OptionGroupAttribute('DefaultGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Default', demo.TreeLayoutConfig.EnumNodePlacer.DEFAULT],
                    ['Simple', demo.TreeLayoutConfig.EnumNodePlacer.SIMPLE],
                    ['Bus', demo.TreeLayoutConfig.EnumNodePlacer.BUS],
                    ['Double-Line', demo.TreeLayoutConfig.EnumNodePlacer.DOUBLE_LINE],
                    ['Left-Right', demo.TreeLayoutConfig.EnumNodePlacer.LEFT_RIGHT],
                    ['Layered', demo.TreeLayoutConfig.EnumNodePlacer.LAYERED],
                    ['Aspect Ratio', demo.TreeLayoutConfig.EnumNodePlacer.ASPECT_RATIO],
                    ['Dendrogram', demo.TreeLayoutConfig.EnumNodePlacer.DENDROGRAM],
                    ['Grid', demo.TreeLayoutConfig.EnumNodePlacer.GRID],
                    ['Compact', demo.TreeLayoutConfig.EnumNodePlacer.COMPACT]
                  ]
                }),
                demo.options.TypeAttribute(demo.TreeLayoutConfig.EnumNodePlacer.$class)
              ]
            },
            get: function() {
              return this.$nodePlacerItem
            },
            set: function(value) {
              this.$nodePlacerItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $spacingItem: 0,

          /** @type {number} */
          spacingItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Spacing',
                  '#/api/yfiles.tree.DefaultNodePlacer#DefaultNodePlacer-property-horizontalDistance'
                ),
                demo.options.OptionGroupAttribute('DefaultGroup', 20),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 500
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$spacingItem
            },
            set: function(value) {
              this.$spacingItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {demo.TreeLayoutConfig.EnumRootAlignment}
           */
          $rootAlignmentItem: null,

          /** @type {demo.TreeLayoutConfig.EnumRootAlignment} */
          rootAlignmentItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Root Alignment',
                  '#/api/yfiles.tree.DefaultNodePlacer#DefaultNodePlacer-property-rootAlignment'
                ),
                demo.options.OptionGroupAttribute('DefaultGroup', 30),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Center', demo.TreeLayoutConfig.EnumRootAlignment.CENTER],
                    ['Median', demo.TreeLayoutConfig.EnumRootAlignment.MEDIAN],
                    ['Left', demo.TreeLayoutConfig.EnumRootAlignment.LEFT],
                    ['Leading', demo.TreeLayoutConfig.EnumRootAlignment.LEADING],
                    ['Right', demo.TreeLayoutConfig.EnumRootAlignment.RIGHT],
                    ['Trailing', demo.TreeLayoutConfig.EnumRootAlignment.TRAILING]
                  ]
                }),
                demo.options.TypeAttribute(demo.TreeLayoutConfig.EnumRootAlignment.$class)
              ]
            },
            get: function() {
              return this.$rootAlignmentItem
            },
            set: function(value) {
              this.$rootAlignmentItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableRootAlignmentItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return (
                this.nodePlacerItem === demo.TreeLayoutConfig.EnumNodePlacer.ASPECT_RATIO ||
                this.nodePlacerItem === demo.TreeLayoutConfig.EnumNodePlacer.BUS ||
                this.nodePlacerItem === demo.TreeLayoutConfig.EnumNodePlacer.DENDROGRAM ||
                this.nodePlacerItem === demo.TreeLayoutConfig.EnumNodePlacer.COMPACT
              )
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.layout.LayoutOrientation}
           */
          $defaultLayoutOrientationItem: null,

          /** @type {yfiles.layout.LayoutOrientation} */
          defaultLayoutOrientationItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Orientation',
                  '#/api/yfiles.tree.TreeLayout#MultiStageLayout-property-layoutOrientation'
                ),
                demo.options.OptionGroupAttribute('DefaultGroup', 40),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Top to Bottom', yfiles.layout.LayoutOrientation.TOP_TO_BOTTOM],
                    ['Bottom to Top', yfiles.layout.LayoutOrientation.BOTTOM_TO_TOP],
                    ['Left to Right', yfiles.layout.LayoutOrientation.LEFT_TO_RIGHT],
                    ['Right to Left', yfiles.layout.LayoutOrientation.RIGHT_TO_LEFT]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.layout.LayoutOrientation.$class)
              ]
            },
            get: function() {
              return this.$defaultLayoutOrientationItem
            },
            set: function(value) {
              this.$defaultLayoutOrientationItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableDefaultLayoutOrientationItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return (
                this.nodePlacerItem === demo.TreeLayoutConfig.EnumNodePlacer.ASPECT_RATIO ||
                this.nodePlacerItem === demo.TreeLayoutConfig.EnumNodePlacer.COMPACT
              )
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $nodePlacerAspectRatioItem: 0,

          /** @type {number} */
          nodePlacerAspectRatioItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Aspect Ratio',
                  '#/api/yfiles.tree.AspectRatioNodePlacer#AspectRatioNodePlacer-property-aspectRatio'
                ),
                demo.options.OptionGroupAttribute('DefaultGroup', 50),
                demo.options.MinMaxAttribute().init({
                  min: 0.1,
                  max: 4,
                  step: 0.1
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$nodePlacerAspectRatioItem
            },
            set: function(value) {
              this.$nodePlacerAspectRatioItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableNodePlacerAspectRatioItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return (
                this.nodePlacerItem !== demo.TreeLayoutConfig.EnumNodePlacer.ASPECT_RATIO &&
                this.nodePlacerItem !== demo.TreeLayoutConfig.EnumNodePlacer.COMPACT
              )
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $allowMultiParentsItem: false,

          /** @type {boolean} */
          allowMultiParentsItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Allow Multi-Parents',
                  '#/api/yfiles.tree.TreeLayout#TreeLayout-property-multiParentAllowed'
                ),
                demo.options.OptionGroupAttribute('DefaultGroup', 60),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$allowMultiParentsItem
            },
            set: function(value) {
              this.$allowMultiParentsItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableAllowMultiParentsItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return (
                this.nodePlacerItem !== demo.TreeLayoutConfig.EnumNodePlacer.DEFAULT &&
                this.nodePlacerItem !== demo.TreeLayoutConfig.EnumNodePlacer.DENDROGRAM &&
                this.nodePlacerItem !== demo.TreeLayoutConfig.EnumNodePlacer.BUS &&
                this.nodePlacerItem !== demo.TreeLayoutConfig.EnumNodePlacer.LEFT_RIGHT
              )
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.tree.PortAssignmentMode}
           */
          $portAssignmentItem: null,

          /** @type {yfiles.tree.PortAssignmentMode} */
          portAssignmentItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Port Assignment',
                  '#/api/yfiles.tree.TreeLayout#TreeLayout-property-defaultPortAssignment'
                ),
                demo.options.OptionGroupAttribute('DefaultGroup', 70),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['None', yfiles.tree.PortAssignmentMode.NONE],
                    ['Distributed North', yfiles.tree.PortAssignmentMode.DISTRIBUTED_NORTH],
                    ['Distributed South', yfiles.tree.PortAssignmentMode.DISTRIBUTED_SOUTH],
                    ['Distributed East', yfiles.tree.PortAssignmentMode.DISTRIBUTED_EAST],
                    ['Distributed West', yfiles.tree.PortAssignmentMode.DISTRIBUTED_WEST]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.tree.PortAssignmentMode.$class)
              ]
            },
            get: function() {
              return this.$portAssignmentItem
            },
            set: function(value) {
              this.$portAssignmentItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $hvHorizontalSpaceItem: 0,

          /** @type {number} */
          hvHorizontalSpaceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Horizontal Spacing',
                  '#/api/yfiles.tree.DefaultNodePlacer#DefaultNodePlacer-property-horizontalDistance'
                ),
                demo.options.OptionGroupAttribute('HVGroup', 10),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$hvHorizontalSpaceItem
            },
            set: function(value) {
              this.$hvHorizontalSpaceItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $hvVerticalSpaceItem: 0,

          /** @type {number} */
          hvVerticalSpaceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Vertical Spacing',
                  '#/api/yfiles.tree.DefaultNodePlacer#DefaultNodePlacer-property-verticalDistance'
                ),
                demo.options.OptionGroupAttribute('HVGroup', 20),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$hvVerticalSpaceItem
            },
            set: function(value) {
              this.$hvVerticalSpaceItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $arHorizontalSpaceItem: 0,

          /** @type {number} */
          arHorizontalSpaceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Horizontal Spacing',
                  '#/api/yfiles.tree.AspectRatioNodePlacer#AspectRatioNodePlacer-property-horizontalDistance'
                ),
                demo.options.OptionGroupAttribute('CompactGroup', 10),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$arHorizontalSpaceItem
            },
            set: function(value) {
              this.$arHorizontalSpaceItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $arVerticalSpaceItem: 0,

          /** @type {number} */
          arVerticalSpaceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Vertical Spacing',
                  '#/api/yfiles.tree.AspectRatioNodePlacer#AspectRatioNodePlacer-property-verticalDistance'
                ),
                demo.options.OptionGroupAttribute('CompactGroup', 20),
                demo.options.MinMaxAttribute().init({
                  min: 0,
                  max: 100
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$arVerticalSpaceItem
            },
            set: function(value) {
              this.$arVerticalSpaceItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $arUseViewAspectRatioItem: false,

          /** @type {boolean} */
          arUseViewAspectRatioItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Use Aspect Ratio of View',
                  '#/api/yfiles.tree.AspectRatioNodePlacer#AspectRatioNodePlacer-property-aspectRatio'
                ),
                demo.options.OptionGroupAttribute('CompactGroup', 40),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$arUseViewAspectRatioItem
            },
            set: function(value) {
              this.$arUseViewAspectRatioItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $compactPreferredAspectRatioItem: 0,

          /** @type {number} */
          compactPreferredAspectRatioItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Preferred Aspect Ratio',
                  '#/api/yfiles.tree.AspectRatioNodePlacer#AspectRatioNodePlacer-property-aspectRatio'
                ),
                demo.options.OptionGroupAttribute('CompactGroup', 50),
                demo.options.MinMaxAttribute().init({
                  min: 0.2,
                  max: 5.0,
                  step: 0.01
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$compactPreferredAspectRatioItem
            },
            set: function(value) {
              this.$compactPreferredAspectRatioItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableCompactPreferredAspectRatioItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.arUseViewCompactPreferredAspectRatioItem
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.layout.LayoutOrientation}
           */
          $classicLayoutOrientationItem: null,

          /** @type {yfiles.layout.LayoutOrientation} */
          classicLayoutOrientationItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Orientation',
                  '#/api/yfiles.layout.OrientationLayout#OrientationLayout-property-orientation'
                ),
                demo.options.OptionGroupAttribute('ClassicGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Top to Bottom', yfiles.layout.LayoutOrientation.TOP_TO_BOTTOM],
                    ['Left to Right', yfiles.layout.LayoutOrientation.LEFT_TO_RIGHT],
                    ['Bottom to Top', yfiles.layout.LayoutOrientation.BOTTOM_TO_TOP],
                    ['Right to Left', yfiles.layout.LayoutOrientation.RIGHT_TO_LEFT]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.layout.LayoutOrientation.$class)
              ]
            },
            get: function() {
              return this.$classicLayoutOrientationItem
            },
            set: function(value) {
              this.$classicLayoutOrientationItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $minimumNodeDistanceItem: 0,

          /** @type {number} */
          minimumNodeDistanceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Minimum Node Distance',
                  '#/api/yfiles.tree.ClassicTreeLayout#ClassicTreeLayout-property-minimumNodeDistance'
                ),
                demo.options.MinMaxAttribute().init({
                  min: 1,
                  max: 100
                }),
                demo.options.OptionGroupAttribute('ClassicGroup', 20),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$minimumNodeDistanceItem
            },
            set: function(value) {
              this.$minimumNodeDistanceItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $minimumLayerDistanceItem: 0,

          /** @type {number} */
          minimumLayerDistanceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Minimum Layer Distance',
                  '#/api/yfiles.tree.ClassicTreeLayout#ClassicTreeLayout-property-minimumLayerDistance'
                ),
                demo.options.MinMaxAttribute().init({
                  min: 10,
                  max: 300
                }),
                demo.options.OptionGroupAttribute('ClassicGroup', 30),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$minimumLayerDistanceItem
            },
            set: function(value) {
              this.$minimumLayerDistanceItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.tree.PortStyle}
           */
          $portStyleItem: null,

          /** @type {yfiles.tree.PortStyle} */
          portStyleItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Port Style',
                  '#/api/yfiles.tree.ClassicTreeLayout#ClassicTreeLayout-property-portStyle'
                ),
                demo.options.OptionGroupAttribute('ClassicGroup', 40),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Node Centered', yfiles.tree.PortStyle.NODE_CENTER],
                    ['Border Centered', yfiles.tree.PortStyle.BORDER_CENTER],
                    ['Border Distributed', yfiles.tree.PortStyle.BORDER_DISTRIBUTED]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.tree.PortStyle.$class)
              ]
            },
            get: function() {
              return this.$portStyleItem
            },
            set: function(value) {
              this.$portStyleItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $enforceGlobalLayeringItem: false,

          /** @type {boolean} */
          enforceGlobalLayeringItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Global Layering',
                  '#/api/yfiles.tree.ClassicTreeLayout#ClassicTreeLayout-property-enforceGlobalLayering'
                ),
                demo.options.OptionGroupAttribute('ClassicGroup', 50),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$enforceGlobalLayeringItem
            },
            set: function(value) {
              this.$enforceGlobalLayeringItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $orthogonalEdgeRoutingItem: false,

          /** @type {boolean} */
          orthogonalEdgeRoutingItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Orthogonal Edge Routing',
                  '#/api/yfiles.tree.ClassicTreeLayout#ClassicTreeLayout-property-edgeRoutingStyle'
                ),
                demo.options.OptionGroupAttribute('ClassicGroup', 60),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$orthogonalEdgeRoutingItem
            },
            set: function(value) {
              this.$orthogonalEdgeRoutingItem = value
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $busAlignmentItem: 0,

          /** @type {number} */
          busAlignmentItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Edge Bus Alignment',
                  '#/api/yfiles.tree.ClassicTreeLayout#ClassicTreeLayout-property-busAlignment'
                ),
                demo.options.OptionGroupAttribute('ClassicGroup', 70),
                demo.options.MinMaxAttribute().init({
                  min: 0.0,
                  max: 1.0,
                  step: 0.01
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$busAlignmentItem
            },
            set: function(value) {
              this.$busAlignmentItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableBusAlignmentItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return (
                this.orthogonalEdgeRoutingItem === false ||
                (this.enforceGlobalLayeringItem === false &&
                  this.childPlacementPolicyItem !==
                    yfiles.tree.LeafPlacement.ALL_LEAVES_ON_SAME_LAYER)
              )
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $verticalAlignmentItem: 0,

          /** @type {number} */
          verticalAlignmentItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Vertical Child Alignment',
                  '#/api/yfiles.tree.ClassicTreeLayout#ClassicTreeLayout-property-verticalAlignment'
                ),
                demo.options.OptionGroupAttribute('ClassicGroup', 80),
                demo.options.MinMaxAttribute().init({
                  min: 0.0,
                  max: 1.0,
                  step: 0.01
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$verticalAlignmentItem
            },
            set: function(value) {
              this.$verticalAlignmentItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableVerticalAlignmentItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return !this.enforceGlobalLayeringItem
            }
          },

          /**
           * Backing field for below property
           * @type {yfiles.tree.ChildPlacement}
           */
          $childPlacementPolicyItem: null,

          /** @type {yfiles.tree.ChildPlacement} */
          childPlacementPolicyItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Child Placement Policy',
                  '#/api/yfiles.tree.ClassicTreeLayout#ClassicTreeLayout-property-leafPlacement'
                ),
                demo.options.OptionGroupAttribute('ClassicGroup', 90),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Siblings in same Layer', yfiles.tree.LeafPlacement.SIBLINGS_ON_SAME_LAYER],
                    [
                      'All Leaves in same Layer',
                      yfiles.tree.LeafPlacement.ALL_LEAVES_ON_SAME_LAYER
                    ],
                    ['Leaves stacked', yfiles.tree.LeafPlacement.LEAVES_STACKED],
                    ['Leaves stacked left', yfiles.tree.LeafPlacement.LEAVES_STACKED_LEFT],
                    ['Leaves stacked right', yfiles.tree.LeafPlacement.LEAVES_STACKED_RIGHT],
                    [
                      'Leaves stacked left and right',
                      yfiles.tree.LeafPlacement.LEAVES_STACKED_LEFT_AND_RIGHT
                    ]
                  ]
                }),
                demo.options.TypeAttribute(yfiles.tree.LeafPlacement.$class)
              ]
            },
            get: function() {
              return this.$childPlacementPolicyItem
            },
            set: function(value) {
              this.$childPlacementPolicyItem = value
            }
          },

          /**
           * @type {demo.TreeLayoutConfig.EnumEdgeLabeling}
           */
          $edgeLabelingItem: null,

          /** @type {demo.TreeLayoutConfig.EnumEdgeLabeling} */
          edgeLabelingItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Edge Labeling',
                  '#/api/yfiles.tree.TreeLayout#MultiStageLayout-property-labelingEnabled'
                ),
                demo.options.OptionGroupAttribute('EdgePropertiesGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['None', demo.TreeLayoutConfig.EnumEdgeLabeling.NONE],
                    ['Integrated', demo.TreeLayoutConfig.EnumEdgeLabeling.INTEGRATED],
                    ['Generic', demo.TreeLayoutConfig.EnumEdgeLabeling.GENERIC]
                  ]
                }),
                demo.options.TypeAttribute(demo.TreeLayoutConfig.EnumEdgeLabeling.$class)
              ]
            },
            get: function() {
              return this.$edgeLabelingItem
            },
            set: function(value) {
              this.$edgeLabelingItem = value
              if (value === demo.TreeLayoutConfig.EnumEdgeLabeling.INTEGRATED) {
                this.labelPlacementOrientationItem =
                  demo.LayoutConfiguration.EnumLabelPlacementOrientation.PARALLEL
                this.labelPlacementAlongEdgeItem =
                  demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_TARGET
                this.labelPlacementDistanceItem = 0
              }
            }
          },

          /**
           * Backing field for below property
           * @type {boolean}
           */
          $reduceAmbiguityItem: false,

          /** @type {boolean} */
          reduceAmbiguityItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Reduce Ambiguity',
                  '#/api/yfiles.labeling.GenericLabeling#MISLabelingBase-property-reduceAmbiguity'
                ),
                demo.options.OptionGroupAttribute('EdgePropertiesGroup', 20),
                demo.options.TypeAttribute(yfiles.lang.Boolean.$class)
              ]
            },
            get: function() {
              return this.$reduceAmbiguityItem
            },
            set: function(value) {
              this.$reduceAmbiguityItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableReduceAmbiguityItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.edgeLabelingItem !== demo.TreeLayoutConfig.EnumEdgeLabeling.GENERIC
            }
          },

          /**
           * Backing field for below property
           * @type {demo.LayoutConfiguration.EnumLabelPlacementOrientation}
           */
          $labelPlacementOrientationItem: null,

          /** @type {demo.LayoutConfiguration.EnumLabelPlacementOrientation} */
          labelPlacementOrientationItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Orientation',
                  '#/api/yfiles.layout.PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-angle'
                ),
                demo.options.OptionGroupAttribute('PreferredPlacementGroup', 10),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Parallel', demo.LayoutConfiguration.EnumLabelPlacementOrientation.PARALLEL],
                    [
                      'Orthogonal',
                      demo.LayoutConfiguration.EnumLabelPlacementOrientation.ORTHOGONAL
                    ],
                    [
                      'Horizontal',
                      demo.LayoutConfiguration.EnumLabelPlacementOrientation.HORIZONTAL
                    ],
                    ['Vertical', demo.LayoutConfiguration.EnumLabelPlacementOrientation.VERTICAL]
                  ]
                }),
                demo.options.TypeAttribute(
                  demo.LayoutConfiguration.EnumLabelPlacementOrientation.$class
                )
              ]
            },
            get: function() {
              return this.$labelPlacementOrientationItem
            },
            set: function(value) {
              this.$labelPlacementOrientationItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableLabelPlacementOrientationItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.edgeLabelingItem === demo.TreeLayoutConfig.EnumEdgeLabeling.NONE
            }
          },

          /**
           * Backing field for below property
           * @type {demo.LayoutConfiguration.EnumLabelPlacementAlongEdge}
           */
          $labelPlacementAlongEdgeItem: null,

          /** @type {demo.LayoutConfiguration.EnumLabelPlacementAlongEdge} */
          labelPlacementAlongEdgeItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Along Edge',
                  '#/api/yfiles.layout.PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-placeAlongEdge'
                ),
                demo.options.OptionGroupAttribute('PreferredPlacementGroup', 20),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Anywhere', demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.ANYWHERE],
                    ['At Source', demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_SOURCE],
                    ['At Target', demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_TARGET],
                    ['Centered', demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.CENTERED]
                  ]
                }),
                demo.options.TypeAttribute(
                  demo.LayoutConfiguration.EnumLabelPlacementAlongEdge.$class
                )
              ]
            },
            get: function() {
              return this.$labelPlacementAlongEdgeItem
            },
            set: function(value) {
              this.$labelPlacementAlongEdgeItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableLabelPlacementAlongEdgeItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.edgeLabelingItem === demo.TreeLayoutConfig.EnumEdgeLabeling.NONE
            }
          },

          /**
           * Backing field for below property
           * @type {demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge}
           */
          $labelPlacementSideOfEdgeItem: null,

          /** @type {demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge} */
          labelPlacementSideOfEdgeItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Side of Edge',
                  '#/api/yfiles.layout.PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-sideOfEdge'
                ),
                demo.options.OptionGroupAttribute('PreferredPlacementGroup', 30),
                demo.options.EnumValuesAttribute().init({
                  values: [
                    ['Anywhere', demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.ANYWHERE],
                    ['On Edge', demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE],
                    ['Left', demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.LEFT],
                    ['Right', demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.RIGHT],
                    [
                      'Left or Right',
                      demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.LEFT_OR_RIGHT
                    ]
                  ]
                }),
                demo.options.TypeAttribute(
                  demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.$class
                )
              ]
            },
            get: function() {
              return this.$labelPlacementSideOfEdgeItem
            },
            set: function(value) {
              this.$labelPlacementSideOfEdgeItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableLabelPlacementSideOfEdgeItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return this.edgeLabelingItem === demo.TreeLayoutConfig.EnumEdgeLabeling.NONE
            }
          },

          /**
           * Backing field for below property
           * @type {number}
           */
          $labelPlacementDistanceItem: 0,

          /** @type {number} */
          labelPlacementDistanceItem: {
            $meta: function() {
              return [
                demo.options.LabelAttribute(
                  'Distance',
                  '#/api/yfiles.layout.PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-distanceToEdge'
                ),
                demo.options.OptionGroupAttribute('PreferredPlacementGroup', 40),
                demo.options.MinMaxAttribute().init({
                  min: 0.0,
                  max: 40.0
                }),
                demo.options.ComponentAttribute(demo.options.Components.SLIDER),
                demo.options.TypeAttribute(yfiles.lang.Number.$class)
              ]
            },
            get: function() {
              return this.$labelPlacementDistanceItem
            },
            set: function(value) {
              this.$labelPlacementDistanceItem = value
            }
          },

          /** @type {boolean} */
          shouldDisableLabelPlacementDistanceItem: {
            $meta: function() {
              return [demo.options.TypeAttribute(yfiles.lang.Boolean.$class)]
            },
            get: function() {
              return (
                this.edgeLabelingItem === demo.TreeLayoutConfig.EnumEdgeLabeling.NONE ||
                this.labelPlacementSideOfEdgeItem ===
                  demo.LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE
              )
            }
          },

          /** @lends {demo.TreeLayoutConfig} */
          $static: {
            // ReSharper restore UnusedMember.Global
            // ReSharper restore InconsistentNaming
            EnumRoute: new yfiles.lang.EnumDefinition(function() {
              return {
                ORTHOGONAL: 0,
                ORGANIC: 1,
                STRAIGHTLINE: 2,
                BUNDLED: 3
              }
            }),

            EnumEdgeLabeling: new yfiles.lang.EnumDefinition(function() {
              return {
                NONE: 0,
                INTEGRATED: 1,
                GENERIC: 2
              }
            }),

            EnumStyle: new yfiles.lang.EnumDefinition(function() {
              return {
                DEFAULT: 0,
                HORIZONTAL_VERTICAL: 1,
                COMPACT: 2,
                CLASSIC: 3
              }
            }),

            EnumNodePlacer: new yfiles.lang.EnumDefinition(function() {
              return {
                DEFAULT: 0,
                SIMPLE: 1,
                BUS: 2,
                DOUBLE_LINE: 3,
                LEFT_RIGHT: 4,
                LAYERED: 5,
                ASPECT_RATIO: 6,
                DENDROGRAM: 7,
                GRID: 8,
                COMPACT: 9
              }
            }),

            EnumRootAlignment: new yfiles.lang.EnumDefinition(function() {
              return {
                CENTER: 0,
                MEDIAN: 1,
                LEFT: 2,
                LEADING: 3,
                RIGHT: 4,
                TRAILING: 5
              }
            })
          }
        }
      })
    })
    return yfiles.module('demo')
  })
})(
  'undefined' != typeof window
    ? window
    : 'undefined' != typeof global
      ? global
      : 'undefined' != typeof self
        ? self
        : this
)
