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
/** @type {number} */
let firefoxVersion = null
/** @type {number} */
let ieVersion = null
/** @type {number} */
let iosVersion = null
/** @type {number} */
let safariVersion = null
/** @type {boolean} */
let supportsModulesInWorker = null
/** @type {boolean} */
let supportsNativeDragAndDrop = null
/** @type {boolean} */
let supportsPassiveEventListeners = null
/** @type {boolean} */
let supportsPointerEvents = null
/** @type {boolean} */
let supportsWebGL = null
/** @type {boolean} */
let supportsWebGL2 = null

/**
 * Provides basic feature detection for HTML5 and JavaScript API that is used in the demos.
 *
 * For productive use in your project we recommend a mature solution like
 * [Modernizer](https://modernizr.com/) instead.
 */
export const BrowserDetection = {
  /**
   * The version number of Firefox, or 0 if the current browser isn't Firefox.
   */
  get firefoxVersion() {
    if (firefoxVersion != null) {
      return firefoxVersion
    }
    if (typeof window === 'undefined') {
      firefoxVersion = 0
      return firefoxVersion
    }
    const versionMatch = window.navigator?.userAgent?.match(new RegExp('Firefox\\/([0-9]+)', ''))
    const version = versionMatch != null ? parseInt(versionMatch[1]) : 0
    firefoxVersion = Number.isNaN(version) ? 0 : version
    return firefoxVersion
  },
  /**
   * The version number of IE or Edge Legacy, or 0 if the current browser isn't one of these.
   */
  get ieVersion() {
    if (ieVersion == null) {
      ieVersion = detectInternetExplorerVersion()
    }
    return ieVersion
  },
  /**
   * Returns the iOS version, or 0 if it is another OS.
   *
   * As the time of writing, iOS 16 was the current version. Newer versions might use a different ua.
   *
   * NOTE: Since Safari for iPadOS 13, the user agent changed such that iOS and Mac OS X cannot be
   * distinguished anymore. The check still works on other browsers on iPadOS, e.g. Chrome.
   * Therefore, there is a separate check for iPad Safari 13+.
   */
  get iOSVersion() {
    if (iosVersion == null) {
      iosVersion = detectIosVersion()
    }
    return iosVersion
  },
  /**
   *  The version number of Safari, or 0 if the current browser isn't Safari.
   */
  get safariVersion() {
    if (safariVersion == null) {
      safariVersion = detectSafariVersion()
    }
    return safariVersion
  },
  /**
   * Specifies whether the browser supports modules for Web Workers.
   */
  get modulesSupportedInWorker() {
    if (supportsModulesInWorker == null) {
      supportsModulesInWorker = detectModulesSupportedInWorker()
    }
    return supportsModulesInWorker
  },
  /**
   * Specifies whether the browser supports native drag and drop events.
   */
  get nativeDragAndDrop() {
    if (supportsNativeDragAndDrop == null) {
      supportsNativeDragAndDrop = detectNativeDragAndDropSupported()
    }
    return supportsNativeDragAndDrop
  },
  /**
   * Specifies whether the browser supports passive event listeners.
   */
  get passiveEventListeners() {
    if (supportsPassiveEventListeners == null) {
      supportsPassiveEventListeners = detectPassiveSupported()
    }
    return supportsPassiveEventListeners
  },
  /**
   * Specifies whether the browser supports the pointer-events CSS property.
   */
  get pointerEvents() {
    if (supportsPointerEvents == null) {
      supportsPointerEvents = detectPointerEventsSupported()
    }
    return supportsPointerEvents
  },
  /**
   * Specifies whether the browser supports WebGL 1 rendering.
   */
  get webGL() {
    if (supportsWebGL == null) {
      supportsWebGL = hasDrawingContext('webgl') || hasDrawingContext('experimental-webgl')
    }
    return supportsWebGL
  },
  /**
   * Specifies whether the browser supports WebGL 2 rendering.
   */
  get webGL2() {
    if (supportsWebGL2 == null) {
      supportsWebGL2 = hasDrawingContext('webgl2')
    }
    return supportsWebGL2
  }
}

/**
 * Returns the version of IE and Edge Legacy, or 0 for other browsers.
 * @returns {number}
 */
function detectInternetExplorerVersion() {
  // environments without window object
  if (typeof window === 'undefined' || window.navigator?.userAgent == null) {
    return 0
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
  // IE 12 => return version number
  return edge > 0 ? parseInt(ua.substr(edge + 5, ua.indexOf('.', edge)), 10) : 0
}

/**
 * Returns the iOS version, or 0 if it is another OS.
 *
 * As the time of writing, iOS 16 was the current version. Newer versions might use a different ua.
 *
 * NOTE: Since Safari for iPadOS 13, the user agent changed such that iOS and Mac OS X cannot be
 * distinguished anymore. The check still works on other browsers on iPadOS, e.g. Chrome.
 * Therefore, there is a separate check for iPad Safari 13+.
 * @returns {number}
 */
function detectIosVersion() {
  // environments without window object
  if (typeof window === 'undefined' || window.navigator?.userAgent == null) {
    return 0
  }

  const ua = window.navigator.userAgent
  // iPhones, iPad Safari < v13, and non-Safari browsers on iPad identify as the correct device
  if (/iPad|iPhone|iPod/.test(ua)) {
    // Chromium browsers have an ua similar to:
    // Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/101.0.4951.44 Mobile/15E148 Safari/604.1
    // iPhone Safari:
    // Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1
    const matches = / OS (\d\d)_/.exec(ua)
    if (matches != null && matches.length > 1) {
      return parseInt(matches[1])
    }

    // As fallback, report v10, that's good enough for yFiles demo purposes
    return 10
  }
  // Since iPadOS v13, iPad Safari reports as macOS.
  // As long as there are no Macs with touch support, we can detect iPads with the following check.
  // Note that even iPads with Apple's M CPUs report as MacIntel.
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
    // iPad Safari has an ua similar to this:
    // Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15
    // Seems that the 'Version/16' part indeed specifies the iPadOS version
    const matches = /Version\/(\d\d)/.exec(ua)
    if (matches != null && matches.length > 1) {
      return parseInt(matches[1])
    }
    // As fallback, report v13, which is the first version that pretends to be macOS
    return 13
  }
  return 0
}

/**
 * Returns the version of Safari, or 0 for other browsers.
 * @returns {number}
 */
function detectSafariVersion() {
  // environments without window object
  if (typeof window === 'undefined' || window.navigator?.userAgent == null) {
    return 0
  }

  const ua = window.navigator.userAgent
  const isSafari = ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1
  if (isSafari) {
    const safariVersionMatch = ua.match(new RegExp('Version\\/(\\d*\\.\\d*)', ''))
    if (safariVersionMatch && safariVersionMatch.length > 1) {
      return parseInt(safariVersionMatch[1])
    }
  }
  return 0
}

/**
 * Returns whether the browser supports active and passive event listeners.
 * @returns {boolean}
 */
function detectPassiveSupported() {
  if (typeof window === 'undefined') {
    return false
  }

  let supported = false
  // noinspection EmptyCatchBlockJS
  try {
    const opts = Object.defineProperty({}, 'passive', {
      // eslint-disable-next-line getter-return
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
 * Returns whether the browser supports native drag and drop events and custom dataTransfer types.
 * @returns {boolean}
 */
function detectNativeDragAndDropSupported() {
  if (typeof window === 'undefined') {
    return false
  }

  const div = document.createElement('div')
  const hasDndSupport = 'draggable' in div || ('ondragstart' in div && 'ondrop' in div)
  const ieVersion = detectInternetExplorerVersion()
  const hasCustomTypeSupport = ieVersion === 0 || ieVersion > 11
  return hasDndSupport && hasCustomTypeSupport
}

/**
 * Returns whether the browser supports the pointer-events CSS property.
 * @returns {boolean}
 */
function detectPointerEventsSupported() {
  if (typeof window === 'undefined') {
    return false
  }
  const testDiv = document.createElement('div')
  testDiv.style.cssText = 'pointer-events:auto'
  return testDiv.style.pointerEvents === 'auto'
}

/**
 * @param {!string} name
 */
function hasDrawingContext(name) {
  return (
    typeof window !== 'undefined' &&
    window.document.createElement('canvas').getContext(name) != null
  )
}

/**
 * Returns whether the browser supports modules for Web Workers.
 *
 * Note that this check creates an actual (but empty) Worker and thus is a bit more costly than
 * other checks.
 * @returns {boolean}
 */
function detectModulesSupportedInWorker() {
  if (typeof window === 'undefined' || window.Worker == null) {
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
      get type() {
        modulesSupported = true
        return 'module'
      }
    }).terminate()
  } catch (_) {
    modulesSupported = false
  }
  return modulesSupported
}
