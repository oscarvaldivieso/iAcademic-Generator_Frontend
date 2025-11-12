import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { ExpRoutingModule } from './exp-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ExpRoutingModule, 
    SharedModule
  ],
})
export class ExpModule { }
