import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { UNIRoutingModule } from './UNI-routing.module';

@NgModule({
  imports: [
    CommonModule,
    UNIRoutingModule, 
    SharedModule
  ],
})
export class UNIModule { }
