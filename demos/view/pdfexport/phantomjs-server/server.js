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
/* global phantom */

const fs = require('fs')

const port = 8081
const server = require('webserver').create()

const page = require('webpage').create()
const url = 'file://' + fs.absolute('./dummy-page.html')

const svgDrawer = function(params) {
  const div = document.createElement('div')
  document.body.style.width = params.width
  document.body.style.height = params.height
  div.innerHTML = params.svg
  document.body.appendChild(div)
}

const service = server.listen(port, function(request, response) {
  if (typeof request.post === 'string' && request.post === 'isAlive') {
    response.statusCode = 200
    response.headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'X-Requested-With'
    }
    response.write('true')
    response.close()
    return
  }

  const svgString = request.post.svgString
  const format = request.post.format
  const width = request.post.width
  const height = request.post.height
  const margin = request.post.margin

  const w = parseInt(width) + 2 * parseInt(margin)
  const h = parseInt(height) + 2 * parseInt(margin)
  page.viewPortSize = {
    width: w,
    height: h
  }
  page.zoomFactor = 1.0
  page.scrollPosition = {
    top: 0,
    left: 0
  }

  page.open(url, function(status) {
    const params = {
      svg: svgString,
      margin: margin,
      width: w,
      height: h
    }

    page.evaluate(svgDrawer, params)

    // The exported size is buggy in phantomJs 2.0
    page.paperSize = {
      width: w + 'px',
      height: h + 'px',
      margin: {
        top: 0,
        left: 0,
        right: margin + 'px',
        bottom: margin + 'px'
      }
    }
    const tempFile = 'temp.' + format
    page.render(tempFile, format)

    const pdfFileStream = fs.open(tempFile, 'rb')
    const content = pdfFileStream.read()
    pdfFileStream.close()
    fs.remove(tempFile)

    response.statusCode = 200
    response.headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'X-Requested-With',
      Cache: 'no-cache',
      'Content-Disposition': 'attachment; filename=graph.pdf',
      'Content-Type': 'application/pdf'
    }
    response.setEncoding('binary') // broken in PhantomJS 2.0 https://github.com/ariya/phantomjs/issues/13026
    response.write(content)
    response.close()
  })
})

if (service) {
  console.log('Web server running on port ' + port)
} else {
  console.log('Error: Could not create web server listening on port ' + port)
  phantom.exit()
}
