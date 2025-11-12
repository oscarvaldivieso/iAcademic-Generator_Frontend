import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './Users/list/list.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'users',
        component: ListComponent,
        data: { title: 'Usuarios' }
      },
      { path: '', redirectTo: 'users', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecRoutingModule { }