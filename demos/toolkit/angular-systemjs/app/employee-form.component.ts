import { Component, Input } from '@angular/core'
import { NodeData } from './node-data'

// This property is set by SystemJS and used for resolving relative includes
declare const __moduleName: string

@Component({
  moduleId: __moduleName,
  selector: 'employee-form',
  templateUrl: '../templates/employee-form.component.html'
})
export class EmployeeFormComponent {
  businessUnits = ['Executive Unit', 'Production', 'Sales', 'Accounting']

  @Input()
  public nodeData: NodeData = {
    position: 'Chief Executive Officer',
    name: 'Eric Joplin',
    email: 'ejoplin@yoyodyne.com',
    phone: '555-0100',
    fax: '555-0101',
    businessUnit: 'Executive Unit',
    status: 'present',
    icon: 'resources/usericon_male1.svg'
  }
  submitted = false
  onSubmit() {
    this.submitted = true
  }
}
