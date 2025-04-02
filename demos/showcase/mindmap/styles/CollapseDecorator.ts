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
  type Constructor,
  ExteriorNodeLabelModel,
  FilteredGraphWrapper,
  type GeneralPath,
  GraphComponent,
  type ICanvasContext,
  IconLabelStyle,
  type IGraph,
  type IInputModeContext,
  type ILabelModelParameter,
  type INode,
  type INodeStyle,
  Insets,
  InteriorNodeLabelModel,
  type IRenderContext,
  NodeStyleBase,
  type Point,
  type Rect,
  SimpleLabel,
  Size,
  SvgVisual,
  type TaggedSvgVisual
} from '@yfiles/yfiles'
import type { NodeData } from '../data-types'
import { getNodeData } from '../data-types'

import { canExecuteToggleCollapseState, executeToggleCollapseState } from '../interaction/commands'
import { hasChildNodes } from '../subtrees'

/**
 * Augment the SvgVisual type with the wrappedVisual used to cache the rendering information.
 */
type Cache = {
  wrappedVisual?: SvgVisual
}
type CollapseDecoratorVisual = TaggedSvgVisual<SVGGElement, Cache>
/**
 * Augment the SVGElement type with the label and the icon used to cache the rendering information.
 */
declare type CachedButton = SVGElement & { label?: SimpleLabel; iconVisual?: SvgVisual }

/**
 * A node style decorator that adds a collapse/expand button on the nodes.
 *
 * This style implements the decorator pattern. Two {@link IconLabelStyle}
 * instances are used to render the collapse and expand buttons. The actual
 * style is determined using the {@link NodeData.collapsed}
 * information in the node's data.
 *
 * A {@link SimpleLabel dummy label} is used for rendering the collapse/expand
 * button. Two label model parameters determine the placement of the label on the
 * bottom-right and bottom-left corner of the node. This way the button placement
 * is determined automatically by the dummy label's style.
 */
export class CollapseDecorator extends NodeStyleBase<CollapseDecoratorVisual> {
  /**
   * The size of the collapse/expand icon.
   */
  static readonly ICON_SIZE: Size = new Size(18, 18)

  /**
   * Creates a new instance of this style using the given node style as wrapped style.
   * @param wrappedNodeStyle The style used for rendering the node.
   */
  constructor(readonly wrappedNodeStyle: INodeStyle) {
    super()
  }

  /**
   * Creates the visual of the node based on the given node style,
   * and adds the expand/collapse button, if necessary.
   */
  createVisual(context: IRenderContext, node: INode): CollapseDecoratorVisual {
    // create the complete g element
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    // creates the node's visual
    const nodeVisual = this.wrappedNodeStyle.renderer
      .getVisualCreator(node, this.wrappedNodeStyle)
      .createVisual(context) as SvgVisual

    // create the collapse/expand button visual
    const iconVisual = this.createButtonVisual(
      node,
      context,
      hasChildNodes(node, getFullGraph(context)!)
    )

    // add both visuals to the container
    g.appendChild(nodeVisual.svgElement)
    g.appendChild(iconVisual)

    // stores the complete visual to be used during updateVisual
    return SvgVisual.from(g, { wrappedVisual: nodeVisual })
  }

  /**
   * Updates the complete visual.
   * The method checks whether the complete visual has to be created from scratch or whether only
   * the icon visual has to be updated.
   */
  updateVisual(
    context: IRenderContext,
    oldVisual: CollapseDecoratorVisual,
    node: INode
  ): CollapseDecoratorVisual {
    // if the old visual does not contain a wrappedNodeVisual,
    // re-create the style
    if (!oldVisual.tag.wrappedVisual) {
      return this.createVisual(context, node)
    }

    // get the complete old visual and compare it with the current wrapped visual
    const container = oldVisual.svgElement
    const oldWrappedVisual = oldVisual.tag.wrappedVisual
    // update the wrappedNodeStyle visual
    const newWrappedVisual = this.wrappedNodeStyle.renderer
      .getVisualCreator(node, this.wrappedNodeStyle)
      .updateVisual(context, oldWrappedVisual) as SvgVisual

    if (oldWrappedVisual !== newWrappedVisual) {
      container.childNodes[0] = newWrappedVisual.svgElement
      oldVisual.tag.wrappedVisual = newWrappedVisual
    }

    // retrieve the icon visual from the container
    const iconElement = container.childNodes[1]
    // update the icon visual
    CollapseDecorator.updateIconVisual(
      node,
      context,
      iconElement as CachedButton,
      hasChildNodes(node, getFullGraph(context)!)
    )

    return oldVisual
  }

  /**
   * Creates the collapse/expand icon visualization, and registers the click and touch
   * listeners for the collapse/expand operations.
   */
  createButtonVisual(node: INode, context: IRenderContext, visible: boolean): SVGElement {
    const graphComponent = context.canvasComponent as GraphComponent

    // create a label that acts as a dummy item to render the icon
    const data = getNodeData(node)
    // create a new dummy label, set its size and style
    const label = new SimpleLabel(node, '', getLabelModelParameter(data))
    label.preferredSize = CollapseDecorator.ICON_SIZE
    label.style = getLabelStyle(data)

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g') as CachedButton
    // store the label with the visual for updating
    g.label = label

    if (visible) {
      // delegate the rendering of the dummy label to the label's style
      const creator = label.style.renderer.getVisualCreator(label, label.style)
      const iconVisual = creator.createVisual(context)
      if (iconVisual instanceof SvgVisual) {
        iconVisual.svgElement.setAttribute('class', 'collapse-button')

        // append the visual at the outer element and update the cache information
        g.appendChild(iconVisual.svgElement)
        g.iconVisual = iconVisual
      }
    }

    // register the click and touch listeners for the collapse/expand operation
    g.addEventListener(
      'click',
      (_) => {
        if (canExecuteToggleCollapseState(graphComponent, node)) {
          executeToggleCollapseState(graphComponent, node)
        }
      },
      true
    )
    // pointerdown causes the capturing of subsequent pointer events, thus we need to disable
    // pointerdown on the current element such that the native click event is triggered furthermore
    // this causes the input mode to not handle any event on the button where we registered
    // a native click listener
    g.addEventListener('pointerdown', (e) => e.preventDefault())
    g.addEventListener(
      'touchstart',
      (evt) => {
        // prevent subsequent firing of a click event
        evt.preventDefault()
        if (canExecuteToggleCollapseState(graphComponent, node)) {
          executeToggleCollapseState(graphComponent, node)
        }
      },
      {
        passive: false,
        capture: true
      }
    )
    return g
  }

  /**
   * Updates the icon visualization based on the current node data.
   * @param node The node to update the visual for.
   * @param context The render context.
   * @param container The HTML Element that contains the icon.
   * @param visible True if the icon should be visible, false otherwise.
   */
  static updateIconVisual(
    node: INode,
    context: IRenderContext,
    container: CachedButton,
    visible: boolean
  ): void {
    const nodeData = getNodeData(node)
    // retrieve the old label information from the container
    const oldLabel = container.label!
    const oldButtonVisual = container.iconVisual as SvgVisual | undefined

    // get the new label model parameter and style to use for the dummy label
    const newModelParameter = getLabelModelParameter(nodeData)
    const newStyle = getLabelStyle(nodeData)

    if (visible) {
      let newButtonVisual: SvgVisual
      const oldStyle = oldLabel.style as IconLabelStyle
      if (
        oldButtonVisual &&
        oldStyle.href === newStyle.href &&
        oldStyle.iconPlacement === newStyle.iconPlacement &&
        oldStyle.iconSize === newStyle.iconSize &&
        oldLabel.layoutParameter === newModelParameter
      ) {
        // if style and label model parameter did not change, update the label visual
        newButtonVisual = oldStyle.renderer
          .getVisualCreator(oldLabel, oldStyle)
          .updateVisual(context, oldButtonVisual) as SvgVisual
      } else {
        oldLabel.style = newStyle
        oldLabel.layoutParameter = newModelParameter
        // and create new label visual
        newButtonVisual = newStyle.renderer
          .getVisualCreator(oldLabel, newStyle)
          .createVisual(context) as SvgVisual
      }

      if (oldButtonVisual !== newButtonVisual) {
        container.iconVisual = newButtonVisual
        newButtonVisual.svgElement.setAttribute('class', 'collapse-button')
        while (container.firstChild) {
          container.removeChild(container.firstChild)
        }
        container.appendChild(newButtonVisual.svgElement)
      }
    } else {
      // if not visible, remove all children
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }
    }
  }

  /**
   * Checks if the button and the node style are visible.
   */
  isVisible(canvasContext: ICanvasContext, clip: Rect, node: INode): boolean {
    // check if node bounds + icon is visible
    const iconWidth = CollapseDecorator.ICON_SIZE.width
    const iconHeight = CollapseDecorator.ICON_SIZE.height
    const isIconVisible = clip.intersects(
      node.layout.toRect().getEnlarged(new Insets(iconHeight, iconWidth, iconHeight, iconWidth))
    )
    return (
      isIconVisible ||
      this.wrappedNodeStyle.renderer
        .getVisibilityTestable(node, this.wrappedNodeStyle)
        .isVisible(canvasContext, clip)
    )
  }

  /**
   * Returns the outline of the node by delegating the call to the wrapped node style.
   */
  getOutline(node: INode): GeneralPath | null {
    return this.wrappedNodeStyle.renderer.getShapeGeometry(node, this.wrappedNodeStyle).getOutline()
  }

  /**
   * Returns the bounds of the node by delegating the call to the wrapped node style.
   */
  getBounds(canvasContext: ICanvasContext, node: INode): Rect {
    return this.wrappedNodeStyle.renderer
      .getBoundsProvider(node, this.wrappedNodeStyle)
      .getBounds(canvasContext)
  }

  /**
   * Checks whether the node is hit by delegating the call to the wrapped node style.
   */
  isHit(canvasContext: IInputModeContext, p: Point, node: INode): boolean {
    return this.wrappedNodeStyle.renderer
      .getHitTestable(node, this.wrappedNodeStyle)
      .isHit(canvasContext, p)
  }

  /**
   * Determines whether the visualization for the specified node is included in the marquee selection
   * by delegating the call to the wrapped node style.
   */
  isInBox(canvasContext: IInputModeContext, box: Rect, node: INode): boolean {
    return this.wrappedNodeStyle.renderer
      .getMarqueeTestable(node, this.wrappedNodeStyle)
      .isInBox(canvasContext, box)
  }

  /**
   * Performs the lookup operation by delegating the call to the wrapped node style.
   */
  lookup<T>(node: INode, type: Constructor<T>): T | null {
    return this.wrappedNodeStyle.renderer.getContext(node, this.wrappedNodeStyle).lookup(type)
  }

  /**
   * Gets the intersection of a line with the visual representation of the node
   * by delegating the call to the wrapped node style.
   */
  getIntersection(node: INode, inner: Point, outer: Point): Point | null {
    return this.wrappedNodeStyle.renderer
      .getShapeGeometry(node, this.wrappedNodeStyle)
      .getIntersection(inner, outer)
  }

  /**
   * Determines whether the provided point is inside the visual bounds of the node
   * by delegating the call to the wrapped node style.
   */
  isInside(node: INode, point: Point): boolean {
    return this.wrappedNodeStyle.renderer
      .getShapeGeometry(node, this.wrappedNodeStyle)
      .isInside(point)
  }
}

/**
 * Returns the label style used to render the dummy label.
 */
function getLabelStyle(data: NodeData): IconLabelStyle {
  const icon =
    data.left === data.collapsed
      ? 'resources/icons/arrow-left.svg'
      : 'resources/icons/arrow-right.svg'
  return new IconLabelStyle({
    href: icon,
    iconSize: CollapseDecorator.ICON_SIZE,
    iconPlacement: InteriorNodeLabelModel.CENTER
  })
}

/**
 * Precalculated models and parameters for the below function
 */
const labelModel = new ExteriorNodeLabelModel({ margins: [0, 0, -9, 0] })
const leftParameter = labelModel.createParameter('bottom-left')
const rightParameter = labelModel.createParameter('bottom-right')

/**
 * Returns the label model parameter used to render the dummy label.
 */
function getLabelModelParameter(data: NodeData): ILabelModelParameter {
  if (data.depth === 0) {
    return ExteriorNodeLabelModel.BOTTOM
  }
  return data.left ? leftParameter : rightParameter
}

/**
 * Returns the full graph from the render context if the graph is a {@link FilteredGraphWrapper}.
 * Otherwise returns null.
 */
function getFullGraph(context: IRenderContext): IGraph | null {
  if (context.canvasComponent instanceof GraphComponent) {
    const graph = context.canvasComponent.graph
    if (graph instanceof FilteredGraphWrapper) {
      return graph.wrappedGraph
    }
  }
  return null
}
