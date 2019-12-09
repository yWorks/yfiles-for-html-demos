/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
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
      <rect
        fill="#C0C0C0"
        width="285"
        [attr.height]="zoom > zoomIntermediate ? 100 : 103"
        [attr.transform]="'translate(' + (zoom > zoomIntermediate ? '2 2' : '-1 -1') + ')'"
      />
      <rect fill="#FFFFFF" stroke="#C0C0C0" width="285" height="100" />
      <g
        style="font-family:Roboto,sans-serif; font-weight: 300; fill: #444"
        [style.font-size.px]="zoom > zoomDetail ? 10 : 15"
      >
        <image
          *ngIf="zoom > zoomIntermediate"
          [attr.xlink:href]="item.icon"
          [attr.transform]="
            zoom > zoomDetail ? 'scale(0.85) translate(15 20)' : 'scale(0.75) translate(15 30)'
          "
          width="75px"
          height="75px"
        />
        <text
          [attr.transform]="
            'translate(' +
            (zoom > zoomIntermediate ? (zoom > zoomDetail ? '100 25' : '75 40') : '30 60') +
            ')'
          "
          fill="#336699"
          [style.font-size.px]="zoom > zoomIntermediate ? (zoom > zoomDetail ? 16 : 24) : 40"
        >
          {{ nameAbbreviation }}
        </text>
        <ng-template [ngIf]="zoom > zoomIntermediate">
          <text
            [attr.transform]="'translate(' + (zoom > zoomDetail ? '100 45' : '75 70') + ')'"
            style="text-transform: uppercase; font-weight: 400"
          >
            {{ positionFirstLine }}
          </text>
          <text
            [attr.transform]="'translate(' + (zoom > zoomDetail ? '100 60' : '75 90') + ')'"
            style="text-transform: uppercase; font-weight: 400"
          >
            {{ positionSecondLine }}
          </text>
        </ng-template>
        <ng-template [ngIf]="zoom > zoomDetail">
          <text transform="translate(100 75)">{{ item.email }}</text>
          <text transform="translate(100 92)">{{ item.phone }}</text>
          <text transform="translate(170 92)">{{ item.fax }}</text>
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
    this.zoom = 1
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
