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
const path = require('path')
const fs = require('fs')
const http = require('http')
const https = require('https')
const express = require('express')
const multer = require('multer') // multipart/form-data parsing
const open = require('open')
const favicon = require('serve-favicon')
const resolveYFiles = require('./resolve-yfiles')
const topLevelPackageJson = require('../../package.json')

let defaultPage = '/demos-ts/README.html'
if (process.argv.length > 2) {
  defaultPage = process.argv[2]
}

const app = express()
const server = http.createServer(app)

let staticRoot = path.join(__dirname, '../..')
if (typeof process.env.DEMO_SERVER_ROOT !== 'undefined') {
  staticRoot = path.resolve(process.env.DEMO_SERVER_ROOT)
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Expose-Headers', 'X-Powered-By, X-yFiles-for-HTML-Demo-Server')
  res.header('X-yFiles-for-HTML-Demo-Server', topLevelPackageJson.version)
  if (req.path && req.path.includes('node_modules/yfiles')) {
    // disables caching
    res.header('Cache-Control', 'no-store')
  }
  next()
})

app.get('/self-path', (req, res) => {
  res.send(__dirname)
})

app.post('/shutdown', (req, res) => {
  console.log('Shutdown signal received, stopping...')
  res.sendStatus(200)
  server.close()
})

const favIconPath = path.join(staticRoot, 'demos-js/resources/image', 'favicon.ico')
if (fs.existsSync(favIconPath)) {
  app.use(favicon(favIconPath))
}

const serveStatic = express.static(staticRoot, {
  index: ['README.html', 'index.html', 'index.htm']
})

app.use(resolveYFiles.resolve({ staticRoot }))

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
  const version = request.query.version || 'latest'

  const isScoped = npmPackage.startsWith('@')

  let url
  if (type === 'dependencies') {
    url = 'https://registry.npmjs.org/' + npmPackage + '/' + (!isScoped ? version : '')
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
        console.log(url)
        let responseData
        if (!isScoped) {
          responseData = completeResponse
        } else {
          const responseJSON = JSON.parse(completeResponse)
          const v = version === 'latest' ? responseJSON['dist-tags'].latest : version
          responseData = JSON.stringify(responseJSON.versions[v])
        }
        outerResponse.status(200).send(responseData)
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
    .send(
      `<html lang="en"><body><script>window.parent.postMessage('${message}', '*')</script></body></html>`
    )
})

app.use(express.json())

app.post('/config/setConfig', (req, res) => {
  try {
    resolveYFiles.setResolveConfig(
      JSON.stringify({ logRequests: req.body.logRequests, resolveDirs: [...req.body.resolveDirs] })
    )
    res.set({ 'Content-Type': 'application/json' })
    res.status(200).send(JSON.stringify(resolveYFiles.getResolveConfig()))
  } catch (e) {
    res.status(500).send(e.toString())
  }
})

app.get('/config/getConfig', (req, res) => {
  res.set({ 'Content-Type': 'application/json' })
  res.status(200).send(JSON.stringify(resolveYFiles.getResolveConfig()))
})

app.get('/config/getLibraryLocations', (req, res) => {
  try {
    const libraryLocations = resolveYFiles.findLibraryLocations(staticRoot)
    res.set({ 'Content-Type': 'application/json' })
    res.status(200).send(JSON.stringify(libraryLocations))
  } catch (e) {
    res.status(500).send(e.toString())
  }
})

let port = 4242
if (typeof process.env.DEMO_SERVER_PORT !== 'undefined') {
  port = parseInt(process.env.DEMO_SERVER_PORT, 10)
}

server.on('error', e => {
  if (e.code === 'EADDRINUSE') {
    console.error(
      `Port ${port} already in use (maybe the demo-server is already running?), retrying to start demo server...`
    )
    setTimeout(() => {
      server.close()
      server.listen(port)
    }, 1000)
  }
})

server.on('listening', () => {
  console.log(`Demo server listening at http://localhost:${port}`)

  // open the documentation page (hopefully in a browser)
  if (typeof process.env.NO_OPEN === 'undefined') {
    open(`http://localhost:${port}${defaultPage}`)
  }
})

server.listen(port)

module.exports = app
