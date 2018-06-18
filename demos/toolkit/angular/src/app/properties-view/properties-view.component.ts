import { Component, Input } from '@angular/core'
import { Person } from '../person'

@Component({
  selector: 'properties-view',
  templateUrl: './properties-view.component.html',
  styleUrls: ['./properties-view.component.css']
})
export class PropertiesViewComponent {
  @Input() person: Person
}
