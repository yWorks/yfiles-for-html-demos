/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/* eslint-disable @typescript-eslint/prefer-regexp-exec */
import { Workarounds } from 'yfiles'

export function detectChromeVersion(): number {
  // Edge pretends to be every browser...
  const ieVersion = detectInternetExplorerVersion()
  if (ieVersion === -1) {
    if (typeof window === 'undefined' || typeof window.navigator === 'undefined') {
      return -1
    }
    const ua = window.navigator.userAgent
    const chrome = ua.match(new RegExp('Chrome\\/([0-9]+)', ''))
    if (chrome !== null) {
      return parseInt(chrome[1])
    }
  }
  return -1
}

/**
 * Returns version of Firefox.
 * @return {number} Version of Firefox or -1 if browser is not Firefox.
 */
export function detectFirefoxVersion(): number {
  if (typeof window === 'undefined' || typeof window.navigator === 'undefined') {
    return -1
  }
  const ua = window.navigator.userAgent
  const firefox = ua.match(new RegExp('Firefox\\/([0-9]+)', ''))
  if (firefox !== null) {
    return parseInt(firefox[1])
  }
  return -1
}

/**
 * Returns version of IE if browser is MS Internet Explorer.
 * Version of IE if browser is MS Internet Explorer/Edge or
 * -1 if browser is not InternetExplorer/Edge.
 */
export function detectInternetExplorerVersion(): number {
  // environments without window object
  if (typeof window === 'undefined' || typeof window.navigator === 'undefined') {
    return -1
  }

  const ua = window.navigator.userAgent
  const msie = ua.indexOf('MSIE ')
  if (msie > 0) {
    return parseInt(ua.substr(msie + 5, ua.indexOf('.', msie)), 10)
  }

  const trident = ua.indexOf('Trident/')
  if (trident > 0) {
    // IE 11 => return version number
    const rv = ua.indexOf('rv:')
    return parseInt(ua.substr(rv + 3, ua.indexOf('.', rv)), 10)
  }

  const edge = ua.indexOf('Edge/')
  if (edge > 0) {
    // IE 12 => return version number
    return parseInt(ua.substr(edge + 5, ua.indexOf('.', edge)), 10)
  }

  return -1
}

/**
 * Returns the windows NT version or -1 if it is lower than windows 95 or another OS.
 * See also https://stackoverflow.com/questions/228256/operating-system-from-user-agent-http-header
 * The windows NT version or the windows version for windows 98 or older:
 *
 *   - 95: Windows 95
 *   - 98: Windows 98
 *   - 4.0: Windows NT 4.0
 *   - 5.0: Windows 2000
 *   - 5.1: Windows XP
 *   - 5.2: Windows Server 2003
 *   - 6.0: Windows Vista
 *   - 6.1: Windows 7
 *   - 6.2: Windows 8
 *   - 10.0: Windows 10
 */
export function detectWindowsVersion(): number {
  // environments without window object
  if (typeof window === 'undefined' || typeof window.navigator === 'undefined') {
    return -1
  }

  const ua = window.navigator.userAgent
  // newer than windows 98
  const winNT = new RegExp('Windows NT (\\d*\\.\\d*)', '').exec(ua)
  if (winNT) {
    return parseFloat(winNT[1])
  }

  // alternative win xp
  if (ua.indexOf('Windows XP') > 0) {
    return 5.1
  }

  // alternative win 2000
  if (ua.indexOf('Windows 2000') > 0) {
    return 5.0
  }

  // windows 98
  if (ua.indexOf('Windows 98') > 0 || ua.indexOf('Win98') > 0) {
    return 98
  }

  // windows 95
  if (ua.indexOf('Windows 95') > 0 || ua.indexOf('Win95') > 0 || ua.indexOf('Windows_95') > 0) {
    return 95
  }

  return -1
}

/**
 * Returns whether this is an ARM device.
 * @return {boolean} true if ARM device, false otherwise
 */
export function detectArmDevice(): boolean {
  const ua = window.navigator.userAgent
  return !!/ARM;/.exec(ua)
}

/**
 * Returns the iOS version or -1 if it is another OS.
 * See also https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
 * The iOS version:
 *
 *   - 3: iOS 3 or less
 *   - 4: iOS 4
 *   - 5: iOS 5
 *   - 6: iOS 6
 *   - 7: iOS 7
 *   - 8: iOS 8 - 12, iOS 13 on non-Safari browsers
 *   - 13: iOS 13+
 *
 * NOTE: Since Safari for iOS 13, the user agent changed such that iOS and Mac OS X cannot be
 * distinguished anymore. The check still works on other browsers on iOS e.g. Chrome.
 * Therefore, there is another check for Safari 13+.
 */
export function detectiOSVersion(): number {
  const ua = window.navigator.userAgent

  // @ts-ignore
  if (window.MSStream) {
    // this is IE
    return -1
  }
  if (/iPad|iPhone|iPod/.test(ua)) {
    if (window.indexedDB) {
      return 8
    }
    if (window.SpeechSynthesisUtterance) {
      return 7
    }
    // @ts-ignore
    if (window.webkitAudioContext) {
      return 6
    }
    // @ts-ignore
    if (window.matchMedia) {
      return 5
    }
    if (window.history && 'pushState' in window.history) {
      return 4
    }
    return 3
  }
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
    // This works as long as there are no macOS devices with touch
    return 13
  }
  return -1
}

/**
 * Returns version of Safari.
 * @return {number} Version of Safari or -1 if browser is not Safari.
 */
export function detectSafariVersion(): number {
  const ua = window.navigator.userAgent
  const isSafari = ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1
  if (isSafari) {
    const safariVersionMatch = ua.match(new RegExp('Version\\/(\\d*\\.\\d*)', ''))
    if (safariVersionMatch && safariVersionMatch.length > 1) {
      return parseInt(safariVersionMatch[1])
    }
  }
  return -1
}

/**
 * Returns whether or not the browser supports active and passive event listeners. Feature Detection.
 */
function detectPassiveSupported(): boolean {
  let supported = false
  // noinspection EmptyCatchBlockJS
  try {
    const opts = Object.defineProperty({}, 'passive', {
      // eslint-disable-next-line
      get: () => {
        supported = true
      }
    })
    // @ts-ignore
    window.addEventListener('test', null, opts)
  } catch (ignored) {
    // eslint-disable-next-line
  }

  return supported
}

/**
 * Returns whether or not the browser supports native drag and drop events and custom dataTransfer types.
 */
function detectNativeDragAndDropSupported(): boolean {
  const div = document.createElement('div')
  const hasDndSupport = 'draggable' in div || ('ondragstart' in div && 'ondrop' in div)
  const ieVersion = detectInternetExplorerVersion()
  const hasCustomTypeSupport = ieVersion === -1 || ieVersion > 11
  return hasDndSupport && hasCustomTypeSupport
}

/**
 * Returns whether or not the browser supports the pointer-events CSS property.
 */
function detectPointerEventsSupported(): boolean {
  const testDiv = document.createElement('div')
  testDiv.style.cssText = 'pointer-events:auto'
  return testDiv.style.pointerEvents === 'auto'
}

/**
 * Returns whether or not the browser supports WebGL rendering.
 */
export function isWebGlSupported(): boolean {
  const canvas = document.createElement('canvas')
  return !!canvas.getContext('webgl') || !!canvas.getContext('experimental-webgl')
}

/**
 * Returns whether or not the browser supports WebGL2 rendering.
 */
export function isWebGl2Supported(): boolean {
  const canvas = document.createElement('canvas')
  return !!canvas.getContext('webgl2')
}

/**
 * Returns whether or not the browser supports modules for Web Workers.
 *
 * Note that this check creates an actual (but empty) Worker and thus is a bit more costly than
 * other checks.
 */
export function isModuleSupportedInWorker(): boolean {
  if (!window.Worker) {
    return false
  }
  let modulesSupported = false
  try {
    // The idea is to create a worker with a specific options object that reports whether its
    // properties are checked.
    // In this case, if the browser supports modules in workers, it checks the 'type' option and the
    // 'modulesSupported' variable becomes true.
    // Otherwise, the browser might throw an error.
    // The original idea for this check is from
    //   https://stackoverflow.com/questions/62954570/javascript-feature-detect-module-support-for-web-workers
    new Worker('data:', {
      get type(): 'module' {
        modulesSupported = true
        return 'module'
      }
    }).terminate()
  } catch (_) {
    modulesSupported = false
  }
  return modulesSupported
}

export function enableWorkarounds(): void {
  const internetExplorerVersion = detectInternetExplorerVersion()
  const windowsVersion = detectWindowsVersion()
  const iOSVersion = detectiOSVersion()

  // Enable support for labels with consecutive spaces in IE
  if (internetExplorerVersion !== -1) {
    Workarounds.ie964525 = true
  }

  // Fix uppercase attribute names in Edge
  if (internetExplorerVersion >= 12) {
    Workarounds.edge2057021 = true
  }

  // Fix broken hrefs in IE 11 on Windows 10 or on certain Windows 8 Surface devices
  if (
    internetExplorerVersion === 11 &&
    (windowsVersion === 10 || ((windowsVersion | 0) === 6 && detectArmDevice()))
  ) {
    Workarounds.ie2337112 = true
  }

  // Workaround for bogus mouse events on iOS 13, seems to be fixed in iOS 15
  if (iOSVersion !== -1) {
    Workarounds.wk203237 = 100
  }
}

/** States whether the browser supports passive event listeners */
export const passiveSupported = detectPassiveSupported()
/** States whether the browser supports native drag and drop events */
export const nativeDragAndDropSupported = detectNativeDragAndDropSupported()
/** States whether the browser supports the pointer-events CSS property */
export const pointerEventsSupported = detectPointerEventsSupported()
