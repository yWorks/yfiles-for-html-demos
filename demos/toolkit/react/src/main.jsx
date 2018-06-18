'use strict'

/* eslint-disable import/no-unresolved */

const demo = require('../../../resources/demo-app')
require('../../../resources/license.js')

const React = require('react')
const ReactDOM = require('react-dom')
const App = require('./app')

ReactDOM.render(<App />, document.getElementById('react-app'))

demo.show()
