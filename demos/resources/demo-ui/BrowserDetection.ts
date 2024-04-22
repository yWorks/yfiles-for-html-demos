/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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

let iosVersion: number = null!
let safariVersion: number = null!
let supportsModulesInWorker: boolean = null!
let supportsWebGL: boolean = null!
let supportsWebGL2: boolean = null!
let androidVersion: number = null!
let chromeVersion: number = null!

/**
 * Provides basic feature detection for HTML5 and JavaScript API that is used in the demos.
 *
 * For productive use in your project we recommend a mature solution like
 * [Modernizer](https://modernizr.com/) instead.
 */
export const BrowserDetection = {
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
  },
  /**
   * The version of Android or 0 if it is another OS.
   */
  get androidVersion() {
    if (androidVersion == null) {
      androidVersion = detectAndroidVersion()
    }
    return androidVersion
  },
  /**
   * The version of Chrome or 0 if it is another browser.
   */
  get chromeVersion() {
    if (chromeVersion == null) {
      chromeVersion = detectChromeVersion()
    }
    return chromeVersion
  }
}

/**
 * Returns the iOS version, or 0 if it is another OS.
 *
 * As the time of writing, iOS 16 was the current version. Newer versions might use a different ua.
 *
 * NOTE: Since Safari for iPadOS 13, the user agent changed such that iOS and Mac OS X cannot be
 * distinguished anymore. The check still works on other browsers on iPadOS, e.g. Chrome.
 * Therefore, there is a separate check for iPad Safari 13+.
 */
function detectIosVersion(): number {
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
 */
function detectSafariVersion(): number {
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
 * Returns the Android version, or 0 if it is another OS.
 *
 * At the time of writing, Android 13 was the current version. Newer versions might use a different ua. *
 */
function detectAndroidVersion(): number {
  // environments without window object
  if (typeof window === 'undefined' || window.navigator?.userAgent == null) {
    return 0
  }

  const ua = window.navigator.userAgent
  if (/Android/.test(ua)) {
    // Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36
    const matches = / Android (\d\d)_/.exec(ua)
    if (matches != null && matches.length > 1) {
      return parseInt(matches[1])
    }

    // As fallback, report v10, that's good enough for yFiles demo purposes
    return 10
  }
  return 0
}

/**
 * Returns the version of Chrome, or 0 for other browsers.
 */
function detectChromeVersion(): number {
  // environments without window object
  if (typeof window === 'undefined' || window.navigator?.userAgent == null) {
    return 0
  }

  const ua = window.navigator.userAgent
  const isChrome = ua.indexOf('Chrome') !== -1 && ua.indexOf('Edg') === -1
  if (isChrome) {
    const matches = / Chrome\/(\d*)/.exec(ua)
    if (matches != null && matches.length > 1) {
      return parseInt(matches[1])
    }
    return 100
  }
  return 0
}

function hasDrawingContext(name: string) {
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
 */
function detectModulesSupportedInWorker(): boolean {
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
