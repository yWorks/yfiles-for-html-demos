/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
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
import { colorSets } from 'demo-resources/demo-styles'
import {
  FocusIndicatorManager,
  GraphModelManager,
  HighlightIndicatorManager,
  SelectionIndicatorManager,
  Size,
  WebGL2FocusIndicatorManager,
  WebGL2GraphModelManager,
  WebGL2HighlightIndicatorManager,
  WebGL2IconNodeStyle,
  WebGL2SelectionIndicatorManager,
  WebGL2ShapeNodeStyle
} from 'yfiles'
import { BrowserDetection } from 'demo-utils/BrowserDetection'
import { createCanvasContext, createUrlIcon } from 'demo-utils/IconCreation'

/**
 * Wires up the button which toggles the webgl rendering.
 * @param {!GraphComponent} graphComponent the current graph component
 * @param addSeparator whether to add a separator span before the button
 * @param {boolean} [addSeparator=true]
 */
export function initializeToggleWebGl2RenderingButton(graphComponent, addSeparator = true) {
  const container = document.querySelector('.demo-page__toolbar')

  if (addSeparator) {
    const separator = document.createElement('span')
    separator.classList.add('demo-separator')
    container.appendChild(separator)
  }

  const toggleButton = document.createElement('input')
  toggleButton.id = 'toggle-webgl2-mode'
  toggleButton.type = 'checkbox'
  toggleButton.classList.add('demo-toggle-button', 'labeled')
  toggleButton.disabled = true
  toggleButton.addEventListener('change', (evt) => {
    if (evt.target.checked) {
      useWebGL2Rendering(graphComponent)
    } else {
      graphComponent.graphModelManager = new GraphModelManager(
        graphComponent,
        graphComponent.contentGroup
      )
      graphComponent.selectionIndicatorManager = new SelectionIndicatorManager()
      graphComponent.highlightIndicatorManager = new HighlightIndicatorManager()
      graphComponent.focusIndicatorManager = new FocusIndicatorManager()
    }
  })
  container.appendChild(toggleButton)

  const toggleButtonLabel = document.createElement('label')
  toggleButtonLabel.htmlFor = 'toggle-webgl2-mode'
  toggleButtonLabel.title = 'Toggles WebGL2 rendering mode'
  toggleButtonLabel.textContent = 'WebGL2 Rendering'
  container.appendChild(toggleButtonLabel)

  // Start the async ImageData creation. Once finished, this will enable the WebGL2 mode button.
  void createIconImageData()
}

/**
 * A map which provides image data to add for webgl rendering.
 */
const imageData = {}

/**
 * Creates the ImageData for each icon used in this demo.
 * Since creating ImageData for an image URL can only be done asynchronous, this is done in advance.
 * Once finished, this will enable the WebGL2 mode button of this demo.
 * @returns {!Promise}
 */
export async function createIconImageData() {
  if (!BrowserDetection.webGL2) {
    // this is only needed for WebGL2 rendering mode
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

  // Now the ImageData is ready, and we can allow the user to switch to WebGL2 rendering mode
  document.querySelector('#toggle-webgl2-mode').removeAttribute('disabled')
}

/**
 * Enables webgl rendering and prepares the icons for the node styles.
 * @param {!GraphComponent} graphComponent
 */
export function useWebGL2Rendering(graphComponent) {
  if (!BrowserDetection.webGL2) {
    // this is only needed for WebGL2 rendering mode
    return
  }

  const webGL2GraphModelManager = new WebGL2GraphModelManager()
  graphComponent.graphModelManager = webGL2GraphModelManager
  graphComponent.selectionIndicatorManager = new WebGL2SelectionIndicatorManager()
  graphComponent.highlightIndicatorManager = new WebGL2HighlightIndicatorManager()
  graphComponent.focusIndicatorManager = new WebGL2FocusIndicatorManager()

  // Set explicit WebGL2 styles for nodes that don't get a suitable style by the auto-conversion
  // from the SVG style
  for (const node of graphComponent.graph.nodes) {
    if (node.tag != null) {
      const tag = node.tag
      if (tag.type != null) {
        webGL2GraphModelManager.setStyle(
          node,
          new WebGL2IconNodeStyle({
            icon: imageData[tag.type] ?? imageData['workstation'],
            fill: 'transparent',
            stroke: 'none',
            preserveAspectRatio: true
          })
        )
      } else if (tag.css != null) {
        const colorSet = colorSets[tag.css.replace('-node', '')]
        webGL2GraphModelManager.setStyle(
          node,
          new WebGL2ShapeNodeStyle({
            shape: 'rectangle',
            fill: colorSet.fill,
            stroke: `1px ${colorSet.stroke}`
          })
        )
      }
    }
  }
}
