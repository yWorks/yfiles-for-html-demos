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
const { optimize } = require('@yworks/optimizer')
const rollup = require('rollup')

const root = path.join(__dirname, '../../../')
const build = path.join(__dirname, 'build')
const dist = path.join(__dirname, 'dist')

module.exports = function(grunt) {
  grunt.registerTask('default', ['clean', 'optimize', 'rollup'])

  grunt.registerMultiTask('optimize', function() {
    const files = this.files

    for (file of files) {
      file.source = grunt.file.read(file.src)
      // resolve yfiles import
      file.source = file.source.replace(/from 'yfiles'/gi, () => {
        const resolvedPath = path
          .join(
            path.relative(path.dirname(file.src[0]), root),
            `demos/node_modules/yfiles/yfiles.js`
          )
          .replace(/\\/g, '/')
        return `from '${resolvedPath}'`
      })
    }

    const libFiles = grunt.file
      .expand(
        path.join(root, 'demos/node_modules/yfiles') + '/**/*.js',
        root + 'ide-support/yfiles-typeinfo.js'
      )
      .map(f => ({
        source: grunt.file.read(f),
        dest: path.join(build, path.relative(root, f))
      }))

    optimize(libFiles, files)

    libFiles.concat(files).forEach(file => {
      grunt.file.write(file.dest, file.result)
    })
  })

  grunt.registerTask('rollup', function() {
    const done = this.async()

    rollup
      .rollup({
        input: path.join(build, 'demos/loading/rollupjs/src/RollupJsDemo.js'),
        onwarn(warning) {
          if (warning.code !== 'THIS_IS_UNDEFINED') {
            console.log(warning.message)
          }
        },
        // unfortunately, tree-shaking breaks yFiles
        treeshake: false
      })
      .then(bundle =>
        bundle.write({
          file: path.join(dist, 'bundle.js'),
          format: 'iife'
        })
      )
      .then(done)
  })

  grunt.initConfig({
    clean: [build, dist],

    optimize: {
      dist: {
        files: [
          {
            expand: true,
            cwd: root,
            src: [`demos/loading/rollupjs/**/*.js`, `demos/{resources,utils}/**/*.js`],
            ignore: ['**/node_modules/**', 'demos/loading/rollupjs/Gruntfile.js'],
            dest: build
          }
        ]
      }
    },

    copy: {}
  })

  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-contrib-copy')
}
