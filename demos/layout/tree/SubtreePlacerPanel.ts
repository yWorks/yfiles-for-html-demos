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
  IGraph,
  INode,
  type ISubtreePlacer,
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
  TreeLayoutData,
  ViewportLimitingMode,
  ViewportLimitingPolicy
} from '@yfiles/yfiles'

import { createDemoEdgeStyle } from '@yfiles/demo-resources/demo-styles'

type LayerColor = { fill: Fill; stroke: Stroke }

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
 * A panel that provides access to customize the subtree placers for each node.
 */
export class SubtreePlacerPanel {
  readonly graph: IGraph

  // initialize the preview component where the subtree placer settings are demonstrated on a small graph
  readonly previewComponent = new GraphComponent('previewComponent')

  // initializes change listener handling
  readonly changeListeners: (() => void)[] = []

  // create subtree placer configurations
  readonly subtreePlacerConfigurations = new Map<string, SubtreePlacerConfiguration>()
  currentSubtreePlacerConfiguration: SubtreePlacerConfiguration | null = null

  // a map which stores the specified subtree placer for each node
  readonly subtreePlacers = new Mapper<INode, ISubtreePlacer>()

  /**
   * Creates a new instance of {@link SubtreePlacerPanel}.
   */
  constructor(readonly graphComponent: GraphComponent) {
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
  async panelChanged(): Promise<void> {
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
  async onNodeSelectionChanged(selectedNodes: INode[]): Promise<void> {
    const noSubtreePlacerElement = document.querySelector<HTMLDivElement>(
      '#no-subtree-placer-settings'
    )!
    const subtreePlacerElement = document.querySelector<HTMLDivElement>('#select-subtree-placer')!
    const subtreePlacerLabelElement = document.querySelector<HTMLLabelElement>(
      '#select-subtree-placer-label'
    )!
    const rotationElement = document.querySelector<HTMLDivElement>('#rotation')!
    const spacingElement = document.querySelector<HTMLDivElement>('#rotatable-spacing')!
    const previewElement = document.querySelector<HTMLDivElement>('#previewComponent')!

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

    let referencePlacer: ISubtreePlacer | null = subtreePlacers[0]
    const referenceConfig = getConfigurationName(referencePlacer)
    //check that all subtree placers are of same instance - otherwise the MultipleSubtreePlacerConfiguration is used
    if (!subtreePlacers.every((placer) => getConfigurationName(placer) === referenceConfig)) {
      referencePlacer = null
    }
    const configurationName = getConfigurationName(referencePlacer)
    document.querySelector<HTMLSelectElement>('#select-subtree-placer')!.value = configurationName

    const configuration = this.subtreePlacerConfigurations.get(configurationName)!
    configuration.adoptSettings(subtreePlacers)

    if (this.currentSubtreePlacerConfiguration) {
      this.currentSubtreePlacerConfiguration.visible = false
    }
    this.currentSubtreePlacerConfiguration = configuration
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

  /**
   * Adds the given listener to the list of listeners that are notified when the subtree placer settings change.
   */
  setChangeListener(listener: () => void): void {
    this.changeListeners.push(listener)
  }

  /**
   * Removes the given listener to the list of listeners that are notified when the subtree placer settings change.
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
    this.changeListeners.forEach((listener) => {
      listener()
    })
  }
}

let layoutRunning = false

/**
 * Calculates a preview layout. This method is called when subtree placer settings are changed.
 */
async function runPreviewLayout(
  subtreePlacer: ISubtreePlacer | null,
  graphComponent: GraphComponent
): Promise<void> {
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
function bindActions(panel: SubtreePlacerPanel): void {
  const selectSubtreePlacer = document.querySelector<HTMLSelectElement>('#select-subtree-placer')!
  selectSubtreePlacer.addEventListener('change', async () => {
    if (panel.currentSubtreePlacerConfiguration) {
      panel.currentSubtreePlacerConfiguration.visible = false
    }
    panel.currentSubtreePlacerConfiguration = panel.subtreePlacerConfigurations.get(
      selectSubtreePlacer.value
    )!
    panel.currentSubtreePlacerConfiguration.visible = true
    const defaultPlacer = panel.currentSubtreePlacerConfiguration.getDefaultSubtreePlacer()
    if (defaultPlacer) {
      panel.currentSubtreePlacerConfiguration.adoptSettings([defaultPlacer])
    }

    const rotationElement = document.querySelector<HTMLDivElement>('#rotation')!
    const spacingElement = document.querySelector<HTMLDivElement>('#rotatable-spacing')!
    if (panel.currentSubtreePlacerConfiguration.rotatable) {
      rotationElement.style.display = 'block'
      spacingElement.style.display = 'block'
    } else {
      rotationElement.style.display = 'none'
      spacingElement.style.display = 'none'
    }
    await panel.panelChanged()
  })

  const rotationLeft = document.querySelector<HTMLButtonElement>('#rotation-left')!
  rotationLeft.addEventListener('click', () => {
    panel.graphComponent.selection.nodes.forEach((node) => {
      updateTransformation(node, SubtreeTransform.ROTATE_LEFT, panel)
    })
    panel.updateChangeListeners()
  })

  const rotationRight = document.querySelector<HTMLButtonElement>('#rotation-right')!
  rotationRight.addEventListener('click', () => {
    panel.graphComponent.selection.nodes.forEach((node) => {
      updateTransformation(node, SubtreeTransform.ROTATE_RIGHT, panel)
    })
    panel.updateChangeListeners()
  })

  const mirrorHorizontal = document.querySelector<HTMLButtonElement>('#mirror-horizontal')!
  mirrorHorizontal.addEventListener('click', () => {
    panel.graphComponent.selection.nodes.forEach((node) => {
      updateTransformation(node, SubtreeTransform.FLIP_Y, panel)
    })
    panel.updateChangeListeners()
  })

  const mirrorVertical = document.querySelector<HTMLButtonElement>('#mirror-vertical')!
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
function updateTransformation(
  node: INode,
  transform: SubtreeTransform,
  panel: SubtreePlacerPanel
): void {
  let rotatedSubtreePlacer: ISubtreePlacer | null = panel.subtreePlacers.get(node)
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
function getConfigurationName(subtreePlacer: ISubtreePlacer | null): string {
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
abstract class SubtreePlacerConfiguration {
  private _visible = false

  /**
   * Creates a new instance of {@link SubtreePlacerConfiguration}.
   */
  protected constructor(
    private readonly div: HTMLDivElement,
    subtreePlacer: ISubtreePlacer | null,
    panel: SubtreePlacerPanel
  ) {
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
  get rotatable(): boolean {
    return false
  }

  /**
   * Returns whether there is a preview for the layout with the represented subtree placer. This
   * is used to determine if the preview element should be visible.
   */
  get hasPreview(): boolean {
    return true
  }

  /**
   * Returns whether these subtree placer settings are currently active/visible.
   */
  get visible(): boolean {
    return this._visible
  }

  /**
   * Sets whether these subtree placer settings should be active/visible.
   * It also updates the description text.
   */
  set visible(visible: boolean) {
    this._visible = visible

    const description = document.querySelector<HTMLDivElement>('#subtree-placer-description')!
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
  createSubtreePlacer(): ISubtreePlacer | null {
    return null
  }

  /**
   * Updates the subtree placers of the selected nodes with the values in the panel.
   * Note that indeterminate properties in the panel should not be applied to the individual placer.
   */
  updateSubtreePlacers(
    selectedNodes: Iterable<INode>,
    subtreePlacers: Mapper<INode, ISubtreePlacer>
  ): void {}

  /**
   * Updates the configuration settings according to the given {@link ISubtreePlacer}.
   * This method is called when the configuration is changed or reset.
   */
  adoptSettings(subtreePlacers: ISubtreePlacer[]): void {}

  /**
   * Updates the UI after the configuration changed.
   * @see {@link SubtreePlacerConfiguration.adoptSettings}
   */
  updatePanel(): void {}

  /**
   * Wires up the UI for this configuration.
   */
  bindActions(panel: SubtreePlacerPanel): void {}

  /**
   * Returns the description text for this configuration.
   */
  getDescriptionText(): string {
    return ''
  }

  /**
   * Returns the subtree placer for this configuration with initial settings.
   */
  getDefaultSubtreePlacer(): ISubtreePlacer | null {
    return null
  }
}

/**
 * Base class for all subtree placer configurations representing subtree placers that support subtree
 * transformation.
 * It will handle the rotation and spacing properties by default.
 */
abstract class RotatableSubtreePlacerConfiguration extends SubtreePlacerConfiguration {
  protected spacing = 20
  protected indeterminateSpacing = false
  protected subtreeTransform: SubtreeTransform

  protected constructor(
    div: HTMLDivElement,
    subtreePlacer: ISubtreePlacer,
    panel: SubtreePlacerPanel
  ) {
    super(div, subtreePlacer, panel)
    this.subtreeTransform = SubtreeTransform.NONE
  }

  /**
   * Returns true for all configurations based on this class.
   */
  get rotatable(): boolean {
    return true
  }

  updatePanel(): void {
    updateInput('spacing', this.spacing, this.indeterminateSpacing)
  }

  bindActions(panel: SubtreePlacerPanel): void {
    const spacingElement = document.querySelector<HTMLInputElement>('#spacing')!
    spacingElement.addEventListener('change', async () => {
      if (this.visible) {
        this.spacing = Number.parseInt(spacingElement.value)
        this.indeterminateSpacing = false
        await panel.panelChanged()
      }
    })
    const spacingLabel = document.querySelector<HTMLLabelElement>('#spacing-label')!
    spacingElement.addEventListener('input', () => {
      if (this.visible) {
        spacingLabel.innerHTML = spacingElement.value
      }
    })
  }
}

class SingleLayerSubtreePlacerConfiguration extends RotatableSubtreePlacerConfiguration {
  private routingStyle: SingleLayerSubtreePlacerRoutingStyle
  private indeterminateRoutingStyle = false
  private rootAlignment: SingleLayerSubtreePlacerRootAlignment
  private indeterminateRootAlignment = false
  private minimumChannelSegmentDistance = 0
  private indeterminateMinimumChannelSegmentDistance = false

  /**
   * Creates a new instance of {@link SingleLayerSubtreePlacerConfiguration}.
   */
  constructor(panel: SubtreePlacerPanel) {
    super(
      document.querySelector<HTMLDivElement>('#single-layer-subtree-placer-settings')!,
      new SingleLayerSubtreePlacer(),
      panel
    )
    this.routingStyle = SingleLayerSubtreePlacerRoutingStyle.ORTHOGONAL
    this.rootAlignment = SingleLayerSubtreePlacerRootAlignment.CENTER
  }

  createSubtreePlacer(): SingleLayerSubtreePlacer {
    return new SingleLayerSubtreePlacer({
      edgeRoutingStyle: this.routingStyle,
      horizontalDistance: this.spacing,
      verticalDistance: this.spacing,
      minimumChannelSegmentDistance: this.minimumChannelSegmentDistance,
      rootAlignment: this.rootAlignment
    })
  }

  updateSubtreePlacers(
    selectedNodes: Iterable<INode>,
    subtreePlacers: Mapper<INode, ISubtreePlacer>
  ): void {
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

  adoptSettings(subtreePlacers: SingleLayerSubtreePlacer[]): void {
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

  updatePanel(): void {
    super.updatePanel()

    const routingStyle = document.querySelector<HTMLSelectElement>('#routing-style')!
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

    const rootAlignment = document.querySelector<HTMLSelectElement>('#root-alignment')!
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

  getDescriptionText(): string {
    return (
      '<h2>SingleLayerSubtreePlacer</h2>' +
      '<p>This subtree placer arranges the child nodes horizontally aligned below their root node. It offers options' +
      ' to change the orientation of the subtree, the edge routing style, and the alignment of the root node.</p>'
    )
  }

  bindActions(panel: SubtreePlacerPanel): void {
    super.bindActions(panel)

    const routingStyle = document.querySelector<HTMLSelectElement>('#routing-style')!
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

    const minimumChannelSegmentDistance = document.querySelector<HTMLInputElement>(
      '#minimum-channel-segment-distance'
    )!
    minimumChannelSegmentDistance.addEventListener('change', async () => {
      this.minimumChannelSegmentDistance = Number.parseInt(minimumChannelSegmentDistance.value)
      this.indeterminateMinimumChannelSegmentDistance = false
      await panel.panelChanged()
    })
    const minimumChannelSegmentDistanceLabel = document.querySelector<HTMLLabelElement>(
      '#minimum-channel-segment-distance-label'
    )!
    minimumChannelSegmentDistance.addEventListener('input', () => {
      minimumChannelSegmentDistanceLabel.innerHTML = minimumChannelSegmentDistance.value
    })

    const rootAlignment = document.querySelector<HTMLSelectElement>('#root-alignment')!
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

  getDefaultSubtreePlacer(): SingleLayerSubtreePlacer {
    return new SingleLayerSubtreePlacer()
  }
}

class BusSubtreePlacerConfiguration extends RotatableSubtreePlacerConfiguration {
  /**
   * Creates a new instance of BusSubtreePlacerConfiguration.
   */
  constructor(panel: SubtreePlacerPanel) {
    super(
      document.querySelector<HTMLDivElement>('#bus-subtree-placer-settings')!,
      new BusSubtreePlacer(),
      panel
    )
  }

  createSubtreePlacer(): BusSubtreePlacer {
    return new BusSubtreePlacer({ spacing: this.spacing })
  }

  updateSubtreePlacers(
    selectedNodes: Iterable<INode>,
    subtreePlacers: Mapper<INode, ISubtreePlacer>
  ): void {
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

  adoptSettings(subtreePlacers: BusSubtreePlacer[]): void {
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

  getDescriptionText(): string {
    return (
      '<h2>BusSubtreePlacer</h2>' +
      '<p>This subtree placer arranges the child nodes evenly distributed in two lines to the left and right of the root node.</p>'
    )
  }

  getDefaultSubtreePlacer(): BusSubtreePlacer {
    return new BusSubtreePlacer()
  }
}

class MultiLayerSubtreePlacerConfiguration extends RotatableSubtreePlacerConfiguration {
  private rootAlignment: MultiLayerSubtreePlacerRootAlignment =
    MultiLayerSubtreePlacerRootAlignment.BUS_ALIGNED
  private indeterminateRootAlignment = false
  private busPlacement: BusPlacement = BusPlacement.LEADING
  private indeterminateBusPlacement = false

  /**
   * Creates a new instance of {@link MultiLayerSubtreePlacerConfiguration}.
   */
  constructor(panel: SubtreePlacerPanel) {
    super(
      document.querySelector<HTMLDivElement>('#multi-layer-subtree-placer-settings')!,
      new MultiLayerSubtreePlacer(),
      panel
    )
  }

  createSubtreePlacer(): MultiLayerSubtreePlacer {
    return new MultiLayerSubtreePlacer({
      spacing: this.spacing,
      rootAlignment: this.rootAlignment,
      busPlacement: this.busPlacement
    })
  }

  updateSubtreePlacers(
    selectedNodes: Iterable<INode>,
    subtreePlacers: Mapper<INode, ISubtreePlacer>
  ): void {
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

  adoptSettings(subtreePlacers: MultiLayerSubtreePlacer[]): void {
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

  getDescriptionText(): string {
    return (
      '<h2>MultiLayerSubtreePlacer</h2>' +
      '<p>This subtree placer arranges the shapes of the children of a local root in multiple layers. It supports rotated' +
      ' subtrees and offers options to change the alignment of the root node.</p>'
    )
  }

  updatePanel(): void {
    super.updatePanel()

    const rootAlignment = document.querySelector<HTMLSelectElement>(
      '#multi-layer-subtree-placer-alignment'
    )!
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

    const busPlacement = document.querySelector<HTMLSelectElement>(
      '#multi-layer-subtree-placer-bus-placement'
    )!
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

  bindActions(panel: SubtreePlacerPanel) {
    super.bindActions(panel)
    const rootAlignment = document.querySelector<HTMLSelectElement>(
      '#multi-layer-subtree-placer-alignment'
    )!
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

    const busPlacement = document.querySelector<HTMLSelectElement>(
      '#multi-layer-subtree-placer-bus-placement'
    )!
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

  getDefaultSubtreePlacer(): MultiLayerSubtreePlacer {
    return new MultiLayerSubtreePlacer()
  }
}

class DoubleLayerSubtreePlacerConfiguration extends RotatableSubtreePlacerConfiguration {
  rootAlignment = SubtreeRootAlignment.CENTER
  indeterminateRootAlignment = false

  /**
   * Creates a new instance of {@link DoubleLayerSubtreePlacerConfiguration}.
   */
  constructor(panel: SubtreePlacerPanel) {
    super(
      document.querySelector<HTMLDivElement>('#double-layer-subtree-placer-settings')!,
      new DoubleLayerSubtreePlacer(),
      panel
    )
  }

  createSubtreePlacer(): DoubleLayerSubtreePlacer {
    return new DoubleLayerSubtreePlacer({
      spacing: this.spacing,
      rootAlignment: this.rootAlignment
    })
  }

  updateSubtreePlacers(
    selectedNodes: Iterable<INode>,
    subtreePlacers: Mapper<INode, ISubtreePlacer>
  ): void {
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

  adoptSettings(subtreePlacers: DoubleLayerSubtreePlacer[]): void {
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

  getDescriptionText(): string {
    return (
      '<h2>DoubleLayerSubtreePlacer</h2>' +
      '<p>This subtree placer arranges the child nodes staggered in two lines below their root node. It supports rotated' +
      ' subtrees and offers options to change the alignment of the root node.</p>'
    )
  }

  updatePanel(): void {
    super.updatePanel()

    const rootAlignment = document.querySelector<HTMLSelectElement>(
      '#double-layer-root-node-alignment'
    )!
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

  bindActions(panel: SubtreePlacerPanel): void {
    super.bindActions(panel)
    const rootAlignment = document.querySelector<HTMLSelectElement>(
      '#double-layer-root-node-alignment'
    )!
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

  getDefaultSubtreePlacer(): DoubleLayerSubtreePlacer {
    return new DoubleLayerSubtreePlacer()
  }
}

class LeftRightSubtreePlacerConfiguration extends RotatableSubtreePlacerConfiguration {
  private branchCount = 1
  private indeterminateBranchCount = false
  private placeLastOnBottom = true
  private indeterminatePlaceLastOnBottom = false

  /**
   * Creates a new instance of LeftRightSubtreePlacerConfiguration.
   */
  constructor(panel: SubtreePlacerPanel) {
    super(
      document.querySelector<HTMLDivElement>('#left-right-subtree-placer-settings')!,
      new LeftRightSubtreePlacer(),
      panel
    )
  }

  createSubtreePlacer(): LeftRightSubtreePlacer {
    return new LeftRightSubtreePlacer({
      spacing: this.spacing,
      placeLastOnBottom: this.placeLastOnBottom,
      branchCount: this.branchCount
    })
  }

  updateSubtreePlacers(
    selectedNodes: Iterable<INode>,
    subtreePlacers: Mapper<INode, ISubtreePlacer>
  ): void {
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

  adoptSettings(subtreePlacers: LeftRightSubtreePlacer[]) {
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

  getDescriptionText(): string {
    return (
      '<h2>LeftRightSubtreePlacer</h2>' +
      '<p>This subtree placer arranges the child nodes below their root node, left and right of the downward extending bus-like routing.</p>'
    )
  }

  updatePanel(): void {
    super.updatePanel()

    const lastOnBottom = document.querySelector<HTMLInputElement>('#last-on-bottom')!
    lastOnBottom.checked = this.placeLastOnBottom
    lastOnBottom.indeterminate = this.indeterminatePlaceLastOnBottom
    updateInput('branchCount', this.branchCount, this.indeterminateBranchCount)
  }

  bindActions(panel: SubtreePlacerPanel): void {
    super.bindActions(panel)
    const lastOnBottom = document.querySelector<HTMLInputElement>('#last-on-bottom')!
    lastOnBottom.addEventListener('change', async () => {
      this.placeLastOnBottom = lastOnBottom.checked
      this.indeterminatePlaceLastOnBottom = false
      await panel.panelChanged()
    })

    const branchCount = document.querySelector<HTMLInputElement>('#branch-count')!
    branchCount.addEventListener('change', async () => {
      this.branchCount = Number.parseInt(branchCount.value)
      this.indeterminateBranchCount = false
      await panel.panelChanged()
    })

    const branchCountLabel = document.querySelector<HTMLLabelElement>('#branch-count-label')!
    branchCount.addEventListener('input', () => {
      branchCountLabel.innerHTML = branchCount.value
    })
  }

  getDefaultSubtreePlacer(): LeftRightSubtreePlacer {
    return new LeftRightSubtreePlacer()
  }
}

class AspectRatioSubtreePlacerConfiguration extends SubtreePlacerConfiguration {
  private aspectRatio = 1
  private indeterminateAspectRatio = false
  private childAlignmentPolicy: AspectRatioChildAlignmentPolicy =
    AspectRatioChildAlignmentPolicy.LEADING
  private indeterminateChildAlignmentPolicy = false
  private childArrangement: ChildArrangementPolicy = ChildArrangementPolicy.HORIZONTAL
  private indeterminateHorizontal = false
  private horizontalDistance = 40
  private indeterminateHorizontalDistance = false
  private verticalDistance = 40
  private indeterminateVerticalDistance = false

  /**
   * Creates a new instance of {@link AspectRatioSubtreePlacerConfiguration}.
   */
  constructor(panel: SubtreePlacerPanel) {
    super(
      document.querySelector<HTMLDivElement>('#aspect-ratio-subtree-placer-settings')!,
      new AspectRatioSubtreePlacer(),
      panel
    )
  }

  createSubtreePlacer(): AspectRatioSubtreePlacer {
    return new AspectRatioSubtreePlacer({
      aspectRatio: this.aspectRatio,
      childAlignmentPolicy: this.childAlignmentPolicy,
      horizontalDistance: this.horizontalDistance,
      verticalDistance: this.verticalDistance,
      childArrangement: ChildArrangementPolicy.VERTICAL
    })
  }

  updateSubtreePlacers(
    selectedNodes: Iterable<INode>,
    subtreePlacers: Mapper<INode, ISubtreePlacer>
  ): void {
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

  adoptSettings(subtreePlacers: AspectRatioSubtreePlacer[]): void {
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

  getDescriptionText(): string {
    return (
      '<h2>AspectRatioSubtreePlacer</h2>' +
      '<p>This subtree placer arranges the child nodes such that a given aspect ratio is obeyed.</p>'
    )
  }

  updatePanel(): void {
    updateInput('aspect-ratio', this.aspectRatio, this.indeterminateAspectRatio)

    const fillStyle = document.querySelector<HTMLSelectElement>('#child-alignment-policy')!
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

    const childArrangement = document.querySelector<HTMLSelectElement>('#horizontal')!
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

  bindActions(panel: SubtreePlacerPanel): void {
    const aspectRatio = document.querySelector<HTMLInputElement>('#aspect-ratio')!
    aspectRatio.addEventListener('change', async () => {
      this.aspectRatio = parseFloat(aspectRatio.value)
      this.indeterminateAspectRatio = false
      await panel.panelChanged()
    })
    const aspectRatioLabel = document.querySelector<HTMLLabelElement>('#aspect-ratio-label')!
    aspectRatio.addEventListener('input', () => {
      aspectRatioLabel.innerHTML = aspectRatio.value
    })

    const fillStyle = document.querySelector<HTMLSelectElement>('#child-alignment-policy')!
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

    const horizontalDistance = document.querySelector<HTMLInputElement>(
      '#aspect-ratio-horizontal-distance'
    )!
    horizontalDistance.addEventListener('change', async () => {
      this.horizontalDistance = Number.parseInt(horizontalDistance.value)
      this.indeterminateHorizontalDistance = false
      await panel.panelChanged()
    })
    const horizontalDistanceLabel = document.querySelector<HTMLLabelElement>(
      '#aspect-ratio-horizontal-distance-label'
    )!
    horizontalDistance.addEventListener('input', () => {
      horizontalDistanceLabel.innerHTML = horizontalDistance.value
    })

    const verticalDistance = document.querySelector<HTMLInputElement>(
      '#aspect-ratio-vertical-distance'
    )!
    verticalDistance.addEventListener('change', async () => {
      this.verticalDistance = Number.parseInt(verticalDistance.value)
      this.indeterminateVerticalDistance = false
      await panel.panelChanged()
    })
    const verticalDistanceLabel = document.querySelector<HTMLInputElement>(
      '#aspect-ratio-vertical-distance-label'
    )!
    verticalDistance.addEventListener('input', () => {
      verticalDistanceLabel.innerHTML = verticalDistance.value
    })

    const childArrangement = document.querySelector<HTMLSelectElement>('#horizontal')!
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

  getDefaultSubtreePlacer(): AspectRatioSubtreePlacer {
    return new AspectRatioSubtreePlacer()
  }
}

class AssistantSubtreePlacerConfiguration extends RotatableSubtreePlacerConfiguration {
  private childSubtreePlacer: ISubtreePlacer = new SingleLayerSubtreePlacer()
  private indeterminateChildSubtreePlacer = false

  /**
   * Creates a new instance of {@link AssistantSubtreePlacerConfiguration}.
   */
  constructor(panel: SubtreePlacerPanel) {
    super(
      document.querySelector<HTMLDivElement>('#assistant-subtree-placer-settings')!,
      new AssistantSubtreePlacer(),
      panel
    )
  }

  createSubtreePlacer(): AssistantSubtreePlacer {
    return new AssistantSubtreePlacer({
      spacing: this.spacing,
      childSubtreePlacer: this.childSubtreePlacer
    })
  }

  updateSubtreePlacers(
    selectedNodes: Iterable<INode>,
    subtreePlacers: Mapper<INode, ISubtreePlacer>
  ): void {
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

  adoptSettings(subtreePlacers: AssistantSubtreePlacer[]): void {
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

  getDescriptionText(): string {
    return (
      '<h2>AssistantSubtreePlacer</h2>' +
      '<p>This subtree placer delegates to two different subtree placers to arrange the child nodes: Nodes that are marked' +
      ' as <code>Assistants</code> are placed using the <code>LeftRightSubtreePlacer</code>. The other children are arranged' +
      ' below the assistant nodes using the child subtree placer.</p>'
    )
  }

  updatePanel(): void {
    super.updatePanel()

    const childSubtreePlacer = document.querySelector<HTMLSelectElement>('#child-subtree-placer')!
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

  bindActions(panel: SubtreePlacerPanel): void {
    super.bindActions(panel)
    const childSubtreePlacer = document.querySelector<HTMLSelectElement>('#child-subtree-placer')!
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

  getDefaultSubtreePlacer(): AssistantSubtreePlacer {
    return new AssistantSubtreePlacer()
  }
}

class CompactSubtreePlacerConfiguration extends SubtreePlacerConfiguration {
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
   * Creates a new instance of AspectRatioSubtreePlacerConfiguration.
   */
  constructor(panel: SubtreePlacerPanel) {
    super(
      document.querySelector<HTMLDivElement>('#compact-subtree-placer-settings')!,
      new CompactSubtreePlacer(),
      panel
    )
  }

  createSubtreePlacer(): CompactSubtreePlacer {
    return new CompactSubtreePlacer({
      preferredAspectRatio: this.preferredAspectRatio,
      verticalDistance: this.verticalDistance,
      horizontalDistance: this.horizontalDistance,
      minimumFirstSegmentLength: this.minimumFirstSegmentLength,
      minimumLastSegmentLength: this.minimumLastSegmentLength
    })
  }

  updateSubtreePlacers(
    selectedNodes: Iterable<INode>,
    subtreePlacers: Mapper<INode, ISubtreePlacer>
  ): void {
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

  adoptSettings(subtreePlacers: CompactSubtreePlacer[]): void {
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

  getDescriptionText(): string {
    return (
      '<h2>CompactSubtreePlacer</h2>' +
      '<p>This subtree placer uses a dynamic optimization approach that chooses a placement strategy of the children ' +
      'of the associated local root such that the overall result is compact with respect to a specified aspect ratio.</p>'
    )
  }

  updatePanel(): void {
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

  bindActions(panel: SubtreePlacerPanel): void {
    const preferredAspectRatio = document.querySelector<HTMLInputElement>(
      '#compact-preferred-aspect-ratio'
    )!
    preferredAspectRatio.addEventListener('change', async () => {
      this.preferredAspectRatio = Number.parseInt(preferredAspectRatio.value)
      this.indeterminatePreferredAspectRatio = false
      await panel.panelChanged()
    })
    const preferredAspectRatioLabel = document.querySelector<HTMLLabelElement>(
      '#compact-preferred-aspect-ratio-label'
    )!
    preferredAspectRatio.addEventListener('input', async () => {
      preferredAspectRatioLabel.innerHTML = preferredAspectRatio.value
    })

    const verticalDistance = document.querySelector<HTMLInputElement>('#compact-vertical-distance')!
    verticalDistance.addEventListener('change', async () => {
      this.verticalDistance = Number.parseInt(verticalDistance.value)
      this.indeterminateVerticalDistance = false
      await panel.panelChanged()
    })
    const verticalDistanceLabel = document.querySelector<HTMLLabelElement>(
      '#compact-vertical-distance-label'
    )!
    verticalDistance.addEventListener('input', async () => {
      verticalDistanceLabel.innerHTML = verticalDistance.value
    })

    const horizontalDistance = document.querySelector<HTMLInputElement>(
      '#compact-horizontal-distance'
    )!
    horizontalDistance.addEventListener('change', async () => {
      this.horizontalDistance = Number.parseInt(horizontalDistance.value)
      this.indeterminateHorizontalDistance = false
      await panel.panelChanged()
    })
    const horizontalDistanceLabel = document.querySelector<HTMLLabelElement>(
      '#compact-horizontal-distance-label'
    )!
    horizontalDistance.addEventListener('input', async () => {
      horizontalDistanceLabel.innerHTML = horizontalDistance.value
    })

    const minimumFirstSegmentLength = document.querySelector<HTMLInputElement>(
      '#compact-minimum-first-segment-length'
    )!
    minimumFirstSegmentLength.addEventListener('change', async () => {
      this.minimumFirstSegmentLength = Number.parseInt(minimumFirstSegmentLength.value)
      this.indeterminateMinimumFirstSegmentLength = false
      await panel.panelChanged()
    })
    const minimumFirstSegmentLengthLabel = document.querySelector<HTMLLabelElement>(
      '#compact-minimum-first-segment-length-label'
    )!
    minimumFirstSegmentLength.addEventListener('input', async () => {
      minimumFirstSegmentLengthLabel.innerHTML = minimumFirstSegmentLength.value
    })

    const minimumLastSegmentLength = document.querySelector<HTMLInputElement>(
      '#compact-minimum-last-segment-length'
    )!
    minimumLastSegmentLength.addEventListener('change', async () => {
      this.minimumLastSegmentLength = Number.parseInt(minimumLastSegmentLength.value)
      this.indeterminateMinimumLastSegmentLength = false
      await panel.panelChanged()
    })
    const minimumLastSegmentLengthLabel = document.querySelector<HTMLLabelElement>(
      '#compact-minimum-last-segment-length-label'
    )!
    minimumLastSegmentLength.addEventListener('input', async () => {
      minimumLastSegmentLengthLabel.innerHTML = minimumLastSegmentLength.value
    })
  }

  getDefaultSubtreePlacer(): CompactSubtreePlacer {
    return new CompactSubtreePlacer()
  }
}

class MultipleSubtreePlacerConfiguration extends SubtreePlacerConfiguration {
  /**
   * Creates a new instance of MultipleSubtreePlacerConfiguration.
   */
  constructor(panel: SubtreePlacerPanel) {
    super(document.querySelector<HTMLDivElement>('#multiple-subtree-placer-settings')!, null, panel)
  }

  get hasPreview(): boolean {
    return false
  }

  createSubtreePlacer(): ISubtreePlacer | null {
    return null
  }

  getDescriptionText(): string {
    return (
      '<h2>Multiple Values</h2>' +
      '<p>You have selected nodes with different <code>SubtreePlacer</code>s. To assign the same ' +
      '<code>SubtreePlacer</code> to all of these nodes, choose one form the selection box.</p>'
    )
  }

  adoptSettings(subtreePlacers: ISubtreePlacer[]): void {}

  bindActions(panel: SubtreePlacerPanel): void {}

  getDefaultSubtreePlacer(): ISubtreePlacer | null {
    return null
  }

  updateSubtreePlacers(
    selectedNodes: Iterable<INode>,
    subtreePlacers: Mapper<INode, ISubtreePlacer>
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
