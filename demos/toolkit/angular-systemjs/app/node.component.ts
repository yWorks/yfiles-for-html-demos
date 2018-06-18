import { Component, Input, ChangeDetectorRef } from '@angular/core'
import { NodeData } from './node-data'

@Component({
  selector: 'g[node-component]',
  template: `<svg:g>\
<rect fill="url(#nodeGradient)" stroke="#249AE7" stroke-width="3" rx="8" ry="8" width="250" height="100"/>\
<image [attr.xlink:href]="nodeData.icon" transform="translate(5 15)" width="58px" height="66px" xlink:href="resources/usericon_female1.svg"></image>\
<text transform="translate(80 20)" style="font-size:10px; font-family:Arial; fill:#505050">{{nodeData.name}}</text>\
<text transform="translate(80 38)" style="font-size:8px; font-family:Arial; fill:#505050">{{nodeData.position}}</text>\
<text transform="translate(80 56)" style="font-size:10px; font-family:Arial; fill:#505050">{{nodeData.email}}</text>\
<text transform="translate(80 74)" style="font-size:10px; font-family:Arial; fill:#505050">{{nodeData.phone}}</text>\
<text transform="translate(80 92)" style="font-size:10px; font-family:Arial; fill:#505050">{{nodeData.fax}}</text>\
</svg:g>'`
})
export class NodeComponent {
  @Input() public nodeData: NodeData

  constructor(private changeDetector: ChangeDetectorRef) {
    this.nodeData = <NodeData>{}

    // When a NodeComponent is displayed in the GraphComponent,
    // we need to poll for changes manually, because the node visualization is not part
    // of the regular Angular 2 component hierarchy.
    setTimeout(() => this.changeDetector.detectChanges(), 0)
    setInterval(() => this.changeDetector.detectChanges(), 500)
  }
}
