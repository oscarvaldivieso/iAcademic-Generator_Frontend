import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'teachers',
    loadChildren: () =>
      import('./Teachers/teachers.module').then(m => m.TeachersModule)
  },
  {
    path: 'subjects',
    loadChildren: () =>
      import('./Subjects/subjects.module').then(m => m.SubjectsModule)
  },
  {
    path: 'areas',
    loadChildren: () =>
      import('./Areas/areas.module').then(m => m.AreasModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AcaRoutingModule {}