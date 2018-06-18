import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { FormsModule } from '@angular/forms'

import { AppComponent } from './app.component'
import { NodeComponent } from './node.component'
import { GraphControlComponent } from './graph-control.component'
import { EmployeeFormComponent } from './employee-form.component'

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [AppComponent, GraphControlComponent, NodeComponent, EmployeeFormComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
