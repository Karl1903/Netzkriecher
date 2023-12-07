import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SimplegraphComponent } from './components/simplegraph/simplegraph.component';
import { WebsiteListComponent } from './components/website-list/website-list.component';

const routes: Routes = [{path:'graph', component: SimplegraphComponent},
{path: 'website-list', component: WebsiteListComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
