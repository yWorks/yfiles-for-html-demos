/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import type { WebGL2ShapeNodeShapeStringValues } from 'yfiles'
import {
  AdjacencyTypes,
  Color,
  DefaultLabelStyle,
  GraphComponent,
  GraphItemTypes,
  GraphMLIOHandler,
  GraphViewerInputMode,
  ICommand,
  IEdge,
  IGraph,
  ILabel,
  IModelItem,
  INode,
  InteriorLabelModel,
  License,
  WebGL2Animation,
  WebGL2AnimationDirection,
  WebGL2AnimationEasing,
  WebGL2AnimationTiming,
  WebGL2ArcEdgeStyle,
  WebGL2BeaconAnimationType,
  WebGL2DefaultLabelStyle,
  WebGL2Effect,
  WebGL2FadeAnimationType,
  WebGL2GraphModelManager,
  WebGL2LabelShape,
  WebGL2NodeIndicatorStyle,
  WebGL2PulseAnimationType,
  WebGL2ScaleAnimationType,
  WebGL2SelectionIndicatorManager,
  WebGL2ShakeAnimationType,
  WebGL2ShapeNodeStyle,
  WebGL2Stroke
} from 'yfiles'

import {
  bindChangeListener,
  bindCommand,
  checkWebGL2Support,
  reportDemoError,
  showApp
} from '../../resources/demo-app'
import { fetchLicense } from '../../resources/fetch-license'
import { enableSingleSelection } from '../../input/singleselection/SingleSelectionHelper'

type BaseAnimation =
  | 'pulse'
  | 'pulse-effect'
  | 'fade'
  | 'fade-effect'
  | 'shake'
  | 'scale'
  | 'scale-effect'
  | 'beacon'
  | 'halo'
type FadeType =
  | 'to color'
  | 'to gray'
  | 'to semi-transparent'
  | 'to invisible'
  | 'from color'
  | 'from gray'
  | 'from semi-transparent'
  | 'from invisible'
type PulseType = 'grow' | 'shrink' | 'both' | 'grow-relative' | 'shrink-relative' | 'both-relative'
type ShakeType = 'horizontal' | 'vertical'
type ScaleType = 'scale-grow' | 'scale-shrink' | 'scale-grow-relative' | 'scale-shrink-relative'
type BeaconType = 'fade' | 'reverse-fade' | 'no-fade'
type AnimationType = FadeType | PulseType | ShakeType | ScaleType | BeaconType

let connectedComponents: Component[]
let currentSelectedItem: IModelItem | undefined

/**
 * Starts the demo.
 */
async function run(): Promise<void> {
  if (!checkWebGL2Support()) {
    showApp()
    return
  }

  License.value = await fetchLicense()
  const graphComponent = new GraphComponent('#graphComponent')

  graphComponent.graphModelManager = new WebGL2GraphModelManager()
  graphComponent.selectionIndicatorManager = new WebGL2SelectionIndicatorManager({
    nodeStyle: new WebGL2NodeIndicatorStyle({
      type: 'solid',
      primaryColor: '#666',
      thickness: 2
    })
  })

  // create an initial sample graph
  await loadGraph(graphComponent)
  graphComponent.fitGraphBounds()

  connectedComponents = calculateComponents(graphComponent.graph)
  setWebGLStyles(graphComponent, connectedComponents, 'ellipse')

  configureInteraction(graphComponent)

  configureUI(graphComponent)

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Configures the UI elements.
 */
function configureUI(graphComponent: GraphComponent) {
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindChangeListener("input[data-command='useLabelsChanged']", value => {
    changeLabels(graphComponent, value as boolean)
  })

  bindChangeListener("select[data-command='ShapeChanged']", value => {
    setWebGLStyles(graphComponent, connectedComponents, value as WebGL2ShapeNodeShapeStringValues)
    graphComponent.invalidate()
  })

  document
    .getElementById('animationConfiguration')!
    .querySelectorAll<HTMLSelectElement>('select')
    .forEach(element => {
      element.addEventListener('change', () => {
        changeAnimation(graphComponent, currentSelectedItem)
      })
    })

  const animationDurationSelect = document.querySelector<HTMLSelectElement>('#animationDuration')!
  const iterationCountSelect = document.querySelector<HTMLSelectElement>('#iterationCount')!
  const animationDirectionSelect = document.querySelector<HTMLSelectElement>('#animationDirection')!
  const animationEasingSelect = document.querySelector<HTMLSelectElement>('#animationEasing')!
  const beaconPulseCountSelect = document.querySelector<HTMLSelectElement>('#pulseCount')!
  const beaconPulseWidthSelect = document.querySelector<HTMLSelectElement>('#pulseWidth')!
  const beaconSmoothCheckbox = document.querySelector<HTMLInputElement>('#beaconSmooth')!

  const animations: BaseAnimation[] = ['fade', 'pulse', 'beacon', 'scale', 'shake']
  const options: Map<BaseAnimation, HTMLDivElement> = new Map<BaseAnimation, HTMLDivElement>(
    animations.map(animation => [
      animation,
      document.getElementById(`${animation}-options`) as HTMLDivElement
    ])
  )
  options.set('fade-effect', document.getElementById(`fade-options`) as HTMLDivElement)
  options.set('pulse-effect', document.getElementById(`pulse-options`) as HTMLDivElement)
  options.set('scale-effect', document.getElementById(`scale-options`) as HTMLDivElement)

  const magnitudeOptions = document.querySelector<HTMLDivElement>('#magnitude-options')!
  const animatedElementOptions = document.querySelector<HTMLDivElement>(
    '#animated-elements-options'
  )!

  const useViewCoordinatesOptions = document.querySelector<HTMLDivElement>(
    '#use-view-coordinates-options'
  )!

  const pulseTypeSelect = document.querySelector<HTMLSelectElement>('#pulseType')!
  pulseTypeSelect.addEventListener('change', e => {
    const select = e.target as HTMLSelectElement
    updateMagnitudeOptions(select.value as PulseType)
  })

  const scaleTypeSelect = document.querySelector<HTMLSelectElement>('#scaleType')!
  scaleTypeSelect.addEventListener('change', e => {
    const select = e.target as HTMLSelectElement
    updateMagnitudeOptions(select.value as PulseType)
  })

  const baseAnimationSelect = document.querySelector<HTMLSelectElement>('#baseAnimation')!
  baseAnimationSelect.addEventListener('change', e => {
    const select = e.target as HTMLSelectElement
    const animationType = select.value as BaseAnimation
    const animationMagnitudeSelect =
      document.querySelector<HTMLSelectElement>('#animationMagnitude')!

    // hide all specific options
    for (const value of options.values()) {
      value.style.display = 'none'
    }
    // show specific applicable option
    for (const [key, value] of options.entries()) {
      if (key === animationType) {
        value.style.display = 'block'
      }
    }

    updateMagnitudeOptions(select.value as PulseType)

    switch (animationType) {
      case 'pulse':
        magnitudeOptions.style.display = 'block'
        animatedElementOptions.style.display = 'block'
        animationMagnitudeSelect.value = '5'
        animationDurationSelect.value = '1s'
        iterationCountSelect.value = '10'
        animationDirectionSelect.value = 'normal'
        animationEasingSelect.value = 'ease-in-out'
        useViewCoordinatesOptions.style.display = 'block'
        break
      case 'pulse-effect':
        magnitudeOptions.style.display = 'block'
        animatedElementOptions.style.display = 'none'
        animationMagnitudeSelect.value = '5'
        animationDurationSelect.value = '1s'
        iterationCountSelect.value = '10'
        animationDirectionSelect.value = 'normal'
        animationEasingSelect.value = 'ease-in-out'
        useViewCoordinatesOptions.style.display = 'block'
        break
      case 'scale':
        magnitudeOptions.style.display = 'block'
        animatedElementOptions.style.display = 'block'
        animationDurationSelect.value = '500ms'
        iterationCountSelect.value = '1'
        animationDirectionSelect.value = 'normal'
        animationEasingSelect.value = 'ease'
        useViewCoordinatesOptions.style.display = 'block'
        break
      case 'scale-effect':
        magnitudeOptions.style.display = 'block'
        animatedElementOptions.style.display = 'none'
        animationDurationSelect.value = '500ms'
        iterationCountSelect.value = '1'
        animationDirectionSelect.value = 'normal'
        animationEasingSelect.value = 'ease'
        useViewCoordinatesOptions.style.display = 'block'
        break
      case 'fade':
        magnitudeOptions.style.display = 'none'
        animatedElementOptions.style.display = 'block'
        animationDurationSelect.value = '1s'
        iterationCountSelect.value = '1'
        animationDirectionSelect.value = 'normal'
        animationEasingSelect.value = 'ease'
        useViewCoordinatesOptions.style.display = 'none'
        break
      case 'fade-effect':
        magnitudeOptions.style.display = 'none'
        animatedElementOptions.style.display = 'none'
        animationDurationSelect.value = '1s'
        iterationCountSelect.value = '1'
        animationDirectionSelect.value = 'normal'
        animationEasingSelect.value = 'ease'
        useViewCoordinatesOptions.style.display = 'none'
        break
      case 'shake':
        magnitudeOptions.style.display = 'block'
        animatedElementOptions.style.display = 'block'
        animationMagnitudeSelect.value = '5'
        animationDurationSelect.value = '100ms'
        iterationCountSelect.value = '10'
        animationDirectionSelect.value = 'normal'
        useViewCoordinatesOptions.style.display = 'block'
        break
      case 'beacon':
        magnitudeOptions.style.display = 'block'
        animatedElementOptions.style.display = 'none'
        animationMagnitudeSelect.value = '20'
        beaconPulseCountSelect.value = '3'
        beaconPulseWidthSelect.value = '2'
        beaconSmoothCheckbox.checked = true
        animationDurationSelect.value = '2s'
        iterationCountSelect.value = 'infinity'
        animationDirectionSelect.value = 'normal'
        animationEasingSelect.value = 'ease-in-out'
        useViewCoordinatesOptions.style.display = 'block'
        break
      case 'halo':
        magnitudeOptions.style.display = 'block'
        animatedElementOptions.style.display = 'none'
        animationMagnitudeSelect.value = '20'
        beaconSmoothCheckbox.checked = true
        ;(document.getElementById('beaconColor') as HTMLInputElement).style.display = 'block'
        animationDurationSelect.value = '500ms'
        iterationCountSelect.value = '1'
        animationDirectionSelect.value = 'normal'
        animationEasingSelect.value = 'ease-in-out'
        useViewCoordinatesOptions.style.display = 'block'
        break
    }
  })
}

/**
 * Sets appropriate values for the magnitude selection dropdown.
 */
function updateMagnitudeOptions(type: PulseType | ScaleType): any {
  let values: number[]
  switch (type) {
    case 'both':
    case 'shrink':
    case 'grow':
      values = [1, 2, 5, 10, 20, 30, 60]
      break
    case 'scale-shrink-relative':
    case 'shrink-relative':
      values = [0, 0.5, 0.75]
      break
    case 'scale-grow-relative':
    case 'grow-relative':
      values = [1, 2, 3, 4]
      break
    case 'both-relative':
      values = [0, 0.5, 0.75, 1, 2, 3, 4]
      break
    default:
      values = [1, 2, 5, 10, 20, 30, 60]
      break
  }

  const animationMagnitudeSelect = document.querySelector<HTMLSelectElement>('#animationMagnitude')!

  for (let i = animationMagnitudeSelect.options.length - 1; i >= 0; i--) {
    animationMagnitudeSelect.options.remove(i)
  }
  for (let i = 0; i < values.length; i++) {
    const option = new Option()
    option.value = String(values[i])
    option.text = String(values[i])
    option.selected = i == 0
    animationMagnitudeSelect.options.add(option)
  }
}

/**
 * Sets the WebGL2 node and edge styles with a distinct color per graph component.
 */
function setWebGLStyles(
  graphComponent: GraphComponent,
  connectedComponents: Array<Component>,
  nodeShape: WebGL2ShapeNodeShapeStringValues
) {
  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager

  const fillColors = [
    Color.GOLD,
    Color.ROYAL_BLUE,
    Color.CRIMSON,
    Color.DARK_TURQUOISE,
    Color.CORNFLOWER_BLUE
  ]
  const strokeColors = [
    Color.ORANGE,
    Color.DARK_BLUE,
    Color.DARK_RED,
    Color.DARK_CYAN,
    Color.DARK_BLUE
  ]

  const nodeLabelParameter =
    nodeShape === 'triangle' ? InteriorLabelModel.SOUTH : InteriorLabelModel.CENTER

  connectedComponents.forEach((component, idx) => {
    const fillColor = fillColors[idx % connectedComponents.length]
    const strokeColor = strokeColors[idx % connectedComponents.length]
    component.nodes.forEach(node => {
      gmm.setStyle(
        node,
        new WebGL2ShapeNodeStyle({
          shape: nodeShape,
          fill: fillColor,
          stroke: new WebGL2Stroke(strokeColor),
          effect: WebGL2Effect.AMBIENT_FILL_COLOR
        })
      )
      node.labels.forEach(label => {
        gmm.setStyle(
          label,
          new WebGL2DefaultLabelStyle({
            shape: WebGL2LabelShape.ROUND_RECTANGLE,
            textColor: strokeColor,
            backgroundColor: Color.WHITE,
            backgroundStroke: new WebGL2Stroke(strokeColor),
            insets: 3
          })
        )
        graphComponent.graph.setLabelLayoutParameter(label, nodeLabelParameter)
      })
    })
    component.edges.forEach(edge => {
      gmm.setStyle(
        edge,
        new WebGL2ArcEdgeStyle({
          stroke: new WebGL2Stroke(fillColor, 5),
          sourceArrow: 'none',
          targetArrow: 'none',
          height: 10
        })
      )
    })
  })
}

const componentToAnimationMap = new Map<Component, WebGL2Animation>()

/**
 * Gets the component of the given item.
 */
function getComponentForItem(item: IModelItem | null | undefined): null | Component {
  if (item == null) {
    return null
  }
  if (item instanceof INode) {
    return item.tag as Component
  }
  if (item instanceof IEdge) {
    return getComponentForItem(item.sourceNode)
  }
  if (item instanceof ILabel) {
    return getComponentForItem(item.owner)
  }
  return null
}

/**
 * Starts a new animation.
 */
function startNewAnimation(graphComponent: GraphComponent, component: Component) {
  const applyToComponentMembers =
    document.querySelector<HTMLInputElement>('input[name="animatedElements"]:checked')!.id ===
    'componentMembers'
  const animateNodes = getAnimateNodes()
  const animateEdges = document.querySelector<HTMLInputElement>('input[id="animateEdges"]')!.checked
  const animateLabels = document.querySelector<HTMLInputElement>(
    'input[id="animateLabels"]'
  )!.checked
  if (!animateNodes && !animateEdges && !animateLabels) {
    return Promise.resolve(false)
  }

  const animation = getAnimation(graphComponent.graphModelManager as WebGL2GraphModelManager)
  componentToAnimationMap.set(component, animation)

  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager

  const animations = [animation]
  const nodesToAnimate = applyToComponentMembers
    ? component.nodes
    : graphComponent.graph.nodes.filter(node => !component.nodes.has(node))
  const edgesToAnimate = applyToComponentMembers
    ? component.edges
    : graphComponent.graph.edges.filter(edge => !component.edges.has(edge))

  nodesToAnimate.forEach((node: INode) => {
    if (animateNodes) {
      gmm.setAnimations(node, animations)
    }
    if (animateLabels) {
      node.labels.forEach(label => {
        gmm.setAnimations(label, animations)
      })
    }
  })
  edgesToAnimate.forEach((edge: IEdge) => {
    if (animateEdges) {
      gmm.setAnimations(edge, animations)
    }
    if (animateLabels) {
      edge.labels.forEach(label => {
        gmm.setAnimations(label, animations)
      })
    }
  })

  return animation.start()
}

/**
 * Configures the interaction behaviour.
 */
function configureInteraction(graphComponent: GraphComponent) {
  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager

  // Allow only viewing of the graph
  const gvim = new GraphViewerInputMode({
    selectableItems: 'node',
    focusableItems: 'none'
  })

  gvim.itemHoverInputMode.enabled = true
  gvim.itemHoverInputMode.hoverItems =
    GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.LABEL

  // Add the configured animation either to the whole component the hovered item
  // is part of or to the rest of the graph.
  gvim.itemHoverInputMode.addHoveredItemChangedListener((_, args) => {
    stopAnimation(graphComponent, args.oldItem)
    startAnimation(graphComponent, args.item)
  })

  gvim.addMultiSelectionFinishedListener((_, args) => {
    const item = args.selection.at(0)
    stopAnimation(graphComponent, currentSelectedItem)
    startAnimation(graphComponent, item)
    currentSelectedItem = item
  })

  graphComponent.inputMode = gvim
  enableSingleSelection(graphComponent)
}

/**
 * Stops the animation of the given component, if existent.
 */
function stopAnimation(graphComponent: GraphComponent, item: IModelItem | null | undefined) {
  const component = getComponentForItem(item)
  if (component == null) {
    return
  }

  const existingAnimation = componentToAnimationMap.get(component)
  existingAnimation?.stop().then(reachedFinalState => {
    // If we haven't reached the final state, this is because we have been restarted in
    // tryStartAnimation, and we should not yet remove the animation.
    // This will happen in a later "start" or "stop" call, instead.
    if (reachedFinalState) {
      removeAnimation(graphComponent, existingAnimation)
      componentToAnimationMap.delete(component)
    }
  })
}

/**
 * Starts a new animation for the given component, or re-starts the existing one.
 */
function startAnimation(graphComponent: GraphComponent, item: IModelItem | null | undefined) {
  const component = getComponentForItem(item)
  if (component == null) {
    return
  }

  const existingAnimation = componentToAnimationMap.get(component)
  if (existingAnimation) {
    existingAnimation.start().catch(console.log)
    return
  }

  startNewAnimation(graphComponent, component)
}

/**
 * Starts a new animation for the given component with the current UI settings.
 * If there is an existing component, that is stopped, first.
 */
function changeAnimation(graphComponent: GraphComponent, item: IModelItem | null | undefined) {
  const component = getComponentForItem(item)
  if (component == null) {
    return
  }

  const existingAnimation = componentToAnimationMap.get(component)
  return existingAnimation == null
    ? startNewAnimation(graphComponent, component)
    : existingAnimation.stop().then(reachedInitialState => {
        if (reachedInitialState) {
          removeAnimation(graphComponent, existingAnimation)
          componentToAnimationMap.delete(component)
          startNewAnimation(graphComponent, component)
        }
      })
}

/**
 * Removes all animations from all nodes and edges.
 */
function removeAnimation(graphComponent: GraphComponent, animation: WebGL2Animation) {
  const graph = graphComponent.graph
  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager
  graph.nodes.forEach(node => {
    const currentAnimations = gmm.getAnimations(node)
    if (currentAnimations.length) {
      gmm.setAnimations(
        node,
        currentAnimations.filter(currentAnimation => currentAnimation !== animation)
      )
    }
  })
  graph.edges.forEach(edge => {
    const currentAnimations = gmm.getAnimations(edge)
    if (currentAnimations.length) {
      gmm.setAnimations(
        edge,
        currentAnimations.filter(currentAnimation => currentAnimation !== animation)
      )
    }
  })
}

/**
 * Returns whether to animate nodes.
 */
function getAnimateNodes(): boolean {
  const checkBox = document.querySelector('input[id="animateNodes"]') as HTMLInputElement
  const config = getAnimationConfiguration()
  const alwaysNode =
    config.baseAnimation == 'pulse-effect' ||
    config.baseAnimation == 'fade-effect' ||
    config.baseAnimation == 'scale-effect' ||
    config.baseAnimation == 'beacon' ||
    config.baseAnimation == 'halo'
  return checkBox.checked || alwaysNode
}

/**
 * Returns an animation type depending on the inputs.
 * @param animationType The fade type
 */
function getAnimationType(
  animationType: AnimationType
):
  | WebGL2FadeAnimationType
  | WebGL2PulseAnimationType
  | WebGL2BeaconAnimationType
  | WebGL2ShakeAnimationType
  | WebGL2ScaleAnimationType {
  switch (animationType) {
    case 'to color':
      return WebGL2FadeAnimationType.FADE_TO_COLOR
    case 'to gray':
      return WebGL2FadeAnimationType.FADE_TO_GRAY
    case 'to semi-transparent':
      return WebGL2FadeAnimationType.FADE_OUT
    case 'to invisible':
      return WebGL2FadeAnimationType.FADE_OUT
    case 'from color':
      return WebGL2FadeAnimationType.FADE_FROM_COLOR
    case 'from gray':
      return WebGL2FadeAnimationType.FADE_FROM_GRAY
    case 'from semi-transparent':
      return WebGL2FadeAnimationType.FADE_IN
    case 'from invisible':
      return WebGL2FadeAnimationType.FADE_IN
    case 'grow':
      return WebGL2PulseAnimationType.GROW
    case 'shrink':
      return WebGL2PulseAnimationType.SHRINK
    case 'both':
      return WebGL2PulseAnimationType.BOTH
    case 'grow-relative':
      return WebGL2PulseAnimationType.GROW_RELATIVE
    case 'shrink-relative':
      return WebGL2PulseAnimationType.SHRINK_RELATIVE
    case 'both-relative':
      return WebGL2PulseAnimationType.BOTH_RELATIVE
    case 'fade':
      return WebGL2BeaconAnimationType.FADE
    case 'no-fade':
      return WebGL2BeaconAnimationType.NO_FADE
    case 'reverse-fade':
      return WebGL2BeaconAnimationType.REVERSE_FADE
    case 'scale-grow':
      return WebGL2ScaleAnimationType.GROW
    case 'scale-shrink':
      return WebGL2ScaleAnimationType.SHRINK
    case 'scale-grow-relative':
      return WebGL2ScaleAnimationType.GROW_RELATIVE
    case 'scale-shrink-relative':
      return WebGL2ScaleAnimationType.SHRINK_RELATIVE
    case 'horizontal':
      return WebGL2ShakeAnimationType.HORIZONTAL
    case 'vertical':
      return WebGL2ShakeAnimationType.VERTICAL
  }
  return WebGL2FadeAnimationType.FADE_OUT
}

/**
 * Gets the colors from the fade to color pickers
 */
function getConfiguredFadeColors(): { color1: Color; color2: Color } {
  const color1pickerValue = (document.getElementById('fadeColor1') as HTMLInputElement).value
  const color2pickerValue = (document.getElementById('fadeColor2') as HTMLInputElement).value
  const chosenFadeType = (document.getElementById('fadeType') as HTMLSelectElement)
    .value as FadeType
  const isSemiTransparent =
    chosenFadeType === 'from semi-transparent' || chosenFadeType === 'to semi-transparent'
  return {
    color1: isSemiTransparent ? Color.fromRGBA(0, 0, 0, 0.3) : Color.from(color1pickerValue),
    color2: Color.from(color2pickerValue)
  }
}

/**
 * Returns the configurations made in the UI in one object.
 */
function getAnimationConfiguration(): {
  baseAnimation: BaseAnimation
  animationType:
    | WebGL2FadeAnimationType
    | WebGL2PulseAnimationType
    | WebGL2ShakeAnimationType
    | WebGL2ScaleAnimationType
    | WebGL2BeaconAnimationType
  animationMagnitude: number
  animationDuration: string
  iterationCount: number
  animationDirection: WebGL2AnimationDirection
  easing: WebGL2AnimationEasing
  viewCoordinates: boolean
  color1: Color | null
  color2: Color | null
  count: number
  pulseWidth: number
  pulseDistance: number
  smooth: boolean
} {
  const baseAnimation = document.querySelector<HTMLSelectElement>('#baseAnimation')!
    .value as BaseAnimation

  const colors = getConfiguredFadeColors()

  let animationType
  switch (baseAnimation) {
    default:
    case 'pulse':
    case 'pulse-effect':
      animationType = getAnimationType(
        document.querySelector<HTMLSelectElement>('#pulseType')!.value as AnimationType
      )
      break
    case 'fade':
    case 'fade-effect':
      animationType = getAnimationType(
        document.querySelector<HTMLSelectElement>('#fadeType')!.value as AnimationType
      )
      break
    case 'shake':
      animationType = getAnimationType(
        document.querySelector<HTMLSelectElement>('#shakeType')!.value as AnimationType
      )
      break
    case 'beacon':
      animationType = getAnimationType(
        document.querySelector<HTMLSelectElement>('#beaconType')!.value as AnimationType
      )
      break
    case 'scale':
    case 'scale-effect':
      animationType = getAnimationType(
        document.querySelector<HTMLSelectElement>('#scaleType')!.value as AnimationType
      )
      break
  }
  const animationMagnitude = Number(
    document.querySelector<HTMLSelectElement>('#animationMagnitude')!.value
  )
  const animationDuration = document.querySelector<HTMLSelectElement>('#animationDuration')!.value
  const count = document.querySelector<HTMLSelectElement>('#iterationCount')!.value
  const iterationCount = count === 'infinity' ? 255 : parseInt(count)

  let animationDirection
  const direction = document.querySelector<HTMLSelectElement>('#animationDirection')!.value
  switch (direction) {
    default:
    case 'normal':
      animationDirection = WebGL2AnimationDirection.NORMAL
      break
    case 'reverse':
      animationDirection = WebGL2AnimationDirection.REVERSE
      break
    case 'alternate':
      animationDirection = WebGL2AnimationDirection.ALTERNATE
      break
    case 'alternate-reverse':
      animationDirection = WebGL2AnimationDirection.ALTERNATE_REVERSE
      break
  }

  let easing
  const easingValue = document.querySelector<HTMLSelectElement>('#animationEasing')!.value
  switch (easingValue) {
    default:
    case 'linear':
      easing = WebGL2AnimationEasing.LINEAR
      break
    case 'step':
      easing = WebGL2AnimationEasing.STEP
      break
    case 'ease':
      easing = WebGL2AnimationEasing.EASE
      break
    case 'ease-in-out':
      easing = WebGL2AnimationEasing.EASE_IN_OUT
      break
    case 'ease-in':
      easing = WebGL2AnimationEasing.EASE
      break
    case 'ease-out':
      easing = WebGL2AnimationEasing.EASE_OUT
      break
  }

  const colorFade =
    animationType === WebGL2FadeAnimationType.FADE_TO_COLOR ||
    animationType === WebGL2FadeAnimationType.FADE_FROM_COLOR ||
    animationType === WebGL2FadeAnimationType.FADE_OUT ||
    animationType === WebGL2FadeAnimationType.FADE_IN

  return {
    baseAnimation,
    animationType,
    animationDirection,
    easing,
    animationMagnitude,
    animationDuration,
    iterationCount,
    color1: colorFade
      ? colors.color1
      : baseAnimation === 'beacon'
      ? Color.from((document.getElementById('beaconColor') as HTMLInputElement).value)
      : null,
    color2: colorFade ? colors.color2 : null,
    count: Number((document.getElementById('pulseCount') as HTMLSelectElement).value),
    pulseWidth: Number((document.getElementById('pulseWidth') as HTMLSelectElement).value),
    pulseDistance: Number((document.getElementById('pulseDistance') as HTMLSelectElement).value),
    viewCoordinates: Boolean(
      (document.getElementById('viewCoordinates') as HTMLInputElement).checked
    ),
    smooth: Boolean((document.getElementById('beaconSmooth') as HTMLInputElement).checked)
  }
}

/**
 * Returns the {@link WebGL2Animation} according to the currently configured values.
 */
function getAnimation(gmm: WebGL2GraphModelManager): WebGL2Animation {
  const config = getAnimationConfiguration()
  const timing = new WebGL2AnimationTiming({
    duration: config.animationDuration,
    easing: config.easing,
    iterationCount: config.iterationCount,
    direction: config.animationDirection
  })

  switch (config.baseAnimation) {
    case 'shake':
      return gmm.createShakeAnimation({
        type: config.animationType as WebGL2ShakeAnimationType,
        magnitude: config.animationMagnitude,
        useViewCoordinates: config.viewCoordinates,
        timing
      })
    case 'pulse':
      return gmm.createPulseAnimation({
        type: config.animationType as WebGL2PulseAnimationType,
        amount: config.animationMagnitude,
        useViewCoordinates: config.viewCoordinates,
        timing
      })
    case 'pulse-effect':
      return gmm.createEffectPulseAnimation({
        type: config.animationType as WebGL2PulseAnimationType,
        amount: config.animationMagnitude,
        useViewCoordinates: config.viewCoordinates,
        timing
      })
    case 'fade':
      return gmm.createFadeAnimation({
        type: config.animationType as WebGL2FadeAnimationType,
        color1: config.color1,
        color2: config.color2,
        timing
      })
    case 'fade-effect':
      return gmm.createEffectFadeAnimation({
        type: config.animationType as WebGL2FadeAnimationType,
        color1: config.color1,
        color2: config.color2,
        timing
      })
    case 'scale':
      return gmm.createScaleAnimation({
        type: config.animationType as WebGL2ScaleAnimationType,
        amount: config.animationMagnitude,
        useViewCoordinates: config.viewCoordinates,
        timing
      })
    case 'scale-effect':
      return gmm.createEffectScaleAnimation({
        type: config.animationType as WebGL2ScaleAnimationType,
        amount: config.animationMagnitude,
        useViewCoordinates: config.viewCoordinates,
        timing
      })
    case 'beacon':
      return gmm.createBeaconAnimation({
        type: config.animationType as WebGL2BeaconAnimationType,
        color: config.color1 ?? 'black',
        pulseWidth: config.pulseWidth,
        pulseCount: config.count,
        pulseDistance: config.pulseDistance,
        magnitude: config.animationMagnitude,
        useViewCoordinates: config.viewCoordinates,
        smooth: config.smooth,
        timing
      })
    case 'halo':
      return gmm.createHaloAnimation({
        color: new Color(0, 0, 0, 30),
        magnitude: config.animationMagnitude,
        useViewCoordinates: config.viewCoordinates,
        timing
      })
  }
  return gmm.createFadeAnimation(WebGL2FadeAnimationType.FADE_OUT)
}

/**
 * Loads the graph sample.
 */
async function loadGraph(graphComponent: GraphComponent) {
  try {
    const graph = graphComponent.graph
    const graphMLIOHandler = new GraphMLIOHandler()
    await graphMLIOHandler.readFromURL(graph, 'resources/graph.graphml')
  } catch (error) {
    reportDemoError(error)
  }
}

/**
 * Adds or removes labels from the graph
 */
function changeLabels(graphComponent: GraphComponent, showLabels: boolean) {
  if (!showLabels) {
    const list = graphComponent.graph.labels.toList()
    list.forEach(label => graphComponent.graph.remove(label))
  } else {
    connectedComponents.forEach(component => {
      let idx = 0
      component.nodes.forEach(node => {
        const style = new DefaultLabelStyle({ insets: 3 })
        graphComponent.graph.addLabel(node, `${idx}`, InteriorLabelModel.CENTER, style)
        idx++
      })
    })
    const shape = document.querySelector<HTMLSelectElement>('#shapeSelect')!.value
    // @ts-ignore
    setWebGLStyles(graphComponent, connectedComponents, shape)
  }
}

/**
 * Calculate all connected components, i.e. all sub-graphs that only contain nodes that are pair-wise
 * connected by a path of edges.
 * Note that calculating these connected components is also provided by the algorithm class
 * ConnectedComponents.
 * @param graph The graph to calculate the connected components for.
 */
function calculateComponents(graph: IGraph): Array<Component> {
  const components = new Array<Component>()
  graph.nodes.forEach(node => {
    if (!node.tag) {
      components.push(collectComponent(graph, node))
    }
  })
  return components
}

function collectComponent(graph: IGraph, node: INode): Component {
  const component = new Component()
  node.tag = component
  component.nodes.add(node)

  const nodes = new Array<INode>(node)
  while (nodes.length > 0) {
    const currentNode = nodes.pop()
    graph.edgesAt(currentNode!, AdjacencyTypes.ALL).forEach(edge => {
      component.edges.add(edge)
      const oppositeNode = edge.opposite(currentNode!) as INode
      if (!oppositeNode.tag) {
        oppositeNode.tag = component
        component.nodes.add(oppositeNode)
        nodes.push(oppositeNode)
      }
    })
  }
  return component
}

// noinspection JSIgnoredPromiseFromCall
run()

/**
 * A data holder for the nodes and edges that belong to a connected component.
 */
class Component {
  nodes: Set<INode> = new Set<INode>()
  edges: Set<IEdge> = new Set<IEdge>()
}
