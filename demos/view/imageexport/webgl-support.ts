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
import { type ColorSetName, colorSets } from '@yfiles/demo-resources/demo-styles'
import {
  FocusIndicatorManager,
  type GraphComponent,
  GraphModelManager,
  HighlightIndicatorManager,
  SelectionIndicatorManager,
  Size,
  WebGLFocusIndicatorManager,
  WebGLGraphModelManager,
  WebGLHighlightIndicatorManager,
  WebGLImageNodeStyle,
  WebGLSelectionIndicatorManager,
  WebGLShapeNodeStyle
} from '@yfiles/yfiles'
import { BrowserDetection } from '@yfiles/demo-utils/BrowserDetection'
import { createCanvasContext, createUrlIcon } from '@yfiles/demo-utils/IconCreation'
import type { Tag } from './samples'

/**
 * Wires up the button which toggles the webgl rendering.
 * @param graphComponent the current graph component
 * @param addSeparator whether to add a separator span before the button
 */
export function initializeToggleWebGlRenderingButton(
  graphComponent: GraphComponent,
  addSeparator = true
): void {
  const container = document.querySelector<HTMLDivElement>('.demo-page__toolbar')!

  if (addSeparator) {
    const separator = document.createElement('span')
    separator.classList.add('demo-separator')
    container.appendChild(separator)
  }

  const toggleButton = document.createElement('input')
  toggleButton.id = 'toggle-webgl-mode'
  toggleButton.type = 'checkbox'
  toggleButton.classList.add('demo-toggle-button', 'labeled')
  toggleButton.disabled = true
  toggleButton.addEventListener('change', (evt) => {
    if ((evt.target as HTMLInputElement).checked) {
      useWebGLRendering(graphComponent)
    } else {
      graphComponent.graphModelManager = new GraphModelManager()
      graphComponent.selectionIndicatorManager = new SelectionIndicatorManager()
      graphComponent.highlightIndicatorManager = new HighlightIndicatorManager()
      graphComponent.focusIndicatorManager = new FocusIndicatorManager()
    }
  })
  container.appendChild(toggleButton)

  const toggleButtonLabel = document.createElement('label')
  toggleButtonLabel.htmlFor = 'toggle-webgl-mode'
  toggleButtonLabel.title = 'Toggles WebGL rendering mode'
  toggleButtonLabel.textContent = 'WebGL Rendering'
  container.appendChild(toggleButtonLabel)

  // Start the async ImageData creation. Once finished, this will enable the WebGL mode button.
  void createIconImageData()
}

/**
 * A map which provides image data to add for webgl rendering.
 */
const imageData: Record<string, ImageData | undefined> = {}

/**
 * Creates the ImageData for each icon used in this demo.
 * Since creating ImageData for an image URL can only be done asynchronous, this is done in advance.
 * Once finished, this will enable the WebGL mode button of this demo.
 */
export async function createIconImageData(): Promise<void> {
  if (!BrowserDetection.webGL2) {
    // this is only needed for WebGL rendering mode
    return
  }

  const deviceNames = ['switch', 'workstation']
  const svgSize = new Size(70, 70)
  const ctx = createCanvasContext(128, 128)
  const imageDataArray = await Promise.all(
    deviceNames.map((device) => createUrlIcon(ctx, `./resources/${device}.svg`, svgSize))
  )

  for (let i = 0; i < deviceNames.length; i++) {
    imageData[deviceNames[i]] = imageDataArray[i]
  }

  // Now the ImageData is ready, and we can allow the user to switch to WebGL rendering mode
  document.querySelector<HTMLInputElement>('#toggle-webgl-mode')!.removeAttribute('disabled')
}

/**
 * Enables webgl rendering and prepares the icons for the node styles.
 */
export function useWebGLRendering(graphComponent: GraphComponent): void {
  if (!BrowserDetection.webGL2) {
    // this is only needed for WebGL rendering mode
    return
  }

  graphComponent.graphModelManager = new WebGLGraphModelManager()
  graphComponent.selectionIndicatorManager = new WebGLSelectionIndicatorManager()
  graphComponent.highlightIndicatorManager = new WebGLHighlightIndicatorManager()
  graphComponent.focusIndicatorManager = new WebGLFocusIndicatorManager()

  const graph = graphComponent.graph

  // Set explicit WebGL styles for nodes that don't get a suitable style by the auto-conversion
  // from the SVG style
  for (const node of graph.nodes) {
    if (node.tag != null) {
      const tag = node.tag as Tag
      if (tag.type != null) {
        graph.setStyle(
          node,
          new WebGLImageNodeStyle({
            image: imageData[tag.type!] ?? imageData['workstation']!,
            backgroundFill: 'transparent',
            backgroundStroke: 'none',
            preserveAspectRatio: true
          })
        )
      } else if (tag.css != null) {
        const colorSet = colorSets[tag.css.replace('-node', '') as ColorSetName]
        graph.setStyle(
          node,
          new WebGLShapeNodeStyle({
            shape: 'rectangle',
            fill: colorSet.fill,
            stroke: `1px ${colorSet.stroke}`
          })
        )
      }
    }
  }
}
