import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'careers',
    loadChildren: () =>
      import('./Careers/careers.module').then(m => m.CareersModule)
  },
  {
    path: 'modalities',
    loadChildren: () =>
      import('./Modalities/modalities.module').then(m => m.ModalitiesModule)
  },
  {
    path: 'periods',
    loadChildren: () =>
      import('./Periods/periods.module').then(m => m.PeriodsModule)
  },
  {
    path: 'campus',
    loadChildren: () =>
      import('./Campus/campus.module').then(m => m.CampusModule)
  },
  {
    path: 'classrooms',
    loadChildren: () =>
      import('./Classrooms/classrooms.module').then(m => m.ClassroomsModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UNIRoutingModule {}