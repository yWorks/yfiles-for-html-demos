/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
  AspectRatioChildAlignmentPolicy,
  AspectRatioSubtreePlacer,
  AssistantSubtreePlacer,
  BusPlacement,
  BusSubtreePlacer,
  ChildArrangementPolicy,
  CompactSubtreePlacer,
  DoubleLayerSubtreePlacer,
  Fill,
  GraphComponent,
  LayoutExecutor,
  LeftRightSubtreePlacer,
  Mapper,
  MultiLayerSubtreePlacer,
  MultiLayerSubtreePlacerRootAlignment,
  Rect,
  ShapeNodeStyle,
  SingleLayerSubtreePlacer,
  SingleLayerSubtreePlacerRootAlignment,
  SingleLayerSubtreePlacerRoutingStyle,
  Stroke,
  SubtreeRootAlignment,
  SubtreeTransform,
  TreeLayout,
  TreeLayoutData
} from '@yfiles/yfiles'

import { createDemoEdgeStyle } from '@yfiles/demo-app/demo-styles'

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

function createLayerColor(fillColor, strokeColor) {
  return { fill: Fill.from(fillColor), stroke: new Stroke(strokeColor, 1.5) }
}

/**
 * A panel that provides access to customize the subtree placers for each node.
 */
export class SubtreePlacerPanel {
  graphComponent
  graph

  // initialize the preview component where the subtree placer settings are demonstrated on a small graph
  previewComponent = new GraphComponent('previewComponent')

  // initializes change listener handling
  changeListeners = []

  // create subtree placer configurations
  subtreePlacerConfigurations = new Map()
  currentSubtreePlacerConfiguration = null

  // a map which stores the specified subtree placer for each node
  subtreePlacers = new Mapper()

  /**
   * Creates a new instance of {@link SubtreePlacerPanel}.
   */
  constructor(graphComponent) {
    this.graphComponent = graphComponent
    this.graph = graphComponent.graph
    createPreviewGraph(this.previewComponent)

    // connect the UI elements of this panel that are not specific for one subtree placer
    bindActions(this)
    this.subtreePlacerConfigurations.set(
      'SingleLayerSubtreePlacer',
      new SingleLayerSubtreePlacerConfiguration(this)
    )
    this.subtreePlacerConfigurations.set(
      'BusSubtreePlacer',
      new BusSubtreePlacerConfiguration(this)
    )
    this.subtreePlacerConfigurations.set(
      'MultiLayerSubtreePlacer',
      new MultiLayerSubtreePlacerConfiguration(this)
    )
    this.subtreePlacerConfigurations.set(
      'DoubleLayerSubtreePlacer',
      new DoubleLayerSubtreePlacerConfiguration(this)
    )
    this.subtreePlacerConfigurations.set(
      'LeftRightSubtreePlacer',
      new LeftRightSubtreePlacerConfiguration(this)
    )
    this.subtreePlacerConfigurations.set(
      'AspectRatioSubtreePlacer',
      new AspectRatioSubtreePlacerConfiguration(this)
    )
    this.subtreePlacerConfigurations.set(
      'AssistantSubtreePlacer',
      new AssistantSubtreePlacerConfiguration(this)
    )
    this.subtreePlacerConfigurations.set(
      'CompactSubtreePlacer',
      new CompactSubtreePlacerConfiguration(this)
    )
    this.subtreePlacerConfigurations.set(
      'Multiple Values',
      new MultipleSubtreePlacerConfiguration(this)
    )
  }

  /**
   * Updates the subtree placer map and preview graph.
   * This method is called when there are changes in the panel and notifies all registered change listeners.
   */
  async panelChanged() {
    if (this.currentSubtreePlacerConfiguration) {
      this.currentSubtreePlacerConfiguration.updateSubtreePlacers(
        this.graphComponent.selection.nodes,
        this.subtreePlacers
      )
      const subtreePlacer = this.currentSubtreePlacerConfiguration.createSubtreePlacer()
      await runPreviewLayout(subtreePlacer, this.previewComponent)
      this.updateChangeListeners()
    }
  }

  /**
   * Updates which subtree placer configuration is used in this panel and the layout of the preview graph.
   */
  async onNodeSelectionChanged(selectedNodes) {
    const noSubtreePlacerElement = document.querySelector('#no-subtree-placer-settings')
    const subtreePlacerElement = document.querySelector('#select-subtree-placer')
    const subtreePlacerLabelElement = document.querySelector('#select-subtree-placer-label')
    const rotationElement = document.querySelector('#rotation')
    const spacingElement = document.querySelector('#rotatable-spacing')
    const previewElement = document.querySelector('#previewComponent')

    if (this.currentSubtreePlacerConfiguration) {
      this.currentSubtreePlacerConfiguration.visible = false
    }

    if (selectedNodes.length === 0) {
      noSubtreePlacerElement.style.display = 'block'
      subtreePlacerElement.style.display = 'none'
      subtreePlacerLabelElement.style.display = 'none'
      rotationElement.style.display = 'none'
      spacingElement.style.display = 'none'
      previewElement.style.visibility = 'hidden'
      return
    } else {
      noSubtreePlacerElement.style.display = 'none'
      subtreePlacerElement.style.display = 'inline-block'
      subtreePlacerLabelElement.style.display = 'inline-block'
      previewElement.style.visibility = 'visible'
    }

    const subtreePlacers = selectedNodes.map((node) => {
      const placer = this.subtreePlacers.get(node)
      if (placer === null) {
        // make sure every node has an associated subtree placer in the subtreePlacers-map
        const singleLayerSubtreePlacer = new SingleLayerSubtreePlacer()
        this.subtreePlacers.set(node, singleLayerSubtreePlacer)
        return singleLayerSubtreePlacer
      }
      return placer
    })

    let referencePlacer = subtreePlacers[0]
    const referenceConfig = getConfigurationName(referencePlacer)
    //check that all subtree placers are of same instance - otherwise the MultipleSubtreePlacerConfiguration is used
    if (!subtreePlacers.every((placer) => getConfigurationName(placer) === referenceConfig)) {
      referencePlacer = null
    }
    const configurationName = getConfigurationName(referencePlacer)
    document.querySelector('#select-subtree-placer').value = configurationName

    const configuration = this.subtreePlacerConfigurations.get(configurationName)
    configuration.adoptSettings(subtreePlacers)

    if (this.currentSubtreePlacerConfiguration) {
      this.currentSubtreePlacerConfiguration.visible = false
    }
    this.currentSubtreePlacerConfiguration = configuration

    if (this.currentSubtreePlacerConfiguration) {
      this.currentSubtreePlacerConfiguration.visible = true

      if (configuration.rotatable) {
        rotationElement.style.display = 'block'
        spacingElement.style.display = 'block'
      } else {
        rotationElement.style.display = 'none'
        spacingElement.style.display = 'none'
      }

      previewElement.style.visibility = configuration.hasPreview ? 'visible' : 'hidden'

      this.currentSubtreePlacerConfiguration.updatePanel()

      // request some time to make sure that the panel has the correct size before starting the
      requestAnimationFrame(() =>
        requestAnimationFrame(
          async () => await runPreviewLayout(referencePlacer, this.previewComponent)
        )
      )
    }
  }

  /**
   * Adds the given listener to the list of listeners that are notified when the subtree placer settings change.
   */
  setChangeListener(listener) {
    this.changeListeners.push(listener)
  }

  /**
   * Removes the given listener to the list of listeners that are notified when the subtree placer settings change.
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

let layoutRunning = false

/**
 * Calculates a preview layout. This method is called when subtree placer settings are changed.
 */
async function runPreviewLayout(subtreePlacer, graphComponent) {
  if (layoutRunning) {
    return
  }
  layoutRunning = true
  const treeLayout = new TreeLayout()
  const treeLayoutData = new TreeLayoutData({
    subtreePlacers: subtreePlacer ?? new SingleLayerSubtreePlacer(),
    assistantNodes: (node) => node.tag && node.tag.assistant
  })

  // Ensure that the LayoutExecutor class is not removed by build optimizers
  // It is needed for the 'applyLayoutAnimated' method in this demo.
  LayoutExecutor.ensure()

  await graphComponent.applyLayoutAnimated(treeLayout, '0.2s', treeLayoutData)
  layoutRunning = false
}

/**
 * Wires up the UI elements that are not subtree placer specific.
 */
function bindActions(panel) {
  const selectSubtreePlacer = document.querySelector('#select-subtree-placer')
  selectSubtreePlacer.addEventListener('change', async () => {
    if (panel.currentSubtreePlacerConfiguration) {
      panel.currentSubtreePlacerConfiguration.visible = false
    }
    panel.currentSubtreePlacerConfiguration =
      panel.subtreePlacerConfigurations.get(selectSubtreePlacer.value) ?? null

    if (panel.currentSubtreePlacerConfiguration) {
      panel.currentSubtreePlacerConfiguration.visible = true
      const defaultPlacer = panel.currentSubtreePlacerConfiguration.getDefaultSubtreePlacer()
      if (defaultPlacer) {
        panel.currentSubtreePlacerConfiguration.adoptSettings([defaultPlacer])
      }

      const rotationElement = document.querySelector('#rotation')
      const spacingElement = document.querySelector('#rotatable-spacing')
      if (panel.currentSubtreePlacerConfiguration.rotatable) {
        rotationElement.style.display = 'block'
        spacingElement.style.display = 'block'
      } else {
        rotationElement.style.display = 'none'
        spacingElement.style.display = 'none'
      }
      await panel.panelChanged()
    }
  })

  const rotationLeft = document.querySelector('#rotation-left')
  rotationLeft.addEventListener('click', () => {
    panel.graphComponent.selection.nodes.forEach((node) => {
      updateTransformation(node, SubtreeTransform.ROTATE_LEFT, panel)
    })
    panel.updateChangeListeners()
  })

  const rotationRight = document.querySelector('#rotation-right')
  rotationRight.addEventListener('click', () => {
    panel.graphComponent.selection.nodes.forEach((node) => {
      updateTransformation(node, SubtreeTransform.ROTATE_RIGHT, panel)
    })
    panel.updateChangeListeners()
  })

  const mirrorHorizontal = document.querySelector('#mirror-horizontal')
  mirrorHorizontal.addEventListener('click', () => {
    panel.graphComponent.selection.nodes.forEach((node) => {
      updateTransformation(node, SubtreeTransform.FLIP_Y, panel)
    })
    panel.updateChangeListeners()
  })

  const mirrorVertical = document.querySelector('#mirror-vertical')
  mirrorVertical.addEventListener('click', () => {
    panel.graphComponent.selection.nodes.forEach((node) => {
      updateTransformation(node, SubtreeTransform.FLIP_X, panel)
    })
    panel.updateChangeListeners()
  })
}

/**
 * Updates the transformation for subtree placers that support rotation.
 */
function updateTransformation(node, transform, panel) {
  const rotatedSubtreePlacer = panel.subtreePlacers.get(node)
  if (
    rotatedSubtreePlacer instanceof SingleLayerSubtreePlacer ||
    rotatedSubtreePlacer instanceof AssistantSubtreePlacer ||
    rotatedSubtreePlacer instanceof BusSubtreePlacer ||
    rotatedSubtreePlacer instanceof DoubleLayerSubtreePlacer ||
    rotatedSubtreePlacer instanceof MultiLayerSubtreePlacer ||
    rotatedSubtreePlacer instanceof LeftRightSubtreePlacer
  ) {
    switch (rotatedSubtreePlacer.transformation) {
      case SubtreeTransform.NONE:
        rotatedSubtreePlacer.transformation = transform
        break
      case SubtreeTransform.ROTATE_RIGHT:
        switch (transform) {
          case SubtreeTransform.ROTATE_RIGHT:
            rotatedSubtreePlacer.transformation = SubtreeTransform.ROTATE_180
            break
          case SubtreeTransform.ROTATE_LEFT:
            rotatedSubtreePlacer.transformation = SubtreeTransform.NONE
            break
          case SubtreeTransform.FLIP_Y:
            rotatedSubtreePlacer.transformation = SubtreeTransform.ROTATE_RIGHT_FLIP_Y
            break
          case SubtreeTransform.FLIP_X:
            rotatedSubtreePlacer.transformation = SubtreeTransform.ROTATE_LEFT_FLIP_Y
        }
        break
      case SubtreeTransform.ROTATE_LEFT:
        switch (transform) {
          case SubtreeTransform.ROTATE_RIGHT:
            rotatedSubtreePlacer.transformation = SubtreeTransform.NONE
            break
          case SubtreeTransform.ROTATE_LEFT:
            rotatedSubtreePlacer.transformation = SubtreeTransform.ROTATE_180
            break
          case SubtreeTransform.FLIP_Y:
            rotatedSubtreePlacer.transformation = SubtreeTransform.ROTATE_LEFT_FLIP_Y
            break
          case SubtreeTransform.FLIP_X:
            rotatedSubtreePlacer.transformation = SubtreeTransform.ROTATE_RIGHT_FLIP_Y
        }
        break
      case SubtreeTransform.ROTATE_180:
        switch (transform) {
          case SubtreeTransform.ROTATE_RIGHT:
            rotatedSubtreePlacer.transformation = SubtreeTransform.ROTATE_LEFT
            break
          case SubtreeTransform.ROTATE_LEFT:
            rotatedSubtreePlacer.transformation = SubtreeTransform.ROTATE_RIGHT
            break
          case SubtreeTransform.FLIP_Y:
            rotatedSubtreePlacer.transformation = SubtreeTransform.FLIP_X
            break
          case SubtreeTransform.FLIP_X:
            rotatedSubtreePlacer.transformation = SubtreeTransform.FLIP_Y
        }
        break
      case SubtreeTransform.FLIP_Y:
        switch (transform) {
          case SubtreeTransform.ROTATE_RIGHT:
            rotatedSubtreePlacer.transformation = SubtreeTransform.ROTATE_LEFT_FLIP_Y
            break
          case SubtreeTransform.ROTATE_LEFT:
            rotatedSubtreePlacer.transformation = SubtreeTransform.ROTATE_RIGHT_FLIP_Y
            break
          case SubtreeTransform.FLIP_Y:
            rotatedSubtreePlacer.transformation = SubtreeTransform.NONE
            break
          case SubtreeTransform.FLIP_X:
            rotatedSubtreePlacer.transformation = SubtreeTransform.ROTATE_180
        }
        break
      case SubtreeTransform.FLIP_X:
        switch (transform) {
          case SubtreeTransform.ROTATE_RIGHT:
            rotatedSubtreePlacer.transformation = SubtreeTransform.ROTATE_RIGHT_FLIP_Y
            break
          case SubtreeTransform.ROTATE_LEFT:
            rotatedSubtreePlacer.transformation = SubtreeTransform.ROTATE_LEFT_FLIP_Y
            break
          case SubtreeTransform.FLIP_Y:
            rotatedSubtreePlacer.transformation = SubtreeTransform.ROTATE_180
            break
          case SubtreeTransform.FLIP_X:
            rotatedSubtreePlacer.transformation = SubtreeTransform.NONE
        }
        break
      case SubtreeTransform.ROTATE_LEFT_FLIP_Y:
        switch (transform) {
          case SubtreeTransform.ROTATE_RIGHT:
            rotatedSubtreePlacer.transformation = SubtreeTransform.FLIP_X
            break
          case SubtreeTransform.ROTATE_LEFT:
            rotatedSubtreePlacer.transformation = SubtreeTransform.FLIP_Y
            break
          case SubtreeTransform.FLIP_Y:
            rotatedSubtreePlacer.transformation = SubtreeTransform.ROTATE_LEFT
            break
          case SubtreeTransform.FLIP_X:
            rotatedSubtreePlacer.transformation = SubtreeTransform.ROTATE_RIGHT
            break
        }
        break
      case SubtreeTransform.ROTATE_RIGHT_FLIP_Y:
        switch (transform) {
          case SubtreeTransform.ROTATE_RIGHT:
            rotatedSubtreePlacer.transformation = SubtreeTransform.FLIP_Y
            break
          case SubtreeTransform.ROTATE_LEFT:
            rotatedSubtreePlacer.transformation = SubtreeTransform.FLIP_X
            break
          case SubtreeTransform.FLIP_Y:
            rotatedSubtreePlacer.transformation = SubtreeTransform.ROTATE_RIGHT
            break
          case SubtreeTransform.FLIP_X:
            rotatedSubtreePlacer.transformation = SubtreeTransform.ROTATE_LEFT
        }
        break
      default:
        throw new Error('Invalid original transformation')
    }
  }
  panel.subtreePlacers.set(node, rotatedSubtreePlacer)
}

/**
 * Returns the configuration name to retrieve the correct configuration for the given subtree placer.
 */
function getConfigurationName(subtreePlacer) {
  if (subtreePlacer instanceof SingleLayerSubtreePlacer) {
    return 'SingleLayerSubtreePlacer'
  } else if (subtreePlacer instanceof BusSubtreePlacer) {
    return 'BusSubtreePlacer'
  } else if (subtreePlacer instanceof DoubleLayerSubtreePlacer) {
    return 'DoubleLayerSubtreePlacer'
  } else if (subtreePlacer instanceof MultiLayerSubtreePlacer) {
    return 'MultiLayerSubtreePlacer'
  } else if (subtreePlacer instanceof LeftRightSubtreePlacer) {
    return 'LeftRightSubtreePlacer'
  } else if (subtreePlacer instanceof AspectRatioSubtreePlacer) {
    return 'AspectRatioSubtreePlacer'
  } else if (subtreePlacer instanceof AssistantSubtreePlacer) {
    return 'AssistantSubtreePlacer'
  } else if (subtreePlacer instanceof CompactSubtreePlacer) {
    return 'CompactSubtreePlacer'
  }
  return 'Multiple Values'
}

/**
 * Creates a small preview graph that demonstrates the subtree placer settings on a small sample.
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

  graphComponent.graph.edgeDefaults.style = createDemoEdgeStyle({ colorSetName: 'demo-palette-22' })
  for (let i = 0; i < 5; i++) {
    if (i > 0) {
      graph.createEdge(
        root,
        graph.createNode({
          layout: new Rect(0, 0, i < 4 ? 60 : 80, 30),
          style: new ShapeNodeStyle({ shape: 'round-rectangle', fill: 'gray', stroke: 'white' })
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
 * Base class for a subtree placer configuration. It provides methods to retrieve a configured
 * {@link ISubtreePlacer} and manages the user input.
 */
class SubtreePlacerConfiguration {
  div
  _visible = false

  /**
   * Creates a new instance of {@link SubtreePlacerConfiguration}.
   */
  constructor(div, subtreePlacer, panel) {
    this.div = div
    if (subtreePlacer !== null) {
      this.adoptSettings([subtreePlacer])
    }
    this.bindActions(panel)
    this.updatePanel()
  }

  /**
   * Returns whether the represented subtree placer is rotatable. This is used to determine if the
   * rotation/mirroring-buttons should be visible.
   */
  get rotatable() {
    return false
  }

  /**
   * Returns whether there is a preview for the layout with the represented subtree placer. This
   * is used to determine if the preview element should be visible.
   */
  get hasPreview() {
    return true
  }

  /**
   * Returns whether these subtree placer settings are currently active/visible.
   */
  get visible() {
    return this._visible
  }

  /**
   * Sets whether these subtree placer settings should be active/visible.
   * It also updates the description text.
   */
  set visible(visible) {
    this._visible = visible

    const description = document.querySelector('#subtree-placer-description')
    if (visible) {
      this.div.style.display = 'block'
      description.innerHTML = this.getDescriptionText()
    } else {
      this.div.style.display = 'none'
      description.innerHTML = ''
    }
  }

  /**
   * Creates a configured {@link ISubtreePlacer} according to the current settings.
   * This method is called when the map of subtree placers is updated.
   */
  createSubtreePlacer() {
    return null
  }

  /**
   * Updates the subtree placers of the selected nodes with the values in the panel.
   * Note that indeterminate properties in the panel should not be applied to the individual placer.
   */
  updateSubtreePlacers(selectedNodes, subtreePlacers) {}

  /**
   * Updates the configuration settings according to the given {@link ISubtreePlacer}.
   * This method is called when the configuration is changed or reset.
   */
  adoptSettings(subtreePlacers) {}

  /**
   * Updates the UI after the configuration changed.
   * @see {@link SubtreePlacerConfiguration.adoptSettings}
   */
  updatePanel() {}

  /**
   * Wires up the UI for this configuration.
   */
  bindActions(panel) {}

  /**
   * Returns the description text for this configuration.
   */
  getDescriptionText() {
    return ''
  }

  /**
   * Returns the subtree placer for this configuration with initial settings.
   */
  getDefaultSubtreePlacer() {
    return null
  }
}

/**
 * Base class for all subtree placer configurations representing subtree placers that support subtree
 * transformation.
 * It will handle the rotation and spacing properties by default.
 */
class RotatableSubtreePlacerConfiguration extends SubtreePlacerConfiguration {
  spacing = 20
  indeterminateSpacing = false
  subtreeTransform

  constructor(div, subtreePlacer, panel) {
    super(div, subtreePlacer, panel)
    this.subtreeTransform = SubtreeTransform.NONE
  }

  /**
   * Returns true for all configurations based on this class.
   */
  get rotatable() {
    return true
  }

  updatePanel() {
    updateInput('spacing', this.spacing, this.indeterminateSpacing)
  }

  bindActions(panel) {
    const spacingElement = document.querySelector('#spacing')
    spacingElement.addEventListener('change', async () => {
      if (this.visible) {
        this.spacing = Number.parseInt(spacingElement.value)
        this.indeterminateSpacing = false
        await panel.panelChanged()
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

class SingleLayerSubtreePlacerConfiguration extends RotatableSubtreePlacerConfiguration {
  routingStyle
  indeterminateRoutingStyle = false
  rootAlignment
  indeterminateRootAlignment = false
  minimumChannelSegmentDistance = 0
  indeterminateMinimumChannelSegmentDistance = false

  /**
   * Creates a new instance of {@link SingleLayerSubtreePlacerConfiguration}.
   */
  constructor(panel) {
    super(
      document.querySelector('#single-layer-subtree-placer-settings'),
      new SingleLayerSubtreePlacer(),
      panel
    )
    this.routingStyle = SingleLayerSubtreePlacerRoutingStyle.ORTHOGONAL
    this.rootAlignment = SingleLayerSubtreePlacerRootAlignment.CENTER
  }

  createSubtreePlacer() {
    return new SingleLayerSubtreePlacer({
      edgeRoutingStyle: this.routingStyle,
      horizontalDistance: this.spacing,
      verticalDistance: this.spacing,
      minimumChannelSegmentDistance: this.minimumChannelSegmentDistance,
      rootAlignment: this.rootAlignment
    })
  }

  updateSubtreePlacers(selectedNodes, subtreePlacers) {
    for (const selectedNode of selectedNodes) {
      const subtreePlacer = subtreePlacers.get(selectedNode)
      if (subtreePlacer instanceof SingleLayerSubtreePlacer) {
        if (!this.indeterminateRoutingStyle) {
          subtreePlacer.edgeRoutingStyle = this.routingStyle
        }
        if (!this.indeterminateSpacing) {
          subtreePlacer.horizontalDistance = this.spacing
          subtreePlacer.verticalDistance = this.spacing
        }
        if (!this.indeterminateRootAlignment) {
          subtreePlacer.rootAlignment = this.rootAlignment
        }
        if (!this.indeterminateMinimumChannelSegmentDistance) {
          subtreePlacer.minimumChannelSegmentDistance = this.minimumChannelSegmentDistance
        }
      } else {
        subtreePlacers.set(selectedNode, this.createSubtreePlacer())
      }
    }
  }

  adoptSettings(subtreePlacers) {
    this.routingStyle = subtreePlacers[0].edgeRoutingStyle
    this.indeterminateRoutingStyle = false
    this.spacing = subtreePlacers[0].horizontalDistance
    this.indeterminateSpacing = false
    this.minimumChannelSegmentDistance = subtreePlacers[0].minimumChannelSegmentDistance
    this.indeterminateMinimumChannelSegmentDistance = false
    this.rootAlignment = subtreePlacers[0].rootAlignment
    this.indeterminateRootAlignment = false

    if (subtreePlacers.length > 1) {
      for (const subtreePlacer of subtreePlacers) {
        if (this.routingStyle !== subtreePlacer.edgeRoutingStyle) {
          this.indeterminateRoutingStyle = true
        }
        if (this.spacing !== subtreePlacer.horizontalDistance) {
          this.indeterminateSpacing = true
        }
        if (this.minimumChannelSegmentDistance !== subtreePlacer.minimumChannelSegmentDistance) {
          this.indeterminateMinimumChannelSegmentDistance = true
        }
        if (this.rootAlignment !== subtreePlacer.rootAlignment) {
          this.indeterminateRootAlignment = true
        }
      }
    }

    this.updatePanel()
  }

  updatePanel() {
    super.updatePanel()

    const routingStyle = document.querySelector('#routing-style')
    if (this.indeterminateRoutingStyle) {
      routingStyle.selectedIndex = 0
    } else {
      switch (this.routingStyle) {
        default:
        case SingleLayerSubtreePlacerRoutingStyle.ORTHOGONAL:
          routingStyle.selectedIndex = 1
          break
        case SingleLayerSubtreePlacerRoutingStyle.ORTHOGONAL_AT_ROOT:
          routingStyle.selectedIndex = 2
          break
        case SingleLayerSubtreePlacerRoutingStyle.STRAIGHT_LINE:
          routingStyle.selectedIndex = 3
          break
        case SingleLayerSubtreePlacerRoutingStyle.STRAIGHT_LINE_TO_CHILD_CONNECTOR:
          routingStyle.selectedIndex = 4
          break
      }
    }

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
        case SingleLayerSubtreePlacerRootAlignment.LEADING:
          rootAlignment.selectedIndex = 1
          break
        case SingleLayerSubtreePlacerRootAlignment.LEFT:
          rootAlignment.selectedIndex = 2
          break
        case SingleLayerSubtreePlacerRootAlignment.CENTER:
          rootAlignment.selectedIndex = 3
          break
        case SingleLayerSubtreePlacerRootAlignment.MEDIAN:
          rootAlignment.selectedIndex = 4
          break
        case SingleLayerSubtreePlacerRootAlignment.RIGHT:
          rootAlignment.selectedIndex = 5
          break
        case SingleLayerSubtreePlacerRootAlignment.TRAILING:
          rootAlignment.selectedIndex = 6
          break
        case SingleLayerSubtreePlacerRootAlignment.LEADING_ON_BUS:
          rootAlignment.selectedIndex = 7
          break
        case SingleLayerSubtreePlacerRootAlignment.TRAILING_ON_BUS:
          rootAlignment.selectedIndex = 8
          break
      }
    }
  }

  getDescriptionText() {
    return (
      '<h2>SingleLayerSubtreePlacer</h2>' +
      '<p>This subtree placer arranges the child nodes horizontally aligned below their root node. It offers options' +
      ' to change the orientation of the subtree, the edge routing style, and the alignment of the root node.</p>'
    )
  }

  bindActions(panel) {
    super.bindActions(panel)

    const routingStyle = document.querySelector('#routing-style')
    routingStyle.addEventListener('change', async () => {
      switch (routingStyle.selectedIndex) {
        default:
        case 1:
          this.routingStyle = SingleLayerSubtreePlacerRoutingStyle.ORTHOGONAL
          break
        case 2:
          this.routingStyle = SingleLayerSubtreePlacerRoutingStyle.ORTHOGONAL_AT_ROOT
          break
        case 3:
          this.routingStyle = SingleLayerSubtreePlacerRoutingStyle.STRAIGHT_LINE
          break
        case 4:
          this.routingStyle = SingleLayerSubtreePlacerRoutingStyle.STRAIGHT_LINE_TO_CHILD_CONNECTOR
          break
      }
      this.indeterminateRoutingStyle = false
      await panel.panelChanged()
    })

    const minimumChannelSegmentDistance = document.querySelector(
      '#minimum-channel-segment-distance'
    )
    minimumChannelSegmentDistance.addEventListener('change', async () => {
      this.minimumChannelSegmentDistance = Number.parseInt(minimumChannelSegmentDistance.value)
      this.indeterminateMinimumChannelSegmentDistance = false
      await panel.panelChanged()
    })
    const minimumChannelSegmentDistanceLabel = document.querySelector(
      '#minimum-channel-segment-distance-label'
    )
    minimumChannelSegmentDistance.addEventListener('input', () => {
      minimumChannelSegmentDistanceLabel.innerHTML = minimumChannelSegmentDistance.value
    })

    const rootAlignment = document.querySelector('#root-alignment')
    rootAlignment.addEventListener('change', async () => {
      switch (rootAlignment.selectedIndex) {
        default:
        case 1:
          this.rootAlignment = SingleLayerSubtreePlacerRootAlignment.LEADING
          break
        case 2:
          this.rootAlignment = SingleLayerSubtreePlacerRootAlignment.LEFT
          break
        case 3:
          this.rootAlignment = SingleLayerSubtreePlacerRootAlignment.CENTER
          break
        case 4:
          this.rootAlignment = SingleLayerSubtreePlacerRootAlignment.MEDIAN
          break
        case 5:
          this.rootAlignment = SingleLayerSubtreePlacerRootAlignment.RIGHT
          break
        case 6:
          this.rootAlignment = SingleLayerSubtreePlacerRootAlignment.TRAILING
          break
        case 7:
          this.rootAlignment = SingleLayerSubtreePlacerRootAlignment.LEADING_ON_BUS
          break
        case 8:
          this.rootAlignment = SingleLayerSubtreePlacerRootAlignment.TRAILING_ON_BUS
          break
      }
      this.indeterminateRootAlignment = false
      await panel.panelChanged()
    })
  }

  getDefaultSubtreePlacer() {
    return new SingleLayerSubtreePlacer()
  }
}

class BusSubtreePlacerConfiguration extends RotatableSubtreePlacerConfiguration {
  /**
   * Creates a new instance of BusSubtreePlacerConfiguration.
   */
  constructor(panel) {
    super(document.querySelector('#bus-subtree-placer-settings'), new BusSubtreePlacer(), panel)
  }

  createSubtreePlacer() {
    return new BusSubtreePlacer({ spacing: this.spacing })
  }

  updateSubtreePlacers(selectedNodes, subtreePlacers) {
    for (const selectedNode of selectedNodes) {
      const subtreePlacer = subtreePlacers.get(selectedNode)
      if (subtreePlacer instanceof BusSubtreePlacer) {
        if (!this.indeterminateSpacing) {
          subtreePlacer.spacing = this.spacing
        }
      } else {
        subtreePlacers.set(selectedNode, this.createSubtreePlacer())
      }
    }
  }

  adoptSettings(subtreePlacers) {
    this.spacing = subtreePlacers[0].spacing
    this.indeterminateSpacing = false
    this.subtreeTransform = subtreePlacers[0].transformation

    for (const subtreePlacer of subtreePlacers) {
      if (this.spacing !== subtreePlacer.spacing) {
        this.indeterminateSpacing = true
      }
    }

    this.updatePanel()
  }

  getDescriptionText() {
    return (
      '<h2>BusSubtreePlacer</h2>' +
      '<p>This subtree placer arranges the child nodes evenly distributed in two lines to the left and right of the root node.</p>'
    )
  }

  getDefaultSubtreePlacer() {
    return new BusSubtreePlacer()
  }
}

class MultiLayerSubtreePlacerConfiguration extends RotatableSubtreePlacerConfiguration {
  rootAlignment = MultiLayerSubtreePlacerRootAlignment.BUS_ALIGNED
  indeterminateRootAlignment = false
  busPlacement = BusPlacement.LEADING
  indeterminateBusPlacement = false

  /**
   * Creates a new instance of {@link MultiLayerSubtreePlacerConfiguration}.
   */
  constructor(panel) {
    super(
      document.querySelector('#multi-layer-subtree-placer-settings'),
      new MultiLayerSubtreePlacer(),
      panel
    )
  }

  createSubtreePlacer() {
    return new MultiLayerSubtreePlacer({
      spacing: this.spacing,
      rootAlignment: this.rootAlignment,
      busPlacement: this.busPlacement
    })
  }

  updateSubtreePlacers(selectedNodes, subtreePlacers) {
    for (const selectedNode of selectedNodes) {
      const subtreePlacer = subtreePlacers.get(selectedNode)
      if (subtreePlacer instanceof MultiLayerSubtreePlacer) {
        if (!this.indeterminateSpacing) {
          subtreePlacer.spacing = this.spacing
        }
        if (!this.indeterminateRootAlignment) {
          subtreePlacer.rootAlignment = this.rootAlignment
        }
        if (!this.indeterminateBusPlacement) {
          subtreePlacer.busPlacement = this.busPlacement
        }
      } else {
        subtreePlacers.set(selectedNode, this.createSubtreePlacer())
      }
    }
  }

  adoptSettings(subtreePlacers) {
    this.spacing = subtreePlacers[0].spacing
    this.indeterminateSpacing = false
    this.subtreeTransform = subtreePlacers[0].transformation
    this.rootAlignment = subtreePlacers[0].rootAlignment
    this.indeterminateRootAlignment = false
    this.busPlacement = subtreePlacers[0].busPlacement
    this.indeterminateBusPlacement = false

    for (const subtreePlacer of subtreePlacers) {
      if (this.spacing !== subtreePlacer.spacing) {
        this.indeterminateSpacing = true
      }
      if (this.rootAlignment !== subtreePlacer.rootAlignment) {
        this.indeterminateRootAlignment = true
      }
      if (this.busPlacement !== subtreePlacer.busPlacement) {
        this.indeterminateBusPlacement = true
      }
    }

    this.updatePanel()
  }

  getDescriptionText() {
    return (
      '<h2>MultiLayerSubtreePlacer</h2>' +
      '<p>This subtree placer arranges the shapes of the children of a local root in multiple layers. It supports rotated' +
      ' subtrees and offers options to change the alignment of the root node.</p>'
    )
  }

  updatePanel() {
    super.updatePanel()

    const rootAlignment = document.querySelector('#multi-layer-subtree-placer-alignment')
    if (this.indeterminateRootAlignment) {
      rootAlignment.selectedIndex = 0
    } else {
      switch (this.rootAlignment) {
        default:
        case MultiLayerSubtreePlacerRootAlignment.LEADING:
          rootAlignment.selectedIndex = 1
          break
        case MultiLayerSubtreePlacerRootAlignment.LEFT:
          rootAlignment.selectedIndex = 2
          break
        case MultiLayerSubtreePlacerRootAlignment.CENTER:
          rootAlignment.selectedIndex = 3
          break
        case MultiLayerSubtreePlacerRootAlignment.CENTER_OF_CHILDREN:
          rootAlignment.selectedIndex = 4
          break
        case MultiLayerSubtreePlacerRootAlignment.RIGHT:
          rootAlignment.selectedIndex = 5
          break
        case MultiLayerSubtreePlacerRootAlignment.TRAILING:
          rootAlignment.selectedIndex = 6
          break
        case MultiLayerSubtreePlacerRootAlignment.BUS_ALIGNED:
          rootAlignment.selectedIndex = 7
          break
      }
    }

    const busPlacement = document.querySelector('#multi-layer-subtree-placer-bus-placement')
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
    const rootAlignment = document.querySelector('#multi-layer-subtree-placer-alignment')
    rootAlignment.addEventListener('change', async () => {
      switch (rootAlignment.selectedIndex) {
        default:
        case 1:
          this.rootAlignment = MultiLayerSubtreePlacerRootAlignment.LEADING
          break
        case 2:
          this.rootAlignment = MultiLayerSubtreePlacerRootAlignment.LEFT
          break
        case 3:
          this.rootAlignment = MultiLayerSubtreePlacerRootAlignment.CENTER
          break
        case 4:
          this.rootAlignment = MultiLayerSubtreePlacerRootAlignment.CENTER_OF_CHILDREN
          break
        case 5:
          this.rootAlignment = MultiLayerSubtreePlacerRootAlignment.RIGHT
          break
        case 6:
          this.rootAlignment = MultiLayerSubtreePlacerRootAlignment.TRAILING
          break
        case 7:
          this.rootAlignment = MultiLayerSubtreePlacerRootAlignment.BUS_ALIGNED
          break
      }
      this.indeterminateRootAlignment = false
      await panel.panelChanged()
    })

    const busPlacement = document.querySelector('#multi-layer-subtree-placer-bus-placement')
    busPlacement.addEventListener('change', async () => {
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
      await panel.panelChanged()
    })
  }

  getDefaultSubtreePlacer() {
    return new MultiLayerSubtreePlacer()
  }
}

class DoubleLayerSubtreePlacerConfiguration extends RotatableSubtreePlacerConfiguration {
  rootAlignment = SubtreeRootAlignment.CENTER
  indeterminateRootAlignment = false

  /**
   * Creates a new instance of {@link DoubleLayerSubtreePlacerConfiguration}.
   */
  constructor(panel) {
    super(
      document.querySelector('#double-layer-subtree-placer-settings'),
      new DoubleLayerSubtreePlacer(),
      panel
    )
  }

  createSubtreePlacer() {
    return new DoubleLayerSubtreePlacer({
      spacing: this.spacing,
      rootAlignment: this.rootAlignment
    })
  }

  updateSubtreePlacers(selectedNodes, subtreePlacers) {
    for (const selectedNode of selectedNodes) {
      const subtreePlacer = subtreePlacers.get(selectedNode)
      if (subtreePlacer instanceof DoubleLayerSubtreePlacer) {
        if (!this.indeterminateSpacing) {
          subtreePlacer.spacing = this.spacing
        }
        if (!this.indeterminateRootAlignment) {
          subtreePlacer.rootAlignment = this.rootAlignment
        }
      } else {
        subtreePlacers.set(selectedNode, this.createSubtreePlacer())
      }
    }
  }

  adoptSettings(subtreePlacers) {
    this.spacing = subtreePlacers[0].spacing
    this.indeterminateSpacing = false
    this.subtreeTransform = subtreePlacers[0].transformation
    this.rootAlignment = subtreePlacers[0].rootAlignment
    this.indeterminateRootAlignment = false

    if (subtreePlacers.length > 1) {
      subtreePlacers.forEach((subtreePlacer) => {
        if (this.spacing !== subtreePlacer.spacing) {
          this.indeterminateSpacing = true
        }
        if (this.rootAlignment !== subtreePlacer.rootAlignment) {
          this.indeterminateRootAlignment = true
        }
      })
    }

    this.updatePanel()
  }

  getDescriptionText() {
    return (
      '<h2>DoubleLayerSubtreePlacer</h2>' +
      '<p>This subtree placer arranges the child nodes staggered in two lines below their root node. It supports rotated' +
      ' subtrees and offers options to change the alignment of the root node.</p>'
    )
  }

  updatePanel() {
    super.updatePanel()

    const rootAlignment = document.querySelector('#double-layer-root-node-alignment')
    if (this.indeterminateRootAlignment) {
      rootAlignment.selectedIndex = 0
    } else {
      switch (this.rootAlignment) {
        default:
        case SubtreeRootAlignment.LEADING:
          rootAlignment.selectedIndex = 1
          break
        case SubtreeRootAlignment.LEFT:
          rootAlignment.selectedIndex = 2
          break
        case SubtreeRootAlignment.CENTER:
          rootAlignment.selectedIndex = 3
          break
        case SubtreeRootAlignment.CENTER_OF_CHILDREN:
          rootAlignment.selectedIndex = 4
          break
        case SubtreeRootAlignment.MEDIAN:
          rootAlignment.selectedIndex = 5
          break
        case SubtreeRootAlignment.RIGHT:
          rootAlignment.selectedIndex = 6
          break
        case SubtreeRootAlignment.TRAILING:
          rootAlignment.selectedIndex = 7
          break
      }
    }
  }

  bindActions(panel) {
    super.bindActions(panel)
    const rootAlignment = document.querySelector('#double-layer-root-node-alignment')
    rootAlignment.addEventListener('change', async () => {
      switch (rootAlignment.selectedIndex) {
        default:
        case 1:
          this.rootAlignment = SubtreeRootAlignment.LEADING
          break
        case 2:
          this.rootAlignment = SubtreeRootAlignment.LEFT
          break
        case 3:
          this.rootAlignment = SubtreeRootAlignment.CENTER
          break
        case 4:
          this.rootAlignment = SubtreeRootAlignment.CENTER_OF_CHILDREN
          break
        case 5:
          this.rootAlignment = SubtreeRootAlignment.MEDIAN
          break
        case 6:
          this.rootAlignment = SubtreeRootAlignment.RIGHT
          break
        case 7:
          this.rootAlignment = SubtreeRootAlignment.TRAILING
          break
      }
      this.indeterminateRootAlignment = false
      await panel.panelChanged()
    })
  }

  getDefaultSubtreePlacer() {
    return new DoubleLayerSubtreePlacer()
  }
}

class LeftRightSubtreePlacerConfiguration extends RotatableSubtreePlacerConfiguration {
  branchCount = 1
  indeterminateBranchCount = false
  placeLastOnBottom = true
  indeterminatePlaceLastOnBottom = false

  /**
   * Creates a new instance of LeftRightSubtreePlacerConfiguration.
   */
  constructor(panel) {
    super(
      document.querySelector('#left-right-subtree-placer-settings'),
      new LeftRightSubtreePlacer(),
      panel
    )
  }

  createSubtreePlacer() {
    return new LeftRightSubtreePlacer({
      spacing: this.spacing,
      placeLastOnBottom: this.placeLastOnBottom,
      branchCount: this.branchCount
    })
  }

  updateSubtreePlacers(selectedNodes, subtreePlacers) {
    for (const selectedNode of selectedNodes) {
      const subtreePlacer = subtreePlacers.get(selectedNode)
      if (subtreePlacer instanceof LeftRightSubtreePlacer) {
        if (!this.indeterminateSpacing) {
          subtreePlacer.spacing = this.spacing
        }
        if (!this.indeterminatePlaceLastOnBottom) {
          subtreePlacer.placeLastOnBottom = this.placeLastOnBottom
        }
        if (!this.indeterminateBranchCount) {
          subtreePlacer.branchCount = this.branchCount
        }
      } else {
        subtreePlacers.set(selectedNode, this.createSubtreePlacer())
      }
    }
  }

  adoptSettings(subtreePlacers) {
    this.spacing = subtreePlacers[0].spacing
    this.indeterminateSpacing = false
    this.subtreeTransform = subtreePlacers[0].transformation
    this.placeLastOnBottom = subtreePlacers[0].placeLastOnBottom
    this.indeterminatePlaceLastOnBottom = false
    this.branchCount = subtreePlacers[0].branchCount
    this.indeterminateBranchCount = false

    for (const subtreePlacer of subtreePlacers) {
      if (this.spacing !== subtreePlacer.spacing) {
        this.indeterminateSpacing = true
      }
      if (this.placeLastOnBottom !== subtreePlacer.placeLastOnBottom) {
        this.indeterminatePlaceLastOnBottom = true
      }
      if (this.branchCount !== subtreePlacer.branchCount) {
        this.indeterminateBranchCount = true
      }
    }

    this.updatePanel()
  }

  getDescriptionText() {
    return (
      '<h2>LeftRightSubtreePlacer</h2>' +
      '<p>This subtree placer arranges the child nodes below their root node, left and right of the downward extending bus-like routing.</p>'
    )
  }

  updatePanel() {
    super.updatePanel()

    const lastOnBottom = document.querySelector('#last-on-bottom')
    lastOnBottom.checked = this.placeLastOnBottom
    lastOnBottom.indeterminate = this.indeterminatePlaceLastOnBottom
    updateInput('branchCount', this.branchCount, this.indeterminateBranchCount)
  }

  bindActions(panel) {
    super.bindActions(panel)
    const lastOnBottom = document.querySelector('#last-on-bottom')
    lastOnBottom.addEventListener('change', async () => {
      this.placeLastOnBottom = lastOnBottom.checked
      this.indeterminatePlaceLastOnBottom = false
      await panel.panelChanged()
    })

    const branchCount = document.querySelector('#branch-count')
    branchCount.addEventListener('change', async () => {
      this.branchCount = Number.parseInt(branchCount.value)
      this.indeterminateBranchCount = false
      await panel.panelChanged()
    })

    const branchCountLabel = document.querySelector('#branch-count-label')
    branchCount.addEventListener('input', () => {
      branchCountLabel.innerHTML = branchCount.value
    })
  }

  getDefaultSubtreePlacer() {
    return new LeftRightSubtreePlacer()
  }
}

class AspectRatioSubtreePlacerConfiguration extends SubtreePlacerConfiguration {
  aspectRatio = 1
  indeterminateAspectRatio = false
  childAlignmentPolicy = AspectRatioChildAlignmentPolicy.LEADING
  indeterminateChildAlignmentPolicy = false
  childArrangement = ChildArrangementPolicy.HORIZONTAL
  indeterminateHorizontal = false
  horizontalDistance = 40
  indeterminateHorizontalDistance = false
  verticalDistance = 40
  indeterminateVerticalDistance = false

  /**
   * Creates a new instance of {@link AspectRatioSubtreePlacerConfiguration}.
   */
  constructor(panel) {
    super(
      document.querySelector('#aspect-ratio-subtree-placer-settings'),
      new AspectRatioSubtreePlacer(),
      panel
    )
  }

  createSubtreePlacer() {
    return new AspectRatioSubtreePlacer({
      aspectRatio: this.aspectRatio,
      childAlignmentPolicy: this.childAlignmentPolicy,
      horizontalDistance: this.horizontalDistance,
      verticalDistance: this.verticalDistance,
      childArrangement: ChildArrangementPolicy.VERTICAL
    })
  }

  updateSubtreePlacers(selectedNodes, subtreePlacers) {
    for (const selectedNode of selectedNodes) {
      const subtreePlacer = subtreePlacers.get(selectedNode)
      if (subtreePlacer instanceof AspectRatioSubtreePlacer) {
        if (!this.indeterminateAspectRatio) {
          subtreePlacer.aspectRatio = this.aspectRatio
        }
        if (!this.indeterminateChildAlignmentPolicy) {
          subtreePlacer.childAlignmentPolicy = this.childAlignmentPolicy
        }
        if (!this.indeterminateHorizontalDistance) {
          subtreePlacer.horizontalDistance = this.horizontalDistance
        }
        if (!this.indeterminateVerticalDistance) {
          subtreePlacer.verticalDistance = this.verticalDistance
        }
        if (!this.indeterminateHorizontal) {
          subtreePlacer.childArrangement = this.childArrangement
        }
      } else {
        subtreePlacers.set(selectedNode, this.createSubtreePlacer())
      }
    }
  }

  adoptSettings(subtreePlacers) {
    this.aspectRatio = subtreePlacers[0].aspectRatio
    this.indeterminateAspectRatio = false
    this.childAlignmentPolicy = subtreePlacers[0].childAlignmentPolicy
    this.indeterminateChildAlignmentPolicy = false
    this.horizontalDistance = subtreePlacers[0].horizontalDistance
    this.indeterminateHorizontalDistance = false
    this.verticalDistance = subtreePlacers[0].verticalDistance
    this.indeterminateVerticalDistance = false
    this.childArrangement = subtreePlacers[0].childArrangement
    this.indeterminateHorizontal = false

    for (const subtreePlacer of subtreePlacers) {
      if (this.aspectRatio !== subtreePlacer.aspectRatio) {
        this.indeterminateAspectRatio = true
      }
      if (this.childAlignmentPolicy !== subtreePlacer.childAlignmentPolicy) {
        this.indeterminateChildAlignmentPolicy = true
      }
      if (this.horizontalDistance !== subtreePlacer.horizontalDistance) {
        this.indeterminateHorizontalDistance = true
      }
      if (this.verticalDistance !== subtreePlacer.verticalDistance) {
        this.indeterminateVerticalDistance = true
      }
      if (this.childArrangement !== subtreePlacer.childArrangement) {
        this.indeterminateHorizontal = true
      }
    }

    this.updatePanel()
  }

  getDescriptionText() {
    return (
      '<h2>AspectRatioSubtreePlacer</h2>' +
      '<p>This subtree placer arranges the child nodes such that a given aspect ratio is obeyed.</p>'
    )
  }

  updatePanel() {
    updateInput('aspect-ratio', this.aspectRatio, this.indeterminateAspectRatio)

    const fillStyle = document.querySelector('#child-alignment-policy')
    if (this.indeterminateChildAlignmentPolicy) {
      fillStyle.selectedIndex = 0
    } else {
      switch (this.childAlignmentPolicy) {
        default:
        case AspectRatioChildAlignmentPolicy.JUSTIFY:
          fillStyle.selectedIndex = 1
          break
        case AspectRatioChildAlignmentPolicy.LEADING:
          fillStyle.selectedIndex = 2
          break
        case AspectRatioChildAlignmentPolicy.CENTERED:
          fillStyle.selectedIndex = 3
          break
        case AspectRatioChildAlignmentPolicy.TRAILING:
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

    const childArrangement = document.querySelector('#horizontal')
    if (this.indeterminateHorizontal) {
      childArrangement.selectedIndex = 0
    } else {
      switch (this.childArrangement) {
        default:
        case ChildArrangementPolicy.VERTICAL:
          childArrangement.selectedIndex = 0
          break
        case ChildArrangementPolicy.HORIZONTAL:
          childArrangement.selectedIndex = 1
          break
      }
    }
  }

  bindActions(panel) {
    const aspectRatio = document.querySelector('#aspect-ratio')
    aspectRatio.addEventListener('change', async () => {
      this.aspectRatio = parseFloat(aspectRatio.value)
      this.indeterminateAspectRatio = false
      await panel.panelChanged()
    })
    const aspectRatioLabel = document.querySelector('#aspect-ratio-label')
    aspectRatio.addEventListener('input', () => {
      aspectRatioLabel.innerHTML = aspectRatio.value
    })

    const fillStyle = document.querySelector('#child-alignment-policy')
    fillStyle.addEventListener('change', async () => {
      switch (fillStyle.selectedIndex) {
        default:
        case 1:
          this.childAlignmentPolicy = AspectRatioChildAlignmentPolicy.JUSTIFY
          break
        case 2:
          this.childAlignmentPolicy = AspectRatioChildAlignmentPolicy.LEADING
          break
        case 3:
          this.childAlignmentPolicy = AspectRatioChildAlignmentPolicy.CENTERED
          break
        case 4:
          this.childAlignmentPolicy = AspectRatioChildAlignmentPolicy.TRAILING
          break
      }
      this.indeterminateChildAlignmentPolicy = false
      await panel.panelChanged()
    })

    const horizontalDistance = document.querySelector('#aspect-ratio-horizontal-distance')
    horizontalDistance.addEventListener('change', async () => {
      this.horizontalDistance = Number.parseInt(horizontalDistance.value)
      this.indeterminateHorizontalDistance = false
      await panel.panelChanged()
    })
    const horizontalDistanceLabel = document.querySelector(
      '#aspect-ratio-horizontal-distance-label'
    )
    horizontalDistance.addEventListener('input', () => {
      horizontalDistanceLabel.innerHTML = horizontalDistance.value
    })

    const verticalDistance = document.querySelector('#aspect-ratio-vertical-distance')
    verticalDistance.addEventListener('change', async () => {
      this.verticalDistance = Number.parseInt(verticalDistance.value)
      this.indeterminateVerticalDistance = false
      await panel.panelChanged()
    })
    const verticalDistanceLabel = document.querySelector('#aspect-ratio-vertical-distance-label')
    verticalDistance.addEventListener('input', () => {
      verticalDistanceLabel.innerHTML = verticalDistance.value
    })

    const childArrangement = document.querySelector('#horizontal')
    childArrangement.addEventListener('change', async () => {
      switch (childArrangement.selectedIndex) {
        default:
        case 0:
          this.childArrangement = ChildArrangementPolicy.VERTICAL
          break
        case 1:
          this.childArrangement = ChildArrangementPolicy.HORIZONTAL
          break
      }
      this.indeterminateHorizontal = false
      await panel.panelChanged()
    })
  }

  getDefaultSubtreePlacer() {
    return new AspectRatioSubtreePlacer()
  }
}

class AssistantSubtreePlacerConfiguration extends RotatableSubtreePlacerConfiguration {
  childSubtreePlacer = new SingleLayerSubtreePlacer()
  indeterminateChildSubtreePlacer = false

  /**
   * Creates a new instance of {@link AssistantSubtreePlacerConfiguration}.
   */
  constructor(panel) {
    super(
      document.querySelector('#assistant-subtree-placer-settings'),
      new AssistantSubtreePlacer(),
      panel
    )
  }

  createSubtreePlacer() {
    return new AssistantSubtreePlacer({
      spacing: this.spacing,
      childSubtreePlacer: this.childSubtreePlacer
    })
  }

  updateSubtreePlacers(selectedNodes, subtreePlacers) {
    for (const selectedNode of selectedNodes) {
      const subtreePlacer = subtreePlacers.get(selectedNode)
      if (subtreePlacer instanceof AssistantSubtreePlacer) {
        if (!this.indeterminateSpacing) {
          subtreePlacer.spacing = this.spacing
        }
        if (!this.indeterminateChildSubtreePlacer) {
          subtreePlacer.childSubtreePlacer = this.childSubtreePlacer
        }
      } else {
        subtreePlacers.set(selectedNode, this.createSubtreePlacer())
      }
    }
  }

  adoptSettings(subtreePlacers) {
    this.spacing = subtreePlacers[0].spacing
    this.indeterminateSpacing = false
    this.subtreeTransform = subtreePlacers[0].transformation
    this.childSubtreePlacer = subtreePlacers[0].childSubtreePlacer
    this.indeterminateChildSubtreePlacer = false
    subtreePlacers.forEach((subtreePlacer) => {
      if (this.spacing !== subtreePlacer.spacing) {
        this.indeterminateSpacing = true
      }
      if (
        this.indeterminateChildSubtreePlacer ||
        this.childSubtreePlacer !== subtreePlacer.childSubtreePlacer
      ) {
        this.indeterminateChildSubtreePlacer = true
      }
    })
    this.updatePanel()
  }

  getDescriptionText() {
    return (
      '<h2>AssistantSubtreePlacer</h2>' +
      '<p>This subtree placer delegates to two different subtree placers to arrange the child nodes: Nodes that are marked' +
      ' as <code>Assistants</code> are placed using the <code>LeftRightSubtreePlacer</code>. The other children are arranged' +
      ' below the assistant nodes using the child subtree placer.</p>'
    )
  }

  updatePanel() {
    super.updatePanel()

    const childSubtreePlacer = document.querySelector('#child-subtree-placer')
    if (this.indeterminateChildSubtreePlacer) {
      childSubtreePlacer.selectedIndex = 0
    } else if (this.childSubtreePlacer instanceof SingleLayerSubtreePlacer) {
      childSubtreePlacer.selectedIndex = 1
    } else if (this.childSubtreePlacer instanceof BusSubtreePlacer) {
      childSubtreePlacer.selectedIndex = 2
    } else if (this.childSubtreePlacer instanceof DoubleLayerSubtreePlacer) {
      childSubtreePlacer.selectedIndex = 3
    } else if (this.childSubtreePlacer instanceof LeftRightSubtreePlacer) {
      childSubtreePlacer.selectedIndex = 4
    } else if (this.childSubtreePlacer instanceof AspectRatioSubtreePlacer) {
      childSubtreePlacer.selectedIndex = 5
    }
  }

  bindActions(panel) {
    super.bindActions(panel)
    const childSubtreePlacer = document.querySelector('#child-subtree-placer')
    childSubtreePlacer.addEventListener('change', async () => {
      switch (childSubtreePlacer.selectedIndex) {
        default:
        case 1:
          this.childSubtreePlacer = new SingleLayerSubtreePlacer()
          break
        case 2:
          this.childSubtreePlacer = new BusSubtreePlacer()
          break
        case 3:
          this.childSubtreePlacer = new DoubleLayerSubtreePlacer()
          break
        case 4:
          this.childSubtreePlacer = new LeftRightSubtreePlacer()
          break
        case 5:
          this.childSubtreePlacer = new AspectRatioSubtreePlacer()
          break
      }
      this.indeterminateChildSubtreePlacer = false
      await panel.panelChanged()
    })
  }

  getDefaultSubtreePlacer() {
    return new AssistantSubtreePlacer()
  }
}

class CompactSubtreePlacerConfiguration extends SubtreePlacerConfiguration {
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
   * Creates a new instance of AspectRatioSubtreePlacerConfiguration.
   */
  constructor(panel) {
    super(
      document.querySelector('#compact-subtree-placer-settings'),
      new CompactSubtreePlacer(),
      panel
    )
  }

  createSubtreePlacer() {
    return new CompactSubtreePlacer({
      preferredAspectRatio: this.preferredAspectRatio,
      verticalDistance: this.verticalDistance,
      horizontalDistance: this.horizontalDistance,
      minimumFirstSegmentLength: this.minimumFirstSegmentLength,
      minimumLastSegmentLength: this.minimumLastSegmentLength
    })
  }

  updateSubtreePlacers(selectedNodes, subtreePlacers) {
    for (const selectedNode of selectedNodes) {
      const subtreePlacer = subtreePlacers.get(selectedNode)
      if (subtreePlacer instanceof CompactSubtreePlacer) {
        if (!this.indeterminatePreferredAspectRatio) {
          subtreePlacer.preferredAspectRatio = this.preferredAspectRatio
        }
        if (!this.indeterminateVerticalDistance) {
          subtreePlacer.verticalDistance = this.verticalDistance
        }
        if (!this.indeterminateHorizontalDistance) {
          subtreePlacer.horizontalDistance = this.horizontalDistance
        }
        if (!this.indeterminateMinimumFirstSegmentLength) {
          subtreePlacer.minimumFirstSegmentLength = this.minimumFirstSegmentLength
        }
        if (!this.indeterminateMinimumLastSegmentLength) {
          subtreePlacer.minimumLastSegmentLength = this.minimumLastSegmentLength
        }
      } else {
        subtreePlacers.set(selectedNode, this.createSubtreePlacer())
      }
    }
  }

  adoptSettings(subtreePlacers) {
    this.preferredAspectRatio = subtreePlacers[0].preferredAspectRatio
    this.indeterminatePreferredAspectRatio = false
    this.verticalDistance = subtreePlacers[0].verticalDistance
    this.indeterminateVerticalDistance = false
    this.horizontalDistance = subtreePlacers[0].horizontalDistance
    this.indeterminateHorizontalDistance = false
    this.minimumFirstSegmentLength = subtreePlacers[0].minimumFirstSegmentLength
    this.indeterminateMinimumFirstSegmentLength = false
    this.minimumLastSegmentLength = subtreePlacers[0].minimumLastSegmentLength
    this.indeterminateMinimumLastSegmentLength = false

    for (const subtreePlacer of subtreePlacers) {
      if (this.preferredAspectRatio !== subtreePlacer.preferredAspectRatio) {
        this.indeterminatePreferredAspectRatio = true
      }
      if (this.verticalDistance !== subtreePlacer.verticalDistance) {
        this.indeterminateVerticalDistance = true
      }
      if (this.horizontalDistance !== subtreePlacer.horizontalDistance) {
        this.indeterminateHorizontalDistance = true
      }
      if (this.minimumFirstSegmentLength !== subtreePlacer.minimumFirstSegmentLength) {
        this.indeterminateMinimumFirstSegmentLength = true
      }
      if (this.minimumLastSegmentLength !== subtreePlacer.minimumLastSegmentLength) {
        this.indeterminateMinimumLastSegmentLength = true
      }
    }

    this.updatePanel()
  }

  getDescriptionText() {
    return (
      '<h2>CompactSubtreePlacer</h2>' +
      '<p>This subtree placer uses a dynamic optimization approach that chooses a placement strategy of the children ' +
      'of the associated local root such that the overall result is compact with respect to a specified aspect ratio.</p>'
    )
  }

  updatePanel() {
    super.updatePanel()

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

  bindActions(panel) {
    const preferredAspectRatio = document.querySelector('#compact-preferred-aspect-ratio')
    preferredAspectRatio.addEventListener('change', async () => {
      this.preferredAspectRatio = Number.parseInt(preferredAspectRatio.value)
      this.indeterminatePreferredAspectRatio = false
      await panel.panelChanged()
    })
    const preferredAspectRatioLabel = document.querySelector(
      '#compact-preferred-aspect-ratio-label'
    )
    preferredAspectRatio.addEventListener('input', async () => {
      preferredAspectRatioLabel.innerHTML = preferredAspectRatio.value
    })

    const verticalDistance = document.querySelector('#compact-vertical-distance')
    verticalDistance.addEventListener('change', async () => {
      this.verticalDistance = Number.parseInt(verticalDistance.value)
      this.indeterminateVerticalDistance = false
      await panel.panelChanged()
    })
    const verticalDistanceLabel = document.querySelector('#compact-vertical-distance-label')
    verticalDistance.addEventListener('input', async () => {
      verticalDistanceLabel.innerHTML = verticalDistance.value
    })

    const horizontalDistance = document.querySelector('#compact-horizontal-distance')
    horizontalDistance.addEventListener('change', async () => {
      this.horizontalDistance = Number.parseInt(horizontalDistance.value)
      this.indeterminateHorizontalDistance = false
      await panel.panelChanged()
    })
    const horizontalDistanceLabel = document.querySelector('#compact-horizontal-distance-label')
    horizontalDistance.addEventListener('input', async () => {
      horizontalDistanceLabel.innerHTML = horizontalDistance.value
    })

    const minimumFirstSegmentLength = document.querySelector(
      '#compact-minimum-first-segment-length'
    )
    minimumFirstSegmentLength.addEventListener('change', async () => {
      this.minimumFirstSegmentLength = Number.parseInt(minimumFirstSegmentLength.value)
      this.indeterminateMinimumFirstSegmentLength = false
      await panel.panelChanged()
    })
    const minimumFirstSegmentLengthLabel = document.querySelector(
      '#compact-minimum-first-segment-length-label'
    )
    minimumFirstSegmentLength.addEventListener('input', async () => {
      minimumFirstSegmentLengthLabel.innerHTML = minimumFirstSegmentLength.value
    })

    const minimumLastSegmentLength = document.querySelector('#compact-minimum-last-segment-length')
    minimumLastSegmentLength.addEventListener('change', async () => {
      this.minimumLastSegmentLength = Number.parseInt(minimumLastSegmentLength.value)
      this.indeterminateMinimumLastSegmentLength = false
      await panel.panelChanged()
    })
    const minimumLastSegmentLengthLabel = document.querySelector(
      '#compact-minimum-last-segment-length-label'
    )
    minimumLastSegmentLength.addEventListener('input', async () => {
      minimumLastSegmentLengthLabel.innerHTML = minimumLastSegmentLength.value
    })
  }

  getDefaultSubtreePlacer() {
    return new CompactSubtreePlacer()
  }
}

class MultipleSubtreePlacerConfiguration extends SubtreePlacerConfiguration {
  /**
   * Creates a new instance of MultipleSubtreePlacerConfiguration.
   */
  constructor(panel) {
    super(document.querySelector('#multiple-subtree-placer-settings'), null, panel)
  }

  get hasPreview() {
    return false
  }

  createSubtreePlacer() {
    return null
  }

  getDescriptionText() {
    return (
      '<h2>Multiple Values</h2>' +
      '<p>You have selected nodes with different <code>SubtreePlacer</code>s. To assign the same ' +
      '<code>SubtreePlacer</code> to all of these nodes, choose one form the selection box.</p>'
    )
  }

  adoptSettings(subtreePlacers) {}

  bindActions(panel) {}

  getDefaultSubtreePlacer() {
    return null
  }

  updateSubtreePlacers(selectedNodes, subtreePlacers) {}

  updatePanel() {}
}

/**
 * Convenience function changing the value of the {HTMLInputElement} found with the given id.
 * @param elemId the element id
 * @param value the new value
 * @param indeterminate whether the value is indeterminate
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
