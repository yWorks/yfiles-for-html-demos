import WidgetBase from '@dojo/framework/widget-core/WidgetBase'
import { DNode } from '@dojo/framework/widget-core/interfaces'
import { tsx } from '@dojo/framework/widget-core/tsx'
import './styles/DemoSidebar.css'

export default class DemoSidebar extends WidgetBase {
  protected render(): DNode {
    return (
      <div>
        <h1 class="demo-sidebar-header">Description</h1>
        <div class="demo-sidebar-content">
          <p>
            This demo shows how to integrate yFiles in a basic{' '}
            <a href="https://dojo.io/" target="_blank">
              Dojo
            </a>{' '}
            application based on the Dojo <code>cli-create-app</code>.
          </p>
          <p>
            The application is separated into different widgets utilizing both the Virtual DOM
            approach for creating the <a href="https://docs.yworks.com/yfileshtml/#/api/GraphComponent" target="_blank">GraphComponent</a> as well as the JSX support to create
            this description sidebar.
          </p>
          <h2>Building the Demo</h2>
          <p>
            The demo is using <code>Dojo CLI</code>, thus the following steps are required to start
            it:
          </p>
          <code>
            {' '}
            > npm install <br />> npm run dev{' '}
          </code>
          <p>This will start the development server of the Dojo application.</p>

          <h2>Things to Try</h2>

          <ul>
            <li>Toggle editing support using the "Toggle Editing" button.</li>
            <li>
              After the graph has been edited, click{' '}
              <img style="vertical-align: middle" src={require('../assets/reload-16.svg')} /> to
              reload the initial sample graph.
            </li>
            <li>
              The integrated development server of the Dojo CLI project will automatically update
              the application upon code changes.
            </li>
          </ul>
        </div>
      </div>
    )
  }
}
