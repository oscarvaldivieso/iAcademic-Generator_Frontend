import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./dashboards/dashboards.module').then((m) => m.DashboardsModule),
  },
  {
    path: 'ui',
    loadChildren: () => import('./ui/ui.module').then((m) => m.UiModule),
  },
  {
    path: 'advance-ui',
    loadChildren: () =>
      import('./advanceui/advanceui.module').then((m) => m.AdvanceuiModule),
  },
  {
    path: 'icons',
    loadChildren: () =>
      import('./icons/icons.module').then((m) => m.IconsModule),
  },
  {
    path: 'charts',
    loadChildren: () =>
      import('./charts/charts.module').then((m) => m.ChartsModule),
  },
  {
    path: 'tables',
    loadChildren: () =>
      import('./table/table.module').then((m) => m.TableModule),
  },
  {
    path: 'forms',
    loadChildren: () =>
      import('./forms/forms.module').then((m) => m.FormModule),
  },
  {
    path: 'custom-ui',
    loadChildren: () =>
      import('./custom-ui/custom-ui.module').then((m) => m.CustomUiModule),
  },
  {
    path: 'pages',
    loadChildren: () =>
      import('./extrapages/extrapages.module').then((m) => m.ExtrapagesModule),
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
