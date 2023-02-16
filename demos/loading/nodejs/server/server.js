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
const licenseData = require('../../../../lib/license')

const { LayoutExecutorAsyncWorker, License, HierarchicLayout, DefaultGraph } = require('yfiles-umd')

function applyLayout(graph) {
  // apply an HierarchicLayout on the input graph
  const layout = new HierarchicLayout({
    nodeToNodeDistance: 50,
    considerNodeLabels: true,
    integratedEdgeLabeling: true
  })
  return layout.applyLayout(graph)
}

// Create a minimal Express server
const express = require('express')
const bodyParser = require('body-parser')
// to read the JSON data passed as POST body
const app = express()
app.use(bodyParser.text({ limit: '5mb' }))

// Listen at localhost:3001
const server = app.listen(3001, () => {
  const host = server.address().address
  const port = server.address().port

  console.log('Layout server listening at http://%s:%s', host, port)
})

// Listen to /layout POST requests
app.post('/layout', async (req, res) => {
  // Allow cross-origin requests
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')

  License.value = licenseData

  if (!checkLicense()) {
    const message =
      'License validation failed. Make sure that your license allows using yFiles in out-of-browser environments (oobAllowed)'
    console.log(message)
    res.status(500).send(message)
    return
  }

  const data = JSON.parse(req.body)

  // The LayoutExecutorAsyncWorker can be hooked up with messages from the LayoutExecutorAsync
  const executor = new LayoutExecutorAsyncWorker(applyLayout)

  // run the LayoutExecutorAsyncWorker on the input data
  try {
    const result = await executor.process(data)
    // return the data of the layouted graph to the main thread
    res.write(JSON.stringify(result))
  } catch (e) {
    res.write(JSON.stringify(e))
  }

  res.end()
})

function checkLicense() {
  const g = new DefaultGraph()
  g.createNode()
  return g.nodes.size > 0
}
