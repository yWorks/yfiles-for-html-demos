import WidgetBase from '@dojo/framework/widget-core/WidgetBase'
import { DNode } from '@dojo/framework/widget-core/interfaces'
import { v } from '@dojo/framework/widget-core/d'
import './styles/DemoToolbar.css'

export interface DemoToolbarProperties {
  onToggleEditClick: (isEditable: boolean) => void
  onGraphRefreshClick: () => void
}

export default class DemoToolbar extends WidgetBase<DemoToolbarProperties> {
  protected render(): DNode {
    const { onGraphRefreshClick } = this.properties

    return v('div', { classes: 'demo-toolbar' }, [
      v('button', { classes: 'demo-icon-yIconReload', onclick: onGraphRefreshClick }),
      v('span', { classes: 'demo-separator' }),
      v('input', {
        classes: 'demo-toggle-button labeled',
        id: 'toggleEditable',
        type: 'checkbox',
        onclick: this.toggleEditable
      }),
      v('label', { for: 'toggleEditable' }, ['Toggle Editing'])
    ])
  }

  private toggleEditable(evt: MouseEvent) {
    const isEditable = (evt.target as HTMLInputElement).checked
    const { onToggleEditClick } = this.properties
    onToggleEditClick(isEditable)
  }
}
