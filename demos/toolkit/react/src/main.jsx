import licenseData from '../../../../lib/license.json'
import { License } from 'yfiles'
import { enableWorkarounds } from '../../../utils/Workarounds'
License.value = licenseData

enableWorkarounds()

import React from 'react'
import ReactDOM from 'react-dom'
import App from './app.jsx'

ReactDOM.render(<App />, document.getElementById('react-app'))

// showApp()
