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
  Fill,
  GeneralPath,
  GraphComponent,
  GraphMLAttribute,
  GraphMLIOHandler,
  HandleSerializationEventArgs,
  IBend,
  ICanvasContext,
  IEdge,
  IEnumerable,
  IInputModeContext,
  ILookup,
  INode,
  INodeStyle,
  IPort,
  IRenderContext,
  MarkupExtension,
  NodeStyleBase,
  Point,
  Rect,
  SolidColorFill,
  Stroke,
  SvgVisual,
  TypeAttribute,
  Visual,
  YString
} from 'yfiles'

export enum FlowchartNodeType {
  Process = 'process',
  Decision = 'decision',
  Start1 = 'start1',
  Start2 = 'start2',
  Terminator = 'terminator',
  Cloud = 'cloud',
  Data = 'data',
  DirectData = 'directData',
  Database = 'database',
  Document = 'document',
  PredefinedProcess = 'predefinedProcess',
  StoredData = 'storedData',
  InternalStorage = 'internalStorage',
  SequentialData = 'sequentialData',
  ManualInput = 'manualInput',
  Card = 'card',
  PaperType = 'paperType',
  Delay = 'delay',
  Display = 'display',
  ManualOperation = 'manualOperation',
  Preparation = 'preparation',
  LoopLimit = 'loopLimit',
  LoopLimitEnd = 'loopLimitEnd',
  OnPageReference = 'onPageReference',
  OffPageReference = 'offPageReference',
  Annotation = 'annotation',
  UserMessage = 'userMessage',
  NetworkMessage = 'networkMessage'
}

/**
 * {@link INodeStyle} which draws a flowchart shape according to its type.
 * This style can be customized by changing the properties 'fill' and 'stroke' as well as with a css-stylesheet.
 */
export class FlowchartNodeStyle extends NodeStyleBase {
  /**
   * Creates a new instance with the given type.
   * @param type The element type
   * @param fill The background fill for this still.
   * @param stroke The border stroke for this style.
   * @param cssClass The CSS class name for this style.
   */
  constructor(
    public type: FlowchartNodeType,
    public fill: Fill = new SolidColorFill(183, 201, 227),
    public stroke: Stroke = Stroke.BLACK,
    public cssClass: string | null = null
  ) {
    super()
  }

  createVisual(context: IRenderContext, node: INode): SvgVisual {
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    // add the shape according to the type
    const path = getPath(this.type, node).createSvgPath()
    if (!this.cssClass) {
      if (this.type === 'annotation') {
        Stroke.TRANSPARENT.applyTo(path, context)
      } else {
        Stroke.setStroke(this.stroke, path, context)
      }
      Fill.setFill(this.fill, path, context)
    }
    container.appendChild(path)

    // add the decoration if there is any for this type
    const decoration = getDecoration(this.type, node, context)
    let decorationPath: SVGPathElement = null!
    if (decoration) {
      decorationPath = decoration.createSvgPath()
      if (!this.cssClass) {
        Stroke.setStroke(this.stroke, decorationPath, context)
        if (this.type === 'annotation') {
          Fill.TRANSPARENT.applyTo(decorationPath, context)
        } else {
          Fill.setFill(this.fill, decorationPath, context)
        }
      }
      container.appendChild(decorationPath)
    }

    // apply the css settings
    if (this.cssClass) {
      path.setAttribute('class', this.cssClass)
      if (decoration) {
        decorationPath.setAttribute('class', this.cssClass)
      }
      if (this.type === 'annotation') {
        path.setAttribute('style', 'stroke: transparent')
        if (decoration) {
          decorationPath.setAttribute('style', 'fill: transparent')
        }
      }
    }

    // store relevant data for performance improvement in #updateVisual
    ;(container as any)['render-data-cache'] = {
      location: node.layout.topLeft,
      size: node.layout.toSize(),
      type: this.type,
      stroke: this.stroke,
      fill: this.fill,
      cssClass: this.cssClass
    }

    return new SvgVisual(container)
  }

  updateVisual(context: IRenderContext, oldVisual: Visual, node: INode): Visual {
    const container = (oldVisual as SvgVisual).svgElement
    const cache = (container as any)['render-data-cache']
    const path = container.firstElementChild as SVGPathElement
    const decoration =
      container.childElementCount === 2 ? (container.lastElementChild as SVGElement) : null

    if (cache.type !== this.type) {
      return this.createVisual(context, node)
    }

    // update shape and decoration if position or size of the node has changed
    // annotations are always updated because the decoration might have changed according to the connected edges
    if (
      !cache.location.equals(node.layout.topLeft) ||
      !cache.size.equals(node.layout.toSize()) ||
      this.type === 'annotation'
    ) {
      path.setAttribute('d', getPath(this.type, node).createSvgPathData())
      let decorationPath
      if (decoration && (decorationPath = getDecoration(this.type, node, context))) {
        decoration.setAttribute('d', decorationPath.createSvgPathData())
      }
      cache.location = node.layout.topLeft
      cache.size = node.layout.toSize()
    }

    // update the stroke if it has changed
    if (cache.stroke !== this.stroke) {
      if (!this.cssClass) {
        if (this.type !== 'annotation') {
          Stroke.setStroke(this.stroke, path, context)
        } else if (decoration) {
          Stroke.setStroke(this.stroke, decoration, context)
        }
      }
      cache.stroke = this.stroke
    }

    // update the fill if it has changed
    if (cache.fill !== this.fill) {
      if (!this.cssClass) {
        Fill.setFill(this.fill, path, context)
      }
      cache.fill = this.fill
    }

    // update stroke and fill if the css-class has changed
    if (cache.cssClass !== this.cssClass) {
      if (this.cssClass) {
        path.setAttribute('class', this.cssClass)
        if (this.type === 'annotation') {
          path.setAttribute('style', 'stroke: transparent')
        }
        if (decoration) {
          decoration.setAttribute('class', this.cssClass)
          if (this.type === 'annotation') {
            decoration.setAttribute('style', 'fill: transparent')
          }
        }
      } else if (this.type === 'annotation') {
        path.setAttribute('stroke', 'transparent')
        Fill.setFill(this.fill, path, context)
        if (decoration) {
          Stroke.setStroke(this.stroke, decoration, context)
          Fill.TRANSPARENT.applyTo(decoration, context)
        }
      } else {
        Stroke.setStroke(this.stroke, path, context)
        Fill.setFill(this.fill, path, context)
        if (decoration) {
          Stroke.setStroke(this.stroke, decoration, context)
          Fill.setFill(this.fill, decoration, context)
        }
      }
      cache.cssClass = this.cssClass
    }

    return oldVisual
  }

  /**
   * Returns the bounds of the outline of the shape according to the type.
   */
  getBounds(context: ICanvasContext, node: INode): Rect {
    return getPath(this.type, node).getBounds()
  }

  /**
   * Returns the outline of the shape according to the type.
   */
  getOutline(node: INode): GeneralPath {
    return getPath(this.type, node)
  }

  /**
   * Returns whether or not the given location lies within the shape according to the type.
   */
  isInside(node: INode, location: Point): boolean {
    if (!node.layout.contains(location)) {
      return false
    }
    return getPath(this.type, node).areaContains(location)
  }

  /**
   * Returns whether or not the given location hits the shape according to the type.
   */
  isHit(context: IInputModeContext, location: Point, node: INode): boolean {
    return (
      node.layout.toRect().containsWithEps(location, context.hitTestRadius) &&
      getPath(this.type, node).areaContains(location)
    )
  }
}

/**
 * Returns the outline of the shape according to the type
 */
function getPath(type: FlowchartNodeType, node: INode): GeneralPath {
  switch (type) {
    default:
    case FlowchartNodeType.Annotation:
      return renderAnnotationPath(node)
    case FlowchartNodeType.Card:
      return renderCardPath(node)
    case FlowchartNodeType.Cloud:
      return renderCloudPath(node)
    case FlowchartNodeType.Data:
      return renderDataPath(node)
    case FlowchartNodeType.Database:
      return renderDatabasePath(node)
    case FlowchartNodeType.Decision:
      return renderDecisionPath(node)
    case FlowchartNodeType.Delay:
      return renderDelayPath(node)
    case FlowchartNodeType.DirectData:
      return renderDirectDataPath(node)
    case FlowchartNodeType.Display:
      return renderDisplayPath(node)
    case FlowchartNodeType.Document:
      return renderDocumentPath(node)
    case FlowchartNodeType.InternalStorage:
      return renderInternalStoragePath(node)
    case FlowchartNodeType.LoopLimit:
      return renderLoopLimitPath(node)
    case FlowchartNodeType.LoopLimitEnd:
      return renderLoopLimitEndPath(node)
    case FlowchartNodeType.ManualInput:
      return renderManualInputPath(node)
    case FlowchartNodeType.ManualOperation:
      return renderManualOperationPath(node)
    case FlowchartNodeType.NetworkMessage:
      return renderNetworkMessagePath(node)
    case FlowchartNodeType.OffPageReference:
      return renderOffPageReferencePath(node)
    case FlowchartNodeType.OnPageReference:
      return renderOnPageReferencePath(node)
    case FlowchartNodeType.PaperType:
      return renderPaperTapePath(node)
    case FlowchartNodeType.PredefinedProcess:
      return renderPredefinedProcessPath(node)
    case FlowchartNodeType.Preparation:
      return renderPreparationPath(node)
    case FlowchartNodeType.Process:
      return renderProcessPath(node)
    case FlowchartNodeType.SequentialData:
      return renderSequentialDataPath(node)
    case FlowchartNodeType.Start1:
      return renderStart1Path(node)
    case FlowchartNodeType.Start2:
      return renderStart2Path(node)
    case FlowchartNodeType.StoredData:
      return renderStoredDataPath(node)
    case FlowchartNodeType.Terminator:
      return renderTerminatorPath(node)
    case FlowchartNodeType.UserMessage:
      return renderUserMessagePath(node)
  }
}

/**
 * Returns the decorations according to the type
 */
function getDecoration(
  type: FlowchartNodeType,
  node: INode,
  context: IRenderContext
): GeneralPath | null {
  switch (type) {
    default:
      return null
    case FlowchartNodeType.Annotation:
      return renderAnnotationDecoration(node, context)
    case FlowchartNodeType.Database:
      return renderDatabaseDecoration(node)
    case FlowchartNodeType.DirectData:
      return renderDirectDataDecoration(node)
    case FlowchartNodeType.InternalStorage:
      return renderInternalStorageDecoration(node)
    case FlowchartNodeType.PredefinedProcess:
      return renderPredefinedProcessDecoration(node)
    case FlowchartNodeType.SequentialData:
      return renderSequentialDataDecoration(node)
  }
}

function renderCardPath(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height

  const borderDistance = Math.min(10, Math.min(width, height) * 0.5)

  const path = new GeneralPath()
  path.moveTo(x + borderDistance, y)
  path.lineTo(x + width, y)
  path.lineTo(x + width, y + height)
  path.lineTo(x, y + height)
  path.lineTo(x, y + borderDistance)
  path.close()
  return path
}

function renderDataPath(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height

  const inclination = 0.255
  const borderDistance = inclination * Math.min(width, height)

  const path = new GeneralPath()
  path.moveTo(x + borderDistance, y)
  path.lineTo(x + width, y)
  path.lineTo(x + (width - borderDistance), y + height)
  path.lineTo(x, y + height)
  path.close()
  return path
}

function renderDatabasePath(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height
  const xOffset = 0.03
  const yOffset = 0.2

  const path = new GeneralPath()
  path.moveTo(x, y + yOffset * height)
  path.cubicTo(
    x + xOffset * width,
    y,
    x + (width - xOffset * width),
    y,
    x + width,
    y + yOffset * height
  )
  path.lineTo(x + width, y + (height - yOffset * height))
  path.cubicTo(
    x + (width - xOffset * width),
    y + height,
    x + xOffset * width,
    y + height,
    x,
    y + (height - yOffset * height)
  )
  path.close()
  return path
}

function renderDatabaseDecoration(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height
  const xOffset = 0.03
  const yOffset = 0.2

  const path = new GeneralPath()
  path.moveTo(x + width, y + yOffset * height)
  path.cubicTo(
    x + (width - xOffset * width),
    y + 2 * yOffset * height,
    x + xOffset * width,
    y + 2 * yOffset * height,
    x,
    y + yOffset * height
  )
  return path
}

function renderDirectDataPath(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height

  const radius = 0.125
  const borderDistance = radius * Math.min(width, height)

  const path = new GeneralPath()
  path.moveTo(x + borderDistance, y)
  path.lineTo(x + (width - borderDistance), y)
  path.quadTo(
    x + width + borderDistance,
    y + height * 0.5,
    x + (width - borderDistance),
    y + height
  )
  path.lineTo(x + borderDistance, y + height)
  path.quadTo(x - borderDistance, y + height * 0.5, x + borderDistance, y)
  path.close()
  return path
}

function renderDirectDataDecoration(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height

  const radius = 0.125
  const borderDistance = radius * Math.min(width, height)

  const path = new GeneralPath()
  path.moveTo(x + (width - borderDistance), y)
  path.quadTo(
    x + (width - 3 * borderDistance),
    y + height * 0.5,
    x + (width - borderDistance),
    y + height
  )
  return path
}

function renderCloudPath(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height
  const asymmetryConstY = 0.03 * height
  const asymmetryConstX = 0.05 * width
  const xOffset1 = 0.125
  const yOffset1 = 0.25
  const yOffset2 = 0.18

  const path = new GeneralPath()
  path.moveTo(x + xOffset1 * width, y + 0.5 * height + asymmetryConstY)
  path.cubicTo(
    x,
    y + yOffset1 * height,
    x + 0.125 * width,
    y,
    x + 0.33 * width,
    y + yOffset2 * height
  )
  path.cubicTo(
    x + 0.33 * width,
    y,
    x + (width - 0.33 * width),
    y,
    x + (width - 0.33 * width),
    y + yOffset2 * height
  )
  path.cubicTo(
    x + (width - 0.125 * width),
    y,
    x + width,
    y + yOffset1 * height,
    x + (width - xOffset1 * width),
    y + (0.5 * height - asymmetryConstY)
  )
  path.cubicTo(
    x + width,
    y + (height - yOffset1 * height),
    x + (width - 0.125 * width),
    y + height,
    x + (width - 0.33 * width) + asymmetryConstX,
    y + (height - yOffset2 * height)
  )
  path.cubicTo(
    x + (width - 0.33 * width),
    y + height,
    x + 0.33 * width,
    y + height,
    x + 0.33 * width + asymmetryConstX,
    y + (height - yOffset2 * height)
  )
  path.cubicTo(
    x + 0.125 * width,
    y + height,
    x,
    y + (height - yOffset1 * height),
    x + xOffset1 * width,
    y + 0.5 * height + asymmetryConstY
  )
  path.close()
  return path
}

function renderDecisionPath(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height
  const path = new GeneralPath()
  path.moveTo(x + width * 0.5, y)
  path.lineTo(x + width, y + height * 0.5)
  path.lineTo(x + width * 0.5, y + height)
  path.lineTo(x, y + height * 0.5)
  path.close()
  return path
}

function renderProcessPath(node: INode): GeneralPath {
  const path = new GeneralPath()
  path.appendRectangle(node.layout, true)
  return path
}

function renderStart1Path(node: INode): GeneralPath {
  const path = new GeneralPath()
  path.appendEllipse(node.layout, true)
  return path
}

function renderStart2Path(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const height = node.layout.height
  const width = node.layout.width
  const diameter = Math.min(height, width)
  const borderDistanceX = Math.max((width - diameter) * 0.5, 0)
  const borderDistanceY = Math.max((height - diameter) * 0.5, 0)

  const path = new GeneralPath()
  path.appendEllipse(new Rect(x + borderDistanceX, y + borderDistanceY, diameter, diameter), true)
  return path
}

function renderTerminatorPath(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height
  const radius = Math.min(width, height) * 0.5
  const arcX = radius
  const arcY = radius

  const path = new GeneralPath()
  path.moveTo(x, y + arcY)
  path.quadTo(x, y, x + arcX, y)
  path.lineTo(x + (width - arcX), y)
  path.quadTo(x + width, y, x + width, y + arcY)
  path.lineTo(x + width, y + (height - arcY))
  path.quadTo(x + width, y + height, x + (width - arcX), y + height)
  path.lineTo(x + arcX, y + height)
  path.quadTo(x, y + height, x, y + height - arcY)
  path.close()
  return path
}

function renderDocumentPath(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height

  const radius = 0.125
  const borderDistance = radius * Math.min(width, height)

  const path = new GeneralPath()
  path.moveTo(x, y)
  path.lineTo(x + width, y)
  path.lineTo(x + width, y + (height - borderDistance))
  path.quadTo(
    x + 0.75 * width,
    y + (height - 3 * borderDistance),
    x + 0.5 * width,
    y + (height - borderDistance)
  )
  path.quadTo(x + 0.25 * width, y + height + borderDistance, x, y + (height - borderDistance))
  path.close()
  return path
}

function renderPredefinedProcessPath(node: INode): GeneralPath {
  const path = new GeneralPath()
  path.appendRectangle(node.layout, true)
  return path
}

function renderPredefinedProcessDecoration(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height

  const borderDistance = Math.min(10, Math.min(width, height) * 0.5)

  const path = new GeneralPath()
  path.moveTo(x + borderDistance, y)
  path.lineTo(x + borderDistance, y + height)
  path.moveTo(x + (width - borderDistance), y)
  path.lineTo(x + (width - borderDistance), y + height)
  path.moveTo(x + borderDistance, y)
  path.close()
  return path
}

function renderStoredDataPath(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height

  const radius = 0.125
  const borderDistance = radius * Math.min(width, height)

  const path = new GeneralPath()
  path.moveTo(x + borderDistance, y)
  path.lineTo(x + width, y)
  path.quadTo(x + (width - 2 * borderDistance), y + height * 0.5, x + width, y + height)
  path.lineTo(x + borderDistance, y + height)
  path.quadTo(x - borderDistance, y + height * 0.5, x + borderDistance, y)
  path.close()
  return path
}

function renderInternalStoragePath(node: INode): GeneralPath {
  const path = new GeneralPath()
  path.appendRectangle(node.layout, true)
  return path
}

function renderInternalStorageDecoration(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height

  const borderDistance = Math.min(10, Math.min(width, height) * 0.5)

  const path = new GeneralPath()
  path.moveTo(x + borderDistance, y)
  path.lineTo(x + borderDistance, y + height)
  path.moveTo(x, y + borderDistance)
  path.lineTo(x + width, y + borderDistance)
  path.moveTo(x + borderDistance, y)
  path.close()
  return path
}

function renderSequentialDataPath(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height
  const diameter = Math.min(height, width)
  const borderDistanceX = Math.max((width - diameter) * 0.5, 0)
  const borderDistanceY = Math.max((height - diameter) * 0.5, 0)

  const path = new GeneralPath()
  path.appendEllipse(new Rect(x + borderDistanceX, y + borderDistanceY, diameter, diameter), true)
  return path
}

function renderSequentialDataDecoration(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height

  const diameter = Math.min(height, width)
  const borderDistanceX = Math.max((width - diameter) * 0.5, 0)
  const borderDistanceY = Math.max((height - diameter) * 0.5, 0)

  const path = new GeneralPath()
  path.moveTo(x + borderDistanceX + diameter * 0.5, y + borderDistanceY + diameter)
  path.lineTo(x + (width - borderDistanceX), y + borderDistanceY + diameter)
  return path
}

function renderManualInputPath(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height

  const borderDistance = Math.min(10, Math.min(width, height) * 0.5)

  const path = new GeneralPath()
  path.moveTo(x, y + borderDistance)
  path.lineTo(x + width, y)
  path.lineTo(x + width, y + height)
  path.lineTo(x, y + height)
  path.close()
  return path
}

function renderPaperTapePath(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height

  const radius = 0.125
  const borderDistance = radius * Math.min(width, height)

  const path = new GeneralPath()
  path.moveTo(x, y + borderDistance)
  path.quadTo(x + 0.25 * width, y + 3 * borderDistance, x + 0.5 * width, y + borderDistance)
  path.quadTo(x + 0.75 * width, y - borderDistance, x + width, y + borderDistance)
  path.lineTo(x + width, y + (height - borderDistance))
  path.quadTo(
    x + 0.75 * width,
    y + (height - 3 * borderDistance),
    x + 0.5 * width,
    y + (height - borderDistance)
  )
  path.quadTo(x + 0.25 * width, y + height + borderDistance, x, y + (height - borderDistance))
  path.close()
  return path
}

function renderDelayPath(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height

  const radius = 0.125
  const borderDistance = radius * Math.min(width, height)

  const path = new GeneralPath()
  path.moveTo(x, y)
  path.lineTo(x + (width - borderDistance), y)
  path.quadTo(
    x + width + borderDistance,
    y + height * 0.5,
    x + (width - borderDistance),
    y + height
  )
  path.lineTo(x, y + height)
  path.close()
  return path
}

function renderDisplayPath(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height

  const radius = 0.125
  const borderDistance = radius * Math.min(width, height)

  const path = new GeneralPath()
  path.moveTo(x, y + height * 0.5)
  path.quadTo(x + borderDistance, y + borderDistance, x + 4 * borderDistance, y)
  path.lineTo(x + (width - borderDistance), y)
  path.quadTo(
    x + width + borderDistance,
    y + height * 0.5,
    x + (width - borderDistance),
    y + height
  )
  path.lineTo(x + 4 * borderDistance, y + height)
  path.quadTo(x + borderDistance, y + (height - borderDistance), x, y + height * 0.5)
  path.close()
  return path
}

function renderManualOperationPath(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height

  const borderDistance = Math.min(10, Math.min(width, height) * 0.5)

  const path = new GeneralPath()
  path.moveTo(x, y)
  path.lineTo(x + width, y)
  path.lineTo(x + (width - borderDistance), y + height)
  path.lineTo(x + borderDistance, y + height)
  path.close()
  return path
}

function renderPreparationPath(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height

  const inclination = 0.25
  const borderDistance = Math.min(inclination * height, inclination * width)

  const path = new GeneralPath()
  path.moveTo(x + borderDistance, y)
  path.lineTo(x + (width - borderDistance), y)
  path.lineTo(x + width, y + height * 0.5)
  path.lineTo(x + (width - borderDistance), y + height)
  path.lineTo(x + borderDistance, y + height)
  path.lineTo(x, y + height * 0.5)
  path.close()
  return path
}

function renderLoopLimitPath(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height

  const borderDistance = Math.min(Math.min(10, width * 0.5), height * 0.5)

  const path = new GeneralPath()
  path.moveTo(x + borderDistance, y)
  path.lineTo(x + (width - borderDistance), y)
  path.lineTo(x + width, y + borderDistance)
  path.lineTo(x + width, y + height)
  path.lineTo(x, y + height)
  path.lineTo(x, y + borderDistance)
  path.close()
  return path
}

function renderLoopLimitEndPath(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height

  const borderDistance = Math.min(Math.min(10, width * 0.5), height * 0.5)

  const path = new GeneralPath()
  path.moveTo(x, y)
  path.lineTo(x + width, y)
  path.lineTo(x + width, y + (height - borderDistance))
  path.lineTo(x + (width - borderDistance), y + height)
  path.lineTo(x + borderDistance, y + height)
  path.lineTo(x, y + (height - borderDistance))
  path.close()
  return path
}

function renderOnPageReferencePath(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height
  const diameter = Math.min(height, width)
  const borderDistanceX = Math.max((width - diameter) / 2, 0)
  const borderDistanceY = Math.max((height - diameter) / 2, 0)

  const path = new GeneralPath()
  path.appendEllipse(new Rect(x + borderDistanceX, y + borderDistanceY, diameter, diameter), true)
  return path
}

function renderOffPageReferencePath(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height
  const minLength = Math.min(height, width)
  const borderDistanceX = Math.max((width - minLength) * 0.5, 0)
  const borderDistanceY = Math.max((height - minLength) * 0.5, 0)

  const path = new GeneralPath()
  path.moveTo(x + borderDistanceX, y + borderDistanceY)
  path.lineTo(x + minLength + borderDistanceX, y + borderDistanceY)
  path.lineTo(x + minLength + borderDistanceX, y + minLength * 0.5 + borderDistanceY)
  path.lineTo(x + minLength * 0.5 + borderDistanceX, y + minLength + borderDistanceY)
  path.lineTo(x + borderDistanceX, y + minLength * 0.5 + borderDistanceY)
  path.close()
  return path
}

function renderAnnotationPath(node: INode): GeneralPath {
  const path = new GeneralPath()
  path.appendRectangle(node.layout, true)
  return path
}

function renderAnnotationDecoration(node: INode, context: IRenderContext): GeneralPath {
  const orientation = determineBracketOrientation(node, context)

  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height
  switch (orientation) {
    default:
    case 'left':
      return createLeftBracket(x, y, width, height)
    case 'right':
      return createRightBracket(x, y, width, height)
    case 'top':
      return createTopBracket(x, y, width, height)
    case 'down':
      return createDownBracket(x, y, width, height)
  }
}

function createLeftBracket(x: number, y: number, width: number, height: number): GeneralPath {
  const path = new GeneralPath()
  path.moveTo(x + 0.125 * width, y)
  path.lineTo(x, y)
  path.lineTo(x, y + height)
  path.lineTo(x + 0.125 * width, y + height)
  return path
}

function createRightBracket(x: number, y: number, width: number, height: number): GeneralPath {
  const path = new GeneralPath()
  path.moveTo(x + 0.875 * width, y)
  path.lineTo(x + width, y)
  path.lineTo(x + width, y + height)
  path.lineTo(x + 0.875 * width, y + height)
  return path
}

function createTopBracket(x: number, y: number, width: number, height: number): GeneralPath {
  const path = new GeneralPath()
  path.moveTo(x, y + 0.125 * height)
  path.lineTo(x, y)
  path.lineTo(x + width, y)
  path.lineTo(x + width, y + 0.125 * height)
  return path
}

function createDownBracket(x: number, y: number, width: number, height: number): GeneralPath {
  const path = new GeneralPath()
  path.moveTo(x, y + 0.875 * height)
  path.lineTo(x, y + height)
  path.lineTo(x + width, y + height)
  path.lineTo(x + width, y + 0.875 * height)
  return path
}

/**
 * Returns a constant representing the orientation/placement of the
 * annotation's bracket. One of
 * <ul>
 *   <li>down</li>
 *   <li>right</li>
 *   <li>top</li>
 *   <li>left</li>
 * </ul>
 * @param node the node
 * @param context the render context
 */
function determineBracketOrientation(
  node: INode,
  context: IRenderContext
): 'left' | 'right' | 'top' | 'down' {
  const graph = (context.canvasComponent as GraphComponent).graph
  if (graph.contains(node)) {
    if (graph.degree(node) === 1) {
      const edge =
        graph.inDegree(node) === 1 ? graph.inEdgesAt(node).first() : graph.outEdgesAt(node).first()
      const intersection = getIntersection(edge, node)

      if (!intersection) {
        return 'left'
      }

      const x = intersection.x
      const y = intersection.y
      const epsilon = 0.1

      const minX = node.layout.x
      if (x + epsilon > minX && x - epsilon < minX) {
        return 'left'
      }
      const maxX = minX + node.layout.width
      if (x + epsilon > maxX && x - epsilon < maxX) {
        return 'right'
      }
      const minY = node.layout.y
      if (y + epsilon > minY && y - epsilon < minY) {
        return 'top'
      }
      const maxY = minY + node.layout.height
      if (y + epsilon > maxY && y - epsilon < maxY) {
        return 'down'
      }
    }
  }
  return 'left'
}

/**
 * Returns the point where the edge intersects with the node.
 *
 */
function getIntersection(edge: IEdge, node: INode): Point | null {
  let bends: IEnumerable<IBend>
  let firstPort: IPort
  let secondPort: IPort
  if (edge.sourceNode === node) {
    firstPort = edge.sourcePort!
    secondPort = edge.targetPort!
    bends = edge.bends
  } else {
    firstPort = edge.targetPort!
    secondPort = edge.sourcePort!
    bends = edge.bends.toReversed()
  }

  let lastBend: Point = firstPort.location
  let bend: Point | null = null
  for (const enumerator = bends.getEnumerator(); enumerator.moveNext(); ) {
    bend = enumerator.current.location.toPoint()

    if (!node.layout.contains(bend)) {
      break
    }

    lastBend = bend
  }

  return node.layout.toRect().findLineIntersection(lastBend, bend ? bend : secondPort.location)
}

function renderUserMessagePath(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height
  const inclination = 0.25
  const borderDistance = Math.min(inclination * height, inclination * width)

  const path = new GeneralPath()
  path.moveTo(x, y)
  path.lineTo(x + (width - borderDistance), y)
  path.lineTo(x + width, y + height * 0.5)
  path.lineTo(x + (width - borderDistance), y + height)
  path.lineTo(x, y + height)
  path.close()
  return path
}

function renderNetworkMessagePath(node: INode): GeneralPath {
  const x = node.layout.x
  const y = node.layout.y
  const width = node.layout.width
  const height = node.layout.height
  const inclination = 0.25
  const borderDistance = Math.min(inclination * height, inclination * width)

  const path = new GeneralPath()
  path.moveTo(x, y)
  path.lineTo(x + width, y)
  path.lineTo(x + width, y + height)
  path.lineTo(x, y + height)
  path.lineTo(x + borderDistance, y + height * 0.5)
  path.close()
  return path
}

/**
 * Markup extension needed to (de-)serialize the flowchart style.
 */
export class FlowchartNodeStyleExtension extends MarkupExtension {
  private $stroke: Stroke = Stroke.BLACK
  private $fill: Fill = new SolidColorFill(183, 201, 227)
  private $type: FlowchartNodeType = FlowchartNodeType.Data
  private $cssClass: string | null = null

  get type(): FlowchartNodeType {
    return this.$type
  }

  set type(type: FlowchartNodeType) {
    this.$type = type
  }

  get stroke(): Stroke {
    return this.$stroke
  }

  set stroke(stroke: Stroke) {
    this.$stroke = stroke
  }

  get fill(): Fill {
    return this.$fill
  }

  set fill(fill: Fill) {
    this.$fill = fill
  }

  get cssClass(): string | null {
    return this.$cssClass
  }

  set cssClass(value: string | null) {
    this.$cssClass = value
  }

  static get $meta(): {
    type: TypeAttribute[]
    stroke: (TypeAttribute | GraphMLAttribute)[]
    fill: (TypeAttribute | GraphMLAttribute)[]
    cssClass: (TypeAttribute | GraphMLAttribute)[]
  } {
    return {
      type: [TypeAttribute(YString.$class)],
      stroke: [
        GraphMLAttribute().init({ defaultValue: Stroke.BLACK }),
        TypeAttribute(Stroke.$class)
      ],
      fill: [
        GraphMLAttribute().init({ defaultValue: new SolidColorFill(183, 201, 227) }),
        TypeAttribute(Fill.$class)
      ],
      cssClass: [GraphMLAttribute().init({ defaultValue: null }), TypeAttribute(YString.$class)]
    }
  }

  provideValue(serviceProvider: ILookup | null): any {
    const style = new FlowchartNodeStyle(this.type)
    style.type = this.type
    style.stroke = this.stroke
    style.fill = this.fill
    style.cssClass = this.cssClass
    return style
  }
}

/**
 * Listener that handles the serialization of the flowchart style.
 */
export const FlowchartSerializationListener = (
  sender: GraphMLIOHandler,
  args: HandleSerializationEventArgs
) => {
  const item = args.item
  if (item instanceof FlowchartNodeStyle) {
    const flowchartStyleExtension = new FlowchartNodeStyleExtension()
    flowchartStyleExtension.type = item.type
    flowchartStyleExtension.stroke = item.stroke
    flowchartStyleExtension.fill = item.fill
    flowchartStyleExtension.cssClass = item.cssClass

    const context = args.context
    context.serializeReplacement(FlowchartNodeStyleExtension.$class, item, flowchartStyleExtension)
    args.handled = true
  }
}

// export a default object to be able to map a namespace to this module for serialization
export default { FlowchartNodeStyle, FlowchartNodeStyleExtension }
