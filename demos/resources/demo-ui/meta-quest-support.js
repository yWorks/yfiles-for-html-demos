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
import { BrowserDetection } from './BrowserDetection'

/**
 * The Meta Quest browser fires mouse PointerEvents when moving the pointer in the browser but uses
 * touch PointerEvents for interaction with UI elements.
 *
 * This combination of mouse and touch events is problematic for the GraphComponent, so this
 * function registers listeners to block mouse events within the GraphComponent's container for
 * the Meta Quest browser.
 *
 * @yjs:keep=pointerType
 */
export function enableMetaQuestSupport({ htmlElement: gcElement }) {
  if (!BrowserDetection.isMetaQuestBrowser) {
    return
  }

  let stopMouseEvent = false
  const eventTypes = [
    'pointerdown',
    'pointermove',
    'pointerup',
    'pointerenter',
    'pointerleave',
    'pointercancel'
  ]
  eventTypes.forEach((eventType) => {
    // mouse events need to be blocked on document level to support drag-drop into the GraphComponent
    document.addEventListener(
      eventType,
      (event) => {
        if (stopMouseEvent && event.pointerType === 'mouse') {
          event.stopImmediatePropagation()
        }
      },
      true
    )
  })

  function registerFilterMouseEvents({ target, pointerType }) {
    if (target === gcElement && pointerType === 'mouse') {
      stopMouseEvent = true
    }
  }

  function deregisterFilterMouseEvents({ target, pointerType }) {
    if (target === gcElement && pointerType === 'mouse') {
      stopMouseEvent = false
    }
  }

  gcElement.addEventListener('pointerenter', registerFilterMouseEvents)
  gcElement.addEventListener('pointerleave', deregisterFilterMouseEvents)
  gcElement.addEventListener('pointercancel', deregisterFilterMouseEvents)
}
