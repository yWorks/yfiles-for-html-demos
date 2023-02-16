/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import {
  AfterViewInit,
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  Injector,
  NgZone,
  ViewChild
} from '@angular/core'
import { GraphComponentService } from '../services/graph-component.service'
import {
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  ICommand,
  IEdge,
  IModelItem,
  INode,
  Point,
  Rect,
  TimeSpan
} from 'yfiles'
import { TooltipComponent } from '../tooltip/tooltip.component'
import { Person } from '../person'

@Component({
  selector: 'graph-component',
  templateUrl: './graph-component.component.html',
  styleUrls: ['./graph-component.component.css']
})
export class GraphComponentComponent implements AfterViewInit {
  @ViewChild('graphComponentRef') graphComponentRef!: ElementRef

  contextMenuActions: { title: string; action: () => void }[] = []
  private graphComponent!: GraphComponent

  constructor(
    private graphComponentService: GraphComponentService,
    private injector: Injector,
    private appRef: ApplicationRef,
    private zone: NgZone,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  ngAfterViewInit(): void {
    // add the GraphComponent to the div of this component
    this.graphComponent = this.graphComponentService.getGraphComponent()
    const div = this.graphComponent.div
    div.style.height = '100%'
    this.graphComponentRef.nativeElement.appendChild(div)

    // register tooltips on nodes and edges
    this.initializeTooltips()
  }

  onPopulateContextMenu(item: IModelItem) {
    const contextMenuItems = []
    if (item instanceof INode || item instanceof IEdge) {
      contextMenuItems.push({
        title: 'Zoom to item',
        action: () => {
          // center the item in the viewport
          const targetBounds =
            item instanceof INode
              ? item.layout.toRect()
              : Rect.add(item.sourceNode!.layout.toRect(), item.targetNode!.layout.toRect())
          ICommand.ZOOM.execute(
            targetBounds.getEnlarged(50 / this.graphComponent.zoom),
            this.graphComponent
          )
        }
      })
    }
    this.contextMenuActions = contextMenuItems
  }

  /**
   * Dynamic tooltips are implemented by adding a tooltip provider as an event handler for
   * the {@link MouseHoverInputMode.addQueryToolTipListener QueryToolTip} event of the
   * GraphEditorInputMode using the
   * {@link ToolTipQueryEventArgs} parameter.
   * The {@link ToolTipQueryEventArgs} parameter provides three relevant properties:
   * Handled, QueryLocation, and ToolTip. The Handled property is a flag which indicates
   * whether the tooltip was already set by one of possibly several tooltip providers. The
   * QueryLocation property contains the mouse position for the query in world coordinates.
   * The tooltip is set by setting the ToolTip property.
   */
  private initializeTooltips(): void {
    const inputMode = this.graphComponent.inputMode as GraphViewerInputMode

    // show tooltips only for nodes and edges
    inputMode.toolTipItems = GraphItemTypes.NODE | GraphItemTypes.EDGE

    // Customize the tooltip's behavior to our liking.
    const mouseHoverInputMode = inputMode.mouseHoverInputMode
    mouseHoverInputMode.toolTipLocationOffset = new Point(15, 15)
    mouseHoverInputMode.delay = TimeSpan.fromMilliseconds(500)
    mouseHoverInputMode.duration = TimeSpan.fromSeconds(5)

    // Register a listener for when a tooltip should be shown.
    inputMode.addQueryItemToolTipListener((src, eventArgs) => {
      if (eventArgs.handled) {
        // Tooltip content has already been assigned -> nothing to do.
        return
      }

      // Use a rich HTML element as tooltip content. Alternatively, a plain string would do as well.
      eventArgs.toolTip = this.createTooltipContent(eventArgs.item!)

      // Indicate that the tooltip content has been set.
      eventArgs.handled = true
    })
  }

  /**
   * The tooltip may either be a plain string or it can also be a rich HTML element. In this case, we
   * return a compiled Angular component.
   */
  private createTooltipContent(item: IModelItem) {
    let tooltipTitle = ''
    let tooltipContent = ''

    if (item instanceof INode) {
      tooltipTitle = (item.tag as Person).name
      tooltipContent = (item.tag as Person).businessUnit
    } else if (item instanceof IEdge) {
      tooltipTitle = 'Subordinate'
      tooltipContent = (item.targetNode!.tag as Person).name
    }

    // Retrieve the factory for TooltipComponents
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(TooltipComponent)
    // Have the factory create a new TooltipComponent
    const container = document.createElement('div')
    const tooltipRef = componentFactory.create(this.injector, undefined, container)
    // Attach the component to the Angular component tree so that change detection will work
    this.appRef.attachView(tooltipRef.hostView)
    // Assign the NodeComponent's item input property

    this.zone.run(() => {
      tooltipRef.instance.title = tooltipTitle
      tooltipRef.instance.content = tooltipContent
    })

    return container
  }
}
