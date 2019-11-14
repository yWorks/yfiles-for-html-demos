/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
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
'use strict'

/* eslint-disable global-require */
/* eslint-disable import/no-unresolved */

const rollup = require('rollup')
const path = require('path')

module.exports = grunt => {
  const srcDir = './src/'
  const destDir = './dist/'
  const deployDir = './deployed/'
  const libDir = '../../../lib/'
  const libEs6Src = `${libDir}es6-modules/`
  const packageLibDest = path.join(deployDir, 'lib')
  const bundleDir = './bundled/'

  grunt.registerTask('default', ['clean:all', 'copy:resolveModulePaths'])

  grunt.registerTask('deploy', ['default', 'copy:deploy', 'package'])

  grunt.registerTask('bundle', ['deploy', 'copy:bundle', 'rollup'])

  grunt.registerTask('rollup', 'Uses rollup.js to create a bundle for the demo.', function() {
    const done = this.async()

    rollup
      .rollup({
        input: path.join(deployDir, 'ES6ModulesDemo.js'),
        onwarn(warning) {
          if (warning.code !== 'THIS_IS_UNDEFINED') {
            console.log(warning.message)
          }
        },
        treeshake: false
      })
      .then(bundle =>
        bundle.write({
          file: path.join(bundleDir, 'bundle.js'),
          format: 'es'
        })
      )
      .then(done)
  })

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    package: {
      options: {
        libSrc: libEs6Src,
        libDest: packageLibDest,
        modules: [
          'yfiles/core',
          'yfiles/view-editor',
          'yfiles/view-layout-bridge',
          'yfiles/layout-core',
          'yfiles/layout-hierarchic'
        ],
        files: [
          {
            expand: true,
            cwd: deployDir,
            src: ['ES6ModulesDemo.js', 'ES6ModuleNodeStyle.js'],
            dest: deployDir
          }
        ],
        blacklist: [],
        obfuscate: true,
        optimize: false
      },
      build: {}
    },

    clean: {
      // Without the 'force' option, this task cannot delete files outside this file's subtree
      options: { force: true },
      // Remove all created files in the destination directories.
      all: [destDir, deployDir, bundleDir]
    },

    copy: {
      resolveModulePaths: {
        files: [
          {
            expand: true,
            cwd: srcDir,
            src: ['*.js', 'index.html'],
            dest: destDir
          }
        ],
        options: {
          process: content =>
            content.replace(/yfiles\/[^'"]+/g, '../../../../lib/es6-modules/$&.js')
        }
      },
      deploy: {
        files: [
          {
            expand: true,
            cwd: '../../resources',
            src: ['**', '!**/*.js', 'license.js'],
            dest: path.join(deployDir, 'resources')
          },
          {
            src: path.join(libDir, 'yfiles.css'),
            dest: path.join(deployDir, 'lib/yfiles.css')
          },
          {
            src: path.join(srcDir, 'index.html'),
            dest: path.join(deployDir, 'index.html')
          },
          {
            expand: true,
            cwd: destDir,
            src: ['*.js'],
            dest: deployDir
          }
        ],
        options: {
          // Adjusts the URLs to the 'flattened' destination directory structure in HTML files, especially references
          // to the yFiles library and the shared demo resources.
          process: content =>
            content
              .replace(/..\/..\/..\/..\/lib\/(umd\/|es6-modules\/)?(\/)?/g, './lib$2/')
              .replace(/..\/..\/..\/resources(\/)?/g, './resources$1')
        }
      },
      bundle: {
        files: [
          {
            expand: true,
            cwd: deployDir,
            src: ['**', '!**/*.{js}'],
            dest: bundleDir
          },
          {
            src: path.join(deployDir, 'resources/license.js'),
            dest: path.join(bundleDir, 'resources/license.js')
          }
        ],
        options: {
          process: content => content.replace(/src="ES6ModulesDemo\.js"/, 'src="bundle.js"')
        }
      }
    }
  })

  require('load-grunt-tasks')(grunt)
}
