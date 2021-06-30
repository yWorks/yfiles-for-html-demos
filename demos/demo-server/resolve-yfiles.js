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
const fs = require('fs')
const path = require('path')

const SUPPORTED_YFILES_VERSION = '2.4'
const ignoredFiles = /(filesystem-warning|yfiles-typeinfo)\.js$/

/**
 * An array of third-party library names that are loaded through <script> tags and are globally
 * available in the demos that use them. As a result, symbolic imports like
 *   import ... from 'd3'
 * have to be removed from tsc-compiled JavaScript files that are served to browser, because the
 * imports cannot be resolved at runtime.
 * (Only necessary for TypeScript demos in the distribution bundles. The TsToJSConverter should
 * have removed those imports for the corresponding JavaScript demos already.)
 */
const thirdPartyLibraryNames = ['codemirror', 'd3', 'leaflet', 'moment']

const importYfilesRegex = /import\s+([^'"]*?)\s+from\s+['"]yfiles\/?([^'"]*)['"]/g
const importYfilesSideEffectRegex = /import\s+['"]yfiles\/?([^'"]*)['"]/g
const otherImportsRegex = /import\s+([^'"]*?)\s+from\s+['"](\.[^'"]*)['"]/g
const otherImportsSideEffectsRegex = /import\s+['"](\.[^'"]*)['"]/g
const thirdPartyImports = new RegExp(
  `import\\s+[^'"]*?\\s+from\\s+['"](?:${thirdPartyLibraryNames.join('|')})['"]`,
  'g'
)
const langVersionRegex = /\w\.version\s*=\s*['"]([^'"]+)['"]/

const es6NameToEsModule = {
  yfiles: 'lang'
}

let yFilesServerPath
let resolveToSubmodules = true

let config = {
  resolveDirs: [],
  logRequests: false
}
const configFile = './resolve-config.json'
readResolveConfig()

try {
  const es6ModuleMappings = require('../../tools/common/ES6ModuleMappings.json')

  for (const [esModuleName, implModuleMap] of Object.entries(es6ModuleMappings)) {
    for (const nameMap of Object.values(implModuleMap)) {
      for (const es6Name of Object.values(nameMap)) {
        es6NameToEsModule[es6Name] = esModuleName
      }
    }
  }
} catch (e) {
  resolveToSubmodules = false
  console.warn("Couldn't load ES6ModuleMappings.json. Imports will be resolved to 'yfiles.js'.")
}

/**
 * Finds and sets the (default) yFiles library location via require.resolve
 */
function findDefaultYFilesServerPath(staticRoot, startingPath) {
  let yFilesBasePath
  try {
    yFilesBasePath = path.dirname(
      require.resolve('yfiles', { paths: [path.dirname(startingPath)] })
    )
  } catch (e) {
    console.error(`${startingPath}: Could not find module 'yfiles'`)
    return
  }
  const content = fs.readFileSync(path.join(yFilesBasePath, 'yfiles.js'), 'utf8')
  const match = content.match(/This file is part of yFiles for HTML (\d\.\d)/)
  if (!match || match[1] !== SUPPORTED_YFILES_VERSION) {
    resolveToSubmodules = false
    console.warn(`Unexpected yFiles major version: ${match ? match[1] : 'None detected'}.
    Imports will be resolved to 'yfiles.js'.`)
  }

  const relative = path.relative(staticRoot, yFilesBasePath)
  yFilesServerPath = relative.replace(/\\/g, '/')
}

function addJsSuffix(moduleName) {
  return moduleName.endsWith('.js') ? moduleName : `${moduleName}.js`
}

function transformFile(data, filePath) {
  return data
    .replace(importYfilesRegex, (match, imports, from) => {
      const module = from || 'yfiles'
      if (module === 'yfiles' && resolveToSubmodules) {
        const neededModules = Object.create(null)
        let [defaultImport] = imports.match(/^[^{,]*/) || []

        let wildcardImport = null
        if (defaultImport.includes('*')) {
          wildcardImport = defaultImport
          defaultImport = null
        }

        // eslint-disable-next-line prefer-const
        let [fullMatch, namedImportsMatch] = imports.match(/{((?:.|\n|\r|\t)*)}/) || []
        const numLines = fullMatch ? fullMatch.split('\n').length : 1
        if (namedImportsMatch) {
          namedImportsMatch = namedImportsMatch.replace(/\s*\/\/.*/g, '')

          let namedImports = namedImportsMatch.replace(/\s/g, '').split(',')
          namedImports = namedImports.filter(importString => !importString.includes('.'))
          for (const namedImport of namedImports) {
            const module = es6NameToEsModule[namedImport]
            if (!module) {
              console.error('Named import not found in module mappings:', namedImport)
            } else {
              if (!neededModules[module]) {
                neededModules[module] = []
              }
              neededModules[module].push(namedImport)
            }
          }
        }

        if (defaultImport) {
          if (!neededModules.lang) {
            neededModules.lang = []
          }
          if (defaultImport === 'yfiles') {
            neededModules.lang.push(defaultImport)
          } else {
            neededModules.lang.push('yfiles as ' + defaultImport)
          }
        }

        const trailingComments = new Array(numLines - 1)
          .fill('// keep line numbers consistent due to import statement replacements')
          .join('\n')

        return (
          Object.entries(neededModules)
            .map(
              ([moduleName, imports]) => `import {${imports.join(',')}} from '/yfiles/${module}.js'`
            )
            .join(';') +
          (wildcardImport ? `import ${wildcardImport} from '/yfiles/${module}.js'` : '') +
          (numLines > 1 ? '\n' : '') +
          trailingComments
        )
      } else {
        return `import ${imports} from '/yfiles/${module}.js'`
      }
    })
    .replace(
      importYfilesSideEffectRegex,
      (match, moduleName) => `import '/yfiles/${moduleName}.js'`
    )
    .replace(
      otherImportsRegex,
      (match, imports, from) => `import ${imports} from '${addJsSuffix(from)}'`
    )
    .replace(
      otherImportsSideEffectsRegex,
      (match, moduleName) => `import '${addJsSuffix(moduleName)}'`
    )
    .replace(thirdPartyImports, match => '')
}

/**
 * Reads the config file, currently containing the additional resolve
 * directories and the logging configuration (logging on/off)
 */
function readResolveConfig() {
  if (fs.existsSync(configFile)) {
    try {
      const resolveDirsJSON = fs.readFileSync(configFile).toString()
      config = JSON.parse(resolveDirsJSON)
      if (config.resolveDirs && config.resolveDirs.length > 0) {
        log(`resolve dirs read from ${configFile}:\n${resolveDirsJSON}`)
      } else {
        log(`empty ${configFile}, continuing with defaults.`)
      }
    } catch (e) {
      console.error(`error reading ${configFile}: ${e.toString()}`)
    }
  } else {
    log(`no ${configFile}, continuing with defaults.`)
  }
}

/**
 * Writes and reloads a new configuration
 */
function setResolveConfig(config) {
  fs.writeFileSync(configFile, config)
  readResolveConfig()
}

function getResolveConfig() {
  return config
}

/**
 * Resolves a given yFiles module using the configured resolve locations
 * or falling back to the default library location calculated in {@link findDefaultYFilesServerPath}
 */
function resolveYFilesModulePath(moduleName, staticRoot) {
  let count = 0
  for (const dir of config.resolveDirs) {
    count++
    const modulePath = `${staticRoot}/${dir}/${moduleName}`.replace(/\\/g, '/')
    if (fs.existsSync(modulePath)) {
      log(`-> using module path: ${modulePath}, (hit ${count} of ${config.resolveDirs.length})`)
      return modulePath
    }
  }
  const modulePath = `${staticRoot}/${yFilesServerPath}/${moduleName}`.replace(/\\/g, '/')
  log(`-> using (default) module path: ${modulePath}`)
  return modulePath
}

/**
 * Recursively finds yFiles library locations
 */
function findLibraryLocations(startDir) {
  log('scanning for libraries...')
  const result = []
  const q = [startDir]
  while (q.length) {
    const current = q.pop()
    let names = fs.readdirSync(current)
    if (current.endsWith('node_modules')) {
      names = names.filter(n => n.startsWith('yfiles'))
    }
    const { isYFiles, isESModules, isNpm, version, date } = isYFilesDir(current, names)
    if (isYFiles && isESModules) {
      const relPath = path.relative(startDir, current).replace(/\\/g, '/')
      if (relPath !== yFilesServerPath) {
        // do not push default path into results
        result.push(relPath)
      }
    } else {
      for (let i = 0; i < names.length; ++i) {
        const subPath = path.join(current, names[i])
        if (isDir(subPath)) {
          q.push(subPath)
        }
      }
    }
  }

  /**
   * Checks whether a given directory contains a valid yFiles library
   */
  function isYFilesDir(somePath, names) {
    let isESModules = false
    let hasLang = false
    let hasPackageJson = false
    let hasImpl = false
    for (let i = 0; i < names.length; ++i) {
      const name = names[i]
      if (name === 'yfiles.js') {
        isESModules = true
      }
      if (name === 'lang.js') {
        hasLang = true
      }
      if (name === 'impl') {
        hasImpl = true
      }
      if (name === 'package.json') {
        hasPackageJson = true
      }
    }
    const isYFiles = hasLang && hasImpl
    let version = null
    let date = null
    if (isESModules && isYFiles) {
      const implLangPath = path.join(somePath, 'impl/lang.js')
      const implLangStats = fs.lstatSync(implLangPath)
      date = implLangStats.mtime
      if (hasPackageJson) {
        const pkg = require(path.join(somePath, 'package.json'))
        version = pkg.version
      } else {
        const langContents = fs.readFileSync(implLangPath, 'utf8')
        const match = langVersionRegex.exec(langContents)
        if (match) {
          version = match[1]
        } else {
          version = 'n/a'
        }
      }
    }
    return {
      isYFiles,
      isESModules,
      isNpm: hasPackageJson,
      version,
      date
    }
  }
  log(`libraries found: ${result}`)

  return result
}

function isDir(p) {
  return fs.lstatSync(p).isDirectory()
}

function log(logEntry) {
  if (config.logRequests) {
    console.log(logEntry)
  }
}

module.exports.resolve = options => (req, res, next) => {
  const ext = path.extname(req.path)
  if (ext !== '.js') {
    next()
    return
  }
  const staticRoot = options.staticRoot

  log('------------------------------------------------')
  log(`requested: ${req.path}`)
  const match = req.path.match(/.*?\/yfiles\/(.*)/)
  let filePath
  if (match) {
    filePath = resolveYFilesModulePath(match[1], options.staticRoot)
  } else {
    filePath = path.join(staticRoot, req.path)
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      next()
      return
    }

    if (!ignoredFiles.test(filePath)) {
      if (/^\s*import /m.test(data)) {
        if (!yFilesServerPath) {
          findDefaultYFilesServerPath(staticRoot, filePath)
        }
        if (yFilesServerPath) {
          data = transformFile(data, filePath)
        }
      }
    }
    res.type(ext)
    res.send(data)
  })
}

module.exports.readResolveFile = readResolveConfig
module.exports.setResolveConfig = setResolveConfig
module.exports.getResolveConfig = getResolveConfig
module.exports.findLibraryLocations = findLibraryLocations
