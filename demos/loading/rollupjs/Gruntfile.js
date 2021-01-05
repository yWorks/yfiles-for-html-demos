/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
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
const { optimize } = require('@yworks/optimizer')
const rollup = require('rollup')
const { babel } = require('@rollup/plugin-babel')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const replace = require('@rollup/plugin-replace')
const commonjs = require('@rollup/plugin-commonjs')
const json = require('@rollup/plugin-json')

const root = path.join(__dirname, '../../../')
const build = path.join(__dirname, 'build')
const dist = path.join(__dirname, 'dist')

module.exports = function (grunt) {
  grunt.registerTask('default', ['clean', 'copy', 'rollup'])
  grunt.registerTask('production', ['enable-prod', 'clean', 'optimize', 'rollup'])
  grunt.registerTask('enable-prod', function () {
    process.env.NODE_ENV = 'production'
  })

  grunt.registerMultiTask('optimize', function () {
    const files = this.files

    for (const file of files) {
      file.source = grunt.file.read(file.src)
      if (!file.src.some(s => s.endsWith('.js'))) {
        // don't process non-js files, just copy them
        file.result = file.source
      }
    }

    const libFiles = []
    const yfilesPackageFiles = grunt.file.expand(
      { filter: 'isFile' },
      path.join(__dirname, 'node_modules/yfiles') + '/**/*'
    )

    for (const file of yfilesPackageFiles) {
      const source = grunt.file.read(file)
      const destPath = path.join(build, path.relative(root, file))
      if (file.endsWith('.js')) {
        libFiles.push({
          source: source,
          dest: destPath
        })
      } else {
        grunt.file.write(destPath, source)
      }
    }

    optimize(
      libFiles,
      files.filter(f => f.src.every(s => s.endsWith('.js'))),
      {
        logLevel: 'info'
      }
    )

    libFiles.concat(files).forEach(file => {
      grunt.file.write(file.dest, file.result)
    })
  })

  grunt.registerTask('rollup', function () {
    const done = this.async()

    rollup
      .rollup({
        input: path.join(build, 'demos-js/loading/rollupjs/src/RollupJsDemo.js'),
        plugins: [
          replace({ 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) }),
          nodeResolve(),
          json(),
          babel({
            exclude: '**/node_modules/**',
            babelHelpers: 'bundled'
          }),
          commonjs()
        ],
        onwarn(warning) {
          if (warning.code !== 'THIS_IS_UNDEFINED') {
            console.log(warning.message)
          }
        }
      })
      .then(bundle =>
        bundle.write({
          file: path.join(dist, 'bundle.js'),
          format: 'iife'
        })
      )
      .then(done)
  })

  const gruntDemoFiles = [
    {
      expand: true,
      cwd: root,
      src: [`demos-js/loading/rollupjs/**/*.js`, `demos-js/loading/rollupjs/**/*.json`],
      ignore: ['**/node_modules/**', 'demos-js/loading/rollupjs/Gruntfile.js'],
      dest: build
    }
  ]

  grunt.initConfig({
    clean: {
      all: [build, dist]
    },

    optimize: {
      dist: {
        files: gruntDemoFiles
      }
    },

    copy: {
      all: {
        files: gruntDemoFiles
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-contrib-copy')
}
