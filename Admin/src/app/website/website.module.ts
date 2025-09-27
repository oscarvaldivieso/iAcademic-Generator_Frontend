import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsiteRoutingModule } from './website-routing.module';
import { SharedModule } from '../shared/shared.module';
import { LayoutsModule } from '../layouts/layouts.module';
import { HomeComponent } from './pages/home/home.component';
import { WebsiteLayoutComponent } from './website-layout/website-layout.component';


@NgModule({
    declarations: [
      WebsiteLayoutComponent
    ],
    imports: [
      CommonModule,
      WebsiteRoutingModule, 
      SharedModule, 
      LayoutsModule,
      HomeComponent
    ]
})

export class WebsiteModule {}