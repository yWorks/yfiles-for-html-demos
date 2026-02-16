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
  type GraphComponent,
  type GraphEditorInputMode,
  type IModelItem,
  Point
} from '@yfiles/yfiles'

const innerRadius = 30
const outerRadius = 100
const spacing = 2
const titleOffset = 15

export type MenuItem = {
  callback: (location: Point, item: IModelItem) => void
  icon: string
  title: string
  disabled: boolean
  element: SVGElement | null
}

export function createDialContextMenu(
  items: MenuItem[],
  location: Point,
  graphComponent: GraphComponent,
  graphItem?: IModelItem
): HTMLElement {
  const n = items.length
  const pi2 = Math.PI * 2

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

  // temporarily add the svg to the body so the elements can be measured
  const tempParent = document.body
  tempParent.appendChild(svg)

  svg.addEventListener('contextmenu', (e) => e.preventDefault())
  svg.setAttribute('class', 'demo-dial-menu')
  svg.setAttribute('width', `${outerRadius}`)
  svg.setAttribute('height', `${outerRadius}`)
  svg.style.width = `${outerRadius}px`
  svg.style.height = `${outerRadius}px`
  svg.setAttribute('viewBox', `0 0 ${outerRadius} ${outerRadius}`)
  svg.style.position = 'absolute'
  svg.style.overflow = 'visible'
  svg.style.zIndex = '999999'

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
  svg.appendChild(g)
  svg.appendChild(defs)

  const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath')
  clipPath.setAttribute('id', 'dial-menu-clip')
  defs.appendChild(clipPath)

  // create the svg elements for each item
  items.forEach((item, i) => {
    const itemContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    itemContainer.setAttribute(
      'class',
      item.disabled ? 'demo-dial-menu-item disabled' : 'demo-dial-menu-item'
    )

    g.appendChild(itemContainer)

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    itemContainer.appendChild(path)

    let middleAngle = Math.PI

    if (items.length === 1) {
      // full-circle menu has to be treated differently
      const d = `M 0 ${innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 0 ${-innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 0 ${innerRadius}
       M 0 ${outerRadius} A ${outerRadius} ${outerRadius} 0 1 0 0 ${-outerRadius} A ${outerRadius} ${outerRadius} 0 1 0 0 ${outerRadius}`
      path.setAttribute('d', d)
      path.setAttribute('fill-rule', 'evenodd')
    } else {
      const leftAngle = (i * pi2) / n
      const rightAngle = (i * pi2) / n + pi2 / n
      middleAngle = (leftAngle + rightAngle) * 0.5

      const innerLeftPoint = new Point(
        Math.sin(leftAngle) * innerRadius,
        -Math.cos(leftAngle) * innerRadius
      )
      const outerLeftPoint = new Point(
        Math.sin(leftAngle) * outerRadius,
        -Math.cos(leftAngle) * outerRadius
      )
      const innerRightPoint = new Point(
        Math.sin(rightAngle) * innerRadius,
        -Math.cos(rightAngle) * innerRadius
      )
      const outerRightPoint = new Point(
        Math.sin(rightAngle) * outerRadius,
        -Math.cos(rightAngle) * outerRadius
      )

      const d = `M ${innerLeftPoint.x} ${innerLeftPoint.y} L ${outerLeftPoint.x} ${outerLeftPoint.y} A ${outerRadius} ${outerRadius} 0 0 1 ${outerRightPoint.x} ${outerRightPoint.y} L ${innerRightPoint.x} ${innerRightPoint.y} A ${innerRadius} ${innerRadius} 0 0 0 ${innerLeftPoint.x} ${innerLeftPoint.y}`
      path.setAttribute('d', d)
      path.setAttribute('clip-path', 'url(#dial-menu-clip)')

      // create path clip
      const clipElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')

      const leftVector = outerLeftPoint.subtract(innerLeftPoint)
      const leftVectorOrthogonalNormalized = new Point(-leftVector.y, leftVector.x).normalized
      const rightVector = outerRightPoint.subtract(innerRightPoint)
      const rightVectorOrthogonalNormalized = new Point(rightVector.y, -rightVector.x).normalized
      const bottomLeft = innerLeftPoint.add(leftVectorOrthogonalNormalized.multiply(spacing))
      const bottomRight = innerRightPoint.add(rightVectorOrthogonalNormalized.multiply(spacing))
      const topRight = bottomRight.add(rightVector)
      const topLeft = bottomLeft.add(leftVector)
      const clipD = `M ${bottomLeft.x} ${bottomLeft.y} L ${bottomRight.x} ${bottomRight.y} L ${topRight.x} ${topRight.y} A ${outerRadius} ${outerRadius} 0 0 0 ${topLeft.x} ${topLeft.y} Z`
      clipElement.setAttribute('d', clipD)
      clipElement.setAttribute('fill', 'none')
      clipPath.appendChild(clipElement)
    }

    if (item.icon) {
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'image')
      icon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', item.icon)
      icon.setAttribute('width', '32')
      icon.setAttribute('height', '32')
      const position = (outerRadius + innerRadius) / 2
      icon.setAttribute(
        'transform',
        `translate(${-16 + Math.sin(middleAngle) * position}, ${
          -16 - Math.cos(middleAngle) * position
        })`
      )
      icon.setAttribute('class', 'demo-dial-icon')
      itemContainer.appendChild(icon)
    }

    if (item.title) {
      const textContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      textContainer.setAttribute('class', 'demo-dial-title')
      itemContainer.appendChild(textContainer)

      const padding = 5

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.innerHTML = item.title
      text.setAttribute('transform', `translate(${padding} ${padding})`)
      text.setAttribute('dy', '1em')
      textContainer.appendChild(text)

      const titleBounds = text.getBBox()
      const w = titleBounds.width + padding + padding
      const h = titleBounds.height + padding + padding

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('width', `${w}`)
      rect.setAttribute('height', `${h}`)
      textContainer.insertBefore(rect, text)

      let textLocation = new Point(
        Math.sin(middleAngle) * (outerRadius + titleOffset),
        -(Math.cos(middleAngle) * (outerRadius + titleOffset)) - h * 0.5
      )

      const eps = Math.PI / 180
      if (
        (middleAngle > Math.PI - eps && middleAngle < Math.PI + eps) ||
        middleAngle > 2 * Math.PI - eps ||
        middleAngle < eps
      ) {
        textLocation = new Point(textLocation.x - w * 0.5, textLocation.y)
      } else if (middleAngle > Math.PI) {
        textLocation = new Point(textLocation.x - w, textLocation.y)
      }

      textContainer.setAttribute('transform', `translate(${textLocation.x} ${textLocation.y})`)
    }

    if (!item.disabled && typeof item.callback === 'function') {
      itemContainer.addEventListener('click', (_) => {
        item.callback(location, graphItem!)
        ;(graphComponent.inputMode as GraphEditorInputMode).contextMenuInputMode.closeMenu()
      })
      itemContainer.addEventListener('touch', (_) => {
        item.callback(location, graphItem!)
        ;(graphComponent.inputMode as GraphEditorInputMode).contextMenuInputMode.closeMenu()
      })
    }

    item.element = itemContainer
  })

  tempParent.removeChild(svg)

  const container = document.createElement('div')
  container.setAttribute('transform', `translate(${location.x} ${location.y})`)
  container.appendChild(svg)

  return container
}
