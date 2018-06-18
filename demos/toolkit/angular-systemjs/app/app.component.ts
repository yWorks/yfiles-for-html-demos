import {
  Component,
  AfterViewInit,
  Compiler,
  NgModule,
  ViewChild,
  ViewContainerRef
} from '@angular/core'
import { GraphDataService } from './graph-data.service'
import { NodeData } from './node-data'

declare const demo: any
declare var System: any

@Component({
  selector: 'yfiles-angular-app',
  // The single GraphDataService - don't add another one in child components, so
  // all components use the same data.
  providers: [GraphDataService],
  templateUrl: './templates/app.html'
})
export class AppComponent implements AfterViewInit {
  constructor(private compiler: Compiler) {}

  public currentItem: NodeData = null

  /**
   * The GraphControl child component emits an event when
   * the current item changes. This method is declared as a listener for
   * the child component's output property in the app template HTML, like this:
   * (currentItem)="currentItemChanged($event)"
   */
  currentItemChanged(item: NodeData) {
    this.currentItem = item
  }

  ngAfterViewInit() {
    System.import('resources/demo-app.js').then(app => {
      app.show()
    })
  }
}
