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
// eslint-disable-next-line import/no-named-as-default
import {
  CanvasComponent,
  Command,
  CreateEdgeInputMode,
  DropInputMode,
  GeneralPath,
  GraphComponent,
  IGroupPaddingProvider,
  IInputModeContext,
  ILassoTestable,
  ILookup,
  INode,
  INodeSizeConstraintProvider,
  Insets,
  IRenderContext,
  MarkupExtension,
  MoveInputMode,
  NodeSizeConstraintProvider,
  NodeStyleBase,
  Point,
  Rect,
  Size,
  SvgVisual
} from '@yfiles/yfiles'
import { SVGNS } from './Namespaces'
const BORDER_THICKNESS = 4
// Due to a strange bug in Safari 10.8, calculating this in place as "2 * BORDER_THICKNESS" results in undefined
// Therefore, keep this constant for now.
const BORDER_THICKNESS2 = BORDER_THICKNESS + BORDER_THICKNESS
const HEADER_THICKNESS = 22
/**
 * A custom demo group style whose colors match the given well-known CSS rule.
 */
export class Sample2GroupNodeStyle extends NodeStyleBase {
  cssClass
  isCollapsible = false
  solidHitTest = false
  borderColor = '#0B7189'
  folderFrontColor = '#9CC5CF'
  folderBackColor = '#0B7189'
  constructor(cssClass = null) {
    super()
    this.cssClass = cssClass
  }
  /**
   * Creates the visual for a collapsed or expanded group node.
   */
  createVisual(renderContext, node) {
    const gc = renderContext.canvasComponent
    const layout = node.layout
    const container = document.createElementNS(SVGNS, 'g')
    // avoid defs support recursion - nothing to see here - move along!
    container.setAttribute('data-referencesafe', 'true')
    const collapsed = this.isCollapsed(node, gc)
    const visual = SvgVisual.from(container, {
      width: node.layout.width,
      height: node.layout.height,
      collapsed,
      isCollapsible: this.isCollapsible
    })
    if (collapsed) {
      this.renderFolder(renderContext, visual, node)
    } else {
      this.renderGroup(renderContext, visual, node)
    }
    SvgVisual.setTranslate(container, layout.x, layout.y)
    return visual
  }
  /**
   * Re-renders the group node by updating the old visual for improved performance.
   */
  updateVisual(renderContext, oldVisual, node) {
    const cache = oldVisual.tag
    if (!cache) {
      return this.createVisual(renderContext, node)
    }
    const collapsed = this.isCollapsed(node, renderContext.canvasComponent)
    if (collapsed) {
      this.updateFolder(renderContext, oldVisual, node)
    } else {
      this.updateGroup(renderContext, oldVisual, node)
    }
    SvgVisual.setTranslate(oldVisual.svgElement, node.layout.x, node.layout.y)
    return oldVisual
  }
  static createFolderPath(width, height, rounding) {
    // L, R, T, B is for left, right, top and bottom
    const insetLRB = 0.5
    const insetT = 2
    const radiusB = rounding - insetLRB
    const arcB = `a ${radiusB} ${radiusB} 0 0 0`
    const radiusT = rounding - insetT
    const arcT = ` a ${radiusT} ${radiusT} 0 0 0`
    return `
      M ${insetLRB + radiusT},17
      ${arcT} ${-radiusT} ${radiusT}
      L ${insetLRB},${height - rounding}
      ${arcB} ${radiusB} ${radiusB}
      l ${width - 2 * rounding},0
      ${arcB} ${radiusB} ${-radiusB}
      L ${width - insetLRB},${rounding}
      ${arcT} ${-radiusT} ${-radiusT}
      l ${-25 + radiusT},0
      q -2,0 -4,3.75
      l -4,7.5
      q -2,3.75 -4,3.75
      Z`
  }
  /**
   * Helper function to create a collapsed group node visual inside the given container.
   */
  renderFolder(context, visual, node) {
    const { width, height } = visual.tag
    const nodeRounding = 3.5
    const backgroundRect = document.createElementNS(SVGNS, 'rect')
    backgroundRect.setAttribute('rx', String(nodeRounding))
    backgroundRect.setAttribute('ry', String(nodeRounding))
    backgroundRect.setAttribute('fill', this.folderBackColor)
    backgroundRect.width.baseVal.value = width
    backgroundRect.height.baseVal.value = height
    const path = Sample2GroupNodeStyle.createFolderPath(width, height, nodeRounding)
    const folderPath = document.createElementNS(SVGNS, 'path')
    folderPath.setAttribute('d', path)
    folderPath.setAttribute('fill', this.folderFrontColor)
    const container = visual.svgElement
    container.appendChild(backgroundRect)
    container.appendChild(folderPath)
    const expandButton = this.createButton(false)
    expandButton.svgElement.setAttribute('transform', `translate(${width - 17} 5)`)
    container.appendChild(expandButton.svgElement)
    if (this.cssClass) {
      const attribute = `${this.cssClass}-collapsed`
      container.setAttribute('class', attribute)
      backgroundRect.setAttribute('class', 'folder-background')
      folderPath.setAttribute('class', 'folder-foreground')
    }
  }
  /**
   * Helper function to update the visual of a collapsed group node.
   */
  updateFolder(context, visual, node) {
    const container = visual.svgElement
    const cache = visual.tag
    if (!cache || !cache.isCollapsible) {
      cache.collapsed = true
      cache.isCollapsible = this.isCollapsible
      clear(visual.svgElement)
      this.renderFolder(context, visual, node)
      return
    }
    const { width, height } = node.layout
    const nodeRounding = 3.5
    let path, backgroundRect, folderPath
    if (!cache.collapsed) {
      // transition from expanded state
      const path = Sample2GroupNodeStyle.createFolderPath(width, height, nodeRounding)
      backgroundRect = container.childNodes.item(0)
      backgroundRect.setAttribute('fill', this.folderBackColor)
      folderPath = document.createElementNS(SVGNS, 'path')
      folderPath.setAttribute('d', path)
      folderPath.setAttribute('fill', this.folderFrontColor)
      container.replaceChild(folderPath, container.childNodes.item(1))
      // - to +
      const buttonGroup = container.childNodes.item(2)
      const minus = buttonGroup.childNodes.item(1)
      const vMinus = document.createElementNS(SVGNS, 'rect')
      vMinus.setAttribute('width', '2')
      vMinus.setAttribute('height', '8')
      vMinus.setAttribute('x', '5')
      vMinus.setAttribute('y', '2')
      vMinus.setAttribute('fill', this.borderColor)
      vMinus.setAttribute('stroke-width', '0') // we don't want a stroke here, even if it is set in the corresponding
      // css class
      if (this.cssClass) {
        const attribute = `${this.cssClass}-collapsed`
        container.setAttribute('class', attribute)
        backgroundRect.setAttribute('class', 'folder-background')
        folderPath.setAttribute('class', 'folder-foreground')
        minus.setAttribute('class', 'folder-foreground')
        vMinus.setAttribute('class', 'folder-foreground')
      }
      buttonGroup.appendChild(vMinus)
      cache.collapsed = true
    }
    // update old visual
    if (cache.width !== width || cache.height !== height) {
      backgroundRect = container.childNodes.item(0)
      backgroundRect.width.baseVal.value = width
      backgroundRect.height.baseVal.value = height
      path = Sample2GroupNodeStyle.createFolderPath(width, height, nodeRounding)
      folderPath = container.childNodes.item(1)
      folderPath.setAttribute('d', path)
      const expandButton = container.childNodes.item(2)
      expandButton.transform.baseVal.getItem(0).setTranslate(width - 17, 5)
      cache.width = width
      cache.height = height
    }
  }
  /**
   * Helper function to create an expanded group node visual inside the given container.
   */
  renderGroup(context, visual, node) {
    const container = visual.svgElement
    const { width, height } = node.layout
    const nodeRounding = '3.5'
    const outerRect = document.createElementNS(SVGNS, 'rect')
    outerRect.setAttribute('rx', nodeRounding)
    outerRect.setAttribute('ry', nodeRounding)
    outerRect.setAttribute('fill', this.borderColor)
    outerRect.width.baseVal.value = width
    outerRect.height.baseVal.value = height
    const innerRect = document.createElementNS(SVGNS, 'rect')
    const innerWidth = width - BORDER_THICKNESS2
    const headerHeight = HEADER_THICKNESS
    const innerHeight = height - headerHeight - BORDER_THICKNESS
    innerRect.setAttribute('fill', '#FFF')
    innerRect.x.baseVal.value = BORDER_THICKNESS
    innerRect.y.baseVal.value = headerHeight
    innerRect.width.baseVal.value = innerWidth
    innerRect.height.baseVal.value = innerHeight
    container.appendChild(outerRect)
    container.appendChild(innerRect)
    if (this.isCollapsible) {
      const collapseButton = this.createButton(true)
      collapseButton.svgElement.addEventListener('click', (evt) => {
        if (context.canvasComponent.canExecuteCommand(Command.TOGGLE_EXPANSION_STATE, node)) {
          context.canvasComponent.executeCommand(Command.TOGGLE_EXPANSION_STATE, node)
        }
      })
      // yfiles needs to capture all events after pointerdown, this interferes with
      // the click listener, thus we disable pointerdown for the button
      collapseButton.svgElement.addEventListener('pointerdown', (evt) => evt.preventDefault())
      collapseButton.svgElement.setAttribute('transform', `translate(${width - 17} 5)`)
      container.appendChild(collapseButton.svgElement)
    }
    if (this.cssClass) {
      const attribute = `${this.cssClass}-expanded`
      container.setAttribute('class', attribute)
      outerRect.setAttribute('class', 'group-border')
    }
  }
  /**
   * Helper function to update the visual of an expanded group node.
   */
  updateGroup(context, visual, node) {
    const cache = visual.tag
    if (!cache || cache.isCollapsible !== this.isCollapsible) {
      cache.collapsed = false
      cache.isCollapsible = this.isCollapsible
      clear(visual.svgElement)
      this.renderGroup(context, visual, node)
      return
    }
    const container = visual.svgElement
    const { width, height } = node.layout
    let backgroundRect
    let innerRect
    let innerWidth
    let innerHeight
    let headerHeight
    if (cache.collapsed) {
      // transition from collapsed state
      backgroundRect = container.childNodes.item(0)
      backgroundRect.setAttribute('fill', this.borderColor)
      innerRect = document.createElementNS(SVGNS, 'rect')
      innerWidth = width - BORDER_THICKNESS2
      headerHeight = HEADER_THICKNESS
      innerHeight = height - headerHeight - BORDER_THICKNESS
      innerRect.setAttribute('fill', '#FFF')
      innerRect.x.baseVal.value = BORDER_THICKNESS
      innerRect.y.baseVal.value = headerHeight
      innerRect.width.baseVal.value = innerWidth
      innerRect.height.baseVal.value = innerHeight
      container.replaceChild(innerRect, container.childNodes.item(1))
      const buttonGroup = container.childNodes.item(2)
      if (this.isCollapsible) {
        // change expand icon to collapse icon
        buttonGroup.removeChild(buttonGroup.childNodes.item(2))
      } else {
        // remove expand button
        container.removeChild(buttonGroup)
      }
      if (this.cssClass) {
        const attribute = `${this.cssClass}-expanded`
        container.setAttribute('class', attribute)
        backgroundRect.setAttribute('class', 'group-border')
        const minus = buttonGroup.childNodes.item(1)
        minus.setAttribute('class', 'group-border')
      }
      cache.collapsed = false
    }
    // update old visual
    if (cache.width !== width || cache.height !== height) {
      backgroundRect = container.childNodes.item(0)
      backgroundRect.width.baseVal.value = width
      backgroundRect.height.baseVal.value = height
      innerWidth = width - BORDER_THICKNESS2
      headerHeight = HEADER_THICKNESS
      innerHeight = height - headerHeight - BORDER_THICKNESS
      innerRect = container.childNodes.item(1)
      innerRect.width.baseVal.value = innerWidth
      innerRect.height.baseVal.value = innerHeight
      if (this.isCollapsible) {
        const expandButton = container.childNodes.item(2)
        expandButton.transform.baseVal.getItem(0).setTranslate(width - 17, 5)
      }
      cache.width = width
      cache.height = height
    }
  }
  /**
   * Helper function to create the collapse/expand button.
   */
  createButton(collapse) {
    const color = this.borderColor
    const container = document.createElementNS(SVGNS, 'g')
    const rect = document.createElementNS(SVGNS, 'rect')
    rect.setAttribute('fill', '#FFF')
    rect.setAttribute('width', '12')
    rect.setAttribute('height', '12')
    rect.setAttribute('rx', '1.5')
    rect.setAttribute('ry', '1.5')
    const minus = document.createElementNS(SVGNS, 'rect')
    minus.setAttribute('width', '8')
    minus.setAttribute('height', '2')
    minus.setAttribute('x', '2')
    minus.setAttribute('y', '5')
    minus.setAttribute('fill', color)
    minus.setAttribute('stroke-width', '0') // we don't want a stroke here, even if it is set in the corresponding css
    // class
    container.appendChild(rect)
    container.appendChild(minus)
    if (this.cssClass) {
      minus.setAttribute('class', collapse ? 'group-border' : 'folder-foreground')
    }
    if (!collapse) {
      const vMinus = document.createElementNS(SVGNS, 'rect')
      vMinus.setAttribute('width', '2')
      vMinus.setAttribute('height', '8')
      vMinus.setAttribute('x', '5')
      vMinus.setAttribute('y', '2')
      vMinus.setAttribute('fill', color)
      vMinus.setAttribute('stroke-width', '0') // we don't want a stroke here, even if it is set in the corresponding
      // css class
      container.appendChild(vMinus)
      if (this.cssClass) {
        vMinus.setAttribute('class', 'folder-foreground')
      }
    }
    container.setAttribute('class', 'demo-collapse-button')
    return new SvgVisual(container)
  }
  /**
   * Performs a lookup operation.
   */
  lookup(node, type) {
    if (type === ILassoTestable) {
      const paddingProvider = node.lookup(IGroupPaddingProvider)
      if (paddingProvider != null) {
        return ILassoTestable.create((context, lassoPath) => {
          const path = new GeneralPath()
          const padding = paddingProvider.getPadding()
          const outerRect = node.layout.toRect()
          path.appendRectangle(outerRect, false)
          // check if its completely outside
          if (!lassoPath.areaIntersects(path, context.hitTestRadius)) {
            return false
          }
          path.clear()
          const innerRect = outerRect.getReduced(padding)
          path.appendRectangle(innerRect, false)
          // now it's a hit if either the inner border is hit or one point of the border
          // itself is contained in the lasso
          return (
            lassoPath.pathIntersects(path, context.hitTestRadius) ||
            lassoPath.areaContains(node.layout.topLeft)
          )
        })
      } else {
        // no insets - we only check the center of the node.
        return ILassoTestable.create((context, lassoPath) =>
          lassoPath.areaContains(node.layout.center, context.hitTestRadius)
        )
      }
    } else if (type === IGroupPaddingProvider) {
      return IGroupPaddingProvider.create(() => {
        const margin = 5
        return new Insets(
          HEADER_THICKNESS + margin,
          BORDER_THICKNESS + margin,
          BORDER_THICKNESS + margin,
          BORDER_THICKNESS + margin
        )
      })
    } else if (type === INodeSizeConstraintProvider) {
      return new NodeSizeConstraintProvider(new Size(40, 30), Size.INFINITE, Rect.EMPTY)
    }
    return super.lookup(node, type)
  }
  /**
   * Hit test which considers HitTestRadius specified in CanvasContext.
   * @returns True if p is inside node.
   */
  isHit(inputModeContext, p, node) {
    const layout = node.layout.toRect()
    if (this.solidHitTest || this.isCollapsed(node, inputModeContext.canvasComponent)) {
      return layout.contains(p, inputModeContext.hitTestRadius)
    }
    if (
      (inputModeContext.inputMode instanceof CreateEdgeInputMode &&
        inputModeContext.inputMode.isCreationInProgress) ||
      (inputModeContext.inputMode instanceof MoveInputMode &&
        inputModeContext.inputMode.isDragging) ||
      inputModeContext.inputMode instanceof DropInputMode
    ) {
      // during edge creation - the whole area is considered a hit
      return layout.contains(p, inputModeContext.hitTestRadius)
    }
    const innerWidth = layout.width - BORDER_THICKNESS2
    const innerHeight = layout.height - HEADER_THICKNESS - BORDER_THICKNESS
    const innerLayout = new Rect(
      layout.x + BORDER_THICKNESS,
      layout.y + HEADER_THICKNESS,
      innerWidth,
      innerHeight
    ).getEnlarged(-inputModeContext.hitTestRadius)
    return layout.contains(p, inputModeContext.hitTestRadius) && !innerLayout.contains(p)
  }
  isInBox(inputModeContext, box, node) {
    return box.contains(node.layout.topLeft) && box.contains(node.layout.bottomRight)
  }
  /**
   * Returns whether the given group node is collapsed.
   */
  isCollapsed(node, gc) {
    if (!(gc instanceof GraphComponent)) {
      return false
    }
    const foldedGraph = gc.graph.foldingView
    // check if given node is in graph
    if (foldedGraph === null || !foldedGraph.graph.contains(node)) {
      return false
    }
    // check if the node really is a group in the master graph
    return !foldedGraph.isExpanded(node)
  }
}
function clear(container) {
  while (container.lastChild) {
    container.removeChild(container.lastChild)
  }
}
export class Sample2GroupNodeStyleExtension extends MarkupExtension {
  get solidHitTest() {
    return this._solidHitTest
  }
  set solidHitTest(value) {
    this._solidHitTest = value
  }
  get isCollapsible() {
    return this._isCollapsible
  }
  set isCollapsible(value) {
    this._isCollapsible = value
  }
  get cssClass() {
    return this._cssClass
  }
  set cssClass(value) {
    this._cssClass = value
  }
  _cssClass = ''
  _isCollapsible = false
  _solidHitTest = false
  provideValue(serviceProvider) {
    const style = new Sample2GroupNodeStyle(this._cssClass)
    style.isCollapsible = this._isCollapsible
    style.solidHitTest = this._solidHitTest
    return style
  }
}
