import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Períodos',
    },
    children: [
      { 
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        loadComponent: () => import('./list/list.component').then(m => m.ListComponent),
        data: {
          title: 'Listado de Períodos',
        }
      },
      {
        path: 'create',
        loadComponent: () => import('./create/create.component').then(m => m.CreateComponent),
        data: {
          title: 'Crear Período',
        }
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./edit/edit.component').then(m => m.EditComponent),
        data: {
          title: 'Editar Período',
        }
      }
    ]
  }
]; 

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PeriodsRoutingModule {}