import fs from 'node:fs'

import { LayoutExecutorAsyncWorker, License, HierarchicLayout, DefaultGraph } from 'yfiles'
import express from 'express'

const licenseData = JSON.parse(fs.readFileSync('../../../../lib/license.json', 'utf8'))
License.value = licenseData

function applyLayout(graph) {
  // apply an HierarchicLayout on the input graph
  const layout = new HierarchicLayout({
    nodeToNodeDistance: 50,
    considerNodeLabels: true,
    integratedEdgeLabeling: true
  })
  return layout.applyLayout(graph)
}

// Create a minimal Express server to read the JSON data passed as POST body
const app = express()
app.use(express.json())
app.use((req, res, next) => {
  // Allow cross-origin requests
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  next()
})

// Listen at localhost:3001
const server = app.listen(3001, () => {
  const host = server.address().address
  const port = server.address().port

  console.log('Layout server listening at http://%s:%s', host, port)
})

// Listen to /layout POST requests
app.post('/layout', async (req, res) => {
  if (!checkLicense()) {
    const message =
      'License validation failed. Make sure that your license allows using yFiles in out-of-browser environments (oobAllowed)'
    console.log(message)
    res.status(500).send(message)
    return
  }

  const data = req.body

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
