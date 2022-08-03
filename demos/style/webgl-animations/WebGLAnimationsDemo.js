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

import { bindChangeListener, bindCommand, showApp } from '../../resources/demo-app.js'
import { isWebGl2Supported } from '../../utils/Workarounds.js'
import { fetchLicense } from '../../resources/fetch-license.js'
import { enableSingleSelection } from '../../input/singleselection/SingleSelectionHelper.js'

/**
 * @typedef {('pulse'|'pulse-effect'|'fade'|'fade-effect'|'shake'|'scale'|'scale-effect'|'beacon'|'halo')} BaseAnimation
 */
/**
 * @typedef {('to color'|'to gray'|'to semi-transparent'|'to invisible'|'from color'|'from gray'|'from semi-transparent'|'from invisible')} FadeType
 */
/**
 * @typedef {('grow'|'shrink'|'both'|'grow-relative'|'shrink-relative'|'both-relative')} PulseType
 */
/**
 * @typedef {('horizontal'|'vertical')} ShakeType
 */
/**
 * @typedef {('scale-grow'|'scale-shrink'|'scale-grow-relative'|'scale-shrink-relative')} ScaleType
 */
/**
 * @typedef {('fade'|'reverse-fade'|'no-fade')} BeaconType
 */
/**
 * @typedef {(FadeType|PulseType|ShakeType|ScaleType|BeaconType)} AnimationType
 */

/** @type {Array.<Component>} */
let connectedComponents
/** @type {IModelItem} */
let currentSelectedItem

/**
 * Starts the demo.
 * @returns {!Promise}
 */
async function run() {
  if (!isWebGl2Supported()) {
    // show message if the browsers does not support WebGL2
    document.getElementById('no-webgl-support').removeAttribute('style')
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
 * @param {!GraphComponent} graphComponent
 */
function configureUI(graphComponent) {
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindChangeListener("input[data-command='useLabelsChanged']", value => {
    changeLabels(graphComponent, value)
  })

  bindChangeListener("select[data-command='ShapeChanged']", value => {
    setWebGLStyles(graphComponent, connectedComponents, value)
    graphComponent.invalidate()
  })

  document
    .getElementById('animationConfiguration')
    .querySelectorAll('select')
    .forEach(element => {
      element.addEventListener('change', () => {
        changeAnimation(graphComponent, currentSelectedItem)
      })
    })

  const animationDurationSelect = document.querySelector('#animationDuration')
  const iterationCountSelect = document.querySelector('#iterationCount')
  const animationDirectionSelect = document.querySelector('#animationDirection')
  const animationEasingSelect = document.querySelector('#animationEasing')
  const beaconPulseCountSelect = document.querySelector('#pulseCount')
  const beaconPulseWidthSelect = document.querySelector('#pulseWidth')
  const beaconSmoothCheckbox = document.querySelector('#beaconSmooth')

  const animations = ['fade', 'pulse', 'beacon', 'scale', 'shake']
  const options = new Map(
    animations.map(animation => [animation, document.getElementById(`${animation}-options`)])
  )
  options.set('fade-effect', document.getElementById(`fade-options`))
  options.set('pulse-effect', document.getElementById(`pulse-options`))
  options.set('scale-effect', document.getElementById(`scale-options`))

  const magnitudeOptions = document.querySelector('#magnitude-options')
  const animatedElementOptions = document.querySelector('#animated-elements-options')

  const useViewCoordinatesOptions = document.querySelector('#use-view-coordinates-options')

  const pulseTypeSelect = document.querySelector('#pulseType')
  pulseTypeSelect.addEventListener('change', e => {
    const select = e.target
    updateMagnitudeOptions(select.value)
  })

  const scaleTypeSelect = document.querySelector('#scaleType')
  scaleTypeSelect.addEventListener('change', e => {
    const select = e.target
    updateMagnitudeOptions(select.value)
  })

  const baseAnimationSelect = document.querySelector('#baseAnimation')
  baseAnimationSelect.addEventListener('change', e => {
    const select = e.target
    const animationType = select.value
    const animationMagnitudeSelect = document.querySelector('#animationMagnitude')

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

    updateMagnitudeOptions(select.value)

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
        document.getElementById('beaconColor').style.display = 'block'
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
 * @param {!(PulseType|ScaleType)} type
 * @returns {*}
 */
function updateMagnitudeOptions(type) {
  let values
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

  const animationMagnitudeSelect = document.querySelector('#animationMagnitude')

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
 * @param {!GraphComponent} graphComponent
 * @param {!Array.<Component>} connectedComponents
 * @param {!('ellipse'|'rectangle'|'triangle'|'hexagon'|'octagon')} nodeShape
 */
function setWebGLStyles(graphComponent, connectedComponents, nodeShape) {
  const gmm = graphComponent.graphModelManager

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

const componentToAnimationMap = new Map()

/**
 * Gets the component of the given item.
 * @param {?IModelItem} [item]
 * @returns {?Component}
 */
function getComponentForItem(item) {
  if (item == null) {
    return null
  }
  if (item instanceof INode) {
    return item.tag
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
 * @param {!GraphComponent} graphComponent
 * @param {!Component} component
 */
function startNewAnimation(graphComponent, component) {
  const applyToComponentMembers =
    document.querySelector('input[name="animatedElements"]:checked').id === 'componentMembers'
  const animateNodes = getAnimateNodes()
  const animateEdges = document.querySelector('input[id="animateEdges"]').checked
  const animateLabels = document.querySelector('input[id="animateLabels"]').checked
  if (!animateNodes && !animateEdges && !animateLabels) {
    return Promise.resolve(false)
  }

  const animation = getAnimation(graphComponent.graphModelManager)
  componentToAnimationMap.set(component, animation)

  const gmm = graphComponent.graphModelManager

  const animations = [animation]
  const nodesToAnimate = applyToComponentMembers
    ? component.nodes
    : graphComponent.graph.nodes.filter(node => !component.nodes.has(node))
  const edgesToAnimate = applyToComponentMembers
    ? component.edges
    : graphComponent.graph.edges.filter(edge => !component.edges.has(edge))

  nodesToAnimate.forEach(node => {
    if (animateNodes) {
      gmm.setAnimations(node, animations)
    }
    if (animateLabels) {
      node.labels.forEach(label => {
        gmm.setAnimations(label, animations)
      })
    }
  })
  edgesToAnimate.forEach(edge => {
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
 * @param {!GraphComponent} graphComponent
 */
function configureInteraction(graphComponent) {
  const gmm = graphComponent.graphModelManager

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
 * @param {!GraphComponent} graphComponent
 * @param {?IModelItem} [item]
 */
function stopAnimation(graphComponent, item) {
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
 * @param {!GraphComponent} graphComponent
 * @param {?IModelItem} [item]
 */
function startAnimation(graphComponent, item) {
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
 * @param {!GraphComponent} graphComponent
 * @param {?IModelItem} [item]
 */
function changeAnimation(graphComponent, item) {
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
 * @param {!GraphComponent} graphComponent
 * @param {!WebGL2Animation} animation
 */
function removeAnimation(graphComponent, animation) {
  const graph = graphComponent.graph
  const gmm = graphComponent.graphModelManager
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
 * @returns {boolean}
 */
function getAnimateNodes() {
  const checkBox = document.querySelector('input[id="animateNodes"]')
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
 * @param {!AnimationType} animationType The fade type
 * @returns {!(WebGL2FadeAnimationType|WebGL2PulseAnimationType|WebGL2BeaconAnimationType|WebGL2ShakeAnimationType|WebGL2ScaleAnimationType)}
 */
function getAnimationType(animationType) {
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
 * @returns {!object}
 */
function getConfiguredFadeColors() {
  const color1pickerValue = document.getElementById('fadeColor1').value
  const color2pickerValue = document.getElementById('fadeColor2').value
  const chosenFadeType = document.getElementById('fadeType').value
  const isSemiTransparent =
    chosenFadeType === 'from semi-transparent' || chosenFadeType === 'to semi-transparent'
  return {
    color1: isSemiTransparent ? Color.fromRGBA(0, 0, 0, 0.3) : Color.from(color1pickerValue),
    color2: Color.from(color2pickerValue)
  }
}

/**
 * Returns the configurations made in the UI in one object.
 * @returns {!object}
 */
function getAnimationConfiguration() {
  const baseAnimation = document.querySelector('#baseAnimation').value

  const colors = getConfiguredFadeColors()

  let animationType
  switch (baseAnimation) {
    default:
    case 'pulse':
    case 'pulse-effect':
      animationType = getAnimationType(document.querySelector('#pulseType').value)
      break
    case 'fade':
    case 'fade-effect':
      animationType = getAnimationType(document.querySelector('#fadeType').value)
      break
    case 'shake':
      animationType = getAnimationType(document.querySelector('#shakeType').value)
      break
    case 'beacon':
      animationType = getAnimationType(document.querySelector('#beaconType').value)
      break
    case 'scale':
    case 'scale-effect':
      animationType = getAnimationType(document.querySelector('#scaleType').value)
      break
  }
  const animationMagnitude = Number(document.querySelector('#animationMagnitude').value)
  const animationDuration = document.querySelector('#animationDuration').value
  const count = document.querySelector('#iterationCount').value
  const iterationCount = count === 'infinity' ? 255 : parseInt(count)

  let animationDirection
  const direction = document.querySelector('#animationDirection').value
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
  const easingValue = document.querySelector('#animationEasing').value
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
      ? Color.from(document.getElementById('beaconColor').value)
      : null,
    color2: colorFade ? colors.color2 : null,
    count: Number(document.getElementById('pulseCount').value),
    pulseWidth: Number(document.getElementById('pulseWidth').value),
    pulseDistance: Number(document.getElementById('pulseDistance').value),
    viewCoordinates: Boolean(document.getElementById('viewCoordinates').checked),
    smooth: Boolean(document.getElementById('beaconSmooth').checked)
  }
}

/**
 * Returns the {@link WebGL2Animation} according to the currently configured values.
 * @param {!WebGL2GraphModelManager} gmm
 * @returns {!WebGL2Animation}
 */
function getAnimation(gmm) {
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
        type: config.animationType,
        magnitude: config.animationMagnitude,
        useViewCoordinates: config.viewCoordinates,
        timing
      })
    case 'pulse':
      return gmm.createPulseAnimation({
        type: config.animationType,
        amount: config.animationMagnitude,
        useViewCoordinates: config.viewCoordinates,
        timing
      })
    case 'pulse-effect':
      return gmm.createEffectPulseAnimation({
        type: config.animationType,
        amount: config.animationMagnitude,
        useViewCoordinates: config.viewCoordinates,
        timing
      })
    case 'fade':
      return gmm.createFadeAnimation({
        type: config.animationType,
        color1: config.color1,
        color2: config.color2,
        timing
      })
    case 'fade-effect':
      return gmm.createEffectFadeAnimation({
        type: config.animationType,
        color1: config.color1,
        color2: config.color2,
        timing
      })
    case 'scale':
      return gmm.createScaleAnimation({
        type: config.animationType,
        amount: config.animationMagnitude,
        useViewCoordinates: config.viewCoordinates,
        timing
      })
    case 'scale-effect':
      return gmm.createEffectScaleAnimation({
        type: config.animationType,
        amount: config.animationMagnitude,
        useViewCoordinates: config.viewCoordinates,
        timing
      })
    case 'beacon':
      return gmm.createBeaconAnimation({
        type: config.animationType,
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
 * @param {!GraphComponent} graphComponent
 */
async function loadGraph(graphComponent) {
  try {
    const graph = graphComponent.graph
    const graphMLIOHandler = new GraphMLIOHandler()
    await graphMLIOHandler.readFromURL(graph, 'resources/graph.graphml')
  } catch (error) {
    const reportError = window.reportError
    if (typeof reportError === 'function') {
      reportError()
    } else {
      throw error
    }
  }
}

/**
 * Adds or removes labels from the graph
 * @param {!GraphComponent} graphComponent
 * @param {boolean} showLabels
 */
function changeLabels(graphComponent, showLabels) {
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
    const shape = document.querySelector('#shapeSelect').value
    setWebGLStyles(graphComponent, connectedComponents, shape)
  }
}

/**
 * Calculate all connected components, i.e. all sub-graphs that only contain nodes that are pair-wise
 * connected by a path of edges.
 * Note that calculating these connected components is also provided by the algorithm class
 * ConnectedComponents.
 * @param {!IGraph} graph The graph to calculate the connected components for.
 * @returns {!Array.<Component>}
 */
function calculateComponents(graph) {
  const components = new Array()
  graph.nodes.forEach(node => {
    if (!node.tag) {
      components.push(collectComponent(graph, node))
    }
  })
  return components
}

/**
 * @param {!IGraph} graph
 * @param {!INode} node
 * @returns {!Component}
 */
function collectComponent(graph, node) {
  const component = new Component()
  node.tag = component
  component.nodes.add(node)

  const nodes = new Array(node)
  while (nodes.length > 0) {
    const currentNode = nodes.pop()
    graph.edgesAt(currentNode, AdjacencyTypes.ALL).forEach(edge => {
      component.edges.add(edge)
      const oppositeNode = edge.opposite(currentNode)
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
  constructor() {
    this.nodes = new Set()
    this.edges = new Set()
  }
}
