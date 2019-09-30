/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
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
import {
  BaseClass,
  DefaultLabelStyle,
  EdgeSegmentLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HierarchicLayout,
  HierarchicLayoutData,
  HierarchicLayoutLayeringStrategy,
  ICommand,
  IEdge,
  IGraph,
  IInputModeContext,
  INode,
  IPropertyObservable,
  License,
  Point,
  PropertyChangedEventArgs,
  Rect,
  Size,
  TemplateNodeStyle
} from 'yfiles'

import RandomGraphGenerator from '../../utils/RandomGraphGenerator.js'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

let graphComponent = null

function run(licenseData) {
  License.value = licenseData
  // initialize the GraphComponent
  graphComponent = new GraphComponent('graphComponent')

  initializeInputMode()
  initializeGraph()
  initializeConverters()

  registerCommands()

  showApp(graphComponent)
}

async function runLayout() {
  // create a new layout algorithm
  const hierarchicLayout = new HierarchicLayout({
    orthogonalRouting: true,
    fromScratchLayeringStrategy: HierarchicLayoutLayeringStrategy.HIERARCHICAL_TOPMOST,
    integratedEdgeLabeling: true
  })

  // and layout data for it
  const hierarchicLayoutData = new HierarchicLayoutData({
    constraintIncrementalLayererAdditionalEdgeWeights: getEdgeWeight
  })
  const layerConstraints = hierarchicLayoutData.layerConstraints

  // iterate over all nodes of the graph
  const layerNode = new Array(7)
  graphComponent.graph.nodes.forEach(node => {
    const data = node.tag
    if (data && data.constraints) {
      switch (data.value) {
        case 0:
          // add constraint to put this node at the top
          layerConstraints.placeAtTop(node)
          break
        case 7:
          // add constraint to put this node at the bottom
          layerConstraints.placeAtBottom(node)
          break
        default: {
          // there are 8 possible values (0 to 7) but 0 and 7 are both treated in a special way
          const layer = data.value - 1
          const refNode = layerNode[layer]
          // if there was no node before this one in the specific layer
          if (!refNode) {
            // store the new node as the reference for the layer
            layerNode[layer] = node
          } else {
            // add a constraint that the reference node and the current node must be in the same row
            layerConstraints.placeInSameLayer(refNode, node)
          }
          break
        }
      }
    }
  })

  // add constraints between the layer reference nodes so the layout knows
  // that we want nodes in layer 1 to be over those in layer 2, 3, ..., 6.
  for (let i = 0; i < layerNode.length; i++) {
    const node = layerNode[i]
    if (node) {
      for (let j = 0; j < layerNode.length; j++) {
        // only non-same-layer edges
        if (i !== j) {
          // get node from the other layer
          const otherNode = layerNode[j]
          if (otherNode) {
            // we're looking at a node with a higher weight, so it must be placed below ours
            if (i < j) {
              layerConstraints.placeBelow(node, otherNode)
            } else {
              // it has a lower weight so it must be placed above ours
              layerConstraints.placeAbove(node, otherNode)
            }
          }
        }
      }
    }
  }

  // perform the layout operation
  setUIDisabled(true)
  try {
    await graphComponent.morphLayout(hierarchicLayout, '1s', hierarchicLayoutData)
  } catch (error) {
    if (typeof window.reportError === 'function') {
      window.reportError(error)
    } else {
      throw error
    }
  } finally {
    setUIDisabled(false)
  }
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
 * Calculates the weight of an edge by translating its (first) label into an int.
 * It will return 0 if the label is not a correctly formatted double.
 * @param {IEdge} edge
 * @return {number}
 */
function getEdgeWeight(edge) {
  // if edge has at least one label...
  if (edge.labels.size > 0) {
    // ..try to return it's value
    const length = Number.parseInt(edge.labels.get(0).text)
    if (!Number.isNaN(length)) {
      return length
    }
  }
  return 1
}

/**
 * Initializes the input mode for interaction.
 */
function initializeInputMode() {
  const inputMode = new GraphEditorInputMode({
    nodeCreator: createNodeCallback,
    labelEditableItems: GraphItemTypes.EDGE | GraphItemTypes.EDGE_LABEL,
    showHandleItems: GraphItemTypes.ALL ^ GraphItemTypes.NODE
  })
  inputMode.addValidateLabelTextListener((sender, args) => {
    args.newText = args.newText.trim()
    if (args.newText.length === 0) {
      return
    }
    const result = Number.parseFloat(args.newText)
    if (!Number.isNaN(result)) {
      // only allow numbers between 0 and 100
      if (result > 100 && result <= 0) {
        args.cancel = true
      }
    }
  })

  // listener for the buttons on the nodes
  inputMode.addItemClickedListener((sender, args) => {
    if (INode.isInstance(args.item)) {
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
  const defaultStyle = new TemplateNodeStyle('ConstraintNodeStyle')
  graph.nodeDefaults.style = defaultStyle
  // let the node decide how much space it needs and make sure it doesn't get any smaller.
  graph.nodeDefaults.size = new Size(60, 50)
  defaultStyle.minimumSize = graph.nodeDefaults.size

  // create a simple label style
  const labelStyle = new DefaultLabelStyle({
    font: 'Arial',
    backgroundFill: 'white',
    autoFlip: true,
    insets: [3, 5, 3, 5]
  })

  // set the style as the default for all new labels
  graph.nodeDefaults.labels.style = labelStyle
  graph.edgeDefaults.labels.style = labelStyle
  graph.edgeDefaults.labels.layoutParameter = new EdgeSegmentLabelModel().createDefaultParameter()

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
    nodeCreator: graph => createNodeCallback(null, graph, Point.ORIGIN, null)
  }).generate(graphComponent.graph)

  // center the graph to prevent the initial layout fading in from the top left corner
  graphComponent.fitGraphBounds()
}

/**
 * Binds commands to the buttons in the toolbar.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)

  bindAction("button[data-command='NewGraph']", () => {
    createGraph()
    runLayout()
  })
  bindAction("button[data-command='EnableAllConstraints']", enableConstraints)
  bindAction("button[data-command='DisableAllConstraints']", disableConstraints)
  bindAction("button[data-command='Layout']", runLayout)
}

/**
 * Callback that actually creates the node and its business object.
 * @param {IInputModeContext} context
 * @param {IGraph} graph
 * @param {Point} location
 * @param {INode} parent
 */
function createNodeCallback(context, graph, location, parent) {
  const bounds = Rect.fromCenter(location, graph.nodeDefaults.size)
  return graph.createNode({
    layout: bounds,
    tag: new LayerConstraintsData(Math.round(Math.random() * 7), Math.random() < 0.9)
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
  TemplateNodeStyle.CONVERTERS.layerconstraintsdemo = store
  // converter function for node background
  store.backgroundconverter = value => {
    if (Number.isInteger(value)) {
      switch (value) {
        case 0:
          return 'yellowgreen'
        case 7:
          return 'indianred'
        default: {
          return `rgb(${Math.round((value * 255) / 7)}, ${Math.round((value * 255) / 7)}, 255)`
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
const VALUE_CHANGED_EVENT_ARGS = new PropertyChangedEventArgs('value')
const CONSTRAINTS_CHANGED_EVENT_ARGS = new PropertyChangedEventArgs('constraints')

/**
 * A business object that represents the weight (through property "Value") of the node and whether or not its weight
 * should be taken into account as a layer constraint.
 */
class LayerConstraintsData extends BaseClass(IPropertyObservable) {
  /**
   * Creates a new instance of LayerConstraintsData.
   * @param {number} value
   * @param [number} constraints
   */
  constructor(value, constraints) {
    super()
    this.$value = value
    this.$constraints = constraints
    this.$propertyChangedListeners = []
  }

  /**
   * The weight of the object. An object with a lower number will be layered in a higher layer.
   * The number 0 means the node should be the in the first, 7 means it should be the last layer.
   * @return {number}
   */
  get value() {
    return this.$value
  }

  /**
   * The weight of the object. An object with a lower number will be layered in a higher layer.
   * The number 0 means the node should be the in the first, 7 means it should be the last layer.
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
   * @param {function(PropertyChangedEventArgs)} listener
   */
  addPropertyChangedListener(listener) {
    this.$propertyChangedListeners.push(listener)
  }

  /**
   * Removes a listener for property changes
   * @param {function(PropertyChangedEventArgs)} listener
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
   * @param {PropertyChangedEventArgs} args
   */
  propertyChanged(sender, args) {
    this.$propertyChangedListeners.forEach(listener => {
      listener(sender, args)
    })
  }
}

// run the demo
loadJson().then(run)
