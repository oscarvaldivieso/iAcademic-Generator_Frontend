import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//import { SharedModule } from '../../shared/shared.module';
import { secRoutingModule } from './sec-routing.module';

@NgModule({
  imports: [
    CommonModule,
    secRoutingModule
    //SharedModule
  ],
})
export class SecModule { }
  