import renderer from '@dojo/framework/widget-core/vdom'
import Registry from '@dojo/framework/widget-core/Registry'
import { w } from '@dojo/framework/widget-core/d'
import '@dojo/themes/dojo/index.css'

import App from './App'

const registry = new Registry()

const r = renderer(() => w(App, {}))
r.mount({ registry })
