import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'

import { AppComponent } from './app.component'
import { GraphComponentComponent } from './graph-component/graph-component.component'
import { PropertiesViewComponent } from './properties-view/properties-view.component'

@NgModule({
  declarations: [AppComponent, GraphComponentComponent, PropertiesViewComponent],
  imports: [BrowserModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
