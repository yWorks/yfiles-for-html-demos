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
import { Workarounds } from 'yfiles'

/**
 * @returns {number}
 */
export function detectChromeVersion() {
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
 * @returns {number} {number} Version of Firefox or -1 if browser is not Firefox.
 */
export function detectFirefoxVersion() {
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
 * @returns {number}
 */
export function detectInternetExplorerVersion() {
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
 * <ul>
 *   <li>95: Windows 95</li>
 *   <li>98: Windows 98</li>
 *   <li>4.0: Windows NT 4.0</li>
 *   <li>5.0: Windows 2000</li>
 *   <li>5.1: Windows XP</li>
 *   <li>5.2: Windows Server 2003</li>
 *   <li>6.0: Windows Vista</li>
 *   <li>6.1: Windows 7</li>
 *   <li>6.2: Windows 8</li>
 *   <li>10.0: Windows 10</li>
 * </ul>
 * @returns {number}
 */
export function detectWindowsVersion() {
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
 * @returns {boolean} {boolean} true if ARM device, false otherwise
 */
export function detectArmDevice() {
  const ua = window.navigator.userAgent
  return !!/ARM;/.exec(ua)
}

/**
 * Returns the iOS version or -1 if it is another OS.
 * See also https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
 * The iOS version:
 * <ul>
 *   <li>3: iOS 3 or less</li>
 *   <li>4: iOS 4</li>
 *   <li>5: iOS 5</li>
 *   <li>6: iOS 6</li>
 *   <li>7: iOS 7</li>
 *   <li>8: iOS 8 - 12, iOS 13 on non-Safari browsers</li>
 *   <li>13: iOS 13+</li>
 * </ul>
 * NOTE: Since Safari for iOS 13, the user agent changed such that iOS and Mac OS X cannot be
 * distinguished anymore. The check still works on other browsers on iOS e.g. Chrome.
 * Therefore, there is another check for Safari 13+.
 * @returns {number}
 */
export function detectiOSVersion() {
  const ua = window.navigator.userAgent

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
    if (window.webkitAudioContext) {
      return 6
    }
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
 * @returns {number} {number} Version of Safari or -1 if browser is not Safari.
 */
export function detectSafariVersion() {
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
 * Returns true for browsers that use the Safari 11 Webkit engine.
 *
 * In detail, these are Safari 11 on either macOS or iOS, Chrome on iOS 11, and Firefox on iOS 11.
 * @returns {boolean}
 */
export function detectSafari11Webkit() {
  return (
    detectSafariVersion() === 11 || !!/OS\s+11_.*(CriOS|FxiOS)/.exec(window.navigator.userAgent)
  )
}

/**
 * Returns whether or not the browser supports active and passive event listeners. Feature Detection.
 * @returns {boolean}
 */
function detectPassiveSupported() {
  let supported = false
  // noinspection EmptyCatchBlockJS
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: () => {
        supported = true
      }
    })
    window.addEventListener('test', null, opts)
  } catch (ignored) {
    // eslint-disable-next-line
  }

  return supported
}

/**
 * Returns whether or not the browser supports native drag and drop events and custom dataTransfer types.
 * @returns {boolean}
 */
function detectNativeDragAndDropSupported() {
  const div = document.createElement('div')
  const hasDndSupport = 'draggable' in div || ('ondragstart' in div && 'ondrop' in div)
  const ieVersion = detectInternetExplorerVersion()
  const hasCustomTypeSupport = ieVersion === -1 || ieVersion > 11
  return hasDndSupport && hasCustomTypeSupport
}

/**
 * Returns whether or not the browser supports the pointer-events CSS property.
 * @returns {boolean}
 */
function detectPointerEventsSupported() {
  const testDiv = document.createElement('div')
  testDiv.style.cssText = 'pointer-events:auto'
  return testDiv.style.pointerEvents === 'auto'
}

/**
 * Returns whether or not the browser supports WebGL rendering.
 * @returns {boolean}
 */
export function isWebGlSupported() {
  const canvas = document.createElement('canvas')
  return !!canvas.getContext('webgl') || !!canvas.getContext('experimental-webgl')
}

/**
 * Returns whether or not the browser supports WebGL2 rendering.
 * @returns {boolean}
 */
export function isWebGl2Supported() {
  const canvas = document.createElement('canvas')
  return !!canvas.getContext('webgl2')
}

export function enableWorkarounds() {
  const internetExplorerVersion = detectInternetExplorerVersion()
  const chromeVersion = detectChromeVersion()
  const windowsVersion = detectWindowsVersion()
  const firefoxVersion = detectFirefoxVersion()
  const iOSVersion = detectiOSVersion()

  // Enable support for labels with consecutive spaces in IE
  if (internetExplorerVersion !== -1) {
    Workarounds.ie964525 = true
  }
  // The following workaround addresses two issues
  // 1) Firefox is very slow when SVG matrices are modified directly:
  //    https://bugzilla.mozilla.org/show_bug.cgi?id=1419764
  // 2) A transform caching regression in Safari 11 and all WebKit browsers on iOS 11.
  if (firefoxVersion !== -1 || detectSafari11Webkit()) {
    Workarounds.cr320635 = true
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
  // Fix SVG transform issue in Chrome 57
  if (chromeVersion === 57) {
    Workarounds.cr701075 = true
  }
  // Workaround for bogus mouse events on iOS 13
  if (iOSVersion !== -1) {
    Workarounds.wk203237 = 100
  }

  // Prevent default for context menu key - it is handled by the context menu implementation
  Workarounds.cr433873 = true
}

/** States whether the browser supports passive event listeners */
export const passiveSupported = detectPassiveSupported()
/** States whether the browser supports native drag and drop events */
export const nativeDragAndDropSupported = detectNativeDragAndDropSupported()
/** States whether the browser supports the pointer-events CSS property */
export const pointerEventsSupported = detectPointerEventsSupported()
