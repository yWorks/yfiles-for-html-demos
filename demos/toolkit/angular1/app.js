/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/*
 * @yjs:keep = command,parameter,target,controller,directive,link,module,restrict,scope
 */
import {
  AssistantNodePlacer,
  ChildPlacement,
  Class,
  DefaultNodePlacer,
  GraphBuilder,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  IArrow,
  ICommand,
  IGraph,
  IMapper,
  INode,
  ItemCollection,
  LayoutExecutor,
  LeftRightNodePlacer,
  License,
  Mapper,
  NodeStyleDecorationInstaller,
  OrganicEdgeRouter,
  Point,
  PolylineEdgeStyle,
  RootAlignment,
  ShapeNodeStyle,
  ShowFocusPolicy,
  Size,
  TreeLayout,
  TreeLayoutData,
  TreeLayoutEdgeRoutingStyle,
  TreeReductionStage
} from 'yfiles'

import { detailTemplate, intermediateTemplate, overviewTemplate } from './resources/templates.js'
import LevelOfDetailNodeStyle from './LevelOfDetailNodeStyle.js'
import GraphData from './resources/data.js'
import { reportDemoError, showApp } from '../../resources/demo-app.js'
import { fetchLicense } from '../../resources/fetch-license.js'

/* global angular */
const module = angular.module('myApp', [])

showApp()

// @yjs:keep = graphComponent
module.controller('graphCtrl', [
  '$scope',
  $scope => {
    $scope.graphComponent = new GraphComponent()
    // the model data
    $scope.nodesModel = GraphData.nodeData
    $scope.edgesModel = GraphData.edgeData
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
    // @yjs:keep = graphComponent
    return {
      restrict: 'E',
      scope: {
        graphComponent: '=',
        nodesModel: '=',
        edgesModel: '=',
        nodeBinding: '@',
        sourceBinding: '@',
        targetBinding: '@',
        nodesFilter: '=',
        currentNode: '='
      },

      link(scope, $element, attrs) {
        // create the graphComponent
        const graphComponent = scope.graphComponent
        // always show the node focus
        graphComponent.focusIndicatorManager.showFocusPolicy = ShowFocusPolicy.ALWAYS
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
        if (scope.nodesModel) {
          const graphBuilder = new GraphBuilder(graphComponent.graph)

          // initialize the graph defaults
          initializeGraphDefaults(graphBuilder.graph)

          // assign the nodes and edges source - filter the nodes
          const nodesSource = graphBuilder.createNodesSource({
            id: null,
            data: $filter('filter')(scope.nodesModel, scope.nodesFilter),
            // store a scope object in the node's tag instead of the plain data object since the
            // node style of this demo compiles against the ng scope in the node's tag
            tag: data => {
              // create a new child scope
              const childScope = scope.$new(false)
              // assign the business data
              childScope.item = data
              // put the child scope in the node's tag
              return childScope
            }
          })

          // assign the binding, if set
          if (scope.nodeBinding) {
            nodesSource.idProvider = scope.nodeBinding
          }

          // configure the EdgesSource
          if (scope.edgesModel && scope.sourceBinding && scope.targetBinding) {
            graphBuilder.createEdgesSource(
              scope.edgesModel,
              scope.sourceBinding,
              scope.targetBinding
            )
          }

          // clear the graph build the graph from the source data
          graphComponent.graph = graphBuilder.buildGraph()

          // calculate the initial layout
          Layout.doLayout(graphComponent.graph)
          graphComponent.fitGraphBounds()

          // update the graph if the nodesFilter has changed
          let inLayout = false
          let modified = false
          const updateGraph = async () => {
            // prevent re-entrant layout
            if (!inLayout) {
              inLayout = true
              // re-assign filtered nodesSource
              graphBuilder.setData(
                nodesSource,
                $filter('filter')(scope.nodesModel, scope.nodesFilter)
              )
              // update the graph
              graphBuilder.updateGraph()
              try {
                // refresh layout
                await Layout.morphLayout(graphComponent)
              } catch (error) {
                reportDemoError(error)
              } finally {
                inLayout = false
              }
              if (modified) {
                // call this method again if nodesSource was modified while in layout
                modified = false
                return updateGraph()
              }
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
     * @param {GraphComponent} graphComponent
     */
    function initializeInputModes(graphComponent) {
      // create the input mode
      graphComponent.inputMode = new GraphViewerInputMode({
        selectableItems: GraphItemTypes.NONE
      })
    }

    /**
     * @param {IGraph} graph
     */
    function initializeDecoration(graph) {
      // customize the focus visualization
      const nodeDecorationInstaller = new NodeStyleDecorationInstaller({
        nodeStyle: new ShapeNodeStyle({
          shape: 'rectangle',
          stroke: '3px gold',
          fill: 'transparent'
        })
      })
      const decorator = graph.decorator
      decorator.nodeDecorator.focusIndicatorDecorator.setImplementation(nodeDecorationInstaller)
    }

    /**
     * @param {GraphComponent} graphComponent
     * @param {object} scope
     * @param {function} compile
     */
    function setupTooltips(graphComponent, scope, compile) {
      // use an AngularJS template for the tooltip content
      const template = '<div><div>{{item.name}}</div><div>{{item.position}}</div></div>'
      if (graphComponent.inputMode instanceof GraphViewerInputMode) {
        const inputMode = graphComponent.inputMode
        inputMode.toolTipItems = GraphItemTypes.NODE
        inputMode.addQueryItemToolTipListener((src, eventArgs) => {
          if (eventArgs.handled) {
            return
          }
          const item = eventArgs.item
          if (INode.isInstance(item)) {
            // create a new child scope
            const childScope = scope.$new()
            // assign the item to bind to
            childScope.item = item.tag.item
            // compile the template
            const templateElement = compile(template)(childScope)[0]
            scope.$digest()
            // set the template element as the tooltip content
            eventArgs.toolTip = templateElement
            eventArgs.handled = true
          }
        })
        // show the tooltip with a small offset
        inputMode.mouseHoverInputMode.toolTipLocationOffset = new Point(20, 20)
      }
    }

    /**
     * @param {IGraph} graph
     */
    function initializeGraphDefaults(graph) {
      // initialize the node and edge styles
      graph.nodeDefaults.style = new LevelOfDetailNodeStyle(
        $compile,
        detailTemplate,
        intermediateTemplate,
        overviewTemplate
      )
      graph.nodeDefaults.size = new Size(285, 100)

      graph.edgeDefaults.style = new PolylineEdgeStyle({
        stroke: '2px rgb(170, 170, 170)',
        targetArrow: IArrow.NONE
      })
    }
  }
])

/**
 * A directive for binding a yFiles command to a button
 */
module.directive('command', () => {
  return {
    restrict: 'A',
    scope: {
      command: '@',
      parameter: '=',
      target: '='
    },
    link(scope, $element, attrs) {
      const cmd = ICommand[scope.command]
      const parameter = scope.parameter || null
      const element = $element[0]
      if (cmd && element) {
        cmd.addCanExecuteChangedListener(() => {
          if (cmd.canExecute(parameter, scope.target)) {
            element.removeAttribute('disabled')
          } else {
            element.setAttribute('disabled', 'disabled')
          }
        })
        element.addEventListener('click', () => {
          if (cmd.canExecute(parameter, scope.target)) {
            cmd.execute(parameter, scope.target)
          }
        })
      }
    }
  }
})

// We need to load the 'view-layout-bridge' module explicitly to prevent tree-shaking
// tools it from removing this dependency which is needed for 'applyLayout'.
Class.ensure(LayoutExecutor)

/**
 * Provides the graph layout as a service.
 * Code taken from OrgChart Demo.
 */
module.factory('Layout', () => {
  return {
    $inLayout: false,
    treeLayout: createTreeLayout(),

    /**
     * @param {IGraph} tree
     */
    createTreeLayoutData(tree) {
      const nodePlacerMapper = new Mapper()
      const assistantNodes = []

      tree.nodes.forEach(node => {
        if (tree.inDegree(node) === 0) {
          setNodePlacers(node, nodePlacerMapper, assistantNodes, tree)
        }
      })

      return new TreeLayoutData({
        nodePlacers: nodePlacerMapper,
        assistantNodes: ItemCollection.from(assistantNodes)
      })
    },

    /**
     * @param {IGraph} graph
     */
    doLayout(graph) {
      const layoutData = this.createTreeLayoutData(graph)
      graph.applyLayout(this.treeLayout, layoutData)
    },

    /**
     * @param {GraphComponent} graphComponent
     */
    async morphLayout(graphComponent) {
      try {
        const layoutData = this.createTreeLayoutData(graphComponent.graph)
        await graphComponent.morphLayout(this.treeLayout, '0.5s', layoutData)
      } catch (error) {
        reportDemoError(error)
      }
    }
  }

  /**
   * @param {INode} rootNode
   * @param {IMapper.<INode, INodePlacer>} nodePlacerMapper
   * @param {INode[]} assistantNodes
   * @param {IGraph} tree
   */
  function setNodePlacers(rootNode, nodePlacerMapper, assistantNodes, tree) {
    const employee = rootNode.tag.item
    if (employee !== null) {
      switch (employee.layout) {
        case 'rightHanging': {
          const defaultNodePlacer = new DefaultNodePlacer(
            ChildPlacement.VERTICAL_TO_RIGHT,
            RootAlignment.LEADING_ON_BUS,
            30,
            30
          )
          defaultNodePlacer.routingStyle = TreeLayoutEdgeRoutingStyle.FORK_AT_ROOT
          nodePlacerMapper.set(rootNode, defaultNodePlacer)
          break
        }
        case 'leftHanging': {
          const defaultNodePlacer = new DefaultNodePlacer(
            ChildPlacement.VERTICAL_TO_LEFT,
            RootAlignment.LEADING_ON_BUS,
            30,
            30
          )
          defaultNodePlacer.routingStyle = TreeLayoutEdgeRoutingStyle.FORK_AT_ROOT
          nodePlacerMapper.set(rootNode, defaultNodePlacer)
          break
        }
        case 'bothHanging': {
          const newLeftRightPlacer = new LeftRightNodePlacer()
          newLeftRightPlacer.placeLastOnBottom = false
          nodePlacerMapper.set(rootNode, newLeftRightPlacer)
          break
        }
        default: {
          nodePlacerMapper.set(
            rootNode,
            new DefaultNodePlacer(ChildPlacement.HORIZONTAL_DOWNWARD, RootAlignment.MEDIAN, 30, 30)
          )
          break
        }
      }

      const assistant = employee.assistant
      if (assistant && tree.inDegree(rootNode) > 0) {
        // var inEdge = tree.inEdgesAt(rootNode).get(0);
        const inEdge = tree.inEdgesAt(rootNode).at(0)
        const parent = inEdge.sourceNode
        const oldParentPlacer = nodePlacerMapper.get(parent)
        const assistantNodePlacer = new AssistantNodePlacer()
        assistantNodePlacer.childNodePlacer = oldParentPlacer
        nodePlacerMapper.set(parent, assistantNodePlacer)
        assistantNodes.push(rootNode)
      }
    }

    tree.outEdgesAt(rootNode).forEach(outEdge => {
      const child = outEdge.targetPort.owner
      setNodePlacers(child, nodePlacerMapper, assistantNodes, tree)
    })
  }

  function createTreeLayout() {
    const tl = new TreeLayout()
    const treeReductionStage = new TreeReductionStage()
    treeReductionStage.nonTreeEdgeRouter = new OrganicEdgeRouter()
    treeReductionStage.nonTreeEdgeSelectionKey = OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY
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

/**
 * Breaks the given property value if it does not fit in a line.
 * @yjs:keep
 */
module.directive('linebreak', () => {
  return {
    restrict: 'A',
    replace: false,
    scope: { linebreak: '@' },
    link(scope, $element, attrs) {
      linebreak(scope.linebreak, attrs.attributes, $element)
      scope.$watch('linebreak', (newVal, oldVal) => {
        if (oldVal === newVal) {
          return
        }
        linebreak(newVal, attrs.attributes, $element)
      })
    }
  }

  /**
   * @param {string} newVal
   * @param {string} firstLine
   * @param {Element} element
   */
  function linebreak(newVal, firstLine, element) {
    let value = ''
    if (typeof newVal === 'string') {
      let copy = newVal
      while (copy.length > 20 && copy.indexOf(' ') > -1) {
        copy = copy.substring(0, copy.lastIndexOf(' '))
      }
      if (firstLine === 'true') {
        value = copy
      } else {
        value = newVal.substring(copy.length)
      }
    }
    element[0].textContent = value
  }
})

async function run() {
  License.value = await fetchLicense()
  angular.bootstrap(document.body, ['myApp'])
}

// noinspection JSIgnoredPromiseFromCall
run()
