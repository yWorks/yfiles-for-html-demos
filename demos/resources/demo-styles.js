/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Arrow,
  ArrowType,
  BaseClass,
  BridgeManager,
  Class,
  CollapsibleNodeStyleDecoratorRenderer,
  CreateEdgeInputMode,
  DefaultLabelStyle,
  DropInputMode,
  EdgeStyleBase,
  Fill,
  GeneralPath,
  GraphComponent,
  GraphMLAttribute,
  GraphOverviewCanvasVisualCreator,
  IArrow,
  IBoundsProvider,
  ICanvasContext,
  IEdge,
  IGraph,
  IInputModeContext,
  ILassoTestable,
  INode,
  INodeInsetsProvider,
  INodeSizeConstraintProvider,
  Insets,
  InteriorStretchLabelModel,
  InteriorStretchLabelModelPosition,
  IObstacleProvider,
  IRenderContext,
  ISvgDefsCreator,
  IVisualCreator,
  MarkupExtension,
  MoveInputMode,
  NodeSizeConstraintProvider,
  NodeStyleBase,
  Point,
  Rect,
  Size,
  SolidColorFill,
  SvgVisual,
  TextWrapping,
  TypeAttribute,
  Visual,
  YBoolean,
  YString
} from 'yfiles'

export class DemoNodeStyle extends NodeStyleBase {
  constructor() {
    super()
    this.cssClass = ''
  }

  /**
   * Creates the visual for a node.
   * @param {INode} node
   * @param {IRenderContext} renderContext
   * @return {SvgVisual}
   */
  createVisual(renderContext, node) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    const layout = node.layout
    const nodeRounding = '2'
    rect.width.baseVal.value = layout.width
    rect.height.baseVal.value = layout.height
    rect.setAttribute('rx', nodeRounding)
    rect.setAttribute('ry', nodeRounding)
    rect.setAttribute('fill', '#FF8C00')
    rect.setAttribute('stroke', '#FFF')
    rect.setAttribute('stroke-width', '1px')

    if (this.cssClass) {
      rect.setAttribute('class', this.cssClass)
    }

    rect['data-renderDataCache'] = {
      x: layout.x,
      y: layout.y,
      width: layout.width,
      height: layout.height,
      cssClass: this.cssClass
    }

    rect.setAttribute('transform', 'translate(' + layout.x + ' ' + layout.y + ')')

    return new SvgVisual(rect)
  }

  /**
   * Re-renders the node by updating the old visual for improved performance.
   * @param {INode} node
   * @param {IRenderContext} renderContext
   * @param {SvgVisual} oldVisual
   * @return {SvgVisual}
   */
  updateVisual(renderContext, oldVisual, node) {
    const rect = oldVisual.svgElement
    const cache = rect['data-renderDataCache']
    if (!cache) {
      return this.createVisual(renderContext, node)
    }

    const layout = node.layout
    const width = layout.width
    const height = layout.height

    if (cache.width !== width) {
      rect.width.baseVal.value = width
      cache.width = width
    }
    if (cache.height !== height) {
      rect.height.baseVal.value = height
      cache.height = height
    }
    if (cache.x !== layout.x || cache.y !== layout.y) {
      rect.transform.baseVal.getItem(0).setTranslate(layout.x, layout.y)
      cache.x = layout.x
      cache.y = layout.y
    }

    if (cache.cssClass !== this.cssClass) {
      if (this.cssClass) {
        rect.setAttribute('class', this.cssClass)
      } else {
        rect.removeAttribute('class')
      }
      cache.cssClass = this.cssClass
    }

    return oldVisual
  }

  /**
   * Gets the outline of the node, a round rect in this case.
   * @param {INode} node
   * @return {GeneralPath}
   */
  getOutline(node) {
    const path = new GeneralPath()
    path.appendRectangle(node.layout, false)
    return path
  }

  /**
   * Hit test which considers HitTestRadius specified in CanvasContext.
   * @param {IInputModeContext} inputModeContext
   * @param {Point} p
   * @param {INode} node
   * @return {boolean} True if p is inside node.
   */
  isHit(inputModeContext, p, node) {
    return super.isHit(inputModeContext, p, node)
  }

  /**
   * Exact geometric check whether a point p lies inside the node.
   * @param {INode} node
   * @param {Point} point
   * @return {boolean}
   */
  isInside(node, point) {
    return super.isInside(node, point)
  }
}

const SVG_NS = 'http://www.w3.org/2000/svg'
const BORDER_THICKNESS = 4
// Due to a strange bug in Safari 10.8, calculating this in place as "2 * BORDER_THICKNESS" results in undefined
// Therefore, keep this constant for now.
const BORDER_THICKNESS2 = BORDER_THICKNESS + BORDER_THICKNESS
const HEADER_THICKNESS = 22

export class DemoGroupStyle extends NodeStyleBase {
  constructor() {
    super()
    this.cssClass = ''
    this.isCollapsible = false
    this.solidHitTest = false

    this.$borderColor = '#68B0E3'
    this.$folderFrontColor = '#68B0E3'
    this.$folderBackColor = '#3C679B'
  }

  /**
   * Creates the visual for a collapsed or expanded group node.
   * @param {INode} node
   * @param {IRenderContext} renderContext
   * @return {SvgVisual}
   */
  createVisual(renderContext, node) {
    const gc = renderContext.canvasComponent
    const layout = node.layout
    const container = document.createElementNS(SVG_NS, 'g')
    // avoid defs support recursion - nothing to see here - move along!
    container.setAttribute('data-referencesafe', 'true')
    if (this.isCollapsed(node, gc)) {
      this.$renderFolder(node, container, renderContext)
    } else {
      this.$renderGroup(node, container, renderContext)
    }
    container.setAttribute('transform', 'translate(' + layout.x + ' ' + layout.y + ')')
    return new SvgVisual(container)
  }

  /**
   * Re-renders the group node by updating the old visual for improved performance.
   * @param {INode} node
   * @param {IRenderContext} renderContext
   * @param {SvgVisual} oldVisual
   * @return {SvgVisual}
   */
  updateVisual(renderContext, oldVisual, node) {
    const container = oldVisual.svgElement
    const cache = container['data-renderDataCache']
    if (!cache) {
      return this.createVisual(renderContext, node)
    }
    if (this.isCollapsed(node, renderContext.canvasComponent)) {
      this.$updateFolder(node, container, renderContext)
    } else {
      this.$updateGroup(node, container, renderContext)
    }
    return oldVisual
  }

  /**
   * Helper function to create a collapsed group node visual inside the given container.
   * @param {INode} node
   * @param {Element} container
   * @param {IRenderContext} ctx
   * @private
   */
  $renderFolder(node, container, ctx) {
    const layout = node.layout
    const width = layout.width
    const height = layout.height

    const backgroundRect = document.createElementNS(SVG_NS, 'rect')
    backgroundRect.setAttribute('fill', this.$folderBackColor)
    backgroundRect.setAttribute('stroke', '#FFF')
    backgroundRect.setAttribute('stroke-width', '1px')
    backgroundRect.width.baseVal.value = width
    backgroundRect.height.baseVal.value = height

    const path =
      'M ' +
      (width - 0.5) +
      ',2 l -25,0 q -2,0 -4,3.75 l -4,7.5 q -2,3.75 -4,3.75 L 0.5,17 L 0.5,' +
      (height - 0.5) +
      ' l ' +
      (width - 1) +
      ',0 Z'

    const folderPath = document.createElementNS(SVG_NS, 'path')
    folderPath.setAttribute('d', path)
    folderPath.setAttribute('fill', this.$folderFrontColor)

    container.appendChild(backgroundRect)
    container.appendChild(folderPath)

    const expandButton = this.$createButton(false)
    CollapsibleNodeStyleDecoratorRenderer.addToggleExpansionStateCommand(expandButton, node, ctx)
    expandButton.svgElement.setAttribute('transform', 'translate(' + (width - 17) + ' 5)')
    container.appendChild(expandButton.svgElement)

    if (this.cssClass) {
      container.setAttribute('class', this.cssClass + '-collapsed')
      backgroundRect.setAttribute('class', 'folder-background')
      folderPath.setAttribute('class', 'folder-foreground')
    }

    container['data-renderDataCache'] = {
      isCollapsible: this.isCollapsible,
      collapsed: true,
      width: width,
      height: height,
      x: layout.x,
      y: layout.y
    }
  }

  /**
   * Helper function to update the visual of a collapsed group node.
   * @param {INode} node
   * @param {Element} container
   * @param {IRenderContext} ctx
   * @private
   */
  $updateFolder(node, container, ctx) {
    const cache = container['data-renderDataCache']
    if (!cache || this.isCollapsible !== cache.isCollapsible) {
      this.$renderFolder(node, container, ctx)
      return
    }

    const width = node.layout.width
    const height = node.layout.height
    let path, backgroundRect, folderPath

    if (!cache.collapsed) {
      // transition from expanded state
      path =
        'M ' +
        (width - 0.5) +
        ',2 l -25,0 q -2,0 -4,3.75 l -4,7.5 q -2,3.75 -4,3.75 L 0.5,17 L 0.5,' +
        (height - 0.5) +
        ' l ' +
        (width - 1) +
        ',0 Z'

      backgroundRect = container.childNodes.item(0)
      backgroundRect.setAttribute('fill', this.$folderBackColor)
      backgroundRect.setAttribute('stroke', '#FFF')
      backgroundRect.setAttribute('stroke-width', '1px')

      folderPath = document.createElementNS(SVG_NS, 'path')
      folderPath.setAttribute('d', path)
      folderPath.setAttribute('fill', this.$folderFrontColor)

      container.replaceChild(folderPath, container.childNodes.item(1))

      // - to +
      const buttonGroup = container.childNodes.item(2)

      const minus = buttonGroup.childNodes.item(1)
      const vMinus = document.createElementNS(SVG_NS, 'rect')
      vMinus.setAttribute('width', '2')
      vMinus.setAttribute('height', '8')
      vMinus.setAttribute('x', 5)
      vMinus.setAttribute('y', 2)
      vMinus.setAttribute('fill', this.$borderColor)
      vMinus.setAttribute('stroke-width', 0) // we don't want a stroke here, even if it is set in the corresponding
      // css class

      if (this.cssClass) {
        container.setAttribute('class', this.cssClass + '-collapsed')
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

      path =
        'M ' +
        (width - 0.5) +
        ',2 l -25,0 q -2,0 -4,3.75 l -4,7.5 q -2,3.75 -4,3.75 L 0.5,17 L 0.5,' +
        (height - 0.5) +
        ' l ' +
        (width - 1) +
        ',0 Z'
      folderPath = container.childNodes.item(1)
      folderPath.setAttribute('d', path)

      const expandButton = container.childNodes.item(2)
      expandButton.transform.baseVal.getItem(0).setTranslate(width - 17, 5)

      cache.width = width
      cache.height = height
    }

    const x = node.layout.x
    const y = node.layout.y
    if (cache.x !== x || cache.y !== y) {
      container.transform.baseVal.getItem(0).setTranslate(x, y)
      cache.x = x
      cache.y = y
    }
  }

  /**
   * Helper function to create an expanded group node visual inside the given container.
   * @param {INode} node
   * @param {Element} container
   * @param {IRenderContext} ctx
   * @private
   */
  $renderGroup(node, container, ctx) {
    const layout = node.layout
    const width = layout.width
    const height = layout.height

    const outerRect = document.createElementNS(SVG_NS, 'rect')
    outerRect.setAttribute('fill', this.$borderColor)
    outerRect.setAttribute('stroke', '#FFF')
    outerRect.setAttribute('stroke-width', '1px')
    outerRect.width.baseVal.value = width
    outerRect.height.baseVal.value = height

    const innerRect = document.createElementNS(SVG_NS, 'rect')
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
      const collapseButton = this.$createButton(true)
      CollapsibleNodeStyleDecoratorRenderer.addToggleExpansionStateCommand(
        collapseButton,
        node,
        ctx
      )
      collapseButton.svgElement.setAttribute('transform', 'translate(' + (width - 17) + ' 5)')
      container.appendChild(collapseButton.svgElement)
    }

    if (this.cssClass) {
      container.setAttribute('class', this.cssClass + '-expanded')
      outerRect.setAttribute('class', 'group-border')
    }

    container['data-renderDataCache'] = {
      isCollapsible: this.isCollapsible,
      collapsed: false,
      width: width,
      x: layout.x,
      y: layout.y,
      height: height
    }
  }

  /**
   * Helper function to update the visual of an expanded group node.
   * @param {INode} node
   * @param {Element} container
   * @param {IRenderContext} ctx
   * @private
   */
  $updateGroup(node, container, ctx) {
    const cache = container['data-renderDataCache']
    if (!cache || this.isCollapsible !== cache.isCollapsible) {
      this.$renderGroup(node, container, ctx)
      return
    }

    const width = node.layout.width
    const height = node.layout.height
    let backgroundRect = null
    let innerRect = null
    let innerWidth = null
    let innerHeight = null
    let headerHeight = null

    if (cache.collapsed) {
      // transition from collapsed state
      backgroundRect = container.childNodes.item(0)
      backgroundRect.setAttribute('fill', this.$borderColor)

      innerRect = document.createElementNS(SVG_NS, 'rect')
      innerWidth = width - BORDER_THICKNESS2
      headerHeight = HEADER_THICKNESS
      innerHeight = height - headerHeight - BORDER_THICKNESS
      innerRect.setAttribute('fill', '#FFF')

      innerRect.x.baseVal.value = BORDER_THICKNESS
      innerRect.y.baseVal.value = headerHeight
      innerRect.width.baseVal.value = innerWidth
      innerRect.height.baseVal.value = innerHeight

      container.replaceChild(innerRect, container.childNodes.item(1))

      // + to -
      const buttonGroup = container.childNodes.item(2)
      buttonGroup.removeChild(buttonGroup.childNodes.item(2))

      if (this.cssClass) {
        container.setAttribute('class', this.cssClass + '-expanded')
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
    const x = node.layout.x
    const y = node.layout.y
    if (cache.x !== x || cache.y !== y) {
      container.transform.baseVal.getItem(0).setTranslate(x, y)
      cache.x = x
      cache.y = y
    }
  }

  /**
   * Helper function to create the collapse/expand button.
   * @param {boolean} collapse
   * @return {SvgVisual}
   * @private
   */
  $createButton(collapse) {
    const color = this.$borderColor
    const container = document.createElementNS(SVG_NS, 'g')
    const rect = document.createElementNS(SVG_NS, 'rect')
    rect.setAttribute('fill', '#FFF')
    rect.setAttribute('width', '12')
    rect.setAttribute('height', '12')
    rect.setAttribute('rx', '1')
    rect.setAttribute('ry', '1')

    const minus = document.createElementNS(SVG_NS, 'rect')
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
      const vMinus = document.createElementNS(SVG_NS, 'rect')
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
   * @param {INode} node
   * @param {Class} type
   * @return Object
   */
  lookup(node, type) {
    if (type === ILassoTestable.$class) {
      return new ILassoTestable((context, lassoPath) => {
        const path = new GeneralPath()
        const insetsProvider = node.lookup(INodeInsetsProvider.$class)
        if (insetsProvider) {
          const insets = insetsProvider.getInsets(node)
          const outerRect = node.layout.toRect()
          path.appendRectangle(outerRect, false)
          // check if its completely outside
          if (!lassoPath.areaIntersects(path, context.hitTestRadius)) {
            return false
          }
          path.clear()
          const innerRect = outerRect.getReduced(insets)
          path.appendRectangle(innerRect, false)
          // now it's a hit if either the inner border is hit or one point of the border
          // itself is contained in the lasso
          return (
            lassoPath.intersects(path, context.hitTestRadius) ||
            lassoPath.areaContains(node.layout.topLeft)
          )
        } else {
          // no insets - we only check the center of the node.
          return lassoPath.areaContains(node.layout.center, context.hitTestRadius)
        }
      })
    } else if (type === INodeInsetsProvider.$class) {
      return new INodeInsetsProvider(node => {
        const margin = 5
        return new Insets(
          BORDER_THICKNESS + margin,
          HEADER_THICKNESS + margin,
          BORDER_THICKNESS + margin,
          BORDER_THICKNESS + margin
        )
      })
    } else if (type === INodeSizeConstraintProvider.$class) {
      return new NodeSizeConstraintProvider(new Size(40, 30), Size.INFINITE, Rect.EMPTY)
    }
    return super.lookup(node, type)
  }

  /**
   * Hit test which considers HitTestRadius specified in CanvasContext.
   * @param {IInputModeContext} inputModeContext
   * @param {Point} p
   * @param {INode} node
   * @return {boolean} True if p is inside node.
   */
  isHit(inputModeContext, p, node) {
    const layout = node.layout.toRect()
    if (this.solidHitTest || this.isCollapsed(node, inputModeContext.canvasComponent)) {
      return layout.containsWithEps(p, inputModeContext.hitTestRadius)
    } else {
      if (
        (CreateEdgeInputMode &&
          inputModeContext.parentInputMode instanceof CreateEdgeInputMode &&
          inputModeContext.parentInputMode.isCreationInProgress) ||
        (inputModeContext.parentInputMode instanceof MoveInputMode &&
          inputModeContext.parentInputMode.isDragging) ||
        inputModeContext.parentInputMode instanceof DropInputMode
      ) {
        // during edge creation - the whole area is considered a hit
        return layout.containsWithEps(p, inputModeContext.hitTestRadius)
      }
      const innerWidth = layout.width - BORDER_THICKNESS2
      const innerHeight = layout.height - HEADER_THICKNESS - BORDER_THICKNESS
      const innerLayout = new Rect(
        layout.x + BORDER_THICKNESS,
        layout.y + HEADER_THICKNESS,
        innerWidth,
        innerHeight
      ).getEnlarged(-inputModeContext.hitTestRadius)

      return layout.containsWithEps(p, inputModeContext.hitTestRadius) && !innerLayout.contains(p)
    }
  }

  isInBox(inputModeContext, box, node) {
    return box.contains(node.layout.topLeft) && box.contains(node.layout.bottomRight)
  }

  /**
   * Gets the outline of the node, a round rect in this case.
   * @param {INode} node
   * @return {GeneralPath}
   */
  getOutline(node) {
    const path = new GeneralPath()
    path.appendRectangle(node.layout, false)
    return path
  }

  /**
   * Returns whether or not the given group node is collapsed.
   * @param {INode} node
   * @param {GraphComponent} gc
   * @return {boolean}
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

export class DemoArrow extends BaseClass(IArrow, IVisualCreator, IBoundsProvider) {
  constructor() {
    super()

    this.cssClass = ''

    this.$anchor = null
    this.$direction = null
    this.$arrowFigure = null
  }

  /**
   * Returns the length of the arrow, i.e. the distance from the arrow's tip to
   * the position where the visual representation of the edge's path should begin.
   * @see Specified by {@link IArrow#length}.
   * @return {number}
   */
  get length() {
    return 5.5
  }

  /**
   * Gets the cropping length associated with this instance.
   * This value is used by edge styles to let the
   * edge appear to end shortly before its actual target.
   * @see Specified by {@link IArrow#cropLength}.
   * @return {number}
   */
  get cropLength() {
    return 1
  }

  /**
   * Returns a configured visual creator.
   * @param {IEdge} edge
   * @param {boolean} atSource
   * @param {Point} anchor
   * @param {Point} direction
   * @return {DemoArrow}
   */
  getVisualCreator(edge, atSource, anchor, direction) {
    this.$anchor = anchor
    this.$direction = direction
    return this
  }

  /**
   * Gets an {@link IBoundsProvider} implementation that can yield
   * this arrow's bounds if painted at the given location using the
   * given direction for the given edge.
   * @param {IEdge} edge the edge this arrow belongs to
   * @param {boolean} atSource whether this will be the source arrow
   * @param {Point} anchor the anchor point for the tip of the arrow
   * @param {Point} direction the direction the arrow is pointing in
   * @return {DemoArrow}
   * an implementation of the {@link IBoundsProvider} interface that can
   * subsequently be used to query the bounds. Clients will always call
   * this method before using the implementation and may not cache the instance returned.
   * This allows for applying the flyweight design pattern to implementations.
   * @see Specified by {@link IArrow#getBoundsProvider}.
   */
  getBoundsProvider(edge, atSource, anchor, direction) {
    this.$anchor = anchor
    this.$direction = direction
    return this
  }

  /**
   * This method is called by the framework to create a visual
   * that will be included into the {@link IRenderContext}.
   * @param {IRenderContext} ctx The context that describes where the visual will be used.
   * @return {Visual}
   * The arrow visual to include in the canvas object visual tree./>.
   * @see {@link DemoArrow#updateVisual}
   * @see Specified by {@link IVisualCreator#createVisual}.
   */
  createVisual(ctx) {
    // Create a new path to draw the arrow
    if (this.$arrowFigure === null) {
      this.$arrowFigure = new GeneralPath()
      this.$arrowFigure.moveTo(new Point(-7.5, -2.5))
      this.$arrowFigure.lineTo(new Point(0, 0))
      this.$arrowFigure.lineTo(new Point(-7.5, 2.5))
      this.$arrowFigure.close()
    }

    const path = window.document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', this.$arrowFigure.createSvgPathData())
    path.setAttribute('fill', '#336699')

    if (this.cssClass) {
      path.setAttribute('class', this.cssClass)
    }

    // Rotate arrow and move it to correct position
    path.setAttribute(
      'transform',
      'matrix(' +
        this.$direction.x +
        ' ' +
        this.$direction.y +
        ' ' +
        -this.$direction.y +
        ' ' +
        this.$direction.x +
        ' ' +
        this.$anchor.x +
        ' ' +
        this.$anchor.y +
        ')'
    )

    path['data-renderDataCache'] = {
      direction: this.$direction,
      anchor: this.$anchor
    }

    return new SvgVisual(path)
  }

  /**
   * This method updates or replaces a previously created visual for inclusion
   * in the {@link IRenderContext}.
   * The {@link CanvasComponent} uses this method to give implementations a chance to
   * update an existing Visual that has previously been created by the same instance during a call
   * to {@link DemoArrow#createVisual}. Implementations may update the <code>oldVisual</code>
   * and return that same reference, or create a new visual and return the new instance or <code>null</code>.
   * @param {IRenderContext} ctx The context that describes where the visual will be used in.
   * @param {Visual} oldVisual The visual instance that had been returned the last time the
   *   {@link DemoArrow#createVisual} method was called on this instance.
   * @return {Visual}
   *  <code>oldVisual</code>, if this instance modified the visual, or a new visual that should replace the
   * existing one in the canvas object visual tree.
   * @see {@link DemoArrow#createVisual}
   * @see {@link ICanvasObjectDescriptor}
   * @see {@link CanvasComponent}
   * @see Specified by {@link IVisualCreator#updateVisual}.
   */
  updateVisual(ctx, oldVisual) {
    const path = oldVisual.svgElement
    const cache = path['data-renderDataCache']

    if (this.$direction !== cache.direction || this.$anchor !== cache.anchor) {
      path.setAttribute(
        'transform',
        'matrix(' +
          this.$direction.x +
          ' ' +
          this.$direction.y +
          ' ' +
          -this.$direction.y +
          ' ' +
          this.$direction.x +
          ' ' +
          this.$anchor.x +
          ' ' +
          this.$anchor.y +
          ')'
      )
    }

    return oldVisual
  }

  /**
   * Returns the bounds of the arrow for the current flyweight configuration.
   * @see Specified by {@link IBoundsProvider#getBounds}.
   * @param {IRenderContext} ctx
   * @return {Rect}
   */
  getBounds(ctx) {
    return new Rect(this.$anchor.x - 8, this.$anchor.y - 8, 32, 32)
  }
}

const isBrowserWithBadMarkerSupport = $isMicrosoftBrowser() || $detectSafariWebkit()

/**
 * Check if the used browser is IE or Edge.
 * @return {boolean}
 *
 * @private
 */
function $isMicrosoftBrowser() {
  return (
    window.navigator.userAgent.indexOf('MSIE ') > 0 ||
    !!window.navigator.userAgent.match(/Trident.*rv:11\./) ||
    !!window.navigator.userAgent.match(/Edge\/(1[2678])./i)
  )
}

/**
 * Returns version of Safari.
 * @return {number} Version of Safari or -1 if browser is not Safari.
 *
 * @private
 */
function $detectSafariVersion() {
  const ua = window.navigator.userAgent
  const isSafari = ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1
  if (isSafari) {
    const safariVersionMatch = ua.match(new RegExp('Version\\/(\\d*\\.\\d*)', ''))
    if (safariVersionMatch && safariVersionMatch.length > 1) {
      return parseInt(safariVersionMatch[1])
    }
  }
  return -1
}

/**
 * Returns true for browsers that use the Safari 11 Webkit engine.
 *
 * In detail, these are Safari 11 on either macOS or iOS, Chrome on iOS 11, and Firefox on iOS 11.
 * @return {boolean}
 *
 * @private
 */
function $detectSafariWebkit() {
  return $detectSafariVersion() > -1 || !!/(CriOS|FxiOS)/.exec(window.navigator.userAgent)
}

export class DemoEdgeStyle extends EdgeStyleBase {
  constructor() {
    super()
    this.cssClass = ''

    this.$hiddenArrow = new Arrow({
      type: ArrowType.NONE,
      cropLength: 6,
      scale: 1
    })
    this.$fallbackArrow = new DemoArrow()
    this.$markerDefsSupport = null
    this.showTargetArrows = true
    this.useMarkerArrows = true
  }

  /**
   * Helper function to crop a {@link GeneralPath} by the length of the used arrow.
   * @param {IEdge} edge
   * @param {GeneralPath} gp
   * @return {GeneralPath}
   * @private
   */
  $cropRenderedPath(edge, gp) {
    if (this.showTargetArrows) {
      const dummyArrow =
        !isBrowserWithBadMarkerSupport && this.useMarkerArrows
          ? this.$hiddenArrow
          : this.$fallbackArrow
      return this.cropPath(edge, IArrow.NONE, dummyArrow, gp)
    } else {
      return this.cropPath(edge, IArrow.NONE, IArrow.NONE, gp)
    }
  }

  /**
   * Creates the visual for an edge.
   * @param {IEdge} edge
   * @param {IRenderContext} renderContext
   * @return {Visual}
   */
  createVisual(renderContext, edge) {
    let renderPath = this.$createPath(edge)
    // crop the path such that the arrow tip is at the end of the edge
    renderPath = this.$cropRenderedPath(edge, renderPath)

    if (renderPath.length === 0) {
      return null
    }

    const gp = this.createPathWithBridges(renderPath, renderContext)

    const path = document.createElementNS(SVG_NS, 'path')
    const pathData = gp.size === 0 ? '' : gp.createSvgPathData()
    path.setAttribute('d', pathData)
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', '#336699')

    if (this.cssClass) {
      path.setAttribute('class', this.cssClass)
      this.$fallbackArrow.cssClass = this.cssClass + '-arrow'
    }

    if (!isBrowserWithBadMarkerSupport && this.useMarkerArrows) {
      this.showTargetArrows &&
        path.setAttribute(
          'marker-end',
          'url(#' + renderContext.getDefsId(this.$createMarker()) + ')'
        )

      path['data-renderDataCache'] = {
        path: renderPath,
        obstacleHash: this.getObstacleHash(renderContext)
      }
      return new SvgVisual(path)
    } else {
      // use yfiles arrows instead of markers
      const container = document.createElementNS(SVG_NS, 'g')
      container.appendChild(path)
      this.showTargetArrows &&
        super.addArrows(renderContext, container, edge, gp, IArrow.NONE, this.$fallbackArrow)
      container['data-renderDataCache'] = {
        path: renderPath,
        obstacleHash: this.getObstacleHash(renderContext)
      }
      return new SvgVisual(container)
    }
  }

  /**
   * Re-renders the edge by updating the old visual for improved performance.
   * @param {IEdge} edge
   * @param {IRenderContext} renderContext
   * @param {Visual} oldVisual
   * @return {Visual}
   */
  updateVisual(renderContext, oldVisual, edge) {
    if (oldVisual === null) {
      return this.createVisual(renderContext, edge)
    }

    let renderPath = this.$createPath(edge)
    if (renderPath.length === 0) {
      return null
    }
    // crop the path such that the arrow tip is at the end of the edge
    renderPath = this.$cropRenderedPath(edge, renderPath)
    const newObstacleHash = this.getObstacleHash(renderContext)

    let path = oldVisual.svgElement
    const cache = path['data-renderDataCache']
    if (!renderPath.hasSameValue(cache['path']) || cache['obstacleHash'] !== newObstacleHash) {
      cache['path'] = renderPath
      cache['obstacleHash'] = newObstacleHash
      const gp = this.createPathWithBridges(renderPath, renderContext)
      const pathData = gp.size === 0 ? '' : gp.createSvgPathData()
      if (!isBrowserWithBadMarkerSupport && this.useMarkerArrows) {
        // update code for marker arrows
        path.setAttribute('d', pathData)
        return oldVisual
      } else {
        // update code for yfiles arrows
        const container = oldVisual.svgElement
        path = container.childNodes.item(0)
        path.setAttribute('d', pathData)
        while (container.childElementCount > 1) {
          container.removeChild(container.lastChild)
        }
        this.showTargetArrows &&
          super.addArrows(renderContext, container, edge, gp, IArrow.NONE, this.$fallbackArrow)
      }
    }
    return oldVisual
  }

  /**
   * Creates the path of an edge.
   * @param {IEdge} edge
   * @return {GeneralPath}
   * @private
   */
  $createPath(edge) {
    let path
    // build path
    if (edge.sourcePort.owner === edge.targetPort.owner && edge.bends.size < 2) {
      // pretty self loops
      let outerX, outerY
      if (edge.bends.size === 1) {
        const bendLocation = edge.bends.get(0).location
        outerX = bendLocation.x
        outerY = bendLocation.y
      } else {
        if (INode.isInstance(edge.sourcePort.owner)) {
          outerX = edge.sourcePort.owner.layout.x - 20
          outerY = edge.sourcePort.owner.layout.y - 20
        } else {
          const sourcePortLocation = edge.sourcePort.locationParameter.model.getLocation(
            edge.sourcePort,
            edge.sourcePort.locationParameter
          )
          outerX = sourcePortLocation.x - 20
          outerY = sourcePortLocation.y - 20
        }
      }
      path = new GeneralPath(4)
      let lastPoint = edge.sourcePort.locationParameter.model.getLocation(
        edge.sourcePort,
        edge.sourcePort.locationParameter
      )
      path.moveTo(lastPoint)
      path.lineTo(outerX, lastPoint.y)
      path.lineTo(outerX, outerY)
      lastPoint = edge.targetPort.locationParameter.model.getLocation(
        edge.targetPort,
        edge.targetPort.locationParameter
      )
      path.lineTo(lastPoint.x, outerY)
      path.lineTo(lastPoint)
    } else {
      path = super.getPath(edge)
    }
    return path
  }

  /**
   * Gets the path of the edge cropped at the node border.
   * @param {IEdge} edge
   * @return {GeneralPath}
   */
  getPath(edge) {
    const path = this.$createPath(edge)
    // crop path at node border
    return this.cropPath(edge, IArrow.NONE, IArrow.NONE, path)
  }

  /**
   * Decorates a given path with bridges.
   * All work is delegated to the BridgeManager's addBridges() method.
   * @param {GeneralPath} path The path to decorate.
   * @param {IRenderContext} context The render context.
   * @return {GeneralPath} A copy of the given path with bridges.
   */
  createPathWithBridges(path, context) {
    const manager = this.getBridgeManager(context)
    // if there is a bridge manager registered: use it to add the bridges to the path
    return manager === null ? path : manager.addBridges(context, path, null)
  }

  /**
   * Gets an obstacle hash from the context.
   * The obstacle hash changes if any obstacle has changed on the entire graph.
   * The hash is used to avoid re-rendering the edge if nothing has changed.
   * This method gets the obstacle hash from the BridgeManager.
   * @param {IRenderContext} context The context to get the obstacle hash for.
   * @return {number} A hash value which represents the state of the obstacles.
   */
  getObstacleHash(context) {
    const manager = this.getBridgeManager(context)
    // get the BridgeManager from the context's lookup. If there is one
    // get a hash value which represents the current state of the obstacles.
    return manager === null ? 42 : manager.getObstacleHash(context)
  }

  /**
   * Queries the context's lookup for a BridgeManager instance.
   * @param {IRenderContext} context The context to get the BridgeManager from.
   * @return {BridgeManager} The BridgeManager for the given context instance or null
   */
  getBridgeManager(context) {
    if (!context) {
      return null
    }
    const bm = context.lookup(BridgeManager.$class)
    return bm instanceof BridgeManager ? bm : null
  }

  /**
   * Determines whether the visual representation of the edge has been hit at the given location.
   * @param {IEdge} edge
   * @param {Point} p
   * @param {IInputModeContext} inputModeContext
   * @return {boolean}
   */
  isHit(inputModeContext, p, edge) {
    if (
      (edge.sourcePort.owner === edge.targetPort.owner && edge.bends.size < 2) ||
      super.isHit(inputModeContext, p, edge)
    ) {
      const path = this.getPath(edge)
      return path && path.pathContains(p, inputModeContext.hitTestRadius + 1)
    } else {
      return false
    }
  }

  /**
   * Determines whether the edge visual is visible or not.
   * @param {IEdge} edge
   * @param {Rect} clip
   * @param {ICanvasContext} canvasContext
   * @return {boolean}
   */
  isVisible(canvasContext, clip, edge) {
    if (edge.sourcePort.owner === edge.targetPort.owner && edge.bends.size < 2) {
      // handle self-loops
      const spl = edge.sourcePort.locationParameter.model.getLocation(
        edge.sourcePort,
        edge.sourcePort.locationParameter
      )
      const tpl = edge.targetPort.locationParameter.model.getLocation(
        edge.targetPort,
        edge.targetPort.locationParameter
      )
      if (clip.contains(spl)) {
        return true
      }

      let outerX, outerY
      if (edge.bends.size === 1) {
        const bendLocation = edge.bends.get(0).location
        outerX = bendLocation.x
        outerY = bendLocation.y
      } else {
        if (INode.isInstance(edge.sourcePort.owner)) {
          outerX = edge.sourcePort.owner.layout.x - 20
          outerY = edge.sourcePort.owner.layout.y - 20
        } else {
          const sourcePortLocation = edge.sourcePort.locationParameter.model.getLocation(
            edge.sourcePort,
            edge.sourcePort.locationParameter
          )
          outerX = sourcePortLocation.x - 20
          outerY = sourcePortLocation.y - 20
        }
      }

      // intersect the self-loop lines with the clip
      return (
        clip.intersectsLine(spl, new Point(outerX, spl.y)) ||
        clip.intersectsLine(new Point(outerX, spl.y), new Point(outerX, outerY)) ||
        clip.intersectsLine(new Point(outerX, outerY), new Point(tpl.x, outerY)) ||
        clip.intersectsLine(new Point(tpl.x, outerY), tpl)
      )
    }

    return super.isVisible(canvasContext, clip, edge)
  }

  /**
   * Helper method to let the svg marker be created by the {@link ISvgDefsCreator} implementation.
   * @return {ISvgDefsCreator}
   * @private
   */
  $createMarker() {
    if (this.$markerDefsSupport === null) {
      this.$markerDefsSupport = new MarkerDefsSupport(this.cssClass)
    }
    return this.$markerDefsSupport
  }

  /**
   * This implementation of the look up provides a custom implementation of the
   * {@link IObstacleProvider} to support bridges.
   * @see Overrides {@link EdgeStyleBase#lookup}
   * @param {IEdge} edge
   * @param {Class} type
   * @return {Object}
   */
  lookup(edge, type) {
    if (type === IObstacleProvider.$class) {
      // Provide the own IObstacleProvider implementation
      return new BasicEdgeObstacleProvider(edge)
    } else {
      return super.lookup(edge, type)
    }
  }
}

/**
 * Manages the arrow markers as svg definitions.
 */
export class MarkerDefsSupport extends BaseClass(ISvgDefsCreator) {
  constructor() {
    super()
    this.cssClass = ''
  }

  /**
   * Creates a defs-element.
   * @param {ICanvasContext} context
   * @return {SVGElement}
   */
  createDefsElement(context) {
    const markerElement = document.createElementNS(SVG_NS, 'marker')
    markerElement.setAttribute('viewBox', '0 0 15 10')
    markerElement.setAttribute('refX', 2)
    markerElement.setAttribute('refY', 5)
    markerElement.setAttribute('markerWidth', '7')
    markerElement.setAttribute('markerHeight', '7')
    markerElement.setAttribute('orient', 'auto')

    const path = document.createElementNS(SVG_NS, 'path')
    path.setAttribute('d', 'M 0 0 L 15 5 L 0 10 z')
    path.setAttribute('fill', '#336699')

    if (this.cssClass) {
      path.setAttribute('class', this.cssClass + '-arrow')
    }

    markerElement.appendChild(path)
    return markerElement
  }

  /**
   * Checks if the specified node references the element represented by this object.
   * @param {ICanvasContext} context
   * @param {Node} node
   * @param {string} id
   * @return {boolean}
   **/
  accept(context, node, id) {
    if (node.nodeType !== 1) {
      return false
    }
    return ISvgDefsCreator.isAttributeReference(node, 'marker-end', id)
  }

  /**
   * Updates the defs element with the current gradient data.
   * @param {ICanvasContext} context
   * @param {SVGElement} oldElement
   */
  updateDefsElement(context, oldElement) {
    // Nothing to do here
  }
}

/**
 * A custom IObstacleProvider implementation for this style.
 */
export class BasicEdgeObstacleProvider extends BaseClass(IObstacleProvider) {
  constructor(edge) {
    super()
    this.edge = edge
  }

  /**
   * Returns this edge's path as obstacle.
   * @param {IRenderContext} canvasContext
   * @return {GeneralPath} The edge's path.
   */
  getObstacles(canvasContext) {
    return this.edge.style.renderer.getPathGeometry(this.edge, this.edge.style).getPath()
  }
}

/**
 * The class provides functionality for custom style of overview control.
 */
export class DemoStyleOverviewPaintable extends GraphOverviewCanvasVisualCreator {
  /**
   * @param {IRenderContext} renderContext
   * @param {CanvasRenderingContext2D} ctx
   * @param {INode} node
   */
  paintNode(renderContext, ctx, node) {
    ctx.fillStyle = 'rgb(128, 128, 128)'
    const layout = node.layout
    ctx.fillRect(layout.x, layout.y, layout.width, layout.height)
  }

  /**
   * @param {IRenderContext} renderContext
   * @param {CanvasRenderingContext2D} ctx
   * @param {INode} node
   */
  paintGroupNode(renderContext, ctx, node) {
    ctx.fill = 'rgb(211, 211, 211)'
    ctx.fillStyle = 'rgb(211, 211, 211)'
    ctx.strokeStyle = 'rgb(211, 211, 211)'
    ctx.lineWidth = 4
    const layout = node.layout
    ctx.strokeRect(layout.x, layout.y, layout.width, layout.height)
    ctx.fillRect(layout.x, layout.y, layout.width, 22)
    ctx.lineWidth = 1
  }
}

/**
 * Initializes graph defaults using the demo styles
 * @param {IGraph} graph
 */
export function initDemoStyles(graph) {
  // set graph defaults
  graph.nodeDefaults.style = new DemoNodeStyle()
  graph.edgeDefaults.style = new DemoEdgeStyle()

  const nodeLabelStyle = new DefaultLabelStyle()
  // #5f8ac4
  nodeLabelStyle.textFill = new SolidColorFill(50, 50, 50)
  graph.nodeDefaults.labels.style = nodeLabelStyle

  const edgeLabelStyle = new DefaultLabelStyle()
  edgeLabelStyle.textFill = nodeLabelStyle.textFill
  graph.edgeDefaults.labels.style = edgeLabelStyle

  const foldingEnabled = graph.foldingView !== null
  const groupStyle = new DemoGroupStyle()
  groupStyle.isCollapsible = foldingEnabled

  graph.groupNodeDefaults.style = groupStyle

  // A label model with insets for the expand/collapse button
  const groupLabelModel = new InteriorStretchLabelModel()
  groupLabelModel.insets = new Insets(4, 4, foldingEnabled ? 18 : 4, 4)

  graph.groupNodeDefaults.labels.layoutParameter = groupLabelModel.createParameter(
    InteriorStretchLabelModelPosition.NORTH
  )

  const groupLabelStyle = new DefaultLabelStyle()
  groupLabelStyle.textFill = Fill.WHITE
  groupLabelStyle.wrapping = TextWrapping.CHARACTER_ELLIPSIS
  graph.groupNodeDefaults.labels.style = groupLabelStyle
}

const DemoNodeStyleExtension = BaseClass('DemoNodeStyleExtension', {
  $extends: MarkupExtension,

  constructor: function() {
    MarkupExtension.call(this)
  },

  $cssClass: '',
  cssClass: {
    $meta: function() {
      return [GraphMLAttribute().init({ defaultValue: '' }), TypeAttribute(YString.$class)]
    },
    get: function() {
      return this.$cssClass
    },
    set: function(value) {
      this.$cssClass = value
    }
  },

  provideValue(serviceProvider) {
    const style = new DemoNodeStyle()
    style.cssClass = this.cssClass
    return style
  }
})

const DemoGroupStyleExtension = BaseClass('DemoGroupStyleExtension', {
  $extends: MarkupExtension,

  constructor: function() {
    MarkupExtension.call(this)
  },

  $cssClass: '',
  cssClass: {
    $meta: function() {
      return [GraphMLAttribute().init({ defaultValue: '' }), TypeAttribute(YString.$class)]
    },
    get: function() {
      return this.$cssClass
    },
    set: function(value) {
      this.$cssClass = value
    }
  },

  $isCollapsible: '',
  isCollapsible: {
    $meta: function() {
      return [GraphMLAttribute().init({ defaultValue: false }), TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.$isCollapsible
    },
    set: function(value) {
      this.$isCollapsible = value
    }
  },

  $solidHitTest: '',
  solidHitTest: {
    $meta: function() {
      return [GraphMLAttribute().init({ defaultValue: false }), TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.$solidHitTest
    },
    set: function(value) {
      this.$solidHitTest = value
    }
  },

  provideValue(serviceProvider) {
    const style = new DemoGroupStyle()
    style.cssClass = this.cssClass
    style.isCollapsible = this.isCollapsible
    style.solidHitTest = this.solidHitTest
    return style
  }
})

const DemoEdgeStyleExtension = BaseClass('DemoEdgeStyleExtension', {
  $extends: MarkupExtension,

  constructor: function() {
    MarkupExtension.call(this)
  },

  $cssClass: '',
  cssClass: {
    $meta: function() {
      return [GraphMLAttribute().init({ defaultValue: '' }), TypeAttribute(YString.$class)]
    },
    get: function() {
      return this.$cssClass
    },
    set: function(value) {
      this.$cssClass = value
    }
  },

  $showTargetArrows: true,
  showTargetArrows: {
    $meta: function() {
      return [GraphMLAttribute().init({ defaultValue: true }), TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.$showTargetArrows
    },
    set: function(value) {
      this.$showTargetArrows = value
    }
  },

  $useMarkerArrows: true,
  useMarkerArrows: {
    $meta: function() {
      return [GraphMLAttribute().init({ defaultValue: true }), TypeAttribute(YBoolean.$class)]
    },
    get: function() {
      return this.$useMarkerArrows
    },
    set: function(value) {
      this.$useMarkerArrows = value
    }
  },

  provideValue(serviceProvider) {
    const style = new DemoEdgeStyle()
    style.cssClass = this.cssClass
    style.showTargetArrows = this.showTargetArrows
    style.useMarkerArrows = this.useMarkerArrows
    return style
  }
})

const DemoArrowExtension = BaseClass('DemoArrowExtension', {
  $extends: MarkupExtension,

  constructor: function() {
    MarkupExtension.call(this)
  },

  $cssClass: '',
  cssClass: {
    $meta: function() {
      return [GraphMLAttribute().init({ defaultValue: '' }), TypeAttribute(YString.$class)]
    },
    get: function() {
      return this.$cssClass
    },
    set: function(value) {
      this.$cssClass = value
    }
  },

  provideValue(serviceProvider) {
    const arrow = new DemoArrow()
    arrow.cssClass = this.cssClass
    return arrow
  }
})

export const DemoSerializationListener = (source, args) => {
  const item = args.item

  let markupExtension
  let markupExtensionClass
  if (item instanceof DemoNodeStyle) {
    markupExtension = new DemoNodeStyleExtension()
    markupExtension.cssClass = item.cssClass
    markupExtensionClass = DemoNodeStyleExtension.$class
  } else if (item instanceof DemoGroupStyle) {
    markupExtension = new DemoGroupStyleExtension()
    markupExtension.cssClass = item.cssClass
    markupExtension.isCollapsible = item.isCollapsible
    markupExtension.solidHitTest = item.solidHitTest
    markupExtensionClass = DemoGroupStyleExtension.$class
  } else if (item instanceof DemoEdgeStyle) {
    markupExtension = new DemoEdgeStyleExtension()
    markupExtension.cssClass = item.cssClass
    markupExtension.showTargetArrows = item.showTargetArrows
    markupExtension.useMarkerArrows = item.useMarkerArrows
    markupExtensionClass = DemoEdgeStyleExtension.$class
  } else if (item instanceof DemoArrow) {
    markupExtension = new DemoArrowExtension()
    markupExtension.cssClass = item.cssClass
    markupExtensionClass = DemoArrowExtension.$class
  }

  if (markupExtension && markupExtensionClass) {
    const context = args.context
    context.serializeReplacement(markupExtensionClass, item, markupExtension)
    args.handled = true
  }
}

// export a default object to be able to map a namespace to this module for serialization
export default {
  DemoNodeStyle,
  DemoEdgeStyle,
  DemoArrow,
  DemoGroupStyle,
  DemoNodeStyleExtension,
  DemoGroupStyleExtension,
  DemoEdgeStyleExtension,
  DemoArrowExtension
}
