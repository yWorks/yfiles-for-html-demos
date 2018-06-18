/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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

require.config({
  paths: {
    yfiles: '../../../lib/umd/yfiles/',
    utils: '../../utils/',
    resources: '../../resources/'
  }
})

require([
  'yfiles/view-component',
  'resources/demo-app',
  'LevelOfDetailNodeStyle.js',
  './resources/data.js',
  './ScopeGraphBuilder.js',
  './resources/templates.js',
  'yfiles/view-layout-bridge',
  'yfiles/layout-tree',
  'yfiles/router-polyline',
  'yfiles/router-other',
  'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.8/angular.min.js',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  LevelOfDetailNodeStyle,
  data,
  ScopeGraphBuilder,
  templates
) => {
  /*
 * @yjs:keep=command,commandParameter,commandTarget,controller,directive,link,module,replace,restrict,scope
 */
  function run() {
    app.show()

    /* global angular */
    const module = angular.module('myApp', [])

    // @yjs:keep
    module.controller('graphCtrl', [
      '$scope',
      $scope => {
        // the model data
        $scope.nodesModel = data.nodeData
        $scope.edgesModel = data.edgeData
      }
    ])

    /**
     * The graphComponent directive
     */
    module.directive('graphComponent', [
      '$compile',
      '$filter',
      'Layout',
      ($compile, $filter, Layout) => {
        // @yjs:blacklist=currentNode,edgesSource,nodesFilter,nodeIdBinding,nodesSource,sourceNodeBinding,targetNodeBinding
        return {
          restrict: 'AE',
          replace: false,
          // @yjs:keep
          scope: {
            nodesSource: '=',
            edgesSource: '=',
            nodeIdBinding: '@',
            sourceNodeBinding: '@',
            targetNodeBinding: '@',
            nodesFilter: '=',
            currentNode: '='
          },

          link(scope, $element, attrs) {
            // create the graphComponent
            const graphComponent = new yfiles.view.GraphComponent()
            initializeGraphComponent(graphComponent)
            // and enable interaction
            initializeInputModes(graphComponent)
            setupTooltips(graphComponent, scope, $compile)

            // put graphComponent div in DOM
            const div = $element[0]
            if (div) {
              div.appendChild(graphComponent.div)
              div.graphComponent = graphComponent
            }

            // if a nodesSource is defined, initialize the graph
            if (scope.nodesSource) {
              const graphBuilder = new ScopeGraphBuilder(graphComponent.graph, scope)
              // assign the bindings, if set
              if (scope.nodeIdBinding) {
                graphBuilder.nodeIdBinding = scope.nodeIdBinding
              }
              if (scope.sourceNodeBinding) {
                graphBuilder.sourceNodeBinding = scope.sourceNodeBinding
              }
              if (scope.targetNodeBinding) {
                graphBuilder.targetNodeBinding = scope.targetNodeBinding
              }

              // initialize the graph defaults
              initializeGraphDefaults(graphBuilder.graph)

              // assign the nodes and edges source - filter the nodes
              graphBuilder.nodesSource = $filter('filter')(scope.nodesSource, scope.nodesFilter)
              if (scope.edgesSource) {
                graphBuilder.edgesSource = scope.edgesSource
              }

              // build the graph from the source data
              graphComponent.graph = graphBuilder.buildGraph()

              // calculate the initial layout
              Layout.doLayout(graphComponent.graph)
              graphComponent.fitGraphBounds()

              // update the graph if the nodesFilter has changed
              let inLayout = false
              let modified = false
              const updateGraph = () => {
                // prevent re-entrant layout
                if (!inLayout) {
                  inLayout = true
                  // re-assign filtered nodesSource
                  graphBuilder.nodesSource = $filter('filter')(scope.nodesSource, scope.nodesFilter)
                  // update the graph
                  graphBuilder.updateGraph()
                  // refresh layout
                  Layout.morphLayout(graphComponent)
                    .then(() => {
                      inLayout = false
                      if (modified) {
                        // call this method again if nodesSource was modified while in layout
                        modified = false
                        updateGraph()
                      }
                    })
                    .catch(error => {
                      inLayout = false
                      if (typeof window.reportError === 'function') {
                        window.reportError(error)
                      }
                    })
                } else {
                  // remember when we reach this code path when a layout is already running
                  modified = true
                }
              }

              // update the graph if the filter has changed
              scope.$watch(
                'nodesFilter',
                () => {
                  updateGraph()
                },
                true
              )
            }
            // initialize the custom focus visualization
            initializeDecoration(graphComponent.graph)

            // update the scope accordingly if the current item has changed
            graphComponent.addCurrentItemChangedListener((sender, args) => {
              const currentNode = graphComponent.currentItem
                ? graphComponent.currentItem.tag.item
                : null
              if (scope.currentNode !== currentNode) {
                scope.$evalAsync(() => {
                  scope.currentNode = currentNode
                })
              }
            })

            // update the current item in the graphComponent if scope.currentNode has changed
            scope.$watch('currentNode', newValue => {
              // look for node with this tag
              const item = graphComponent.graph.nodes.find(n => n.tag.item === newValue)
              // set it as currentItem
              graphComponent.currentItem = item
              if (item !== null) {
                // scroll the item into view
                graphComponent.ensureVisible(item.layout.toRect().getEnlarged(10))
              }
            })
          }
        }

        /**
         * @param {yfiles.view.GraphComponent} graphComponent
         */
        function initializeGraphComponent(graphComponent) {
          // always show the node focus
          graphComponent.focusIndicatorManager.showFocusPolicy = yfiles.view.ShowFocusPolicy.ALWAYS

          // register commands.
          const iCommand = yfiles.input.ICommand
          app.bindCommand(
            "button[data-command='ZoomIn']",
            iCommand.INCREASE_ZOOM,
            graphComponent,
            null
          )
          app.bindCommand(
            "button[data-command='ZoomOut']",
            iCommand.DECREASE_ZOOM,
            graphComponent,
            null
          )
          app.bindCommand(
            "button[data-command='FitContent']",
            iCommand.FIT_GRAPH_BOUNDS,
            graphComponent,
            null
          )
          app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)
        }

        /**
         * @param {yfiles.view.GraphComponent} graphComponent
         */
        function initializeInputModes(graphComponent) {
          // create the input mode
          graphComponent.inputMode = new yfiles.input.GraphViewerInputMode({
            selectableItems: yfiles.graph.GraphItemTypes.NONE
          })
        }

        /**
         * @param {yfiles.graph.IGraph} graph
         */
        function initializeDecoration(graph) {
          // customize the focus visualization
          const nodeDecorationInstaller = new yfiles.view.NodeStyleDecorationInstaller({
            nodeStyle: new yfiles.styles.ShapeNodeStyle({
              shape: 'rectangle',
              stroke: '3px gold',
              fill: 'transparent'
            })
          })
          const decorator = graph.decorator
          decorator.nodeDecorator.focusIndicatorDecorator.setImplementation(nodeDecorationInstaller)
        }

        /**
         * @param {yfiles.view.GraphComponent} graphComponent
         * @param {object} scope
         * @param {function} compile
         */
        function setupTooltips(graphComponent, scope, compile) {
          // use an AngularJS template for the tooltip
          const template = '<div><div>{{item.name}}</div><div>{{item.position}}</div></div>'
          if (graphComponent.inputMode instanceof yfiles.input.GraphViewerInputMode) {
            const inputMode = graphComponent.inputMode
            inputMode.toolTipItems = yfiles.graph.GraphItemTypes.NODE
            inputMode.addQueryItemToolTipListener((src, eventArgs) => {
              if (eventArgs.handled) {
                return
              }
              const item = eventArgs.item
              if (yfiles.graph.INode.isInstance(item)) {
                // create a new child scope
                const childScope = scope.$new()
                // assign the item to bind to
                childScope.item = item.tag.item
                // compile the template
                const templateElement = compile(template)(childScope)[0]
                scope.$digest()
                // set the template element as the tooltip
                eventArgs.toolTip = templateElement
                eventArgs.handled = true
              }
            })
            // show the tooltip with a small offset
            inputMode.mouseHoverInputMode.toolTipLocationOffset = new yfiles.geometry.Point(20, 20)
          }
        }

        /**
         * @param {yfiles.graph.IGraph} graph
         */
        function initializeGraphDefaults(graph) {
          // initialize the node and edge styles
          graph.nodeDefaults.style = new LevelOfDetailNodeStyle(
            $compile,
            templates.detailTemplate,
            templates.intermediateTemplate,
            templates.overviewTemplate
          )
          graph.nodeDefaults.size = new yfiles.geometry.Size(250, 100)

          graph.edgeDefaults.style = new yfiles.styles.PolylineEdgeStyle({
            pen: '2px rgb(36, 154, 231)',
            targetArrow: yfiles.styles.IArrow.NONE
          })
        }
      }
    ])

    /**
     * A directive for binding a yFiles command to a button
     */
    module.directive('command', () => {
      const commands = {
        fitContent: yfiles.input.ICommand.FIT_GRAPH_BOUNDS,
        zoomIn: yfiles.input.ICommand.INCREASE_ZOOM,
        zoomOut: yfiles.input.ICommand.DECREASE_ZOOM
      }

      return {
        restrict: 'A',
        replace: false,
        scope: {
          command: '@',
          commandParameter: '=',
          commandTarget: '='
        },
        link(scope, $element, attrs) {
          // get the command object from the name
          const cmd = getCommand(scope.command)
          const parameter = scope.commandParameter
          const element = $element[0]
          if (element) {
            element.addEventListener('click', () => {
              if (cmd) {
                cmd.execute(parameter, getTarget(scope.commandTarget))
              }
            })
          }
        }
      }

      /**
       * @param {string} name
       * @return {string|null}
       */
      function getCommand(name) {
        // get the command object from the name string
        return name in commands ? commands[name] : null
      }

      /**
       * @param {object} target
       * @return {yfiles.view.GraphComponent|null}
       */
      function getTarget(target) {
        // look for the command target using the provided selector or element
        if (typeof target === 'string') {
          return document.querySelector(target).graphComponent
        } else if (target instanceof Element) {
          return target.graphComponent
        }
        return null
      }
    })

    /**
     * Provides the graph layout as a service.
     * Code taken from OrgChart Demo.
     */
    module.factory('Layout', () => {
      return {
        $inLayout: false,
        treeLayout: createTreeLayout(),

        /**
         * @param {yfiles.graph.IGraph} tree
         */
        configureLayout(tree) {
          const registry = tree.mapperRegistry

          const nodePlacerMapper = registry.createMapper(yfiles.tree.TreeLayout.NODE_PLACER_DP_KEY)
          const assistantMapper = registry.createMapper(
            yfiles.tree.AssistantNodePlacer.ASSISTANT_NODE_DP_KEY
          )

          tree.nodes.forEach(node => {
            if (tree.inDegree(node) === 0) {
              setNodePlacers(node, nodePlacerMapper, assistantMapper, tree)
            }
          })
        },

        /**
         * @param {yfiles.graph.IGraph} graph
         */
        cleanUp(graph) {
          const registry = graph.mapperRegistry
          registry.removeMapper(yfiles.tree.AssistantNodePlacer.ASSISTANT_NODE_DP_KEY)
          registry.removeMapper(yfiles.tree.TreeLayout.NODE_PLACER_DP_KEY)
        },

        /**
         * @param {yfiles.graph.IGraph} graph
         */
        doLayout(graph) {
          this.configureLayout(graph)
          graph.applyLayout(this.treeLayout)
          this.cleanUp(graph)
        },

        /**
         * @param {yfiles.view.GraphComponent} graphComponent
         */
        morphLayout(graphComponent) {
          this.configureLayout(graphComponent.graph)
          return graphComponent
            .morphLayout(this.treeLayout, '0.5s')
            .then(() => {
              this.cleanUp(graphComponent.graph)
            })
            .catch(error => {
              this.cleanUp(graphComponent.graph)
              if (typeof window.reportError === 'function') {
                window.reportError(error)
              }
            })
        }
      }

      /**
       * @param {yfiles.graph.INode} rootNode
       * @param {yfiles.collections.IMapper.<yfiles.tree.INodePlacer>} nodePlacerMapper
       * @param {yfiles.collections.IMapper.<yfiles.graph.INode>} assistantMapper
       * @param {yfiles.graph.IGraph} tree
       */
      function setNodePlacers(rootNode, nodePlacerMapper, assistantMapper, tree) {
        const employee = rootNode.tag.item
        if (employee !== null) {
          switch (employee.layout) {
            case 'rightHanging': {
              const defaultNodePlacer = new yfiles.tree.DefaultNodePlacer(
                yfiles.tree.ChildPlacement.VERTICAL_TO_RIGHT,
                yfiles.tree.RootAlignment.LEADING_ON_BUS,
                30,
                30
              )
              defaultNodePlacer.routingStyle = yfiles.tree.RoutingStyle.FORK_AT_ROOT
              nodePlacerMapper.set(rootNode, defaultNodePlacer)
              break
            }
            case 'leftHanging': {
              const defaultNodePlacer = new yfiles.tree.DefaultNodePlacer(
                yfiles.tree.ChildPlacement.VERTICAL_TO_LEFT,
                yfiles.tree.RootAlignment.LEADING_ON_BUS,
                30,
                30
              )
              defaultNodePlacer.routingStyle = yfiles.tree.RoutingStyle.FORK_AT_ROOT
              nodePlacerMapper.set(rootNode, defaultNodePlacer)
              break
            }
            case 'bothHanging': {
              const newLeftRightPlacer = new yfiles.tree.LeftRightNodePlacer()
              newLeftRightPlacer.placeLastOnBottom = false
              nodePlacerMapper.set(rootNode, newLeftRightPlacer)
              break
            }
            default: {
              nodePlacerMapper.set(
                rootNode,
                new yfiles.tree.DefaultNodePlacer(
                  yfiles.tree.ChildPlacement.HORIZONTAL_DOWNWARD,
                  yfiles.tree.RootAlignment.MEDIAN,
                  30,
                  30
                )
              )
              break
            }
          }

          const assistant = employee.assistant
          if (assistant && tree.inDegree(rootNode) > 0) {
            // var inEdge = tree.inEdgesAt(rootNode).get(0);
            const inEdge = tree.inEdgesAt(rootNode).elementAt(0)
            const parent = inEdge.sourceNode
            const oldParentPlacer = nodePlacerMapper.get(parent)
            const assistantNodePlacer = new yfiles.tree.AssistantNodePlacer()
            assistantNodePlacer.childNodePlacer = oldParentPlacer
            nodePlacerMapper.set(parent, assistantNodePlacer)
            assistantMapper.set(rootNode, true)
          }
        }

        tree.outEdgesAt(rootNode).forEach(outEdge => {
          const child = outEdge.targetPort.owner
          setNodePlacers(child, nodePlacerMapper, assistantMapper, tree)
        })
      }

      function createTreeLayout() {
        const tl = new yfiles.tree.TreeLayout()
        const treeReductionStage = new yfiles.tree.TreeReductionStage()
        treeReductionStage.nonTreeEdgeRouter = new yfiles.router.OrganicEdgeRouter()
        treeReductionStage.nonTreeEdgeSelectionKey =
          yfiles.router.OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY
        tl.appendStage(treeReductionStage)
        return tl
      }
    })

    /**
     * Evaluates the attribute value upon Enter or Escape press.
     * @yjs:keep
     */
    module.directive('enterPress', () => (scope, element, attrs) => {
      element.bind('keydown keypress', event => {
        if (event.which === 13 || event.which === 27) {
          scope.$apply(() => {
            scope.$eval(attrs.enterPress)
          })
          event.preventDefault()
        }
      })
    })

    /**
     * Abbreviates the given name and sets it as textContent.
     * @yjs:keep
     */
    module.directive('abbreviate', () => {
      return {
        restrict: 'A',
        replace: false,
        scope: { abbreviate: '@' },
        link(scope, $element, attrs) {
          abbreviate(scope.abbreviate, $element)
          scope.$watch('abbreviate', (newVal, oldVal) => {
            if (oldVal === newVal) {
              return
            }
            abbreviate(newVal, $element)
          })
        }
      }

      /**
       * @param {string} newVal
       * @param {Element} element
       */
      function abbreviate(newVal, element) {
        const s = newVal
        if (s) {
          const strings = s.split(' ')
          let converted = `${strings[0].substr(0, 1)}.`
          for (let i = 1; i < strings.length; i++) {
            converted += ` ${strings[i]}`
          }
          element[0].textContent = converted
        }
      }
    })

    angular.bootstrap(document.body, ['myApp'])
  }

  // start demo
  run()
})
