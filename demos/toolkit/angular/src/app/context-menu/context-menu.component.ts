/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core'
import { GraphComponent, GraphInputMode } from '@yfiles/yfiles'
import { GraphComponentService } from '../services/graph-component.service'

export type ContextMenuAction = { title: string; action: () => void }

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.css']
})
export class ContextMenuComponent implements AfterViewInit {
  private inputMode!: GraphInputMode

  showMenu: boolean = false
  positionX: number = 0
  positionY: number = 0

  @Input() actions: Array<ContextMenuAction> = []
  @Output() populateContextMenu = new EventEmitter<any>()

  constructor(private graphComponentService: GraphComponentService) {}

  ngAfterViewInit() {
    this.register(this.graphComponentService.getGraphComponent())
  }

  private register(graphComponent: GraphComponent): void {
    this.inputMode = graphComponent.inputMode as GraphInputMode

    this.inputMode.addEventListener('populate-item-context-menu', (evt) => {
      if (evt.item) {
        evt.showMenu = true
        this.openMenu(
          graphComponent.viewToPageCoordinates(
            graphComponent.worldToViewCoordinates(evt.queryLocation)
          )
        )
        // select the item
        graphComponent.selection.clear()
        graphComponent.selection.add(evt.item)
        // emit the populate event
        this.populateContextMenu.emit(evt.item)
      }
    })
    this.inputMode.contextMenuInputMode.addEventListener('menu-closed', () => this.hide())
  }

  hide(): void {
    this.showMenu = false
    if (this.inputMode) {
      this.inputMode.contextMenuInputMode.closeMenu()
    }
  }

  openMenu(location: { x: number; y: number }): void {
    this.showMenu = true
    this.positionX = location.x
    this.positionY = location.y
  }

  runAction(action: () => void): void {
    // run the given action of the clicked item
    action()
    // close the contextmenu afterwards
    this.hide()
  }
}
