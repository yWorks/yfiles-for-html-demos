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
;(function(global, undefined) {
  if (typeof global.require === 'function') {
    // don't overwrite an existing require implementation
    return
  }

  var logError = function(o1, o2) {
    if (typeof window.console === 'undefined') {
      // do nothing
    } else if (typeof window.console.error === 'function') {
      o2 ? window.console.error(o1, o2) : window.console.error(o1)
    } else {
      o2 ? window.console.log(o1, o2) : window.console.log(o1)
    }
  }
  var dependencyState = {}
  var absoluteLocationMatcher = /^\w+:\/\//
  var relativeLocationMatcher = /^(\.\.?)/
  var moduleMatcher = /^([^/]*)(\/.*)?/
  var jsFileMatcher = /\.js$/
  var currentlyLoadedModule = null
  var pathToCurrentlyLoadedModule = {}
  var pendingRequires = []

  var currentImport = '' // just for importScripts (loaded synchronously)
  var isWebWorker =
    typeof importScripts !== 'undefined' &&
    (typeof window === 'undefined' || typeof window.document === 'undefined')
  var errorBoxOpen = false
  var enableES6warning =
    global.location.hostname.indexOf('yworks.') < 0 &&
    global.location.pathname.indexOf('es5/demos') < 0 &&
    !hasEs6Support()

  if (enableES6warning) {
    global.onerror = catchMissingEs6Support
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

  function catchMissingEs6Support() {
    if (enableES6warning) {
      errorBoxOpen = true
      var errorBox = document.createElement('div')
      errorBox.innerHTML =
        '<h1>Starting the application failed</h1>' +
        '<p>These demos use ECMAScript 6 features that your browser does not support.</p>' +
        '<p>Please switch to a browser with support for ECMAScript 6 (Chrome, Firefox, Edge, Safari 10) or use the included ' +
        "<a href='../../../deployment/README.html#demos-es5'>deployment tool</a> to convert the demos to ECMAScript 5. The " +
        "converted demos are also <a href='https://live.yworks.com/demos/' target='_blank'>available online</a>.</p>" +
        '<p>Note that ECMAScript 6 is a requirement of the demos, only. The yFiles for HTML library itself is compatible ' +
        'with ECMAScript 5.</p>'
      errorBox.className += ' error-box'
      document.body.insertBefore(errorBox, document.body.firstChild)
    }
  }

  function importScript(path, context) {
    dependencyState[path] = {
      dependants: [context],
      state: 'pending'
    }

    try {
      currentImport = path
      importScripts(path)
      scriptLoaded(path, context)
    } catch (e) {
      loadFailed(context, path, e)
    }
  }

  function loadFailed(context, path, e) {
    context.fail('Error loading ' + path)
    logError('Error loading ' + path + '\n', e)
    dependencyState[path].state = 'failed'
  }

  function scriptLoaded(path, context) {
    var currentlyLoadedModuleLocal = pathToCurrentlyLoadedModule[path] || currentlyLoadedModule
    dependencyState[path].state = 'loaded'
    if (currentlyLoadedModuleLocal) {
      currentlyLoadedModuleLocal.dependants = dependencyState[path].dependants
      currentlyLoadedModuleLocal.name = path
      currentlyLoadedModule = null
      if (currentlyLoadedModuleLocal.failed) {
        currentlyLoadedModuleLocal.fail(currentlyLoadedModuleLocal.failed)
      } else {
        currentlyLoadedModuleLocal.resolve()
      }
    } else {
      var dependants = dependencyState[path].dependants
      for (var i = 0; i < dependants.length; i++) {
        dependants[i].resolve()
      }
      dependencyState[path].state = 'executed'
    }
  }

  function loadScript(path, context, loader) {
    dependencyState[path] = {
      dependants: [context],
      state: 'pending'
    }
    var script = document.createElement('script')
    var timerId = -1
    script.type = 'text/javascript'
    script.onload = function() {
      script.onload = undefined
      scriptLoaded(path, context)
      clearTimeout(timerId)
      delete script['data-yworks-loading-state']
    }
    script.onerror = function(e) {
      loadFailed(context, path, e)
      script.onload = undefined
      clearTimeout(timerId)
      delete script['data-yworks-loading-state']
    }
    timerId = setTimeout(function() {
      logError('Timeout while trying to load ' + path)
      script.onload = undefined
      delete script['data-yworks-loading-state']
      dependencyState[path].state = 'failed'
      context.fail('Timeout while trying to load ' + path)
    }, require.timeout)
    script.src = path
    script['data-yworks-module-path'] = path
    if (!document.currentScript && !script.readyState) {
      // If we can use neither of the above properties to determine the current script, we have to evaluate them in
      // the given order to identify the path name in define(). This is especially for IE 11.
      // Note that only the evaluation of the scripts is async, the files are still loaded in parallel.
      script.async = false
    }
    script['data-yworks-loading-state'] = 'pending'
    loader.appendChild(script)
  }

  /**
   * @param dep {string} The dependency string.
   * @param context {*} The current context.
   * @returns {string} The path to the given dependency
   */
  function resolveDependency(dep, context) {
    if (jsFileMatcher.test(dep) || absoluteLocationMatcher.test(dep) || dep.charAt(0) === '/') {
      return normalizePath(dep)
    } else if (!relativeLocationMatcher.test(dep)) {
      // does not start with dots and does not end in .js - its a module
      var res = moduleMatcher.exec(dep)
      if (res) {
        var moduleName = res[1]
        if (context.paths && context.paths[moduleName]) {
          return normalizePath(context.paths[moduleName].replace(/\/$/, '') + res[2] + '.js')
        }
      }
      return normalizePath(context.baseUrl + dep + '.js')
    } else if (context.parentUrl) {
      return normalizePath(context.parentUrl + dep + '.js')
    } else {
      throw new Error('Mandatory base path is not specified!')
    }
  }

  /**
   * @param dep {string} The dependency string.
   * @returns {string} The path to the parent directory of the given dependency
   */
  function determineParentUrl(dep) {
    var lastIndexOf = dep.lastIndexOf('/')
    return lastIndexOf <= 0 ? './' : dep.substr(0, lastIndexOf + 1)
  }

  /**
   * @param path {string}
   */
  function normalizePath(path) {
    var length = -1
    while (path && length !== path.length) {
      length = path.length
      // remove inner parent specifier '..'
      path = path.replace(/\/[\w.-]+[\w-]\/\.\.\//, '/')
      // remove inner current directory specifier '/./' > '/'
      path = path.replace(/\/\.\//, '/')
    }
    if (path.substr(0, 2) === './') {
      path = path.substr(2)
    }
    return path
  }

  function getResultArguments(deps) {
    return deps.map(function(item) {
      return dependencyState[item].result
    })
  }

  global.require = function(deps, fn) {
    var anonRequire = {
      cancelled: false,
      unresolvedDependencyCount: 1,
      callback: fn,
      resolve: function() {
        if (!this.cancelled) {
          if (--this.unresolvedDependencyCount === 0) {
            var args = getResultArguments(this.deps)
            if (global.require.onError === null || global.require.disableErrorReporting) {
              this.callback.apply(null, args)
            } else {
              try {
                this.callback.apply(null, args)
              } catch (e) {
                this.fail(null, e)
              }
            }
            this.removePending()
          }
        }
        // else: Don't resolve if canceled
      },

      removePending: function() {
        pendingRequires = pendingRequires.filter(function(element) {
          return element !== this
        }, this)
      },

      fail: function(cause, error) {
        global['data-demo-status'] = 'Error! ' + (cause || error)
        if (global.require.onError != null) {
          if (cause) {
            // If a cause is specified, it is more informative than the error itself
            global.require.onError(new Error(cause))
          } else if (error) {
            global.require.onError(error)
          } else {
            global.require.onError(new Error('Unspecified error during require.'))
          }
        } else {
          if (error) {
            logError('Error occurred: ' + error.message + '\n', error.stack)
          } else {
            logError('Error occurred: ' + cause)
          }
          if (global.onerror !== null && !global.onerror === catchMissingEs6Support) {
            throw error
          } else {
            if (!isWebWorker && !errorBoxOpen) {
              if (!global.require.disableErrorReporting) {
                errorBoxOpen = true
                var errorBox = document.createElement('div')
                errorBox.innerHTML =
                  '<h1>Error.</h1>' +
                  '<p>Starting the application failed.</p>' +
                  (typeof cause === 'string' ? "<p class='cause'>" + cause + '</p>' : '') +
                  '<p>Please review the error message in your browsers developer tools.</p>'
                errorBox.className += ' error-box'
                document.body.insertBefore(errorBox, document.body.firstChild)
              }
            }
          }
        }
      }
    }
    anonRequire.onError = require.onError
    var context = {
      parentUrl: require.baseUrl,
      baseUrl: require.baseUrl,
      paths: require.paths || {}
    }
    pendingRequires.push(anonRequire)

    var resolvedDeps = deps.map(function(dep) {
      return resolveDependency(dep, context)
    })
    anonRequire.deps = resolvedDeps

    for (var i = 0, length = deps.length; i < length; i++) {
      var dependency = resolvedDeps[i]
      if (dependencyState.hasOwnProperty(dependency)) {
        var module = dependencyState[dependency]
        if (
          module.state === 'pending' ||
          module.state === 'loaded' ||
          module.state === 'resolved'
        ) {
          anonRequire.unresolvedDependencyCount++
          module.dependants.push(anonRequire)
        } else if (module.state === 'failed') {
          anonRequire.unresolvedDependencyCount++
          anonRequire.fail(dependency + ' could not be resolved due to a previous error.')
        }
        // else module is already loaded, don't need to do anything
      } else {
        // load dependency
        anonRequire.unresolvedDependencyCount++
        load(dependency, anonRequire)
      }
    }
    // make sure that we asynchronously invoke the callback if everything is resolved
    setTimeout(function() {
      anonRequire.resolve()
    }, 4)
  }

  function load(path, context) {
    if (!isWebWorker) {
      loadScript(path, context, document.head)
    } else {
      importScript(path, context)
    }
  }

  /**
   * Cancel all pending requires
   * (prevent execution of the corresponding require callbacks)
   */
  global.cancelRequire = function() {
    while (pendingRequires.length > 0) {
      pendingRequires.pop().cancelled = true
    }
  }

  global.define = function(modulenameopt, deps, fn) {
    if (typeof modulenameopt !== 'string') {
      fn = deps
      deps = modulenameopt
      modulenameopt = undefined
    }

    var clm = (currentlyLoadedModule = {
      callback: fn,
      dependants: [],
      dependencyNames: [],
      unresolvedDependencyCount: 0,

      resolve: function() {
        if (this.unresolvedDependencyCount === 0) {
          dependencyState[this.name].state = 'resolved'
          dependencyState[this.name].deps = this.dependencyNames
          try {
            var args = getResultArguments(this.dependencyNames)
            dependencyState[this.name].result = this.callback.apply(null, args)
            dependencyState[this.name].state = 'defined'
          } catch (e) {
            this.fail('Error initializing module ' + this.name + ': ' + e.message, e, true)
            logError(e)
            return
          }
          for (var i = 0; i < this.dependants.length; i++) {
            this.dependants[i].resolve()
          }
        }
        this.unresolvedDependencyCount--
      },
      fail: function(cause, error, notext) {
        if (this.name) {
          if (cause && !notext) {
            cause = 'Requiring module ' + this.name + ' failed. Cause:\n' + (cause || error)
          }
          dependencyState[this.name].state = 'failed'
        }
        for (var i = 0; i < this.dependants.length; i++) {
          this.dependants[i].fail(cause, error)
        }
      }
    })
    var length, i, path
    if (modulenameopt) {
      pathToCurrentlyLoadedModule[modulenameopt] = currentlyLoadedModule
      currentlyLoadedModule = null
      path = modulenameopt
    } else {
      // no name set, use the currentScript
      if (!isWebWorker) {
        if (document.currentScript) {
          path = document.currentScript['data-yworks-module-path']
        }
        // still no name, find out name for IE < 11 (readyState) or other browsers
        if (!path) {
          var children = document.head.children
          for (i = 0, length = children.length; i < length; i++) {
            var child = children[i]
            // if readyState is defined, we're looking for the script with 'interactive' state, otherwise use the first
            // one that is marked with our custom attribute
            if (
              child.src &&
              (child.readyState === 'interactive' ||
                (!child.readyState && child['data-yworks-loading-state'] === 'pending'))
            ) {
              path = child['data-yworks-module-path']
              if (path) {
                break
              }
            }
          }
        }
      } else {
        path = currentImport
      }
      if (path && path.length > 0) {
        pathToCurrentlyLoadedModule[path] = clm
        currentlyLoadedModule = null
      }
    }

    var context = {
      parentUrl: path ? determineParentUrl(path) : require.baseUrl,
      baseUrl: require.baseUrl,
      paths: require.paths || {}
    }
    for (var j = 0, depsLength = deps.length; j < depsLength; j++) {
      var dependency = resolveDependency(deps[j], context)
      if (dependencyState.hasOwnProperty(dependency)) {
        var module = dependencyState[dependency]
        if (
          module.state === 'pending' ||
          module.state === 'loaded' ||
          module.state === 'resolved' ||
          module.state === 'failed'
        ) {
          clm.unresolvedDependencyCount++
          module.dependants.push(clm)
          if (module.state === 'failed') {
            clm.failed = dependency + ' could not be resolved due to a previous error.'
          }
        }
        // else module is already loaded, don't need to do anything
      } else {
        // load dependency
        clm.unresolvedDependencyCount++
        load(dependency, clm)
      }
      clm.dependencyNames.push(dependency)
    }
  }

  global.define.amd = {}

  // some configuration
  require.timeout = 400000
  require.baseUrl = ''
  require.load = require
  require.disableErrorReporting = false
  require.getRequiredModuleStates = function() {
    var modules = []
    Object.getOwnPropertyNames(dependencyState).forEach(function(moduleName) {
      var state = dependencyState[moduleName]
      var info = {
        name: moduleName,
        state: state.state,
        dependencies: []
      }
      if (state.deps) {
        for (var i = 0; i < state.deps.length; i++) {
          info.dependencies.push(state.deps[i])
        }
      }
      modules.push(info)
    })
    return modules
  }
  var isAbsolutePath = /^(\/)|(\w+:\/\/)/
  require.config = function(configuration) {
    var baseUrlType = typeof configuration.baseUrl
    // specifying baseUrl in the config is optional
    if (baseUrlType !== 'undefined') {
      if (baseUrlType === 'string') {
        // baseUrl must be a string
        require.baseUrl = configuration.baseUrl
        if (require.baseUrl.charAt(require.baseUrl.length - 1) !== '/') {
          require.baseUrl += '/'
        }
      } else {
        throw new Error('baseUrl must be a string.')
      }
    }
    var pathsType = typeof configuration.paths
    // specifying baseUrl in the config is optional
    if (pathsType !== 'undefined') {
      if (pathsType === 'object') {
        // baseUrl must be a object
        require.paths = require.paths || {}
        Object.getOwnPropertyNames(configuration.paths).forEach(function(name) {
          var path = configuration.paths[name]
          if (!isAbsolutePath.test(path) && require.baseUrl) {
            require.paths[name] = require.baseUrl + path
          } else {
            require.paths[name] = path
          }
        })
      } else {
        throw new Error('paths must be an object.')
      }
    }
  }
})(
  typeof window !== 'undefined'
    ? window
    : typeof global !== 'undefined'
      ? global
      : typeof self !== 'undefined'
        ? self
        : this
)
