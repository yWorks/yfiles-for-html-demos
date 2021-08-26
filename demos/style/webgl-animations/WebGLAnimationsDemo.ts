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
  AdjacencyTypes,
  Animator,
  Color,
  GraphComponent,
  GraphItemTypes,
  GraphMLIOHandler,
  GraphViewerInputMode,
  ICommand,
  IEdge,
  IGraph,
  INode,
  License,
  WebGL2Animation,
  WebGL2ArcEdgeStyle,
  WebGL2FadeAnimationType,
  WebGL2GraphModelManager,
  WebGL2NodeEffect,
  WebGL2SelectionIndicatorManager,
  WebGL2ShapeNodeStyle,
  WebGL2Stroke
} from 'yfiles'

import { bindCommand, checkLicense, showApp } from '../../resources/demo-app'
import loadJson from '../../resources/load-json'
import { webGl2Supported } from '../../utils/Workarounds'

type BaseAnimation = 'Pulse' | 'Fade' | 'Shake'
type AnimatedElements = 'Nodes And Edges' | 'Node Effect'
type FadeDirection = 'From' | 'To'
type FadeType = 'Color' | 'Gray' | 'Invisible'

/**
 * Bootstraps the demo.
 */
async function run(licenseData: object) {
  if (!webGl2Supported) {
    // show message if the browsers does not support WebGL2
    document.getElementById('no-webgl-support')!.removeAttribute('style')
    showApp(null)
    return
  }

  License.value = licenseData
  const graphComponent = new GraphComponent('#graphComponent')

  const animator = new Animator(graphComponent)
  animator.allowUserInteraction = true

  enableWebGLRendering(graphComponent)
  configureUI()

  // create an initial sample graph
  await loadGraph(graphComponent)
  graphComponent.fitGraphBounds()

  const connectedComponents = calculateComponents(graphComponent.graph)
  setWebGLStyles(graphComponent, connectedComponents)

  configureInteraction(graphComponent, animator)

  // bind the buttons to their commands
  registerCommands(graphComponent)

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Enables WebGL2 as the rendering technique.
 */
function enableWebGLRendering(graphComponent: GraphComponent) {
  graphComponent.graphModelManager = new WebGL2GraphModelManager()
  graphComponent.selectionIndicatorManager = new WebGL2SelectionIndicatorManager(graphComponent)
}

/**
 * Configures the select elements in the toolbar.
 */
function configureUI() {
  const animationFrequencySelect = document.querySelector<HTMLSelectElement>('#animationFrequency')!
  const animationMagnitudeSelect = document.querySelector<HTMLSelectElement>('#animationMagnitude')!
  const fadeTypeSelect = document.querySelector<HTMLSelectElement>('#fadeType')!
  const fadeDirectionSelect = document.querySelector<HTMLSelectElement>('#fadeDirection')!
  const animationDurationSelect = document.querySelector<HTMLSelectElement>('#animationDuration')!
  const animatedElementsSelect = document.querySelector<HTMLSelectElement>('#animatedElements')!

  const baseAnimationSelect = document.querySelector<HTMLSelectElement>('#baseAnimation')!
  baseAnimationSelect.addEventListener('change', e => {
    const select = e.target as HTMLSelectElement
    const animationType = select.value as BaseAnimation
    switch (animationType) {
      case 'Pulse':
        configureFrequencyMagnitudeSelects(true, 2, 2)
        animatedElementsSelect.disabled = false
        break
      case 'Fade':
        configureFrequencyMagnitudeSelects(false, 5, 2)
        animationDurationSelect.value = '1s'
        animatedElementsSelect.disabled = false
        break
      case 'Shake':
        configureFrequencyMagnitudeSelects(true, 10, 2)
        animatedElementsSelect.disabled = true
        break
    }
  })

  function configureFrequencyMagnitudeSelects(
    enable: boolean,
    frequency: number,
    magnitude: number
  ) {
    animationFrequencySelect.value = `${frequency}`
    animationMagnitudeSelect.value = `${magnitude}`
    animationFrequencySelect.disabled = !enable
    animationMagnitudeSelect.disabled = !enable
    fadeTypeSelect.disabled = enable
    fadeDirectionSelect.disabled = enable
    if (enable) {
      animationDurationSelect.value = '10s'
    } else {
      // for fade animations, a shorter animation duration is more noticeable
      animationDurationSelect.value = '1s'
    }
  }

  // The demo starts with the "Pulse" configuration
  configureFrequencyMagnitudeSelects(true, 2, 2)
}

/**
 * Sets the WebGL2 node and edge styles with a distinct color per graph component.
 */
function setWebGLStyles(graphComponent: GraphComponent, connectedComponents: Array<Component>) {
  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager

  const colors = [
    Color.GOLD,
    Color.ROYAL_BLUE,
    Color.CRIMSON,
    Color.DARK_TURQUOISE,
    Color.CORNFLOWER_BLUE
  ]

  connectedComponents.forEach((component, idx, components) => {
    const color = colors[idx % connectedComponents.length]
    component.nodes.forEach(node => {
      gmm.setStyle(
        node,
        new WebGL2ShapeNodeStyle({
          shape: 'ellipse',
          fill: color,
          stroke: new WebGL2Stroke(color),
          effect: WebGL2NodeEffect.AMBIENT_FILL_COLOR
        })
      )
    })
    component.edges.forEach(edge => {
      gmm.setStyle(
        edge,
        new WebGL2ArcEdgeStyle({
          stroke: new WebGL2Stroke(color, 5),
          sourceArrow: 'none',
          targetArrow: 'none',
          height: 10
        })
      )
    })
  })
}

/**
 * Configures the interaction behaviour.
 */
function configureInteraction(graphComponent: GraphComponent, animator: Animator) {
  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager

  // Allow only viewing of the graph
  const gvim = new GraphViewerInputMode()
  //disable focus indicator manager for WebGL mode
  graphComponent.focusIndicatorManager.enabled = false

  gvim.itemHoverInputMode.enabled = true
  gvim.itemHoverInputMode.hoverItems = GraphItemTypes.NODE | GraphItemTypes.EDGE

  // Add the configured animation either to the whole component the hovered item
  // is part of or to the rest of the graph.
  gvim.itemHoverInputMode.addHoveredItemChangedListener((sender, args) => {
    const hoveredItem = args.item
    if (!hoveredItem) {
      animator.stop()
      clearAnimations(graphComponent)
      graphComponent.invalidate()
      return
    }

    let componentNode: INode | null = null
    if (hoveredItem instanceof INode) {
      componentNode = hoveredItem
    }
    if (hoveredItem instanceof IEdge) {
      componentNode = hoveredItem.sourceNode
    }

    if (!componentNode) {
      return
    }

    const nodeComponent = componentNode.tag as Component
    if (nodeComponent) {
      animateComponent(
        getAnimation(gmm),
        nodeComponent,
        graphComponent,
        animator,
        getWhatToAnimate()
      )
    }
  })

  graphComponent.inputMode = gvim
}

/**
 * Sets the given {@link WebGL2Animation} to the node and edge styles and starts the {@link Animator}.
 *
 * @param animation the animation
 * @param component the nodes to animate
 * @param graphComponent the graph component
 * @param animator the animator
 * @param whatToAnimate either 'componentMembers' or 'others'
 */
function animateComponent(
  animation: WebGL2Animation,
  component: Component,
  graphComponent: GraphComponent,
  animator: Animator,
  whatToAnimate: string
) {
  clearAnimations(graphComponent)
  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager

  if (whatToAnimate === 'componentMembers') {
    component.nodes.forEach(node => {
      gmm.setAnimations(node, [animation])
    })
    component.edges.forEach(edge => {
      gmm.setAnimations(edge, [animation])
    })
  } else {
    graphComponent.graph.nodes
      .filter(node => !component.nodes.has(node))
      .forEach(node => {
        gmm.setAnimations(node, [animation])
      })
    graphComponent.graph.edges
      .filter(edge => !component.edges.has(edge))
      .forEach(edge => {
        gmm.setAnimations(edge, [animation])
      })
  }

  animator.animate(animation)
}

/**
 * Removes all animations from all node and edge styles.
 * @param graphComponent
 */
function clearAnimations(graphComponent: GraphComponent) {
  const graph = graphComponent.graph
  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager
  graph.nodes.forEach(node => {
    gmm.setAnimations(node, null)
  })
  graph.edges.forEach(edge => {
    gmm.setAnimations(edge, null)
  })
}

/**
 * Returns whether to animate the component members or the rest of the graph.
 */
function getWhatToAnimate() {
  const checkedRadioButton = document.querySelector('input[name="animatedElements"]:checked')
  return (checkedRadioButton! as HTMLInputElement).id
}

/**
 * Returns a {@link WebGL2FadeAnimationType} depending on the inputs.
 * @param fadeDirection The fade direction
 * @param fadeType The fade type
 */
function getFadeAnimationType(
  fadeDirection: FadeDirection,
  fadeType: FadeType
): WebGL2FadeAnimationType {
  switch (fadeDirection) {
    case 'From':
      switch (fadeType) {
        case 'Color':
          return WebGL2FadeAnimationType.FADE_FROM_COLOR
        case 'Gray':
          return WebGL2FadeAnimationType.FADE_FROM_GRAY
        case 'Invisible':
          return WebGL2FadeAnimationType.FADE_IN
      }
      break
    case 'To':
      switch (fadeType) {
        case 'Color':
          return WebGL2FadeAnimationType.FADE_TO_COLOR
        case 'Gray':
          return WebGL2FadeAnimationType.FADE_TO_GRAY
        case 'Invisible':
          return WebGL2FadeAnimationType.FADE_OUT
      }
      break
  }
  return WebGL2FadeAnimationType.FADE_OUT
}

/**
 * Gets the colors from the fade to color pickers
 */
function getConfiguredFadeColors(): { color1: Color; color2: Color } {
  const color1pickerValue = (document.getElementById('fadeColor1') as HTMLInputElement).value
  const color2pickerValue = (document.getElementById('fadeColor2') as HTMLInputElement).value
  return {
    color1: Color.from(color1pickerValue),
    color2: Color.from(color2pickerValue)
  }
}

/**
 * Returns the configurations made in the UI in one object.
 */
function getAnimationConfiguration(): {
  baseAnimation: BaseAnimation
  animatedElements: AnimatedElements
  fadeDirection: FadeDirection
  fadeType: FadeType
  animationFrequency: number
  animationMagnitude: number
  animationDuration: string
  color1: Color
  color2: Color
} {
  const baseAnimation = document.querySelector<HTMLSelectElement>('#baseAnimation')!
    .value as BaseAnimation
  const animatedElements = document.querySelector<HTMLSelectElement>('#animatedElements')!
    .value as AnimatedElements
  const fadeDirection = document.querySelector<HTMLSelectElement>('#fadeDirection')!
    .value as FadeDirection
  const fadeType = document.querySelector<HTMLSelectElement>('#fadeType')!.value as FadeType
  const animationFrequency = parseInt(
    document.querySelector<HTMLSelectElement>('#animationFrequency')!.value
  )
  const animationMagnitude = parseInt(
    document.querySelector<HTMLSelectElement>('#animationMagnitude')!.value
  )
  const animationDuration = document.querySelector<HTMLSelectElement>('#animationDuration')!.value

  const colors = getConfiguredFadeColors()

  return {
    baseAnimation,
    animatedElements,
    fadeDirection,
    fadeType,
    animationFrequency,
    animationMagnitude,
    animationDuration,
    color1: colors.color1,
    color2: colors.color2
  }
}

/**
 * Returns the {@link WebGL2Animation} according to the currently configured values.
 */
function getAnimation(gmm: WebGL2GraphModelManager): WebGL2Animation {
  const config = getAnimationConfiguration()
  const fadeAnimationType = getFadeAnimationType(config.fadeDirection, config.fadeType)
  const colorFade =
    fadeAnimationType === WebGL2FadeAnimationType.FADE_TO_COLOR ||
    fadeAnimationType === WebGL2FadeAnimationType.FADE_FROM_COLOR

  switch (config.baseAnimation) {
    case 'Shake':
      return gmm.createShakeAnimation(
        config.animationFrequency,
        config.animationMagnitude,
        config.animationDuration
      )
    case 'Pulse':
      switch (config.animatedElements) {
        case 'Nodes And Edges':
          return gmm.createPulseAnimation(
            config.animationFrequency,
            config.animationMagnitude,
            config.animationDuration
          )
        case 'Node Effect':
          return gmm.createNodeEffectPulseAnimation(
            config.animationFrequency,
            config.animationMagnitude,
            config.animationDuration
          )
      }
      break
    case 'Fade': {
      switch (config.animatedElements) {
        case 'Nodes And Edges':
          return gmm.createFadeAnimation({
            fadeType: fadeAnimationType,
            color1: colorFade ? config.color1 : null,
            color2: colorFade ? config.color2 : null,
            preferredDuration: config.animationDuration
          })
        case 'Node Effect':
          return gmm.createNodeEffectFadeAnimation({
            fadeType: fadeAnimationType,
            color1: colorFade ? config.color1 : null,
            color2: colorFade ? config.color2 : null,
            preferredDuration: config.animationDuration
          })
      }
      break
    }
  }
  return gmm.createFadeAnimation(fadeAnimationType, null, null, config.animationDuration)
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
    handleError(error)
  }
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function registerCommands(graphComponent: GraphComponent): void {
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}

function handleError(error: any): void {
  const reportError = (window as any).reportError
  if (typeof reportError === 'function') {
    reportError()
  } else {
    throw error
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

// start demo
loadJson().then(checkLicense).then(run)

/**
 * A data holder for the nodes and edges that belong to a connected component.
 */
class Component {
  nodes: Set<INode> = new Set<INode>()
  edges: Set<IEdge> = new Set<IEdge>()
}
