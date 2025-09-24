import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Modalidades',
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
          title: 'Listado de Modalidades',
        }
      },
      {
        path: 'create',
        loadComponent: () => import('./create/create.component').then(m => m.CreateComponent),
        data: {
          title: 'Crear Modalidad',
        }
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./edit/edit.component').then(m => m.EditComponent),
        data: {
          title: 'Editar Modalidad',
        }
      }
    ]
  }
]; 

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalitiesRoutingModule {}