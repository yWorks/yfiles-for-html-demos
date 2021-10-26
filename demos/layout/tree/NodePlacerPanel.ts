/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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

import { setComboboxValue } from '../../resources/demo-app'
import { DemoEdgeStyle } from '../../resources/demo-styles'

type LayerColor = {
  fill: Fill
  stroke: Stroke
}

// a list of colors that are assigned to the layers
export const LayerColors: LayerColor[] = [
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

function createLayerColor(fillColor: string, strokeColor: string): LayerColor {
  return { fill: Fill.from(fillColor), stroke: new Stroke(strokeColor, 1.5) }
}

/**
 * A panel that provides access to customize the node placers for each node.
 */
export default class NodePlacerPanel {
  readonly graph: IGraph

  // initialize the preview component where the node placer settings are demonstrated on a small graph
  readonly previewComponent = new GraphComponent('previewComponent')

  // initializes change listener handling
  readonly changeListeners: (() => void)[] = []

  // create node placer configurations
  readonly nodePlacerConfigurations = new Map<string, NodePlacerConfiguration>()
  currentNodePlacerConfiguration: NodePlacerConfiguration | null = null

  // a map which stores the specified node placer for each node
  readonly nodePlacers = new Mapper<INode, ITreeLayoutNodePlacer>()

  /**
   * Creates a new instance of NodePlacerPanel.
   */
  constructor(readonly graphComponent: GraphComponent) {
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
  panelChanged(): void {
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
   */
  onNodeSelectionChanged(selectedNodes: INode[]): void {
    const noNodePlacerElement = document.getElementById('no-node-placer-settings') as HTMLDivElement
    const nodePlacerElement = document.getElementById('select-node-placer') as HTMLSelectElement
    const nodePlacerLabelElement = document.getElementById(
      'select-node-placer-label'
    ) as HTMLLabelElement
    const rotationElement = document.getElementById('rotation') as HTMLDivElement
    const spacingElement = document.getElementById('rotatable-spacing') as HTMLDivElement
    const previewElement = document.getElementById('previewComponent') as HTMLDivElement

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

    const nodePlacers = selectedNodes.map(node => {
      const placer = this.nodePlacers.get(node)
      if (placer === null) {
        // make sure every node has an associated node placer in the nodePlacers-map
        const defaultNodePlacer = new DefaultNodePlacer()
        this.nodePlacers.set(node, defaultNodePlacer)
        return defaultNodePlacer
      }
      return placer
    })

    let referencePlacer: ITreeLayoutNodePlacer | null = nodePlacers[0]
    const referenceConfig = getConfigurationName(referencePlacer)
    //check that all node placers are of same instance - otherwise the MultipleNodePlacerConfiguration is used
    if (!nodePlacers.every(placer => getConfigurationName(placer) === referenceConfig)) {
      referencePlacer = null
    }
    const configurationName = getConfigurationName(referencePlacer)
    setComboboxValue('select-node-placer', configurationName)

    const configuration = this.nodePlacerConfigurations.get(configurationName)!
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
   */
  addChangeListener(listener: () => void): void {
    this.changeListeners.push(listener)
  }

  /**
   * Removes the given listener to the list of listeners that are notified when the node placer settings change.
   */
  removeChangeListener(listener: () => void): void {
    const index = this.changeListeners.indexOf(listener)
    if (index >= 0) {
      this.changeListeners.splice(index, 1)
    }
  }

  /**
   * Notifies all registered change listeners.
   */
  updateChangeListeners(): void {
    this.changeListeners.forEach(listener => {
      listener()
    })
  }
}

let layoutRunning = false

/**
 * Calculates a preview layout. This method is called when node placer settings are changed.
 */
async function runPreviewLayout(
  nodePlacer: ITreeLayoutNodePlacer | null,
  graphComponent: GraphComponent
): Promise<void> {
  if (layoutRunning) {
    return
  }
  layoutRunning = true
  const treeLayout = new TreeLayout()
  const leafNodePlacer = new LeafNodePlacer()
  const treeLayoutData = new TreeLayoutData({
    nodePlacers: node => {
      return graphComponent.graph.inDegree(node) ? leafNodePlacer : nodePlacer
    },
    assistantNodes: node => node.tag && node.tag.assistant
  })

  await graphComponent.morphLayout(treeLayout, '0.2s', treeLayoutData)
  layoutRunning = false
}

/**
 * Wires up the UI elements that are not node placer specific.
 */
function bindActions(panel: NodePlacerPanel): void {
  const selectNodePlacer = document.getElementById('select-node-placer') as HTMLSelectElement
  selectNodePlacer.addEventListener('change', () => {
    if (panel.currentNodePlacerConfiguration) {
      panel.currentNodePlacerConfiguration.visible = false
    }
    panel.currentNodePlacerConfiguration = panel.nodePlacerConfigurations.get(
      selectNodePlacer.value
    )!
    panel.currentNodePlacerConfiguration.visible = true
    const defaultPlacer = panel.currentNodePlacerConfiguration.getDefaultNodePlacer()
    if (defaultPlacer) {
      panel.currentNodePlacerConfiguration.adoptSettings([defaultPlacer])
    }

    const rotationElement = document.getElementById('rotation') as HTMLDivElement
    const spacingElement = document.getElementById('rotatable-spacing') as HTMLDivElement
    if (panel.currentNodePlacerConfiguration.rotatable) {
      rotationElement.style.display = 'block'
      spacingElement.style.display = 'block'
    } else {
      rotationElement.style.display = 'none'
      spacingElement.style.display = 'none'
    }
    panel.panelChanged()
  })

  const rotationLeft = document.getElementById('rotation-left') as HTMLButtonElement
  rotationLeft.addEventListener('click', () => {
    panel.graphComponent.selection.selectedNodes.forEach(node => {
      updateModificationMatrix(node, RotatableNodePlacerMatrix.ROT90, panel)
    })
    panel.updateChangeListeners()
  })

  const rotationRight = document.getElementById('rotation-right') as HTMLButtonElement
  rotationRight.addEventListener('click', () => {
    panel.graphComponent.selection.selectedNodes.forEach(node => {
      updateModificationMatrix(node, RotatableNodePlacerMatrix.ROT270, panel)
    })
    panel.updateChangeListeners()
  })

  const mirrorHorizontal = document.getElementById('mirror-horizontal') as HTMLButtonElement
  mirrorHorizontal.addEventListener('click', () => {
    panel.graphComponent.selection.selectedNodes.forEach(node => {
      updateModificationMatrix(node, RotatableNodePlacerMatrix.MIR_HOR, panel)
    })
    panel.updateChangeListeners()
  })

  const mirrorVertical = document.getElementById('mirror-vertical') as HTMLButtonElement
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
 */
function updateModificationMatrix(
  node: INode,
  matrix: RotatableNodePlacerMatrix,
  panel: NodePlacerPanel
): void {
  const nodePlacer = panel.nodePlacers.get(node)
  let rotatedNodePlacer: ITreeLayoutNodePlacer | null = nodePlacer
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
 */
function getConfigurationName(nodePlacer: ITreeLayoutNodePlacer | null): string {
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
 */
function createPreviewGraph(graphComponent: GraphComponent): void {
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

  graphComponent.graph.edgeDefaults.style = new DemoEdgeStyle('demo-palette-22')
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
abstract class NodePlacerConfiguration {
  private _visible = false

  /**
   * Creates a new instance of NodePlacerConfiguration.
   */
  protected constructor(
    private readonly div: HTMLDivElement,
    nodePlacer: ITreeLayoutNodePlacer | null,
    panel: NodePlacerPanel
  ) {
    if (nodePlacer !== null) {
      this.adoptSettings([nodePlacer])
    }
    this.bindActions(panel)
    this.updatePanel()
  }

  /**
   * Returns whether or not the represented node placer is rotatable. This is used to determine if the
   * rotation/mirroring-buttons should be visible.
   */
  get rotatable(): boolean {
    return false
  }

  /**
   * Returns whether or not there is a preview for the layout with the represented node placer. This
   * is used to determine if the preview element should be visible.
   */
  get hasPreview(): boolean {
    return true
  }

  /**
   * Returns whether or not these node placer settings are currently active/visible.
   */
  get visible(): boolean {
    return this._visible
  }

  /**
   * Sets whether or not these node placer settings should be active/visible.
   * It also updates the description text.
   */
  set visible(visible: boolean) {
    this._visible = visible

    const description = document.getElementById('node-placer-description') as HTMLDivElement
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
   */
  createNodePlacer(): ITreeLayoutNodePlacer | null {
    return null
  }

  /**
   * Updates the node placers of the selected nodes with the values in the panel.
   * Note that indeterminate properties in the panel should not be applied to the individual placer.
   */
  updateNodePlacers(
    selectedNodes: Iterable<INode>,
    nodePlacers: Mapper<INode, ITreeLayoutNodePlacer>
  ): void {}

  /**
   * Updates the configuration settings according to the given {@link ITreeLayoutNodePlacer}.
   * This method is called when the configuration is changed or reset.
   */
  adoptSettings(nodePlacers: ITreeLayoutNodePlacer[]): void {}

  /**
   * Updates the UI after the configuration changed.
   * @see {@link NodePlacerConfiguration#adoptSettings}
   */
  updatePanel(): void {}

  /**
   * Wires up the UI for this configuration.
   */
  bindActions(panel: NodePlacerPanel): void {}

  /**
   * Returns the description text for this configuration.
   */
  getDescriptionText(): string {
    return ''
  }

  /**
   * Returns the node placer for this configuration with initial settings.
   */
  getDefaultNodePlacer(): ITreeLayoutNodePlacer | null {
    return null
  }
}

/**
 * Base class for all node placer configurations representing node placers inheriting
 * {@link RotatableNodePlacerBase}.
 * It will handle the rotation and spacing properties by default.
 */
abstract class RotatableNodePlacerConfiguration extends NodePlacerConfiguration {
  protected spacing = 20
  protected indeterminateSpacing = false
  protected modificationMatrix: RotatableNodePlacerMatrix

  protected constructor(
    div: HTMLDivElement,
    nodePlacer: ITreeLayoutNodePlacer,
    panel: NodePlacerPanel
  ) {
    super(div, nodePlacer, panel)
    this.modificationMatrix = RotatableNodePlacerMatrix.DEFAULT
  }

  /**
   * Returns true for all configurations based on this class.
   */
  get rotatable(): boolean {
    return true
  }

  adoptSettings(nodePlacers: RotatableNodePlacerBase[]): void {
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

  updatePanel(): void {
    updateInput('spacing', this.spacing, this.indeterminateSpacing)
  }

  bindActions(panel: NodePlacerPanel): void {
    const spacingElement = document.getElementById('spacing') as HTMLInputElement
    spacingElement.addEventListener('change', () => {
      if (this.visible) {
        this.spacing = Number.parseInt(spacingElement.value)
        this.indeterminateSpacing = false
        panel.panelChanged()
      }
    })
    const spacingLabel = document.getElementById('spacing-label') as HTMLLabelElement
    spacingElement.addEventListener('input', () => {
      if (this.visible) {
        spacingLabel.innerHTML = spacingElement.value
      }
    })
  }
}

class DefaultNodePlacerConfiguration extends NodePlacerConfiguration {
  private childPlacement: ChildPlacement
  private indeterminateChildPlacement = false
  private routingStyle: TreeLayoutEdgeRoutingStyle
  private indeterminateRoutingStyle = false
  private horizontalDistance = 40
  private indeterminateHorizontalDistance = false
  private verticalDistance = 40
  private indeterminateVerticalDistance = false
  private rootAlignment: RootAlignment
  private indeterminateRootAlignment = false
  private minimumChannelSegmentDistance = 0
  private indeterminateMinimumChannelSegmentDistance = false

  /**
   * Creates a new instance of DefaultNodePlacerConfiguration.
   */
  constructor(panel: NodePlacerPanel) {
    super(
      document.getElementById('default-node-placer-settings') as HTMLDivElement,
      new DefaultNodePlacer(),
      panel
    )
    this.childPlacement = ChildPlacement.HORIZONTAL_DOWNWARD
    this.routingStyle = TreeLayoutEdgeRoutingStyle.FORK
    this.rootAlignment = RootAlignment.CENTER
  }

  createNodePlacer(): DefaultNodePlacer {
    return new DefaultNodePlacer({
      childPlacement: this.childPlacement,
      routingStyle: this.routingStyle,
      horizontalDistance: this.horizontalDistance,
      verticalDistance: this.verticalDistance,
      minimumChannelSegmentDistance: this.minimumChannelSegmentDistance,
      rootAlignment: this.rootAlignment
    })
  }

  updateNodePlacers(
    selectedNodes: Iterable<INode>,
    nodePlacers: Mapper<INode, ITreeLayoutNodePlacer>
  ): void {
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

  adoptSettings(nodePlacers: DefaultNodePlacer[]): void {
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

  updatePanel(): void {
    const childPlacement = document.getElementById('select-child-placement') as HTMLSelectElement
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

    const routingStyle = document.getElementById('routing-style') as HTMLSelectElement
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

    const rootAlignment = document.getElementById('root-alignment') as HTMLSelectElement
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

  getDescriptionText(): string {
    return (
      '<h2>DefaultNodePlacer</h2>' +
      'This node placer arranges the child nodes horizontally aligned below their root node. It offers options' +
      ' to change the orientation of the subtree, the edge routing style, and the alignment of the root node.'
    )
  }

  bindActions(panel: NodePlacerPanel): void {
    const childPlacement = document.getElementById('select-child-placement') as HTMLSelectElement
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

    const routingStyle = document.getElementById('routing-style') as HTMLSelectElement
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

    const horizontalDistance = document.getElementById('horizontal-distance') as HTMLInputElement
    horizontalDistance.addEventListener('change', () => {
      this.horizontalDistance = Number.parseInt(horizontalDistance.value)
      this.indeterminateHorizontalDistance = false
      panel.panelChanged()
    })
    const horizontalDistanceLabel = document.getElementById(
      'horizontal-distance-label'
    ) as HTMLLabelElement
    horizontalDistance.addEventListener('input', () => {
      horizontalDistanceLabel.innerHTML = horizontalDistance.value
    })

    const verticalDistance = document.getElementById('vertical-distance') as HTMLInputElement
    verticalDistance.addEventListener('change', () => {
      this.verticalDistance = Number.parseInt(verticalDistance.value)
      this.indeterminateVerticalDistance = false
      panel.panelChanged()
    })
    const verticalDistanceLabel = document.getElementById(
      'vertical-distance-label'
    ) as HTMLLabelElement
    verticalDistance.addEventListener('input', () => {
      verticalDistanceLabel.innerHTML = verticalDistance.value
    })

    const minimumChannelSegmentDistance = document.getElementById(
      'minimum-channel-segment-distance'
    ) as HTMLInputElement
    minimumChannelSegmentDistance.addEventListener('change', () => {
      this.minimumChannelSegmentDistance = Number.parseInt(minimumChannelSegmentDistance.value)
      this.indeterminateMinimumChannelSegmentDistance = false
      panel.panelChanged()
    })
    const minimumChannelSegmentDistanceLabel = document.getElementById(
      'minimum-channel-segment-distance-label'
    ) as HTMLLabelElement
    minimumChannelSegmentDistance.addEventListener('input', () => {
      minimumChannelSegmentDistanceLabel.innerHTML = minimumChannelSegmentDistance.value
    })

    const rootAlignment = document.getElementById('root-alignment') as HTMLSelectElement
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

  getDefaultNodePlacer(): DefaultNodePlacer {
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
   */
  constructor(panel: NodePlacerPanel) {
    super(
      document.getElementById('simple-node-placer-settings') as HTMLDivElement,
      new SimpleNodePlacer(),
      panel
    )
  }

  createNodePlacer() {
    return new SimpleNodePlacer({
      createBus: this.createBus,
      rootAlignment: this.rootAlignment,
      minimumChannelSegmentDistance: this.minimumChannelSegmentDistance,
      spacing: this.spacing
    })
  }

  updateNodePlacers(
    selectedNodes: Iterable<INode>,
    nodePlacers: Mapper<INode, ITreeLayoutNodePlacer>
  ): void {
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

  adoptSettings(nodePlacers: SimpleNodePlacer[]): void {
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

  updatePanel(): void {
    super.updatePanel()
    const createBus = document.getElementById('create-bus') as HTMLInputElement
    createBus.checked = this.createBus
    createBus.indeterminate = this.indeterminateCreateBus

    const rootAlignment = document.getElementById('simple-root-node-alignment') as HTMLSelectElement
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

  getDescriptionText(): string {
    return (
      '<h2>SimpleNodePlacer</h2>' +
      'This node placer arranges the child nodes horizontally aligned below their root node. It supports rotated' +
      'subtrees and offers options to change the alignment of the root node.'
    )
  }

  bindActions(panel: NodePlacerPanel) {
    super.bindActions(panel)

    const createBus = document.getElementById('create-bus') as HTMLInputElement
    createBus.addEventListener('change', () => {
      this.createBus = createBus.checked
      this.indeterminateCreateBus = false
      panel.panelChanged()
    })

    const rootAlignment = document.getElementById('simple-root-node-alignment') as HTMLSelectElement
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

    const minimumChannelSegmentDistance = document.getElementById(
      'min-channel-segment-distance'
    ) as HTMLInputElement
    minimumChannelSegmentDistance.addEventListener('change', () => {
      this.minimumChannelSegmentDistance = Number.parseInt(minimumChannelSegmentDistance.value)
      this.indeterminateMinimumChannelSegmentDistance = false
      panel.panelChanged()
    })
    const minimumChannelSegmentDistanceLabel = document.getElementById(
      'min-channel-segment-distance-label'
    ) as HTMLLabelElement
    minimumChannelSegmentDistance.addEventListener('input', () => {
      minimumChannelSegmentDistanceLabel.innerHTML = minimumChannelSegmentDistance.value
    })
  }

  getDefaultNodePlacer(): SimpleNodePlacer {
    return new SimpleNodePlacer()
  }
}

class BusNodePlacerConfiguration extends RotatableNodePlacerConfiguration {
  /**
   * Creates a new instance of BusNodePlacerConfiguration.
   */
  constructor(panel: NodePlacerPanel) {
    super(
      document.getElementById('bus-node-placer-settings') as HTMLDivElement,
      new BusNodePlacer(),
      panel
    )
  }

  createNodePlacer(): BusNodePlacer {
    return new BusNodePlacer({ spacing: this.spacing })
  }

  updateNodePlacers(
    selectedNodes: Iterable<INode>,
    nodePlacers: Mapper<INode, ITreeLayoutNodePlacer>
  ): void {
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

  adoptSettings(nodePlacer: RotatableNodePlacerBase[]): void {
    super.adoptSettings(nodePlacer)
    this.updatePanel()
  }

  getDescriptionText(): string {
    return (
      '<h2>BusNodePlacer</h2>' +
      'This node placer arranges the child nodes evenly distributed in two lines to the left and right of the root node.'
    )
  }

  getDefaultNodePlacer(): BusNodePlacer {
    return new BusNodePlacer()
  }
}

class GridNodePlacerConfiguration extends RotatableNodePlacerConfiguration {
  private rootAlignment = GridNodePlacer.BUS_ALIGNED
  private indeterminateRootAlignment = false
  private busPlacement = BusPlacement.LEADING
  private indeterminateBusPlacement = false

  /**
   * Creates a new instance of GridNodePlacerConfiguration.
   */
  constructor(panel: NodePlacerPanel) {
    super(
      document.getElementById('grid-node-placer-settings') as HTMLDivElement,
      new GridNodePlacer(),
      panel
    )
  }

  createNodePlacer(): GridNodePlacer {
    return new GridNodePlacer({
      spacing: this.spacing,
      rootAlignment: this.rootAlignment,
      busPlacement: this.busPlacement,
      automaticRowAssignment: true
    })
  }

  updateNodePlacers(
    selectedNodes: Iterable<INode>,
    nodePlacers: Mapper<INode, ITreeLayoutNodePlacer>
  ): void {
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

  adoptSettings(nodePlacers: GridNodePlacer[]): void {
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

  getDescriptionText(): string {
    return (
      '<h2>GridNodePlacer</h2>' +
      'This node placer arranges the shapes of the children of a local root in a grid. It supports rotated' +
      ' subtrees and offers options to change the alignment of the root node .'
    )
  }

  updatePanel(): void {
    super.updatePanel()

    const rootAlignment = document.getElementById('grid-node-placer-alignment') as HTMLSelectElement
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

    const busPlacement = document.getElementById(
      'grid-node-placer-bus-placement'
    ) as HTMLSelectElement
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

  bindActions(panel: NodePlacerPanel) {
    super.bindActions(panel)
    const rootAlignment = document.getElementById('grid-node-placer-alignment') as HTMLSelectElement
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

    const busPlacement = document.getElementById(
      'grid-node-placer-bus-placement'
    ) as HTMLSelectElement
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

  getDefaultNodePlacer(): GridNodePlacer {
    return new GridNodePlacer()
  }
}

class DoubleLineNodePlacerConfiguration extends RotatableNodePlacerConfiguration {
  rootAlignment = RootNodeAlignment.CENTER
  indeterminateRootAlignment = false

  /**
   * Creates a new instance of DoubleLineNodePlacerConfiguration.
   */
  constructor(panel: NodePlacerPanel) {
    super(
      document.getElementById('double-line-node-placer-settings') as HTMLDivElement,
      new DoubleLineNodePlacer(),
      panel
    )
  }

  createNodePlacer(): DoubleLineNodePlacer {
    return new DoubleLineNodePlacer({
      spacing: this.spacing,
      rootAlignment: this.rootAlignment
    })
  }

  updateNodePlacers(
    selectedNodes: Iterable<INode>,
    nodePlacers: Mapper<INode, ITreeLayoutNodePlacer>
  ): void {
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

  adoptSettings(nodePlacers: DoubleLineNodePlacer[]): void {
    super.adoptSettings(nodePlacers)

    this.rootAlignment = nodePlacers[0].rootAlignment
    this.indeterminateRootAlignment = false

    if (nodePlacers.length > 1) {
      nodePlacers.forEach(nodePlacer => {
        if (!this.rootAlignment.equals(nodePlacer.rootAlignment)) {
          this.indeterminateRootAlignment = true
        }
      })
    }

    this.updatePanel()
  }

  getDescriptionText(): string {
    return (
      '<h2>DoubleLineNodePlacer</h2>' +
      'This node placer arranges the child nodes staggered in two lines below their root node. It supports rotated' +
      ' subtrees and offers options to change the alignment of the root node.'
    )
  }

  updatePanel(): void {
    super.updatePanel()

    const rootAlignment = document.getElementById(
      'double-line-root-node-alignment'
    ) as HTMLSelectElement
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

  bindActions(panel: NodePlacerPanel): void {
    super.bindActions(panel)
    const rootAlignment = document.getElementById(
      'double-line-root-node-alignment'
    ) as HTMLSelectElement
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

  getDefaultNodePlacer(): DoubleLineNodePlacer {
    return new DoubleLineNodePlacer()
  }
}

class LeftRightNodePlacerConfiguration extends RotatableNodePlacerConfiguration {
  private branchCount = 1
  private indeterminateBranchCount = false
  private placeLastOnBottom = true
  private indeterminatePlaceLastOnBottom = false

  /**
   * Creates a new instance of LeftRightNodePlacerConfiguration.
   */
  constructor(panel: NodePlacerPanel) {
    super(
      document.getElementById('left-right-node-placer-settings') as HTMLDivElement,
      new LeftRightNodePlacer(),
      panel
    )
  }

  createNodePlacer(): LeftRightNodePlacer {
    return new LeftRightNodePlacer({
      spacing: this.spacing,
      placeLastOnBottom: this.placeLastOnBottom,
      branchCount: this.branchCount
    })
  }

  updateNodePlacers(
    selectedNodes: Iterable<INode>,
    nodePlacers: Mapper<INode, ITreeLayoutNodePlacer>
  ): void {
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

  adoptSettings(nodePlacers: LeftRightNodePlacer[]) {
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

  getDescriptionText(): string {
    return (
      '<h2>LeftRightNodePlacer</h2>' +
      'This node placer arranges the child nodes below their root node, left and right of the downward extending bus-like routing.'
    )
  }

  updatePanel(): void {
    super.updatePanel()

    const lastOnBottom = document.getElementById('last-on-bottom') as HTMLInputElement
    lastOnBottom.checked = this.placeLastOnBottom
    lastOnBottom.indeterminate = this.indeterminatePlaceLastOnBottom
    updateInput('branchCount', this.branchCount, this.indeterminateBranchCount)
  }

  bindActions(panel: NodePlacerPanel): void {
    super.bindActions(panel)
    const lastOnBottom = document.getElementById('last-on-bottom') as HTMLInputElement
    lastOnBottom.addEventListener('change', () => {
      this.placeLastOnBottom = lastOnBottom.checked
      this.indeterminatePlaceLastOnBottom = false
      panel.panelChanged()
    })

    const branchCount = document.getElementById('branch-count') as HTMLInputElement
    branchCount.addEventListener('change', () => {
      this.branchCount = Number.parseInt(branchCount.value)
      this.indeterminateBranchCount = false
      panel.panelChanged()
    })

    const branchCountLabel = document.getElementById('branch-count-label') as HTMLLabelElement
    branchCount.addEventListener('input', () => {
      branchCountLabel.innerHTML = branchCount.value
    })
  }

  getDefaultNodePlacer(): LeftRightNodePlacer {
    return new LeftRightNodePlacer()
  }
}

class AspectRatioNodePlacerConfiguration extends NodePlacerConfiguration {
  private aspectRatio = 1
  private indeterminateAspectRatio = false
  private fillStyle = FillStyle.LEADING
  private indeterminateFillStyle = false
  private horizontal = false
  private indeterminateHorizontal = false
  private horizontalDistance = 40
  private indeterminateHorizontalDistance = false
  private verticalDistance = 40
  private indeterminateVerticalDistance = false

  /**
   * Creates a new instance of AspectRatioNodePlacerConfiguration.
   */
  constructor(panel: NodePlacerPanel) {
    super(
      document.getElementById('aspect-ratio-node-placer-settings') as HTMLDivElement,
      new AspectRatioNodePlacer(),
      panel
    )
  }

  createNodePlacer(): AspectRatioNodePlacer {
    return new AspectRatioNodePlacer({
      aspectRatio: this.aspectRatio,
      fillStyle: this.fillStyle,
      horizontalDistance: this.horizontalDistance,
      verticalDistance: this.verticalDistance,
      horizontal: this.horizontal
    })
  }

  updateNodePlacers(
    selectedNodes: Iterable<INode>,
    nodePlacers: Mapper<INode, ITreeLayoutNodePlacer>
  ): void {
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

  adoptSettings(nodePlacers: AspectRatioNodePlacer[]): void {
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

  getDescriptionText(): string {
    return (
      '<h2>AspectRatioNodePlacer</h2>' +
      'This node placer arranges the child nodes such that a given aspect ratio is obeyed.'
    )
  }

  updatePanel(): void {
    updateInput('aspect-ratio', this.aspectRatio, this.indeterminateAspectRatio)

    const fillStyle = document.getElementById('fill-style') as HTMLSelectElement
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

    const horizontal = document.getElementById('horizontal') as HTMLInputElement
    horizontal.checked = this.horizontal
    horizontal.indeterminate = this.indeterminateHorizontal
  }

  bindActions(panel: NodePlacerPanel): void {
    const aspectRatio = document.getElementById('aspect-ratio') as HTMLInputElement
    aspectRatio.addEventListener('change', () => {
      this.aspectRatio = parseFloat(aspectRatio.value)
      this.indeterminateAspectRatio = false
      panel.panelChanged()
    })
    const aspectRatioLabel = document.getElementById('aspect-ratio-label') as HTMLLabelElement
    aspectRatio.addEventListener('input', () => {
      aspectRatioLabel.innerHTML = aspectRatio.value
    })

    const fillStyle = document.getElementById('fill-style') as HTMLSelectElement
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

    const horizontalDistance = document.getElementById(
      'aspect-ratio-horizontal-distance'
    ) as HTMLInputElement
    horizontalDistance.addEventListener('change', () => {
      this.horizontalDistance = Number.parseInt(horizontalDistance.value)
      this.indeterminateHorizontalDistance = false
      panel.panelChanged()
    })
    const horizontalDistanceLabel = document.getElementById(
      'aspect-ratio-horizontal-distance-label'
    ) as HTMLLabelElement
    horizontalDistance.addEventListener('input', () => {
      horizontalDistanceLabel.innerHTML = horizontalDistance.value
    })

    const verticalDistance = document.getElementById(
      'aspect-ratio-vertical-distance'
    ) as HTMLInputElement
    verticalDistance.addEventListener('change', () => {
      this.verticalDistance = Number.parseInt(verticalDistance.value)
      this.indeterminateVerticalDistance = false
      panel.panelChanged()
    })
    const verticalDistanceLabel = document.getElementById(
      'aspect-ratio-vertical-distance-label'
    ) as HTMLInputElement
    verticalDistance.addEventListener('input', () => {
      verticalDistanceLabel.innerHTML = verticalDistance.value
    })

    const horizontal = document.getElementById('horizontal') as HTMLInputElement
    horizontal.addEventListener('change', () => {
      this.horizontal = horizontal.checked
      this.indeterminateHorizontal = false
      panel.panelChanged()
    })
  }

  getDefaultNodePlacer(): AspectRatioNodePlacer {
    return new AspectRatioNodePlacer()
  }
}

class AssistantNodePlacerConfiguration extends RotatableNodePlacerConfiguration {
  private childNodePlacer: ITreeLayoutNodePlacer = new SimpleNodePlacer()
  private indeterminateChildNodePlacer = false

  /**
   * Creates a new instance of AssistantNodePlacerConfiguration.
   */
  constructor(panel: NodePlacerPanel) {
    super(
      document.getElementById('assistant-node-placer-settings') as HTMLDivElement,
      new AssistantNodePlacer(),
      panel
    )
  }

  createNodePlacer(): AssistantNodePlacer {
    return new AssistantNodePlacer({
      spacing: this.spacing,
      childNodePlacer: this.childNodePlacer
    })
  }

  updateNodePlacers(
    selectedNodes: Iterable<INode>,
    nodePlacers: Mapper<INode, ITreeLayoutNodePlacer>
  ): void {
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

  adoptSettings(nodePlacers: AssistantNodePlacer[]): void {
    super.adoptSettings(nodePlacers)

    this.childNodePlacer = nodePlacers[0].childNodePlacer
    this.indeterminateChildNodePlacer = false
    nodePlacers.forEach(nodePlacer => {
      if (
        this.indeterminateChildNodePlacer ||
        this.childNodePlacer !== nodePlacer.childNodePlacer
      ) {
        this.indeterminateChildNodePlacer = true
      }
    })
    this.updatePanel()
  }

  getDescriptionText(): string {
    return (
      '<h2>AssistantNodePlacer</h2>' +
      'This node placer delegates to two different node placers to arrange the child nodes: Nodes that are marked' +
      ' as <em>Assistants</em> are placed using the <a href="https://docs.yworks.com/yfileshtml/#/api/LeftRightNodePlacer" target="_blank">LeftRightNodePlacer</a>. The other children are arranged' +
      ' below the assistant nodes using the child node placer.'
    )
  }

  updatePanel(): void {
    super.updatePanel()

    const childNodePlacer = document.getElementById('child-node-placer') as HTMLSelectElement
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

  bindActions(panel: NodePlacerPanel): void {
    super.bindActions(panel)
    const childNodePlacer = document.getElementById('child-node-placer') as HTMLSelectElement
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

  getDefaultNodePlacer(): AssistantNodePlacer {
    return new AssistantNodePlacer()
  }
}

class CompactNodePlacerConfiguration extends NodePlacerConfiguration {
  private preferredAspectRatio = 1
  private indeterminatePreferredAspectRatio = false
  private verticalDistance = 40
  private indeterminateVerticalDistance = false
  private horizontalDistance = 40
  private indeterminateHorizontalDistance = false
  private minimumFirstSegmentLength = 10
  private indeterminateMinimumFirstSegmentLength = false
  private minimumLastSegmentLength = 10
  private indeterminateMinimumLastSegmentLength = false

  /**
   * Creates a new instance of AspectRatioNodePlacerConfiguration.
   */
  constructor(panel: NodePlacerPanel) {
    super(
      document.getElementById('compact-node-placer-settings') as HTMLDivElement,
      new CompactNodePlacer(),
      panel
    )
  }

  createNodePlacer(): CompactNodePlacer {
    return new CompactNodePlacer({
      preferredAspectRatio: this.preferredAspectRatio,
      verticalDistance: this.verticalDistance,
      horizontalDistance: this.horizontalDistance,
      minimumFirstSegmentLength: this.minimumFirstSegmentLength,
      minimumLastSegmentLength: this.minimumLastSegmentLength
    })
  }

  updateNodePlacers(
    selectedNodes: Iterable<INode>,
    nodePlacers: Mapper<INode, ITreeLayoutNodePlacer>
  ): void {
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

  adoptSettings(nodePlacers: CompactNodePlacer[]): void {
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

  getDescriptionText(): string {
    return (
      '<h2>CompactNodePlacer</h2>' +
      'This node placer uses a dynamic optimization approach that chooses a placement strategy of the children ' +
      'of the associated local root such that the overall result is compact with respect to a specified aspect ratio.'
    )
  }

  updatePanel(): void {
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

  bindActions(panel: NodePlacerPanel): void {
    const preferredAspectRatio = document.getElementById(
      'compact-preferred-aspect-ratio'
    ) as HTMLInputElement
    preferredAspectRatio.addEventListener('change', () => {
      this.preferredAspectRatio = Number.parseInt(preferredAspectRatio.value)
      this.indeterminatePreferredAspectRatio = false
      panel.panelChanged()
    })
    const preferredAspectRatioLabel = document.getElementById(
      'compact-preferred-aspect-ratio-label'
    ) as HTMLLabelElement
    preferredAspectRatio.addEventListener('input', () => {
      preferredAspectRatioLabel.innerHTML = preferredAspectRatio.value
    })

    const verticalDistance = document.getElementById(
      'compact-vertical-distance'
    ) as HTMLInputElement
    verticalDistance.addEventListener('change', () => {
      this.verticalDistance = Number.parseInt(verticalDistance.value)
      this.indeterminateVerticalDistance = false
      panel.panelChanged()
    })
    const verticalDistanceLabel = document.getElementById(
      'compact-vertical-distance-label'
    ) as HTMLLabelElement
    verticalDistance.addEventListener('input', () => {
      verticalDistanceLabel.innerHTML = verticalDistance.value
    })

    const horizontalDistance = document.getElementById(
      'compact-horizontal-distance'
    ) as HTMLInputElement
    horizontalDistance.addEventListener('change', () => {
      this.horizontalDistance = Number.parseInt(horizontalDistance.value)
      this.indeterminateHorizontalDistance = false
      panel.panelChanged()
    })
    const horizontalDistanceLabel = document.getElementById(
      'compact-horizontal-distance-label'
    ) as HTMLLabelElement
    horizontalDistance.addEventListener('input', () => {
      horizontalDistanceLabel.innerHTML = horizontalDistance.value
    })

    const minimumFirstSegmentLength = document.getElementById(
      'compact-minimum-first-segment-length'
    ) as HTMLInputElement
    minimumFirstSegmentLength.addEventListener('change', () => {
      this.minimumFirstSegmentLength = Number.parseInt(minimumFirstSegmentLength.value)
      this.indeterminateMinimumFirstSegmentLength = false
      panel.panelChanged()
    })
    const minimumFirstSegmentLengthLabel = document.getElementById(
      'compact-minimum-first-segment-length-label'
    ) as HTMLLabelElement
    minimumFirstSegmentLength.addEventListener('input', () => {
      minimumFirstSegmentLengthLabel.innerHTML = minimumFirstSegmentLength.value
    })

    const minimumLastSegmentLength = document.getElementById(
      'compact-minimum-last-segment-length'
    ) as HTMLInputElement
    minimumLastSegmentLength.addEventListener('change', () => {
      this.minimumLastSegmentLength = Number.parseInt(minimumLastSegmentLength.value)
      this.indeterminateMinimumLastSegmentLength = false
      panel.panelChanged()
    })
    const minimumLastSegmentLengthLabel = document.getElementById(
      'compact-minimum-last-segment-length-label'
    ) as HTMLLabelElement
    minimumLastSegmentLength.addEventListener('input', () => {
      minimumLastSegmentLengthLabel.innerHTML = minimumLastSegmentLength.value
    })
  }

  getDefaultNodePlacer(): CompactNodePlacer {
    return new CompactNodePlacer()
  }
}

class MultipleNodePlacerConfiguration extends NodePlacerConfiguration {
  /**
   * Creates a new instance of MultipleNodePlacerConfiguration.
   */
  constructor(panel: NodePlacerPanel) {
    super(document.getElementById('multiple-node-placer-settings') as HTMLDivElement, null, panel)
  }

  get hasPreview(): boolean {
    return false
  }

  createNodePlacer(): ITreeLayoutNodePlacer | null {
    return null
  }

  getDescriptionText(): string {
    return (
      '<h2>Multiple Values</h2>' +
      'You have selected nodes with different <code>NodePlacer</code>s. To assign the same ' +
      '<code>NodePlacer</code> to all of these nodes, choose one form the selection box.'
    )
  }

  adoptSettings(nodePlacers: ITreeLayoutNodePlacer[]): void {}

  bindActions(panel: NodePlacerPanel): void {}

  getDefaultNodePlacer(): ITreeLayoutNodePlacer | null {
    return null
  }

  updateNodePlacers(
    selectedNodes: Iterable<INode>,
    nodePlacers: Mapper<INode, ITreeLayoutNodePlacer>
  ): void {}

  updatePanel(): void {}
}

/**
 * Convenience function changing the value of the {HTMLInputElement} found with the given id.
 * @param elemId the element id
 * @param value the new value
 * @param indeterminate whether the value is indeterminate
 */
function updateInput(elemId: string, value: number, indeterminate?: boolean) {
  const elem = document.getElementById(elemId)
  if (elem instanceof HTMLInputElement) {
    elem.value = String(value)
  }
  const labelElm = document.getElementById(elemId + '-label')
  if (labelElm !== null) {
    labelElm.innerHTML = indeterminate ? '???' : String(value)
  }
}
