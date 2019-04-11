import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core'
import { GraphComponent, GraphViewerInputMode } from 'yfiles'

@Component({
  selector: 'graph-component',
  templateUrl: './graph-component.component.html',
  styleUrls: ['./graph-component.component.css']
})
export class GraphComponentComponent implements AfterViewInit {
  @ViewChild('graphComponentRef') graphComponentRef: ElementRef
  graphComponent: GraphComponent

  ngAfterViewInit() {
    this.graphComponent = new GraphComponent(this.graphComponentRef.nativeElement)
    this.graphComponent.inputMode = new GraphViewerInputMode()
  }
}
