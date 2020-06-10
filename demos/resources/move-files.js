/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
const fs = require('fs-extra')
const path = require('path')
const walk = require('walk')

const demoData = require('./readme-demo-data')

function run() {
  const demoBasePath = path.join(__dirname, '..')
  if (!fs.existsSync(demoBasePath)) {
    console.warn(`ERROR The demo path does not exist: ${demoBasePath}`)
    return
  }

  createMain(basePath)
  return
  createOverview(demoBasePath)
  const demoData = getDemoData(demoBasePath)

  const walker = walk.walk(demoBasePath, {
    followLinks: false,
    filters: ['node_modules']
  })

  walker.on('directory', function(root, stats, next) {
    // The filters property of walk doesn't seem to work as intended.
    // We get 'public' and 'src' here, but 'testing' is omitted
    if (excludeDirs.includes(stats.name)) {
      next()
      return
    }

    if (fs.existsSync(path.join(root, stats.name, 'README.html'))) {
      processFile(path.join(root, stats.name, 'README.html'), demoData)
      next()
      return
    }
    if (fs.existsSync(path.join(root, stats.name, 'index.html'))) {
      processFile(path.join(root, stats.name, 'index.html'), demoData)
      next()
      return
    }
    next()
  })

  walker.on('errors', function(root, nodeStatsArray, next) {
    next()
  })
}

run()
