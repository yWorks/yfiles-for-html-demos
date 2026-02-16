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
import { IBoundsProvider, Insets, Rect, TimeSpan } from '@yfiles/yfiles'

/**
 * Highlights the given items for the given duration.
 * @param gc The GraphComponent instance to highlight items in.
 * @param items The collection of model items to highlight.
 * @param duration The duration for which the items should remain highlighted.
 * @param signal An optional signal that can be used to abort the highlighting.
 * @internal
 */
export async function highlightItems(gc, items, duration, signal) {
  if (!gc) {
    return delay(duration, signal)
  }

  const manager = gc.highlightIndicatorManager
  if (!manager) {
    return delay(duration, signal)
  }

  const highlightItems = manager.items

  const prevSet = new Set()
  for (const it of Array.from(highlightItems)) {
    prevSet.add(it)
  }

  const newlyAdded = []

  if (signal?.aborted) {
    return
  }
  const bounds = getItemsBounds(gc, items)
  if (bounds && !signal?.aborted) {
    await gc.ensureVisible({ bounds: bounds.getEnlarged(new Insets(20)) })
  }

  items.forEach((item) => {
    if (!prevSet.has(item)) {
      highlightItems.add(item)
      newlyAdded.push(item)
    }
  })

  await delay(duration, signal)
  for (const item of newlyAdded) {
    try {
      highlightItems.remove(item)
    } catch {}
  }
}

/**
 * Returns the bounds of the given items.
 * @param gc The GraphComponent instance containing the items.
 * @param items The collection of model items to calculate bounds for.
 */
function getItemsBounds(gc, items) {
  if (!gc) return null
  const context = gc.createRenderContext()

  let union = null
  for (const item of Array.from(items)) {
    const bp = item.lookup(IBoundsProvider)
    if (!bp) {
      continue
    }
    const r = bp.getBounds(context)
    if (!r || r.isEmpty) {
      continue
    }
    union = union ? Rect.add(union, r) : r
  }
  return union
}

/**
 * Introduces a delay for the specified duration.
 * @param duration The delay duration in milliseconds. Values less than 0 will be treated as 0.
 * @param signal An optional signal that can be used to abort the delay.
 * @returns A promise that resolves after the specified delay duration has elapsed.
 * @internal
 */
export function delay(duration, signal) {
  const ms = Math.max(0, TimeSpan.from(duration).totalMilliseconds | 0)
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve()
      return
    }
    const timer = setTimeout(() => {
      cleanup()
      resolve()
    }, ms)
    const onAbort = () => {
      cleanup()
      resolve()
    }
    const cleanup = () => {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

/**
 * Shows the given message or HTML content for the given duration.
 * @param content The message content to display, either as a string or HTMLElement.
 * @param duration The duration to display the message.
 * @param container The HTML element that will contain the message. If not provided, only delays for the duration.
 * @param signal An optional signal that can be used to abort the showing of the message.
 * @internal
 */
export async function show(content, duration, container, signal) {
  if (signal?.aborted) {
    return
  }
  if (!container) {
    await delay(duration, signal)
    return
  }

  const visibleClass = 'yplay__message--visible'
  const msg = createMessageDialog(content, container, visibleClass)

  await delay(duration, signal)

  if (signal?.aborted) {
    // Remove immediately on abort without waiting for transition
    msg.remove()
    return
  }

  await new Promise((resolve) => {
    msg.classList.remove(visibleClass)
    const done = () => {
      msg.removeEventListener('transitionend', done)
      signal?.removeEventListener('abort', done)
      resolve()
    }
    msg.addEventListener('transitionend', done)
    setTimeout(done, 300)
    signal?.addEventListener('abort', () => {
      done()
    })
  })

  msg.remove()
}

/**
 * Creates and returns a message dialog element.
 * @param content The message content to display, either as a string or HTMLElement.
 * @param container The HTML element that will contain the message.
 * @param visibleClass The CSS class used for showing/hiding the dialog.
 * @returns HTMLDivElement The created message dialog element.
 */
function createMessageDialog(content, container, visibleClass) {
  const msg = document.createElement('div')
  msg.className = 'yplay__message'

  const topDiv = document.createElement('div')
  topDiv.style.height = '5px'

  const closeButton = document.createElement('button')
  closeButton.innerHTML = '×'
  closeButton.className = 'yplay__message--close-button'
  closeButton.setAttribute('aria-label', 'Close message')
  topDiv.appendChild(closeButton)

  const contentDiv = document.createElement('div')
  contentDiv.style.padding = '0 10px'
  if (typeof content === 'string') {
    contentDiv.innerText = content
  } else {
    contentDiv.appendChild(content)
  }
  msg.appendChild(topDiv)
  msg.appendChild(contentDiv)

  container.appendChild(msg)
  closeButton.addEventListener('click', () => {
    msg.classList.remove(visibleClass)
    setTimeout(() => msg.remove(), 300)
  })

  requestAnimationFrame(() => {
    msg.classList.add(visibleClass)
  })
  return msg
}
