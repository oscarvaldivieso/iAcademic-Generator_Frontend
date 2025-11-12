import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'students',
    loadChildren: () =>
      import('./Students/students.module').then(m => m.StudentsModule)
  },
  {
    path: 'pre-enrollment',
    loadComponent: () => import('./pre-enrollment/pre-enrollment.component').then(m => m.PreEnrollmentComponent),
    data: {
      title: 'Prematricula',
    }
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpRoutingModule {}