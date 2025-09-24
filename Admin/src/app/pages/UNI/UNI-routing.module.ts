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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UNIRoutingModule {}