import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HorizontalComponent } from '../layouts/horizontal/horizontal.component';
import { HomeComponent } from './pages/home/home.component';
import { WebsiteLayoutComponent } from './website-layout/website-layout.component';
import { AcademicOfferComponent } from './pages/academic-offer/academic-offer.component';
import { RequestComponent } from './pages/request/request.component';
import { RequestsListComponent } from './pages/requests-list/requests-list.component';
import { PreEnrollmentComponent } from './pages/pre-enrollment/pre-enrollment.component';
import { PlanSubjectsComponent } from './pages/plan-subjects/plan-subjects.component';

const routes: Routes = [
  {
    path: '',
    component: WebsiteLayoutComponent,
    children: [
      { path: '', redirectTo: '/website/home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'request', component: RequestComponent },
      { path: 'myrequests', component: RequestsListComponent },
      { path: 'offer', component: AcademicOfferComponent },
      { path: 'pre-enrollment', component: PreEnrollmentComponent },
      {path:'myclasses', component: PlanSubjectsComponent}
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WebsiteRoutingModule {}



