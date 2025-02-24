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
  Font,
  GraphComponent,
  ICanvasContext,
  INode,
  IRenderContext,
  NodeStyleBase,
  Point,
  Rect,
  Size,
  SvgVisual,
  type TaggedSvgVisual,
  TextRenderSupport,
  TextWrapping
} from '@yfiles/yfiles'
import { FlowNodePortStyle } from './FlowNodePortStyle'
import { getNodeIconSvg } from './icons'
import { assertIsFlowNode, type FlowNodeProperties } from './FlowNode'

type SvgVisualWithCache = TaggedSvgVisual<
  SVGGElement,
  {
    label: string
    hasErrorIndicator: boolean
    layoutWidth: number
  }
>

type SvgComponents = {
  wrapper: SVGGElement
  mainShape: SVGRectElement
  iconBox: SVGRectElement
  border: SVGRectElement
  label: SVGTextElement
  invalidMark: SVGGElement
  leftDummyPort: SVGGElement | null
  rightDummyPort: SVGGElement | null
}

export class FlowNodeStyle extends NodeStyleBase<SvgVisualWithCache> {
  static readonly defaultWidth = 150
  static readonly defaultWidthWithPorts = 150 + FlowNodePortStyle.size
  static readonly defaultHeight = 32
  static readonly minWidth = 150
  static readonly maxWidth = 300

  static readonly labelFontSize = 14
  static readonly labelHorizontalMargin = 8

  static readonly radius = 8

  static readonly iconSize = 14
  static readonly iconContainerWidth = 20
  static readonly iconContainerHeight = 20
  static readonly iconContainerRadius = 4

  static readonly errorIndicatorPath =
    'M11.8649 9.16693C12.2495 9.83348 11.7668 10.6667 10.9988 10.6667H1.00113C0.23161 10.6667 -0.248848 9.83218 0.134943 9.16693L5.13382 0.499687C5.51855 -0.167167 6.48215 -0.165958 6.86619 0.499687L11.8649 9.16693ZM6 7.375C5.47073 7.375 5.04167 7.80406 5.04167 8.33333C5.04167 8.8626 5.47073 9.29166 6 9.29166C6.52927 9.29166 6.95834 8.8626 6.95834 8.33333C6.95834 7.80406 6.52927 7.375 6 7.375ZM5.09015 3.93029L5.24469 6.76362C5.25192 6.89621 5.36155 7 5.49432 7H6.50569C6.63846 7 6.74809 6.89621 6.75532 6.76362L6.90986 3.93029C6.91767 3.78708 6.80365 3.66667 6.66023 3.66667H5.33975C5.19634 3.66667 5.08234 3.78708 5.09015 3.93029Z'
  static readonly errorIndicatorWidth = 12
  static readonly errorIndicatorHeight = 12

  private static color: Record<FlowNodeProperties['variant'], string> = {
    storageWriteFile: '#DEB887',
    storageReadFile: '#DEB887',
    parserCsv: '#DEBD5C',
    parserJson: '#DEBD5C',
    parserXml: '#DEBD5C',
    sequenceSort: '#E2D96E',
    sequenceJoin: '#E2D96E',
    networkTcpIn: '#C0C0C0',
    networkTcpOut: '#C0C0C0',
    networkTcpRequest: '#C0C0C0',
    functionFunction: '#F8CFA1',
    functionDelay: '#E6E0F8',
    functionFilter: '#E2D96E',
    commonComment: '#FFFFFF',
    commonLinkIn: '#DDDDDD',
    commonLinkOut: '#DDDDDD',
    commonLinkCall: '#DDDDDD',
    commonStatus: '#94C1D0'
  }

  /**
   * Resolves detailed dimensions of every specific item of the node visual. Importantly,
   * the total width calculated depends on the actual width of the label text.
   */
  private static getDimensions({
    label,
    hasErrorIndicator = false
  }: {
    label: string
    hasErrorIndicator?: boolean
  }) {
    const {
      defaultHeight: height,
      minWidth,
      maxWidth,
      labelFontSize,
      labelHorizontalMargin,
      radius,
      iconSize,
      iconContainerWidth,
      iconContainerHeight,
      iconContainerRadius,
      errorIndicatorWidth,
      errorIndicatorHeight
    } = FlowNodeStyle
    const { nodeReservedWidthForPort: portReservedWidth } = FlowNodePortStyle

    const iconContainerMargin = (height - iconContainerHeight) / 2
    const errorIndicatorMargin = (height - errorIndicatorHeight) / 2

    let maxLabelWidth = maxWidth - 2 * portReservedWidth - 2 * labelHorizontalMargin
    // Reserve space for left icon box
    maxLabelWidth = maxLabelWidth - iconContainerWidth - iconContainerMargin
    // Reserve space for right icon box (error indicator)
    if (hasErrorIndicator) {
      maxLabelWidth = maxLabelWidth - errorIndicatorWidth - errorIndicatorMargin
    }

    const { width: labelWidth, height: labelHeight } = TextRenderSupport.measureText({
      text: label,
      font: new Font('sans-serif', labelFontSize),
      wrapping: TextWrapping.WRAP_CHARACTER_ELLIPSIS,
      maximumSize: new Size(maxLabelWidth, height)
    })

    // Layout width & height includes some extra left & right spacing to accommodate
    // ports, which are outside the node shape (but in reality, we want them
    // to be right on the edge of the "true" node layout).
    const layoutHeight = height
    let layoutWidth = Math.max(
      minWidth,
      2 * portReservedWidth +
        iconContainerMargin +
        iconContainerWidth +
        labelHorizontalMargin +
        labelWidth +
        labelHorizontalMargin
    )
    let actualWidth =
      2 * portReservedWidth +
      iconContainerMargin +
      labelWidth +
      iconContainerWidth +
      2 * labelHorizontalMargin
    if (hasErrorIndicator) {
      actualWidth = actualWidth + errorIndicatorMargin + errorIndicatorWidth
    }
    if (hasErrorIndicator && actualWidth > minWidth) {
      layoutWidth = layoutWidth + errorIndicatorWidth + errorIndicatorMargin
    }

    const visibleWidth = layoutWidth - 2 * portReservedWidth
    const visibleHeight = layoutHeight

    return {
      layoutWidth,
      layoutHeight,
      visibleWidth,
      visibleHeight,
      portReservedWidth,
      radius,
      labelFontSize,
      maxLabelWidth,
      labelWidth,
      labelHeight,
      labelHorizontalMargin,
      iconSize,
      iconContainerWidth,
      iconContainerHeight,
      iconContainerMargin,
      iconContainerRadius,
      errorIndicatorWidth,
      errorIndicatorHeight,
      errorIndicatorMargin
    }
  }

  private static isSelected(context: IRenderContext, node: INode): boolean {
    const gc = context.canvasComponent instanceof GraphComponent ? context.canvasComponent : null
    return gc?.selection.includes(node) ?? false
  }

  private static isHovered(context: IRenderContext, node: INode): boolean {
    const gc = context.canvasComponent instanceof GraphComponent ? context.canvasComponent : null
    return gc?.highlights.includes(node) ?? false
  }

  protected createVisual(context: IRenderContext, node: INode): SvgVisualWithCache {
    assertIsFlowNode(node)

    const graph =
      context.canvasComponent instanceof GraphComponent ? context.canvasComponent.graph : null

    const { variant, label, hasLeftPort, hasRightPort } = node.tag
    const { x, y } = node.layout
    const isHovered = FlowNodeStyle.isHovered(context, node as INode)
    const isSelected = FlowNodeStyle.isSelected(context, node as INode)
    const {
      labelFontSize,
      radius,
      maxLabelWidth,
      labelHeight,
      iconSize,
      iconContainerWidth,
      iconContainerHeight,
      iconContainerMargin,
      iconContainerRadius,
      layoutWidth,
      layoutHeight,
      visibleWidth,
      visibleHeight,
      portReservedWidth,
      labelHorizontalMargin,
      errorIndicatorWidth,
      errorIndicatorMargin
    } = FlowNodeStyle.getDimensions({ label })

    const svg: SvgComponents = {
      wrapper: document.createElementNS('http://www.w3.org/2000/svg', 'g'),
      mainShape: document.createElementNS('http://www.w3.org/2000/svg', 'rect'),
      iconBox: document.createElementNS('http://www.w3.org/2000/svg', 'rect'),
      border: document.createElementNS('http://www.w3.org/2000/svg', 'rect'),
      label: document.createElementNS('http://www.w3.org/2000/svg', 'text'),
      invalidMark: document.createElementNS('http://www.w3.org/2000/svg', 'g'),
      leftDummyPort: null,
      rightDummyPort: null
    }

    svg.wrapper.classList.add('flow-node', variant)
    svg.mainShape.classList.add('flow-node__main')
    svg.iconBox.classList.add('flow-node__icon-box')
    svg.border.classList.add('flow-node__border')
    svg.label.classList.add('flow-node__label')
    svg.invalidMark.classList.add('flow-node__invalid-mark')

    svg.wrapper.setAttribute('transform', `translate(${x} ${y})`)

    TextRenderSupport.addText({
      targetElement: svg.label,
      text: label,
      font: new Font('sans-serif', labelFontSize),
      wrapping: TextWrapping.WRAP_CHARACTER_ELLIPSIS,
      maximumSize: new Size(maxLabelWidth, visibleHeight)
    })
    svg.label.setAttribute(
      'transform',
      `translate(${
        portReservedWidth + iconContainerMargin + iconContainerWidth + labelHorizontalMargin
      } ${(visibleHeight - labelHeight) / 2})`
    )
    svg.label.setAttribute('fill', 'rgb(85, 85, 85)')

    svg.mainShape.setAttribute('width', String(visibleWidth))
    svg.mainShape.setAttribute('x', String(portReservedWidth))
    svg.mainShape.setAttribute('height', String(visibleHeight))
    svg.mainShape.setAttribute('rx', String(radius))
    svg.mainShape.setAttribute('fill', 'rgb(255, 255, 255)')

    svg.iconBox.setAttribute('x', String(portReservedWidth + iconContainerMargin))
    svg.iconBox.setAttribute('y', String(iconContainerMargin))
    svg.iconBox.setAttribute('width', String(iconContainerWidth))
    svg.iconBox.setAttribute('height', String(iconContainerHeight))
    svg.iconBox.setAttribute('rx', String(iconContainerRadius))

    const icon = getNodeIconSvg({
      nodeVariant: variant,
      size: iconSize,
      color:
        FlowNodeStyle.color[variant] === '#FFFFFF' ? 'rgb(191, 191, 191)' : 'rgb(255, 255, 255)'
    })

    const iconPosition = new Point(
      (layoutHeight - iconSize) / 2 + portReservedWidth,
      (layoutHeight - iconSize) / 2
    )
    const iconContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    iconContainer.setAttribute('transform', `translate(${iconPosition.x}, ${iconPosition.y})`)
    iconContainer.appendChild(icon)

    svg.iconBox.setAttribute('fill', FlowNodeStyle.color[variant])
    svg.iconBox.setAttribute('stroke', 'rgba(0, 0, 0, 0.1)')

    const invalidMarkPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    invalidMarkPath.setAttribute('d', FlowNodeStyle.errorIndicatorPath)
    svg.invalidMark.setAttribute(
      'transform',
      `translate(${
        portReservedWidth + visibleWidth - errorIndicatorWidth - errorIndicatorMargin
      } ${errorIndicatorMargin})`
    )
    svg.invalidMark.setAttribute('fill', 'rgb(203,20,20)')
    svg.invalidMark.style.opacity = '0'
    svg.invalidMark.style.transition = 'opacity 0.2s'
    svg.invalidMark.append(invalidMarkPath)

    svg.border.setAttribute('width', String(visibleWidth))
    svg.border.setAttribute('x', String(portReservedWidth))
    svg.border.setAttribute('height', String(visibleHeight))
    svg.border.setAttribute('rx', '5')
    svg.border.setAttribute('fill', 'transparent')
    svg.border.style.transition = 'stroke .4s, stroke-width .2s'
    svg.border.setAttribute('stroke', isHovered || isSelected ? 'rgb(255, 108, 0)' : '#999999')
    svg.border.setAttribute('stroke-width', isSelected ? '2' : '1')

    svg.wrapper.append(
      svg.mainShape,
      svg.iconBox,
      iconContainer,
      svg.border,
      svg.label,
      svg.invalidMark
    )

    // During drag & drop operation, a node is created before becoming part of the target graph.
    // In that case, setting the layout won't work anyway.
    if (graph?.nodes.includes(node as INode)) {
      graph.setNodeLayout(node as INode, new Rect(x, y, layoutWidth, layoutHeight))
    }

    // Add dummy port visuals
    const nodeBounds = new Rect(x, y, layoutWidth, layoutHeight)
    if (hasLeftPort) {
      const dummyPort = FlowNodePortStyle.createDummyPortElement({ nodeBounds, side: 'left' })
      dummyPort.classList.add('flow-node__dummy-port--left')
      svg.wrapper.appendChild(dummyPort)
    }
    if (hasRightPort) {
      const dummyPort = FlowNodePortStyle.createDummyPortElement({ nodeBounds, side: 'right' })
      dummyPort.classList.add('flow-node__dummy-port--right')
      svg.wrapper.appendChild(dummyPort)
    }

    return SvgVisual.from(svg.wrapper, {
      label,
      layoutWidth,
      hasErrorIndicator: false
    })
  }

  protected updateVisual(
    context: IRenderContext,
    oldVisual: SvgVisualWithCache,
    node: unknown
  ): SvgVisualWithCache {
    assertIsFlowNode(node)

    const graph =
      context.canvasComponent instanceof GraphComponent ? context.canvasComponent.graph : null

    const { x, y } = node.layout
    const { label, validate } = node.tag
    const isHovered = FlowNodeStyle.isHovered(context, node as INode)
    const isSelected = FlowNodeStyle.isSelected(context, node as INode)
    const cache = oldVisual.tag
    const hasErrorIndicator = validate!(node.tag)!.invalidProperties.length > 0

    const {
      labelFontSize,
      maxLabelWidth,
      labelHeight,
      iconContainerWidth,
      iconContainerMargin,
      layoutWidth,
      layoutHeight,
      visibleWidth,
      visibleHeight,
      portReservedWidth,
      labelHorizontalMargin,
      errorIndicatorWidth,
      errorIndicatorMargin
    } = FlowNodeStyle.getDimensions({ label, hasErrorIndicator })

    const svg: SvgComponents = {
      wrapper: oldVisual.svgElement,
      mainShape: oldVisual.svgElement.querySelector('.flow-node__main')!,
      iconBox: oldVisual.svgElement.querySelector('.flow-node__icon-box')!,
      border: oldVisual.svgElement.querySelector('.flow-node__border')!,
      label: oldVisual.svgElement.querySelector('.flow-node__label')!,
      invalidMark: oldVisual.svgElement.querySelector('.flow-node__invalid-mark')!,
      leftDummyPort: oldVisual.svgElement.querySelector('.flow-node__dummy-port--left'),
      rightDummyPort: oldVisual.svgElement.querySelector('.flow-node__dummy-port--right')
    }

    if (cache.label !== label || cache.hasErrorIndicator !== hasErrorIndicator) {
      cache.label = label
      cache.hasErrorIndicator = hasErrorIndicator

      TextRenderSupport.addText({
        targetElement: svg.label,
        text: label,
        font: new Font('sans-serif', labelFontSize),
        wrapping: TextWrapping.WRAP_CHARACTER_ELLIPSIS,
        maximumSize: new Size(maxLabelWidth, visibleHeight)
      })

      svg.label.setAttribute(
        'transform',
        `translate(${
          portReservedWidth + iconContainerMargin + iconContainerWidth + labelHorizontalMargin
        } ${(visibleHeight - labelHeight) / 2})`
      )

      svg.mainShape.setAttribute('width', String(visibleWidth))
      svg.border.setAttribute('width', String(visibleWidth))

      // This may fail while drag-and-dropping, which is completely fine.
      try {
        graph?.setNodeLayout(node as INode, new Rect(x, y, layoutWidth, layoutHeight))
      } catch (e) {}
    }

    svg.border.setAttribute('stroke', isHovered || isSelected ? 'rgb(255, 108, 0)' : '#999999')
    svg.border.setAttribute('stroke-width', isSelected ? '2' : '1')

    svg.wrapper.setAttribute('transform', `translate(${x} ${y})`)

    svg.invalidMark.style.opacity = hasErrorIndicator ? '1' : '0'
    svg.invalidMark.setAttribute(
      'transform',
      `translate(${
        portReservedWidth + visibleWidth - errorIndicatorWidth - errorIndicatorMargin
      } ${errorIndicatorMargin})`
    )

    // Update right port position if necessary:
    if (cache.layoutWidth !== layoutWidth) {
      cache.layoutWidth = layoutWidth
      if (svg.rightDummyPort) {
        const nodeBounds = new Rect(x, y, layoutWidth, layoutHeight)
        FlowNodePortStyle.updateDummyPortElement({
          element: svg.rightDummyPort,
          nodeBounds,
          side: 'right'
        })
      }
    }

    return oldVisual
  }

  protected getBounds(_context: ICanvasContext, node: unknown): Rect {
    assertIsFlowNode(node)
    const { label } = node.tag
    const { x, y } = node.layout
    const { layoutWidth, layoutHeight } = FlowNodeStyle.getDimensions({ label })
    return new Rect(x, y, layoutWidth, layoutHeight)
  }
}
