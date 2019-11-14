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

require.config({
  paths: {
    yfiles: '../../../lib/umd/yfiles/',
    utils: '../../utils/',
    resources: '../../resources/'
  }
})

require([
  'yfiles/view-editor',
  'resources/demo-app',
  'RandomGraphGenerator.js',
  'yfiles/view-layout-bridge',
  'yfiles/layout-hierarchic',
  'resources/license'
], (/** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles, app, RandomGraphGenerator) => {
  let graphComponent = null

  function run() {
    // initialize the GraphComponent
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    initializeInputMode()
    initializeGraph()
    initializeConverters()

    registerCommands()

    app.show(graphComponent)
  }

  function runLayout() {
    // create a new layout algorithm
    const hierarchicLayout = new yfiles.hierarchic.HierarchicLayout()
    hierarchicLayout.orthogonalRouting = true

    // and layout data for it
    const hierarchicLayoutData = new yfiles.hierarchic.HierarchicLayoutData()

    // this is the factory that we apply the constraints to
    const sequenceConstraints = hierarchicLayoutData.sequenceConstraints

    // special handling for "first" and "last" position
    const headNodes = []
    const mixedNodes = []
    const tailNodes = []

    // iterate over all nodes in the graph
    graphComponent.graph.nodes.forEach(node => {
      // get their constraints
      const data = node.tag
      if (data && data.constraints) {
        // add them to the appropriate list
        switch (data.value) {
          case 0:
            headNodes.push(node)
            break
          case 7:
            tailNodes.push(node)
            break
          default:
            mixedNodes.push(node)
            break
        }
      }
    })

    // add the "at head" constraint for all head nodes
    headNodes.forEach(headNode => {
      sequenceConstraints.placeAtHead(headNode)
    })

    // add the "at tail" constraint for all tail nodes
    tailNodes.forEach(tailNode => {
      sequenceConstraints.placeAtTail(tailNode)
    })

    // add an "after" constraint for all nodes whose value is lower than the currently
    // looked at node.
    // You'll probably want to use an algorithm with better performance
    mixedNodes.forEach(node => {
      mixedNodes.forEach(otherNode => {
        const data = node.tag
        const otherData = otherNode.tag

        if (data && otherData && data.value < otherData.value) {
          sequenceConstraints.placeAfter(node, otherNode)
        }
      })
    })

    // perform the layout operation
    setUIDisabled(true)
    graphComponent
      .morphLayout(hierarchicLayout, '1s', hierarchicLayoutData)
      .then(() => {
        setUIDisabled(false)
      })
      .catch(error => {
        setUIDisabled(false)
        if (typeof window.reportError === 'function') {
          window.reportError(error)
        }
      })
  }

  /**
   * Disables the HTML elements of the UI and the input mode.
   *
   * @param disabled true if the elements should be disabled, false otherwise
   */
  function setUIDisabled(disabled) {
    document.getElementById('newButton').disabled = disabled
    document.getElementById('enableAllConstraintsButton').disabled = disabled
    document.getElementById('disableAllConstraintsButton').disabled = disabled
    document.getElementById('layoutButton').disabled = disabled
  }

  /**
   * Initializes the input mode for interaction.
   */
  function initializeInputMode() {
    const inputMode = new yfiles.input.GraphEditorInputMode({
      nodeCreator: createNodeCallback,
      labelEditableItems: yfiles.graph.GraphItemTypes.NONE,
      showHandleItems: yfiles.graph.GraphItemTypes.ALL ^ yfiles.graph.GraphItemTypes.NODE
    })

    // listener for the buttons on the nodes
    inputMode.addItemClickedListener((sender, args) => {
      if (yfiles.graph.INode.isInstance(args.item)) {
        const node = args.item
        const location = args.location
        const layout = node.layout
        if (node.tag) {
          if (node.tag.constraints) {
            if (location.y > layout.y + layout.height * 0.5) {
              if (location.x < layout.x + layout.width * 0.3) {
                node.tag.value = Math.max(0, node.tag.value - 1)
              } else if (location.x > layout.x + layout.width * 0.7) {
                node.tag.value = Math.min(7, node.tag.value + 1)
              } else {
                node.tag.constraints = !node.tag.constraints
              }
            }
          } else {
            node.tag.constraints = !node.tag.constraints
          }
        }
      }
    })
    graphComponent.inputMode = inputMode
  }

  /**
   * Initializes the graph instance setting default styles and creates a small sample graph.
   */
  function initializeGraph() {
    const graph = graphComponent.graph

    // set the style as the default for all new nodes
    const defaultStyle = new yfiles.styles.TemplateNodeStyle('ConstraintNodeStyle')
    graph.nodeDefaults.style = defaultStyle
    // let the node decide how much space it needs and make sure it doesn't get any smaller.
    graph.nodeDefaults.size = new yfiles.geometry.Size(60, 50)
    defaultStyle.minimumSize = graph.nodeDefaults.size

    // create the graph and perform a layout operation
    createGraph()
    runLayout()
  }

  /**
   * Clears the existing graph and creates a new random graph
   */
  function createGraph() {
    // remove all nodes and edges from the graph
    graphComponent.graph.clear()

    // create a new random graph
    new RandomGraphGenerator({
      allowCycles: true,
      allowMultipleEdges: false,
      allowSelfLoops: false,
      edgeCount: 25,
      nodeCount: 20,
      nodeCreator: graph => createNodeCallback(null, graph, yfiles.geometry.Point.ORIGIN, null)
    }).generate(graphComponent.graph)

    // center the graph to prevent the initial layout fading in from the top left corner
    graphComponent.fitGraphBounds()
  }

  /**
   * Binds commands to the buttons in the toolbar.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)

    app.bindAction("button[data-command='NewGraph']", () => {
      createGraph()
      runLayout()
    })
    app.bindAction("button[data-command='EnableAllConstraints']", enableConstraints)
    app.bindAction("button[data-command='DisableAllConstraints']", disableConstraints)
    app.bindAction("button[data-command='Layout']", runLayout)
  }

  /**
   * Callback that actually creates the node and its business object.
   * @param {yfiles.input.IInputModeContext} context
   * @param {yfiles.graph.IGraph} graph
   * @param {yfiles.geometry.Point} location
   * @param {yfiles.graph.INode} parent
   */
  function createNodeCallback(context, graph, location, parent) {
    const bounds = yfiles.geometry.Rect.fromCenter(location, graph.nodeDefaults.size)
    return graph.createNode({
      layout: bounds,
      tag: new SequenceConstraintsData(Math.round(Math.random() * 7), Math.random() < 0.9)
    })
  }

  /**
   * Disables all constraints on the nodes.
   */
  function disableConstraints() {
    graphComponent.graph.nodes.forEach(node => {
      const data = node.tag
      if (data) {
        data.constraints = false
      }
    })
  }

  /**
   * Enables all constraints on the nodes.
   */
  function enableConstraints() {
    graphComponent.graph.nodes.forEach(node => {
      const data = node.tag
      if (data) {
        data.constraints = true
      }
    })
  }

  /**
   * Initializes the converters for the constraint node styles.
   */
  function initializeConverters() {
    // create an object to store the converter functions
    const store = {}
    yfiles.styles.TemplateNodeStyle.CONVERTERS.sequenceconstraintsdemo = store
    // converter function for node background
    store.backgroundconverter = value => {
      if (Number.isInteger(value)) {
        switch (value) {
          case 0:
            return 'yellowgreen'
          case 7:
            return 'indianred'
          default: {
            return `rgb(${Math.round(value * 255 / 7)}, ${Math.round(value * 255 / 7)}, 255)`
          }
        }
      }
      return '#FFF'
    }

    store.textcolorconverter = value => {
      if (Number.isInteger(value)) {
        switch (value) {
          case 0:
            return 'black'
          case 7:
            return 'black'
          default:
            if (value / 7 > 0.5) {
              return 'black'
            }
        }
      }
      return 'white'
    }

    store.constraintconverter = value => {
      switch (value) {
        case 0:
          return 'First'
        case 7:
          return 'Last'
        default:
          return value.toString()
      }
    }

    store.constraintsvisibilityconverter = constraints => (constraints ? 'visible' : 'hidden')
    store.noconstraintsvisibilityconverter = constraints => (constraints ? 'hidden' : 'visible')
  }

  // property changed support - needed for data-binding to the Control Style
  const VALUE_CHANGED_EVENT_ARGS = new yfiles.lang.PropertyChangedEventArgs('value')
  const CONSTRAINTS_CHANGED_EVENT_ARGS = new yfiles.lang.PropertyChangedEventArgs('constraints')

  /**
   * A business object that represents the weight (through property "Value") of the node and whether or not its weight
   * should be taken into account as a sequence constraint.
   */
  class SequenceConstraintsData extends yfiles.lang.Class(yfiles.lang.IPropertyObservable) {
    /**
     * Creates a new instance of SequenceConstraintsData.
     * @param {number} value
     * @param {boolean} constraints
     */
    constructor(value, constraints) {
      super()
      this.$value = value
      this.$constraints = constraints
      this.$propertyChangedListeners = []
    }

    /**
     * The weight of the object. And object with a lower number will be displayed to the left.
     * The number 0 means the node should be the first, 7 means it should be the last.
     * @return {number}
     */
    get value() {
      return this.$value
    }

    /**
     * The weight of the object. And object with a lower number will be displayed to the left.
     * The number 0 means the node should be the first, 7 means it should be the last.
     * @param {number} value
     */
    set value(value) {
      const oldVal = this.$value
      this.$value = value
      if (oldVal !== value && this.propertyChanged) {
        this.propertyChanged(this, VALUE_CHANGED_EVENT_ARGS)
      }
    }

    /**
     * Describes whether or not the constraint is active. If <code>true</code>, the constraint will be taken into
     * account by the layout algorithm.
     * @return {boolean}
     */
    get constraints() {
      return this.$constraints
    }

    /**
     * Describes whether or not the constraint is active. If <code>true</code>, the constraint will be taken into
     * account by the layout algorithm.
     * @param {boolean} value
     */
    set constraints(value) {
      const oldConstraints = this.$constraints
      this.$constraints = value
      if (oldConstraints !== value && this.propertyChanged) {
        this.propertyChanged(this, CONSTRAINTS_CHANGED_EVENT_ARGS)
      }
    }

    /**
     * Adds a listener for property changes
     * @param {function(yfiles.lang.PropertyChangedEventArgs)} listener
     */
    addPropertyChangedListener(listener) {
      this.$propertyChangedListeners.push(listener)
    }

    /**
     * Removes a listener for property changes
     * @param {function(yfiles.lang.PropertyChangedEventArgs)} listener
     */
    removePropertyChangedListener(listener) {
      const index = this.$propertyChangedListeners.indexOf(listener)
      if (index >= 0) {
        this.$propertyChangedListeners.splice(index, 1)
      }
    }

    /**
     * Notifies all registered listeners when a property changed.
     * @param {Object} sender
     * @param {yfiles.lang.PropertyChangedEventArgs} args
     */
    propertyChanged(sender, args) {
      this.$propertyChangedListeners.forEach(listener => {
        listener(sender, args)
      })
    }
  }

  // run the demo
  run()
})
