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
const fs = require('fs')
const path = require('path')

/**
 * Whether to log requests to STDOUT.
 */
const logRequests = false

const SUPPORTED_YFILES_VERSION = '2.5'
const ignoredFiles = /(filesystem-warning|yfiles-typeinfo)\.js$/

const importYfilesRegex = /import\s+([^'"]*?)\s+from\s+['"]yfiles\/?([^'"]*)['"]/g
const importYfilesSideEffectRegex = /import\s+['"]yfiles\/?([^'"]*)['"]/g
const otherImportsRegex = /import\s+([^'"]*?)\s+from\s+['"](\.[^'"]*)['"]/g
const otherImportsSideEffectsRegex = /import\s+['"](\.[^'"]*)['"]/g
const langVersionRegex = /\w\.version\s*=\s*['"]([^'"]+)['"]/

let es6NameToEsModule = {}
let yFilesServerPath = null
let resolveToSubmodules = true

function updateNameToModuleMap() {
  try {
    const filePath = '../../tools/common/ES6ModuleMappings.json'
    const es6ModuleMappings = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8' }))

    es6NameToEsModule = {
      yfiles: 'lang'
    }
    for (const [esModuleName, implModuleMap] of Object.entries(es6ModuleMappings)) {
      for (const nameMap of Object.values(implModuleMap)) {
        for (const es6Name of Object.values(nameMap)) {
          es6NameToEsModule[es6Name] = esModuleName
        }
      }
    }
  } catch (ignored) {
    resolveToSubmodules = false
    console.warn("Cannot load module mappings file. Importing all yFiles types from 'yfiles.js'.")
  }
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
  } catch (ignored) {
    console.error(`${startingPath}: Cannot find module 'yfiles'`)
    return
  }

  const version = getVersionFromJS(yFilesBasePath) || getVersionFromPackage(yFilesBasePath)
  if (version !== SUPPORTED_YFILES_VERSION) {
    resolveToSubmodules = false
    console.warn(
      `Unexpected yFiles major version: ${
        version ? version : 'None detected'
      }. Importing all yFiles types from 'yfiles.js'.`
    )
  }

  const relative = path.relative(staticRoot, yFilesBasePath)
  yFilesServerPath = relative.replace(/\\/g, '/')
}

function getVersionFromJS(yFilesBasePath) {
  const content = fs.readFileSync(path.join(yFilesBasePath, 'yfiles.js'), 'utf8')
  const match = content.match(/This file is part of yFiles for HTML (\d\.\d)/)
  return match != null && match.length > 1 ? match[1] : null
}

function getVersionFromPackage(yFilesBasePath) {
  const file = path.join(yFilesBasePath, 'package.json')
  if (!fs.existsSync(file)) {
    return null
  }
  const content = fs.readFileSync(file, 'utf8')
  const match = content.match(/"version"\s*:\s*"(\d)(\d)/)
  return match != null && match.length > 2 ? `${match[1]}.${match[2]}` : null
}

function checkResolveDirs(staticRoot, resolveDirs) {
  for (const dir of resolveDirs) {
    const fullDir = path.join(staticRoot, dir)
    if (!fs.existsSync(fullDir)) {
      console.warn(`Specified 'resolveDir' does not exist: ${fullDir}`)
    }
  }
}

function addJsSuffix(moduleName) {
  return moduleName.endsWith('.js') ? moduleName : `${moduleName}.js`
}

function transformFile(data, filePath) {
  return data
    .replace(importYfilesRegex, (match, imports, from) => {
      const originalModuleName = from || 'yfiles'
      if (!(originalModuleName === 'yfiles' && resolveToSubmodules)) {
        return `import ${imports} from '/yfiles/${originalModuleName}.js'`
      }

      const neededModules = Object.create(null)
      let [defaultImport] = imports.match(/^[^{,]*/) || []

      let wildcardImport
      if (defaultImport.includes('*')) {
        wildcardImport = defaultImport
        defaultImport = null
      } else {
        wildcardImport = null
      }

      // eslint-disable-next-line prefer-const
      let [fullMatch, namedImportsMatch] = imports.match(/{((?:.|\n|\r|\t)*)}/) || []
      const numLines = fullMatch ? fullMatch.split('\n').length : 1
      if (namedImportsMatch) {
        namedImportsMatch = namedImportsMatch.replace(/\s*\/\/.*/g, '')

        let namedImports = namedImportsMatch.replace(/\s/g, '').split(',')
        namedImports = namedImports.filter(importString => !importString.includes('.'))
        for (const namedImport of namedImports) {
          let submoduleName = es6NameToEsModule[namedImport]
          if (submoduleName == null) {
            updateNameToModuleMap()
            submoduleName = es6NameToEsModule[namedImport]
          }
          if (submoduleName == null) {
            console.error(
              `Export '${namedImport}' not found in module mappings. Keeping import from 'yfiles.js'.`
            )
            submoduleName = 'yfiles'
          }
          if (neededModules[submoduleName] == null) {
            neededModules[submoduleName] = []
          }
          neededModules[submoduleName].push(namedImport)
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
            ([moduleName, imports]) =>
              `import {${imports.join(',')}} from '/yfiles/${moduleName}.js'`
          )
          .join(';') +
        (wildcardImport ? `import ${wildcardImport} from '/yfiles/${originalModuleName}.js'` : '') +
        (numLines > 1 ? '\n' : '') +
        trailingComments
      )
    })
    .replace(
      importYfilesSideEffectRegex,
      (match, moduleName) => `import '/yfiles/${moduleName}.js'`
    )
    .replace(
      otherImportsRegex,
      (match, imports, moduleName) => `import ${imports} from '${addJsSuffix(moduleName)}'`
    )
    .replace(
      otherImportsSideEffectsRegex,
      (match, moduleName) => `import '${addJsSuffix(moduleName)}'`
    )
}

/**
 * Resolves a given yFiles module using the configured resolve locations
 * or falling back to the default library location calculated in {@link findDefaultYFilesServerPath}
 */
function resolveYFilesModulePath(moduleName, staticRoot, resolveDirs = []) {
  let count = 0
  for (const dir of resolveDirs) {
    count++
    const modulePath = `${staticRoot}/${dir}/${moduleName}`.replace(/\\/g, '/')
    if (fs.existsSync(modulePath)) {
      log(`-> using module path: ${modulePath}, (hit ${count} of ${resolveDirs.length})`)
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
  if (logRequests) {
    console.log(logEntry)
  }
}

module.exports.resolve = options => (req, res, next) => {
  const ext = path.extname(req.path)
  if (ext !== '.js') {
    next()
    return
  }
  const { staticRoot, resolveDirs } = options

  log('------------------------------------------------')
  log(`requested: ${req.path}`)
  const match = req.path.match(/.*?\/yfiles\/(.*)/)
  let filePath
  if (match) {
    filePath = resolveYFilesModulePath(match[1], staticRoot, resolveDirs)
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
          checkResolveDirs(staticRoot, resolveDirs)
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

module.exports.findLibraryLocations = findLibraryLocations
