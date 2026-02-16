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
import {
  Color,
  Fill,
  GeneralPath,
  INodeStyle,
  NodeStyleBase,
  Rect,
  Stroke,
  SvgVisual
} from '@yfiles/yfiles'

export const FlowchartNodeType = {
  Process: 'process',
  Decision: 'decision',
  Start1: 'start1',
  Start2: 'start2',
  Terminator: 'terminator',
  Cloud: 'cloud',
  Data: 'data',
  DirectData: 'directData',
  Database: 'database',
  Document: 'document',
  PredefinedProcess: 'predefinedProcess',
  StoredData: 'storedData',
  InternalStorage: 'internalStorage',
  SequentialData: 'sequentialData',
  ManualInput: 'manualInput',
  Card: 'card',
  PaperType: 'paperType',
  Delay: 'delay',
  Display: 'display',
  ManualOperation: 'manualOperation',
  Preparation: 'preparation',
  LoopLimit: 'loopLimit',
  LoopLimitEnd: 'loopLimitEnd',
  OnPageReference: 'onPageReference',
  OffPageReference: 'offPageReference',
  Annotation: 'annotation',
  UserMessage: 'userMessage',
  NetworkMessage: 'networkMessage'
}

/**
 * {@link INodeStyle} which draws a flowchart shape according to its type.
 * This style can be customized by changing the properties 'fill' and 'stroke' as well as with a css-stylesheet.
 */
export class FlowchartNodeStyle extends NodeStyleBase {
  cssClass
  stroke
  fill
  type

  /**
   * Creates a new instance with the given type.
   * @param type The element type
   * @param fill The background fill for this still.
   * @param stroke The border stroke for this style.
   * @param cssClass The CSS class name for this style.
   */
  constructor(type, fill = new Color(183, 201, 227), stroke = Stroke.BLACK, cssClass = null) {
    super()
    this.type = type
    this.fill = fill
    this.stroke = stroke
    this.cssClass = cssClass
  }

  createVisual(context, node) {
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    // add the shape according to the type
    const path = getPath(this.type, node).createSvgPath()
    if (this.cssClass == null) {
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
    let decorationPath = null
    if (decoration) {
      decorationPath = decoration.createSvgPath()
      if (this.cssClass == null) {
        Stroke.setStroke(this.stroke, decorationPath, context)
        if (this.type === 'annotation') {
          Color.TRANSPARENT.applyTo(decorationPath, context)
        } else {
          Fill.setFill(this.fill, decorationPath, context)
        }
      }
      container.appendChild(decorationPath)
    }

    // apply the css settings
    if (this.cssClass != null) {
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
    const cache = {
      location: node.layout.topLeft,
      size: node.layout.toSize(),
      type: this.type,
      stroke: this.stroke,
      fill: this.fill,
      cssClass: this.cssClass
    }

    return SvgVisual.from(container, cache)
  }

  updateVisual(context, oldVisual, node) {
    const cache = oldVisual.tag
    const container = oldVisual.svgElement
    const path = container.firstElementChild
    const decoration = container.childElementCount === 2 ? container.lastElementChild : null

    if (cache.type !== this.type) {
      return this.createVisual(context, node)
    }

    // update shape and decoration if the position or size of the node has changed,
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
      if (this.cssClass == null) {
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
      if (this.cssClass == null) {
        Fill.setFill(this.fill, path, context)
        if (decoration) {
          Fill.setFill(this.fill, decoration, context)
        }
      }
      cache.fill = this.fill
    }

    // update stroke and fill if the css-class has changed
    if (cache.cssClass !== this.cssClass) {
      if (this.cssClass != null) {
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
          Color.TRANSPARENT.applyTo(decoration, context)
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
   * Returns the bounds of the shape's outline according to the type.
   */
  getBounds(context, node) {
    return getPath(this.type, node).getBounds()
  }

  /**
   * Returns the outline of the shape according to the type.
   */
  getOutline(node) {
    return getPath(this.type, node)
  }

  /**
   * Returns whether the given location lies within the shape according to the type.
   */
  isInside(node, location) {
    if (!node.layout.contains(location)) {
      return false
    }
    return getPath(this.type, node).areaContains(location)
  }

  /**
   * Returns whether the given location hits the shape according to the type.
   */
  isHit(context, location, node) {
    return (
      node.layout.toRect().contains(location, context.hitTestRadius) &&
      getPath(this.type, node).areaContains(location)
    )
  }
}

/**
 * Returns the outline of the shape according to the type
 */
function getPath(type, node) {
  const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1)
  switch (capitalizedType) {
    default:
    case 'Annotation':
      return renderAnnotationPath(node)
    case 'Card':
      return renderCardPath(node)
    case 'Cloud':
      return renderCloudPath(node)
    case 'Data':
      return renderDataPath(node)
    case 'Database':
      return renderDatabasePath(node)
    case 'Decision':
      return renderDecisionPath(node)
    case 'Delay':
      return renderDelayPath(node)
    case 'DirectData':
      return renderDirectDataPath(node)
    case 'Display':
      return renderDisplayPath(node)
    case 'Document':
      return renderDocumentPath(node)
    case 'InternalStorage':
      return renderInternalStoragePath(node)
    case 'LoopLimit':
      return renderLoopLimitPath(node)
    case 'LoopLimitEnd':
      return renderLoopLimitEndPath(node)
    case 'ManualInput':
      return renderManualInputPath(node)
    case 'ManualOperation':
      return renderManualOperationPath(node)
    case 'NetworkMessage':
      return renderNetworkMessagePath(node)
    case 'OffPageReference':
      return renderOffPageReferencePath(node)
    case 'OnPageReference':
      return renderOnPageReferencePath(node)
    case 'PaperType':
      return renderPaperTapePath(node)
    case 'PredefinedProcess':
      return renderPredefinedProcessPath(node)
    case 'Preparation':
      return renderPreparationPath(node)
    case 'Process':
      return renderProcessPath(node)
    case 'SequentialData':
      return renderSequentialDataPath(node)
    case 'Start1':
      return renderStart1Path(node)
    case 'Start2':
      return renderStart2Path(node)
    case 'StoredData':
      return renderStoredDataPath(node)
    case 'Terminator':
      return renderTerminatorPath(node)
    case 'UserMessage':
      return renderUserMessagePath(node)
  }
}

/**
 * Returns the decorations according to the type
 */
function getDecoration(type, node, context) {
  const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1)
  switch (capitalizedType) {
    default:
      return null
    case 'Annotation':
      return renderAnnotationDecoration(node, context)
    case 'Database':
      return renderDatabaseDecoration(node)
    case 'DirectData':
      return renderDirectDataDecoration(node)
    case 'InternalStorage':
      return renderInternalStorageDecoration(node)
    case 'PredefinedProcess':
      return renderPredefinedProcessDecoration(node)
    case 'SequentialData':
      return renderSequentialDataDecoration(node)
  }
}

function renderCardPath(node) {
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

function renderDataPath(node) {
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

function renderDatabasePath(node) {
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

function renderDatabaseDecoration(node) {
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

function renderDirectDataPath(node) {
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

function renderDirectDataDecoration(node) {
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

function renderCloudPath(node) {
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

function renderDecisionPath(node) {
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

function renderProcessPath(node) {
  const path = new GeneralPath()
  path.appendRectangle(node.layout, true)
  return path
}

function renderStart1Path(node) {
  const path = new GeneralPath()
  path.appendEllipse(node.layout, true)
  return path
}

function renderStart2Path(node) {
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

function renderTerminatorPath(node) {
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

function renderDocumentPath(node) {
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

function renderPredefinedProcessPath(node) {
  const path = new GeneralPath()
  path.appendRectangle(node.layout, true)
  return path
}

function renderPredefinedProcessDecoration(node) {
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

function renderStoredDataPath(node) {
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

function renderInternalStoragePath(node) {
  const path = new GeneralPath()
  path.appendRectangle(node.layout, true)
  return path
}

function renderInternalStorageDecoration(node) {
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

function renderSequentialDataPath(node) {
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

function renderSequentialDataDecoration(node) {
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

function renderManualInputPath(node) {
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

function renderPaperTapePath(node) {
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

function renderDelayPath(node) {
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

function renderDisplayPath(node) {
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

function renderManualOperationPath(node) {
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

function renderPreparationPath(node) {
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

function renderLoopLimitPath(node) {
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

function renderLoopLimitEndPath(node) {
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

function renderOnPageReferencePath(node) {
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

function renderOffPageReferencePath(node) {
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

function renderAnnotationPath(node) {
  const path = new GeneralPath()
  path.appendRectangle(node.layout, true)
  return path
}

function renderAnnotationDecoration(node, context) {
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

function createLeftBracket(x, y, width, height) {
  const path = new GeneralPath()
  path.moveTo(x + 0.125 * width, y)
  path.lineTo(x, y)
  path.lineTo(x, y + height)
  path.lineTo(x + 0.125 * width, y + height)
  return path
}

function createRightBracket(x, y, width, height) {
  const path = new GeneralPath()
  path.moveTo(x + 0.875 * width, y)
  path.lineTo(x + width, y)
  path.lineTo(x + width, y + height)
  path.lineTo(x + 0.875 * width, y + height)
  return path
}

function createTopBracket(x, y, width, height) {
  const path = new GeneralPath()
  path.moveTo(x, y + 0.125 * height)
  path.lineTo(x, y)
  path.lineTo(x + width, y)
  path.lineTo(x + width, y + 0.125 * height)
  return path
}

function createDownBracket(x, y, width, height) {
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
 *
 * - down
 * - right
 * - top
 * - left
 * @param node the node
 * @param context the render context
 */
function determineBracketOrientation(node, context) {
  const graph = context.canvasComponent.graph
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
function getIntersection(edge, node) {
  let bends
  let firstPort
  let secondPort
  if (edge.sourceNode === node) {
    firstPort = edge.sourcePort
    secondPort = edge.targetPort
    bends = edge.bends
  } else {
    firstPort = edge.targetPort
    secondPort = edge.sourcePort
    bends = edge.bends.toReversed()
  }

  let lastBend = firstPort.location
  let bend = null
  for (const b of bends) {
    bend = b.location.toPoint()

    if (!node.layout.contains(bend)) {
      break
    }

    lastBend = bend
  }

  return node.layout.toRect().findLineIntersection(lastBend, bend ? bend : secondPort.location)
}

function renderUserMessagePath(node) {
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

function renderNetworkMessagePath(node) {
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
