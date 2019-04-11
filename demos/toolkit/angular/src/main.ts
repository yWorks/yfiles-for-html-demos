import { enableProdMode } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'

import { AppModule } from './app/app.module'
import { environment } from './environments/environment'
import { Class, LayoutExecutor, License } from 'yfiles'
import licenseData from '../../../../lib/license.json'
import { enableWorkarounds } from '../../../utils/Workarounds'

// We need to load the yfiles/view-layout-bridge module explicitly to prevent the webpack
// tree shaker from removing this dependency which is needed for the layout functionality in this demo.
Class.ensure(LayoutExecutor)

License.value = licenseData

// enable browser-bug workarounds
enableWorkarounds()

if (environment.production) {
  enableProdMode()
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.log(err))
