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
  Animator,
  BaseClass,
  Font,
  GraphComponent,
  HierarchicalNestingPolicy,
  IAnimation,
  INodeStyle,
  IVisualCreator,
  Point,
  Rect,
  ShapeNodeShape,
  ShapeNodeStyle,
  SvgExport,
  SvgVisual,
  TextRenderSupport,
  TimeSpan
} from '@yfiles/yfiles'

import {
  createAggregationStyle,
  createAssociationStyle,
  createDependencyStyle,
  createDirectedAssociationStyle,
  createGeneralizationStyle,
  createRealizationStyle
} from './UMLEdgeStyleFactory'

/**
 * Provides the visuals of the edge creation buttons.
 */
export class ButtonVisualCreator extends BaseClass(IVisualCreator) {
  node
  static buttons

  renderer
  animator

  /**
   * The provided edge creation buttons.
   */
  static get edgeCreationButtons() {
    return [
      createRealizationStyle(),
      createGeneralizationStyle(),
      createAggregationStyle(),
      createDependencyStyle(),
      createDirectedAssociationStyle(),
      createAssociationStyle()
    ]
  }

  /**
   * Creates the visual creator for the edge creation buttons.
   * @param node The node for which the buttons should be created.
   * @param graphComponent The graph component in which the node resides.
   */
  constructor(node, graphComponent) {
    super()
    this.node = node
    this.renderer = new ButtonIconRenderer()
    this.animator = new Animator(graphComponent)
    this.animator.autoInvalidation = false
    this.animator.allowUserInteraction = true
    ButtonVisualCreator.buttons = []
  }

  /**
   * @param ctx The context that describes where the visual will be used.
   */
  createVisual(ctx) {
    // save the button elements to conveniently use them for hit testing
    ButtonVisualCreator.buttons = []

    // the context button container
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    container.setAttribute('class', 'context-button')

    // create the edge creation buttons
    let first = -60
    const step = 40
    const animations = []
    for (let i = 0; i < ButtonVisualCreator.edgeCreationButtons.length; i++) {
      const child = this.renderer.renderButton(ButtonVisualCreator.edgeCreationButtons[i])
      const childg1 = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      const childg2 = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      const childg3 = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      childg1.setAttribute('transform', 'translate(-15 -15)')
      ButtonVisualCreator.buttons.push(childg1)
      childg2.setAttribute('transform', 'translate(0 0)')
      childg3.setAttribute('transform', `rotate(${-first})`)
      animations.push(new ButtonAnimation(childg1, first, childg2))
      childg1.appendChild(child)
      childg2.appendChild(childg1)
      childg3.appendChild(childg2)
      container.appendChild(childg3)
      first += step
    }
    const layout = this.node.layout
    const topRight = layout.topRight
    SvgVisual.setTranslate(container, topRight.x, topRight.y)

    // add interface/abstract toggle buttons
    const interfaceButton = this.renderer.renderTextButton('I')
    SvgVisual.setTranslate(interfaceButton, layout.x - topRight.x, layout.y - topRight.y - 25)
    const abstractButton = this.renderer.renderTextButton('A')
    SvgVisual.setTranslate(abstractButton, layout.x - topRight.x + 25, layout.y - topRight.y - 25)
    container.appendChild(interfaceButton)
    container.appendChild(abstractButton)

    // visualize the button state
    const model = this.node.style.model
    if (model.stereotype === 'interface') {
      interfaceButton.setAttribute('class', 'interface-toggle toggled')
    }
    if (model.constraint === 'abstract') {
      abstractButton.setAttribute('class', 'abstract-toggle toggled')
    }

    // we fade the buttons via CSS
    container.setAttribute('opacity', '0')
    setTimeout(() => {
      container.setAttribute('opacity', '1')
    }, 0)

    // we animate the position 'manually' because doing it via CSS causes animation artifacts
    animations.forEach((animation) => {
      this.animator.animate(animation)
    })
    container['data-renderDataCache'] = {
      width: layout.width,
      height: layout.height,
      interfaceToggle: model.stereotype,
      constraintToggle: model.constraint
    }

    return new SvgVisual(container)
  }

  /**
   * @param ctx The context that describes where the visual will be used in.
   * @param oldVisual The visual instance that had been returned the last time the
   *   {@link IVisualCreator.createVisual} method was called on this instance.
   */
  updateVisual(ctx, oldVisual) {
    const layout = this.node.layout
    const topRight = layout.topRight
    const svgElement = oldVisual.svgElement
    const cache = svgElement['data-renderDataCache']

    // update the container layout
    SvgVisual.setTranslate(svgElement, topRight.x, topRight.y)

    // maybe update the toggle buttons
    const interfaceButton = svgElement.childNodes[svgElement.childNodes.length - 2]
    const abstractButton = svgElement.childNodes[svgElement.childNodes.length - 1]
    if (!interfaceButton || !abstractButton) {
      this.createVisual(ctx)
    }

    if (cache.width !== layout.width || cache.height !== layout.height) {
      SvgVisual.setTranslate(interfaceButton, layout.x - topRight.x, layout.y - topRight.y - 25)
      SvgVisual.setTranslate(abstractButton, layout.x - topRight.x + 25, layout.y - topRight.y - 25)
      cache.width = layout.width
      cache.height = layout.height
    }

    // update the button state if they have changed
    const model = this.node.style.model
    if (cache.interfaceToggle !== model.stereotype) {
      interfaceButton.setAttribute(
        'class',
        model.stereotype.length > 0 ? 'interface-toggle toggled' : 'interface-toggle'
      )
      cache.interfaceToggle = model.stereotype
    }
    if (cache.constraintToggle !== model.constraint) {
      abstractButton.setAttribute(
        'class',
        model.constraint.length > 0 ? 'abstract-toggle toggled' : 'abstract-toggle'
      )
      cache.constraintToggle = model.constraint
    }

    return oldVisual
  }

  /**
   * Helper method to get the edge style of the edge creation button if there is a button at the given location.
   * @param canvasComponent The canvas component in which the node resides.
   * @param node The node who should be checked for a button.
   * @param location The world location to check for a button.
   * @returns The edge style if there is a button at the given location, otherwise null.
   */
  static getStyleButtonAt(canvasComponent, node, location) {
    for (let i = 0; i < ButtonVisualCreator.buttons.length; i++) {
      const boundingRect = ButtonVisualCreator.buttons[i].getBoundingClientRect()
      const worldTopLeft = canvasComponent.pageToWorldCoordinates(
        new Point(boundingRect.left, boundingRect.top)
      )
      if (
        location.x >= worldTopLeft.x &&
        location.x <= worldTopLeft.x + 30 &&
        location.y >= worldTopLeft.y &&
        location.y <= worldTopLeft.y + 30
      ) {
        return ButtonVisualCreator.edgeCreationButtons[i]
      }
    }
    return null
  }

  /**
   * Helper method to get the context button at the given location.
   * @param node The node who should be checked for a button.
   * @param location The world location to check for a button.
   * @returns The context button at the given or null.
   */
  static getContextButtonAt(node, location) {
    const layout = node.layout
    if (
      location.x >= layout.x &&
      location.x <= layout.x + 20 &&
      location.y <= layout.y - 5 &&
      location.y >= layout.y - 25
    ) {
      return 'interface'
    }
    if (
      location.x >= layout.x + 25 &&
      location.x <= layout.x + 45 &&
      location.y <= layout.y - 5 &&
      location.y >= layout.y - 25
    ) {
      return 'abstract'
    }
    return null
  }
}

/**
 * Executes the button fan out animation.
 */
class ButtonAnimation extends BaseClass(IAnimation) {
  translationElement
  finishAngle
  rotationElement

  constructor(rotationElement, finishAngle, translationElement) {
    super()
    this.rotationElement = rotationElement
    this.finishAngle = finishAngle
    this.translationElement = translationElement
  }

  get preferredDuration() {
    return TimeSpan.fromMilliseconds(200)
  }

  /**
   * @param time - the animation time [0,1]
   */
  animate(time) {
    this.rotationElement.setAttribute(
      'transform',
      `rotate(${time * this.finishAngle}) translate(-15 -15)`
    )
    this.translationElement.setAttribute('transform', `translate(${time * 50} 0)`)
  }

  cleanUp() {}

  initialize() {}
}

/**
 * Helper class that creates a round button visual containing a given edge style visualization.
 */
class ButtonIconRenderer {
  gc

  constructor() {
    this.gc = new GraphComponent()
    this.gc.graphModelManager.hierarchicalNestingPolicy = HierarchicalNestingPolicy.NONE
    this.gc.graphModelManager.edgeGroup.above(this.gc.graphModelManager.nodeGroup)
  }

  renderButton(edgeStyle) {
    const graph = this.gc.graph
    graph.clear()
    const style = new ShapeNodeStyle({
      fill: 'white',
      stroke: '#607D8B',
      shape: ShapeNodeShape.ELLIPSE
    })
    graph.createNode(new Rect(-15, -15, 30, 30), style)
    const src = graph.createNode(new Rect(-10, 0, 1, 1), INodeStyle.VOID_NODE_STYLE)
    const tgt = graph.createNode(new Rect(10, 0, 1, 1), INodeStyle.VOID_NODE_STYLE)
    graph.createEdge(src, tgt, edgeStyle)
    const svgExport = new SvgExport(new Rect(-18, -18, 36, 36))
    return svgExport.exportSvg(this.gc)
  }

  renderTextButton(text) {
    const textSize = TextRenderSupport.measureText(
      text,
      new Font({ fontFamily: 'monospace', fontSize: 18 })
    )
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    background.setAttribute('width', '20')
    background.setAttribute('height', '20')
    background.setAttribute('fill', '#FFF')
    background.setAttribute('stroke', '#607D8B')
    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    textElement.setAttribute('font-family', 'monospace')
    textElement.setAttribute('font-size', '18')
    textElement.setAttribute('x', `${(20 - textSize.width) / 2}`)
    textElement.setAttribute('y', '16')
    textElement.textContent = text
    container.appendChild(background)
    container.appendChild(textElement)
    container.setAttribute('class', text === 'I' ? 'interface-toggle' : 'abstract-toggle')
    return container
  }
}
