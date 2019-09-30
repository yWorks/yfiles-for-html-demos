import { tsx } from '@dojo/framework/widget-core/tsx'
import WidgetBase from '@dojo/framework/widget-core/WidgetBase'
import { DNode } from '@dojo/framework/widget-core/interfaces'
import './App.css'
import DemoSidebar from './widgets/DemoSidebar'
import GraphWidget from './widgets/GraphWidget'

export default class App extends WidgetBase {
  protected render(): DNode {
    return (
      <div id="app">
        <aside class="demo-sidebar demo-description">
          <DemoSidebar />
        </aside>

        <div class="demo-content">
          <div class="demo-header">
            <a href="https://www.yworks.com" target="_blank">
              {' '}
              <img src={require('./assets/ylogo.svg')} class="demo-y-logo" />{' '}
            </a>{' '}
            <a href="../../../README.html" target="_blank">
              {' '}
              yFiles for HTML{' '}
            </a>{' '}
            <span class="demo-title">Dojo Demo [yFiles for HTML]</span>
          </div>

          <GraphWidget />
        </div>
      </div>
    )
  }
}
