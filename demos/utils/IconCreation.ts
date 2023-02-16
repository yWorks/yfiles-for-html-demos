/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import type { Size } from 'yfiles'

/**
 * Creates an {@link ImageData} icon from a given url.
 * @param ctx The canvas context in which to render the icon.
 * @param url The image url.
 * @param imageSize The render size of the source image.
 * @param iconSize The size of the created ImageData. If not specified, the size will be the one of
 *   the context's canvas.
 */
export function createUrlIcon(
  ctx: CanvasRenderingContext2D,
  url: string,
  imageSize: Size,
  iconSize: Size | null = null
): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const iconWidth = iconSize?.width || ctx.canvas.width
    const iconHeight = iconSize?.height || ctx.canvas.height
    // create an Image from the url
    const image = new Image(imageSize.width, imageSize.height)
    image.onload = () => {
      // render the image into the canvas
      ctx.clearRect(0, 0, iconWidth, iconHeight)
      ctx.drawImage(image, 0, 0, imageSize.width, imageSize.height, 0, 0, iconWidth, iconHeight)
      const imageData = ctx.getImageData(0, 0, iconWidth, iconHeight)
      resolve(imageData)
    }
    image.onerror = () => {
      reject('Loading the image failed.')
    }
    image.src = url
  })
}

/**
 * Creates an {@link ImageData} icon from a given Font Awesome class.
 * @param ctx The canvas context in which to render the icon.
 * @param fontAwesomeCssClass The name of the Font Awesome icon.
 * @param iconSize The size of the created ImageData. If not specified, the size will be the one of
 *   the context's canvas.
 */
export function createFontAwesomeIcon(
  ctx: CanvasRenderingContext2D,
  fontAwesomeCssClass: string,
  iconSize: Size | null = null
): ImageData {
  const faHelperElement = getHelperElement()
  // assign the Font Awesome class
  faHelperElement.setAttribute('class', fontAwesomeCssClass)

  // get the computed style to read the font-family, font-weight and text
  const computedStyle = window.getComputedStyle(faHelperElement)
  const beforeComputedStyle = window.getComputedStyle(faHelperElement, ':before')
  const fontFamily = computedStyle.getPropertyValue('font-family')
  const fontWeight = computedStyle.getPropertyValue('font-weight')
  const propertyValue = beforeComputedStyle.getPropertyValue('content')
  // in some browsers, the character is enclosed by quotes
  const text = propertyValue[1] ?? propertyValue[0]

  const iconWidth = iconSize?.width || ctx.canvas.width
  const iconHeight = iconSize?.height || ctx.canvas.height

  // render the text into the canvas
  ctx.clearRect(0, 0, iconWidth, iconHeight)
  ctx.font = `${fontWeight} 100px ${fontFamily}`
  ctx.fillStyle = 'white'
  ctx.textBaseline = 'top'
  ctx.textAlign = 'center'
  ctx.fillText(text, 64, 14)

  return ctx.getImageData(0, 0, iconWidth, iconHeight)
}

/**
 * Gets or creates an <i> element that is used to pre-render the font awesome icon.
 */
function getHelperElement(): HTMLElement {
  const faHelperElement = document.getElementById('fa-helper')
  if (faHelperElement != null) {
    return faHelperElement
  }
  const newElement = document.createElement('i')
  newElement.setAttribute('id', 'fa-helper')
  newElement.setAttribute('style', 'width: 0; height: 0; visibility: hidden')
  document.body.appendChild(newElement)
  return newElement
}

/**
 * Creates a rendering context intended for creating the {@link ImageData} with the createXyzIcon
 * functions of this file.
 * The context has its willReadFrequently attribute set to true.
 */
export function createCanvasContext(width: number, height: number): CanvasRenderingContext2D {
  // canvas used to pre-render the icons
  const canvas = document.createElement('canvas')
  canvas.setAttribute('width', `${width}`)
  canvas.setAttribute('height', `${height}`)
  return canvas.getContext('2d', {
    willReadFrequently: true
  }) as CanvasRenderingContext2D
}
