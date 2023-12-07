import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { ButtonComponent } from './components/button/button.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { GraphviewComponent } from './components/graphview/graphview.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { SimplegraphComponent } from './components/simplegraph/simplegraph.component';
import { WebsiteListComponent } from './components/website-list/website-list.component';
import { SvgComponent } from './svg/svg.component';
import { NodeInfoComponent } from './node-info/node-info.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatListModule } from '@angular/material/list';
import {MatIconModule } from "@angular/material/icon";


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ButtonComponent,
    GraphviewComponent,
    WebsiteListComponent,
    SimplegraphComponent,
    SvgComponent,
    NodeInfoComponent
    ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    BrowserAnimationsModule,
    MatListModule,
    MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})

export class AppModule { }
