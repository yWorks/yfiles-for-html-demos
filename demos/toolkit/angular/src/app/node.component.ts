import { Component, Input, ChangeDetectorRef } from '@angular/core'
import { Person } from './person'

function findBreak(text: string) {
  let result = Math.max(Math.floor(text.length / 2), 20)
  while (result < text.length && text[result] !== ' ' && result > 0) {
    result -= 1
  }
  return result
}

@Component({
  selector: 'g[node-component]',
  template: `
    <svg:g>
      <rect fill="#C0C0C0" width="285" [attr.height]="zoom > zoomIntermediate ? 100 : 103" 
        [attr.transform]="'translate('+(zoom > zoomIntermediate ? '2 2' : '-1 -1')+')'"/>
      <rect fill="#FFFFFF" stroke="#C0C0C0" width="285" height="100"/>
      <g style="font-family:Roboto,sans-serif; font-weight: 300; fill: #444" [style.font-size.px]="zoom > zoomDetail ? 10 : 15">
        <image *ngIf="zoom > zoomIntermediate" [attr.xlink:href]="item.icon" 
          [attr.transform]="zoom > zoomDetail ? 'scale(0.85) translate(15 20)' : 'scale(0.75) translate(15 30)'" width="75px" height="75px"/>
        <text [attr.transform]="'translate('+(zoom > zoomIntermediate ? zoom > zoomDetail ? '100 25' : '75 40' : '30 60')+')'" 
          fill="#336699" [style.font-size.px]="zoom > zoomIntermediate ? zoom > zoomDetail ? 16 : 24 : 40">{{nameAbbreviation}}</text>
        <ng-template [ngIf]="zoom > zoomIntermediate">
          <text [attr.transform]="'translate('+(zoom > zoomDetail ? '100 45' : '75 70')+')'" 
            style="text-transform: uppercase; font-weight: 400">{{positionFirstLine}}</text>
          <text [attr.transform]="'translate('+(zoom > zoomDetail ? '100 60' : '75 90')+')'" 
            style="text-transform: uppercase; font-weight: 400">{{positionSecondLine}}</text>
        </ng-template>
        <ng-template [ngIf]="zoom > zoomDetail">
          <text transform="translate(100 75)">{{item.email}}</text>
          <text transform="translate(100 92)">{{item.phone}}</text>
          <text transform="translate(170 92)">{{item.fax}}</text>
        </ng-template>
      </g>
    </svg:g>
`
})
export class NodeComponent {
  @Input() public item: Person
  @Input() public zoom: number

  constructor(private changeDetector: ChangeDetectorRef) {
    this.item = <Person>{}
  }

  get zoomDetail() {
    return 0.7
  }

  get zoomIntermediate() {
    return 0.4
  }

  get positionFirstLine() {
    const pos = this.item.position
    return pos.substring(0, findBreak(pos))
  }

  get positionSecondLine() {
    const pos = this.item.position
    return pos.substring(findBreak(pos) + 1)
  }

  get nameAbbreviation() {
    if (this.zoom >= this.zoomIntermediate) {
      return this.item.name
    }
    const strings = this.item.name.split(' ')
    let converted = `${strings[0].substr(0, 1)}.`
    for (let i = 1; i < strings.length; i++) {
      converted += ` ${strings[i]}`
    }
    return converted
  }
}
