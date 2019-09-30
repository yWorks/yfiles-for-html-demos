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
  IEnumerable,
  INode,
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
// a map which stores the specified node placer for each node
const nodePlacers = new Mapper()

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
 * A panel that provides access to customize the node placers for each node.
 */
export default class NodePlacerPanel {
  /**
   * Creates a new instance of NodePlacerPanel.
   * @param {GraphComponent} graphComponent
   */
  constructor(graphComponent) {
    this.graphComponent = graphComponent
    this.graph = graphComponent.graph

    // initialize the preview component where the node placer settings are demonstrated on a small graph
    this.previewComponent = new GraphComponent('previewComponent')
    createPreviewGraph(this.previewComponent)
    runPreviewLayout(null, this.previewComponent)

    // connect the UI elements of this panel that are not specific for one node placer
    bindActions(this)

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
    this.nodePlacerConfigurations.set('Multiple Values', new MultipleNodePlacerConfiguration(this))
  }

  /**
   * Returns a map which provides a {@link ITreeLayoutNodePlacer} for each node
   * @return {Mapper.<ITreeLayoutNodePlacer>}
   */
  get nodePlacers() {
    return nodePlacers
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
    this.currentNodePlacerConfiguration.updateNodePlacers(
      this.graphComponent.selection.selectedNodes,
      this.nodePlacers
    )
    const nodePlacer = this.currentNodePlacerConfiguration.createNodePlacer()
    runPreviewLayout(nodePlacer, this.previewComponent)
    this.updateChangeListeners()
  }

  /**
   * Updates which node placer configuration is used in this panel and the layout of the preview graph.
   * @param {IEnumerable} selectedNodes
   */
  onNodeSelectionChanged(selectedNodes) {
    const noNodePlacerElement = document.getElementById('no-node-placer-settings')
    const nodePlacerElement = document.getElementById('select-node-placer')
    const nodePlacerLabelElement = document.getElementById('select-node-placer-label')
    const rotationElement = document.getElementById('rotation')
    const spacingElement = document.getElementById('rotatable-spacing')
    const previewElement = document.getElementById('previewComponent')

    if (this.currentNodePlacerConfiguration) {
      this.currentNodePlacerConfiguration.visible = false
    }

    if (selectedNodes.size === 0) {
      noNodePlacerElement.style.display = 'block'
      nodePlacerElement.style.display = 'none'
      nodePlacerLabelElement.style.display = 'none'
      rotationElement.style.display = 'none'
      spacingElement.style.display = 'none'
      previewElement.style.display = 'none'
      return
    } else {
      noNodePlacerElement.style.display = 'none'
      nodePlacerElement.style.display = 'inline-block'
      nodePlacerLabelElement.style.display = 'inline-block'
    }

    const nodePlacers = selectedNodes.map(node => {
      if (!this.nodePlacers.get(node)) {
        // make sure every node as an associated node placer in the nodePlacers-map
        this.nodePlacers.set(node, new DefaultNodePlacer())
      }
      return this.nodePlacers.get(node)
    })
    const nodePlacer = nodePlacers.reduce((acc, np) => {
      return acc && acc.getClass().isInstance(np) ? acc : null
    }, nodePlacers.firstOrDefault())

    const configurationName = getConfigurationName(nodePlacer)
    setComboboxValue('select-node-placer', configurationName)

    const configuration = this.nodePlacerConfigurations.get(configurationName)
    configuration.adoptSettings(nodePlacers.toArray())

    if (this.currentNodePlacerConfiguration) {
      this.currentNodePlacerConfiguration.visible = false
    }
    this.currentNodePlacerConfiguration = configuration
    this.currentNodePlacerConfiguration.visible = true

    if (configuration.rotatable) {
      rotationElement.style.display = 'block'
      spacingElement.style.display = 'block'
    } else {
      rotationElement.style.display = 'none'
      spacingElement.style.display = 'none'
    }

    previewElement.style.display = configuration.hasPreview ? 'block' : 'none'

    this.currentNodePlacerConfiguration.updatePanel()

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
async function runPreviewLayout(nodePlacer, graphComponent) {
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

  await graphComponent.morphLayout(treeLayout, '0.2s', treeLayoutData)
  layoutRunning = false
}

/**
 * Wires up the UI elements that are not node placer specific.
 * @param {NodePlacerPanel} panel
 */
function bindActions(panel) {
  const selectNodePlacer = document.getElementById('select-node-placer')
  selectNodePlacer.addEventListener('change', () => {
    if (panel.currentNodePlacerConfiguration) {
      panel.currentNodePlacerConfiguration.visible = false
    }
    panel.currentNodePlacerConfiguration = panel.nodePlacerConfigurations.get(
      selectNodePlacer.value
    )
    panel.currentNodePlacerConfiguration.visible = true
    panel.currentNodePlacerConfiguration.adoptSettings([
      panel.currentNodePlacerConfiguration.getDefaultNodePlacer()
    ])

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

  const rotationLeft = document.getElementById('rotation-left')
  rotationLeft.addEventListener('click', () => {
    panel.graphComponent.selection.selectedNodes.forEach(node => {
      updateModificationMatrix(node, RotatableNodePlacerMatrix.ROT90, panel)
    })
    panel.updateChangeListeners()
  })

  const rotationRight = document.getElementById('rotation-right')
  rotationRight.addEventListener('click', () => {
    panel.graphComponent.selection.selectedNodes.forEach(node => {
      updateModificationMatrix(node, RotatableNodePlacerMatrix.ROT270, panel)
    })
    panel.updateChangeListeners()
  })

  const mirrorHorizontal = document.getElementById('mirror-horizontal')
  mirrorHorizontal.addEventListener('click', () => {
    panel.graphComponent.selection.selectedNodes.forEach(node => {
      updateModificationMatrix(node, RotatableNodePlacerMatrix.MIR_HOR, panel)
    })
    panel.updateChangeListeners()
  })

  const mirrorVertical = document.getElementById('mirror-vertical')
  mirrorVertical.addEventListener('click', () => {
    panel.graphComponent.selection.selectedNodes.forEach(node => {
      updateModificationMatrix(node, RotatableNodePlacerMatrix.MIR_VERT, panel)
    })
    panel.updateChangeListeners()
  })
}

/**
 * Updates the rotation matrix for RotatableNodePlacers.
 * It is necessary to create a new instance of the node placer because modificationMatrix is a
 * readonly property.
 * @param {INode} node
 * @param {RotatableNodePlacerMatrix} matrix
 * @param {NodePlacerPanel} panel
 */
function updateModificationMatrix(node, matrix, panel) {
  const nodePlacer = panel.nodePlacers.get(node)
  let rotatedNodePlacer = nodePlacer
  if (AssistantNodePlacer.isInstance(nodePlacer)) {
    rotatedNodePlacer = new AssistantNodePlacer({
      spacing: nodePlacer.spacing,
      modificationMatrix: nodePlacer.modificationMatrix.multiply(matrix),
      childNodePlacer: nodePlacer.childNodePlacer
    })
  } else if (BusNodePlacer.isInstance(nodePlacer)) {
    rotatedNodePlacer = new BusNodePlacer({
      spacing: nodePlacer.spacing,
      modificationMatrix: nodePlacer.modificationMatrix.multiply(matrix)
    })
  } else if (DoubleLineNodePlacer.isInstance(nodePlacer)) {
    rotatedNodePlacer = new DoubleLineNodePlacer({
      spacing: nodePlacer.spacing,
      modificationMatrix: nodePlacer.modificationMatrix.multiply(matrix),
      rootAlignment: nodePlacer.rootAlignment,
      doubleLineSpacingRatio: nodePlacer.doubleLineSpacingRatio
    })
  } else if (GridNodePlacer.isInstance(nodePlacer)) {
    rotatedNodePlacer = new GridNodePlacer(
      nodePlacer.modificationMatrix.multiply(matrix),
      nodePlacer.rootAlignment
    )
    rotatedNodePlacer.spacing = nodePlacer.spacing
  } else if (LeftRightNodePlacer.isInstance(nodePlacer)) {
    rotatedNodePlacer = new LeftRightNodePlacer({
      spacing: nodePlacer.spacing,
      modificationMatrix: nodePlacer.modificationMatrix.multiply(matrix),
      horizontalDistance: nodePlacer.horizontalDistance,
      verticalDistance: nodePlacer.verticalDistance,
      branchCount: nodePlacer.branchCount,
      placeLastOnBottom: nodePlacer.placeLastOnBottom
    })
  } else if (SimpleNodePlacer.isInstance(nodePlacer)) {
    rotatedNodePlacer = new SimpleNodePlacer({
      spacing: nodePlacer.spacing,
      modificationMatrix: nodePlacer.modificationMatrix.multiply(matrix),
      rootAlignment: nodePlacer.rootAlignment,
      verticalAlignment: nodePlacer.verticalAlignment,
      minimumChannelSegmentDistance: nodePlacer.minimumChannelSegmentDistance,
      createBus: nodePlacer.createBus
    })
  }
  panel.nodePlacers.set(node, rotatedNodePlacer)
}

/**
 * Returns the configuration name to retrieve the correct configuration for the given node placer.
 * @param {ITreeLayoutNodePlacer} nodePlacer
 * @return {string|null}
 */
function getConfigurationName(nodePlacer) {
  if (DefaultNodePlacer.isInstance(nodePlacer)) {
    return 'DefaultNodePlacer'
  } else if (SimpleNodePlacer.isInstance(nodePlacer)) {
    return 'SimpleNodePlacer'
  } else if (BusNodePlacer.isInstance(nodePlacer)) {
    return 'BusNodePlacer'
  } else if (DoubleLineNodePlacer.isInstance(nodePlacer)) {
    return 'DoubleLineNodePlacer'
  } else if (GridNodePlacer.isInstance(nodePlacer)) {
    return 'GridNodePlacer'
  } else if (LeftRightNodePlacer.isInstance(nodePlacer)) {
    return 'LeftRightNodePlacer'
  } else if (AspectRatioNodePlacer.isInstance(nodePlacer)) {
    return 'AspectRatioNodePlacer'
  } else if (AssistantNodePlacer.isInstance(nodePlacer)) {
    return 'AssistantNodePlacer'
  } else if (CompactNodePlacer.isInstance(nodePlacer)) {
    return 'CompactNodePlacer'
  }
  return 'Multiple Values'
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
    this.adoptSettings([nodePlacer])
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
   * Returns whether or not there is a preview for the layout with the represented node placer. This
   * is used to determine if the preview element should be visible.
   * @returns {boolean}
   */
  get hasPreview() {
    return true
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
   * Updates the node placers of the selected nodes with the values in the panel.
   * Note that indeterminate properties in the panel should not be applied to the individual placer.
   * @param {IEnumerable} selectedNodes
   * @param {Mapper.<ITreeLayoutNodePlacer>} nodePlacers
   */
  // eslint-disable-next-line no-unused-vars
  updateNodePlacers(selectedNodes, nodePlacers) {}

  /**
   * Updates the configuration settings according to the given {@link INodePlacer}.
   * This method is call when the configuration is changed or reset.
   * @param {Array.<ITreeLayoutNodePlacer>} nodePlacers
   */
  // eslint-disable-next-line no-unused-vars
  adoptSettings(nodePlacers) {}

  /**
   * Updates the UI after the configuration changed.
   * @see {@link NodePlacerConfiguration#adoptSettings}
   */
  updatePanel() {}

  /**
   * Wires up the UI for this configuration.
   * @param {NodePlacerPanel} panel
   */
  // eslint-disable-next-line no-unused-vars
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
  constructor(div, nodePlacer, panel) {
    super(div, nodePlacer, panel)
    this.spacing = 20
    this.indeterminateSpacing = false
    this.modificationMatrix = RotatableNodePlacerMatrix.DEFAULT
  }

  /**
   * Returns true for all configurations based on this class.
   * @return {boolean}
   */
  get rotatable() {
    return true
  }

  adoptSettings(nodePlacers) {
    const nodePlacer = nodePlacers[0]
    let settings = {
      spacing: nodePlacer.spacing,
      indeterminateSpacing: false,
      modificationMatrix: nodePlacer.modificationMatrix
    }
    if (nodePlacers.length > 1) {
      settings = nodePlacers.reduce((acc, nodePlacer) => {
        if (!acc.indeterminateSpacing && acc.spacing !== nodePlacer.spacing) {
          acc.indeterminateSpacing = true
        }
        return acc
      }, settings)
    }
    this.spacing = settings.spacing
    this.indeterminateSpacing = settings.indeterminateSpacing
    this.modificationMatrix = settings.modificationMatrix
  }

  updatePanel() {
    const spacing = document.getElementById('spacing')
    spacing.value = this.spacing
    const spacingLabel = document.getElementById('spacing-label')
    spacingLabel.innerHTML = this.indeterminateSpacing ? '???' : this.spacing
  }

  bindActions(panel) {
    const spacing = document.getElementById('spacing')
    spacing.addEventListener('change', () => {
      if (this.visible) {
        this.spacing = Number.parseInt(spacing.value)
        this.indeterminateSpacing = false
        panel.panelChanged()
      }
    })
    const spacingLabel = document.getElementById('spacing-label')
    spacing.addEventListener('input', () => {
      if (this.visible) {
        spacingLabel.innerHTML = spacing.value
      }
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
    this.childPlacement = ChildPlacement.HORIZONTAL_DOWNWARD
    this.indeterminateChildPlacement = false
    this.routingStyle = TreeLayoutEdgeRoutingStyle.FORK
    this.indeterminateRoutingStyle = false
    this.horizontalDistance = 40
    this.indeterminateHorizontalDistance = false
    this.verticalDistance = 40
    this.indeterminateVerticalDistance = false
    this.rootAlignment = RootAlignment.CENTER
    this.indeterminateRootAlignment = false
    this.minimumChannelSegmentDistance = 0
    this.indeterminateMinimumChannelSegmentDistance = false
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

  updateNodePlacers(selectedNodes, nodePlacers) {
    selectedNodes.forEach(selectedNode => {
      const nodePlacer = nodePlacers.get(selectedNode)
      if (DefaultNodePlacer.isInstance(nodePlacer)) {
        if (!this.indeterminateChildPlacement) {
          nodePlacer.childPlacement = this.childPlacement
        }
        if (!this.indeterminateRoutingStyle) {
          nodePlacer.routingStyle = this.routingStyle
        }
        if (!this.indeterminateHorizontalDistance) {
          nodePlacer.horizontalDistance = this.horizontalDistance
        }
        if (!this.indeterminateVerticalDistance) {
          nodePlacer.verticalDistance = this.verticalDistance
        }
        if (!this.indeterminateRootAlignment) {
          nodePlacer.rootAlignment = this.rootAlignment
        }
        if (!this.indeterminateMinimumChannelSegmentDistance) {
          nodePlacer.minimumChannelSegmentDistance = this.minimumChannelSegmentDistance
        }
      } else {
        nodePlacers.set(selectedNode, this.createNodePlacer())
      }
    })
  }

  adoptSettings(nodePlacers) {
    let settings = {
      childPlacement: nodePlacers[0].childPlacement,
      indeterminateChildPlacement: false,
      routingStyle: nodePlacers[0].routingStyle,
      indeterminateRoutingStyle: false,
      horizontalDistance: nodePlacers[0].horizontalDistance,
      indeterminateHorizontalDistance: false,
      verticalDistance: nodePlacers[0].verticalDistance,
      indeterminateVerticalDistance: false,
      minimumChannelSegmentDistance: nodePlacers[0].minimumChannelSegmentDistance,
      indeterminateMinimumChannelSegmentDistance: false,
      rootAlignment: nodePlacers[0].rootAlignment,
      indeterminateRootAlignment: false
    }
    if (nodePlacers.length > 1) {
      settings = nodePlacers.reduce((acc, nodePlacer) => {
        if (acc.indeterminateChildPlacement || acc.childPlacement !== nodePlacer.childPlacement) {
          acc.indeterminateChildPlacement = true
        }
        if (acc.indeterminateRoutingStyle || acc.routingStyle !== nodePlacer.routingStyle) {
          acc.indeterminateRoutingStyle = true
        }
        if (
          acc.indeterminateHorizontalDistance ||
          acc.horizontalDistance !== nodePlacer.horizontalDistance
        ) {
          acc.indeterminateHorizontalDistance = true
        }
        if (
          acc.indeterminateVerticalDistance ||
          acc.verticalDistance !== nodePlacer.verticalDistance
        ) {
          acc.indeterminateVerticalDistance = true
        }
        if (
          acc.indeterminateMinimumChannelSegmentDistance ||
          acc.minimumChannelSegmentDistance !== nodePlacer.minimumChannelSegmentDistance
        ) {
          acc.indeterminateMinimumChannelSegmentDistance = true
        }
        if (acc.indeterminateRootAlignment || acc.rootAlignment !== nodePlacer.rootAlignment) {
          acc.indeterminateRootAlignment = true
        }
        return acc
      }, settings)
    }
    this.childPlacement = settings.childPlacement
    this.indeterminateChildPlacement = settings.indeterminateChildPlacement
    this.routingStyle = settings.routingStyle
    this.indeterminateRoutingStyle = settings.indeterminateRoutingStyle
    this.horizontalDistance = settings.horizontalDistance
    this.indeterminateHorizontalDistance = settings.indeterminateHorizontalDistance
    this.verticalDistance = settings.verticalDistance
    this.indeterminateVerticalDistance = settings.indeterminateVerticalDistance
    this.minimumChannelSegmentDistance = settings.minimumChannelSegmentDistance
    this.indeterminateMinimumChannelSegmentDistance =
      settings.indeterminateMinimumChannelSegmentDistance
    this.rootAlignment = settings.rootAlignment
    this.indeterminateRootAlignment = settings.indeterminateRootAlignment
    this.updatePanel()
  }

  updatePanel() {
    const childPlacement = document.getElementById('select-child-placement')
    if (this.indeterminateChildPlacement) {
      childPlacement.selectedIndex = 0
    } else {
      switch (this.childPlacement) {
        default:
        case ChildPlacement.HORIZONTAL_DOWNWARD:
          childPlacement.selectedIndex = 1
          break
        case ChildPlacement.HORIZONTAL_UPWARD:
          childPlacement.selectedIndex = 2
          break
        case ChildPlacement.VERTICAL_TO_LEFT:
          childPlacement.selectedIndex = 3
          break
        case ChildPlacement.VERTICAL_TO_RIGHT:
          childPlacement.selectedIndex = 4
          break
      }
    }

    const routingStyle = document.getElementById('routing-style')
    if (this.indeterminateRoutingStyle) {
      routingStyle.selectedIndex = 0
    } else {
      switch (this.routingStyle) {
        default:
        case TreeLayoutEdgeRoutingStyle.FORK:
          routingStyle.selectedIndex = 1
          break
        case TreeLayoutEdgeRoutingStyle.FORK_AT_ROOT:
          routingStyle.selectedIndex = 2
          break
        case TreeLayoutEdgeRoutingStyle.STRAIGHT:
          routingStyle.selectedIndex = 3
          break
        case TreeLayoutEdgeRoutingStyle.POLYLINE:
          routingStyle.selectedIndex = 4
          break
      }
    }

    const horizontalDistance = document.getElementById('horizontal-distance')
    horizontalDistance.value = this.horizontalDistance
    const horizontalDistanceLabel = document.getElementById('horizontal-distance-label')
    horizontalDistanceLabel.innerHTML = this.indeterminateHorizontalDistance
      ? '???'
      : this.horizontalDistance

    const verticalDistance = document.getElementById('vertical-distance')
    verticalDistance.value = this.verticalDistance
    const verticalDistanceLabel = document.getElementById('vertical-distance-label')
    verticalDistanceLabel.innerHTML = this.indeterminateVerticalDistance
      ? '???'
      : this.verticalDistance

    const minimumChannelSegmentDistance = document.getElementById(
      'minimum-channel-segment-distance'
    )
    minimumChannelSegmentDistance.value = this.minimumChannelSegmentDistance
    const minimumChannelSegmentDistanceLabel = document.getElementById(
      'minimum-channel-segment-distance-label'
    )
    minimumChannelSegmentDistanceLabel.innerHTML = this.indeterminateMinimumChannelSegmentDistance
      ? '???'
      : this.minimumChannelSegmentDistance

    const rootAlignment = document.getElementById('root-alignment')
    if (this.indeterminateRootAlignment) {
      rootAlignment.selectedIndex = 0
    } else {
      switch (this.rootAlignment) {
        default:
        case RootAlignment.LEADING_OFFSET:
          rootAlignment.selectedIndex = 1
          break
        case RootAlignment.LEADING:
          rootAlignment.selectedIndex = 2
          break
        case RootAlignment.CENTER:
          rootAlignment.selectedIndex = 3
          break
        case RootAlignment.MEDIAN:
          rootAlignment.selectedIndex = 4
          break
        case RootAlignment.TRAILING:
          rootAlignment.selectedIndex = 5
          break
        case RootAlignment.TRAILING_OFFSET:
          rootAlignment.selectedIndex = 6
          break
        case RootAlignment.LEADING_ON_BUS:
          rootAlignment.selectedIndex = 7
          break
        case RootAlignment.TRAILING_ON_BUS:
          rootAlignment.selectedIndex = 8
          break
      }
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
        case 1:
          this.childPlacement = ChildPlacement.HORIZONTAL_DOWNWARD
          break
        case 2:
          this.childPlacement = ChildPlacement.HORIZONTAL_UPWARD
          break
        case 3:
          this.childPlacement = ChildPlacement.VERTICAL_TO_LEFT
          break
        case 4:
          this.childPlacement = ChildPlacement.VERTICAL_TO_RIGHT
          break
      }
      this.indeterminateChildPlacement = false
      panel.panelChanged()
    })

    const routingStyle = document.getElementById('routing-style')
    routingStyle.addEventListener('change', () => {
      switch (routingStyle.selectedIndex) {
        default:
        case 1:
          this.routingStyle = TreeLayoutEdgeRoutingStyle.FORK
          break
        case 2:
          this.routingStyle = TreeLayoutEdgeRoutingStyle.FORK_AT_ROOT
          break
        case 3:
          this.routingStyle = TreeLayoutEdgeRoutingStyle.STRAIGHT
          break
        case 4:
          this.routingStyle = TreeLayoutEdgeRoutingStyle.POLYLINE
          break
      }
      this.indeterminateRoutingStyle = false
      panel.panelChanged()
    })

    const horizontalDistance = document.getElementById('horizontal-distance')
    horizontalDistance.addEventListener('change', () => {
      this.horizontalDistance = Number.parseInt(horizontalDistance.value)
      this.indeterminateHorizontalDistance = false
      panel.panelChanged()
    })
    const horizontalDistanceLabel = document.getElementById('horizontal-distance-label')
    horizontalDistance.addEventListener('input', () => {
      horizontalDistanceLabel.innerHTML = horizontalDistance.value
    })

    const verticalDistance = document.getElementById('vertical-distance')
    verticalDistance.addEventListener('change', () => {
      this.verticalDistance = Number.parseInt(verticalDistance.value)
      this.indeterminateVerticalDistance = false
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
      this.indeterminateMinimumChannelSegmentDistance = false
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
        case 1:
          this.rootAlignment = RootAlignment.LEADING_OFFSET
          break
        case 2:
          this.rootAlignment = RootAlignment.LEADING
          break
        case 3:
          this.rootAlignment = RootAlignment.CENTER
          break
        case 4:
          this.rootAlignment = RootAlignment.MEDIAN
          break
        case 5:
          this.rootAlignment = RootAlignment.TRAILING
          break
        case 6:
          this.rootAlignment = RootAlignment.TRAILING_OFFSET
          break
        case 7:
          this.rootAlignment = RootAlignment.LEADING_ON_BUS
          break
        case 8:
          this.rootAlignment = RootAlignment.TRAILING_ON_BUS
          break
      }
      this.indeterminateRootAlignment = false
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
    this.createBus = false
    this.indeterminateCreateBus = false
    this.rootAlignment = RootNodeAlignment.TRAILING
    this.indeterminateRootAlignment = false
    this.minimumChannelSegmentDistance = 40
    this.indeterminateMinimumChannelSegmentDistance = false
  }

  createNodePlacer() {
    const nodePlacer = new SimpleNodePlacer()
    nodePlacer.createBus = this.createBus
    nodePlacer.rootAlignment = this.rootAlignment
    nodePlacer.minimumChannelSegmentDistance = this.minimumChannelSegmentDistance
    nodePlacer.spacing = this.spacing
    return nodePlacer
  }

  updateNodePlacers(selectedNodes, nodePlacers) {
    selectedNodes.forEach(selectedNode => {
      const nodePlacer = nodePlacers.get(selectedNode)
      if (SimpleNodePlacer.isInstance(nodePlacer)) {
        if (!this.indeterminateSpacing) {
          nodePlacer.spacing = this.spacing
        }
        if (!this.indeterminateCreateBus) {
          nodePlacer.createBus = this.createBus
        }
        if (!this.indeterminateRootAlignment) {
          nodePlacer.rootAlignment = this.rootAlignment
        }
        if (!this.indeterminateMinimumChannelSegmentDistance) {
          nodePlacer.minimumChannelSegmentDistance = this.minimumChannelSegmentDistance
        }
      } else {
        nodePlacers.set(selectedNode, this.createNodePlacer())
      }
    })
  }

  adoptSettings(nodePlacers) {
    super.adoptSettings(nodePlacers)

    const nodePlacer = nodePlacers[0]
    let settings = {
      createBus: nodePlacer.createBus,
      indeterminateCreateBus: false,
      rootAlignment: nodePlacer.rootAlignment,
      indeterminateRootAlignment: false,
      minimumChannelSegmentDistance: nodePlacer.minimumChannelSegmentDistance,
      indeterminateMinimumChannelSegmentDistance: false
    }
    if (nodePlacers.length > 1) {
      settings = nodePlacers.reduce((acc, nodePlacer) => {
        if (!acc.indeterminateCreateBus && acc.createBus !== nodePlacer.createBus) {
          acc.indeterminateCreateBus = true
        }
        if (!acc.indeterminateRootAlignment && acc.rootAlignment !== nodePlacer.rootAlignment) {
          acc.indeterminateRootAlignment = true
        }
        if (
          !acc.indeterminateMinimumChannelSegmentDistance &&
          acc.minimumChannelSegmentDistance !== nodePlacer.minimumChannelSegmentDistance
        ) {
          acc.indeterminateMinimumChannelSegmentDistance = true
        }
        return acc
      }, settings)
    }
    this.createBus = settings.createBus
    this.indeterminateCreateBus = settings.indeterminateCreateBus
    this.rootAlignment = settings.rootAlignment
    this.indeterminateRootAlignment = settings.indeterminateRootAlignment
    this.minimumChannelSegmentDistance = settings.minimumChannelSegmentDistance
    this.indeterminateMinimumChannelSegmentDistance =
      settings.indeterminateMinimumChannelSegmentDistance

    this.updatePanel()
  }

  updatePanel() {
    super.updatePanel()
    const createBus = document.getElementById('create-bus')
    createBus.checked = this.createBus
    createBus.indeterminate = this.indeterminateCreateBus

    const rootAlignment = document.getElementById('simple-root-node-alignment')
    if (this.indeterminateRootAlignment) {
      rootAlignment.selectedIndex = 0
    } else {
      switch (this.rootAlignment) {
        default:
        case RootNodeAlignment.LEADING:
          rootAlignment.selectedIndex = 1
          break
        case RootNodeAlignment.LEFT:
          rootAlignment.selectedIndex = 2
          break
        case RootNodeAlignment.CENTER:
          rootAlignment.selectedIndex = 3
          break
        case RootNodeAlignment.CENTER_OVER_CHILDREN:
          rootAlignment.selectedIndex = 4
          break
        case RootNodeAlignment.MEDIAN:
          rootAlignment.selectedIndex = 5
          break
        case RootNodeAlignment.RIGHT:
          rootAlignment.selectedIndex = 6
          break
        case RootNodeAlignment.TRAILING:
          rootAlignment.selectedIndex = 7
          break
      }
    }

    const minimumChannelSegmentDistance = document.getElementById('min-channel-segment-distance')
    minimumChannelSegmentDistance.value = this.minimumChannelSegmentDistance
    const minimumChannelSegmentDistanceLabel = document.getElementById(
      'min-channel-segment-distance-label'
    )
    minimumChannelSegmentDistanceLabel.innerHTML = this.indeterminateMinimumChannelSegmentDistance
      ? '???'
      : this.minimumChannelSegmentDistance
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
      this.indeterminateCreateBus = false
      panel.panelChanged()
    })

    const rootAlignment = document.getElementById('simple-root-node-alignment')
    rootAlignment.addEventListener('change', () => {
      switch (rootAlignment.selectedIndex) {
        default:
        case 1:
          this.rootAlignment = RootNodeAlignment.LEADING
          break
        case 2:
          this.rootAlignment = RootNodeAlignment.LEFT
          break
        case 3:
          this.rootAlignment = RootNodeAlignment.CENTER
          break
        case 4:
          this.rootAlignment = RootNodeAlignment.CENTER_OVER_CHILDREN
          break
        case 5:
          this.rootAlignment = RootNodeAlignment.MEDIAN
          break
        case 6:
          this.rootAlignment = RootNodeAlignment.RIGHT
          break
        case 7:
          this.rootAlignment = RootNodeAlignment.TRAILING
          break
      }
      this.indeterminateRootAlignment = false
      panel.panelChanged()
    })

    const minimumChannelSegmentDistance = document.getElementById('min-channel-segment-distance')
    minimumChannelSegmentDistance.addEventListener('change', () => {
      this.minimumChannelSegmentDistance = Number.parseInt(minimumChannelSegmentDistance.value)
      this.indeterminateMinimumChannelSegmentDistance = false
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
    const nodePlacer = new BusNodePlacer()
    nodePlacer.spacing = this.spacing
    return nodePlacer
  }

  updateNodePlacers(selectedNodes, nodePlacers) {
    selectedNodes.forEach(selectedNode => {
      const nodePlacer = nodePlacers.get(selectedNode)
      if (BusNodePlacer.isInstance(nodePlacer)) {
        if (!this.indeterminateSpacing) {
          nodePlacer.spacing = this.spacing
        }
      } else {
        nodePlacers.set(selectedNode, this.createNodePlacer())
      }
    })
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
    this.rootAlignment = GridNodePlacer.BUS_ALIGNED
    this.indeterminateRootAlignment = GridNodePlacer.BUS_ALIGNED
    this.busPlacement = BusPlacement.LEADING
    this.indeterminateBusPlacement = BusPlacement.LEADING
  }

  createNodePlacer() {
    const nodePlacer = new GridNodePlacer()
    nodePlacer.spacing = this.spacing
    nodePlacer.rootAlignment = this.rootAlignment
    nodePlacer.busPlacement = this.busPlacement
    nodePlacer.automaticRowAssignment = true
    return nodePlacer
  }

  updateNodePlacers(selectedNodes, nodePlacers) {
    selectedNodes.forEach(selectedNode => {
      const nodePlacer = nodePlacers.get(selectedNode)
      if (GridNodePlacer.isInstance(nodePlacer)) {
        if (!this.indeterminateSpacing) {
          nodePlacer.spacing = this.spacing
        }
        if (!this.indeterminateRootAlignment) {
          nodePlacer.rootAlignment = this.rootAlignment
        }
        if (!this.indeterminateBusPlacement) {
          nodePlacer.busPlacement = this.busPlacement
        }
      } else {
        nodePlacers.set(selectedNode, this.createNodePlacer())
      }
    })
  }

  adoptSettings(nodePlacers) {
    super.adoptSettings(nodePlacers)

    const nodePlacer = nodePlacers[0]
    let settings = {
      rootAlignment: nodePlacer.rootAlignment,
      indeterminateRootAlignment: false,
      busPlacement: nodePlacer.busPlacement,
      indeterminateBusPlacement: false
    }
    if (nodePlacers.length > 1) {
      settings = nodePlacers.reduce((acc, nodePlacer) => {
        if (!acc.indeterminateSpacing && acc.spacing !== nodePlacer.spacing) {
          acc.indeterminateSpacing = true
        }
        if (
          !acc.indeterminateRootAlignment &&
          !acc.rootAlignment.equals(nodePlacer.rootAlignment)
        ) {
          acc.indeterminateRootAlignment = true
        }
        if (!acc.indeterminateBusPlacement && acc.busPlacement !== nodePlacer.busPlacement) {
          acc.indeterminateBusPlacement = true
        }
        return acc
      }, settings)
    }
    this.rootAlignment = settings.rootAlignment
    this.indeterminateRootAlignment = settings.indeterminateRootAlignment
    this.busPlacement = settings.busPlacement
    this.indeterminateBusPlacement = settings.indeterminateBusPlacement

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
    if (this.indeterminateRootAlignment) {
      rootAlignment.selectedIndex = 0
    } else {
      switch (this.rootAlignment) {
        default:
        case RootNodeAlignment.LEADING:
          rootAlignment.selectedIndex = 1
          break
        case RootNodeAlignment.LEFT:
          rootAlignment.selectedIndex = 2
          break
        case RootNodeAlignment.CENTER:
          rootAlignment.selectedIndex = 3
          break
        case RootNodeAlignment.CENTER_OVER_CHILDREN:
          rootAlignment.selectedIndex = 4
          break
        case RootNodeAlignment.RIGHT:
          rootAlignment.selectedIndex = 5
          break
        case RootNodeAlignment.TRAILING:
          rootAlignment.selectedIndex = 6
          break
        case GridNodePlacer.BUS_ALIGNED:
          rootAlignment.selectedIndex = 7
          break
      }
    }

    const busPlacement = document.getElementById('grid-node-placer-bus-placement')
    if (this.indeterminateBusPlacement) {
      busPlacement.selectedIndex = 0
    } else {
      switch (this.busPlacement) {
        default:
        case BusPlacement.CENTER:
          busPlacement.selectedIndex = 1
          break
        case BusPlacement.LEADING:
          busPlacement.selectedIndex = 2
          break
        case BusPlacement.TRAILING:
          busPlacement.selectedIndex = 3
          break
      }
    }
  }

  bindActions(panel) {
    super.bindActions(panel)
    const rootAlignment = document.getElementById('grid-node-placer-alignment')
    rootAlignment.addEventListener('change', () => {
      switch (rootAlignment.selectedIndex) {
        default:
        case 1:
          this.rootAlignment = RootNodeAlignment.LEADING
          break
        case 2:
          this.rootAlignment = RootNodeAlignment.LEFT
          break
        case 3:
          this.rootAlignment = RootNodeAlignment.CENTER
          break
        case 4:
          this.rootAlignment = RootNodeAlignment.CENTER_OVER_CHILDREN
          break
        case 5:
          this.rootAlignment = RootNodeAlignment.RIGHT
          break
        case 6:
          this.rootAlignment = RootNodeAlignment.TRAILING
          break
        case 7:
          this.rootAlignment = GridNodePlacer.BUS_ALIGNED
          break
      }
      this.indeterminateRootAlignment = false
      panel.panelChanged()
    })

    const busPlacement = document.getElementById('grid-node-placer-bus-placement')
    busPlacement.addEventListener('change', () => {
      switch (busPlacement.selectedIndex) {
        default:
        case 1:
          this.busPlacement = BusPlacement.CENTER
          break
        case 2:
          this.busPlacement = BusPlacement.LEADING
          break
        case 3:
          this.busPlacement = BusPlacement.TRAILING
          break
      }
      this.indeterminateBusPlacement = false
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
    this.rootAlignment = RootNodeAlignment.CENTER
    this.indeterminateRootAlignment = false
  }

  createNodePlacer() {
    const nodePlacer = new DoubleLineNodePlacer()
    nodePlacer.spacing = this.spacing
    nodePlacer.rootAlignment = this.rootAlignment
    return nodePlacer
  }

  updateNodePlacers(selectedNodes, nodePlacers) {
    selectedNodes.forEach(selectedNode => {
      const nodePlacer = nodePlacers.get(selectedNode)
      if (DoubleLineNodePlacer.isInstance(nodePlacer)) {
        if (!this.indeterminateSpacing) {
          nodePlacer.spacing = this.spacing
        }
        if (!this.indeterminateRootAlignment) {
          nodePlacer.rootAlignment = this.rootAlignment
        }
      } else {
        nodePlacers.set(selectedNode, this.createNodePlacer())
      }
    })
  }

  adoptSettings(nodePlacers) {
    super.adoptSettings(nodePlacers)

    const nodePlacer = nodePlacers[0]
    let settings = {
      rootAlignment: nodePlacer.rootAlignment,
      indeterminateRootAlignment: false
    }
    if (nodePlacers.length > 1) {
      settings = nodePlacers.reduce((acc, nodePlacer) => {
        if (
          !acc.indeterminateRootAlignment &&
          !acc.rootAlignment.equals(nodePlacer.rootAlignment)
        ) {
          acc.indeterminateRootAlignment = true
        }
        return acc
      }, settings)
    }
    this.rootAlignment = settings.rootAlignment
    this.indeterminateRootAlignment = settings.indeterminateRootAlignment
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
    if (this.indeterminateRootAlignment) {
      rootAlignment.selectedIndex = 0
    } else {
      switch (this.rootAlignment) {
        default:
        case RootNodeAlignment.LEADING:
          rootAlignment.selectedIndex = 1
          break
        case RootNodeAlignment.LEFT:
          rootAlignment.selectedIndex = 2
          break
        case RootNodeAlignment.CENTER:
          rootAlignment.selectedIndex = 3
          break
        case RootNodeAlignment.CENTER_OVER_CHILDREN:
          rootAlignment.selectedIndex = 4
          break
        case RootNodeAlignment.MEDIAN:
          rootAlignment.selectedIndex = 5
          break
        case RootNodeAlignment.RIGHT:
          rootAlignment.selectedIndex = 6
          break
        case RootNodeAlignment.TRAILING:
          rootAlignment.selectedIndex = 7
          break
      }
    }
  }

  bindActions(panel) {
    super.bindActions(panel)
    const rootAlignment = document.getElementById('double-line-root-node-alignment')
    rootAlignment.addEventListener('change', () => {
      switch (rootAlignment.selectedIndex) {
        default:
        case 1:
          this.rootAlignment = RootNodeAlignment.LEADING
          break
        case 2:
          this.rootAlignment = RootNodeAlignment.LEFT
          break
        case 3:
          this.rootAlignment = RootNodeAlignment.CENTER
          break
        case 4:
          this.rootAlignment = RootNodeAlignment.CENTER_OVER_CHILDREN
          break
        case 5:
          this.rootAlignment = RootNodeAlignment.MEDIAN
          break
        case 6:
          this.rootAlignment = RootNodeAlignment.RIGHT
          break
        case 7:
          this.rootAlignment = RootNodeAlignment.TRAILING
          break
      }
      this.indeterminateRootAlignment = false
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
    this.lastOnBottom = true
    this.indeterminateLastOnBottom = false
    this.branchCount = 1
    this.indeterminateBranchCount = false
  }

  createNodePlacer() {
    const nodePlacer = new LeftRightNodePlacer()
    nodePlacer.spacing = this.spacing
    nodePlacer.placeLastOnBottom = this.lastOnBottom
    nodePlacer.branchCount = this.branchCount
    return nodePlacer
  }

  updateNodePlacers(selectedNodes, nodePlacers) {
    selectedNodes.forEach(selectedNode => {
      const nodePlacer = nodePlacers.get(selectedNode)
      if (AssistantNodePlacer.isInstance(nodePlacer)) {
        if (!this.indeterminateSpacing) {
          nodePlacer.spacing = this.spacing
        }
        if (!this.indeterminatePlaceLastOnBottom) {
          nodePlacer.placeLastOnBottom = this.placeLastOnBottom
        }
        if (!this.indeterminateBranchCount) {
          nodePlacer.branchCount = this.branchCount
        }
      } else {
        nodePlacers.set(selectedNode, this.createNodePlacer())
      }
    })
  }

  adoptSettings(nodePlacers) {
    super.adoptSettings(nodePlacers)

    const nodePlacer = nodePlacers[0]
    let settings = {
      placeLastOnBottom: nodePlacer.placeLastOnBottom,
      indeterminatePlaceLastOnBottom: false,
      branchCount: nodePlacer.branchCount,
      indeterminateBranchCount: false
    }
    if (nodePlacers.length > 1) {
      settings = nodePlacers.reduce((acc, nodePlacer) => {
        if (
          !acc.indeterminatePlaceLastOnBottom &&
          acc.placeLastOnBottom !== nodePlacer.placeLastOnBottom
        ) {
          acc.indeterminatePlaceLastOnBottom = true
        }
        if (!acc.indeterminateBranchCount && acc.branchCount !== nodePlacer.branchCount) {
          acc.indeterminateBranchCount = true
        }
        return acc
      }, settings)
    }
    this.placeLastOnBottom = settings.placeLastOnBottom
    this.indeterminatePlaceLastOnBottom = settings.indeterminatePlaceLastOnBottom
    this.branchCount = settings.branchCount
    this.indeterminateBranchCount = settings.indeterminateBranchCount

    this.updatePanel()
  }

  getDescriptionText() {
    return (
      '<h2>LeftRightNodePlacer</h2>' +
      'This node placer arranges the child nodes below their root node, left and right of the downward extending bus-like routing.'
    )
  }

  updatePanel() {
    super.updatePanel()

    const lastOnBottom = document.getElementById('last-on-bottom')
    lastOnBottom.checked = this.lastOnBottom
    lastOnBottom.indeterminate = this.indeterminatePlaceLastOnBottom
    const branchCount = document.getElementById('branch-count')
    branchCount.value = this.branchCount
    const branchCountLabel = document.getElementById('branch-count-label')
    branchCountLabel.innerHTML = this.indeterminateBranchCount ? '???' : this.branchCount.toString()
  }

  bindActions(panel) {
    super.bindActions(panel)
    const lastOnBottom = document.getElementById('last-on-bottom')
    lastOnBottom.addEventListener('change', () => {
      this.lastOnBottom = lastOnBottom.checked
      this.indeterminateLastOnBottom = false
      panel.panelChanged()
    })

    const branchCount = document.getElementById('branch-count')
    branchCount.addEventListener('change', () => {
      this.branchCount = Number.parseInt(branchCount.value)
      this.indeterminateBranchCount = false
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
    this.aspectRatio = 1
    this.indeterminateAspectRatio = false
    this.fillStyle = FillStyle.LEADING
    this.indeterminateFillStyle = false
    this.horizontal = false
    this.indeterminateHorizontal = false
    this.horizontalDistance = 40
    this.indeterminateHorizontalDistance = false
    this.verticalDistance = 40
    this.indeterminateVerticalDistance = false
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

  updateNodePlacers(selectedNodes, nodePlacers) {
    selectedNodes.forEach(selectedNode => {
      const nodePlacer = nodePlacers.get(selectedNode)
      if (AspectRatioNodePlacer.isInstance(nodePlacer)) {
        if (!this.indeterminateAspectRatio) {
          nodePlacer.aspectRatio = this.aspectRatio
        }
        if (!this.indeterminateFillStyle) {
          nodePlacer.fillStyle = this.fillStyle
        }
        if (!this.indeterminateHorizontalDistance) {
          nodePlacer.horizontalDistance = this.horizontalDistance
        }
        if (!this.indeterminateVerticalDistance) {
          nodePlacer.verticalDistance = this.verticalDistance
        }
        if (!this.indeterminateHorizontal) {
          nodePlacer.horizontal = this.horizontal
        }
      } else {
        nodePlacers.set(selectedNode, this.createNodePlacer())
      }
    })
  }

  adoptSettings(nodePlacers) {
    const nodePlacer = nodePlacers[0]
    let settings = {
      aspectRatio: nodePlacer.aspectRatio,
      indeterminateAspectRatio: false,
      fillStyle: nodePlacer.fillStyle,
      indeterminateFillStyle: false,
      horizontalDistance: nodePlacer.horizontalDistance,
      indeterminateHorizontalDistance: false,
      verticalDistance: nodePlacer.verticalDistance,
      indeterminateVerticalDistance: false,
      horizontal: nodePlacer.fillStyle,
      indeterminateHorizontal: false
    }
    if (nodePlacers.length > 1) {
      settings = nodePlacers.reduce((acc, nodePlacer) => {
        if (!acc.indeterminateAspectRatio && acc.aspectRatio !== nodePlacer.aspectRatio) {
          acc.indeterminateAspectRatio = true
        }
        if (!acc.indeterminateFillStyle && acc.fillStyle !== nodePlacer.fillStyle) {
          acc.indeterminateFillStyle = true
        }
        if (
          !acc.indeterminateHorizontalDistance &&
          acc.horizontalDistance !== nodePlacer.horizontalDistance
        ) {
          acc.indeterminateHorizontalDistance = true
        }
        if (
          !acc.indeterminateVerticalDistance &&
          acc.verticalDistance !== nodePlacer.verticalDistance
        ) {
          acc.indeterminateVerticalDistance = true
        }
        if (!acc.indeterminateHorizontal && acc.horizontal !== nodePlacer.horizontal) {
          acc.indeterminateHorizontal = true
        }
        return acc
      }, settings)
    }
    this.aspectRatio = settings.aspectRatio
    this.indeterminateAspectRatio = settings.indeterminateAspectRatio
    this.fillStyle = settings.fillStyle
    this.indeterminateFillStyle = settings.indeterminateFillStyle
    this.horizontalDistance = settings.horizontalDistance
    this.indeterminateHorizontalDistance = settings.indeterminateHorizontalDistance
    this.verticalDistance = settings.verticalDistance
    this.indeterminateVerticalDistance = settings.indeterminateVerticalDistance
    this.horizontal = settings.horizontal
    this.indeterminateHorizontal = settings.indeterminateHorizontal
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
    const aspectRatioLabel = document.getElementById('aspect-ratio-label')
    aspectRatioLabel.innerHTML = this.indeterminateAspectRatio ? '???' : this.aspectRatio

    const fillStyle = document.getElementById('fill-style')
    if (this.indeterminateFillStyle) {
      fillStyle.selectedIndex = 0
    } else {
      switch (this.fillStyle) {
        default:
        case FillStyle.JUSTIFY:
          fillStyle.selectedIndex = 1
          break
        case FillStyle.LEADING:
          fillStyle.selectedIndex = 2
          break
        case FillStyle.CENTERED:
          fillStyle.selectedIndex = 3
          break
        case FillStyle.TRAILING:
          fillStyle.selectedIndex = 4
          break
      }
    }

    const horizontalDistance = document.getElementById('aspect-ratio-horizontal-distance')
    horizontalDistance.value = this.horizontalDistance
    const horizontalDistanceLabel = document.getElementById(
      'aspect-ratio-horizontal-distance-label'
    )
    horizontalDistanceLabel.innerHTML = this.indeterminateVerticalDistance
      ? '???'
      : this.horizontalDistance

    const verticalDistance = document.getElementById('aspect-ratio-vertical-distance')
    verticalDistance.value = this.verticalDistance
    const verticalDistanceLabel = document.getElementById('aspect-ratio-vertical-distance-label')
    verticalDistanceLabel.innerHTML = this.indeterminateVerticalDistance
      ? '???'
      : this.verticalDistance

    const horizontal = document.getElementById('horizontal')
    horizontal.checked = this.horizontal
    horizontal.indeterminate = this.indeterminateHorizontal
  }

  bindActions(panel) {
    const aspectRatio = document.getElementById('aspect-ratio')
    aspectRatio.addEventListener('change', () => {
      this.aspectRatio = aspectRatio.value
      this.indeterminateAspectRatio = false
      panel.panelChanged()
    })
    const aspectRatioLabel = document.getElementById('aspect-ratio-label')
    aspectRatio.addEventListener('input', () => {
      aspectRatioLabel.innerHTML = aspectRatio.value
    })

    const fillStyle = document.getElementById('fill-style')
    fillStyle.addEventListener('change', () => {
      switch (fillStyle.selectedIndex) {
        default:
        case 1:
          this.fillStyle = FillStyle.JUSTIFY
          break
        case 2:
          this.fillStyle = FillStyle.LEADING
          break
        case 3:
          this.fillStyle = FillStyle.CENTERED
          break
        case 4:
          this.fillStyle = FillStyle.TRAILING
          break
      }
      this.indeterminateFillStyle = false
      panel.panelChanged()
    })

    const horizontalDistance = document.getElementById('aspect-ratio-horizontal-distance')
    horizontalDistance.addEventListener('change', () => {
      this.horizontalDistance = Number.parseInt(horizontalDistance.value)
      this.indeterminateHorizontalDistance = false
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
      this.indeterminateVerticalDistance = false
      panel.panelChanged()
    })
    const verticalDistanceLabel = document.getElementById('aspect-ratio-vertical-distance-label')
    verticalDistance.addEventListener('input', () => {
      verticalDistanceLabel.innerHTML = verticalDistance.value
    })

    const horizontal = document.getElementById('horizontal')
    horizontal.addEventListener('change', () => {
      this.horizontal = horizontal.checked
      this.indeterminateHorizontal = false
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
    this.childNodePlacer = new SimpleNodePlacer()
    this.indeterminateChildNodePlacer = false
  }

  createNodePlacer() {
    const nodePlacer = new AssistantNodePlacer()
    nodePlacer.spacing = this.spacing
    nodePlacer.childNodePlacer = this.childNodePlacer
    return nodePlacer
  }

  updateNodePlacers(selectedNodes, nodePlacers) {
    selectedNodes.forEach(selectedNode => {
      const nodePlacer = nodePlacers.get(selectedNode)
      if (AssistantNodePlacer.isInstance(nodePlacer)) {
        if (!this.indeterminateSpacing) {
          nodePlacer.spacing = this.spacing
        }
        if (!this.indeterminateChildNodePlacer) {
          nodePlacer.childNodePlacer = this.childNodePlacer
        }
      } else {
        nodePlacers.set(selectedNode, this.createNodePlacer())
      }
    })
  }

  adoptSettings(nodePlacers) {
    super.adoptSettings(nodePlacers)

    let settings = {
      childNodePlacer: nodePlacers[0].childNodePlacer,
      indeterminateChildNodePlacer: false
    }
    if (nodePlacers.length > 1) {
      settings = nodePlacers.reduce((acc, nodePlacer) => {
        if (
          acc.indeterminateChildNodePlacer ||
          acc.childNodePlacer !== nodePlacer.childNodePlacer
        ) {
          acc.indeterminateChildNodePlacer = true
        }
        return acc
      }, settings)
    }
    this.childNodePlacer = settings.childNodePlacer
    this.indeterminateChildNodePlacer = settings.indeterminateChildNodePlacer
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
    if (this.indeterminateChildNodePlacer) {
      childNodePlacer.selectedIndex = 0
    } else if (DefaultNodePlacer.isInstance(this.childNodePlacer)) {
      childNodePlacer.selectedIndex = 1
    } else if (SimpleNodePlacer.isInstance(this.childNodePlacer)) {
      childNodePlacer.selectedIndex = 2
    } else if (BusNodePlacer.isInstance(this.childNodePlacer)) {
      childNodePlacer.selectedIndex = 3
    } else if (DoubleLineNodePlacer.isInstance(this.childNodePlacer)) {
      childNodePlacer.selectedIndex = 4
    } else if (LeftRightNodePlacer.isInstance(this.childNodePlacer)) {
      childNodePlacer.selectedIndex = 5
    } else if (AspectRatioNodePlacer.isInstance(this.childNodePlacer)) {
      childNodePlacer.selectedIndex = 6
    }
  }

  bindActions(panel) {
    super.bindActions(panel)
    const childNodePlacer = document.getElementById('child-node-placer')
    childNodePlacer.addEventListener('change', () => {
      switch (childNodePlacer.selectedIndex) {
        default:
        case 1:
          this.childNodePlacer = new DefaultNodePlacer()
          break
        case 2:
          this.childNodePlacer = new SimpleNodePlacer()
          break
        case 3:
          this.childNodePlacer = new BusNodePlacer()
          break
        case 4:
          this.childNodePlacer = new DoubleLineNodePlacer()
          break
        case 5:
          this.childNodePlacer = new LeftRightNodePlacer()
          break
        case 6:
          this.childNodePlacer = new AspectRatioNodePlacer()
          break
      }
      this.indeterminateChildNodePlacer = false
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
    this.preferredAspectRatio = 1
    this.indeterminatePreferredAspectRatio = 1
    this.verticalDistance = 40
    this.indeterminateVerticalDistance = false
    this.horizontalDistance = 40
    this.indeterminateHorizontalDistance = false
    this.minimumFirstSegmentLength = 10
    this.indeterminateMinimumFirstSegmentLength = false
    this.minimumLastSegmentLength = 10
    this.indeterminateMinimumLastSegmentLength = false
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

  updateNodePlacers(selectedNodes, nodePlacers) {
    selectedNodes.forEach(selectedNode => {
      const nodePlacer = nodePlacers.get(selectedNode)
      if (CompactNodePlacer.isInstance(nodePlacer)) {
        if (!this.indeterminatePreferredAspectRatio) {
          nodePlacer.preferredAspectRatio = this.preferredAspectRatio
        }
        if (!this.indeterminateVerticalDistance) {
          nodePlacer.verticalDistance = this.verticalDistance
        }
        if (!this.indeterminateHorizontalDistance) {
          nodePlacer.horizontalDistance = this.horizontalDistance
        }
        if (!this.indeterminateMinimumFirstSegmentLength) {
          nodePlacer.minimumFirstSegmentLength = this.minimumFirstSegmentLength
        }
        if (!this.indeterminateMinimumLastSegmentLength) {
          nodePlacer.minimumLastSegmentLength = this.minimumLastSegmentLength
        }
      } else {
        nodePlacers.set(selectedNode, this.createNodePlacer())
      }
    })
  }

  adoptSettings(nodePlacers) {
    let settings = {
      preferredAspectRatio: nodePlacers[0].preferredAspectRatio,
      indeterminatePreferredAspectRatio: false,
      verticalDistance: nodePlacers[0].verticalDistance,
      indeterminateVerticalDistance: false,
      horizontalDistance: nodePlacers[0].horizontalDistance,
      indeterminateHorizontalDistance: false,
      minimumFirstSegmentLength: nodePlacers[0].minimumFirstSegmentLength,
      indeterminateMinimumFirstSegmentLength: false,
      minimumLastSegmentLength: nodePlacers[0].minimumLastSegmentLength,
      indeterminateMinimumLastSegmentLength: false
    }
    if (nodePlacers.length > 1) {
      settings = nodePlacers.reduce((acc, nodePlacer) => {
        if (
          acc.indeterminatePreferredAspectRatio ||
          acc.preferredAspectRatio !== nodePlacer.preferredAspectRatio
        ) {
          acc.indeterminatePreferredAspectRatio = true
        }
        if (
          acc.indeterminateVerticalDistance ||
          acc.verticalDistance !== nodePlacer.verticalDistance
        ) {
          acc.indeterminateVerticalDistance = true
        }
        if (
          acc.indeterminateHorizontalDistance ||
          acc.horizontalDistance !== nodePlacer.horizontalDistance
        ) {
          acc.indeterminateHorizontalDistance = true
        }
        if (
          acc.indeterminateMinimumFirstSegmentLength ||
          acc.minimumFirstSegmentLength !== nodePlacer.minimumFirstSegmentLength
        ) {
          acc.indeterminateMinimumFirstSegmentLength = true
        }
        if (
          acc.indeterminateMinimumLastSegmentLength ||
          acc.minimumLastSegmentLength !== nodePlacer.minimumLastSegmentLength
        ) {
          acc.indeterminateMinimumLastSegmentLength = true
        }
        return acc
      }, settings)
    }
    this.preferredAspectRatio = settings.preferredAspectRatio
    this.indeterminatePreferredAspectRatio = settings.indeterminatePreferredAspectRatio
    this.verticalDistance = settings.verticalDistance
    this.indeterminateVerticalDistance = settings.indeterminateVerticalDistance
    this.horizontalDistance = settings.horizontalDistance
    this.indeterminateHorizontalDistance = settings.indeterminateHorizontalDistance
    this.minimumFirstSegmentLength = settings.minimumFirstSegmentLength
    this.indeterminateMinimumFirstSegmentLength = settings.indeterminateMinimumFirstSegmentLength
    this.minimumLastSegmentLength = settings.minimumLastSegmentLength
    this.indeterminateMinimumLastSegmentLength = settings.indeterminateMinimumLastSegmentLength
    this.updatePanel()
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
    preferredAspectRatioLabel.innerHTML = this.indeterminatePreferredAspectRatio
      ? '???'
      : this.preferredAspectRatio

    const verticalDistance = document.getElementById('compact-vertical-distance')
    verticalDistance.value = this.verticalDistance
    const verticalDistanceLabel = document.getElementById('compact-vertical-distance-label')
    verticalDistanceLabel.innerHTML = this.indeterminateVerticalDistance
      ? '???'
      : this.verticalDistance

    const horizontalDistance = document.getElementById('compact-horizontal-distance')
    horizontalDistance.value = this.horizontalDistance
    const horizontalDistanceLabel = document.getElementById('compact-horizontal-distance-label')
    horizontalDistanceLabel.innerHTML = this.indeterminateHorizontalDistance
      ? '???'
      : this.horizontalDistance

    const minimumFirstSegmentLength = document.getElementById(
      'compact-minimum-first-segment-length'
    )
    minimumFirstSegmentLength.value = this.minimumFirstSegmentLength
    const minimumFirstSegmentLengthLabel = document.getElementById(
      'compact-minimum-first-segment-length-label'
    )
    minimumFirstSegmentLengthLabel.innerHTML = this.indeterminateMinimumFirstSegmentLength
      ? '???'
      : this.minimumFirstSegmentLength

    const minimumLastSegmentLength = document.getElementById('compact-minimum-last-segment-length')
    minimumLastSegmentLength.value = this.minimumLastSegmentLength
    const minimumLastSegmentLengthLabel = document.getElementById(
      'compact-minimum-last-segment-length-label'
    )
    minimumLastSegmentLengthLabel.innerHTML = this.indeterminateMinimumLastSegmentLength
      ? '???'
      : this.minimumLastSegmentLength
  }

  bindActions(panel) {
    const preferredAspectRatio = document.getElementById('compact-preferred-aspect-ratio')
    preferredAspectRatio.addEventListener('change', () => {
      this.preferredAspectRatio = Number.parseInt(preferredAspectRatio.value)
      this.indeterminatePreferredAspectRatio = false
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
      this.indeterminateVerticalDistance = false
      panel.panelChanged()
    })
    const verticalDistanceLabel = document.getElementById('compact-vertical-distance-label')
    verticalDistance.addEventListener('input', () => {
      verticalDistanceLabel.innerHTML = verticalDistance.value
    })

    const horizontalDistance = document.getElementById('compact-horizontal-distance')
    horizontalDistance.addEventListener('change', () => {
      this.horizontalDistance = Number.parseInt(horizontalDistance.value)
      this.indeterminateHorizontalDistance = false
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
      this.indeterminateMinimumFirstSegmentLength = false
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
      this.indeterminateMinimumLastSegmentLength = false
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

class MultipleNodePlacerConfiguration extends NodePlacerConfiguration {
  /**
   * Creates a new instance of MultipleNodePlacerConfiguration.
   * @param {Element} panel
   */
  constructor(panel) {
    super(document.getElementById('multiple-node-placer-settings'), null, panel)
  }

  get hasPreview() {
    return false
  }

  createNodePlacer() {
    return null
  }

  getDescriptionText() {
    return (
      '<h2>Multiple Values</h2>' +
      'You have selected nodes with different <code>NodePlacer</code>s. To assign the same ' +
      '<code>NodePlacer</code> to all of these nodes, choose one form the selection box.'
    )
  }
}
