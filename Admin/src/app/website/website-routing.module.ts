import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HorizontalComponent } from '../layouts/horizontal/horizontal.component';
import { HomeComponent } from './pages/home/home.component';
import { WebsiteLayoutComponent } from './website-layout/website-layout.component';
import { AcademicOfferComponent } from './pages/academic-offer/academic-offer.component';
import { RequestComponent } from './pages/request/request.component';

const routes: Routes = [
  {
    path: '',
    component: WebsiteLayoutComponent,
    children: [
      { path: '', redirectTo: '/website/home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'request', component: RequestComponent },
      { path: 'offer', component: AcademicOfferComponent },
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WebsiteRoutingModule {}



