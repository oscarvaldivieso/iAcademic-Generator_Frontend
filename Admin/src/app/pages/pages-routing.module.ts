import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./dashboards/dashboards.module').then((m) => m.DashboardsModule),
  },
  {
    path: 'uni',
    loadChildren: () =>
      import('./UNI/UNI.module').then((m) => m.UNIModule),
  },
  {
    path: 'exp',
    loadChildren: () =>
      import('./EXP/exp.module').then((m) => m.ExpModule),
  },
  {
    path: 'aca',
    loadChildren: () =>
      import('./ACA/aca.module').then((m) => m.AcaModule),
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
