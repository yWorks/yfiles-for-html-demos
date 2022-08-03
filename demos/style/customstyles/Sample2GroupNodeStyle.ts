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
import yfiles, {
  CanvasComponent,
  Class,
  CollapsibleNodeStyleDecoratorRenderer,
  DropInputMode,
  GeneralPath,
  GraphComponent,
  GraphMLAttribute,
  GraphMLIOHandler,
  HandleSerializationEventArgs,
  IInputModeContext,
  ILassoTestable,
  ILookup,
  INode,
  INodeInsetsProvider,
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
  SvgVisual,
  TypeAttribute,
  YBoolean,
  YString
} from 'yfiles'
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
  isCollapsible = false
  solidHitTest = false
  private borderColor = '#0B7189'
  private folderFrontColor = '#9CC5CF'
  private folderBackColor = '#0B7189'

  constructor(public cssClass: string | null = null) {
    super()
  }

  /**
   * Creates the visual for a collapsed or expanded group node.
   */
  createVisual(renderContext: IRenderContext, node: INode): SvgVisual {
    const gc = renderContext.canvasComponent as GraphComponent
    const layout = node.layout
    const container = document.createElementNS(SVGNS, 'g')
    // avoid defs support recursion - nothing to see here - move along!
    container.setAttribute('data-referencesafe', 'true')
    if (this.isCollapsed(node, gc)) {
      this.renderFolder(node, container, renderContext)
    } else {
      this.renderGroup(node, container, renderContext)
    }
    container.setAttribute('transform', `translate(${layout.x} ${layout.y})`)
    return new SvgVisual(container)
  }

  /**
   * Re-renders the group node by updating the old visual for improved performance.
   */
  updateVisual(renderContext: IRenderContext, oldVisual: SvgVisual, node: INode): SvgVisual {
    const container = oldVisual.svgElement as SVGGElement
    const cache = (container as any)['data-renderDataCache']
    if (!cache) {
      return this.createVisual(renderContext, node)
    }
    if (this.isCollapsed(node, renderContext.canvasComponent as GraphComponent)) {
      this.updateFolder(node, container, renderContext)
    } else {
      this.updateGroup(node, container, renderContext)
    }
    return oldVisual
  }

  private static createFolderPath(width: number, height: number, rounding: number): string {
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
  private renderFolder(node: INode, container: Element, ctx: IRenderContext): void {
    const { x, y, width, height } = node.layout
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

    container.appendChild(backgroundRect)
    container.appendChild(folderPath)

    const expandButton = this.createButton(false)
    CollapsibleNodeStyleDecoratorRenderer.addToggleExpansionStateCommand(expandButton, node, ctx)
    expandButton.svgElement.setAttribute('transform', `translate(${width - 17} 5)`)
    container.appendChild(expandButton.svgElement)

    if (this.cssClass) {
      const attribute = `${this.cssClass}-collapsed`
      container.setAttribute('class', attribute)
      backgroundRect.setAttribute('class', 'folder-background')
      folderPath.setAttribute('class', 'folder-foreground')
    }

    ;(container as any)['data-renderDataCache'] = {
      isCollapsible: this.isCollapsible,
      collapsed: true,
      width,
      height,
      x,
      y
    }
  }

  /**
   * Helper function to update the visual of a collapsed group node.
   */
  private updateFolder(node: INode, container: SVGGElement, ctx: IRenderContext): void {
    const cache = (container as any)['data-renderDataCache']
    if (!cache || this.isCollapsible !== cache.isCollapsible) {
      this.renderFolder(node, container, ctx)
      return
    }

    const { width, height } = node.layout
    const nodeRounding = 3.5
    let path: string, backgroundRect: SVGRectElement, folderPath: SVGPathElement

    if (!cache.collapsed) {
      // transition from expanded state
      const path = Sample2GroupNodeStyle.createFolderPath(width, height, nodeRounding)

      backgroundRect = container.childNodes.item(0) as SVGRectElement
      backgroundRect.setAttribute('fill', this.folderBackColor)

      folderPath = document.createElementNS(SVGNS, 'path')
      folderPath.setAttribute('d', path)
      folderPath.setAttribute('fill', this.folderFrontColor)

      container.replaceChild(folderPath, container.childNodes.item(1))

      // - to +
      const buttonGroup = container.childNodes.item(2)

      const minus = buttonGroup.childNodes.item(1) as SVGElement
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
      backgroundRect = container.childNodes.item(0) as SVGRectElement
      backgroundRect.width.baseVal.value = width
      backgroundRect.height.baseVal.value = height

      path = Sample2GroupNodeStyle.createFolderPath(width, height, nodeRounding)
      folderPath = container.childNodes.item(1) as SVGPathElement
      folderPath.setAttribute('d', path)

      const expandButton = container.childNodes.item(2) as SVGGElement
      expandButton.transform.baseVal.getItem(0).setTranslate(width - 17, 5)

      cache.width = width
      cache.height = height
    }

    const { x, y } = node.layout
    if (cache.x !== x || cache.y !== y) {
      container.transform.baseVal.getItem(0).setTranslate(x, y)
      cache.x = x
      cache.y = y
    }
  }

  /**
   * Helper function to create an expanded group node visual inside the given container.
   */
  private renderGroup(node: INode, container: Element, ctx: IRenderContext): void {
    const layout = node.layout
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
      CollapsibleNodeStyleDecoratorRenderer.addToggleExpansionStateCommand(
        collapseButton,
        node,
        ctx
      )
      collapseButton.svgElement.setAttribute('transform', `translate(${width - 17} 5)`)
      container.appendChild(collapseButton.svgElement)
    }

    if (this.cssClass) {
      const attribute = `${this.cssClass}-expanded`
      container.setAttribute('class', attribute)
      outerRect.setAttribute('class', 'group-border')
    }

    ;(container as any)['data-renderDataCache'] = {
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
   */
  private updateGroup(node: INode, container: SVGGElement, ctx: IRenderContext): void {
    const cache = (container as any)['data-renderDataCache']
    if (!cache || this.isCollapsible !== cache.isCollapsible) {
      this.renderGroup(node, container, ctx)
      return
    }

    const { width, height } = node.layout
    let backgroundRect: SVGRectElement
    let innerRect: SVGRectElement
    let innerWidth: number
    let innerHeight: number
    let headerHeight: number

    if (cache.collapsed) {
      // transition from collapsed state
      backgroundRect = container.childNodes.item(0) as SVGRectElement
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

      // + to -
      const buttonGroup = container.childNodes.item(2)
      buttonGroup.removeChild(buttonGroup.childNodes.item(2))

      if (this.cssClass) {
        const attribute = `${this.cssClass}-expanded`
        container.setAttribute('class', attribute)
        backgroundRect.setAttribute('class', 'group-border')
        const minus = buttonGroup.childNodes.item(1) as SVGGElement
        minus.setAttribute('class', 'group-border')
      }

      cache.collapsed = false
    }

    // update old visual
    if (cache.width !== width || cache.height !== height) {
      backgroundRect = container.childNodes.item(0) as SVGRectElement
      backgroundRect.width.baseVal.value = width
      backgroundRect.height.baseVal.value = height

      innerWidth = width - BORDER_THICKNESS2
      headerHeight = HEADER_THICKNESS
      innerHeight = height - headerHeight - BORDER_THICKNESS

      innerRect = container.childNodes.item(1) as SVGRectElement
      innerRect.width.baseVal.value = innerWidth
      innerRect.height.baseVal.value = innerHeight

      if (this.isCollapsible) {
        const expandButton = container.childNodes.item(2) as SVGGElement
        expandButton.transform.baseVal.getItem(0).setTranslate(width - 17, 5)
      }

      cache.width = width
      cache.height = height
    }
    const { x, y } = node.layout
    if (cache.x !== x || cache.y !== y) {
      container.transform.baseVal.getItem(0).setTranslate(x, y)
      cache.x = x
      cache.y = y
    }
  }

  /**
   * Helper function to create the collapse/expand button.
   */
  private createButton(collapse: boolean): SvgVisual {
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
  lookup(node: INode, type: Class): any {
    if (type === ILassoTestable.$class) {
      const insetsProvider = node.lookup(INodeInsetsProvider.$class)
      if (insetsProvider instanceof INodeInsetsProvider) {
        return ILassoTestable.create((context, lassoPath) => {
          const path = new GeneralPath()
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
        })
      } else {
        // no insets - we only check the center of the node.
        return ILassoTestable.create((context, lassoPath) =>
          lassoPath.areaContains(node.layout.center, context.hitTestRadius)
        )
      }
    } else if (type === INodeInsetsProvider.$class) {
      return INodeInsetsProvider.create(_ => {
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
   * @return True if p is inside node.
   */
  isHit(inputModeContext: IInputModeContext, p: Point, node: INode): boolean {
    const layout = node.layout.toRect()
    if (this.solidHitTest || this.isCollapsed(node, inputModeContext.canvasComponent)) {
      return layout.containsWithEps(p, inputModeContext.hitTestRadius)
    }

    // @ts-ignore
    const CreateEdgeInputMode = yfiles.CreateEdgeInputMode || yfiles.input.CreateEdgeInputMode
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

  isInBox(inputModeContext: IInputModeContext, box: Rect, node: INode): boolean {
    return box.contains(node.layout.topLeft) && box.contains(node.layout.bottomRight)
  }

  /**
   * Returns whether or not the given group node is collapsed.
   */
  isCollapsed(node: INode, gc: CanvasComponent | null): boolean {
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

export class Sample2GroupNodeStyleExtension extends MarkupExtension {
  public cssClass = ''
  public isCollapsible = false
  public solidHitTest = false

  constructor() {
    super()
  }

  static get $meta(): {
    cssClass: (GraphMLAttribute | TypeAttribute)[]
    isCollapsible: (GraphMLAttribute | TypeAttribute)[]
    solidHitTest: (GraphMLAttribute | TypeAttribute)[]
  } {
    return {
      cssClass: [GraphMLAttribute().init({ defaultValue: '' }), TypeAttribute(YString.$class)],
      isCollapsible: [
        GraphMLAttribute().init({ defaultValue: false }),
        TypeAttribute(YBoolean.$class)
      ],
      solidHitTest: [
        GraphMLAttribute().init({ defaultValue: false }),
        TypeAttribute(YBoolean.$class)
      ]
    }
  }

  provideValue(serviceProvider: ILookup): Sample2GroupNodeStyle {
    const style = new Sample2GroupNodeStyle(this.cssClass)
    style.isCollapsible = this.isCollapsible
    style.solidHitTest = this.solidHitTest
    return style
  }
}

export const DemoGroupStyleSerializationListener = (
  source: GraphMLIOHandler,
  args: HandleSerializationEventArgs
): void => {
  const item = args.item
  if (!(item instanceof Sample2GroupNodeStyle)) {
    return
  }

  const markupExtension = new Sample2GroupNodeStyleExtension()
  markupExtension.cssClass = item.cssClass!
  markupExtension.isCollapsible = item.isCollapsible
  markupExtension.solidHitTest = item.solidHitTest

  args.context.serializeReplacement(Sample2GroupNodeStyleExtension.$class, item, markupExtension)
  args.handled = true
}
