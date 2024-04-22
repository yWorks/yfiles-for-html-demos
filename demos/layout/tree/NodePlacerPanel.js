/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  IGraph,
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
  ShapeNodeStyle,
  SimpleNodePlacer,
  Stroke,
  TreeLayout,
  TreeLayoutData,
  TreeLayoutEdgeRoutingStyle
} from 'yfiles'

import { createDemoEdgeStyle } from 'demo-resources/demo-styles'

/**
 * @typedef {Object} LayerColor
 * @property {Fill} fill
 * @property {Stroke} stroke
 */

// a list of colors that are assigned to the layers
export const LayerColors = [
  createLayerColor('#FFC914', '#998953'),
  createLayerColor('#FF6C00', '#662b00'),
  createLayerColor('#17BEBB', '#407271'),
  createLayerColor('#0B7189', '#2C4B52'),
  createLayerColor('#76B041', '#586a48'),
  createLayerColor('#67B7DC', '#617984'),
  createLayerColor('#FF6C00', '#662b00'),
  createLayerColor('#111D4A', '#1B1F2C'),
  createLayerColor('#AB2346', '#673E49'),
  createLayerColor('#621B00', '#3B621D'),
  createLayerColor('#2E282A', '#1C1A1A'),
  createLayerColor('#6771DC', '#616484'),
  createLayerColor('#242265', '#29283D'),
  createLayerColor('#DC67CE', '#846180'),
  createLayerColor('#A367DC', '#736184')
]

/**
 * @param {!string} fillColor
 * @param {!string} strokeColor
 * @returns {!LayerColor}
 */
function createLayerColor(fillColor, strokeColor) {
  return { fill: Fill.from(fillColor), stroke: new Stroke(strokeColor, 1.5) }
}

/**
 * A panel that provides access to customize the node placers for each node.
 */
export class NodePlacerPanel {
  graph

  // initialize the preview component where the node placer settings are demonstrated on a small graph
  previewComponent = new GraphComponent('previewComponent')

  // initializes change listener handling
  changeListeners = []

  // create node placer configurations
  nodePlacerConfigurations = new Map()
  currentNodePlacerConfiguration = null

  // a map which stores the specified node placer for each node
  nodePlacers = new Mapper()

  /**
   * Creates a new instance of NodePlacerPanel.
   * @param {!GraphComponent} graphComponent
   */
  constructor(graphComponent) {
    this.graphComponent = graphComponent
    this.graph = graphComponent.graph
    createPreviewGraph(this.previewComponent)
    runPreviewLayout(null, this.previewComponent)

    // connect the UI elements of this panel that are not specific for one node placer
    bindActions(this)
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
   * Updates the node placer map and preview graph.
   * This method is called when there are changes in the panel and notifies all registered change listeners.
   */
  panelChanged() {
    if (this.currentNodePlacerConfiguration) {
      this.currentNodePlacerConfiguration.updateNodePlacers(
        this.graphComponent.selection.selectedNodes,
        this.nodePlacers
      )
      const nodePlacer = this.currentNodePlacerConfiguration.createNodePlacer()
      runPreviewLayout(nodePlacer, this.previewComponent)
      this.updateChangeListeners()
    }
  }

  /**
   * Updates which node placer configuration is used in this panel and the layout of the preview graph.
   * @param {!Array.<INode>} selectedNodes
   */
  onNodeSelectionChanged(selectedNodes) {
    const noNodePlacerElement = document.querySelector('#no-node-placer-settings')
    const nodePlacerElement = document.querySelector('#select-node-placer')
    const nodePlacerLabelElement = document.querySelector('#select-node-placer-label')
    const rotationElement = document.querySelector('#rotation')
    const spacingElement = document.querySelector('#rotatable-spacing')
    const previewElement = document.querySelector('#previewComponent')

    if (this.currentNodePlacerConfiguration) {
      this.currentNodePlacerConfiguration.visible = false
    }

    if (selectedNodes.length === 0) {
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

    const nodePlacers = selectedNodes.map((node) => {
      const placer = this.nodePlacers.get(node)
      if (placer === null) {
        // make sure every node has an associated node placer in the nodePlacers-map
        const defaultNodePlacer = new DefaultNodePlacer()
        this.nodePlacers.set(node, defaultNodePlacer)
        return defaultNodePlacer
      }
      return placer
    })

    let referencePlacer = nodePlacers[0]
    const referenceConfig = getConfigurationName(referencePlacer)
    //check that all node placers are of same instance - otherwise the MultipleNodePlacerConfiguration is used
    if (!nodePlacers.every((placer) => getConfigurationName(placer) === referenceConfig)) {
      referencePlacer = null
    }
    const configurationName = getConfigurationName(referencePlacer)
    document.querySelector('#select-node-placer').value = configurationName

    const configuration = this.nodePlacerConfigurations.get(configurationName)
    configuration.adoptSettings(nodePlacers)

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

    runPreviewLayout(referencePlacer, this.previewComponent)
  }

  /**
   * Adds the given listener to the list of listeners that are notified when the node placer settings change.
   * @param {!function} listener
   */
  addChangeListener(listener) {
    this.changeListeners.push(listener)
  }

  /**
   * Removes the given listener to the list of listeners that are notified when the node placer settings change.
   * @param {!function} listener
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
    this.changeListeners.forEach((listener) => {
      listener()
    })
  }
}

/** @type {boolean} */
let layoutRunning = false

/**
 * Calculates a preview layout. This method is called when node placer settings are changed.
 * @param {?ITreeLayoutNodePlacer} nodePlacer
 * @param {!GraphComponent} graphComponent
 * @returns {!Promise}
 */
async function runPreviewLayout(nodePlacer, graphComponent) {
  if (layoutRunning) {
    return
  }
  layoutRunning = true
  const treeLayout = new TreeLayout()
  const leafNodePlacer = new LeafNodePlacer()
  const treeLayoutData = new TreeLayoutData({
    nodePlacers: (node) => {
      return graphComponent.graph.inDegree(node) ? leafNodePlacer : nodePlacer
    },
    assistantNodes: (node) => node.tag && node.tag.assistant
  })

  await graphComponent.morphLayout(treeLayout, '0.2s', treeLayoutData)
  layoutRunning = false
}

/**
 * Wires up the UI elements that are not node placer specific.
 * @param {!NodePlacerPanel} panel
 */
function bindActions(panel) {
  const selectNodePlacer = document.querySelector('#select-node-placer')
  selectNodePlacer.addEventListener('change', () => {
    if (panel.currentNodePlacerConfiguration) {
      panel.currentNodePlacerConfiguration.visible = false
    }
    panel.currentNodePlacerConfiguration = panel.nodePlacerConfigurations.get(
      selectNodePlacer.value
    )
    panel.currentNodePlacerConfiguration.visible = true
    const defaultPlacer = panel.currentNodePlacerConfiguration.getDefaultNodePlacer()
    if (defaultPlacer) {
      panel.currentNodePlacerConfiguration.adoptSettings([defaultPlacer])
    }

    const rotationElement = document.querySelector('#rotation')
    const spacingElement = document.querySelector('#rotatable-spacing')
    if (panel.currentNodePlacerConfiguration.rotatable) {
      rotationElement.style.display = 'block'
      spacingElement.style.display = 'block'
    } else {
      rotationElement.style.display = 'none'
      spacingElement.style.display = 'none'
    }
    panel.panelChanged()
  })

  const rotationLeft = document.querySelector('#rotation-left')
  rotationLeft.addEventListener('click', () => {
    panel.graphComponent.selection.selectedNodes.forEach((node) => {
      updateModificationMatrix(node, RotatableNodePlacerMatrix.ROT90, panel)
    })
    panel.updateChangeListeners()
  })

  const rotationRight = document.querySelector('#rotation-right')
  rotationRight.addEventListener('click', () => {
    panel.graphComponent.selection.selectedNodes.forEach((node) => {
      updateModificationMatrix(node, RotatableNodePlacerMatrix.ROT270, panel)
    })
    panel.updateChangeListeners()
  })

  const mirrorHorizontal = document.querySelector('#mirror-horizontal')
  mirrorHorizontal.addEventListener('click', () => {
    panel.graphComponent.selection.selectedNodes.forEach((node) => {
      updateModificationMatrix(node, RotatableNodePlacerMatrix.MIR_HOR, panel)
    })
    panel.updateChangeListeners()
  })

  const mirrorVertical = document.querySelector('#mirror-vertical')
  mirrorVertical.addEventListener('click', () => {
    panel.graphComponent.selection.selectedNodes.forEach((node) => {
      updateModificationMatrix(node, RotatableNodePlacerMatrix.MIR_VERT, panel)
    })
    panel.updateChangeListeners()
  })
}

/**
 * Updates the rotation matrix for RotatableNodePlacers.
 * It is necessary to create a new instance of the node placer because modificationMatrix is a
 * readonly property.
 * @param {!INode} node
 * @param {!RotatableNodePlacerMatrix} matrix
 * @param {!NodePlacerPanel} panel
 */
function updateModificationMatrix(node, matrix, panel) {
  const nodePlacer = panel.nodePlacers.get(node)
  let rotatedNodePlacer = nodePlacer
  if (nodePlacer instanceof AssistantNodePlacer) {
    rotatedNodePlacer = new AssistantNodePlacer({
      spacing: nodePlacer.spacing,
      modificationMatrix: nodePlacer.modificationMatrix.multiply(matrix),
      childNodePlacer: nodePlacer.childNodePlacer
    })
  } else if (nodePlacer instanceof BusNodePlacer) {
    rotatedNodePlacer = new BusNodePlacer({
      spacing: nodePlacer.spacing,
      modificationMatrix: nodePlacer.modificationMatrix.multiply(matrix)
    })
  } else if (nodePlacer instanceof DoubleLineNodePlacer) {
    rotatedNodePlacer = new DoubleLineNodePlacer({
      spacing: nodePlacer.spacing,
      modificationMatrix: nodePlacer.modificationMatrix.multiply(matrix),
      rootAlignment: nodePlacer.rootAlignment,
      doubleLineSpacingRatio: nodePlacer.doubleLineSpacingRatio
    })
  } else if (nodePlacer instanceof GridNodePlacer) {
    rotatedNodePlacer = new GridNodePlacer({
      modificationMatrix: nodePlacer.modificationMatrix.multiply(matrix),
      rootAlignment: nodePlacer.rootAlignment,
      spacing: nodePlacer.spacing
    })
  } else if (nodePlacer instanceof LeftRightNodePlacer) {
    rotatedNodePlacer = new LeftRightNodePlacer({
      spacing: nodePlacer.spacing,
      modificationMatrix: nodePlacer.modificationMatrix.multiply(matrix),
      horizontalDistance: nodePlacer.horizontalDistance,
      verticalDistance: nodePlacer.verticalDistance,
      branchCount: nodePlacer.branchCount,
      placeLastOnBottom: nodePlacer.placeLastOnBottom
    })
  } else if (nodePlacer instanceof SimpleNodePlacer) {
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
 * @param {?ITreeLayoutNodePlacer} nodePlacer
 * @returns {!string}
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
  } else if (nodePlacer instanceof CompactNodePlacer) {
    return 'CompactNodePlacer'
  }
  return 'Multiple Values'
}

/**
 * Creates a small preview graph that demonstrates the node placer settings on a small sample.
 * @param {!GraphComponent} graphComponent
 */
function createPreviewGraph(graphComponent) {
  const graph = graphComponent.graph
  const rootLayerColor = LayerColors[0]
  const root = graph.createNode({
    layout: new Rect(0, 0, 60, 30),
    style: new ShapeNodeStyle({
      shape: 'round-rectangle',
      fill: rootLayerColor.fill,
      stroke: rootLayerColor.stroke
    })
  })

  graphComponent.graph.edgeDefaults.style = createDemoEdgeStyle({
    colorSetName: 'demo-palette-22'
  })
  for (let i = 0; i < 5; i++) {
    if (i > 0) {
      graph.createEdge(
        root,
        graph.createNode({
          layout: new Rect(0, 0, i < 4 ? 60 : 80, 30),
          style: new ShapeNodeStyle({
            shape: 'round-rectangle',
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
            shape: 'round-rectangle',
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
  _visible = false

  /**
   * Creates a new instance of NodePlacerConfiguration.
   * @param {!HTMLDivElement} div
   * @param {?ITreeLayoutNodePlacer} nodePlacer
   * @param {!NodePlacerPanel} panel
   */
  constructor(div, nodePlacer, panel) {
    this.div = div
    if (nodePlacer !== null) {
      this.adoptSettings([nodePlacer])
    }
    this.bindActions(panel)
    this.updatePanel()
  }

  /**
   * Returns whether or not the represented node placer is rotatable. This is used to determine if the
   * rotation/mirroring-buttons should be visible.
   * @type {boolean}
   */
  get rotatable() {
    return false
  }

  /**
   * Returns whether or not there is a preview for the layout with the represented node placer. This
   * is used to determine if the preview element should be visible.
   * @type {boolean}
   */
  get hasPreview() {
    return true
  }

  /**
   * Returns whether or not these node placer settings are currently active/visible.
   * @type {boolean}
   */
  get visible() {
    return this._visible
  }

  /**
   * Sets whether or not these node placer settings should be active/visible.
   * It also updates the description text.
   * @type {boolean}
   */
  set visible(visible) {
    this._visible = visible

    const description = document.querySelector('#node-placer-description')
    if (visible) {
      this.div.style.display = 'block'
      description.innerHTML = this.getDescriptionText()
    } else {
      this.div.style.display = 'none'
      description.innerHTML = ''
    }
  }

  /**
   * Creates a configured {@link ITreeLayoutNodePlacer} according to the current settings.
   * This method is called when the map of node placers is updated.
   * @returns {?ITreeLayoutNodePlacer}
   */
  createNodePlacer() {
    return null
  }

  /**
   * Updates the node placers of the selected nodes with the values in the panel.
   * Note that indeterminate properties in the panel should not be applied to the individual placer.
   * @param {!Iterable.<INode>} selectedNodes
   * @param {!Mapper.<INode,ITreeLayoutNodePlacer>} nodePlacers
   */
  updateNodePlacers(selectedNodes, nodePlacers) {}

  /**
   * Updates the configuration settings according to the given {@link ITreeLayoutNodePlacer}.
   * This method is called when the configuration is changed or reset.
   * @param {!Array.<ITreeLayoutNodePlacer>} nodePlacers
   */
  adoptSettings(nodePlacers) {}

  /**
   * Updates the UI after the configuration changed.
   * @see {@link NodePlacerConfiguration.adoptSettings}
   */
  updatePanel() {}

  /**
   * Wires up the UI for this configuration.
   * @param {!NodePlacerPanel} panel
   */
  bindActions(panel) {}

  /**
   * Returns the description text for this configuration.
   * @returns {!string}
   */
  getDescriptionText() {
    return ''
  }

  /**
   * Returns the node placer for this configuration with initial settings.
   * @returns {?ITreeLayoutNodePlacer}
   */
  getDefaultNodePlacer() {
    return null
  }
}

/**
 * Base class for all node placer configurations representing node placers inheriting
 * {@link RotatableNodePlacerBase}.
 * It will handle the rotation and spacing properties by default.
 */
class RotatableNodePlacerConfiguration extends NodePlacerConfiguration {
  spacing = 20
  indeterminateSpacing = false
  modificationMatrix

  /**
   * @param {!HTMLDivElement} div
   * @param {!ITreeLayoutNodePlacer} nodePlacer
   * @param {!NodePlacerPanel} panel
   */
  constructor(div, nodePlacer, panel) {
    super(div, nodePlacer, panel)
    this.modificationMatrix = RotatableNodePlacerMatrix.DEFAULT
  }

  /**
   * Returns true for all configurations based on this class.
   * @type {boolean}
   */
  get rotatable() {
    return true
  }

  /**
   * @param {!Array.<RotatableNodePlacerBase>} nodePlacers
   */
  adoptSettings(nodePlacers) {
    this.spacing = nodePlacers[0].spacing
    this.indeterminateSpacing = false
    this.modificationMatrix = nodePlacers[0].modificationMatrix

    for (const nodePlacer of nodePlacers) {
      if (this.spacing !== nodePlacer.spacing) {
        this.indeterminateSpacing = true
      }
    }

    this.updatePanel()
  }

  updatePanel() {
    updateInput('spacing', this.spacing, this.indeterminateSpacing)
  }

  /**
   * @param {!NodePlacerPanel} panel
   */
  bindActions(panel) {
    const spacingElement = document.querySelector('#spacing')
    spacingElement.addEventListener('change', () => {
      if (this.visible) {
        this.spacing = Number.parseInt(spacingElement.value)
        this.indeterminateSpacing = false
        panel.panelChanged()
      }
    })
    const spacingLabel = document.querySelector('#spacing-label')
    spacingElement.addEventListener('input', () => {
      if (this.visible) {
        spacingLabel.innerHTML = spacingElement.value
      }
    })
  }
}

class DefaultNodePlacerConfiguration extends NodePlacerConfiguration {
  childPlacement
  indeterminateChildPlacement = false
  routingStyle
  indeterminateRoutingStyle = false
  horizontalDistance = 40
  indeterminateHorizontalDistance = false
  verticalDistance = 40
  indeterminateVerticalDistance = false
  rootAlignment
  indeterminateRootAlignment = false
  minimumChannelSegmentDistance = 0
  indeterminateMinimumChannelSegmentDistance = false

  /**
   * Creates a new instance of DefaultNodePlacerConfiguration.
   * @param {!NodePlacerPanel} panel
   */
  constructor(panel) {
    super(document.querySelector('#default-node-placer-settings'), new DefaultNodePlacer(), panel)
    this.childPlacement = ChildPlacement.HORIZONTAL_DOWNWARD
    this.routingStyle = TreeLayoutEdgeRoutingStyle.FORK
    this.rootAlignment = RootAlignment.CENTER
  }

  /**
   * @returns {!DefaultNodePlacer}
   */
  createNodePlacer() {
    return new DefaultNodePlacer({
      childPlacement: this.childPlacement,
      routingStyle: this.routingStyle,
      horizontalDistance: this.horizontalDistance,
      verticalDistance: this.verticalDistance,
      minimumChannelSegmentDistance: this.minimumChannelSegmentDistance,
      rootAlignment: this.rootAlignment
    })
  }

  /**
   * @param {!Iterable.<INode>} selectedNodes
   * @param {!Mapper.<INode,ITreeLayoutNodePlacer>} nodePlacers
   */
  updateNodePlacers(selectedNodes, nodePlacers) {
    for (const selectedNode of selectedNodes) {
      const nodePlacer = nodePlacers.get(selectedNode)
      if (nodePlacer instanceof DefaultNodePlacer) {
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
    }
  }

  /**
   * @param {!Array.<DefaultNodePlacer>} nodePlacers
   */
  adoptSettings(nodePlacers) {
    this.childPlacement = nodePlacers[0].childPlacement
    this.indeterminateChildPlacement = false
    this.routingStyle = nodePlacers[0].routingStyle
    this.indeterminateRoutingStyle = false
    this.horizontalDistance = nodePlacers[0].horizontalDistance
    this.indeterminateHorizontalDistance = false
    this.verticalDistance = nodePlacers[0].verticalDistance
    this.indeterminateVerticalDistance = false
    this.minimumChannelSegmentDistance = nodePlacers[0].minimumChannelSegmentDistance
    this.indeterminateMinimumChannelSegmentDistance = false
    this.rootAlignment = nodePlacers[0].rootAlignment
    this.indeterminateRootAlignment = false

    if (nodePlacers.length > 1) {
      for (const nodePlacer of nodePlacers) {
        if (this.childPlacement !== nodePlacer.childPlacement) {
          this.indeterminateChildPlacement = true
        }
        if (this.routingStyle !== nodePlacer.routingStyle) {
          this.indeterminateRoutingStyle = true
        }
        if (this.horizontalDistance !== nodePlacer.horizontalDistance) {
          this.indeterminateHorizontalDistance = true
        }
        if (this.verticalDistance !== nodePlacer.verticalDistance) {
          this.indeterminateVerticalDistance = true
        }
        if (this.minimumChannelSegmentDistance !== nodePlacer.minimumChannelSegmentDistance) {
          this.indeterminateMinimumChannelSegmentDistance = true
        }
        if (this.rootAlignment !== nodePlacer.rootAlignment) {
          this.indeterminateRootAlignment = true
        }
      }
    }

    this.updatePanel()
  }

  updatePanel() {
    const childPlacement = document.querySelector('#select-child-placement')
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

    const routingStyle = document.querySelector('#routing-style')
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

    updateInput(
      'horizontal-distance',
      this.horizontalDistance,
      this.indeterminateHorizontalDistance
    )
    updateInput('vertical-distance', this.verticalDistance, this.indeterminateVerticalDistance)
    updateInput(
      'minimum-channel-segment-distance',
      this.minimumChannelSegmentDistance,
      this.indeterminateMinimumChannelSegmentDistance
    )

    const rootAlignment = document.querySelector('#root-alignment')
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

  /**
   * @returns {!string}
   */
  getDescriptionText() {
    return (
      '<h2>DefaultNodePlacer</h2>' +
      '<p>This node placer arranges the child nodes horizontally aligned below their root node. It offers options' +
      ' to change the orientation of the subtree, the edge routing style, and the alignment of the root node.</p>'
    )
  }

  /**
   * @param {!NodePlacerPanel} panel
   */
  bindActions(panel) {
    const childPlacement = document.querySelector('#select-child-placement')
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

    const routingStyle = document.querySelector('#routing-style')
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

    const horizontalDistance = document.querySelector('#horizontal-distance')
    horizontalDistance.addEventListener('change', () => {
      this.horizontalDistance = Number.parseInt(horizontalDistance.value)
      this.indeterminateHorizontalDistance = false
      panel.panelChanged()
    })
    const horizontalDistanceLabel = document.querySelector('#horizontal-distance-label')
    horizontalDistance.addEventListener('input', () => {
      horizontalDistanceLabel.innerHTML = horizontalDistance.value
    })

    const verticalDistance = document.querySelector('#vertical-distance')
    verticalDistance.addEventListener('change', () => {
      this.verticalDistance = Number.parseInt(verticalDistance.value)
      this.indeterminateVerticalDistance = false
      panel.panelChanged()
    })
    const verticalDistanceLabel = document.querySelector('#vertical-distance-label')
    verticalDistance.addEventListener('input', () => {
      verticalDistanceLabel.innerHTML = verticalDistance.value
    })

    const minimumChannelSegmentDistance = document.querySelector(
      '#minimum-channel-segment-distance'
    )
    minimumChannelSegmentDistance.addEventListener('change', () => {
      this.minimumChannelSegmentDistance = Number.parseInt(minimumChannelSegmentDistance.value)
      this.indeterminateMinimumChannelSegmentDistance = false
      panel.panelChanged()
    })
    const minimumChannelSegmentDistanceLabel = document.querySelector(
      '#minimum-channel-segment-distance-label'
    )
    minimumChannelSegmentDistance.addEventListener('input', () => {
      minimumChannelSegmentDistanceLabel.innerHTML = minimumChannelSegmentDistance.value
    })

    const rootAlignment = document.querySelector('#root-alignment')
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

  /**
   * @returns {!DefaultNodePlacer}
   */
  getDefaultNodePlacer() {
    return new DefaultNodePlacer()
  }
}

class SimpleNodePlacerConfiguration extends RotatableNodePlacerConfiguration {
  createBus = false
  indeterminateCreateBus = false
  rootAlignment = RootNodeAlignment.TRAILING
  indeterminateRootAlignment = false
  minimumChannelSegmentDistance = 40
  indeterminateMinimumChannelSegmentDistance = false

  /**
   * Creates a new instance of SimpleNodePlacerConfiguration.
   * @param {!NodePlacerPanel} panel
   */
  constructor(panel) {
    super(document.querySelector('#simple-node-placer-settings'), new SimpleNodePlacer(), panel)
  }

  createNodePlacer() {
    return new SimpleNodePlacer({
      createBus: this.createBus,
      rootAlignment: this.rootAlignment,
      minimumChannelSegmentDistance: this.minimumChannelSegmentDistance,
      spacing: this.spacing
    })
  }

  /**
   * @param {!Iterable.<INode>} selectedNodes
   * @param {!Mapper.<INode,ITreeLayoutNodePlacer>} nodePlacers
   */
  updateNodePlacers(selectedNodes, nodePlacers) {
    for (const selectedNode of selectedNodes) {
      const nodePlacer = nodePlacers.get(selectedNode)
      if (nodePlacer instanceof SimpleNodePlacer) {
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
    }
  }

  /**
   * @param {!Array.<SimpleNodePlacer>} nodePlacers
   */
  adoptSettings(nodePlacers) {
    super.adoptSettings(nodePlacers)

    this.createBus = nodePlacers[0].createBus
    this.indeterminateCreateBus = false
    this.rootAlignment = nodePlacers[0].rootAlignment
    this.indeterminateRootAlignment = false
    this.minimumChannelSegmentDistance = nodePlacers[0].minimumChannelSegmentDistance
    this.indeterminateMinimumChannelSegmentDistance = false

    for (const nodePlacer of nodePlacers) {
      if (this.createBus !== nodePlacer.createBus) {
        this.indeterminateCreateBus = true
      }
      if (this.rootAlignment !== nodePlacer.rootAlignment) {
        this.indeterminateRootAlignment = true
      }
      if (this.minimumChannelSegmentDistance !== nodePlacer.minimumChannelSegmentDistance) {
        this.indeterminateMinimumChannelSegmentDistance = true
      }
    }

    this.updatePanel()
  }

  updatePanel() {
    super.updatePanel()
    const createBus = document.querySelector('#create-bus')
    createBus.checked = this.createBus
    createBus.indeterminate = this.indeterminateCreateBus

    const rootAlignment = document.querySelector('#simple-root-node-alignment')
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

    updateInput(
      'min-channel-segment-distance',
      this.minimumChannelSegmentDistance,
      this.indeterminateMinimumChannelSegmentDistance
    )
  }

  /**
   * @returns {!string}
   */
  getDescriptionText() {
    return (
      '<h2>SimpleNodePlacer</h2>' +
      '<p>This node placer arranges the child nodes horizontally aligned below their root node. It supports rotated' +
      'subtrees and offers options to change the alignment of the root node.</p>'
    )
  }

  /**
   * @param {!NodePlacerPanel} panel
   */
  bindActions(panel) {
    super.bindActions(panel)

    const createBus = document.querySelector('#create-bus')
    createBus.addEventListener('change', () => {
      this.createBus = createBus.checked
      this.indeterminateCreateBus = false
      panel.panelChanged()
    })

    const rootAlignment = document.querySelector('#simple-root-node-alignment')
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

    const minimumChannelSegmentDistance = document.querySelector('#min-channel-segment-distance')
    minimumChannelSegmentDistance.addEventListener('change', () => {
      this.minimumChannelSegmentDistance = Number.parseInt(minimumChannelSegmentDistance.value)
      this.indeterminateMinimumChannelSegmentDistance = false
      panel.panelChanged()
    })
    const minimumChannelSegmentDistanceLabel = document.querySelector(
      '#min-channel-segment-distance-label'
    )
    minimumChannelSegmentDistance.addEventListener('input', () => {
      minimumChannelSegmentDistanceLabel.innerHTML = minimumChannelSegmentDistance.value
    })
  }

  /**
   * @returns {!SimpleNodePlacer}
   */
  getDefaultNodePlacer() {
    return new SimpleNodePlacer()
  }
}

class BusNodePlacerConfiguration extends RotatableNodePlacerConfiguration {
  /**
   * Creates a new instance of BusNodePlacerConfiguration.
   * @param {!NodePlacerPanel} panel
   */
  constructor(panel) {
    super(document.querySelector('#bus-node-placer-settings'), new BusNodePlacer(), panel)
  }

  /**
   * @returns {!BusNodePlacer}
   */
  createNodePlacer() {
    return new BusNodePlacer({ spacing: this.spacing })
  }

  /**
   * @param {!Iterable.<INode>} selectedNodes
   * @param {!Mapper.<INode,ITreeLayoutNodePlacer>} nodePlacers
   */
  updateNodePlacers(selectedNodes, nodePlacers) {
    for (const selectedNode of selectedNodes) {
      const nodePlacer = nodePlacers.get(selectedNode)
      if (nodePlacer instanceof BusNodePlacer) {
        if (!this.indeterminateSpacing) {
          nodePlacer.spacing = this.spacing
        }
      } else {
        nodePlacers.set(selectedNode, this.createNodePlacer())
      }
    }
  }

  /**
   * @param {!Array.<RotatableNodePlacerBase>} nodePlacer
   */
  adoptSettings(nodePlacer) {
    super.adoptSettings(nodePlacer)
    this.updatePanel()
  }

  /**
   * @returns {!string}
   */
  getDescriptionText() {
    return (
      '<h2>BusNodePlacer</h2>' +
      '<p>This node placer arranges the child nodes evenly distributed in two lines to the left and right of the root node.</p>'
    )
  }

  /**
   * @returns {!BusNodePlacer}
   */
  getDefaultNodePlacer() {
    return new BusNodePlacer()
  }
}

class GridNodePlacerConfiguration extends RotatableNodePlacerConfiguration {
  rootAlignment = GridNodePlacer.BUS_ALIGNED
  indeterminateRootAlignment = false
  busPlacement = BusPlacement.LEADING
  indeterminateBusPlacement = false

  /**
   * Creates a new instance of GridNodePlacerConfiguration.
   * @param {!NodePlacerPanel} panel
   */
  constructor(panel) {
    super(document.querySelector('#grid-node-placer-settings'), new GridNodePlacer(), panel)
  }

  /**
   * @returns {!GridNodePlacer}
   */
  createNodePlacer() {
    return new GridNodePlacer({
      spacing: this.spacing,
      rootAlignment: this.rootAlignment,
      busPlacement: this.busPlacement,
      automaticRowAssignment: true
    })
  }

  /**
   * @param {!Iterable.<INode>} selectedNodes
   * @param {!Mapper.<INode,ITreeLayoutNodePlacer>} nodePlacers
   */
  updateNodePlacers(selectedNodes, nodePlacers) {
    for (const selectedNode of selectedNodes) {
      const nodePlacer = nodePlacers.get(selectedNode)
      if (nodePlacer instanceof GridNodePlacer) {
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
    }
  }

  /**
   * @param {!Array.<GridNodePlacer>} nodePlacers
   */
  adoptSettings(nodePlacers) {
    super.adoptSettings(nodePlacers)

    this.rootAlignment = nodePlacers[0].rootAlignment
    this.indeterminateRootAlignment = false
    this.busPlacement = nodePlacers[0].busPlacement
    this.indeterminateBusPlacement = false

    for (const nodePlacer of nodePlacers) {
      if (!this.rootAlignment.equals(nodePlacer.rootAlignment)) {
        this.indeterminateRootAlignment = true
      }
      if (this.busPlacement !== nodePlacer.busPlacement) {
        this.indeterminateBusPlacement = true
      }
    }

    this.updatePanel()
  }

  /**
   * @returns {!string}
   */
  getDescriptionText() {
    return (
      '<h2>GridNodePlacer</h2>' +
      '<p>This node placer arranges the shapes of the children of a local root in a grid. It supports rotated' +
      ' subtrees and offers options to change the alignment of the root node.</p>'
    )
  }

  updatePanel() {
    super.updatePanel()

    const rootAlignment = document.querySelector('#grid-node-placer-alignment')
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

    const busPlacement = document.querySelector('#grid-node-placer-bus-placement')
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

  /**
   * @param {!NodePlacerPanel} panel
   */
  bindActions(panel) {
    super.bindActions(panel)
    const rootAlignment = document.querySelector('#grid-node-placer-alignment')
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

    const busPlacement = document.querySelector('#grid-node-placer-bus-placement')
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

  /**
   * @returns {!GridNodePlacer}
   */
  getDefaultNodePlacer() {
    return new GridNodePlacer()
  }
}

class DoubleLineNodePlacerConfiguration extends RotatableNodePlacerConfiguration {
  rootAlignment = RootNodeAlignment.CENTER
  indeterminateRootAlignment = false

  /**
   * Creates a new instance of DoubleLineNodePlacerConfiguration.
   * @param {!NodePlacerPanel} panel
   */
  constructor(panel) {
    super(
      document.querySelector('#double-line-node-placer-settings'),
      new DoubleLineNodePlacer(),
      panel
    )
  }

  /**
   * @returns {!DoubleLineNodePlacer}
   */
  createNodePlacer() {
    return new DoubleLineNodePlacer({
      spacing: this.spacing,
      rootAlignment: this.rootAlignment
    })
  }

  /**
   * @param {!Iterable.<INode>} selectedNodes
   * @param {!Mapper.<INode,ITreeLayoutNodePlacer>} nodePlacers
   */
  updateNodePlacers(selectedNodes, nodePlacers) {
    for (const selectedNode of selectedNodes) {
      const nodePlacer = nodePlacers.get(selectedNode)
      if (nodePlacer instanceof DoubleLineNodePlacer) {
        if (!this.indeterminateSpacing) {
          nodePlacer.spacing = this.spacing
        }
        if (!this.indeterminateRootAlignment) {
          nodePlacer.rootAlignment = this.rootAlignment
        }
      } else {
        nodePlacers.set(selectedNode, this.createNodePlacer())
      }
    }
  }

  /**
   * @param {!Array.<DoubleLineNodePlacer>} nodePlacers
   */
  adoptSettings(nodePlacers) {
    super.adoptSettings(nodePlacers)

    this.rootAlignment = nodePlacers[0].rootAlignment
    this.indeterminateRootAlignment = false

    if (nodePlacers.length > 1) {
      nodePlacers.forEach((nodePlacer) => {
        if (!this.rootAlignment.equals(nodePlacer.rootAlignment)) {
          this.indeterminateRootAlignment = true
        }
      })
    }

    this.updatePanel()
  }

  /**
   * @returns {!string}
   */
  getDescriptionText() {
    return (
      '<h2>DoubleLineNodePlacer</h2>' +
      '<p>This node placer arranges the child nodes staggered in two lines below their root node. It supports rotated' +
      ' subtrees and offers options to change the alignment of the root node.</p>'
    )
  }

  updatePanel() {
    super.updatePanel()

    const rootAlignment = document.querySelector('#double-line-root-node-alignment')
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

  /**
   * @param {!NodePlacerPanel} panel
   */
  bindActions(panel) {
    super.bindActions(panel)
    const rootAlignment = document.querySelector('#double-line-root-node-alignment')
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

  /**
   * @returns {!DoubleLineNodePlacer}
   */
  getDefaultNodePlacer() {
    return new DoubleLineNodePlacer()
  }
}

class LeftRightNodePlacerConfiguration extends RotatableNodePlacerConfiguration {
  branchCount = 1
  indeterminateBranchCount = false
  placeLastOnBottom = true
  indeterminatePlaceLastOnBottom = false

  /**
   * Creates a new instance of LeftRightNodePlacerConfiguration.
   * @param {!NodePlacerPanel} panel
   */
  constructor(panel) {
    super(
      document.querySelector('#left-right-node-placer-settings'),
      new LeftRightNodePlacer(),
      panel
    )
  }

  /**
   * @returns {!LeftRightNodePlacer}
   */
  createNodePlacer() {
    return new LeftRightNodePlacer({
      spacing: this.spacing,
      placeLastOnBottom: this.placeLastOnBottom,
      branchCount: this.branchCount
    })
  }

  /**
   * @param {!Iterable.<INode>} selectedNodes
   * @param {!Mapper.<INode,ITreeLayoutNodePlacer>} nodePlacers
   */
  updateNodePlacers(selectedNodes, nodePlacers) {
    for (const selectedNode of selectedNodes) {
      const nodePlacer = nodePlacers.get(selectedNode)
      if (nodePlacer instanceof LeftRightNodePlacer) {
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
    }
  }

  /**
   * @param {!Array.<LeftRightNodePlacer>} nodePlacers
   */
  adoptSettings(nodePlacers) {
    super.adoptSettings(nodePlacers)

    this.placeLastOnBottom = nodePlacers[0].placeLastOnBottom
    this.indeterminatePlaceLastOnBottom = false
    this.branchCount = nodePlacers[0].branchCount
    this.indeterminateBranchCount = false

    for (const nodePlacer of nodePlacers) {
      if (this.placeLastOnBottom !== nodePlacer.placeLastOnBottom) {
        this.indeterminatePlaceLastOnBottom = true
      }
      if (this.branchCount !== nodePlacer.branchCount) {
        this.indeterminateBranchCount = true
      }
    }

    this.updatePanel()
  }

  /**
   * @returns {!string}
   */
  getDescriptionText() {
    return (
      '<h2>LeftRightNodePlacer</h2>' +
      '<p>This node placer arranges the child nodes below their root node, left and right of the downward extending bus-like routing.</p>'
    )
  }

  updatePanel() {
    super.updatePanel()

    const lastOnBottom = document.querySelector('#last-on-bottom')
    lastOnBottom.checked = this.placeLastOnBottom
    lastOnBottom.indeterminate = this.indeterminatePlaceLastOnBottom
    updateInput('branchCount', this.branchCount, this.indeterminateBranchCount)
  }

  /**
   * @param {!NodePlacerPanel} panel
   */
  bindActions(panel) {
    super.bindActions(panel)
    const lastOnBottom = document.querySelector('#last-on-bottom')
    lastOnBottom.addEventListener('change', () => {
      this.placeLastOnBottom = lastOnBottom.checked
      this.indeterminatePlaceLastOnBottom = false
      panel.panelChanged()
    })

    const branchCount = document.querySelector('#branch-count')
    branchCount.addEventListener('change', () => {
      this.branchCount = Number.parseInt(branchCount.value)
      this.indeterminateBranchCount = false
      panel.panelChanged()
    })

    const branchCountLabel = document.querySelector('#branch-count-label')
    branchCount.addEventListener('input', () => {
      branchCountLabel.innerHTML = branchCount.value
    })
  }

  /**
   * @returns {!LeftRightNodePlacer}
   */
  getDefaultNodePlacer() {
    return new LeftRightNodePlacer()
  }
}

class AspectRatioNodePlacerConfiguration extends NodePlacerConfiguration {
  aspectRatio = 1
  indeterminateAspectRatio = false
  fillStyle = FillStyle.LEADING
  indeterminateFillStyle = false
  horizontal = false
  indeterminateHorizontal = false
  horizontalDistance = 40
  indeterminateHorizontalDistance = false
  verticalDistance = 40
  indeterminateVerticalDistance = false

  /**
   * Creates a new instance of AspectRatioNodePlacerConfiguration.
   * @param {!NodePlacerPanel} panel
   */
  constructor(panel) {
    super(
      document.querySelector('#aspect-ratio-node-placer-settings'),
      new AspectRatioNodePlacer(),
      panel
    )
  }

  /**
   * @returns {!AspectRatioNodePlacer}
   */
  createNodePlacer() {
    return new AspectRatioNodePlacer({
      aspectRatio: this.aspectRatio,
      fillStyle: this.fillStyle,
      horizontalDistance: this.horizontalDistance,
      verticalDistance: this.verticalDistance,
      horizontal: this.horizontal
    })
  }

  /**
   * @param {!Iterable.<INode>} selectedNodes
   * @param {!Mapper.<INode,ITreeLayoutNodePlacer>} nodePlacers
   */
  updateNodePlacers(selectedNodes, nodePlacers) {
    for (const selectedNode of selectedNodes) {
      const nodePlacer = nodePlacers.get(selectedNode)
      if (nodePlacer instanceof AspectRatioNodePlacer) {
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
    }
  }

  /**
   * @param {!Array.<AspectRatioNodePlacer>} nodePlacers
   */
  adoptSettings(nodePlacers) {
    this.aspectRatio = nodePlacers[0].aspectRatio
    this.indeterminateAspectRatio = false
    this.fillStyle = nodePlacers[0].fillStyle
    this.indeterminateFillStyle = false
    this.horizontalDistance = nodePlacers[0].horizontalDistance
    this.indeterminateHorizontalDistance = false
    this.verticalDistance = nodePlacers[0].verticalDistance
    this.indeterminateVerticalDistance = false
    this.horizontal = nodePlacers[0].horizontal
    this.indeterminateHorizontal = false

    for (const nodePlacer of nodePlacers) {
      if (this.aspectRatio !== nodePlacer.aspectRatio) {
        this.indeterminateAspectRatio = true
      }
      if (this.fillStyle !== nodePlacer.fillStyle) {
        this.indeterminateFillStyle = true
      }
      if (this.horizontalDistance !== nodePlacer.horizontalDistance) {
        this.indeterminateHorizontalDistance = true
      }
      if (this.verticalDistance !== nodePlacer.verticalDistance) {
        this.indeterminateVerticalDistance = true
      }
      if (this.horizontal !== nodePlacer.horizontal) {
        this.indeterminateHorizontal = true
      }
    }

    this.updatePanel()
  }

  /**
   * @returns {!string}
   */
  getDescriptionText() {
    return (
      '<h2>AspectRatioNodePlacer</h2>' +
      '<p>This node placer arranges the child nodes such that a given aspect ratio is obeyed.</p>'
    )
  }

  updatePanel() {
    updateInput('aspect-ratio', this.aspectRatio, this.indeterminateAspectRatio)

    const fillStyle = document.querySelector('#fill-style')
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

    updateInput(
      'aspect-ratio-horizontal-distance',
      this.horizontalDistance,
      this.indeterminateHorizontalDistance
    )
    updateInput(
      'aspect-ratio-vertical-distance',
      this.verticalDistance,
      this.indeterminateVerticalDistance
    )

    const horizontal = document.querySelector('#horizontal')
    horizontal.checked = this.horizontal
    horizontal.indeterminate = this.indeterminateHorizontal
  }

  /**
   * @param {!NodePlacerPanel} panel
   */
  bindActions(panel) {
    const aspectRatio = document.querySelector('#aspect-ratio')
    aspectRatio.addEventListener('change', () => {
      this.aspectRatio = parseFloat(aspectRatio.value)
      this.indeterminateAspectRatio = false
      panel.panelChanged()
    })
    const aspectRatioLabel = document.querySelector('#aspect-ratio-label')
    aspectRatio.addEventListener('input', () => {
      aspectRatioLabel.innerHTML = aspectRatio.value
    })

    const fillStyle = document.querySelector('#fill-style')
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

    const horizontalDistance = document.querySelector('#aspect-ratio-horizontal-distance')
    horizontalDistance.addEventListener('change', () => {
      this.horizontalDistance = Number.parseInt(horizontalDistance.value)
      this.indeterminateHorizontalDistance = false
      panel.panelChanged()
    })
    const horizontalDistanceLabel = document.querySelector(
      '#aspect-ratio-horizontal-distance-label'
    )
    horizontalDistance.addEventListener('input', () => {
      horizontalDistanceLabel.innerHTML = horizontalDistance.value
    })

    const verticalDistance = document.querySelector('#aspect-ratio-vertical-distance')
    verticalDistance.addEventListener('change', () => {
      this.verticalDistance = Number.parseInt(verticalDistance.value)
      this.indeterminateVerticalDistance = false
      panel.panelChanged()
    })
    const verticalDistanceLabel = document.querySelector('#aspect-ratio-vertical-distance-label')
    verticalDistance.addEventListener('input', () => {
      verticalDistanceLabel.innerHTML = verticalDistance.value
    })

    const horizontal = document.querySelector('#horizontal')
    horizontal.addEventListener('change', () => {
      this.horizontal = horizontal.checked
      this.indeterminateHorizontal = false
      panel.panelChanged()
    })
  }

  /**
   * @returns {!AspectRatioNodePlacer}
   */
  getDefaultNodePlacer() {
    return new AspectRatioNodePlacer()
  }
}

class AssistantNodePlacerConfiguration extends RotatableNodePlacerConfiguration {
  childNodePlacer = new SimpleNodePlacer()
  indeterminateChildNodePlacer = false

  /**
   * Creates a new instance of AssistantNodePlacerConfiguration.
   * @param {!NodePlacerPanel} panel
   */
  constructor(panel) {
    super(
      document.querySelector('#assistant-node-placer-settings'),
      new AssistantNodePlacer(),
      panel
    )
  }

  /**
   * @returns {!AssistantNodePlacer}
   */
  createNodePlacer() {
    return new AssistantNodePlacer({
      spacing: this.spacing,
      childNodePlacer: this.childNodePlacer
    })
  }

  /**
   * @param {!Iterable.<INode>} selectedNodes
   * @param {!Mapper.<INode,ITreeLayoutNodePlacer>} nodePlacers
   */
  updateNodePlacers(selectedNodes, nodePlacers) {
    for (const selectedNode of selectedNodes) {
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
    }
  }

  /**
   * @param {!Array.<AssistantNodePlacer>} nodePlacers
   */
  adoptSettings(nodePlacers) {
    super.adoptSettings(nodePlacers)

    this.childNodePlacer = nodePlacers[0].childNodePlacer
    this.indeterminateChildNodePlacer = false
    nodePlacers.forEach((nodePlacer) => {
      if (
        this.indeterminateChildNodePlacer ||
        this.childNodePlacer !== nodePlacer.childNodePlacer
      ) {
        this.indeterminateChildNodePlacer = true
      }
    })
    this.updatePanel()
  }

  /**
   * @returns {!string}
   */
  getDescriptionText() {
    return (
      '<h2>AssistantNodePlacer</h2>' +
      '<p>This node placer delegates to two different node placers to arrange the child nodes: Nodes that are marked' +
      ' as <code>Assistants</code> are placed using the <code>LeftRightNodePlacer</code>. The other children are arranged' +
      ' below the assistant nodes using the child node placer.</p>'
    )
  }

  updatePanel() {
    super.updatePanel()

    const childNodePlacer = document.querySelector('#child-node-placer')
    if (this.indeterminateChildNodePlacer) {
      childNodePlacer.selectedIndex = 0
    } else if (this.childNodePlacer instanceof DefaultNodePlacer) {
      childNodePlacer.selectedIndex = 1
    } else if (this.childNodePlacer instanceof SimpleNodePlacer) {
      childNodePlacer.selectedIndex = 2
    } else if (this.childNodePlacer instanceof BusNodePlacer) {
      childNodePlacer.selectedIndex = 3
    } else if (this.childNodePlacer instanceof DoubleLineNodePlacer) {
      childNodePlacer.selectedIndex = 4
    } else if (this.childNodePlacer instanceof LeftRightNodePlacer) {
      childNodePlacer.selectedIndex = 5
    } else if (this.childNodePlacer instanceof AspectRatioNodePlacer) {
      childNodePlacer.selectedIndex = 6
    }
  }

  /**
   * @param {!NodePlacerPanel} panel
   */
  bindActions(panel) {
    super.bindActions(panel)
    const childNodePlacer = document.querySelector('#child-node-placer')
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

  /**
   * @returns {!AssistantNodePlacer}
   */
  getDefaultNodePlacer() {
    return new AssistantNodePlacer()
  }
}

class CompactNodePlacerConfiguration extends NodePlacerConfiguration {
  preferredAspectRatio = 1
  indeterminatePreferredAspectRatio = false
  verticalDistance = 40
  indeterminateVerticalDistance = false
  horizontalDistance = 40
  indeterminateHorizontalDistance = false
  minimumFirstSegmentLength = 10
  indeterminateMinimumFirstSegmentLength = false
  minimumLastSegmentLength = 10
  indeterminateMinimumLastSegmentLength = false

  /**
   * Creates a new instance of AspectRatioNodePlacerConfiguration.
   * @param {!NodePlacerPanel} panel
   */
  constructor(panel) {
    super(document.querySelector('#compact-node-placer-settings'), new CompactNodePlacer(), panel)
  }

  /**
   * @returns {!CompactNodePlacer}
   */
  createNodePlacer() {
    return new CompactNodePlacer({
      preferredAspectRatio: this.preferredAspectRatio,
      verticalDistance: this.verticalDistance,
      horizontalDistance: this.horizontalDistance,
      minimumFirstSegmentLength: this.minimumFirstSegmentLength,
      minimumLastSegmentLength: this.minimumLastSegmentLength
    })
  }

  /**
   * @param {!Iterable.<INode>} selectedNodes
   * @param {!Mapper.<INode,ITreeLayoutNodePlacer>} nodePlacers
   */
  updateNodePlacers(selectedNodes, nodePlacers) {
    for (const selectedNode of selectedNodes) {
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
    }
  }

  /**
   * @param {!Array.<CompactNodePlacer>} nodePlacers
   */
  adoptSettings(nodePlacers) {
    this.preferredAspectRatio = nodePlacers[0].preferredAspectRatio
    this.indeterminatePreferredAspectRatio = false
    this.verticalDistance = nodePlacers[0].verticalDistance
    this.indeterminateVerticalDistance = false
    this.horizontalDistance = nodePlacers[0].horizontalDistance
    this.indeterminateHorizontalDistance = false
    this.minimumFirstSegmentLength = nodePlacers[0].minimumFirstSegmentLength
    this.indeterminateMinimumFirstSegmentLength = false
    this.minimumLastSegmentLength = nodePlacers[0].minimumLastSegmentLength
    this.indeterminateMinimumLastSegmentLength = false

    for (const nodePlacer of nodePlacers) {
      if (this.preferredAspectRatio !== nodePlacer.preferredAspectRatio) {
        this.indeterminatePreferredAspectRatio = true
      }
      if (this.verticalDistance !== nodePlacer.verticalDistance) {
        this.indeterminateVerticalDistance = true
      }
      if (this.horizontalDistance !== nodePlacer.horizontalDistance) {
        this.indeterminateHorizontalDistance = true
      }
      if (this.minimumFirstSegmentLength !== nodePlacer.minimumFirstSegmentLength) {
        this.indeterminateMinimumFirstSegmentLength = true
      }
      if (this.minimumLastSegmentLength !== nodePlacer.minimumLastSegmentLength) {
        this.indeterminateMinimumLastSegmentLength = true
      }
    }

    this.updatePanel()
  }

  /**
   * @returns {!string}
   */
  getDescriptionText() {
    return (
      '<h2>CompactNodePlacer</h2>' +
      '<p>This node placer uses a dynamic optimization approach that chooses a placement strategy of the children ' +
      'of the associated local root such that the overall result is compact with respect to a specified aspect ratio.</p>'
    )
  }

  updatePanel() {
    updateInput(
      'compact-preferred-aspect-ratio',
      this.preferredAspectRatio,
      this.indeterminatePreferredAspectRatio
    )
    updateInput(
      'compact-vertical-distance',
      this.verticalDistance,
      this.indeterminateVerticalDistance
    )
    updateInput(
      'compact-horizontal-distance',
      this.horizontalDistance,
      this.indeterminateHorizontalDistance
    )
    updateInput(
      'compact-minimum-first-segment-length',
      this.minimumFirstSegmentLength,
      this.indeterminateMinimumFirstSegmentLength
    )
    updateInput(
      'compact-minimum-last-segment-length',
      this.minimumLastSegmentLength,
      this.indeterminateMinimumLastSegmentLength
    )
  }

  /**
   * @param {!NodePlacerPanel} panel
   */
  bindActions(panel) {
    const preferredAspectRatio = document.querySelector('#compact-preferred-aspect-ratio')
    preferredAspectRatio.addEventListener('change', () => {
      this.preferredAspectRatio = Number.parseInt(preferredAspectRatio.value)
      this.indeterminatePreferredAspectRatio = false
      panel.panelChanged()
    })
    const preferredAspectRatioLabel = document.querySelector(
      '#compact-preferred-aspect-ratio-label'
    )
    preferredAspectRatio.addEventListener('input', () => {
      preferredAspectRatioLabel.innerHTML = preferredAspectRatio.value
    })

    const verticalDistance = document.querySelector('#compact-vertical-distance')
    verticalDistance.addEventListener('change', () => {
      this.verticalDistance = Number.parseInt(verticalDistance.value)
      this.indeterminateVerticalDistance = false
      panel.panelChanged()
    })
    const verticalDistanceLabel = document.querySelector('#compact-vertical-distance-label')
    verticalDistance.addEventListener('input', () => {
      verticalDistanceLabel.innerHTML = verticalDistance.value
    })

    const horizontalDistance = document.querySelector('#compact-horizontal-distance')
    horizontalDistance.addEventListener('change', () => {
      this.horizontalDistance = Number.parseInt(horizontalDistance.value)
      this.indeterminateHorizontalDistance = false
      panel.panelChanged()
    })
    const horizontalDistanceLabel = document.querySelector('#compact-horizontal-distance-label')
    horizontalDistance.addEventListener('input', () => {
      horizontalDistanceLabel.innerHTML = horizontalDistance.value
    })

    const minimumFirstSegmentLength = document.querySelector(
      '#compact-minimum-first-segment-length'
    )
    minimumFirstSegmentLength.addEventListener('change', () => {
      this.minimumFirstSegmentLength = Number.parseInt(minimumFirstSegmentLength.value)
      this.indeterminateMinimumFirstSegmentLength = false
      panel.panelChanged()
    })
    const minimumFirstSegmentLengthLabel = document.querySelector(
      '#compact-minimum-first-segment-length-label'
    )
    minimumFirstSegmentLength.addEventListener('input', () => {
      minimumFirstSegmentLengthLabel.innerHTML = minimumFirstSegmentLength.value
    })

    const minimumLastSegmentLength = document.querySelector('#compact-minimum-last-segment-length')
    minimumLastSegmentLength.addEventListener('change', () => {
      this.minimumLastSegmentLength = Number.parseInt(minimumLastSegmentLength.value)
      this.indeterminateMinimumLastSegmentLength = false
      panel.panelChanged()
    })
    const minimumLastSegmentLengthLabel = document.querySelector(
      '#compact-minimum-last-segment-length-label'
    )
    minimumLastSegmentLength.addEventListener('input', () => {
      minimumLastSegmentLengthLabel.innerHTML = minimumLastSegmentLength.value
    })
  }

  /**
   * @returns {!CompactNodePlacer}
   */
  getDefaultNodePlacer() {
    return new CompactNodePlacer()
  }
}

class MultipleNodePlacerConfiguration extends NodePlacerConfiguration {
  /**
   * Creates a new instance of MultipleNodePlacerConfiguration.
   * @param {!NodePlacerPanel} panel
   */
  constructor(panel) {
    super(document.querySelector('#multiple-node-placer-settings'), null, panel)
  }

  /**
   * @type {boolean}
   */
  get hasPreview() {
    return false
  }

  /**
   * @returns {?ITreeLayoutNodePlacer}
   */
  createNodePlacer() {
    return null
  }

  /**
   * @returns {!string}
   */
  getDescriptionText() {
    return (
      '<h2>Multiple Values</h2>' +
      '<p>You have selected nodes with different <code>NodePlacer</code>s. To assign the same ' +
      '<code>NodePlacer</code> to all of these nodes, choose one form the selection box.</p>'
    )
  }

  /**
   * @param {!Array.<ITreeLayoutNodePlacer>} nodePlacers
   */
  adoptSettings(nodePlacers) {}

  /**
   * @param {!NodePlacerPanel} panel
   */
  bindActions(panel) {}

  /**
   * @returns {?ITreeLayoutNodePlacer}
   */
  getDefaultNodePlacer() {
    return null
  }

  /**
   * @param {!Iterable.<INode>} selectedNodes
   * @param {!Mapper.<INode,ITreeLayoutNodePlacer>} nodePlacers
   */
  updateNodePlacers(selectedNodes, nodePlacers) {}

  updatePanel() {}
}

/**
 * Convenience function changing the value of the {HTMLInputElement} found with the given id.
 * @param {!string} elemId the element id
 * @param {number} value the new value
 * @param indeterminate whether the value is indeterminate
 * @param {boolean} [indeterminate]
 */
function updateInput(elemId, value, indeterminate) {
  const elem = document.getElementById(elemId)
  if (elem instanceof HTMLInputElement) {
    elem.value = String(value)
  }
  const labelElm = document.getElementById(elemId + '-label')
  if (labelElm !== null) {
    labelElm.innerHTML = indeterminate ? '???' : String(value)
  }
}
