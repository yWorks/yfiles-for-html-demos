import yfiles = require('yfiles/view-component')

export class MyMarqueeTemplate extends yfiles.lang.BaseClass(yfiles.view.IVisualTemplate)
  implements yfiles.view.IVisualTemplate {
  createVisual(
    context: yfiles.view.IRenderContext,
    bounds: yfiles.geometry.Rect,
    dataObject: Object
  ): yfiles.view.SvgVisual {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect') as SVGRectElement
    rect.setAttribute('stroke-width', '3')
    rect.setAttribute('stroke', 'blue')
    rect.setAttribute('fill', 'transparent')
    rect.x.baseVal.value = bounds.x
    rect.y.baseVal.value = bounds.y
    rect.width.baseVal.value = bounds.width
    rect.height.baseVal.value = bounds.height
    return new yfiles.view.SvgVisual(rect)
  }

  updateVisual(
    context: yfiles.view.IRenderContext,
    oldVisual: yfiles.view.SvgVisual,
    bounds: yfiles.geometry.Rect,
    dataObject: Object
  ): yfiles.view.SvgVisual {
    const rect = oldVisual.svgElement as SVGRectElement
    rect.x.baseVal.value = bounds.x
    rect.y.baseVal.value = bounds.y
    rect.width.baseVal.value = bounds.width
    rect.height.baseVal.value = bounds.height
    return oldVisual
  }
}
