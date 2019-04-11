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
  AspectRatioNodePlacer,
  AssistantNodePlacer,
  BusNodePlacer,
  BusPlacement,
  ChildPlacement,
  CompactNodePlacer,
  DefaultNodePlacer,
  DoubleLineNodePlacer,
  Fill,
  FillStyle,
  GraphComponent,
  GridNodePlacer,
  HashMap,
  IGraph,
  ITreeLayoutNodePlacer,
  LeafNodePlacer,
  LeftRightNodePlacer,
  Mapper,
  Rect,
  RootAlignment,
  RootNodeAlignment,
  RotatableNodePlacerBase,
  RotatableNodePlacerMatrix,
  ShapeNodeShape,
  ShapeNodeStyle,
  SimpleNodePlacer,
  TreeLayout,
  TreeLayoutData,
  TreeLayoutEdgeRoutingStyle
} from 'yfiles'

import { setComboboxValue } from '../../resources/demo-app.js'
// a map which stores the specified node placer for each layer
const nodePlacers = new Mapper()

// a list of svg colors that are assigned to the layers
const layerColors = [
  'crimson',
  'darkturquoise',
  'cornflowerblue',
  'darkslateblue',
  'gold',
  'mediumslateblue',
  'forestgreen',
  'mediumvioletred',
  'darkcyan',
  'chocolate',
  'orange',
  'limegreen',
  'mediumorchid',
  'royalblue',
  'orangered'
]

// a list of fill colors that are assigned to the layers
const layerFills = [
  Fill.CRIMSON,
  Fill.DARK_TURQUOISE,
  Fill.CORNFLOWER_BLUE,
  Fill.DARK_SLATE_BLUE,
  Fill.GOLD,
  Fill.MEDIUM_SLATE_BLUE,
  Fill.FOREST_GREEN,
  Fill.MEDIUM_VIOLET_RED,
  Fill.DARK_CYAN,
  Fill.CHOCOLATE,
  Fill.ORANGE,
  Fill.LIME_GREEN,
  Fill.MEDIUM_ORCHID,
  Fill.ROYAL_BLUE,
  Fill.ORANGE_RED
]

/**
 * A panel that provides access to customize the node placers for each layer.
 */
export default class NodePlacerPanel {
  /**
   * Creates a new instance of NodePlacerPanel.
   * @param {IGraph} graph
   */
  constructor(graph) {
    // initialize the preview component where the node placer settings are demonstrated on a small graph
    this.previewComponent = new GraphComponent('previewComponent')
    createPreviewGraph(this.previewComponent)
    runPreviewLayout(null, this.previewComponent)

    // connect the UI elements of this panel that are not specific for one node placer
    bindActions(this)

    // initialize layer size
    this.$layer = 0
    this.$maxLayer = this.updateMaxLayer(graph)

    // initializes change listener handling
    this.changeListeners = []

    // create node placer configurations
    this.nodePlacerConfigurations = new HashMap()
    this.nodePlacerConfigurations.set('DefaultNodePlacer', new DefaultNodePlacerConfiguration(this))
    this.nodePlacerConfigurations.set('SimpleNodePlacer', new SimpleNodePlacerConfiguration(this))
    this.nodePlacerConfigurations.set('BusNodePlacer', new BusNodePlacerConfiguration(this))
    this.nodePlacerConfigurations.set('GridNodePlacer', new GridNodePlacerConfiguration(this))
    this.nodePlacerConfigurations.set(
      'DoubleLineNodePlacer',
      new DoubleLineNodePlacerConfiguration(this)
    )
    this.nodePlacerConfigurations.set(
      'LeftRightNodePlacer',
      new LeftRightNodePlacerConfiguration(this)
    )
    this.nodePlacerConfigurations.set(
      'AspectRatioNodePlacer',
      new AspectRatioNodePlacerConfiguration(this)
    )
    this.nodePlacerConfigurations.set(
      'AssistantNodePlacer',
      new AssistantNodePlacerConfiguration(this)
    )
    this.nodePlacerConfigurations.set('CompactNodePlacer', new CompactNodePlacerConfiguration(this))

    // choose DefaultNodePlacer as initial node placer for all layers
    this.currentNodePlacerConfiguration = this.nodePlacerConfigurations.get('DefaultNodePlacer')
    this.currentNodePlacerConfiguration.visible = true
    this.currentNodePlacerConfiguration.updatePanel()
    this.panelChanged()
  }

  /**
   * Returns a map which provides a {@link ITreeLayoutNodePlacer} for each layer
   * @return {Mapper.<ITreeLayoutNodePlacer>}
   */
  get nodePlacers() {
    return nodePlacers
  }

  /**
   * Returns the current layer whose settings are accessible through this panel.
   * @return {number}
   */
  get layer() {
    return this.$layer
  }

  /**
   * Sets the current layer whose settings are accessible through this panel.
   * @param {number} layer
   */
  set layer(layer) {
    this.$layer = layer
    document.getElementById('layer-index').value = layer
    this.onLayerChanged(layer)
  }

  /**
   * Returns the maximum layer for the current graph.
   * @return {number}
   */
  get maxLayer() {
    return this.$maxLayer
  }

  /**
   * Updates the maximum layer for the current graph. This should be called when nodes were added/removed.
   * @param {IGraph} graph
   */
  updateMaxLayer(graph) {
    let max = 0
    graph.nodes.forEach(node => {
      max = Math.max(max, node.tag.layer)
    })
    if (this.$maxLayer !== max) {
      const layerIndex = document.getElementById('layer-index')
      layerIndex.max = max
    }
    this.$maxLayer = max
  }

  /**
   * Returns a list of fill colors that can be used to color the nodes in the color of their layer.
   * @return {Array.<Fill>}
   */
  static get layerFills() {
    return layerFills
  }

  /**
   * Updates the node placer map and preview graph.
   * This method is called when there are changes in the panel and notifies all registered change listeners.
   */
  panelChanged() {
    const nodePlacer = this.currentNodePlacerConfiguration.createNodePlacer()
    const layerIndex = document.getElementById('layer-index').value
    this.nodePlacers.set(layerIndex, nodePlacer)
    runPreviewLayout(nodePlacer, this.previewComponent)
    this.updateChangeListeners()
  }

  /**
   * Updates which node placer configuration is used in this panel and the layout of the preview graph.
   * @param {number} newLayer
   */
  onLayerChanged(newLayer) {
    const layer = newLayer % layerColors.length
    const layerDiv = document.getElementById('layer-section')
    layerDiv.setAttribute('style', `background-color:${layerColors[layer]}`)
    const layerLabel = document.getElementById('layer-label')
    const cssClass =
      layer === 1 || layer === 4 || layer === 10 || layer === 11
        ? 'layer-label-black'
        : 'layer-label-white'
    layerLabel.setAttribute('class', cssClass)
    const resetButton = document.getElementById('reset-node-placer')
    const resetCssClass =
      layer === 1 || layer === 4 || layer === 10 || layer === 11
        ? 'reset-node-placer-black'
        : 'reset-node-placer-white'
    resetButton.setAttribute('class', resetCssClass)

    const layerIndex = document.getElementById('layer-index').value
    const nodePlacer = nodePlacers.get(layerIndex) || new DefaultNodePlacer()
    const configurationName = getConfigurationName(nodePlacer)
    setComboboxValue('select-node-placer', configurationName)
    const configuration = this.nodePlacerConfigurations.get(configurationName)
    configuration.adoptSettings(nodePlacer)

    this.currentNodePlacerConfiguration.visible = false
    this.currentNodePlacerConfiguration = configuration
    this.currentNodePlacerConfiguration.visible = true

    const rotationElement = document.getElementById('rotation')
    const spacingElement = document.getElementById('rotatable-spacing')
    if (configuration.rotatable) {
      rotationElement.style.display = 'block'
      spacingElement.style.display = 'block'
    } else {
      rotationElement.style.display = 'none'
      spacingElement.style.display = 'none'
    }

    this.currentNodePlacerConfiguration.updatePanel()

    this.nodePlacers.set(layerIndex, nodePlacer)
    runPreviewLayout(nodePlacer, this.previewComponent)
  }

  /**
   * Adds the given listener to the list of listeners that are notified when the node placer settings change.
   * @param {function} listener
   */
  addChangeListener(listener) {
    this.changeListeners.push(listener)
  }

  /**
   * Removes the given listener to the list of listeners that are notified when the node placer settings change.
   * @param {function} listener
   */
  removeChangeListener(listener) {
    const index = this.changeListeners.indexOf(listener)
    if (index >= 0) {
      this.changeListeners.splice(index, 1)
    }
  }

  /**
   * Notifies all registered change listeners.
   */
  updateChangeListeners() {
    this.changeListeners.forEach(listener => {
      listener()
    })
  }
}

let layoutRunning = false

/**
 * Calculates a preview layout. This method is called when node placer settings are changed.
 * @param {ITreeLayoutNodePlacer} nodePlacer
 * @param {GraphComponent} graphComponent
 */
function runPreviewLayout(nodePlacer, graphComponent) {
  if (layoutRunning) {
    return
  }
  layoutRunning = true
  const treeLayout = new TreeLayout()
  const leafNodePlacer = new LeafNodePlacer()
  const treeLayoutData = new TreeLayoutData({
    nodePlacers: node => {
      if (graphComponent.graph.inDegree(node) === 0) {
        return nodePlacer
      }
      return leafNodePlacer
    },
    assistantNodes: node => node.tag && node.tag.assistant
  })

  graphComponent.morphLayout(treeLayout, '0.2s', treeLayoutData).then(() => {
    layoutRunning = false
  })
}

/**
 * Wires up the UI elements that are not node placer specific.
 * @param {NodePlacerPanel} panel
 */
function bindActions(panel) {
  const layerIndex = document.getElementById('layer-index')
  layerIndex.addEventListener('input', () => {
    layerIndex.value = Math.max(layerIndex.min, Math.min(layerIndex.value, layerIndex.max))
    panel.onLayerChanged(layerIndex.value)
  })

  const selectNodePlacer = document.getElementById('select-node-placer')
  selectNodePlacer.addEventListener('change', () => {
    panel.currentNodePlacerConfiguration.visible = false
    panel.currentNodePlacerConfiguration = panel.nodePlacerConfigurations.get(
      selectNodePlacer.value
    )
    panel.currentNodePlacerConfiguration.visible = true
    panel.currentNodePlacerConfiguration.adoptSettings(
      panel.currentNodePlacerConfiguration.getDefaultNodePlacer()
    )

    const rotationElement = document.getElementById('rotation')
    const spacingElement = document.getElementById('rotatable-spacing')
    if (panel.currentNodePlacerConfiguration.rotatable) {
      rotationElement.style.display = 'block'
      spacingElement.style.display = 'block'
    } else {
      rotationElement.style.display = 'none'
      spacingElement.style.display = 'none'
    }
    panel.panelChanged()
  })

  const resetNodePlacer = document.getElementById('reset-node-placer')
  resetNodePlacer.addEventListener('click', () => {
    panel.currentNodePlacerConfiguration.visible = false
    panel.currentNodePlacerConfiguration = panel.nodePlacerConfigurations.get('DefaultNodePlacer')
    panel.currentNodePlacerConfiguration.visible = true
    panel.currentNodePlacerConfiguration.adoptSettings(new DefaultNodePlacer())

    const rotationElement = document.getElementById('rotation')
    const spacingElement = document.getElementById('rotatable-spacing')
    rotationElement.style.display = 'none'
    spacingElement.style.display = 'none'

    selectNodePlacer.selectedIndex = 0
    panel.panelChanged()
  })

  const rotationLeft = document.getElementById('rotation-left')
  rotationLeft.addEventListener('click', () => {
    const configuration = panel.currentNodePlacerConfiguration
    configuration.modificationMatrix = configuration.modificationMatrix.multiply(
      RotatableNodePlacerMatrix.ROT90
    )
    panel.panelChanged()
  })

  const rotationRight = document.getElementById('rotation-right')
  rotationRight.addEventListener('click', () => {
    const configuration = panel.currentNodePlacerConfiguration
    configuration.modificationMatrix = configuration.modificationMatrix.multiply(
      RotatableNodePlacerMatrix.ROT270
    )
    panel.panelChanged()
  })

  const mirrorHorizontal = document.getElementById('mirror-horizontal')
  mirrorHorizontal.addEventListener('click', () => {
    const configuration = panel.currentNodePlacerConfiguration
    configuration.modificationMatrix = configuration.modificationMatrix.multiply(
      RotatableNodePlacerMatrix.MIR_HOR
    )
    panel.panelChanged()
  })

  const mirrorVertical = document.getElementById('mirror-vertical')
  mirrorVertical.addEventListener('click', () => {
    const configuration = panel.currentNodePlacerConfiguration
    configuration.modificationMatrix = configuration.modificationMatrix.multiply(
      RotatableNodePlacerMatrix.MIR_VERT
    )
    panel.panelChanged()
  })
}

/**
 * Returns the configuration name to retrieve the correct configuration for the given node placer.
 * @param {ITreeLayoutNodePlacer} nodePlacer
 * @return {string|null}
 */
function getConfigurationName(nodePlacer) {
  if (nodePlacer instanceof DefaultNodePlacer) {
    return 'DefaultNodePlacer'
  } else if (nodePlacer instanceof SimpleNodePlacer) {
    return 'SimpleNodePlacer'
  } else if (nodePlacer instanceof BusNodePlacer) {
    return 'BusNodePlacer'
  } else if (nodePlacer instanceof DoubleLineNodePlacer) {
    return 'DoubleLineNodePlacer'
  } else if (nodePlacer instanceof GridNodePlacer) {
    return 'GridNodePlacer'
  } else if (nodePlacer instanceof LeftRightNodePlacer) {
    return 'LeftRightNodePlacer'
  } else if (nodePlacer instanceof AspectRatioNodePlacer) {
    return 'AspectRatioNodePlacer'
  } else if (nodePlacer instanceof AssistantNodePlacer) {
    return 'AssistantNodePlacer'
  } else if (CompactNodePlacer.isInstance(nodePlacer)) {
    return 'CompactNodePlacer'
  }
  return null
}

/**
 * Creates a small preview graph that demonstrates the node placer settings on a small sample.
 * @param {GraphComponent} graphComponent
 */
function createPreviewGraph(graphComponent) {
  const graph = graphComponent.graph
  const root = graph.createNode({
    layout: new Rect(0, 0, 60, 30),
    style: new ShapeNodeStyle({
      shape: ShapeNodeShape.ROUND_RECTANGLE,
      fill: 'crimson',
      stroke: 'white'
    })
  })

  for (let i = 0; i < 5; i++) {
    if (i > 0) {
      graph.createEdge(
        root,
        graph.createNode({
          layout: new Rect(0, 0, i < 4 ? 60 : 80, 30),
          style: new ShapeNodeStyle({
            shape: ShapeNodeShape.ROUND_RECTANGLE,
            fill: 'gray',
            stroke: 'white'
          })
        })
      )
    } else {
      graph.createEdge(
        root,
        graph.createNode({
          layout: new Rect(0, 0, 60, 30),
          style: new ShapeNodeStyle({
            shape: ShapeNodeShape.ROUND_RECTANGLE,
            fill: 'gray',
            stroke: '2px dashed black'
          }),
          tag: { assistant: true }
        })
      )
    }
  }
}

/**
 * Base class for a node placer configuration. It provides methods to retrieve a configured
 * {@link ITreeLayoutNodePlacer} and manages the user input.
 */
class NodePlacerConfiguration {
  /**
   * Creates a new instance of NodePlacerConfiguration.
   * @param {HTMLElement} div
   * @param {ITreeLayoutNodePlacer} nodePlacer
   * @param {Element} panel
   */
  constructor(div, nodePlacer, panel) {
    this.$div = div
    this.$visible = false
    this.adoptSettings(nodePlacer)
    this.bindActions(panel)
    this.updatePanel()
  }

  /**
   * Returns whether or not the represented node placer is rotatable. This is used to determine if the
   * rotation/mirroring-buttons should be visible.
   * @return {boolean}
   */
  get rotatable() {
    return false
  }

  /**
   * Returns whether or not these node placer settings are currently active/visible.
   * @return {boolean}
   */
  get visible() {
    return this.$visible
  }

  /**
   * Sets whether or not these node placer settings should be active/visible.
   * It also updates the description text.
   * @param {boolean} visible
   */
  set visible(visible) {
    this.$visible = visible

    const description = document.getElementById('node-placer-description')
    if (visible) {
      this.$div.style.display = 'block'
      description.innerHTML = this.getDescriptionText()
    } else {
      this.$div.style.display = 'none'
      description.innerHTML = ''
    }
  }

  /**
   * Creates a configured {@link INodePlacer} according to the current settings.
   * This method is called when the map of node placers is updated.
   */
  createNodePlacer() {}

  /**
   * Updates the configuration settings according to the given {@link INodePlacer}.
   * This method is call when the configuration is changed or reset.
   * @param {ITreeLayoutNodePlacer} nodePlacer
   */
  adoptSettings(nodePlacer) {}

  /**
   * Updates the UI after the configuration changed.
   * @see {@link NodePlacerConfiguration#adoptSettings}
   */
  updatePanel() {}

  /**
   * Wires up the UI for this configuration.
   * @param {NodePlacerPanel} panel
   */
  bindActions(panel) {}

  /**
   * Returns the description text for this configuration.
   * @return {string}
   */
  getDescriptionText() {}

  /**
   * Returns the node placer for this configuration with initial settings.
   * @return {ITreeLayoutNodePlacer}
   */
  getDefaultNodePlacer() {}
}

/**
 * Base class for all node placer configurations representing node placers inheriting
 * {@link RotatableNodePlacerBase}.
 * It will handle the rotation and spacing properties by default.
 */
class RotatableNodePlacerConfiguration extends NodePlacerConfiguration {
  /**
   * Returns true for all configurations based on this class.
   * @return {boolean}
   */
  get rotatable() {
    return true
  }

  /** @type {RotatableNodePlacerBase} */
  get modificationMatrix() {
    return this.$modificationMatrix
  }

  /** @type {RotatableNodePlacerBase} */
  set modificationMatrix(value) {
    this.$modificationMatrix = value
  }

  /** @type {number} */
  get spacing() {
    return this.$spacing
  }

  /** @type {number} */
  set spacing(value) {
    this.$spacing = value
  }

  adoptSettings(nodePlacer) {
    this.spacing = nodePlacer.spacing
    this.modificationMatrix = nodePlacer.modificationMatrix || RotatableNodePlacerMatrix.DEFAULT
  }

  updatePanel() {
    const spacing = document.getElementById('spacing')
    spacing.value = this.spacing
    const spacingLabel = document.getElementById('spacing-label')
    spacingLabel.innerHTML = this.spacing
  }

  bindActions(panel) {
    const spacing = document.getElementById('spacing')
    spacing.addEventListener('change', () => {
      this.spacing = Number.parseInt(spacing.value)
      panel.panelChanged()
    })
    const spacingLabel = document.getElementById('spacing-label')
    spacing.addEventListener('input', () => {
      spacingLabel.innerHTML = spacing.value
    })
  }
}

class DefaultNodePlacerConfiguration extends NodePlacerConfiguration {
  /**
   * Creates a new instance of DefaultNodePlacerConfiguration.
   * @param {Element} panel
   */
  constructor(panel) {
    super(document.getElementById('default-node-placer-settings'), new DefaultNodePlacer(), panel)
  }

  /** @type {ChildPlacement} */
  get childPlacement() {
    return this.$childPlacement
  }

  /** @type {ChildPlacement} */
  set childPlacement(value) {
    this.$childPlacement = value
  }

  /** @type {TreeLayoutEdgeRoutingStyle} */
  get routingStyle() {
    return this.$routingStyle
  }

  /** @type {TreeLayoutEdgeRoutingStyle} */
  set routingStyle(value) {
    this.$routingStyle = value
  }

  /** @type {number} */
  get horizontalDistance() {
    return this.$horizontalDistance
  }

  /** @type {number} */
  set horizontalDistance(value) {
    this.$horizontalDistance = value
  }

  /** @type {number} */
  get verticalDistance() {
    return this.$verticalDistance
  }

  /** @type {number} */
  set verticalDistance(value) {
    this.$verticalDistance = value
  }

  /** @type {number} */
  get minimumChannelSegmentDistance() {
    return this.$minimumChannelSegmentDistance
  }

  /** @type {number} */
  set minimumChannelSegmentDistance(value) {
    this.$minimumChannelSegmentDistance = value
  }

  /** @type {RootAlignment} */
  get rootAlignment() {
    return this.$rootAlignment
  }

  /** @type {RootAlignment} */
  set rootAlignment(value) {
    this.$rootAlignment = value
  }

  createNodePlacer() {
    const nodePlacer = new DefaultNodePlacer()
    nodePlacer.childPlacement = this.childPlacement
    nodePlacer.routingStyle = this.routingStyle
    nodePlacer.horizontalDistance = this.horizontalDistance
    nodePlacer.verticalDistance = this.verticalDistance
    nodePlacer.minimumChannelSegmentDistance = this.minimumChannelSegmentDistance
    nodePlacer.rootAlignment = this.rootAlignment
    return nodePlacer
  }

  adoptSettings(nodePlacer) {
    this.childPlacement = nodePlacer.childPlacement
    this.routingStyle = nodePlacer.routingStyle
    this.horizontalDistance = nodePlacer.horizontalDistance
    this.verticalDistance = nodePlacer.verticalDistance
    this.minimumChannelSegmentDistance = nodePlacer.minimumChannelSegmentDistance
    this.rootAlignment = nodePlacer.rootAlignment
    this.updatePanel()
  }

  updatePanel() {
    const childPlacement = document.getElementById('select-child-placement')
    switch (this.childPlacement) {
      default:
      case ChildPlacement.HORIZONTAL_DOWNWARD:
        childPlacement.selectedIndex = 0
        break
      case ChildPlacement.HORIZONTAL_UPWARD:
        childPlacement.selectedIndex = 1
        break
      case ChildPlacement.VERTICAL_TO_LEFT:
        childPlacement.selectedIndex = 2
        break
      case ChildPlacement.VERTICAL_TO_RIGHT:
        childPlacement.selectedIndex = 3
        break
    }

    const routingStyle = document.getElementById('routing-style')
    switch (this.routingStyle) {
      default:
      case TreeLayoutEdgeRoutingStyle.FORK:
        routingStyle.selectedIndex = 0
        break
      case TreeLayoutEdgeRoutingStyle.FORK_AT_ROOT:
        routingStyle.selectedIndex = 1
        break
      case TreeLayoutEdgeRoutingStyle.STRAIGHT:
        routingStyle.selectedIndex = 2
        break
      case TreeLayoutEdgeRoutingStyle.POLYLINE:
        routingStyle.selectedIndex = 3
        break
    }

    const horizontalDistance = document.getElementById('horizontal-distance')
    horizontalDistance.value = this.horizontalDistance
    const horizontalDistanceLabel = document.getElementById('horizontal-distance-label')
    horizontalDistanceLabel.innerHTML = this.horizontalDistance

    const verticalDistance = document.getElementById('vertical-distance')
    verticalDistance.value = this.verticalDistance
    const verticalDistanceLabel = document.getElementById('vertical-distance-label')
    verticalDistanceLabel.innerHTML = this.verticalDistance

    const minimumChannelSegmentDistance = document.getElementById(
      'minimum-channel-segment-distance'
    )
    minimumChannelSegmentDistance.value = this.minimumChannelSegmentDistance
    const minimumChannelSegmentDistanceLabel = document.getElementById(
      'minimum-channel-segment-distance-label'
    )
    minimumChannelSegmentDistanceLabel.innerHTML = this.minimumChannelSegmentDistance

    const rootAlignment = document.getElementById('root-alignment')
    switch (this.rootAlignment) {
      default:
      case RootAlignment.LEADING_OFFSET:
        rootAlignment.selectedIndex = 0
        break
      case RootAlignment.LEADING:
        rootAlignment.selectedIndex = 1
        break
      case RootAlignment.CENTER:
        rootAlignment.selectedIndex = 2
        break
      case RootAlignment.MEDIAN:
        rootAlignment.selectedIndex = 3
        break
      case RootAlignment.TRAILING:
        rootAlignment.selectedIndex = 4
        break
      case RootAlignment.TRAILING_OFFSET:
        rootAlignment.selectedIndex = 5
        break
      case RootAlignment.LEADING_ON_BUS:
        rootAlignment.selectedIndex = 6
        break
      case RootAlignment.TRAILING_ON_BUS:
        rootAlignment.selectedIndex = 7
        break
    }
  }

  getDescriptionText() {
    return (
      '<h2>DefaultNodePlacer</h2>' +
      'This node placer arranges the child nodes horizontally aligned below their root node. It offers options' +
      ' to change the orientation of the subtree, the edge routing style, and the alignment of the root node.'
    )
  }

  bindActions(panel) {
    const childPlacement = document.getElementById('select-child-placement')
    childPlacement.addEventListener('change', () => {
      switch (childPlacement.selectedIndex) {
        default:
        case 0:
          this.childPlacement = ChildPlacement.HORIZONTAL_DOWNWARD
          break
        case 1:
          this.childPlacement = ChildPlacement.HORIZONTAL_UPWARD
          break
        case 2:
          this.childPlacement = ChildPlacement.VERTICAL_TO_LEFT
          break
        case 3:
          this.childPlacement = ChildPlacement.VERTICAL_TO_RIGHT
          break
      }
      panel.panelChanged()
    })

    const routingStyle = document.getElementById('routing-style')
    routingStyle.addEventListener('change', () => {
      switch (routingStyle.selectedIndex) {
        default:
        case 0:
          this.routingStyle = TreeLayoutEdgeRoutingStyle.FORK
          break
        case 1:
          this.routingStyle = TreeLayoutEdgeRoutingStyle.FORK_AT_ROOT
          break
        case 2:
          this.routingStyle = TreeLayoutEdgeRoutingStyle.STRAIGHT
          break
        case 3:
          this.routingStyle = TreeLayoutEdgeRoutingStyle.POLYLINE
          break
      }
      panel.panelChanged()
    })

    const horizontalDistance = document.getElementById('horizontal-distance')
    horizontalDistance.addEventListener('change', () => {
      this.horizontalDistance = Number.parseInt(horizontalDistance.value)
      panel.panelChanged()
    })
    const horizontalDistanceLabel = document.getElementById('horizontal-distance-label')
    horizontalDistance.addEventListener('input', () => {
      horizontalDistanceLabel.innerHTML = horizontalDistance.value
    })

    const verticalDistance = document.getElementById('vertical-distance')
    verticalDistance.addEventListener('change', () => {
      this.verticalDistance = Number.parseInt(verticalDistance.value)
      panel.panelChanged()
    })
    const verticalDistanceLabel = document.getElementById('vertical-distance-label')
    verticalDistance.addEventListener('input', () => {
      verticalDistanceLabel.innerHTML = verticalDistance.value
    })

    const minimumChannelSegmentDistance = document.getElementById(
      'minimum-channel-segment-distance'
    )
    minimumChannelSegmentDistance.addEventListener('change', () => {
      this.minimumChannelSegmentDistance = Number.parseInt(minimumChannelSegmentDistance.value)
      panel.panelChanged()
    })
    const minimumChannelSegmentDistanceLabel = document.getElementById(
      'minimum-channel-segment-distance-label'
    )
    minimumChannelSegmentDistance.addEventListener('input', () => {
      minimumChannelSegmentDistanceLabel.innerHTML = minimumChannelSegmentDistance.value
    })

    const rootAlignment = document.getElementById('root-alignment')
    rootAlignment.addEventListener('change', () => {
      switch (rootAlignment.selectedIndex) {
        default:
        case 0:
          this.rootAlignment = RootAlignment.LEADING_OFFSET
          break
        case 1:
          this.rootAlignment = RootAlignment.LEADING
          break
        case 2:
          this.rootAlignment = RootAlignment.CENTER
          break
        case 3:
          this.rootAlignment = RootAlignment.MEDIAN
          break
        case 4:
          this.rootAlignment = RootAlignment.TRAILING
          break
        case 5:
          this.rootAlignment = RootAlignment.TRAILING_OFFSET
          break
        case 6:
          this.rootAlignment = RootAlignment.LEADING_ON_BUS
          break
        case 7:
          this.rootAlignment = RootAlignment.TRAILING_ON_BUS
          break
      }
      panel.panelChanged()
    })
  }

  getDefaultNodePlacer() {
    return new DefaultNodePlacer()
  }
}

class SimpleNodePlacerConfiguration extends RotatableNodePlacerConfiguration {
  /**
   * Creates a new instance of SimpleNodePlacerConfiguration.
   * @param {Element} panel
   */
  constructor(panel) {
    super(document.getElementById('simple-node-placer-settings'), new SimpleNodePlacer(), panel)
  }

  /** @type {boolean} */
  get createBus() {
    return this.$createBus
  }

  /** @type {boolean} */
  set createBus(value) {
    this.$createBus = value
  }

  /** @type {RootNodeAlignment} */
  get rootAlignment() {
    return this.$rootAlignment
  }

  /** @type {RootNodeAlignment} */
  set rootAlignment(value) {
    this.$rootAlignment = value
  }

  /** @type {number} */
  get minimumChannelSegmentDistance() {
    return this.$minimumChannelSegmentDistance
  }

  /** @type {number} */
  set minimumChannelSegmentDistance(value) {
    this.$minimumChannelSegmentDistance = value
  }

  createNodePlacer() {
    const nodePlacer = new SimpleNodePlacer(this.modificationMatrix)
    nodePlacer.createBus = this.createBus
    nodePlacer.rootAlignment = this.rootAlignment
    nodePlacer.minimumChannelSegmentDistance = this.minimumChannelSegmentDistance
    nodePlacer.spacing = this.spacing
    return nodePlacer
  }

  adoptSettings(nodePlacer) {
    super.adoptSettings(nodePlacer)
    this.createBus = nodePlacer.createBus
    this.rootAlignment = nodePlacer.rootAlignment
    this.minimumChannelSegmentDistance = nodePlacer.minimumChannelSegmentDistance
    this.updatePanel()
  }

  updatePanel() {
    super.updatePanel()

    const createBus = document.getElementById('create-bus')
    createBus.checked = this.createBus

    const rootAlignment = document.getElementById('simple-root-node-alignment')
    switch (this.rootAlignment) {
      default:
      case RootNodeAlignment.LEADING:
        rootAlignment.selectedIndex = 0
        break
      case RootNodeAlignment.LEFT:
        rootAlignment.selectedIndex = 1
        break
      case RootNodeAlignment.CENTER:
        rootAlignment.selectedIndex = 2
        break
      case RootNodeAlignment.CENTER_OVER_CHILDREN:
        rootAlignment.selectedIndex = 3
        break
      case RootNodeAlignment.MEDIAN:
        rootAlignment.selectedIndex = 4
        break
      case RootNodeAlignment.RIGHT:
        rootAlignment.selectedIndex = 5
        break
      case RootNodeAlignment.TRAILING:
        rootAlignment.selectedIndex = 6
        break
    }

    const minimumChannelSegmentDistance = document.getElementById('min-channel-segment-distance')
    minimumChannelSegmentDistance.value = this.minimumChannelSegmentDistance
  }

  getDescriptionText() {
    return (
      '<h2>SimpleNodePlacer</h2>' +
      'This node placer arranges the child nodes horizontally aligned below their root node. It supports rotated' +
      'subtrees and offers options to change the alignment of the root node.'
    )
  }

  bindActions(panel) {
    super.bindActions(panel)

    const createBus = document.getElementById('create-bus')
    createBus.addEventListener('change', () => {
      this.createBus = createBus.checked
      panel.panelChanged()
    })

    const rootAlignment = document.getElementById('simple-root-node-alignment')
    rootAlignment.addEventListener('change', () => {
      switch (rootAlignment.selectedIndex) {
        default:
        case 0:
          this.rootAlignment = RootNodeAlignment.LEADING
          break
        case 1:
          this.rootAlignment = RootNodeAlignment.LEFT
          break
        case 2:
          this.rootAlignment = RootNodeAlignment.CENTER
          break
        case 3:
          this.rootAlignment = RootNodeAlignment.CENTER_OVER_CHILDREN
          break
        case 4:
          this.rootAlignment = RootNodeAlignment.MEDIAN
          break
        case 5:
          this.rootAlignment = RootNodeAlignment.RIGHT
          break
        case 6:
          this.rootAlignment = RootNodeAlignment.TRAILING
          break
      }
      panel.panelChanged()
    })

    const minimumChannelSegmentDistance = document.getElementById('min-channel-segment-distance')
    minimumChannelSegmentDistance.addEventListener('change', () => {
      this.minimumChannelSegmentDistance = Number.parseInt(minimumChannelSegmentDistance.value)
      panel.panelChanged()
    })
    const minimumChannelSegmentDistanceLabel = document.getElementById(
      'min-channel-segment-distance-label'
    )
    minimumChannelSegmentDistance.addEventListener('input', () => {
      minimumChannelSegmentDistanceLabel.innerHTML = minimumChannelSegmentDistance.value
    })
  }

  getDefaultNodePlacer() {
    return new SimpleNodePlacer()
  }
}

class BusNodePlacerConfiguration extends RotatableNodePlacerConfiguration {
  /**
   * Creates a new instance of BusNodePlacerConfiguration.
   * @param {Element} panel
   */
  constructor(panel) {
    super(document.getElementById('bus-node-placer-settings'), new BusNodePlacer(), panel)
  }

  createNodePlacer() {
    const nodePlacer = new BusNodePlacer(this.modificationMatrix)
    nodePlacer.spacing = this.spacing
    return nodePlacer
  }

  adoptSettings(nodePlacer) {
    super.adoptSettings(nodePlacer)
    this.updatePanel()
  }

  getDescriptionText() {
    return (
      '<h2>BusNodePlacer</h2>' +
      'This node placer arranges the child nodes evenly distributed in two lines to the left and right of the root node.'
    )
  }

  getDefaultNodePlacer() {
    return new BusNodePlacer()
  }
}

class GridNodePlacerConfiguration extends RotatableNodePlacerConfiguration {
  /**
   * Creates a new instance of GridNodePlacerConfiguration.
   * @param {Element} panel
   */
  constructor(panel) {
    super(document.getElementById('grid-node-placer-settings'), new GridNodePlacer(), panel)
  }

  /** @type {RootNodeAlignment} */
  get rootAlignment() {
    return this.$rootAlignment
  }

  /** @type {RootNodeAlignment} */
  set rootAlignment(value) {
    this.$rootAlignment = value
  }

  /** @type {BusPlacement} */
  get busPlacement() {
    return this.$busPlacement
  }

  /** @type {BusPlacement} */
  set busPlacement(value) {
    this.$busPlacement = value
  }

  createNodePlacer() {
    const nodePlacer = new GridNodePlacer(this.modificationMatrix)
    nodePlacer.spacing = this.spacing
    nodePlacer.rootAlignment = this.rootAlignment
    nodePlacer.busPlacement = this.busPlacement
    nodePlacer.automaticRowAssignment = true
    return nodePlacer
  }

  adoptSettings(nodePlacer) {
    super.adoptSettings(nodePlacer)
    this.rootAlignment = nodePlacer.rootAlignment
    this.busPlacement = nodePlacer.busPlacement
    this.updatePanel()
  }

  getDescriptionText() {
    return (
      '<h2>GridNodePlacer</h2>' +
      'This node placer arranges the shapes of the children of a local root in a grid. It supports rotated' +
      ' subtrees and offers options to change the alignment of the root node .'
    )
  }

  updatePanel() {
    super.updatePanel()

    const rootAlignment = document.getElementById('grid-node-placer-alignment')
    switch (this.rootAlignment) {
      default:
      case RootNodeAlignment.LEADING:
        rootAlignment.selectedIndex = 0
        break
      case RootNodeAlignment.LEFT:
        rootAlignment.selectedIndex = 1
        break
      case RootNodeAlignment.CENTER:
        rootAlignment.selectedIndex = 2
        break
      case RootNodeAlignment.CENTER_OVER_CHILDREN:
        rootAlignment.selectedIndex = 3
        break
      case RootNodeAlignment.RIGHT:
        rootAlignment.selectedIndex = 4
        break
      case RootNodeAlignment.TRAILING:
        rootAlignment.selectedIndex = 5
        break
      case GridNodePlacer.BUS_ALIGNED:
        rootAlignment.selectedIndex = 6
        break
    }

    const busPlacement = document.getElementById('grid-node-placer-bus-placement')
    switch (this.busPlacement) {
      default:
      case BusPlacement.CENTER:
        busPlacement.selectedIndex = 0
        break
      case BusPlacement.LEADING:
        busPlacement.selectedIndex = 1
        break
      case BusPlacement.TRAILING:
        busPlacement.selectedIndex = 2
        break
    }
  }

  bindActions(panel) {
    super.bindActions(panel)
    const rootAlignment = document.getElementById('grid-node-placer-alignment')
    rootAlignment.addEventListener('change', () => {
      switch (rootAlignment.selectedIndex) {
        default:
        case 0:
          this.rootAlignment = RootNodeAlignment.LEADING
          break
        case 1:
          this.rootAlignment = RootNodeAlignment.LEFT
          break
        case 2:
          this.rootAlignment = RootNodeAlignment.CENTER
          break
        case 3:
          this.rootAlignment = RootNodeAlignment.CENTER_OVER_CHILDREN
          break
        case 4:
          this.rootAlignment = RootNodeAlignment.RIGHT
          break
        case 5:
          this.rootAlignment = RootNodeAlignment.TRAILING
          break
        case 6:
          this.rootAlignment = GridNodePlacer.BUS_ALIGNED
          break
      }
      panel.panelChanged()
    })

    const busPlacement = document.getElementById('grid-node-placer-bus-placement')
    busPlacement.addEventListener('change', () => {
      switch (busPlacement.selectedIndex) {
        default:
        case 0:
          this.busPlacement = BusPlacement.CENTER
          break
        case 1:
          this.busPlacement = BusPlacement.LEADING
          break
        case 2:
          this.busPlacement = BusPlacement.TRAILING
          break
      }
      panel.panelChanged()
    })
  }

  getDefaultNodePlacer() {
    return new GridNodePlacer()
  }
}

class DoubleLineNodePlacerConfiguration extends RotatableNodePlacerConfiguration {
  /**
   * Creates a new instance of DoubleLineNodePlacerConfiguration.
   * @param {Element} panel
   */
  constructor(panel) {
    super(
      document.getElementById('double-line-node-placer-settings'),
      new DoubleLineNodePlacer(),
      panel
    )
  }

  /** @type {RootNodeAlignment} */
  get rootAlignment() {
    return this.$rootAlignment
  }

  /** @type {RootNodeAlignment} */
  set rootAlignment(value) {
    this.$rootAlignment = value
  }

  createNodePlacer() {
    const nodePlacer = new DoubleLineNodePlacer(this.modificationMatrix)
    nodePlacer.spacing = this.spacing
    nodePlacer.rootAlignment = this.rootAlignment
    return nodePlacer
  }

  adoptSettings(nodePlacer) {
    super.adoptSettings(nodePlacer)
    this.rootAlignment = nodePlacer.rootAlignment
    this.updatePanel()
  }

  getDescriptionText() {
    return (
      '<h2>DoubleLineNodePlacer</h2>' +
      'This node placer arranges the child nodes staggered in two lines below their root node. It supports rotated' +
      ' subtrees and offers options to change the alignment of the root node.'
    )
  }

  updatePanel() {
    super.updatePanel()

    const rootAlignment = document.getElementById('double-line-root-node-alignment')
    switch (this.rootAlignment) {
      default:
      case RootNodeAlignment.LEADING:
        rootAlignment.selectedIndex = 0
        break
      case RootNodeAlignment.LEFT:
        rootAlignment.selectedIndex = 1
        break
      case RootNodeAlignment.CENTER:
        rootAlignment.selectedIndex = 2
        break
      case RootNodeAlignment.CENTER_OVER_CHILDREN:
        rootAlignment.selectedIndex = 3
        break
      case RootNodeAlignment.MEDIAN:
        rootAlignment.selectedIndex = 4
        break
      case RootNodeAlignment.RIGHT:
        rootAlignment.selectedIndex = 5
        break
      case RootNodeAlignment.TRAILING:
        rootAlignment.selectedIndex = 6
        break
    }
  }

  bindActions(panel) {
    super.bindActions(panel)
    const rootAlignment = document.getElementById('double-line-root-node-alignment')
    rootAlignment.addEventListener('change', () => {
      switch (rootAlignment.selectedIndex) {
        default:
        case 0:
          this.rootAlignment = RootNodeAlignment.LEADING
          break
        case 1:
          this.rootAlignment = RootNodeAlignment.LEFT
          break
        case 2:
          this.rootAlignment = RootNodeAlignment.CENTER
          break
        case 3:
          this.rootAlignment = RootNodeAlignment.CENTER_OVER_CHILDREN
          break
        case 4:
          this.rootAlignment = RootNodeAlignment.MEDIAN
          break
        case 5:
          this.rootAlignment = RootNodeAlignment.RIGHT
          break
        case 6:
          this.rootAlignment = RootNodeAlignment.TRAILING
          break
      }
      panel.panelChanged()
    })
  }

  getDefaultNodePlacer() {
    return new DoubleLineNodePlacer()
  }
}

class LeftRightNodePlacerConfiguration extends RotatableNodePlacerConfiguration {
  /**
   * Creates a new instance of LeftRightNodePlacerConfiguration.
   * @param {Element} panel
   */
  constructor(panel) {
    super(
      document.getElementById('left-right-node-placer-settings'),
      new LeftRightNodePlacer(),
      panel
    )
  }

  /** @type {boolean} */
  get lastOnBottom() {
    return this.$lastOnBottom
  }

  /** @type {boolean} */
  set lastOnBottom(value) {
    this.$lastOnBottom = value
  }

  /** @type {Number} */
  get branchCount() {
    return this.$branchCount
  }

  /** @type {Number} */
  set branchCount(value) {
    this.$branchCount = value
  }

  createNodePlacer() {
    const nodePlacer = new LeftRightNodePlacer(this.modificationMatrix)
    nodePlacer.spacing = this.spacing
    nodePlacer.placeLastOnBottom = this.lastOnBottom
    nodePlacer.branchCount = this.branchCount
    return nodePlacer
  }

  adoptSettings(nodePlacer) {
    super.adoptSettings(nodePlacer)
    this.lastOnBottom = nodePlacer.placeLastOnBottom
    this.branchCount = nodePlacer.branchCount
    this.updatePanel()
  }

  getDescriptionText() {
    return (
      '<h2>LeftRightNodePlacer</h2>' +
      'This node placer arranges the child nodes below their root node, left and right of the downward extending bus-like routing.'
    )
  }

  updatePanel() {
    const lastOnBottom = document.getElementById('last-on-bottom')
    lastOnBottom.checked = this.lastOnBottom
    const branchCount = document.getElementById('branch-count')
    branchCount.value = this.branchCount
    const branchCountLabel = document.getElementById('branch-count-label')
    branchCountLabel.innerHTML = this.branchCount.toString()
  }

  bindActions(panel) {
    super.bindActions(panel)
    const lastOnBottom = document.getElementById('last-on-bottom')
    lastOnBottom.addEventListener('change', () => {
      this.lastOnBottom = lastOnBottom.checked
      panel.panelChanged()
    })

    const branchCount = document.getElementById('branch-count')
    branchCount.addEventListener('change', () => {
      this.branchCount = Number.parseInt(branchCount.value)
      panel.panelChanged()
    })

    const branchCountLabel = document.getElementById('branch-count-label')
    branchCount.addEventListener('input', () => {
      branchCountLabel.innerHTML = branchCount.value
    })
  }

  getDefaultNodePlacer() {
    return new LeftRightNodePlacer()
  }
}

class AspectRatioNodePlacerConfiguration extends NodePlacerConfiguration {
  /**
   * Creates a new instance of AspectRatioNodePlacerConfiguration.
   * @param {Element} panel
   */
  constructor(panel) {
    super(
      document.getElementById('aspect-ratio-node-placer-settings'),
      new AspectRatioNodePlacer(),
      panel
    )
  }

  /** @type {number} */
  get aspectRatio() {
    return this.$aspectRatio
  }

  /** @type {number} */
  set aspectRatio(value) {
    this.$aspectRatio = value
  }

  /** @type {FillStyle} */
  get fillStyle() {
    return this.$fillStyle
  }

  /** @type {FillStyle} */
  set fillStyle(value) {
    this.$fillStyle = value
  }

  /** @type {boolean} */
  get horizontal() {
    return this.$horizontal
  }

  /** @type {boolean} */
  set horizontal(value) {
    this.$horizontal = value
  }

  /** @type {number} */
  get horizontalDistance() {
    return this.$horizontalDistance
  }

  /** @type {number} */
  set horizontalDistance(value) {
    this.$horizontalDistance = value
  }

  /** @type {number} */
  get verticalDistance() {
    return this.$verticalDistance
  }

  /** @type {number} */
  set verticalDistance(value) {
    this.$verticalDistance = value
  }

  createNodePlacer() {
    const nodePlacer = new AspectRatioNodePlacer()
    nodePlacer.aspectRatio = this.aspectRatio
    nodePlacer.fillStyle = this.fillStyle
    nodePlacer.horizontalDistance = this.horizontalDistance
    nodePlacer.verticalDistance = this.verticalDistance
    nodePlacer.horizontal = this.horizontal
    return nodePlacer
  }

  adoptSettings(nodePlacer) {
    this.aspectRatio = nodePlacer.aspectRatio
    this.fillStyle = nodePlacer.fillStyle
    this.horizontalDistance = nodePlacer.horizontalDistance
    this.verticalDistance = nodePlacer.verticalDistance
    this.horizontal = nodePlacer.horizontal
    this.updatePanel()
  }

  getDescriptionText() {
    return (
      '<h2>AspectRatioNodePlacer</h2>' +
      'This node placer arranges the child nodes such that a given aspect ratio is obeyed.'
    )
  }

  updatePanel() {
    const aspectRatio = document.getElementById('aspect-ratio')
    aspectRatio.value = this.aspectRatio

    const fillStyle = document.getElementById('fill-style')
    switch (this.fillStyle) {
      default:
      case FillStyle.JUSTIFY:
        fillStyle.selectedIndex = 0
        break
      case FillStyle.LEADING:
        fillStyle.selectedIndex = 1
        break
      case FillStyle.CENTERED:
        fillStyle.selectedIndex = 2
        break
      case FillStyle.TRAILING:
        fillStyle.selectedIndex = 3
        break
    }

    const horizontalDistance = document.getElementById('aspect-ratio-horizontal-distance')
    horizontalDistance.value = this.horizontalDistance
    const horizontalDistanceLabel = document.getElementById(
      'aspect-ratio-horizontal-distance-label'
    )
    horizontalDistanceLabel.innerHTML = this.horizontalDistance

    const verticalDistance = document.getElementById('aspect-ratio-vertical-distance')
    verticalDistance.value = this.verticalDistance
    const verticalDistanceLabel = document.getElementById('aspect-ratio-vertical-distance-label')
    verticalDistanceLabel.innerHTML = this.verticalDistance

    const horizontal = document.getElementById('horizontal')
    horizontal.checked = this.horizontal
  }

  bindActions(panel) {
    const aspectRatio = document.getElementById('aspect-ratio')
    aspectRatio.addEventListener('change', () => {
      this.aspectRatio = Math.max(0.1, Math.min(Number.parseFloat(aspectRatio.value), 2))
      aspectRatio.value = this.aspectRatio // in case the range is not met
      panel.panelChanged()
    })

    const fillStyle = document.getElementById('fill-style')
    fillStyle.addEventListener('change', () => {
      switch (fillStyle.selectedIndex) {
        default:
        case 0:
          this.fillStyle = FillStyle.JUSTIFY
          break
        case 1:
          this.fillStyle = FillStyle.LEADING
          break
        case 2:
          this.fillStyle = FillStyle.CENTERED
          break
        case 3:
          this.fillStyle = FillStyle.TRAILING
          break
      }
      panel.panelChanged()
    })

    const horizontalDistance = document.getElementById('aspect-ratio-horizontal-distance')
    horizontalDistance.addEventListener('change', () => {
      this.horizontalDistance = Number.parseInt(horizontalDistance.value)
      panel.panelChanged()
    })
    const horizontalDistanceLabel = document.getElementById(
      'aspect-ratio-horizontal-distance-label'
    )
    horizontalDistance.addEventListener('input', () => {
      horizontalDistanceLabel.innerHTML = horizontalDistance.value
    })

    const verticalDistance = document.getElementById('aspect-ratio-vertical-distance')
    verticalDistance.addEventListener('change', () => {
      this.verticalDistance = Number.parseInt(verticalDistance.value)
      panel.panelChanged()
    })
    const verticalDistanceLabel = document.getElementById('aspect-ratio-vertical-distance-label')
    verticalDistance.addEventListener('input', () => {
      verticalDistanceLabel.innerHTML = verticalDistance.value
    })

    const horizontal = document.getElementById('horizontal')
    horizontal.addEventListener('change', () => {
      this.horizontal = horizontal.checked
      panel.panelChanged()
    })
  }

  getDefaultNodePlacer() {
    return new AspectRatioNodePlacer()
  }
}

class AssistantNodePlacerConfiguration extends RotatableNodePlacerConfiguration {
  /**
   * Creates a new instance of AssistantNodePlacerConfiguration.
   * @param {Element} panel
   */
  constructor(panel) {
    super(
      document.getElementById('assistant-node-placer-settings'),
      new AssistantNodePlacer(),
      panel
    )
  }

  /** @type {ITreeLayoutNodePlacer} */
  get childNodePlacer() {
    return this.$childNodePlacer
  }

  /** @type {ITreeLayoutNodePlacer} */
  set childNodePlacer(value) {
    this.$childNodePlacer = value
  }

  createNodePlacer() {
    const nodePlacer = new AssistantNodePlacer(this.modificationMatrix)
    nodePlacer.spacing = this.spacing
    nodePlacer.childNodePlacer = this.childNodePlacer
    return nodePlacer
  }

  adoptSettings(nodePlacer) {
    super.adoptSettings(nodePlacer)
    this.childNodePlacer = nodePlacer.childNodePlacer
    this.updatePanel()
  }

  getDescriptionText() {
    return (
      '<h2>AssistantNodePlacer</h2>' +
      'This node placer delegates to two different node placers to arrange the child nodes: Nodes that are marked' +
      ' as <em>Assistants</em> are placed using the <a href="https://docs.yworks.com/yfileshtml/#/api/LeftRightNodePlacer" target="_blank">LeftRightNodePlacer</a>. The other children are arranged' +
      ' below the assistant nodes using the child node placer.'
    )
  }

  updatePanel() {
    super.updatePanel()
    const childNodePlacer = document.getElementById('child-node-placer')
    if (this.childNodePlacer instanceof DefaultNodePlacer) {
      childNodePlacer.selectedIndex = 0
    } else if (this.childNodePlacer instanceof SimpleNodePlacer) {
      childNodePlacer.selectedIndex = 1
    } else if (this.childNodePlacer instanceof BusNodePlacer) {
      childNodePlacer.selectedIndex = 2
    } else if (this.childNodePlacer instanceof DoubleLineNodePlacer) {
      childNodePlacer.selectedIndex = 3
    } else if (this.childNodePlacer instanceof LeftRightNodePlacer) {
      childNodePlacer.selectedIndex = 4
    } else if (this.childNodePlacer instanceof AspectRatioNodePlacer) {
      childNodePlacer.selectedIndex = 5
    }
  }

  bindActions(panel) {
    super.bindActions(panel)
    const childNodePlacer = document.getElementById('child-node-placer')
    childNodePlacer.addEventListener('change', () => {
      switch (childNodePlacer.selectedIndex) {
        default:
        case 0:
          this.childNodePlacer = new DefaultNodePlacer()
          break
        case 1:
          this.childNodePlacer = new SimpleNodePlacer()
          break
        case 2:
          this.childNodePlacer = new BusNodePlacer()
          break
        case 3:
          this.childNodePlacer = new DoubleLineNodePlacer()
          break
        case 4:
          this.childNodePlacer = new LeftRightNodePlacer()
          break
        case 5:
          this.childNodePlacer = new AspectRatioNodePlacer()
          break
      }
      panel.panelChanged()
    })
  }

  getDefaultNodePlacer() {
    return new AssistantNodePlacer()
  }
}

class CompactNodePlacerConfiguration extends NodePlacerConfiguration {
  /**
   * Creates a new instance of AspectRatioNodePlacerConfiguration.
   * @param {Element} panel
   */
  constructor(panel) {
    super(document.getElementById('compact-node-placer-settings'), new CompactNodePlacer(), panel)
  }

  /** @type {number} */
  get preferredAspectRatio() {
    return this.$preferredAspectRatio
  }

  /** @type {number} */
  set preferredAspectRatio(value) {
    this.$preferredAspectRatio = value
  }

  /** @type {number} */
  get verticalDistance() {
    return this.$verticalDistance
  }

  /** @type {number} */
  set verticalDistance(value) {
    this.$verticalDistance = value
  }

  /** @type {number} */
  get horizontalDistance() {
    return this.$horizontalDistance
  }

  /** @type {number} */
  set horizontalDistance(value) {
    this.$horizontalDistance = value
  }

  /** @type {number} */
  get minimumFirstSegmentLength() {
    return this.$minimumFirstSegmentLength
  }

  /** @type {number} */
  set minimumFirstSegmentLength(value) {
    this.$minimumFirstSegmentLength = value
  }

  /** @type {number} */
  get minimumLastSegmentLength() {
    return this.$minimumLastSegmentLength
  }

  /** @type {number} */
  set minimumLastSegmentLength(value) {
    this.$minimumLastSegmentLength = value
  }

  createNodePlacer() {
    const nodePlacer = new CompactNodePlacer()
    nodePlacer.preferredAspectRatio = this.preferredAspectRatio
    nodePlacer.verticalDistance = this.verticalDistance
    nodePlacer.horizontalDistance = this.horizontalDistance
    nodePlacer.minimumFirstSegmentLength = this.minimumFirstSegmentLength
    nodePlacer.minimumLastSegmentLength = this.minimumLastSegmentLength
    return nodePlacer
  }

  adoptSettings(nodePlacer) {
    this.preferredAspectRatio = nodePlacer.preferredAspectRatio
    this.verticalDistance = nodePlacer.verticalDistance
    this.horizontalDistance = nodePlacer.horizontalDistance
    this.minimumFirstSegmentLength = nodePlacer.minimumFirstSegmentLength
    this.minimumLastSegmentLength = nodePlacer.minimumLastSegmentLength
  }

  getDescriptionText() {
    return (
      '<h2>CompactNodePlacer</h2>' +
      'This node placer uses a dynamic optimization approach that chooses a placement strategy of the children ' +
      'of the associated local root such that the overall result is compact with respect to a specified aspect ratio.'
    )
  }

  updatePanel() {
    const preferredAspectRatio = document.getElementById('compact-preferred-aspect-ratio')
    preferredAspectRatio.value = this.preferredAspectRatio
    const preferredAspectRatioLabel = document.getElementById(
      'compact-preferred-aspect-ratio-label'
    )
    preferredAspectRatioLabel.innerHTML = this.preferredAspectRatio

    const verticalDistance = document.getElementById('compact-vertical-distance')
    verticalDistance.value = this.verticalDistance
    const verticalDistanceLabel = document.getElementById('compact-vertical-distance-label')
    verticalDistanceLabel.innerHTML = this.verticalDistance

    const horizontalDistance = document.getElementById('compact-horizontal-distance')
    horizontalDistance.value = this.horizontalDistance
    const horizontalDistanceLabel = document.getElementById('compact-horizontal-distance-label')
    horizontalDistanceLabel.innerHTML = this.horizontalDistance

    const minimumFirstSegmentLength = document.getElementById(
      'compact-minimum-first-segment-length'
    )
    minimumFirstSegmentLength.value = this.minimumFirstSegmentLength
    const minimumFirstSegmentLengthLabel = document.getElementById(
      'compact-minimum-first-segment-length-label'
    )
    minimumFirstSegmentLengthLabel.innerHTML = this.minimumFirstSegmentLength

    const minimumLastSegmentLength = document.getElementById('compact-minimum-last-segment-length')
    minimumLastSegmentLength.value = this.minimumLastSegmentLength
    const minimumLastSegmentLengthLabel = document.getElementById(
      'compact-minimum-last-segment-length-label'
    )
    minimumLastSegmentLengthLabel.innerHTML = this.minimumLastSegmentLength
  }

  bindActions(panel) {
    const preferredAspectRatio = document.getElementById('compact-preferred-aspect-ratio')
    preferredAspectRatio.addEventListener('change', () => {
      this.preferredAspectRatio = Number.parseInt(preferredAspectRatio.value)
      panel.panelChanged()
    })
    const preferredAspectRatioLabel = document.getElementById(
      'compact-preferred-aspect-ratio-label'
    )
    preferredAspectRatio.addEventListener('input', () => {
      preferredAspectRatioLabel.innerHTML = preferredAspectRatio.value
    })

    const verticalDistance = document.getElementById('compact-vertical-distance')
    verticalDistance.addEventListener('change', () => {
      this.verticalDistance = Number.parseInt(verticalDistance.value)
      panel.panelChanged()
    })
    const verticalDistanceLabel = document.getElementById('compact-vertical-distance-label')
    verticalDistance.addEventListener('input', () => {
      verticalDistanceLabel.innerHTML = verticalDistance.value
    })

    const horizontalDistance = document.getElementById('compact-horizontal-distance')
    horizontalDistance.addEventListener('change', () => {
      this.horizontalDistance = Number.parseInt(horizontalDistance.value)
      panel.panelChanged()
    })
    const horizontalDistanceLabel = document.getElementById('compact-horizontal-distance-label')
    horizontalDistance.addEventListener('input', () => {
      horizontalDistanceLabel.innerHTML = horizontalDistance.value
    })

    const minimumFirstSegmentLength = document.getElementById(
      'compact-minimum-first-segment-length'
    )
    minimumFirstSegmentLength.addEventListener('change', () => {
      this.minimumFirstSegmentLength = Number.parseInt(minimumFirstSegmentLength.value)
      panel.panelChanged()
    })
    const minimumFirstSegmentLengthLabel = document.getElementById(
      'compact-minimum-first-segment-length-label'
    )
    minimumFirstSegmentLength.addEventListener('input', () => {
      minimumFirstSegmentLengthLabel.innerHTML = minimumFirstSegmentLength.value
    })

    const minimumLastSegmentLength = document.getElementById('compact-minimum-last-segment-length')
    minimumLastSegmentLength.addEventListener('change', () => {
      this.minimumLastSegmentLength = Number.parseInt(minimumLastSegmentLength.value)
      panel.panelChanged()
    })
    const minimumLastSegmentLengthLabel = document.getElementById(
      'compact-minimum-last-segment-length-label'
    )
    minimumLastSegmentLength.addEventListener('input', () => {
      minimumLastSegmentLengthLabel.innerHTML = minimumLastSegmentLength.value
    })
  }

  getDefaultNodePlacer() {
    return new CompactNodePlacer()
  }
}
