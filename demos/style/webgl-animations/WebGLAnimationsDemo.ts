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
  AdjacencyTypes,
  Color,
  GraphComponent,
  GraphItemTypes,
  GraphMLIOHandler,
  GraphViewerInputMode,
  IEdge,
  type IGraph,
  ILabel,
  type IModelItem,
  INode,
  InteriorNodeLabelModel,
  LabelStyle,
  License,
  type WebGLAnimation,
  WebGLAnimationDirection,
  WebGLAnimationEasing,
  WebGLAnimationTiming,
  WebGLArcEdgeStyle,
  WebGLBeaconAnimationType,
  WebGLEdgeStyleDecorator,
  WebGLEffect,
  WebGLFadeAnimationType,
  WebGLGraphModelManager,
  WebGLLabelShape,
  WebGLLabelStyle,
  WebGLLabelStyleDecorator,
  WebGLNodeIndicatorStyle,
  WebGLNodeStyleDecorator,
  WebGLPulseAnimationType,
  WebGLScaleAnimationType,
  WebGLSelectionIndicatorManager,
  WebGLShakeAnimationType,
  type WebGLShapeNodeShapeStringValues,
  WebGLShapeNodeStyle,
  WebGLStroke
} from '@yfiles/yfiles'

import licenseData from '../../../lib/license.json'
import { enableSingleSelection } from './SingleSelectionHelper'
import { checkWebGL2Support, finishLoading } from '@yfiles/demo-app/demo-page'

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

let connectedComponents: ConnectedComponent[]
let currentSelectedItem: IModelItem | null

/**
 * Starts the demo.
 */
async function run(): Promise<void> {
  if (!checkWebGL2Support()) {
    return
  }

  License.value = licenseData
  const graphComponent = new GraphComponent('#graphComponent')

  graphComponent.graphModelManager = new WebGLGraphModelManager()
  graphComponent.selectionIndicatorManager = new WebGLSelectionIndicatorManager({
    nodeStyle: new WebGLNodeIndicatorStyle({ type: 'solid', primaryColor: '#666', thickness: 2 })
  })

  // create an initial sample graph
  await loadGraph(graphComponent)
  await graphComponent.fitGraphBounds()

  connectedComponents = calculateComponents(graphComponent.graph)
  setWebGLStyles(graphComponent, connectedComponents, 'ellipse')

  configureInteraction(graphComponent)

  configureUI(graphComponent)
}

/**
 * Configures the UI elements.
 */
function configureUI(graphComponent: GraphComponent) {
  document.querySelector('#use-labels')!.addEventListener('change', (e) => {
    changeLabels(graphComponent, (e.target as HTMLInputElement).checked)
  })

  document.querySelector('#shape-select')!.addEventListener('change', (e) => {
    setWebGLStyles(
      graphComponent,
      connectedComponents,
      (e.target as HTMLSelectElement).value as WebGLShapeNodeShapeStringValues
    )
    graphComponent.invalidate()
  })

  document
    .getElementById('animation-configuration')!
    .querySelectorAll<HTMLSelectElement>('select')
    .forEach((element) => {
      element.addEventListener('change', () => {
        changeAnimation(graphComponent, currentSelectedItem)
      })
    })

  const animationDurationSelect = document.querySelector<HTMLSelectElement>('#animation-duration')!
  const iterationCountSelect = document.querySelector<HTMLSelectElement>('#iteration-count')!
  const animationDirectionSelect =
    document.querySelector<HTMLSelectElement>('#animation-direction')!
  const animationEasingSelect = document.querySelector<HTMLSelectElement>('#animation-easing')!
  const beaconPulseCountSelect = document.querySelector<HTMLSelectElement>('#pulse-count')!
  const beaconPulseWidthSelect = document.querySelector<HTMLSelectElement>('#pulse-width')!
  const beaconSmoothCheckbox = document.querySelector<HTMLInputElement>('#beacon-smooth')!

  const animations: BaseAnimation[] = ['fade', 'pulse', 'beacon', 'scale', 'shake']
  const options: Map<BaseAnimation, HTMLDivElement> = new Map<BaseAnimation, HTMLDivElement>(
    animations.map((animation) => [
      animation,
      document.querySelector<HTMLDivElement>(`#${animation}-options`)!
    ])
  )
  options.set('fade-effect', document.querySelector<HTMLDivElement>(`#fade-options`)!)
  options.set('pulse-effect', document.querySelector<HTMLDivElement>(`#pulse-options`)!)
  options.set('scale-effect', document.querySelector<HTMLDivElement>(`#scale-options`)!)

  const magnitudeOptions = document.querySelector<HTMLDivElement>('#magnitude-options')!
  const animatedElementOptions = document.querySelector<HTMLDivElement>(
    '#animated-elements-options'
  )!

  const useViewCoordinatesOptions = document.querySelector<HTMLDivElement>(
    '#use-view-coordinates-options'
  )!

  const pulseTypeSelect = document.querySelector<HTMLSelectElement>('#pulse-type')!
  pulseTypeSelect.addEventListener('change', (e) => {
    const select = e.target as HTMLSelectElement
    updateMagnitudeOptions(select.value as PulseType)
  })

  const scaleTypeSelect = document.querySelector<HTMLSelectElement>('#scale-type')!
  scaleTypeSelect.addEventListener('change', (e) => {
    const select = e.target as HTMLSelectElement
    updateMagnitudeOptions(select.value as PulseType)
  })

  const baseAnimationSelect = document.querySelector<HTMLSelectElement>('#base-animation')!
  baseAnimationSelect.addEventListener('change', (e) => {
    const select = e.target as HTMLSelectElement
    const animationType = select.value as BaseAnimation
    const animationMagnitudeSelect =
      document.querySelector<HTMLSelectElement>('#animation-magnitude')!

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
        document.querySelector<HTMLInputElement>('#beacon-color')!.style.display = 'block'
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
      values = [2, 5, 10, 20, 30, 60]
      break
    case 'scale-shrink-relative':
    case 'shrink-relative':
      values = [0, 0.5, 0.75]
      break
    case 'scale-grow-relative':
    case 'grow-relative':
      values = [2, 3, 4, 5]
      break
    case 'both-relative':
      values = [0.5, 0.75, 2, 3, 4, 5]
      break
    default:
      values = [1, 2, 5, 10, 20, 30, 60]
      break
  }

  const animationMagnitudeSelect =
    document.querySelector<HTMLSelectElement>('#animation-magnitude')!

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
 * Sets the WebGL node and edge styles with a distinct color per graph component.
 */
function setWebGLStyles(
  graphComponent: GraphComponent,
  connectedComponents: Array<ConnectedComponent>,
  nodeShape: WebGLShapeNodeShapeStringValues
) {
  const graph = graphComponent.graph

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
    nodeShape === 'triangle' ? InteriorNodeLabelModel.BOTTOM : InteriorNodeLabelModel.CENTER

  connectedComponents.forEach((component, idx) => {
    const fillColor = fillColors[idx % connectedComponents.length]
    const strokeColor = strokeColors[idx % connectedComponents.length]
    component.nodes.forEach((node) => {
      graph.setStyle(
        node,
        new WebGLNodeStyleDecorator(
          node.style,
          new WebGLShapeNodeStyle({
            shape: nodeShape,
            fill: fillColor,
            stroke: new WebGLStroke(strokeColor),
            effect: WebGLEffect.AMBIENT_FILL_COLOR
          })
        )
      )
      node.labels.forEach((label) => {
        graph.setStyle(
          label,
          new WebGLLabelStyleDecorator(
            label.style,
            new WebGLLabelStyle({
              shape: WebGLLabelShape.ROUND_RECTANGLE,
              textColor: strokeColor,
              backgroundColor: Color.WHITE,
              backgroundStroke: new WebGLStroke(strokeColor),
              padding: 3
            })
          )
        )
        graph.setLabelLayoutParameter(label, nodeLabelParameter)
      })
    })
    component.edges.forEach((edge) => {
      graph.setStyle(
        edge,
        new WebGLEdgeStyleDecorator(
          edge.style,
          new WebGLArcEdgeStyle({
            stroke: new WebGLStroke(fillColor, 5),
            sourceArrow: 'none',
            targetArrow: 'none',
            height: 10
          })
        )
      )
    })
  })
}

const componentToAnimationMap = new Map<ConnectedComponent, WebGLAnimation>()

/**
 * Gets the component of the given item.
 */
function getComponentForItem(item: IModelItem | null | undefined): null | ConnectedComponent {
  if (item == null) {
    return null
  }
  if (item instanceof INode) {
    return item.tag as ConnectedComponent
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
function startNewAnimation(graphComponent: GraphComponent, component: ConnectedComponent) {
  const applyToComponentMembers =
    document.querySelector<HTMLInputElement>('input[name="animated-elements"]:checked')!.id ===
    'component-members'
  const animateNodes = getAnimateNodes()
  const animateEdges = document.querySelector<HTMLInputElement>(
    'input[id="animate-edges"]'
  )!.checked
  const animateLabels = document.querySelector<HTMLInputElement>(
    'input[id="animate-labels"]'
  )!.checked
  if (!animateNodes && !animateEdges && !animateLabels) {
    return Promise.resolve(false)
  }

  const animation = getAnimation(graphComponent.graphModelManager as WebGLGraphModelManager)
  componentToAnimationMap.set(component, animation)

  const gmm = graphComponent.graphModelManager as WebGLGraphModelManager

  const animations = [animation]
  const nodesToAnimate = applyToComponentMembers
    ? component.nodes
    : graphComponent.graph.nodes.filter((node) => !component.nodes.has(node))
  const edgesToAnimate = applyToComponentMembers
    ? component.edges
    : graphComponent.graph.edges.filter((edge) => !component.edges.has(edge))

  nodesToAnimate.forEach((node: INode) => {
    if (animateNodes) {
      gmm.setAnimations(node, animations)
    }
    if (animateLabels) {
      node.labels.forEach((label) => {
        gmm.setAnimations(label, animations)
      })
    }
  })
  edgesToAnimate.forEach((edge: IEdge) => {
    if (animateEdges) {
      gmm.setAnimations(edge, animations)
    }
    if (animateLabels) {
      edge.labels.forEach((label) => {
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
  // Allow only viewing of the graph
  const gvim = new GraphViewerInputMode({ selectableItems: 'node', focusableItems: 'none' })

  gvim.itemHoverInputMode.enabled = true
  gvim.itemHoverInputMode.hoverItems =
    GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.LABEL

  // Add the configured animation either to the whole component the hovered item
  // is part of or to the rest of the graph.
  gvim.itemHoverInputMode.addEventListener('hovered-item-changed', (evt) => {
    stopAnimation(graphComponent, evt.oldItem)
    startAnimation(graphComponent, evt.item)
  })

  gvim.addEventListener('multi-selection-finished', (evt) => {
    const item = evt.selection.at(0)
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
  existingAnimation?.stop().then((reachedFinalState) => {
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
    : existingAnimation.stop().then((reachedInitialState) => {
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
function removeAnimation(graphComponent: GraphComponent, animation: WebGLAnimation) {
  const graph = graphComponent.graph
  const gmm = graphComponent.graphModelManager as WebGLGraphModelManager
  graph.nodes.forEach((node) => {
    const currentAnimations = gmm.getAnimations(node)
    if (currentAnimations.length) {
      gmm.setAnimations(
        node,
        currentAnimations.filter((currentAnimation) => currentAnimation !== animation)
      )
    }
  })
  graph.edges.forEach((edge) => {
    const currentAnimations = gmm.getAnimations(edge)
    if (currentAnimations.length) {
      gmm.setAnimations(
        edge,
        currentAnimations.filter((currentAnimation) => currentAnimation !== animation)
      )
    }
  })
}

/**
 * Returns whether to animate nodes.
 */
function getAnimateNodes(): boolean {
  const checkBox = document.querySelector<HTMLInputElement>('input[id="animate-nodes"]')!
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
  | WebGLFadeAnimationType
  | WebGLPulseAnimationType
  | WebGLBeaconAnimationType
  | WebGLShakeAnimationType
  | WebGLScaleAnimationType {
  switch (animationType) {
    case 'to color':
      return WebGLFadeAnimationType.FADE_TO_COLOR
    case 'to gray':
      return WebGLFadeAnimationType.FADE_TO_GRAY
    case 'to semi-transparent':
      return WebGLFadeAnimationType.FADE_OUT
    case 'to invisible':
      return WebGLFadeAnimationType.FADE_OUT
    case 'from color':
      return WebGLFadeAnimationType.FADE_FROM_COLOR
    case 'from gray':
      return WebGLFadeAnimationType.FADE_FROM_GRAY
    case 'from semi-transparent':
      return WebGLFadeAnimationType.FADE_IN
    case 'from invisible':
      return WebGLFadeAnimationType.FADE_IN
    case 'grow':
      return WebGLPulseAnimationType.GROW
    case 'shrink':
      return WebGLPulseAnimationType.SHRINK
    case 'both':
      return WebGLPulseAnimationType.BOTH
    case 'grow-relative':
      return WebGLPulseAnimationType.GROW_RELATIVE
    case 'shrink-relative':
      return WebGLPulseAnimationType.SHRINK_RELATIVE
    case 'both-relative':
      return WebGLPulseAnimationType.BOTH_RELATIVE
    case 'fade':
      return WebGLBeaconAnimationType.FADE
    case 'no-fade':
      return WebGLBeaconAnimationType.NO_FADE
    case 'reverse-fade':
      return WebGLBeaconAnimationType.REVERSE_FADE
    case 'scale-grow':
      return WebGLScaleAnimationType.GROW
    case 'scale-shrink':
      return WebGLScaleAnimationType.SHRINK
    case 'scale-grow-relative':
      return WebGLScaleAnimationType.GROW_RELATIVE
    case 'scale-shrink-relative':
      return WebGLScaleAnimationType.SHRINK_RELATIVE
    case 'horizontal':
      return WebGLShakeAnimationType.HORIZONTAL
    case 'vertical':
      return WebGLShakeAnimationType.VERTICAL
    default:
      return WebGLFadeAnimationType.FADE_OUT
  }
}

/**
 * Gets the colors from the fade to color pickers
 */
function getConfiguredFadeColors(): { color1: Color; color2: Color } {
  const color1pickerValue = document.querySelector<HTMLInputElement>('#fade-color1')!.value
  const color2pickerValue = document.querySelector<HTMLInputElement>('#fade-color2')!.value
  const chosenFadeType = document.querySelector<HTMLSelectElement>('#fade-type')!.value as FadeType
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
    | WebGLFadeAnimationType
    | WebGLPulseAnimationType
    | WebGLShakeAnimationType
    | WebGLScaleAnimationType
    | WebGLBeaconAnimationType
  animationMagnitude: number
  animationDuration: string
  iterationCount: number
  animationDirection: WebGLAnimationDirection
  easing: WebGLAnimationEasing
  viewCoordinates: boolean
  color1: Color | undefined
  color2: Color | undefined
  count: number
  pulseWidth: number
  pulseDistance: number
  smooth: boolean
} {
  const baseAnimation = document.querySelector<HTMLSelectElement>('#base-animation')!
    .value as BaseAnimation

  const colors = getConfiguredFadeColors()

  let animationType
  switch (baseAnimation) {
    default:
    case 'pulse':
    case 'pulse-effect':
      animationType = getAnimationType(
        document.querySelector<HTMLSelectElement>('#pulse-type')!.value as AnimationType
      )
      break
    case 'fade':
    case 'fade-effect':
      animationType = getAnimationType(
        document.querySelector<HTMLSelectElement>('#fade-type')!.value as AnimationType
      )
      break
    case 'shake':
      animationType = getAnimationType(
        document.querySelector<HTMLSelectElement>('#shake-type')!.value as AnimationType
      )
      break
    case 'beacon':
      animationType = getAnimationType(
        document.querySelector<HTMLSelectElement>('#beacon-type')!.value as AnimationType
      )
      break
    case 'scale':
    case 'scale-effect':
      animationType = getAnimationType(
        document.querySelector<HTMLSelectElement>('#scale-type')!.value as AnimationType
      )
      break
  }
  const animationMagnitude = Number(
    document.querySelector<HTMLSelectElement>('#animation-magnitude')!.value
  )
  const animationDuration = document.querySelector<HTMLSelectElement>('#animation-duration')!.value
  const count = document.querySelector<HTMLSelectElement>('#iteration-count')!.value
  const iterationCount = count === 'infinity' ? 255 : parseInt(count)

  let animationDirection
  const direction = document.querySelector<HTMLSelectElement>('#animation-direction')!.value
  switch (direction) {
    default:
    case 'normal':
      animationDirection = WebGLAnimationDirection.NORMAL
      break
    case 'reverse':
      animationDirection = WebGLAnimationDirection.REVERSE
      break
    case 'alternate':
      animationDirection = WebGLAnimationDirection.ALTERNATE
      break
    case 'alternate-reverse':
      animationDirection = WebGLAnimationDirection.ALTERNATE_REVERSE
      break
  }

  let easing
  const easingValue = document.querySelector<HTMLSelectElement>('#animation-easing')!.value
  switch (easingValue) {
    default:
    case 'linear':
      easing = WebGLAnimationEasing.LINEAR
      break
    case 'step':
      easing = WebGLAnimationEasing.STEP
      break
    case 'ease':
      easing = WebGLAnimationEasing.EASE
      break
    case 'ease-in-out':
      easing = WebGLAnimationEasing.EASE_IN_OUT
      break
    case 'ease-in':
      easing = WebGLAnimationEasing.EASE
      break
    case 'ease-out':
      easing = WebGLAnimationEasing.EASE_OUT
      break
  }

  const colorFade =
    animationType === WebGLFadeAnimationType.FADE_TO_COLOR ||
    animationType === WebGLFadeAnimationType.FADE_FROM_COLOR ||
    animationType === WebGLFadeAnimationType.FADE_OUT ||
    animationType === WebGLFadeAnimationType.FADE_IN

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
        ? Color.from(document.querySelector<HTMLInputElement>('#beacon-color')!.value)
        : undefined,
    color2: colorFade ? colors.color2 : undefined,
    count: Number(document.querySelector<HTMLSelectElement>('#pulse-count')!.value),
    pulseWidth: Number(document.querySelector<HTMLSelectElement>('#pulse-width')!.value),
    pulseDistance: Number(document.querySelector<HTMLSelectElement>('#pulse-distance')!.value),
    viewCoordinates: Boolean(
      document.querySelector<HTMLInputElement>('#view-coordinates')!.checked
    ),
    smooth: Boolean(document.querySelector<HTMLInputElement>('#beacon-smooth')!.checked)
  }
}

/**
 * Returns the {@link WebGLAnimation} according to the currently configured values.
 */
function getAnimation(gmm: WebGLGraphModelManager): WebGLAnimation {
  const config = getAnimationConfiguration()
  const timing = new WebGLAnimationTiming({
    duration: config.animationDuration,
    easing: config.easing,
    iterationCount: config.iterationCount,
    direction: config.animationDirection
  })

  switch (config.baseAnimation) {
    case 'shake':
      return gmm.createShakeAnimation({
        type: config.animationType as WebGLShakeAnimationType,
        magnitude: config.animationMagnitude,
        useViewCoordinates: config.viewCoordinates,
        timing
      })
    case 'pulse':
      return gmm.createPulseAnimation({
        type: config.animationType as WebGLPulseAnimationType,
        amount: config.animationMagnitude,
        useViewCoordinates: config.viewCoordinates,
        timing
      })
    case 'pulse-effect':
      return gmm.createEffectPulseAnimation({
        type: config.animationType as WebGLPulseAnimationType,
        amount: config.animationMagnitude,
        useViewCoordinates: config.viewCoordinates,
        timing
      })
    case 'fade':
      return gmm.createFadeAnimation({
        type: config.animationType as WebGLFadeAnimationType,
        color1: config.color1,
        color2: config.color2,
        timing
      })
    case 'fade-effect':
      return gmm.createEffectFadeAnimation({
        type: config.animationType as WebGLFadeAnimationType,
        color1: config.color1,
        color2: config.color2,
        timing
      })
    case 'scale':
      return gmm.createScaleAnimation({
        type: config.animationType as WebGLScaleAnimationType,
        amount: config.animationMagnitude,
        useViewCoordinates: config.viewCoordinates,
        timing
      })
    case 'scale-effect':
      return gmm.createEffectScaleAnimation({
        type: config.animationType as WebGLScaleAnimationType,
        amount: config.animationMagnitude,
        useViewCoordinates: config.viewCoordinates,
        timing
      })
    case 'beacon':
      return gmm.createBeaconAnimation({
        type: config.animationType as WebGLBeaconAnimationType,
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
    default:
      return gmm.createFadeAnimation(WebGLFadeAnimationType.FADE_OUT)
  }
}

/**
 * Loads the graph sample.
 */
async function loadGraph(graphComponent: GraphComponent) {
  const graph = graphComponent.graph
  const graphMLIOHandler = new GraphMLIOHandler()
  await graphMLIOHandler.readFromURL(graph, 'resources/graph.graphml')
}

/**
 * Adds or removes labels from the graph
 */
function changeLabels(graphComponent: GraphComponent, showLabels: boolean) {
  if (!showLabels) {
    const list = graphComponent.graph.labels.toList()
    list.forEach((label) => graphComponent.graph.remove(label))
  } else {
    connectedComponents.forEach((component) => {
      let idx = 0
      component.nodes.forEach((node) => {
        const style = new LabelStyle({ padding: 3 })
        graphComponent.graph.addLabel(node, `${idx}`, InteriorNodeLabelModel.CENTER, style)
        idx++
      })
    })
    const shape = document.querySelector<HTMLSelectElement>('#shape-select')!
      .value as WebGLShapeNodeShapeStringValues
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
function calculateComponents(graph: IGraph): Array<ConnectedComponent> {
  const components = new Array<ConnectedComponent>()
  graph.nodes.forEach((node) => {
    if (!node.tag) {
      components.push(collectComponent(graph, node))
    }
  })
  return components
}

function collectComponent(graph: IGraph, node: INode): ConnectedComponent {
  const component = new ConnectedComponent()
  node.tag = component
  component.nodes.add(node)

  const nodes = new Array<INode>(node)
  while (nodes.length > 0) {
    const currentNode = nodes.pop()
    graph.edgesAt(currentNode!, AdjacencyTypes.ALL).forEach((edge) => {
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

run().then(finishLoading)

/**
 * A data holder for the nodes and edges that belong to a connected component.
 */
class ConnectedComponent {
  nodes: Set<INode> = new Set<INode>()
  edges: Set<IEdge> = new Set<IEdge>()
}
