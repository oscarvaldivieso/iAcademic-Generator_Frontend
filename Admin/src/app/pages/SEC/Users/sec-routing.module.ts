import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    // path: 'students',
    // loadChildren: () =>
    //   import('./Students/students.module').then(m => m.StudentsModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class secRoutingModule {}