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
const fs = require('fs')
const path = require('path')

const SUPPORTED_YFILES_VERSION = '2.2'
const ignoredFiles = /filesystem-warning\.js$/

const importYfilesRegex = /import\s+([^'"]*?)\s+from\s+['"]yfiles\/?([^'"]*)['"]/g
const importYfilesSideEffectRegex = /import\s+['"]yfiles\/?([^'"]*)['"]/g
const es6NameToEsModule = {
  yfiles: 'lang'
}

let yFilesServerPath
let resolveToSubmodules = true

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

function resolveYfilesServerPath(staticRoot, startingPath) {
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
  yFilesServerPath = `/${relative}`.replace(/\\/g, '/')
}

const resolveModuleName = filePath => moduleName => {
  return `${yFilesServerPath}/${moduleName}.js`.replace(/\\/g, '/')
}

function transformFile(data, filePath) {
  const resolveModule = resolveModuleName(filePath)
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
          if (!neededModules['lang']) {
            neededModules['lang'] = []
          }
          if (defaultImport === 'yfiles') {
            neededModules['lang'].push(defaultImport)
          } else {
            neededModules['lang'].push('yfiles as ' + defaultImport)
          }
        }

        const trailingComments = new Array(numLines - 1)
          .fill('// keep line numbers consistent due to import statement replacements')
          .join('\n')

        return (
          Object.entries(neededModules)
            .map(
              ([moduleName, imports]) =>
                `import {${imports.join(',')}} from '${resolveModule(moduleName)}'`
            )
            .join(';') +
          (wildcardImport ? `import ${wildcardImport} from '${resolveModule(module)}'` : '') +
          (numLines > 1 ? '\n' : '') +
          trailingComments
        )
      } else {
        return `import ${imports} from '${resolveModule(module)}'`
      }
    })
    .replace(
      importYfilesSideEffectRegex,
      (match, moduleName) => `import '${resolveModule(moduleName)}'`
    )
}

module.exports = options => (req, res, next) => {
  const ext = path.extname(req.path)
  if (ext !== '.js') {
    next()
    return
  }
  const staticRoot = options.staticRoot
  const filePath = path.join(staticRoot, req.path)
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      next()
      return
    }

    if (!ignoredFiles.test(filePath)) {
      if (importYfilesRegex.test(data)) {
        if (!yFilesServerPath) {
          resolveYfilesServerPath(staticRoot, filePath)
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
