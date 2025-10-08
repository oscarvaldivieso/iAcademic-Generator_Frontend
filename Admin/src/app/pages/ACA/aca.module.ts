import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { AcaRoutingModule } from './aca-routing.module';

@NgModule({
  imports: [
    CommonModule,
    AcaRoutingModule, 
    SharedModule
  ],
})
export class AcaModule { }
