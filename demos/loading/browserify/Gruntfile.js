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
'use strict'

/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable global-require */

module.exports = grunt => {
  const contentSrc = './src/'
  const contentDest = './dist/'
  const libSrc = '../../../lib/'
  const packageLibDest = './build/lib/'

  // Runs the yfiles deployment tool to obfuscate and package and combine the yfiles module files and runs browserify
  // on the result
  grunt.registerTask('default', [
    'clean:all',
    'copy:nonJsSource',
    'copy:license',
    'package',
    'browserify'
  ])

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    package: {
      options: {
        libSrc: `${libSrc}umd/`,
        libDest: packageLibDest,
        modules: ['yfiles/view-editor', 'yfiles/view-layout-bridge', 'yfiles/layout-organic'],
        files: [
          {
            expand: true,
            cwd: contentSrc,
            src: ['**/*.js'],
            dest: packageLibDest
          },
          {
            src: '../../utils/Workarounds.js',
            dest: `${packageLibDest}Workarounds.js`
          }
        ],
        blacklist: ['rotate'],
        obfuscate: true,
        optimize: false
      },
      build: {}
    },
    clean: {
      // Without the 'force' option, this task cannot delete files outside this file's subtree
      options: { force: true },
      // Remove all created files in the destination directories.
      all: [contentDest, packageLibDest]
    },
    copy: {
      // Copies non-JavaScript source code files from the demos and lib directories to the destination.
      nonJsSource: {
        files: [
          {
            // copy resources
            expand: true,
            cwd: contentSrc,
            src: ['**', '!**/*.js'],
            dest: contentDest
          },
          {
            // copy lib css
            src: '*.css',
            dest: `${contentDest}resources/`,
            expand: true,
            cwd: libSrc
          },
          {
            // copy demo-framework assets
            cwd: '../..',
            src: ['resources/**', '!**/*.js'],
            dest: contentDest,
            expand: true
          }
        ]
      },
      license: {
        // The license must not be obfuscated. Therefore, it is copied separately.
        expand: true,
        cwd: '../..',
        src: ['resources/license.js'],
        dest: contentDest
      }
    },

    browserify: {
      dist: {
        src: [`${packageLibDest}browserify-demo.js`],
        dest: `${contentDest}bundle.js`
      }
    }
  })

  // Load all grunt tasks listed in package.json, including grunt-yfiles-deployment
  require('load-grunt-tasks')(grunt)
}
