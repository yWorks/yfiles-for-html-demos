import { BaseClass, IRenderContext, IVisualTemplate, Rect, SvgVisual } from 'yfiles'

export class MyMarqueeTemplate extends BaseClass<IVisualTemplate>(IVisualTemplate) implements IVisualTemplate {
  createVisual(context: IRenderContext, bounds: Rect, dataObject: Object): SvgVisual {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGRectElement
    rect.setAttribute('stroke-width', '3')
    rect.setAttribute('stroke', 'blue')
    rect.setAttribute('fill', 'transparent')
    rect.x.baseVal.value = bounds.x
    rect.y.baseVal.value = bounds.y
    rect.width.baseVal.value = bounds.width
    rect.height.baseVal.value = bounds.height
    return new SvgVisual(rect)
  }

  updateVisual(
    context: IRenderContext,
    oldVisual: SvgVisual,
    bounds: Rect,
    dataObject: Object
  ): SvgVisual {
    const rect = oldVisual.svgElement as SVGRectElement
    rect.x.baseVal.value = bounds.x
    rect.y.baseVal.value = bounds.y
    rect.width.baseVal.value = bounds.width
    rect.height.baseVal.value = bounds.height
    return oldVisual
  }
}
