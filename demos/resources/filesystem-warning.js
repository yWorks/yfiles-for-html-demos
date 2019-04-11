/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/* eslint-disable no-eval */
/* eslint-disable no-var */
;(function() {
  var isFileSystem = window.location.protocol.indexOf('file') > -1

  var possibleServerUrl = window.location
    .toString()
    .replace(/.*?\/demos\/(.*)/, 'http://localhost:3000/demos/$1')

  var showES6warning =
    window.location.hostname.indexOf('yworks.') < 0 &&
    window.location.pathname.indexOf('es5/demos') < 0 &&
    !hasEs6Support()

  var fileSystemWarning =
    '<div id="fs-warning" style="z-index: 99; visibility: visible; position: fixed; top: 0;left: 0;right: 0;padding: 0 24px 24px; background-color: #336699; color: white; border-bottom: 4px solid rgba(26, 52, 78, 0.65); font-size: 18px; text-align: center; max-height: 100%; overflow: auto; box-sizing: border-box;">' +
    '  <div style="max-width: 800px; display: inline-block; text-align: left;text-align: initial;">' +
    '    <p>' +
    '      Most demos in this package use yFiles as a local NPM dependency with ES Module imports.' +
    '      Hence, a preprocessing is necessary to resolve the ES Module imports. Usually, this is done by' +
    '      bundling the application e.g. with Webpack. Alternatively, the imports can be resolved with ' +
    '      a preconfigured server. A <a href="../../demo-server/README.html" style="color: #ffaf00; text-decoration: underline;">local Node.js Express server</a>' +
    '      is included in the yFiles for HTML package and can be run with: ' +
    '    </p>' +
    '    <pre style="color: #333;background-color: #f7f7f7;">\n' +
    '   > cd %YFILES_HTML_DISTRIBUTION_DIR%/demos/\n' +
    '   > npm install\n' +
    '   > npm start</pre>' +
    '    <p>Once the server is running, you can click <a style="color: #ffaf00; text-decoration: underline;" href="' +
    possibleServerUrl +
    '">Here</a> to visit this page on the server.' +
    (isFileSystem
      ? '<br>Click <a href="../../README.html#nonsymbolic" style="color: #ffaf00; text-decoration: underline;">here</a> for a list of demos that work when served from a regular web server.'
      : '') +
    '</p>' +
    '    <div style="padding: 10px; border: 3px solid #f7f7f7;">' +
    '      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="64px" height="64px" viewBox="0 0 24 24" xml:space="preserve" style="float: left;margin-right: 1em; padding-top: 15px;padding-left: 10px;">' +
    '        <path stroke="white" fill="#336699" d="M3 22.5c-0.708 0-1.27-0.276-1.55-0.759-0.278-0.481-0.235-1.11 0.119-1.72l9-15.6c0.354-0.613 0.876-0.965 1.43-0.965s1.08 0.352 1.43 0.965l9 15.6c0.354 0.613 0.397 1.24 0.119 1.72-0.279 0.482-0.844 0.759-1.55 0.759h-18"/>' +
    '        <ellipse fill="white" rx="1.25" ry="1.25" cx="12.00" cy="18.40"/>' +
    '        <path fill="white" d="M12 8.69c-0.6 0-1 0.45-1 1v5.01c0 0.5 0.4 1 1 1s1-0.5 1-1v-5.01c0-0.55-0.4-1-1-1z"/>' +
    '      </svg>' +
    '      <div style="overflow: auto">' +
    '       <p style="margin-top: 0;">' +
    '         yFiles supports different loading mechanisms and can also be included as UMD modules (e.g. with ' +
    '         <a href="https://requirejs.org/" style="color: #ffaf00; text-decoration: underline;">require.js</a>)' +
    "         or globally with script tags, which both don't require any preprocessing or bundling at all." +
    '        </p>' +
    '        <p style="margin-bottom: 0;">' +
    '         For more information see the <a href="../../../doc/api/index.html#/dguide/getting_started-application#getting_started-module_loading" style="color: #ffaf00; text-decoration: underline;">Module Loading</a> ' +
    "         chapter in the Developer's Guide." +
    '       </p>' +
    '      </div>' +
    '    </div>' +
    '  <div style="display: inline-block; text-align: left; padding: 6px; cursor: pointer; margin-top: 16px; background-color: #e48208;" onclick="document.getElementById(\'fs-warning\').style.display = \'none\'">Got it!</div>' +
    '  </div>' +
    '</div>'

  var missingEs6Support =
    '<div style="visibility: visible; position: fixed; top: 0;left: 0;right: 0;padding: 24px;background-color: #336699; color: white; border-bottom: 4px solid rgba(26, 52, 78, 0.65); font-size: 18px; text-align: center; max-height: 100%; overflow: auto; box-sizing: border-box;">' +
    '  <div style="max-width: 800px; display: inline-block; text-align: left;text-align: initial;">' +
    '    <h2>Starting the demo failed</h2>' +
    '    <p>The demos in this package require at least ECMAScript 6 support that your browser does not support.</p>' +
    '    <p>Please switch to a browser with support for ECMAScript 6 (Chrome, Firefox, Edge, Safari 10) or use the included ' +
    '     <a style="color: #ffaf00; text-decoration: underline;" href="../../../deployment/demos-es5/README.html">deployment tool</a> to convert the demos to ECMAScript 5. The converted ' +
    '     demos are also <a style="color: #ffaf00; text-decoration: underline;" href="https://live.yworks.com/demos/" target="_blank">available online</a>.</p>' +
    '    <p>Note that ECMAScript 6 is a requirement of the demos, only. The yFiles for HTML library itself is compatible with ECMAScript 5.</p>' +
    '  </div>' +
    '</div>'

  if (showES6warning) {
    showWarningTemplate(missingEs6Support)
  } else {
    setTimeout(function() {
      if (window.yfiles && !(window.yfiles.collections && window.yfiles.collections.List)) {
        showWarningTemplate(fileSystemWarning)
      }
    }, 6000)
  }

  function hasEs6Support() {
    try {
      // ES6 features that we want to detect
      eval('class Foo {}')
      eval('const foo = "bar"')
      eval('let bar = (x) => x+1')
    } catch (ignored) {
      return false
    }
    return true
  }

  function showWarningTemplate(template) {
    var warningDiv = document.createElement('div')
    var actuallyAppend = function() {
      document.body.appendChild(warningDiv)
      document.body.setAttribute(
        'class',
        document.body.getAttribute('class') + ' file-system-warning'
      )
      warningDiv.outerHTML = template
    }
    if (document.readyState === 'loading') {
      // Loading hasn't finished yet
      document.addEventListener('DOMContentLoaded', actuallyAppend)
    } else {
      // `DOMContentLoaded` has already fired
      actuallyAppend()
    }
  }
})()
