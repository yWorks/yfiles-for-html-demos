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
const path = require('path')
const fs = require('fs')
const http = require('http')
const https = require('https')
const express = require('express')
const multer = require('multer') // multipart/form-data parsing
const opn = require('opn')
const favicon = require('serve-favicon')

const es6ModuleMappings = require('../../tools/common/ES6ModuleMappings.json')

const defaultPage = '/README.html'
const app = express()
const staticRoot = path.join(__dirname, '../..')
const importYfilesRegex = /import\s+([\s\S]*?)\s+from\s+['"]yfiles\/?([^'"]*)['"]/g

const es6NameToEsModule = {
  yfiles: 'lang'
}

for (const [esModuleName, implModuleMap] of Object.entries(es6ModuleMappings)) {
  for (const nameMap of Object.values(implModuleMap)) {
    for (const es6Name of Object.values(nameMap)) {
      es6NameToEsModule[es6Name] = esModuleName
    }
  }
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Expose-Headers', 'X-Powered-By, X-yFiles-for-HTML-Demo-Server')
  res.header('X-yFiles-for-HTML-Demo-Server', 'true')
  if (req.path && /demos[\\/](?!node_modules).*\.js$/i.test(req.path)) {
    // disables caching
    res.header('Cache-Control', 'no-store')
  } else {
    res.header('Cache-Control', 'public, max-age=31536000')
  }
  next()
})

app.use(favicon(path.join(staticRoot, 'demos/resources/image', 'favicon.ico')))

const serveStatic = express.static(staticRoot, {
  index: ['README.html', 'index.html', 'index.htm']
})

function resolveModuleName(moduleName, basePath) {
  return path
    .join(
      path.relative(path.dirname(basePath), staticRoot),
      `demos/node_modules/yfiles/${moduleName}.js`
    )
    .replace(/\\/g, '/')
}

function transformFile(data, filePath) {
  return data.replace(importYfilesRegex, (match, imports, from) => {
    const module = from || 'yfiles'
    if (module === 'yfiles') {
      const neededModules = {}
      const [defaultImport] = imports.match(/^[^{,]*/) || []
      let [fullMatch, namedImportsMatch] = imports.match(/{((?:.|\n|\r|\t)*)}/) || []
      const numLines = fullMatch.split('\n').length
      if (namedImportsMatch) {
        namedImportsMatch = namedImportsMatch.replace(/\s*\/\/.*/g, '')

        const namedImports = namedImportsMatch.replace(/\s/g, '').split(',')
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
        .fill('// keep linenumbers with imports adapted by demoserver')
        .join('\n')

      return (
        Object.entries(neededModules)
          .map(
            ([moduleName, imports]) =>
              `import {${imports.join(',')}} from '${resolveModuleName(moduleName, filePath)}'`
          )
          .join(';') +
        (numLines > 1 ? '\n' : '') +
        trailingComments
      )
    } else {
      return `import ${imports} from '${resolveModuleName(module, filePath)}'`
    }
  })
}

app.use('/', (req, res, next) => {
  const filePath = path.join(staticRoot, req.path)
  const ext = path.extname(filePath)
  if ((/demos[\\/]/i.test(filePath) || /compatibility[\\/]/i.test(filePath)) && ext === '.js') {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return res.sendStatus(404)
      }
      res.type(ext)
      if (importYfilesRegex.test(data)) {
        data = transformFile(data, filePath)
      }
      res.send(data)
    })
  } else {
    next()
  }
})

app.use('/', serveStatic)

//
// file save/load support for the fileoperations demo
//
const upload = multer({
  storage: multer.memoryStorage() // don't write the uploaded file to disk
})

app.get('/file/isAlive', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'X-Requested-With'
  })
  res.status(200).send('yes')
})

app.post('/file/save', upload.single('demo-input-graph'), (req, res) => {
  const graphml = req.body['demo-input-graph']

  const fileNameParam = req.query.fn
  const fileName = fileNameParam || 'graph.graphml'

  res
    .set({
      'Content-Type': 'text/xml',
      'Content-Disposition': 'attachment; filename="' + fileName + '"',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'X-Requested-With'
    })
    .send(graphml)
})

//
// proxy server for TransitivityDemo for queries regarding npm packages
//
app.get('/npm-request', (request, outerResponse) => {
  const type = request.query.type
  const npmPackage = request.query.package

  let url
  if (type === 'dependencies') {
    url = 'https://registry.npmjs.org/' + npmPackage + '/latest'
  } else if (type === 'dependents') {
    url =
      'https://registry.npmjs.org/-/_view/dependedUpon?group_level=2&startkey=%5B%22' +
      npmPackage +
      '%22%5D&endkey=%5B%22' +
      npmPackage +
      '%22%2C%7B%7D%5D&skip=0&limit=5000'
  } else {
    return outerResponse.status(500).send('Invalid query type!')
  }

  https
    .get(url, res => {
      let completeResponse = ''

      res.on('data', chunk => (completeResponse += chunk))
      res.on('end', () => {
        outerResponse.set({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'X-Requested-With'
        })
        outerResponse.status(200).send(completeResponse)
      })
    })
    .on('error', err => outerResponse.status(500).send(JSON.stringify(err)))
})

const inputFormName = 'demo-open-input'
app.post('/file/load', upload.single(inputFormName), (req, res) => {
  let message = ''

  if (!req.file) {
    message =
      '!ERROR! The specified file part of name ' + inputFormName + ' was not found in the request.'
  } else {
    message = encodeURIComponent(req.file.buffer)
  }

  // To keep the demo page open, the response is sent to an iframe, where a message containing the GraphML content
  // is posted to the parent window
  res
    .set({
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'X-Requested-With'
    })
    .send(`<html><body><script>window.parent.postMessage('${message}', '*')</script></body></html>`)
})

let port = 3000
const server = http.createServer(app)

server.on('error', e => {
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${port} already in use, retrying to start demo server...`)
    setTimeout(() => {
      server.close()
      server.listen(port)
    }, 1000)
  }
})

server.on('listening', () => {
  console.log(`Demo server listening at localhost:${port}`)

  // open the documentation page (hopefully in a browser)
  if (typeof process.env.NO_OPEN === 'undefined') {
    opn(`http://localhost:${port}${defaultPage}`)
  }
})

server.listen(port)
