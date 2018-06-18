/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/* eslint-disable no-multi-str,no-unused-vars */

'use strict'

const defaultPage = '/doc/readme/documentation.html'

const http = require('http')

const express = require('express')
const app = express()

// Send README.html for directory requests
app.use('/', express.static('../../', { index: ['README.html', 'index.html', 'index.htm'] }))

const server = app.listen(3000, function() {
  console.log('Demo Server listening at localhost:3000')

  // open the documentation page (hopefully in a browser)
  const open = require('open')
  open('http://localhost:3000' + defaultPage)
})

//
// file save/load support for the fileoperations demo
//
const multer = require('multer') // multipart/form-data parsing
const upload = multer({
  storage: multer.memoryStorage() // don't write the uploaded file to disk
})

app.get('/file/isAlive', function(req, res) {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'X-Requested-With'
  })
  res.status(200).send('yes')
})

app.post('/file/save', upload.single('demo-input-graph'), function(req, res) {
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
app.get('/npm-request', function(request, outerResponse) {
  const type = request.query.type
  const npmPackage = request.query.package

  let url
  if (type === 'dependencies') {
    url = 'http://registry.npmjs.org/' + npmPackage + '/latest'
  } else if (type === 'dependents') {
    url =
      'http://registry.npmjs.org/-/_view/dependedUpon?group_level=2&startkey=%5B%22' +
      npmPackage +
      '%22%5D&endkey=%5B%22' +
      npmPackage +
      '%22%2C%7B%7D%5D&skip=0&limit=5000'
  } else {
    outerResponse.status(500).send('Invalid query type!')
  }

  http
    .get(url, function(res) {
      let completeResponse = ''

      res.on('data', function(chunk) {
        completeResponse += chunk
      })
      res.on('end', function(chunk) {
        outerResponse.set({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'X-Requested-With'
        })
        outerResponse.status(200).send(completeResponse)
      })
    })
    .on('error', function(err) {
      outerResponse.status(500).send(JSON.stringify(err))
    })
})

const inputFormName = 'demo-open-input'
app.post('/file/load', upload.single(inputFormName), function(req, res) {
  let message = ''

  const file = req.file
  if (!file) {
    message =
      '!ERROR! The specified file part of name ' + inputFormName + ' was not found in the request.'
  } else {
    const content = file.buffer
    message = encodeURIComponent(content)
  }

  // To keep the demo page open, the response is send to an iframe, where a message containing the GraphML content
  // is posted to the parent window
  res
    .set({
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'X-Requested-With'
    })
    .send(
      "<html>\
            <body>\
              <script type='text/javascript'>\
                window.parent.postMessage('" +
        message +
        "','*') ;\n\
               </script>\
            </body>\
          </html>"
    )
})
