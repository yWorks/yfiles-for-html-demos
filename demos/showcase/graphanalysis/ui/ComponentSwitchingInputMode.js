/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import './component-switching-input-mode.css'
import {
  BaseClass,
  GraphModelManager,
  IBoundsProvider,
  IEdge,
  IHitTestable,
  INode,
  InputModeBase,
  IObjectRenderer,
  IVisibilityTestable,
  IVisualCreator,
  Point,
  PointerButtons,
  SvgVisual
} from '@yfiles/yfiles'
import { getColorForComponent } from '../styles'
import { getTag } from '../demo-types'

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * An input mode that shows an overlay and allows to switch between the displayed
 * components for nodes that belong to multiple components.
 * The input mode will also highlight all nodes and edges belonging to a component
 * being hovered over.
 */
export class ComponentSwitchingInputMode extends InputModeBase {
  /** The {@link GraphModelManager} that shows an overlay for potentially every node. */
  modelManager
  /** The render tree group into which the overlays are rendered. */
  renderTreeGroup
  /** The node currently hovered over, showing an extended popup for selecting the displayed component. */
  hoveredNode
  /** The render tree element for the popup on a hovered node */
  popupRenderTreeElement

  // Input event listeners; we need to bind them once, so we can remove them later again.
  mouseMovedHandler = this.onMouseMoved.bind(this)
  mouseLeftHandler = this.onMouseLeft.bind(this)
  mouseClickedHandler = this.onMouseClicked.bind(this)

  install(context, controller) {
    super.install(context, controller)
    const graphComponent = context.canvasComponent

    // Add custom node overlays where multiple components are present
    const renderTree = context.canvasComponent.renderTree
    this.renderTreeGroup = renderTree.createGroup(renderTree.rootGroup)
    // Show them right above the graph and below the selection
    this.renderTreeGroup.below(renderTree.selectionGroup)
    // We use a GraphModelManager here, which automatically keeps one visualization
    // for each graph item around.
    this.modelManager = new GraphModelManager()
    // Apply custom rendering for nodes
    this.modelManager.nodeRenderer = new ComponentOverlayRenderer(this)
    // Disable all other graph items
    this.modelManager.edgeRenderer = IObjectRenderer.VOID_OBJECT_RENDERER
    this.modelManager.portRenderer = IObjectRenderer.VOID_OBJECT_RENDERER
    this.modelManager.edgeLabelRenderer = IObjectRenderer.VOID_OBJECT_RENDERER
    this.modelManager.nodeLabelRenderer = IObjectRenderer.VOID_OBJECT_RENDERER
    this.modelManager.portLabelRenderer = IObjectRenderer.VOID_OBJECT_RENDERER
    this.modelManager.install(graphComponent, graphComponent.graph)

    // Input event handling
    graphComponent.addEventListener('pointer-move', this.mouseMovedHandler)
    graphComponent.addEventListener('pointer-leave', this.mouseLeftHandler)
    graphComponent.addEventListener('pointer-click', this.mouseClickedHandler)
  }

  uninstall(context) {
    const graphComponent = context.canvasComponent
    this.modelManager?.uninstall(graphComponent)
    if (this.renderTreeGroup) {
      graphComponent.renderTree.remove(this.renderTreeGroup)
      this.renderTreeGroup = undefined
    }

    graphComponent.removeEventListener('pointer-move', this.mouseMovedHandler)
    graphComponent.removeEventListener('pointer-leave', this.mouseLeftHandler)
    graphComponent.removeEventListener('pointer-click', this.mouseClickedHandler)

    super.uninstall(context)
  }

  /**
   * Event listener for mouse move events.
   * This performs a hit-test to see what item is under the mouse pointer
   * and then proceeds accordingly, depending on what has been hit.
   */
  onMouseMoved(evt, sender) {
    const hitTest = this.hitTest(this.createInputModeContext(), sender.lastEventLocation)
    switch (hitTest.result) {
      case 'nothing':
        this.highlightComponent(null)
        this.hideFlyout()
        this.parentInputModeContext?.invalidateDisplays()
        break
      case 'node':
        if (shouldShowOverlay(hitTest.item)) {
          this.showPopup(hitTest.item)
        }
        this.highlightComponent(getCurrentComponent(hitTest.item, evt.location))
        break
      case 'edge':
        this.highlightComponent(getCurrentComponent(hitTest.item, evt.location))
        this.hideFlyout()
        break
      case 'popup':
        this.highlightComponent(getCurrentComponent(hitTest.item, evt.location))
        break
    }
  }

  /**
   * Determines what item is at the given location.
   */
  hitTest(context, location) {
    for (const renderTreeElement of context.canvasComponent.renderTree.hitElementsAt(
      location,
      context
    )) {
      const userObject = renderTreeElement.tag
      if (userObject instanceof ComponentSelectionPopup) {
        return { result: 'popup', item: userObject }
      }
      if (userObject instanceof INode) {
        return { result: 'node', item: userObject }
      }
      if (userObject instanceof IEdge) {
        return { result: 'edge', item: userObject }
      }
    }
    return { result: 'nothing' }
  }

  /**
   * Event listener when the mouse leaves the component.
   * Resets the popup and overlay state.
   */
  onMouseLeft() {
    this.highlightComponent(null)
    this.hideFlyout()
    this.parentInputModeContext?.invalidateDisplays()
  }

  /**
   * Highlights all nodes and edges belonging to a particular component.
   */
  highlightComponent(componentId) {
    const graph = this.parentInputModeContext?.graph
    if (graph) {
      for (const node of graph.nodes) {
        const tag = getTag(node)
        if (tag) {
          this.updateHighlightedComponent(tag, componentId)
        }
      }
      for (const edge of graph.edges) {
        const tag = getTag(edge)
        if (tag) {
          this.updateHighlightedComponent(tag, componentId)
        }
      }
      this.parentInputModeContext.invalidateDisplays()
    }
  }

  /**
   * Updates the tag for an item with a highlighted component or
   * removes the highlight, as needed.
   */
  updateHighlightedComponent(tag, componentId) {
    if (componentId !== null && tag.components.includes(componentId)) {
      tag.highlightedComponent = componentId
    } else {
      delete tag.highlightedComponent
    }
  }

  /**
   * Enlarges the multicolored component circle that then serves as a popup
   * to select the component to display.
   */
  showPopup(node) {
    if (this.popupRenderTreeElement) {
      return
    }
    this.hoveredNode = node
    if (this.renderTreeGroup) {
      const componentSelectionPopup = new ComponentSelectionPopup(node)
      this.popupRenderTreeElement =
        this.parentInputModeContext?.canvasComponent.renderTree.createElement(
          this.renderTreeGroup,
          componentSelectionPopup,
          componentSelectionPopup
        )
      this.popupRenderTreeElement?.toBack()
    }
  }

  hideFlyout() {
    this.hoveredNode = undefined
    if (this.popupRenderTreeElement) {
      this.parentInputModeContext?.canvasComponent.renderTree.remove(this.popupRenderTreeElement)
    }
    this.popupRenderTreeElement = undefined
  }

  /**
   * Event listener for mouse clicks.
   * Clicking on a component color in the popup makes that component display
   * in front of others.
   */
  onMouseClicked(evt, _sender) {
    if (evt.changedButtons === PointerButtons.MOUSE_LEFT && this.hoveredNode) {
      const hitTest = this.hitTest(this.createInputModeContext(), evt.location)
      if (hitTest.result === 'popup') {
        this.requestMutex()
        const component = getCurrentComponent(hitTest.item, evt.location)
        this.switchToComponent(component)
        this.releaseMutex()
      }
    }
  }

  /**
   * Causes the given component to be rendered if it belongs to a node or edge.
   * This works by virtue of the first component in the tag being used for
   * the node and edge colors (cf. {@link TagColoredShapeNodeStyle}).
   */
  switchToComponent(component) {
    // Reorder the desired component to start of the components' list,
    // so it will be highlighted for all nodes where this is a shared component
    const graph = this.parentInputModeContext?.graph
    if (this.parentInputModeContext && graph) {
      for (const node of graph.nodes) {
        const tag = getTag(node)
        if (tag) {
          sortToBeginning(component, tag.components)
        }
      }
      for (const edge of graph.edges) {
        const tag = getTag(edge)
        if (tag) {
          sortToBeginning(component, tag.components)
        }
      }
      this.parentInputModeContext.invalidateDisplays()
    }
  }
}

/**
 * A custom renderer implementation that renders a multicolored circle for nodes
 * that belong to multiple components.
 */
class ComponentOverlayRenderer extends BaseClass(
  IObjectRenderer,
  IVisibilityTestable,
  IVisualCreator
) {
  inputMode
  node

  constructor(inputMode) {
    super()
    this.inputMode = inputMode
  }

  createVisual(context) {
    // Some nodes may not have a tag, or components in the tag;
    // we don't have to do anything for them
    const node = this.node
    if (!shouldShowOverlay(node)) {
      return null
    }

    const tag = getTag(node)
    const components = getSortedComponents(tag.components)

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.classList.add('components-overlay')
    this.updateCssClasses(g)

    const { x, y, width } = node.layout
    const radius = width * 0.5

    const ringGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    ringGroup.classList.add('components')
    if (tag.type) {
      ringGroup.classList.add(tag.type)
    }

    renderComponentSegments(components, ringGroup, radius - 2.5, radius, radius)

    g.append(ringGroup)

    // White circle to separate the outer ring from the node
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.cx.baseVal.value = circle.cy.baseVal.value = radius
    circle.r.baseVal.value = radius - 5
    circle.setAttribute('fill', 'none')
    circle.setAttribute('stroke', 'white')
    circle.setAttribute('stroke-width', '2')

    g.append(circle)

    // Move to the node's location
    SvgVisual.setTranslate(g, x, y)

    const visual = new SvgVisual(g)

    // Remember node size and components for updating later
    visual.size = width
    visual.components = new Set(components)
    return visual
  }

  updateVisual(context, oldVisual) {
    const node = this.node
    const tag = getTag(node)
    const components = getSortedComponents(tag.components)
    if (components.length < 2) {
      return null
    }
    const { x, y, width } = node.layout

    const visual = oldVisual
    if (visual.size !== undefined && visual.components) {
      if (
        visual.size === width &&
        components.length === visual.components.size &&
        components.every((c) => visual.components.has(c))
      ) {
        const g = visual.svgElement

        // Update location and CSS class
        SvgVisual.setTranslate(g, x, y)
        this.updateCssClasses(g)

        return visual
      }
    }
    return this.createVisual(context)
  }

  /**
   * Updates the CSS classes based on whether this node is currently hovered over
   * and whether the node is highlighted.
   */
  updateCssClasses(element) {
    if (this.inputMode.hoveredNode === this.node) {
      element.classList.add('hovered')
    } else {
      element.classList.remove('hovered')
    }
    const tag = getTag(this.node)
    if (tag.highlightedComponent !== undefined) {
      element.classList.add('highlighted')
    } else {
      element.classList.remove('highlighted')
    }
  }

  isVisible(context, rectangle) {
    const node = this.node
    if (!node) {
      return false
    }
    return rectangle.intersects(node.layout.toRect().getEnlarged(node.layout.width))
  }

  getBoundsProvider(renderTag) {
    return IBoundsProvider.EMPTY
  }

  getHitTestable(renderTag) {
    return IHitTestable.NEVER
  }

  getVisibilityTestable(renderTag) {
    this.node = renderTag
    return this
  }

  getVisualCreator(renderTag) {
    this.node = renderTag
    return this
  }
}

/**
 * Determines whether to show the multicolored circle overlay for a given node.
 */
function shouldShowOverlay(node) {
  const tag = getTag(node)
  return !!tag && !tag.type && tag.components.length > 1 && tag.gradient === undefined
}

/**
 * Returns a sorted list of components to keep the overlay stable.
 */
function getSortedComponents(components) {
  return [...components].sort((a, b) => a - b)
}

/**
 * Renders a multicolored ring with the given radius for all components.
 */
function renderComponentSegments(components, g, radius, cx, cy) {
  const angle = (2 * Math.PI) / components.length
  const angleDeg = (angle * 180) / Math.PI
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)

  // Sort components to always get a consistent order of colors
  components = getSortedComponents(components)

  const d = `M ${cx} ${cy - radius} A${radius},${radius} 0 0,1 ${cx + sin * radius},${cy - cos * radius}`

  for (let i = 0; i < components.length; i++) {
    const slice = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    slice.setAttribute('d', d)

    const component = components[i]
    const color = getColorForComponent(component)
    slice.setAttribute('stroke', color)
    slice.setAttribute('transform', `rotate(${i * angleDeg} ${cx} ${cy})`)

    g.append(slice)
  }
}

function getCurrentComponent(item, location) {
  if (item instanceof ComponentSelectionPopup) {
    return getComponentFromPopup(item, location)
  } else {
    const tag = getTag(item)
    if (tag && tag.components.length > 0) {
      return tag.components[0]
    }
  }
  return null
}

function getComponentFromPopup(popup, location) {
  const node = popup.node
  const tag = getTag(node)
  const center = node.layout.center
  const up = new Point(0, -1)
  const vector = location.subtract(center)

  let angle = Math.acos(up.scalarProduct(vector) / vector.vectorLength)
  if (location.x < center.x) {
    angle *= -1
  }

  // Normalize to 0-2pi
  angle += 2 * Math.PI
  angle %= 2 * Math.PI

  const components = getSortedComponents(tag.components)
  const sliceAngle = (2 * Math.PI) / components.length
  const index = Math.floor(angle / sliceAngle)
  return components[index]
}

/**
 * Sorts a given number to the beginning of the array.
 */
function sortToBeginning(component, components) {
  if (components.length > 1) {
    const index = components.indexOf(component)
    if (index >= 0) {
      components.splice(index, 1)
      components.unshift(component)
    }
  }
}

/**
 * Helper hit-testing object added around a node, so that we can distinguish
 * hitting a node, this popup, or nothing with a yFiles {@link IRenderTreeElement}-based
 * hit-test.
 */
class ComponentSelectionPopup extends BaseClass(IObjectRenderer, IHitTestable) {
  node

  constructor(node) {
    super()
    this.node = node
  }

  getBoundsProvider(renderTag) {
    return IBoundsProvider.UNBOUNDED
  }

  getHitTestable(renderTag) {
    return this
  }

  getVisibilityTestable(renderTag) {
    return IVisibilityTestable.ALWAYS
  }

  getVisualCreator(renderTag) {
    return IVisualCreator.VOID_VISUAL_CREATOR
  }

  isHit(context, location) {
    const { center, width } = this.node.layout
    const distance = location.distanceTo(center)
    // Only consider the extended ring around the node
    return distance > width * 0.3 && distance < width * 1.2
  }
}
