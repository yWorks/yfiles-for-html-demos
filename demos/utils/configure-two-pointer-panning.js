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
import {
  GraphComponent,
  GraphEditorInputMode,
  MouseWheelBehaviors,
  MoveViewportInputMode,
  Size,
  TouchEventRecognizers
} from 'yfiles'
import { BrowserDetection } from './BrowserDetection.js'

/**
 * Configures two-finger panning on the given input mode by disabling
 * {@link MoveViewportInputMode.allowSinglePointerMovement} and additionally re-configures
 * gestures to immediately act upon touch-down instead of waiting for a long-press.
 * @param {!GraphComponent} graphComponent
 */
export function configureTwoPointerPanning(graphComponent) {
  const inputMode = graphComponent.inputMode
  if (inputMode instanceof GraphEditorInputMode) {
    // disable single pointer movement to allow other gestures to start on a simple single press
    inputMode.moveViewportInputMode.allowSinglePointerMovement = false
    // set gestures to an immediate touch-down recognizer instead of the long-press recognizer
    inputMode.moveInputMode.pressedRecognizerTouch = TouchEventRecognizers.TOUCH_DOWN_PRIMARY
    inputMode.createEdgeInputMode.prepareRecognizerTouch = TouchEventRecognizers.TOUCH_DOWN_PRIMARY
    inputMode.createBendInputMode.prepareRecognizerTouch = TouchEventRecognizers.TOUCH_DOWN_PRIMARY
    inputMode.handleInputMode.pressedRecognizerTouch = TouchEventRecognizers.TOUCH_DOWN_PRIMARY
    inputMode.marqueeSelectionInputMode.pressedRecognizerTouch =
      TouchEventRecognizers.TOUCH_DOWN_PRIMARY
    inputMode.moveUnselectedInputMode.pressedRecognizerTouch =
      TouchEventRecognizers.TOUCH_DOWN_PRIMARY
    inputMode.moveLabelInputMode.pressedRecognizerTouch = TouchEventRecognizers.TOUCH_DOWN_PRIMARY
  }

  // prevent accidental start of edit gesture for now immediate touchdown gestures
  graphComponent.dragSizeTouch = new Size(40, 40)

  // iOS fires bogus mousewheel events during pinch zooming, so disable mousewheel behavior while
  // two pointers are pressed.
  if (BrowserDetection.iOSVersion > 0) {
    let previousWheelBehavior = null
    graphComponent.addTouchDownListener((_, evt) => {
      if (!evt.device.isPrimaryDevice) {
        // a second pointer is down, disable wheel behavior
        previousWheelBehavior = graphComponent.mouseWheelBehavior
        graphComponent.mouseWheelBehavior = MouseWheelBehaviors.NONE
      }
    })

    const resetWheelBehavior = () => {
      if (previousWheelBehavior !== null) {
        graphComponent.mouseWheelBehavior = previousWheelBehavior
        previousWheelBehavior = null
      }
    }
    // reset mousewheel behavior in case the application is used with touch and mouse interaction
    graphComponent.addTouchUpListener(resetWheelBehavior)
    graphComponent.addTouchLeaveListener(resetWheelBehavior)
    graphComponent.addTouchLostCaptureListener(resetWheelBehavior)
  }
}
